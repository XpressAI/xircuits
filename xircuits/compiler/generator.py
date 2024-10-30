import ast
import itertools
from collections import namedtuple
import re
import json
import sys
import os
from .port import DYNAMIC_PORTS

if sys.version_info >= (3, 9):
    from ast import unparse
else:
    import io
    from xircuits.compiler.vendor.unparse import Unparser


    def unparse(parsed):
        f = io.StringIO()
        Unparser(parsed, f)
        return f.getvalue()


def _get_value_from_literal_port(port):
    if port.source.type == "string" or port.source.type == "secret":
        value = port.sourceLabel
    elif port.source.type == "list":
        value = json.loads("[" + port.sourceLabel + "]")
    elif port.source.type == "dict":
        value = json.loads("{" + port.sourceLabel + "}")
    elif port.source.type == "chat":
        value = json.loads(port.sourceLabel)
    elif port.source.type == "tuple":
        if port.sourceLabel == "":
            value = ()
        else:
            value = eval(port.sourceLabel)
            if not isinstance(value, tuple):
                # Handler for single entry tuple
                value = (value,)
    else:
        value = eval(port.sourceLabel)

    return value

class CodeGenerator:
    def __init__(self, graph, component_python_paths):
        self.graph = graph
        self.component_python_paths = component_python_paths

    def generate(self, filelike):
        output_filename = os.path.basename(filelike.name)
        flow_name = re.sub(r'\W', '_', output_filename.replace('.py', ''))

        module_body = list(itertools.chain(
            self._generate_python_path(),
            self._generate_fixed_imports(),
            self._generate_component_imports(),
            self._generate_flows(flow_name),
            self._generate_main(flow_name),
            self._generate_trailer()
        ))

        with open(filelike.name, 'w', encoding='utf-8') as f:
            f.write(unparse(ast.Module(body=module_body, type_ignores=[])))

    def _generate_python_path(self):
        fixed_code = """
import sys        
"""
        code = ast.parse(fixed_code).body
        nodes = self._build_node_set()

        needed_paths = set()
        for node in nodes:
            if node.name in self.component_python_paths:
                needed_paths.add(self.component_python_paths[node.name])

        if len(needed_paths) == 0:
            return []

        for p in needed_paths:
            tpl = ast.parse('sys.path.append("value")')
            tpl.body[0].value.args[0].value = p
            code.extend(tpl.body)
        return code

    def _generate_fixed_imports(self):
        fixed_imports = """
from argparse import ArgumentParser
from xai_components.base import SubGraphExecutor, InArg, OutArg, Component, xai_component, parse_bool

"""
        return ast.parse(fixed_imports).body

    def _generate_component_imports(self):
        nodes = self._build_node_set()
        unique_components = list(set((n.name, n.file) for n in nodes if n.file is not None))
        unique_components.sort(key=lambda x: x[1])
        unique_modules = itertools.groupby(unique_components, lambda x: x[1])

        imports = []
        for (file, components) in unique_modules:
            module = '.'.join(file[:-3].split('/'))

            imports.append(
                ast.parse("from %s import %s" % (module, ",".join(c[0] for c in components)))
            )

        return imports

    def _generate_flows(self, flow_name):
        mainFlowCls = ast.parse("""
@xai_component(type="xircuits_workflow")
class %s(Component):
    def __init__(self):
        super().__init__()
        self.__start_nodes__ = []
    
    def execute(self, ctx):
        pass
""" % flow_name).body[0]

        nodes = self._build_node_set()
        component_nodes = [n for n in nodes if n.file is not None]
        named_nodes = dict((n.id, "self.c_%s" % idx) for idx, n in enumerate(component_nodes))

        finish_node = [n for n in nodes if n.name == 'Finish' and n.type == 'Finish'][0]

        init_code = []
        exec_code = []
        args_code = []

        existing_args = set()

        # Instantiate all components
        init_code.extend([
            ast.parse("%s = %s()" % (named_nodes[n.id], n.name)) for n in component_nodes
        ])

        type_mapping = {
            "int": "int",
            "string": "str",
            "boolean": "bool",
            "float": "float",
            "secret": "str",
            "any": "any"
        }

        def connect_args(target, source):
            return ast.parse("%s.connect(%s)" % (target, source))

        set_value = lambda target, v: ast.parse("%s.value = %s" % (target, v))

        # Set up component argument links
        for node in component_nodes:
            # Handle argument connections
            for port in (p for p in node.ports if
                         p.direction == 'in' and p.type == 'triangle-link' and p.source.name.startswith(
                             'Argument ')):
                # Unfortunately, we don't have the information anywhere else and updating the file format isn't an option at the moment

                pattern = re.compile(r'^Argument \((.+?)\): (.+)$')
                match = pattern.match(port.source.name)
                arg_type = type_mapping[match.group(1)]
                arg_name = match.group(2)

                assignment_target = "%s.%s" % (
                    named_nodes[port.target.id],
                    port.targetLabel
                )
                assignment_source = "self.%s" % arg_name
                tpl = connect_args(assignment_target, assignment_source)
                init_code.append(tpl)
                if arg_name not in existing_args:
                    in_arg_def = ast.parse("%s: InArg[%s]" % (arg_name, arg_type)).body[0]
                    args_code.append(in_arg_def)
                    existing_args.add(arg_name)

            # Handle regular connections
            for port in (p for p in node.ports if
                         p.direction == 'in' and p.type != 'triangle-link' and p.dataType not in DYNAMIC_PORTS):
                assignment_target = "%s.%s" % (
                    named_nodes[port.target.id],
                    port.targetLabel
                )

                if port.source.id not in named_nodes:
                    # Literal
                    tpl = set_value(assignment_target, '1')
                    tpl.body[0].value.value = _get_value_from_literal_port(port)
                else:
                    assignment_source = "%s.%s" % (
                        named_nodes[port.source.id],
                        port.sourceLabel
                    )
                    tpl = connect_args(assignment_target, assignment_source)
                init_code.append(tpl)

            # Handle dynamic connections
            dynaports = [p for p in node.ports if
                         p.direction == 'in' and p.type != 'triangle-link' and p.dataType in DYNAMIC_PORTS]
            ports_by_varName = {}

            RefOrValue = namedtuple('RefOrValue', ['value', 'is_ref'])  # Renamed to RefOrValue

            # Group ports by varName
            for port in dynaports:
                if port.varName not in ports_by_varName:
                    ports_by_varName[port.varName] = []
                ports_by_varName[port.varName].append(port)

            for varName, ports in ports_by_varName.items():
                dynaport_values = []

                for port in ports:
                    if port.source.id not in named_nodes:
                        value = _get_value_from_literal_port(port)
                        dynaport_values.append(RefOrValue(value, False))
                    else:
                        # Handle named node references
                        value = "%s.%s" % (named_nodes[port.source.id], port.sourceLabel)  # Variable reference
                        dynaport_values.append(RefOrValue(value, True))

                if ports[0].dataType == 'dynatuple':
                    tuple_elements = [item.value if item.is_ref else repr(item.value) for item in dynaport_values]
                    if len(tuple_elements) == 1:
                        assignment_value = '(' + tuple_elements[0] + ',)'
                    else:
                        assignment_value = '(' + ', '.join(tuple_elements) + ')'
                else:
                    list_elements = [item.value if item.is_ref else repr(item.value) for item in dynaport_values]
                    assignment_value = '[' + ', '.join(list_elements) + ']'

                assignment_target = "%s.%s" % (named_nodes[ports[0].target.id], ports[0].varName)
                tpl = set_value(assignment_target, assignment_value)
                init_code.append(tpl)

        # Handle output connections
        for i, port in enumerate(p for p in finish_node.ports if p.dataType == 'dynalist'):
            port_name = 'output'
            if i > 0:
                port_name = "%s_%s" % (port_name, i)

            assignment_target = "self.%s" % port_name
            if port.source.id not in named_nodes:
                # Literal
                tpl = set_value(assignment_target, '1')
                value = _get_value_from_literal_port(port)
                tpl.body[0].value.value = value
                port_type = type(value).__name__
            else:
                port_type = type_mapping[port.sourceType] if port.sourceType in type_mapping else port.sourceType
                assignment_source = "%s.%s" % (
                    named_nodes[port.source.id],
                    port.sourceLabel
                )
                tpl = connect_args(assignment_target, assignment_source)
            args_code.append(ast.parse("%s: OutArg[%s]" % (port_name, port_type)).body[0])
            init_code.append(tpl)

        # Set up control flow
        for node in component_nodes:
            has_next = False
            for port in (p for p in node.ports if p.direction == "out" and p.type == "triangle-link"):
                if port.name == "out-0":
                    has_next = True
                    assignment_target = "%s.next" % named_nodes[port.source.id]
                    assignment_source = named_nodes[port.target.id] if port.target.id in named_nodes else None
                    init_code.append(
                        ast.parse("%s = %s" % (assignment_target, assignment_source))
                    )
                elif port.name.startswith("out-flow-"):
                    assignment_target = "%s.%s" % (named_nodes[port.source.id], port.name[len("out-flow-"):])
                    assignment_source = "SubGraphExecutor(%s)" % named_nodes[
                        port.target.id] if port.target.id in named_nodes else None
                    init_code.append(
                        ast.parse("%s = %s" % (assignment_target, assignment_source))
                    )
            if not has_next:
                assignment_target = "%s.next" % named_nodes[node.id]
                init_code.append(
                    ast.parse("%s = None" % assignment_target)
                )
        # Setup start node initialization
        for node in (n for n in self.graph if n.id in named_nodes):
            init_code.append(
                ast.parse("self.__start_nodes__.append(%s)" % named_nodes[node.id])
            )

        trailer = """
for node in self.__start_nodes__:
    if hasattr(node, 'init'):
        node.init(ctx)
    
next_component = %s
while next_component is not None:
    next_component = next_component.do(ctx)        
        """ % (named_nodes[self.graph[0].ports[0].target.id])
        exec_code.append(ast.parse(trailer))

        mainFlowCls.body[0].body.extend(init_code)
        mainFlowCls.body[1].body = exec_code

        args_code.sort(key=lambda x: x.target.id)
        mainFlowCls.body = args_code + mainFlowCls.body
        return [mainFlowCls]

    def _generate_main(self, flow_name):
        main = ast.parse("""
def main(args):
    import pprint
    ctx = {}
    ctx['args'] = args
    flow = %s()
    flow.next = None
""" % flow_name).body[0]
        pattern = re.compile(r'^Argument \(.+?\): (.+)$')

        body = main.body

        # Set up the input values
        nodes = self._build_node_set()
        finish_node = [n for n in nodes if n.name == 'Finish' and n.type == 'Finish'][0]
        argument_nodes = [n for n in nodes if n.name.startswith("Argument ") and n.file is None]
        for arg in argument_nodes:
            m = pattern.match(arg.name)
            arg_name = m.group(1)
            tpl = "flow.%s.value = args.%s" % (arg_name, arg_name)
            body.extend(ast.parse(tpl).body)

        body.extend(ast.parse("""
flow.do(ctx)
""").body)

        # Print out the output values
        for i, port in enumerate(p for p in finish_node.ports if p.dataType == 'dynalist'):
            port_name = 'output'
            if i > 0:
                port_name = "%s_%s" % (port_name, i)

            body.extend(ast.parse("""
print("%s:")
pprint.pprint(flow.%s.value)
""" % (port_name, port_name)).body)

        return [main]

    def _build_node_set(self):
        nodes = set()
        node_queue = list(self.graph)
        while len(node_queue) != 0:
            current_node = node_queue.pop()
            nodes.add(current_node)
            for port in current_node.ports:
                if port.target not in nodes:
                    node_queue.append(port.target)
                if port.source not in nodes:
                    node_queue.append(port.source)
        return nodes

    def _generate_trailer(self):
        code = """
if __name__ == '__main__':
    args, _ = parser.parse_known_args()
    main(args)
    print("\\nFinished Executing")
        """
        body = ast.parse(code).body[0]
        arg_parsing = self._generate_argument_parsing()
        arg_parsing.extend(body.body)
        body.body = arg_parsing
        return [body]

    def _generate_argument_parsing(self):
        # Unfortunately, we don't have the information anywhere else and updating the file format isn't an option at the moment
        pattern = re.compile(r'^Argument \(.+?\): (.+)$')

        type_mapping = {
            "int": "int",
            "string": "str",
            "float": "float",
            "secret": "str",
            "any": "any"
        }

        code = """
parser = ArgumentParser()        
        """
        body = ast.parse(code).body

        nodes = self._build_node_set()
        argument_nodes = [n for n in nodes if n.name.startswith("Argument ") and n.file is None]
        for arg in argument_nodes:
            m = pattern.match(arg.name)
            arg_name = m.group(1)
            if arg.type == "boolean":
                tpl = "parser.add_argument('--%s', type=parse_bool, default=None, nargs='?', const=True)" % arg_name
            elif arg.type == "any":
                tpl = "parser.add_argument('--%s')" % (arg_name)
            else:
                tpl = "parser.add_argument('--%s', type=%s)" % (arg_name, type_mapping[arg.type])
            body.extend(ast.parse(tpl).body)

        return body
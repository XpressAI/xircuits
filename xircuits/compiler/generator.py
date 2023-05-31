import ast
import itertools
import re
import json
import sys

if sys.version_info >= (3, 9):
    from ast import unparse
else:
    import io
    from xircuits.compiler.vendor.unparse import Unparser


    def unparse(parsed):
        f = io.StringIO()
        Unparser(parsed, f)
        return f.getvalue()


class CodeGenerator:
    def __init__(self, graph, component_python_paths):
        self.graph = graph
        self.component_python_paths = component_python_paths

    def generate(self, filelike):
        module_body = list(itertools.chain(
            self._generate_python_path(),
            self._generate_fixed_imports(),
            self._generate_component_imports(),
            self._generate_main(),
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
from xai_components.base import SubGraphExecutor

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

    def _generate_main(self):
        main = ast.parse("""
def main(args):
    ctx = {}
    ctx['args'] = args
""""").body[0]

        nodes = self._build_node_set()
        component_nodes = [n for n in nodes if n.file is not None]
        named_nodes = dict((n.id, "c_%s" % idx) for idx, n in enumerate(component_nodes))

        code = []

        # Instantiate all components
        code.extend([
            ast.parse("%s = %s()" % (named_nodes[n.id], n.name)) for n in component_nodes
        ])

        # Set up component argument links
        for node in component_nodes:
            # Handle argument connections
            for port in (p for p in node.ports if
                         p.direction == 'in' and p.type == 'triangle-link' and p.source.name.startswith('Argument ')):
                # Unfortunately, we don't have the information anywhere else and updating the file format isn't an option at the moment
                pattern = re.compile(r'^Argument \(.+?\): (.+)$')
                arg_name = pattern.match(port.source.name).group(1)

                assignment_target = "%s.%s.value" % (
                    named_nodes[port.target.id],
                    port.targetLabel
                )
                assignment_source = "args.%s" % arg_name
                tpl = ast.parse("%s = %s" % (assignment_target, assignment_source))
                code.append(tpl)

            # Handle regular connections
            for port in (p for p in node.ports if p.direction == 'in' and p.type != 'triangle-link'):
                assignment_target = "%s.%s" % (
                    named_nodes[port.target.id],
                    port.targetLabel
                )

                if port.source.id not in named_nodes:

                    # Literal
                    assignment_target += ".value"
                    tpl = ast.parse("%s = 1" % (assignment_target))
                    if port.source.name == "Literal String":
                        value = port.sourceLabel
                    elif port.source.name == "Literal List":
                        value = json.loads("[" + port.sourceLabel + "]")
                    elif port.source.name == "Literal Dict":
                        value = json.loads("{" + port.sourceLabel + "}")
                    elif port.source.name == "Literal Secret":
                        value = port.sourceLabel
                    else:
                        value = eval(port.sourceLabel)
                    tpl.body[0].value.value = value
                else:
                    assignment_source = "%s.%s" % (
                        named_nodes[port.source.id],
                        port.sourceLabel
                    )
                    tpl = ast.parse("%s = %s" % (assignment_target, assignment_source))
                code.append(tpl)

        # Set up control flow
        for node in component_nodes:
            has_next = False
            for port in (p for p in node.ports if p.direction == "out" and p.type == "triangle-link"):
                has_next = True
                if port.name == "out-0":
                    assignment_target = "%s.next" % named_nodes[port.source.id]
                    assignment_source = named_nodes[port.target.id] if port.target.id in named_nodes else None
                    code.append(
                        ast.parse("%s = %s" % (assignment_target, assignment_source))
                    )
                elif port.name.startswith("out-flow-"):
                    assignment_target = "%s.%s" % (named_nodes[port.source.id], port.name[len("out-flow-"):])
                    assignment_source = "SubGraphExecutor(%s)" % named_nodes[
                        port.target.id] if port.target.id in named_nodes else None
                    code.append(
                        ast.parse("%s = %s" % (assignment_target, assignment_source))
                    )
            if not has_next:
                assignment_target = "%s.next" % named_nodes[node.id]
                code.append(
                    ast.parse("%s = None" % assignment_target)
                )

        trailer = """
next_component = %s
while next_component:
    next_component = next_component.do(ctx)        
        """ % (named_nodes[self.graph.ports[0].target.id])
        code.append(ast.parse(trailer))

        main.body.extend(code)
        return [main]

    def _build_node_set(self):
        nodes = set()
        node_queue = [self.graph]
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
    main(parser.parse_args())
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
            "boolean": "bool",
            "float": "float"
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
            tpl = "parser.add_argument('--%s', type=%s)" % (arg_name, type_mapping[arg.type])
            body.extend(ast.parse(tpl).body)

        return body

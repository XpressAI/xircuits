import io
import itertools
import json
from dataclasses import dataclass
import ast


@dataclass
class Port:
    name: str
    type: str
    target: 'Node'
    source: 'Node'
    targetLabel: str
    sourceLabel: str
    direction: str


@dataclass
class Node:
    id: str
    name: str
    type: str
    file: str
    ports: list[Port]

    def generate_import(self):
        pass

    def generate_instantiation(self):
        pass

    def generate_assignments(self):
        pass

    def __hash__(self):
        return id.__hash__()


class XircuitsFileParser:
    def __init__(self):
        self.traversed_nodes = {}
        self.nodes = {}
        self.links = {}

    def parse(self, file_path):
        f = open(file_path, 'r')
        xircuits_file = json.load(f)

        self.nodes = [n for n in xircuits_file['layers'] if n['type'] == 'diagram-nodes'][0]['models']
        self.links = [n for n in xircuits_file['layers'] if n['type'] == 'diagram-links'][0]['models']

        start_node = [n for n in self.nodes.values() if n['extras']['type'] == 'Start'][0]

        return self.traverse_node(start_node)

    def traverse_node(self, node):
        node_id = node['id']
        if node_id in self.traversed_nodes:
            return self.traversed_nodes[node_id]
        else:
            n = Node(
                id=node_id,
                name=node['name'],
                type=node['extras']['type'],
                file=node['extras'].get('path'),
                ports=[]
            )
            self.traversed_nodes[node_id] = n
            n.ports = self.traverse_ports(node)
            return n

    def traverse_ports(self, node):
        out = []
        for port in node['ports']:
            for linkId in port['links']:
                link = self.links[linkId]

                sourceNode = self.nodes[link['source']]
                targetNode = self.nodes[link['target']]

                sourceLabel = [p for p in sourceNode['ports'] if p['id'] == link['sourcePort']][0]['label']

                p = Port(
                    name=port['name'],
                    type=link['type'],
                    target=self.traverse_node(targetNode),
                    source=self.traverse_node(sourceNode),
                    targetLabel=port['label'],
                    sourceLabel=sourceLabel,
                    direction="in" if port['in'] else "out"
                )
                out.append(p)
        return out


class CodeGenerator:
    def __init__(self, graph):
        self.graph = graph

    def generate(self, filelike):
        module_body = list(itertools.chain(
            self._generate_fixed_imports(),
            self._generate_component_imports(),
            self._generate_main(),
            self._generate_trailer()
        ))

        filelike.write(ast.unparse(ast.Module(body=module_body, type_ignores=[])))

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
        literal_nodes = [n for n in nodes if n.file is None and n.name.startswith("Literal ")]

        component_nodes = [n for n in nodes if n.file is not None]
        named_nodes = dict((n.id, "c_%s" % idx) for idx, n in enumerate(component_nodes))

        # Instantiate all components
        main.body.extend([
            ast.parse("%s = %s()" % (named_nodes[n.id], n.name)) for n in component_nodes
        ])

        # Set up component argument links
        for node in component_nodes:
            for port in (p for p in node.ports if p.direction == 'in' and p.type != 'triangle'):
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
                    else:
                        value = eval(port.sourceLabel)
                    tpl.body[0].value.value = value
                else:
                    assignment_source = "%s.%s" % (
                        named_nodes[port.source.id],
                        port.sourceLabel
                    )
                    tpl = ast.parse("%s = %s" % (assignment_target, assignment_source))
                main.body.append(tpl)

        for node in component_nodes:
            has_next = False
            for port in (p for p in node.ports if p.direction == "out" and p.type == "triangle"):
                has_next = True
                if port.name == "out-0":
                    assignment_target = "%s.next" % named_nodes[port.source.id]
                    assignment_source = named_nodes[port.target.id] if port.target.id in named_nodes else None
                    main.body.append(
                        ast.parse("%s = %s" % (assignment_target, assignment_source))
                    )
                elif port.name.startswith("out-flow-"):
                    assignment_target = "%s.%s" % (named_nodes[port.source.id], port.name[len("out-flow-"):])
                    assignment_source = "SubGraphExecutor(%s)" % named_nodes[port.target.id] if port.target.id in named_nodes else None
                    main.body.append(
                        ast.parse("%s = %s" % (assignment_target, assignment_source))
                    )
            if not has_next:
                assignment_target = "%s.next" % named_nodes[node.id]
                main.body.append(
                    ast.parse("%s = None" % assignment_target)
                )

        trailer = """
next_component = %s
while next_component:
    is_done, next_component = next_component.do(ctx)        
        """ % (named_nodes[self.graph.ports[0].target.id])
        main.body.append(ast.parse(trailer))
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
    parser = ArgumentParser()
    main(parser.parse_args())
    print("\\nFinished Executing")        
        """
        return [ast.parse(code).body]


parser = XircuitsFileParser()
graph = parser.parse('examples/Complex.xircuits')

generator = CodeGenerator(graph)
out = io.StringIO()
generator.generate(out)

with open('output.py', 'w') as f:
    f.write(out.getvalue())
    print(out.getvalue())

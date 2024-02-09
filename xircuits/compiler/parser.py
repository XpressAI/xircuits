import json
import re

from xircuits.compiler.node import Node
from xircuits.compiler.port import Port


class XircuitsFileParser:
    def __init__(self):
        self.traversed_nodes = {}
        self.nodes = {}
        self.links = {}

    def parse(self, input_file):

        xircuits_file = json.load(input_file)

        self.nodes = [n for n in xircuits_file['layers'] if n['type'] == 'diagram-nodes'][0]['models']
        self.links = [n for n in xircuits_file['layers'] if n['type'] == 'diagram-links'][0]['models']

        start_nodes = [n for n in self.nodes.values() if n['extras']['type'] == 'Start']

        return [self.traverse_node(start_node) for start_node in start_nodes]

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

                source_node = self.nodes[link['source']]
                target_node = self.nodes[link['target']]

                sourceLabel = [p for p in source_node['ports'] if p['id'] == link['sourcePort']][0]['label']
                sourceName = [p for p in source_node['ports'] if p['id'] == link['sourcePort']][0]['name']
                typeExtract = re.match(r'parameter-out-(.+?)-out', sourceName)
                sourceType = typeExtract.group(1) if typeExtract is not None else 'any'

                # filter compulsory port [★] label from port name
                sourceLabel = re.sub(r"★", "", sourceLabel)
                targetLabel = re.sub(r"★", "", port['label'])

                p = Port(
                    name=port['name'],
                    type=link['type'],
                    sourceType=sourceType,
                    varName=port['varName'],
                    dataType=port['dataType'],
                    target=self.traverse_node(target_node),
                    source=self.traverse_node(source_node),
                    targetLabel=targetLabel,
                    sourceLabel=sourceLabel,
                    direction="in" if port['in'] else "out"
                )
                out.append(p)
        return out

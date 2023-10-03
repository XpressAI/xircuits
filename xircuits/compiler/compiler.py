import json

from xircuits.compiler.parser import XircuitsFileParser
from xircuits.compiler.generator import CodeGenerator


def compile(input_file, output_file, component_python_paths=None):
    if component_python_paths is None:
        component_python_paths = {}

    parser = XircuitsFileParser()
    graph = parser.parse(input_file)
    generator = CodeGenerator(graph, component_python_paths)
    generator.generate(output_file)
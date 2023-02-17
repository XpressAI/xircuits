from .parser import XircuitsFileParser
from .generator import CodeGenerator


def compile(input_file, output_file):
    parser = XircuitsFileParser()
    graph = parser.parse(input_file)
    generator = CodeGenerator(graph)
    generator.generate(output_file)

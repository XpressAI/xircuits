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


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('source_file', type=argparse.FileType('r', encoding='utf-8'))
    parser.add_argument('out_file', type=argparse.FileType('w', encoding='utf-8'))
    parser.add_argument("python_paths_file", nargs='?', default=None, type=argparse.FileType('r'),
                        help="JSON file with a mapping of component name to required python path. "
                             "e.g. {'MyComponent': '/some/path'}")

    args = parser.parse_args()
    component_paths = {}
    if args.python_paths_file:
        component_paths = json.load(args.python_paths_file)
    compile(args.source_file, args.out_file, component_python_paths=component_paths)


if __name__ == '__main__':
    main()

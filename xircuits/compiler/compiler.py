from xircuits.compiler.parser import XircuitsFileParser
from xircuits.compiler.generator import CodeGenerator


def compile(input_file, output_file):
    parser = XircuitsFileParser()
    graph = parser.parse(input_file)
    generator = CodeGenerator(graph)
    generator.generate(output_file)


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('source_file_path')
    parser.add_argument('out_file_path')

    args = parser.parse_args()
    with open(args.source_file_path, 'r') as source:
        with open(args.out_file_path, 'w') as target:
            compile(source, target)

if __name__ == '__main__':
    main()
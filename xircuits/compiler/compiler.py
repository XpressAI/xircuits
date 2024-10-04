import json
import os
from xircuits.compiler.parser import XircuitsFileParser
from xircuits.compiler.generator import CodeGenerator

def compile(input_file, output_file, component_python_paths=None):
    if component_python_paths is None:
        component_python_paths = {}
    parser = XircuitsFileParser()
    graph = parser.parse(input_file)
    generator = CodeGenerator(graph, component_python_paths)
    generator.generate(output_file)

def recursive_compile(input_file, output_file=None, component_python_paths=None, visited_files=None):
    if component_python_paths is None:
        component_python_paths = {}
    if visited_files is None:
        visited_files = set()

    # Get the file path in a relative manner
    if hasattr(input_file, 'name'):
        input_file_path = os.path.relpath(input_file.name)
    else:
        raise ValueError("Input must be a file object with a 'name' attribute.")

    if input_file_path in visited_files:
        return

    visited_files.add(input_file_path)

    # Read the Xircuits workflow file
    try:
        input_file.seek(0)
        data = json.load(input_file)
    except Exception as e:
        print(f"Error reading {input_file_path}: {e}")
        return

    # Traverse layers to find nested workflows
    if 'layers' in data:
        for layer in data['layers']:
            if 'models' in layer and isinstance(layer['models'], dict):
                for model in layer['models'].values():
                    extras = model.get('extras', {})
                    if extras.get('type') == "xircuits_workflow":
                        # Extract and transform the path from .py to .xircuits
                        py_path = extras.get('path')
                        if py_path:
                            nested_xircuits_path = py_path.replace('.py', '.xircuits')
                            # Resolve relative paths
                            nested_xircuits_path = os.path.join(os.path.dirname(input_file_path), nested_xircuits_path)
                            # Open the nested workflow file
                            try:
                                with open(nested_xircuits_path, 'r', encoding='utf-8') as nested_input_file:
                                    recursive_compile(nested_input_file, None, component_python_paths, visited_files)
                            except Exception as e:
                                print(f"Error reading nested file {nested_xircuits_path}: {e}")

    # Compile the current workflow
    py_output_path = input_file_path.replace('.xircuits', '.py')
    # print(f"Compiling {input_file_path} to {py_output_path}")

    try:
        # Use the provided output_file or create one based on the input_file_path
        if output_file is None:
            with open(py_output_path, 'w', encoding='utf-8') as out_f:
                input_file.seek(0)
                compile(input_file, out_f, component_python_paths=component_python_paths)
        else:
            input_file.seek(0)
            compile(input_file, output_file, component_python_paths=component_python_paths)
        print(f"Compiled {input_file_path} to {py_output_path}")
    except Exception as e:
        print(f"Failed to compile {input_file_path}: {e}")

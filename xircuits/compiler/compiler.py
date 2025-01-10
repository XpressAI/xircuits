import json
import os
from xircuits.compiler.parser import XircuitsFileParser
from xircuits.compiler.generator import CodeGenerator

def compile(input_file_path, output_file_path, component_python_paths=None):
    if component_python_paths is None:
        component_python_paths = {}
    parser = XircuitsFileParser()
    with open(input_file_path, 'r', encoding='utf-8') as in_f:
        graph = parser.parse(in_f)
    generator = CodeGenerator(graph, component_python_paths)
    with open(output_file_path, 'w', encoding='utf-8') as out_f:
        generator.generate(out_f)

def recursive_compile(input_file_path, output_file_path=None, component_python_paths=None, visited_files=None):
    if component_python_paths is None:
        component_python_paths = {}
    if visited_files is None:
        visited_files = set()

    # Normalize file path
    input_file_path = os.path.abspath(input_file_path)

    if input_file_path in visited_files:
        return

    visited_files.add(input_file_path)

    # Read the Xircuits workflow file
    try:
        with open(input_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
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
                            # For nested workflows, pass None to keep default .xircuits->.py
                            recursive_compile(nested_xircuits_path, output_file_path=None, component_python_paths=component_python_paths, visited_files=visited_files)

    # Compile the current workflow
    # If 'output_file_path' was provided (top-level file), use it; otherwise default to <filename>.py
    py_output_path = (
        output_file_path 
        if output_file_path 
        else input_file_path.replace('.xircuits', '.py')
    )

    try:
        compile(input_file_path, py_output_path, component_python_paths=component_python_paths)
        print(f"Compiled {input_file_path} to {py_output_path}")
    except Exception as e:
        print(f"Failed to compile {input_file_path}: {e}")
        raise ValueError(f"Compilation failed for {input_file_path}. Check your inputs and try again.")

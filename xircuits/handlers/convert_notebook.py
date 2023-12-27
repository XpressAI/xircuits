import json
import os
import argparse

def notebook_to_xircuits_component(notebook_path):
    # Extract filename without extension
    base = os.path.basename(notebook_path)
    component_name, _ = os.path.splitext(base)

    # Read the notebook file
    with open(notebook_path, 'r', encoding='utf-8') as file:
        notebook = json.load(file)

    # Extract code cells
    code_cells = [cell for cell in notebook['cells'] if cell['cell_type'] == 'code']

    # Extract source code from each cell and add an extra line after each cell, with proper indentation
    source_code = ['        ' + line.rstrip() for cell in code_cells for line in cell['source']]
    formatted_source_code = "\n".join(source_code)

    # Create the component code
    component_code = f"""
from xai_components.base import InArg, OutArg, InCompArg, Component, BaseComponent, xai_component, dynalist, dynatuple, dynadict

@xai_component
class {component_name}(Component):
    \"\"\"This file is generated from {notebook_path}.
    \"\"\"
    def execute(self, ctx) -> None:
{formatted_source_code}
    """

    return component_code

def save_component_script(notebook_path):
    component_code = notebook_to_xircuits_component(notebook_path)
    output_path = os.path.splitext(notebook_path)[0] + '.py'
    
    with open(output_path, 'w', encoding='utf-8') as file:
        file.write(component_code)
    print(f"Component script saved as {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Convert a Jupyter Notebook to a Xircuits component")
    parser.add_argument("notebook_path", help="Path to the Jupyter Notebook file")
    args = parser.parse_args()

    save_component_script(args.notebook_path)

if __name__ == "__main__":
    main()

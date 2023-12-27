import json
import os
import argparse
from xai_components.base import InArg, OutArg, InCompArg, Component, BaseComponent, xai_component, dynalist, dynatuple, dynadict

def parse_args(cell):
    args, in_args, out_args = [], [], []
    for line in cell['source']:
        if line.startswith('#'):
            # Remove the '#' and strip whitespace
            arg_line = line[1:].strip()
            args.append(arg_line)

            # Identify InArg and OutArg names
            if "InArg" or "InCompArg" in arg_line:
                in_args.append(arg_line.split(':')[0].strip())
            elif "OutArg" in arg_line:
                out_args.append(arg_line.split(':')[0].strip())

    return args, in_args, out_args

def notebook_to_xircuits_component(notebook_path):
    # Extract filename without extension
    base = os.path.basename(notebook_path)
    component_name, _ = os.path.splitext(base)

    # Read the notebook file
    with open(notebook_path, 'r', encoding='utf-8') as file:
        notebook = json.load(file)

    # Extract code cells
    code_cells = notebook['cells']
    
    # Parse first cell for arguments
    args, in_args, out_args = parse_args(code_cells[0])
    args_code = '\n    '.join(args)

    # Generate code for InArg and OutArg assignments
    in_args_code = '\n        '.join([f"{arg} = self.{arg}.value" for arg in in_args])
    out_args_code = '\n        '.join([f"self.{arg}.value = {arg}" for arg in out_args])

    # Extract source code from the remaining cells
    source_code = ['        ' + line.rstrip() for cell in code_cells[1:] for line in cell['source']]
    formatted_source_code = "\n".join(source_code)

    # Create the component code with arguments and InArg/OutArg handling
    component_code = f"""
from xai_components.base import InArg, OutArg, InCompArg, Component, BaseComponent, xai_component, dynalist, dynatuple, dynadict

@xai_component
class {component_name}(Component):
    \"\"\"This file is generated from {notebook_path}.
    \"\"\"
    {args_code}

    def execute(self, ctx) -> None:
        {in_args_code}
{formatted_source_code}
        {out_args_code}
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

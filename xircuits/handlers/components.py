import json
import os
import pathlib
import sys
import ast
from itertools import chain
import traceback

import tornado
from jupyter_server.base.handlers import APIHandler
import platform

from .config import get_config

DEFAULT_COMPONENTS_PATHS = [
    os.path.join(os.path.dirname(__file__), "..", "..", "xai_components"),
    "xai_components",
    os.path.expanduser("~/xai_components"),
    os.environ.get("XIRCUITS_COMPONENTS_DIR")
]

# Get the default components from here for now
# A better place may be a config file, or turning them into real components
# A good point in time to do that, would be when the python compilation step
# gets refactored
DEFAULT_COMPONENTS = {
    1: { "name": "Get Argument String Name", "returnType": "string","color":"lightpink"},
    2: { "name": "Get Argument Integer Name", "returnType": "int","color":"blue"},
    3: { "name": "Get Argument Float Name", "returnType": "float","color":"green"},
    4: { "name": "Get Argument Boolean Name", "returnType": "boolean","color":"red"},
    5: { "name": "Get Argument Secret Name", "returnType": "secret","color":"black"},
    6: { "name": "Get Argument Any Name", "returnType": "any","color":"red"},
    7: { "name": "Literal String", "returnType": "string","color":"lightpink"},
    8:{ "name": "Literal Integer", "returnType": "int","color":"blue"},
    9:{ "name": "Literal Float", "returnType": "float","color":"green"},
    10:{ "name": "Literal True", "returnType": "boolean","color":"red"},
    11:{ "name": "Literal False", "returnType": "boolean","color":"red"},
    12:{ "name": "Literal List", "returnType": "list","color":"yellow"},
    13:{ "name": "Literal Tuple", "returnType": "tuple","color":"purple"},
    14:{ "name": "Literal Dict", "returnType": "dict","color":"orange"},
    15:{ "name": "Literal Secret", "returnType": "secret","color":"black"},
    16:{ "name": "Literal Chat", "returnType": "chat","color":"green"},

    # Comment this first since we don't use it
    # 1: { "name": "Math Operation", "returnType": "math"},
    # 2: { "name": "Convert to Aurora", "returnType": "convert"},
    # 7: { "name": "Debug Image", "returnType": "debug"},
    # 8: { "name": "Reached Target Accuracy", "returnType": "enough"},
}

COLOR_PALETTE = [
    "rgb(192,255,0)",
    "rgb(0,102,204)",
    "rgb(255,153,102)",
    "rgb(255,102,102)",
    "rgb(15,255,255)",
    "rgb(255,204,204)",
    "rgb(153,204,51)",
    "rgb(255,153,0)",
    "rgb(255,204,0)",
    "rgb(204,204,204)",
    "rgb(153,204,204)",
    "rgb(153,0,102)",
    "rgb(102,51,102)",
    "rgb(153,51,204)",
    "rgb(102,102,102)",
    "rgb(255,102,0)",
    "rgb(51,51,51)"
]

GROUP_GENERAL = "GENERAL"
GROUP_ADVANCED = "ADVANCED"

def remove_prefix(input_str, prefix):
    prefix_len = len(prefix)
    if input_str[0:prefix_len] == prefix:
        return input_str[prefix_len:]
    else:
        return input_str

def read_orig_code(node: ast.AST, lines):
    line_from = node.lineno - 1
    col_from = node.col_offset

    line_to = node.end_lineno - 1
    col_to = node.end_col_offset

    if line_from == line_to:
        line = lines[line_from]
        return line[col_from:col_to]
    else:
        start_line = lines[line_from][col_from:]
        between_lines = lines[(line_from+1):line_to]
        end_line = lines[line_to][col_to]
        return "\n".join(chain([start_line], between_lines, [end_line]))


class ComponentsRouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        components = []
        error_msg = ""
        error_info = None
        
        for id, c in DEFAULT_COMPONENTS.items():
            components.append({
                "task": c["name"],
                "header": GROUP_GENERAL,
                "category": GROUP_GENERAL,
                "variables": [],
                "type": c["returnType"],
                "color":c.get('color') or None    
            })

        default_paths = set(pathlib.Path(p).expanduser().resolve() for p in sys.path)

        visited_directories = []
        for directory_string in self.get_component_directories():
            if directory_string is not None:
                directory = pathlib.Path(directory_string).absolute()
                if directory.exists() \
                        and directory.is_dir() \
                        and not any(pathlib.Path.samefile(directory, d) for d in visited_directories):
                    visited_directories.append(directory)
                    python_files = directory.glob("xai_*/*.py")

                    python_path = directory.expanduser().resolve()

                    if python_path.parent in default_paths:
                        python_path = None

                    try:
                        components.extend(chain.from_iterable(self.extract_components(f, directory, python_path) for f in python_files if not f.name.startswith(".")))
                    except Exception as e:
                        root = pathlib.Path(os.getcwd()).resolve()
                        rel_path = pathlib.Path(e.filename).resolve().relative_to(root)
                        full_path = str(rel_path)  
                        error_info = {

                            "file": os.path.relpath(e.filename, start=str(directory)) if e.filename else "unknown file",
                            "line": e.lineno or 0,
                            "message": f"SyntaxError: {e.msg}",
                            "full_path": full_path
                        }
                        error_msg = traceback.format_exc()
                        break
                    
        components = list({(c["header"], c["task"]): c for c in components}.values())

        # Set up component colors according to palette
        for idx, c in enumerate(components):
            if c.get("color") is None:
                c["color"] = COLOR_PALETTE[idx % len(COLOR_PALETTE)]

        data = {"components": components,
                "error_msg" : error_msg,        
                "error_info": error_info}

        self.finish(json.dumps(data))
        
    def get_component_directories(self):
        paths = list(DEFAULT_COMPONENTS_PATHS)
        paths.append(get_config().get("DEV", "BASE_PATH"))
        return paths

    def extract_components(self, file_path, base_dir, python_path):
        with open(file_path) as f:
            lines = f.readlines()
        
        parse_tree = ast.parse(file_path.read_text(), file_path)
        # Look for top level class definitions that are decorated with "@xai_component"
        is_xai_component = lambda node: isinstance(node, ast.ClassDef) and \
                                        any((isinstance(decorator, ast.Call) and decorator.func.id == "xai_component") or \
                                            (isinstance(decorator, ast.Name) and decorator.id == "xai_component")
                                            for decorator in node.decorator_list)

        return [self.extract_component(node, file_path.relative_to(base_dir), lines, python_path)
                for node in parse_tree.body if is_xai_component(node)]

    def extract_component(self, node: ast.ClassDef, file_path, file_lines, python_path):
        name = node.name

        keywords = {kw.arg: kw.value.value for kw in chain.from_iterable(decorator.keywords
                        for decorator in node.decorator_list
                        if isinstance(decorator, ast.Call) and decorator.func.id == "xai_component")}

        # Group Name for Display
        category = remove_prefix(file_path.parent.name, "xai_").upper()

        is_arg = lambda n: isinstance(n, ast.AnnAssign) and \
                                           isinstance(n.annotation, ast.Subscript) and \
                                           n.annotation.value.id in ['InArg', 'InCompArg', 'OutArg']

        is_flow_arg = lambda n: isinstance(n, ast.AnnAssign) and \
                                            isinstance(n.annotation, ast.Name) and \
                                            n.annotation.id in ['BaseComponent']

        python_version = platform.python_version_tuple()

        variables = []
        for v in (node.body):
            if is_flow_arg(v):
                variables.append({
                    "name": v.target.id,
                    "kind": v.annotation.id,
                })
                continue
            elif is_arg(v):
                variables.append({
                    "name": v.target.id,
                    "kind": v.annotation.value.id,
                    "type": read_orig_code(v.annotation.slice.value if int(python_version[1]) == 8 else v.annotation.slice, file_lines)
                })
                continue

        docstring = ast.get_docstring(node)
        lineno = [
            {
                "lineno": node.lineno,
                "end_lineno": node.end_lineno
            }
        ]

        output = {
            "class": name,
            "package_name": ("xai_components." if python_path is None else "") + file_path.as_posix().replace("/", ".")[:-3],
            "python_path": str(python_path) if python_path is not None else None,
            "abs_file_path": os.path.join(str(python_path), str(file_path)) if python_path is not None else None,
            "file_path": "xai_components/" + (file_path.as_posix()[:-3] + ".py" if platform.system() == "Windows" else str(file_path)),
            "task": name,
            "header": GROUP_ADVANCED,
            "category": category,
            "type": "library_component",
            "variables": variables,
            "docstring": docstring,
            "lineno" : lineno
        }
        output.update(keywords)

        return output

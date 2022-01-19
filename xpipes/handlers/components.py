import json
import os
import pathlib
import sys
import ast
from itertools import chain

import tornado
from jupyter_server.base.handlers import APIHandler

from .config import get_config

DEFAULT_COMPONENTS_PATHS = [
    os.path.join(os.path.dirname(__file__), "..", "..", "xai_components"),
    "xai_components",
    os.path.expanduser("~/xai_components"),
    os.environ.get("XPIPES_COMPONENTS_DIR")
]

# Get the default components from here for now
# A better place may be a config file, or turning them into real components
# A good point in time to do that, would be when the python compilation step
# gets refactored
DEFAULT_COMPONENTS = {
    1: { "name": "Math Operation", "returnType": "math"},
    2: { "name": "Convert to Aurora", "returnType": "convert"},
    3: { "name": "Get Hyper-parameter String Name", "returnType": "string"},
    4: { "name": "Get Hyper-parameter Int Name", "returnType": "int"},
    5: { "name": "Get Hyper-parameter Float Name", "returnType": "float"},
    6: { "name": "Get Hyper-parameter Boolean Name", "returnType": "boolean"},
    7: { "name": "Debug Image", "returnType": "debug"},
    8: { "name": "Reached Target Accuracy", "returnType": "enough"},
    9: { "name": "Literal String", "returnType": "string"},
    10:{ "name": "Literal Integer", "returnType": "int"},
    11:{ "name": "Literal Float", "returnType": "float"},
    12:{ "name": "Literal True", "returnType": "boolean"},
    13:{ "name": "Literal False", "returnType": "boolean"},
    14:{ "name": "Literal List", "returnType": "list"},
    15:{ "name": "Literal Tuple", "returnType": "tuple"},
    16:{ "name": "Literal Dict", "returnType": "dict"},
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

class ComponentsRouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        components = []

        for id, c in DEFAULT_COMPONENTS.items():
            components.append({
                "task": c["name"],
                "header": GROUP_GENERAL,
                "category": GROUP_GENERAL,
                "variables": [],
                "type": c["returnType"]
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
                    python_files = directory.rglob("xai_*/*.py")

                    python_path = directory.expanduser().resolve()

                    if python_path.parent in default_paths:
                        python_path = None

                    components.extend(chain.from_iterable(self.extract_components(f, directory, python_path) for f in python_files))


        components = list({(c["header"], c["task"]): c for c in components}.values())

        # Set up component colors according to palette
        for idx, c in enumerate(components):
            if c.get("color") is None:
                c["color"] = COLOR_PALETTE[idx % len(COLOR_PALETTE)]

        self.finish(json.dumps(components))
        
    def get_component_directories(self):
        paths = list(DEFAULT_COMPONENTS_PATHS)
        paths.append(get_config().get("DEV", "BASE_PATH"))
        return paths

    def extract_components(self, file_path, base_dir, python_path):
        parse_tree = ast.parse(file_path.read_text(), file_path)
        # Look for top level class definitions that are decorated with "@xai_component"
        is_xai_component = lambda node: isinstance(node, ast.ClassDef) and \
                                        any((isinstance(decorator, ast.Call) and decorator.func.id == "xai_component") or \
                                            (isinstance(decorator, ast.Name) and decorator.id == "xai_component")
                                            for decorator in node.decorator_list)

        return [self.extract_component(node, file_path.relative_to(base_dir), python_path)
                for node in parse_tree.body if is_xai_component(node)]

    def extract_component(self, node: ast.ClassDef, file_path, python_path):
        name = node.name

        keywords = {kw.arg: kw.value.value for kw in chain.from_iterable(decorator.keywords
                        for decorator in node.decorator_list
                        if isinstance(decorator, ast.Call) and decorator.func.id == "xai_component")}

        # Group Name for Display
        category = file_path.parent.name.removeprefix("xai_").upper()

        is_arg = lambda n: isinstance(n, ast.AnnAssign) and \
                                           isinstance(n.annotation, ast.Subscript) and \
                                           n.annotation.value.id in ('InArg', 'InCompArg', 'OutArg')
        variables = [
            {
                "name": v.target.id,
                "kind": v.annotation.value.id,
                "type": ast.unparse(v.annotation.slice)
            }
            for v in node.body if is_arg(v)
        ]

        output = {
            "class": name,
            "package_name": ("xai_components." if python_path is None else "") + file_path.as_posix().replace("/", ".")[:-3],
            "python_path": str(python_path) if python_path is not None else None,
            "task": name,
            "header": GROUP_ADVANCED,
            "category": category,
            "type": "debug",
            "variables": variables
        }
        output.update(keywords)

        return output

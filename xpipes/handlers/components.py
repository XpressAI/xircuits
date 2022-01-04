import json
import os
import pathlib
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

# TODO: attach this data to the actual model
COMPONENT_OUTPUT_TYPE_MAPPING = {
    "TrainTestSplit": "split",
    "RotateCounterClockWiseComponent": "out",
    "LoopComponent": "if",
    "ReadDataSet": "in",
    "ResizeImageData": "out",
    "ShouldStop": "enough",
    "SaveKerasModelInModelStash": "convert",
    "EvaluateAccuracy": "eval",
    "TrainImageClassifier": "train",
    "CreateModel": "model"
}

class ComponentsRouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        components = []

        for id, c in DEFAULT_COMPONENTS.items():
            components.append({
                "task": c["name"],
                "header": GROUP_GENERAL,
                "rootFile": GROUP_GENERAL,
                "path": "", # Default Components do not have a python-file backed implementation
                "variables": [],
                "type": c["returnType"]
            })

        visited_directories = []
        for directory_string in self.get_component_directories():
            if directory_string is not None:
                directory = pathlib.Path(directory_string).absolute()
                if directory.exists() \
                        and directory.is_dir() \
                        and not any(pathlib.Path.samefile(directory, d) for d in visited_directories):
                    visited_directories.append(directory)
                    python_files = directory.rglob("xai_*/*.py")
                    components.extend(chain.from_iterable(self.extract_components(f, directory) for f in python_files))


        # Set up component colors according to palette
        for idx, c in enumerate(components):
            c["color"] = COLOR_PALETTE[idx % len(COLOR_PALETTE)]

        self.finish(json.dumps(components))
        
    def get_component_directories(self):
        paths = list(DEFAULT_COMPONENTS_PATHS)
        paths.append(get_config().get("DEV", "BASE_PATH"))
        return paths

    def extract_components(self, file_path, base_dir):
        parse_tree = ast.parse(file_path.read_text(), file_path)
        # TODO: Make this more robust to renamed imports, e.g. from "xai_components.base import Component as C"
        # Look for top level class definitions that inherit from "Component"
        is_xai_component = lambda node: isinstance(node, ast.ClassDef) and \
                                        any(isinstance(base, ast.Name) and base.id == 'Component' for base in node.bases)

        return [self.extract_component(node, file_path.relative_to(base_dir.parent))
                for node in parse_tree.body if is_xai_component(node)]

    def extract_component(self, node, file_path):
        name = node.name

        # Group Name for Display
        root_file = file_path.parent.name.removeprefix("xai_").upper()

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

        output_type = COMPONENT_OUTPUT_TYPE_MAPPING.get(name) or "debug"

        return {
            "path": file_path.as_posix(),
            "task": name,
            "header": GROUP_ADVANCED,
            "rootFile": root_file,
            "type": output_type,
            "variables": variables
        }

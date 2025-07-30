import json, sys
from pathlib import Path
from typing import Union

def enforce_compulsory_ports(path: Union[str, Path]) -> None:
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        print(f"Error reading '{path}'. The file is not valid JSON.")
        sys.exit(1)
    node_layer = next(layer for layer in data["layers"]
                      if layer["type"] == "diagram-nodes")
    models = node_layer["models"].values()

    for node in models:
        for port in node["ports"]:
            if port.get("in") and str(port.get("label", "")).startswith("★") \
               and len(port.get("links", [])) == 0:
                print("Warning: COMPULSORY InPorts not connected.")
                return
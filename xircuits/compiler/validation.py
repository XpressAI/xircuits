import json
from pathlib import Path

def enforce_compulsory_ports(path: str | Path) -> None:
    data = json.loads(Path(path).read_text(encoding="utf-8"))

    node_layer = next(layer for layer in data["layers"]
                      if layer["type"] == "diagram-nodes")
    models = node_layer["models"].values()

    for node in models:
        for port in node["ports"]:
            if port.get("in") and str(port.get("label", "")).startswith("★") \
               and len(port.get("links", [])) == 0:
                print("Warning: COMPULSORY InPorts not connected.")
                return
from typing import List
from dataclasses import dataclass

from xircuits.compiler.port import Port


@dataclass
class Node:
    id: str
    name: str
    type: str
    file: str
    ports: List[Port]

    def generate_import(self):
        pass

    def generate_instantiation(self):
        pass

    def generate_assignments(self):
        pass

    def __hash__(self):
        return id.__hash__()
from dataclasses import dataclass


@dataclass
class Port:
    name: str
    type: str
    target: 'Node'
    source: 'Node'
    targetLabel: str
    sourceLabel: str
    direction: str

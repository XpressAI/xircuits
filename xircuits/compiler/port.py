from dataclasses import dataclass


@dataclass
class Port:
    name: str
    type: str
    dataType: str
    varName: str
    target: 'Node'
    source: 'Node'
    targetLabel: str
    sourceLabel: str
    direction: str

DYNAMIC_PORTS = ['dynalist', 'dynadict', 'dynatuple']

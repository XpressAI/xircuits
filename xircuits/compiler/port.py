from dataclasses import dataclass


@dataclass
class Port:
    name: str
    type: str
    sourceType: str
    dataType: str
    varName: str
    target: 'Node'
    source: 'Node'
    targetLabel: str
    sourceLabel: str
    direction: str

DYNAMIC_PORTS = ['dynalist', 'dynatuple']

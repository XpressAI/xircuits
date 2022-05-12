from xai_components.base import InArg, OutArg, InCompArg, Component, BranchComponent, xai_component

@xai_component(type="Branch")
class Branch(BranchComponent):
    condition: InArg[bool]
    
    def __init__(self):

        self.condition = InArg.empty()

@xai_component(type="Finish", color="rgb(255,102,102)")
class Finish(BranchComponent):
    pass
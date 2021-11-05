from xai_components.base import InArg, OutArg, Component

class HelloHyperparameter(Component):
    input_str: InArg[str]

    def __init__(self):
        self.input_str = InArg.empty()

    def execute(self) -> None:
        input_str = self.input_str.value
        print("Hello " + input_str)
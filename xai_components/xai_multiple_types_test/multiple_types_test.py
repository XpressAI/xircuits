from typing import Union

from xai_components.base import InArg, Component, xai_component


@xai_component(color='rgb(85, 37, 130)')
class MultipleTypesTest(Component):
    a: InArg[Union[float, int]]

    def __init__(self):
        self.done = False
        self.a = InArg(None)

    def execute(self, ctx) -> None:
        print(self.a.value)
        print(type(self.a.value))



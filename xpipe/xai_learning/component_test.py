from xai_components.base import InArg, OutArg, Component

class HelloHyperparameter(Component):
    input_str: InArg[str]

    def __init__(self):
        self.input_str = InArg.empty()

    def execute(self) -> None:
        input_str = self.input_str.value
        print("Hello " + input_str)
        
class HelloTupleOrList(Component):
    input_list: InArg[list]
    input_tuple: InArg[tuple]

    def __init__(self):
        
        self.input_tuple = InArg.empty()
        self.input_list = InArg.empty()

    def execute(self) -> None:
        
        input_list = self.input_list.value if self.input_list.value else ""
        input_tuple = self.input_tuple.value if self.input_tuple.value else ""
        
        print( "\nDisplaying List: ")
        print(input_list) 
        print("\nDisplaying Tuple: ")
        print(input_tuple)
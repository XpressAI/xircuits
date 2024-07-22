from xai_components.base import InArg, OutArg, InCompArg, Component, BaseComponent, xai_component, dynalist, dynatuple
from typing import Union

@xai_component(color="red")
class HelloComponent(Component):
    """The simplest component that greets the user."""
    
    def execute(self, ctx) -> None:
        
        # If the import is only exclusive to 1 component, it is a good practice to import inside execute()
        import os 

        creator_name = os.getlogin()
        print("Hello, " + creator_name)

@xai_component
class HelloHyperparameter(Component):
    """A component that changes the print message depending on the supplied parameter.

    ##### inPorts:
    - input_str (str): Try connecting a Literal String or Hyperparameter String.
    """
    input_str: InArg[str]

    def execute(self, ctx) -> None:
        input_str = self.input_str.value
        print("Hello " + str(input_str))
        
@xai_component
class CompulsoryHyperparameter(Component):
    """A component that uses Compulsory inPorts. 
     Users must fill all compulsory ports to compile and run the canvas.

    ##### inPorts:
    - input_str (str): An optional String port.
    - comp_str (str): A compulsory String port.
    - comp_int (int): A compulsory Integer port.
    """
    input_str: InArg[str]

    # if your component requires a certain parameter to be supplied, use In-Comp(ulsory)-Argument ports.
    comp_str: InCompArg[str]
    comp_int: InCompArg[int]

    def execute(self, ctx) -> None:
        input_str = self.input_str.value
        comp_str = self.comp_str.value
        comp_int = self.comp_int.value
        print("Hello, " + str(input_str))
        print("I'm " + str(comp_str))
        print("Me " + str(comp_int))

@xai_component
class HelloListTupleDict(Component):
    """A component that accepts list, tuple, and dict data types then prints them.
    Useful for testing port type checks.

    ##### inPorts:
    - input_list (list): A list port.
    - input_tuple (tuple): A tuple port.
    - input_dict (dict): A dict port.
    """
    input_list: InArg[list]
    input_tuple: InArg[tuple]
    input_dict: InArg[dict]

    def execute(self, ctx) -> None:

        # if you would like ports to have default values if user does not provide, try this way.
        input_list = self.input_list.value if self.input_list.value else ""
        input_tuple = self.input_tuple.value if self.input_tuple.value else ""
        input_dict = self.input_dict.value if self.input_dict.value else ""
        
        print( "\nDisplaying List: ")
        print(input_list) 
        print("\nDisplaying Tuple: ")
        print(input_tuple)
        print("\nDisplaying Dict: ")
        print(input_dict)

@xai_component
class MultiType(Component):
    """Component with in-port that accept multiple data types
    
    ##### inPorts:
    - msg (Union[int, float, str]): A port that accepts int, float, or str data types.
    """
    msg: InArg[Union[int, float, str]]
    
    def execute(self, ctx) -> None:
        print(str(self.msg.value))

@xai_component
class HelloContext(Component):
    """A component that showcases the usage of Xircuits Context (ctx).
    Chain multiple instances of this component to add information into the `ctx`.

    ### Reference:
    - [Xircuits Content](https://xircuits.io/docs/technical-concepts/xircuits-context)

    ##### inPorts:
    - context_dict (dict): A dict to add to the `ctx`. Default: `{"new ctx": "Hello Xircuits!"}`
    """
    context_dict: InArg[dict]

    def execute(self, ctx) -> None:
        
        print(f"Current Context:\n{ctx}")
        
        context_dict = self.context_dict.value if self.context_dict.value else {"new ctx": "Hello Xircuits!"}
        ctx.update(context_dict)

        print(f"After Adding Context:\n{ctx}")

@xai_component
class MultiBranchComponent(BaseComponent):
    """A component that executes different branches based on the value of `abc`.

    ##### inPorts:
    - abc (str): A string that determines which branch to execute.
    
    ##### Branches:
    - if_A: Branch that executes if `abc` is "a".
    - if_B: Branch that executes if `abc` is "b".
    - if_C: Branch that executes if `abc` is "c".
    """
    if_A: BaseComponent
    if_B: BaseComponent
    if_C: BaseComponent

    abc: InArg[str]

    def do(self, ctx) -> BaseComponent:
        if self.abc.value == "a":
            next = self.if_A
        elif self.abc.value == "b":
            next = self.if_B
        elif self.abc.value == "c":
            next = self.if_C
        else:
            next = None
        
        while next:
            next = next.do(ctx)
        try:
            return self.next
        except:
            return None

@xai_component
class DynaPorts(Component):
    """A component showcasing dynamic ports: `dynalist` and `dynatuple`.
    
    ##### inPorts:
    - dlist (dynalist): A `dynalist` port. 
    - dtuple (dynatuple): A `dynatuple` port.
    """
    dlist: InArg[dynalist]
    dtuple: InArg[dynatuple]
    
    def execute(self, ctx) -> None:
        print("Printing dynalist value:")
        print(self.dlist.value)
        print("Printing dynatuple value:")
        print(self.dtuple.value)
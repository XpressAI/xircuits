from xai_components.base import InArg, OutArg, InCompArg, Component, xai_component

@xai_component(color="red")
class HelloComponent(Component):
    """The simplest component that greets the user. 
    """
    def __init__(self):

        self.done = False

    def execute(self, ctx) -> None:
        
        #If the import is only exclusive to 1 component, it is a good practice to import inside execute()
        import os 

        creator_name = os.getlogin()
        print("Hello, " + creator_name)

        self.done = True

@xai_component
class HelloHyperparameter(Component):
    """A component that changes the print message depending on the supplied parameter.

    ##### inPorts:
    - input_str: try connecting a Literal String or Hyperparameter String.
    """
    input_str: InArg[str]

    def __init__(self):

        self.done = False
        self.input_str = InArg.empty()

    def execute(self, ctx) -> None:
        input_str = self.input_str.value
        print("Hello " + str(input_str))
        self.done = True

@xai_component
class CompulsoryHyperparameter(Component):
    """A component that uses Compulsory inPorts. 
     Users must fill all compulsory ports to compile and run the canvas.

    ##### inPorts:
    - input_str: an optional String port.
    - comp_str: a compulsory String port.
    - comp_int: a compulsory Integer port.
    """
    input_str: InArg[str]

    #if your component requires a certain parameter to be supplied, use In-Comp(ulsory)-Argument ports.
    comp_str: InCompArg[str]
    comp_int: InCompArg[int]

    def __init__(self):
        self.done = False
        self.input_str = InArg.empty()
        self.comp_str = InCompArg.empty()
        self.comp_int = InCompArg.empty()

    def execute(self, ctx) -> None:
        input_str = self.input_str.value
        comp_str = self.comp_str.value
        comp_int = self.comp_int.value
        print("Hello, " + str(input_str))
        print("I'm " + str(comp_str))
        print("Me " + str(comp_int))

        self.done = True

@xai_component
class HelloListTupleDict(Component):
    """A component that accepts list, tuple, and dict data types then prints them.
    Useful for testing port type checks.

    ##### inPorts:
    - input_list: a list port.
    - input_tuple: a tuple port.
    - input_dict: a dict port.
    """
    input_list: InArg[list]
    input_tuple: InArg[tuple]
    input_dict: InArg[dict]

    def __init__(self):
        self.done = False
        self.input_tuple = InArg.empty()
        self.input_list = InArg.empty()
        self.input_dict = InArg.empty()

    def execute(self, ctx) -> None:

        #if you would like ports to have default values if user does not provide, try this way.
        input_list = self.input_list.value if self.input_list.value else ""
        input_tuple = self.input_tuple.value if self.input_tuple.value else ""
        input_dict = self.input_dict.value if self.input_dict.value else ""
        
        print( "\nDisplaying List: ")
        print(input_list) 
        print("\nDisplaying Tuple: ")
        print(input_tuple)
        print("\nDisplaying Dict: ")
        print(input_dict)

        self.done = True

@xai_component
class HelloContext(Component):
    """A component that showcases the usage of Xircuits Context (ctx).
    Chain multiple instances of this component to add information into the `ctx`.

    ### Reference:
    - [Xircuits Content](https://xircuits.io/docs/technical-concepts/xircuits-context)

    ##### inPorts:
    - context_dict: a dict to add to the `ctx`.
        Default: `{"new ctx": "Hello Xircuits!"}`
    """
    context_dict: InArg[dict]

    def __init__(self):
        self.done = False
        self.context_dict = InArg.empty()

    def execute(self, ctx) -> None:
        
        print(f"Current Context:\n{ctx}")
        
        context_dict = self.context_dict.value if self.context_dict.value else {"new ctx": "Hello Xircuits!"}
        ctx.update(context_dict)

        print(f"After Adding Context:\n{ctx}")

        self.done = True
        
@xai_component(color="red")
class AddImport(Component):
    """A special component that adds lines to the compiled python script header.
    Typically used to add imports.

    ##### Reference:
    - [Add Import Component](https://xircuits.io/docs/references/special-components#add-import-component)

    ##### inPorts:
    import_str: provided string will be converted to a line in the script header.
    
    ##### Example:
    Without `AddImport`, the generated header would look like:
    ```
    from argparse import ArgumentParser
    from datetime import datetime
    from time import sleep
    import sys
    ``` 

    After adding String `print("NEW LINE ADDED")` to the `import_str` port:
    ```
    from argparse import ArgumentParser
    from datetime import datetime
    from time import sleep
    print("NEW LINE ADDED")
    from xai_template.example_components import AddImport
    ```
    """
    import_str: InArg[str]

    def __init__(self):
        self.import_str = InArg.empty()
        self.done = False

    def execute(self, ctx) -> None:

        self.done = True

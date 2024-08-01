from xai_components.base import InArg, OutArg, InCompArg, Component, BaseComponent, xai_component, dynalist, SubGraphExecutor

@xai_component(type='branch')
class BranchComponent(Component):
    """A component that conditionally executes one of two branches based on a boolean condition.
    
    ##### inPorts:
    - condition (bool): A boolean condition to evaluate.
    
    ##### Branches:
    - when_true: Branch that executes if the condition is True.
    - when_false: Branch that executes if the condition is False.
    """
    when_true: BaseComponent
    when_false: BaseComponent

    condition: InArg[bool]
    
    def do(self, ctx) -> BaseComponent:
        next = None
        if self.condition.value:
            if hasattr(self, 'when_true'):
                next = self.when_true
        else:
            if hasattr(self, 'when_false'):
                next = self.when_false
        while next:
            next = next.do(ctx)
        if hasattr(self, 'next') and self.next:
            return self.next
    
@xai_component(type='branch')
class LoopComponent(Component):
    """A component that loops while the condition is True.
    
    ##### inPorts:
    - condition (bool): Boolean that determines whether `body` branch is executed.
    
    ##### Branches:
    - body: Branch that executes in each iteration of the loop.
    """
    body: BaseComponent
    condition: InArg[bool]
    
    def do(self, ctx) -> BaseComponent:
        while self.condition.value:
            next_body = self.body.do(ctx)
            while next_body:
                next_body = next_body.do(ctx)
            return self
        if hasattr(self, 'next') and self.next:
            return self.next

@xai_component(type='branch')
class ReverseForEach(Component):
    """A component that iterates over a list in reverse order, executing body branches for each item.
    
    ##### inPorts:
    - items (list): The list of items to iterate over.
    
    ##### outPorts:
    - current_item (any): The current item in the iteration.
    - current_index (int): The index of the current item in the iteration.
    
    ##### Branches:
    - body: Branch that executes for each item.
    """
    body: BaseComponent
    items: InCompArg[list]
    current_item: OutArg[any]
    current_index: OutArg[int]
    
    def do(self, ctx) -> BaseComponent:
        for i, item in enumerate(self.items.value[-1]):
            self.current_item.value = item
            self.current_index.value = i
            
            next_body = self.body.do(ctx)
            while next_body:
                next_body = next_body.do(ctx)
        if hasattr(self, 'next') and self.next:
            return self.next

@xai_component(type='branch')
class ForEach(Component):
    """A component that iterates over a list, executing body branches for each item.
    
    ##### inPorts:
    - items (list): The list of items to iterate over.
    
    ##### outPorts:
    - current_item (any): The current item in the iteration.
    - current_index (int): The index of the current item in the iteration.
    
    ##### Branches:
    - body: Branch that executes for each item.
    """
    body: BaseComponent
    items: InCompArg[list]
    current_item: OutArg[any]
    current_index: OutArg[int]
    
    def do(self, ctx) -> BaseComponent:
        for i, item in enumerate(self.items.value):
            self.current_item.value = item
            self.current_index.value = i
            
            next_body = self.body.do(ctx)
            while next_body:
                next_body = next_body.do(ctx)
        if hasattr(self, 'next') and self.next:
            return self.next

@xai_component
class CounterComponent(Component):
    """A component that maintains and increments a counter.
    
    ##### inPorts:
    - start_number (int): The initial value of the counter.
    - step (int): The increment step for the counter.
    
    ##### outPorts:
    - out_number (int): The current value of the counter.
    """
    start_number: InArg[int]
    step: InArg[int]
    out_number: OutArg[int]
    state: any
    
    def __init__(self):
        super().__init__()
        self.state = None
        
    def execute(self, ctx) -> None:
        if self.state is None:
            self.state = self.start_number.value
        else:
            self.state += self.step.value
            
        self.out_number.value = self.state

@xai_component
class ComparisonComponent(Component):
    """A component that performs a comparison between two integers.
    
    ##### inPorts:
    - a (int): The first integer.
    - b (int): The second integer.
    - op (str): The comparison operator (as a string).
    
    ##### outPorts:
    - out (bool): The result of the comparison (boolean).
    """
    a: InArg[int]
    b: InArg[int]
    op: InArg[str]
    out: OutArg[bool]

    def execute(self, ctx) -> None:
        self.out.value = eval(str(self.a.value) + " " + self.op.value + " " + str(self.b.value))


class MutableVariable:
    _fn: any

    def __init__(self):
        self._fn = None
    
    def set_fn(self, fn) -> None:
        self._fn = fn
        
    @property
    def value(self) -> any:
        return self._fn()
    
    
@xai_component(type='context_get')
class GetVariableComponent(Component):
    """A component that retrieves a variable from the context.
    
    ##### inPorts:
    - name (str): The name of the variable to retrieve.
    
    ##### outPorts:
    - value (any): The value of the retrieved variable.
    """
    name: InArg[str]
    value: OutArg[any]
    
    def __init__(self):
        super().__init__()
        self.value = MutableVariable()
        
    def execute(self, ctx) -> None:
        self.value.set_fn(lambda: ctx[self.name.value])


@xai_component(type='context_set')
class SetVariableComponent(Component):
    """A component that sets a variable in the context.
    
    ##### inPorts:
    - name (str): The name of the variable to set.
    - value (any): The value to set for the variable.
    """
    name: InArg[str]
    value: InArg[any]

    def execute(self, ctx) -> None:
        ctx[self.name.value] = self.value.value


@xai_component(type='variable')
class DefineVariableComponent(Component):
    """A component that defines a variable in the context and creates a reference to it.
    
    ##### inPorts:
    - name (str): The name of the variable to define.
    - value (any): The initial value of the variable.
    
    ##### outPorts:
    - ref (any): A reference to the defined variable.
    """
    name: InArg[str]
    value: InArg[any]
    ref: OutArg[any]

    def __init__(self):
        super().__init__()
        self.ref = MutableVariable()
        
    def execute(self, ctx) -> None:
        ctx[self.name.value] = self.value.value
        self.ref.set_fn(lambda: ctx[self.name.value])


@xai_component
class EvalBooleanExpression(Component):
    """A component that evaluates a boolean expression.
    
    ##### inPorts:
    - expression (str): The boolean expression to evaluate.
    - args (dynalist): A list of arguments to use in the expression.
    
    ##### outPorts:
    - out (bool): The result of the evaluated expression (boolean).
    """
    expression: InCompArg[str]
    args: InArg[dynalist]
    out: OutArg[bool]

    def execute(self, ctx) -> None:
        args = []
        for arg in self.args.value:
            if hasattr(arg, 'value'):
                args.append(arg.value)
            else:
                args.append(arg)

        exec('self.out.value = ( ' + self.expression.value + ')', globals(), locals())

@xai_component
class EvaluateExpressionWithVariables(Component):
    """Evaluates a single mathematical or boolean expression with variables from a dictionary and context.

    ##### inPorts:
    - expression (str): A mathematical or boolean expression as a string with placeholders for variables.
    - values_dict (dict): A dictionary containing variable values.

    ##### outPorts:
    - result (float): The result after evaluating the expression with the provided values.

    ##### Description:
    This component evaluates an expression using variables from both the provided dictionary and the context (`ctx`). The dictionary values take priority over the context values if there are any conflicts.

    ##### Example:
      - expression: "{a} + {b} * {c}"
      - ctx: {"a": 1, "b": 2}
      - values_dict: {"c": 3}
    """
    expression: InArg[str]
    values_dict: InArg[dict]
    result: OutArg[float]

    def execute(self, ctx) -> None:
        expression = self.expression.value
        values_dict = self.values_dict.value if self.values_dict.value else {}

        combined_dict = {**ctx, **values_dict}

        formatted_expression = expression.format(**combined_dict)
        print(f'Expression : {formatted_expression}')

        result = eval(formatted_expression)
        self.result.value = result
        print("Evaluation Result:", result)

@xai_component(color='blue')
class ExceptionHandler(Component):
    """Executes a body branch and handles any exceptions that occur.

    ##### Branches:
    - body: The main execution path of components to execute.
    - handler: The execution path if an exception occurs.

    ##### outPorts:
    - exception (str): The exception message if an exception is caught.
    """
    body: BaseComponent
    handler: BaseComponent
    exception: OutArg[str]

    def execute(self, ctx):
        try:
            SubGraphExecutor.do(self.body, ctx)
        except Exception as e:
            self.exception.value = str(e)
            print(e)
            SubGraphExecutor.do(self.handler, ctx)
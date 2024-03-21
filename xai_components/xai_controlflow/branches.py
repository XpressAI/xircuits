from xai_components.base import InArg, OutArg, InCompArg, Component, BaseComponent, xai_component, dynalist

@xai_component
class BranchComponent(Component):
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
    
@xai_component
class LoopComponent(Component):
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

@xai_component
class ReverseForEach(Component):
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


@xai_component
class ForEach(Component):
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
    
    
@xai_component
class GetVariableComponent(Component):
    name: InArg[str]
    value: OutArg[any]
    
    def __init__(self):
        super().__init__()
        self.value = MutableVariable()
        
    def execute(self, ctx) -> None:
        self.value.set_fn(lambda: ctx[self.name.value])


@xai_component
class SetVariableComponent(Component):
    name: InArg[str]
    value: InArg[any]

    def execute(self, ctx) -> None:
        ctx[self.name.value] = self.value.value


@xai_component
class DefineVariableComponent(Component):
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

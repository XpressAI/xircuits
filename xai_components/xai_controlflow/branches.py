from xai_components.base import InArg, OutArg, InCompArg, Component, BaseComponent, xai_component

@xai_component
class BranchComponent(Component):
    when_true: BaseComponent
    when_false: BaseComponent

    condition: InArg[bool]
    
    def do(self, ctx) -> BaseComponent:
        if self.condition.value:
            next = self.when_true
        else:
            next = self.when_false
        while next:
            next = next.do(ctx)
        try:
            return self.next
        except:
            return None
    
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

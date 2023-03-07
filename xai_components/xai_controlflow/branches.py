from xai_components.base import InArg, OutArg, InCompArg, Component, BaseComponent, xai_component

@xai_component
class BranchComponent(BaseComponent):
    when_true: BaseComponent
    when_false: BaseComponent
    done: bool

    condition: InArg[bool]
    
    def __init__(self):
        self.done = False
        self.condition = InArg.empty()

    def do(self, ctx) -> BaseComponent:
        if self.condition.value:
            next = self.when_true
        else:
            next = self.when_false
        while next:
            is_done, next = next.do(ctx)
        try:
            return self.done, self.next
        except:
            return self.done, None
    
@xai_component
class LoopComponent(Component):
    body: BaseComponent

    condition: InArg[bool]
    
    def __init__(self):
        self.done = False
        self.condition = InArg.empty()

    def do(self, ctx) -> BaseComponent:
        while self.condition.value:
            is_done, next_body = self.body.do(ctx)
            while next_body:
                is_done, next_body = next_body.do(ctx)
            return self.done, self
        return self.done, self.next
    
@xai_component
class CounterComponent(Component):
    start_number: InArg[int]
    step: InArg[int]
    out_number: OutArg[int]
    
    state: any
    
    def __init__(self):
        self.done = False
        self.start_number = InArg.empty()
        self.step = InArg.empty()
        self.out_number = OutArg.empty()
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

    
    def __init__(self):
        self.done = False
        self.a = InArg.empty()
        self.b = InArg.empty()
        self.op = InArg.empty()
        self.out = OutArg.empty()
        
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
        self.done = False
        self.name = InArg.empty()
        self.value = MutableVariable()
        
    def execute(self, ctx) -> None:
        self.value.set_fn(lambda: ctx[self.name.value])

@xai_component
class SetVariableComponent(Component):
    name: InArg[str]
    value: InArg[any]
    
    def __init__(self):
        self.done = False
        self.name = InArg.empty()
        self.value = InArg.empty()
        
    def execute(self, ctx) -> None:
        ctx[self.name.value] = self.value.value


@xai_component
class DefineVariableComponent(Component):
    name: InArg[str]
    value: InArg[any]
    ref: OutArg[any]

    
    def __init__(self):
        self.done = False
        self.name = InArg.empty()
        self.value = InArg.empty()
        self.ref = MutableVariable()
        
    def execute(self, ctx) -> None:
        ctx[self.name.value] = self.value.value
        self.ref.set_fn(lambda: ctx[self.name.value])

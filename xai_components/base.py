from argparse import Namespace
from typing import TypeVar, Generic, Tuple, NamedTuple, Callable, List
from copy import deepcopy

from asgiref.sync import async_to_sync, sync_to_async

T = TypeVar('T')


class OutArg(Generic[T]):
    def __init__(self, value: T = None, getter: Callable[[T], any] = lambda x: x) -> None:
        self._value = value
        self._getter = getter

    @property
    def value(self):
        return self._getter(self._value)

    @value.setter
    def value(self, value: T):
        self._value = value

    def connect(self, ref: 'OutArg[T]'):
        self._value = ref
        self._getter = lambda x: x.value

    def __copy__(self):
        return type(self)(self._value, self._getter)

    def __deepcopy__(self, memo):
        id_self = id(self)
        _copy = memo.get(id_self)
        if _copy is None:
            _copy = type(self)(
                deepcopy(self._value, memo),
                deepcopy(self._getter, memo)
            )
            memo[id_self] = _copy
        return _copy


class InArg(Generic[T]):
    def __init__(self, value: T = None, getter: Callable[[T], any] = lambda x: x) -> None:
        self._value = value
        self._getter = getter

    @property
    def value(self):
        return self._getter(self._value)

    @value.setter
    def value(self, value: T):
        self._value = value

    def connect(self, ref: OutArg[T]):
        self._value = ref
        self._getter = lambda x: x.value

    def __copy__(self):
        return type(self)(self._value, self._getter)

    def __deepcopy__(self, memo):
        id_self = id(self)
        _copy = memo.get(id_self)
        if _copy is None:
            _copy = type(self)(
                deepcopy(self._value, memo),
                deepcopy(self._getter, memo)
            )
            memo[id_self] = _copy
        return _copy


class InCompArg(Generic[T]):
    def __init__(self, value: T = None, getter: Callable[[T], any] = lambda x: x) -> None:
        self._value = value
        self._getter = getter

    @property
    def value(self):
        return self._getter(self._value)

    @value.setter
    def value(self, value: T):
        self._value = value

    def connect(self, ref: OutArg[T]):
        self._value = ref
        self._getter = lambda x: x.value

    def __copy__(self):
        return type(self)(self._value, self._getter)

    def __deepcopy__(self, memo):
        id_self = id(self)
        _copy = memo.get(id_self)
        if _copy is None:
            _copy = type(self)(
                deepcopy(self._value, memo),
                deepcopy(self._getter, memo)
            )
            memo[id_self] = _copy
        return _copy


def xai_component(*args, **kwargs):
    # Passthrough element without any changes.
    # This is used for parser metadata only.
    if len(args) == 1 and callable(args[0]):
        # @xai_components form
        return args[0]
    else:
        # @xai_components(...) form
        def passthrough(f):
            return f

        return passthrough


class ExecutionContext:
    args: Namespace

    def __init__(self, args: Namespace):
        self.args = args


class BaseComponent:
    def __init__(self):
        all_ports = self.__annotations__
        for key, type_arg in all_ports.items():
            if hasattr(type_arg, '__origin__'):
                port_class = type_arg.__origin__
                port_type = type_arg.__args__[0]
                if port_class in (InArg, InCompArg, OutArg):
                    if hasattr(port_type, 'initial_value'):
                        port_value = port_type.initial_value()
                    else:
                        port_value = None

                    if hasattr(port_type, 'getter'):
                        port_getter = port_type.getter
                    else:
                        port_getter = lambda x: x
                    setattr(self, key, port_class(port_value, port_getter))
                else:
                    setattr(self, key, None)
            else:
                setattr(self, key, None)

    @classmethod
    def set_execution_context(cls, context: ExecutionContext) -> None:
        cls.execution_context = context

    def execute(self, ctx) -> None:
        pass

    def do(self, ctx) -> 'BaseComponent':
        pass

    def __copy__(self):
        _copy = type(self)()
        for key, type_arg in self.__dict__.items():
            setattr(_copy, key, getattr(self, key))
        return _copy

    def __deepcopy__(self, memo):
        id_self = id(self)
        _copy = memo.get(id_self)
        if _copy is None:
            _copy = type(self)()
            memo[id_self] = _copy
            for key, type_arg in self.__dict__.items():
                setattr(_copy, key, deepcopy(getattr(self, key), memo))
        return _copy


class Component(BaseComponent):
    next: BaseComponent

    def do(self, ctx) -> BaseComponent:
        print(f"\nExecuting: {self.__class__.__name__}", flush=True)
        self.execute(ctx)

        return self.next

    def debug_repr(self) -> str:
        return "<h1>Component</h1>"


class AsyncComponent(BaseComponent):
    next: BaseComponent

    @async_to_sync
    async def do(self, ctx) -> BaseComponent:
        print(f"\nExecuting: {self.__class__.__name__}", flush=True)
        await self.execute(ctx)
        return self.next

    def debug_repr(self) -> str:
        return "<h1>AsyncComponent</h1>"


class SubGraphExecutor:

    def __init__(self, component):
        self.comp = component

    def do(self, ctx):
        comp = self.comp

        while comp is not None:
            comp = comp.do(ctx)
        return None

    @sync_to_async
    def do_async(self, ctx):
        return self.do(ctx)


def execute_graph(args: Namespace, start: BaseComponent, ctx) -> None:
    BaseComponent.set_execution_context(ExecutionContext(args))

    if 'debug' in args and args['debug']:
        import pdb
        pdb.set_trace()

        current_component = start
        next_component = current_component.do(ctx)
        while next_component:
            current_component = next_component
            next_component = current_component.do(ctx)
    else:
        next_component = start.do(ctx)
        while next_component:
            next_component = next_component.do(ctx)


class secret:
    pass


class message(NamedTuple):
    role: str
    content: str


class chat(NamedTuple):
    messages: List[message]


class dynalist(list):
    def __init__(self, *args):
        super().__init__(args)

    @staticmethod
    def getter(x):
        if x is None:
            return []
        return [item.value if isinstance(item, (InArg, OutArg)) else item for item in x]


class dynatuple(tuple):
    def __init__(self, *args):
        super().__init__(args)

    @staticmethod
    def getter(x):
        if x is None:
            return tuple()

        def resolve(item):
            if isinstance(item, (InArg, InCompArg, OutArg)):
                return item.value
            else:
                return item
        return tuple(resolve(item) for item in x)

def parse_bool(value):
    if value is None:
        return None
    if value.lower() in ('true', 't', 'yes', 'y', '1'):
        return True
    elif value.lower() in ('false', 'f', 'no', 'n', '0'):
        return False
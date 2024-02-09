from xai_components.base import SubGraphExecutor, InArg, OutArg, Component, xai_component


@xai_component(type="Start", color="red")
class OnEvent(Component):
    eventName: InArg[str]
    payload: OutArg[dict]

    def init(self, ctx):
        ctx.setdefault('events', {}).setdefault(self.eventName.value, []).append(self)

@xai_component()
class FireEvent(Component):
    eventName: InArg[str]
    payload: InArg[dict]

    def execute(self, ctx):
        eventListeners = ctx['events'][self.eventName.value]
        for listener in eventListeners:
            listener.payload.value = self.payload.value
            SubGraphExecutor(listener).do(ctx)
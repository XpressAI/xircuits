from xai_components.base import SubGraphExecutor, InArg, OutArg, Component, xai_component

@xai_component(type="Start", color="red")
class OnEvent(Component):
    """A component that listens for a specific event and triggers when the event occurs.
    
    ##### inPorts:
    - eventName (str): The name of the event to listen for.
    
    ##### outPorts:
    - payload (dict): The payload of the event when it is triggered.
    """
    eventName: InArg[str]
    payload: OutArg[dict]

    def init(self, ctx):
        ctx.setdefault('events', {}).setdefault(self.eventName.value, []).append(self)

@xai_component
class FireEvent(Component):
    """A component that fires an event, triggering any components listening for that event.
    
    ##### inPorts:
    - eventName (str): The name of the event to fire.
    - payload (dict): The payload of the event to fire.
    """
    eventName: InArg[str]
    payload: InArg[dict]

    def execute(self, ctx):
        eventListeners = ctx['events'][self.eventName.value]
        for listener in eventListeners:
            listener.payload.value = self.payload.value
            SubGraphExecutor(listener).do(ctx)

from xai_components.base import InArg, OutArg, Component, xai_component

@xai_component
class RpaInit(Component):
    """Initiates RPA bot.
    
    ### Reference:
    - [RPA-Python Core Functions](https://github.com/tebelorg/RPA-Python#core-functions)

    ##### inPorts:
    - visual: Initiate workflow that involves images as bot input.
        Default: False
    - chrome: Whether to use Chrome as default browser.
        Default: True
    - turbo: To run workflow 10x faster. By default, bot runs at human speed.
        Default: False

    ##### outPorts:
    - None
    """
    visual: InArg[bool]
    chrome: InArg[bool]
    turbo: InArg[bool]

    def __init__(self):
        self.visual = InArg(False)
        self.chrome = InArg(True)
        self.turbo = InArg(False)
        self.done = False

    def execute(self, ctx) -> None:
        visual = self.visual.value
        chrome = self.chrome.value
        turbo = self.turbo.value
        print(f"Visual automation: {visual}, Chrome: {chrome}, Turbo: {turbo}")
        
        import rpa as r
        r.init(visual_automation=visual, chrome_browser=chrome, turbo_mode=turbo)
        print("Bot initiated.")

        self.done = False

@xai_component
class RpaClose(Component):
    """Shutsdown the RPA bot.
    
    ### Reference:
    - [RPA-Python Core Functions](https://github.com/tebelorg/RPA-Python#core-functions)

    ##### inPorts:
    - None

    ##### outPorts:
    - None
    """
    def __init__(self):
        self.done = False

    def execute(self, ctx) -> None:
        print("Closing RPA...")
        import rpa as r
        r.close()

        self.done = False
        
@xai_component
class RpaError(Component):
    """Raises exception on error.
    
    ### Reference:
    - [RPA-Python Core Functions](https://github.com/tebelorg/RPA-Python#core-functions)

    ##### inPorts:
    - raise_exception: Raise exception on error.
        Default: False

    ##### outPorts:
    - None
    """
    raise_exception: InArg[bool]

    def __init__(self):
        self.raise_exception = InArg(False)
        self.done = False

    def execute(self, ctx) -> None:
        raise_exception = self.raise_exception.value
        
        import rpa as r
        r.error(raise_exception)
        print("Exception will be raised on error.")

        self.done = False
        
@xai_component
class RpaDebug(Component):
    """Print & log debug info to `rpa_python.log`.
    
    ### Reference:
    - [RPA-Python Core Functions](https://github.com/tebelorg/RPA-Python#core-functions)

    ##### inPorts:
    - debug_log: Print and log debug info.
        Default: True

    ##### outPorts:
    - None
    """
    debug_log: InArg[bool]

    def __init__(self):
        self.debug_log = InArg(True)
        self.done = False

    def execute(self, ctx) -> None:
        debug_log = self.debug_log.value
        
        import rpa as r
        r.debug(debug_log)
        print("Debug info will be logged to `rpa_python.log`.")

        self.done = False
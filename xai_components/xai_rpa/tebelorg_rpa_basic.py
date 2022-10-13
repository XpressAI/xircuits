from xai_components.base import InArg, OutArg, Component, xai_component

@xai_component
class RpaUrl(Component):
    """Opens the browser with specified URL.
    
    ### Reference:
    - [RPA-Python Basic Functions](https://github.com/tebelorg/RPA-Python#basic-functions)

    ##### inPorts:
    - url: The URL to be accessed in the browser.
        Default: None

    ##### outPorts:
    - None
    """
    url: InArg[str]

    def __init__(self):
        self.url = InArg.empty()
        self.done = False

    def execute(self, ctx) -> None:
        url = self.url.value
        print(f"Opening {url} on browser...")
        
        import rpa as r
        r.url(webpage_url=url)
        print(f"Browser opened with URL {url}.")

        self.done = False
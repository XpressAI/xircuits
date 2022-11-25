import tornado
from jupyter_server.base.handlers import APIHandler
from .component_parser import ComponentsParser


class ComponentsRouteHandler(APIHandler):

    component_parser = ComponentsParser()
    @tornado.web.authenticated
    def get(self):
        self.finish(self.component_parser.get())

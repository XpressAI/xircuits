import json

import tornado
from jupyter_server.base.handlers import APIHandler

import os
from configparser import ConfigParser

def get_config():
    config = ConfigParser()
    config.read([
        os.path.join(os.path.dirname(__file__), "..", "..", "xai_components", ".xircuits", "config.ini"),
        os.path.expanduser("~/.xircuits/config.ini"),
        ".xircuits/config.ini"])
    return config

class HandleConfigRouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": "This is /get/config endpoint!"}))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()

        cfg = get_config()

        config_request = input_data["config_request"]
        config_cfg = str(cfg['DEV'][config_request]).replace('"', "")

        if config_cfg == '""' or config_cfg == "''":
            config_cfg = ""

        data = {"cfg": config_cfg}
        self.finish(json.dumps(data))
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

class GetConfigRouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": "This is /get/config endpoint!"}))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        configurations = []
        cfg = get_config()

        config_request = input_data["config_request"]
        config_spark = str(cfg['CONFIGURATION'][config_request]).split('\n')
        for id, spark in enumerate(config_spark):
            spark_cfg = cfg[spark]
            configurations.append({
                "run_type": spark_cfg["name"],
                "command" : spark_cfg["command"],
                "msg" : spark_cfg["msg"],
                "url" : spark_cfg["url"]
            })

        data = {"cfg": configurations}
        self.finish(json.dumps(data))
import json

import requests
import tornado
from jupyter_server.base.handlers import APIHandler

from .config import get_config


class DebuggerRouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": "This is /debug/enable endpoint!"}))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()

        cfg = get_config()
        port = str(cfg['SERVER']['IP_ADD'] + ":" + cfg['SERVER']['PORT'])

        output_content = ""
        if input_data["command"] == "run":
            output = requests.get(port + "/run") # next node

        elif input_data["command"] == "continue":
            output = requests.get(port +"/continue")

        elif input_data["command"] == "get/output":
            output = requests.get(port + "/output")

        elif input_data["command"] == "clear":
            output = requests.get(port + "/clear")

        elif input_data["command"] == "get_run":
            output = requests.get(port + "/execute")

        elif input_data["command"] == "clear_run":
            output = requests.get(port + "/clear_execution")

        elif input_data["command"] == "terminate":
            output = requests.get(port + "/terminate")

        else:
            output = ""

        try:
            if output != "":
                encoding = 'utf-8'
                output_content = output.content.decode(encoding)
        except:
            output_content = "Incorrect endpoint"

        data = {"output": output_content}

        self.finish(json.dumps(data))
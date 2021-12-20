import os
import json
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
import requests
import os
from configparser import ConfigParser

class CompileFileRouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": "This is file/generate endpoint!"}))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()

        try:
            python_script = input_data["compilePythonScript"]
        except:
            python_script = ""

        f = open(input_data["currentPath"], "w")
        f.write(python_script)
        f.close()
        data = {"message": "completed"}

        self.finish(json.dumps(data))


def get_config():
    config = ConfigParser()
    config.read([".xpipes/config.ini", "xai_components/.xpipes/config.ini", "home/xai_components/.xpipes/config.ini"])
    return config
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

def setup_handlers(web_app, url_path):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    # Prepend the base_url so that it works in a JupyterHub setting
    compile_route_pattern_1 = url_path_join(base_url, url_path, "file/generate")
    compile_file_handlers_1 = [(compile_route_pattern_1, CompileFileRouteHandler)]
    
    compile_route_pattern_2 = url_path_join(base_url, url_path, "debug/enable")
    compile_file_handlers_2 = [(compile_route_pattern_2, DebuggerRouteHandler)]

    compile_route_pattern_3 = url_path_join(base_url, url_path, "get/config")
    compile_file_handlers_3 = [(compile_route_pattern_3, HandleConfigRouteHandler)]
    
    web_app.add_handlers(host_pattern, compile_file_handlers_1)
    web_app.add_handlers(host_pattern, compile_file_handlers_2)
    web_app.add_handlers(host_pattern, compile_file_handlers_3)
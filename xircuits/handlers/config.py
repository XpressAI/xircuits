import json

import tornado
from jupyter_server.base.handlers import APIHandler
import traceback
import os
from configparser import ConfigParser

def get_config():
    config = ConfigParser()
    config.read([
        os.path.join(os.path.dirname(__file__), "..", "..", "xai_components", ".xircuits", "config.ini"),
        os.path.expanduser("~/.xircuits/config.ini"),
        ".xircuits/config.ini"])
    return config

class RunConfigRouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": "This is /config/run endpoint!"}))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        cfg = get_config()
        config_request = input_data["config_request"]
        run_types = []
        configurations = []
        err_msg = ""

        try:
            get_run_types = str(cfg['REMOTE_EXECUTION'][config_request]).split('\n')
            for id, run_type_name in enumerate(get_run_types):
                run_configs = str(cfg['RUN_TYPES'][run_type_name]).split('\n')
                for id, run_config_name in enumerate(run_configs):
                    run_cfg = cfg[run_config_name]
                    configurations.append(
                        {
                            "id" : id,
                            "run_type" : run_type_name,
                            "run_config_name": run_cfg["name"],
                            "command" : run_cfg["command"],
                            "msg" : run_cfg["msg"],
                            "url" : run_cfg["url"]
                        })
                run_types.append({"run_type": run_type_name})
        except Exception:
            err_msg = traceback.format_exc()
            pass

        data = {
            "run_types": run_types,
            "run_types_config": configurations,
            "err_msg": err_msg
            }
        self.finish(json.dumps(data))
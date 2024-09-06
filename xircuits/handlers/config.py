import json

import tornado
from jupyter_server.base.handlers import APIHandler
import traceback
import os
from configparser import ConfigParser

def get_config():
    config = ConfigParser()
    config.optionxform = str  # Make option names case-sensitive
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
            for run_type_name in get_run_types:
                run_configs = str(cfg['RUN_TYPES'][run_type_name]).split('\n')
                for id, run_config_name in enumerate(run_configs):
                    run_cfg = cfg[run_config_name]
                    config_data = {
                        "id": id,
                        "run_type": run_type_name,
                        "run_config_name": run_config_name,
                    }
                    
                    # Add all key-value pairs from run_cfg to config_data
                    for key, value in run_cfg.items():
                        config_data[key] = value

                    configurations.append(config_data)
                run_types.append({"run_type": run_type_name})
        except Exception:
            err_msg = traceback.format_exc()

        data = {
            "run_types": run_types,
            "run_types_config": configurations,
            "err_msg": err_msg
        }
        self.finish(json.dumps(data))


class SplitModeConfigHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        cfg = get_config()
        try:
            split_mode = cfg.get('UI', 'splitMode', fallback='split-bottom')
            self.finish(json.dumps({"splitMode": split_mode}))
        except Exception as e:
            self.finish(json.dumps({"error": str(e)}))

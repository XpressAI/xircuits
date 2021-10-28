import os
import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

import tornado
from tornado.web import StaticFileHandler
import subprocess


class ExecuteFileRouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": "This is /xpipe/hello endpoint!"}))

    @tornado.web.authenticated
    def post(self):
        # input_data is a dictionary with a key "name"
        input_data = self.get_json_body()
        validate_file = False

        try:
            current_path = input_data["currentPath"]
            path_list = []
            with open(current_path) as f:
                path_list = f.readlines()
            validate_file = True

            # f = open(input_data["currentPath"], "w")
            # f.write(input_data["message"])
            # f.close()

            subprocess.Popen(['python', current_path])
            data = {"output": "{}".format(input_data["message"])}
        except:
            validate_file = False
            data = {"output": ""}

        self.finish(json.dumps(data))

class CompileFileRouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": "This is /xpipe/hello endpoint!"}))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        f = open(input_data["currentPath"], "w")
        f.write('')
        f.close()
        data = {"message": "completed"}

        self.finish(json.dumps(data))

def setup_handlers(web_app, url_path):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    # Prepend the base_url so that it works in a JupyterHub setting
    execute_route_pattern = url_path_join(base_url, url_path, "file/execute")
    execute_file_handlers = [(execute_route_pattern, ExecuteFileRouteHandler)]

    compile_route_pattern = url_path_join(base_url, url_path, "file/generate")
    compile_file_handlers = [(compile_route_pattern, CompileFileRouteHandler)]
    
    web_app.add_handlers(host_pattern, execute_file_handlers)
    web_app.add_handlers(host_pattern, compile_file_handlers)

    # Prepend the base_url so that it works in a JupyterHub setting
    doc_url = url_path_join(base_url, url_path, "public")
    doc_dir = os.getenv(
        "XPIPE_STATIC_DIR",
        os.path.join(os.path.dirname(__file__), "public"),
    )
    handlers = [("{}/(.*)".format(doc_url), StaticFileHandler, {"path": doc_dir})]
    web_app.add_handlers(".*$", handlers)
import json

import tornado
from jupyter_server.base.handlers import APIHandler

from pathlib import Path

class CompileFileRouteHandler(APIHandler):
    def __get_notebook_absolute_path__(self, path):
        return (Path(self.application.settings['server_root_dir']) / path).expanduser().resolve()

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

        f = open(self.__get_notebook_absolute_path__(input_data["currentPath"]), "w")
        f.write(python_script)
        f.close()
        data = {"message": "completed"}

        self.finish(json.dumps(data))
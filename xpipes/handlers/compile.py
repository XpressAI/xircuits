import json

import tornado
from jupyter_server.base.handlers import APIHandler


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
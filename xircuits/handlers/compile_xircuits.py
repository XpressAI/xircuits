import json

import tornado
from jupyter_server.base.handlers import APIHandler

from pathlib import Path

from xircuits.compiler import compile
import traceback


class CompileXircuitsFileRouteHandler(APIHandler):
    def __get_notebook_absolute_path__(self, path):
        return (Path(self.application.settings['server_root_dir']) / path).expanduser().resolve()

    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": "This is file/compile endpoint!"}))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()

        input_file_path = input_data["filePath"]
        output_file_path = input_data["outPath"]

        component_python_paths = input_data["pythonPaths"]

        msg = ""

        try:
            with open(self.__get_notebook_absolute_path__(input_file_path), 'r', encoding='utf-8') as infile:
                with open(self.__get_notebook_absolute_path__(output_file_path), 'w') as outfile:
                    compile(infile, outfile, component_python_paths)

            msg = "completed"
        
        except Exception:
            msg = traceback.format_exc()
            print(msg)
            pass
        
        finally:
                
            data = {"message": msg}
            self.finish(json.dumps(data))

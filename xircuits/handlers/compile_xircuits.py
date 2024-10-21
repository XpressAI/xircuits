import json

import tornado
from jupyter_server.base.handlers import APIHandler

from pathlib import Path

from xircuits.compiler import compile, recursive_compile
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

        input_file_path = self.__get_notebook_absolute_path__(input_data["filePath"])
        output_file_path = self.__get_notebook_absolute_path__(input_data["outPath"])

        component_python_paths = input_data["pythonPaths"]

        msg = ""

        try:
            compile(str(input_file_path), str(output_file_path), component_python_paths)
            msg = "completed"
        
        except Exception:
            msg = traceback.format_exc()
            print(msg)
            pass
        
        finally:
            data = {"message": msg}
            self.finish(json.dumps(data))

class CompileRecursiveXircuitsFileRouteHandler(APIHandler):
    def __get_notebook_absolute_path__(self, path):
        return (Path(self.application.settings['server_root_dir']) / path).expanduser().resolve()

    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": "This is file/compile-recursive endpoint!"}))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()

        input_file_path = self.__get_notebook_absolute_path__(input_data["filePath"])
        component_python_paths = input_data["pythonPaths"]

        msg = ""

        try:
            recursive_compile(str(input_file_path), component_python_paths=component_python_paths)
            msg = "completed"
        
        except Exception:
            msg = traceback.format_exc()
            print(msg)
            pass
        
        finally:
            data = {"message": msg}
            self.finish(json.dumps(data))

import os
import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

import tornado
from tornado.web import StaticFileHandler
from subprocess import Popen, PIPE

import os
import sys

def getPythonOutput(current_path):
    result_message = ""
    bool_error = False

    try:
        res = Popen(['../../venv/Scripts/python', current_path], stdout = PIPE, stderr=PIPE)
        output, error = res.communicate()
        if output:
            result_message = ""
            bool_error = False
        elif error:
            result_message = error.strip()
            bool_error = 'Error' in result_message.decode('utf-8')

    except OSError as e:
        result_message = "OSERROR [" + str(e.errno) + "] " + str(e.strerror) + " >> " + str(e.filename)
        bool_error = True

    except:
        result_message = sys.exc_info()[0]
        bool_error = True

    if result_message != "":
        encoding = 'utf-8'
        result_message = result_message.decode(encoding)

    return bool_error, result_message

class ExecuteFileRouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    bool_end = False
    output_list = []
    std_output = None

    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": self.bool_end, "data2": self.output_list}))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()

        try:
            current_path = input_data["currentPath"]
            self.output_list.clear()
            with Popen(['../../venv/Scripts/python', current_path], stdout=PIPE, stderr=PIPE, bufsize=1, universal_newlines=True) as p:
                self.std_output = p.stdout
                result_message = p.stdout
                
                for line in p.stdout:
                    self.output_list.append(str(line))
                    
                self.output_list.append('end123')
                self.bool_end = True

            data = {"output": "{}".format(result_message)}
        except:
            data = {"output": ""}

        self.finish(json.dumps(data))


class FileImportRouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": ''}))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()

        current_path = input_data["currentPath"]

        bool_error, result_message = getPythonOutput(current_path)
        
        data = {"bool_error": "{}".format(bool_error), "output_message": "{}".format(result_message)}

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
    execute_route_pattern_1 = url_path_join(base_url, url_path, "file/execute")
    execute_file_handlers_1 = [(execute_route_pattern_1, ExecuteFileRouteHandler)]

    execute_route_pattern_2 = url_path_join(base_url, url_path, "file/import")
    execute_file_handlers_2 = [(execute_route_pattern_2, FileImportRouteHandler)]

    compile_route_pattern = url_path_join(base_url, url_path, "file/generate")
    compile_file_handlers = [(compile_route_pattern, CompileFileRouteHandler)]
    
    web_app.add_handlers(host_pattern, execute_file_handlers_1)
    web_app.add_handlers(host_pattern, execute_file_handlers_2)
    web_app.add_handlers(host_pattern, compile_file_handlers)

    # Prepend the base_url so that it works in a JupyterHub setting
    doc_url = url_path_join(base_url, url_path, "public")
    doc_dir = os.getenv(
        "XPIPE_STATIC_DIR",
        os.path.join(os.path.dirname(__file__), "public"),
    )
    handlers = [("{}/(.*)".format(doc_url), StaticFileHandler, {"path": doc_dir})]
    web_app.add_handlers(".*$", handlers)
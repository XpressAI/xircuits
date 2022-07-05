import json
import tornado
import subprocess
from jupyter_server.base.handlers import APIHandler
import platform
import os
class SparkSubmitRouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": "This is spark/submit endpoint!"}))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        export_str = ""
        command_str = ""
        addArguments = input_data["addArgs"]
        currentPath = input_data["currentPath"]

        if platform.system() == "Windows": 
            spark_submit_cmd = "spark-submit.cmd "
        else: 
            spark_submit_cmd = "spark-submit "

        for key, value in addArguments.items():
            if key == 'export':
                export_str = value
            elif key == 'command':
                command_str = value
        spark_submit_str= command_str + " " + currentPath
        # env = {
        #     **os.environ
        # }
        # if export_str != 'null':
        #     process=subprocess.Popen(spark_submit_str,stdout=subprocess.PIPE,stderr=subprocess.PIPE, env=export_str,universal_newlines=True, shell=True)
        #     stdout = process.communicate()
        # else:
        process=subprocess.Popen(spark_submit_str,stdout=subprocess.PIPE,stderr=subprocess.PIPE,universal_newlines=True, shell=True)
        stdout,stderr = process.communicate()

        data = {
            "stderr": stderr,
            "stdout": stdout
        }

        self.finish(json.dumps(data))
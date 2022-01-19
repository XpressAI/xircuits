import json
import tornado
import subprocess
from jupyter_server.base.handlers import APIHandler
import platform

class SparkSubmitRouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": "This is spark/submit endpoint!"}))

    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()

        addArguments = input_data["addArgs"]
        currentPath = input_data["currentPath"]

        if platform.system() == "Windows": 
            spark_submit_cmd = "spark-submit.cmd "
        else: 
            spark_submit_cmd = "spark-submit "

        spark_submit_str= spark_submit_cmd + addArguments + " " + currentPath
        process=subprocess.Popen(spark_submit_str,stdout=subprocess.PIPE,stderr=subprocess.PIPE, universal_newlines=True, shell=True)
        stdout,stderr = process.communicate()

        data = {
            "stderr": stderr,
            "stdout": stdout
        }

        self.finish(json.dumps(data))
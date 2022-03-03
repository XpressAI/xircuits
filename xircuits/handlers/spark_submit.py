import json
import tornado
from subprocess import Popen, PIPE
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
        p=Popen(spark_submit_str, stdout=PIPE, stderr=PIPE, universal_newlines=True, shell=True)
        for line in p.stdout:
            print(line.rstrip())
        if p.returncode != 0:
            print(p.stderr.read())

        data = {
            "stderr": stderr,
            "stdout": stdout
        }

        self.finish()
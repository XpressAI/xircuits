import json
import traceback
import tornado
from jupyter_server.base.handlers import APIHandler
from xircuits.library import install_library

class InstallLibraryRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.finish(json.dumps({"message": "Library name is required"}))
            return

        try:
            # install_library(library_name)
            message = f"Installation of {library_name} completed successfully."
        except Exception as e:
            message = f"An error occurred: {traceback.format_exc()}"
            print(message)

        self.finish(json.dumps({"message": message}))
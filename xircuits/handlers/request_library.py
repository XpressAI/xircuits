import os
import json
import traceback
import tornado
import posixpath
from jupyter_server.base.handlers import APIHandler
from pathlib import Path
from xircuits.library import install_library, build_library_file_path_from_config

class InstallLibraryRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.finish(json.dumps({"message": "Library name is required"}))
            return

        try:
            message = install_library(library_name)
        except RuntimeError as e:
            message = str(e)
            print(message)
        except Exception as e:
            message = f"An unexpected error occurred: {traceback.format_exc()}"
            print(message)

        self.finish(json.dumps({"message": message}))

class GetLibraryDirectoryRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.finish(json.dumps({"message": "Library name is required"}))
            return

        directory_path = posixpath.join("xai_components", f"xai_{library_name.lower()}")

        response = {"path": directory_path}
        self.finish(json.dumps(response))

class GetLibraryReadmeRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.finish(json.dumps({"message": "Library name is required"}))
            return
        
        file_path = build_library_file_path_from_config(library_name, "readme")

        if file_path:
            response = {"path": file_path}
        else:
            response = {"message": "readme not found."}

        self.finish(json.dumps(response))

class GetLibraryExampleRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.finish(json.dumps({"message": "Library name is required"}))
            return

        example_path = build_library_file_path_from_config(library_name, "default_example_path")

        if example_path:
            response = {"path": example_path}
        else:
            response = {"message": "No .xircuits example file found in the library."}

        self.finish(json.dumps(response))
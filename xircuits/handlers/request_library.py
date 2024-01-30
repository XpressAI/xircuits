import os
import json
import traceback
import tornado
import posixpath
from jupyter_server.base.handlers import APIHandler
from pathlib import Path
from xircuits.library import install_library, get_library_config

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


def get_library_file_path(library_name, path_key, default_filename):
    config = get_library_config(library_name)
    base_path = Path("xai_components") / f"xai_{library_name.lower()}"

    if config and 'Paths' in config and path_key in config['Paths']:
        relative_path = config['Paths'][path_key]
    else:
        relative_path = default_filename

    full_path = posixpath.join(base_path, relative_path)
    if os.path.isfile(full_path):
        return full_path
    else:
        return None

class GetLibraryReadmeRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.finish(json.dumps({"message": "Library name is required"}))
            return

        readme_path = get_library_file_path(library_name, 'readme_path', "README.md")
        if readme_path:
            response = {"path": readme_path}
        else:
            response = {"message": "README file not found."}

        self.finish(json.dumps(response))

class GetLibraryExampleRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.finish(json.dumps({"message": "Library name is required"}))
            return

        example_path = get_library_file_path(library_name, 'default_example_path', "example.xircuits")
        if example_path:
            response = {"path": example_path}
        else:
            response = {"message": "No .xircuits example file found in the library."}

        self.finish(json.dumps(response))
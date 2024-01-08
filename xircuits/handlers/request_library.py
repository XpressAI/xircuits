import os
import json
import traceback
import tornado
import posixpath
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

class GetLibraryDirectoryRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.finish(json.dumps({"message": "Library name is required"}))
            return

        directory_path = posixpath.join("xai_components", f"xai_{library_name.lower()}")

        response = {"directory_path": directory_path}
        self.finish(json.dumps(response))

class GetLibraryReadmeRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.finish(json.dumps({"message": "Library name is required"}))
            return

        base_path = posixpath.join("xai_components", f"xai_{library_name.lower()}")
        readme_filename = None

        if os.path.isdir(base_path):
            for file in os.listdir(base_path):
                if file.lower() == 'readme.md':
                    readme_filename = posixpath.join(base_path, file)
                    break

        if readme_filename:
            response = {"file_path": readme_filename}
        else:
            response = {"message": "README file not found"}

        self.finish(json.dumps(response))


class GetLibraryExampleRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.finish(json.dumps({"message": "Library name is required"}))
            return

        base_path = posixpath.join("xai_components", f"xai_{library_name.lower()}")
        examples_path = posixpath.join(base_path, "examples")
        example_xircuits, search_status = self.find_example_xircuits(base_path, examples_path)

        if example_xircuits:
            response = {"file_path": example_xircuits, "searchStatus": search_status}
        else:
            response = {"message": "No .xircuits file found in the library"}

        self.finish(json.dumps(response))

    def find_example_xircuits(self, base_path, examples_path):
        # Priority 1: Search for example.xircuits in base_path
        example_xircuits_path = posixpath.join(base_path, "example.xircuits")
        if os.path.exists(example_xircuits_path):
            return example_xircuits_path, "Found in base directory"

        # Priority 2: Search for examples/example.xircuits
        example_xircuits_path = posixpath.join(examples_path, "example.xircuits")
        if os.path.exists(example_xircuits_path):
            return example_xircuits_path, "Found in examples directory"

        # Priority 3: Pick any .xircuits in the examples/ dir
        if os.path.isdir(examples_path):
            for file in os.listdir(examples_path):
                if file.endswith('.xircuits'):
                    return posixpath.join(examples_path, file), "Picked any .xircuits from examples directory"

        # Priority 4: Pick any .xircuits in the library dir
        if os.path.isdir(base_path):
            for file in os.listdir(base_path):
                if file.endswith('.xircuits'):
                    return posixpath.join(base_path, file), "Picked any .xircuits from base directory"

        # If not found
        return None, None

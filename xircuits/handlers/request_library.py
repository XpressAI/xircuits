import os
import json
import traceback
import tornado
import posixpath
from http import HTTPStatus
from jupyter_server.base.handlers import APIHandler
from xircuits.library import install_library, fetch_library, build_library_file_path_from_config, save_component_library_config, get_component_library_config, create_or_update_library

class InstallLibraryRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.set_status(HTTPStatus.BAD_REQUEST)
            self.finish(json.dumps({"error": "Library name is required"}))
            return

        try:
            message = install_library(library_name)
            self.finish(json.dumps({"status": "OK", "message": message}))
        except RuntimeError as e:
            self.set_status(HTTPStatus.BAD_REQUEST)
            message = str(e)
            print(message)
            self.finish(json.dumps({"error": message}))
        except Exception as e:
            self.set_status(HTTPStatus.INTERNAL_SERVER_ERROR)
            message = f"An unexpected error occurred: {traceback.format_exc()}"
            print(message)
            self.finish(json.dumps({"error": message}))

class FetchLibraryRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.set_status(HTTPStatus.BAD_REQUEST)
            self.finish(json.dumps({"error": "Library name is required"}))
            return

        try:
            message = fetch_library(library_name.lower())
            self.finish(json.dumps({"status": "OK", "message": message}))
        except RuntimeError as e:
            self.set_status(HTTPStatus.BAD_REQUEST)
            message = str(e)
            self.finish(json.dumps({"error": message}))
        except Exception as e:
            self.set_status(HTTPStatus.INTERNAL_SERVER_ERROR)
            message = "An unexpected error occurred"
            print(f"An unexpected error occurred: {traceback.format_exc()}")
            self.finish(json.dumps({"error": message}))

class GetLibraryDirectoryRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.set_status(HTTPStatus.BAD_REQUEST)
            self.finish(json.dumps({"error": "Library name is required"}))
            return

        directory_path = posixpath.join("xai_components", f"xai_{library_name.lower()}")
        self.finish(json.dumps({"status": "OK", "path": directory_path}))

class GetLibraryReadmeRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.set_status(HTTPStatus.BAD_REQUEST)
            self.finish(json.dumps({"error": "Library name is required"}))
            return

        file_path = build_library_file_path_from_config(library_name, "readme")

        if file_path:
            if os.path.exists(file_path):
                response = {"status": "OK", "path": file_path}
            else:
                self.set_status(HTTPStatus.NOT_FOUND)
                response = {"error": "Readme file not found."}
        else:
            self.set_status(HTTPStatus.NOT_FOUND)
            response = {"error": "Readme configuration not found."}

        self.finish(json.dumps(response))

class GetLibraryExampleRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.set_status(HTTPStatus.BAD_REQUEST)
            self.finish(json.dumps({"error": "Library name is required"}))
            return

        example_path = build_library_file_path_from_config(library_name, "default_example_path")

        if example_path:
            if os.path.exists(example_path):
                response = {"status": "OK", "path": example_path}
            else:
                self.set_status(HTTPStatus.NOT_FOUND)
                response = {"error": "Example file not found."}
        else:
            self.set_status(HTTPStatus.NOT_FOUND)
            response = {"error": "Example configuration not found."}

        self.finish(json.dumps(response))

class ReloadComponentLibraryConfigHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        try:
            save_component_library_config()
            response = {"status": "OK", "message": "Library config updated."}
        except Exception as e:
            self.set_status(HTTPStatus.INTERNAL_SERVER_ERROR)
            response = {"error": f"Something went wrong: {str(e)}"}
            print(f"An error occurred: {traceback.format_exc()}")

        self.finish(json.dumps(response))


class GetComponentLibraryConfigHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        try:
            config = get_component_library_config()
            response = {"status": "OK", "config": config}
        except Exception as e:
            self.set_status(HTTPStatus.INTERNAL_SERVER_ERROR)
            response = {"error": f"Something went wrong: {str(e)}"}
            print(f"An error occurred: {traceback.format_exc()}")

        self.finish(json.dumps(response))

class CreateNewLibraryHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName", "").lower()
        component_filename = input_data.get("componentFilename", "new_component.py")
        component_content = input_data.get("componentCode", "")

        if not library_name:
            self.set_status(HTTPStatus.BAD_REQUEST)
            self.finish(json.dumps({"error": "Library name is required"}))
            return

        try:
            message = create_or_update_library(library_name, component_filename, component_content)
            self.finish(json.dumps({"status": "OK", "message": message}))
        except Exception as e:
            self.set_status(HTTPStatus.INTERNAL_SERVER_ERROR)
            message = f"An unexpected error occurred: {traceback.format_exc()}"
            print(message)
            self.finish(json.dumps({"error": message}))

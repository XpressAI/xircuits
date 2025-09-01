import os
import json
import traceback
import tornado
import posixpath
from pathlib import Path
from http import HTTPStatus
from jupyter_server.base.handlers import APIHandler
from xircuits.library import install_library, uninstall_library, fetch_library, create_or_update_library
from xircuits.library.index_config import refresh_index, get_component_library_config

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

class UninstallLibraryRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")

        if not library_name:
            self.set_status(HTTPStatus.BAD_REQUEST)
            self.finish(json.dumps({"error": "Library name is required"}))
            return

        try:
            uninstall_library(library_name.lower())
            self.finish(json.dumps({"status": "OK", "message": f"Library {library_name} uninstalled."}))
        except FileNotFoundError:
            self.set_status(HTTPStatus.NOT_FOUND)
            self.finish(json.dumps({"error": f"Library '{library_name}' not found."}))
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

        base = _library_dir_from_name(library_name)
        candidates = [base / "README.md", base / "README.rst", base / "Readme.md", base / "readme.md"]
        for p in candidates:
            if p.exists():
                self.finish(json.dumps({"status": "OK", "path": p.as_posix()}))
                return

        self.set_status(HTTPStatus.NOT_FOUND)
        self.finish(json.dumps({"error": "Readme file not found."}))


class GetLibraryExampleRouteHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        input_data = self.get_json_body()
        library_name = input_data.get("libraryName")
        if not library_name:
            self.set_status(HTTPStatus.BAD_REQUEST)
            self.finish(json.dumps({"error": "Library name is required"}))
            return

        base = _library_dir_from_name(library_name)
        preferred = base / "examples" / "default.xircuits"
        if preferred.exists():
            self.finish(json.dumps({"status": "OK", "path": preferred.as_posix()}))
            return

        # Fallback: first .xircuits anywhere under the library dir (recursive)
        found = None
        if base.exists():
            for p in base.rglob("*.xircuits"):
                found = p
                break

        if found:
            self.finish(json.dumps({"status": "OK", "path": found.as_posix()}))
        else:
            self.set_status(HTTPStatus.NOT_FOUND)
            self.finish(json.dumps({"error": "Example file not found."}))


class ReloadComponentLibraryConfigHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        try:
            refresh_index()
            response = {"status": "OK", "message": "Index refreshed."}
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


def _library_dir_from_name(library_name: str) -> Path:
    raw = (library_name or "").strip().lower().replace("-", "_")
    if not raw.startswith("xai_"):
        raw = "xai_" + raw
    return Path("xai_components") / raw

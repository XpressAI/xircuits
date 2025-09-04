import os
import json
import traceback
import tornado
from http import HTTPStatus
from pathlib import Path
from jupyter_server.base.handlers import APIHandler
from xircuits.utils.file_utils import is_empty, copy_from_installed_wheel
from xircuits.start_xircuits import find_xircuits_working_dir, init_xircuits

class FetchExamplesRouteHandler(APIHandler):
    """
    API Handler to fetch example workflows into the Xircuits working directory.
    """
    @tornado.web.authenticated
    def post(self):
        try:
            # Determine the Xircuits working directory (where xai_components exists)
            working_dir = find_xircuits_working_dir()
            if working_dir is None:
                self.set_status(HTTPStatus.BAD_REQUEST)
                return self.finish(json.dumps({
                    "error": "Xircuits is not initialized. Please run 'xircuits init' or set XIRCUITS_INIT."}))

            examples_dir = working_dir / "examples"
            # Only copy if directory is missing or empty
            if not examples_dir.exists() or is_empty(str(examples_dir)):
                # Copy into the working directory
                copy_from_installed_wheel('examples', resource='', dest_path=str(examples_dir))
                message = "Examples have been fetched and saved to the 'examples' folder."
            else:
                message = "Examples folder already exists and is not empty."

            self.finish(json.dumps({"status": "OK", "message": message}))
        except Exception as e:
            self.set_status(HTTPStatus.INTERNAL_SERVER_ERROR)
            error_msg = f"An error occurred while fetching examples: {traceback.format_exc()}"
            self.finish(json.dumps({"error": error_msg}))

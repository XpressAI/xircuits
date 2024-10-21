from jupyter_server.utils import url_path_join

from .compile_xircuits import CompileXircuitsFileRouteHandler, CompileRecursiveXircuitsFileRouteHandler
from .components import ComponentsRouteHandler
from .config import RunConfigRouteHandler, SplitModeConfigHandler
from .debugger import DebuggerRouteHandler
from .spark_submit import SparkSubmitRouteHandler
from .request_library import InstallLibraryRouteHandler, FetchLibraryRouteHandler, GetLibraryDirectoryRouteHandler, GetLibraryReadmeRouteHandler, GetLibraryExampleRouteHandler, ReloadComponentLibraryConfigHandler, GetComponentLibraryConfigHandler, CreateNewLibraryHandler


def setup_handlers(web_app, url_path):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    # Prepend the base_url so that it works in a JupyterHub setting
    web_app.add_handlers(host_pattern, [
        (
            url_path_join(base_url, url_path, "debug/enable"),
            DebuggerRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "config/run"),
            RunConfigRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "config/split_mode"),
            SplitModeConfigHandler
        ),
        (
            url_path_join(base_url, url_path, "components/"),
            ComponentsRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "spark/submit"),
            SparkSubmitRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "file/compile"),
            CompileXircuitsFileRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "file/compile-recursive"),
            CompileRecursiveXircuitsFileRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "library/reload_config"),
            ReloadComponentLibraryConfigHandler
        ),
        (
            url_path_join(base_url, url_path, "library/get_config"),
            GetComponentLibraryConfigHandler
        ),
        (
            url_path_join(base_url, url_path, "library/fetch"),
            FetchLibraryRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "library/install"),
            InstallLibraryRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "library/get_directory"),
            GetLibraryDirectoryRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "library/get_readme"),
            GetLibraryReadmeRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "library/get_example"),
            GetLibraryExampleRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "library/new"),
            CreateNewLibraryHandler
        )
    ])
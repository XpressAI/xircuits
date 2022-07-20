from jupyter_server.utils import url_path_join

from .compile import CompileFileRouteHandler
from .components import ComponentsRouteHandler
from .config import RunConfigRouteHandler
from .debugger import DebuggerRouteHandler
from .spark_submit import SparkSubmitRouteHandler


def setup_handlers(web_app, url_path):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    # Prepend the base_url so that it works in a JupyterHub setting
    web_app.add_handlers(host_pattern, [
        (
            url_path_join(base_url, url_path, "file/generate"),
            CompileFileRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "debug/enable"),
            DebuggerRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "config/run"),
            RunConfigRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "components/"),
            ComponentsRouteHandler
        ),
        (
            url_path_join(base_url, url_path, "spark/submit"),
            SparkSubmitRouteHandler
        )

    ])
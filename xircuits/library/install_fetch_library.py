import subprocess
import sys
from pathlib import Path
from ..utils import is_valid_url, is_empty
from ..handlers.request_submodule import request_submodule_library
from ..handlers.request_folder import clone_from_github_url

def build_component_library_path(component_library_query: str) -> str:
    if "xai" not in component_library_query:
        component_library_query = "xai_" + component_library_query

    if "xai_components" not in component_library_query:
        component_library_query = "xai_components/" + component_library_query

    return component_library_query

def get_component_library_path(library_name: str) -> str:
    if is_valid_url(library_name):
        return clone_from_github_url(library_name)
    else:
        return build_component_library_path(library_name)

def install_library(library_name: str) -> None:
    print(f"Installing {library_name}...")
    component_library_path = get_component_library_path(library_name)

    if not Path(component_library_path).is_dir() or is_empty(component_library_path):
        request_submodule_library(component_library_path)

    requirements_file = Path(component_library_path) / "requirements.txt"

    if requirements_file.exists():
        print(f"Installing requirements for {library_name}...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)], check=True)
    else:
        print(f"No requirements.txt found for {library_name}. Skipping installation of dependencies.")


def fetch_library(library_name: str) -> None:
    print(f"Fetching {library_name}...")
    component_library_path = get_component_library_path(library_name)

    if not Path(component_library_path).is_dir() or is_empty(component_library_path):
        request_submodule_library(component_library_path)
    else:
        print(f"{library_name} library already exists in {component_library_path}.")

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

def install_library(library_name: str) -> str:
    messages = []
    print(f"Installing {library_name}...")
    component_library_path = get_component_library_path(library_name)

    if not Path(component_library_path).is_dir() or is_empty(component_library_path):
        request_submodule_library(component_library_path)

    requirements_file = Path(component_library_path) / "requirements.txt"

    if requirements_file.exists():
        try:
            print(f"Installing requirements for {library_name}...")
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)], check=True)
        except Exception as e:
            raise RuntimeError(f"An error occurred while installing requirements for {library_name}: {e}")
    else:
        messages.append(f"No requirements.txt found for {library_name}. Skipping installation of dependencies.")

    messages.append(f"Library {library_name} ready to use.")
    return '\n'.join(messages)

def fetch_library(library_name: str) -> str:
    messages = [f"Fetching {library_name}..."]
    component_library_path = get_component_library_path(library_name)

    if not Path(component_library_path).is_dir() or is_empty(component_library_path):
        request_submodule_library(component_library_path)
        messages.append(f"{library_name} library fetched and stored in {component_library_path}.")
    else:
        messages.append(f"{library_name} library already exists in {component_library_path}.")

    return '\n'.join(messages)

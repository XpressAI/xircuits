import subprocess
import sys
import os
import shutil
import json
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

def get_library_config(library_name, config_key):
    config_path = ".xircuits/component_library_config.json"
    if os.path.exists(config_path):
        with open(config_path, "r") as config_file:
            config = json.load(config_file)
            for library in config.get("libraries", []):
                if library.get("library_id") == library_name:
                    # Check for the existence of the key and that its value is not None
                    if config_key in library and library[config_key] is not None:
                        return library[config_key]
                    else:
                        return None  # Explicitly return None if the key is missing or its value is None

    return None  # Return None if the library isn't found or the file doesn't exist

def build_library_file_path_from_config(library_name, config_key):
    file_path = get_library_config(library_name, config_key)
    if file_path is None:
        return None

    base_path = get_library_config(library_name, "local_path")
    if base_path is None:
        return None
    
    full_path = Path(base_path, file_path)
    return full_path.as_posix()

def get_component_library_path(library_name: str) -> str:
    if is_valid_url(library_name):
        return clone_from_github_url(library_name)
    else:
        return build_component_library_path(library_name)

def is_uv_venv() -> bool:
    """Return True if we're in a uv-managed venv (pyvenv.cfg contains 'uv =')."""
    venv = os.environ.get("VIRTUAL_ENV")
    if not venv:
        return False
    cfg = Path(venv) / "pyvenv.cfg"
    if not cfg.exists():
        return False
    for line in cfg.read_text().splitlines():
        if line.strip().startswith("uv ="):
            return True
    return False

def get_pip_command() -> list[str]:
    """
    Return the command prefix to run 'pip install' in the current environment.
    Prefers 'uv pip' if in a uv-managed venv and 'uv' is on PATH.
    Otherwise falls back to 'python -m pip'.
    """
    # if uv-managed venv, use uv pip
    if is_uv_venv():
        uv_cmd = shutil.which("uv")
        if uv_cmd:
            return [uv_cmd, "pip", "install"]
    # otherwise, use the interpreter's pip
    return [sys.executable, "-m", "pip", "install"]

def install_library(library_name: str):

    if not os.environ.get("VIRTUAL_ENV"):
        print("Warning: no virtual environment detected; installing globally.")

    print(f"Installing {library_name}...")
    component_library_path = get_component_library_path(library_name)

    if not Path(component_library_path).is_dir() or is_empty(component_library_path):
        success, message = request_submodule_library(component_library_path)
        if not success:
            print(message)
            return

    # Get the requirements path from the configuration
    requirements_path = get_library_config(library_name, "requirements_path")
    # Convert to Path object and ensure it's absolute
    requirements_path = Path(requirements_path).resolve() if requirements_path else Path(component_library_path) / "requirements.txt"

    # Install requirements if the file exists
    if requirements_path.exists():
        try:
            print(f"Installing requirements for {library_name} from {requirements_path}...")
            cmd = get_pip_command() + ["-r", str(requirements_path)]
            subprocess.run(cmd, check=True)
            print(f"Library {library_name} ready to use.")
        except Exception as e:
            print(f"An error occurred while installing requirements for {library_name}: {e}")
    else:
        print(f"No requirements.txt found for {library_name}. Skipping installation of dependencies.")
        print(f"Library {library_name} ready to use.")

def fetch_library(library_name: str):
    print(f"Fetching {library_name}...")
    component_library_path = get_component_library_path(library_name)

    if not Path(component_library_path).is_dir() or is_empty(component_library_path):
        success, message = request_submodule_library(component_library_path)
        if success:
            print(f"{library_name} library fetched and stored in {component_library_path}.")
        else:
            print(message)
    else:
        print(f"{library_name} library already exists in {component_library_path}.")

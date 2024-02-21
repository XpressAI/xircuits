import subprocess
import sys
import os
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

def install_library(library_name: str):
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
            print(f"Installing requirements for {library_name}...")
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(requirements_path)], check=True)
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
import subprocess
import sys
import configparser
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

def get_library_config(library_name: str):
    config_path = Path("xai_components") / f"xai_{library_name.lower()}" / "library-config.ini"
    config = configparser.ConfigParser()
    if config_path.exists():
        config.read(config_path)
        return config
    else:
        print(f"Config file for {library_name} not found at {config_path}.")
        return None

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

    # Get config and determine requirements path
    config = get_library_config(library_name)
    requirements_path = Path(config.get('requirements_path') if config and 'requirements_path' in config else Path(component_library_path) / "requirements.txt")

    # Install requirements if the file exists
    if requirements_path.exists():
        try:
            print(f"Installing requirements for {library_name}...")
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(requirements_path)], check=True)
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
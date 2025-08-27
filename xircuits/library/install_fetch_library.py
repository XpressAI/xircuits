import subprocess
import sys
import os
import shutil
import json
from pathlib import Path
from ..utils.file_utils import is_valid_url, is_empty
from ..utils.git_toml_manager import remove_git_directory, get_git_info, update_pyproject_toml, remove_from_pyproject_toml

from ..handlers.request_remote import request_remote_library
from ..handlers.request_folder import clone_from_github_url

CORE_LIBS = {"xai_events", "xai_template", "xai_controlflow", "xai_utils"}

def build_component_library_path(component_library_query: str) -> str:
    if "xai" not in component_library_query:
        component_library_query = "xai_" + component_library_query

    if "xai_components" not in component_library_query:
        component_library_query = "xai_components/" + component_library_query

    return component_library_query

def get_library_config(library_name, config_key):
    index_path = ".xircuits/remote_lib_manifest/index.json"
    if not os.path.exists(index_path):
        return None

    with open(index_path, "r", encoding="utf-8") as config_file:
        parsed = json.load(config_file)

    libraries = parsed if isinstance(parsed, list) else parsed.get("libraries", [])
    search_name = str(library_name or "").lower()

    for library in libraries:
        lib_id = str(library.get("library_id", "")).lower()
        if lib_id == search_name:
            value = library.get(config_key)
            return value if value is not None else None
    return None

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

    # Store git info before cloning/fetching
    git_ref = None
    repo_url = None
    
    if not Path(component_library_path).is_dir() or is_empty(component_library_path):
        success, message = request_remote_library(component_library_path)
        if not success:
            print(message)
            return
        
        # Get git info immediately after cloning, before removing .git
        git_ref, is_tag = get_git_info(component_library_path)
        print(f"Detected {'tag' if is_tag else 'commit'}: {git_ref}")
        
        # Get repo URL from config
        try:
            # Get library config to extract repo URL
            config_path = ".xircuits/component_library_config.json"
            if os.path.exists(config_path):
                with open(config_path, "r") as config_file:
                    config = json.load(config_file)
                    for library in config.get("libraries", []):
                        lib_id = library.get('library_id', '').lower()
                        search_name = library_name.lower()
                        if lib_id == search_name:
                            repo_url = library.get("repository") or library.get("url")
                            break
        except Exception as e:
            print(f"⚠️  Warning: Could not extract repo URL: {e}")
        
        # Remove .git directory
        remove_git_directory(component_library_path)
        
        # Update pyproject.toml if we have the necessary info
        if git_ref and repo_url:
            success = update_pyproject_toml(library_name, component_library_path, repo_url, git_ref, is_tag)
            if success:
                print("✅ Successfully updated pyproject.toml")
            else:
                print("❌ Failed to update pyproject.toml")
        else:
            print(f"⚠️  Skipping TOML update - missing git_ref: {git_ref}, repo_url: {repo_url}")

    # Install dependencies (prefer specs from index.json; fallback to requirements.txt)
    req_specs = get_library_config(library_name, "requirements")

    if isinstance(req_specs, list) and any(isinstance(s, str) and s.strip() for s in req_specs):
        try:
            print(f"Installing requirements for {library_name} from index.json specs...")
            cmd = get_pip_command() + req_specs  # e.g. ["pip", "install", "numpy>=1.26", "pydantic==2.*"]
            subprocess.run(cmd, check=True)
            print(f"Library {library_name} ready to use.")
        except Exception as e:
            print(f"An error occurred while installing requirements for {library_name}: {e}")
    else:
        requirements_path = Path(component_library_path) / "requirements.txt"
        if requirements_path.exists():
            try:
                print(f"Installing requirements for {library_name} from {requirements_path}...")
                cmd = get_pip_command() + ["-r", str(requirements_path)]
                subprocess.run(cmd, check=True)
                print(f"Library {library_name} ready to use.")
            except Exception as e:
                print(f"An error occurred while installing requirements for {library_name}: {e}")
        else:
            print(f"No requirements specified for {library_name}. Skipping dependency installation.")
            print(f"Library {library_name} ready to use.")

def fetch_library(library_name: str):
    print(f"Fetching {library_name}...")
    component_library_path = get_component_library_path(library_name)

    if not Path(component_library_path).is_dir() or is_empty(component_library_path):
        success, message = request_remote_library(component_library_path)
        if success:
            # Get git info before removing .git
            git_ref, is_tag = get_git_info(component_library_path)
            print(f"Detected {'tag' if is_tag else 'commit'}: {git_ref}")
            
            # Get repo URL from config
            repo_url = None
            try:
                config_path = ".xircuits/component_library_config.json"
                if os.path.exists(config_path):
                    with open(config_path, "r") as config_file:
                        config = json.load(config_file)
                        for library in config.get("libraries", []):
                            lib_id = library.get('library_id', '').lower()
                            search_name = library_name.lower()
                            if lib_id == search_name:
                                repo_url = library.get("repository")
                                break
            except Exception as e:
                print(f"⚠️  Warning: Could not extract repo URL: {e}")
            
            # Remove .git directory
            remove_git_directory(component_library_path)
            
            # Update pyproject.toml if we have the necessary info
            if git_ref and repo_url:
                update_pyproject_toml(library_name, component_library_path, repo_url, git_ref, is_tag)
            
            print(f"{library_name} library fetched and stored in {component_library_path}.")
        else:
            print(message)
    else:
        print(f"{library_name} library already exists in {component_library_path}.")

def uninstall_library(library_name: str) -> None:
    """
    Remove the component-library directory unless it's a core library.
    """

    raw = library_name.strip().lower()

    if "xai" not in raw:
        raw = "xai_" + raw

    short_name = raw.split("/")[-1]

    if short_name in CORE_LIBS:
        raise RuntimeError(f"'{short_name}' is a core library and cannot be uninstalled.")

    lib_path = Path(build_component_library_path(short_name))

    if not lib_path.exists():
        print(f"Library '{short_name}' not found.")
        return

    try:
        updated = remove_from_pyproject_toml(lib_path.as_posix(), name_hint=short_name)
        if updated:
            print(f"✅ Updated pyproject.toml for '{short_name}'.")
        else:
            print(f"⚠️  No matching TOML entries found for '{short_name}'.")
    except Exception as e:
        print(f"⚠️  Warning: Failed to update pyproject.toml for '{short_name}': {e}")

    # Remove files on disk
    try:
        shutil.rmtree(lib_path)
        print(f"Library '{short_name}' uninstalled.")
    except Exception as e:
        print(f"Failed to uninstall '{short_name}': {e}")
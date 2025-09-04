import shutil
from pathlib import Path

from ..utils.file_utils import is_valid_url, is_empty
from ..utils.requirements_utils import read_requirements_for_library
from ..utils.git_toml_manager import (
    set_library_extra,
    rebuild_meta_extra,
    remove_library_extra,
    record_component_metadata,
    remove_component_metadata,
    get_git_metadata,
    remove_git_directory,
    regenerate_lock_file
)
from ..utils.venv_ops import install_specs

from ..handlers.request_remote import request_remote_library
from ..handlers.request_folder import clone_from_github_url


CORE_LIBS = {"xai_events", "xai_template", "xai_controlflow", "xai_utils"}


def _as_components_path(query: str) -> str:
    """
    Normalize any user query to 'xai_components/xai_<name>' directory string.
    """
    q = (query or "").strip().lower().replace("-", "_")
    # If the user already passed a normalized path, keep it
    if q.startswith("xai_components/xai_"):
        return q
    if not q.startswith("xai_"):
        q = "xai_" + q
    result = "xai_components/" + q
    return result

def get_component_library_path(library_name: str) -> str:
    """
    If a URL is provided, clone to xai_components/xai_<name>.
    Otherwise normalize a library key like 'sklearn' -> 'xai_components/xai_sklearn'.
    """
    if is_valid_url(library_name):
        path = clone_from_github_url(library_name)
        return path
    path = _as_components_path(library_name)
    return path

def _extra_name_for_path(components_path: str) -> str:
    """
    For 'xai_components/xai_sklearn' -> 'xai-sklearn'
    """
    tail = Path(components_path).name  # xai_sklearn
    return "xai-" + tail.replace("xai_", "").replace("_", "-")


def fetch_library(library_name: str) -> str:
    """
    FETCH-ONLY:
      - ensure the library files exist under xai_components/xai_<name>
      - clone from remote manifest if directory is missing or empty
      - strip embedded .git folder (vendored)
      - DOES NOT touch project's pyproject.toml
      - return a status message
    """
    print(f"Fetching {library_name}...")
    comp_path = get_component_library_path(library_name)

    # If directory is missing or empty, clone using remote manifest
    if not Path(comp_path).is_dir() or is_empty(comp_path):
        success, message = request_remote_library(comp_path)
        if not success:
            msg = "component library remote not found"
            print(msg)
            return msg

        remove_git_directory(comp_path)
        msg = f"{library_name} library fetched and stored in {comp_path}."
        print(msg)
        return msg
    else:
        msg = f"{library_name} library already exists in {comp_path}."
        print(msg)
        return msg


def install_library(library_name: str) -> str:
    """
    INSTALL (fetch + pyproject writes, no environment install):
      - fetch/clone if needed (same as fetch_library)
      - read the vendored library dependencies
      - write/replace per-library extra [project.optional-dependencies].xai-<lib>
      - rebuild meta extra [project.optional-dependencies].xai-components
      - record [tool.xircuits.components.xai-<lib>] with path + source + tag/rev
      - return a status message

    Users then install packages with:  uv sync --extra xai-components
    """
    print(f"Installing {library_name}...")
    comp_path = get_component_library_path(library_name)

    # Track whether we just cloned (vendoring flow) to know when to strip .git
    did_clone = False

    # If directory is missing or empty, clone using remote manifest
    if not Path(comp_path).is_dir() or is_empty(comp_path):
        success, message = request_remote_library(comp_path)
        if not success:
            msg = "component library remote not found"
            print(msg)
            return msg
        did_clone = True

    # Try to collect repo metadata
    repo_url, ref, is_tag = get_git_metadata(comp_path)

    reqs = read_requirements_for_library(Path(comp_path))
    extra_name = _extra_name_for_path(comp_path)
    set_library_extra(extra_name, reqs)
    rebuild_meta_extra("xai-components")

    # Record metadata (source + exact tag or commit)
    record_component_metadata(
        extra_name,
        comp_path,
        repo_url=repo_url,
        ref=ref,
        is_tag=is_tag,
    )

    # For vendored installs from manifest, strip .git after we captured metadata
    if did_clone:
        remove_git_directory(comp_path)

    # Install the Python dependencies
    try:
        if reqs:
            print(f"Installing Python dependencies for {library_name}...")
            # chooses 'uv pip install' inside a uv venv, otherwise 'pip install'
            install_specs(reqs)
            print(f"✓ Dependencies for {library_name} installed.")
        else:
            print(f"No requirements.txt entries for {library_name}; nothing to install.")
    except Exception as e:
        # Do not fail the whole flow—metadata and extras are already written.
        print(f"Warning: installing dependencies for {library_name} failed:{e}".rstrip())

    regenerate_lock_file()

    print(f"Library {library_name} ready to use.")
    return f"Library {library_name} installation completed."


def uninstall_library(library_name: str) -> str:
    """
    Remove the vendored directory, remove its extra and metadata, and rebuild the meta extra.
    """
    raw = (library_name or "").strip().lower()
    if not raw.startswith("xai_"):
        raw = "xai_" + raw
    short = raw.split("/")[-1]

    if short in CORE_LIBS:
        raise RuntimeError(f"'{short}' is a core library and cannot be uninstalled.")

    lib_path = Path(_as_components_path(short))
    if not lib_path.exists():
        print("Library not found.")
        return f"Library '{short}' not found."

    # Remove files
    try:
        shutil.rmtree(lib_path)
        print(f"Library '{short}' uninstalled.")
    except Exception as e:
        return f"Failed to remove '{short}': {e}"

    # Remove metadata + extra, then rebuild meta extra
    try:
        remove_component_metadata(str(lib_path))
        extra_name = _extra_name_for_path(str(lib_path))
        remove_library_extra(extra_name)

        rebuild_meta_extra("xai-components")
        regenerate_lock_file()

    except Exception as e:
        print(f"Warning updating pyproject.toml for '{short}': {e}")

    return f"Library '{short}' uninstalled."
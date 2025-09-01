import os
import shutil
from pathlib import Path
from typing import Optional

from ..utils.file_utils import is_valid_url, is_empty
from ..utils.requirements_utils import read_requirements_for_library
from ..utils.git_toml_manager import (
    set_library_extra,
    rebuild_meta_extra,
    record_component_metadata,
    remove_component_metadata,
    remove_git_directory,
)
from ..handlers.request_remote import request_remote_library
from ..handlers.request_folder import clone_from_github_url


CORE_LIBS = {"xai_events", "xai_template", "xai_controlflow", "xai_utils"}


def _as_components_path(query: str) -> str:
    """
    Normalize any user query to 'xai_components/xai_<name>' directory string.
    """
    q = (query or "").strip().lower().replace("-", "_")
    if not q.startswith("xai_"):
        q = "xai_" + q
    return "xai_components/" + q


def get_component_library_path(library_name: str) -> str:
    """
    If a URL is provided, clone to xai_components/xai_<name>.
    Otherwise normalize a library key like 'sklearn' -> 'xai_components/xai_sklearn'.
    """
    if is_valid_url(library_name):
        return clone_from_github_url(library_name)
    return _as_components_path(library_name)


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
      - DO NOT touch pyproject.toml
      - return a status message
    """
    comp_path = get_component_library_path(library_name)

    # If directory is missing or empty, clone using remote manifest
    if not Path(comp_path).is_dir() or is_empty(comp_path):
        success, message = request_remote_library(comp_path)
        if not success:
            return f"Failed to fetch '{library_name}': {message}"
        remove_git_directory(comp_path)
        return f"Fetched '{library_name}' into {comp_path}."
    else:
        return f"'{library_name}' already present at {comp_path}."


def install_library(library_name: str) -> str:
    """
    INSTALL (fetch + pyproject writes, no environment install):
      - fetch/clone if needed (same as fetch_library)
      - read the vendored library dependencies
      - write/replace per-library extra [project.optional-dependencies].xai-<lib>
      - rebuild meta extra [project.optional-dependencies].xai-components
      - record [tool.xircuits.components.xai-<lib>] with path (no source/rev tracked here)
      - return a status message

    Users then install packages with:  uv sync --extra xai-components
    """
    # Ensure files exist (fetch-only behavior)
    fetch_msg = fetch_library(library_name)

    comp_path = get_component_library_path(library_name)
    reqs = read_requirements_for_library(Path(comp_path))

    extra_name = _extra_name_for_path(comp_path)
    set_library_extra(extra_name, reqs)
    rebuild_meta_extra("xai-components")

    # Minimal metadata entry (no tag/rev tracking in this simplified flow)
    record_component_metadata(extra_name, comp_path, repo_url=None, ref=None, is_tag=False)

    return (
        f"{fetch_msg} "
        f"Updated pyproject: extra '{extra_name}' ({len(reqs)} deps) and rebuilt 'xai-components'."
    )


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
        return f"Library '{short}' not found."

    # Remove files
    try:
        shutil.rmtree(lib_path)
        removed_dir_msg = f"✓ Removed directory {lib_path}."
    except Exception as e:
        removed_dir_msg = f"Failed to remove '{short}': {e}"

    # Remove metadata + extra, then rebuild meta extra
    try:
        remove_component_metadata(str(lib_path))
        set_library_extra(_extra_name_for_path(str(lib_path)), [])  # clear the per-library extra
        rebuild_meta_extra("xai-components")
        toml_msg = "✓ Updated pyproject.toml."
    except Exception as e:
        toml_msg = f"Warning updating pyproject.toml for '{short}': {e}"

    return f"{removed_dir_msg} {toml_msg}"

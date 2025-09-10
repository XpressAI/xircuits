from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

def is_working_dir(directory: Path) -> bool:
    """
    A Xircuits 'working directory' is any directory that contains `xai_components/`.
    """
    directory = Path(directory).expanduser().resolve()
    return (directory / "xai_components").exists()


def resolve_working_dir(start: Optional[Path] = None) -> Optional[Path]:
    """
    Walk upward from `start` (or CWD) to find the first directory that contains `xai_components/`.
    Returns the Path or None if not found. Does NOT chdir.
    """
    current = Path(start or os.getcwd()).expanduser().resolve()
    while True:
        if is_working_dir(current):
            return current
        if current.parent == current:
            return None
        current = current.parent


def require_working_dir(start: Optional[Path] = None) -> Path:
    """
    Like resolve_working_dir() but raises if not found. Does NOT chdir.
    """
    found = resolve_working_dir(start)
    if found is None:
        raise RuntimeError(
            "Xircuits working directory not found. "
            "Run 'xircuits init' or set XIRCUITS_INIT, then retry."
        )
    return found


def components_base_dir(working_dir: Path) -> Path:
    """
    Compute the absolute path to the components base directory, honoring
    XIRCUITS_COMPONENTS_DIR if set. Does NOT create directories.
    """
    env_override = os.environ.get("XIRCUITS_COMPONENTS_DIR")
    if env_override:
        return Path(env_override).expanduser().resolve()
    return (Path(working_dir).expanduser().resolve() / "xai_components").resolve()


def normalize_library_slug(value: str) -> str:
    """
    Normalize library identifiers:
      - accepts 'gradio', 'xai_gradio', 'xai-gradio', 'xai_components/xai_gradio'
      - returns canonical slug 'xai_gradio'
    """
    raw = (value or "").strip().lower().replace("\\", "/").rstrip("/")
    segment = raw.split("/")[-1]  # last path segment only
    if segment.startswith("xai_"):
        segment = segment[4:]
    elif segment.startswith("xai-"):
        segment = segment[4:]
    segment = segment.replace("-", "_")
    if not segment:
        raise ValueError(f"Empty library name from input: {value!r}")
    return f"xai_{segment}"


def library_dir(working_dir: Path, slug_or_name: str) -> Path:
    """
    Absolute path to the library directory under the components base dir.
    """
    slug = normalize_library_slug(slug_or_name)
    return components_base_dir(working_dir) / slug


def manifest_dir(working_dir: Path) -> Path:
    """
    Absolute path to '.xircuits/remote_lib_manifest'.
    """
    return (Path(working_dir).expanduser().resolve() / ".xircuits" / "remote_lib_manifest").resolve()


def manifest_path(working_dir: Path) -> Path:
    """
    Absolute path to '.xircuits/remote_lib_manifest/index.json'.
    """
    return manifest_dir(working_dir) / "index.json"


def to_posix(path: Path, base: Optional[Path] = None) -> str:
    """
    Convert a Path to a POSIX-style string (optionally relative to `base`).
    Useful when writing to TOML/JSON that expects forward slashes.
    """
    p = Path(path)
    if base:
        try:
            p = p.resolve().relative_to(Path(base).resolve())
        except ValueError:
            p = p.resolve()
    return p.as_posix()

def get_library_relpath(query: str, base: Optional[Path] = None) -> str:
    """
    Convert a user query like 'gradio' / 'xai_gradio' / 'xai-components/xai_gradio'
    into the canonical POSIX-style relative path under the Xircuits working dir,
    e.g. 'xai_components/xai_gradio'.

    - Pure normalization/formatting (no filesystem I/O)
    - Respects XIRCUITS_COMPONENTS_DIR via library_dir()
    - If `base` is None, uses the detected working directory
    """
    working_dir = base or require_working_dir()
    absolute_dir = library_dir(working_dir, query)  # uses normalize_library_slug() internally
    return to_posix(absolute_dir, base=working_dir)

def resolve_manifest_entry_path(entry_path: str, working_dir: Path) -> Path:
    """
    A manifest 'path' field may be relative (e.g., 'xai_components/xai_gradio').
    Resolve it to an absolute filesystem path rooted at `working_dir`.
    """
    p = Path(entry_path)
    return p if p.is_absolute() else (Path(working_dir) / p).resolve()

def resolve_library_dir(library_name: str, start: Optional[Path] = None) -> Path:
    """
    Find the working dir and return the absolute path
    to the given component library under the components base directory.
    """
    wd = require_working_dir(start)
    return library_dir(wd, library_name)

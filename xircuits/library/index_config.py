from __future__ import annotations
import json
import os
from pathlib import Path
from typing import Any, Dict
from urllib.parse import urlparse, urlunparse
from urllib.request import urlopen, Request

from xircuits.utils.file_utils import is_empty
from xircuits.handlers.config import get_config

MANIFEST_DIR = Path(".xircuits") / "remote_lib_manifest"
INDEX_PATH = MANIFEST_DIR / "index.json"

def _to_raw_url(url: str) -> str:
    """
    If the URL is a GitHub 'blob' page, convert it to a raw URL.
    Otherwise, return it unchanged.
    """
    parsed = urlparse(url)
    if parsed.netloc.lower() == "github.com" and "/blob/" in parsed.path:
        raw_path = parsed.path.replace("/blob/", "/")
        parsed = parsed._replace(
            netloc="raw.githubusercontent.com",
            path=raw_path,
            query="",
        )
        return urlunparse(parsed)
    return url

def _read_index() -> Dict[str, Any]:
    if not INDEX_PATH.exists():
        raise FileNotFoundError(f"index.json not found at {INDEX_PATH}")
    with INDEX_PATH.open("r", encoding="utf-8") as fh:
        index_data = json.load(fh)
    libraries = index_data.get("libraries")
    if not isinstance(index_data, dict) or not isinstance(libraries, list):
        raise ValueError("index.json must contain an object with 'libraries': [...]")
    return index_data

def _has_init_py(dir_path: Path) -> bool:
    return (dir_path / "__init__.py").exists()

def _compute_status(library_entry: Dict[str, Any]) -> str:
    """
    Local-only status:
      - 'installed' if local_path exists, non-empty, and has __init__.py
      - otherwise 'remote'
    """
    library_local_path = library_entry.get("local_path") or library_entry.get("path")
    if not library_local_path:
        return "remote"

    absolute_local_path = (
        Path(library_local_path)
        if Path(library_local_path).is_absolute()
        else Path.cwd() / library_local_path
    )

    if (
        absolute_local_path.exists()
        and absolute_local_path.is_dir()
        and not is_empty(str(absolute_local_path))
        and _has_init_py(absolute_local_path)
    ):
        return "installed"
    return "remote"

def get_component_library_config() -> Dict[str, Any]:
    index_doc = _read_index()
    resolved_libraries = []
    for library_entry in index_doc["libraries"]:
        entry_with_status = dict(library_entry)
        entry_with_status["status"] = _compute_status(library_entry)
        resolved_libraries.append(entry_with_status)
    return {"libraries": resolved_libraries}

def refresh_index() -> Dict[str, Any]:
    """
    Download index.json to .xircuits/remote_lib_manifest/index.json.

    Source URL precedence:
      1) env XIRCUITS_INDEX_URL
      2) config.ini [DEV].INDEX_URL
    """
    MANIFEST_DIR.mkdir(parents=True, exist_ok=True)

    source_url = os.environ.get("XIRCUITS_INDEX_URL")
    if not source_url:
        cfg = get_config()
        source_url = cfg.get("DEV", "INDEX_URL", fallback=None)
    if not source_url:
        raise RuntimeError(
            "No INDEX_URL configured. Set env XIRCUITS_INDEX_URL or [DEV].INDEX_URL in config.ini"
        )

    raw_url = _to_raw_url(source_url)

    request = Request(raw_url, headers={"User-Agent": "xircuits-index-fetcher"})
    with urlopen(request) as response:
        INDEX_PATH.write_bytes(response.read())

    return get_component_library_config()

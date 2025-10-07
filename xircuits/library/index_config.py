import json
import os
from pathlib import Path
from typing import Any, Dict, List
from urllib.parse import urlparse, urlunparse
from urllib.request import urlopen, Request

from xircuits.utils.file_utils import is_empty
from xircuits.handlers.config import get_config

MANIFEST_DIR = Path(".xircuits") / "remote_lib_manifest"
INDEX_PATH = MANIFEST_DIR / "index.json"

try:
    import tomllib  # Python 3.11+
except Exception:
    tomllib = None


def _to_raw_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.netloc.lower() == "github.com" and "/blob/" in parsed.path:
        raw_path = parsed.path.replace("/blob/", "/")
        parsed = parsed._replace(netloc="raw.githubusercontent.com", path=raw_path, query="")
        return urlunparse(parsed)
    return url


def _read_index_list() -> List[Dict[str, Any]]:
    if not INDEX_PATH.exists():
        raise FileNotFoundError("index.json not found at %s" % INDEX_PATH)
    with INDEX_PATH.open("r", encoding="utf-8") as fh:
        parsed = json.load(fh)
    if not isinstance(parsed, list):
        raise ValueError("index.json must be a top-level JSON array of library entries.")
    for i, entry in enumerate(parsed):
        if not isinstance(entry, dict):
            raise ValueError("index.json entry at index %d is not an object." % i)
    return parsed


def _has_init_py(directory_path: Path) -> bool:
    return (directory_path / "__init__.py").exists()


def _compute_status(library_entry: Dict[str, Any]) -> str:
    """
    Local-only status:
      - 'installed' if local path exists, non-empty, and has __init__.py
      - otherwise 'remote'
    """
    local_path_field = library_entry.get("local_path") or library_entry.get("path")
    if not local_path_field:
        return "remote"

    absolute_local_path = (
        Path(local_path_field) if Path(local_path_field).is_absolute()
        else Path.cwd() / local_path_field
    )

    if (
        absolute_local_path.exists()
        and absolute_local_path.is_dir()
        and not is_empty(str(absolute_local_path))
        and _has_init_py(absolute_local_path)
    ):
        return "installed"
    return "remote"


def _library_id_from_dir_name(directory_name: str) -> str:
    # xai_components/xai_<name> -> <NAME> (uppercased)
    base = directory_name.replace("xai_", "").replace("xai-", "")
    return base.upper()


def _read_local_requirements_for_dir(library_dir: Path) -> List[str]:
    """
    Try to read project dependencies for a local library, preferring pyproject.toml
    (if tomllib is available), falling back to requirements.txt. If neither exists,
    return [].
    """
    pyproject_path = library_dir / "pyproject.toml"
    if tomllib and pyproject_path.exists():
        try:
            with pyproject_path.open("rb") as fh:
                data = tomllib.load(fh)
            project_table = data.get("project", {}) if isinstance(data, dict) else {}
            dependencies = project_table.get("dependencies", [])
            if isinstance(dependencies, list):
                return [str(item).strip() for item in dependencies if str(item).strip()]
        except Exception:
            pass  # Fall through to requirements.txt

    requirements_path = library_dir / "requirements.txt"
    if requirements_path.exists():
        try:
            lines = []
            for line in requirements_path.read_text(encoding="utf-8").splitlines():
                text = line.strip()
                if text and not text.startswith("#"):
                    lines.append(text)
            return lines
        except Exception:
            return []

    return []


def _scan_local_xai_components(base_directory: Path = Path("xai_components")) -> Dict[str, Dict[str, Any]]:
    """
    Discover local libraries under xai_components/xai_* and return a dict keyed by library_id.
    Each entry is a minimal manifest stub that we can merge with the remote index.
    """
    discovered: Dict[str, Dict[str, Any]] = {}
    if not base_directory.exists() or not base_directory.is_dir():
        return discovered

    for lib_candidate in sorted(base_directory.iterdir()):
        if not lib_candidate.is_dir():
            continue
        if not lib_candidate.name.startswith("xai_"):
            continue

        library_id = _library_id_from_dir_name(lib_candidate.name)
        relative_path = Path("xai_components") / lib_candidate.name

        requirements_list = _read_local_requirements_for_dir(lib_candidate)

        discovered[library_id] = {
            "library_id": library_id,
            "name": lib_candidate.name,
            "path": str(relative_path).replace("\\", "/"),
            "requirements": requirements_list,
        }

    return discovered


def get_component_library_config() -> Dict[str, Any]:
    """
    Single source for the frontend/handlers:
      - Start from the remote index.json array (strict format).
      - Merge in any local libraries found under xai_components/xai_* that are missing from the index.
      - Compute 'status' for every entry based on the filesystem.
    """
    index_entries = _read_index_list()

    # Build a map by library_id from index.json
    by_id: Dict[str, Dict[str, Any]] = {}
    for entry in index_entries:
        library_identifier = entry.get("library_id")
        if not isinstance(library_identifier, str) or not library_identifier.strip():
            continue
        key = library_identifier.strip().upper()
        by_id[key] = dict(entry)  # shallow copy

    # Discover local-only libraries and merge if missing from index
    local_discovered = _scan_local_xai_components()
    for library_identifier, local_entry in local_discovered.items():
        if library_identifier not in by_id:
            by_id[library_identifier] = local_entry

    # Finalize array and compute status
    resolved_libraries: List[Dict[str, Any]] = []
    for entry in by_id.values():
        entry_with_status = dict(entry)
        entry_with_status["status"] = _compute_status(entry_with_status)
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
        config = get_config()
        source_url = config.get("DEV", "INDEX_URL", fallback=None)
    if not source_url:
        raise RuntimeError(
            "No INDEX_URL configured. Set env XIRCUITS_INDEX_URL or [DEV].INDEX_URL in config.ini"
        )

    raw_url = _to_raw_url(source_url)
    print("Fetching index.json from: %s" % raw_url)

    request = Request(raw_url, headers={"User-Agent": "xircuits-index-fetcher"})
    with urlopen(request) as response:
        INDEX_PATH.write_bytes(response.read())

    return get_component_library_config()

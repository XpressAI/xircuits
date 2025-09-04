import os
import shutil
import sys
import subprocess
from pathlib import Path
from importlib import metadata
import tomlkit

def is_uv_venv():
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

def has_pip_module():
    try:
        __import__("pip")
        return True
    except Exception:
        return False

def _has_uv() -> bool:
    return shutil.which("uv") is not None

def get_installer_cmd():
    """
      - If in a uv venv and uv is on PATH -> use 'uv pip install'
      - Else -> use 'python -m pip install'
    """
    if is_uv_venv() and _has_uv():
        return ["uv", "pip", "install"]
    # Assume pip is available; if not, this will raise at runtime
    return [sys.executable, "-m", "pip", "install"]


def install_specs(requirement_specs):
    if not requirement_specs:
        return
    cmd = get_installer_cmd() + list(requirement_specs)
    subprocess.run(cmd, check=True)

def install_requirements_file(req_file):
    cmd = get_installer_cmd() + ["-r", req_file]
    subprocess.run(cmd, check=True)

def list_installed_package_names_lower():
    names = set()
    for dist in metadata.distributions():
        try:
            name = (dist.metadata.get("Name") or "").strip()
            if name:
                names.add(name.lower())
        except Exception:
            continue
    return names

def _read_xai_components_specs(pyproject_path: str = "pyproject.toml") -> list[str]:
    """
    Read project.optional-dependencies['xai-components'] from pyproject.toml.
    Returns a flat list of requirement strings (possibly including direct URLs).
    """
    path = Path(pyproject_path)
    if not path.exists():
        return []
    doc = tomlkit.parse(path.read_text(encoding="utf-8"))
    try:
        extras_tbl = doc["project"]["optional-dependencies"]
        specs = extras_tbl.get("xai-components")
        if specs is None:
            return []
        # tomlkit arrays are iterable; normalize to trimmed strings
        return [str(item).strip() for item in list(specs) if str(item).strip()]
    except Exception:
        return []

def sync_xai_components(pyproject_path: str = "pyproject.toml") -> None:
    """
    Wrapper for syncing dependencies for all Xircuits components:
      - Prefer 'uv sync --active --extra xai-components' if uv is available
        (installs into the currently active virtual environment).
      - Otherwise, parse pyproject.toml and 'pip install' each spec listed
        under [project.optional-dependencies].xai-components.
    """
    use_uv = (_has_uv() and is_uv_venv()) or bool(os.environ.get("XIRCUITS_USE_UV"))
    if use_uv:
        print("xircuits sync: using uv -> `uv sync --active --extra xai-components`")
        subprocess.run(["uv", "sync", "--active", "--extra", "xai-components"], check=True)
        return

    print("xircuits sync: uv not found; falling back to pip and pyproject.toml parsing.")
    specs = _read_xai_components_specs(pyproject_path)
    if not specs:
        print("xircuits sync: no [project.optional-dependencies].xai-components found. Nothing to install.")
        return

    print("xircuits sync: installing the following specs via pip:")
    for s in specs:
        print(f"  - {s}")
    subprocess.run([sys.executable, "-m", "pip", "install", *specs], check=True)
    print("xircuits sync: done.")

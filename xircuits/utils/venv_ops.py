import os
import shutil
import sys
import subprocess
from pathlib import Path
from importlib import metadata

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

def get_installer_cmd():
    # Prefer 'uv pip' in uv venvs if 'uv' is on PATH
    if is_uv_venv():
        uv_cmd = shutil.which("uv")
        if uv_cmd:
            return [uv_cmd, "pip", "install"]

    # Fallback: python -m pip (only if pip is importable)
    if has_pip_module():
        return [sys.executable, "-m", "pip", "install"]

    # Last resort: try to bootstrap pip, then use it
    try:
        subprocess.run([sys.executable, "-m", "ensurepip", "--upgrade"], check=True)
        return [sys.executable, "-m", "pip", "install"]
    except Exception:
        raise RuntimeError(
            "No installer found. In a uv environment, ensure 'uv' is on PATH. "
            "Otherwise install pip (or run 'python -m ensurepip')."
        )

def install_specs(requirement_specs):
    if not requirement_specs:
        return
    cmd = get_installer_cmd() + requirement_specs
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

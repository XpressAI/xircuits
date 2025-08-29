import sys
import subprocess
from pathlib import Path

from .index_config import get_component_library_config
from ..utils.venv_ops import list_installed_package_names_lower

def _library_id(library_entry):
    library_identifier = library_entry.get("library_id")
    if isinstance(library_identifier, str) and library_identifier.strip():
        return library_identifier.strip()
    return "<unknown-id>"


def _filesystem_path(library_entry):
    # Primary field is "path" in index.json; accept "local_path" for legacy entries.
    raw_path = library_entry.get("path") or library_entry.get("local_path")
    if not raw_path:
        return None
    path_obj = Path(raw_path)
    return path_obj if path_obj.is_absolute() else (Path.cwd() / path_obj)


def _has_init_py(directory_path):
    return bool(directory_path and (directory_path / "__init__.py").exists())

def _installed_package_names_lower():
    return list_installed_package_names_lower()

def _installed_package_names_lower():
    """
    Return lowercased package names currently installed (ignores versions and sources).
    """
    output = subprocess.check_output([sys.executable, "-m", "pip", "freeze"])
    names_lower = set()
    for line in output.decode().splitlines():
        text = line.strip()
        if not text or text.startswith("#"):
            continue
        # handle 'pkg==x.y', 'pkg @ git+...', editable installs, etc.
        head = text.split(" ", 1)[0]       # drop ' @ ...'
        head = head.split("==", 1)[0]      # drop version pin
        names_lower.add(head.lower())
    return names_lower


def _requirement_names_lower(requirement_specifications):
    """
    Extract lowercased requirement names from requirement spec strings.
    This intentionally ignores extras, markers, and version operators.
    """
    names_lower = set()
    for specification in requirement_specifications or []:
        if not isinstance(specification, str):
            continue
        text = specification.strip()
        if not text:
            continue
        # drop environment markers: 'pkg; python_version<"3.12"'
        text = text.split(";", 1)[0]
        # drop extras: 'pkg[extra]'
        text = text.split("[", 1)[0]
        # drop version operators
        for operator in ("==", ">=", "<=", "~=", "!=", ">", "<", "==="):
            if operator in text:
                text = text.split(operator, 1)[0]
                break
        name = text.strip().lower()
        if name:
            names_lower.add(name)
    return names_lower


def list_component_library():
    configuration = get_component_library_config()
    library_entries = configuration.get("libraries", [])

    print("Checking installed packages... This might take a moment.")
    installed_packages_lower = _installed_package_names_lower()

    installed_ids = []
    incomplete_ids = []
    remote_ids = []

    for library_entry in library_entries:
        library_identifier = _library_id(library_entry)
        local_path = _filesystem_path(library_entry)
        local_exists = bool(local_path and local_path.exists() and local_path.is_dir())

        requirement_specifications = library_entry.get("requirements") or []
        required_names_lower = _requirement_names_lower(requirement_specifications)
        all_requirements_present = required_names_lower.issubset(installed_packages_lower)

        has_init_file = _has_init_py(local_path)

        if local_exists and not all_requirements_present:
            # Per your instruction: "for incomplete, just check the packages"
            incomplete_ids.append(library_identifier)
        elif local_exists and all_requirements_present and has_init_file:
            installed_ids.append(library_identifier)
        else:
            remote_ids.append(library_identifier)

    total_installed = len(installed_ids) + len(incomplete_ids)
    print(f"\nInstalled component libraries({total_installed}):")
    for library_identifier in sorted(installed_ids, key=str.lower):
        print(f" - {library_identifier}")
    for library_identifier in sorted(incomplete_ids, key=str.lower):
        print(f" - {library_identifier} [*]")

    if incomplete_ids:
        print("\n[*] indicates an incomplete installation (missing Python dependencies).")

    if remote_ids:
        print(f"\nRemote component libraries({len(remote_ids)}):")
        for library_identifier in sorted(remote_ids, key=str.lower):
            print(f" - {library_identifier}")
        print("\nYou can install libraries using 'xircuits install <LIBRARY_ID>'.\n")


if __name__ == "__main__":
    list_component_library()

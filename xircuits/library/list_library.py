import os
import sys
import json
import subprocess
from pathlib import Path

def get_installed_packages():
    """Return a set of installed packages."""
    result = subprocess.check_output([sys.executable, "-m", "pip", "freeze"])
    packages = {package.split('==')[0] for package in result.decode().splitlines()}
    return packages

def check_requirements_installed(installed_packages, requirements):
    """Check if all required packages are installed."""
    required_packages = {pkg.strip() for pkg in requirements}
    missing_packages = required_packages - installed_packages
    return len(missing_packages) == 0, missing_packages

def list_component_library():
    config_path = Path(".xircuits/component_library_config.json")
    if not config_path.exists():
        print("Component library config file not found.")
        return

    with open(config_path, 'r') as file:
        config = json.load(file)
    libraries = config.get("libraries", [])

    print("Checking installed packages... This might take a moment.")
    installed_packages = get_installed_packages()

    fully_installed = []
    incomplete_installation = []

    for lib in libraries:
        lib_name = lib["name"]
        status = lib["status"]
        requirements = lib.get("requirements", [])
        
        if status != "remote":
            is_fully_installed, missing_packages = check_requirements_installed(installed_packages, requirements)
            if is_fully_installed:
                fully_installed.append(lib_name)
            else:
                # Append a star to libraries with incomplete installations
                incomplete_installation.append(f"{lib_name} [*]")

    total_installed = len(fully_installed) + len(incomplete_installation)
    print(f"\nInstalled component libraries({total_installed}):")
    for lib in sorted(fully_installed):
        print(f" - {lib}")
    for lib in sorted(incomplete_installation):
        print(f" - {lib}")

    if incomplete_installation:
        print("\n[*] indicates an incomplete installation.")

    # Handle remote libraries separately
    remote = [lib["name"] for lib in libraries if lib["status"] == "remote"]
    if remote:
        print(f"\nRemote component libraries({len(remote)}):")
        for lib in sorted(remote):
            print(f" - {lib}")
        print("\nYou can install remote libraries using 'xircuits install <libName>'.\n\n")

if __name__ == "__main__":
    list_component_library()

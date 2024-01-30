import os
import sys
from pathlib import Path
import subprocess
from ..utils import copy_from_installed_wheel, is_empty

def get_installed_packages():
    """Return a list of installed packages."""
    result = subprocess.check_output([sys.executable, "-m", "pip", "freeze"])
    packages = {package.split('==')[0] for package in result.decode().splitlines()}
    return packages

def check_requirements_installed(installed_packages, requirements_path):
    """Check if all packages in a requirements file are installed using a given list of installed packages."""
    with open(requirements_path, 'r') as file:
        required_packages = {line.strip().split('==')[0] for line in file.readlines()}
    return required_packages.issubset(installed_packages)

def list_component_library():
    component_library_path = Path(os.getcwd()) / "xai_components"
    if not component_library_path.exists():
        copy_from_installed_wheel('xai_components', '', 'xai_components')

    print("Checking installed packages... This might take a moment.")
    installed_packages = get_installed_packages()

    # Fetch libraries from .gitmodules
    gitmodules_path = Path(".gitmodules") if Path(".gitmodules").exists() else Path(".xircuits/.gitmodules")
    submodule_paths = []
    
    if gitmodules_path.exists():
        with gitmodules_path.open() as f:
            lines = f.readlines()
            for line in lines:
                if "path = " in line:
                    submodule_paths.append(line.split("=")[-1].strip().split('/')[-1])
                    
    # Fetch libraries from xai_components/
    component_library_path = Path("xai_components")
    directories = [d.name for d in component_library_path.iterdir() if d.is_dir() and d.name.startswith("xai_")]
    non_empty_directories = [dir_name for dir_name in directories if not is_empty(component_library_path / dir_name)]

    installed_packages_dirs = []

    for dir_name in directories:
        requirements_path = component_library_path / dir_name / "requirements.txt"
        if requirements_path.exists() and check_requirements_installed(installed_packages, requirements_path):
            installed_packages_dirs.append(dir_name)

    # Crosscheck and categorize based on installed packages
    fully_installed = set(installed_packages_dirs)
    available = set(non_empty_directories) - fully_installed
    remote = [lib for lib in submodule_paths if lib not in fully_installed and lib not in available and is_empty(component_library_path / lib)]
    
    # Display
    print(f"\nFully installed component libraries({len(fully_installed)}):")
    for lib in sorted(fully_installed):
        print(f" - {lib}")

    print(f"\nAvailable component libraries({len(available)}):")
    for lib in sorted(available):
        print(f" - {lib}")

    print(f"\nRemote component libraries({len(remote)}):")
    for lib in sorted(remote):
        print(f" - {lib}")

import argparse
from pathlib import Path
import os
import pkg_resources
import shutil
from .handlers.request_folder import request_folder, clone_from_github_url
from .handlers.request_submodule import request_submodule_library
from .compiler import compile
import subprocess
import sys
import json
import urllib.parse

def init_xircuits():
    package_name = 'xircuits'
    copy_from_installed_wheel(package_name, resource='.xircuits', dest_path='.xircuits')

def build_component_library_path(component_library_query: str) -> str:
    # ensure syntax is as xai_components/xai_library_name

    if "xai" not in component_library_query:
        component_library_query = "xai_" + component_library_query

    if "xai_components" not in component_library_query:
        component_library_query = "xai_components/" + component_library_query

    return component_library_query

def is_empty(directory):
    # will return true for uninitialized submodules
    return not os.path.exists(directory) or not os.listdir(directory)

def is_valid_url(url):
    try:
        result = urllib.parse.urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False
    
def copy_from_installed_wheel(package_name, resource="", dest_path=None):
    if dest_path is None:
        dest_path = package_name

    resource_path = pkg_resources.resource_filename(package_name, resource)
    shutil.copytree(resource_path, dest_path)

def cmd_start_xircuits(args, extra_args=[]):
    # fetch xai_components
    component_library_path = Path(os.getcwd()) / "xai_components"
    if not component_library_path.exists():
        copy_from_installed_wheel('xai_components', '', 'xai_components')

    # handler for extra jupyterlab launch options
    if extra_args:
        try:
            launch_cmd = "jupyter lab" + " " + " ".join(extra_args)
            os.system(launch_cmd)
        except Exception as e:
            print("Error in launch args! Error log:\n")
            print(e)
    else:
        os.system("jupyter lab")

def cmd_download_examples(args, extra_args=[]):
    if not os.path.exists("examples") or is_empty("examples"):
        request_folder("examples", branch=args.branch)

    if not os.path.exists("datasets") or is_empty("datasets"):
        request_folder("datasets", branch=args.branch)

def cmd_fetch_library(args, extra_args=[]):
    print(f"Fetching {args.library_name}...")

    if is_valid_url(args.library_name):
        component_library_path = clone_from_github_url(args.library_name)
        return
    
    else:
        component_library_path = build_component_library_path(args.library_name)
        
    if not Path(component_library_path).is_dir() or is_empty(Path(component_library_path)):
        request_submodule_library(component_library_path)
    else:
        print(f"{args.library_name} library already exists in {component_library_path}.")


def cmd_install_library(args, extra_args=[]):
    print(f"Installing {args.library_name}...")
    
    if is_valid_url(args.library_name):
        component_library_path = clone_from_github_url(args.library_name)

    else:
        component_library_path = build_component_library_path(args.library_name)
    
    if not Path(component_library_path).is_dir() or is_empty(Path(component_library_path)):
        request_submodule_library(component_library_path)

    requirements_file = Path(component_library_path) / "requirements.txt"

    if requirements_file.exists():
        print(f"Installing requirements for {args.library_name}...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)], check=True)
    else:
        print(f"No requirements.txt found for {args.library_name}. Skipping installation of dependencies.")

def cmd_compile(args, extra_args=[]):
    component_paths = {}
    if args.python_paths_file:
        component_paths = json.load(args.python_paths_file)
    compile(args.source_file, args.out_file, component_python_paths=component_paths)

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

def cmd_list_libraries(args, extra_args=[]):
    
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


def main():
    parser = argparse.ArgumentParser(description='Xircuits Command Line Interface', add_help=False)
    subparsers = parser.add_subparsers(dest="command")

# Adding parser for 'start' command
    start_parser = subparsers.add_parser('start', help='Start Xircuits.')
    # Add an arbitrary list of arguments. The nargs="*" means 0 or more arguments.
    # This will collect all additional arguments into a list.
    start_parser.add_argument('extra_args', nargs='*', help='Additional arguments for Xircuits launch command')
    start_parser.set_defaults(func=cmd_start_xircuits)

    # Adding parser for 'install' command
    install_parser = subparsers.add_parser('install', help='Fetch and installs a library for Xircuits.')
    install_parser.add_argument('library_name', type=str, help='Name of the library to install')
    install_parser.set_defaults(func=cmd_install_library)

    # Adding parser for 'fetch' command
    fetch_parser = subparsers.add_parser('fetch-only', help='Fetch a library for Xircuits. Does not install.')
    fetch_parser.add_argument('library_name', type=str, help='Name of the library to fetch')
    fetch_parser.set_defaults(func=cmd_fetch_library)

    # Adding parser for 'examples' command
    examples_parser = subparsers.add_parser('examples', help='Download examples for Xircuits.')
    examples_parser.add_argument('--branch', nargs='?', default="master", help='pull files from a xircuits branch')
    examples_parser.set_defaults(func=cmd_download_examples)

    # Adding parser for 'compile' command
    compile_parser = subparsers.add_parser('compile', help='Compile a Xircuits workflow file.')
    compile_parser.add_argument('source_file', type=argparse.FileType('r', encoding='utf-8'))
    compile_parser.add_argument('out_file', type=argparse.FileType('w', encoding='utf-8'))
    compile_parser.add_argument("python_paths_file", nargs='?', default=None, type=argparse.FileType('r'),
                                help="JSON file with a mapping of component name to required python path. "
                                     "e.g. {'MyComponent': '/some/path'}")
    compile_parser.set_defaults(func=cmd_compile)

    # Adding parser for 'list' command
    list_parser = subparsers.add_parser('list', help='List available component libraries for Xircuits.')
    list_parser.set_defaults(func=cmd_list_libraries)


    args, unknown_args = parser.parse_known_args()

    if hasattr(args, 'func'):
        args.func(args, unknown_args)
    else:
        valid_help_args = {"-h", "--h" "-help", "--help"}
        if any(arg in unknown_args for arg in valid_help_args):
            parser.print_help()
        else:
            # Default behavior: if no sub-command is provided, start xircuits.
            cmd_start_xircuits(args, unknown_args)

    return 0

if __name__ == '__main__':
    main()

print(
'''
======================================
__   __  ___                _ _       
\ \  \ \/ (_)_ __ ___ _   _(_) |_ ___ 
 \ \  \  /| | '__/ __| | | | | __/ __|
 / /  /  \| | | | (__| |_| | | |_\__ \\
/_/  /_/\_\_|_|  \___|\__,_|_|\__|___/
                                      
======================================
'''
)

config_path = Path(os.getcwd()) / ".xircuits"
if not config_path.exists():
    init_xircuits()

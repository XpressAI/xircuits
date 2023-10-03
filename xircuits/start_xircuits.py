import argparse
from pathlib import Path
import os
import pkg_resources
import shutil
from .handlers.request_folder import request_folder
from .handlers.request_submodule import get_submodule_config, request_submodule_library
from .compiler import compile
import subprocess
import sys
import json

def init_xircuits():
    package_name = 'xircuits'
    copy_from_installed_wheel(package_name, resource='.xircuits', dest_path='.xircuits')

def copy_from_installed_wheel(package_name, resource="", dest_path=None):
    if dest_path is None:
        dest_path = package_name

    resource_path = pkg_resources.resource_filename(package_name, resource)
    shutil.copytree(resource_path, dest_path)

def cmd_start_xircuits(args, extra_args=[]):
    # fetch xai_components
    component_library_path = Path(os.getcwd()) / "xai_components"
    if not component_library_path.exists():
        val = input("Xircuits Component Library is not found. Would you like to load it in the current path (Y/N)? ")
        if val.lower() in ("y", "yes"):
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
    request_folder("examples", branch=args.branch)
    request_folder("datasets", branch=args.branch)

def cmd_fetch_library(args, extra_args=[]):
        request_submodule_library(args.library_name)

def cmd_install_library(args, extra_args=[]):
    print(f"Installing {args.library_name}...")
    request_submodule_library(args.library_name)
    submodule_path, _ = get_submodule_config(args.library_name)
    requirements_file = Path(submodule_path) / "requirements.txt"

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

def main():
    parser = argparse.ArgumentParser(description='Xircuits Command Line Interface', add_help=False)
    subparsers = parser.add_subparsers(dest="command")

# Adding parser for 'start' command
    start_parser = subparsers.add_parser('start', help='Start xircuits (jupyterlab).')
    # Add an arbitrary list of arguments. The nargs="*" means 0 or more arguments.
    # This will collect all additional arguments into a list.
    start_parser.add_argument('extra_args', nargs='*', help='Additional arguments for xircuits launch command')
    start_parser.set_defaults(func=cmd_start_xircuits)

    # Adding parser for 'install' command
    install_parser = subparsers.add_parser('install', help='Install a library for xircuits.')
    install_parser.add_argument('library_name', type=str, help='Name of the library to install')
    install_parser.set_defaults(func=cmd_install_library)

    # Adding parser for 'fetch' command
    fetch_parser = subparsers.add_parser('fetch', help='fetch a library for xircuits. Does not install.')
    fetch_parser.add_argument('library_name', type=str, help='Name of the library to fetch')
    fetch_parser.set_defaults(func=cmd_fetch_library)

    # Adding parser for 'examples' command
    examples_parser = subparsers.add_parser('examples', help='Download examples for xircuits.')
    examples_parser.add_argument('--branch', nargs='?', default="master", help='pull files from a xircuits branch')
    examples_parser.set_defaults(func=cmd_download_examples)

    # Adding parser for 'compile' command
    compile_parser = subparsers.add_parser('compile', help='Compile a Xircuits source file.')
    compile_parser.add_argument('source_file', type=argparse.FileType('r', encoding='utf-8'))
    compile_parser.add_argument('out_file', type=argparse.FileType('w', encoding='utf-8'))
    compile_parser.add_argument("python_paths_file", nargs='?', default=None, type=argparse.FileType('r'),
                                help="JSON file with a mapping of component name to required python path. "
                                     "e.g. {'MyComponent': '/some/path'}")
    compile_parser.set_defaults(func=cmd_compile)

    args, unknown_args = parser.parse_known_args()

    if hasattr(args, 'func'):
        args.func(args, unknown_args)
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

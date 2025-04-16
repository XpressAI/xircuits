import argparse
import json
import os
from pathlib import Path

from .utils import is_empty, copy_from_installed_wheel
from .library import list_component_library, install_library, fetch_library, save_component_library_config
from .compiler import compile, recursive_compile

def init_xircuits():
    """
    Initialize the Xircuits base directories in the current directory.
    """
    package_name = 'xircuits'
    copy_from_installed_wheel(package_name, resource='.xircuits', dest_path='.xircuits')
    component_library_path = Path(os.getcwd()) / "xai_components"
    if not component_library_path.exists():
        copy_from_installed_wheel('xai_components', '', 'xai_components')
    save_component_library_config()

def find_xircuits_working_dir():
    """
    Traverse upward from the current directory to find the first directory
    that contains 'xai_components'. That directory is considered the Xircuits working directory.
    """
    current_dir = Path(os.getcwd())
    while True:
        if (current_dir / "xai_components").exists():
            return current_dir
        if current_dir == current_dir.parent:  # Reached filesystem root.
            return None
        current_dir = current_dir.parent

def ensure_xircuits_initialized():
    """
    Define the working directory by the presence of xai_components.
    If the working directory is found but the .xircuits folder is missing, auto-initialize it there.
    If no working directory is found:
      - Auto-initialize if XIRCUITS_INIT is set.
      - Otherwise, prompt the user to initialize in the current directory.
    """
    working_dir = find_xircuits_working_dir()
    if working_dir is not None:
        # Found xai_components. Now check for .xircuits.
        if not (working_dir / ".xircuits").exists():
            # Switch to the working directory to initialize .xircuits there.
            os.chdir(working_dir)
            init_xircuits()
        return working_dir

    # If no working directory was found, handle initialization in the current directory.
    if os.environ.get("XIRCUITS_INIT"):
        init_xircuits()
        print("Xircuits initialized automatically (XIRCUITS_INIT set).")
        return Path(os.getcwd())
    else:
        answer = input("No xai_components folder found in any parent directories.\n"
                       "Would you like to initialize Xircuits in the current directory? (Y/n): ").strip().lower()
        if answer in ["y", "yes", ""]:
            init_xircuits()
            return Path(os.getcwd())
        else:
            print("Xircuits is not initialized. Please run 'xircuits init' to initialize manually.")
            return None

def cmd_init(args, extra_args=[]):
    init_xircuits()
    print("Xircuits has been initialized in the current directory.")

def cmd_start_xircuits(args, extra_args=[]):
    # Assume initialization has been ensured.
    component_library_path = Path(os.getcwd()) / "xai_components"
    if not component_library_path.exists():
        print("Error: 'xai_components' not found. Please initialize your directory using 'xircuits init'.")
        return

    news_url_option = '--LabApp.news_url="https://xpress.ai/blog/atom.xml"'
    # Handler for extra JupyterLab launch options.
    if extra_args:
        try:
            launch_cmd = "jupyter lab --ContentsManager.allow_hidden=True " + " ".join(extra_args) + " " + news_url_option
            os.system(launch_cmd)
        except Exception as e:
            print("Error in launch args! Error log:\n", e)
    else:
        os.system(f"jupyter lab --ContentsManager.allow_hidden=True {news_url_option}")

def cmd_download_examples(args, extra_args=[]):
    if not os.path.exists("examples") or is_empty("examples"):
        copy_from_installed_wheel('examples')
        print("Example workflows ready at working directory.")

def cmd_fetch_library(args, extra_args=[]):
    fetch_library(args.library_name)

def cmd_install_library(args, extra_args=[]):
    install_library(args.library_name.lower())

def cmd_compile(args, extra_args=[]):
    component_paths = {}
    if args.python_paths_file:
        component_paths = json.load(args.python_paths_file)
    
    if args.recursive:
        # Pass the user-specified out_file (if any) to recursive_compile
        recursive_compile(
            input_file_path=args.source_file,
            output_file_path=args.out_file,
            component_python_paths=component_paths
        )
    else:
        # Single file compilation
        if args.out_file:
            compile(args.source_file, args.out_file, component_python_paths=component_paths)
        else:
            output_filename = args.source_file.replace('.xircuits', '.py')
            compile(args.source_file, output_filename, component_python_paths=component_paths)

def cmd_list_libraries(args, extra_args=[]):
    list_component_library()

def cmd_run(args, extra_args=[]):
    original_cwd = args.original_cwd

    # Resolve the source file path if it's not absolute.
    source_file = Path(args.source_file)
    if not source_file.is_absolute():
        args.source_file = str((original_cwd / source_file).resolve())
    
    # Resolve the output file path if provided and not absolute.
    if getattr(args, "out_file", None):
        out_file = Path(args.out_file)
        if not out_file.is_absolute():
            args.out_file = str((original_cwd / out_file).resolve())
    
    if args.source_file.endswith('.py'):
        output_filename = args.source_file
    else:
        cmd_compile(args, extra_args)
        output_filename = args.out_file if args.out_file else args.source_file.replace('.xircuits', '.py')
    
    run_command = f"python {output_filename} {' '.join(extra_args)}"
    os.system(run_command)

def main():
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

    parser = argparse.ArgumentParser(description='Xircuits Command Line Interface', add_help=False)
    subparsers = parser.add_subparsers(dest="command")

    # 'init' command.
    init_parser = subparsers.add_parser('init', help='Initialize Xircuits in the current directory.')
    init_parser.set_defaults(func=cmd_init)

    # 'start' command.
    start_parser = subparsers.add_parser('start', help='Start Xircuits.')
    start_parser.add_argument('extra_args', nargs='*', help='Additional arguments for Xircuits launch command')
    start_parser.set_defaults(func=cmd_start_xircuits)

    # 'install' command.
    install_parser = subparsers.add_parser('install', help='Fetch and install a library for Xircuits.')
    install_parser.add_argument('library_name', type=str, help='Name of the library to install')
    install_parser.set_defaults(func=cmd_install_library)

    # 'fetch-only' command.
    fetch_parser = subparsers.add_parser('fetch-only', help='Fetch a library for Xircuits. Does not install.')
    fetch_parser.add_argument('library_name', type=str, help='Name of the library to fetch')
    fetch_parser.set_defaults(func=cmd_fetch_library)

    # 'examples' command.
    examples_parser = subparsers.add_parser('examples', help='Get example workflows for Xircuits.')
    examples_parser.add_argument('--branch', nargs='?', default="master", help='Load example workflows to current working directory')
    examples_parser.set_defaults(func=cmd_download_examples)

    # 'compile' command.
    compile_parser = subparsers.add_parser('compile', help='Compile a Xircuits workflow file.')
    compile_parser.add_argument('source_file', type=str, help='Source Xircuits file to compile.')
    compile_parser.add_argument('out_file', nargs='?', type=str, help='Output Python file.')
    compile_parser.add_argument("--python-paths-file", default=None, type=argparse.FileType('r'),
                                help="JSON file mapping component names to python paths. e.g. {'MyComponent': '/some/path'}")
    compile_parser.add_argument('--non-recursive', action='store_false', dest='recursive', default=True,
                                help='Do not recursively compile Xircuits workflow files.')
    compile_parser.set_defaults(func=cmd_compile)

    # 'list' command.
    list_parser = subparsers.add_parser('list', help='List available component libraries for Xircuits.')
    list_parser.set_defaults(func=cmd_list_libraries)

    # 'run' command.
    run_parser = subparsers.add_parser('run', help='Compile and run a Xircuits workflow file.')
    run_parser.add_argument('source_file', type=str, help='Source Xircuits file to compile and run (or a Python file to run directly).')
    run_parser.add_argument('out_file', nargs='?', type=str, help='Optional output Python file.')
    run_parser.add_argument("--python-paths-file", default=None, type=argparse.FileType('r'),
                            help="JSON file mapping component names to python paths. e.g. {'MyComponent': '/some/path'}")
    run_parser.add_argument('--non-recursive', action='store_false', dest='recursive', default=True,
                            help='Do not recursively compile Xircuits workflow files.')
    run_parser.set_defaults(func=cmd_run)

    args, unknown_args = parser.parse_known_args()

    # For the 'run' command, capture the original working directory before any directory changes.
    if args.command == "run":
        args.original_cwd = Path.cwd()

    # For any command other than 'init' and 'compile', switch to the xircuits working directory.
    if args.command not in ("init", "compile"):
        working_dir = ensure_xircuits_initialized()
        if working_dir:
            os.chdir(working_dir)
            print(f"Xircuits computing from: {working_dir}")

    if hasattr(args, 'func'):
        args.func(args, unknown_args)
    else:
        valid_help_args = {"-h", "--h", "-help", "--help"}
        if any(arg in unknown_args for arg in valid_help_args):
            parser.print_help()
        else:
            cmd_start_xircuits(args, unknown_args)

if __name__ == '__main__':
    main()

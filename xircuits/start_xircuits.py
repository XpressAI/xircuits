# coding: utf-8
"""A wrapper to start xircuits and offer to start to XAI-components"""

from pathlib import Path
from urllib import request
import os
import argparse

from .handlers.request_folder import request_folder
from .handlers.request_submodule import request_submodule_library

def init_xircuits():

    url = "https://raw.githubusercontent.com/XpressAI/xircuits/master/.xircuits/config.ini"
    path = ".xircuits"
    os.mkdir(path)
    request.urlretrieve(url, path+"/config.ini")


def download_examples():
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--branch', nargs='?', default="master", help='pull files from a xircuits branch')

    args = parser.parse_args()

    request_folder("examples", branch=args.branch)
    request_folder("datasets", branch=args.branch)


def download_component_library():

    parser = argparse.ArgumentParser()
    parser.add_argument('--branch', nargs='?', default="master", help='pull files from a xircuits branch')
    parser.add_argument('--sublib', nargs='*', help='pull component library from a xircuits submodule')

    args = parser.parse_args()
    if not args.sublib:
        request_folder("xai_components", branch=args.branch)
    else:
        for component_lib in args.sublib:
            request_submodule_library(component_lib)

def main():

    parser = argparse.ArgumentParser()
    parser.add_argument('--branch', nargs='?', default="master", help='pull files from a xircuits branch')

    parsed, extra_args = parser.parse_known_args()

    for arg in extra_args:
        if arg.startswith(("-", "--")):
            parser.add_argument(arg.split('=')[0])

    args = parser.parse_args()

    # fetch xai_components
    component_library_path = Path(os.getcwd()) / "xai_components"

    if not component_library_path.exists():
        val = input("Xircuits Component Library is not found. Would you like to load it in the current path (Y/N)? ")
        if val.lower() == ("y" or "yes"):
            request_folder("xai_components", branch=args.branch)

    # launch if extra arguments pro
    if extra_args:
        try:
            launch_cmd = "jupyter lab" + " " + " ".join(extra_args)
            os.system(launch_cmd)

        except Exception as e:
            print("Error in launch args! Error log:\n")
            print(e)
    
    else:
        os.system("jupyter lab")

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
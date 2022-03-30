# coding: utf-8
"""A wrapper to start xircuits and offer to start to XAI-components"""

from pathlib import Path
from urllib import request
import os
from .handlers.request_folder import request_folder

def init_xircuits():
    url = "https://raw.githubusercontent.com/XpressAI/xircuits/master/.xircuits/config.ini"
    path = ".xircuits"
    os.mkdir(path)
    request.urlretrieve(url, path+"/config.ini")

def start_xircuits():
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
    component_library_path = Path(os.getcwd()) / "xai_components"

    if not config_path.exists():
        init_xircuits()

    if not component_library_path.exists():
        val = input("Xircuits Component Library is not found. Would you like to load it in the current path (Y/N)? ")
        if val.lower() == ("y" or "yes"):
            request_folder("xai_components")
    
    os.system("jupyter lab")

def download_examples(argv=None):
    request_folder("examples")
    request_folder("Datasets")

def main(argv=None):
    start_xircuits()
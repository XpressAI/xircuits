
# coding: utf-8
"""A wrapper to start xircuits and offer to start to XAI-components"""

import sys
import shutil
import os
from pathlib import Path
from sys import platform

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
    
    # the current handler assumes that the user uses venv to install xircuits
    
    if platform == "win32":
        xai_component_path = Path(sys.executable).parents[1] / "Lib" / "site-packages" / "xai_components"
        config_path = Path(sys.executable).parents[1] / "Lib" / "site-packages" / "xai_components" / ".xircuits"
    
    else:  
        # the dir path for linux venv looks like : venv/lib/python3.9/site-packages/xircuits
        venv_python_version = os.listdir("venv/lib")[0]
        xai_component_path = Path(sys.executable).parents[1] / "lib" / venv_python_version / "site-packages" / "xai_components"
        config_path = Path(sys.executable).parents[1] / "lib" / venv_python_version / "site-packages" / "xai_components" / ".xircuits"
        
    current_path = Path(os.getcwd()) / "xai_components"
    current_config_path = Path(os.getcwd()) / ".xircuits"


    if not current_path.exists():
        val = input("Xircuits Component Library is not found. Would you like to load it in the current path (Y/N)? ")
        if val.lower() == ("y" or "yes"):
            shutil.copytree(xai_component_path, current_path, dirs_exist_ok=True)
            if not current_config_path.exists():
            	shutil.copytree(config_path, current_config_path, dirs_exist_ok=True)
        
    os.system("jupyter lab")

def main(argv=None):

    #argv = argv or sys.argv[1:]
    start_xircuits()

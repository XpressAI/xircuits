
# coding: utf-8
"""A wrapper to start xpipes and offer to start to XAI-components"""

import sys
import shutil
import os
from pathlib import Path
from sys import platform

def start_xpipes():
    print(
'''
================================
 __   __      _                 
 \ \ / /     (_)                
  \ V / _ __  _ _ __   ___  ___ 
   > < | '_ \| | '_ \ / _ \/ __|
  / . \| |_) | | |_) |  __/\__ \\
 /_/ \_\ .__/|_| .__/ \___||___/
       | |     | |              
       |_|     |_|             
================================
'''
    )
    
    # the current handler assumes that the user uses venv to install xpipes
    
    if platform == "win32":
        xai_component_path = Path(sys.executable).parents[1] / "Lib" / "site-packages" / "xai_components"
        config_path = Path(sys.executable).parents[1] / "Lib" / "site-packages" / "xai_components" / ".xpipes"
    
    else:  
        # the dir path for linux venv looks like : venv/lib/python3.9/site-packages/xpipes
        venv_python_version = os.listdir("venv/lib")[0]
        xai_component_path = Path(sys.executable).parents[1] / "lib" / venv_python_version / "site-packages" / "xai_components"
        config_path = Path(sys.executable).parents[1] / "lib" / venv_python_version / "site-packages" / "xai_components" / ".xpipes"
        
    current_path = Path(os.getcwd()) / "xai_components"
    current_config_path = Path(os.getcwd()) / ".xpipes"


    if not current_path.exists():
        val = input("Xpipes Component Library is not found. Would you like to load it in the current path (Y/N)? ")
        if val.lower() == ("y" or "yes"):
            shutil.copytree(xai_component_path, current_path, dirs_exist_ok=True)
            if not current_config_path.exists():
            	shutil.copytree(config_path, current_config_path, dirs_exist_ok=True)
        
    os.system("jupyter lab")

def main(argv=None):

    #argv = argv or sys.argv[1:]
    start_xpipes()

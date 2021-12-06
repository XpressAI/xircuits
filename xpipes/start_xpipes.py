
# coding: utf-8
"""A wrapper to start xpipes and offer to start to XAI-components"""

import sys
import shutil
import os
from pathlib import Path


def start_xpipes():
    xai_component_path = Path(sys.executable).parents[1] / "Lib" / "site-packages" / "xai_components"
    current_path = Path(os.getcwd()) / "xai_components"


    if not current_path.exists():
        val = input("Xpipes Component Library is not found.\nWould you like to load it in the current path?\n(Y/N)")
        if val.lower() == ("y" or "yes"):
            shutil.copytree(xai_component_path, current_path, dirs_exist_ok=True)
        
    os.system("jupyter lab")

def main(argv=None):

    #argv = argv or sys.argv[1:]
    start_xpipes()

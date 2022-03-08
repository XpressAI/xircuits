from xai_components.base import InArg, OutArg, InCompArg, Component, xai_component

import os
import sys
from pathlib import Path

@xai_component
class ZipDirectory(Component):
    zip_fn: InArg[str]
    dir_name: InCompArg[str]


    def __init__(self):

        self.done = False
        self.zip_fn = InArg.empty()
        self.dir_name = InCompArg.empty()

    def execute(self, ctx) -> None:
        
        # import shutil

        from zipfile import ZipFile
        from tqdm import tqdm

        zip_fn = self.zip_fn.value if self.zip_fn.value else Path(sys.argv[0]).stem
        dir_name = self.dir_name.value if self.dir_name.value else None

        assert os.path.isdir(dir_name), "invalid dir_name!"

        if os.path.splitext(zip_fn)[-1] != ".zip":
            zip_fn = zip_fn + ".zip"

        if not Path(zip_fn).is_file():
            print(zip_fn + " created at " + os.getcwd()) 
            zipObj = ZipFile(zip_fn, 'w')

        else:
            print(zip_fn + " updated at " + os.getcwd()) 
            zipObj = ZipFile(zip_fn,'a')

        for dirname, subdirs, files in tqdm(list(os.walk(dir_name))):
            zipObj.write(dirname)
            for filename in files:
                zipObj.write(os.path.join(dirname, filename))
        
        zipObj.close()        
       
        self.done = True

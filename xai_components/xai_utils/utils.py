from xai_components.base import InArg, OutArg, InCompArg, Component, xai_component

import os
import sys
from pathlib import Path

@xai_component
class ZipDirectory(Component):
    zip_fn: InArg[str]
    dir_name: InCompArg[str]
    include_dir: InArg[bool]

    def __init__(self):

        self.done = False
        self.zip_fn = InArg.empty()
        self.dir_name = InCompArg.empty()
        self.include_dir = InArg.empty()

    def execute(self, ctx) -> None:
        
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

        for root, dirs, files in tqdm(list(os.walk(dir_name))):
            
            #chop off root dir
            if self.include_dir.value == False:
                length = len(dir_name)
                dirs = root[length:]
                
            for filename in files:
                
                if self.include_dir.value == False:
                    zipObj.write(os.path.join(root, filename), os.path.join(dirs, filename))
                
                else:
                    zipObj.write(os.path.join(root, filename))

        zipObj.close()        
       
        self.done = True

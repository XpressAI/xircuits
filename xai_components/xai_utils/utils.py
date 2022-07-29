from xai_components.base import InArg, OutArg, InCompArg, Component, xai_component

import os
import sys
from pathlib import Path
import time

@xai_component
class ZipDirectory(Component):
    """Zips a directory.
    
    ##### inPorts:
    - zip_fn: the Zip filename.
        Default: .xircuits canvas name.
    - dir_name: the directory to be zipped.
    - include_dir: bundle the specified directory in the zip if True.
    
        #### EG:

        Creating Bar.zip which zips the dir `Foo` with the structure:
        ```  
        Foo
        |-- file1
        |-- file2
        ```

        if `include_dir` is `True`:
        ```
        Bar.zip
        |-- Foo
            |-- file1
            |-- file2
        ```

        if `include_dir` is `False`:
        ```
        Bar.zip
        |-- file1
        |-- file2
        ```

    """
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
        dir_name = self.dir_name.value

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

@xai_component
class DeleteFile(Component):
    """Deletes a file.
    
    ##### inPorts:
    - filename: path to file to be deleted.
    """
    filename: InCompArg[str]

    def __init__(self):

        self.done = False
        self.filename = InArg.empty()

    def execute(self, ctx) -> None:

        filename = self.filename.value if self.filename.value else None

        if os.path.exists(filename):
          os.remove(filename)
        else:
          print(filename + " does not exist.") 

        self.done = True

@xai_component(color="green")
class TimerComponent(Component):
    """Chain multiple instances of this component to measure elapsed time.
    
    ##### inPorts:
    - in_timer: if provided will measure the elapsed time since last called.
        if not provided, will start a new timer.
    - timer_message: a log message to be printed. 

    ##### outPorts:
    - out_timer: passes current timer to the next TimerComponent. 
    - elapsed_time: the elapsed time in seconds.
    """
    in_timer: InArg[time.time]
    timer_message: InArg[str]
    
    out_timer: OutArg[time.time]
    elapsed_time: OutArg[int]
    
    def __init__(self):

        self.done = False
        
        self.in_timer = InArg.empty()
        self.timer_message = InArg.empty()

        self.out_timer = OutArg.empty()
        self.elapsed_time = OutArg.empty()
        

    def execute(self, ctx) -> None:
                
        current_time = time.time()
        timer_message = self.timer_message.value if self.timer_message.value else "current timer component"
        
        elapsed_time = 0
        
        if self.in_timer.value:
                elapsed_time = current_time - self.in_timer.value
                print("The elapsed time for " + timer_message + " is " + str(elapsed_time) + " seconds.")
        else:
            print("Starting new timer.")
        
        self.out_timer.value = current_time
        self.elapsed_time.value = elapsed_time

        
@xai_component(color="green")
class SleepComponent(Component):
    """Pauses the python process.
    
    ##### inPorts:
    - sleep_timer: the number of seconds to pause.
        Default `5.0` seconds.
    """    
    sleep_timer: InArg[float]

    def __init__(self):

        self.done = False
        
        self.sleep_timer = InArg.empty()
                
    def execute(self, ctx) -> None:
        
        sleep_timer = self.sleep_timer.value if self.sleep_timer.value else 5.0
        print("Sleeping for " + str(sleep_timer) + " seconds.")
        time.sleep(sleep_timer)
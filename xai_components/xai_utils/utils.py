from xai_components.base import InArg, OutArg, InCompArg, Component, xai_component, dynalist, dynatuple

import os
import sys
from pathlib import Path
import time

@xai_component
class Print(Component):
    msg: InArg[any]
    
    def execute(self, ctx) -> None:
        print(str(self.msg.value))
        
@xai_component
class ConcatString(Component):
    a: InArg[str]
    b: InArg[str]
    out: OutArg[str]

    def execute(self, cts) -> None:
        self.out.value = self.a.value + self.b.value
    
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
       
@xai_component
class DeleteFile(Component):
    """Deletes a file.
    
    ##### inPorts:
    - filename: path to file to be deleted.
    """
    filename: InCompArg[str]

    def execute(self, ctx) -> None:

        filename = self.filename.value if self.filename.value else None

        if os.path.exists(filename):
          os.remove(filename)
        else:
          print(filename + " does not exist.") 

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

    def execute(self, ctx) -> None:
        
        sleep_timer = self.sleep_timer.value if self.sleep_timer.value else 5.0
        print("Sleeping for " + str(sleep_timer) + " seconds.")
        time.sleep(sleep_timer)

@xai_component(color="grey")
class MakeList(Component):
    """
    A component that takes values from its dynamic list port and output as a normal list.
    ##### inPorts:
    - list_values: Dynamic list port that can take any vars and append it in a list.

    ##### outPorts:
    - output_list: The constructed list from the dynamic list inPorts.
    """
    list_values: InArg[dynalist]
    output_list: OutArg[list]

    def execute(self, ctx) -> None:

        self.output_list.value = self.list_values.value
        print("Constructed List:", self.output_list.value)

@xai_component(color="grey")
class MakeTuple(Component):
    """
    A component that takes values from its dynamic tuple port and output as a normal tuple.
    ##### inPorts:
    - tuple_values: Dynamic tuple port that can take any vars and append it in a tuple.

    ##### outPorts:
    - output_tuple: The constructed tuple from the dynamic tuple inPorts.
    """
    tuple_values: InArg[dynatuple]
    output_tuple: OutArg[tuple]

    def execute(self, ctx) -> None:

        self.output_tuple.value = self.tuple_values.value
        print("Constructed Tuple:", self.output_tuple.value)

@xai_component(color="grey")
class MakeDict(Component):
    """
    A component that takes two dynamic lists (dynalists) as inputs - one for keys and one for values,
    and constructs a dictionary from these lists. If there are more keys than values, the unmatched keys
    will have None as their value.

    ##### inPorts:
    - keys_list: Dynamic list of keys for the dictionary.
    - values_list: Dynamic list of values for the dictionary.

    ##### outPorts:
    - output_dict: The constructed dictionary from the provided keys and values.
    """
    keys_list: InArg[dynalist]
    values_list: InArg[dynalist]
    output_dict: OutArg[dict]

    def execute(self, ctx) -> None:
        keys = self.keys_list.value
        values = self.values_list.value

        constructed_dict = {key: values[i] if i < len(values) else None for i, key in enumerate(keys)}
        
        self.output_dict.value = constructed_dict
        print("Constructed Dictionary:", self.output_dict.value)

@xai_component(color="orange")
class ExecuteNotebook(Component):
    """Executes a Jupyter notebook from a given file path and logs the output.

    This component runs a Jupyter notebook and can save a log of the execution.
    It's useful for automated running of notebooks for data analysis or similar tasks.

    ##### inPorts:
    - notebook_filepath: Path of the '.ipynb' file to execute.
    - log_filepath: Path for saving the execution log (optional).

    ##### Notes:
    - Only '.ipynb' files are accepted.
    - Execution timeout is 10 minutes.
    - Errors during execution are logged or printed.
    """

    notebook_filepath: InCompArg[str]
    log_filepath: InArg[str]

    def execute(self, context):
        
        import nbformat
        from nbconvert.preprocessors import ExecutePreprocessor, CellExecutionError

        notebook_filepath = self.notebook_filepath.value

        # Ensure that the input file has a valid ".ipynb" extension
        if not notebook_filepath.lower().endswith(".ipynb"):
            raise ValueError("Invalid input file path. Please provide a valid jupyter notebook '.ipynb' file.")

        # Extract the filename and directory path
        input_filename, _ = os.path.splitext(os.path.basename(notebook_filepath))
        log_filepath = self.log_filepath.value

        with open(notebook_filepath) as f:
            nb = nbformat.read(f, as_version=4)

        ep = ExecutePreprocessor(timeout=600, kernel_name='python3')

        try:
            out = ep.preprocess(nb, {'metadata': {'path': '.'}})
        
        except CellExecutionError:

            msg = 'Error executing the notebook "%s".\n\n' % notebook_filepath
            msg += 'See notebook "%s" for the traceback.' % log_filepath
            print(msg)
            log_filepath if log_filepath else f"{input_filename}-output.ipynb"
            raise

        finally:
            if log_filepath:
                with open(log_filepath, mode='w', encoding='utf-8') as f:
                    nbformat.write(nb, f)
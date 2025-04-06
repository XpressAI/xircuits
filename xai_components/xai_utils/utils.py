from xai_components.base import InArg, OutArg, InCompArg, Component, xai_component, secret, dynalist, dynatuple, BaseComponent, SubGraphExecutor

import os
import sys
from pathlib import Path
import time
import datetime
import json
import random
import re

@xai_component
class GetCurrentTime(Component):
    """Retrieves the current time in ISO 8601 format.
    
    ##### outPorts:
    - time_str (str): The current time as a string in ISO 8601 format.
    """
    time_str: OutArg[str]
    time_zone: InArg[str]
    
    def execute(self, ctx) -> None:
        try:
            import pytz
    
            tz = pytz.timezone(self.time_zone.value if self.time_zone.value is not None else 'UTC')
            now = datetime.datetime.now(tz)
        except:
            now = datetime.datetime.now()
            
        self.time_str.value = now.isoformat()

@xai_component
class GetCurrentDate(Component):
    """Retrieves the current date components.
    
    ##### inPorts:
    - timezone (str): An optional time zone string (e.g., 'America/New_York'). If not provided, defaults to UTC.
    
    ##### outPorts:
    - year (str): The current year.
    - month (str): The current month.
    - day (str): The current day.
    """
    timezone: InArg[str]  # Optional time zone input
    year: OutArg[str]
    month: OutArg[str]
    day: OutArg[str]
    
    def execute(self, ctx) -> None:
        # Get the timezone from the input, default to UTC if not provided
        tz_name = self.timezone.value if self.timezone.value else 'UTC'
        timezone = pytz.timezone(tz_name)
        
        # Get the current date in the specified timezone
        today = datetime.datetime.now(timezone).date()
        
        self.year.value = str(today.year)
        self.month.value = str(today.month)
        self.day.value = str(today.day)

@xai_component
class Print(Component):
    """Prints a message to the console.
    
    ##### inPorts:
    - msg (any): The message to be printed.
    """
    msg: InArg[any]
    
    def execute(self, ctx) -> None:
        print(str(self.msg.value), flush=True)

@xai_component
class PrettyPrint(Component):
    """Prints a message in a pretty format using pprint.
    
    ##### inPorts:
    - msg (any): The message to be pretty printed.
    """
    msg: InArg[any]
    
    def execute(self, ctx) -> None:
        import pprint
        pp = pprint.PrettyPrinter(indent=4)
        print(pp.pformat(self.msg.value), flush=True)

@xai_component
class ConcatString(Component):
    """Concatenates two strings.
    
    ##### inPorts:
    - a (str): The first string.
    - b (str): The second string.
    
    ##### outPorts:
    - out (str): The concatenated result of strings a and b.
    """
    a: InArg[str]
    b: InArg[str]
    out: OutArg[str]

    def execute(self, cts) -> None:
        self.out.value = self.a.value + self.b.value

@xai_component
class ConcatStrings(Component):
    """Concatenates any number of strings.
    
    ##### inPorts:
    - separator (str): A string used to separate the parts, otherwise uses the empty string.
    - parts (dynalist): The strings to concatenate
    
    ##### outPorts:
    - out (str): The concatenated result of strings a and b.
    """
    separator: InArg[str]
    parts: InArg[dynalist]
    out: OutArg[str]

    def execute(self, cts) -> None:
        sep = self.separator.value if self.separator.value is not None else ''
        res = sep.join(str(part) for part in self.parts.value)
        self.out.value = res

@xai_component
class FormatString(Component):
    """Formats a string using placeholders and a dictionary of replacements.
    
    ##### inPorts:
    - format_str (str): The string with placeholders.
    - args (dict): Dictionary with placeholder replacements.

    ##### outPorts:
    - out_str (str): The formatted string.

    ##### Example:
    format_str: "Hello, {name}! Today is {day}."
    args: {"name": "Xircuits", "day": "Monday"}
    out_str: "Hello, Xircuits! Today is Monday."
    """
    format_str: InCompArg[str]
    args: InArg[dict]
    out_str: OutArg[str]
    
    def execute(self, ctx):
        self.out_str.value = self.format_str.value.format(**self.args.value)

@xai_component
class SplitString(Component):
    """Splits a string by a specified character.
    
    ##### inPorts:
    - string (str): The string to split.
    - ch (str): The character to split the string by.
    
    ##### outPorts:
    - out (list): List of substrings.
    """
    string: InArg[str]
    ch: InArg[str]
    out: OutArg[list]

    def execute(self, cts) -> None:
        self.out.value = self.string.value.split(self.ch.value)

@xai_component
class JoinArrayWithString(Component):
    """Joins an array of strings into a single string with a separator.
    
    ##### inPorts:
    - array (list): The array of strings to join.
    - sep (str): The separator string.
    
    ##### outPorts:
    - out (str): The joined string.
    """
    array: InArg[list]
    sep: InArg[str]
    out: OutArg[str]

    def execute(self, cts) -> None:
        self.out.value = self.sep.value.join(self.array.value)

@xai_component
class ZipDirectory(Component):
    """Zips a directory.
    
    ##### inPorts:
    - zip_fn (str): The Zip filename. Default: .xircuits canvas name.
    - dir_name (str): The directory to be zipped.
    - include_dir (bool): Bundle the specified directory in the zip if True.
    
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
            zipObj = ZipFile(zip_fn, 'a')

        for root, dirs, files in list(os.walk(dir_name)):
            # chop off root dir if include_dir is False
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
class MoveFile(Component):
    """Move a file.
    
    ##### inPorts:
    - source_path (str): Path to the file to be moved.
    - dest_path (str): The destination.

    ##### outPorts:
    - result_path (str): Resulting file path.
    """
    source_path: InArg[str]
    dest_path: InArg[str]
    result_path: OutArg[str]

    def execute(self, ctx) -> None:
        import shutil
        new_path = shutil.move(self.source_path.value, self.dest_path.value)
        self.result_path.value = new_path

@xai_component
class CopyFile(Component):
    """Copies a file.
    
    ##### inPorts:
    - source_path (str): Path to the file to be copied.
    - dest_path (str): The destination.

    ##### outPorts:
    - result_path (str): Resulting file path.
    """
    source_path: InArg[str]
    dest_path: InArg[str]
    result_path: OutArg[str]

    def execute(self, ctx) -> None:
        import shutil
        new_path = shutil.copy2(self.source_path.value, self.dest_path.value)
        self.result_path.value = new_path

@xai_component
class DeleteFile(Component):
    """Deletes a file.
    
    ##### inPorts:
    - filename (str): Path to file to be deleted.
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
    - in_timer (time.time): If provided will measure the elapsed time since last called. If not provided, will start a new timer.
    - timer_message (str): A log message to be printed.

    ##### outPorts:
    - out_timer (time.time): Passes current timer to the next TimerComponent.
    - elapsed_time (int): The elapsed time in seconds.
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
    - sleep_timer (float): The number of seconds to pause. Default `5.0` seconds.
    """    
    sleep_timer: InArg[float]

    def execute(self, ctx) -> None:
        sleep_timer = self.sleep_timer.value if self.sleep_timer.value else 5.0
        print("Sleeping for " + str(sleep_timer) + " seconds.")
        time.sleep(sleep_timer)

@xai_component(color="grey")
class MakeList(Component):
    """A component that takes values from its dynamic list port and outputs as a normal list.
    
    ##### inPorts:
    - list_values (dynalist): Dynamic list port that can take any vars and append it in a list.

    ##### outPorts:
    - output_list (list): The constructed list from the dynamic list inPorts.
    """
    list_values: InArg[dynalist]
    output_list: OutArg[list]

    def execute(self, ctx) -> None:
        self.output_list.value = self.list_values.value
        print("Constructed List:", self.output_list.value)

@xai_component(color="grey")
class MakeTuple(Component):
    """A component that takes values from its dynamic tuple port and outputs as a normal tuple.
    
    ##### inPorts:
    - tuple_values (dynatuple): Dynamic tuple port that can take any vars and append it in a tuple.

    ##### outPorts:
    - output_tuple (tuple): The constructed tuple from the dynamic tuple inPorts.
    """
    tuple_values: InArg[dynatuple]
    output_tuple: OutArg[tuple]

    def execute(self, ctx) -> None:
        self.output_tuple.value = self.tuple_values.value
        print("Constructed Tuple:", self.output_tuple.value)

@xai_component(color="grey")
class MakeDict(Component):
    """A component that takes two dynamic lists (dynalists) as inputs - one for keys and one for values,
    and constructs a dictionary from these lists. If there are more keys than values, the unmatched keys
    will have None as their value.

    ##### inPorts:
    - keys_list (dynalist): Dynamic list of keys for the dictionary.
    - values_list (dynalist): Dynamic list of values for the dictionary.

    ##### outPorts:
    - output_dict (dict): The constructed dictionary from the provided keys and values.
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
    - notebook_filepath (str): Path of the '.ipynb' file to execute.
    - log_filepath (str): Path for saving the execution log (optional).

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

@xai_component
class IsNone(Component):
    """Checks if the input value is None.
    
    ##### inPorts:
    - a (any): The value to be checked.
    
    ##### outPorts:
    - out (bool): True if 'a' is None, False otherwise.
    """
    a: InArg[any]
    out: OutArg[bool]

    def execute(self, ctx) -> None:
        self.out.value = self.a.value is None

@xai_component
class IsNotNone(Component):
    """Checks if the input value is not None.
    
    ##### inPorts:
    - a (any): The value to be checked.
    
    ##### outPorts:
    - out (bool): True if 'a' is not None, False otherwise.
    """
    a: InArg[any]
    out: OutArg[bool]

    def execute(self, ctx) -> None:
        self.out.value = self.a.value is not None

@xai_component
class SetDictValue(Component):
    """Sets a key-value pair in a dictionary, creating a new dictionary if none is provided.

    InPorts:
    - obj (dict): The input dictionary. If falsy or not provided, a new dictionary will be created.
    - name (str): The key to set in the dictionary.
    - value (any): The value to assign to the key.

    OutPorts:
    - out_dict (dict): The resulting dictionary with the updated key-value pair.
    """
    obj: InArg[dict]
    name: InCompArg[str]
    value: InCompArg[any]
    out_dict: OutArg[dict]
    
    def execute(self, ctx) -> None:
        obj = self.obj.value if self.obj.value else {}
        obj[self.name.value] = self.value.value
        self.out_dict.value = obj

@xai_component
class GetDictValue(Component):
    """Retrieves a value from a dictionary using a specified key.

    InPorts:
    - obj (dict): The dictionary to search.
    - name (str): The key for which the value will be retrieved.

    OutPorts:
    - value (any): The value associated with the key. Raises a KeyError if the key is not found.
    """
    obj: InArg[dict]
    name: InCompArg[str]
    value: OutArg[any]

    def execute(self, ctx) -> None:
        self.value.value = self.obj.value[self.name.value]

@xai_component
class ListAppend(Component):
    """Appends an item to a list.
    
    ##### inPorts:
    - the_list (list): The list to which the item will be appended.
    - item (any): The item to append to the list.
    
    ##### outPorts:
    - out_list (list): The list with the appended item.
    """
    the_list: InArg[list]
    item: InCompArg[any]
    out_list: OutArg[list]

    def execute(self, ctx) -> None:
        l = [] if self.the_list.value is None else self.the_list.value
        l.append(self.item.value)
        self.out_list.value = l

@xai_component
class ListGetItem(Component):
    """Retrieves an item from a list based on the specified index.
    
    ##### inPorts:
    - the_list (list): The list from which to retrieve the item.
    - index (int): The index of the item in the list.
    
    ##### outPorts:
    - out_item (any): The retrieved item.
    """
    the_list: InCompArg[list]
    index: InCompArg[int]
    out_item: OutArg[any]

    def execute(self, ctx) -> None:
        self.out_item.value = self.the_list.value[self.index.value]

@xai_component
class ListSetItem(Component):
    """Sets an item in a list at the specified index.
    
    ##### inPorts:
    - the_list (list): The list in which to set the item.
    - index (int): The index at which to set the item.
    - item (any): The item to set in the list.
    
    ##### outPorts:
    - out_list (list): The list with the set item.
    """
    the_list: InCompArg[list]
    index: InCompArg[int]
    item: InCompArg[any]
    out_list: OutArg[list]

    def execute(self, ctx) -> None:
        self.the_list.value[self.index.value] = self.item.value
        self.out_list.value = self.the_list.value

@xai_component
class DictGetItem(Component):
    """Retrieves an item from a dictionary using the specified key.
    
    ##### inPorts:
    - the_dict (dict): The dictionary from which to retrieve the item.
    - key (any): The key corresponding to the item in the dictionary.
    
    ##### outPorts:
    - out_item (any): The retrieved item.
    """
    the_dict: InCompArg[dict]
    key: InCompArg[any]
    out_item: OutArg[any]

    def execute(self, ctx) -> None:
        self.out_item.value = self.the_dict.value[self.key.value]

@xai_component
class DictSetItem(Component):
    """Sets an item in a dictionary with the specified key.
    
    ##### inPorts:
    - the_dict (dict): The dictionary in which to set the item.
    - key (any): The key under which to set the item.
    - item (any): The item to be set in the dictionary.
    
    ##### outPorts:
    - out_dict (dict): The dictionary with the set item.
    """
    the_dict: InArg[dict]
    key: InCompArg[any]
    item: InCompArg[any]
    out_dict: OutArg[dict]

    def execute(self, ctx) -> None:
        d = {} if self.the_dict.value is None else self.the_dict.value
        d[self.key.value] = self.item.value
        self.out_dict.value = d

@xai_component
class ToJson(Component):
    """Converts an object to a JSON string.
    
    ##### inPorts:
    - obj (any): The object to convert to JSON.
    
    ##### outPorts:
    - json_str (str): The JSON string representation of the object.
    """
    obj: InCompArg[any]
    json_str: OutArg[str]
    
    def execute(self, ctx) -> None:
        self.json_str.value = json.dumps(self.obj.value)

@xai_component
class FromJson(Component):
    """Converts a JSON string to an object.
    
    ##### inPorts:
    - json_str (str): The JSON string to convert to an object.
    
    ##### outPorts:
    - obj (any): The object represented by the JSON string.
    """
    json_str: InCompArg[str]
    obj: OutArg[any]
    
    def execute(self, ctx) -> None:
        self.obj.value = json.loads(self.json_str.value)

@xai_component
class GetRandomNumber(Component):
    """Generates a random number between the specified bounds.
    
    ##### inPorts:
    - greater_than (int): The lower bound for the random number (inclusive).
    - less_than (int): The upper bound for the random number (exclusive).
    
    ##### outPorts:
    - value (int): The generated random number.
    """
    greater_than: InCompArg[int]
    less_than: InCompArg[int]
    value: OutArg[int]
    
    def execute(self, ctx) -> None:
        self.value.value = random.randint(self.greater_than.value, self.less_than.value)

@xai_component(color='blue')
class RunParallelThread(Component):
    """Executes a given body in a separate thread using a thread pool executor.

    **Important Note**: Changes done in the body are not propagated!
    This includes things like setting variable values, modifying the context, or
    even setting output arguments. This means, you can't pull the result of a
    component that is run on a separate thread.
    
    ##### inPorts:
    - n_workers (int): The number of worker threads to use for executing the body in parallel.
    
    ##### outPorts:
    - futures (list): All futures created by this component.
    
    ##### Branches:
    - body: The body to be executed in parallel.
    """
    n_workers: InArg[int]
    futures: OutArg[list]
    body: BaseComponent

    def __init__(self):
        super().__init__()
        self.executor = None
        self.futures.value = []
    
    def execute(self, ctx) -> None:
        from concurrent.futures import ThreadPoolExecutor
        from copy import deepcopy
        
        if self.executor is None:
            self.executor = ThreadPoolExecutor(max_workers=self.n_workers.value)

        def execute_body(body, ctx):
            SubGraphExecutor(body).do(ctx)
        
        x = self.executor.submit(execute_body, deepcopy(self.body), deepcopy(ctx))

        # Enforce that any exceptions are logged
        x.add_done_callback(lambda x: x.result())

        self.futures.value.append(x)

@xai_component(color='blue')
class AwaitFutures(Component):
    """Waits for a list of futures to complete.
    
    ##### inPorts:
    - futures (list): The list of futures to wait for.
    """
    futures: InCompArg[list]

    def execute(self, ctx) -> None:
        from concurrent.futures import wait
        wait(self.futures.value)

@xai_component
class GetEnvVar(Component):
    """
    Fetches a variable from the environment and passes its value as an outport.
    
    ##### inPorts:
    - var_name (str): The name of the environment variable to fetch (compulsory).
    
    ##### outPorts:
    - var_value (str): The value of the environment variable, or None if the variable is not set.
    """
    var_name: InCompArg[str]
    var_value: OutArg[str]

    def execute(self, ctx) -> None:
        # Try to load .env file if python-dotenv is installed
        try:
            from dotenv import load_dotenv
            load_dotenv()  # Loads the variables from a .env file into the environment
        except ImportError:
            # If dotenv isn't installed, skip loading
            pass

        env_var_name = self.var_name.value
        self.var_value.value = os.getenv(env_var_name)
        
        if self.var_value.value is None:
            print(f"Warning: Environment variable '{env_var_name}' is not set.")

@xai_component
class DeepCopy(Component):
    """
    Creates a deep copy of the input data and outputs the copied data.

    ##### inPorts:
    - data (any): The input data to be deep-copied.

    ##### outPorts:
    - copied_data (any): The deep-copied output data.
    """
    data: InArg[any]
    copied_data: OutArg[any]

    def execute(self, ctx) -> None:
        import copy

        # Perform a deep copy of the input data
        input_data = self.data.value
        self.copied_data.value = copy.deepcopy(input_data)


@xai_component
class RegexMatch(Component):
    """Component to check if a string matches a regex pattern.

    ##### inPorts:
    - input_string (str): The string to be checked.
    - regex_pattern (str): The regex pattern to match against.

    ##### outPorts:
    - match (bool): True if the string matches the pattern, False otherwise.
    """
    input_string: InCompArg[str]
    regex_pattern: InCompArg[str]
    match: OutArg[bool]

    def execute(self, ctx) -> None:
        self.match.value = bool(re.match(self.regex_pattern.value, self.input_string.value))


@xai_component
class RegexFindAll(Component):
    """Component to find all occurrences of a regex pattern in a string.

    ##### inPorts:
    - input_string (str): The string to search.
    - regex_pattern (str): The regex pattern to find.

    ##### outPorts:
    - matches (list): A list of all matches found.
    """
    input_string: InCompArg[str]
    regex_pattern: InCompArg[str]
    matches: OutArg[list]

    def execute(self, ctx) -> None:
        self.matches.value = re.findall(self.regex_pattern.value, self.input_string.value)


@xai_component
class RegexReplace(Component):
    """Component to replace occurrences of a regex pattern in a string.

    ##### inPorts:
    - input_string (str): The string to modify.
    - regex_pattern (str): The regex pattern to replace.
    - replacement (str): The string to replace matches with.

    ##### outPorts:
    - modified_string (str): The modified string after replacements.
    """
    input_string: InCompArg[str]
    regex_pattern: InCompArg[str]
    replacement: InCompArg[str]
    modified_string: OutArg[str]

    def execute(self, ctx) -> None:
        self.modified_string.value = re.sub(self.regex_pattern.value, self.replacement.value, self.input_string.value)


@xai_component
class RegexSplit(Component):
    """Component to split a string by a regex pattern.

    ##### inPorts:
    - input_string (str): The string to split.
    - regex_pattern (str): The regex pattern to split by.

    ##### outPorts:
    - split_result (list): A list of substrings after the split.
    """
    input_string: InCompArg[str]
    regex_pattern: InCompArg[str]
    split_result: OutArg[list]

    def execute(self, ctx) -> None:
        self.split_result.value = re.split(self.regex_pattern.value, self.input_string.value)


@xai_component
class ToString(Component):
    """Converts an input object to its string representation.

    ##### inPorts:
    - obj (any): The input object to convert to a string.

    ##### outPorts:
    - string (str): The resulting string representation of the input object.
    """
    obj: InCompArg[any]
    string: OutArg[str]

    def execute(self, ctx) -> None:
        self.string.value = str(self.obj.value)


@xai_component
class StringWordCharacterCount(Component):
    """Component to count the number of words and characters in a given text.

    ##### inPorts:
    - text (str): The input text to analyze.
    
    ##### outPorts:
    - word_count (int): The count of words in the input text.
    - character_count (int): The count of characters in the input text.
    """
    text: InArg[str]
    word_count: OutArg[int]
    character_count: OutArg[int]

    def execute(self, ctx) -> None:
        # Get the input text
        input_text = self.text.value
        
        # Count words and characters
        self.word_count.value = len(input_text.split())
        self.character_count.value = len(input_text)

@xai_component
class StringStartsWith(Component):
    """Component to check if a given string starts with a specified prefix.

    ##### inPorts:
    - string (str): The input string to check.
    - prefix (str): The prefix to check against the input string.
    
    ##### outPorts:
    - starts_with (bool): True if the input string starts with the specified prefix, otherwise False.
    """
    string: InCompArg[str]
    prefix: InCompArg[str]
    
    starts_with: OutArg[bool]
    
    def execute(self, ctx) -> None:
        self.starts_with.value = self.string.value.startswith(self.prefix.value)

@xai_component
class StringEndsWith(Component):
    """Component to check if a given string ends with a specified postfix.

    ##### inPorts:
    - string (str): The input string to check.
    - postfix (str): The postfix to check against the input string.
    
    ##### outPorts:
    - ends_with (bool): True if the input string ends with the specified postfix, otherwise False.
    """
    string: InCompArg[str]
    postfix: InCompArg[str]
    
    ends_with: OutArg[bool]
    
    def execute(self, ctx) -> None:
        self.ends_with.value = self.string.value.endswith(self.postfix.value)

@xai_component
class StringGetLength(Component):
    """Component to get the length of a given string.

    ##### inPorts:
    - string (str): The input string whose length is to be determined.
    
    ##### outPorts:
    - length (int): The length of the input string.
    """
    string: InCompArg[str]
    
    length: OutArg[int]
    
    def execute(self, ctx) -> None:
        self.length.value = len(self.string.value)

@xai_component
class StringLimitToLength(Component):
    """Component to limit a given string to a specified maximum length.

    ##### inPorts:
    - string (str): The input string to be limited.
    - max_length (int): The maximum length to limit the input string to.
    
    ##### outPorts:
    - out_string (str): The resulting string limited to the specified maximum length.
    """
    string: InCompArg[str]
    max_length: InCompArg[int]
    
    out_string: OutArg[str]
    
    def execute(self, ctx) -> None:
        new_length = min(len(self.string.value), self.max_length.value)
        
        self.out_string.value = self.string.value[:new_length]

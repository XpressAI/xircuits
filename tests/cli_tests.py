import os
import sys
import time
import shutil
import subprocess
import signal
import re
import json
from pathlib import Path
import pytest

# Setup test directory
@pytest.fixture(scope="function")
def test_directory():
    """Create a test directory and clean it up after tests"""
    # Hardcoded test directory name
    test_dir_name = "xircuits_test"
    keep_dir = False  # Hardcoded to always clean up
    
    # Create absolute path for test directory
    test_dir = Path(test_dir_name).absolute()
    
    # Clean or create the test directory
    if test_dir.exists():
        shutil.rmtree(test_dir)
    
    test_dir.mkdir()
    print(f"Created test directory: {test_dir}")
    
    # Store original directory
    original_dir = Path.cwd()
    
    # Return the test directory path
    yield test_dir
    
    # Clean up after tests
    os.chdir(original_dir)
    shutil.rmtree(test_dir)
    print(f"Removed test directory: {test_dir}")

# Setup test environment for each test
@pytest.fixture(autouse=True)
def setup_test_environment(test_directory):
    """Change to test directory before each test"""
    original_dir = Path.cwd()
    os.chdir(test_directory)
    print(f"Running test in: {test_directory}")
    yield
    os.chdir(original_dir)

# Helper to run commands
def run_command(command, timeout=10, input_data=None, expected_output=None, check_stderr=False,
                expected_in_output=None, unexpected_in_output=None, 
                expected_files=None, wait_for_exit=True, no_browser=False):
    """
    Run a command and return its output.
    
    Args:
        command: Command string to run
        timeout: Timeout in seconds
        input_data: Data to be passed to the process's stdin
        expected_output: String that should be in output for test to pass
        check_stderr: Whether to check stderr
        expected_in_output: List of strings that should be in output
        unexpected_in_output: List of strings that should NOT be in output
        expected_files: List of files that should exist after command runs
        wait_for_exit: Whether to wait for command to exit
        no_browser: Add --no-browser for JupyterLab commands
    
    Returns:
        Tuple of (stdout, stderr, return_code)
    """
    # Add --no-browser to start commands if applicable
    if no_browser and (('xircuits' in command) or ('start' in command) or ('jupyter' in command)):
        command = command + " --no-browser"
        
    print(f"Running command: {command}")
    
    # Use a process object to run the command
    process = subprocess.Popen(
        command,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        stdin=subprocess.PIPE, # Enable input
        text=True,
        preexec_fn=os.setsid  # For group termination
    )
    
    # Initialize empty output
    stdout_data = ""
    stderr_data = ""
    
    try:
        if expected_output:
            # Monitor output until we find what we're looking for
            start_time = time.time()
            found_output = False
            
            while time.time() - start_time < timeout:
                stdout_line = process.stdout.readline()
                if not stdout_line and process.poll() is not None:
                    break
                
                stdout_data += stdout_line
                print(f"STDOUT: {stdout_line.strip()}")
                
                if expected_output in stdout_line:
                    found_output = True
                    break
                
                time.sleep(0.1)
            
            # Kill the process if we found what we're looking for or timed out
            if found_output or time.time() - start_time >= timeout:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                process.wait()
            
            assert found_output, f"Expected output '{expected_output}' not found"
        
        elif wait_for_exit:
            # Just wait for the process to finish with timeout
            try:
                stdout_data, stderr_data = process.communicate(input=input_data, timeout=timeout)
            except subprocess.TimeoutExpired:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                stdout_data, stderr_data = process.communicate()
                pytest.fail(f"Command timed out after {timeout} seconds")
        
        else:
            # For processes that might not exit (like jupyterlab)
            time.sleep(timeout)  # Let the process run for the timeout period
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            stdout_data, stderr_data = process.communicate()
    
    except Exception as e:
        # Ensure process is terminated on exception
        try:
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
        except Exception:
            pass
        raise e
    
    # Print outputs with -v verbosity
    if "-v" in sys.argv:
        print(f"STDOUT:\n{stdout_data}")
        if stderr_data:
            print(f"STDERR:\n{stderr_data}")
    
    # Check for expected strings in output
    if expected_in_output:
        for expected in expected_in_output:
            assert expected in stdout_data + (stderr_data if check_stderr else ""), \
                   f"Expected string '{expected}' not found in output"
    
    # Check for unexpected strings in output
    if unexpected_in_output:
        for unexpected in unexpected_in_output:
            assert unexpected not in stdout_data + (stderr_data if check_stderr else ""), \
                   f"Unexpected string '{unexpected}' found in output"
    
    # Check if expected files exist
    if expected_files:
        for file_path in expected_files:
            assert os.path.exists(file_path), f"Expected file '{file_path}' not found"
    
    return_code = process.poll()
    return stdout_data, stderr_data, return_code


# Now define the actual tests

def test_01_help_command():
    """Test that help command works properly"""
    stdout, stderr, return_code = run_command("xircuits --h")
    assert return_code == 0
    assert "usage:" in stdout
    assert "Xircuits Command Line Interface" in stdout

def test_02_alternative_help_command():
    """Test that help command works properly"""
    stdout, stderr, return_code = run_command("xircuits --help")
    assert return_code == 0
    assert "usage:" in stdout
    assert "Xircuits Command Line Interface" in stdout

def test_03_init_command():
    """Test that init command creates necessary files"""
    stdout, stderr, return_code = run_command("xircuits init")
    assert return_code == 0
    assert "Xircuits has been initialized" in stdout
    
    # Check that necessary directories were created
    assert os.path.exists(".xircuits")
    assert os.path.exists("xai_components")

def test_04_compile_command():
    """Test that the compile command works properly."""
    # Initialize Xircuits
    run_command("xircuits init")

    # Search for .xircuits files in the xai_controlflow folder using glob
    xircuits_files = list(Path("xai_components/xai_controlflow").glob("*.xircuits"))
    assert xircuits_files, "No .xircuits files found in xai_controlflow."

    # Select the first available .xircuits file
    example_file = str(xircuits_files[0])

    # Compile the selected .xircuits file
    stdout, stderr, return_code = run_command(f"xircuits compile {example_file}")
    assert return_code == 0, "Compile command failed."

    # Verify that the corresponding .py file was created
    py_file = example_file.replace(".xircuits", ".py")
    assert os.path.exists(py_file)

def test_05_run_command():
    """Test that run command compiles and executes a workflow"""
    # Initialize and download examples
    run_command("xircuits init")
    
    # Use a specific workflow to ensure consistency across environments
    example_file = "xai_components/xai_controlflow/ControlflowBranch.xircuits"
    assert os.path.exists(example_file), f"Expected workflow file '{example_file}' not found."

    # Compile the selected .xircuits file
    stdout, stderr, return_code = run_command(f"xircuits run {example_file}")
    assert return_code == 0, "Compile command failed."

    # Verify that the corresponding .py file was created
    py_file = example_file.replace(".xircuits", ".py")
    assert os.path.exists(py_file)
    assert "Compiled" in stdout, "Expected 'Compiled' not found in output."
    assert "Finished Executing" in stdout, "Expected 'Finished Executing' not found in output."

def test_06_list_libraries_command():
    """Test that list command shows available libraries"""
    # Initialize first
    run_command("xircuits init")
    
    # Run list command
    stdout, stderr, return_code = run_command("xircuits list")
    assert return_code == 0
    
    # Should contain some mention of libraries
    assert re.search(r"librar(y|ies)", stdout, re.IGNORECASE)

def test_07_install_library_command():
    """Test that install command installs a library"""
    # Initialize first
    run_command("xircuits init")
    library_name ="flask"
    stdout, stderr, return_code = run_command(f"xircuits install {library_name}", timeout=60)
    assert f"library {library_name} ready to use" in stdout.lower()

def test_08_working_directory_detection():
    """Test that Xircuits correctly finds the working directory"""
    # Initialize in parent directory
    run_command("xircuits init")
    
    # Create a subdirectory and run xircuits from there
    os.makedirs("subdir", exist_ok=True)
    os.chdir("subdir")
    
    # Run list command
    stdout, stderr, return_code = run_command("xircuits list")
    
    # Should detect parent directory and run from there
    assert "Xircuits computing from:" in stdout
    assert return_code == 0

def test_09_compile_with_custom_output():
    """Test compiling with a custom output file name"""
    run_command("xircuits init")
    
    # Find an example file in the xai_controlflow folder
    example_files = list(Path("xai_components/xai_controlflow").glob("*.xircuits"))
    assert example_files, "No .xircuits files found in xai_controlflow."
    example_file = str(example_files[0])
    
    custom_output = "custom_output.py"
    # Compile with the custom output name
    stdout, stderr, return_code = run_command(f"xircuits compile {example_file} {custom_output}")
    assert return_code == 0, "Compile command failed."
    
    # Check that the custom named Python file was created
    assert os.path.exists(custom_output), f"Expected output file '{custom_output}' not found."

def test_10_error_handling_invalid_command():
    """Test that invalid commands are handled gracefully"""
    stdout, stderr, return_code = run_command("xircuits invalid_command")
    # Should print help or error message, not crash
    assert return_code != 0

def test_11_install_invalid_library():
    stdout, stderr, return_code = run_command("xircuits install non_existing_library")

    expected_error_message = "component library submodule not found"
    assert expected_error_message in stdout or expected_error_message in stderr, \
        f"Expected error message '{expected_error_message}' not found in output"

def test_12_fetch_only_valid_library(tmp_path):
    # Change to the temporary directory.
    os.chdir(tmp_path)

    # Initialize Xircuits in the temporary directory.
    stdout, stderr, return_code = run_command("xircuits init", timeout=15)
    assert return_code == 0, "Initialization failed."

    library_name = "xai_gradio"
    stdout, stderr, return_code = run_command(f"xircuits fetch-only {library_name}", timeout=60)
    assert return_code == 0, f"Fetch-only command failed for {library_name}"
    output = stdout + stderr

    expected_fetch = f"Fetching {library_name}..."
    assert expected_fetch in output, f"Expected '{expected_fetch}' not found in output"

    expected_msg1 = f"{library_name} library fetched and stored in"
    expected_msg2 = f"{library_name} library already exists in"
    assert (expected_msg1 in output or expected_msg2 in output), \
        f"Expected fetching message not found in output: {output}"

    assert "Installing" not in output, "Unexpected 'Installing' message found in fetch-only output"

    lib_path = tmp_path / "xai_components" / library_name
    assert lib_path.exists(), f"Library {library_name} should exist in xai_components after fetch-only."

def test_13_install_already_installed_library():
    library_name = "xai_utils"  # Select a library that is already installed
    run_command(f"xircuits install {library_name}")  # Ensure the library is installed beforehand

    stdout, stderr, return_code = run_command(f"xircuits install {library_name}")

    assert return_code == 0, f"Reinstalling {library_name} failed unexpectedly"

    unexpected_message = "cloning"
    assert unexpected_message not in stdout.lower(), \
        f"Unexpected cloning detected: '{unexpected_message}' found in output"

def test_14_compile_invalid_xircuits():
    # Create an invalid Xircuits file in the current directory.
    invalid_file = "invalid_workflow.xircuits"
    # Create an invalid Xircuits file with unexpected content (simulate invalid JSON or format)
    with open(invalid_file, "w") as f:
        f.write("{invalid_json}")  # Invalid content

    try:
        stdout, stderr, return_code = run_command(f"xircuits compile {invalid_file}")

        expected_error_message = "Error reading"
        assert expected_error_message in stdout or expected_error_message in stderr, \
            f"Expected error message '{expected_error_message}' not found in output"
    finally:
        if os.path.exists(invalid_file):
            os.remove(invalid_file)

def test_15_compile_with_python_paths_file():
    run_command("xircuits init")

    example_file = "xai_components/xai_template/HelloTutorial.xircuits"

    # Create a JSON file with the component paths.
    json_file = "paths.json"
    paths_data = {
        "ConcatString": "xai_components/xai_utils/utils.py",
        "Print": "xai_components/xai_utils/utils.py"
    }
    with open(json_file, "w") as f:
        json.dump(paths_data, f)

    try:
        stdout, stderr, return_code = run_command(f"xircuits compile {example_file} --python-paths-file={json_file}")
        assert return_code == 0, "Compile command failed when using a python paths file."

        assert "Compiled" in stdout, "Expected 'Compiled' in output not found."

        py_file = example_file.replace(".xircuits", ".py")
        assert os.path.exists(py_file), f"Expected compiled file {py_file} not found."
    finally:
        if os.path.exists(json_file):
            os.remove(json_file)

def test_16_run_existing_py_file():
    run_command("xircuits init")

    # Find an example file in the xai_controlflow folder
    example_file = "xai_components/xai_controlflow/WorkflowComponentsExample.py"
    assert os.path.exists(example_file), f"Expected workflow file '{example_file}' not found."

    command = f"xircuits run {example_file} --example_input=Hello_Xircuits!"
    
    stdout, stderr, return_code = run_command(command)
    assert return_code == 0, "Expected return code 0 for successful execution"
    assert "Hello_Xircuits!" in stdout, "Expected input 'Hello_Xircuits!' not found in output"

def test_17_run_with_custom_output():
    """Test run with a custom output file name"""
    run_command("xircuits init")
    example_file = "xai_components/xai_controlflow/ControlflowBranch.xircuits"
    custom_output = "custom_output.py"
    # run with the custom output name
    stdout, stderr, return_code = run_command(f"xircuits run {example_file} {custom_output}")
    assert return_code == 0, "run command failed."
    
    # Check that the custom named Python file was created
    assert os.path.exists(custom_output), f"Expected output file '{custom_output}' not found."

def test_18_run_invalid_xircuits():
    run_command("xircuits init")

    # Create an invalid Xircuits file in the current directory.
    invalid_file = "invalid_workflow.xircuits"
    with open(invalid_file, "w") as f:
        f.write("{invalid_json}")  # Invalid content to simulate an error

    try:
        stdout, stderr, return_code = run_command(f"xircuits run {invalid_file}")

        expected_error_message = "Error reading"
        error_found = expected_error_message in stdout or expected_error_message in stderr
        assert error_found, f"Expected error message '{expected_error_message}' not found in output"
    finally:
        if os.path.exists(invalid_file):
            os.remove(invalid_file)

def test_19_run_with_python_paths_file():
    run_command("xircuits init")

    example_file = "xai_components/xai_template/HelloTutorial.xircuits"

    # Create a JSON file with component paths.
    json_file = "paths.json"
    paths_data = {
        "ConcatString": "xai_components/xai_utils/utils.py",
        "Print": "xai_components/xai_utils/utils.py"
    }
    with open(json_file, "w") as f:
        json.dump(paths_data, f)

    try:
        stdout, stderr, return_code = run_command(f"PYTHONPATH=. xircuits run {example_file} --python-paths-file={json_file}")

        assert return_code == 0, "Run command failed when using a python paths file."
        assert "Finished Executing" in stdout, "Expected 'Finished Executing' in output not found."

        py_file = example_file.replace(".xircuits", ".py")
        assert os.path.exists(py_file), f"Expected compiled file {py_file} not found."
    finally:
        if os.path.exists(json_file):
            os.remove(json_file)

def test_20_run_with_custom_arguments(tmp_path):
    import os
    import shutil
    from pathlib import Path

    # Change to the temporary directory.
    os.chdir(tmp_path)

    # Initialize Xircuits.
    stdout, stderr, return_code = run_command("xircuits init")
    assert return_code == 0, "Initialization failed."

    # Install the library from GitHub.
    stdout, stderr, return_code = run_command("xircuits fetch-only https://github.com/XpressAI/xai-tests", timeout=60)
    assert return_code == 0, "Library installation failed."

    # Determine the library directory.
    lib_dir = Path("xai_components") / "xai-tests"
    if not lib_dir.exists():
        lib_dir = Path("xai_components") / "xai_tests"
    assert lib_dir.exists(), f"Library directory not found in xai_components. Checked: {lib_dir}"

    # Define the example file path from the installed library.
    example_file = lib_dir / "ArgumentParameters.xircuits"
    assert example_file.exists(), f"Example file '{example_file}' not found in the library directory."

    # Define the output file path.
    output_file = tmp_path / "ArgumentParameters.py"

    # Run the workflow with custom arguments.
    cmd = f"xircuits run {example_file} {output_file} -- --str1=Hello_ --str2=Xircuits"
    stdout, stderr, return_code = run_command(cmd)
    assert return_code == 0, "Run command failed with custom arguments."
    assert "Hello_Xircuits" in stdout, "Expected output 'Hello_Xircuits' not found in run command output."
    assert output_file.exists(), f"Expected output file '{output_file}' not found."

def test_21_no_arguments_starts_jupyter_lab():
    stdout, stderr, return_code = run_command("xircuits", timeout=5, wait_for_exit=False, no_browser=True)

    output = stdout + stderr
    assert ("jupyter lab" in output.lower() or 
            "jupyter server" in output.lower() or
            "jupyterlab" in output), "Expected Jupyter Lab startup message not found in output."

def test_22_start_command():
    run_command("xircuits init")

    stdout, stderr, return_code = run_command("xircuits start", timeout=5, wait_for_exit=False, no_browser=True)

    output = stdout + stderr
    assert ("jupyter lab" in output.lower() or 
            "jupyter server" in output.lower() or 
            "jupyterlab" in output), "Expected Jupyter Lab startup indicators not found in output."

def test_23_start_with_extra_arguments():
    run_command("xircuits init")

    stdout, stderr, return_code = run_command("xircuits start --port=8899", timeout=5, wait_for_exit=False, no_browser=True)

    output = stdout + stderr
    assert "8899" in output, "Expected port 8899 to be indicated in the output."

def test_24_auto_initialization(tmp_path):
    os.chdir(tmp_path)

    # Remove existing directories to ensure a clean environment.
    if os.path.exists(".xircuits"):
        shutil.rmtree(".xircuits")
    if os.path.exists("xai_components"):
        shutil.rmtree("xai_components")

    process = subprocess.Popen(
        "XIRCUITS_INIT=1 xircuits --no-browser",
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        preexec_fn=os.setsid
    )

    time.sleep(5)

    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
    process.wait(timeout=5)

    assert os.path.exists(".xircuits"), "Expected .xircuits directory to be created during auto-initialization."
    assert os.path.exists("xai_components"), "Expected xai_components directory to be created during auto-initialization."

def test_25_reinit_in_already_initialized_directory():
    # Ensure that any existing initialization directories are removed from the current directory.
    if os.path.exists(".xircuits"):
        shutil.rmtree(".xircuits")
    if os.path.exists("xai_components"):
        shutil.rmtree("xai_components")

    # Run the command for the first time.
    stdout1, stderr1, rc1 = run_command("xircuits init", timeout=15)
    assert rc1 == 0, "First initialization failed."
    assert os.path.exists(".xircuits"), "Expected .xircuits directory to be created during first initialization."
    assert os.path.exists("xai_components"), "Expected xai_components directory to be created during first initialization."

    # Run the command a second time in the same directory.
    stdout2, stderr2, rc2 = run_command("xircuits init", timeout=15)
    output2 = stdout2 + stderr2

    # According to current behavior on re-initialization, the command should return a non-zero exit code or print a message indicating that the directory already exists.
    assert rc2 != 0, "Re-initializing in an already initialized directory should fail."
    expected_indicator = "file exists"
    assert expected_indicator in output2.lower() or "already initialized" in output2.lower(), \
        f"Expected message indicating reinitialization was handled gracefully not found in output:\n{output2}"

def test_26_start_in_non_initialized_directory(tmp_path):
    # Change to the isolated test directory.
    os.chdir(tmp_path)

    # Ensure that there are no pre-existing initialization directories in the current directory.
    if os.path.exists(".xircuits"):
        shutil.rmtree(".xircuits")
    if os.path.exists("xai_components"):
        shutil.rmtree("xai_components")

    stdout, stderr, return_code = run_command("xircuits start --no-browser", timeout=15, input_data="n\n")

    expected_prompt = "Would you like to initialize Xircuits in the current directory?"
    output = stdout + stderr
    assert expected_prompt in output, f"Expected prompt '{expected_prompt}' not found in output:\n{output}"

def test_27_xircuits_missing_xai_components(tmp_path):
    # Change to the isolated test directory.
    os.chdir(tmp_path)

    # Run 'xircuits init' to initialize the environment.
    stdout, stderr, return_code = run_command("xircuits init", timeout=15)
    assert return_code == 0, "Initialization failed."

    # Verify that the .xircuits directory exists and xai_components exists.
    assert (tmp_path / ".xircuits").exists(), "'.xircuits' directory not found after init."
    assert (tmp_path / "xai_components").exists(), "'xai_components' directory not found after init."

    # Remove the xai_components directory.
    shutil.rmtree(tmp_path / "xai_components")
    assert not (tmp_path / "xai_components").exists(), "'xai_components' directory should be missing."

    stdout, stderr, return_code = run_command("xircuits", timeout=15, input_data="n\n")
    output = stdout + stderr

    # Check that the expected initialization prompt appears.
    expected_prompt = "Would you like to initialize Xircuits in the current directory?"
    assert expected_prompt in output, f"Expected prompt '{expected_prompt}' not found in output:\n{output}"

def test_28_run_non_recursive_mode_with_install():
    stdout, stderr, rc = run_command("xircuits init", timeout=15)
    assert rc == 0, "Initialization failed."

    install_cmd = "xircuits install https://github.com/XpressAI/xai-tests"
    stdout, stderr, rc = run_command(install_cmd, timeout=60)
    assert rc == 0, "Library installation failed."

    # Determine the directory where the library was installed.
    lib_dir = os.path.join("xai_components", "xai-tests")
    if not os.path.exists(lib_dir):
        lib_dir = os.path.join("xai_components", "xai_tests")
    assert os.path.exists(lib_dir), f"Expected library directory not found in xai_components. Checked: {lib_dir}"

    # Define file paths.
    outer_file = os.path.join(lib_dir, "OuterWorkflowExample.xircuits")
    sub_file = os.path.join(lib_dir, "WorkflowComponentsExample.xircuits")
    assert os.path.exists(outer_file), f"Outer workflow file not found in {lib_dir}"

    outer_py = outer_file.replace(".xircuits", ".py")
    sub_py = sub_file.replace(".xircuits", ".py")

    # Run the command in non-recursive mode to compile only the outer file.
    run_cmd = f"xircuits run {outer_file} --non-recursive"
    stdout, stderr, rc = run_command(run_cmd, timeout=30)
    assert rc == 0, "Run command in non-recursive mode failed."

    # Check that the compiled outer file was created.
    assert os.path.exists(outer_py), f"Expected compiled file {outer_py} not found."
    assert not os.path.exists(sub_py), f"Sub-workflow file {sub_py} should not be compiled in non-recursive mode."

def test_29_compile_non_recursive_mode_with_install():
    stdout, stderr, rc = run_command("xircuits init", timeout=15)
    assert rc == 0, "Initialization failed."

    install_cmd = "xircuits install https://github.com/XpressAI/xai-tests"
    stdout, stderr, rc = run_command(install_cmd, timeout=60)
    assert rc == 0, "Library installation failed."

    # Determine the directory where the library was installed.
    lib_dir = os.path.join("xai_components", "xai-tests")
    if not os.path.exists(lib_dir):
        lib_dir = os.path.join("xai_components", "xai_tests")
    assert os.path.exists(lib_dir), f"Expected library directory not found in xai_components. Checked: {lib_dir}"

    # Define file paths.
    outer_file = os.path.join(lib_dir, "OuterWorkflowExample.xircuits")
    sub_file = os.path.join(lib_dir, "WorkflowComponentsExample.xircuits")
    assert os.path.exists(outer_file), f"Outer workflow file not found in {lib_dir}"

    outer_py = outer_file.replace(".xircuits", ".py")
    sub_py = sub_file.replace(".xircuits", ".py")

    # Run the compile command in non-recursive mode to compile only the outer file.
    compile_cmd = f"xircuits compile {outer_file} --non-recursive"
    stdout, stderr, rc = run_command(compile_cmd, timeout=30)
    assert rc == 0, "Compile command in non-recursive mode failed."

    # Check that the compiled outer file was created.
    assert os.path.exists(outer_py), f"Expected compiled file {outer_py} not found."
    assert not os.path.exists(sub_py), f"Sub-workflow file {sub_py} should not be compiled in non-recursive mode."

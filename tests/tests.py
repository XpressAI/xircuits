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
@pytest.fixture(scope="session")
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
def run_command(command, timeout=10, expected_output=None, check_stderr=False,
                expected_in_output=None, unexpected_in_output=None, 
                expected_files=None, wait_for_exit=True, no_browser=False):
    """
    Run a command and return its output.
    
    Args:
        command: Command string to run
        timeout: Timeout in seconds
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
    # Add --no-browser to start commands
    if no_browser and ('start' in command or 'jupyter' in command):
        command = command + " --no-browser"
        
    print(f"Running command: {command}")
    
    # Use a process object to run the command
    process = subprocess.Popen(
        command,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
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
                stdout_data, stderr_data = process.communicate(timeout=timeout)
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
        except:
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

def test_help_command():
    """Test that help command works properly"""
    stdout, stderr, return_code = run_command("xircuits --help")
    assert return_code == 0
    assert "usage:" in stdout
    assert "Xircuits Command Line Interface" in stdout

def test_init_command():
    """Test that init command creates necessary files"""
    stdout, stderr, return_code = run_command("xircuits init")
    assert return_code == 0
    assert "Xircuits has been initialized" in stdout
    
    # Check that necessary directories were created
    assert os.path.exists(".xircuits")
    assert os.path.exists("xai_components")

def test_examples_command():
    """Test that examples command downloads examples"""
    # Initialize first
    run_command("xircuits init")
    
    # Now download examples
    stdout, stderr, return_code = run_command("xircuits examples")
    assert return_code == 0
    assert "Example workflows ready" in stdout
    
    # Check that examples directory was created
    assert os.path.exists("examples")
    # Check for some common example file
    assert any(Path("examples").glob("*.xircuits"))

def test_compile_command():
    """Test that compile command works properly"""
    # Initialize and download examples
    run_command("xircuits init")
    
    workflow_path = "xai_components/xai_controlflow/"
    
    # Compile the file
    stdout, stderr, return_code = run_command(f"xircuits compile {example_file}")
    assert return_code == 0
    
    # Check that a Python file was created
    py_file = example_file.replace(".xircuits", ".py")
    assert os.path.exists(py_file)

def test_run_command():
    """Test that run command compiles and executes a workflow"""
    # Initialize and download examples
    run_command("xircuits init")
    run_command("xircuits examples")
    
    # Find a simple example file to run
    example_files = list(Path("examples").glob("hello_world.xircuits"))
    if not example_files:
        example_files = list(Path("examples").glob("*.xircuits"))
    
    assert example_files, "No example files found"
    example_file = str(example_files[0])
    
    # Run the file
    stdout, stderr, return_code = run_command(f"xircuits run {example_file}")
    # Note: Return code might not be 0 depending on the workflow
    
    # Check that a Python file was created
    py_file = example_file.replace(".xircuits", ".py")
    assert os.path.exists(py_file)

def test_list_libraries_command():
    """Test that list command shows available libraries"""
    # Initialize first
    run_command("xircuits init")
    
    # Run list command
    stdout, stderr, return_code = run_command("xircuits list")
    assert return_code == 0
    
    # Should contain some mention of libraries
    assert re.search(r"librar(y|ies)", stdout, re.IGNORECASE)

def test_install_library_command():
    """Test that install command installs a library"""
    # Initialize first
    run_command("xircuits init")
    
    # Install a library (use a small one for testing)
    stdout, stderr, return_code = run_command("xircuits install flask", timeout=60)
    
    # Check library was installed by running list
    list_stdout, _, _ = run_command("xircuits list")
    assert "flask" in list_stdout.lower()

# def test_start_command():
#     """Test that start command starts jupyter lab"""
#     # Initialize first
#     run_command("xircuits init")
    
#     # Check that start command launches jupyterlab (with no-browser flag)
#     stdout, stderr, _ = run_command("xircuits start", 
#                                    timeout=5, 
#                                    wait_for_exit=False,
#                                    expected_output="Jupyter Server",
#                                    no_browser=True)  # Add no_browser flag
    
#     # Check for signs that Jupyter Lab started
#     assert (
#         "jupyter lab" in stdout or 
#         "jupyterlab" in stdout.lower() or
#         "jupyter server" in stdout.lower()
#     )

def test_auto_initialization():
    """Test auto-initialization with environment variable"""
    # Run command with environment variable set
    cmd = "XIRCUITS_INIT=1 xircuits list"
    stdout, stderr, return_code = run_command(cmd)
    
    # Verify directories were created
    assert os.path.exists(".xircuits")
    assert os.path.exists("xai_components")

def test_working_directory_detection():
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

def test_compile_with_custom_output():
    """Test compiling with a custom output file name"""
    # Initialize and download examples
    run_command("xircuits init")
    run_command("xircuits examples")
    
    # Find an example file
    example_files = list(Path("examples").glob("*.xircuits"))
    assert example_files, "No example files found"
    example_file = str(example_files[0])
    
    custom_output = "custom_output.py"
    # Compile with custom output name
    stdout, stderr, return_code = run_command(f"xircuits compile {example_file} {custom_output}")
    assert return_code == 0
    
    # Check that the custom named Python file was created
    assert os.path.exists(custom_output)

def test_error_handling_invalid_command():
    """Test that invalid commands are handled gracefully"""
    stdout, stderr, return_code = run_command("xircuits invalid_command")
    # Should print help or error message, not crash
    assert return_code != 0
import os
import urllib.parse
import shutil
import importlib_resources

def is_empty(directory):
    # will return true for uninitialized submodules
    return not os.path.exists(directory) or not os.listdir(directory)

def is_valid_url(url):
    try:
        result = urllib.parse.urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False

def copy_from_installed_wheel(package_name, resource="", dest_path=None):
    if dest_path is None:
        dest_path = package_name

    # Get the resource reference
    ref = importlib_resources.files(package_name) / resource

    # Create the temporary file context
    with importlib_resources.as_file(ref) as resource_path:
        shutil.copytree(resource_path, dest_path)
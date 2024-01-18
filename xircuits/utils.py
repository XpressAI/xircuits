import os
import urllib
import urllib.parse
import pkg_resources
import shutil

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

    resource_path = pkg_resources.resource_filename(package_name, resource)
    shutil.copytree(resource_path, dest_path)
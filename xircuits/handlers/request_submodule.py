import os
from git import Repo
from git.remote import RemoteProgress
from pathlib import Path

class Progress(RemoteProgress):
    def update(self, *args):
        print(self._cur_line, end='\r', flush=True)

def get_submodule_config(user_query):
    
    import configparser
    config = configparser.ConfigParser()
    
    config.read('.xircuits/.gitmodules')
    
    submodule_keys = [submodule for submodule in config.sections() if user_query in submodule]
    if len(submodule_keys) == 0:
        print(user_query + " component library submodule not found.")
        return
        
    if len(submodule_keys) > 1:
        print("Multiple '" + user_query + "' found. Returning first instance.")

    submodule_key = submodule_keys.pop(0)
    
    submodule_path = config[submodule_key]["path"]
    submodule_url = config[submodule_key]["url"]
    
    return submodule_path, submodule_url


def request_submodule_library(component_library_query):

    # ensure syntax is as xai_components/xai_library_name
    if "xai" not in component_library_query:
        component_library_query = "xai_" + component_library_query

    if "xai_components" not in component_library_query:
        component_library_query = "xai_components/" + component_library_query
    
    submodule_path, submodule_url = get_submodule_config(component_library_query)
    
    print("Cloning " + submodule_path + " from " + submodule_url)
    Repo.clone_from(submodule_url, submodule_path, progress=Progress())


def get_submodules(repo, ref="master"):
    try:
        gitmodules_content = repo.get_contents(".gitmodules", ref=ref)
        gitmodules = gitmodules_content.decoded_content.decode("utf-8")
        
        submodules = []
        for line in gitmodules.split("\n"):
            if "path = " in line:
                submodules.append(line.split(" = ")[-1].strip())
        return submodules
    
    except:
        return []
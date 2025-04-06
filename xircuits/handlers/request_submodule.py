import subprocess

def get_submodule_config(user_query):
    import configparser
    config = configparser.ConfigParser()
    config.read('.xircuits/.gitmodules')
    
    submodule_keys = [submodule for submodule in config.sections() if user_query in submodule]
    if len(submodule_keys) == 0:
        raise ValueError(f"{user_query} component library submodule not found.")
    
    if len(submodule_keys) > 1:
        raise ValueError(f"Multiple instances of '{user_query}' found.")

    submodule_key = submodule_keys.pop(0)
    submodule_path = config[submodule_key]["path"]
    submodule_url = config[submodule_key]["url"]
    
    return submodule_path, submodule_url

def request_submodule_library(component_library_query) -> (bool, str):
    try:
        submodule_path, submodule_url = get_submodule_config(component_library_query)
        print("Cloning " + submodule_path + " from " + submodule_url)
        
        # Manually clone using the git CLI
        result = subprocess.run(
            ["git", "clone", submodule_url, submodule_path],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print("Error during cloning:", result.stderr)
            return False, result.stderr
        else:
            print(result.stdout)
            return True, f"Successfully cloned {submodule_path}."
    except ValueError as e:
        return False, str(e)

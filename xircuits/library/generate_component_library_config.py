import os
import posixpath
import json
import toml
from configparser import ConfigParser

def parse_gitmodules(gitmodules_path):
    config = ConfigParser()
    config.read(gitmodules_path)
    modules = []
    for section in config.sections():
        path = config.get(section, 'path', fallback=None)
        url = config.get(section, 'url', fallback=None)
        # Extract the library ID from the path
        library_id = path.replace('xai_components/xai_', '').upper()
        if path and url:
            modules.append({
                'path': posixpath.normpath(path),
                'url': url,
                'library_id': library_id 
            })
    return modules

def parse_toml_file(toml_path):
    try:
        with open(toml_path, 'r') as toml_file:
            data = toml.load(toml_file)
        return data
    except Exception as e:
        print(f"Error parsing TOML file at {toml_path}: {e}")
        return None 

def read_file_lines_to_list(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r') as file:
        return [line.strip() for line in file.readlines()]

def is_installed_component(directory_path):
    # Check for an __init__.py file to determine if the directory is an installed component
    return os.path.isfile(os.path.join(directory_path, '__init__.py'))

def extract_library_info(lib_path, base_path, status="remote"):
    # If __init__.py exists, confirm the component is installed
    if is_installed_component(lib_path):
        status = "installed"

    library_id = posixpath.basename(lib_path).replace('xai_', '').replace('xai-', '').upper()
    lib_info = {
        "name": posixpath.basename(lib_path),
        "library_id": library_id,
        "local_path": posixpath.join(base_path, posixpath.relpath(lib_path, start=base_path)),
        "status": status
    }

    toml_path = os.path.join(lib_path, 'pyproject.toml')
    if os.path.exists(toml_path):
        toml_data = parse_toml_file(toml_path)
        if toml_data:
            lib_info.update({
                "version": toml_data["project"].get("version", "N/A"),
                "description": toml_data["project"].get("description", "No description available."),
                "authors": toml_data["project"].get("authors", []),
                "license": toml_data["project"].get("license", "N/A"),
                "readme": toml_data["project"].get("readme", None),
                "repository": toml_data["project"].get("repository", None),
                "keywords": toml_data["project"].get("keywords", []),
                "requirements": toml_data["project"].get("dependencies", []),
                "default_example_path": toml_data["tool"].get("xircuits", {}).get("default_example_path", None),
            })

    return lib_info

def generate_component_library_config(base_path="xai_components", gitmodules_path=".gitmodules"):

    if not os.path.exists(gitmodules_path):
        # Construct the .xircuits/.gitmodules path
        gitmodules_path = posixpath.join('.xircuits', '.gitmodules')
    
    libraries = {}
    library_id_map = {}  # Map library IDs to library info
    
    # Parse submodules first and set them as "remote"
    if os.path.exists(gitmodules_path):
        submodules = parse_gitmodules(gitmodules_path)
        for submodule in submodules:
            submodule_path = posixpath.normpath(submodule['path'])
            library_info = {
                "name": posixpath.basename(submodule_path),
                "library_id": submodule['library_id'],  # Use the library ID from the submodule info
                "repository": submodule['url'],
                "local_path": submodule_path,
                "status": "remote"
            }
            libraries[submodule_path] = library_info
            library_id_map[submodule['library_id']] = library_info

    def explore_directory(directory, base_path):
        for item in os.listdir(directory):
            full_path = posixpath.normpath(posixpath.join(directory, item))
            if os.path.isdir(full_path) and item.startswith("xai_"):
                lib_info = extract_library_info(full_path, base_path)
                if lib_info:  # If a valid pyproject.toml is found
                    if lib_info['library_id'] in library_id_map:  # Match by library ID
                        # Update the existing entry with the new info
                        library_id_map[lib_info['library_id']].update(lib_info)
                    else:
                        libraries[full_path] = lib_info  # Add new library info
                # Recursively explore subdirectories
                explore_directory(full_path, base_path)

    explore_directory(base_path, base_path)

    return {"libraries": list(libraries.values())}

def save_component_library_config(filename=".xircuits/component_library_config.json"):
    libraries_data = generate_component_library_config()
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'w') as json_file:
        json.dump(libraries_data, json_file, indent=4)
    return libraries_data

def get_component_library_config(filename=".xircuits/component_library_config.json"):
    if os.path.exists(filename):
        try:
            with open(filename, 'r') as json_file:
                return json.load(json_file)
        except Exception as e:
            print(f"Error reading JSON file at {filename}: {e}")
            return None
    else:
        return save_component_library_config(filename)

if __name__ == "__main__":
    save_component_library_config()

import os
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
                'path': os.path.normpath(path),
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

def extract_library_info(lib_path, base_path, status="installed"):
    relative_lib_path = os.path.join(base_path, os.path.relpath(lib_path, start=base_path))
    toml_path = os.path.join(lib_path, 'pyproject.toml')

    if not os.path.exists(toml_path):
        return None

    toml_data = parse_toml_file(toml_path)

    # Check if TOML data was successfully parsed
    if toml_data is None:
        return None

    # Remove 'xai_' or 'xai-' prefix and convert to uppercase
    library_id = toml_data["project"]["name"].replace("xai_", "").replace("xai-", "").upper()

    requirements_rel_path = toml_data["tool"]["xircuits"].get("requirements_path", None)
    requirements_path = None
    requirements = []

    if requirements_rel_path is not None:
        requirements_path = os.path.join(lib_path, requirements_rel_path)
        if os.path.isfile(requirements_path):
            requirements = read_file_lines_to_list(requirements_path)
        else:
            requirements_path = None  # Reset to None if the file does not exist

    lib_info = {
        "name": toml_data["project"]["name"],
        "library_id": library_id,
        "version": toml_data["project"].get("version", "N/A"),
        "description": toml_data["project"].get("description", "No description available."),
        "authors": toml_data["project"].get("authors", []),
        "license": toml_data["project"].get("license", "N/A"),
        "readme": toml_data["project"].get("readme", None),
        "repository": toml_data["project"].get("repository", None),
        "keywords": toml_data["project"].get("keywords", []),
        "local_path": relative_lib_path,
        "status": status,
        "requirements_path": requirements_path,
        "requirements": requirements,
        "default_example_path": toml_data["tool"]["xircuits"].get("default_example_path", None),
    }

    return lib_info

def generate_component_library_config(base_path="xai_components", gitmodules_path=".gitmodules"):

    if not os.path.exists(gitmodules_path):
        # Construct the .xircuits/.gitmodules path
        gitmodules_path = os.path.join('.xircuits', '.gitmodules')
    
    libraries = {}
    library_id_map = {}  # Map library IDs to library info
    
    # Parse submodules first and set them as "remote"
    if os.path.exists(gitmodules_path):
        submodules = parse_gitmodules(gitmodules_path)
        for submodule in submodules:
            submodule_path = os.path.normpath(submodule['path'])
            library_info = {
                "name": os.path.basename(submodule_path),
                "library_id": submodule['library_id'],  # Use the library ID from the submodule info
                "repository": submodule['url'],
                "local_path": submodule_path,
                "status": "remote"
            }
            libraries[submodule_path] = library_info
            library_id_map[submodule['library_id']] = library_info

    def explore_directory(directory, base_path):
        for item in os.listdir(directory):
            full_path = os.path.normpath(os.path.join(directory, item))
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

if __name__ == "__main__":
    save_component_library_config()

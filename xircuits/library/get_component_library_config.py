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
        if path and url:
            modules.append({
                'path': path,
                'url': url
            })
    return modules

def parse_toml_file(toml_path):
    with open(toml_path, 'r') as toml_file:
        data = toml.load(toml_file)
    return data

def read_file_lines_to_list(file_path):
    # Reads file's lines into a list, stripping newline characters.
    if not os.path.exists(file_path):
        # print(f"File not found: {file_path}")
        return []

    with open(file_path, 'r') as file:
        return [line.strip() for line in file.readlines()]

def extract_library_info(lib_path, base_path):
    relative_lib_path = os.path.join(base_path, os.path.relpath(lib_path, start=base_path))
    toml_path = os.path.join(lib_path, 'pyproject.toml')
    
    if not os.path.exists(toml_path):
        print(f"pyproject.toml not found in {lib_path}. Skipping this library.")
        return None

    toml_data = parse_toml_file(toml_path)

    # Read requirements into array if the path is specified
    requirements_path = os.path.join(lib_path, toml_data["tool"]["xircuits"].get("requirements_path", ""))
    requirements = read_file_lines_to_list(requirements_path) if requirements_path else []

    lib_info = {
        "name": toml_data["project"]["name"],
        "version": toml_data["project"].get("version", ""),
        "description": toml_data["project"].get("description", ""),
        "authors": toml_data["project"].get("authors", []),
        "license": toml_data["project"].get("license", ""),
        "readme": toml_data["project"].get("readme", ""),
        "repository": toml_data["project"].get("repository", ""),
        "keywords": toml_data["project"].get("keywords", []),
        "local_path": relative_lib_path,
        "status": "installed",
        "requirements": requirements,
        "default_example_path": toml_data["tool"]["xircuits"].get("default_example_path", "")
    }

    return lib_info

def generate_component_library_config(base_path="xai_components", gitmodules_path=".gitmodules"):
    libraries = []
    existing_paths = set()

    for item in os.listdir(base_path):
        full_path = os.path.join(base_path, item)
        if os.path.isdir(full_path) and item.startswith("xai_"):
            lib_info = extract_library_info(full_path, base_path)
            if lib_info:
                libraries.append(lib_info)
                existing_paths.add(lib_info['local_path'])

    if os.path.exists(gitmodules_path):
        submodules = parse_gitmodules(gitmodules_path)
        for submodule in submodules:
            # Ensure submodule path is relative and correctly prefixed
            submodule_path = os.path.join(base_path, submodule['path'])
            if submodule_path not in existing_paths:
                libraries.append({
                    "name": os.path.basename(submodule_path),
                    "github_url": submodule['url'],
                    "local_path": submodule_path,
                    "status": "remote",
                    "readme": "",
                    "requirements": ""
                })

    return {"libraries": libraries}

def save_component_library_config(filename=".xircuits/component_library_config.json"):
    libraries_data = generate_component_library_config()
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'w') as json_file:
        json.dump(libraries_data, json_file, indent=4)

if __name__ == "__main__":
    save_component_library_config()
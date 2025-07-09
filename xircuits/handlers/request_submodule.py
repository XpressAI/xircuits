import subprocess
import posixpath
import json


def get_submodule_config(user_query):
    
    manifest_path = posixpath.join('.xircuits', 'xai_components_manifest.jsonl')
    # load all entries
    with open(manifest_path, 'r', encoding='utf-8') as f:
        subs = [json.loads(line) for line in f if line.strip()]

    matches = [
        s for s in subs
        if user_query in s.get('path', '') or user_query == s.get('library_id', '')
    ]
    if len(matches) == 0:
        raise ValueError(
            f"{user_query} component library submodule not found.")

    if len(matches) > 1:
        raise ValueError(f"Multiple instances of '{user_query}' found.")

    entry = matches[0]
    submodule_path = entry["path"]
    submodule_url = entry["url"]

    return submodule_path, submodule_url


def request_submodule_library(component_library_query) -> (bool, str):
    try:
        submodule_path, submodule_url = get_submodule_config(
            component_library_query)
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

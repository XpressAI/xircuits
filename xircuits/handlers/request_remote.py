import subprocess
import posixpath
import json


def get_remote_config(user_query):

    manifest_path = posixpath.join('.xircuits', "remote_lib_manifest", "index.json")
    # load all entries
    with open(manifest_path, 'r', encoding='utf-8') as f:
        entries = json.load(f)

    matches = [
        s for s in entries
        if user_query in s.get('path', '') or user_query == s.get('library_id', '')
    ]
    if len(matches) == 0:
        raise ValueError(
            f"{user_query} component library remote not found.")

    if len(matches) > 1:
        raise ValueError(f"Multiple instances of '{user_query}' found.")

    entry = matches[0]
    remote_path = entry["path"]
    remote_url = entry.get("repository") or entry.get("url")

    return remote_path, remote_url


def request_remote_library(component_library_query) -> (bool, str):
    try:
        remote_path, remote_url = get_remote_config(
            component_library_query)
        print("Cloning " + remote_path + " from " + remote_url)

        # Manually clone using the git CLI
        result = subprocess.run(
            ["git", "clone", remote_url, remote_path],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            print("Error during cloning:", result.stderr)
            return False, result.stderr
        else:
            print(result.stdout)
            return True, f"Successfully cloned {remote_path}."
    except ValueError as e:
        return False, str(e)

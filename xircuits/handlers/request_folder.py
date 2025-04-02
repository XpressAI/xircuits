import os
import json
import subprocess
import re
from urllib import request, parse
from tqdm import tqdm

def get_folder_contents(owner, repo, folder, branch="master"):
    """
    Retrieve folder contents using GitHub's REST API.
    """
    api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{folder}?ref={branch}"
    try:
        with request.urlopen(api_url) as response:
            data = json.load(response)
        return data
    except Exception as e:
        print(f"Error retrieving folder contents for '{folder}': {e}")
        return None

def request_folder(folder, repo_name="XpressAi/Xircuits", branch="master"):
    """
    Download a folder from a GitHub repository using manual HTTP requests.
    """
    print("Downloading " + folder + " from " + repo_name + " branch " + branch)
    try:
        owner, repo = repo_name.split("/")
    except Exception as e:
        print("Invalid repo_name format. It should be 'owner/repo'.")
        return

    # Get initial folder contents via GitHub REST API.
    contents = get_folder_contents(owner, repo, folder, branch)
    if contents is None:
        return

    # Create the local folder if it does not exist.
    if not os.path.exists(folder):
        os.makedirs(folder, exist_ok=True)
    else:
        print(folder + " already exists.")

    base_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}"
    urls = {}

    # Use a queue to process the contents recursively.
    queue = contents if isinstance(contents, list) else [contents]
    while queue:
        item = queue.pop(0)
        if item["type"] == "dir":
            local_dir = item["path"]
            if not os.path.exists(local_dir):
                os.makedirs(local_dir, exist_ok=True)
            sub_contents = get_folder_contents(owner, repo, item["path"], branch)
            if sub_contents:
                if isinstance(sub_contents, list):
                    queue.extend(sub_contents)
                else:
                    queue.append(sub_contents)
        elif item["type"] == "file":
            file_url = base_url + "/" + parse.quote(item["path"])
            urls[file_url] = item["path"]

    # Download each file.
    for url in tqdm(urls, desc="Downloading files"):
        try:
            request.urlretrieve(url, urls[url])
        except Exception as e:
            print(f"Unable to retrieve {urls[url]}. Skipping... Error: {e}")

def extract_library_details_from_url(github_url):
    """Extract organization and repository name from a GitHub URL."""
    match = re.search(r'github\.com/([^/]+)/xai-(.+)$', github_url)
    if not match:
        raise ValueError("Invalid GitHub URL format.")
    org_name = match.group(1)
    repo_name = match.group(2)
    return org_name, repo_name

def clone_repo(github_url, target_path):
    """Clone a repository from a GitHub URL to the specified target path."""
    try:
        subprocess.run(["git", "clone", github_url, target_path], check=True)
    except subprocess.CalledProcessError:
        print(f"Error: Unable to clone {github_url} into {target_path}. "
              "The directory may already exist and is not empty.")
        return target_path
    return target_path

def clone_from_github_url(github_url: str) -> str:
    """
    Clone the repository from the GitHub URL.
    """
    org_name, repo_name = extract_library_details_from_url(github_url)
    local_lib_path = repo_name.replace('-', '_')
    target_path = f"xai_components/xai_{local_lib_path}"
    return clone_repo(github_url, target_path)
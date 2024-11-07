from tqdm import tqdm
import os
from urllib import request, parse
from github import Github, GithubException
from typing import Optional
from .request_submodule import get_submodules
import subprocess
import re 

def request_folder(folder, repo_name="XpressAi/Xircuits", branch="master"):
    print("Downloading " + folder + " from " + repo_name + " branch " + branch)
    g = Github()
    
    try:
        repo = g.get_repo(repo_name)
        contents = repo.get_contents(folder, ref=branch)
    except GithubException as e:
        if e.status == 403:
            print("pyGithub API rate limit exceeded. If you're trying to fetch Xircuits components, you can use `xircuits-components`.")
        else:
            print(folder + " from " + repo_name + " branch " + branch + " does not exist!")
        return 
    except Exception as e:
        print("An error occurred: " + str(e))
        return

    if not os.path.exists(folder):
        os.mkdir(folder)
    else:
        print(folder + " already exists.")
    
    base_url = "https://raw.githubusercontent.com/" + repo_name + "/" + branch    
    urls = {}
    
    while len(contents)>0:
        file_content = contents.pop(0)
        if file_content.type=='dir':
            if not os.path.exists(file_content.path):
                os.mkdir(file_content.path)
            contents.extend(repo.get_contents(file_content.path, ref=branch))

        else:
            file_url = base_url + "/" + parse.quote(file_content.path)
            urls.update({file_url: file_content.path})

    submodules = get_submodules(repo, branch)

    for url in tqdm(urls):
        try:
            request.urlretrieve(url, urls[url])
        except:
            if urls[url] not in submodules:
                print("Unable to retrieve " + urls[url] + ". Skipping...")


def extract_library_details_from_url(github_url):
    """Extract organization and repository name from GitHub URL."""
    match = re.search(r'github.com/([^/]+)/xai-(.+)$', github_url)
    if not match:
        raise ValueError("Invalid GitHub URL format.")

    org_name = match.group(1)
    repo_name = match.group(2)
    return org_name, repo_name

def clone_repo(github_url, target_path):
    """Clone a repository from GitHub URL to the specified target path."""
    try:
        subprocess.run(["git", "clone", github_url, target_path], check=True)
    except subprocess.CalledProcessError:
        print(f"Error: Unable to clone {github_url} into {target_path}. The directory may already exist and is not empty.")
        return target_path

    return target_path

def clone_from_github_url(github_url: str) -> str:
    # Create a Github instance
    g = Github()

    org_name, repo_name = extract_library_details_from_url(github_url)
    local_lib_path = repo_name.replace('-', '_')
    target_path = f"xai_components/xai_{local_lib_path}"

    # Retrieve the repository
    try:
        repo = g.get_repo(f"{org_name}/xai-{repo_name}")

        # Check if repo exists, otherwise GithubException will be raised
        if repo:
            return clone_repo(github_url, target_path)
        else:
            raise ValueError(f"No repository found at {github_url}")

    except GithubException as e:
        raise RuntimeError(f"Error accessing the repository: {e}")
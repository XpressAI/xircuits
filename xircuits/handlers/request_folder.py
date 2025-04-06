import re
import subprocess

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
        print(
            f"Error: Unable to clone {github_url} into {target_path}. "
            "The directory may already exist and is not empty."
        )
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

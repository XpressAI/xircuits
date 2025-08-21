import subprocess
import shutil
from pathlib import Path
from tomlkit import parse, dumps

def remove_git_directory(repo_path):
    """Remove the .git directory from a cloned repository"""
    git_path = Path(repo_path) / ".git"
    if git_path.exists():
        try:
            shutil.rmtree(git_path)
            print(f"✅ Removed .git directory from {repo_path}")
            return True
        except Exception as e:
            print(f"⚠️  Warning: Could not remove .git directory from {repo_path}: {e}")
            return False
    return True

def get_git_info(repo_path):
    """Returns (tag_or_commit, is_tag) from a local Git repo before .git removal"""
    try:
        # Try to get current tag
        tag = subprocess.check_output(
            ["git", "describe", "--tags", "--exact-match"],
            cwd=repo_path,
            stderr=subprocess.DEVNULL,
            text=True
        ).strip()
        return tag, True
    except subprocess.CalledProcessError:
        # Fallback: get commit hash
        try:
            commit = subprocess.check_output(
                ["git", "rev-parse", "HEAD"],
                cwd=repo_path,
                text=True
            ).strip()
            return commit[:12], False  # Shorten SHA
        except subprocess.CalledProcessError:
            # If git commands fail, return a default
            return "latest", False

def update_pyproject_toml(library_name, member_path, repo_url, ref):
    """Update pyproject.toml with library information"""
    pyproject_file = Path("pyproject.toml")
    
    # Create pyproject.toml if it doesn't exist
    if not pyproject_file.exists():
        create_default_pyproject(pyproject_file)
    
    try:
        doc = parse(pyproject_file.read_text(encoding="utf-8"))
    except Exception as e:
        print(f" Warning: Could not parse pyproject.toml: {e}")
        return False

    # Ensure project section exists
    if "project" not in doc:
        doc["project"] = {}
    
    # Update dependencies
    deps = doc["project"].get("dependencies", [])
    spec = f'{library_name} @ git+{repo_url}@{ref}'
    
    # Remove existing entry for this library
    deps = [d for d in deps if not (isinstance(d, str) and d.startswith(f"{library_name} @"))]
    deps.append(spec)
    doc["project"]["dependencies"] = deps

    # Set up tool.uv.sources for local workspace override
    if "tool" not in doc:
        doc["tool"] = {}
    if "uv" not in doc["tool"]:
        doc["tool"]["uv"] = {}
    if "sources" not in doc["tool"]["uv"]:
        doc["tool"]["uv"]["sources"] = {}
    
    doc["tool"]["uv"]["sources"][library_name] = {"workspace": True}

    # Register as workspace member
    if "workspace" not in doc["tool"]["uv"]:
        doc["tool"]["uv"]["workspace"] = {}
    if "members" not in doc["tool"]["uv"]["workspace"]:
        doc["tool"]["uv"]["workspace"]["members"] = []
    
    members = doc["tool"]["uv"]["workspace"]["members"]
    if member_path not in members:
        members.append(member_path)

    try:
        pyproject_file.write_text(dumps(doc), encoding="utf-8")
        print(f"✅ Updated pyproject.toml: {library_name} → {ref}")
        return True
    except Exception as e:
        print(f"⚠️  Warning: Could not write pyproject.toml: {e}")
        return False

def create_default_pyproject(pyproject_file):
    """Create a minimal pyproject.toml file"""
    default_content = """[project]
name = "xircuits-workspace"
version = "0.1.0"
dependencies = []

[tool.uv]
sources = {}

[tool.uv.workspace]
members = []
"""
    try:
        pyproject_file.write_text(default_content, encoding="utf-8")
        print("✅ Created default pyproject.toml")
    except Exception as e:
        print(f"⚠️  Warning: Could not create pyproject.toml: {e}")

def extract_repo_url_from_path(library_config, library_name):
    """Extract repository URL from library configuration"""
    # This should extract the repo URL from your library config
    # You'll need to adapt this based on your config structure
    repo_url = library_config.get("repository")
    if repo_url:
        return repo_url
    
    # Fallback: construct URL based on naming convention
    return f"https://github.com/XpressAI/{library_name}.git"
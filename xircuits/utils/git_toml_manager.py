import subprocess
import shutil
from pathlib import Path
import tomlkit
from tomlkit import parse, dumps


def remove_git_directory(repo_path):
    """Remove the .git directory from a cloned repository."""
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
    """
    Returns (tag_or_commit, is_tag) from a local Git repo before .git removal.
    Prefers an exact tag; falls back to short commit hash.
    """
    try:
        tag = subprocess.check_output(
            ["git", "describe", "--tags", "--exact-match"],
            cwd=repo_path,
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
        return tag, True
    except subprocess.CalledProcessError:
        try:
            commit = subprocess.check_output(
                ["git", "rev-parse", "HEAD"],
                cwd=repo_path,
                text=True,
            ).strip()
            return commit[:12], False
        except subprocess.CalledProcessError:
            return "latest", False


def _read_member_dist_name(member_path, fallback_name=None):
    """
    Read [project].name from the member's pyproject.toml, falling back to given name.
    Ensures the dependency name matches the workspace member distribution name.
    """
    p = Path(member_path) / "pyproject.toml"
    if p.exists():
        try:
            d = parse(p.read_text(encoding="utf-8"))
            name = d.get("project", {}).get("name")
            if isinstance(name, str) and name.strip():
                return name.strip()
        except Exception:
            pass
    return fallback_name


def update_pyproject_toml(library_name, member_path, repo_url, ref, is_tag):
    """
    VENDORING (no cleanups):
      - Add the member to [tool.uv.workspace].members
      - Ensure [project].dependencies includes the member's NAME (plain, no URL)
      - Map that NAME to { workspace = true } under [tool.uv.sources]
      - Record upstream under [tool.xircuits.components."<name>"] with {source, tag|rev, path}
    """
    pyproject_file = Path("pyproject.toml")
    if not pyproject_file.exists():
        create_default_pyproject(pyproject_file)

    try:
        doc = parse(pyproject_file.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"⚠️  Warning: Could not parse pyproject.toml: {e}")
        return False

    # Ensure required tables exist
    if "project" not in doc:
        doc["project"] = tomlkit.table()
    if "tool" not in doc:
        doc["tool"] = tomlkit.table()
    if "uv" not in doc["tool"]:
        doc["tool"]["uv"] = tomlkit.table()
    if "sources" not in doc["tool"]["uv"]:
        doc["tool"]["uv"]["sources"] = tomlkit.table()
    if "workspace" not in doc["tool"]["uv"]:
        doc["tool"]["uv"]["workspace"] = tomlkit.table()
    if "xircuits" not in doc["tool"]:
        doc["tool"]["xircuits"] = tomlkit.table()
    if "components" not in doc["tool"]["xircuits"]:
        doc["tool"]["xircuits"]["components"] = tomlkit.table()

    # Resolve the real dist name from the member pyproject (fallback to user-provided)
    dist_name = _read_member_dist_name(member_path, fallback_name=library_name)
    if not dist_name:
        print("⚠️  Warning: Could not determine distribution name; skipping.")
        return False

    # Ensure [project].dependencies includes the plain dist_name (no direct URL).
    deps = doc["project"].get("dependencies")
    if deps is None:
        deps = tomlkit.array()
        deps.multiline(True)
        doc["project"]["dependencies"] = deps

    # Add the plain name if it's not already present as a plain entry.
    existing_plain = {d.strip() for d in deps if isinstance(d, str)}
    if dist_name not in existing_plain:
        deps.append(dist_name)
        deps.multiline(True)

    # Map the name to the local workspace
    doc["tool"]["uv"]["sources"][dist_name] = {"workspace": True}

    # Ensure member_path is a workspace member
    members = doc["tool"]["uv"]["workspace"].get("members")
    if members is None:
        members = tomlkit.array()
        members.multiline(True)
        doc["tool"]["uv"]["workspace"]["members"] = members
    if member_path not in members:
        members.append(member_path)
        members.multiline(True)

    # Record upstream in [tool.xircuits.components."<name>"]
    components = doc["tool"]["xircuits"]["components"]
    entry = tomlkit.table()
    entry.add("source", repo_url)
    entry.add("path", str(member_path))
    entry.add("tag" if is_tag else "rev", ref)
    components[dist_name] = entry

    try:
        pyproject_file.write_text(dumps(doc), encoding="utf-8")
        print(f"✅ Workspace config updated: {dist_name} ← {('tag ' if is_tag else 'rev ')}{ref}")
        return True
    except Exception as e:
        print(f"⚠️  Warning: Could not write pyproject.toml: {e}")
        return False


def create_default_pyproject(pyproject_file):
    """Create a minimal pyproject.toml file (workspace-ready, vendoring-friendly)."""
    default = tomlkit.document()

    project = tomlkit.table()
    project.add("name", "xircuits-workspace")
    project.add("version", "0.1.0")
    project.add("requires-python", ">=3.10")
    deps = tomlkit.array(); deps.multiline(True)
    project.add("dependencies", deps)
    default.add("project", project)

    tool = tomlkit.table()

    uv = tomlkit.table()
    uv.add("sources", tomlkit.table())
    ws = tomlkit.table()
    members = tomlkit.array(); members.multiline(True)
    ws.add("members", members)
    uv.add("workspace", ws)
    tool.add("uv", uv)

    xircuits = tomlkit.table()
    xircuits.add("components", tomlkit.table())  # <-- renamed from "vendored"
    tool.add("xircuits", xircuits)

    default.add("tool", tool)

    pyproject_file.write_text(dumps(default), encoding="utf-8")
    print("✅ Created default pyproject.toml")

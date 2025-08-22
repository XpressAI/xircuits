import subprocess
import shutil
from pathlib import Path
import tomlkit
from tomlkit import parse, dumps
import sys
from typing import Optional

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
        ws_tbl = tomlkit.table()
        ws_members = tomlkit.array(); ws_members.multiline(True)
        ws_tbl.add("members", ws_members)
        doc["tool"]["uv"]["workspace"] = ws_tbl
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
        deps = tomlkit.array(); deps.multiline(True)
        doc["project"]["dependencies"] = deps
    existing_plain = {d.strip() for d in deps if isinstance(d, str)}
    if dist_name not in existing_plain:
        deps.append(dist_name)
        deps.multiline(True)

    # Map the name to the local workspace in [tool.uv.sources]
    doc["tool"]["uv"]["sources"][dist_name] = {"workspace": True}

    # Ensure member_path is a workspace member
    members = doc["tool"]["uv"]["workspace"].get("members")
    if members is None:
        members = tomlkit.array(); members.multiline(True)
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

    # This whole section just to add a space after workspace. Curse you OCD. 
    # Rebuild the [tool.uv] table so that 'workspace' is reinserted after a single nl()
    uv = doc["tool"]["uv"]
    ws_tbl = uv["workspace"]
    new_uv = tomlkit.table()
    for key, val in uv.items():
        if key == "workspace":
            continue
        new_uv.add(key, val)
    new_uv.add(tomlkit.nl())
    new_uv.add("workspace", ws_tbl)
    doc["tool"]["uv"] = new_uv

    try:
        pyproject_file.write_text(dumps(doc), encoding="utf-8")
        print(f"✅ Workspace config updated: {dist_name} ← {('tag ' if is_tag else 'rev ')}{ref}")
        return True
    except Exception as e:
        print(f"⚠️  Warning: Could not write pyproject.toml: {e}")
        return False

def create_default_pyproject(pyproject_file):
    """Create a minimal pyproject.toml with a fixed project name and current Python."""
    default = tomlkit.document()

    # [project]
    project = tomlkit.table()
    project.add("name", "xircuits-project-template")
    project.add("version", "0.1.0")
    project.add("requires-python", f">={sys.version_info.major}.{sys.version_info.minor}")
    deps = tomlkit.array(); deps.multiline(True)
    project.add("dependencies", deps)
    default.add("project", project)

    tool = tomlkit.table()
    uv = tomlkit.table()
    uv.add("sources", tomlkit.table())
    uv.add(tomlkit.nl())

    ws = tomlkit.table()
    members = tomlkit.array(); members.multiline(True)
    ws.add("members", members)
    uv.add("workspace", ws)

    tool.add("uv", uv)

    # [tool.xircuits]
    xircuits = tomlkit.table()
    xircuits.add("components", tomlkit.table())
    tool.add("xircuits", xircuits)

    default.add("tool", tool)

    pyproject_file.write_text(dumps(default), encoding="utf-8")
    print("✅ Created default pyproject.toml")


def _norm_path(p: str) -> str:
    return str(Path(p)).replace("\\", "/").rstrip("/")

def remove_from_pyproject_toml(member_path: str, name_hint: Optional[str] = None) -> bool:
    """
    Remove a component from pyproject.toml using either its recorded member path
    (e.g. 'xai_components/xai_utils') and/or a dist name hint (e.g. 'xai_utils').

    This will:
      - drop dist name from [project].dependencies
      - remove dist from [tool.uv.sources]
      - remove member_path from [tool.uv.workspace].members
      - remove [tool.xircuits.components."<dist_name>"]

    Returns True if any change was written.
    """
    pyproject_file = Path("pyproject.toml")
    if not pyproject_file.exists():
        print("⚠️  pyproject.toml not found; nothing to update.")
        return False

    try:
        doc = parse(pyproject_file.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"⚠️  Warning: Could not parse pyproject.toml: {e}")
        return False

    changed = False
    target_path = _norm_path(member_path)

    tool = doc.get("tool", tomlkit.table())
    uv = tool.get("uv", tomlkit.table())
    sources = uv.get("sources", tomlkit.table())
    workspace = uv.get("workspace", tomlkit.table())
    members = workspace.get("members", tomlkit.array())
    xircuits = tool.get("xircuits", tomlkit.table())
    components = xircuits.get("components", tomlkit.table())

    # Figure out the dist name to remove:
    # Prefer matching components entry by path; fall back to name_hint.
    dist_name = None
    matched_key_by_path = None
    for key, val in list(components.items()):
        try:
            recorded_path = _norm_path(val.get("path", ""))
            if recorded_path == target_path or Path(recorded_path).name == Path(target_path).name:
                matched_key_by_path = key
                break
        except Exception:
            continue

    if matched_key_by_path:
        dist_name = matched_key_by_path
    elif isinstance(name_hint, str) and name_hint in components:
        dist_name = name_hint
    else:
        # As a last resort, use the hint even if it's not in components; this still allows
        # cleaning project.dependencies and uv.sources if they exist.
        dist_name = name_hint

    # Remove member_path from workspace.members
    if isinstance(members, tomlkit.items.Array):
        new_members = tomlkit.array(); new_members.multiline(True)
        for item in members:
            keep = True
            if isinstance(item, str):
                ip = _norm_path(item)
                if ip == target_path or Path(ip).name == Path(target_path).name:
                    keep = False
            if keep:
                new_members.append(item)
            else:
                changed = True
        workspace["members"] = new_members

    # Remove dist from project.dependencies (if we know the name)
    if dist_name and "project" in doc:
        deps = doc["project"].get("dependencies")
        if isinstance(deps, tomlkit.items.Array):
            new_deps = tomlkit.array(); new_deps.multiline(True)
            for d in deps:
                if isinstance(d, str) and d.strip() == dist_name:
                    changed = True
                    continue
                new_deps.append(d)
            doc["project"]["dependencies"] = new_deps

    # Remove dist from uv.sources
    if dist_name and isinstance(sources, tomlkit.items.Table) and dist_name in sources:
        try:
            del sources[dist_name]
            changed = True
        except Exception:
            pass

    # Remove component metadata
    if isinstance(components, tomlkit.items.Table):
        removed_component = False
        if dist_name and dist_name in components:
            try:
                del components[dist_name]
                removed_component = True
            except Exception:
                pass
        else:
            # Match by path if key lookup failed
            for key, val in list(components.items()):
                try:
                    if _norm_path(val.get("path", "")) == target_path:
                        del components[key]
                        removed_component = True
                except Exception:
                    continue
        if removed_component:
            changed = True

    # Reapply the "workspace after a single newline" formatting tweak
    if "tool" in doc and "uv" in doc["tool"] and "workspace" in doc["tool"]["uv"]:
        uv_tbl = doc["tool"]["uv"]
        ws_tbl = uv_tbl["workspace"]
        new_uv = tomlkit.table()
        for k, v in uv_tbl.items():
            if k == "workspace":
                continue
            new_uv.add(k, v)
        new_uv.add(tomlkit.nl())
        new_uv.add("workspace", ws_tbl)
        doc["tool"]["uv"] = new_uv

    if not changed:
        return False

    try:
        pyproject_file.write_text(dumps(doc), encoding="utf-8")
        return True
    except Exception as e:
        print(f"⚠️  Warning: Could not write pyproject.toml: {e}")
        return False

import subprocess
import shutil
from pathlib import Path
import tomlkit
from tomlkit import parse, dumps
import sys
import re
from typing import Optional, Iterable

from .requirements_utils import normalize_requirements_list

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

_HEADER_RE = re.compile(r'^\s*\[(?:\[.*\]|[^\]]+)\]\s*$')

def _is_header(line: str) -> bool:
    return bool(_HEADER_RE.match(line))

def _reformat_toml_text(text: str) -> str:
    """
    Normalize whitespace:
      - ensure exactly ONE blank line after any table/array-of-table header
      - collapse 3+ blank lines anywhere to exactly ONE blank line
      - trim leading blanks; ensure exactly one trailing newline
    """
    # Normalize newlines and strip trailing spaces per line
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    lines = [ln.rstrip() for ln in text.split('\n')]

    out: list[str] = []
    n = len(lines)
    for i, ln in enumerate(lines):
        out.append(ln)
        if _is_header(ln):
            # If next line exists and is NOT blank, insert a blank line
            if i + 1 < n and lines[i + 1].strip() != '':
                out.append('')

    text = '\n'.join(out)

    # Collapse runs of 3+ newlines to just 2 (i.e., exactly one blank line)
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Remove leading blank lines; ensure single trailing newline
    text = text.lstrip('\n').rstrip() + '\n'
    return text

def _write_toml_with_format(doc, path: Path) -> None:
    """Dump with tomlkit, then normalize whitespace."""
    raw = dumps(doc)
    formatted = _reformat_toml_text(raw)
    path.write_text(formatted, encoding='utf-8')

def _ensure_project_tables(doc):
    if "project" not in doc:
        doc["project"] = tomlkit.table()
    proj = doc["project"]
    if "dependencies" not in proj:
        arr = tomlkit.array(); arr.multiline(True)
        proj["dependencies"] = arr
    if "optional-dependencies" not in proj:
        proj["optional-dependencies"] = tomlkit.table()
    return proj

def _extras_table(doc):
    proj = _ensure_project_tables(doc)
    return proj["optional-dependencies"]

def _extra_key_for_library(library_name: str) -> str:
    """
    Normalize to 'xai-<name>' (hyphens), accepting inputs like:
      'xai_tensorflow', 'xai-tensorflow', 'tensorflow',
      'xai_components/xai_tensorflow', etc.
    """
    raw = (library_name or "").strip().lower().replace("\\", "/")
    seg = raw.split("/")[-1]
    if seg.startswith("xai_"):
        seg = seg[4:]
    elif seg.startswith("xai-"):
        seg = seg[4:]
    seg = seg.replace("_", "-")
    return f"xai-{seg}" if seg else "xai-unknown"

def _set_extra(doc, key: str, specs: Iterable[str]) -> None:
    arr = tomlkit.array()
    for s in normalize_requirements_list(list(specs or [])):
        arr.append(s)
    arr.multiline(True)
    _extras_table(doc)[key] = arr

def set_library_extra(library_name: str, requirement_specs: Iterable[str]) -> bool:
    """
    Set/overwrite the per-library extra (e.g., 'xai-tensorflow') with normalized specs.
    Returns True if pyproject.toml was written.
    """
    path = Path("pyproject.toml")
    if not path.exists():
        create_default_pyproject(path)
    doc = parse(path.read_text(encoding="utf-8"))

    key = _extra_key_for_library(library_name)
    _set_extra(doc, key, requirement_specs)

    _write_toml_with_format(doc, path)
    print(f"✅ Updated extra [{key}]")
    return True

def remove_library_extra(library_name: str) -> bool:
    """
    Remove the per-library extra (e.g., 'xai-sklearn').
    """
    path = Path("pyproject.toml")
    if not path.exists():
        return False
    doc = parse(path.read_text(encoding="utf-8"))

    key = _extra_key_for_library(library_name)
    extras = _extras_table(doc)
    if key in extras:
        del extras[key]
        _write_toml_with_format(doc, path)
        print(f"✅ Removed extra [{key}]")
        return True
    return False

def rebuild_meta_extra(meta_key: str = "xai-components") -> bool:
    """
    Set meta extra to the union of all 'xai-*' extras (excluding meta itself).
    """
    path = Path("pyproject.toml")
    if not path.exists():
        create_default_pyproject(path)
    doc = parse(path.read_text(encoding="utf-8"))

    extras = _extras_table(doc)
    union: list[str] = []
    for key, arr in list(extras.items()):
        if key == meta_key:
            continue
        if not isinstance(arr, tomlkit.items.Array):
            continue
        union.extend([str(x) for x in arr if isinstance(x, str)])

    _set_extra(doc, meta_key, union)
    _write_toml_with_format(doc, path)
    print(f"✅ Rebuilt meta extra [{meta_key}]")
    return True


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

    try:
        _write_toml_with_format(doc, pyproject_file)
        print(f"✅ Workspace config updated: {dist_name} ← {('tag ' if is_tag else 'rev ')}{ref}")
        return True
    except Exception as e:
        print(f"⚠️  Warning: Could not write pyproject.toml: {e}")
        return False

def create_default_pyproject(pyproject_file: Path):
    """
    Minimal baseline with empty base deps and empty meta extra 'xai-components'.
    """
    default = tomlkit.document()

    # [project]
    project = tomlkit.table()
    project.add("name", "xircuits-project-template")
    project.add("version", "0.1.0")
    project.add("requires-python", f">={sys.version_info.major}.{sys.version_info.minor}")
    deps = tomlkit.array(); deps.multiline(True)
    deps.append("xircuits")
    project.add("dependencies", deps)

    # [project.optional-dependencies]
    opt = tomlkit.table()
    # meta extra present from the start (empty union)
    opt.add("xai-components", tomlkit.array().multiline(True))
    project.add("optional-dependencies", opt)

    default.add("project", project)

    tool = tomlkit.table()

    uv = tomlkit.table()
    uv.add("sources", tomlkit.table())

    ws = tomlkit.table()
    ws.add("members", tomlkit.array().multiline(True))
    uv.add("workspace", ws)
    tool.add("uv", uv)

    xircuits = tomlkit.table()
    xircuits.add("components", tomlkit.table())
    tool.add("xircuits", xircuits)

    default.add("tool", tool)

    _write_toml_with_format(default, pyproject_file)
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

    if not changed:
        return False

    try:
        _write_toml_with_format(doc, pyproject_file)
        return True
    except Exception as e:
        print(f"⚠️  Warning: Could not write pyproject.toml: {e}")
        return False
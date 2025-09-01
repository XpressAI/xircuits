from pathlib import Path
from typing import Iterable, Optional
import shutil
import tomlkit
from tomlkit import parse, dumps

from .requirements_utils import normalize_requirements_list

def _is_header(line: str) -> bool:
    line = line.strip()
    return bool(line) and line.startswith("[") and line.endswith("]")

def _reformat_toml_text(text: str) -> str:
    # Normalize newlines, trim trailing spaces per line
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [ln.rstrip() for ln in text.split("\n")]

    out = []
    n = len(lines)
    for i, ln in enumerate(lines):
        # Add blank line before headers (except the first one) to separate sections
        if _is_header(ln) and i > 0 and out and out[-1].strip():
            out.append("")
        out.append(ln)
        # Remove the logic that was adding blank lines after headers

    text = "\n".join(out)

    # Collapse any 3+ blank lines to exactly one blank line
    while "\n\n\n" in text:
        text = text.replace("\n\n\n", "\n\n")

    # Trim leading blanks; ensure single trailing newline
    text = text.lstrip("\n").rstrip() + "\n"
    return text

def _write_toml_with_format(doc, path: Path) -> None:
    raw = dumps(doc)
    formatted = _reformat_toml_text(raw)
    path.write_text(formatted, encoding="utf-8")


# ---------- Minimal project bootstrap ----------

def create_default_pyproject(pyproject_file: Path) -> None:
    """
    Minimal, clean file:
      [project]
      name/version/requires-python
      dependencies = []
      [project.optional-dependencies] (empty)
      [tool.xircuits.components] (empty)
    """
    doc = tomlkit.document()

    project = tomlkit.table()
    project.add("name", "xircuits-project-template")
    project.add("version", "0.1.0")
    project.add("requires-python", ">=3.10")
    deps = tomlkit.array(); deps.multiline(True)
    project.add("dependencies", deps)
    doc.add("project", project)

    opt = tomlkit.table()
    doc["project"]["optional-dependencies"] = opt

    tool = tomlkit.table()
    xir = tomlkit.table()
    xir.add("components", tomlkit.table())
    tool.add("xircuits", xir)
    doc.add("tool", tool)

    _write_toml_with_format(doc, pyproject_file)


# ---------- Internal utilities ----------

def _load_or_init_pyproject():
    path = Path("pyproject.toml")
    if not path.exists():
        create_default_pyproject(path)
    doc = parse(path.read_text(encoding="utf-8"))

    if "project" not in doc:
        doc["project"] = tomlkit.table()
    if "optional-dependencies" not in doc["project"]:
        doc["project"]["optional-dependencies"] = tomlkit.table()

    if "tool" not in doc:
        doc["tool"] = tomlkit.table()
    if "xircuits" not in doc["tool"]:
        doc["tool"]["xircuits"] = tomlkit.table()
    if "components" not in doc["tool"]["xircuits"]:
        doc["tool"]["xircuits"]["components"] = tomlkit.table()

    return doc, path

def _canon_extra_name(name: str) -> str:
    """
    Normalize to 'xai-<kebab>' for per-library extras,
    and pass through 'xai-components' unchanged.
    Accepts inputs like 'xai_tensorflow', 'xai-tensorflow', 'tensorflow'.
    """
    raw = (name or "").strip().lower().replace("\\", "/")
    seg = raw.split("/")[-1]
    seg = seg.replace("_", "-")
    if seg == "xai-components":
        return seg
    if not seg.startswith("xai-"):
        seg = "xai-" + seg
    return seg

def _lib_key_for_components(name: str) -> str:
    # Components keys align with extras: 'xai-<kebab>'
    return _canon_extra_name(name)

def set_library_extra(extra_name: str, requirements: Iterable[str]) -> None:
    """
    Write/replace a per-library extra under [project.optional-dependencies].
    Does not mutate base dependencies or any uv sections.
    """
    reqs = normalize_requirements_list(list(requirements or []))
    doc, path = _load_or_init_pyproject()

    extras_tbl = doc["project"]["optional-dependencies"]
    key = _canon_extra_name(extra_name)
    arr = tomlkit.array(); arr.multiline(True)
    for r in reqs:
        arr.append(r)
    extras_tbl[key] = arr

    _write_toml_with_format(doc, path)

def remove_library_extra(extra_name: str) -> None:
    doc, path = _load_or_init_pyproject()
    extras_tbl = doc["project"]["optional-dependencies"]
    key = _canon_extra_name(extra_name)
    if key in extras_tbl:
        del extras_tbl[key]
        _write_toml_with_format(doc, path)

def rebuild_meta_extra(meta_name: str = "xai-components") -> None:
    """
    Rebuild the meta extra as the union of all 'xai-*' extras except itself.
    """
    doc, path = _load_or_init_pyproject()
    extras_tbl = doc["project"]["optional-dependencies"]
    meta_key = _canon_extra_name(meta_name)

    union = []
    for k in sorted(extras_tbl.keys(), key=lambda s: s.lower()):
        if k == meta_key:
            continue
        if not k.startswith("xai-"):
            continue
        vals = extras_tbl.get(k)
        if isinstance(vals, list):
            union.extend(str(v) for v in vals)

    union = normalize_requirements_list(union)
    arr = tomlkit.array(); arr.multiline(True)
    for r in union:
        arr.append(r)
    extras_tbl[meta_key] = arr

    _write_toml_with_format(doc, path)

def record_component_metadata(library_name: str,
                              member_path: str,
                              repo_url: Optional[str],
                              ref: Optional[str],
                              is_tag: bool) -> None:
    """
    Write [tool.xircuits.components.<xai-*>] table with:
      source = <repo_url> (optional)
      path   = <member_path>
      tag|rev = <ref or 'latest'>
    """
    doc, path = _load_or_init_pyproject()
    key = _lib_key_for_components(library_name)
    entry = tomlkit.table()
    if repo_url:
        entry.add("source", repo_url)
    if member_path:
        entry.add("path", str(member_path))
    entry.add("tag" if is_tag else "rev", ref or "latest")
    doc["tool"]["xircuits"]["components"][key] = entry
    _write_toml_with_format(doc, path)

def remove_component_metadata(library_name_or_path: str) -> None:
    """
    Remove a components entry by key (xai-*) or by matching trailing path segment.
    """
    doc, path = _load_or_init_pyproject()
    comps = doc["tool"]["xircuits"]["components"]
    target_key = _lib_key_for_components(library_name_or_path)

    removed = False
    if target_key in comps:
        del comps[target_key]
        removed = True
    else:
        # try to match by path suffix
        want = str(library_name_or_path).replace("\\", "/").rstrip("/")
        for k, tbl in list(comps.items()):
            p = str(tbl.get("path", "")).replace("\\", "/").rstrip("/")
            if p.endswith(want) or Path(p).name == Path(want).name:
                del comps[k]
                removed = True

    if removed:
        _write_toml_with_format(doc, path)


def remove_git_directory(repo_path: str) -> bool:
    """
    Remove the .git directory from a cloned repository (best-effort).
    Returns True if removed or not present.
    """
    p = Path(repo_path) / ".git"
    if not p.exists():
        return True
    try:
        shutil.rmtree(p)
        print(f"✓ Removed .git directory from {repo_path}")
        return True
    except Exception as e:
        print(f"Warning: could not remove .git from {repo_path}: {e}")
        return False
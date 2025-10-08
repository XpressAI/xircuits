import shutil
import tempfile
import time
import filecmp
import difflib
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Set
from importlib_resources import files, as_file

from xircuits.utils.pathing import resolve_working_dir, components_base_dir
from .core_libs import is_core_library

from xircuits.utils.pathing import (
    resolve_working_dir,
    resolve_library_dir,
    normalize_library_slug,
)
from xircuits.utils.git_toml_manager import (
    read_component_metadata_entry,
    git_clone_shallow,
    git_checkout_ref,
    get_git_metadata,
    record_component_metadata,
    set_library_extra,
    rebuild_meta_extra,
    regenerate_lock_file,
)
from xircuits.utils.requirements_utils import read_requirements_for_library
from xircuits.utils.venv_ops import install_specs
from xircuits.handlers.request_remote import get_remote_config


@dataclass
class SourceSpec:
    repo_url: str
    desired_ref: Optional[str]  # tag/branch/sha or None


@dataclass
class SyncReport:
    added: List[str]
    updated: List[str]
    deleted: List[str]
    unchanged: List[str]


def update_library(
    library_name: str,
    repo: Optional[str] = None,
    ref: Optional[str] = None,
    dry_run: bool = False,
    prune: bool = False,
    install_deps: bool = True,
    use_latest: bool = False,
) -> str:
    """
    Update an installed component library (core or regular).

    Core libraries (xai_events, xai_template, xai_controlflow, xai_utils, base.py)
    are updated from the installed xircuits wheel.
    
    Regular libraries are updated from their git repository.

    Args:
        library_name: "gradio", "xai_events", "base.py", etc. (normalized internally)
        repo:         Optional repository URL override (ignored for core libs)
        ref:          Optional tag/branch/commit to update to (ignored for core libs)
        dry_run:      If True, compute actions and print a unified diff (no files changed).
        prune:        If True, also archive local-only files/dirs (rename to *.bak).
        install_deps: If True (default), update per-library extra and install its requirements.
        use_latest: If True, ignore metadata ref and pull latest from default branch.

    Returns:
        Summary message of update results.
    """
    working_dir = resolve_working_dir()
    if working_dir is None:
        raise RuntimeError("Xircuits working directory not found. Run 'xircuits init' first.")

    # Check if updating base.py
    normalized = library_name.strip().lower()
    if normalized in ("base", "base.py"):
        return _update_from_wheel(
            component_name="base.py",
            working_dir=working_dir,
            dry_run=dry_run,
            prune=prune,
        )
    
    # Normalize library name and check if it's a core library
    lib_name = normalize_library_slug(library_name)
    if is_core_library(lib_name):
        return _update_from_wheel(
            component_name=lib_name,
            working_dir=working_dir,
            dry_run=dry_run,
            prune=prune,
        )
    
    # Regular (non-core) library update from git
    return _update_from_git(
        lib_name=lib_name,
        working_dir=working_dir,
        repo=repo,
        ref=ref,
        dry_run=dry_run,
        prune=prune,
        install_deps=install_deps,
        use_latest=use_latest,
    )

def _update_from_wheel(
    component_name: str,
    working_dir: Path,
    dry_run: bool,
    prune: bool,
) -> str:
    """
    Update a core component from the installed xircuits wheel.
    """
    dest_base = working_dir / "xai_components"
    if not dest_base.exists():
        raise RuntimeError(f"xai_components directory not found at {working_dir}")
    
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    is_base_file = component_name == "base.py"
    display_name = component_name
    
    print(f"Updating core component: {display_name} (from installed wheel)")
    
    temp_dir = Path(tempfile.mkdtemp(prefix=f"update_core_{component_name.replace('.', '_')}_"))
    
    try:
        # Extract from wheel to temp directory
        if is_base_file:
            _extract_base_py_from_wheel(temp_dir)
            src_path = temp_dir / "base.py"
            dst_path = dest_base / "base.py"
        else:
            _extract_core_lib_from_wheel(component_name, temp_dir)
            src_path = temp_dir / component_name
            dst_path = dest_base / component_name
        
        if not src_path.exists():
            raise FileNotFoundError(f"{display_name} not found in installed wheel")
        
        # Ensure destination exists
        if not dst_path.exists():
            if is_base_file:
                raise FileNotFoundError(f"{display_name} does not exist locally. Run 'xircuits init' first.")
            else:
                raise FileNotFoundError(f"{display_name} does not exist locally. This is unexpected for a core library.")
        
        # Sync files
        if is_base_file:
            report = _sync_single_file(src_path, dst_path, dry_run, timestamp)
        else:
            report = _sync_with_backups(
                source_root=src_path,
                destination_root=dst_path,
                dry_run=dry_run,
                prune=prune,
                timestamp=timestamp,
            )
        
        # Generate diff for dry-run
        if dry_run:
            if is_base_file and report.updated:
                diff_text = _unified_diff_for_pair(src_path, dst_path, Path("base.py"))
                if diff_text.strip():
                    print("\n--- DRY-RUN DIFF ---")
                    print(diff_text.rstrip())
            elif not is_base_file:
                diff_text = _build_combined_diff(
                    src_path, dst_path,
                    added=report.added,
                    updated=report.updated,
                    deleted=report.deleted
                )
                if diff_text.strip():
                    diff_path = dst_path / f"{component_name}.update.{timestamp}.dry-run.diff.txt"
                    diff_path.write_text(diff_text, encoding="utf-8")
                    print("\n--- DRY-RUN DIFF ---")
                    print(diff_text.rstrip())
                    print(f"\n(Wrote diff file to: {diff_path})")
        
        summary = (
            f"{display_name} update "
            f"(added: {len(report.added)}, updated: {len(report.updated)}, "
            f"deleted: {len(report.deleted)}, unchanged: {len(report.unchanged)})"
        )
        return summary
        
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def _update_from_git(
    lib_name: str,
    working_dir: Path,
    repo: Optional[str],
    ref: Optional[str],
    dry_run: bool,
    prune: bool,
    install_deps: bool,
    use_latest: bool = False,
) -> str:
    """
    Update a regular component library from its git repository.
    (Original update_library logic)
    """
    dest_dir = resolve_library_dir(lib_name)
    if not dest_dir.exists() or not dest_dir.is_dir():
        raise FileNotFoundError(
            f"Library '{lib_name}' not found at {dest_dir}. Try 'xircuits install {lib_name}'."
        )

    timestamp = time.strftime("%Y%m%d-%H%M%S")

    source_spec = _resolve_source_spec(lib_name, repo, ref, use_latest)
    if not source_spec or not source_spec.repo_url:
        raise RuntimeError(
            f"Could not resolve a repository URL for '{lib_name}'. "
            "Ensure it was installed (so metadata exists) or present in your index.json."
        )

    print(
        f"Updating {lib_name} from {source_spec.repo_url} "
        f"{'(ref='+source_spec.desired_ref+')' if source_spec.desired_ref else '(default branch)'}"
    )

    temp_repo_dir = Path(tempfile.mkdtemp(prefix=f"update_{lib_name}_"))
    try:
        git_clone_shallow(source_spec.repo_url, temp_repo_dir)
        if source_spec.desired_ref:
            git_checkout_ref(temp_repo_dir, source_spec.desired_ref)

        repo_url_final, resolved_ref, is_tag = get_git_metadata(str(temp_repo_dir))
        src_dir = _select_library_source_dir(temp_repo_dir, lib_name)

        report = _sync_with_backups(
            source_root=src_dir,
            destination_root=dest_dir,
            dry_run=dry_run,
            prune=prune,
            timestamp=timestamp,
        )

        # On DRY-RUN: show and save a unified diff of planned changes.
        # This is an *in-memory* comparison; no filesystem writes occur, and we don't
        # ever touch '/dev/null'. For adds/deletes we diff against an empty side.
        if dry_run:
            diff_text = _build_combined_diff(
                src_dir, dest_dir,
                added=report.added,
                updated=report.updated,
                deleted=report.deleted
            )
            if diff_text.strip():
                diff_path = dest_dir / f"{lib_name}.update.{timestamp}.dry-run.diff.txt"
                diff_path.write_text(diff_text, encoding="utf-8")
                print("\n--- DRY-RUN DIFF ---")
                print(diff_text.rstrip())
                print(f"\n(Wrote diff file to: {diff_path})")

        # Update pyproject metadata / deps (skipped during dry-run)
        if not dry_run:
            try:
                record_component_metadata(
                    library_name=lib_name,            # normalizes to xai-*
                    member_path=str(dest_dir),
                    repo_url=repo_url_final or source_spec.repo_url,
                    ref=resolved_ref or source_spec.desired_ref or "latest",
                    is_tag=is_tag,
                )
            except Exception as e:
                print(f"Warning: could not update pyproject metadata: {e}")

            # Requirements / extras install
            try:
                reqs = read_requirements_for_library(dest_dir)
            except Exception as e:
                reqs = []
                print(f"Warning: could not read requirements for {lib_name}: {e}")

            # Always refresh the per-library extra + meta extra on update (safe even if no install)
            try:
                set_library_extra(lib_name, reqs)
                rebuild_meta_extra("xai-components")
            except Exception as e:
                print(f"Warning: could not update optional-dependencies for {lib_name}: {e}")

            if install_deps:
                try:
                    if reqs:
                        print(f"Installing Python dependencies for {lib_name}...")
                        install_specs(reqs)
                        print(f"✓ Dependencies for {lib_name} installed.")
                    else:
                        print(f"No requirements.txt entries for {lib_name}; nothing to install.")
                except Exception as e:
                    print(f"Warning: installing dependencies for {lib_name} failed:{e}".rstrip())

            try:
                regenerate_lock_file()
            except Exception as e:
                print(f"Warning: could not regenerate lock file: {e}")

        summary = (
            f"{lib_name} update "
            f"(added: {len(report.added)}, updated: {len(report.updated)}, "
            f"deleted: {len(report.deleted)}, unchanged: {len(report.unchanged)})"
        )
        return summary
    finally:
        shutil.rmtree(temp_repo_dir, ignore_errors=True)


# ========== Wheel Extraction Helpers ==========

def _extract_core_lib_from_wheel(lib_name: str, dest_dir: Path) -> None:
    """
    Extract a core component library directory from the installed wheel.
    """
    try:
        lib_ref = files('xai_components') / lib_name
        with as_file(lib_ref) as source_path:
            if not source_path.exists():
                raise FileNotFoundError(f"{lib_name} not found in wheel")
            shutil.copytree(source_path, dest_dir / lib_name, dirs_exist_ok=True)
    except Exception as e:
        raise RuntimeError(f"Failed to extract {lib_name} from wheel: {e}")


def _extract_base_py_from_wheel(dest_dir: Path) -> None:
    """
    Extract base.py from the installed wheel.
    """
    try:
        base_ref = files('xai_components') / 'base.py'
        with as_file(base_ref) as source_path:
            if not source_path.exists():
                raise FileNotFoundError("base.py not found in wheel")
            shutil.copy2(source_path, dest_dir / 'base.py')
    except Exception as e:
        raise RuntimeError(f"Failed to extract base.py from wheel: {e}")


def _sync_single_file(src_file: Path, dst_file: Path, dry_run: bool, timestamp: str) -> SyncReport:
    """
    Sync a single file with backup support.
    """
    added: List[str] = []
    updated: List[str] = []
    deleted: List[str] = []
    unchanged: List[str] = []
    
    rel_path = dst_file.name
    
    if not dst_file.exists():
        print(f"+++ {rel_path}")
        if not dry_run:
            dst_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_file, dst_file)
        added.append(rel_path)
    elif _files_equal(src_file, dst_file):
        unchanged.append(rel_path)
    else:
        if dry_run:
            backup_name = _backup_in_place(dst_file, timestamp, dry_run)
            print(f"--- {rel_path} (would backup as: {backup_name})")
            print(f"+++ {rel_path}")
        else:
            backup_name = _backup_in_place(dst_file, timestamp, dry_run)
            print(f"--- {rel_path} (backup: {backup_name})")
            print(f"+++ {rel_path}")
            shutil.copy2(src_file, dst_file)
        updated.append(rel_path)
    
    return SyncReport(added=added, updated=updated, deleted=deleted, unchanged=unchanged)


# ========== Git Update Helpers ==========

def _resolve_source_spec(
    lib_name: str,
    repo_override: Optional[str],
    user_ref: Optional[str],
    use_latest: bool = False,
) -> Optional[SourceSpec]:
    """
    Priority:
      0) explicit repo override (CLI/API 'repo=')
      1) pyproject.toml [tool.xircuits.components] entry (source + tag/rev)
      2) manifest index via get_remote_config()
      
    If use_latest=True, ignore metadata ref and use user_ref (or None for default branch).
    """
    # use repo url if specified
    if repo_override:
        return SourceSpec(repo_url=repo_override, desired_ref=user_ref)

    # pyproject metadata
    source_url, meta_ref = read_component_metadata_entry(lib_name)
    
    # Determine ref: use_latest bypasses metadata ref
    if use_latest:
        desired_ref = user_ref  # None means default branch
    else:
        desired_ref = user_ref or meta_ref

    if source_url:
        return SourceSpec(repo_url=source_url, desired_ref=desired_ref)

    try:
        _, manifest_url = get_remote_config(lib_name.replace("xai_", ""))
        return SourceSpec(repo_url=manifest_url, desired_ref=user_ref)
    except Exception:
        return None


def _select_library_source_dir(repo_root: Path, lib_name: str) -> Path:
    """
    Heuristics:
      1) repo_root/<lib_name> if present
      2) if exactly one 'xai_*' dir exists at top-level, use it
      3) repo_root
    """
    candidate = repo_root / lib_name
    if candidate.exists() and candidate.is_dir():
        return candidate

    top_level = [p for p in repo_root.iterdir() if p.is_dir() and p.name.startswith("xai_")]
    if len(top_level) == 1:
        return top_level[0]

    return repo_root


def _walk_files(root: Path) -> Set[Path]:
    """
    Discover files under root, skipping obvious noise.
    """
    INTERNAL_SKIP = {".git", "__pycache__"}
    out: Set[Path] = set()
    for path_obj in root.rglob("*"):
        if path_obj.is_file():
            rel = path_obj.relative_to(root)
            if any(part in INTERNAL_SKIP for part in rel.parts):
                continue
            out.add(rel)
    return out


def _walk_dirs(root: Path) -> Set[Path]:
    INTERNAL_SKIP = {".git", "__pycache__"}
    out: Set[Path] = set()
    for path_obj in root.rglob("*"):
        if path_obj.is_dir():
            rel = path_obj.relative_to(root)
            if any(part in INTERNAL_SKIP for part in rel.parts):
                continue
            out.add(rel)
    return out


def _files_equal(a: Path, b: Path) -> bool:
    try:
        if not a.is_file() or not b.is_file():
            return False
        if a.stat().st_size != b.stat().st_size:
            return False
        return filecmp.cmp(str(a), str(b), shallow=False)
    except OSError:
        return False


def _backup_in_place(target_path: Path, timestamp: str, dry_run: bool) -> str:
    """
    Rename target to target.<timestamp>.bak. Returns the backup filename.
    """
    backup_path = target_path.with_name(target_path.name + f".{timestamp}.bak")
    if dry_run:
        return backup_path.name
    target_path.rename(backup_path)
    return backup_path.name


def _copy_file(src: Path, dst: Path, dry_run: bool) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dry_run:
        return
    if dst.exists():
        if dst.is_dir():
            shutil.rmtree(dst)
        else:
            dst.unlink()
    shutil.copy2(src, dst)


def _sync_with_backups(
    source_root: Path,
    destination_root: Path,
    dry_run: bool,
    prune: bool,
    timestamp: str,
) -> SyncReport:
    """
    Perform the filesystem sync (or simulate it on dry_run).

    Prints concise markers:
      +++ path
      --- path (backup: <name>)    for updated/deleted
      --- path (would backup)      for updated/deleted (dry-run mode)
    """
    added: List[str] = []
    updated: List[str] = []
    deleted: List[str] = []
    unchanged: List[str] = []

    source_files = _walk_files(source_root)
    destination_files = _walk_files(destination_root)

    # Add / update
    for rel in sorted(source_files, key=str):
        src = source_root / rel
        dst = destination_root / rel
        path_str = rel.as_posix()

        if not dst.exists():
            print(f"+++ {path_str}")
            _copy_file(src, dst, dry_run)
            added.append(path_str)
            continue

        if _files_equal(src, dst):
            unchanged.append(path_str)
            continue

        if dry_run:
            backup_name = _backup_in_place(dst, timestamp, dry_run)
            print(f"--- {path_str} (would backup as: {backup_name})")
            print(f"+++ {path_str}")
        else:
            backup_name = _backup_in_place(dst, timestamp, dry_run)
            print(f"--- {path_str} (backup: {backup_name})")
            print(f"+++ {path_str}")
        _copy_file(src, dst, dry_run)
        updated.append(path_str)

    # Deletions (dest-only) — only when prune=True
    if prune:
        source_dirs = _walk_dirs(source_root)
        destination_dirs = _walk_dirs(destination_root)

        for rel in sorted(destination_files - source_files, key=str):
            dst = destination_root / rel
            path_str = rel.as_posix()
            if dry_run:
                backup_name = _backup_in_place(dst, timestamp, dry_run)
                print(f"--- {path_str} (would backup as: {backup_name})")
            else:
                backup_name = _backup_in_place(dst, timestamp, dry_run)
                print(f"--- {path_str} (backup: {backup_name})")
            deleted.append(path_str)

        # Directories only in destination — deepest first
        for rel in sorted(destination_dirs - source_dirs, key=lambda p: len(p.as_posix()), reverse=True):
            dst_dir = destination_root / rel
            if dst_dir.exists():
                path_str = rel.as_posix() + "/"
                if dry_run:
                    backup_name = _backup_in_place(dst_dir, timestamp, dry_run)
                    print(f"--- {path_str} (would backup as: {backup_name})")
                else:
                    backup_name = _backup_in_place(dst_dir, timestamp, dry_run)
                    print(f"--- {path_str} (backup: {backup_name})")
                deleted.append(path_str)

    return SyncReport(added=added, updated=updated, deleted=deleted, unchanged=unchanged)

# ---------- Diff helpers (for dry-run) ----------

def _is_binary_file(path: Optional[Path]) -> bool:
    if not path or not path.exists() or not path.is_file():
        return False
    try:
        chunk = path.read_bytes()[:2048]
        return b"\x00" in chunk
    except Exception:
        return False


def _read_text(path: Optional[Path]) -> List[str]:
    if not path or not path.exists() or not path.is_file():
        return []
    try:
        return path.read_text(encoding="utf-8", errors="replace").splitlines(True)
    except Exception:
        # Fallback: best-effort decode
        try:
            return path.read_bytes().decode("utf-8", errors="replace").splitlines(True)
        except Exception:
            return []

def _unified_diff_for_pair(src: Optional[Path], dst: Optional[Path], rel: Path) -> str:
    """
    Build a unified diff between dst (current destination, old) and src (incoming source, new).
    """
    def _normalize_for_diff(lines: List[str], keep_max_blank_run: int = 1) -> List[str]:
        # Collapse runs of blank lines to at most `keep_max_blank_run`.
        out: List[str] = []
        blanks = 0
        for ln in lines:
            if ln.strip() == "":
                blanks += 1
                if blanks <= keep_max_blank_run:
                    out.append(ln)  # keep original terminator
            else:
                blanks = 0
                out.append(ln)
        return out

    label_old = f"a/{rel.as_posix()}"
    label_new = f"b/{rel.as_posix()}"

    # Binary file summary
    if _is_binary_file(dst) or _is_binary_file(src):
        # Added
        if dst is None or (dst and not dst.exists()):
            return f"Binary file added: {rel.as_posix()}\n"
        # Deleted
        if src is None or (src and not src.exists()):
            return f"Binary file deleted: {rel.as_posix()}\n"
        # Updated
        return f"Binary file updated: {rel.as_posix()}\n"

    # Read and normalize lines (with terminators preserved)
    old_lines = _normalize_for_diff(_read_text(dst))
    new_lines = _normalize_for_diff(_read_text(src))

    # Use lineterm="\n" so each diff line includes its newline -> headers won't glue
    diff_lines = list(difflib.unified_diff(
        old_lines, new_lines,
        fromfile=label_old, tofile=label_new,
        lineterm="\n"
    ))
    return "".join(diff_lines)

def _build_combined_diff(
    source_root: Path,
    destination_root: Path,
    added: List[str],
    updated: List[str],
    deleted: List[str],
) -> str:
    """
    Combine all per-file diffs in a single text blob, in stable sorted order.
    """
    out: List[str] = []

    # Added
    for p in sorted(added):
        rel = Path(p)
        src = source_root / rel
        dst = None  # represent "no previous file" by empty content
        diff = _unified_diff_for_pair(src, dst, rel)
        if diff.strip():
            out.append(diff)

    # Updated
    for p in sorted(updated):
        rel = Path(p)
        src = source_root / rel
        dst = destination_root / rel
        diff = _unified_diff_for_pair(src, dst, rel)
        if diff.strip():
            out.append(diff)

    # Deleted
    for p in sorted(deleted):
        rel = Path(p)
        src = None  # represent "no new file" by empty content
        dst = destination_root / rel
        diff = _unified_diff_for_pair(src, dst, rel)
        if diff.strip():
            out.append(diff)

    return "\n".join(out)

# ---------- Update All functionality ----------

def update_all_libraries(
    dry_run: bool = False,
    prune: bool = False,
    install_deps: bool = True,
    core_only: bool = False,
    remote_only: bool = False,
    exclude: List[str] = None,
    respect_refs: bool = False,
) -> dict:
    """
    Update all installed component libraries found in xai_components/.
    
    Args:
        dry_run: Preview changes without modifying files
        prune: Remove local-only files during update
        install_deps: Install/update Python dependencies
        core_only: Only update core libraries
        remote_only: Only update non-core libraries
        exclude: List of library names to skip
        respect_refs: Honor pinned refs in metadata (default: pull latest)
    
    Returns:
        Dict with 'success', 'failed', 'skipped' lists and summary stats
    """

    # Validate conflicting flags
    if core_only and remote_only:
        raise ValueError("Cannot specify both --core-only and --remote-only")
    
    working_dir = resolve_working_dir()
    if working_dir is None:
        raise RuntimeError("Xircuits working directory not found. Run 'xircuits init' first.")
    
    exclude_set = set((exclude or []))
    exclude_set = {normalize_library_slug(x) for x in exclude_set}
    
    results = {
        "success": [],
        "failed": [],
        "skipped": []
    }
    
    # Discover libraries to update
    libraries_to_update = _discover_updateable_libraries(
        working_dir=working_dir,
        core_only=core_only,
        remote_only=remote_only,
        exclude=exclude_set
    )
    
    if not libraries_to_update:
        print("No libraries found to update.")
        return results
    
    print(f"Found {len(libraries_to_update)} {'library' if len(libraries_to_update) == 1 else 'libraries'} to update")
    if dry_run:
        print("DRY-RUN MODE: No files will be modified\n")
    print()
    
    # Update each library
    for lib_name in sorted(libraries_to_update):
        try:
            print(f"{'='*60}")
            print(f"Updating: {lib_name}")
            print(f"{'='*60}")
            
            # For --all without --respect-refs, pull latest by setting use_latest=True
            message = update_library(
                library_name=lib_name,
                repo=None,
                ref=None,
                dry_run=dry_run,
                prune=prune,
                install_deps=install_deps,
                use_latest=not respect_refs,
            )
            
            results["success"].append((lib_name, message))
            print(f"✓ {lib_name}: {message}\n")
            
        except Exception as e:
            error_msg = str(e)
            results["failed"].append((lib_name, error_msg))
            print(f"✗ {lib_name}: Failed - {error_msg}\n")
            # Continue to next library
    
    # Print summary
    _print_update_all_summary(results, dry_run)
    
    return results

def _discover_updateable_libraries(
    working_dir: Path,
    core_only: bool,
    remote_only: bool,
    exclude: set
) -> List[str]:
    """
    Scan xai_components directory and return list of updateable library names.
    """

    base_dir = components_base_dir(working_dir)
    if not base_dir.exists():
        return []
    
    libraries = []
    
    # Check base.py
    base_py = base_dir / "base.py"
    if base_py.exists() and base_py.is_file():
        if not remote_only and "base.py" not in exclude:
            if core_only or not remote_only:
                libraries.append("base.py")
    
    # Scan xai_* directories
    for item in base_dir.glob("xai_*"):
        if not item.is_dir():
            continue
        
        # Must have __init__.py to be valid
        if not (item / "__init__.py").exists():
            continue
        
        lib_name = item.name
        
        # Check exclusions
        if lib_name in exclude:
            continue
        
        # Check core/remote filters
        is_core = is_core_library(lib_name)
        if core_only and not is_core:
            continue
        if remote_only and is_core:
            continue
        
        libraries.append(lib_name)
    
    return libraries


def _print_update_all_summary(results: dict, dry_run: bool):
    """
    Print a formatted summary of update results.
    """
    print()
    print("="*60)
    print("Update All Summary")
    print("="*60)
    print()
    
    if results["success"]:
        print("✓ SUCCEEDED:")
        for lib_name, message in results["success"]:
            print(f"  {lib_name:20} {message}")
        print()
    
    if results["failed"]:
        print("✗ FAILED:")
        for lib_name, error in results["failed"]:
            # Truncate long errors
            error_display = error if len(error) <= 60 else error[:57] + "..."
            print(f"  {lib_name:20} {error_display}")
        print()
    
    if results["skipped"]:
        print("⊘ SKIPPED:")
        for lib_name, reason in results["skipped"]:
            print(f"  {lib_name:20} {reason}")
        print()
    
    # Summary counts
    total = len(results["success"]) + len(results["failed"]) + len(results["skipped"])
    summary_parts = []
    if results["success"]:
        summary_parts.append(f"{len(results['success'])} succeeded")
    if results["failed"]:
        summary_parts.append(f"{len(results['failed'])} failed")
    if results["skipped"]:
        summary_parts.append(f"{len(results['skipped'])} skipped")
    
    mode_suffix = " (dry-run)" if dry_run else ""
    print(f"{', '.join(summary_parts)}{mode_suffix}")
    print("="*60)

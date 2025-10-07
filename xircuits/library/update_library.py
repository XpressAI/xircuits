import shutil
import tempfile
import time
import filecmp
import difflib
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Set

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
) -> str:
    """
    Safely update an installed component library (e.g., "gradio").

    Defaults:
      - Keeps any local-only files/dirs as-is (no deletions) unless prune=True.
      - Overwrites changed files, backing up the previous version in-place as *.YYYYmmdd-HHMMSS.bak.
      - Updates per-library extra and installs requirements (unless disabled).

    Args:
        library_name: "gradio", "xai_gradio", etc. (normalized internally)
        repo:         Optional repository URL override (persists into pyproject if not dry-run).
        ref:          Optional tag/branch/commit to update to.
        dry_run:      If True, compute actions and print a unified diff (no files changed).
                      Also writes a combined diff file alongside the library directory.
        prune:        If True, also archive local-only files/dirs (rename to *.bak).
        install_deps: If True (default), update per-library extra and install its requirements.

    Output policy:
      - Print action markers:
          +++ path         (added or written)
          --- path (...)   (backed up / deleted)
      - Unchanged files are not printed.
      - On dry-run, a unified diff of changes is printed and saved to disk.
    """
    working_dir = resolve_working_dir()
    if working_dir is None:
        raise RuntimeError("Xircuits working directory not found. Run 'xircuits init' first.")

    lib_name = normalize_library_slug(library_name)      # e.g., 'xai_gradio'
    dest_dir = resolve_library_dir(lib_name)             # absolute path
    if not dest_dir.exists() or not dest_dir.is_dir():
        raise FileNotFoundError(
            f"Library '{lib_name}' not found at {dest_dir}. Try 'xircuits install {library_name}'."
        )

    timestamp = time.strftime("%Y%m%d-%H%M%S")

    source_spec = _resolve_source_spec(lib_name, repo, ref)
    if not source_spec or not source_spec.repo_url:
        raise RuntimeError(
            f"Could not resolve a repository URL for '{library_name}'. "
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


def _resolve_source_spec(
    lib_name: str,
    repo_override: Optional[str],
    user_ref: Optional[str],
) -> Optional[SourceSpec]:
    """
    Priority:
      0) explicit repo override (CLI/API 'repo=')
      1) pyproject.toml [tool.xircuits.components] entry (source + tag/rev)
      2) manifest index via get_remote_config()
    """
    # use repo url if specified
    if repo_override:
        return SourceSpec(repo_url=repo_override, desired_ref=user_ref)

    # pyproject metadata
    source_url, meta_ref = read_component_metadata_entry(lib_name)
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

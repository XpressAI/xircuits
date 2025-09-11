import json
import os
import shutil
import tempfile
import time
import filecmp
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Set, Tuple

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
)
from xircuits.handlers.request_remote import get_remote_config


@dataclass
class SourceSpec:
    repo_url: str
    desired_ref: Optional[str]  # tag/branch/sha or None


@dataclass
class SyncReport:
    added: List[str]
    updated: List[Tuple[str, str]]   # (path, backup_name)
    deleted: List[Tuple[str, str]]   # (path, backup_name)
    unchanged: List[str]


def update_library(
    library_name: str,
    repo: Optional[str] = None,
    ref: Optional[str] = None,
    dry_run: bool = False,
    no_delete: bool = False,
    verbose: bool = False,
) -> str:
    """
    Safely update an installed component library (e.g., "gradio").

    Args:
        library_name: "gradio", "xai_gradio", etc. (normalized internally)
        repo:         Optional repository URL override (persists into pyproject if not dry-run).
        ref:          Optional tag/branch/commit to update to.
        dry_run:      If True, compute and print actions without modifying files.
        no_delete:    If True, do not treat dest-only files as deletions.
        verbose:      If True, prints per-file actions; otherwise summarize.
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
            no_delete=no_delete,
            timestamp=timestamp,
            verbose=verbose,
        )

        manifest_path = _write_update_manifest(
            working_dir=working_dir,
            lib_name=lib_name,
            timestamp=timestamp,
            repo_url=repo_url_final or source_spec.repo_url,
            ref=resolved_ref or source_spec.desired_ref or "latest",
            report=report,
        )

        # Update pyproject metadata with the new source/ref (skipped on dry-run)
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

        summary = (
            f"{lib_name} update "
            f"(added: {len(report.added)}, updated: {len(report.updated)}, "
            f"deleted: {len(report.deleted)}, unchanged: {len(report.unchanged)}). "
            f"Manifest: {manifest_path}"
        )
        print(summary)
        return summary
    finally:
        shutil.rmtree(temp_repo_dir, ignore_errors=True)


def _resolve_source_spec(
    lib_name: str,
    repo_override: Optional[str],
    user_ref: Optional[str]
) -> Optional[SourceSpec]:
    """
    Priority:
      0) explicit repo override (CLI/API 'repo=')
      1) pyproject.toml [tool.xircuits.components] entry (source + tag/rev)
      2) manifest index via get_remote_config()
    """
    # 0) explicit override wins (persisted by record_component_metadata later if not dry-run)
    if repo_override:
        return SourceSpec(repo_url=repo_override, desired_ref=user_ref)

    # 1) pyproject metadata
    source_url, meta_ref = read_component_metadata_entry(lib_name)
    desired_ref = user_ref or meta_ref
    if source_url:
        return SourceSpec(repo_url=source_url, desired_ref=desired_ref)

    # 2) manifest (accept 'gradio' by stripping 'xai_')
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
    no_delete: bool,
    timestamp: str,
    verbose: bool,
) -> SyncReport:
    added: List[str] = []
    updated: List[Tuple[str, str]] = []
    deleted: List[Tuple[str, str]] = []
    unchanged: List[str] = []

    source_files = _walk_files(source_root)
    destination_files = _walk_files(destination_root)

    # Add / update
    for rel in sorted(source_files, key=str):
        src = source_root / rel
        dst = destination_root / rel

        if not dst.exists():
            if verbose:
                print(f"ADD     {rel.as_posix()}")
            _copy_file(src, dst, dry_run)
            added.append(rel.as_posix())
            continue

        if _files_equal(src, dst):
            if verbose:
                print(f"OK      {rel.as_posix()}")
            unchanged.append(rel.as_posix())
            continue

        backup_name = _backup_in_place(dst, timestamp, dry_run)
        if verbose:
            print(f"UPDATE  {rel.as_posix()}  (backup: {backup_name})")
        _copy_file(src, dst, dry_run)
        updated.append((rel.as_posix(), backup_name))

    # Deletions (dest-only)
    if not no_delete:
        source_dirs = _walk_dirs(source_root)
        destination_dirs = _walk_dirs(destination_root)

        for rel in sorted(destination_files - source_files, key=str):
            dst = destination_root / rel
            backup_name = _backup_in_place(dst, timestamp, dry_run)
            if verbose:
                print(f"DELETE  {rel.as_posix()}  (backup: {backup_name})")
            deleted.append((rel.as_posix(), backup_name))

        # Directories only in destination — deepest first
        for rel in sorted(destination_dirs - source_dirs, key=lambda p: len(p.as_posix()), reverse=True):
            dst_dir = destination_root / rel
            if dst_dir.exists():
                backup_name = _backup_in_place(dst_dir, timestamp, dry_run)
                if verbose:
                    print(f"DELETE  {rel.as_posix()}/  (backup: {backup_name})")
                deleted.append((rel.as_posix() + "/", backup_name))

    return SyncReport(added=added, updated=updated, deleted=deleted, unchanged=unchanged)


def _write_update_manifest(
    working_dir: Path,
    lib_name: str,
    timestamp: str,
    repo_url: str,
    ref: str,
    report: SyncReport,
) -> Path:
    updates_dir = working_dir / ".xircuits" / "updates"
    updates_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = updates_dir / f"{lib_name}-{timestamp}.json"

    payload = {
        "library": lib_name,
        "timestamp": timestamp,
        "source": {"repo_url": repo_url, "ref": ref},
        "summary": {
            "added": len(report.added),
            "updated": len(report.updated),
            "deleted": len(report.deleted),
            "unchanged": len(report.unchanged),
        },
        "details": {
            "added": report.added,
            "updated": [{"path": p, "backup": b} for (p, b) in report.updated],
            "deleted": [{"path": p, "backup": b} for (p, b) in report.deleted],
            "unchanged": report.unchanged,
        },
    }
    manifest_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return manifest_path

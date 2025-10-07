import re
from pathlib import Path
from typing import Iterable, List

# Matches "  # comment ..." but won't match URL fragments like "#egg="
_INLINE_COMMENT_RE = re.compile(r"\s+#")

def strip_inline_comment(line: str) -> str:
    """
    Remove inline '  # ...' comments while preserving URL fragments (e.g. '#egg=').
    """
    m = _INLINE_COMMENT_RE.search(line)
    return line[:m.start()] if m else line

def normalize_requirements_list(reqs: Iterable[str]) -> List[str]:
    """
    Canonical shape:
      - list[str]
      - trimmed, no blanks, no full-line comments
      - trailing '  # ...' comments stripped (keeps '#egg=' fragments)
      - deduped case-insensitively (first occurrence wins)
      - sorted case-insensitively for deterministic output
    """
    cleaned: list[str] = []
    for raw in (reqs or []):
        if not isinstance(raw, str):
            continue
        s = strip_inline_comment(raw).strip()
        if not s or s.startswith("#"):
            continue
        cleaned.append(s)

    seen = set()
    unique: list[str] = []
    for s in cleaned:
        key = s.lower()
        if key not in seen:
            seen.add(key)
            unique.append(s)

    return sorted(unique, key=str.lower)

def parse_requirements_txt(path: Path) -> List[str]:
    """
    Parse a requirements.txt into the canonical list[str].
    Minimal (no '-r' includes expansion).
    """
    if not path.exists():
        return []
    lines = path.read_text(encoding="utf-8").splitlines()
    return normalize_requirements_list(lines)

def read_requirements_for_library(library_dir: Path) -> List[str]:
    """
    Single canonical source for vendored library dependencies:
    requirements.txt in the library directory.
    """
    return parse_requirements_txt(library_dir / "requirements.txt")

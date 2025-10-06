from typing import FrozenSet

# Core component libraries that are bundled with the xircuits wheel
CORE_LIBS: FrozenSet[str] = frozenset({
    "xai_controlflow",
    "xai_events", 
    "xai_template",
    "xai_utils",
})

def is_core_library(library_name: str) -> bool:
    """Check if a library name refers to a core component."""
    normalized = library_name.strip().lower()
    if not normalized.startswith("xai_"):
        normalized = f"xai_{normalized}"
    return normalized in CORE_LIBS
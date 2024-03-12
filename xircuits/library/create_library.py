from pathlib import Path

def create_library(library_name: str):
    library_path = Path(f"xai_components/xai_{library_name}")
    if library_path.exists():
        return False, f"The library directory for 'xai_{library_name}' already exists."

    library_path.mkdir(parents=True, exist_ok=False)
    populate_library_directory(library_path)
    return True, f"Library 'xai_{library_name}' has been successfully created at {library_path}."

def populate_library_directory(library_path: Path):
    # Create __init__.py file
    init_file_path = library_path / "__init__.py"
    with open(init_file_path, "w") as f:
        f.write("# This file is required to make Python treat the directories as containing packages")

    # Create README.md file
    readme_file_path = library_path / "README.md"
    with open(readme_file_path, "w") as f:
        f.write(f"# {library_path.name}\n\nThis is a custom library for Xircuits.")
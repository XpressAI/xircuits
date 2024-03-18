from pathlib import Path

def create_or_update_library(library_name: str, filename: str, content: str):
    library_path = Path(f"xai_components/xai_{library_name}")
    if library_path.exists():
        return save_component_to_library(content, library_path, filename)
    else:
        library_path.mkdir(parents=True, exist_ok=False)
        init_library_directory(library_path)
        return save_component_to_library(content, library_path, filename)
    
def init_library_directory(library_path: Path):
    # Create __init__.py file
    init_file_path = library_path / "__init__.py"
    with open(init_file_path, "w") as f:
        f.write("# This file is required to make Python treat the directories as containing packages")

    # Create README.md file
    readme_file_path = library_path / "README.md"
    with open(readme_file_path, "w") as f:
        f.write(f"# {library_path.name}\n\nThis is a custom library for Xircuits.")

def save_component_to_library(content: str, library_path: Path, filename: str = "new_component.py"):
    base_filename, file_extension = filename.rsplit('.', 1)
    component_file_path = library_path / filename
    counter = 1

    # Check if the file exists and generate a new filename by appending a counter
    while component_file_path.exists():
        component_file_path = library_path / f"{base_filename}_{counter}.{file_extension}"
        counter += 1

    with open(component_file_path, "w") as file:
        file.write(content)

    return f"Component saved as {component_file_path.name} in {library_path}"
# Migrate Project Templates to Workspace-Based Architecture

## Status
Accepted

Proposed by: Fahreza 28/08/2025

Discussed with: Eduardo Gonzalez, Paul Dubs

## Context

Currently, Xircuits project templates are individual repositories that users clone to get started. These templates contain a mix of component libraries:

1. **Template-Specific Libraries**: Custom component libraries built specifically for that template's use case
2. **Remote Libraries**: Standard component libraries referenced from the manifest system (from ADR-0005)

This creates several problems:

1. **Mixed Library Treatment**: Template-specific libraries are committed directly in the template repository, while remote libraries require separate installation steps, creating inconsistent user experience.

2. **Manual Dependency Management**: After cloning a template, users must manually install remote component libraries, often requiring multiple `pip install -r requirements.txt` commands across different library directories.

3. **Non-Reproducible Environments**: Remote libraries are fetched at install time without version locking, leading to potential version drift and inconsistent environments across deployments.

4. **Complex User Mental Model**: Users need to understand the difference between "built-in" template libraries and "remote" libraries, when they simply want everything to work together reproducibly.

5. **Deployment Complexity**: Setting up the same project in different environments (local, cloud, CI/CD) requires multiple manual steps instead of a single reproducible command.

From the user's perspective, they don't care whether a component library is "local" or "remote" - they just want a reproducible project that works consistently.

## Decision

For Xircuits project templates, we are migrating to a **workspace-based architecture** that vendors all component libraries into the project, eliminating the distinction between template-specific and remote libraries. This uses `uv` workspaces to manage dependencies holistically.

### Key Changes

1. **Unified Library Treatment**: All component libraries (template-specific and remote) are vendored by removing their `.git` directories, making them part of the user's project that can be committed and modified locally.

2. **Workspace-Based Dependency Management**: The project becomes a `uv` workspace where each component library is a workspace member with its own `pyproject.toml`, enabling unified dependency resolution.

3. **Single-Command Setup**: Projects can be fully set up and synchronized with one command that handles all libraries consistently.

### New Workflow

**Project Template Structure**:
```
project-template/
├── pyproject.toml              # Workspace configuration
├── uv.lock                     # Locked dependencies
├── xai_components/
│   ├── template_specific_lib/  # Vendored (no .git)
│   ├── xai_remote_lib_1/       # Vendored (no .git) 
│   └── xai_remote_lib_2/       # Vendored (no .git)
├── examples/
└── README.md
```

**Root `pyproject.toml`**:
```toml
[tool.uv.workspace]
members = ["xai_components/*"]

[project]
name = "object-detection-template"
dependencies = [
    "xai-opencv",
    "xai-tensorflow", 
    "xai-template-library"
]

[tool.uv.sources]
xai-opencv = { workspace = true }
xai-tensorflow = { workspace = true }
xai-template-library = { workspace = true }

[tool.xircuits.components]
# Records upstream sources for remote libraries
xai-opencv = { source = "https://github.com/XpressAI/xai-opencv", tag = "v1.2.0" }
xai-tensorflow = { source = "https://github.com/XpressAI/xai-tensorflow", tag = "v2.1.0" }
```

### User Experience

**Before**:
```bash
git clone https://github.com/XpressAI/object-detection-template
cd object-detection-template
# Manual installation of remote libraries
cd xai_components/xai_opencv && pip install -r requirements.txt
cd ../xai_tensorflow && pip install -r requirements.txt
# Hope all versions are compatible
```

**After**:
```bash
git clone https://github.com/XpressAI/object-detection-template
cd object-detection-template
uv sync  # or xircuits project sync
# Everything is installed and locked consistently
```

## Consequences

### Advantages

1. **Unified User Experience**: All component libraries are treated identically - users can modify, commit, and version control any library as part of their project.

2. **True Reproducibility**: Complete project state including all library versions is captured in `uv.lock`, ensuring identical environments across deployments.

3. **Simplified Setup**: Single command setup eliminates the need to understand different library types or installation procedures.

4. **Local Development Friendly**: All libraries are editable by default, enabling users to customize libraries for their specific needs without complex development setups.

5. **Consistent Dependency Resolution**: `uv workspace` resolves dependencies across all libraries simultaneously, preventing version conflicts.

6. **Deployment Simplicity**: Projects can be deployed anywhere with just the repository and `uv sync`, no additional fetching or installation steps required.

### Disadvantages

1. **Larger Repository Size**: Vendoring all libraries increases template repository size compared to just referencing remote libraries.

2. **Update Complexity**: Updating vendored remote libraries requires tooling to fetch new versions and update workspace configuration.

3. **Loss of Git History**: Vendored libraries lose their individual Git history, though upstream source information is preserved in `pyproject.toml`.

4. **Tool Dependency**: Requires `uv` for optimal dependency management, though projects remain `pip`-compatible.

### Migration Impact

- **Template Repositories**: Templates evolve from "reference + manual setup" to "complete vendored workspace"
- **Library Updates**: New CLI commands handle updating vendored remote libraries while preserving local modifications
- **User Mental Model**: Eliminates the local/remote library distinction - everything is just "part of my project"
- **Deployment**: Projects become fully self-contained with reproducible dependency resolution
- **Development Workflow**: Users can freely modify any component library and commit changes as part of their project evolution

This change transforms Xircuits project templates from complex multi-step setups into simple, reproducible, self-contained workspaces that users can immediately start working with and customizing.
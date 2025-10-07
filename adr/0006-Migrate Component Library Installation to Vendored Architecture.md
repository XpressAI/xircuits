# Migrate Component Library Installation to Vendored Architecture

## Status
Accepted

Proposed by: Fahreza 28/08/2025

Discussed with: Eduardo Gonzalez, Paul Dubs

## Context

Following the implementation of manifest-based component library collection management in [ADR-005](./0005-Migrate%20Component%20Library%20Collection%20to%20Manifest%20Repository.md), project templates still use git submodules to reference component libraries, creating setup complexity.

Currently, Xircuits project templates require multiple manual steps:

1. **Multi-Step Template Setup**: After cloning a project template, users must run `git submodule update --init --recursive`, then navigate to each component library directory to run `pip install -r requirements.txt`.

2. **Separate Dependency Installation**: Each component library requires individual installation steps without unified dependency resolution.

3. **Environment Inconsistency**: Dependencies are installed at runtime without version locking, potentially causing version drift across team members.

4. **Mixed Library Treatment**: Some libraries exist as submodules while template-specific libraries are committed directly.

While the manifest system (ADR-005) decoupled component library collection management from the main repository, project templates still require users to perform complex multi-step installations. Template users want a project that works with a single setup command.

Although this affects all component library usage contexts, project templates represent the primary user entry point where this creates the most friction.

## Decision

We are migrating component library installation to a vendored architecture with extras-based dependency management, eliminating git submodules and providing unified dependency resolution through Python packaging standards. The primary focus is improving the project template user experience.

### Key Changes for Project Templates

1. **Template Library Vendoring**: Component libraries in project templates are copied directly into the template repository with `.git` directories removed.

2. **Extras-Based Dependencies**: Each component library contributes its requirements as an optional dependency group in the template's `pyproject.toml`.

3. **Single Setup Command**: A `xai-components` extra aggregates all template dependencies plus Xircuits core.

4. **Unified CLI**: `xircuits sync` command provides single-command template setup.

### Project Template Architecture

**Template Repository Structure**:
```
project-template/
├── pyproject.toml              # All template dependencies as extras
├── xai_components/
│   ├── xai_template_lib/       # Library specific for this template
│   ├── xai_opencv/             # Vendored from manifest (no .git) 
│   └── xai_tensorflow/         # Vendored from manifest (no .git)
├── examples/
└── README.md
```

**Template Dependency Declaration**:
```toml
[project]
name = "object-detection-template"
version = "0.1.0"
requires-python = ">=3.10"

[project.optional-dependencies]
xai-opencv = [
    "opencv-python>=4.8.0",
    "numpy>=1.21.0"
]
xai-tensorflow = [
    "tensorflow>=2.13.0",
    "pillow>=9.0.0"
]

xai-components = [
    "opencv-python>=4.8.0",
    "numpy>=1.21.0", 
    "tensorflow>=2.13.0",
    "pillow>=9.0.0",
    "xircuits==1.19.2"
]

[tool.xircuits.components.xai-opencv]
source = "https://github.com/XpressAI/xai-opencv"
path = "xai_components/xai_opencv"
tag = "v1.2.0"
```

### Project Template User Experience

**Before**:
```bash
git clone https://github.com/XpressAI/object-detection-template
cd object-detection-template
git submodule update --init --recursive
cd xai_components/xai_opencv && pip install -r requirements.txt
cd ../xai_tensorflow && pip install -r requirements.txt
cd ../..
```

**After**:
```bash
git clone https://github.com/XpressAI/object-detection-template
cd object-detection-template
xircuits sync
```

## Consequences

### Advantages

1. **Single Template Setup**: Project templates work with one `xircuits sync` command
2. **Template Reproducibility**: Complete dependency state captured in `pyproject.toml`
3. **Template Customization**: All component libraries become editable and committable
4. **Standard Python Projects**: Templates use standard `pyproject.toml` extras
5. **Consistent Management**: Same approach across all contexts
6. **Tool Compatibility**: Works with `uv` and `pip`

### Disadvantages

1. **Repository Size**: Templates become larger due to vendored code
2. **History Loss**: Individual library git history not preserved in projects

### Migration Impact

- **Template Users**: Single command setup, no submodule knowledge required
- **Template Creators**: Standard Python project dependency management
- **All Contexts**: Unified workflow across templates, runtime, and development

This change transforms project templates from multi-step git-submodule setups into single-command Python projects using standard packaging conventions.
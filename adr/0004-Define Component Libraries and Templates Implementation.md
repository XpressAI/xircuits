# Define Component Libraries and Templates Implementation

## Status
Accepted

Proposed by: Fahreza (13/04/2022)

Discussed with: Eduardo Gonzalez

## Context

In [ADR-0003](./0003-Refactor%20Component%20Libraries%20as%20Submodules.md), we have defined the core component libraries and refactored the rest into submodules. In this ADR, we further define what is a submodule component library, what is a template, how to structure the repository and the workflow with Xircuits.


## Decision

### Component Library:
* A Xircuits component library is a repository or directory that contains xircuits component codes render and run in a Xircuits canvas.
* A component library should be framework focused (tensorflow, pyspark, pycaret, etc).
* A component library repository should focus on one framework at a time and keep other library / frameworks imports to a minimum.
* The structure should contain `__init__.py`, the component_code.py, the requirements.txt, and optionally an `examples` directory, as below: 
```
# +-- examples
# |   |
# |   +-- example1.xircuits
# |   +-- example2.xircuits
# |
# +-- __init__.py
# +-- component_code.py
# +-- requirements.txt
```
* In Xircuits they are implemented as xai_component submodules.
* The workflow of using a component library would be simply copying / cloning the directory to your working Xircuits directory.

* Example: a pycaret component library

### Template:
* A Xircuits template is a project repository that utilizes Xircuits as its engine.
* A single project should have only one Xircuits template at a time.
* A template should be application focused (object detection, BERT training, etc).
* A template repository can have as much component libraries as the application needs.
* The template repository should be structured so that Xircuits can be launched directly. Hence it will need the `.xircuits` config directory, `xai_components` with the `base.py` and whatever component libraries needed, as well as the xircuits to run the application template, as shown below: 
```
# working directory
# |
# +-- .xircuits
# |   +-- config.ini
# |
# +-- xai_components
# |   +-- xai_lib_1
# |   |   +-- __init__.py
# |   |   +-- component_code.py
# |   |   +-- requirements.txt
# |   |
# |   +-- __init__.py
# |   +-- base.py
# |
# +-- ApplicationTemplate.xircuits
# +-- requirements.txt
```
* The workflow of using a template would be to clone the template repository then installing requirements.txt with a specified xircuits version inside.

## Consequences

### Advantages
* A clear distinction between a xircuits component library and xircuits template.
* Xircuits templates should always work out of the box as the xircuits and component definitions are frozen in requirements.txt.

### Disadvantages
* Xircuits template repositories might not always have the most latest features.
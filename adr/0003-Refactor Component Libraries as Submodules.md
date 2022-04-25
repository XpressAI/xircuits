# Refactor Component Libraries as Submodules

## Status
Accepted

Proposed by: Fahreza (12/04/2022)

Discussed with: Eduardo Gonzalez

## Context

As the repository matures, the available Xircuits component libraries will only grow and with it the number of packages required to install the `full` version as well as the examples for each component library. Adding or modifying a component library also requires a PR to update. 

Implementing component libraries as submodules would allow users to easy create their own component library repositories and port them.

## Decision


Moving forward, there'll be a clearer description on how xai component libraries are organized.

1. The default [full] installation of Xircuits will only include deep learning related libraries (Tensorflow, Pytorch, Onnx) as well as PySpark components.
2. XAI component libraries that uses special frameworks like Pycaret or Selenium will be added as submodules. 
3. The examples of those component libraries are moved from the `examples` folder to their respective component library directories.

This has been implemented in https://github.com/XpressAI/xircuits/pull/148

## Consequences

### Advantages

* Improves scalability and reduce maintainability costs.
* Component library authors to have more control over their own component libraries.
* Improves the housekeeping of the examples.
* Users can modify the submodules and update if needed.

### Disadvantages
* Require an extra step to fetch component submodules.

# Xircuits Control Flow Component Library

The Xircuits Control Flow Component Library provides a suite of components designed to facilitate control flow operations within Xircuits. This library is essential for users looking to implement conditional logic, loops, and variable manipulations in their workflows.

## Installation

The `controlflow` component library has no requirements and runs out of the box. It is also included in the base xircuits installation. 

## Component Overview

- **`BranchComponent`**: Enables conditional execution of components based on a boolean input. It routes the flow to either `when_true` or `when_false` components.

- **`LoopComponent`**: Facilitates the creation of loops within a workflow. The loop continues as long as the `condition` input is true.

- **`CounterComponent`**: A utility component for maintaining a count, incrementing by a specified step value. Useful for loop iterations and numeric manipulations.

- **`ComparisonComponent`**: Performs a comparison operation (`op`) between two integer inputs (`a` and `b`) and outputs a boolean result.

- **`MutableVariable`, `GetVariableComponent`, `SetVariableComponent`, `DefineVariableComponent`**: These components are used for handling variable definition, retrieval, and assignment within a Xircuits workflow, enabling dynamic data flow and state management.
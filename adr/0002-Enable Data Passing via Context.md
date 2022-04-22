# Enable Data Passing Via Context

## Status
Accepted

Proposed by: Eduardo Gonzalez (17/01/2022)

Discussed with: the team

## Context
We allow data to be passed between components via Context (ctx). Previously, the only way to pass data between components is by connecting the outPort to inPort. While visually intuitive, variables that are constantly used in most if not all components (such as SparkSession in Spark xircuits)  must be linked again and again.

## Decision
- We add `ctx` to the base component `execute()` method. 

- A component that would like to pass data to the context can be treated as a dict, and would be implemented as the following:
```python
from xai_components.base import Component, xai_component

@xai_component()
class HelloContext(Component):
        
    def execute(self, ctx):
        context_dict = {"new ctx": "Hello Xircuits!"}
        ctx.update(context_dict)
```
- In codegen, by default `ctx` will contain the xircuits args and hyperparameters.
```python
# python example.py --epoch=554
{'args': Namespace(epoch=554, experiment_name='2022-04-22 16:13:40')}
```

## Consequences

### Advantages
* A convenient way to pass data between components.
* Provide an alternative to access hyperparameters.

### Disadvantages
* The need to add `ctx` to each component.

# Specify Components with Decorator

## Status
Accepted

Proposed by: Paul Dubs (13/01/2022)

Discussed with: Eduardo Gonzalez

## Context
We allow custom components to be specified. So far we have used the fact that a
component needs to derive from the `Component` class to distinguish components 
from other Python Code.

As we allow more complex components to exist, this implicit approach doesn't
work as well anymore.

## Decision
We explicitly mark Components, which we want to be exposed, with an
`@xai_component` decorator. 

The decorator also takes another optional parameter `color` which specifies
a particular color for the component. The accepted values are the same as the
CSS color values (e.g. `#FFF`, `#C0FFEE`, `white`)

A simple component looks like the following
```python
from xai_components.base import Component, xai_component

@xai_component(color="red")
class HelloComponent(Component):
    def execute(self) -> None:
        print("Hello, World")
```

## Consequences

### Advantages
* Explicit definition of what the user wants to expose
* A convenient way to add additional metadata

### Disadvantages
* User needs to explicitly define what is going to be exposed instead of it 
  appearing magically when the component is defined

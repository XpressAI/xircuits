# xpipe_components_library

Sidebar extension for xpipe

## Prerequisites

* JupyterLab >= 3.0
* nodejs
* jupyter-packaging

## Install

To install the extension, execute:

```bash
# Change directory to the component_library directory
# Install package in development mode
pip install -ve . # (not needed if requirements.txt is installed)
pip install nodejs jupyter-packaging # (not needed if requirements.txt is installed)
npm install
jupyter labextension develop . --overwrite

```

## Development

To remove the extension, execute:

```bash
# Rebuild extension Typescript source after making changes
jlpm run build
```

## Common Error

To add jlpm application
```bash
jlpm add @jupyterlab/apputils
jlpm add @jupyterlab/application

jlpm run build
```

<p align="center">
<img src="https://user-images.githubusercontent.com/68586800/151280601-7ff2b7b2-10e5-4544-b3df-aa6a5a654dae.png" width="450"/>
</p>

<p align="center">
  <a href="https://xircuits.io/">Docs</a> •
  <a href="https://xircuits.io/docs/getting-started/Installation">Install</a> •
  <a href="https://xircuits.io/docs/tutorials/tutorials">Tutorials</a> •
  <a href="https://github.com/XpressAI/xircuits/blob/master/CONTRIBUTING.md">Contribute</a> •
  <a href="https://blog.xpress.ai/">Blog</a> •
  <a href="https://discord.com/invite/vgEg2ZtxCw">Discord</a>
</p>

<p>
  <p align="center">
    <a href="https://github.com/XpressAI/xircuits/blob/master/LICENSE">
        <img alt="GitHub" src="https://img.shields.io/github/license/XpressAI/xircuits?color=brightgreen">
    </a>
    <a href="https://github.com/XpressAI/xircuits/releases">
        <img alt="GitHub release" src="https://img.shields.io/github/release/XpressAI/xircuits.svg?color=yellow">
    </a>
    <a href="https://xircuits.io">
        <img alt="Documentation" src="https://img.shields.io/website/http/certifai.ai.svg?color=orange">
    </a>
     <a>
        <img alt="Python" src="https://img.shields.io/badge/python-3.9-blue">
    </a>
</p>

![frontpage](https://user-images.githubusercontent.com/68586800/160965807-ba0fb65d-3912-4155-96fd-010ae082830b.gif)

Xircuits is a Jupyterlab-based extension that enables visual, low-code, training workflows. It allows anyone to easily create executable python code in seconds.


## Installation
We recommend installing xircuits in a virtual environment.
```
$ pip install xircuits[full]
```
If you would like to install just the core functions, use:
```
$ pip install xircuits
```
### Launch
```
$ xircuits
```
### Download Examples
```
$ xircuits-examples
```

## Development


### Prerequisites

Xircuits requires nodejs and yarn to build. The test nvm version is 14.15.3. 
You may also want to set yarn globally accessible by:

```
npm install --global yarn
```

### Build
```
git clone https://github.com/XpressAI/xircuits
```
Make and activate python env. The tested python versions are 3.9.6

```
python -m venv venv
venv/Scripts/activate
```

Download python packages. 

```
pip install -r requirements.txt
```

Run the following commands to install the package in local editable mode and install xircuits into the JupyterLab environment.

```
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Enable the server extension
jupyter server extension enable xircuits
```
### Running
Start up xircuits using:
```
xircuits
```
Xircuits will open automatically in the browser.

##### If additional arguments required, launch xircuits using:
```
jupyter lab 
```
### Rebuild
Rebuild Xircuits after making changes.
```
# Rebuild Typescript source after making changes
jlpm build
# Rebuild Xircuits after making any changes
jupyter lab build
```
### Rebuild (Automatically)
You can watch the source directory and run Xircuits in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.
```
# Watch the source directory in another terminal tab
jlpm run watch
# Run Xircuits in watch mode in one terminal tab
jupyter lab --watch
```

## Preview

### Machine Learning
![ML example](https://user-images.githubusercontent.com/68586800/160897662-cfe31276-fe33-4400-b0a8-4f4b32263d2b.gif)

### PySpark
![spark submit](https://user-images.githubusercontent.com/68586800/156138662-f3181471-6433-49dd-a8c1-2f73eea14d11.png)

### AutoML
![automl](https://user-images.githubusercontent.com/68586800/160885831-50278dfd-3ad1-402c-a0f7-e233b163dbbc.gif)

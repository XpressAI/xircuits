| **[Documentation](https://xircuits.io/docs/index)** |
**[Dev Discord](https://discord.gg/vgEg2ZtxCw)** |


![Asset 13400x](https://user-images.githubusercontent.com/68586800/144788478-2de08f79-cb0a-4d5b-bde5-90412abc11b0.png)

Xircuits is a Jupyterlab-based extension that enables visual, low-code, training workflows. It allows anyone to easily create executable python code in seconds.


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

# Rebuild Typescript source after making changes
jlpm build
# Rebuild JupyterLab after making any changes
jupyter lab build

```

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.
```
# Watch the source directory in another terminal tab
jlpm run watch
# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch
```

By running jupyter lab, you should be able to load the Xircuit Panel by selecting a .xircuit file in the file browser or launch the xircuit from Launcher > Xircuit File

![image](https://user-images.githubusercontent.com/23378929/133190662-61e71e75-88a4-4fca-8b9c-c1f7ed1fac55.png)


The current extension looks like this.

![02-components](https://user-images.githubusercontent.com/68586800/147523242-f549f9f3-edba-492b-9ebe-a2c3fdfb8a86.gif)


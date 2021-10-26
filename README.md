# JupyterLab Engine Plugins

The current iteration of the juypterlab engine are made of seperate extensions of Jupyterlab 3.1.10. The following steps is if you're developing on a Windows or Ubuntu 20.04. 
```
git clone https://github.com/XpressAI/xai-jupyterlab
```
Make and activate python env. The tested python versions are 3.9.6

```
python -m install venv venv
venv/Scripts/activate
```

Download python packages. Currently it's located at /xpipe/

```
cd xpipe
pip install -r requirements.txt
# For Linux
# pip install -r requirements_linux.txt
```

The main body of the app is the xpipe. It also have a server extension. Ensure you are in the /xpipe/ folder and run

```
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Enable the server extension
jupyter server extension enable xpipe

# Rebuild Typescript source after making changes
jlpm build
# Rebuild JupyterLab after making any changes
jupyter lab build

```

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.
```
# Watch the source directory in another terminal tab
jlpm watch
# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch
```

By running jupyter lab, you should be able to load the Xpipe Panel by selecting a .xpipe file in the file browser or launch the xpipe from Launcher > Xpipe File

![image](https://user-images.githubusercontent.com/23378929/133190662-61e71e75-88a4-4fca-8b9c-c1f7ed1fac55.png)


The current extension looks like this.
![Xpipe v0 3 4](https://user-images.githubusercontent.com/68586800/134819194-c7f932e2-beb5-4e35-ba53-3a3bf24dccdc.png)


You may view the current features implemented in our [feature spreadsheet](https://docs.google.com/spreadsheets/d/158-vQ3sFknn0Kd4M5vNVCabWzlAglk-xh8uFOE1dhHQ/edit?usp=sharing).

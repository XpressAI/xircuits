# JupyterLab Engine Plugins

The current iteration of the juypterlab engine are made of seperate extensions of Jupyterlab 3.1.10. The following steps is if you're developing on a Windows. 
```
git clone https://github.com/XpressAI/xai-jupyterlab
```
Make and activate python env. The tested python versions are 3.9.6

```
pip -m install venv venv
venv/Scripts/activate
```

Download python packages. Currently it's located at /xpipe/

```
cd xpipe
pip install -r requirements.txt
```

The main body of the app is the xpipe and is installed using jlpm /yarn. Ensure you are in the /xpipe/ folder and run

```jlpm
jlpm build
jupyter labextension install .

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

By running jupyter lab, you should be able to launch the xpipe from Launcher > React Widget 

![image](https://user-images.githubusercontent.com/68586800/133176120-6ea66168-fa87-44bc-b145-a01f4f2bfc7d.png)

To install the xpipe component library sidebar, cd into /xpipe_component_library/ from the root directory and run npm install. 

```
npm install
jupyter labextension develop . --overwrite
```

The current extension looks like this.
![image](https://user-images.githubusercontent.com/68586800/133176174-580e03d1-7160-4dc3-b7f5-74b669af4694.png)

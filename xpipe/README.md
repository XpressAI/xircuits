# Xpipe Widget

> Create a Xpipe React.js Widget in JupyterLab.

The xpipe extension now uses the `ReactWidget` wrapper from `@jupyterlab/apputils` to use React in a JupyterLab extension. You might want to nuke your old npm and lib folder before migrating to ths version.

https://github.com/jupyterlab/extension-examples/tree/master/react-widget

## Install

Unlike the previous one, this uses jlpm / yarn to compile the packages.

```bash
jlpm
jlpm build
jupyter labextension install .

# Rebuild Typescript source after making changes
jlpm build
# Rebuild JupyterLab after making any changes
jupyter lab build
```

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.

```bash
# Watch the source directory in another terminal tab
jlpm watch
# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch
```

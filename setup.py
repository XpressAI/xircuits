"""
xircuits setup
"""
import json
import sys
from pathlib import Path

import setuptools
from setuptools import setup, find_packages


HERE = Path(__file__).parent.resolve()

# The name of the project
name = "xircuits"

lab_path = (HERE / name.replace("-", "_") / "labextension")

# Representative files that should exist after a successful build
ensured_targets = [
    str(lab_path / "package.json"),
    str(lab_path / "static/style.js")
]

labext_name = "xircuits"

data_files_spec = [
    ("share/jupyter/labextensions/%s" % labext_name, str(lab_path.relative_to(HERE)), "**"),
    ("share/jupyter/labextensions/%s" % labext_name, str("."), "install.json"),
    ("etc/jupyter/jupyter_server_config.d",
     "jupyter-config/server-config", "xircuits.json"),
    # For backward compatibility with notebook server
    ("etc/jupyter/jupyter_notebook_config.d",
     "jupyter-config/nb-config", "xircuits.json"),
]

long_description = (HERE / "README.md").read_text()

# Get the package info from package.json
pkg_json = json.loads((HERE / "package.json").read_bytes())
version = (
    pkg_json["version"]
    .replace("-alpha.", "a")
    .replace("-beta.", "b")
    .replace("-rc.", "rc")
) 

setup_args = dict(
    name=name,
    version=version,
    url=pkg_json["homepage"],
    author=pkg_json["author"]["name"],
    author_email=pkg_json["author"]["email"],
    description=pkg_json["description"],
    license=pkg_json["license"],
    license_file="LICENSE",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=setuptools.find_packages(),
    install_requires=[
        "anyio==3.3.0",
        "appnope==0.1.2",
        "argon2-cffi==20.1.0",
        "async-generator==1.10",
        "attrs==21.2.0",
        "Babel==2.9.1",
        "backcall==0.2.0",
        "bleach==4.1.0",
        "certifi==2020.12.5",
        "cffi==1.14.4",
        "chardet==4.0.0",
        "click==8.0.3",
        "colorama==0.4.4",
        "debugpy==1.4.3",
        "decorator==4.4.2",
        "defusedxml==0.6.0",
        "deprecation==2.1.0",
        "entrypoints==0.3",
        "flask==2.0.2",
        "idna==2.10",
        "importlib-metadata==3.3.0",
        "ipykernel==6.4.1",
        "ipython>=7.31.1",
        "ipython-genutils==0.2.0",
        "itsdangerous==2.0.1",
        "jedi==0.18.0",
        "jinja2==3.0.3",
        "json5==0.9.6",
        "jsonschema==3.2.0",
        "jupyter-client==6.1.7",
        "jupyter-core==4.7.0",
        "jupyter-packaging==0.10.4",
        "jupyter-server==1.10.2",
        "jupyterlab==3.1.10",
        "jupyterlab-pygments==0.1.2",
        "jupyterlab-server==2.7.2",
        "MarkupSafe==2.0.1",
        "matplotlib-inline==0.1.3",
        "mistune==0.8.4",
        "nbclassic==0.3.1",
        "nbclient==0.5.1",
        "nbconvert==6.0.7",
        "nbformat==5.0.8",
        "nest-asyncio==1.5.1",
        "notebook==6.4.3",
        "packaging==21.0",
        "pandocfilters==1.4.3",
        "parso==0.8.2",
        "pickleshare==0.7.5",
        "prometheus-client==0.11.0",
        "prompt-toolkit==3.0.20",
        "pycparser==2.20",
        "Pygments==2.10.0",
        "pyparsing==2.4.7",
        "pyrsistent==0.17.3",
        "python-dateutil==2.8.1",
        "pytz==2020.5",
        "pyzmq==20.0.0",
        "requests==2.25.1",
        "requests-unixsocket==0.2.0",
        "Send2Trash==1.5.0",
        "six==1.15.0",
        "sniffio==1.2.0",
        "terminado==0.9.1",
        "testpath==0.4.4",
        "tomlkit==0.7.2",
        "tornado==6.1",
        "traitlets==5.0.5",
        "typing-extensions==3.7.4.3",
        "urllib3>=1.26.5",
        "wcwidth==0.2.5",
        "webencodings==0.5.1",
        "websocket-client==1.2.1",
        "Werkzeug==2.0.2",
        "zipp==3.4.0",
        "tensorflow",
        "numpy",
        "scikit-learn",
        "opencv-python",
        "pillow",
        "tqdm",
        "pandas",
        "py4j",
        "pyspark"
    ],
    zip_safe=False,
    include_package_data=True,
    python_requires=">=3.6",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "JupyterLab", "JupyterLab3"],
    classifiers=[
        "License :: OSI Approved :: BSD License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Framework :: Jupyter",
        "Framework :: Jupyter :: JupyterLab",
        "Framework :: Jupyter :: JupyterLab :: 3",
        "Framework :: Jupyter :: JupyterLab :: Extensions",
        "Framework :: Jupyter :: JupyterLab :: Extensions :: Prebuilt",
    ],
    entry_points ={
        'console_scripts': [
            'xircuits = xircuits.start_xircuits:main'
            ]}
)

try:
    from jupyter_packaging import (
        wrap_installers,
        npm_builder,
        get_data_files
    )
    post_develop = npm_builder(
        build_cmd="install:extension", source_dir="src", build_dir=lab_path
    )
    setup_args["cmdclass"] = wrap_installers(post_develop=post_develop, ensured_targets=ensured_targets)
    setup_args["data_files"] = get_data_files(data_files_spec)
except ImportError as e:
    import logging
    logging.basicConfig(format="%(levelname)s: %(message)s")
    logging.warning("Build tool `jupyter-packaging` is missing. Install it with pip or conda.")
    if not ("--name" in sys.argv or "--version" in sys.argv):
        raise e

if __name__ == "__main__":
    setuptools.setup(**setup_args)

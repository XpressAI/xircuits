"""
xircuits setup
"""
import json
import sys
from pathlib import Path

import setuptools
from setuptools import setup, find_packages

import os

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

with open("requirements.txt", encoding='utf-8-sig') as f:
    required = f.read().splitlines()

component_library_reqs = {}
full_reqs = []

for lib_name in os.listdir("xai_components/"):

    req_path = "xai_components/" + lib_name + "/requirements.txt"
    
    if os.path.exists(req_path):
        with open(req_path, encoding='utf-8-sig') as f:
            packages_required = f.read().splitlines()
            package_name = "_".join(lib_name.split("_")[1:])
            component_library_reqs.update({package_name : packages_required})
            full_reqs.extend(component_library_reqs)

component_library_reqs.update({"full": full_reqs})

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
    install_requires=required,
    extras_require=component_library_reqs,
    zip_safe=False,
    include_package_data=True,
    python_requires=">=3.8",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "JupyterLab", "JupyterLab3"],
    classifiers=[
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Framework :: Jupyter",
        "Framework :: Jupyter :: JupyterLab",
        "Framework :: Jupyter :: JupyterLab :: 3",
        "Framework :: Jupyter :: JupyterLab :: Extensions",
        "Framework :: Jupyter :: JupyterLab :: Extensions :: Prebuilt",
    ],
    entry_points ={
        'console_scripts': [
            'xircuits = xircuits.start_xircuits:main',
            'xircuits-examples = xircuits.start_xircuits:download_examples',
            'xircuits-components = xircuits.start_xircuits:download_component_library'
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

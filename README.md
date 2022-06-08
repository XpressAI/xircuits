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
        <img alt="Documentation" src="https://img.shields.io/website/http/xircuits.io.svg?color=orange">
    </a>
     <a>
        <img alt="Python" src="https://img.shields.io/badge/Python-3.8%20%7C%203.9%20%7C%203.10-blue">
    </a>
</p>

![frontpage](https://user-images.githubusercontent.com/68586800/160965807-ba0fb65d-3912-4155-96fd-010ae082830b.gif)

Xircuits is a Jupyterlab-based extension that enables visual, low-code, training workflows. It allows anyone to easily create executable python code in seconds.

## Features

<details>
  <summary><b>Rich Xircuits Canvas Interface</b></summary>
  <br>
  <p align="center">Unreal Engine-like Chain Component Interface<br>
  <img src=https://user-images.githubusercontent.com/68586800/165813394-3d81e135-1c40-42c6-b480-7cba48114c1c.gif
 width="600"></p>

  <p align="center">Custom Nodes and Ports<br>
  <img src=https://user-images.githubusercontent.com/84708008/161918620-34e20908-f32d-406b-8e47-104e91249472.gif width="600"></p>
  
  <p align="center">Smart Link and Type Check Logic<br>
  <img src=https://user-images.githubusercontent.com/84708008/165257379-77776d0e-8b20-4ef9-820b-40b9e80697e4.gif width="600"></p>
  
  <p align="center">Component Tooltips<br>
  <img src=https://user-images.githubusercontent.com/84708008/163518580-186d4298-3344-4280-a87a-67be90eec13f.gif width="600"></p>
</details>

<details>
  <summary><b>Code Generation</b></summary>

  Xircuits generates executable python scripts from the canvas. As they're very customizable, you can perform DevOps automation like actions. Consider this Xircuits template which trains an mnist classifier.
  
  ![hyperpara-codegen](https://user-images.githubusercontent.com/68586800/165815661-2b6e17e8-ed1d-4950-97b1-658d2bd14410.gif)

  You can run the code generated python script in Xircuits, but you can also take the same script to train 3 types of models in one go using bash script:

    TrainModel.py --epoch 5 --model "resnet50"
    TrainModel.py --epoch 5 --model "vgg16"
    TrainModel.py --epoch 5 --model "mobilenet"

</details>

<details>
<summary><b>Famous Python Library Support</b></summary>
Xircuits is built on top of the shoulders of giants. Perform ML and DL using Tensorflow or Pytorch, accelerate your big data processing via Spark, or perform autoML using Pycaret. We're constantly updating our Xircuits library, so stay tuned for more!

Didn't find what you're looking for? Creating Xircuits components is very easy! If it's in python - it can be made into a component. Your creativity is the limit, create components that are easily extendable!

</details>

<details>
<summary><b>Effortless Collaboration</b></summary>
Created a cool Xircuits workflow? Just pass the .xircuits file to your fellow data scientist, they will be able to load your Xircuits canvas instantly.

![collab](https://user-images.githubusercontent.com/68586800/165814749-bd782c59-f4d1-4452-a668-48543006d69e.gif)

Created a cool component library? All your colleagues need to do is to drop your component library folder in theirs and they can immediately use your components.


</details>

And many more.

## Installation
You will need python 3.8+ to install xircuits. We recommend installing in a virtual environment.
```
$ pip install xircuits[full]
```
If you would like to install just the core functions, use:
```
$ pip install xircuits
```
### Download Examples
```
$ xircuits-examples
```
### Launch
```
$ xircuits
```


## Development

For most use cases installing via `pip install xircuits` should be enough. If you would like to modify some of the Xircuits core functions (such as node and port logic) you may follow the following steps.
### Prerequisites

Building Xircuits requires nodejs and yarn. The test nvm version is 14.15.3. 
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

## Use Cases

### Machine Learning
![ML example](https://user-images.githubusercontent.com/68586800/160897662-cfe31276-fe33-4400-b0a8-4f4b32263d2b.gif)

### PySpark
![spark submit](https://user-images.githubusercontent.com/68586800/156138662-f3181471-6433-49dd-a8c1-2f73eea14d11.png)

### AutoML
![automl](https://user-images.githubusercontent.com/68586800/165808829-74070074-b23b-4bb7-8a4e-d1ff30f5df72.gif)

### Anomaly Detection
![anomaly-detection](https://user-images.githubusercontent.com/68586800/161716353-87def49c-af93-4819-9455-687de0b283df.gif)

### NLP
![nlp](https://user-images.githubusercontent.com/68586800/161892702-fbe51b93-846d-410a-bb80-75255c1a9565.gif)
### Clustering
![clustering](https://user-images.githubusercontent.com/68586800/161884656-ec2a3d33-e56d-4cdf-8c16-4fc964c1b8f3.gif)

## Developers Discord
Have any questions? Feel free to chat with the devs at our [Discord](https://discord.com/invite/vgEg2ZtxCw)!

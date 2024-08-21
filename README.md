<p align="center">
<img src="https://user-images.githubusercontent.com/68586800/151280601-7ff2b7b2-10e5-4544-b3df-aa6a5a654dae.png" width="450"/>
</p>

<p align="center">
  <a href="https://xircuits.io/">Docs</a> •
  <a href="https://xircuits.io/docs/main/Installation">Install</a> •
  <a href="https://xircuits.io/docs/category/tutorials">Tutorials</a> •
  <a href="https://xircuits.io/docs/category/developer-guide">Developer Guides</a> •
  <a href="https://github.com/XpressAI/xircuits/blob/master/CONTRIBUTING.md">Contribute</a> •
  <a href="https://www.xpress.ai/blog/">Blog</a> •
  <a href="https://discord.com/invite/vgEg2ZtxCw">Discord</a>
<br>
  <a href="https://github.com/XpressAI/xircuits/tree/master/xai_components#xircuits-component-library-list">Component Libraries</a> •
  <a href="https://github.com/XpressAI/xircuits/tree/master/project-templates#xircuits-project-templates-list">Project Templates</a> •
  <a href="https://xpress.ai/">Enterprise</a>
</p>

<p>
  <p align="center">
    <a href="https://github.com/XpressAI/xircuits/blob/master/LICENSE">
        <img alt="GitHub" src="https://img.shields.io/github/license/XpressAI/xircuits?color=brightgreen">
    </a>
    <a href="https://github.com/XpressAI/xircuits/releases">
        <img alt="GitHub release" src="https://img.shields.io/github/release/XpressAI/xircuits.svg?color=yellow">
    </a>
    <a href="https://mybinder.org/v2/gh/XpressAi/xircuits/main?urlpath=lab">
        <img alt="Binder" src="https://mybinder.org/badge_logo.svg">
    </a>
    <a href="https://xircuits.io">
        <img alt="Documentation" src="https://img.shields.io/website/http/xircuits.io.svg?color=orange">
    </a>
     <a>
        <img alt="Python" src="https://img.shields.io/badge/Python-3.8%20%7C%203.9%20%7C%203.10%20%7C%203.11-blue">
    </a>
</p>

![1_13 release](https://github.com/user-attachments/assets/472481f2-9c48-4cf9-8958-99135b02379c)

Xircuits is a Jupyterlab-based extension that enables visual, low-code, training workflows. It allows anyone to easily create executable python code in seconds.

# Features

<details>
  <summary><b>Rich Xircuits Canvas Interface</b></summary>
  <br>
  <p align="center">Unreal Engine-like Chain Component Interface<br>
  <img src=https://xircuits.io/img/docs/interface-chain.gif
 width="600"></p>

  <p align="center">Custom Nodes and Ports<br>
  <img src=https://xircuits.io/img/docs/interface-custom-ports.gif width="600"></p>
  
  <p align="center">Smart Link and Type Check Logic<br>
  <img src=https://xircuits.io/img/docs/interface-smart-link.gif width="600"></p>
  
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

And many more.

# Installation
You will need python 3.8+ to install Xircuits. We recommend installing in a virtual environment.

  ```
  $ pip install xircuits
  ```

You will also need to install the component library before using them. For example, if you would like to use the Pytorch components, install them by:

  ```
  $ xircuits install pytorch
  ```

For the list of available libraries, you can check [here]( https://github.com/XpressAI/xircuits/tree/master/xai_components). 

## Download Examples
```
$ xircuits examples
```
## Launch
```
$ xircuits
```


# Development
Creating workflows and components in Xircuits is easy. We've provided extensive guides for you in our [documentation](https://xircuits.io/). Here are a few quick links to get you started:

- **Tutorials**: [Your First Xircuits Workflow](https://xircuits.io/docs/main/tutorials/getting-started-with-xircuits) | [Running a Xircuits Project Template](https://xircuits.io/docs/project-template/running-a-xircuits-project-template)
- **Component Development**: [Creating a Xircuits Component](https://xircuits.io/docs/main/tutorials/integrating-python-code-with-xircuits) | [Creating a Xircuits Component Library](https://xircuits.io/docs/main/developer-guide/creating-a-xircuits-component-library)
- **Advanced**: [Xircuits Core Development](https://xircuits.io/docs/main/developer-guide/developing-xircuits-core-features)

# Use Cases

### GPT Agent Toolkit | BabyAGI
![BabyAGI demo](https://github.com/XpressAI/xai-gpt-agent-toolkit/blob/main/demo.gif?raw=true)

### Discord Bots
![DiscordCVBot](https://user-images.githubusercontent.com/68586800/232880388-0a999fa2-f9cf-40df-be51-73601afc8963.gif)

### PySpark
![spark submit](https://user-images.githubusercontent.com/68586800/156138662-f3181471-6433-49dd-a8c1-2f73eea14d11.png)

### AutoML
![automl](https://user-images.githubusercontent.com/68586800/165808829-74070074-b23b-4bb7-8a4e-d1ff30f5df72.gif)

### Anomaly Detection
![anomaly-detection](https://user-images.githubusercontent.com/68586800/161716353-87def49c-af93-4819-9455-687de0b283df.gif)

## Developers Discord
Have any questions? Feel free to chat with the devs at our [Discord](https://discord.com/invite/vgEg2ZtxCw)!

## Enterprise Support
For organizations looking to scale their Xircuits deployments or requiring additional features and support - the XpressAI Platform offers enhanced capabilities and dedicated support to transform your workflows into robust, production-ready applications. It's ideal for teams and enterprises seeking to maximize the potential of their Xircuits projects.

Ready to take your Xircuits experience to the next level? Sign up for the XpressAI Platform [here](https://xpress.ai/).
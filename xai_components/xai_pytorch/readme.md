# Xircuits Comprehensive PyTorch Libraries

These libraries collectively provide extensive functionalities for integrating PyTorch into Xircuits workflows, encompassing both general PyTorch operations and neural network-specific tasks.

### Installation
```bash
pip install xircuits-pytorch-components
```
You may also install it manually via
```
pip install -r requirements.txt
```

## Xircuits PyTorch Component Library
Core components essential for developing and deploying machine learning models using PyTorch in Xircuits, covering tasks from data preparation to model evaluation.

### Components
- **LoadTorchVisionDataset**: Loads Torch Vision datasets like MNIST and CIFAR.
- **TorchDataLoader**: Creates DataLoader instances for efficient batch processing.
- **ExampleTorchModelConfig**: Sets up an example Torch model with configurable parameters.
- **TrainTorchModel**: Trains a Torch model with a given DataLoader and configuration.
- **TestTorchModel**: Tests a trained Torch model for performance evaluation.
- **SaveTorchModelState**: Saves the state of a trained Torch model.
- **LoadTorchModelState**: Loads a saved Torch model's state.
- **TorchModelPredict**: Performs predictions using a trained Torch model.
- **Image2TorchTensor**: Converts images to Torch tensors for model input.
- **TorchModelPredictFromTensor**: Predicts using a Torch model and tensor input.

## Xircuits PyTorch Neural Network Component Library

Designed for building and configuring neural network models in Xircuits. It offers flexibility in customizing architectures for various machine learning and deep learning tasks.

### Components
- **TorchModel**: Builds custom Torch neural network models.
- **TorchAddLinearLayer**: Adds linear layers to a model.
- **TorchAddConv1DLayer** and **TorchAddConv2DLayer**: Integrates 1D and 2D convolutional layers.
- **TorchAddTransformerEncoderLayer** and **TorchAddTransformerDecoderLayer**: Adds Transformer Encoder and Decoder layers.
- **TorchLSTM**: Incorporates LSTM layers for sequence data.
- **TorchAddReluLayer**: Adds ReLU activation layers.
- **TorchAddDropoutLayer**: Includes dropout layers for regularization.
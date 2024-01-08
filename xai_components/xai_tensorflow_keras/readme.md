# Xircuits Comprehensive Keras Library

This comprehensive library for Xircuits encompasses a wide range of functionalities involving Keras datasets, model management, model instantiation, prediction, and transfer learning. It's designed to facilitate various machine learning tasks within the Xircuits visual programming interface.

### Prerequisites

- Python 3.8 or higher
- TensorFlow 2.x

### Installation

```bash
xircuits install tensorflow_keras
```

You may also install it manually via

```bash
pip install -r requirements.txt
```

## Keras Dataset and Model Management

For tasks from dataset preparation to model training and evaluation.

### Components

- **`ReadKerasDataSet`**: Loads Keras datasets or creates datasets from directories. Supports MNIST, CIFAR-10/100, and custom datasets.
- **`FlattenImageData`**: Converts 2D dataset tuples to 1D, suitable for 1D neural networks.
- **`TrainTestSplit`**: Splits datasets into training and testing sets with configurable parameters.
- **`KerasCreate1DInputModel`**: Creates 1D Keras models for 1D input datasets.
- **`KerasCreate2DInputModel`**: Assembles 2D Keras models, perfect for image-based datasets.
- **`KerasTrainImageClassifier`**: Trains Keras models for image classification.
- **`KerasEvaluateAccuracy`**: Evaluates Keras models against datasets for accuracy and loss.
- **`ShouldStop`**: Decides if training should stop based on accuracy targets or max retries.
- **`SaveKerasModel`**: Saves Keras models as `.h5` files for later use.

## Keras Model Instantiation and Prediction

These components support a range of model architectures for image classification.

### Components

- **`LoadKerasModel`**: Loads Keras models with customizable configurations.
- **`KerasPredict`**: Performs predictions with Keras models on images.
- **`ResNet50`, `ResNet101`, `ResNet152`**: Instantiates various ResNet models with customizable configurations.
- **`VGG16`, `VGG19`**: Provides VGG model architectures for image classification.
- **`Xception`**: Implements the Xception architecture for image classification.
- **`MobileNet`**: Offers MobileNet architecture with adjustable parameters.

## TensorFlow Keras Transfer Learning

Designed for easy integration into Xircuits workflows for transfer learning scenarios, suitable for both beginners and experienced ML practitioners.

### Components

- **`KerasTransferLearningModel`**: Fetches TensorFlow Keras Models for transfer learning.
- **`TFDataset`**: Retrieves datasets from TensorFlow Datasets.
- **`TrainKerasModel`**: Trains compiled Keras models with training data.
- **`TFDSEvaluateAccuracy`**: Evaluates Keras models' accuracy using TensorFlow Datasets.
- **`KerasModelCompiler`**: Compiles TensorFlow Keras models with custom configurations.
- **`SaveKerasModel`**: Saves TensorFlow Keras models for future use.
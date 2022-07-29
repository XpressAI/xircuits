from typing import Tuple, Dict
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import datasets, layers, models
import numpy as np
from xai_components.base import InArg, InCompArg, OutArg, Component, xai_component
import os
import sys
from pathlib import Path

@xai_component
class ReadDataSet(Component):
    """Loads a Keras image dataset or creates a dataset from a directory.
    
    ### Reference:
    - Keras Model Applications: https://keras.io/api/datasets/

    ##### inPorts:
    - dataset_name: Loads a Keras image dataset given a valid string 
        (mnist / mnist fasion / cifar10 / cifar 100) OR 
        creates a dataset object when given a valid dataset directory path. 
        
        For the latter, the directory must have subdirectories and each 
        subdirectory name will be treated as its own class.

        for example, when given a Literal String `DATASET`, the structure must be:
        working_dir/
            |- DATASET 
                |- CLASS_1
                |- CLASS_2
                |- CLASS_3
        
    ##### outPorts:
    - dataset: a dataset tuple
    - class_dict: dict of classes if not using IMAGENET.
    """  

    dataset_name: InCompArg[str]
    dataset: OutArg[Tuple[np.array, np.array]]
    class_dict: OutArg[dict]


    def __init__(self):
        self.done = False
        self.dataset_name = InCompArg.empty()
        self.dataset = OutArg.empty()
        self.class_dict = OutArg.empty()


    def execute(self, ctx) -> None:

        if self.dataset_name.value == 'mnist':
            (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()

            # Scale images to the [0, 1] range
            x_train = x_train.astype("float32") / 255
            x_test = x_test.astype("float32") / 255
            # Make sure images have shape (28, 28, 1)
            x_train = np.expand_dims(x_train, -1)
            x_test = np.expand_dims(x_test, -1)

            new_x = np.vstack((x_train, x_test))
            new_y = np.concatenate((y_train, y_test), axis=None)
            self.dataset.value = (new_x, new_y)

        elif self.dataset_name.value == 'fashion_mnist':
            (x_train, y_train), (x_test, y_test) = keras.datasets.fashion_mnist.load_data()

            # Scale images to the [0, 1] range
            x_train = x_train.astype("float32") / 255
            x_test = x_test.astype("float32") / 255
            # Make sure images have shape (28, 28, 1)
            x_train = np.expand_dims(x_train, -1)
            x_test = np.expand_dims(x_test, -1)

            new_x = np.vstack((x_train, x_test))
            new_y = np.concatenate((y_train, y_test), axis=None)
            self.dataset.value = (new_x, new_y)

        elif self.dataset_name.value == 'cifar10':
            (x_train, y_train), (x_test, y_test) = keras.datasets.cifar10.load_data()

            # Normalize pixel values to be between 0 and 1
            x_train, x_test = x_train / 255.0, x_test / 255.0

            new_x = np.vstack((x_train, x_test))
            new_y = np.concatenate((y_train, y_test), axis=None)

            self.dataset.value = (new_x, new_y)

        elif self.dataset_name.value == 'cifar100':
            (x_train, y_train), (x_test, y_test) = keras.datasets.cifar10.load_data()

            # Normalize pixel values to be between 0 and 1
            x_train, x_test = x_train / 255.0, x_test / 255.0

            new_x = np.vstack((x_train, x_test))
            new_y = np.concatenate((y_train, y_test), axis=None)

            self.dataset.value = (new_x, new_y)


        elif self.dataset_name.value:
            try:
                import cv2
                from tqdm import tqdm

                BASE_FOLDER = self.dataset_name.value
                folders = [os.path.join(BASE_FOLDER, folder) for folder in os.listdir(BASE_FOLDER)]
                
                print(f"Detecting {len(folders)} classes in {BASE_FOLDER}.")
                # lists to store data
                data = []
                label = []
                for folder in tqdm(folders):
                    for file in os.listdir(folder):

                        file = os.path.join(folder, file)

                        try:
                            img = cv2.imread(file)
                            img = cv2.resize(img, (256, 256))
                            data.append(img)
                            label.append(folder)

                        except: 
                            print(f'Error reading file: {os.path.abspath(file)}. Skipping...')                        

                new_x = np.asarray(data)

                # Import label encoder
                from sklearn import preprocessing
                label_encoder = preprocessing.LabelEncoder()
                new_y = label_encoder.fit_transform(label)

                print(f"x_shape = {new_x.shape}, y_shape = {new_y.shape}")

                self.dataset.value = (new_x, new_y)

            except Exception as e: 
                print(e)

        else:
            print("Dataset was not found!")


        self.done = True

@xai_component
class FlattenImageData(Component):

    """Takes a 2D dataset tuple from the ReadDataSet component  
    that contains tuple and flattens it to 1D. 

    ##### inPorts:
    - dataset: 2D dataset tuple from the ReadDataSet component.

    ##### outPorts:
    - resized_dataset: 1D tuple dataset object.
    """  

    dataset: InCompArg[Tuple[np.array, np.array]]
    resized_dataset: OutArg[Tuple[np.array, np.array]]

    def __init__(self):
        self.done = False
        self.dataset = InCompArg.empty()
        self.resized_dataset = OutArg.empty()

    def execute(self, ctx) -> None:

        x = self.dataset.value[0]
        x = x.reshape(x.shape[0], -1)

        self.resized_dataset.value = (x, self.dataset.value[1])
        print(f"resized_dataset = {np.shape(self.resized_dataset.value)}")

        self.done = True


@xai_component
class TrainTestSplit(Component):
    """Takes a dataset tuple and splits it into train test tuples.
    
    ### Reference: 
    - [Scikit-learn Train Test Split](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html)

    ##### inPorts:
    - dataset: dataset in the form of np array tuples. `Tuple[np.array, np.array]`
    - train_split: float ratio of the train split. Default `0.75`.
    - random_state: seed for random state. Default `None`.
    - shuffle: Enable dataset shuffle with True / False. Default `True`.
    - stratify: Data is split in a stratified fashion, using this as the class labels. 
        Default `None`.

    ##### outPorts:
    - train: tuple that contains the train split of the dataset.
    - test:tuple that contains the test split of the dataset.
    - resized_dataset: 1D tuple object.
    """

    dataset: InCompArg[Tuple[np.array, np.array]]
    train_split: InArg[float]
    random_state: InArg[int]
    shuffle: InArg[bool]
    stratify: InArg[any]
    train: OutArg[Tuple[np.array, np.array]] 
    test: OutArg[Tuple[np.array, np.array]] 

    def __init__(self):
        self.done = False
        self.dataset = InCompArg.empty()
        self.train_split = InArg.empty()
        self.random_state = InArg.empty()
        self.shuffle = InArg.empty()
        self.stratify = InArg.empty()
        self.train = OutArg.empty()
        self.test = OutArg.empty()

    def execute(self, ctx) -> None:
        
        from sklearn.model_selection import train_test_split

        train_split = self.train_split.value if self.train_split.value else 0.75
        shuffle = self.shuffle.value if self.shuffle.value else True
        random_state = self.random_state.value if self.random_state.value else None
        stratify = self.stratify.value if self.stratify.value else None

        print(f"Split Parameters:\nTrain Split {train_split} \nShuffle: {shuffle} \nRandom State: {random_state}")
        splits = train_test_split(self.dataset.value[0], self.dataset.value[1], 
                                    test_size=train_split, shuffle=shuffle, 
                                    random_state=random_state, stratify=stratify)
        
        train_x = splits[0]
        test_x = splits[1]
        train_y = splits[2]
        test_y = splits[3]

        train = train_x, keras.utils.to_categorical(train_y, int(test_y.max()) + 1)
        test = test_x, keras.utils.to_categorical(test_y, int(test_y.max()) + 1)

        self.train.value = train
        self.test.value = test
        self.done = True

@xai_component
class Create1DInputModel(Component):
    """Takes a 1D dataset tuple and creates a 1D Keras model.

    ##### inPorts:
    - training_data: dataset tuple which contains 1D numpy array.
    
    ##### outPorts:
    - model: keras model.
    """

    training_data: InCompArg[Tuple[np.array, np.array]]
    model: OutArg[keras.Sequential]

    def __init__(self):
        self.done = False
        self.training_data = InCompArg.empty()
        self.model = OutArg.empty()

    def execute(self, ctx) -> None:
        x_shape = self.training_data.value[0].shape
        y_shape = self.training_data.value[1].shape

        model = keras.Sequential([
            keras.layers.Dense(512, activation='relu', input_shape=(x_shape[1],)),
           keras.layers.Dropout(rate=0.5),
            keras.layers.Dense(y_shape[1], activation='softmax')
        ])

        model.compile(
            loss='categorical_crossentropy',
            optimizer='adam',
            metrics=['accuracy']
        )

        self.model.value = model

        self.done = True

@xai_component
class Create2DInputModel(Component):
    """Takes a 2D dataset tuple and creates a 2D Keras model.

    ##### inPorts:
    - training_data: dataset tuple which contains 2D numpy array.
    
    ##### outPorts:
    - model: keras model.
    - model_config: keras model config dict. 
        Contains 'lr', 'optimizer_name' and 'loss'.
    """
    training_data: InCompArg[Tuple[np.array, np.array]]

    model: OutArg[keras.Sequential]
    model_config: OutArg[dict]


    def __init__(self):
        self.done = False
        self.training_data = InCompArg.empty()
        self.model = OutArg.empty()
        self.model_config = OutArg.empty()


    def execute(self, ctx) -> None:

        x_shape = self.training_data.value[0].shape[1:]
        y_shape = self.training_data.value[1].shape[1]
        print(f"{x_shape=}")
        print(f"{y_shape=}")

        model = keras.Sequential(
            [
                keras.Input(shape=x_shape),
                layers.Conv2D(32, kernel_size=(3, 3), activation="relu"),
                layers.MaxPooling2D(pool_size=(2, 2)),
                layers.Conv2D(64, kernel_size=(3, 3), activation="relu"),
                layers.MaxPooling2D(pool_size=(2, 2)),
                layers.Flatten(),
                layers.Dropout(0.5),
                layers.Dense(y_shape, activation="softmax"),
            ]
        )

        model.compile(
            loss='categorical_crossentropy',
            optimizer='adam',
            metrics=['accuracy']
        )

        model_config = {
            'lr': model.optimizer.lr.numpy().item(),
            'optimizer_name': model.optimizer._name,
            'loss': model.loss,
        }

        self.model.value = model
        self.model_config.value = model_config

        self.done = True


@xai_component
class TrainImageClassifier(Component):
    """Trains a Keras model for image classification.

    ##### inPorts:
    - model: a Keras model object.
    - training_data: a dataset tuple with (X (data), Y (label)).
    - training_epochs: number of training epochs. Default `1`.

    ##### outPorts:
    - trained_model: trained Keras model config.
    - training_metrics: dict which contains results of training.
    """
    
    model: InCompArg[keras.Sequential]
    training_data: InCompArg[Tuple[np.array, np.array]] 
    training_epochs: InArg[int]

    trained_model: OutArg[keras.Sequential]
    training_metrics: OutArg[dict]

    def __init__(self):
        self.done = False

        self.model = InCompArg.empty()
        self.training_data = InCompArg.empty()
        self.training_epochs = InArg.empty()
        self.trained_model = OutArg.empty()
        self.training_metrics = OutArg.empty()

    def execute(self, ctx) -> None:

        model = self.model.value
        epoch = self.training_epochs.value if self.training_epochs.value else 1

        train = model.fit(
            self.training_data.value[0],
            self.training_data.value[1],
            batch_size=32,
            epochs=epoch
        )

        # Set training metrics
        training_metrics = {}
        for key in train.history.keys():
            training_metrics[key] = {}
            [training_metrics[key].update({i + 1: v}) for i, v in enumerate(train.history[key])]

        self.trained_model.value = model
        self.training_metrics.value = training_metrics
        self.done = True


@xai_component
class EvaluateAccuracy(Component):
    """Evaluates a Keras model against a dataset

    ##### inPorts:
    - model: a Keras model object.
    - eval_dataset: a dataset tuple with (X (data), Y (label)).

    ##### outPorts:
    - metrics: dict which contains results of evaluation.

    """
    model: InCompArg[keras.Sequential]
    eval_dataset: InCompArg[Tuple[np.array, np.array]]

    metrics: OutArg[Dict[str, str]]

    def __init__(self):
        self.done = False
        self.model = InCompArg.empty()
        self.eval_dataset = InCompArg.empty()
        self.metrics = OutArg.empty()

    def execute(self, ctx) -> None:
        (loss, acc) = self.model.value.evaluate(self.eval_dataset.value[0], self.eval_dataset.value[1], verbose=0)
        metrics = {
            'loss': str(loss),
            'accuracy': str(acc)
        }
        print(metrics)

        self.metrics.value = metrics

        self.done = True


@xai_component
class ShouldStop(Component):
    """Checks whether model evaluation has reached targeted accuracy.

    ##### inPorts:
    - target_accuracy: the targeted accuracy in floats.
    - max_retries: the number of attempted tries. Default `1`.
    - metrics: dict that contains results of evaluation.

    ##### outPorts:
    - should_retrain: True if targeted accuracy not reached.
    
    """
    target_accuracy: InCompArg[float]
    metrics: InCompArg[Dict[str, str]]
    max_retries: InArg[int]

    should_retrain: OutArg[bool]

    def __init__(self):
        self.done = False
        self.target_accuracy = InCompArg.empty()
        self.metrics = InArg.empty()
        self.max_retries = InArg.empty()

        self.should_retrain = OutArg(True)
        self.retries = 0

    def execute(self, ctx) -> None:
        self.retries += 1
        max_retries = self.max_retries.value if self.max_retries.value else 1

        if self.retries < max_retries:
            the_accuracy = float(self.metrics.value['accuracy'])
            print('Eval accuracy:' + str(the_accuracy))

            if the_accuracy < self.target_accuracy.value:
                print('Will retrain')
                self.should_retrain.value = True
            else:
                print('Target accuracy achieved')
                self.should_retrain.value = False
        else:
            print('Unable to achieve target accuracy.  Giving up.')
            self.should_retrain.value = False
        self.done = True

@xai_component
class SaveKerasModel(Component):
    """Saves current Keras model.

    ##### inPorts:
    - model: a Keras model.
    - model_name: name to save the Keras model. Default is the .xircuits file name.

    ##### outPorts:
    - model_h5_path: path of the generated .h5 model.
    
    """
    model: InCompArg[any]
    model_name: InArg[str]
    model_h5_path: OutArg[str]

    def __init__(self):
        self.done = False
        self.model = InCompArg.empty()
        self.model_name = InArg.empty()

        self.model_h5_path = OutArg.empty()

    def execute(self, ctx) -> None:
        model = self.model.value
        model_name = self.model_name.value if self.model_name.value else os.path.splitext(sys.argv[0])[0] + ".h5"
        model.save(model_name)
        print(f"Saving Keras h5 model at: {model_name}")
        self.model_h5_path.value = model_name

        self.done = True
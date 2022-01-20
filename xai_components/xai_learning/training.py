from datetime import datetime
from typing import Tuple, Dict
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import datasets, layers, models
import numpy as np
from xai_components.base import InArg, OutArg, Component, xai_component
from sklearn.model_selection import train_test_split
import json
import os
import sys
from pathlib import Path
from tqdm import tqdm


@xai_component(type="in")
class ReadDataSet(Component):
    dataset_name: InArg[str]
    dataset: OutArg[Tuple[np.array, np.array]]
    class_dict: OutArg[any]


    def __init__(self):
        self.done = False
        self.dataset_name = InArg.empty()
        self.dataset = OutArg.empty()
        self.class_dict = OutArg.empty()


    def execute(self) -> None:

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

@xai_component(type="in")
class ReadMaskDataSet(Component):
    dataset_name: InArg[str]
    mask_dataset_name: InArg[str]
    
    dataset: OutArg[Tuple[str, str]]

    def __init__(self):
        self.done = False
        self.dataset_name = InArg.empty()
        self.mask_dataset_name = InArg.empty()
        self.dataset = OutArg.empty()

    def execute(self) -> None:

        if self.dataset_name.value and self.mask_dataset_name.value:
            
            # Preprocessing can be done here if needed
            self.dataset.value = (self.dataset_name.value, self.mask_dataset_name.value)
            print(self.dataset.value)

        else:
            print("Dataset was not found!")

        self.done = True


@xai_component
class FlattenImageData(Component):

    dataset: InArg[Tuple[np.array, np.array]]
    resized_dataset: OutArg[Tuple[np.array, np.array]]

    def __init__(self):
        self.done = False
        self.dataset = InArg.empty()
        self.resized_dataset = OutArg.empty()

    def execute(self) -> None:

        x = self.dataset.value[0]
        x = x.reshape(x.shape[0], -1)

        self.resized_dataset.value = (x, self.dataset.value[1])
        print(f"resized_dataset = {np.shape(self.resized_dataset.value)}")

        self.done = True


@xai_component(type="split")
class TrainTestSplit(Component):
    dataset: InArg[Tuple[np.array, np.array]]
    train_split: InArg[float]
    random_state: InArg[int]
    shuffle: InArg[bool]
    train: OutArg[Tuple[np.array, np.array]]
    test: OutArg[Tuple[np.array, np.array]]

    def __init__(self):
        self.done = False
        self.dataset = InArg.empty()
        self.train_split = InArg.empty()
        self.random_state = InArg.empty()
        self.shuffle = InArg.empty()
        self.train = OutArg.empty()
        self.test = OutArg.empty()

    def execute(self) -> None:

        train_split = self.train_split.value if self.train_split.value else 0.75
        shuffle = self.shuffle.value if self.shuffle.value else True
        random_state = self.random_state.value if self.random_state.value else None
        print(f"Split Parameters:\nTrain Split {train_split} \nShuffle: {shuffle} \nRandom State: {random_state}")
        splits = train_test_split(self.dataset.value[0], self.dataset.value[1], test_size=train_split, shuffle=shuffle, random_state=random_state)
        
        train_x = splits[0]
        test_x = splits[1]
        train_y = splits[2]
        test_y = splits[3]

        train = train_x, keras.utils.to_categorical(train_y, int(test_y.max()) + 1)
        test = test_x, keras.utils.to_categorical(test_y, int(test_y.max()) + 1)

        self.train.value = train
        self.test.value = test
        self.done = True

@xai_component(type="model")
class Create1DInputModel(Component):
    training_data: InArg[Tuple[np.array, np.array]]

    model: OutArg[keras.Sequential]

    def __init__(self):
        self.done = False
        self.training_data = InArg.empty()
        self.model = OutArg.empty()

    def execute(self) -> None:
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

@xai_component(type="model")
class Create2DInputModel(Component):
    training_data: InArg[Tuple[np.array, np.array]]

    model: OutArg[keras.Sequential]
    model_config: OutArg[dict]


    def __init__(self):
        self.done = False
        self.training_data = InArg.empty()
        self.model = OutArg.empty()
        self.model_config = OutArg.empty()


    def execute(self) -> None:

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


@xai_component(type="train")
class TrainImageClassifier(Component):
    model: InArg[keras.Sequential]
    training_data: InArg[Tuple[np.array, np.array]]
    training_epochs: InArg[int]

    trained_model: OutArg[keras.Sequential]
    training_metrics: OutArg[dict]

    def __init__(self):
        self.done = False

        self.model = InArg.empty()
        self.training_data = InArg.empty()
        self.training_epochs = InArg.empty()
        self.trained_model = OutArg.empty()
        self.training_metrics = OutArg.empty()

    def execute(self) -> None:

        model = self.model.value

        train = model.fit(
            self.training_data.value[0],
            self.training_data.value[1],
            batch_size=32,
            epochs=self.training_epochs.value
        )

        # Set training metrics
        training_metrics = {}
        for key in train.history.keys():
            training_metrics[key] = {}
            [training_metrics[key].update({i + 1: v}) for i, v in enumerate(train.history[key])]

        self.trained_model.value = model
        self.training_metrics.value = training_metrics
        self.done = True


@xai_component(type="eval")
class EvaluateAccuracy(Component):
    model: InArg[keras.Sequential]
    eval_dataset: InArg[Tuple[np.array, np.array]]

    metrics: OutArg[Dict[str, str]]

    def __init__(self):
        self.done = False
        self.model = InArg.empty()
        self.eval_dataset = InArg.empty()
        self.metrics = OutArg.empty()

    def execute(self) -> None:
        (loss, acc) = self.model.value.evaluate(self.eval_dataset.value[0], self.eval_dataset.value[1], verbose=0)
        metrics = {
            'loss': str(loss),
            'accuracy': str(acc)
        }
        print(metrics)

        self.metrics.value = metrics

        self.done = True


@xai_component(type="enough")
class ShouldStop(Component):
    target_accuracy: InArg[float]
    max_retries: InArg[int]
    metrics: InArg[Dict[str, str]]

    should_retrain: OutArg[bool]

    def __init__(self):
        self.done = False
        self.target_accuracy = InArg.empty()
        self.max_retries = InArg.empty()
        self.metrics = InArg.empty()
        self.should_retrain = OutArg(True)
        self.retries = 0

    def execute(self) -> None:
        self.retries += 1

        if self.retries < self.max_retries.value:
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

    model: InArg[any]
    model_name: InArg[str]
    model_h5_path: OutArg[str]

    def __init__(self):
        self.done = False
        self.model = InArg.empty()
        self.model_name = InArg.empty()

        self.model_h5_path = OutArg.empty()

    def execute(self) -> None:
        model = self.model.value
        model_name = self.model_name.value if self.model_name.value else os.path.splitext(sys.argv[0])[0] + ".h5"
        model.save(model_name)
        print(f"Saving Keras h5 model at: {model_name}")
        self.model_h5_path.value = model_name

        self.done = True


@xai_component(type="convert")
class SaveKerasModelInModelStash(Component):
    model: InArg[keras.Sequential]
    experiment_name: InArg[str]
    metrics: InArg[Dict[str, float]]

    def __init__(self):
        self.done = False
        self.model = InArg.empty()
        self.experiment_name = InArg.empty()
        self.metrics = InArg.empty()

    def execute(self) -> None:
        config = self.execution_context.args

        if not os.path.exists(os.path.join('..', 'experiments')):
            os.mkdir(os.path.join('..', 'experiments'))

        exp_dir = os.path.join('..', 'experiments', config.name)

        if os.path.exists(exp_dir):
            exp_dir = exp_dir + '-' + datetime.now().strftime('%Y%m%d-%H:%M:%S')
        os.mkdir(exp_dir)

        self.model.value.save(os.path.join(exp_dir, 'model.h5'))

        eval_json = json.dumps(self.metrics.value, sort_keys=True, indent=4)
        with open(os.path.join(exp_dir, 'eval.json'), 'w') as f:
            f.write(eval_json)

        config_json = json.dumps(vars(config), sort_keys=True, indent=4)
        with open(os.path.join(exp_dir, 'conf.json'), 'w') as f:
            f.write(config_json)

        os.system("git add . && git commit -m 'experiment %s'" % (exp_dir))
        self.done = True
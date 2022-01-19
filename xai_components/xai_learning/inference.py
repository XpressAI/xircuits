from typing import Tuple, Dict
from tensorflow import keras
import numpy as np
from xai_components.base import InArg, OutArg, Component, xai_component
import json
import os


@xai_component
class LoadImage(Component):
    dataset_name: InArg[str]
    dataset: OutArg[Tuple[np.array, np.array]]

    def __init__(self):
        self.done = False
        self.dataset_name = InArg.empty()
        self.dataset = OutArg.empty()

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
        
        self.done = True


@xai_component(type="out")
class ResizeImageData(Component):
    dataset: InArg[Tuple[np.array, np.array]]
    resized_dataset: OutArg[Tuple[np.array, np.array]]

    def __init__(self):
        self.done = False
        self.dataset = InArg.empty()
        self.resized_dataset = OutArg.empty()

    def execute(self) -> None:
        x = self.dataset.value[0]
        x = x.reshape(x.shape[0], x.shape[1] * x.shape[2])

        self.resized_dataset.value = (x, self.dataset.value[1])
        self.done = True

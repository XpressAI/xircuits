from datetime import datetime
from typing import Tuple, Dict
from tensorflow import keras
import numpy as np
from xai_components.base import InArg, OutArg, Component
from sklearn.model_selection import train_test_split
import json
import os


class ReadDataSet(Component):
    dataset_name: InArg[str]
    dataset: OutArg[Tuple[np.array, np.array]]

    def __init__(self):
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


class ResizeImageData(Component):
    dataset: InArg[Tuple[np.array, np.array]]
    resized_dataset: OutArg[Tuple[np.array, np.array]]

    def __init__(self):
        self.dataset = InArg.empty()
        self.resized_dataset = OutArg.empty()

    def execute(self) -> None:
        x = self.dataset.value[0]
        x = x.reshape(x.shape[0], x.shape[1] * x.shape[2])

        self.resized_dataset.value = (x, self.dataset.value[1])


class TrainTestSplit(Component):
    dataset: InArg[Tuple[np.array, np.array]]

    train: OutArg[Tuple[np.array, np.array]]
    test: OutArg[Tuple[np.array, np.array]]

    def __init__(self):
        self.dataset = InArg.empty()
        self.train = OutArg.empty()
        self.test = OutArg.empty()

    def execute(self) -> None:
        splits = train_test_split(self.dataset.value[0], self.dataset.value[1])
        train_x = splits[0]
        test_x = splits[1]
        train_y = splits[2]
        test_y = splits[3]

        train = train_x, keras.utils.to_categorical(train_y, int(test_y.max()) + 1)
        test = test_x, keras.utils.to_categorical(test_y, int(test_y.max()) + 1)

        self.train.value = train
        self.test.value = test


class CreateModel(Component):
    training_data: InArg[Tuple[np.array, np.array]]

    model: OutArg[keras.Sequential]

    def __init__(self):
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


class TrainImageClassifier(Component):
    training_data: InArg[Tuple[np.array, np.array]]
    training_epochs: InArg[int]
    model: InArg[keras.Sequential]

    trained_model: OutArg[keras.Sequential]

    def __init__(self):
        self.training_data = InArg.empty()
        self.training_epochs = InArg.empty()
        self.model = InArg.empty()
        self.trained_model = OutArg.empty()

    def execute(self) -> None:
        self.model.value.fit(
            self.training_data.value[0],
            self.training_data.value[1],
            batch_size=32,
            epochs=self.training_epochs.value
        )

        self.trained_model.value = self.model.value


class EvaluateAccuracy(Component):
    model: InArg[keras.Sequential]
    eval_dataset: InArg[Tuple[np.array, np.array]]

    metrics: OutArg[Dict[str, str]]

    def __init__(self):
        self.model = InArg.empty()
        self.eval_dataset = InArg.empty()
        self.metrics = OutArg.empty()

    def execute(self) -> None:
        (loss, acc) = self.model.value.evaluate(self.eval_dataset.value[0], self.eval_dataset.value[1], verbose=0)
        metrics = {
            'loss': str(loss),
            'accuracy': str(acc)
        }

        self.metrics.value = metrics


class ShouldStop(Component):
    target_accuracy: InArg[float]
    max_retries: InArg[int]
    metrics: InArg[Dict[str, str]]

    should_retrain: OutArg[bool]

    def __init__(self):
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


class SaveKerasModelInModelStash(Component):
    model: InArg[keras.Sequential]
    experiment_name: InArg[str]
    metrics: InArg[Dict[str, float]]

    def __init__(self):
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

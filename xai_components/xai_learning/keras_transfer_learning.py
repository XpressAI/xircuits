"""Components to perform transfer learning using pretrained models from
Tensorflow Keras, and datasets from Tensorflow Datasets.
"""
from typing import Dict

import tensorflow.keras.applications as tf_keras_applications
from tensorflow import keras
from tqdm.notebook import tqdm

from xai_components.base import Component, InArg, OutArg, xai_component


@xai_component(type="model")
class KerasTransferLearningModel(Component):
    """Fetch Tensorflow Keras Model by name, for transfer learning.

    ##### Reference:
    - [Keras Application
    Functions](https://www.tensorflow.org/api_docs/python/tf/keras/applications#functions_2)

    ##### inPorts:
    - base_model_name: `str`, name of model (case sensitive). The
    base_model_name must be listed under the functions
    [here](https://www.tensorflow.org/api_docs/python/tf/keras/applications#functions_2)
    - include_top: `bool`, whether to include the fully connected layers at
    the top of the network. Defaults to `True`.
    - weights: `str` pretrained weights to use. Defaults to `imagenet`.
    - input_shape: `tuple` optional shape tuple, only to be specified if
    include_top is False (otherwise the input shape has to be (224, 224, 3)
    (with channels_last data format) or (3, 224, 224) (with channels_first
    data format). It should have exactly 3 input channels, and width and
    height should be no smaller than 32. E.g. (200, 200, 3) would be one
    valid value.
    - freeze_all: `bool`, whether to freeze the weights in all layers of the
    base model. Defaults to `True`.
    - fine_tune_from: `int`, base model layer to fine tune from. Example,
    setting fine_tune_from=5 for a pretrained model with 25 layers will
    freeze only the first 5 layers. This will only take effect if freeze_all
    is set to `False`. Defaults to `0` (freeze_all=True).
    - classes: `int` number of classes to classify images into, only to be
    specified if `include_top` is `True`, and if no `weights` argument is
    specified.
    - classifier_activation: `str` or `callable`. The activation function to
    use on the "top" layer. Ignored unless `include_top=True`. Set
    `classifier_activation=None` to return the logits of the "top" layer.
    When loading pretrained weights, classifier_activation can only be None
    or "softmax".
    - kwargs: `dict`, optional. Passed to the model class. Please refer to the
    specific tensorflow keras model documentation for other model specific
    keyword arguments.

    ##### outPorts:
    - model: tensorflow keras model.
    """

    base_model_name: InArg[str]
    include_top: InArg[bool]
    weights: InArg[str]
    input_shape: InArg[tuple]
    freeze_all: InArg[bool]
    fine_tune_from: InArg[int]
    classes: InArg[int]
    classifier_activation: InArg[str]
    kwargs: InArg[dict]

    model: OutArg[any]

    def __init__(self):
        self.done = False
        self.base_model_name = InArg.empty()
        self.include_top = InArg(True)
        self.weights = InArg("imagenet")
        self.input_shape = InArg.empty()
        self.freeze_all = InArg(True)
        self.fine_tune_from = InArg(0)
        self.classes = InArg(1000)
        self.classifier_activation = InArg("softmax")
        self.kwargs = InArg({})

        self.model = OutArg.empty()

    def execute(self, ctx):

        base_model_name = self.base_model_name.value
        # model_lookup is a dictionary containing all the available models from
        # tf.keras.applications. With key equals the model name as raw string,
        # and value equals the model function.
        # {
        #     'DenseNet121': <function DenseNet121 at 0x7f97ffa8ab80>,
        #     'DenseNet169': <function DenseNet169 at 0x7f97ffa8ac10>,
        #     'DenseNet201': <function DenseNet201 at 0x7f97ffa8aca0>,
        #     'EfficientNetB0': <function EfficientNetB0 at 0x7f97ffa9f0d0>,
        #     ...
        # }

        model_lookup = dict(
            [
                (x, getattr(tf_keras_applications, x))
                for x in dir(tf_keras_applications)
                if callable(getattr(tf_keras_applications, x))
            ]
        )
        try:
            model = model_lookup[base_model_name](
                include_top=self.include_top.value,
                weights=self.weights.value,
                input_shape=self.input_shape.value,
                classes=self.classes.value,
                **self.kwargs.value,
            )
        except KeyError as e:
            print(e)
            print("Ensure that the base model name is listed below.\n")
            print(*model_lookup.keys(), sep=", ")

        if self.freeze_all.value:
            model.trainable = False

        if not self.freeze_all.value and self.fine_tune_from.value > 0:
            assert self.fine_tune_from.value < len(model.layers), (
                f"Please ensure that 'fine_tune_from' is lower than the "
                f"number of layers in {self.base_model_name.value} model. "
                f"{self.base_model_name.value} has {len(model.layers)} "
                f"layers, got {self.fine_tune_from.value} as the layer "
                "to 'fine_tune_from'"
            )

            model.trainable = True
            for layer in model.layers[: self.fine_tune_from.value]:
                layer.trainable = False

        if not self.include_top.value:
            assert self.input_shape.value, (
                "Please provide a valid `input_shape` if `include_top` is set "
                "to `False`. Expected a tuple of `input_shape`, e.g "
                f"`(224, 224, 3)`, got `{self.input_shape.value}`."
            )

            inputs = keras.Input(shape=self.input_shape.value)
            x = model(inputs)
            # ------------- modify below to create your pretrained model head ------------ #
            x = keras.layers.GlobalAveragePooling2D()(x)
            outputs = keras.layers.Dense(1000, activation="softmax")(x)

            # ----------------------- end of pretrained model head ----------------------- #
            model = keras.Model(inputs, outputs)
            print(model.summary())

        self.model.value = model

        self.done = True


@xai_component()
class TFDataset(Component):
    """Fetch Tensorflow Dataset by name

    ##### Reference:
    - [Tensorflow Datasets
    Catalog](https://www.tensorflow.org/datasets/catalog/overview)

    ##### inPorts:
    - dataset_name: `str`, name of dataset, as listed on [Tensorflow Datasets
    catalog](https://www.tensorflow.org/datasets/catalog/overview)
    - batch_size: `int`, if set, add a batch dimension to the dataset.
    Defaults to `32`.
    - shuffle_files: `bool`, whether to shuffle the input files. Defaults to
    `False`.
    - as_supervised: `bool`, if `True`, the returned `tf.data.Dataset` will
    have a 2-tuple structure `(input, label)` according to
    `builder.info.supervised_keys`. If `False`, the default, the returned
    `tf.data.Dataset` will have a dictionary with all the features.
    - kwargs: `dict`, optional. Passed to `tfds.load`. Please refer to the
    specific tensorflow dataset documentation for other dataset specific
    keyword arguments.

    ##### outPorts:
    - all_data: `dict<key: tfds.Split, value: tf.data.Dataset>`, all available
    dataset.
    - train_data: `tf.data.Dataset`, train split if available
    - test_data: `tf.data.Dataset`, test split if available
    """

    dataset_name: InArg[str]
    batch_size: InArg[int]
    shuffle_files: InArg[bool]
    as_supervised: InArg[bool]
    kwargs: InArg[dict]

    all_data: OutArg[any]
    train_data: OutArg[any]
    test_data: OutArg[any]

    def __init__(self):
        self.done = False
        self.dataset_name = InArg.empty()
        self.batch_size = InArg(32)
        self.shuffle_files = InArg(False)
        self.as_supervised = InArg(True)
        self.kwargs = InArg({})

        self.all_data = OutArg.empty()
        self.train_data = OutArg.empty()
        self.test_data = OutArg.empty()

    def execute(self, ctx):
        import tensorflow_datasets as tfds

        assert (
            self.dataset_name.value in tfds.list_builders()
        ), f"Please ensure that dataset_name is listed below:\n{tfds.list_builders()}"

        ds = tfds.load(
            self.dataset_name.value,
            batch_size=self.batch_size.value,
            shuffle_files=self.shuffle_files.value,
            as_supervised=self.as_supervised.value,
            **self.kwargs.value,
        )

        self.all_data.value = ds
        self.train_data.value = ds.get("train")
        self.test_data.value = ds.get("test")

        self.done = True


@xai_component(type="train")
class TrainKerasModel(Component):
    """Trains a keras model.

    ##### inPorts:
    - model: compiled model.
    - training data: tensorflow keras model compatible dataset
    - batch_size: `int` or `None`. Number of samples per gradient update.
    - epochs: `int` number of epochs to train the model.
    - kwargs: `dict` optional. Other `tf.model.fit` arguments.

    ##### outPorts:
    - trained_model: trained tensoflow keras model.
    - training_metrics: `dict`, training metrics from training history.
    """

    model: InArg[any]
    training_data: InArg[any]
    batch_size: InArg[int]
    epochs: InArg[int]
    kwargs: InArg[dict]

    trained_model: OutArg[any]
    training_metrics: OutArg[dict]

    def __init__(self):
        self.done = False

        self.model = InArg.empty()
        self.training_data = InArg.empty()
        self.batch_size = InArg.empty()
        self.epochs = InArg.empty()
        self.kwargs = InArg({})

        self.trained_model = OutArg.empty()
        self.training_metrics = OutArg.empty()

    def execute(self, ctx):

        model = self.model.value
        train = model.fit(
            self.training_data.value,
            batch_size=self.batch_size.value,
            epochs=self.epochs.value,
            **self.kwargs.value,
        )

        # Set training metrics
        training_metrics = {}
        for key in train.history.keys():
            training_metrics[key] = {}
            [
                training_metrics[key].update({i + 1: v})
                for i, v in enumerate(train.history[key])
            ]

        self.trained_model.value = model
        self.training_metrics.value = training_metrics

        self.done = True


@xai_component(type="eval")
class TFDSEvaluateAccuracy(Component):
    """Evaluate the accuracy of a Tensorflow Keras model using a Tensorflow
    dataset (`tensorflow.data.Dataset`)

    ##### inPorts:
    - model: trained tensorflow keras model.
    - eval_dataset: dataset to evaluate. Instance of `tensorflow.data.Dataset`.

    ##### outPorts:
    - metrics: `dict` model loss and accuracy.
    """

    model: InArg[any]
    eval_dataset: InArg[any]

    metrics: OutArg[Dict[str, str]]

    def __init__(self):
        self.done = False
        self.model = InArg.empty()
        self.eval_dataset = InArg.empty()
        self.metrics = OutArg.empty()

    def execute(self, ctx):

        model_metrics_names = self.model.value.metrics_names
        model_metrics = self.model.value.evaluate(self.eval_dataset.value, verbose=0)
        metrics = dict(zip(model_metrics_names, model_metrics))
        print(metrics)

        self.metrics.value = metrics

        self.done = True


@xai_component
class KerasModelCompiler(Component):
    """Compiles a Tensorflow Keras model.

    ##### References:
    - [Tensorflow Keras
    Optimizers](https://www.tensorflow.org/api_docs/python/tf/keras/optimizers)
    - [Tensorflow Keras
    losses](https://www.tensorflow.org/api_docs/python/tf/keras/losses)
    - [Tensorflow Keras
    Metrics](https://www.tensorflow.org/api_docs/python/tf/keras/metrics)

    ##### inPorts:
    - model: tensorflow keras model to compile.
    - optimizer: `str`, name of an optimizer, e.g, `adam`. Must be a valid
    tensorflow keras optimizer identifier.
    - optimizer_kwargs: `dict` optional dictionary of keyword arguments to
    instantiate the optimizer. If nothing is passed, the default optimizer
    values are used for the chosen optimizer type.
    - loss: `str`, name of a Keras loss as a function. This is a string name of
    a loss function. E.g. `categorical_crossentropy`. Check out the
    [documentation](https://www.tensorflow.org/api_docs/python/tf/keras/losses#functions_2)
    for more options. 
    - metrics: `list` list of metrics to be evaluated by the model during
    training and testing. Each metric should be a string of a metric identifier,
    e.g, ['accuracy', 'mse', ... ].

    ##### outPorts:
    - compiled_model: compiled tensorflow keras model
    - model_config: `dict` model configuration.

    """

    model: InArg[any]
    optimizer: InArg[str]
    optimizer_kwargs: InArg[dict]
    loss: InArg[str]
    metrics: InArg[list]

    compiled_model: OutArg[any]
    model_config: OutArg[dict]

    def __init__(self):
        self.done = False
        self.model = InArg.empty()
        self.optimizer = InArg.empty()
        self.optimizer_kwargs = InArg({})
        self.loss = InArg.empty()
        self.metrics = InArg.empty()
        self.compiled_model = OutArg.empty()
        self.model_config = OutArg.empty()

    def execute(self, ctx):

        assert isinstance(
            self.model.value, keras.Model
        ), "Please pass in a tensorflow keras model"

        optimizer_identifier = {
            "class_name": self.optimizer.value,
            "config": self.optimizer_kwargs.value,
        }
        optimizer = keras.optimizers.get(optimizer_identifier)

        self.model.value.compile(
            optimizer=optimizer, loss=self.loss.value, metrics=self.metrics.value
        )
        self.compiled_model.value = self.model.value 
        model_config = {
            "lr": self.compiled_model.value.optimizer.lr.numpy().item(),
            "optimizer_name": self.compiled_model.value.optimizer._name,
            "loss": self.compiled_model.value.loss,
        }

        self.model_config.value = model_config

        self.done = True

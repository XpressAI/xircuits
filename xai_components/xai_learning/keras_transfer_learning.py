"""Components to perform transfer learning using pretrained models from
Tensorflow Keras, and datasets from Tensorflow Datasets.
"""
import tensorflow.keras.applications as tf_keras_applications

from xai_components.base import Component, InArg, OutArg, xai_component


@xai_component(type="model")
class KerasTransferLearningModel(Component):
    """Fetch Tensorflow Keras Model by name, for transfer learning.

    Args:
        base_model_name: `str`, name of model (case sensitive). The
        base_model_name must be listed here ->
        https://www.tensorflow.org/api_docs/python/tf/keras/applications#functions_2
        include_top: `bool`, whether to include the fully connected layers at
        the top of the network. Defaults to `True`.
        weights: `str` pretrained weights to use. Defaults to `imagenet`.
        classes: `int` number of classes to classify imges into, only to be
        specified if `include_top` is `True`, and if no `weights` argument is
        specified.
        classifier_activation: `str` or `callable`. The activation function to
        use on the "top" layer. Ignored unless `include_top=True`. Set
        `classifier_activation=None` to return the logits of the "top" layer.
        When loading pretrained weights, classifier_activation can only be None
        or "softmax".
        kwargs: `dict`, optional. Passed to the model class. Please refer to the
        specific tensorflow keras model documentation for other model specific
        keyword arguments.

    Returns:
        model: compiled model.
        model_config: `dict` model configuration.
    """

    base_model_name: InArg[str]
    include_top: InArg[bool]
    weights: InArg[str]
    classes: InArg[int]
    classifier_activation: InArg[str]
    kwargs: InArg[dict]

    model: OutArg[any]
    model_config: OutArg[dict]

    def __init__(self):
        self.done = False
        self.base_model_name = InArg.empty()
        self.include_top = InArg(True)
        self.weights = InArg("imagenet")
        self.classes = InArg(1000)
        self.classifier_activation = InArg("softmax")
        self.kwargs = InArg({})

        self.model = OutArg.empty()
        self.model_config = OutArg.empty()

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
                # input_shape=x_shape,
                classes=self.classes.value,
                **self.kwargs.value,
            )
        except KeyError as e:
            print(e)
            print("Ensure that the base model name is listed below.\n")
            print(*model_lookup.keys(), sep=", ")

        model.compile(loss="mse", optimizer="adam", metrics=["accuracy"])

        model_config = {
            "lr": model.optimizer.lr.numpy().item(),
            "optimizer_name": model.optimizer._name,
            "loss": model.loss,
        }

        self.model.value = model
        self.model_config.value = model_config

        self.done = True


@xai_component()
class TFDataset(Component):
    """Fetch Tensorflow Dataset by name

    Args:
        dataset_name: `str`, name of dataset, as listed on
        https://www.tensorflow.org/datasets/catalog/overview
        batch_size: `int`, if set, add a batch dimension to the dataset.
        Defaults to `32`.
        shuffle_files: `bool`, whether to shuffle the input files. Defaults to
        `False`.
        as_supervised: `bool`, if `True`, the returned `tf.data.Dataset` will
        have a 2-tuple structure `(input, label)` according to
        `builder.info.supervised_keys`. If `False`, the default, the returned
        `tf.data.Dataset` will have a dictionary with all the features.
        kwargs: `dict`, optional. Passes to `tfds.load`. Please refer to the
        specific tensorflow dataset documentation for other dataset specific
        keyword arguments.

    Returns:
        all_data: `dict<key: tfds.Split, value: tf.data.Dataset>`, all available
        dataset.
        train_data: `tf.data.Dataset`, train split if available
        test_data: `tf.data.Dataset`, test split if available
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

    Args:
        model: compiled model.
        training data: tensorflow keras model compatible dataset
        batch_size: `int` or `None`. Number of samples per gradient update.
        epochs: `int` number of epochs to train the model.
        kwargs: `dict` optional. Other `tf.model.fit` arguments.

    Returns:
        trained_model: trained tensoflow keras model.
        training_metrics: `dict`, training metrics from training history.
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
        print(self.training_data.value)
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

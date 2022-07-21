"""Components to perform transfer learning using pretrained models from
Tensorflow Keras, and datasets from Tensorflow Datasets.
"""
import tensorflow.keras.applications as tf_keras_applications

from xai_components.base import Component, InArg, OutArg, xai_component


@xai_component(type="model")
class KerasTransferLearningModel(Component):
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
        self.base_model_name = InArg("vgg19")
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
    """_summary_

    Args:
        Component (_type_): _description_
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
        self.dataset_name = InArg("imagenet_v2")
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
            [training_metrics[key].update({i + 1: v}) for i, v in enumerate(train.history[key])]

        self.trained_model.value = model
        self.training_metrics.value = training_metrics

        self.done = True

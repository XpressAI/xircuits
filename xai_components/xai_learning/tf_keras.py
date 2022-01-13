from tensorflow.keras import applications
from tensorflow.keras.preprocessing import image
import numpy as np

from xai_components.base import InArg, OutArg, Component, xai_component
import json
import os


@xai_component
class LoadKerasModel(Component):

    model_name: InArg[str] #true
    include_top: InArg[bool] #true
    weights:InArg[str] #"imagenet",
    input_tensor: InArg[any]
    input_shape: InArg[any]
    pooling: InArg[any]
    classes: InArg[int]
    args: InArg[int]

    #**kwargs
    model: OutArg[any]

    def __init__(self):
        self.done = False
        self.model_name = InArg(None)
        self.include_top = InArg(None)
        self.weights = InArg(None)
        self.input_tensor = InArg(None)
        self.pooling = InArg(None)
        self.classes = InArg(None)
        self.args = InArg(None)
        self.model = OutArg(None)


    def execute(self) -> None:
        model = None
        model_name = (self.model_name.value).lower()

        if model_name == 'xception':
            model = applications.Xception(weights='imagenet')

        if model_name == 'vgg16':
            model = applications.VGG16(weights='imagenet')

        if model_name == 'vgg19':
            model = applications.VGG19(weights='imagenet')

        if model_name == 'resnet50':
            model = applications.ResNet50(weights='imagenet')

        if model_name == 'resnet101':
            model = applications.ResNet101(weights='imagenet')

        if model_name == 'resnet152':
            model = applications.ResNet152(weights='imagenet')

        if model_name == 'inceptionv3':
            model = applications.InceptionV3(weights='imagenet')

        if model_name == 'mobilenet':
            model = applications.MobileNet(weights='imagenet')

        if model_name == 'mobilenetv2':
            model = applications.MobileNetV2(weights='imagenet')

        if model_name == 'densenet121':
            model = applications.DenseNet121(weights='imagenet')

        if model_name == 'densenet169':
            model = applications.DenseNet169(weights='imagenet')

        if model_name == 'densenet201':
            model = applications.DenseNet201(weights='imagenet')

        if model == None:
            print("Keras model ", model_name, " not found.")

        else:
            self.model.value = model

        self.done = True

@xai_component
class KerasPredict(Component):
    
    model:InArg[any]
    img_string: InArg[str]
    class_list: InArg[any]
    target_shape: InArg[tuple]

    def __init__(self):
        self.done = False
        self.model = InArg(None)
        self.img_string = InArg(None)
        self.class_list = InArg(None)
        self.target_shape = InArg(None)

    def execute(self) -> None:
        model = self.model.value
        img_path = self.img_string.value
        class_list = self.class_list.value if self.class_list.value else []

        class keras_model_config:
            preprocess_input: any
            decode_predictions: any
            target_size:any

            def __init__(self):
                self.preprocess_input = None
                self.decode_predictions = None
                self.target_size = (224, 224)

        model_config = keras_model_config()

        # Note: currently searches whether model name starts with the common terms. 
        # Using str.split("_")[0] does not work as inception_v3 and mobilenetv2 will return different values.

        # Note2: each Keras Application expects a specific kind of input preprocessing. 
        # IE: For DenseNet, call tf.keras.applications.densenet.preprocess_input on your inputs before passing them to the model.

        if model.name.startswith('xception'):
            model_config.preprocess_input = applications.xception.preprocess_input
            model_config.decode_predictions = applications.xception.decode_predictions
            model_config.target_size = (299, 299)

        if model.name.startswith('vgg16'):
            model_config.preprocess_input = applications.vgg16.preprocess_input
            model_config.decode_predictions = applications.vgg16.decode_predictions

        if model.name.startswith('vgg19'):
            model_config.preprocess_input = applications.vgg19.preprocess_input
            model_config.decode_predictions = applications.vgg19.decode_predictions

        if model.name.startswith('resnet50'):
            model_config.preprocess_input = applications.resnet50.preprocess_input
            model_config.decode_predictions = applications.resnet50.decode_predictions

        if model.name.startswith('resnet101'):
            model_config.preprocess_input = applications.resnet.preprocess_input
            model_config.decode_predictions = applications.resnet.decode_predictions

        if model.name.startswith('resnet152'):
            model_config.preprocess_input = applications.resnet.preprocess_input
            model_config.decode_predictions = applications.resnet.decode_predictions

        if model.name.startswith('inception_v3'):
            model_config.preprocess_input = applications.inception_v3.preprocess_input
            model_config.decode_predictions = applications.inception_v3.decode_predictions
            model_config.target_size = (299, 299)

        if model.name.startswith('mobilenetv2'):
            model_config.preprocess_input = applications.mobilenet_v2.preprocess_input
            model_config.decode_predictions = applications.mobilenet_v2.decode_predictions

        if model.name.startswith('mobilenet'):
            model_config.preprocess_input = applications.mobilenet.preprocess_input
            model_config.decode_predictions = applications.mobilenet.decode_predictions

        #handler for densenet121, 169, 201
        if model.name.startswith('densenet'):
            model_config.preprocess_input = applications.densenet.preprocess_input
            model_config.decode_predictions = applications.densenet.decode_predictions

        if model_config.preprocess_input:

            img = image.load_img(img_path, target_size=model_config.target_size)
            x = image.img_to_array(img)
            x = np.expand_dims(x, axis=0)
            x = model_config.preprocess_input(x)

            preds = model.predict(x)
            # decode the results into a list of tuples (class, description, probability)
            # (one such list for each sample in the batch)
            print(model.name, ' predictions:', model_config.decode_predictions(preds, top=3)[0])

        else:

            print(f"Keras model {model.name} config not found!\n")
            print(f"Auto adjusting according to model input.\n")

            # expected input_shape => (None, 256, 256, 3)
            if isinstance(self.target_shape.value, tuple):
                if len(self.target_shape.value) != 2:
                    raise AssertionError(f"Expected two values (height and width) as target shape, got {len(self.target_shape.value)}")
            target_shape = self.target_shape.value if self.target_shape.value else model.input_shape[1:3]
            img = image.load_img(img_path, target_size=target_shape)
            x = image.img_to_array(img)
            x = np.expand_dims(x, axis=0)

            preds = model.predict(x)
            print(preds)


        self.done = True

class resnet_model_config:
    include_top: bool #true
    weights:str #"imagenet",
    input_tensor: any
    input_shape: any
    pooling: any
    classes: int

    def __init__(self):
        self.include_top = True
        self.weights = "imagenet"
        self.input_tensor = None
        self.pooling = None
        self.classes = 1000

@xai_component
class ResNet50(Component):
    include_top: InArg[bool]
    weights:InArg[str] 
    input_tensor: InArg[any]
    input_shape: InArg[any]
    pooling: InArg[any]
    classes: InArg[int]
    args: InArg[int]
    model: OutArg[any]

    def __init__(self):
        self.done = False
        self.include_top = InArg(None)
        self.weights = InArg(None)
        self.input_tensor = InArg(None)
        self.pooling = InArg(None)
        self.classes = InArg(None)
        self.kwargs = InArg(None)
        self.model = OutArg(None)


    def execute(self) -> None:
        model_config = resnet_model_config()

        #dynamically sync model config with node inputs
        for port in self.__dict__.keys():
            try:
                portValue = getattr(self, port).value
                if portValue != None:
                    for config in model_config.__dict__.keys():
                        if config == port:
                            setattr(model_config, config, portValue)

            except Exception as e:
                pass

        model = applications.ResNet50(model_config)
        self.model.value = model
        self.done = True

@xai_component
class ResNet101(Component):

    include_top: InArg[bool]
    weights:InArg[str] 
    input_tensor: InArg[any]
    input_shape: InArg[any]
    pooling: InArg[any]
    classes: InArg[int]
    args: InArg[int]
    model: OutArg[any]

    def __init__(self):
        self.done = False
        self.include_top = InArg(None)
        self.weights = InArg(None)
        self.input_tensor = InArg(None)
        self.pooling = InArg(None)
        self.classes = InArg(None)
        self.kwargs = InArg(None)
        self.model = OutArg(None)


    def execute(self) -> None:
        model_config = resnet_model_config()

        #dynamically sync model config with node inputs
        for port in self.__dict__.keys():
            try:
                portValue = getattr(self, port).value
                if portValue != None:
                    for config in model_config.__dict__.keys():
                        if config == port:
                            setattr(model_config, config, portValue)

            except Exception as e:
                pass

        model = applications.ResNet101(model_config)
        self.model.value = model
        self.done = True


@xai_component
class ResNet152(Component):
    include_top: InArg[bool]
    weights:InArg[str] 
    input_tensor: InArg[any]
    input_shape: InArg[any]
    pooling: InArg[any]
    classes: InArg[int]
    args: InArg[int]
    model: OutArg[any]

    def __init__(self):
        self.done = False
        self.include_top = InArg(None)
        self.weights = InArg(None)
        self.input_tensor = InArg(None)
        self.pooling = InArg(None)
        self.classes = InArg(None)
        self.kwargs = InArg(None)
        self.model = OutArg(None)


    def execute(self) -> None:
        model_config = resnet_model_config()
        #dynamically sync model config with node inputs
        for port in self.__dict__.keys():
            try:
                portValue = getattr(self, port).value
                if portValue != None:
                    for config in model_config.__dict__.keys():
                        if config == port:
                            setattr(model_config, config, portValue)

            except Exception as e:
                pass

        model = applications.ResNet152(model_config)
        self.model.value = model
        self.done = True


class vgg_model_config:
    include_top: bool #true
    weights:str #"imagenet",
    input_tensor: any
    input_shape: any
    pooling: any
    classes: int
    classifier_activation: str

    def __init__(self):
        self.include_top = True
        self.weights = "imagenet"
        self.input_tensor = None
        self.pooling = None
        self.classes = 1000
        self.classifier_activation = "softmax"

@xai_component
class VGG16(Component):

    include_top: InArg[bool]
    weights:InArg[str] 
    input_tensor: InArg[any]
    input_shape: InArg[any]
    pooling: InArg[any]
    classes: InArg[int]
    classifier_activation: InArg[int]
    model: OutArg[any]

    def __init__(self):
        self.done = False
        self.include_top = InArg(None)
        self.weights = InArg(None)
        self.input_tensor = InArg(None)
        self.pooling = InArg(None)
        self.classes = InArg(None)
        self.classifier_activation = InArg(None)
        self.model = OutArg(None)


    def execute(self) -> None:

        model_config = vgg_model_config()

        #dynamically sync model config with node inputs
        for port in self.__dict__.keys():
            try:
                portValue = getattr(self, port).value
                if portValue != None:
                    for config in model_config.__dict__.keys():
                        if config == port:
                            setattr(model_config, config, portValue)

            except Exception as e:
                pass

        model = applications.VGG16(model_config)
        self.model.value = model
        self.done = True


@xai_component
class VGG19(Component):
    include_top: InArg[bool]
    weights:InArg[str] 
    input_tensor: InArg[any]
    input_shape: InArg[any]
    pooling: InArg[any]
    classes: InArg[int]
    classifier_activation: InArg[int]
    model: OutArg[any]

    def __init__(self):
        self.done = False
        self.include_top = InArg(None)
        self.weights = InArg(None)
        self.input_tensor = InArg(None)
        self.pooling = InArg(None)
        self.classes = InArg(None)
        self.classifier_activation = InArg(None)
        self.model = OutArg(None)


    def execute(self) -> None:

        model_config = vgg_model_config()

        #dynamically sync model config with node inputs
        for port in self.__dict__.keys():
            try:
                portValue = getattr(self, port).value
                if portValue != None:
                    for config in model_config.__dict__.keys():
                        if config == port:
                            setattr(model_config, config, portValue)

            except Exception as e:
                pass

        model = applications.VGG19(model_config)
        self.model.value = model
        self.done = True

@xai_component
class Xception(Component):

    include_top: InArg[bool]
    weights:InArg[str] 
    input_tensor: InArg[any]
    input_shape: InArg[any]
    pooling: InArg[any]
    classes: InArg[int]
    classifier_activation: InArg[int]
    model: OutArg[any]

    def __init__(self):
        self.done = False
        self.include_top = InArg(None)
        self.weights = InArg(None)
        self.input_tensor = InArg(None)
        self.pooling = InArg(None)
        self.classes = InArg(None)
        self.classifier_activation = InArg(None)
        self.model = OutArg(None)


    def execute(self) -> None:

        model_config = vgg_model_config()

        #dynamically sync model config with node inputs
        for port in self.__dict__.keys():
            try:
                portValue = getattr(self, port).value
                if portValue != None:
                    for config in model_config.__dict__.keys():
                        if config == port:
                            setattr(model_config, config, portValue)

            except Exception as e:
                pass

        model = applications.VGG19(model_config)
        self.model.value = model
        self.done = True


class mobile_model_config:

    input_shape: any
    alpha:any
    depth_multiplier:int
    dropout:float
    include_top: bool
    weights: str
    input_tensor: any
    pooling: any
    classes: int
    classifier_activation: str

    def __init__(self):

        self.input_shape=None
        self.alpha=1.0
        self.depth_multiplier=1
        self.dropout=0.001
        self.include_top=True
        self.weights="imagenet"
        self.input_tensor=None
        self.pooling=None
        self.classes=1000
        self.classifier_activation="softmax"


@xai_component
class MobileNet(Component):
    
    input_shape: InArg[any]
    alpha: InArg[any]
    depth_multiplier: InArg[int]
    dropout: InArg[float]
    include_top: InArg[bool]
    weights: InArg[str]
    input_tensor: InArg[any]
    pooling: InArg[any]
    classes: InArg[int]
    classifier_activation: InArg[str]
    model: OutArg[any]

    def __init__(self):
        self.done = False
        self.include_top = InArg(None)
        self.weights = InArg(None)
        self.input_tensor = InArg(None)
        self.pooling = InArg(None)
        self.classes = InArg(None)
        self.classifier_activation = InArg(None)
        self.model = OutArg(None)


    def execute(self) -> None:

        model_config = vgg_model_config()

        #dynamically sync model config with node inputs
        for port in self.__dict__.keys():
            try:
                portValue = getattr(self, port).value
                if portValue != None:
                    for config in model_config.__dict__.keys():
                        if config == port:
                            setattr(model_config, config, portValue)

            except Exception as e:
                pass

        model = applications.VGG19(model_config)
        self.model.value = model
        self.done = True
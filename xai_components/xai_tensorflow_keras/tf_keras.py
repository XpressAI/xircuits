from tensorflow.keras import applications
from tensorflow.keras.preprocessing import image
import numpy as np

from xai_components.base import InArg, InCompArg, OutArg, Component, xai_component

@xai_component
class LoadKerasModel(Component):
    """Loads a Keras application model instance.
    
    ## Reference:
    - [Keras Model Applications](https://keras.io/api/applications/)

    ##### inPorts:
    - model_name: A Keras model instance.
    - include_top: whether to include the fully-connected
        layer at the top of the network.
    - weights: one of `None` (random initialization),
        'imagenet' (pre-training on ImageNet),
        or the path to the weights file to be loaded.
    - input_tensor: optional Keras tensor (i.e. output of `layers.Input()`)
        to use as image input for the model.
    - input_shape: optional shape tuple, only to be specified
        if `include_top` is False (otherwise the input shape
        has to be `(224, 224, 3)` (with `'channels_last'` data format)
        or `(3, 224, 224)` (with `'channels_first'` data format).
        It should have exactly 3 inputs channels,
        and width and height should be no smaller than 32.
        E.g. `(200, 200, 3)` would be one valid value.
    - pooling: Optional pooling mode for feature extraction
        when `include_top` is `False`.
        - `None` means that the output of the model will be
            the 4D tensor output of the
            last convolutional block.
        - `avg` means that global average pooling
            will be applied to the output of the
            last convolutional block, and thus
            the output of the model will be a 2D tensor.
        - `max` means that global max pooling will
            be applied.
    - classes: optional number of classes to classify images
        into, only to be specified if `include_top` is True, and
        if no `weights` argument is specified.
    - args: additional arguments that may configure the Keras model 
        instance behaviour, but not included as inPorts. Click link 
        in Reference for more details.

    ##### outPorts:
    - model: A Keras model instance.
    """    
    model_name: InCompArg[str]
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
        self.model_name = InCompArg(None)
        self.include_top = InArg(None)
        self.weights = InArg(None)
        self.input_tensor = InArg(None)
        self.pooling = InArg(None)
        self.classes = InArg(None)
        self.args = InArg(None)

        self.model = OutArg(None)


    def execute(self,ctx) -> None:

        args = self.args.value if self.args.value else {}

        try:
            import tensorflow
            model = getattr(tensorflow.keras.applications, self.model_name.value)(weights='imagenet', **args)
            
            self.model.value = model

        except Exception as e:
            if self.model_name.value:
                print(f"model_name:{e} not found!\nPlease refer to the official keras list of supported models: https://keras.io/api/applications/")

        self.done = True


@xai_component
class KerasPredict(Component):
    """Performs prediction given a Keras application model instance.
    
    ### Reference:
    - [Keras Model Applications](https://keras.io/api/applications/)

    ##### inPorts:
    - model: A Keras model instance.
    - img_string: an image path.
    - class_list: list of classes if not using IMAGENET.
    - target_shape: optional shape tuple, only to be 
        specified if using a input custom shape.
        Expected two values (height and width).
    """    
    model:InCompArg[any]
    img_string: InCompArg[str]
    class_list: InArg[any]
    target_shape: InArg[tuple]

    def __init__(self):
        self.done = False
        self.model = InCompArg(None)
        self.img_string = InCompArg(None)
        self.class_list = InArg(None)
        self.target_shape = InArg(None)

    def execute(self, ctx) -> None:
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
    """Instantiates the ResNet50 model.
    
    ### Reference:
    - [Keras Application ResNet50](
        https://keras.io/api/applications/resnet/#resnet50-function)
    - [Deep Residual Learning for Image Recognition](
        https://arxiv.org/abs/1512.03385) (CVPR 2015)

    ##### inPorts:
    - include_top: whether to include the fully-connected
        layer at the top of the network.
    - weights: one of `None` (random initialization),
        'imagenet' (pre-training on ImageNet),
        or the path to the weights file to be loaded.
    - input_tensor: optional Keras tensor (i.e. output of `layers.Input()`)
        to use as image input for the model.
    - input_shape: optional shape tuple, only to be specified
        if `include_top` is False (otherwise the input shape
        has to be `(224, 224, 3)` (with `'channels_last'` data format)
        or `(3, 224, 224)` (with `'channels_first'` data format).
        It should have exactly 3 inputs channels,
        and width and height should be no smaller than 32.
        E.g. `(200, 200, 3)` would be one valid value.
    - pooling: Optional pooling mode for feature extraction
        when `include_top` is `False`.
        - `None` means that the output of the model will be
            the 4D tensor output of the
            last convolutional block.
        - `avg` means that global average pooling
            will be applied to the output of the
            last convolutional block, and thus
            the output of the model will be a 2D tensor.
        - `max` means that global max pooling will
            be applied.
    - classes: optional number of classes to classify images
        into, only to be specified if `include_top` is True, and
        if no `weights` argument is specified.
    - kwargs: additional arguments that may configure the Keras model 
        instance behaviour, but not included as inPorts. Click link 
        in Reference for more details.

    ##### outPorts:
    - model: A Keras model instance.
    """
    include_top: InArg[bool]
    weights:InArg[str] 
    input_tensor: InArg[any]
    input_shape: InArg[any]
    pooling: InArg[any]
    classes: InArg[int]
    kwargs: InArg[int]
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


    def execute(self, ctx) -> None:
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
    """Instantiates the ResNet101 model.
    
    ### Reference:
    - [Keras Application ResNet50](
        https://keras.io/api/applications/resnet/#resnet101-function)
    - [Deep Residual Learning for Image Recognition](
        https://arxiv.org/abs/1512.03385) (CVPR 2015)

    ##### inPorts:
    - include_top: whether to include the fully-connected
        layer at the top of the network.
    - weights: one of `None` (random initialization),
        'imagenet' (pre-training on ImageNet),
        or the path to the weights file to be loaded.
    - input_tensor: optional Keras tensor (i.e. output of `layers.Input()`)
        to use as image input for the model.
    - input_shape: optional shape tuple, only to be specified
        if `include_top` is False (otherwise the input shape
        has to be `(224, 224, 3)` (with `'channels_last'` data format)
        or `(3, 224, 224)` (with `'channels_first'` data format).
        It should have exactly 3 inputs channels,
        and width and height should be no smaller than 32.
        E.g. `(200, 200, 3)` would be one valid value.
    - pooling: Optional pooling mode for feature extraction
        when `include_top` is `False`.
        - `None` means that the output of the model will be
            the 4D tensor output of the
            last convolutional block.
        - `avg` means that global average pooling
            will be applied to the output of the
            last convolutional block, and thus
            the output of the model will be a 2D tensor.
        - `max` means that global max pooling will
            be applied.
    - classes: optional number of classes to classify images
        into, only to be specified if `include_top` is True, and
        if no `weights` argument is specified.
    - kwargs: additional arguments that may configure the Keras model 
        instance behaviour, but not included as inPorts. Click link 
        in Reference for more details.

    ##### outPorts:
    - model: A Keras model instance.
    """
    include_top: InArg[bool]
    weights:InArg[str] 
    input_tensor: InArg[any]
    input_shape: InArg[any]
    pooling: InArg[any]
    classes: InArg[int]
    kwargs: InArg[int]
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


    def execute(self, ctx) -> None:
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
    """Instantiates the ResNet152 model.
    
    ### Reference:
    - [Keras Application ResNet152](
        https://keras.io/api/applications/resnet/#resnet152-function)
    - [Deep Residual Learning for Image Recognition](
        https://arxiv.org/abs/1512.03385) (CVPR 2015)

    ##### inPorts:
    - include_top: whether to include the fully-connected
        layer at the top of the network.
    - weights: one of `None` (random initialization),
        'imagenet' (pre-training on ImageNet),
        or the path to the weights file to be loaded.
    - input_tensor: optional Keras tensor (i.e. output of `layers.Input()`)
        to use as image input for the model.
    - input_shape: optional shape tuple, only to be specified
        if `include_top` is False (otherwise the input shape
        has to be `(224, 224, 3)` (with `'channels_last'` data format)
        or `(3, 224, 224)` (with `'channels_first'` data format).
        It should have exactly 3 inputs channels,
        and width and height should be no smaller than 32.
        E.g. `(200, 200, 3)` would be one valid value.
    - pooling: Optional pooling mode for feature extraction
        when `include_top` is `False`.
        - `None` means that the output of the model will be
            the 4D tensor output of the
            last convolutional block.
        - `avg` means that global average pooling
            will be applied to the output of the
            last convolutional block, and thus
            the output of the model will be a 2D tensor.
        - `max` means that global max pooling will
            be applied.
    - classes: optional number of classes to classify images
        into, only to be specified if `include_top` is True, and
        if no `weights` argument is specified.
    - kwargs: additional arguments that may configure the Keras model 
        instance behaviour, but not included as inPorts. Click link 
        in Reference for more details.

    ##### outPorts:
    - model: A Keras model instance.
    """
    include_top: InArg[bool]
    weights:InArg[str] 
    input_tensor: InArg[any]
    input_shape: InArg[any]
    pooling: InArg[any]
    classes: InArg[int]
    kwargs: InArg[int]
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


    def execute(self, ctx) -> None:
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
    """Instantiates the VGG16 model.
    
    ### Reference:
    - [Keras Application VGG16](
        https://keras.io/api/applications/vgg/#vgg16-function)
    - [Very Deep Convolutional Networks for Large-Scale Image Recognition](
    https://arxiv.org/abs/1409.1556) (ICLR 2015)

    ##### inPorts:
    - include_top: whether to include the 3 fully-connected
        layers at the top of the network.
    - weights: one of `None` (random initialization),
        'imagenet' (pre-training on ImageNet),
        or the path to the weights file to be loaded.
    - input_tensor: optional Keras tensor
        (i.e. output of `layers.Input()`)
        to use as image input for the model.
    - input_shape: optional shape tuple, only to be specified
        if `include_top` is False (otherwise the input shape
        has to be `(224, 224, 3)`
        (with `channels_last` data format)
        or `(3, 224, 224)` (with `channels_first` data format).
        It should have exactly 3 input channels,
        and width and height should be no smaller than 32.
        E.g. `(200, 200, 3)` would be one valid value.
    - pooling: Optional pooling mode for feature extraction
        when `include_top` is `False`.
        - `None` means that the output of the model will be
            the 4D tensor output of the
            last convolutional block.
        - `avg` means that global average pooling
            will be applied to the output of the
            last convolutional block, and thus
            the output of the model will be a 2D tensor.
        - `max` means that global max pooling will
            be applied.
    - classes: optional number of classes to classify images
        into, only to be specified if `include_top` is True, and
        if no `weights` argument is specified.
    - classifier_activation: A `str` or callable. The activation function to use
        on the "top" layer. Ignored unless `include_top=True`. Set
        `classifier_activation=None` to return the logits of the "top" layer.
        When loading pretrained weights, `classifier_activation` can only
        be `None` or `"softmax"`.
    - kwargs: additional arguments that may configure the Keras model 
        instance behaviour, but not included as inPorts. Click link 
        in Reference for more details.

    ##### outPorts:
    - model: A Keras model instance.
    """
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


    def execute(self, ctx) -> None:

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
    """Instantiates the VGG19 architecture.
    
    ### Reference:
    - [Keras Application VGG19](
        https://keras.io/api/applications/vgg/#vgg19-function)
    - [Very Deep Convolutional Networks for Large-Scale Image Recognition](
        https://arxiv.org/abs/1409.1556) (ICLR 2015)

    ##### inPorts:
    - include_top: whether to include the 3 fully-connected
        layers at the top of the network.
    - weights: one of `None` (random initialization),
        'imagenet' (pre-training on ImageNet),
        or the path to the weights file to be loaded.
    - input_tensor: optional Keras tensor
        (i.e. output of `layers.Input()`)
        to use as image input for the model.
    - input_shape: optional shape tuple, only to be specified
        if `include_top` is False (otherwise the input shape
        has to be `(224, 224, 3)`
        (with `channels_last` data format)
        or `(3, 224, 224)` (with `channels_first` data format).
        It should have exactly 3 inputs channels,
        and width and height should be no smaller than 32.
        E.g. `(200, 200, 3)` would be one valid value.
    - pooling: Optional pooling mode for feature extraction
        when `include_top` is `False`.
        - `None` means that the output of the model will be
            the 4D tensor output of the
            last convolutional block.
        - `avg` means that global average pooling
            will be applied to the output of the
            last convolutional block, and thus
            the output of the model will be a 2D tensor.
        - `max` means that global max pooling will
            be applied.
    - classes: optional number of classes to classify images
        into, only to be specified if `include_top` is True, and
        if no `weights` argument is specified.
    - classifier_activation: A `str` or callable. The activation function to use
        on the "top" layer. Ignored unless `include_top=True`. Set
        `classifier_activation=None` to return the logits of the "top" layer.
        When loading pretrained weights, `classifier_activation` can only
        be `None` or `"softmax"`.

    ##### outPorts:
    - model: A Keras model instance.
    """
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


    def execute(self, ctx) -> None:

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
    """Instantiates the Xception architecture.
    
    ### Reference:
    - [Keras Application Xception](
        https://keras.io/api/applications/xception/)
    - [Xception: Deep Learning with Depthwise Separable Convolutions](
        https://arxiv.org/abs/1610.02357) (CVPR 2017)

    ##### inPorts:
    - include_top: whether to include the fully-connected
        layer at the top of the network.
    - weights: one of `None` (random initialization),
        'imagenet' (pre-training on ImageNet),
        or the path to the weights file to be loaded.
    - input_tensor: optional Keras tensor
        (i.e. output of `layers.Input()`)
        to use as image input for the model.
    - input_shape: optional shape tuple, only to be specified
        if `include_top` is False (otherwise the input shape
        has to be `(299, 299, 3)`.
        It should have exactly 3 inputs channels,
        and width and height should be no smaller than 71.
        E.g. `(150, 150, 3)` would be one valid value.
    - pooling: Optional pooling mode for feature extraction
        when `include_top` is `False`.
        - `None` means that the output of the model will be
            the 4D tensor output of the
            last convolutional block.
        - `avg` means that global average pooling
            will be applied to the output of the
            last convolutional block, and thus
            the output of the model will be a 2D tensor.
        - `max` means that global max pooling will
            be applied.
    - classes: optional number of classes to classify images
        into, only to be specified if `include_top` is True,
        and if no `weights` argument is specified.
    - classifier_activation: A `str` or callable. The activation function to use
        on the "top" layer. Ignored unless `include_top=True`. Set
        `classifier_activation=None` to return the logits of the "top" layer.
        When loading pretrained weights, `classifier_activation` can only
        be `None` or `"softmax"`.

    ##### outPorts:
    - model: A Keras model instance.
    """

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


    def execute(self, ctx) -> None:
        
        #Xception and vgg share model configs
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

        model = applications.Xception(model_config)
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
    """Instantiates the Keras MobileNet model for image classification,
    optionally loaded with weights pre-trained on ImageNet.
    
    ### Reference:
    - [Keras Application MobileNet](
        https://keras.io/api/applications/mobilenet/)
    - [MobileNets: Efficient Convolutional Neural Networks
        for Mobile Vision Applications](
        https://arxiv.org/abs/1704.04861)


    ##### inPorts:
    - input_shape: Optional shape tuple, only to be specified if `include_top`
        is False (otherwise the input shape has to be `(224, 224, 3)` (with
        `channels_last` data format) or (3, 224, 224) (with `channels_first`
        data format). It should have exactly 3 inputs channels, and width and
        height should be no smaller than 32. E.g. `(200, 200, 3)` would be one
        valid value. Default to `None`.
        `input_shape` will be ignored if the `input_tensor` is provided.
    - alpha: Controls the width of the network. This is known as the width
        multiplier in the MobileNet paper. - If `alpha` < 1.0, proportionally
        decreases the number of filters in each layer. - If `alpha` > 1.0,
        proportionally increases the number of filters in each layer. - If
        `alpha` = 1, default number of filters from the paper are used at each
        layer. Default to 1.0.
    - depth_multiplier: Depth multiplier for depthwise convolution. This is
        called the resolution multiplier in the MobileNet paper. Default to 1.0.
    - dropout: Dropout rate. Default to 0.001.
    - include_top: Boolean, whether to include the fully-connected layer at the
        top of the network. Default to `True`.
    - weights: One of `None` (random initialization), 'imagenet' (pre-training
        on ImageNet), or the path to the weights file to be loaded. Default to
        `imagenet`.
    - input_tensor: Optional Keras tensor (i.e. output of `layers.Input()`) to
        use as image input for the model. `input_tensor` is useful for sharing
        inputs between multiple different networks. Default to None.
    - pooling: Optional pooling mode for feature extraction when `include_top`
        is `False`.
        - `None` (default) means that the output of the model will be
            the 4D tensor output of the last convolutional block.
        - `avg` means that global average pooling
            will be applied to the output of the
            last convolutional block, and thus
            the output of the model will be a 2D tensor.
        - `max` means that global max pooling will be applied.
    - classes: Optional number of classes to classify images into, only to be
        specified if `include_top` is True, and if no `weights` argument is
        specified. Defaults to 1000.
    - classifier_activation: A `str` or callable. The activation function to use
        on the "top" layer. Ignored unless `include_top=True`. Set
        `classifier_activation=None` to return the logits of the "top" layer.
        When loading pretrained weights, `classifier_activation` can only
        be `None` or `"softmax"`.
    - **kwargs: For backwards compatibility only.

    ##### outPorts:
    - model: A Keras model instance.
    """
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
    kwargs: InArg[any]
    
    model: OutArg[any]

    def __init__(self):

        self.done = False
        self.input_shape = InArg(None)
        self.alpha = InArg(None)  
        self.depth_multiplier = InArg(None)   
        self.dropout = InArg(None)
        self.include_top = InArg(None)
        self.weights = InArg(None)
        self.input_tensor = InArg(None)   
        self.pooling = InArg(None)
        self.classes = InArg(None)
        self.classifier_activation = InArg(None)
        self.kwargs = InArg(None)

        self.model = OutArg(None)


    def execute(self, ctx) -> None:

        model_config = mobile_model_config()

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

        model = applications.MobileNet(model_config)
        self.model.value = model
        self.done = True
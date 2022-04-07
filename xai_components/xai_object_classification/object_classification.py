from xai_components.base import InArg, OutArg, InCompArg, Component, xai_component
from IPython.utils import capture
import tensorflow as tf
import matplotlib.pyplot as plt
import os


@xai_component(color='red')
class DownloadDataset(Component):
    dataset_url: InCompArg[str]
    batch_size:InArg[int]
    img_size:InArg[tuple]

    training_dataset:OutArg[any]
    validation_dataset:OutArg[any]

  
    def __init__(self):

        self.done = False
        self.dataset_url = InCompArg(None)
        self.batch_size = InArg(1)
        self.img_size = InArg(None)

        self.training_dataset = OutArg(None)
        self.validation_dataset = OutArg(None)

    def execute(self, ctx) -> None:
        
        dataset_url = self.dataset_url.value
        batch_size = self.batch_size.value
        img_size = self.img_size.value 

        path_to_zip = tf.keras.utils.get_file(os.path.basename(dataset_url), origin=dataset_url, extract=True,cache_subdir =os.getcwd())
        PATH = os.path.join(os.path.dirname(path_to_zip), os.path.basename(os.path.splitext(dataset_url)[0]))
        train_dir = os.path.join(PATH, 'train')
        validation_dir = os.path.join(PATH, 'validation')
        
        train_dataset = tf.keras.utils.image_dataset_from_directory(train_dir,
                                                            shuffle=True,
                                                            batch_size=batch_size,
                                                            image_size=img_size)

        validation_dataset = tf.keras.utils.image_dataset_from_directory(validation_dir,
                                                                 shuffle=True,
                                                                 batch_size=batch_size,
                                                                 image_size=img_size)

        self.training_dataset.value = train_dataset
        self.validation_dataset.value = validation_dataset
        
        self.done = True


@xai_component(color='yellow')
class ViewData(Component):
    dataset:InArg[any]

    def __init__(self):

        self.done = False
        self.dataset = InArg(None)

    def execute(self, ctx) -> None:
        
        dataset = self.dataset.value

        class_names = dataset.class_names

        plt.figure(figsize=(10, 10))
        for images, labels in dataset.take(1):
            for i in range(9):
                ax = plt.subplot(3, 3, i + 1)
                plt.imshow(images[i].numpy().astype("uint8"))
                plt.title(class_names[labels[i]])
                plt.axis("off")
        plt.show()

        self.done = True


@xai_component(color='green')
class CreateTestData(Component):
    validation_dataset:InArg[any]
    test_percentage:InArg[float]

    validation_dataset:OutArg[any]
    test_dataset:OutArg[any]

    def __init__(self):
        
        self.done = False
        self.validation_dataset = InArg(None)
        self.test_percentage = InArg(0)

        self.validation_dataset = OutArg(None)
        self.test_dataset = OutArg(None)

    def execute(self, ctx) -> None:
        import sys
        validation_dataset = self.validation_dataset.value 
        test_percentage = self.test_percentage.value

        if test_percentage > 100 :
            sys.exit("test_percentage value should be a float number between 0 -> 100%")
            
        split = int(100/test_percentage)

        batches = tf.data.experimental.cardinality(validation_dataset)
        test_dataset = validation_dataset.take(batches // split)
        validation_dataset = validation_dataset.skip(batches // split)

        print('Number of validation batches: %d' % tf.data.experimental.cardinality(validation_dataset))
        print('Number of test batches: %d' % tf.data.experimental.cardinality(test_dataset))

        self.validation_dataset.value = validation_dataset
        self.test_dataset.value = test_dataset


        self.done = True

@xai_component(color='red')
class DatasetsLoader(Component):
    training_dataset:InArg[any]
    validation_dataset:InArg[any]
    testing_dataset:InArg[any]

    def __init__(self):
        
        self.done = False
        self.training_dataset = InArg(None)
        self.validation_dataset = InArg(None)
        self.testing_dataset = InArg(None)


    def execute(self, ctx) -> None:
        
        training_dataset = self.training_dataset.value
        validation_dataset = self.validation_dataset.value
        testing_dataset = self.testing_dataset.value 
        
        ctx.update({'training_dataset':training_dataset,
                    'validation_dataset':validation_dataset,
                    'testing_dataset':testing_dataset})

        self.done = True


@xai_component(color='lawngreen')
class Augmentation(Component):
    random_contrast:InArg[tuple]
    random_crop:InArg[tuple]
    random_flip:InArg[str]
    random_height:InArg[tuple]
    random_rotation:InArg[tuple]
    random_translation:InArg[tuple]
    random_width:InArg[tuple]
    random_zoom:InArg[tuple]
    show_sample:InArg[bool]

    def __init__(self):
        
        self.done = False
        self.random_contrast = InArg(None)
        self.random_crop = InArg(None)
        self.random_flip = InArg(None)
        self.random_height = InArg(None)
        self.random_rotation = InArg(None)
        self.random_translation = InArg(None)
        self.random_width = InArg(None)
        self.random_zoom = InArg(None)
        self.show_sample = InArg(False)


    def execute(self, ctx) -> None:
        import sys
        from tensorflow.keras import layers

        augmentation_list = []
        random_contrast = self.random_contrast.value
        random_crop = self.random_crop.value
        random_flip = self.random_flip.value
        random_height = self.random_height.value
        random_rotation = self.random_rotation.value
        random_translation = self.random_translation.value
        random_width = self.random_width.value
        random_zoom = self.random_zoom.value
        show_sample = self.show_sample.value

        if random_contrast is not None:
            if type(random_contrast) is not tuple or len(random_contrast) != 2:
                sys.exit("Random Contrast factor be a tuple of size 2 (lower value,upper value)")
            augmentation_list.append(layers.RandomContrast(random_contrast))

        if random_crop is not None:
            if type(random_crop) is not tuple or len(random_crop) != 2:
                sys.exit("Random Crop factor be a tuple of size 2 (height, width)")
            augmentation_list.append(layers.RandomCrop(random_crop[0],random_crop[1]))

        if random_flip is not None:
            if random_flip not in ('horizontal','vertical','horizontal_and_vertical') :
                sys.exit("Random Contrast factor be a string 'horizontal','vertical' or 'horizontal_and_vertical' ")
            augmentation_list.append(layers.RandomFlip(random_flip))

        if random_height is not None:
            if type(random_height) is not tuple or len(random_height) != 2:
                sys.exit("Random Height factor be a tuple of size 2 (lower value,upper value)")
            augmentation_list.append(layers.RandomHeight(random_height))

        if random_rotation is not None:
            if type(random_rotation) is not tuple or len(random_rotation) != 2:
                sys.exit("Random Rotation factor be a tuple of size 2 (lower value,upper value)")
            augmentation_list.append(layers.RandomRotation(random_rotation))

        if random_translation is not None:
            if type(random_translation) is not tuple or len(random_translation) != 2:
                sys.exit("Random Translation factor be a tuple of size 2 (lower value,upper value)")
            augmentation_list.append(layers.RandomTranslation(random_translation))

        if random_width is not None:
            if type(random_width) is not tuple or len(random_width) != 2:
                sys.exit("Random Width factor be a tuple of size 2 (lower value,upper value)")
            augmentation_list.append(layers.RandomWidth(random_width))

        if random_zoom is not None:
            if type(random_zoom) is not tuple or len(random_zoom) != 2:
                sys.exit("Random Zoom factor be a tuple of size 2 (lower value,upper value)")
            augmentation_list.append(layers.RandomZoom(random_zoom))


        data_augmentation = tf.keras.Sequential(augmentation_list)

        if show_sample is True:
            train_dataset = ctx['training_dataset']

            for image, _ in train_dataset.take(1):
                plt.figure(figsize=(10, 10))
                first_image = image[0]
                for i in range(9):
                    ax = plt.subplot(3, 3, i + 1)
                    augmented_image = data_augmentation(tf.expand_dims(first_image, 0))
                    plt.imshow(augmented_image[0] / 255)
                    plt.axis('off')
            plt.show()

        ctx.update({'augmentation':data_augmentation})
        self.done = True


@xai_component
class LoadTFModel(Component):

    model_name: InCompArg[str]
    include_top: InCompArg[bool] 
    input_shape: InCompArg[tuple]
    weights:InArg[str] 
    input_tensor: InArg[any]
    pooling: InArg[any]
    classes: InArg[int]
    args: InArg[dict]


    def __init__(self):
        self.done = False
        self.model_name = InArg(None)
        self.include_top = InArg(True)
        self.weights = InArg('imagenet')
        self.input_tensor = InArg(None)
        self.input_shape = InArg(None)
        self.pooling = InArg(None)
        self.classes = InArg(1000)
        self.args = InArg({})


    def execute(self,ctx) -> None:

        model_name = self.model_name.value 
        include_top = self.include_top.value 
        weights = self.weights.value 
        input_tensor = self.input_tensor.value
        input_shape = self.input_shape.value
        pooling = self.pooling.value 
        classes = self.classes.value 
        args = self.args.value

        try:
            base_model = getattr(tf.keras.applications,model_name)(include_top = include_top,
                                                                        weights=weights,
                                                                        input_tensor =input_tensor,
                                                                        input_shape = input_shape,
                                                                        pooling = pooling,
                                                                        classes = classes,
                                                                        **args)
            
            ctx.update({'base_model':base_model})

        except Exception as e:
            if self.model_name.value:
                print(f"model_name:{e} not found!\nPlease refer to the official keras list of supported models: https://www.tensorflow.org/api_docs/python/tf/keras/applications")

        self.done = True
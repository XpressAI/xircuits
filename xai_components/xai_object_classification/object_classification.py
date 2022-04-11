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

    model_name:InCompArg[str]
    model_function_name:InCompArg[str]
    include_top:InCompArg[bool] 
    input_shape:InCompArg[tuple]
    weights:InArg[str] 
    input_tensor:InArg[any]
    pooling:InArg[any]
    classes:InArg[int]
    args:InArg[dict]
    pre_processing:InArg[bool]
    model_summary:InArg[bool]


    def __init__(self):
        self.done = False
        self.model_name = InCompArg(None)
        self.model_function_name=InCompArg(None)
        self.include_top = InCompArg(True)
        self.weights = InArg('imagenet')
        self.input_tensor = InArg(None)
        self.input_shape = InCompArg(None)
        self.pooling = InArg(None)
        self.classes = InArg(1000)
        self.pre_processing = InArg(True)
        self.args = InArg({})
        self.model_summary = InArg(False) 


    def execute(self,ctx) -> None:

        model_name = self.model_name.value 
        model_function_name = self.model_function_name.value
        include_top = self.include_top.value 
        weights = self.weights.value 
        input_tensor = self.input_tensor.value
        input_shape = self.input_shape.value
        pooling = self.pooling.value 
        classes = self.classes.value 
        pre_processing = self.pre_processing.value
        args = self.args.value
        model_summary = self.model_summary.value

        try:
            base_model = getattr(tf.keras.applications,model_name)(include_top = include_top,
                                                                        weights=weights,
                                                                        input_tensor =input_tensor,
                                                                        input_shape = input_shape,
                                                                        pooling = pooling,
                                                                        classes = classes,
                                                                        **args)
            ctx.update({'base_model':base_model})

            if model_summary is True:
                base_model.summary()

            if pre_processing is True:
                preprocess = 'preprocess_input'
                preprocess_input = getattr(tf.keras.applications,model_function_name)
                preprocess_input = getattr(preprocess_input,preprocess)
                print("processssss",preprocess_input)
                ctx.update({'preprocess_input':preprocess_input})

        except Exception as e:
            if model_name:
                print(f"model_name:{e} not found!\nPlease refer to the official keras list of supported models: https://www.tensorflow.org/api_docs/python/tf/keras/applications")

        ctx.update({'shape':input_shape})

        self.done = True



@xai_component(color='red')
class BinaryClassifierHead(Component):
    verbose:InArg[bool]
    def __init__(self):
        
        self.done = False
        self.verbose = InArg(False)

    def execute(self, ctx) -> None:
        
        global_average_layer = tf.keras.layers.GlobalAveragePooling2D()
        prediction_layer = tf.keras.layers.Dense(1)

        ctx.update({'global_average_layer':global_average_layer,
                    'prediction_layer':prediction_layer})

        if self.verbose.value is True:
            Train_dataset=ctx['training_dataset']
            image_batch, label_batch = next(iter(Train_dataset))
            base_model = ctx['base_model']
            feature_batch = base_model(image_batch)
            print(f"\nFeature Extraction Model's Output Shape:{feature_batch.shape}\n")
            feature_batch_average = global_average_layer(feature_batch)
            print(f"Feature Average Pooling (2D) layer's Output Shape:{feature_batch_average.shape}\n")
            prediction_batch = prediction_layer(feature_batch_average)
            print(f"prediction layer's Output Shape:{prediction_batch.shape}\n")

        self.done = True


@xai_component(color='red')
class MulticlassClassifierHead(Component):
    num_classes:InCompArg[int]
    verbose:InArg[bool]

    def __init__(self):
        self.done = False
        self.num_classes = InCompArg(None)
        self.verbose = InArg(False)
        
    def execute(self, ctx) -> None:
        
        num_classes = self.num_classes.value
        global_average_layer = tf.keras.layers.GlobalAveragePooling2D()
        prediction_layer = tf.keras.layers.Dense(num_classes)

        ctx.update({'global_average_layer':global_average_layer,
                    'prediction_layer':prediction_layer})

        if self.verbose.value is True:
            Train_dataset=ctx['training_dataset']
            image_batch, label_batch = next(iter(Train_dataset))
            base_model = ctx['base_model']
            feature_batch = base_model(image_batch)
            print(f"\nFeature Extraction Model's Output Shape:{feature_batch.shape}\n")
            feature_batch_average = global_average_layer(feature_batch)
            print(f"Feature Average Pooling (2D) layer's Output Shape:{feature_batch_average.shape}\n")
            prediction_batch = prediction_layer(feature_batch_average)
            print(f"prediction layer's Output Shape:{prediction_batch.shape}\n")

        self.done = True


@xai_component(color='red')
class BuildModel(Component):
    augmentation:InArg[bool]
    preprocess_input:InArg[bool]
    dropout_rate:InArg[float]


    def __init__(self):
        self.done = False
        self.augmentation = InArg(False)
        self.preprocess_input = InArg(False)
        self.dropout_rate = InArg(None)

        

    def execute(self, ctx) -> None:
        
        augmentation = self.augmentation.value
        preprocess_input = self.preprocess_input.value
        dropout_rate = self.dropout_rate.value
        
        augmentation_layer = None
        preprocess_layer = None

        input_shape = ctx['shape']

        if augmentation is True:
                try:
                    augmentation_layer = ctx['augmentation']
                except: pass
        if preprocess_input is True:
            try:
                preprocess_layer = ctx['preprocess_input']
            except: pass

        base_model = ctx['base_model']
        global_average_layer = ctx['global_average_layer']
        prediction_layer = ctx['prediction_layer']

        inputs = tf.keras.Input(shape=input_shape)
        
        if (augmentation_layer is not None) & (preprocess_layer is not None):
            x = augmentation_layer(inputs)
            x = preprocess_layer(x)
            x = base_model(x, training=False)
        elif preprocess_layer is not None:
            x = preprocess_layer(inputs)
            x = base_model(x, training=False)
        else:
            x = base_model(inputs, training=False)
            
        x = global_average_layer(x)

        if dropout_rate is not None:
            x = tf.keras.layers.Dropout(dropout_rate)(x)

        outputs = prediction_layer(x)
        model = tf.keras.Model(inputs, outputs)
        model.summary()
        ctx.update({'built_model':model})

        self.done = True


@xai_component(color='red')
class CompileModel(Component):
    optimizer:InArg[str]
    loss:InArg[str]
    metrics:InArg[list]
    learning_rate:InArg[float]

    compiled_model:OutArg[any]

    def __init__(self):
        
        self.done = False
        self.optimizer = InArg(None)
        self.loss = InArg(None)
        self.metrics = InArg('accuracy')
        self.learning_rate = InArg(0.0001)

        self.compiled_model = OutArg(any)

    def execute(self, ctx) -> None:
        
        model = ctx['built_model']
        optimizer = self.optimizer.value    
        loss = self.loss.value
        metrics = self.metrics.value
        learning_rate = self.learning_rate.value

        getattr(model,'compile')(optimizer = getattr(tf.keras.optimizers,optimizer)(learning_rate=learning_rate),
                                loss = getattr(tf.keras.losses,loss)(from_logits=True),
                                metrics = metrics )

        print("Model compiled, Number of trainable layers :",len(model.trainable_variables))
        self.compiled_model.value = model 
        self.done = True


@xai_component(color='red')
class EvaluateModel(Component):
    model:InCompArg[any]

    def __init__(self):
        
        self.done = False
        self.model = InCompArg(None)

    def execute(self, ctx) -> None:
        model = self.model.value 
        validation_dataset = ctx['validation_dataset']
        loss0, accuracy0 = model.evaluate(validation_dataset)
        print("loss: {:.2f}".format(loss0))
        print("accuracy: {:.2f}".format(accuracy0))
        self.done = True


@xai_component(color='green')
class FreezeModelLayer(Component):
    freeze_all:InCompArg[bool]
    fine_tune_at:InArg[int]

    def __init__(self):
        
        self.done = False
        self.freeze_all = InCompArg(None)
        self.fine_tune_at = InArg(None)

    def execute(self, ctx) -> None:
        
        freeze_all = self.freeze_all.value
        fine_tune_at = self.fine_tune_at.value
        base_model = ctx['base_model']

        print("Number of layers in the base model: ", len(base_model.layers))
        if freeze_all is True:
            base_model.trainable = False
        else:
            base_model.trainable = True
            for layer in base_model.layers[:fine_tune_at]:
                layer.trainable = False

        self.done = True


@xai_component(color='yellow')
class TrainModel(Component):
    compiled_model:InCompArg[any]
    num_epochs:InArg[int]
    resume_training:InArg[any]

    model:OutArg[any]
    training_history:OutArg[any]

    def __init__(self):
        
        self.done = False
        self.compiled_model = InCompArg(None)
        self.num_epochs = InArg(None)
        self.resume_training = InArg(None)

        self.model = OutArg(None)
        self.training_history = OutArg(None)

    def execute(self, ctx) -> None:
        
        model = self.compiled_model.value
        train_dataset = ctx['training_dataset']
        validation_data = ctx['validation_dataset']
        num_epochs = self.num_epochs.value
        resume_training = self.resume_training.value

        if resume_training is not None:
            initial_epoch = resume_training.epoch[-1]
            num_epochs = num_epochs + resume_training.epoch[-1]
        else:
            initial_epoch = 0

        history = model.fit(train_dataset,
                    epochs=num_epochs,
                    initial_epoch = initial_epoch,
                    validation_data=validation_data)

        self.model.value = model
        self.training_history.value = history

        self.done = True


@xai_component(color='purple')
class PlotTrainingMetrics(Component):
    training_history:InArg[any]

    def __init__(self):
        
        self.done = False
        self.training_history = InArg(None)

    def execute(self, ctx) -> None:
        
        history = self.training_history.value 

        acc = history.history['accuracy']
        val_acc = history.history['val_accuracy']

        loss = history.history['loss']
        val_loss = history.history['val_loss']

        plt.figure(figsize=(8, 8))
        plt.subplot(2, 1, 1)
        plt.plot(acc, label='Training Accuracy')
        plt.plot(val_acc, label='Validation Accuracy')
        plt.legend(loc='lower right')
        plt.ylabel('Accuracy')
        plt.ylim([min(plt.ylim()),1])
        plt.title('Training and Validation Accuracy')

        plt.subplot(2, 1, 2)
        plt.plot(loss, label='Training Loss')
        plt.plot(val_loss, label='Validation Loss')
        plt.legend(loc='upper right')
        plt.ylabel('Cross Entropy')
        plt.ylim([0,1.0])
        plt.title('Training and Validation Loss')
        plt.xlabel('epoch')
        plt.show()

        self.done = True


@xai_component(color='navy')
class SaveTFModel(Component):

    model: InArg[any]
    model_name: InArg[str]

    def __init__(self):
        self.done = False
        self.model = InArg(None)
        self.model_name = InArg(None)

    def execute(self, ctx) -> None:
        import sys

        model = self.model.value
        model_name = self.model_name.value +'.h5' 
        model.save(model_name)
        print(f"Saving TF h5 model at: {model_name}")
        
        self.done = True
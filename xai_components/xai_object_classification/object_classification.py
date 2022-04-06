from xai_components.base import InArg, OutArg, InCompArg, Component, xai_component
import tensorflow as tf
import matplotlib.pyplot as plt
import os

@xai_component
class DownloadDataset(Component):
    dataset_url: InCompArg[str]
    batch_size:InArg[int]
    img_size:InArg[tuple]
  
    def __init__(self):

        self.done = False
        self.dataset_url = InCompArg(None)
        self.batch_size = InArg(1)
        self.img_size = InArg(None)


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

        ctx.update({'train_dataset':train_dataset,'validation_dataset':validation_dataset})

        self.done = True

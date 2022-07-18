from xai_components.base import InArg, InCompArg, OutArg, Component, xai_component

import torch
from torch import nn
from torch.utils.data import DataLoader

@xai_component
class LoadTorchVisionDataset(Component):
    
    # https://pytorch.org/vision/stable/datasets.html#built-in-datasets

    dataset_name: InCompArg[str]
    dataset_dir: InArg[str]

    training_data: OutArg[any]
    test_data: OutArg[any]

    def __init__(self):
        self.done = False
        self.dataset_name = InCompArg(None)
        self.dataset_dir = InArg(None)

        self.training_data = OutArg(None)
        self.test_data = OutArg(None)


    def execute(self,ctx) -> None:

        from torchvision import datasets
        from torchvision.transforms import ToTensor

        dataset_dir = self.dataset_dir.value if self.dataset_dir.value else "data"

        print("Downloading " + self.dataset_name.value + " to " + dataset_dir)
        # Download training data from open datasets.
        training_data = getattr(datasets, self.dataset_name.value)(
            root=dataset_dir,
            train=True,
            download=True,
            transform=ToTensor(),
        )

        # Download test data from open datasets.
        test_data = getattr(datasets, self.dataset_name.value)(
            root=dataset_dir,
            train=False,
            download=True,
            transform=ToTensor(),
        )

        self.training_data.value = training_data
        self.test_data.value = test_data
        self.done = True
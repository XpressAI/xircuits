from xai_components.base import InArg, InCompArg, OutArg, Component, xai_component

import os
import sys

import torch
from torch import nn

@xai_component
class LoadTorchVisionDataset(Component):
    """Loads a Torch Vision dataset.
    
    ### Reference:
    - [Pytorch Vision Datasets](https://pytorch.org/vision/stable/datasets.html#built-in-datasets)

    ##### inPorts:
    - dataset_name: Loads a valid Pytorch Vision dataset, downloads from the 
    repository if not present in `dataset_dir`. 
    - dataset_dir: Path to save downloaded Pytorch Vision dataset.
        Default: `./data`.

    ##### outPorts:
    - training_data: train split of the dataset.
    - test_data: test split of the dataset.
    """     

    dataset_name: InCompArg[str]
    dataset_dir: InArg[str]

    training_data: OutArg[torch.utils.data.Dataset]
    test_data: OutArg[torch.utils.data.Dataset]

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

        print("Downloading " + self.dataset_name.value + " to " + os.path.abspath(dataset_dir))
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

@xai_component
class TorchDataLoader(Component):
    """Creates data iterators from torch datasets. 
    To be used with `LoadTorchVisionDataset` component.

    ##### inPorts:
    - training_data: Torch Dataset of training data.
    - test_data: Torch Dataset of test data.
    - batch_size: batch size to iterate though.
        Default: 64

    ##### outPorts:
    - train_dataloader: Dataloader instance for training data.
    - test_dataloader: Dataloader instance for test data.
    """

    training_data: InCompArg[torch.utils.data.Dataset]
    test_data: InCompArg[torch.utils.data.Dataset]
    batch_size: InArg[int]

    train_dataloader: OutArg[torch.utils.data.DataLoader]
    test_dataloader: OutArg[torch.utils.data.DataLoader]

    def __init__(self):
        self.done = False

        self.training_data = InCompArg(None)
        self.test_data = InCompArg(None)
        self.batch_size = InArg(None)

        self.train_dataloader = OutArg(None)
        self.test_dataloader = OutArg(None)

    def execute(self,ctx) -> None:

        from torch.utils.data import DataLoader

        batch_size = self.batch_size.value if self.batch_size.value else 64

        # Create data loaders.
        train_dataloader = DataLoader(self.training_data.value, batch_size=batch_size)
        test_dataloader = DataLoader(self.test_data.value, batch_size=batch_size)

        for X, y in test_dataloader:
            print(f"Shape of X [N, C, H, W]: {X.shape}")
            print(f"Shape of y: {y.shape} {y.dtype}")
            break

        self.train_dataloader.value = train_dataloader
        self.test_dataloader.value = test_dataloader


@xai_component
class TorchModel(Component):
    """Creates a custom Torch Model config.

    ##### outPorts:
    - model: torch.nn instance that expects a 28*28 input.
    - loss_fn: nn.CrossEntropyLoss()
    - optimizer: torch.optim.SGD(model.parameters(), lr=1e-3)
    """

    model_config: OutArg[nn.Module]
    loss_fn: OutArg[any]
    optimizer: OutArg[any]

    def __init__(self):
        self.done = False

        self.model_config = OutArg(None)
        self.loss_fn = OutArg(None)
        self.optimizer = OutArg(None)

    def execute(self,ctx) -> None:
        
        # Define model
        class NeuralNetwork(nn.Module):
            def __init__(self):
                super(NeuralNetwork, self).__init__()
                self.flatten = nn.Flatten()
                self.linear_relu_stack = nn.Sequential(
                    nn.Linear(28*28, 512),
                    nn.ReLU(),
                    nn.Linear(512, 512),
                    nn.ReLU(),
                    nn.Linear(512, 10)
                )

            def forward(self, x):
                x = self.flatten(x)
                logits = self.linear_relu_stack(x)
                return logits

        # Get cpu or gpu device for training.
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using {device} device")
        model = NeuralNetwork().to(device)
        print(model)

        loss_fn = nn.CrossEntropyLoss()
        optimizer = torch.optim.SGD(model.parameters(), lr=1e-3)

        self.model_config.value = model
        self.loss_fn.value = loss_fn
        self.optimizer.value = optimizer


@xai_component
class TrainTorchModel(Component):
    """Trains a Torch model instance from a dataloader. 

    ##### inPorts:
    - train_dataloader: torch dataloader util instance. Ideally from `TorchDataLoader`.
    - model: torch.nn instance.
    - loss_fn: torch.nn loss function.
    - optimizer: torch model optimizer.
    - epochs: training epochs. 
        Default: `5`.

    ##### outPorts:
    - trained_model: trained torch.nn instance. 
    """
    train_dataloader: InCompArg[torch.utils.data.DataLoader]
    model_config: InCompArg[nn.Module]
    loss_fn: InCompArg[any]
    optimizer: InCompArg[any]
    epochs: InArg[int]

    trained_model: OutArg[nn.Module]

    def __init__(self):
        self.done = False

        self.train_dataloader = InCompArg(None)
        self.model_config = InCompArg(None)
        self.loss_fn = InCompArg(None)
        self.optimizer = InCompArg(None)
        self.epochs = InArg(None)
        
        self.trained_model = OutArg(None)

    def execute(self,ctx) -> None:

        dataloader = self.train_dataloader.value
        model = self.model_config.value
        loss_fn = self.loss_fn.value
        optimizer = self.optimizer.value
        epochs = self.epochs.value if self.epochs.value else 5

        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using {device} device")

        for t in range(epochs):
            print(f"\nEpoch {t+1}\n-------------------------------")
            
            size = len(dataloader.dataset)
            model.train()
            for batch, (X, y) in enumerate(dataloader):
                X, y = X.to(device), y.to(device)

                # Compute prediction error
                pred = model(X)
                loss = loss_fn(pred, y)

                # Backpropagation
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

                if batch % 100 == 0:
                    loss, current = loss.item(), batch * len(X)
                    print(f"loss: {loss:>7f}  [{current:>5d}/{size:>5d}]")

        self.trained_model.value = model
@xai_component
class TestTorchModel(Component):
    """Tests a Torch model instance from a dataloader. 

    ##### inPorts:
    - test_dataloader: torch dataloader util instance. Ideally from `TorchDataLoader`.
    - model: torch.nn instance. Ideally trained.
    - loss_fn: torch.nn loss function.
    """
    model: InCompArg[nn.Module]
    test_dataloader: InCompArg[torch.utils.data.DataLoader]

    loss_fn: InCompArg[any]
    
    def __init__(self):
        self.done = False
        
        self.model = InCompArg(None)
        self.test_dataloader = InCompArg(None)
        self.loss_fn = InCompArg(None)
        
    def execute(self,ctx) -> None:
        
        dataloader = self.test_dataloader.value
        model = self.model.value
        loss_fn = self.loss_fn.value

        # Get cpu or gpu device for training.
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using {device} device")

        size = len(dataloader.dataset)
        num_batches = len(dataloader)
        model.eval()
        test_loss, correct = 0, 0
        with torch.no_grad():
            for X, y in dataloader:
                X, y = X.to(device), y.to(device)
                pred = model(X)
                test_loss += loss_fn(pred, y).item()
                correct += (pred.argmax(1) == y).type(torch.float).sum().item()
        test_loss /= num_batches
        correct /= size
        print(f"Test Error: \n Accuracy: {(100*correct):>0.1f}%, Avg loss: {test_loss:>8f} \n")
        
@xai_component
class SaveTorchModelState(Component):
    """Saves a Torch model's trained state.

    ##### inPorts:
    - model: trained torch.nn instance. 
    - model_path: the path/filename to be saved as. `.pth` will be appended.
        Default: .xircuits filename + .pth.
    """
    model: InCompArg[nn.Module]
    model_path: InArg[str]

    def __init__(self):
        self.done = False

        self.model = InCompArg(None)
        self.model_path = InArg(None)

    def execute(self,ctx) -> None:
        
        model_path = self.model_path.value if self.model_path.value else os.path.splitext(sys.argv[0])[0] + ".pth"
        torch.save(self.model.value.state_dict(), model_path)

        print("Saved PyTorch Model State to " + model_path)

@xai_component
class LoadTorchModelState(Component):
    """Loads a Torch model's state from a previously saved .pth.

    ##### inPorts:
    - model_config: torch.nn config instance. 
    - model_path: the saved model path.

    ##### outPorts:
    - loaded_model: torch.nn model with loaded state. 
    """
    model_config: InCompArg[nn.Module]
    model_path: InCompArg[str]

    loaded_model: OutArg[nn.Module]

    def __init__(self):

        self.done = False
        self.model_config = InCompArg(None)
        self.model_path = InCompArg(None)

        self.loaded_model = OutArg(None)

    def execute(self,ctx) -> None:

        # Get cpu or gpu device for training.
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using {device} device")

        model = self.model_config.value.to(device)
        model.load_state_dict(torch.load(self.model_path.value))

        self.loaded_model.value = model

@xai_component
class TorchModelPredict(Component):
    """Performs a prediction given a Torch model, test_data split, and a class list.

    ##### inPorts:
    - model: trained torch.nn instance.
    - test_data: a torch dataset split. Ideally from `LoadTorchVisionDataset`.
    - class_list: list of classes model was trained on.
    """
    model: InCompArg[nn.Module]
    test_data: InCompArg[any]
    class_list: InCompArg[list]

    def __init__(self):

        self.done = False
        self.model = InCompArg(None)
        self.test_data = InCompArg(None)
        self.class_list = InCompArg(None)

    def execute(self,ctx) -> None:

        test_data = self.test_data.value
        classes = self.class_list.value

        x, y = test_data[0][0], test_data[0][1]

        model = self.model.value
        model.eval()

        with torch.no_grad():
            pred = model(x)
            predicted, actual = classes[pred[0].argmax(0)], classes[y]
            print(f'Predicted: "{predicted}", Actual: "{actual}"')



@xai_component
class Image2TorchTensor(Component):
    """Converts an image loaded from path to a torch tensor.

    ##### inPorts:
    - img_path: image path.
    - resize: tuple with desired tensor dimension.
        If not provided, will use original image dimensions.

    ##### outPorts:
    - tensor: a torch tensor instance.
    """
    img_path: InCompArg[str]
    resize: InArg[tuple]

    tensor: OutArg[torch.Tensor]

    def __init__(self):

        self.done = False
        self.img_path = InCompArg(None)
        self.resize = InArg(None)

        self.tensor = OutArg(None)

    def execute(self,ctx) -> None:

        from torchvision import transforms
        from PIL import Image

        # mnistFashion expects (1, 28, 28)
        img = Image.open(self.img_path.value).convert('L')
        
        print("Size of the Original image: ", img.size)

        if self.resize.value:
            transform = transforms.Resize(size = (self.resize.value))
            img = transform(img)
            print("Size of the image after resize: ", img.size)

        convert_tensor = transforms.ToTensor()
        tensor = convert_tensor(img)

        print("Size of the tensor: ", tensor.size())

        self.tensor.value = tensor

@xai_component
class TorchModelPredictFromTensor(Component):
    """Performs a prediction given a Torch model, tensor, and a class list.
    Ideally to be used with `Image2TorchTensor`.

    ##### inPorts:
    - model: trained torch.nn instance.
    - test_data: a torch tensor.
    - class_list: list of classes model was trained on.
    """
    model: InCompArg[nn.Module]
    tensor: InCompArg[torch.Tensor]
    class_list: InCompArg[list]

    def __init__(self):

        self.done = False
        self.model = InCompArg(None)
        self.tensor = InCompArg(None)
        self.class_list = InCompArg(None)

    def execute(self,ctx) -> None:

        # Get cpu or gpu device for training.
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using {device} device")

        classes = self.class_list.value        
        x = self.tensor.value.to(device)
        model = self.model.value

        model.eval()

        with torch.no_grad():
            pred = model(x)
            predicted = classes[pred[0].argmax(0)]
            print(f'Predicted: "{predicted}"')

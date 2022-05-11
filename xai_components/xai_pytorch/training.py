from xai_components.base import InArg, OutArg, Component, xai_component
from typing import Tuple, Dict
from xai_components.xai_pytorch.unet_train import CvSaveImage, UNet, UNetDataset, EarlyStopping, TimeLapse
from xai_components.xai_pytorch.unet_train import ImageCountNotEqual, ModelNotFound
from pathlib import Path
from tqdm import tqdm
import cv2
import numpy as np
import os
import time
import torch
import torchvision
import torchvision.transforms as T
import torch.nn.functional as F
import torch.optim as optim


@xai_component
class ConvertTorchModelToOnnx(Component):
    model: InArg[any] #UNet
    device_name: InArg[any] #UNet
    
    input_model_path: InArg[str]
    output_model_path: InArg[str]
    image_size: InArg[tuple]

    def __init__(self):
        self.done = False
        self.model = InArg.empty()
        self.device_name = InArg.empty()
        self.input_model_path = InArg.empty()
        self.output_model_path = InArg.empty()
        self.image_size = InArg.empty()
        
    def execute(self, ctx) -> None:
        model = self.model.value
        model_path_w_extn = self.input_model_path.value
    
        checkpoint = torch.load(model_path_w_extn, map_location=torch.device(self.device_name.value))
        
        model.load_state_dict(checkpoint['model_state_dict'])

        # gray channel
        dummy_input = torch.randn(1, 1, self.image_size.value[0], self.image_size.value[1], device=self.device_name.value)
        
        # rgb channel
        # dummy_input = torch.randn(1, 3, self.image_size.value[0], self.image_size.value[1], device=self.device_name.value)
        
        torch.onnx.export(model,
                          dummy_input,
                          self.output_model_path.value,
                          export_params = True,
                          opset_version=11)
        
        print(f"Converted model from {self.input_model_path.value} to {self.output_model_path.value}")
        
        self.done = True
    

@xai_component(type="model")
class CreateUnetModel(Component):
    train_data: InArg[any] #torch.utils.data.DataLoader
    test_data: InArg[any] #torch.utils.data.DataLoader
    
    learning_rate: InArg[float]
    earlystop: InArg[int]
    verbose: InArg[bool]
    gpu: InArg[int]
    
    model: OutArg[UNet]
    optimizer: OutArg[optim.Adam]
    early_stopping: OutArg[EarlyStopping]
    
    def __init__(self):
        self.done = False
       
        self.learning_rate = InArg.empty()
        self.earlystop = InArg.empty()
        self.verbose = InArg.empty()
        self.gpu = InArg.empty()
        
        self.model = OutArg.empty()
        self.optimizer = OutArg.empty()
        self.early_stopping = OutArg.empty()
        
    def execute(self, ctx) -> None:
        learningRate = self.learning_rate.value if self.learning_rate.value else 0.0001
        earlyStop = self.earlystop.value if self.earlystop.value else 15
        verbose = self.verbose.value if self.verbose.value else True
        gpu_no = self.gpu.value if self.gpu.value else 0
        
        if torch.cuda.is_available():
            if torch.cuda.device_count() > gpu_no:
                device_name = f'cuda:{gpu_no}'
            else:
                device_name = 'cuda:0'
        else:
            device_name = 'cpu'
        
        unet_model = UNet()
        unet_model.to(device_name)
        
        optimizer = optim.Adam(unet_model.parameters(), lr=float(learningRate))
        early_stopping = EarlyStopping(patience=earlyStop, verbose=verbose, delta=0)

        self.model.value = unet_model
        self.optimizer.value = optimizer
        self.early_stopping.value = early_stopping

        self.done = True
    

@xai_component(type="split")
class ImageTrainTestSplit(Component):
    input_str: InArg[any] #Tuple[str,str]
    split_ratio: InArg[float]
    random_seed: InArg[int]
    image_size: InArg[tuple]
    
    train_image_path: OutArg[Tuple[str, str]]
    test_image_path: OutArg[Tuple[str, str]]
    
    def __init__(self):
        self.done = False
        self.split_ratio = InArg.empty()
        self.random_seed = InArg.empty()
        self.image_size = InArg.empty()
        
        self.train_image_path = OutArg.empty()
        self.test_image_path = OutArg.empty()

    def execute(self, ctx) -> None:
        splitRatio = self.split_ratio.value if self.split_ratio.value else 0.8
        randomSeed = self.random_seed.value if self.random_seed.value else 1234
        
        train_set_raw_str = "train_image"
        train_set_mask_str = "train_mask"

        test_set_raw_str = "test_image"
        test_set_mask_str = "test_mask"

        try:
            total_images = len([image for class_name in os.listdir(self.input_str.value[0]) for image in os.listdir(os.path.join(self.input_str.value[0], class_name))])
            total_images_mask = len([image for class_name in os.listdir(self.input_str.value[1]) for image in os.listdir(os.path.join(self.input_str.value[1], class_name))])

            if total_images != total_images_mask:
                raise ImageCountNotEqual()

            train_set_count = int(total_images * float(splitRatio))
            test_set_count = total_images - train_set_count

            new_train_set_raw_str = (Path(self.input_str.value[0] + "-transformed") / train_set_raw_str)
            new_train_set_mask_str = (Path(self.input_str.value[1] + "-transformed") / train_set_mask_str)

            new_test_set_raw_str = (Path(self.input_str.value[0] + "-transformed") / test_set_raw_str)
            new_test_set_mask_str = (Path(self.input_str.value[1] + "-transformed") / test_set_mask_str) 

            dataset = [new_train_set_raw_str, new_train_set_mask_str, new_test_set_raw_str, new_test_set_mask_str]

            for dataset_path in dataset:
                file = "\\".join(str(dataset_path).split("\\")[0:len(str(dataset_path).split("\\")) - 1])
                if not os.path.exists(file):
                    print(f"Created {file}")
                    os.mkdir(file)

            for rpath in [new_train_set_raw_str, new_train_set_mask_str, new_test_set_raw_str, new_test_set_mask_str]:
                if not os.path.exists(rpath):
                    print(f"Created {rpath}")
                    os.mkdir(rpath)

            TRANSFORM_IMG = T.Compose([T.Resize(self.image_size.value)])

            dataset_raw = torchvision.datasets.ImageFolder(Path(self.input_str.value[0]), transform = TRANSFORM_IMG)
            train_set_raw, val_set_raw = torch.utils.data.random_split(dataset_raw, [train_set_count, test_set_count],generator=torch.Generator().manual_seed(randomSeed))

            dataset_mask = torchvision.datasets.ImageFolder(Path(self.input_str.value[1]), transform = TRANSFORM_IMG)
            train_set_mask, val_set_mask = torch.utils.data.random_split(dataset_mask, [train_set_count, test_set_count],generator=torch.Generator().manual_seed(randomSeed))

            CvSaveImage(train_set_raw, new_train_set_raw_str).__saveImage__()
            CvSaveImage(train_set_mask, new_train_set_mask_str).__saveImage__()
            CvSaveImage(val_set_raw, new_test_set_raw_str).__saveImage__()
            CvSaveImage(val_set_mask, new_test_set_mask_str).__saveImage__()

            self.train_image_path.value = (str(new_train_set_raw_str), str(new_train_set_mask_str))
            self.test_image_path.value = (str(new_test_set_raw_str), str(new_test_set_mask_str))
    
            print(f"Train image path: {self.train_image_path.value[0]}")
            print(f"Train mask image path: {self.train_image_path.value[1]}")
            print(f"Test image path: {self.test_image_path.value[0]}")
            print(f"Test mask image path: {self.test_image_path.value[1]}")

            self.done = True

        except Exception as e:
            print(e)


@xai_component
class PrepareUnetDataLoader(Component):
    train_image_folder: InArg[any] #Tuple[str, str]
    test_image_folder: InArg[any] #Tuple[str, str]

    training_image_size: InArg[tuple]
    batch_size: InArg[int]
    workers: InArg[int]
    pin_memory: InArg[bool]
    shuffle: InArg[bool]
    
    train_loader: OutArg[torch.utils.data.DataLoader]
    tests_loader: OutArg[torch.utils.data.DataLoader]

    def __init__(self):
        self.done = False

        self.train_image_folder = InArg.empty()
        self.test_image_folder = InArg.empty()
        self.training_image_size = InArg.empty()
        self.batch_size = InArg.empty()
        self.workers = InArg.empty()
        self.pin_memory = InArg.empty()
        self.shuffle = InArg.empty()
        
        self.train_loader = OutArg.empty()
        self.tests_loader = OutArg.empty()
        
    def execute(self, ctx) -> None:  
        image_batch_size = self.batch_size.value if self.batch_size.value else 1
        shuffle_bool = self.shuffle.value if self.shuffle.value else True
        workers_integer = self.workers.value if self.workers.value else 0
        pin_memory_bool = self.pin_memory.value if self.pin_memory.value else False
        
        train_set = UNetDataset(image_dir=str(self.train_image_folder.value[0]), masks_dir=str(self.train_image_folder.value[1]))
        train_loader = torch.utils.data.DataLoader(train_set,
                                                   batch_size=image_batch_size,
                                                   shuffle=shuffle_bool,
                                                   num_workers=workers_integer,
                                                   pin_memory=pin_memory_bool
                                                   )

        tests_set = UNetDataset(image_dir=str(self.test_image_folder.value[0]), masks_dir=str(self.test_image_folder.value[1]))
        tests_loader = torch.utils.data.DataLoader(tests_set,
                                                   batch_size=image_batch_size,
                                                   shuffle=shuffle_bool,
                                                   num_workers=workers_integer,
                                                   pin_memory=pin_memory_bool
                                                   )
        
        self.train_loader.value = train_loader
        self.tests_loader.value = tests_loader

        self.done = True


@xai_component
class TrainUnet(Component):
    train_data: InArg[any] #torch.utils.data.DataLoader
    test_data: InArg[any] #torch.utils.data.DataLoader
    model: InArg[any] #UNet
    optimizer: InArg[any] #optim.Adam
    early_stopping: InArg[any] #EarlyStopping
    
    gpu: InArg[int]
    no_epochs: InArg[int]
    wpath_folder: InArg[str]
    model_name: InArg[str]
    save_graph: InArg[bool]

    loss_value_metric: OutArg[list]
    dice_accuracy_metric: OutArg[list]
    dice_score_metric: OutArg[list]
    iou_score_metric: OutArg[list]
    
    def __init__(self):
        self.done = False

        self.model = InArg.empty()
        self.optimizer = InArg.empty()
        self.early_stopping = InArg.empty()
        self.gpu = InArg.empty()
        self.no_epochs = InArg.empty()
        self.wpath_folder = InArg.empty()
        self.model_name = InArg.empty()
        self.save_graph = InArg.empty()

        self.loss_value_metric = OutArg.empty()
        self.dice_accuracy_metric = OutArg.empty()
        self.dice_score_metric = OutArg.empty()
        self.iou_score_metric = OutArg.empty()
        
    def execute(self, ctx) -> None:
        gpu_no = self.gpu.value if self.gpu.value else 0
        save_graph = self.save_graph.value if self.save_graph.value else True
        
        if torch.cuda.is_available():
            if torch.cuda.device_count() > gpu_no:
                device_name = f'cuda:{gpu_no}'
            else:
                device_name = 'cuda:0'
        else:
            device_name = 'cpu'
        
        trainer_start_time = time.time()
        loss_values = []

        dice_accuracy_values = []
        dice_score_values = []
        iou_score_values = []

        n_epochs = self.no_epochs.value
        for epoch in range(1, n_epochs + 1):
            epoch_start_time = time.time()

            train_loss = 0.0
            loop = tqdm(self.train_data.value)

            for _, (images, target) in enumerate(loop):
                images = images.to(device_name, dtype=torch.float)
                target = target.to(device_name, dtype=torch.float)

                self.optimizer.value.zero_grad()
                output = self.model.value(images)
                loss = F.binary_cross_entropy(output, target)
                loss.backward()
                self.optimizer.value.step()

                train_loss += loss.item()

            train_loss = train_loss / len(self.train_data.value)
            loss_values.append(train_loss)

            epoch_train_time = time.time()

            # ----------------#
            #  Accuracy Calc  #
            # ----------------#
            self.model.value.eval()
            num_correct = 0
            num_pixels = 0

            dice_accuracy = 0
            dice_scores = 0
            iou_scores = 0

            with torch.no_grad():
                for imgs, mask in self.test_data.value:
                    imgs = imgs.to(device_name, dtype=torch.float)
                    mask = mask.to(device_name, dtype=torch.float)
                    pred = self.model.value(imgs)

                    # ----------------#
                    #   Dice Score    #
                    # ----------------#
                    pred_dice = (pred > 0.5).float()

                    num_correct += (pred_dice == mask).sum()
                    num_pixels += torch.numel(pred_dice)

                    dice_scores += (2 * (pred_dice * mask).sum()) / ((pred_dice + mask).sum() + 1e-8)

                    # ----------------#
                    #    IoU Score    #
                    # ----------------#
                    pred_iou = pred.view(-1)
                    mask_iou = mask.view(-1)
                    total = (pred_iou + mask_iou).sum()
                    inter = (pred_iou * mask_iou).sum()
                    union = total - inter
                    iou_scores += ((inter + 1) / (union + 1))

            dice_accuracy = torch.true_divide(num_correct, num_pixels) * 100
            dice_accuracy_values.append(dice_accuracy)

            dice_score = dice_scores / len(self.test_data.value)
            dice_score_values.append(dice_score)

            iou_score = iou_scores / len(self.test_data.value)
            iou_score_values.append(iou_score)

            self.model.value.train()

            self.early_stopping.value(iou_score, self.model.value, f"{self.wpath_folder.value}", f"{self.model_name.value}")

            epoch_stop_time = time.time()

            string = [
                f"----- Epoch: {epoch:0>2d}/{n_epochs} ----- ",
                f"Training Loss: {(train_loss):.6f} ",
                f"Dice Accuracy (%): {(dice_accuracy):.6f} ",
                f"Dice Score: {(dice_score):.6f} ",
                f"IoU Score: {(iou_score):.6f} ",
            ]


            time_string = [
                f"---Time Taken:Full: {TimeLapse(int(epoch_stop_time - epoch_start_time)).get_lapsed_time_string()}  ",
                f"Train: {TimeLapse(int(epoch_train_time - epoch_start_time)).get_lapsed_time_string()}  ",
                f"Eval: {TimeLapse(int(epoch_stop_time - epoch_train_time)).get_lapsed_time_string()}  ",
            ]

            print("\n\t".join(string))

            print("\n\t\t\t\t".join(time_string))

            if self.early_stopping.value.early_stop:
                print("The model does not converge, early stopping triggered .....")
                break

        final_e = self.early_stopping.value.final_e
        trainer_time_taken = time.time() - trainer_start_time

        self.loss_value_metric.value = loss_values
        self.dice_accuracy_metric.value = dice_accuracy_values
        self.dice_score_metric.value = dice_score_values
        self.iou_score_metric.value = iou_score_values

        wgraph_path_folder = "" if self.wpath_folder.value is None or self.wpath_folder.value == "None" else self.wpath_folder.value
        wgraph_model_path = os.path.join(wgraph_path_folder, self.model_name.value)

        if save_graph:
            import matplotlib.pyplot as plt

            plt.figure()
            plt.plot(np.array(loss_values), 'b')
            plt.savefig(f"{wgraph_model_path}_loss_values.png")
            plt.close()

            plt.figure()
            plt.plot(np.array(dice_accuracy_values), 'b')
            plt.savefig(f'{wgraph_model_path}_dice_accuracy_values.png')
            plt.close()

            plt.figure()
            plt.plot(np.array(dice_score_values), 'b')
            plt.savefig(f'{wgraph_model_path}_dice_score_values.png')
            plt.close()

            plt.figure()
            plt.plot(np.array(iou_score_values), 'b')
            plt.savefig(f'{wgraph_model_path}_IoU_score_values.png')
            plt.close()

        self.done = True


@xai_component
class UNetModel(Component):
    gpu: InArg[int]
    
    model: OutArg[str]
    device_name: OutArg[str]
    
    def __init__(self):
        self.done = False
        self.gpu = InArg.empty()
        
        self.model = OutArg.empty()
        self.device_name = OutArg.empty()
        
    def execute(self, ctx) -> None:
        gpu_no = self.gpu.value if self.gpu.value else 0
        
        if torch.cuda.is_available():
            if torch.cuda.device_count() > gpu_no:
                device_name = f'cuda:{gpu_no}'
            else:
                device_name = 'cuda:0'
        else:
            device_name = 'cpu'
        
        model = UNet()
        model.to(device_name)
        
        self.device_name.value = device_name
        self.model.value = model
        self.done = True


@xai_component
class UnetPredict(Component):
    model_path: InArg[str]
    image_path: InArg[str]
    image_size: InArg[tuple]
    
    def __init__(self):
        self.done = False
        self.model_path = InArg.empty()
        self.image_path = InArg.empty()
        self.image_size = InArg.empty()
        
    def execute(self, ctx) -> None:
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        model = UNet()
        model.to(device)
        
        image = cv2.imread(os.path.join(self.image_path.value), 0)
        image = cv2.resize(image, self.image_size.value)
        
        image = image / 255.0
        image = image.reshape(1, self.image_size.value[0], self.image_size.value[1], 1)
        image = np.transpose(image, (0,3,1,2))
        
        image = torch.Tensor(image)
        
        try:
            model_type = self.model_path.value.split(".")[-1]

            if model_type == "pth":
                model_checkpoint = torch.load(self.model_path.value, map_location=device)
                model.load_state_dict(model_checkpoint['model_state_dict'])
                model.eval()
                model_predict_tensor = model.forward(image)
                model_predict_numpy = model_predict_tensor.detach().numpy()
                image_output = np.transpose(model_predict_numpy[0], (1,2,0))

            elif model_type == "onnx":
                import onnx
                from onnx_tf.backend import prepare

                model_checkpoint = onnx.load(self.model_path.value)
                model = prepare(model_checkpoint)
                model_onnx = model.run(image)
                onnx_np = np.asarray(model_onnx)
                image_output = np.transpose(onnx_np[0][0], (1,2,0))

            else:
                raise ModelNotFound()
        
            cv2.imshow("Model Output", image_output)
            cv2.waitKey(0) 
            cv2.destroyAllWindows()
        
        except Exception as e:
            print(e)
            
        self.done = True

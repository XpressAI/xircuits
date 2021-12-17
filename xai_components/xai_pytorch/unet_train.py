from torchvision import transforms
from torch.utils.data import Dataset
from tqdm import tqdm
import cv2
import numpy as np
import os
import torch
import torch.nn as nn
import torch.nn.functional as F


class ImageCountNotEqual(Exception):
    """
    Exception raised for errors when images are not equal.
    """

    def __init__(self, message="Image count is not equal."):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f'{self.message}'

    
class ModelNotFound(Exception):
    """
    Exception raised for errors when model type is not found.
    """

    def __init__(self, message="Model is not found."):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f'{self.message}'
    
    
class CvSaveImage():
    def __init__(self, image, image_path):
        self.image = image
        self.image_path = image_path
        
    def __saveImage__(self):
        count = 1
        for raw_image in tqdm(self.image):
            img = np.asarray(raw_image[0])
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            image_str = str(self.image_path) + "\\" + str(count).zfill(5) + ".png"
            cv2.imwrite(image_str, img)
            count += 1

transforms = transforms.Compose([transforms.Lambda(lambda x: x / 255)])


class UNetDataset(Dataset):
    def __init__(self, image_dir, masks_dir, transform=None, img_size=256):
        self.image_dir = image_dir
        self.masks_dir = masks_dir
        self.transform = transform
        self.img_size = img_size
        self.images = os.listdir(image_dir)

    def __len__(self):
        return len(self.images)

    def __getitem__(self, index):
        image_path = os.path.join(self.image_dir, self.images[index])
        masks_path = os.path.join(self.masks_dir, self.images[index])

        image = cv2.imread(image_path, 0)  # read into single channel greyscale
        masks = cv2.imread(masks_path, 0)  # read into single channel greyscale

        _, masks = cv2.threshold(masks, 127, 255, cv2.THRESH_BINARY)  # converting bad masks to 0. /255.

        image = image.reshape(1, self.img_size, self.img_size)  # add extra dim (1) - 1, 256 256
        masks = masks.reshape(1, self.img_size, self.img_size)  # add extra dim (1) - 1, 256 256

        image = torch.Tensor(image)
        masks = torch.Tensor(masks)

        image = transforms(image)
        masks = transforms(masks)

        return image, masks 
            

class UNet(nn.Module):

    def __init__(self):
        super().__init__()

        self.d_conv_down_1 = self.double_conv(1, 16)
        self.d_conv_down_2 = self.double_conv(16, 32)
        self.d_conv_down_3 = self.double_conv(32, 64)
        self.d_conv_down_4 = self.double_conv(64, 128)
        self.d_conv_down_5 = self.double_conv(128, 256)

        self.maxpool = nn.MaxPool2d(2)
        self.upsample = nn.Upsample(scale_factor=2, mode='nearest')

        self.s_conv_up_6 = self.single_conv_up(256, 128)
        self.d_conv_up_6 = self.double_conv(128 + 128, 128)
        self.s_conv_up_7 = self.single_conv_up(128, 64)
        self.d_conv_up_7 = self.double_conv(64 + 64, 64)
        self.s_conv_up_8 = self.single_conv_up(64, 32)
        self.d_conv_up_8 = self.double_conv(32 + 32, 32)
        self.s_conv_up_9 = self.single_conv_up(32, 16)
        self.d_conv_up_9 = self.double_conv(16 + 16, 16)
        self.conv_up_9 = nn.Sequential(nn.Conv2d(16, 2, 3, padding=1), nn.ReLU(inplace=True))
        self.conv_last = nn.Sequential(nn.Conv2d(2, 1, 1))

    @staticmethod
    def double_conv(in_channels, out_channels):
        return nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1),
            nn.ReLU(inplace=True)
        )

    @staticmethod
    def single_conv_up(in_channels, out_channels):
        return nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 2),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        conv1 = self.d_conv_down_1(x)
        pool1 = self.maxpool(conv1)
        conv2 = self.d_conv_down_2(pool1)
        pool2 = self.maxpool(conv2)
        conv3 = self.d_conv_down_3(pool2)
        pool3 = self.maxpool(conv3)
        conv4 = self.d_conv_down_4(pool3)
        pool4 = self.maxpool(conv4)
        conv5 = self.d_conv_down_5(pool4)
        conv5 = self.upsample(conv5)
        conv5 = F.pad(conv5, (0, 1, 0, 1), "constant", 0)

        up6 = self.s_conv_up_6(conv5)
        merge6 = torch.cat([conv4, up6], dim=1)
        conv6 = self.d_conv_up_6(merge6)
        conv6 = self.upsample(conv6)
        conv6 = F.pad(conv6, (0, 1, 0, 1), "constant", 0)

        up7 = self.s_conv_up_7(conv6)
        merge7 = torch.cat([conv3, up7], dim=1)
        conv7 = self.d_conv_up_7(merge7)
        conv7 = self.upsample(conv7)
        conv7 = F.pad(conv7, (0, 1, 0, 1), "constant", 0)

        up8 = self.s_conv_up_8(conv7)
        merge8 = torch.cat([conv2, up8], dim=1)
        conv8 = self.d_conv_up_8(merge8)
        conv8 = self.upsample(conv8)
        conv8 = F.pad(conv8, (0, 1, 0, 1), "constant", 0)

        up9 = self.s_conv_up_9(conv8)
        merge9 = torch.cat([conv1, up9], dim=1)
        conv9 = self.d_conv_up_9(merge9)
        conv9 = self.conv_up_9(conv9)

        conv10 = self.conv_last(conv9)
        out = torch.sigmoid(conv10)
        return out


class EarlyStopping:
    def __init__(self, patience=20, verbose=False, delta=0, trace_func=print, n_epoch=1):
        self.patience = patience
        self.verbose = verbose
        self.counter = 0
        self.best_score = None
        self.early_stop = False
        self.delta = delta
        self.trace_func = trace_func
        self.val_iou_max = -np.Inf
        self.final_e = 1
        self.n_epoch = n_epoch

    def __call__(self, val_iou, model, wpath_folder, model_name):
        score = val_iou

        if self.best_score is None:
            self.best_score = score
            self.save_checkpoint(model, wpath_folder, model_name)
        elif score < self.best_score + self.delta:
            self.counter += 1
            self.trace_func(f'EarlyStopping counter: {self.counter} out of {self.patience}')
            if self.counter >= self.patience:
                self.early_stop = True
        else:
            self.best_score = score
            self.counter = 0
            self.save_checkpoint(model, wpath_folder, model_name)

    def save_checkpoint(self, model, wpath_folder, model_name):
        checkpoint = {'arch': "UNET", 'model_state_dict': model.state_dict()}

        if self.verbose:
            self.trace_func(
                f'IoU increased ({self.val_iou_max:.6f} --> {self.best_score:.6f}).  Saving model ...')
        
        wpath_folder = "" if wpath_folder is None or wpath_folder == "None" else wpath_folder
        model_path = os.path.join(wpath_folder, model_name)
        
        torch.save(checkpoint, f"{model_path}-epoch-{self.final_e}.pth")

        self.final_e = self.final_e + 1
        self.val_iou_max = self.best_score
        
        
class TimeLapse:
    def __init__(self, lapsed_time):
        self.lapsed_time = lapsed_time
        
    def get_lapsed_time_string(self) -> str:
        time_string = []
        hour = self.lapsed_time // (60 * 60)
        remain_time = self.lapsed_time % (60 * 60)
        minute = remain_time // 60
        second = remain_time % 60

        if hour > 0:
            time_string.append(f'{int(hour)} hour(s)')
        if minute > 0:
            time_string.append(f'{int(minute)} minute(s)')
        if second > 0:
            time_string.append(f'{int(second)} second(s)')

        return ' '.join(time_string)
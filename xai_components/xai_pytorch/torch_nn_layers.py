from xai_components.base import InArg, InCompArg, OutArg, Component, xai_component

import os
import sys

import torch
from torch import nn


@xai_component
class TorchModel(Component):
    """Creates a custom Torch Model config.

    ##### outPorts:
    - model_in: List of layers to make into Sequential Model
    - model_config: resulting model.
    - loss_fn: nn.CrossEntropyLoss()
    - optimizer: torch.optim.SGD(model.parameters(), lr=1e-3)
    """

    model_in: InArg[list]
    loss_in: InArg[str]
    learning_rate = InArg[float]
    optimizer_in: InArg[str]
    should_flatten: InArg[bool]
    model_config: OutArg[nn.Module]
    loss_fn: OutArg[any]
    optimizer: OutArg[any]

    def __init__(self):
        super().__init__()
        self.learning_rate.value = 1e-3
        self.should_flatten.value = False

    def execute(self,ctx) -> None:
        should_flatten = self.should_flatten.value
        stack = self.model_in.value
        
        # Define model
        class NeuralNetwork(nn.Module):
            def __init__(self):
                super(NeuralNetwork, self).__init__()
                
                if should_flatten:
                    self.flatten = nn.Flatten()
                self.stack = nn.Sequential(*stack)

            def forward(self, x):
                if should_flatten:
                    x = self.flatten(x)
                    
                logits = self.stack(x)
                return logits

        # Get cpu or gpu device for training.
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using {device} device")
        model = NeuralNetwork().to(device)
        print(model)

        loss_fn = nn.MSELoss()
        if self.loss_in.value == 'CrossEntropyLoss':
            loss_fn = nn.CrossEntropyLoss()
        elif self.loss_in.value == 'L1Loss':
            loss_fn = nn.L1Loss()
        elif self.loss_in.value == 'CTCLoss':
            loss_fn = nn.CTCLoss()
        else:
            loss_fn = eval(self.loss_in.value)

        
        optimizer = torch.optim.SGD(model.parameters(), lr=self.learning_rate.value)
        if self.optimizer_in.value == 'Adam':
            optimizer = torch.optim.Adam(model.parameters(), lr=self.learning_rate.value)
        elif self.optimizer_in.value == 'RMSprop':
            optimizer = torch.optim.RMSprop(model.parameters(), lr=self.learning_rate.value)
        else:
            optimizer = eval(self.optimizer_in.value)

        self.model_config.value = model
        self.loss_fn.value = loss_fn
        self.optimizer.value = optimizer


@xai_component
class TorchAddLinearLayer(Component):
    """Adds a LinearLayer to a sequential model."""

    model_in: InArg[list]
    in_features: InArg[int]
    out_features: InArg[int]
    bias: InArg[bool]
    model_out: OutArg[list]

    def execute(self,ctx) -> None:
        bias = True if self.bias.value is None else False
        in_size = self.in_features.value
        out_size = self.out_features.value
        
        if self.model_in.value is None:
            self.model_out.value = [nn.Linear(in_size, out_size, bias)]
        else:
            self.model_out.value = self.model_in.value + [nn.Linear(in_size, out_size, bias)]


@xai_component
class TorchAddConv1DLayer(Component):
    """Adds a Conv1DLayer to a sequential model."""

    model_in: InArg[list]

    in_channels: InCompArg[int]
    out_channels: InCompArg[int]
    kernel_size: InCompArg[any] #int or tuple
    stride: InArg[any] #int or tuple
    padding: InArg[any] #int, tuple or str
    dilation: InArg[any] #int or tuple
    groups: InArg[int]
    bias: InArg[bool]
    padding_mode: InArg[str]

    model_out: OutArg[list]


    def __init__(self):
        super().__init__()
        self.stride.value = 1
        self.padding.value = 0
        self.dilation.value = 1
        self.groups.value = 1
        self.bias.value = True
        self.padding_mode.value = 'zeros'
        

    def execute(self,ctx) -> None:

        in_channels = self.in_channels.value 
        out_channels = self.out_channels.value 
        kernel_size = self.kernel_size.value 
        stride = self.stride.value 
        padding = self.padding.value 
        dilation = self.dilation.value 
        groups = self.groups.value 
        bias = self.bias.value 
        padding_mode = self.padding_mode.value 
        
        if self.model_in.value is None:
            self.model_out.value = [nn.Conv1d(in_channels, out_channels, kernel_size, stride, padding, dilation, groups, bias, padding_mode)]
        else:
            self.model_out.value = self.model_in.value + [nn.Conv1d(in_channels, out_channels, kernel_size, stride, padding, dilation, groups, bias, padding_mode)]


@xai_component
class TorchAddConv2DLayer(Component):
    """Adds a Conv2DLayer to a sequential model."""

    model_in: InArg[list]

    in_channels: InCompArg[int]
    out_channels: InCompArg[int]
    kernel_size: InCompArg[any] #int or tuple
    stride: InArg[any] #int or tuple
    padding: InArg[any] #int, tuple or str
    dilation: InArg[any] #int or tuple
    groups: InArg[int]
    bias: InArg[bool]
    padding_mode: InArg[str]

    model_out: OutArg[list]


    def __init__(self):
        super().__init__()
        self.stride.value = 1
        self.padding.value = 0
        self.dilation.value = 1
        self.groups.value = 1
        self.bias.value = True
        self.padding_mode.value = 'zeros'

    def execute(self,ctx) -> None:

        in_channels = self.in_channels.value 
        out_channels = self.out_channels.value 
        kernel_size = self.kernel_size.value 
        stride = self.stride.value 
        padding = self.padding.value 
        dilation = self.dilation.value 
        groups = self.groups.value 
        bias = self.bias.value 
        padding_mode = self.padding_mode.value 
        
        if self.model_in.value is None:
            self.model_out.value = [nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding, dilation, groups, bias, padding_mode)]
        else:
            self.model_out.value = self.model_in.value + [nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding, dilation, groups, bias, padding_mode)]

@xai_component
class TorchAddTransformerEncoderLayer(Component):
    """Adds a TransformerEncoderLayer to a sequential model."""

    model_in: InArg[list]

    d_model : InCompArg[int]
    nhead : InCompArg[int]
    dim_feedforward : InArg[int]
    dropout : InArg[float]
    activation : InArg[any] #Union[str, Callable[[Tensor], Tensor]]
    layer_norm_eps : InArg[float]
    batch_first : InArg[bool]
    norm_first : InArg[bool]

    model_out: OutArg[list]


    def __init__(self):
        super().__init__()

        self.dim_feedforward.value = 2048
        self.dropout.value = 0.1
        self.activation.value = 'relu'
        self.layer_norm_eps.value = 1e-05
        self.batch_first.value = False
        self.norm_first.value = False

    def execute(self,ctx) -> None:

        d_model = self.d_model.value
        nhead = self.nhead.value
        dim_feedforward = self.dim_feedforward.value
        dropout = self.dropout.value
        activation = self.activation.value
        layer_norm_eps = self.layer_norm_eps.value
        batch_first = self.batch_first.value
        norm_first = self.norm_first.value
        
        if self.model_in.value is None:
            self.model_out.value = [nn.TransformerEncoderLayer(d_model, nhead, dim_feedforward, dropout, activation, layer_norm_eps, batch_first, norm_first)]
        else:
            self.model_out.value = self.model_in.value + [nn.TransformerEncoderLayer(d_model, nhead, dim_feedforward, dropout, activation, layer_norm_eps, batch_first, norm_first)]

@xai_component
class TorchAddTransformerDecoderLayer(Component):
    """Adds a TransformerDecoderLayer to a sequential model."""

    model_in: InArg[list]

    d_model : InCompArg[int]
    nhead : InCompArg[int]
    dim_feedforward : InArg[int]
    dropout : InArg[float]
    activation : InArg[any] #Union[str, Callable[[Tensor], Tensor]]
    layer_norm_eps : InArg[float]
    batch_first : InArg[bool]
    norm_first : InArg[bool]

    model_out: OutArg[list]


    def __init__(self):
        super().__init__()
        self.dim_feedforward.value = 2048
        self.dropout.value = 0.1
        self.activation.value = 'relu'
        self.layer_norm_eps.value = 1e-05
        self.batch_first.value = False
        self.norm_first.value = False

    def execute(self,ctx) -> None:

        d_model = self.d_model.value
        nhead = self.nhead.value
        dim_feedforward = self.dim_feedforward.value
        dropout = self.dropout.value
        activation = self.activation.value
        layer_norm_eps = self.layer_norm_eps.value
        batch_first = self.batch_first.value
        norm_first = self.norm_first.value
        
        if self.model_in.value is None:
            self.model_out.value = [nn.TransformerDecoderLayer(d_model, nhead, dim_feedforward, dropout, activation, layer_norm_eps, batch_first, norm_first)]
        else:
            self.model_out.value = self.model_in.value + [nn.TransformerDecoderLayer(d_model, nhead, dim_feedforward, dropout, activation, layer_norm_eps, batch_first, norm_first)]


@xai_component
class TorchLSTM(Component):
    """Adds a LSTM to a sequential model."""

    model_in: InArg[list]

    input_size: InCompArg[int]
    hidden_size: InCompArg[int]
    num_layers: InArg[int]
    bias: InArg[bool]
    batch_first: InArg[bool]
    dropout: InArg[float]
    bidirectional: InArg[bool]
    proj_size: InArg[int]

    model_out: OutArg[list]


    def __init__(self):
        super().__init__()

        self.num_layers.value = 1
        self.bias.value = True
        self.batch_first.value = False
        self.dropout.value = 0
        self.bidirectional.value = False
        self.proj_size.value = 0

    def execute(self,ctx) -> None:

        input_size = self.input_size.value
        hidden_size = self.hidden_size.value
        num_layers = self.num_layers.value
        bias = self.bias.value
        batch_first = self.batch_first.value
        dropout = self.dropout.value
        bidirectional = self.bidirectional.value
        proj_size = self.proj_size.value

        if self.model_in.value is None:
            self.model_out.value = [nn.LSTM(input_size, hidden_size, num_layers, bias, batch_first, dropout, bidirectional, proj_size)]
        else:
            self.model_out.value = self.model_in.value + [nn.LSTM(input_size, hidden_size, num_layers, bias, batch_first, dropout, bidirectional, proj_size)]

@xai_component
class TorchAddReluLayer(Component):
    """Adds a Relu activation to a sequential model."""
    
    model_in: InArg[list]
    model_out: OutArg[list]

    def execute(self, ctx) -> None:
        if self.model_in.value is None:
            self.model_out.value = [nn.ReLU()]
        else:
            self.model_out.value = self.model_in.value + [nn.ReLU()]

@xai_component
class TorchAddDropoutLayer(Component):
    """Adds a Dropout to a sequential model."""
    
    model_in: InArg[list]
    prob_zero: InArg[float]
    model_out: OutArg[list]

    
    def execute(self, ctx) -> None:
        prob = 0.5
        if self.prob_zero.value is not None:
            prob = self.prob_zero.value
            
        if self.model_in.value is None:
            self.model_out.value = [nn.Dropout(prob)]
        else:
            self.model_out.value = self.model_in.value + [nn.Dropout(prob)]
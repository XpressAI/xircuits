from argparse import ArgumentParser
from datetime import datetime
from time import sleep
from xai_components.xai_learning.keras_transfer_learning import TFDataset
from xai_components.xai_learning.keras_transfer_learning import KerasTransferLearningModel
from xai_components.xai_learning.keras_transfer_learning import TrainKerasModel
from xai_components.xai_learning.training import EvaluateAccuracy

def main(args):

    ctx = {}
    ctx['args'] = args

    c_1 = TFDataset()
    c_2 = KerasTransferLearningModel()
    c_3 = TrainKerasModel()
    c_4 = EvaluateAccuracy()

    c_1.batch_size.value = 2
    c_2.base_model_name.value = """MobileNetV2"""
    c_3.model = c_2.model
    c_3.training_data = c_1.test_data
    c_3.batch_size.value = 2
    c_3.epochs.value = 2
    c_4.model = c_3.trained_model

    c_1.next = c_2
    c_2.next = c_3
    c_3.next = c_4
    c_4.next = None

    next_component = c_1
    while next_component:
        is_done, next_component = next_component.do(ctx)

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--experiment_name', default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), type=str)
    main(parser.parse_args())
    print("\nFinish Executing")
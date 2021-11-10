from argparse import ArgumentParser
from datetime import datetime
from xai_learning.training import ReadDataSet
from xai_learning.training import FlattenImageData
from xai_learning.training import TrainTestSplit
from xai_learning.training import Create1DInputModel
from xai_learning.training import TrainImageClassifier
from xai_learning.training import EvaluateAccuracy

def main(args):
    c_1 = ReadDataSet()
    c_2 = FlattenImageData()
    c_3 = TrainTestSplit()
    c_4 = Create1DInputModel()
    c_5 = TrainImageClassifier()
    c_6 = EvaluateAccuracy()

    c_1.dataset_name.value = 'mnist'
    c_2.dataset = c_1.dataset
    c_3.dataset = c_2.resized_dataset
    c_3.train_split.value = 0.8
    c_3.shuffle.value = False
    c_4.training_data = c_3.train
    c_5.training_data = c_3.train
    c_5.training_epochs.value = 1
    c_5.model = c_4.model
    c_6.model = c_5.trained_model
    c_6.eval_dataset = c_3.test

    c_1.next = c_2
    c_2.next = c_3
    c_3.next = c_4
    c_4.next = c_5
    c_5.next = c_6
    c_6.next = None

    next_component = c_1.do()
    while next_component:
        next_component = next_component.do()

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--experiment_name', default=datetime.now().strftime("%Y-%m-%d %H:%M:%S"), type=str)
    main(parser.parse_args())
from argparse import ArgumentParser

from xai_learning.training import ReadDataSet
from xai_learning.training import ResizeImageData
from xai_learning.training import TrainTestSplit
from xai_learning.training import CreateModel
from xai_learning.training import TrainImageClassifier
from xai_learning.training import EvaluateAccuracy
from xai_learning.training import ShouldStop

def main(args):
    c_1 = ReadDataSet()
    c_2 = ResizeImageData()
    c_3 = TrainTestSplit()
    c_4 = CreateModel()
    c_5 = TrainImageClassifier()
    c_6 = EvaluateAccuracy()
    c_7 = ShouldStop()

    c_1.dataset_name.value = 'mnist'
    c_2.dataset = c_1.dataset
    c_3.dataset = c_2.resized_dataset
    c_4.training_data = c_3.train
    c_5.training_data = c_3.train
    c_5.training_epochs.value = 1
    c_5.model = c_4.model
    c_6.model = c_5.trained_model
    c_6.eval_dataset = c_3.test
    c_7.target_accuracy.value = 0.7
    c_7.max_retries.value = 2
    c_7.metrics = c_6.metrics

    c_1.next = c_2
    c_2.next = c_3
    c_3.next = c_4
    c_4.next = c_5
    c_5.next = c_6
    c_6.next = c_7
    c_7.next = None

    next_component = c_1.do()
    while next_component:
        next_component = next_component.do()

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--name', default='test', type=str)
    main(parser.parse_args())
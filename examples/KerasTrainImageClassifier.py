from argparse import ArgumentParser
from datetime import datetime
from time import sleep
from xai_components.xai_learning.training import ReadDataSet
from xai_components.xai_learning.training import TrainTestSplit
from xai_components.xai_learning.training import Create2DInputModel
from xai_components.xai_learning.training import TrainImageClassifier
from xai_components.xai_learning.training import EvaluateAccuracy

def main(args):

    ctx = {}
    ctx['args'] = args

    c_1 = ReadDataSet()
    c_2 = TrainTestSplit()
    c_3 = Create2DInputModel()
    c_4 = TrainImageClassifier()
    c_5 = EvaluateAccuracy()

    c_1.dataset_name.value = """mnist"""
    c_2.dataset = c_1.dataset
    c_2.train_split.value = 0.8
    c_2.shuffle.value = False
    c_3.training_data = c_2.train
    c_4.model = c_3.model
    c_4.training_data = c_2.train
    c_4.training_epochs.value = 1
    c_5.model = c_4.trained_model
    c_5.eval_dataset = c_2.test

    c_1.next = c_2
    c_2.next = c_3
    c_3.next = c_4
    c_4.next = c_5
    c_5.next = None

    next_component = c_1
    while next_component:
        is_done, next_component = next_component.do(ctx)

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--experiment_name', default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), type=str)
    main(parser.parse_args())
    print("\nFinish Executing")
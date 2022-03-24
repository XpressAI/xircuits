from argparse import ArgumentParser
from datetime import datetime
from time import sleep
from xai_components.xai_pycaret.classification import GetData
from xai_components.xai_pycaret.classification import SampleTestData
from xai_components.xai_pycaret.classification import SetupPyCaretEnvironment
from xai_components.xai_pycaret.classification import CompareModels
from xai_components.xai_pycaret.classification import CreateModel
from xai_components.xai_pycaret.classification import TuneModel

def main(args):

    ctx = {}
    ctx['args'] = args

    c_1 = GetData()
    c_2 = SampleTestData()
    c_3 = SetupPyCaretEnvironment()
    c_4 = CompareModels()
    c_5 = CreateModel()
    c_6 = TuneModel()

    c_1.dataset.value = 'credit'
    c_1.save_copy.value = False
    c_1.verbose.value = True
    c_2.in_dataset = c_1.out_dataset
    c_2.test_fraction.value = 0.05
    c_2.seed.value = 9494
    c_3.in_dataset = c_2.train_val_dataset
    c_3.target.value = 'default'
    c_3.train_size_fraction.value = 0.70
    c_3.seed.value = 9494
    c_4.sort_by.value = 'F1'
    c_5.model_id.value = 'dt'
    c_5.num_fold.value = 12
    c_6.in_created_model = c_5.out_created_model
    c_6.early_stopping_patience.value = 12
    c_6.num_fold.value = 12
    c_6.n_iter.value = 12

    c_1.next = c_2
    c_2.next = c_3
    c_3.next = c_4
    c_4.next = c_5
    c_5.next = c_6
    c_6.next = None

    next_component = c_1
    while next_component:
        is_done, next_component = next_component.do(ctx)

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--experiment_name', default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), type=str)
    main(parser.parse_args())
    print("\nFinish Executing")
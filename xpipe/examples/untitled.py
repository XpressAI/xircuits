from argparse import ArgumentParser
from datetime import datetime
from xai_components.xai_learning.component_test import HelloHyperparameter2

def main(args):
    c_1 = HelloHyperparameter2()

    c_1.input_str.value = 'asd'

    c_1.next = None

    next_component = c_1.do()
    while next_component:
        next_component = next_component.do()

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--experiment_name', default=datetime.now().strftime("%Y-%m-%d %H:%M:%S"), type=str)
    main(parser.parse_args())
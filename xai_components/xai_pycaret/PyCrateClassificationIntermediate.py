from argparse import ArgumentParser
from datetime import datetime
from time import sleep
from xai_components.xai_pycaret.classification import GetData

def main(args):

    ctx = {}
    ctx['args'] = args

    c_1 = GetData()

    c_1.dataset.value = 'credit'

    c_1.next = None

    next_component = c_1
    while next_component:
        is_done, next_component = next_component.do(ctx)

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--experiment_name', default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), type=str)
    main(parser.parse_args())
    print("\nFinish Executing")
from argparse import ArgumentParser
from datetime import datetime
from time import sleep
from xai_components.xai_template.example_components import HelloHyperparameter

def main(args):

    ctx = {}
    ctx['args'] = args

    c_1 = HelloHyperparameter()

    c_1.input_str.value = 'BYE BYE'

    c_1.next = None

    next_component = c_1
    while next_component:
        is_done, next_component = next_component.do(ctx)

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--experiment_name', default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), type=str)
    main(parser.parse_args())
    print("\nFinish Executing")
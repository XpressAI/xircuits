from xai_learning.tf_keras import ResNet50
from xai_learning.tf_keras import KerasPredict
from argparse import ArgumentParser

def main(args):
    c_1 = ResNet50()
    c_2 = KerasPredict()

    c_1.weights.value = None
    c_1.classes.value = 500
    c_2.model = c_1.model
    c_2.img_string.value = 'cat.jpg'

    c_1.next = c_2
    c_2.next = None

    next_component = c_1.do()
    while next_component:
        next_component = next_component.do()

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--name', default='test', type=str)
    main(parser.parse_args())
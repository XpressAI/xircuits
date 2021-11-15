from argparse import ArgumentParser
from datetime import datetime
from xai_spark.pyspark_mllib import SparkSparseVector
from xai_spark.pyspark_mllib import SparkLabeledPoint

def main(args):
    c_1 = SparkSparseVector()
    c_2 = SparkLabeledPoint()

    c_1.vector_list.value = [3, [0, 2], [1.0, 3.0]]
    c_2.label.value = 1.0
    c_2.sparse_vector = c_1.sparse_vector

    c_1.next = c_2
    c_2.next = None

    next_component = c_1.do()
    while next_component:
        next_component = next_component.do()

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--experiment_name', default=datetime.now().strftime("%Y-%m-%d %H:%M:%S"), type=str)
    main(parser.parse_args())
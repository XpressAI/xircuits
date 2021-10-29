from xai_spark.pyspark import xSparkSession
from xai_spark.pyspark import SparkDataFrameFromPandas
from argparse import ArgumentParser

import os
import sys

os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable

def main(args):
    c_1 = xSparkSession()
    c_2 = SparkDataFrameFromPandas()

    c_2.sparksession = c_1.sparksession

    c_1.next = c_2
    c_2.next = None

    next_component = c_1.do()
    while next_component:
        next_component = next_component.do()

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--name', default='test', type=str)
    main(parser.parse_args())
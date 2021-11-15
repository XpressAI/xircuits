from argparse import ArgumentParser
from datetime import datetime
from xai_spark.pyspark_core import xSparkSession
from xai_spark.pyspark_core import SparkReadFile
from xai_spark.pyspark_core import SparkVisualize

def main(args):
    c_1 = xSparkSession()
    c_2 = SparkReadFile()
    c_3 = SparkVisualize()

    c_2.in_sparksession = c_1.sparksession
    c_2.file_input.value = 'Datasets/wind.csv'
    c_3.dataframe = c_2.out_dataframe
    c_3.plot_type.value = 'line'
    c_3.x_axis.value = 'Year'
    c_3.y_axis.value = 'Wind'
    c_3.output_name.value = 'Lineplot.png'

    c_1.next = c_2
    c_2.next = c_3
    c_3.next = None

    next_component = c_1.do()
    while next_component:
        next_component = next_component.do()

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--experiment_name', default=datetime.now().strftime("%Y-%m-%d %H:%M:%S"), type=str)
    main(parser.parse_args())
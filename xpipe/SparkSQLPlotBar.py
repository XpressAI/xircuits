from argparse import ArgumentParser
from datetime import datetime
from xai_spark.pyspark_core import xSparkSession
from xai_spark.pyspark_core import SparkReadCSV
from xai_spark.pyspark_core import SparkSQL
from xai_spark.pyspark_core import SparkVisualize

def main(args):
    c_1 = xSparkSession()
    c_2 = SparkReadCSV()
    c_3 = SparkSQL()
    c_4 = SparkVisualize()

    c_2.in_sparksession = c_1.sparksession
    c_2.file_input.value = 'Datasets/penguins_size.csv'
    c_3.in_sparksession = c_2.out_sparksession
    c_3.dataframe = c_2.out_dataframe
    c_3.sql_string.value = 'SELECT species'
    c_4.dataframe = c_3.sql_dataframe
    c_4.plot_type.value = 'bar'
    c_4.x_axis.value = 'species'
    c_4.output_name.value = 'pinguin_distribution.png'

    c_1.next = c_2
    c_2.next = c_3
    c_3.next = c_4
    c_4.next = None

    next_component = c_1.do()
    while next_component:
        next_component = next_component.do()

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--experiment_name', default=datetime.now().strftime("%Y-%m-%d %H:%M:%S"), type=str)
    main(parser.parse_args())
from argparse import ArgumentParser
from datetime import datetime
from xai_spark.pyspark_core import xSparkSession
from xai_spark.pyspark_mllib import SparkLoadLIBSVM
from xai_spark.pyspark_mllib import SparkSplitDataFrame
from xai_spark.pyspark_mllib import SparkLogisticRegression
from xai_spark.pyspark_mllib import SparkPredict

def main(args):
    c_1 = xSparkSession()
    c_2 = SparkLoadLIBSVM()
    c_3 = SparkSplitDataFrame()
    c_4 = SparkLogisticRegression()
    c_5 = SparkPredict()

    c_2.in_sparksession = c_1.sparksession
    c_2.file_input.value = 'Datasets/sample_libsvm_data.txt'
    c_3.in_dataframe = c_2.out_dataframe
    c_3.train_split.value = 0.8
    c_4.train_dataframe = c_3.train_dataframe
    c_4.family.value = 'multinomial'
    c_5.model = c_4.model
    c_5.test_df = c_3.test_dataframe

    c_1.next = c_2
    c_2.next = c_3
    c_3.next = c_4
    c_4.next = c_5
    c_5.next = None

    next_component = c_1.do()
    while next_component:
        next_component = next_component.do()

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--experiment_name', default=datetime.now().strftime("%Y-%m-%d %H:%M:%S"), type=str)
    main(parser.parse_args())
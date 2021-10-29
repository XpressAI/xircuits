from pyspark.sql import SparkSession
from datetime import datetime, date
import pandas as pd
from pyspark.sql import Row

from xai_components.base import InArg, OutArg, Component
import json
import os
import sys


# os.environ['PYSPARK_PYTHON'] = sys.executable
# os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable

class xSparkSession(Component):
    master: InArg[str]  #master("local")
    appName: InArg[str] #appName("Word Count")
    config: InArg[str]  #config("spark.some.config.option", "some-value")
    sparkSession: OutArg[any]

    def __init__(self):

        self.master = InArg(None)
        self.appName = InArg(None)
        self.config = InArg(None)
        self.sparksession = OutArg(None)


    def execute(self) -> None:

        spark = SparkSession.builder.getOrCreate()
        self.sparksession.value = spark


class SparkReadPandas(Component):
    
    in_sparksession: InArg[any]
    pandas_dataframe: InArg[str]
    out_sparksession: OutArg[any]

    def __init__(self):

        self.in_sparksession = InArg(None)
        self.pandas_dataframe = InArg(None)
        self.out_sparksession = OutArg(None)

    def execute(self) -> None:

        spark = self.in_sparksession.value

        pandas_df = pd.DataFrame({
            'a': [1, 2, 3],
            'b': [2., 3., 4.],
            'c': ['string1', 'string2', 'string3'],
            'd': [date(2000, 1, 1), date(2000, 2, 1), date(2000, 3, 1)],
            'e': [datetime(2000, 1, 1, 12, 0), datetime(2000, 1, 2, 12, 0), datetime(2000, 1, 3, 12, 0)]
        })
        df = spark.createDataFrame(pandas_df)
        df

        df.write.csv('foo.csv', header=True)
        spark.read.csv('foo.csv', header=True).show()



class SparkReadFile(Component):
    
    in_sparksession: InArg[any]
    file_input: InArg[str]
    header: InArg[bool]
    out_sparksession: OutArg[any]

    def __init__(self):

        self.in_sparksession = InArg(None)
        self.file_input = InArg(None)
        self.header = InArg(None)
        self.out_sparksession = OutArg(None)

    def execute(self) -> None:

        spark = self.in_sparksession.value
        filename = self.file_input.value
        ext = filename.split(".")[-1]

        if ext == "csv":
            spark.read.csv(filename, header=True).show()
        elif ext == "parquet":
            spark.read.parquet(filename).show()
        elif ext == "orc":
            spark.read.orc(filename).show()
        else:
            print("Unrecognized file format! Please input csv / parquet / orc ")

        self.sparksession = spark


class SparkWriteFile(Component):
    
    dataframe: InArg[any]
    file_output: InArg[str]
    header: InArg[bool]
    out_sparksession: OutArg[any]

    def __init__(self):

        self.dataframe = InArg(None)
        self.file_output = InArg(None)
        self.header = InArg(None)
        self.out_sparksession = OutArg(None)

    def execute(self) -> None:

        df = self.dataframe.value
        filename = self.file_output.value
        ext = filename.split(".")[-1]

        if ext == "csv":
            df.write.csv(filename, header=True)
        elif ext == "parquet":
            df.write.parquet(filename)
        elif ext == "orc":
            df.write.orc(filename)
        else:
            print("Unrecognized file format! Please input csv / parquet / orc ")
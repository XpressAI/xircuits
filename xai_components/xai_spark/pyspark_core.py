from pyspark.sql import SparkSession
from pyspark.sql import Row

from datetime import datetime, date
import pandas as pd
import matplotlib.pyplot as plt

from xai_components.base import InArg, OutArg, Component, xai_component
import json
import os
import sys


os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable

@xai_component
class xSparkSession(Component):
    master: InArg[str]  #master("local")
    appname: InArg[str] #appName("Word Count")
    config: InArg[str]  #config("spark.some.config.option", "some-value")
    sparksession: OutArg[any]

    def __init__(self):

        self.done = False
        self.master = InArg(None)
        self.appname = InArg(None)
        self.config = InArg(None)
        self.sparksession = OutArg(None)


    def execute(self) -> None:

        spark = SparkSession.builder.getOrCreate()
        self.sparksession.value = spark
        self.done = True


@xai_component
class SparkReadPandas(Component):

    in_sparksession: InArg[any]
    pandas_dataframe: InArg[str]
    out_sparksession: OutArg[any]
    out_dataframe: OutArg[any]


    def __init__(self):

        self.done = False
        self.in_sparksession = InArg(None)
        self.pandas_dataframe = InArg(None)
        self.out_sparksession = OutArg(None)

    def execute(self) -> None:

        spark = self.in_sparksession.value
        df = self.pandas_dataframe.value
        spark_df = spark.createDataFrame(df)
        spark_df.show()

        self.out_sparksession.value = spark
        self.out_dataframe.value = spark_df

        self.done = True

@xai_component
class SparkReadFile(Component):

    in_sparksession: InArg[any]
    file_input: InArg[str]
    out_sparksession: OutArg[any]
    out_dataframe: OutArg[any]

    def __init__(self):

        self.done = False
        self.in_sparksession = InArg(None)
        self.file_input = InArg(None)
        self.out_sparksession = OutArg(None)
        self.out_dataframe = OutArg(None)


    def execute(self) -> None:

        spark = self.in_sparksession.value
        filepath = self.file_input.value
        ext = filepath.split(".")[-1]

        if ext == "csv":
            df = spark.read.load(filepath,
                     format="csv", sep=",", inferSchema="true", header="true")
            df.show()

        elif ext == "parquet":
            df = spark.read.load(filepath)
            df.show()

        elif ext == "orc":
            df = spark.read.orc(filepath)
            df.show()

        elif ext == "json":
            df = spark.read.load("filepath", format="json")

        else:
            print("Unrecognized file format! Please input json / csv / parquet / orc ")

        self.out_sparksession.value = spark
        self.out_dataframe.value = df
        self.done = True


@xai_component
class SparkReadCSV(Component):

    in_sparksession: InArg[any]
    file_input: InArg[str]
    separator: InArg[str]
    header: InArg[str]
    out_sparksession: OutArg[any]
    out_dataframe: OutArg[any]

    def __init__(self):

        self.done = False
        self.in_sparksession = InArg(None)
        self.file_input = InArg(None)
        self.separator = InArg(None)
        self.header = InArg(None)
        self.out_sparksession = OutArg(None)
        self.out_dataframe = OutArg(None)


    def execute(self) -> None:

        spark = self.in_sparksession.value
        filepath = self.file_input.value

        sep = self.separator.value if self.separator.value else ","
        header = self.header.value if self.header.value else "true"
        
        df = spark.read.load(filepath,
                 format="csv", sep=sep, inferSchema="true", header=header)

        df.show()

        self.out_sparksession.value = spark
        self.out_dataframe.value = df
        self.done = True


@xai_component
class SparkWriteFile(Component):

    dataframe: InArg[any]
    output_name: InArg[str]
    header: InArg[bool]
    out_sparksession: OutArg[any]

    def __init__(self):

        self.done = False
        self.dataframe = InArg(None)
        self.output_name = InArg(None)
        self.header = InArg(None)
        self.out_sparksession = OutArg(None)

    def execute(self) -> None:

        df = self.dataframe.value
        filepath = self.output_name.value
        ext = filepath.split(".")[-1]

        if ext == "csv":
            df.write.csv(filepath, header=True)
        elif ext == "parquet":
            df.write.parquet(filepath)
        elif ext == "orc":
            df.write.orc(filepath)
        else:
            print("Unrecognized file format! Please input csv / parquet / orc.")

        self.done = True

@xai_component
class SparkSQL(Component):

    in_sparksession: InArg[any]
    dataframe: InArg[any]
    table_name: InArg[str]
    sql_string: InArg[str]
    out_sparksession: OutArg[any]
    sql_dataframe: OutArg[any]


    def __init__(self):

        self.done = False
        self.in_sparksession = InArg(None)
        self.dataframe = InArg(None)
        self.table_name = InArg(None)

        self.sql_string = InArg(None)
        self.out_sparksession = OutArg(None)
        self.sql_dataframe = OutArg(None)

    def execute(self) -> None:

        spark = self.in_sparksession.value
        df = self.dataframe.value
        sql_string = self.sql_string.value
        table_name = self.table_name.value if self.table_name.value else ""

        if table_name:
            df.createOrReplaceTempView(table_name)

        else:
            #handler if user does not specify table name
            df.createOrReplaceTempView("tableA")
            sql_string = sql_string + " FROM tableA"
        
        sql_df = spark.sql(sql_string)
        sql_df.show()
        
        self.out_sparksession.value = spark
        self.sql_dataframe.value = sql_df
        self.done = True

@xai_component
class SparkVisualize(Component):

    dataframe: InArg[any]
    plot_type: InArg[str]
    x_axis: InArg[str]
    y_axis: InArg[str]
    output_name: InArg[str]

    def __init__(self):
        
        self.done = False
        self.dataframe = InArg(None)
        self.plot_type = InArg(None)
        self.x_axis = InArg(None)
        self.y_axis = InArg(None)    
        self.output_name = InArg(None)    


    def execute(self) -> None:

        df = self.dataframe.value
        plot_type = self.plot_type.value if self.plot_type.value else "bar"
        output_name = self.output_name.value if self.output_name.value else "visual.png"
        x_axis = self.x_axis.value
        y_axis = self.y_axis.value

        pd_df = df.toPandas()

        if plot_type == 'bar':
            pd_df[x_axis].value_counts().plot(kind='bar')

        elif plot_type == 'scatter':
            pd_df.plot(x=x_axis, y=y_axis, kind = 'scatter')    

        elif plot_type == 'line':

            pd_df.plot(x=x_axis, y=y_axis, kind = 'line')    
        
        plt.tight_layout()
        plt.savefig(output_name)
        plt.show()
        self.done = True

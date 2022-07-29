from pyspark.sql import SparkSession
from pyspark.sql import Row

from datetime import datetime, date
import matplotlib.pyplot as plt

from xai_components.base import InArg, InCompArg, OutArg, Component, xai_component
import json
import os
import sys


os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable

@xai_component
class xSparkSession(Component):
    """Instantiates a Spark Session.
  
    ##### inPorts:
    - master: Cluster URL to connect to (e.g. mesos://host:port, spark://host:port, local[4]). 
        Default: `local`.
    - appname: A name for your job, to display on the cluster web UI.
        Default: .xircuits canvas name.
    - config: Runtime configuration interface for Spark.
        Default: `" "`.

    ##### outPorts:
    - sparksession: A spark session instance.
    """

    master: InArg[str]  
    appname: InArg[str]
    config: InArg[str]
    sparksession: OutArg[any]

    def __init__(self):

        self.done = False
        self.master = InArg(None)
        self.appname = InArg(None)
        self.config = InArg(None)
        self.sparksession = OutArg(None)


    def execute(self, ctx) -> None:

        master_url = self.master.value if self.master.value else "local"
        app_name = self.appname.value if self.appname.value else os.path.splitext(sys.argv[0])[0]
        config = self.config.value if self.config.value else " "

        if self.master.value or self.config.value:
            spark = SparkSession.builder.master(master_url) \
                                .appName(app_name) \
                                .config(config) \
                                .getOrCreate()

        else:
            spark = SparkSession.builder.getOrCreate()
        
        self.sparksession.value = spark
        self.done = True


@xai_component
class SparkReadPandas(Component):
    """Creates a Spark df from a pandas df.
  
    ##### inPorts:
    - in_sparksession: A spark session.
    - pandas_dataframe: pandas dataframe.

    ##### outPorts:
    - out_sparksession: A spark session.
    - out_dataframe: A spark dataframe.
    """

    in_sparksession: InCompArg[any]
    pandas_dataframe: InCompArg[any]
    out_sparksession: OutArg[any]
    out_dataframe: OutArg[any]


    def __init__(self):

        self.done = False
        self.in_sparksession = InCompArg(None)
        self.pandas_dataframe = InCompArg(None)
        self.out_sparksession = OutArg(None)
        self.out_dataframe = OutArg(None)


    def execute(self, ctx) -> None:

        spark = self.in_sparksession.value
        df = self.pandas_dataframe.value
        spark_df = spark.createDataFrame(df)
        spark_df.show()

        self.out_sparksession.value = spark
        self.out_dataframe.value = spark_df

        self.done = True

@xai_component
class SparkReadFile(Component):
    """Reads a Spark supported file format (json / csv / parquet / orc ) 
    and outputs a Spark dataframe.

    ##### inPorts:
    - in_sparksession: A spark session.
    - file_input: a Spark supported file format (json / csv / parquet / orc ) filepath.

    ##### outPorts:
    - out_sparksession: A spark session.
    - out_dataframe: A spark dataframe.
    """
    in_sparksession: InCompArg[any]
    file_input: InCompArg[str]
    out_sparksession: OutArg[any]
    out_dataframe: OutArg[any]

    def __init__(self):

        self.done = False
        self.in_sparksession = InCompArg(None)
        self.file_input = InCompArg(None)
        self.out_sparksession = OutArg(None)
        self.out_dataframe = OutArg(None)


    def execute(self, ctx) -> None:

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
    """Reads a csv and outputs a Spark dataframe.

    ##### inPorts:
    - in_sparksession: a spark session.
    - file_input: a csv filepath.
    - separator: the data separator in csv. Default `,`.
    - header: bool whether csv has headers. Default `True`.

    ##### outPorts:
    - out_sparksession: A spark session.
    - out_dataframe: A spark dataframe.
    """
    in_sparksession: InCompArg[any]
    file_input: InCompArg[str]
    separator: InArg[str]
    header: InArg[bool]
    out_sparksession: OutArg[any]
    out_dataframe: OutArg[any]

    def __init__(self):

        self.done = False
        self.in_sparksession = InCompArg(None)
        self.file_input = InCompArg(None)
        self.separator = InArg(None)
        self.header = InArg(True)
        self.out_sparksession = OutArg(None)
        self.out_dataframe = OutArg(None)


    def execute(self, ctx) -> None:

        spark = self.in_sparksession.value
        filepath = self.file_input.value

        sep = self.separator.value if self.separator.value else ","
        header = self.header.value
        
        df = spark.read.load(filepath,
                 format="csv", sep=sep, inferSchema="true", header=header)

        df.show()

        self.out_sparksession.value = spark
        self.out_dataframe.value = df
        self.done = True


@xai_component
class SparkWriteFile(Component):
    """Writes a Spark dataframe to disk in supported output format (csv / parquet / orc).

    ##### inPorts:
    - dataframe: A Spark dataframe.
    - output_name: desired output name. The format will be inferred from the extension.
        Currently supports `csv` / `parquet` / `orc` file format.
    - header: bool whether csv has headers. Default `True`.

    ##### outPorts:
    - out_sparksession: A spark session.
    """
    dataframe: InCompArg[any]
    output_name: InCompArg[str]
    header: InArg[bool]
    out_sparksession: OutArg[any]

    def __init__(self):

        self.done = False
        self.dataframe = InCompArg(None)
        self.output_name = InCompArg(None)
        self.header = InArg(True)
        self.out_sparksession = OutArg(None)

    def execute(self, ctx) -> None:

        df = self.dataframe.value
        filepath = self.output_name.value
        header = self.header.value
        ext = filepath.split(".")[-1]

        if ext == "csv":
            df.write.csv(filepath, header=header)
        elif ext == "parquet":
            df.write.parquet(filepath)
        elif ext == "orc":
            df.write.orc(filepath)
        else:
            print("Unrecognized file format! Please input csv / parquet / orc.")

        self.done = True

@xai_component
class SparkSQL(Component):
    """Performs a SparkSQL query to obtain a Spark dataframe.

    ##### inPorts:
    - in_sparksession: A spark session.
    - dataframe: a Spark dataframe.
    - sql_string: a SQL query to be performed on the dataframe.
    - table_name: specify a table name if not already created by createOrReplaceTempView.

    ##### outPorts:
    - out_sparksession: A spark session.
    - sql_dataframe: the Spark dataframe obtained from the SQL query.
    """
    in_sparksession: InCompArg[any]
    dataframe: InCompArg[any]
    sql_string: InCompArg[str]
    table_name: InArg[str]

    out_sparksession: OutArg[any]
    sql_dataframe: OutArg[any]


    def __init__(self):

        self.done = False
        self.in_sparksession = InCompArg(None)
        self.dataframe = InCompArg(None)
        self.sql_string = InCompArg(None)
        self.table_name = InArg(None)

        self.out_sparksession = OutArg(None)
        self.sql_dataframe = OutArg(None)

    def execute(self, ctx) -> None:

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
    """Visualizes a Spark dataframe.

    ##### inPorts:
    - dataframe: a Spark dataframe.
    - plot_type: the type of plot to be generated. Currently support `bar`, `scatter` and `line` plots. 
        Default `bar` chart.
    - x_axis: the X axis / variable to be visualized.
    - y_axis:the Y axis to be benchmarked on. 
        Default is `None`, which means it will visualize based on raw numbers. 
    - output_name: the chart name to be saved as `visual.png`

    """
    dataframe: InCompArg[any]
    plot_type: InArg[str]
    x_axis: InCompArg[str]
    y_axis: InArg[str]
    output_name: InArg[str]

    def __init__(self):
        
        self.done = False
        self.dataframe = InCompArg(None)
        self.plot_type = InArg(None)
        self.x_axis = InCompArg(None)
        self.y_axis = InArg(None)    
        self.output_name = InArg(None)    


    def execute(self, ctx) -> None:
        
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

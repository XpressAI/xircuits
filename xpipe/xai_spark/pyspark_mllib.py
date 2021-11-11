from pyspark.ml.classification import LogisticRegression

from datetime import datetime, date
import pandas as pd
import matplotlib.pyplot as plt

from xai_components.base import InArg, OutArg, Component
import json
import os
import sys

os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable

class SparkLoadImageFolder(Component):
    in_sparksession: InArg[any]
    folder_path: InArg[str]
    out_sparksession: OutArg[any]
    out_dataframe: OutArg[any]

    def __init__(self):

        self.in_sparksession = InArg(None)
        self.folder_path = InArg(None)
        self.out_sparksession = OutArg(None)
        self.out_dataframe = OutArg(None)


    def execute(self) -> None:

        spark = self.in_sparksession.value
        folder_path = self.folder_path.value

        df = spark.read.format("image").option("dropInvalid", True).load(folder_path)
        df.show()

        self.out_sparksession.value = spark
        self.out_dataframe.value = df


class SparkLoadLIBSVM(Component):
    
    in_sparksession: InArg[any]
    file_input: InArg[str]
    options: InArg[str]
    out_sparksession: OutArg[any]
    out_dataframe: OutArg[any]

    def __init__(self):

        self.in_sparksession = InArg(None)
        self.file_input = InArg(None)
        self.options = InArg(None)

        self.out_sparksession = OutArg(None)
        self.out_dataframe = OutArg(None)


    def execute(self) -> None:

        spark = self.in_sparksession.value
        filepath = self.file_input.value
        options = self.options.value if self.options.value else ""

        if options:
            df = spark.read.format("libsvm").option(*options).load(filepath)
        
        else:
            df = spark.read.format("libsvm").load(filepath)

        df.show()

        self.out_sparksession.value = spark
        self.out_dataframe.value = df


class SparkLogisticRegression(Component):

    train_dataframe: InArg[str]
    family: InArg[str]
    options: InArg[dict]

    model: OutArg[any]

    def __init__(self):

        self.train_dataframe = InArg(None)
        self.family = InArg(None)
        self.options = InArg(None)

        self.model = OutArg(None)


    def execute(self) -> None:

        training = self.train_dataframe.value
        options = self.options.value if self.options.value else {maxIter:10, regParam:0.3, elasticNetParam:0.8}
        if self.family.value:
            #You may try "multinomial" 
            options.update({'family': self.family.value})
        lr = LogisticRegression(**options)

        # Fit the model
        lrModel = lr.fit(training)

        # Print the coefficients and intercept for logistic regression
        print("Coefficients: " + str(lrModel.coefficients))
        print("Intercept: " + str(lrModel.intercept))

        self.model.value = lrModel


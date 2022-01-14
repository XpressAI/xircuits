from pyspark.mllib.linalg import SparseVector
from pyspark.mllib.regression import LabeledPoint
from pyspark.ml.classification import LogisticRegression

from datetime import datetime, date
import pandas as pd
import matplotlib.pyplot as plt

from xai_components.base import InArg, OutArg, Component, xai_component
import json
import os
import sys

os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable


#This should be treated as a parameter component in the future
@xai_component
class SparkSparseVector(Component):
    vector_list: InArg[list]
    sparse_vector: OutArg[any]

    def __init__(self):

        self.done = False
        self.vector_list = InArg(None)
        self.sparse_vector = OutArg(None)

    def execute(self) -> None:

        vector_list = self.vector_list.value

        sparse_vector = SparseVector(*vector_list)
        sparse_vector

        self.sparse_vector.value = sparse_vector
        self.done = True


@xai_component
class SparkLabeledPoint(Component):
    label: InArg[float]
    dense_vector: InArg[list]
    sparse_vector: InArg[any]

    labeled_point: OutArg[any]


    def __init__(self):

        self.done = False
        self.label = InArg(None)
        self.dense_vector = InArg(None)
        self.sparse_vector = InArg(None)

        self.labeled_point = OutArg(None)

    def execute(self) -> None:

        label = self.label.value
        vector = self.dense_vector.value if self.dense_vector.value else self.sparse_vector.value

        labeled_point = LabeledPoint(label, vector)
        print(labeled_point)

        self.labeled_point.value = labeled_point
        self.done = True


@xai_component
class SparkLoadImageFolder(Component):
    in_sparksession: InArg[any]
    folder_path: InArg[str]
    out_sparksession: OutArg[any]
    out_dataframe: OutArg[any]

    def __init__(self):

        self.done = False
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

        self.done = True

@xai_component
class SparkSplitDataFrame(Component):
    
    in_dataframe: InArg[any]
    train_split: InArg[float]
    test_split: InArg[float]
    seed: InArg[int]

    train_dataframe: OutArg[any]
    test_dataframe: OutArg[any]


    def __init__(self):

        self.done = False
        self.in_dataframe = InArg(None)
        self.train_split = InArg(None)
        self.test_split = InArg(None)
        self.seed = InArg(None)

        self.train_dataframe = OutArg(None)
        self.test_dataframe = OutArg(None)



    def execute(self) -> None:

        df = self.in_dataframe.value
        seed = self.seed.value if self.seed.value else None

        train_split = self.train_split.value if self.train_split.value else ""
        test_split = self.test_split.value if self.test_split.value else (1 - train_split)

        #handle if user only provides test split
        if not train_split:
            train_split = 1 - test_split

        train, test = df.randomSplit(weights=[train_split,test_split], seed=seed)

        print("Train Split")
        train.show()
        print("Test Split")
        test.show()

        self.train_dataframe.value = train
        self.test_dataframe.value = test
        self.done = True


@xai_component
class SparkLoadLIBSVM(Component):
    
    in_sparksession: InArg[any]
    file_input: InArg[str]
    options: InArg[str]
    out_sparksession: OutArg[any]
    out_dataframe: OutArg[any]

    def __init__(self):

        self.done = False
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
        self.done = True


@xai_component
class SparkLogisticRegression(Component):

    train_dataframe: InArg[any]
    family: InArg[str]
    options: InArg[dict]

    model: OutArg[any]

    def __init__(self):

        self.done = False
        self.train_dataframe = InArg(None)
        self.family = InArg(None)
        self.options = InArg(None)

        self.model = OutArg(None)


    def execute(self) -> None:

        training = self.train_dataframe.value
        options = self.options.value if self.options.value else {"maxIter":10, "regParam":0.3, "elasticNetParam":0.8}
        if self.family.value:
            #You may try "multinomial" 
            options.update({"family": self.family.value})
        lr = LogisticRegression(**options)

        # Fit the model
        model = lr.fit(training)

        if (model.getFamily() == "multinomial"):
            # Print the coefficients and intercepts for logistic regression with multinomial family
            print("Multinomial coefficients: " + str(model.coefficientMatrix))
            print("Multinomial intercepts: " + str(model.interceptVector))

        else:
            # Print the coefficients and intercept for logistic regression
            print("Coefficients: " + str(model.coefficients))
            print("Intercept: " + str(model.intercept))

        self.model.value = model
        self.done = True


@xai_component
class SparkPredict(Component):

    model: InArg[any]
    test_df: InArg[any]

    def __init__(self):

        self.done = False
        self.model = InArg(None)
        self.test_df = InArg(None)

    def execute(self) -> None:

        model = self.model.value
        test = self.test_df.value
        test_result = model.evaluate(test)

        test_result.predictions.show()

        self.done = True

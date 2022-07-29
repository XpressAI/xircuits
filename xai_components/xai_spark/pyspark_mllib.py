from xai_components.base import InArg, InCompArg, OutArg, Component, xai_component
import os
import sys

os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable


#This should be treated as a parameter component in the future
@xai_component
class SparkSparseVector(Component):
    """Turns a List into a sparse vector.
    ie: sparse_vector = SparseVector(4, [1, 3], [3.0, 4.0])
    
    ### Reference:
    - [Spark Sparse Vector](https://spark.apache.org/docs/latest/api/python/reference/api/pyspark.mllib.linalg.SparseVector.html)

    ##### inPorts:
    - vector_list: List to turn into sparse vector

    ##### outPorts:
    - sparse_vector: the converted sparse vector
    """
    vector_list: InCompArg[list]
    sparse_vector: OutArg[sparse_vector]

    def __init__(self):

        self.done = False
        self.vector_list = InCompArg(None)
        self.sparse_vector = OutArg(None)

    def execute(self, ctx) -> None:
        
        from pyspark.mllib.linalg import SparseVector

        vector_list = self.vector_list.value

        sparse_vector = SparseVector(*vector_list)
        sparse_vector

        self.sparse_vector.value = sparse_vector
        self.done = True


@xai_component
class SparkLabeledPoint(Component):
    """Creates a labeled point from a dense OR sparse vector.
    A dense vector can be created by supplying a list.
    A sparse vector can be passed from the SparkSparseVector component.
    Only the **sparse vector** input will be used if both are supplied.

    ### Reference:
    - [Spark Labeled Point](https://spark.apache.org/docs/latest/mllib-data-types.html#labeled-point)

    ##### inPorts:
    - label: Label for this data point.
    - dense_vector: can be created by supplying a Literal List.
    - sparse_vector: can be passed from the SparkSparseVector component.

    ##### outPorts:
    - labeled_point: a spark labeled point.
    """

    label: InCompArg[float]
    dense_vector: InArg[list]
    sparse_vector: InArg[sparse_vector]

    labeled_point: OutArg[any]


    def __init__(self):

        self.done = False
        self.label = InCompArg(None)
        self.dense_vector = InArg(None)
        self.sparse_vector = InArg(None)

        self.labeled_point = OutArg(None)

    def execute(self, ctx) -> None:
        
        from pyspark.mllib.regression import LabeledPoint

        label = self.label.value
        vector = self.dense_vector.value if self.dense_vector.value else self.sparse_vector.value

        labeled_point = LabeledPoint(label, vector)
        print(labeled_point)

        self.labeled_point.value = labeled_point
        self.done = True


@xai_component
class SparkLoadImageFolder(Component):
    """Loads an image directory as a Spark dataframe.

    ### Reference:
    - [Spark Image Data Source](https://spark.apache.org/docs/latest/ml-datasource.html#image-data-source)

    ##### inPorts:
    - in_sparksession: a spark session.
    - folder_path: path of the image directory

    ##### outPorts:
    - out_sparksession: a spark session.
    - out_dataframe: dataframe that contains the image directory information.
    """
    in_sparksession: InCompArg[any]
    folder_path: InCompArg[str]

    out_sparksession: OutArg[any]
    out_dataframe: OutArg[any]

    def __init__(self):

        self.done = False
        self.in_sparksession = InCompArg(None)
        self.folder_path = InCompArg(None)

        self.out_sparksession = OutArg(None)
        self.out_dataframe = OutArg(None)


    def execute(self, ctx) -> None:

        spark = self.in_sparksession.value
        folder_path = self.folder_path.value

        df = spark.read.format("image").option("dropInvalid", True).load(folder_path)
        df.show()

        self.out_sparksession.value = spark
        self.out_dataframe.value = df

        self.done = True

@xai_component
class SparkSplitDataFrame(Component):
    """Split a spark dataframe into train and test splits.

    ### Reference:
    - [Spark DataFrame Random Split](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.randomSplit.html)

    ##### inPorts:
    - in_dataframe: a Spark DataFrame.
    - train_split: the train split. 
        Default `0.75`.
    - seed: the seed for sampling.

    ##### outPorts:
    - train_dataframe: the DataFrame that contains the train split.
    - test_dataframe: the DataFrame that contains the test split.
    """
    in_dataframe: InArg[any]
    train_split: InArg[float]
    seed: InArg[int]

    train_dataframe: OutArg[any]
    test_dataframe: OutArg[any]


    def __init__(self):

        self.done = False
        self.in_dataframe = InArg(None)
        self.train_split = InArg(None)
        self.seed = InArg(None)

        self.train_dataframe = OutArg(None)
        self.test_dataframe = OutArg(None)



    def execute(self, ctx) -> None:

        df = self.in_dataframe.value
        seed = self.seed.value if self.seed.value else None

        train_split = self.train_split.value if self.train_split.value else 0.75

        #handle if user only provides test split

        train, test = df.randomSplit(weights=[train_split, (1 - train_split)], seed=seed)

        print("Train Split")
        train.show()
        print("Test Split")
        test.show()

        self.train_dataframe.value = train
        self.test_dataframe.value = test
        self.done = True


@xai_component
class SparkLoadLIBSVM(Component):
    """Loads a libsvm file into a Spark dataframe.

    ##### inPorts:
    - in_sparksession: a spark session.
    - file_input: the path for the libsvm file.

    ##### outPorts:
    - out_sparksession: a spark session.
    - out_dataframe: DataFrame loaded from the libsvm.
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
    """Performs Spark Logistic Regression.

    ### Reference:
    - [Spark Logistic Regression](https://spark.apache.org/docs/3.3.0/ml-classification-regression.html#logistic-regression)
    
    ##### inPorts:
    - train_dataframe: a Spark dataframe.
    - family: regression mode.
        Default: `auto`. Alternative: `binomial` or `multinomial`.
    - options: Regression parameters. Supply parameters as a Dict. 
        Default: `maxIter`:10, `regParam`:0.3, `elasticNetParam`:0.8

    ##### outPorts:
    - model: trained Spark regression model.
    """    
    train_dataframe: InCompArg[any]
    family: InArg[str]
    options: InArg[dict]

    model: OutArg[any]

    def __init__(self):

        self.done = False
        self.train_dataframe = InCompArg(None)
        self.family = InArg(None)
        self.options = InArg(None)

        self.model = OutArg(None)


    def execute(self, ctx) -> None:

        from pyspark.ml.classification import LogisticRegression

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
    """Performs prediction given a Spark model and a valid corresponding dataset.
    Recommended to use with SparkSplitDataFrame component.

    ##### inPorts:
    - model: trained Spark  model.
    - test_df: Spark dataframe.

    """    
    model: InCompArg[any]
    test_df: InCompArg[any]

    def __init__(self):

        self.done = False
        self.model = InCompArg(None)
        self.test_df = InCompArg(None)

    def execute(self, ctx) -> None:

        model = self.model.value
        test = self.test_df.value
        test_result = model.evaluate(test)

        test_result.predictions.show()

        self.done = True

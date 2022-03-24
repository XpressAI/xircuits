from xai_components.base import InArg, OutArg, Component, xai_component


@xai_component
class GetData(Component):
    dataset: InArg[str]  #Name of the datset
    save_copy: InArg[bool] #When set to true, it saves a copy in current working directory.
    verbose: InArg[bool]  #When set to False, head of data is not displayed.
    
    out_dataset : OutArg[any]

    def __init__(self):

        self.done = False
        self.dataset = InArg(None)
        self.save_copy = InArg(None)
        self.verbose = InArg(None)
        
        self.out_dataset = OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.datasets import get_data

        dataset = self.dataset.value
        save_copy = self.save_copy.value
        verbose = self.verbose.value

        if dataset is None:
            dataset = "index"
            print("Please choose a dataset...")
        if  save_copy is None:
             save_copy = False
        if verbose is None:
            verbose = True

        load_dataset = get_data(dataset = dataset, save_copy=save_copy, verbose = verbose)
        print('Dataset shape: ' + str(load_dataset.shape))

        self.out_dataset.value = load_dataset

        self.done = True



@xai_component
class SampleTestData(Component):
    in_dataset: InArg[any] 
    test_fraction: InArg[float] #Fraction of dataset row to return.
    seed : InArg[int] #You can use random_state for reproducibility.

    train_val_dataset : OutArg[any]
    test_Dataset: OutArg[any]  
    

    def __init__(self):

        self.done = False
        self.in_dataset = InArg(None)
        self.test_fraction = InArg(None)
        self.seed = InArg(None)
        
        self.train_val_dataset = OutArg(None)
        self.test_Dataset = OutArg(None)

    def execute(self, ctx) -> None:

        in_dataset = self.in_dataset.value
        test_fraction = self.test_fraction.value
        seed = self.seed.value

        if  test_fraction is None:
            test_fraction = 0
        if seed is None:
            print("Set the seed value for reproducibility.")

        train_val_dataset = in_dataset.sample(frac=1-test_fraction, random_state=seed)
        test_Dataset = in_dataset.drop(train_val_dataset.index)

        print('Data for Modeling: ' + str(train_val_dataset.shape))
        print('Test Data For Predictions: ' + str(test_Dataset.shape))

        self.train_val_dataset.value = train_val_dataset
        self.test_Dataset.value = test_Dataset

        self.done = True


@xai_component
class SetupPyCaretEnvironment(Component):
    in_dataset: InArg[any] 
    target: InArg[str] #Binary or Multiclass. The Target type is automatically detected and shown.
    train_size_fraction : InArg[float] #Fraction of training dataset.
    seed : InArg[int] #You can use random_state for reproducibility.


    def __init__(self):

        self.done = False
        self.in_dataset = InArg(None)
        self.target = InArg(None)
        self.train_size_fraction = InArg(None)
        self.seed = InArg(None)

    def execute(self, ctx) -> None:

        from pycaret.classification import setup

        in_dataset = self.in_dataset.value
        target = self.target.value
        train_size_fraction = self.train_size_fraction.value
        seed = self.seed.value

        if  target is None:
            target = 'default'
        if  train_size_fraction is None:
            train_size_fraction = 1    
        if seed is None:
            print("Set the seed value for reproducibility.")

        setup_pycaret = setup(data = in_dataset, target = target,train_size=train_size_fraction,session_id=seed,silent=True)

        self.done = True



@xai_component
class CompareModels(Component):
    sort_by:InArg[str]

    def __init__(self):

        self.done = False
        self.sort_by = InArg(None)

    def execute(self, ctx) -> None:

        from pycaret.classification import compare_models , models 
    
        sort_by = self.sort_by.value

        if sort_by is None:
            sort_by = 'Accuracy'

        best_model = compare_models(sort=sort_by)

        self.done = True


@xai_component
class CreateModel(Component):
    model_id:InArg[str]
    num_fold:InArg[int]

    out_created_model:OutArg[any]

    def __init__(self):

        self.done = False
        self.model_id = InArg(None)
        self.num_fold = InArg(None)

        self.out_created_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.classification import create_model 
    
        model_id = self.model_id.value
        num_fold = self.num_fold.value

        if model_id is None:
            model_id = 'lr'
        if num_fold is None:
            num_fold = 10

        created_model = create_model(estimator = model_id, fold = num_fold)
        print(created_model)

        self.out_created_model.value = created_model

        self.done = True



@xai_component
class TuneModel(Component):
    in_created_model:InArg[any]
    early_stopping_patience:InArg[int]
    num_fold:InArg[int]
    n_iter:InArg[int]

    out_tuned_model:OutArg[any]

    def __init__(self):

        self.done = False
        self.in_created_model = InArg(None)
        self.early_stopping_patience = InArg(None)
        self.num_fold = InArg(None)
        self.n_iter = InArg(None)


        self.out_tuned_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.classification import tune_model 
    
        in_created_model = self.in_created_model.value
        patience = self.early_stopping_patience.value
        num_fold = self.num_fold.value
        n_iter = self.n_iter.value

        if patience is None:
            early_stopping=False
            patience = 10
        else:
            early_stopping=True
            patience=patience

        if num_fold is None:
            num_fold = 10
        if n_iter is None:
            n_iter = 10

        tuned_model = tune_model(estimator = in_created_model,fold= num_fold,n_iter=n_iter,early_stopping=early_stopping,early_stopping_max_iters=patience)

        self.out_tuned_model.value = tuned_model

        self.done = True



# @xai_component
# class SparkReadPandas(Component):

#     in_sparksession: InArg[any]
#     pandas_dataframe: InArg[str]
#     out_sparksession: OutArg[any]
#     out_dataframe: OutArg[any]


#     def __init__(self):

#         self.done = False
#         self.in_sparksession = InArg(None)
#         self.pandas_dataframe = InArg(None)
#         self.out_sparksession = OutArg(None)

#     def execute(self, ctx) -> None:

#         spark = self.in_sparksession.value
#         df = self.pandas_dataframe.value
#         spark_df = spark.createDataFrame(df)
#         spark_df.show()

#         self.out_sparksession.value = spark
#         self.out_dataframe.value = spark_df

#         self.done = True

# @xai_component
# class SparkReadFile(Component):

#     in_sparksession: InArg[any]
#     file_input: InArg[str]
#     out_sparksession: OutArg[any]
#     out_dataframe: OutArg[any]

#     def __init__(self):

#         self.done = False
#         self.in_sparksession = InArg(None)
#         self.file_input = InArg(None)
#         self.out_sparksession = OutArg(None)
#         self.out_dataframe = OutArg(None)


#     def execute(self, ctx) -> None:

#         spark = self.in_sparksession.value
#         filepath = self.file_input.value
#         ext = filepath.split(".")[-1]

#         if ext == "csv":
#             df = spark.read.load(filepath,
#                      format="csv", sep=",", inferSchema="true", header="true")
#             df.show()

#         elif ext == "parquet":
#             df = spark.read.load(filepath)
#             df.show()

#         elif ext == "orc":
#             df = spark.read.orc(filepath)
#             df.show()

#         elif ext == "json":
#             df = spark.read.load("filepath", format="json")

#         else:
#             print("Unrecognized file format! Please input json / csv / parquet / orc ")

#         self.out_sparksession.value = spark
#         self.out_dataframe.value = df
#         self.done = True


# @xai_component
# class SparkReadCSV(Component):

#     in_sparksession: InArg[any]
#     file_input: InArg[str]
#     separator: InArg[str]
#     header: InArg[str]
#     out_sparksession: OutArg[any]
#     out_dataframe: OutArg[any]

#     def __init__(self):

#         self.done = False
#         self.in_sparksession = InArg(None)
#         self.file_input = InArg(None)
#         self.separator = InArg(None)
#         self.header = InArg(None)
#         self.out_sparksession = OutArg(None)
#         self.out_dataframe = OutArg(None)


#     def execute(self, ctx) -> None:

#         spark = self.in_sparksession.value
#         filepath = self.file_input.value

#         sep = self.separator.value if self.separator.value else ","
#         header = self.header.value if self.header.value else "true"
        
#         df = spark.read.load(filepath,
#                  format="csv", sep=sep, inferSchema="true", header=header)

#         df.show()

#         self.out_sparksession.value = spark
#         self.out_dataframe.value = df
#         self.done = True


# @xai_component
# class SparkWriteFile(Component):

#     dataframe: InArg[any]
#     output_name: InArg[str]
#     header: InArg[bool]
#     out_sparksession: OutArg[any]

#     def __init__(self):

#         self.done = False
#         self.dataframe = InArg(None)
#         self.output_name = InArg(None)
#         self.header = InArg(None)
#         self.out_sparksession = OutArg(None)

#     def execute(self, ctx) -> None:

#         df = self.dataframe.value
#         filepath = self.output_name.value
#         ext = filepath.split(".")[-1]

#         if ext == "csv":
#             df.write.csv(filepath, header=True)
#         elif ext == "parquet":
#             df.write.parquet(filepath)
#         elif ext == "orc":
#             df.write.orc(filepath)
#         else:
#             print("Unrecognized file format! Please input csv / parquet / orc.")

#         self.done = True

# @xai_component
# class SparkSQL(Component):

#     in_sparksession: InArg[any]
#     dataframe: InArg[any]
#     table_name: InArg[str]
#     sql_string: InArg[str]
#     out_sparksession: OutArg[any]
#     sql_dataframe: OutArg[any]


#     def __init__(self):

#         self.done = False
#         self.in_sparksession = InArg(None)
#         self.dataframe = InArg(None)
#         self.table_name = InArg(None)

#         self.sql_string = InArg(None)
#         self.out_sparksession = OutArg(None)
#         self.sql_dataframe = OutArg(None)

#     def execute(self, ctx) -> None:

#         spark = self.in_sparksession.value
#         df = self.dataframe.value
#         sql_string = self.sql_string.value
#         table_name = self.table_name.value if self.table_name.value else ""

#         if table_name:
#             df.createOrReplaceTempView(table_name)

#         else:
#             #handler if user does not specify table name
#             df.createOrReplaceTempView("tableA")
#             sql_string = sql_string + " FROM tableA"
        
#         sql_df = spark.sql(sql_string)
#         sql_df.show()
        
#         self.out_sparksession.value = spark
#         self.sql_dataframe.value = sql_df
#         self.done = True

# @xai_component
# class SparkVisualize(Component):

#     dataframe: InArg[any]
#     plot_type: InArg[str]
#     x_axis: InArg[str]
#     y_axis: InArg[str]
#     output_name: InArg[str]

#     def __init__(self):
        
#         self.done = False
#         self.dataframe = InArg(None)
#         self.plot_type = InArg(None)
#         self.x_axis = InArg(None)
#         self.y_axis = InArg(None)    
#         self.output_name = InArg(None)    


#     def execute(self, ctx) -> None:

#         df = self.dataframe.value
#         plot_type = self.plot_type.value if self.plot_type.value else "bar"
#         output_name = self.output_name.value if self.output_name.value else "visual.png"
#         x_axis = self.x_axis.value
#         y_axis = self.y_axis.value

#         pd_df = df.toPandas()

#         if plot_type == 'bar':
#             pd_df[x_axis].value_counts().plot(kind='bar')

#         elif plot_type == 'scatter':
#             pd_df.plot(x=x_axis, y=y_axis, kind = 'scatter')    

#         elif plot_type == 'line':

#             pd_df.plot(x=x_axis, y=y_axis, kind = 'line')    
        
#         plt.tight_layout()
#         plt.savefig(output_name)
#         plt.show()
#         self.done = True

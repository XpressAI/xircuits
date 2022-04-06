from xai_components.base import InArg, OutArg, Component, xai_component
from IPython.utils import capture

"""
This function initializes the training environment and creates the transformation pipeline. 
Setup function must be called before executing any other function.
It takes one mandatory parameter: data. All the other parameters are optional.
"""
@xai_component(color="blue")
class SetupClustering(Component):
    in_dataset:InArg[any] #Shape (n_samples, n_features), where n_samples is the number of samples and n_features is the number of features
    preprocess:InArg[bool] # When set to False, no transformations are applied, Data must be ready for modeling (no missing values, no dates, categorical data encoding), when preprocess is set to False. 
    normalize:InArg[bool] #When set to True, it transforms the numeric features by scaling them to a given range. 
    transformation:InArg[bool] #When set to True, it applies the power transform to make data more Gaussian-like.
    ignore_low_variance:InArg[bool] #When set to True, all categorical features with insignificant variances are removed from the data. 
    remove_multicollinearity:InArg[bool] #When set to True, features with the inter-correlations higher than the defined threshold are removed.
    multicollinearity_threshold:InArg[float] #Threshold for correlated features. Ignored when remove_multicollinearity is not True.
    combine_rare_levels:InArg[bool] #When set to True, frequency percentile for levels in categorical features below a certain threshold is combined into a single level.
    rare_level_threshold:InArg[float] #Percentile distribution below which rare categories are combined. Ignored when combine_rare_levels is not True.
    bin_numeric_features:InArg[any] #To convert numeric features into categorical,It takes a list of strings with column names that are related.
    group_features:InArg[any] #When the dataset contains features with related characteristics, group_features parameter can be used for feature extraction. It takes a list of strings with column names that are related.
    ignore_features:InArg[list] #ignore_features param can be used to ignore features during model training. It takes a list of strings with column names that are to be ignored.
    seed : InArg[int] #You can use random_state for reproducibility.
    log_experiment:InArg[bool] #logging setup and training
    experiment_name:InArg[str] #Name of the experiment for logging.
    use_gpu:InArg[bool]

    def __init__(self):

        self.done = False
        self.in_dataset = InArg(None)
        self.preprocess = InArg(True)
        self.normalize = InArg(False)
        self.transformation = InArg(False)
        self.ignore_low_variance = InArg(False)
        self.remove_multicollinearity = InArg(False)
        self.multicollinearity_threshold = InArg(0.9)
        self.combine_rare_levels = InArg(False)
        self.rare_level_threshold = InArg(0.1)
        self.bin_numeric_features = InArg(None)
        self.group_features = InArg(None)
        self.ignore_features = InArg(None) 
        self.seed = InArg(None)
        self.log_experiment = InArg(False)
        self.experiment_name = InArg('default')
        self.use_gpu = InArg(False)

    def execute(self, ctx) -> None:

        from pycaret.clustering import setup , models

        in_dataset = self.in_dataset.value
        preprocess = self.preprocess.value
        normalize = self.normalize.value
        transformation = self.transformation.value
        ignore_low_variance = self.ignore_low_variance.value
        remove_multicollinearity = self.remove_multicollinearity.value
        multicollinearity_threshold = self.multicollinearity_threshold.value
        combine_rare_levels = self.combine_rare_levels.value 
        rare_level_threshold = self.rare_level_threshold.value 
        bin_numeric_features = self.bin_numeric_features.value
        group_features = self.group_features.value
        ignore_features = self.ignore_features.value
        seed = self.seed.value
        log_experiment = self.log_experiment.value
        experiment_name = self.experiment_name.value
        use_gpu = self.use_gpu.value

        if seed is None:
            print("Set the seed value for reproducibility.")
            
        with capture.capture_output() as captured:
            setup_pycaret = setup(data = in_dataset,
            preprocess = preprocess,
             normalize =normalize,
             transformation = transformation,
             ignore_low_variance = ignore_low_variance,
             remove_multicollinearity = remove_multicollinearity,
             multicollinearity_threshold = multicollinearity_threshold,
             combine_rare_levels = combine_rare_levels,
             rare_level_threshold = rare_level_threshold,
             bin_numeric_features = bin_numeric_features,
             group_features = group_features,
             ignore_features = ignore_features,
             session_id=seed,
             log_experiment = log_experiment,
             experiment_name = experiment_name,
             use_gpu = use_gpu,
             silent=True)

        captured.show()
        
        print("List of the Available Clustering models: ")
        print(models())
        
        self.done = True


'''
This function trains a given model from the model library. All available 
models can be accessed using the models function.
'''
@xai_component(color="orange")
class CreateModelClustering(Component):
    model_id:InArg[str] #ID of an model available in the model library or pass an untrained model object consistent with scikit-learn API.
    num_clusters:InArg[int] #The amount of contamination of the data set, i.e. the proportion of outliers in the data set. Used when fitting to define the threshold on the decision function.

    out_created_model:OutArg[any] #Trained Model object

    def __init__(self):

        self.done = False
        self.model_id = InArg('knn')
        self.num_clusters = InArg(4)

        self.out_created_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.clustering import create_model 
    
        model_id = self.model_id.value
        num_clusters = self.num_clusters.value

        with capture.capture_output() as captured:
            created_model = create_model(model = model_id, num_clusters = num_clusters)
        captured.show()
        print(created_model)

        self.out_created_model.value = created_model

        self.done = True

'''
This component tunes the hyperparameters of a given model. The output of this component is
a score grid with CV scores by fold of the best selected model based on optimize parameter.
'''
@xai_component(color="salmon")
class TuneModelAnomaly(Component):
    model_id:InArg[str] #Trained model object
    supervised_target:InArg[str] #Name of the target column containing labels.
    supervised_type:InArg[str] #Type of task. ‘classification’ or ‘regression’. Automatically inferred when None.
    supervised_estimator:InArg[str] # the classification or regression model
    optimize:InArg[str] #the classification or regression optimizer 
    custom_grid:InArg[any] #To define custom search space for hyperparameters, pass a dictionary with parameter name and values to be iterated.

    out_tuned_model:OutArg[any]

    def __init__(self):

        self.done = False
        self.model_id = InArg(None)
        self.supervised_target = InArg(None)
        self.supervised_type = InArg(None)
        self.supervised_estimator = InArg(None)
        self.optimize = InArg(None)
        self.custom_grid = InArg(None) 

        self.out_tuned_model = OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.anomaly import tune_model 
        from IPython.display import display
        import numpy as np

        model_id = self.model_id.value
        supervised_target = self.supervised_target.value
        supervised_type = self.supervised_type.value
        supervised_estimator = self.supervised_estimator.value
        optimize = self.optimize.value
        custom_grid = self.custom_grid.value

        with capture.capture_output() as captured:
            tuned_model = tune_model(model = model_id,
                                    supervised_target = supervised_target,
                                    supervised_type = supervised_type,
                                    supervised_estimator = supervised_estimator,
                                    optimize = optimize,
                                    custom_grid = custom_grid)
        captured.show()

        self.out_tuned_model.value = tuned_model
        
        self.done = True

'''
This function assigns cluster labels to the dataset for a given model.
'''
@xai_component(color="firebrick")
class AssignModelClustering(Component):
    in_model:InArg[any] #Trained Model Object
    
    out_model:OutArg[any] #Trained Model Object
    def __init__(self):

        self.done = False
        self.in_model = InArg(None)

        self.out_model = OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.clustering import assign_model
    
        in_model = self.in_model.value

        with capture.capture_output() as captured:
            assign_model = assign_model(model = in_model)
        captured.show()
        print(assign_model.head())

        self.out_model.value = in_model

        self.done = True


'''
This function generates cluster labels using a trained model.
'''
@xai_component(color='darkviolet')
class PredictModelClustering(Component):
    in_model:InArg[any] #Trained model object
    predict_dataset:InArg[any] #Shape (n_samples, n_features) where n_samples is the number of samples and n_features is the number of features.

    out_model:OutArg[any] #pandas.DataFrame with prediction and score columns 

    def __init__(self):

        self.done = False
        self.in_model = InArg(None)
        self.predict_dataset = InArg(None)

        self.out_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.clustering import predict_model 
    
        in_model = self.in_model.value
        predict_dataset = self.predict_dataset.value

        with capture.capture_output() as captured:
            Prediction = predict_model(in_model, data= predict_dataset)  
        captured.show()
        print(Prediction.head())

        self.out_model.value = in_model
        
        self.done = True



'''
This function analyzes the performance of a trained model.
'''
@xai_component(color="springgreen")
class PlotModelClustering(Component):
    in_model:InArg[any] #Trained model object
    plot_type:InArg[str] #plot name
    feature:InArg[str] #Feature to be evaluated when plot = ‘distribution’. When plot type is ‘cluster’ or ‘tsne’ feature column is used as a hoverover tooltip and/or label when the label param is set to True. When the plot type is ‘cluster’ or ‘tsne’ and feature is None, first column of the dataset is used.
    list_available_plots:InArg[bool] # list the available plots

    out_model:OutArg[any]

    def __init__(self):

        self.done = False
        self.in_model = InArg(None)
        self.plot_type = InArg('cluster')
        self.feature = InArg(None)
        self.list_available_plots=InArg(False)

        self.out_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.clustering import plot_model 
    
        plot={'cluster' : 'Cluster PCA Plot (2d)',
            'tsne' : 'Cluster TSnE (3d)',
            'elbow' : 'Elbow Plot',
            'silhouette' : 'Silhouette Plot',
            'distance' : 'Distance Plot',
            'distribution' : 'Distribution Plot'}
        
        in_model = self.in_model.value
        plot_type = self.plot_type.value
        feature = self.feature.value
        list_available_plots = self.list_available_plots.value

        with capture.capture_output() as captured:
            plot_model = plot_model(in_model, plot = plot_type,feature = feature)
        captured.show()

        if list_available_plots is True:
            print('List of available plots (plot Type - Plot Name):')
            for key, value in plot.items():
                print(key, ' - ', value)

        self.out_model.value = in_model
        
        self.done = True


'''
This component saves the transformation pipeline and trained model object into the
 current working directory as a pickle file for later use.
'''
@xai_component(color='red')
class SaveModelClustering(Component):
    in_model:InArg[any] #Trained model object
    save_path:InArg[str] #Name and saving path of the model.
    model_only:InArg[bool] #When set to True, only trained model object is saved instead of the entire pipeline.

    def __init__(self):

        self.done = False
        self.in_model = InArg(None)
        self.save_path = InArg(None)
        self.model_only = InArg(False)

    def execute(self, ctx) -> None:

        from pycaret.clustering import save_model 
    
        in_model = self.in_model.value
        save_path = self.save_path.value
        model_only = self.model_only.value

        save_model(in_model,model_name=save_path,model_only=model_only)
        
        self.done = True


    '''
This component loads a previously saved pipeline.
'''
@xai_component(color='red')
class LoadModelClustering(Component):
    model_path:InArg[str] #Name and path of the saved model

    model:OutArg[any] #Trained model object

    def __init__(self):

        self.done = False
        self.model_path = InArg(None)

        self.model= OutArg(None)
        
    def execute(self, ctx) -> None:

        from pycaret.clustering import load_model 
    
        model_path = self.model_path.value

        loaded_model = load_model(model_name=model_path)
        
        self.model.value = loaded_model

        self.done = True
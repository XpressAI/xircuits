from xai_components.base import InArg, OutArg, Component, xai_component
from IPython.utils import capture

"""
This component initializes the training environment and creates the transformation pipeline.
Setup component must be called before executing any other component. It takes two mandatory 
parameters:data and target. All the other parameters are optional.
"""
@xai_component(color="blue")
class SetupRegression(Component):
    in_dataset:InArg[any] #Shape (n_samples, n_features), where n_samples is the number of samples and n_features is the number of features
    target:InArg[str] #Name of the target column to be passed in as a string. The target variable can be either binary or multiclass.
    train_size_fraction:InArg[float] #Proportion of the dataset to be used for training and validation. Should be between 0.0 and 1.0.
    transform_target:InArg[bool] #When set to True, target variable is transformed using the method defined in transform_target_method param. Target transformation is applied separately from feature transformations.
    transform_target_method:InArg[str] #'Box-cox' and 'yeo-johnson' methods are supported. Box-Cox requires input data to be strictly positive, while Yeo-Johnson supports both positive or negative data.
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
        self.target = InArg('default')
        self.train_size_fraction = InArg(1.0)
        self.transform_target = InArg(False)
        self.transform_target_method = InArg('box-cox')
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

        from pycaret.regression import setup

        in_dataset = self.in_dataset.value
        target = self.target.value
        train_size_fraction = self.train_size_fraction.value
        transform_target= self.transform_target.value 
        transform_target_method = self.transform_target_method.value 
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
             target = target,
             train_size=train_size_fraction,
             normalize =normalize,
             transform_target = transform_target,
             transform_target_method = transform_target_method,
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

        print("List of the Available Regression models: ")
        print(models())

        self.done = True


'''
This component trains and evaluates performance of all estimators available 
in the model library using cross validation.The output of this component is 
a score grid with average cross validated scores. 
'''
@xai_component(color="firebrick")
class CompareModelsRegression(Component):
    sort_by:InArg[str] #The sort order of the score grid. 
    exclude:InArg[list] #To omit certain models from training and evaluation, pass a list containing model id in the exclude parameter.
    num_top:InArg[int] #Number of top_n models to return.

    top_models:OutArg[any]

    def __init__(self):

        self.done = False
        self.sort_by = InArg('R2')
        self.exclude = InArg(None)
        self.num_top = InArg(1)

        self.top_models = OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.regression import compare_models 
    
        sort_by = self.sort_by.value
        exclude = self.exclude.value
        num_top = self.num_top.value

        with capture.capture_output() as captured:
            best_model = compare_models(sort=sort_by,exclude = exclude,n_select = num_top)
        captured.show()
        print('Best '+str(num_top)+' Model:',best_model)

        self.top_models.value = best_model

        self.done = True

'''
This component trains and evaluates the performance of a given estimator 
using cross validation.The output of this component is a score grid with 
CV scores by fold.
'''
@xai_component(color="orange")
class CreateModelRegression(Component):
    model_id:InArg[str] #ID of an estimator available in model library or pass an untrained model object consistent with scikit-learn API
    num_fold:InArg[int] #Controls cross-validation. If None, the CV generator in the fold_strategy parameter of the setup function is used.

    out_created_model:OutArg[any] #Trained Model object

    def __init__(self):

        self.done = False
        self.model_id = InArg('lr')
        self.num_fold = InArg(10)

        self.out_created_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.regression import create_model 
    
        model_id = self.model_id.value
        num_fold = self.num_fold.value

        with capture.capture_output() as captured:
            created_model = create_model(estimator = model_id, fold = num_fold)
        captured.show()
        print(created_model)

        self.out_created_model.value = created_model

        self.done = True


'''
This component tunes the hyperparameters of a given model. The output of this component is
a score grid with CV scores by fold of the best selected model based on optimize parameter.
'''
@xai_component(color="salmon")
class TuneModelRegression(Component):
    in_model:InArg[any] #Trained model object
    optimize:InArg[str] #Metric name to be evaluated for hyperparameter tuning.
    early_stopping_patience:InArg[int] #Maximum number of epochs to run for each sampled configuration.
    num_fold:InArg[int] #Controls cross-validation. If None, the CV generator in the fold_strategy parameter of the setup function is used.
    n_iter:InArg[int] #Number of iterations in the grid search. Increasing 'n_iter' may improve model performance but also increases the training time.
    custom_grid:InArg[any] #To define custom search space for hyperparameters, pass a dictionary with parameter name and values to be iterated.

    out_tuned_model:OutArg[any]

    def __init__(self):

        self.done = False
        self.in_model = InArg(None)
        self.optimize = InArg("R2")
        self.early_stopping_patience = InArg(None)
        self.num_fold = InArg(10)
        self.n_iter = InArg(10)
        self.custom_grid = InArg(None) 

        self.out_tuned_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.regression import tune_model 
        from IPython.display import display

        in_model = self.in_model.value
        optimize = self.optimize.value
        patience = self.early_stopping_patience.value
        num_fold = self.num_fold.value
        n_iter = self.n_iter.value
        custom_grid = self.custom_grid.value

        if patience is None:
            early_stopping=False
            patience = 10
        else:
            early_stopping=True
            patience=patience

        with capture.capture_output() as captured:
            tuned_model = tune_model(estimator = in_model,
                                    optimize = optimize,
                                    fold= num_fold,
                                    n_iter=n_iter,
                                    early_stopping=early_stopping,
                                    early_stopping_max_iters=patience,
                                    custom_grid = custom_grid)
        
        for o in captured.outputs:
            display(o)

        self.out_tuned_model.value = tuned_model
        
        self.done = True

'''
This function analyzes the performance of a trained model.
'''
@xai_component(color="springgreen")
class PlotModelRegression(Component):
    in_model:InArg[any] #Trained model object
    plot_type:InArg[str] #plot name
    list_available_plots:InArg[bool] # list the available plots

    out_model:OutArg[any]

    def __init__(self):

        self.done = False
        self.in_model = InArg(None)
        self.plot_type = InArg('residuals')
        self.list_available_plots=InArg(False)

        self.out_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.regression import plot_model 
    
        plot={'residuals_interactive' : 'Interactive Residual plots','residuals' : 'Residuals Plot','error' : 'Prediction Error Plot','cooks' : 'Cooks Distance Plot',
            'rfe' : 'Recursive Feat. Selection','learning' : 'Learning Curve','vc' : 'Validation Curve','manifold' : 'Manifold Learning',
            'feature' : 'Feature Importance','feature_all' : 'Feature Importance (All)','parameter' : 'Model Hyperparameter','tree' : 'Decision Tree'}
        
        in_model = self.in_model.value
        plot_type = self.plot_type.value
        list_available_plots = self.list_available_plots.value

        with capture.capture_output() as captured:
            plot_model = plot_model(in_model, plot = plot_type)
        captured.show()

        if list_available_plots is True:
            print('List of available plots (plot Type - Plot Name):')
            for key, value in plot.items():
                print(key, ' - ', value)

        self.out_model.value = in_model
        
        self.done = True



'''
This component trains a given estimator on the entire dataset including the holdout set.
'''
@xai_component(color='crimson')
class FinalizeModelRegression(Component):
    in_model:InArg[any] #Trained model object

    out_finalize_model:OutArg[any] ##Trained model object

    def __init__(self):

        self.done = False
        self.in_model = InArg(None)
        
        self.out_finalize_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.regression import finalize_model 
    
        in_model = self.in_model.value

        with capture.capture_output() as captured:
            out_finalize_model = finalize_model(in_model)
            print(out_finalize_model)
        captured.show()

        self.out_finalize_model.value = out_finalize_model
        
        self.done = True


'''
This component predicts Label and Score (probability of predicted class) using a trained model.
 When data is None, it predicts label and score on the holdout set
'''
@xai_component(color='darkviolet')
class PredictModelRegression(Component):
    in_model:InArg[any] #Trained model object
    predict_dataset:InArg[any] #Shape (n_samples, n_features). All features used during training must be available in the unseen dataset.

    out_model:OutArg[any] #pandas.DataFrame with prediction and score columns 

    def __init__(self):

        self.done = False
        self.in_model = InArg(None)
        self.predict_dataset = InArg(None)

        self.out_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.regression import predict_model 
    
        in_model = self.in_model.value
        predict_dataset = self.predict_dataset.value

        with capture.capture_output() as captured:
            Prediction = predict_model(in_model, data= predict_dataset)  
        captured.show()

        self.out_model.value = in_model
        
        self.done = True


'''
This component saves the transformation pipeline and trained model object into the
 current working directory as a pickle file for later use.
'''
@xai_component(color='red')
class SaveModelRegression(Component):
    in_model:InArg[any] #Trained model object
    save_path:InArg[str] #Name and saving path of the model.
    model_only:InArg[bool] #When set to True, only trained model object is saved instead of the entire pipeline.

    def __init__(self):

        self.done = False
        self.in_model = InArg(None)
        self.save_path = InArg(None)
        self.model_only = InArg(False)

    def execute(self, ctx) -> None:

        from pycaret.regression import save_model 
    
        in_model = self.in_model.value
        save_path = self.save_path.value
        model_only = self.model_only.value

        save_model(in_model,model_name=save_path,model_only=model_only)
        
        self.done = True


    '''
This component loads a previously saved pipeline.
'''
@xai_component(color='red')
class LoadModelRegression(Component):
    model_path:InArg[str] #Name and path of the saved model

    model:OutArg[any] #Trained model object

    def __init__(self):

        self.done = False
        self.model_path = InArg(None)

        self.model= OutArg(None)
        
    def execute(self, ctx) -> None:

        from pycaret.regression import load_model 
    
        model_path = self.model_path.value

        loaded_model = load_model(model_name=model_path)
        
        self.model.value = loaded_model

        self.done = True


'''
This component ensembles a given estimator. The output of this function is a score grid with CV scores by fold.
'''
@xai_component(color='gold')
class EnsembleModelRegression(Component):
    in_model:InArg[any] #Trained model object
    method:InArg[str] #Method for ensembling base estimator. It can be ‘Bagging’ or ‘Boosting’.
    choose_better:InArg[bool] #When set to True, the returned object is always better performing. The metric used for comparison is defined by the optimize parameter.
    optimize:InArg[str] #Metric to compare for model selection when choose_better is True.
    n_estimators:InArg[int] #The number of base estimators in the ensemble. In case of perfect fit, the learning procedure is stopped early.

    out_ensemble_model:OutArg[any] #Trained model object

    def __init__(self):

        self.done = False
        self.in_model = InArg(None)
        self.method = InArg('Bagging')
        self.choose_better = InArg(False)
        self.optimize = InArg('R2')
        self.n_estimators = InArg(10)

        self.out_ensemble_model= OutArg(None)
        
    def execute(self, ctx) -> None:

        from pycaret.regression import ensemble_model 
    
        in_model = self.in_model.value
        method = self.method.value
        choose_better = self.choose_better.value
        optimize = self.optimize.value
        n_estimators = self.n_estimators.value

        with capture.capture_output() as captured:
            ensembled_model = ensemble_model(estimator=in_model,method=method,choose_better = choose_better, optimize=optimize,n_estimators=n_estimators)
        captured.show()
        print('Ensemble model:',ensembled_model)

        self.out_ensemble_model.value = ensembled_model

        self.done = True

'''
This component trains a Soft Voting / Majority Rule classifier for select models passed in the top_model list. 
'''
@xai_component(color='greenyellow')
class BlendModelsRegression(Component):
    top_models:InArg[any] #List of trained model objects from CompareModel component
    model_1:InArg[any] # first model to blend 
    model_2:InArg[any] # second model to blend 
    model_3:InArg[any] # third model to blend 
    choose_better:InArg[bool] # When set to True, the returned object is always better performing. The metric used for comparison is defined by the optimize parameter.
    optimize:InArg[str] #Metric to compare for model selection when choose_better is True.
    

    out_blended_model:OutArg[any]

    def __init__(self):

        self.done = False
        self.top_models = InArg(None)
        self.model_1 = InArg(None)
        self.model_2 = InArg(None)
        self.model_3 = InArg(None)
        self.choose_better = InArg(False)
        self.optimize = InArg('R2')
        

        self.out_blended_model= OutArg(None)
        
    def execute(self, ctx) -> None:

        from pycaret.regression import blend_models 

        model_list = self.top_models.value
        model_1 = self.model_1.value
        model_2 = self.model_2.value
        model_3 = self.model_3.value
        choose_better = self.choose_better.value
        optimize = self.optimize.value
        
        if model_list is None:
            blend_model = [model_1,model_2,model_3]
            model_list = [i for i in blend_model if i]

        with capture.capture_output() as captured:
            blend_model = blend_models(estimator_list = model_list,choose_better = choose_better,optimize = optimize)
        captured.show()

        self.out_blended_model.value = blend_model

        self.done = True


'''
This component trains a meta model over select estimators passed in the estimator_list parameter.
 The output of this function is a score grid with CV scores by fold
'''
@xai_component(color='lawngreen')
class StackModelsRegression(Component):
    top_models:InArg[any] #List of trained model objects from CompareModel component
    model_1:InArg[any] # first model to stack
    model_2:InArg[any] # first model to stack
    model_3:InArg[any] # first model to stack
    meta_model:InArg[any] #When None, Logistic Regression is trained as a meta model.
    choose_better:InArg[bool] #When set to True, the returned object is always better performing. The metric used for comparison is defined by the optimize parameter.
    optimize:InArg[str] #Metric to compare for model selection when choose_better is True.
    
    out_stacked_model:OutArg[any] #Trained Model object

    def __init__(self):

        self.done = False
        self.top_models = InArg(None)
        self.model_1 = InArg(None)
        self.model_2 = InArg(None)
        self.model_3 = InArg(None)
        self.meta_model = InArg(None)
        self.choose_better = InArg(False)
        self.optimize = InArg('R2')
        
        self.out_stacked_model= OutArg(None)
        
    def execute(self, ctx) -> None:

        from pycaret.regression import stack_models 

        model_list = self.top_models.value
        model_1 = self.model_1.value
        model_2 = self.model_2.value
        model_3 = self.model_3.value
        meta_model = self.meta_model.value
        choose_better = self.choose_better.value
        optimize = self.optimize.value
        
        if model_list is None:
            blend_model = [model_1,model_2,model_3]
            model_list = [i for i in blend_model if i]

        with capture.capture_output() as captured:
            stacked_model = stack_models(estimator_list = model_list,meta_model=meta_model,choose_better = choose_better,optimize = optimize)
        captured.show()
        
        print('Stacked models:',stacked_model.estimators_)

        self.out_stacked_model.value = stacked_model

        self.done = True

'''
This component returns the best model out of all trained models in current session based on the optimize parameter. 
Metrics evaluated can be accessed using the get_metrics function.
'''
@xai_component(color="yellow")
class AutoMLRegression(Component):
    optimize:InArg[str] #Metric to use for model selection. It also accepts custom metrics added using the add_metric function.

    best_model:OutArg[any] # best Trained Model object

    def __init__(self):

        self.done = False
        self.optimize = InArg('R2')

        self.best_model= OutArg(None)
        
    def execute(self, ctx) -> None:

        from pycaret.regression import automl 
    
        optimize = self.optimize.value

        best_model = automl(optimize=optimize)
        
        self.best_model.value = best_model

        self.done = True




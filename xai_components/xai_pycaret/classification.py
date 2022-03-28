from xai_components.base import InArg, OutArg, Component, xai_component
from IPython.utils import capture

@xai_component
class GetData(Component):
    dataset: InArg[str]  #Name of the datset
    save_copy: InArg[bool] #When set to true, it saves a copy in current working directory.
    verbose: InArg[bool]  #When set to False, head of data is not displayed.
    
    out_dataset : OutArg[any]

    def __init__(self):

        self.done = False
        self.dataset = InArg(None)
        self.save_copy = InArg(False)
        self.verbose = InArg(True)
        
        self.out_dataset = OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.datasets import get_data

        dataset = self.dataset.value
        save_copy = self.save_copy.value
        verbose = self.verbose.value

        if dataset is None:
            dataset = "index"
            print("Please choose a dataset...")
        
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
        self.test_fraction = InArg(0)
        self.seed = InArg(None)
        
        self.train_val_dataset = OutArg(None)
        self.test_Dataset = OutArg(None)

    def execute(self, ctx) -> None:

        in_dataset = self.in_dataset.value
        test_fraction = self.test_fraction.value
        seed = self.seed.value

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
    normalize:InArg[bool]
    transformation:InArg[bool]
    ignore_low_variance:InArg[bool]
    remove_multicollinearity:InArg[bool]
    multicollinearity_threshold:InArg[float]
    bin_numeric_features:InArg[any]
    group_features:InArg[any]
    seed : InArg[int] #You can use random_state for reproducibility.


    def __init__(self):

        self.done = False
        self.in_dataset = InArg(None)
        self.target = InArg('default')
        self.train_size_fraction = InArg(1)
        self.normalize = InArg(False)
        self.transformation = InArg(False)
        self.ignore_low_variance = InArg(False)
        self.remove_multicollinearity = InArg(False)
        self.multicollinearity_threshold = InArg(0.9)
        self.bin_numeric_features = InArg(None)
        self.group_features = InArg(None)
        self.seed = InArg(None)

    def execute(self, ctx) -> None:

        from pycaret.classification import setup

        in_dataset = self.in_dataset.value
        target = self.target.value
        train_size_fraction = self.train_size_fraction.value
        normalize = self.normalize.value
        transformation = self.transformation.value
        ignore_low_variance = self.ignore_low_variance.value
        remove_multicollinearity = self.remove_multicollinearity.value
        multicollinearity_threshold = self.multicollinearity_threshold.value
        bin_numeric_features = self.bin_numeric_features.value
        group_features = self.group_features.value
        seed = self.seed.value
   
        if seed is None:
            print("Set the seed value for reproducibility.")
            
        with capture.capture_output() as captured:
            setup_pycaret = setup(data = in_dataset,
             target = target,
             train_size=train_size_fraction,
             normalize =normalize,
             transformation = transformation,
             ignore_low_variance = ignore_low_variance,
             remove_multicollinearity = remove_multicollinearity,
             multicollinearity_threshold = multicollinearity_threshold,
             bin_numeric_features = bin_numeric_features,
             group_features = group_features,
             session_id=seed,
             silent=True)

        captured.show()
        
        self.done = True



@xai_component
class CompareModels(Component):
    sort_by:InArg[str]

    def __init__(self):

        self.done = False
        self.sort_by = InArg('Accuracy')

    def execute(self, ctx) -> None:

        from pycaret.classification import compare_models , models 
    
        sort_by = self.sort_by.value

        with capture.capture_output() as captured:
            best_model = compare_models(sort=sort_by)
        captured.show()

        self.done = True


@xai_component
class CreateModel(Component):
    model_id:InArg[str]
    num_fold:InArg[int]

    out_created_model:OutArg[any]

    def __init__(self):

        self.done = False
        self.model_id = InArg('lr')
        self.num_fold = InArg(10)

        self.out_created_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.classification import create_model 
    
        model_id = self.model_id.value
        num_fold = self.num_fold.value

        with capture.capture_output() as captured:
            created_model = create_model(estimator = model_id, fold = num_fold)
        captured.show()
        print(created_model)

        self.out_created_model.value = created_model

        self.done = True


@xai_component
class TuneModel(Component):
    in_created_model:InArg[any]
    optimize:InArg[str]
    early_stopping_patience:InArg[int]
    num_fold:InArg[int]
    n_iter:InArg[int]

    out_tuned_model:OutArg[any]

    def __init__(self):

        self.done = False
        self.in_created_model = InArg(None)
        self.optimize = InArg("Accuracy")
        self.early_stopping_patience = InArg(None)
        self.num_fold = InArg(10)
        self.n_iter = InArg(10)

        self.out_tuned_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.classification import tune_model 
        from IPython.display import display
        in_created_model = self.in_created_model.value
        optimize = self.optimize.value
        patience = self.early_stopping_patience.value
        num_fold = self.num_fold.value
        n_iter = self.n_iter.value

        if patience is None:
            early_stopping=False
            patience = 10
        else:
            early_stopping=True
            patience=patience

        with capture.capture_output() as captured:
            tuned_model = tune_model(estimator = in_created_model,optimize = optimize, fold= num_fold,n_iter=n_iter,early_stopping=early_stopping,early_stopping_max_iters=patience)
        
        for o in captured.outputs:
            display(o)

        self.out_tuned_model.value = tuned_model
        
        self.done = True


@xai_component
class PlotModel(Component):
    in_model:InArg[any]
    plot_type:InArg[str]

    out_tuned_model:OutArg[any]

    def __init__(self):

        self.done = False
        self.in_model = InArg(None)
        self.plot_type = InArg('auc')

        self.out_tuned_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.classification import plot_model 
    
        in_model = self.in_model.value
        plot_type = self.plot_type.value

        with capture.capture_output() as captured:
            plot_model = plot_model(in_model, plot = plot_type)
        captured.show()

        self.out_tuned_model.value = in_model
        
        self.done = True


@xai_component
class FinalizeModel(Component):
    in_tuned_model:InArg[any]

    out_finalize_model:OutArg[any]

    def __init__(self):

        self.done = False
        self.in_tuned_model = InArg(None)
        
        self.out_finalize_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.classification import finalize_model 
    
        in_tuned_model = self.in_tuned_model.value

        with capture.capture_output() as captured:
            out_finalize_model = finalize_model(in_tuned_model)
            print(out_finalize_model)
        captured.show()

        self.out_finalize_model.value = out_finalize_model
        
        self.done = True

@xai_component
class PredictModel(Component):
    in_finalize_model:InArg[any]
    predict_dataset:InArg[any]

    out_finalize_model:OutArg[any]

    def __init__(self):

        self.done = False
        self.in_finalize_model = InArg(None)
        self.predict_dataset = InArg(None)

        self.out_finalize_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.classification import predict_model 
    
        in_finalize_model = self.in_finalize_model.value
        predict_dataset = self.predict_dataset.value

        with capture.capture_output() as captured:
            Prediction = predict_model(in_finalize_model, data= predict_dataset)  
        captured.show()
        print(Prediction[['default','Label','Score']].head())

        self.out_finalize_model.value = in_finalize_model
        
        self.done = True

@xai_component
class SaveModel(Component):
    in_finalize_model:InArg[any]
    save_path:InArg[str]
    model_only:InArg[bool]

    def __init__(self):

        self.done = False
        self.in_finalize_model = InArg(None)
        self.save_path = InArg(None)
        self.model_only = InArg(False)

    def execute(self, ctx) -> None:

        from pycaret.classification import save_model 
    
        in_finalize_model = self.in_finalize_model.value
        save_path = self.save_path.value
        model_only = self.model_only.value

        save_model(in_finalize_model,model_name=save_path,model_only=model_only)
        
        self.done = True

@xai_component
class LoadModel(Component):
    model_path:InArg[str]

    model:OutArg[any]

    def __init__(self):

        self.done = False
        self.model_path = InArg(None)

        self.model= OutArg(None)
        
    def execute(self, ctx) -> None:

        from pycaret.classification import load_model 
    
        model_path = self.model_path.value

        loaded_model = load_model(model_name=model_path)
        
        self.model.value = loaded_model

        self.done = True


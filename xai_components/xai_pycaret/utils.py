from xai_components.base import InArg, OutArg, Component, xai_component
from IPython.utils import capture


"""
This component loads sample datasets from git repository.
 List of available datasets can be checked using get_data('index')
"""
@xai_component(color="green")
class GetData(Component):
    dataset: InArg[str]  #Index value of dataset.
    save_copy: InArg[bool] #When set to true, it saves a copy in current working directory.
    verbose: InArg[bool]  #When set to False, head of data is not displayed.
    
    out_dataset : OutArg[any] #Dataset

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


"""
This component withheld sample from the original dataset to be used for predictions. 
This should not be confused with a train/test split as this particular split 
is performed to simulate a real life scenario.
"""
@xai_component(color="green")
class SampleTestData(Component):
    in_dataset: InArg[any] 
    test_fraction: InArg[float] #Fraction of testing dataset size.
    seed : InArg[int] #You can use random_state for reproducibility.

    train_val_dataset : OutArg[any] #train/val dataset for training and evaluation
    test_Dataset: OutArg[any]  #test dataset for model prediction
    

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


"""
This component sample a set numbers of rows from the dataframe
"""
@xai_component(color="green")
class SampleData(Component):
    in_dataset: InArg[any] 
    sample_size: InArg[float] #Fraction of testing dataset size.
    seed : InArg[int] #You can use random_state for reproducibility.

    sampled_dataset : OutArg[any] #sampled dataset 
    
    def __init__(self):

        self.done = False
        self.in_dataset = InArg(None)
        self.sample_size = InArg(None)
        self.seed = InArg(None)
        
        self.sampled_dataset = OutArg(None)

    def execute(self, ctx) -> None:

        in_dataset = self.in_dataset.value
        sample_size = self.sample_size.value
        seed = self.seed.value

        if seed is None:
            print("Set the seed value for reproducibility.")

        sampled_dataset = in_dataset.sample(sample_size, random_state=seed).reset_index(drop=True)

        print('Sampled Data : ' + str(sampled_dataset.shape))
        
        self.sampled_dataset.value = sampled_dataset

        self.done = True



'''
Logging all the trained models to MLflow, can access at localhost:5000
'''
@xai_component(color="navy")
class Logging(Component):

    def __init__(self):

        self.done = False
        
    def execute(self, ctx) -> None:
        import subprocess
        print("You can access the logs at localhost:5000")
        subprocess.run("mlflow ui")

        self.done = True


from xai_components.base import InArg, OutArg, Component, xai_component
from IPython.utils import capture

"""
This component initializes the training environment and creates the transformation pipeline.
Setup component must be called before executing any other component. It takes two mandatory 
parameters:data and target. All the other parameters are optional.
"""
@xai_component(color="blue")
class SetupNLP(Component):
    in_dataset: InArg[any] #pandas.Dataframe with shape (n_samples, n_features) or a list.
    target: InArg[str] #Name of the target column to be passed in as a string. The target variable can be either binary or multiclass.
    custom_stopwords:InArg[list] #List of stopwords.
    seed:InArg[int] #You can use random_state for reproducibility.
    log_experiment:InArg[bool] #logging setup and training
    experiment_name:InArg[str] #Name of the experiment for logging.




    def __init__(self):

        self.done = False
        self.in_dataset = InArg(None)
        self.target = InArg(None)
        self.custom_stopwords = InArg(None)
        self.seed = InArg(None)
        self.log_experiment = InArg(False)
        self.experiment_name = InArg('default')

    def execute(self, ctx) -> None:

        from pycaret.nlp import setup , models

        in_dataset = self.in_dataset.value
        target = self.target.value
        custom_stopwords = self.custom_stopwords.value
        seed = self.seed.value
        log_experiment = self.log_experiment.value
        experiment_name = self.experiment_name.value

        if seed is None:
            print("Set the seed value for reproducibility.")
            
        with capture.capture_output() as captured:
            setup_pycaret = setup(data = in_dataset,
             target = target,
             custom_stopwords = custom_stopwords,
             session_id=seed,
             log_experiment = log_experiment,
             experiment_name = experiment_name)

        captured.show()

        print("List of the Available NLP Models: ")
        print(models())
        
        self.done = True


'''
This function trains a given topic model. All the available models
 can be accessed using the models function.
'''
@xai_component(color="orange")
class CreateModelNLP(Component):
    model_id:InArg[str] #ID of an estimator available in model library or pass an untrained model object consistent with scikit-learn API
    num_topics:InArg[int] #Number of topics to be created. If None, default is set to 4.
    multi_core:InArg[bool]

    out_created_model:OutArg[any] #Trained Model object

    def __init__(self):

        self.done = False
        self.model_id = InArg('lda')
        self.num_topics = InArg(4)
        self.multi_core = InArg(False)

        self.out_created_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.nlp import create_model 
    
        model_id = self.model_id.value
        num_topics = self.num_topics.value
        multi_core = self.multi_core.value 

        with capture.capture_output() as captured:
            created_model = create_model(model = model_id, num_topics = num_topics, multi_core = multi_core,verbose = False)
        captured.show()
        print(created_model)

        self.out_created_model.value = created_model

        self.done = True


'''
This function assigns topic labels to the dataset for a given model.
'''
@xai_component(color="firebrick")
class AssignModelNLP(Component):
    in_model:InArg[any] #Trained Model Object
    
    out_model:OutArg[any] #Trained Model Object
    def __init__(self):

        self.done = False
        self.in_model = InArg(None)

        self.out_model = OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.nlp import assign_model
    
        in_model = self.in_model.value

        with capture.capture_output() as captured:
            assign_model = assign_model(model = in_model,verbose = False)
        captured.show()
        print(assign_model.head())

        self.out_model.value = in_model

        self.done = True


'''
This function analyzes the performance of a trained model.
'''
@xai_component(color="springgreen")
class PlotModelNLP(Component):
    in_model:InArg[any] #Trained model object
    plot_type:InArg[str] #plot name
    topic_num:InArg[str] #Feature to be evaluated when plot = ‘distribution’. When plot type is ‘cluster’ or ‘tsne’ feature column is used as a hoverover tooltip and/or label when the label param is set to True. When the plot type is ‘cluster’ or ‘tsne’ and feature is None, first column of the dataset is used.
    list_available_plots:InArg[bool] # list the available plots

    out_model:OutArg[any]

    def __init__(self):

        self.done = False
        self.in_model = InArg(None)
        self.plot_type = InArg('frequency')
        self.topic_num = InArg(None)
        self.list_available_plots=InArg(False)

        self.out_model= OutArg(None)

    def execute(self, ctx) -> None:

        from pycaret.nlp import plot_model 
    
        plot={'frequency' : 'Word Token Frequency',
            'distribution' : 'Word Distribution Plot',
            'bigram' : 'Bigram Frequency Plot',
            'trigram' : 'Trigram Frequency Plot',
            'sentiment' : 'Sentiment Polarity Plot',
            'pos' : 'Part of Speech Frequency',
            'tsne' : 't-SNE (3d) Dimension Plot',
            'topic_model' : 'Topic Model (pyLDAvis)',
            'topic_distribution' : 'Topic Infer Distribution',
            'wordcloud' : 'Wordcloud',
            'umap' : 'UMAP Dimensionality Plot'}
        
        in_model = self.in_model.value
        plot_type = self.plot_type.value
        topic_num = self.topic_num.value
        list_available_plots = self.list_available_plots.value

        with capture.capture_output() as captured:
            plot_model = plot_model(in_model, plot = plot_type,topic_num = topic_num)
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
class SaveModelNLP(Component):
    in_model:InArg[any] #Trained model object
    save_path:InArg[str] #Name and saving path of the model.
    model_only:InArg[bool] #When set to True, only trained model object is saved instead of the entire pipeline.

    def __init__(self):

        self.done = False
        self.in_model = InArg(None)
        self.save_path = InArg(None)
        self.model_only = InArg(False)

    def execute(self, ctx) -> None:

        from pycaret.nlp import save_model 
    
        in_model = self.in_model.value
        save_path = self.save_path.value
        model_only = self.model_only.value

        save_model(in_model,model_name=save_path,model_only=model_only)
        
        self.done = True


'''
This component loads a previously saved pipeline.
'''
@xai_component(color='red')
class LoadModelNLP(Component):
    model_path:InArg[str] #Name and path of the saved model

    model:OutArg[any] #Trained model object

    def __init__(self):

        self.done = False
        self.model_path = InArg(None)

        self.model= OutArg(None)
        
    def execute(self, ctx) -> None:

        from pycaret.nlp import load_model 
    
        model_path = self.model_path.value

        loaded_model = load_model(model_name=model_path)
        
        self.model.value = loaded_model

        self.done = True
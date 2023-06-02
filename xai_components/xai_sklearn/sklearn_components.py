from xai_components.base import InArg, OutArg, InCompArg, Component, BaseComponent, xai_component

@xai_component
class SKLearnLoadDataset(Component):
    """
    Fetches a specified toy dataset from sklearn's dataset module.

    #### Reference:
    - [sklearn toy datasets](https://scikit-learn.org/stable/datasets/toy_dataset.html)

    ##### inPorts:
    - dataset_name: The name of the dataset to be loaded.

    ##### outPorts:
    - dataset: The loaded sklearn toy dataset.

    """
    dataset_name: InCompArg[str]
    dataset: OutArg[any]

    def execute(self, ctx) -> None:

        from sklearn import datasets

        # If the name is already prefixed with "load_", use it as is. Otherwise, add the prefix.
        name = self.dataset_name.value if self.dataset_name.value.startswith("load_") else f"load_{self.dataset_name.value}"
        
        try:
            load_func = getattr(datasets, name)
        except AttributeError:
            raise ValueError(f"No dataset named '{name}' found in sklearn.datasets")
        
        self.dataset.value = load_func()


@xai_component
class SKLearnTrainTestSplit(Component):
    """"
    Takes a sklearn dataset into train and test splits.

    #### Reference:
    - [sklearn.model_selection.train_test_split](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html)

    ##### inPorts:
    - dataset: The input sklearn dataset to be split.
    - train_split: The proportion of the dataset to include in the train split (default is 0.75).
    - random_state: The seed used by the random number generator (default is None).
    - shuffle: Whether or not to shuffle the data before splitting (default is True).
    - stratify: If not None, data is split in a stratified fashion, using this as the class labels (default is None).

    ##### outPorts:
    - X_train: The training data.
    - X_test: The testing data.
    - y_train: The target variable for the training data.
    - y_test: The target variable for the testing data.
    """

    dataset: InCompArg[any]
    train_split: InArg[float]
    random_state: InArg[int]
    shuffle: InArg[bool]
    stratify: InArg[any]
    X_train: OutArg[any] 
    X_test: OutArg[any] 
    y_train: OutArg[any] 
    y_test: OutArg[any] 

    def __init__(self):
        super().__init__()
        self.train_split.value = 0.75
        self.shuffle.value = True

    def execute(self, ctx) -> None:
        
        from sklearn.model_selection import train_test_split

        print(f"Split Parameters:\nTrain Split {self.train_split.value} \nShuffle: {self.shuffle.value} \nRandom State: {self.random_state.value}")
        self.X_train.value, self.X_test.value, self.y_train.value, self.y_test.value = train_test_split(self.dataset.value['data'], self.dataset.value['target'], 
                                    test_size=self.train_split.value, shuffle=self.shuffle.value, 
                                    random_state=self.random_state.value, stratify=self.stratify.value)
        
        print(f"Train data shape: {self.X_train.value.shape}, Train target shape: {self.y_train.value.shape}")
        print(f"Test data shape: {self.X_test.value.shape}, Test target shape: {self.y_test.value.shape}")


@xai_component
class CSVToSKLearnDataset(Component):
    """
    Transforms a CSV file into a format compatible with sklearn.datasets.

    This component reads a CSV file, selects specific columns to use as features and a target, converts it to a pandas DataFrame, and then transforms the DataFrame into a format compatible with sklearn.datasets. If the target column is categorical, it will be label encoded to numerical values.

    #### Reference:
    - [Pandas](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.read_csv.html)
    - [sklearn.datasets](https://scikit-learn.org/stable/datasets/toy_dataset.html)
    - [sklearn LabelEncoder](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.LabelEncoder.html)

    ##### inPorts:
    - file_path: The path to the CSV file to be transformed.
    - feature_columns: The list of columns in the CSV file to use as data. If not specified, all columns except the target will be used.
    - target_column: The column in the CSV file to use as the target variable.
    - drop_na_rows: If set to True, rows with any NA/missing values will be dropped. Defaults to False.

    ##### outPorts:
    - dataset: The sklearn compatible dataset.
    """
    file_path: InArg[str]
    feature_columns: InArg[list]
    target_column: InArg[str]
    drop_na_rows: InArg[bool]
    dataset: OutArg[dict]

    def __init__(self):
        super().__init__()
        self.drop_na_rows.value = False
    
    def execute(self, ctx) -> None:
        import pandas as pd
        from sklearn.preprocessing import LabelEncoder

        df = pd.read_csv(self.file_path.value)

        # If feature_columns are not provided, use all columns except the target_column
        if not self.feature_columns.value:
            self.feature_columns.value = df.columns.drop(self.target_column.value).tolist()

        # Use only selected columns as features
        df = df[self.feature_columns.value + [self.target_column.value]]

        # If drop_na_rows is True, drop any rows with NA/missing values
        if self.drop_na_rows.value:
            df = df.dropna()

        target = df.pop(self.target_column.value)
        # If the target data type is object (likely strings), label encode it
        if target.dtype == 'object':
            le = LabelEncoder()
            target = le.fit_transform(target)

        data = df.values

        self.dataset.value = {
            'data': data,
            'target': target,
            'feature_names': df.columns.tolist(),
            'DESCR': f'Dataset loaded from {self.file_path.value}, target column is {self.target_column.value}'
        }
        
        print(f"Data shape: {data.shape}, Target shape: {target.shape}")


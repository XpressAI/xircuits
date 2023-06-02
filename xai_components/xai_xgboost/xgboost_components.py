from xai_components.base import InArg, OutArg, InCompArg, Component, xai_component

@xai_component
class XGBoostClassifier(Component):
    """
    Trains an XGBoost classifier. Default will use binary logistic.

    #### Reference:
    - [XGBoost](https://xgboost.readthedocs.io/en/latest/python/python_api.html#xgboost.XGBClassifier)

    ##### inPorts:
    - X_train: The training data.
    - y_train: The target variable for the training data.
    - n_estimators: Number of gradient boosted trees. Equivalent to the number of boosting rounds (default is 2).
    - max_depth: Maximum tree depth for base learners (default is 2).
    - learning_rate: Boosting learning rate (default is 1).
    - objective: Specify the learning task and the corresponding learning objective (default is 'binary:logistic').

    ##### outPorts:
    - bst: The trained XGBoost model.
    """

    X_train: InCompArg[any]
    y_train: InCompArg[any]
    n_estimators: InArg[int]
    max_depth: InArg[int]
    learning_rate: InArg[float]
    objective: InArg[str]
    bst: OutArg[any]

    def __init__(self):
        super().__init__()
        self.n_estimators.value = 2
        self.max_depth.value = 2
        self.learning_rate.value = 1
        self.objective.value = 'binary:logistic'

    def execute(self, ctx) -> None:
        from xgboost import XGBClassifier

        self.bst.value = XGBClassifier(n_estimators=self.n_estimators.value, max_depth=self.max_depth.value, 
                                    learning_rate=self.learning_rate.value, objective=self.objective.value)
        self.bst.value.fit(self.X_train.value, self.y_train.value)


@xai_component
class XGBoostPredict(Component):
    """
    Makes predictions using a trained XGBoost classifier and optionally evaluates the accuracy of those predictions.

    #### Reference:
    - [XGBoost](https://xgboost.readthedocs.io/en/latest/python/python_api.html#xgboost.XGBClassifier)

    ##### inPorts:
    - bst: The trained XGBoost model.
    - X_test: The testing data.
    - y_test: The target variable for the testing data. If provided, the accuracy of the predictions is evaluated.

    ##### outPorts:
    - preds: The model's predictions.
    - accuracy: The accuracy of the model's predictions, if y_test was provided.
    """

    bst: InCompArg[any]
    X_test: InCompArg[any]
    y_test: InArg[any]
    preds: OutArg[any]
    accuracy: OutArg[float]

    def execute(self, ctx) -> None:
        from sklearn.metrics import accuracy_score

        self.preds.value = self.bst.value.predict(self.X_test.value)

        if self.y_test.value is not None:
            self.accuracy.value = accuracy_score(self.y_test.value, self.preds.value)
            print(f"Accuracy: {self.accuracy.value * 100:.2f}%")
        else:
            self.accuracy.value = None
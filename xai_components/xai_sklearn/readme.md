# XAI SKLearn Component Library

Xircuits component library for [Scikit Learn](https://scikit-learn.org/stable/index.html). Includes tools for loading, splitting, and transforming data for scikit-learn compatibility. Ideal for ML project setups.

## Prerequisites

- Python 3.8+
- scikit-learn
- pandas
- Xircuits

## Installation

```
xircuits install sklearn
```

You may also install it manually via
```
pip install -r requirements.txt
```

## Components

- **`SKLearnLoadDataset`**: Loads toy datasets from scikit-learn.

- **`SKLearnTrainTestSplit`**: Splits scikit-learn datasets into training and testing sets.

- **`CSVToSKLearnDataset`**: Transforms CSV files to scikit-learn compatible datasets, handles feature and target column selection.

## Usage

Import into your Xircuits workflow to setup an ML project. Use for efficient data preparation in machine learning workflows. Combine with other component libraries for full ML pipeline functionality.


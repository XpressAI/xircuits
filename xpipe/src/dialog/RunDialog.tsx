import * as React from 'react';

export const RunDialog = (): JSX.Element => {

    return (
        <form>
            <label >
                Enter Name:
                <input
                    type="text"
                    id="name"
                    name="name"
                />
            </label>
            <br />
            <label >
                Enter Dataset:
                <input
                    type="text"
                    id="dataset"
                    name="dataset"
                />
            </label>
            <br />
            <label >
                Enter Hyperparameter:
                <input
                    type="text"
                    id="hyperparameter"
                    name="hyperparameter"
                />
            </label>
            <br />
        </form>
    );
}

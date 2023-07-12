import React from 'react';

export const DictInput = ({ title, oldValue }): JSX.Element => {
    return (
        <form>
            <h3 style={{ marginTop: 0, marginBottom: 5 }}>
                Enter Dict Value (Without Brackets):
            </h3>
            <h5 style={{ marginTop: 0, marginBottom: 5 }}>
                For Example: "a": "apple", "b": "banana", "c": 2022
            </h5>
            <input
                name={title}
                style={{ width: 350 }}
                defaultValue={oldValue} />
        </form>
    );
}

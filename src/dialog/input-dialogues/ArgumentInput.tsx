import React from 'react';

export const ArgumentInput = ({ title, oldValue, inputType }): JSX.Element => {
    return (
        <>
            <h3 style={{ marginTop: 0, marginBottom: 5 }}>
                Enter {inputType} Argument Name:
            </h3>
        <input
            name={title}
            style={{ width: 350 }}
            defaultValue={oldValue} />
        </>
    );
}
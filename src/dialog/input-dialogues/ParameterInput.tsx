import React from 'react';

export const ParameterInput = ({ title, oldValue, type }): JSX.Element => {
    return (
        <form>
            <h3 style={{ marginTop: 0, marginBottom: 5 }}>
                Enter {type} Argument Name (Without Quotes):
            </h3>
        <input
            name={title}
            style={{ width: 350 }}
            defaultValue={oldValue} />
        </form>
    );
}
import React from 'react';

export const TupleInput = ({ title, oldValue }): JSX.Element => {
    return (
        <form>
            <h3 style={{ marginTop: 0, marginBottom: 5 }}>
                Enter Tuple Value (Without Brackets):
            </h3>
            <h5 style={{ marginTop: 0, marginBottom: 5 }}>
                For Example: "a", "b", "c"
            </h5>
            <input
                name={title}
                style={{ width: 350 }}
                defaultValue={oldValue} />
        </form>
    );
}

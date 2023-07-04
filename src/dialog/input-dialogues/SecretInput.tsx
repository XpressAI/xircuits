import React from 'react';

export const SecretInput = ({ title, oldValue }): JSX.Element => {
    return (
        <form>
            <h3 style={{ marginTop: 0, marginBottom: 5 }}>
                Enter Secret Value (Without Quotes):
            </h3>
            <h5 style={{ marginTop: 0, marginBottom: 5 }}>
                    Warning: Literal Secrets are masked in the frontend only. <br />
                    They can still be accessed in the raw .xircuits file or appear as strings in the compiled script.
            </h5>
            <input
                name={title}
                type="password"
                style={{ width: 480 }}
                defaultValue={oldValue} />
        </form>

    );
}

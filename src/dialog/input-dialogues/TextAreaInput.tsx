import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

export const TextAreaInput = ({ title, oldValue }): JSX.Element => {
	return (
        <form>
            <h3 style={{ marginTop: 0, marginBottom: 5 }}>
                Enter String Value (Without Quotes):
            </h3>
            <div>
            <TextareaAutosize
                defaultValue={oldValue}
                minRows={14}
                name={title}
                style={{ width: 400, height: 200, fontSize: 12 }}
                autoFocus />
            </div>
    </form>

	);
}

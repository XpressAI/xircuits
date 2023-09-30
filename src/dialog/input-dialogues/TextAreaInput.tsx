import React, { useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

export const TextAreaInput = ({ title, oldValue }): JSX.Element => {
	const textAreaRef = useRef(null);

    // auto focus selector for text area
    useEffect(() => {
        const timer = setTimeout(() => {
            const textarea = textAreaRef.current;
            if (textarea) {
                textarea.focus();
                const length = textarea.value.length;
                textarea.selectionStart = length;
                textarea.selectionEnd = length;
            }
        }, 10); // Delay to ensure the component is fully mounted.
    
        return () => clearTimeout(timer);
    }, []);
    
    

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
                    ref={textAreaRef} />
            </div>
        </form>
	);
}

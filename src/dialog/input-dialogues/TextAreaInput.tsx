import React, { useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

const getHeaderContent = (type) => {
    switch(type) {
      case 'string':
        return <h3 style={{ marginTop: 0, marginBottom: 5 }}>
                  Enter String Value (Without Quotes):
               </h3>;
      case 'dict':
        return <>
                 <h3 style={{ marginTop: 0, marginBottom: 5 }}>
                   Enter Dict Value (Without Brackets):
                 </h3>
                 <h5 style={{ marginTop: 0, marginBottom: 5 }}>
                   For Example: "a": "apple", "b": "banana", "c": 2022
                 </h5>
               </>;
      case 'tuple':
        return <>
                 <h3 style={{ marginTop: 0, marginBottom: 5 }}>
                   Enter Tuple Value (Without Brackets):
                 </h3>
                 <h5 style={{ marginTop: 0, marginBottom: 5 }}>
                   For Example: "a", "b", "c"
                 </h5>
               </>;
      case 'list':
        return <>
                 <h3 style={{ marginTop: 0, marginBottom: 5 }}>
                   Enter List Value (Without Brackets):
                 </h3>
                 <h5 style={{ marginTop: 0, marginBottom: 5 }}>
                   For Example: "a", "b", "c"
                 </h5>
               </>;
      default:
        return <h3 style={{ marginTop: 0, marginBottom: 5 }}>
                  Enter Value:
               </h3>;
    }
  }

export const TextAreaInput = ({ title, oldValue, type, inputType }): JSX.Element => {
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
        <>
            {getHeaderContent(type)}
            <div>
                <TextareaAutosize
                    defaultValue={oldValue}
                    minRows={14}
                    name={title}
                    style={{ width: 400, height: 200, fontSize: 12 }}
                    ref={textAreaRef} />
            </div>
        </>
    );
}
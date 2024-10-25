import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

type OldValueProps = Array<{ role: string, content: string }>;

export const ChatInput = ({ title, oldValue = [], onSubmit }: { 
    title: string, 
    oldValue?: OldValueProps, 
    onSubmit?: (value: Array<{ role: string, content: string }>) => void 
}): JSX.Element => {
    const [messages, setMessages] = useState(
        oldValue.length ? oldValue : [{ role: '', content: '' }]
    );

    const addMessage = () => {
        setMessages([...messages, { role: '', content: '' }]);
    };

    const removeMessage = (index) => {
        setMessages(messages.filter((_, i) => i !== index));
    };

    const updateMessage = (index, field, value) => {
        let newMessages = [...messages];
        newMessages[index][field] = value;
        setMessages(newMessages);
    };

    const gridContainer = {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridGap: '10px',
        padding: '20px',
        width: '400px',
        marginLeft: 'auto',
        marginRight: 'auto',
    };

    const flexContainer = {
        display: 'flex',
        marginBottom: '10px',
    };

    const selectStyle = {
        flex: '1',
    };

    return (
        <div>
            <div style={gridContainer} className="jp-mod-styled">
                <label>Messages</label>
                {messages.map((message, index) => (
                    <div key={index} className="jp-mod-styled">
                        <div style={flexContainer}>
                            <select
                                name={`role-${index}`}
                                value={message.role}
                                onChange={(e) => updateMessage(index, 'role', e.target.value)}
                                style={selectStyle} 
                                className="jp-mod-styled"
                            >
                                <option value="">Select a role</option>
                                <option value="system">system</option>
                                <option value="user">user</option>
                                <option value="assistant">assistant</option>
                                <option value="function">function</option>
                            </select>
                            <button type="button" onClick={() => removeMessage(index)} className="jp-mod-styled">Remove</button>
                        </div>
                        <TextareaAutosize
                            minRows={4}
                            name={`content-${index}`}
                            style={{ width: '100%', fontSize: 12 }}
                            value={message.content}
                            onChange={(e) => updateMessage(index, 'content', e.target.value)}
                            autoFocus />
                    </div>
                ))}
                <button type="button" onClick={addMessage} style={{gridColumn: 'span 1'}} className="jp-mod-styled">Add Message</button>
            </div>
            <input 
                type="hidden" 
                name="attachNode"
                value="off" 
            />
            <input 
                type="hidden" 
                name="value" 
                value={JSON.stringify(messages)} 
            />
        </div>
    );
}
import React, { useState } from 'react';

type OldValueProps = {
    model?: string,
    temperature?: number,
    top_p?: number,
    messages?: Array<{ role: string, content: string }>
}

export const ChatInput = ({ title, oldValue = {} }: { title: string, oldValue?: OldValueProps }): JSX.Element => {
    const [messages, setMessages] = useState(oldValue.messages || [{ role: '', content: '' }]);

    const addMessage = () => {
        setMessages([...messages, { role: '', content: '' }]);
    };
    
    const removeMessage = (index) => {
        setMessages(messages.filter((message, i) => i !== index));
    };
    
    const updateMessage = (index, field, value) => {
        let newMessages = [...messages];
        newMessages[index][field] = value;
        setMessages(newMessages);
    };

    return (
		<form>

			<div className="jp-mod-styled">

			<label className="jp-mod-styled">Messages</label>
			{messages.map((message, index) => (
				<div key={index} className="jp-mod-styled">
				<label className="jp-mod-styled">Role</label>
				<select
					name={`role${index}`}
					value={message.role}
					onChange={(e) => updateMessage(index, 'role', e.target.value)}
					className="jp-mod-styled"
				>
					<option value="system">system</option>
					<option value="user">user</option>
					<option value="assistant">assistant</option>
					<option value="function">function</option>
				</select>

				<label className="jp-mod-styled">Content</label>
				<input
					name={`content${index}`}
					value={message.content}
					onChange={(e) => updateMessage(index, 'content', e.target.value)}
					className="jp-mod-styled"
				/>

				<button type="button" onClick={() => removeMessage(index)} className="jp-mod-styled">Remove</button>
				</div>
			))}

			<button type="button" onClick={addMessage} className="jp-mod-styled">Add Message</button>
			</div>
		</form>
    );
}

import React, { useState } from 'react';

export const ChatInput = ({ title, oldValue }): JSX.Element => {
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
			<div>
			  <label>Model</label>
			  <select name="model" defaultValue={oldValue.model}>
				<option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
				{/* Add other options here as needed */}
			  </select>
		
			  <label>Temperature</label>
			  <input
				name="temperature"
				type="number"
				min="0"
				max="2"
				step="0.01"
				defaultValue={oldValue.temperature}
			  />
		
			  <label>Top_p</label>
			  <input
				name="top_p"
				type="number"
				min="0"
				max="1"
				step="0.01"
				defaultValue={oldValue.top_p}
			  />
		
			  <label>Messages</label>
			  {messages.map((message, index) => (
				<div key={index}>
				  <label>Role</label>
				  <select
					name={`role${index}`}
					value={message.role}
					onChange={(e) => updateMessage(index, 'role', e.target.value)}
				  >
					<option value="system">system</option>
					<option value="user">user</option>
					<option value="assistant">assistant</option>
					<option value="function">function</option>
				  </select>
		
				  <label>Content</label>
				  <input
					name={`content${index}`}
					value={message.content}
					onChange={(e) => updateMessage(index, 'content', e.target.value)}
				  />
		
				  <button type="button" onClick={() => removeMessage(index)}>Remove</button>
				</div>
			  ))}
		
			  <button type="button" onClick={addMessage}>Add Message</button>
			</div>
		  );
		}
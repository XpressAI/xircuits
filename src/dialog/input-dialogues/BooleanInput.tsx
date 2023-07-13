import React, { useState } from 'react';
import Switch from "react-switch";

export const BooleanInput = ({ title, oldValue }): JSX.Element => {
	
	// Initialize based on the oldValue (or its first element if an array).
	// Explicitly compare to 'true' as JS treats non-empty strings as truthy.
	const [checked, setChecked] = useState<boolean>((Array.isArray(oldValue) ? oldValue[0] : oldValue).toLowerCase() === 'true');

	const handleChecked = () => {
		setChecked(!checked);
	};

	return (
		<form>
			<div style={{ paddingLeft: 5, paddingTop: 5 }}>
				<Switch
					checked={checked}
					name={title}
					onChange={handleChecked}
					boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
					handleDiameter={25}
					height={20}
					width={48}
				/>
                <input 
                    type="hidden" 
                    name={title} 
                    value={checked ? 'True' : 'False'}
                />
			</div>
		</form>
	);
}

import React from 'react';

export const NumberInput = ({ title, oldValue, type }): JSX.Element => {
	return (
		<>
            <h3 style={{ marginTop: 0, marginBottom: 5 }}>
				Enter {type == 'float' ? "Float" : "Integer"} Value:
            </h3>
			<input
				name={title}
				type="number"
				step={type == 'float' ? "0.01" : "1"}
				placeholder={type == 'float' ? "0.00" : "0"}
				style={{ width: 350 }}
				defaultValue={oldValue} />
		</>
	);
}

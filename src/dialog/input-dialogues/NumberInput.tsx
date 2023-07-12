import React from 'react';

export const NumberInput = ({ title, oldValue, type }): JSX.Element => {
	return (
		<form>
            <h3 style={{ marginTop: 0, marginBottom: 5 }}>
				Enter {type == 'Float' ? "Float" : "Integer"} Value:
            </h3>
			<input
				name={title}
				type="number"
				step={type == 'Float' ? "0.01" : "1"}
				placeholder={type == 'Float' ? "0.00" : "0"}
				style={{ width: 350 }}
				defaultValue={oldValue} />
		</form>
	);
}

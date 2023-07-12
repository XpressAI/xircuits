import React from 'react';

export const StringInput = ({ title, oldValue }): JSX.Element => {
	return (
		<form>
			<h3 style={{ marginTop: 0, marginBottom: 5 }}>
				Enter String Value (Without Quotes):
			</h3>
		<input
			name={title}
			style={{ width: 350 }}
			defaultValue={oldValue} />
	</form>
	);
}

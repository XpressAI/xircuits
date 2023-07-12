import React, { useState } from 'react';
import Switch from "react-switch";

export const BooleanInput = ({ title, oldValue }): JSX.Element => {
	const [checked, setChecked] = useState<boolean>(true);

	const handleChecked = () => {
		setChecked(!checked);
	};

	return (
		<div style={{ paddingLeft: 5, paddingTop: 5 }}>
			<Switch
				checked={checked}
				name={title}
				onChange={() => handleChecked()}
				boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
				handleDiameter={25}
				height={20}
				width={48}
			/>
		</div>
	);
}
import React from 'react';

export const VariableInput = ({ title, oldValue }): JSX.Element => {
	return (
        <form>
			<h5 style={{ marginTop: 0, marginBottom: 5 }}>
						<p>Determine your variable type by inserting the first char as below: </p>
						<li> " : String</li>
						<li> # : Integer or Float</li>
						<li> [ : List</li>
						<li> ( : Tuple</li>
						<li> {'{'} : Dict</li>
						<li> !true / !True / !1 / !t : True</li>
						<li> !false / !False / !0 / !nil : False</li>
						<p>For Example: "Hello World or #15 or !true</p>
					</h5>
			<input
				name={title}
				style={{ width: 350 }}
				defaultValue={oldValue} />
		</form>
	);
}

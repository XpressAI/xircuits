import * as NumericInput from "react-numeric-input";
import TextareaAutosize from 'react-textarea-autosize';
import React, { useState } from 'react';
import Switch from "react-switch";

export const RunDialog = ({
	childSparkSubmitNodes,
	childStringNodes,
	childBoolNodes,
	childIntNodes,
	childFloatNodes
}): JSX.Element => {

	const [checked, setChecked] = useState<boolean[]>([false]);

	const handleChecked = (e, i) => {
		let newChecked = [...checked];
		newChecked[i] = e;
		setChecked(newChecked);
		console.log("Boolean change: ", checked)
	};

	return (
		<form>
			<h3 style={{ marginTop: 0, marginBottom: 5 }}>Hyperparameter:</h3>
			<div>
				{childSparkSubmitNodes.length != 0 ?
					<><div><h4 style={{ marginTop: 2, marginBottom: 0 }}>Spark Submit</h4></div><div>{childSparkSubmitNodes}
						<div>
							<TextareaAutosize
								minRows={3}
								maxRows={8}
								name={childSparkSubmitNodes}
								style={{ width: 205, fontSize: 12 }}
								autoFocus />
						</div>
					</div></>
					: null}
			</div>
			<div></div>
			<div><h4 style={{ marginTop: 2, marginBottom: 0 }}>String</h4></div>
			{childStringNodes.map((stringNode, i) =>
				<div key={`index-${i}`}>{stringNode}
					<div>
						<input
							type="text"
							name={stringNode}
						/>
					</div>
				</div>)}
			<div>
				{
					childBoolNodes.length != 0 ?
						<><br /><h4 style={{ marginTop: 2, marginBottom: 0 }}>Boolean</h4></> : null
				}
			</div>
			{childBoolNodes.map((boolNode, i) =>
				<div key={`index-${i}`}>{boolNode}
					<div>
						<Switch
							checked={checked[i] || false}
							name={boolNode}
							onChange={(e) => handleChecked(e, i)}
							handleDiameter={25}
							height={20}
							width={48}
						/>
					</div>
				</div>)}
			<div>
				{
					childIntNodes.length != 0 ?
						<><br /><h4 style={{ marginTop: 2, marginBottom: 0 }}>Integer</h4></> : null
				}
			</div>
			{childIntNodes.map((intNode, i) =>
				<div key={`index-${i}`}>{intNode}
					<div>
						<NumericInput
							className="form-control"
							name={intNode}
							value={'0'}
							min={0}
							step={1}
							precision={0}
							mobile={true}
							style={{
								wrap: {
									boxShadow: '0 0 1px 1px #fff inset, 1px 1px 5px -1px #000',
									padding: '2px 2.26ex 2px 2px',
									borderRadius: '6px 3px 3px 6px',
									fontSize: 20,
									width: '10vw'
								},
								input: {
									borderRadius: '6px 3px 3px 6px',
									padding: '0.1ex 1ex',
									border: '#ccc',
									marginRight: 4,
									display: 'block',
									fontWeight: 100,
									width: '11.3vw'
								},
								plus: {
									background: 'rgba(255, 255, 255, 100)'
								},
								minus: {
									background: 'rgba(255, 255, 255, 100)'
								},
								btnDown: {
									background: 'rgba(0, 0, 0)'
								},
								btnUp: {
									background: 'rgba(0, 0, 0)'
								}
							}}
						/>
					</div>
				</div>)}
			<div>
				{
					childFloatNodes.length != 0 ?
						<><br /><h4 style={{ marginTop: 2, marginBottom: 0 }}>Float</h4></> : null
				}
			</div>
			{childFloatNodes.map((floatNode, i) =>
				<div className="p-col-12" key={`index-${i}`}>{floatNode}
					<div>
						<NumericInput
							className="form-control"
							name={floatNode}
							value={'0.00'}
							min={0}
							step={0.1}
							precision={2}
							mobile={true}
							style={{
								wrap: {
									boxShadow: '0 0 1px 1px #fff inset, 1px 1px 5px -1px #000',
									padding: '2px 2.26ex 2px 2px',
									borderRadius: '6px 3px 3px 6px',
									fontSize: 20,
									width: '10vw'
								},
								input: {
									borderRadius: '6px 3px 3px 6px',
									padding: '0.1ex 1ex',
									border: '#ccc',
									marginRight: 4,
									display: 'block',
									fontWeight: 100,
									width: '11.3vw'
								},
								plus: {
									background: 'rgba(255, 255, 255, 100)'
								},
								minus: {
									background: 'rgba(255, 255, 255, 100)'
								},
								btnDown: {
									background: 'rgba(0, 0, 0)'
								},
								btnUp: {
									background: 'rgba(0, 0, 0)'
								}
							}}
						/>
					</div>
				</div>)}
		</form>
	);
}

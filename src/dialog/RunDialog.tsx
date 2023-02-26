import * as NumericInput from "react-numeric-input";
import TextareaAutosize from 'react-textarea-autosize';
import React, { useEffect, useState } from 'react';
import Switch from "react-switch";
import { HTMLSelect } from "@jupyterlab/ui-components";

export const RunDialog = ({
	runTypes,
	runConfigs,
	lastConfig,
	childStringNodes,
	childBoolNodes,
	childIntNodes,
	childFloatNodes
}): JSX.Element => {

	const [checked, setChecked] = useState<boolean[]>([false]);
	const [runType, setRunType] = useState("");
	const [runConfig, setRunConfig] = useState("");
	const [command, setCommand] = useState("");

	const handleChecked = (e, i) => {
		let newChecked = [...checked];
		newChecked[i] = e;
		setChecked(newChecked);
		console.log("Boolean change: ", checked)
	};

	/**
	 * Handle `change` events for the HTMLSelect component of run type.
	 */
	const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
		let type = event.target.value;
		setRunType(type);
		setRunConfig("-");
		setCommand("");
	};

	/**
	 * Handle `change` events for the HTMLSelect component for run config.
	 */
	const handleConfigChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
		let configName = event.target.value;
		setRunConfig(configName);
		if (configName == "-") {
			setCommand("");
		}
	};

	useEffect(() => {
		if (runTypes.length != 0) {
			setRunType(runTypes[0].run_type);
		}

		if (lastConfig.length != 0) {
			setRunType(lastConfig.run_type);
			setRunConfig(lastConfig.run_config_name);
			setCommand(lastConfig.command);
		}
	}, [])

	useEffect(() => {
		if (runConfigs.length != 0) {
			runConfigs.map(c => {
				if (c.run_config_name == runConfig) setCommand(c.command);
			})
		}
	}, [runConfig])

	return (
		<form>
			{childStringNodes.length > 0 ? <h3 style={{ marginTop: 0, marginBottom: 5 }}>Arguments:</h3> : null}
			<div>{runConfigs.length != 0 ?
				<><h4 style={{ marginTop: 2, marginBottom: 0 }}>Remote Execution</h4>
					<div>Available Run Type:
						<HTMLSelect
							onChange={(e) => handleTypeChange(e)}
							value={runType}
							aria-label={'Available Run Types'}
							title={'Select the run type'}
							name='runType'
						>
							{runTypes.map((type, i) => (
								<option id={type.id} key={`index-type-${i}`} value={type.run_type}>
									{(type.run_type)}
								</option>
							))}
						</HTMLSelect>
					</div>
					<div>Available Run Config:
						<HTMLSelect
							onChange={(e) => handleConfigChange(e)}
							value={runConfig}
							aria-label={'Run Configuration'}
							title={'Select which config to run'}
							name='runConfig'
						>
							<option value="-">-</option>
							{runConfigs.map((c, i) => ((c.run_type == runType) ?
								<option id={c.id} key={`index-config-${i}`} value={c.run_config_name}>
									{(c.run_config_name)}
								</option> : null
							))}
						</HTMLSelect>
					</div>
					Configuration:
					<div>
						<TextareaAutosize
							value={command}
							minRows={10}
							name='command'
							style={{ width: 350, fontSize: 12 }}
							readOnly />
					</div></>
				: null}
			</div>
			<div></div>
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
							checked={checked[i] ?? true}
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
									width: '60%'
								},
								input: {
									borderRadius: '6px 3px 3px 6px',
									padding: '0.1ex 1ex',
									border: '#ccc',
									marginRight: 4,
									display: 'block',
									fontWeight: 100,
									width: '100%'
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
									width: '60%'
								},
								input: {
									borderRadius: '6px 3px 3px 6px',
									padding: '0.1ex 1ex',
									border: '#ccc',
									marginRight: 4,
									display: 'block',
									fontWeight: 100,
									width: '100%'
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

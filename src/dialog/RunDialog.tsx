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
	const [placeholders, setPlaceholders] = useState<string[]>([]);
	const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

	const handleChecked = (e, i) => {
		let newChecked = [...checked];
		newChecked[i] = e;
		setChecked(newChecked);
		console.log("Boolean change: ", checked);
	};

	const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
		let type = event.target.value;
		setRunType(type);
		setRunConfig("-");
		setCommand("");
		setPlaceholders([]);
	};

	const handleConfigChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
		let configName = event.target.value;
		setRunConfig(configName);
		if (configName === "-") {
			setCommand("");
			setPlaceholders([]);
		}
	};

	useEffect(() => {
		if (runTypes.length !== 0) {
			setRunType(runTypes[0].run_type);
		}

		if (lastConfig.length !== 0) {
			setRunType(lastConfig.run_type);
			setRunConfig(lastConfig.run_config_name);
			setCommand(lastConfig.command);
			extractPlaceholders(lastConfig.command);
		}
	}, []);

	useEffect(() => {
		if (runConfigs.length !== 0) {
			runConfigs.map(c => {
				if (c.run_config_name === runConfig) {
					setCommand(c.command);
					extractPlaceholders(c.command);
				}
			});
		}
	}, [runConfig]);

	const extractPlaceholders = (cmd: string) => {
		const matches = cmd.match(/{[^}]+}/g);
		if (matches) {
			const cleanedMatches = matches.map(match => match.replace(/[{}]/g, ''));
			setPlaceholders(cleanedMatches);

			// Initialize inputValues with empty strings for each placeholder
			const initialValues = cleanedMatches.reduce((acc, placeholder) => {
				acc[placeholder] = "";
				return acc;
			}, {});
			setInputValues(initialValues);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, placeholder: string) => {
		const newInputValues = { ...inputValues, [placeholder]: e.target.value };
		setInputValues(newInputValues);
	};

	const renderTemplateInputFields = () => {
		return placeholders.map((placeholder, i) => (
			<div key={`placeholder-${i}`}>
				<label>{placeholder}</label>
				<div>
					<input
						type="text"
						name={placeholder}
						value={inputValues[placeholder]}
						onChange={(e) => handleInputChange(e, placeholder)}
						style={runDialogStyle.form.input}
					/>
				</div>
			</div>
		));
	};

	return (
		<form>
			{childStringNodes.length > 0 ? <h3 style={runDialogStyle.form.subheader}>Arguments:</h3> : null}
			<div>{runConfigs.length !== 0 ?
				<><h4 style={runDialogStyle.form.header}>Remote Execution</h4>
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
							{runConfigs.map((c, i) => ((c.run_type === runType) ?
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
							style={runDialogStyle.form.textarea}
							readOnly />
					</div></>
				: null}
			</div>
			{renderTemplateInputFields()}
			<div></div>
			{childStringNodes.map((stringNode, i) =>
				<div key={`index-${i}`}>{stringNode}
					<div>
						<input
							type="text"
							name={stringNode}
							// style={runDialogStyle.form.input}
						/>
					</div>
				</div>)}
			<div>
				{
					childBoolNodes.length != 0 ?
						<><br /><h4 style={runDialogStyle.form.header}>Boolean</h4></> : null
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
						<><br /><h4 style={runDialogStyle.form.header}>Integer</h4></> : null
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
							style={runDialogStyle.form}
						/>
					</div>
				</div>)}
			<div>
				{
					childFloatNodes.length != 0 ?
						<><br /><h4 style={runDialogStyle.form.header}>Float</h4></> : null
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
							style={runDialogStyle.form}
						/>
					</div>
				</div>)}
		</form>
	);
}

const runDialogStyle = {
	form: {
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
		},
		textarea: {
			width: 350,
			fontSize: 12
		},
		header: {
			marginTop: 2,
			marginBottom: 0
		},
		subheader: {
			marginTop: 0,
			marginBottom: 5
		}
	}
};

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

	const [checkedState, setCheckedState] = useState<{ [key: string]: boolean }>({});
	const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
	const [runType, setRunType] = useState("");
	const [runConfig, setRunConfig] = useState("");
	const [command, setCommand] = useState("");
	const [placeholders, setPlaceholders] = useState<string[]>([]);


	const handleChecked = (name: string) => {
		setCheckedState(prev => {
			const newState = { ...prev, [name]: !prev[name] };
			console.log("Boolean change for", name, ":", newState[name]);
			return newState;
		});
	};

	const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
		const type = event.target.value;
		setRunType(type);
		setRunConfig("-");
		setCommand("");
		setPlaceholders([]);
		setInputValues({});
	};

	const handleConfigChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
		const configName = event.target.value;
		setRunConfig(configName);
		if (configName === "-") {
			setCommand("");
			setPlaceholders([]);
			setInputValues({});
		} else {
			const selectedConfig = runConfigs.find(config => config.run_config_name === configName);
			if (selectedConfig) {
			setCommand(selectedConfig.command);
			const extractedPlaceholders = extractPlaceholders(selectedConfig.command);
			setPlaceholders(extractedPlaceholders);
			setInputValues(prefillInputValues(selectedConfig, extractedPlaceholders));
			}
		}
	};

	useEffect(() => {
		if (runTypes.length > 0) {
			setRunType(runTypes[0].run_type);
		}

		if (lastConfig) {
			setRunType(lastConfig.run_type);
			setRunConfig(lastConfig.run_config_name);
			setCommand(lastConfig.command);
			const extractedPlaceholders = extractPlaceholders(lastConfig.command);
			setPlaceholders(extractedPlaceholders);
			setInputValues(prefillInputValues(lastConfig, extractedPlaceholders));
		}
	}, []);

	const extractPlaceholders = (cmd: string): string[] => {
		const matches = cmd.match(/{[^}]+}/g) || [];
		return matches.map(match => match.replace(/[{}]/g, ''));
	};

	const prefillInputValues = (config: any, placeholders: string[]): { [key: string]: string } => {
		const newInputValues: { [key: string]: string } = {};
		placeholders.forEach(placeholder => {
			newInputValues[placeholder] = config[placeholder] || "";
		});
		return newInputValues;
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
		setInputValues(prev => ({ ...prev, [name]: e.target.value }));
	};

	const gatherAndFilterNames = () => {
		const allNames = [
			...childStringNodes,
			...childBoolNodes,
			...childIntNodes,
			...childFloatNodes,
			...placeholders,
		];

		const uniqueNames = Array.from(new Set(allNames));
		const nameTypeMap = new Map();

		uniqueNames.forEach(name => {
			if (childStringNodes.includes(name)) nameTypeMap.set(name, 'string');
			else if (childBoolNodes.includes(name)) nameTypeMap.set(name, 'bool');
			else if (childIntNodes.includes(name)) nameTypeMap.set(name, 'int');
			else if (childFloatNodes.includes(name)) nameTypeMap.set(name, 'float');
			else nameTypeMap.set(name, 'placeholder');
		});

		return { uniqueNames, nameTypeMap };
	};

	const { uniqueNames, nameTypeMap } = gatherAndFilterNames();

	const renderInputField = (name: string, type: string, index: number) => {
		const defaultValue = inputValues[name] || '';
		
		switch (type) {
			case 'string':
				return (
					<div key={`index-string-${index}`}>
						{name}
						<div>
							<input
								type="text"
								name={name}
								value={defaultValue}
								onChange={(e) => handleInputChange(e, name)}
								style={runDialogStyle.form.input}
							/>
						</div>
					</div>
				);
			case 'bool':
				return (
					<div key={`index-bool-${index}`}>
						{name}
						<div>
							<Switch
								checked={checkedState[name] || false}
								name={name}
								onChange={() => handleChecked(name)}
								handleDiameter={25}
								height={20}
								width={48}
							/>
							<input 
								type="hidden" 
								name={name} 
								value={(checkedState[name] || false) ? 'True' : 'False'}
							/>
						</div>
					</div>
				)
			case 'int':
				return (
					<div key={`index-int-${index}`}>
						{name}
						<div>
							<NumericInput
								className="form-control"
								name={name}
								value={defaultValue || '0'}
								min={0}
								step={1}
								precision={0}
								mobile={true}
								onChange={(value) => setInputValues(prev => ({ ...prev, [name]: value }))}
								style={runDialogStyle.form}
							/>
						</div>
					</div>
				);
			case 'float':
				return (
					<div key={`index-float-${index}`}>
						{name}
						<div>
							<NumericInput
								className="form-control"
								name={name}
								value={defaultValue || '0.00'}
								min={0}
								step={0.1}
								precision={2}
								mobile={true}
								onChange={(value) => setInputValues(prev => ({ ...prev, [name]: value }))}
								style={runDialogStyle.form}
							/>
						</div>
					</div>
				);
			case 'placeholder':
				return (
					<div key={`placeholder-${index}`}>
						<label>{name}</label>
						<div>
							<input
								type="text"
								name={name}
								value={defaultValue}
								onChange={(e) => handleInputChange(e, name)}
								style={runDialogStyle.form.input}
							/>
						</div>
					</div>
				);
		}
	};

	return (
		<form>
			{uniqueNames.length > 0 && <h3 style={runDialogStyle.form.subheader}>Arguments:</h3>}
			<div>
				{runConfigs.length !== 0 && (
					<>
						<h4 style={runDialogStyle.form.header}>Remote Execution</h4>
						<div>
							Available Run Type:
							<HTMLSelect
								onChange={(e) => handleTypeChange(e)}
								value={runType}
								aria-label={'Available Run Types'}
								title={'Select the run type'}
								name='runType'
							>
								{runTypes.map((type, i) => (
									<option id={type.id} key={`index-type-${i}`} value={type.run_type}>
									{type.run_type}
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
								{runConfigs.map((c, i) => (
									c.run_type === runType && (
										<option id={c.id} key={`index-config-${i}`} value={c.run_config_name}>
											{c.run_config_name}
										</option>
									)
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
								readOnly
							/>
						</div>
					</>
				)}
			</div>
			{uniqueNames.map((name, index) => renderInputField(name, nameTypeMap.get(name), index))}
		</form>
	);
};

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

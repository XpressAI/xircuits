import TextareaAutosize from 'react-textarea-autosize';
import React, { useState } from 'react';
import { formDialogWidget } from "./formDialogwidget";
import { Dialog } from '@jupyterlab/apputils';
import Switch from "react-switch";

export function inputDialog(titleName: string, oldValue: any, type: string, isStoreDataType?: boolean, inputType?: string) {
	let title = titleName;
	const dialogOptions: Partial<Dialog.IOptions<any>> = {
		title,
		body: formDialogWidget(
			<LiteralInputDialog
				title={titleName}
				oldValue={oldValue}
				type={type}
				isStoreDataType={isStoreDataType}
				inputType={inputType} />
		),
		buttons: [Dialog.cancelButton(), Dialog.okButton({ label: ('Submit') })],
		defaultButton: 1,
		focusNodeSelector: inputType == 'textarea' ? 'textarea' : 'input'
	};
	return dialogOptions;
}

export const LiteralInputDialog = ({ title, oldValue, type, isStoreDataType, inputType }): JSX.Element => {

	const [checked, setChecked] = useState<boolean>(true);

	const handleChecked = () => {
		setChecked(!checked);
	};

	function DictExample() {
		if (type == 'Dict') {
			return (
				<h5 style={{ marginTop: 0, marginBottom: 5 }}>
					For Example: "a": "apple", "b": "banana", "c": 2022
				</h5>
			);
		} else if (type == 'List' || type == 'Tuple') {
			return (
				<h5 style={{ marginTop: 0, marginBottom: 5 }}>
					For Example: "a", "b", "c"
				</h5>
			);
		}
		return null;
	}

	function InputValueDialog() {
		if (inputType == 'textarea') {
			return (
				<div>
					<TextareaAutosize
						defaultValue={oldValue}
						minRows={14}
						name={title}
						style={{ width: 400, height: 200, fontSize: 12 }}
						autoFocus />
				</div>
			);
		} else if (type == 'Integer' || type == 'Float') {
			return (
				<input
					name={title}
					type="number"
					step={type == 'Float' ? "0.01" : "1"}
					placeholder={type == 'Float' ? "0.00" : "0"}
					style={{ width: 350 }}
					defaultValue={oldValue} />
			);
		} else if (type == 'Boolean') {
			return (
				<div style={{ paddingLeft: 5 }}>
					<Switch
						checked={checked}
						name={title}
						onChange={() => handleChecked()}
						handleDiameter={25}
						height={20}
						width={48}
					/>
				</div>
			);
		} else if (
			(type == 'String' && inputType != 'textarea') ||
			type == 'List' ||
			type == 'Tuple' ||
			type == 'Dict'
		) {
			return (
				<input
					name={title}
					style={{ width: 350 }}
					defaultValue={oldValue} />
			);
		}
		return null;
	}

	return (
		<form>
			{type != 'Boolean' ?
				<h3 style={{ marginTop: 0, marginBottom: 5 }}>
					Enter {title.includes('parameter') ? 'Hyperparameter Name' : `${type} Value`} ({isStoreDataType ? 'Without Brackets' : 'Without Quotes'}):
				</h3>
				: null}
			<DictExample />
			<InputValueDialog />
		</form>
	);
}

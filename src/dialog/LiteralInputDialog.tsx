import TextareaAutosize from 'react-textarea-autosize';
import React, { useState } from 'react';
import { formDialogWidget } from "./formDialogwidget";
import { Dialog } from '@jupyterlab/apputils';
import Switch from "react-switch";
import { showFormDialog } from './FormDialog';
import { cancelDialog } from '../tray_library/GeneralComponentLib';

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

export async function getItsLiteralType(){
	// When inPort is 'any' type, get the correct literal type based on the first character inputed
	let nodeType: string;
	let varOfAnyTypeTitle = 'Enter your variable value';
	const dialogOptions = inputDialog(varOfAnyTypeTitle, "", 'Variable');
	const dialogResult = await showFormDialog(dialogOptions);
	if (cancelDialog(dialogResult)) return;
	const varValue = dialogResult["value"][varOfAnyTypeTitle];
	const varType = varValue.charAt(0);
	const varInput : string = varValue.slice(1);
	let errorMsg : string;
	switch (varType) {
		case '"':
			nodeType = 'String';
			break;
		case '#':
			const isInputFloat = varInput.search('.');
			let onlyNum = Number(varInput);
			if (isNaN(onlyNum)){
				errorMsg = `Variable's input (${varInput}) contain non-numeric value. Only allow '.' for Float` ;
				break;
			}
			if (isInputFloat == 0) {
				nodeType = 'Float';
			} else {
				nodeType = 'Integer';
			}
			break;
		case '[':
			nodeType = 'List';
			break;
		case '(':
			nodeType = 'Tuple';
			break;
		case '{':
			nodeType = 'Dict';
			break;
		case '!':
			let boolValue = varValue.slice(1);
			switch (boolValue) {
				case 'true':
				case 'True':
				case '1':
				case 't':
					nodeType = 'True';
					break;
				case 'false':
				case 'False':
				case '0':
				case 'nil':
					nodeType = 'False';
					break;
			}
			break;
		default:
			// When type is undefined, show error
			errorMsg = `Type is undefined or not provided. Please insert the first chararacter as shown in example` ;
			break;
	}
	return { nodeType, varInput, errorMsg}
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
		} else if (type == 'Variable'){
			let dictSymbol = '{';
			return (
				<h5 style={{ marginTop: 0, marginBottom: 5 }}>
					<p>Determine your variable type by inserting the first char as below: </p>
					<li> " : String</li>
					<li> # : Integer</li>
					<li> # with '.' : Float</li>
					<li> [ : List</li>
					<li> ( : Tuple</li>
					<li> {dictSymbol} : Dict</li>
					<li> !true / !True / !1 / !t : True</li>
					<li> !false / !False / !0 / !nil : False</li>
					<p>For Example: "Hello World or #15 or !true</p>
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
				<div style={{ paddingLeft: 5, paddingTop: 5}}>
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
		} else if (
			(type == 'String' && inputType != 'textarea') ||
			type == 'List' ||
			type == 'Tuple' ||
			type == 'Dict' || 
			type == 'Variable'
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
			{type != 'Boolean' && type != 'Variable' ?
				<h3 style={{ marginTop: 0, marginBottom: 5 }}>
					Enter {title.includes('parameter') ? 'Hyperparameter Name' : `${type} Value`} ({isStoreDataType ? 'Without Brackets' : 'Without Quotes'}):
				</h3>
				: null}
			<DictExample />
			<InputValueDialog />
		</form>
	);
}

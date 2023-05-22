import TextareaAutosize from 'react-textarea-autosize';
import React, { useState } from 'react';
import { formDialogWidget } from "./formDialogwidget";
import { Dialog } from '@jupyterlab/apputils';
import Switch from "react-switch";
import { showFormDialog } from './FormDialog';
import { cancelDialog } from '../tray_library/GeneralComponentLib';
import { checkInput } from '../helpers/InputSanitizer';

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
	let varOfAnyTypeTitle = 'Enter your variable value';
	const dialogOptions = inputDialog(varOfAnyTypeTitle, "", 'Variable');
	const dialogResult = await showFormDialog(dialogOptions);
	if (cancelDialog(dialogResult)) return;
	let varValue = dialogResult["value"][varOfAnyTypeTitle];
	let varType = varValue.charAt(0);
	let varInput : string = varValue.slice(1);
	let nodeType = varTypeChecker(varType, varInput, varValue);
	
	while (!checkInput(varInput, nodeType)){

		const dialogOptions = inputDialog(varOfAnyTypeTitle, varValue, 'Variable');
		const dialogResult = await showFormDialog(dialogOptions);
		
		if (cancelDialog(dialogResult)) return;
		varValue = dialogResult["value"][varOfAnyTypeTitle];
		varType = varValue.charAt(0);
		varInput = varValue.slice(1);
		 nodeType = varTypeChecker(varType, varInput, varValue);

	}

	return { nodeType, varInput }
}

export const LiteralInputDialog = ({ title, oldValue, type, isStoreDataType, inputType }): JSX.Element => {

	const [checked, setChecked] = useState<boolean>(true);

	const handleChecked = () => {
		setChecked(!checked);
	};

	function InputDialogueMessageDisplay() {
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
		} else if (type == 'Secret') {
			return (
				<h5 style={{ marginTop: 0, marginBottom: 5 }}>
					Warning: Literal Secrets are masked in the frontend only. <br />
					They can still be accessed in the raw .xircuits file or appear as strings in the compiled script.
				</h5>
			);
		} else if (type == 'Variable'){
			return (
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
		} else if (type == 'Secret') {
        return (
            <input
                name={title}
                type="password"
                style={{ width: 480 }}
                defaultValue={oldValue} />
        );
    }
		return null;
	}

	return (
		<form>
			{type != 'Boolean' && type != 'Variable' ?
				<h3 style={{ marginTop: 0, marginBottom: 5 }}>
					Enter {title.includes('parameter') ? 'Argument Name' : `${type} Value`} ({isStoreDataType ? 'Without Brackets' : 'Without Quotes'}):
				</h3>
				: null}
			<InputDialogueMessageDisplay />
			<InputValueDialog />
		</form>
	);
}

function varTypeChecker(varType, varInput, varValue){
    const typeCheckDict = {
        '"': () => 'String',
        '#': () => Number.isInteger(Number(varInput)) ? 'Integer' : 'Float',
        '[': () => 'List',
        '(': () => 'Tuple',
        '{': () => 'Dict',
        '!': () => {
            let boolValue = varValue.slice(1).toLowerCase();
            if (boolValue === 'true' || boolValue === '1' || boolValue === 't') {
                return 'True';
            } else if (boolValue === 'false' || boolValue === '0' || boolValue === 'nil') {
                return 'False';
            }
        }
    };

    let nodeType = typeCheckDict[varType] ? typeCheckDict[varType]() : 'undefined_any';

    if (nodeType == 'undefined_any') {
        console.error(`Type is undefined or not provided. Please insert the first character as shown in example.`);
    }

    return nodeType;
}
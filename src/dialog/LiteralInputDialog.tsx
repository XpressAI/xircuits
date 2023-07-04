import React from 'react';
import { formDialogWidget } from "./formDialogwidget";
import { Dialog } from '@jupyterlab/apputils';
import { showFormDialog } from './FormDialog';
import { cancelDialog } from '../tray_library/GeneralComponentLib';
import { checkInput } from '../helpers/InputSanitizer';
import { BooleanInput } from './input-dialogues/BooleanInput';
import { StringInput } from './input-dialogues/StringInput';
import { TextAreaInput } from './input-dialogues/TextAreaInput';
import { NumberInput } from './input-dialogues/NumberInput';
import { DictInput } from './input-dialogues/DictInput';
import { TupleInput } from './input-dialogues/TupleInput';
import { ListInput } from './input-dialogues/ListInput';
import { ChatInput } from './input-dialogues/ChatInput';
import { SecretInput } from './input-dialogues/SecretInput';
import { VariableInput } from './input-dialogues/VariableInput';
import { ParameterInput } from './input-dialogues/ParameterInput';

  
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

	const inputComponents = {
		textarea: TextAreaInput,
		Integer: NumberInput,
		Float: NumberInput,
		Boolean: BooleanInput,
		String: StringInput,
		Dict: DictInput,
		List: ListInput,
		Tuple: TupleInput,
		Variable: VariableInput,
		Secret: SecretInput,
		Chat: ChatInput,
		Parameter: ParameterInput,
	};

	const InputValueDialog = () => {
		const InputComponent = inputComponents[inputType === 'textarea' ? inputType : type];
		
		// The `type` prop is now passed to all components
		const extraProps = { type };

		return InputComponent ? <InputComponent title={title} oldValue={oldValue} {...extraProps} /> : null;
	}

	return <InputValueDialog />;
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
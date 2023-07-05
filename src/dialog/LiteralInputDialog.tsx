import React from 'react';
import { formDialogWidget } from "./formDialogwidget";
import { Dialog } from '@jupyterlab/apputils';
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

export interface InputDialogueProps {
	title: string;
	oldValue: any;
	type: string;
	inputType?: string;
  }
  
export function inputDialog({ title, oldValue, type, inputType }: InputDialogueProps) {
	const dialogOptions: Partial<Dialog.IOptions<any>> = {
		title,
		body: formDialogWidget(
			<LiteralInputDialog
				title={title}
				oldValue={oldValue}
				type={type}
				inputType={inputType} />
		),
		buttons: [Dialog.cancelButton(), Dialog.okButton({ label: ('Submit') })],
		defaultButton: 1,
		focusNodeSelector: inputType == 'textarea' ? 'textarea' : 'input'
	};
	return dialogOptions;
}

export const LiteralInputDialog = ({ title, oldValue, type, inputType }): JSX.Element => {

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
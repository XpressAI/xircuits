import React, { useState } from "react";
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
import { ArgumentInput } from './input-dialogues/ArgumentInput';

export interface InputDialogueProps {
	title: string;
	oldValue: any;
	type: string;
	inputType?: string;
	attached?: boolean;
	showAttachOption?: boolean;
}
  
export function inputDialog({ title, oldValue, type, inputType, attached, showAttachOption }: InputDialogueProps) {
	const dialogOptions: Partial<Dialog.IOptions<any>> = {
		title,
		body: formDialogWidget(
			<LiteralInputDialog
				title={title}
				oldValue={oldValue}
				type={type}
				inputType={inputType}
				attached={attached}
				showAttachOption={showAttachOption}
			/>
		),
		buttons: [Dialog.cancelButton(), Dialog.okButton({ label: ('Submit') })],
		defaultButton: 1,
		focusNodeSelector: inputType == 'textarea' ? 'textarea' : 'input'
	};
	return dialogOptions;
}

export const LiteralInputDialog = ({ title, oldValue, type, inputType, attached, showAttachOption }): JSX.Element => {

	const inputComponents = {
		textarea: TextAreaInput,
		int: NumberInput,
		integer: NumberInput,
		float: NumberInput,
		boolean: BooleanInput,
		string: TextAreaInput,
		dict: TextAreaInput,
		list: TextAreaInput,
		tuple: TextAreaInput,
		variable: VariableInput,
		secret: SecretInput,
		chat: ChatInput,
		argument: ArgumentInput,
	};

	const InputValueDialog = () => {
		const [attach, setAttach] = useState(attached || false)
		const InputComponent = inputComponents[inputType === 'textarea' ? inputType.toLowerCase() : type.toLowerCase()];

		// The `type` prop is now passed to all components
		const extraProps = { type, inputType };

		return InputComponent ? (<form style={{display: 'flex', flexDirection: "column", gap: "1em"}}>
			<InputComponent title={title} oldValue={oldValue} {...extraProps} />
			{InputComponent === ArgumentInput || !showAttachOption ? null : (<label>
				<input type="checkbox" name="attachNode" checked={attach} value={attach ? "on" : "off"} onChange={() => setAttach(!attach)} />
				Attach Node?
			</label>)}
		</form>) : null;
	}

	return <InputValueDialog />;
}
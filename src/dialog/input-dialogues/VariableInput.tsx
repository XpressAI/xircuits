import React from 'react';
import { checkInput } from '../../helpers/InputSanitizer';
import { inputDialog } from '../LiteralInputDialog'
import { showFormDialog } from '../FormDialog';
import { cancelDialog } from '../../tray_library/GeneralComponentLib';

export const VariableInput = ({ title, oldValue }): JSX.Element => {
	return (
        <>
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
			<input
				name={title}
				style={{ width: 350 }}
				defaultValue={oldValue} />
		</>
	);
}


export async function getItsLiteralType(){
	// When inPort is 'any' type, get the correct literal type based on the first character inputed
	let varOfAnyTypeTitle = 'Enter your variable value';
	let dialogOptions = inputDialog({ title: varOfAnyTypeTitle, oldValue: "", type: 'variable' });
	const dialogResult = await showFormDialog(dialogOptions);
	if (cancelDialog(dialogResult)) return;
	let varValue = dialogResult["value"][varOfAnyTypeTitle];
	let varType = varValue.charAt(0);
	let varInput : string = varValue.slice(1);
	let nodeType = varTypeChecker(varType, varInput, varValue);
	
	while (!checkInput(varInput, nodeType)){

		let dialogOptions = inputDialog({ title: varOfAnyTypeTitle, oldValue: "", type: 'Variable' });
		const dialogResult = await showFormDialog(dialogOptions);
		
		if (cancelDialog(dialogResult)) return;
		varValue = dialogResult["value"][varOfAnyTypeTitle];
		varType = varValue.charAt(0);
		varInput = varValue.slice(1);
		nodeType = varTypeChecker(varType, varInput, varValue);

	}

	return { nodeType, varInput }
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
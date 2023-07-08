import { CustomNodeModel } from "../components/CustomNodeModel";
import { inputDialog } from "../dialog/LiteralInputDialog";
import { showFormDialog } from "../dialog/FormDialog";
import { checkInput } from "../helpers/InputSanitizer";

interface GeneralComponentLibraryProps{
    model : any;
    variableValue?: any;
}

export function cancelDialog(dialogResult) {
    if (dialogResult["button"]["label"] == 'Cancel') {
        // When Cancel is clicked on the dialog, just return
        return true;
    }
    return false
}

export async function GeneralComponentLibrary(props: GeneralComponentLibraryProps){
    let node = null;
    const nodeData = props.model;
    const variableValue = props.variableValue;
    const nodeName = nodeData.task;
    const argumentTitle = 'Please define parameter';
    let inputValue;
    if (variableValue != ''){
        inputValue = variableValue;
    }

    if (nodeData.type === 'string') {

        if ((nodeName).startsWith("Literal")) {
            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog({ title: 'String', oldValue: "", type: 'String', inputType: 'textarea' });
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;
                
                inputValue = dialogResult["value"]['String'];

                while (!checkInput(inputValue, 'string')){
                    const dialogOptions = inputDialog({ title: 'String', oldValue: inputValue, type: 'String', inputType: 'textarea' });
                    const dialogResult = await showFormDialog(dialogOptions);
                    if (cancelDialog(dialogResult)) return;

                    inputValue = dialogResult["value"]['String'];
                }
            }

            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');
        }
        else {
            const dialogOptions = inputDialog({ title: argumentTitle, oldValue: "", type:'Argument', inputType:'String'});
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            inputValue = dialogResult["value"][argumentTitle];
            node = new CustomNodeModel({ name: "Argument (String): " + inputValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');
        }

    } else if (nodeData.type === 'int') {

        if ((nodeName).startsWith("Literal")) {
            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog({title: 'Integer', oldValue: "", type: 'Integer' });
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;
                inputValue = dialogResult["value"]['Integer'];
            }
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');

        } else {
            const dialogOptions = inputDialog({ title: argumentTitle, oldValue: "", type:'Argument', inputType:'Integer'});
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            inputValue = dialogResult["value"][argumentTitle];
            node = new CustomNodeModel({ name: "Argument (Int): " + inputValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');

        }

    } else if (nodeData.type === 'float') {

        if ((nodeName).startsWith("Literal")) {
            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog({ title:'Float', oldValue:"", type:'Float' });
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;
                inputValue = dialogResult["value"]['Float'];
            }
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');

        } else {

            const dialogOptions = inputDialog({ title: argumentTitle, oldValue: "", type:'Argument', inputType:'Float'});
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            inputValue = dialogResult["value"][argumentTitle];
            console.log(dialogResult);
            
            node = new CustomNodeModel({ name: "Argument (Float): " + inputValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');

        }

    } else if (nodeData.type === 'boolean') {

        if ((nodeName).startsWith("Literal")) {

            let portLabel = nodeName.split(' ');
            portLabel = portLabel[portLabel.length - 1];

            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(portLabel, 'out-0');

        } else {

            const dialogOptions = inputDialog({ title: argumentTitle, oldValue: "", type:'Argument', inputType:'Boolean'});
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            inputValue = dialogResult["value"][argumentTitle];
            node = new CustomNodeModel({ name: "Argument (Boolean): " + inputValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');

        }

    } else if (nodeData.type === 'list') {

        if ((nodeName).startsWith("Literal")) {

            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog({ title: 'List', oldValue: "", type: 'List'});
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;

                inputValue = dialogResult["value"]['List'];
                
                while (!checkInput(inputValue, 'list')){
                    const dialogOptions = inputDialog({ title: 'List', oldValue: inputValue, type: 'List'});
                    const dialogResult = await showFormDialog(dialogOptions);

                    if (cancelDialog(dialogResult)) return;
                    inputValue = dialogResult["value"]['List'];
                }
                
            }
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');

        } 

    } else if (nodeData.type === 'tuple') {

        if ((nodeName).startsWith("Literal")) {

            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog({ title:'Tuple', oldValue:"", type:'Tuple'} );
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;

                inputValue = dialogResult["value"]['Tuple'];
                
                while (!checkInput(inputValue, 'tuple')){
                    const dialogOptions = inputDialog({ title:'Tuple', oldValue:inputValue, type:'Tuple'} );
                    const dialogResult = await showFormDialog(dialogOptions);

                    if (cancelDialog(dialogResult)) return;
                    inputValue = dialogResult["value"]['Tuple'];
                }

            }
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');

        } 

    } else if (nodeData.type === 'dict') {

        if ((nodeName).startsWith("Literal")) {

            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog({ title:'Dict', oldValue:"", type:'Dict' });
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;
                inputValue = dialogResult["value"]['Dict'];

                while (!checkInput(inputValue, 'dict')){
                    const dialogOptions = inputDialog({ title:'Dict', oldValue: inputValue, type:'Dict' });
                    const dialogResult = await showFormDialog(dialogOptions);

                    if (cancelDialog(dialogResult)) return;
                    inputValue = dialogResult["value"]['Dict'];
                }

            }
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');

        } 

    } else if (nodeData.type === 'secret') {

        if ((nodeName).startsWith("Literal")) {

            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog({ title:'Secret', oldValue:"", type:'Secret'});
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;
                inputValue = dialogResult["value"]['Secret'];
            }

            while (!checkInput(inputValue, 'secret')){
                const dialogOptions = inputDialog({ title:'Secret', oldValue:inputValue, type:'Secret'});
                const dialogResult = await showFormDialog(dialogOptions);

                if (cancelDialog(dialogResult)) return;
                inputValue = dialogResult["value"]['Secret'];
            }
            
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');

        } 

    } else if (nodeData.type === 'chat') {

        if ((nodeName).startsWith("Literal")) {

            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog({ title: 'Chat', oldValue:"", type:'Chat' });
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;
                inputValue = dialogResult["value"];

                while (!checkInput(inputValue, 'chat')){
                    const dialogOptions = inputDialog({ title:'Chat', oldValue:inputValue, type:'Chat'});
                    const dialogResult = await showFormDialog(dialogOptions);
    
                    if (cancelDialog(dialogResult)) return;
                    inputValue = dialogResult["value"];
                }
                inputValue = JSON.stringify(inputValue)
            }

            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');
        } 
    } 

    return node;
}
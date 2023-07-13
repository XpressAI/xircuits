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

const TYPE_LITERALS = ['string', 'int', 'float', 'boolean', 'list', 'tuple', 'dict', 'secret', 'chat'];
const TYPE_ARGUMENTS = ['string', 'int', 'float', 'boolean'];
const SPECIAL_LITERALS = ['chat'];

export async function handleLiteralInput(nodeName, nodeData, variableValue, type, title = "New Literal Input") {
    let inputValue = variableValue;
    if (variableValue == '' || variableValue == undefined) {
        let dialogOptions = inputDialog({ title, oldValue: "", type });
        let dialogResult = await showFormDialog(dialogOptions);
        if (cancelDialog(dialogResult)) return;

        inputValue = dialogResult["value"][title] || dialogResult["value"];;

        while (!checkInput(inputValue, type)){
            dialogOptions = inputDialog({ title: type, oldValue: inputValue, type });
            dialogResult = await showFormDialog(dialogOptions);

            if (cancelDialog(dialogResult)) return;
            inputValue = dialogResult["value"][title] || dialogResult["value"];
        }
    }
    
    if (SPECIAL_LITERALS.includes(type)) inputValue = JSON.stringify(inputValue);

    const node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
    node.addOutPortEnhance(inputValue, 'out-0');
    return node;
}

async function handleArgumentInput(nodeData, argumentTitle) {
    const dialogOptions = inputDialog({ title: argumentTitle, oldValue: "", type:'argument', inputType: nodeData.type });
    const dialogResult = await showFormDialog(dialogOptions);
    if (cancelDialog(dialogResult)) return;
    const inputValue = dialogResult["value"][argumentTitle];

    const node = new CustomNodeModel({ name: `Argument (${nodeData.type}): ${inputValue}`, color: nodeData.color, extras: { "type": nodeData.type } });
    node.addOutPortEnhance('▶', 'parameter-out-0');
    return node;
}

export async function GeneralComponentLibrary(props: GeneralComponentLibraryProps){
    
    let node = null;
    const nodeData = props.model;
    const variableValue = props.variableValue || '';
    const nodeName = nodeData.task;
    const argumentTitle = 'Please define parameter';

    // handler for Boolean
    if (nodeData.type === 'boolean' && nodeName.startsWith("Literal")) {
        const portLabel = nodeName.split(' ').slice(-1);
        node = new CustomNodeModel({ name: "Literal Boolean", color: nodeData.color, extras: { "type": nodeData.type } });
        node.addOutPortEnhance(portLabel, 'out-0');
        return node;
    }
    
    if (TYPE_LITERALS.includes(nodeData.type) && nodeName.startsWith("Literal")) {
        return handleLiteralInput(nodeName, nodeData, variableValue, nodeData.type);
    }

    if (TYPE_ARGUMENTS.includes(nodeData.type)) {
        return handleArgumentInput(nodeData, argumentTitle);
    }

    return null;
}

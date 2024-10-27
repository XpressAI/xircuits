import { CustomNodeModel } from "../components/node/CustomNodeModel";
import { inputDialog } from "../dialog/LiteralInputDialog";
import { showFormDialog } from "../dialog/FormDialog";
import { checkInput } from "../helpers/InputSanitizer";

interface GeneralComponentLibraryProps {
    model: any;
    variableValue?: any;
}

export function cancelDialog(dialogResult) {
    if (dialogResult["button"]["label"] == 'Cancel') {
        return true;
    }
    return false;
}

const TYPE_LITERALS = ['string', 'int', 'float', 'boolean', 'list', 'tuple', 'dict', 'secret', 'chat'];
const TYPE_ARGUMENTS = ['string', 'int', 'float', 'boolean', 'secret', 'any'];

interface CreateLiteralNodeParams {
    nodeName: string;
    nodeData: any;
    inputValue: string;
    type: string;
    attached?: boolean;
}

export function createLiteralNode({
    nodeName,
    nodeData,
    inputValue,
    type,
    attached = false
}: CreateLiteralNodeParams): CustomNodeModel {
    if (nodeName === 'Literal True' || nodeName === 'Literal False') nodeName = 'Literal Boolean';

    const extras = { "type": nodeData.type, attached };
    const node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras });
    node.addOutPortEnhance({ label: inputValue, name: 'out-0', dataType: nodeData.type });
    return node;
}

interface CreateArgumentNodeParams {
    nodeData: any;
    inputValue: string;
}

export function createArgumentNode({
    nodeData,
    inputValue
}: CreateArgumentNodeParams): CustomNodeModel {
    const node = new CustomNodeModel({ 
        name: `Argument (${nodeData.type}): ${inputValue}`, 
        color: nodeData.color, 
        extras: { "type": nodeData.type } 
    });
    node.addOutPortEnhance({ label: '▶', name: 'parameter-out-0', dataType: nodeData.type });
    return node;
}

export async function handleLiteralInput(nodeName: string, nodeData: any, inputValue = "", type: string, title = "New Literal Input", nodeConnections = 0) {
    let attached = false;

    do {
        const isCreatingNewNode = nodeConnections === 0;
        let dialogOptions = inputDialog({ title, oldValue: inputValue, type, attached: (nodeData.extras?.attached || false), showAttachOption: !isCreatingNewNode });
        let dialogResult = await showFormDialog(dialogOptions);
        if (cancelDialog(dialogResult)) return;

        // Special handling for chat type
        if (type === 'chat') {
            inputValue = dialogResult.value.value;
        } else {
            inputValue = dialogResult.value[title];
        }
        if (dialogResult.value.hasOwnProperty('attachNode')) {
            attached = dialogResult.value.attachNode == 'on';
        }

    } while (!checkInput(inputValue, type))

    return createLiteralNode({ nodeName, nodeData, inputValue, type, attached });
}

export async function handleArgumentInput(nodeData: any, argumentTitle = "", oldValue = "", type = "argument") {
    const dialogOptions = inputDialog({ title: argumentTitle, oldValue: oldValue, type: type, inputType: nodeData.type });
    const dialogResult = await showFormDialog(dialogOptions);
    if (cancelDialog(dialogResult)) return;
    const inputValue = dialogResult["value"][argumentTitle];

    return createArgumentNode({ nodeData, inputValue });
}

export async function GeneralComponentLibrary(props: GeneralComponentLibraryProps){
    
    let node = null;
    const nodeData = props.model;
    const variableValue = props.variableValue || '';
    const nodeName = nodeData.task;

    // handler for Boolean
    if (nodeData.type === 'boolean' && nodeName.startsWith("Literal")) {
        const portLabel = nodeData.task.split(' ').slice(-1)[0];
        node = new CustomNodeModel({ name: "Literal Boolean", color: nodeData.color, extras: { "type": nodeData.type } });
        node.addOutPortEnhance({ label: portLabel, name: 'out-0', dataType: nodeData.type });
        return node;
    }
    
    // handler for Any
    if (variableValue) {
        const node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
        node.addOutPortEnhance({ label: variableValue, name: 'out-0', dataType: nodeData.type });
        return node;
    }

    if (TYPE_LITERALS.includes(nodeData.type) && nodeName.startsWith("Literal")) {
        return handleLiteralInput(nodeName, nodeData, variableValue, nodeData.type);
    }

    if (TYPE_ARGUMENTS.includes(nodeData.type)) {
        return handleArgumentInput(nodeData, 'Please define parameter');
    }

    return null;
}

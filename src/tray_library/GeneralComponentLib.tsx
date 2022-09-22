import { CustomNodeModel } from "../components/CustomNodeModel";
import { inputDialog } from "../dialog/LiteralInputDialog";
import { showFormDialog } from "../dialog/FormDialog";
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
    const hyperparameterTitle = 'Please define parameter';
    let inputValue;
    if (variableValue != ''){
        inputValue = variableValue;
    }
    // For now, comment this first until we've use for it
    // if (props.type === 'math') {

    //     node = new CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });

    //     node.addInPortEnhance('▶', 'in-0');
    //     node.addInPortEnhance('A', 'in-1');
    //     node.addInPortEnhance('B', 'in-2');

    //     node.addOutPortEnhance('▶', 'out-0');
    //     node.addOutPortEnhance('value', 'out-1');

    // } else if (props.type === 'convert') {

    //     node = new CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });

    //     node.addInPortEnhance('▶', 'in-0');
    //     node.addInPortEnhance('model', 'parameter-string-in-1');

    //     node.addOutPortEnhance('▶', 'out-0');
    //     node.addOutPortEnhance('converted', 'out-1');

    // } else 
    if (nodeData.type === 'string') {

        if ((nodeName).startsWith("Literal")) {
            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog('String', "", 'String', false ,'textarea');
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;
                inputValue = dialogResult["value"]['String'];
            }

            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');
        }
        else {
            const dialogOptions = inputDialog(hyperparameterTitle, "", 'String');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            inputValue = dialogResult["value"][hyperparameterTitle];
            node = new CustomNodeModel({ name: "Hyperparameter (String): " + inputValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');
        }

    } else if (nodeData.type === 'int') {

        if ((nodeName).startsWith("Literal")) {
            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog('Integer', "", 'Integer');
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;
                inputValue = dialogResult["value"]['Integer'];
            }
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');

        } else {
            const dialogOptions = inputDialog(hyperparameterTitle, "", 'String');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            inputValue = dialogResult["value"][hyperparameterTitle];
            node = new CustomNodeModel({ name: "Hyperparameter (Int): " + inputValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');

        }

    } else if (nodeData.type === 'float') {

        if ((nodeName).startsWith("Literal")) {
            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog('Float', "", 'Float');
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;
                inputValue = dialogResult["value"]['Float'];
            }
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');

        } else {

            const dialogOptions = inputDialog(hyperparameterTitle, "", 'String');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            inputValue = dialogResult["value"][hyperparameterTitle];
            console.log(dialogResult);
            
            node = new CustomNodeModel({ name: "Hyperparameter (Float): " + inputValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');

        }

    } else if (nodeData.type === 'boolean') {

        if ((nodeName).startsWith("Literal")) {

            let portLabel = nodeName.split(' ');
            portLabel = portLabel[portLabel.length - 1];

            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(portLabel, 'out-0');

        } else {

            const dialogOptions = inputDialog(hyperparameterTitle, "", 'String');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            inputValue = dialogResult["value"][hyperparameterTitle];
            node = new CustomNodeModel({ name: "Hyperparameter (Boolean): " + inputValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');

        }

    } else if (nodeData.type === 'list') {

        if ((nodeName).startsWith("Literal")) {

            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog('List', "", 'List', true);
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;
                inputValue = dialogResult["value"]['List'];
            }
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');

        } else {

            const dialogOptions = inputDialog(hyperparameterTitle, "", 'String');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            inputValue = dialogResult["value"][hyperparameterTitle];
            node = new CustomNodeModel({ name: "Hyperparameter (List): " + inputValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');

        }

    } else if (nodeData.type === 'tuple') {

        if ((nodeName).startsWith("Literal")) {

            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog('Tuple', "", 'Tuple', true);
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;
                inputValue = dialogResult["value"]['Tuple'];
            }
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');

        } else {

            const dialogOptions = inputDialog(hyperparameterTitle, "", 'String');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            inputValue = dialogResult["value"][hyperparameterTitle];
            node = new CustomNodeModel({ name: "Hyperparameter (Tuple): " + inputValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');
        }

    } else if (nodeData.type === 'dict') {

        if ((nodeName).startsWith("Literal")) {

            if (variableValue == '' || variableValue == undefined) {
                const dialogOptions = inputDialog('Dict', "", 'Dict', true);
                const dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;
                inputValue = dialogResult["value"]['Dict'];
            }
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(inputValue, 'out-0');

        } else {

            const dialogOptions = inputDialog(hyperparameterTitle, "", 'String');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            inputValue = dialogResult["value"][hyperparameterTitle];
            node = new CustomNodeModel({ name: "Hyperparameter (Dict): " + inputValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');

        }

    // } else if (props.type === 'debug') {
    //     node = new CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });
    //     node.addInPortEnhance('▶', 'in-0');
    //     node.addInPortEnhance('props Set', 'parameter-in-1');
    //     node.addOutPortEnhance('▶', 'out-0');

    // } else if (props.type === 'enough') {

    //     node = new CustomNodeModel({ name: props.name, color: props.color, extras: { "type": props.type } });

    //     node.addInPortEnhance('▶', 'in-0');
    //     node.addInPortEnhance('Target Accuracy', 'parameter-float-in-1');
    //     node.addInPortEnhance('Max Retries', 'parameter-int-in-2');
    //     node.addInPortEnhance('Metrics', 'parameter-string-in-3');

    //     node.addOutPortEnhance('▶', 'out-0');
    //     node.addOutPortEnhance('Should Retrain', 'out-1');

    } 
    // else if (nodeData.type === 'literal') {

    //     node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
    //     node.addOutPortEnhance('Value', 'out-0');
    // }
    return node;
}
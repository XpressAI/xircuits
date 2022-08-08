import { CustomNodeModel } from "../components/CustomNodeModel";
import { inputDialog } from "../dialog/LiteralInputDialog";
import { showFormDialog } from "../dialog/FormDialog";
interface GeneralComponentLibraryProps{
    model : any;
}

function cancelDialog(dialogResult) {
    if (dialogResult["button"]["label"] == 'Cancel') {
        // When Cancel is clicked on the dialog, just return
        return true;
    }
    return false
}

export async function GeneralComponentLibrary(props: GeneralComponentLibraryProps){
    let node = null;
    const nodeData = props.model;
    const nodeName = nodeData.task;
    const hyperparameterTitle = 'Please define parameter';
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
            const dialogOptions = inputDialog('String', "", 'String', false ,'textarea');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            const strValue = dialogResult["value"]['String'];

            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(strValue, 'out-0');
        }
        else {

            const dialogOptions = inputDialog(hyperparameterTitle, "", 'String');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            const strValue = dialogResult["value"][hyperparameterTitle];
            node = new CustomNodeModel({ name: "Hyperparameter (String): " + strValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');

        }

    } else if (nodeData.type === 'int') {

        if ((nodeName).startsWith("Literal")) {

            const dialogOptions = inputDialog('Integer', "", 'Integer');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            const intValue = dialogResult["value"]['Integer'];
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(intValue, 'out-0');

        } else {
            const dialogOptions = inputDialog(hyperparameterTitle, "", 'String');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            const intValue = dialogResult["value"][hyperparameterTitle];
            node = new CustomNodeModel({ name: "Hyperparameter (Int): " + intValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');

        }

    } else if (nodeData.type === 'float') {

        if ((nodeName).startsWith("Literal")) {

            const dialogOptions = inputDialog('Float', "", 'Float');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            const floatValue = dialogResult["value"]['Float'];
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(floatValue, 'out-0');

        } else {

            const dialogOptions = inputDialog(hyperparameterTitle, "", 'String');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            const floatValue = dialogResult["value"][hyperparameterTitle];
            console.log(dialogResult);
            
            node = new CustomNodeModel({ name: "Hyperparameter (Float): " + floatValue, color: nodeData.color, extras: { "type": nodeData.type } });
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
            const boolValue = dialogResult["value"][hyperparameterTitle];
            node = new CustomNodeModel({ name: "Hyperparameter (Boolean): " + boolValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');

        }

    } else if (nodeData.type === 'list') {

        if ((nodeName).startsWith("Literal")) {

            const dialogOptions = inputDialog('List', "", 'List', true);
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            const listValue = dialogResult["value"]['List'];
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(listValue, 'out-0');

        } else {

            const dialogOptions = inputDialog(hyperparameterTitle, "", 'String');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            const listValue = dialogResult["value"][hyperparameterTitle];
            node = new CustomNodeModel({ name: "Hyperparameter (List): " + listValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');

        }

    } else if (nodeData.type === 'tuple') {

        if ((nodeName).startsWith("Literal")) {

            const dialogOptions = inputDialog('Tuple', "", 'Tuple', true);
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            const tupleValue = dialogResult["value"]['Tuple'];
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(tupleValue, 'out-0');

        } else {

            const dialogOptions = inputDialog(hyperparameterTitle, "", 'String');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            const tupleValue = dialogResult["value"][hyperparameterTitle];
            node = new CustomNodeModel({ name: "Hyperparameter (Tuple): " + tupleValue, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance('▶', 'parameter-out-0');
        }

    } else if (nodeData.type === 'dict') {

        if ((nodeName).startsWith("Literal")) {

            const dialogOptions = inputDialog('Dict', "", 'Dict', true);
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            const dictValue = dialogResult["value"]['Dict'];
            node = new CustomNodeModel({ name: nodeName, color: nodeData.color, extras: { "type": nodeData.type } });
            node.addOutPortEnhance(dictValue, 'out-0');

        } else {

            const dialogOptions = inputDialog(hyperparameterTitle, "", 'String');
            const dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            const dictValue = dialogResult["value"][hyperparameterTitle];
            node = new CustomNodeModel({ name: "Hyperparameter (Dict): " + dictValue, color: nodeData.color, extras: { "type": nodeData.type } });
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
import { CustomNodeModel } from "../components/CustomNodeModel";
import ComponentList from "./Component";

interface AdvancedComponentLibraryProps {
    model: any;
}

export async function fetchNodeByName(name?: string) {
    let componentList: string[] = [];

    // get the component list 
    const response_1 = await ComponentList();
    componentList = response_1;

    let component_task = componentList.map(x => x["task"]);
    let drop_node = component_task.indexOf(name);
    let current_node: any;

    if (drop_node != -1) {
        current_node = componentList[drop_node];
    }
    return current_node;
}

export function AdvancedComponentLibrary(props: AdvancedComponentLibraryProps) {
    let node = null;
    const nodeData = props.model;
    node = new CustomNodeModel({
        name: nodeData.class,
        color: nodeData.color,
        extras: {
            "type": nodeData.type,
            "path": nodeData.file_path,
            "description": nodeData["json_description"]["description"] || nodeData.docstring,
            "argumentDescriptions" : nodeData["json_description"]["arguments"],
            "lineNo": nodeData.lineno
        }
    });
    node.addInPortEnhance('▶', 'in-0');
    node.addOutPortEnhance('▶', 'out-0');

    // TODO: Get rid of the remapping by using compatible type names everywhere
    let type_name_remappings = {
        "bool": "boolean",
        "str": "string"
    }

    const argumentDescriptions = nodeData["json_description"]["arguments"];


    nodeData["variables"].forEach((variable, _) => {
        const name = variable["name"];
        const type = type_name_remappings[variable["type"]] || variable["type"];

        const description = argumentDescriptions ? argumentDescriptions[name] || "" : "";

        switch (variable["kind"]) {
            case "InCompArg":
                node.addInPortEnhance(`★${name}`, `parameter-${type}-${name}`, true, null, description);
                break;
            case "InArg":
                node.addInPortEnhance(name, `parameter-${type}-${name}`, true, null, description);
                break;
            case "OutArg":
                node.addOutPortEnhance(name, `parameter-out-${type}-${name}`, true, null, description);
                break;
            case "BaseComponent":
                node.addOutPortEnhance(`${name} ▶`, `out-flow-${name}`);
                break;
            default:
                console.warn("Unknown variable kind for variable", variable)
                break;
        }
    })
    return node;
}
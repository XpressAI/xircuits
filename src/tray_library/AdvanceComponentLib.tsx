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
            "description": nodeData.docstring,
            "lineNo": nodeData.lineno,
            "template": nodeData.template,
            "options": nodeData.options
        }
    });
    node.addInPortEnhance('▶', 'in-0');
    node.addOutPortEnhance('▶', 'out-0');

    // TODO: Get rid of the remapping by using compatible type names everywhere
    let type_name_remappings = {
        "bool": "boolean",
        "str": "string"
    }

    nodeData["variables"].forEach(variable => {
        let name = variable["name"];
        let type = type_name_remappings[variable["type"]] || variable["type"];
        // if node type includes comma, then multiple types are accepted for that node (ex: str,float; str,int; etc.)
        if (type && type.includes(',')) {
            // take care of remapping, even when multiple types are accepted for the node
            for (let mapping in type_name_remappings) {
                type = type.replace(mapping, type_name_remappings[mapping]);
            }
        }
        else {
            type = type_name_remappings[type] || type;
        }

        switch (variable["kind"]) {
            case "InCompArg":
                node.addInPortEnhance(`★${name}`, `parameter-${type}-${name}`);
                break;
            case "InArg":
                node.addInPortEnhance(name, `parameter-${type}-${name}`);
                break;
            case "OutArg":
                node.addOutPortEnhance(name, `parameter-out-${type}-${name}`);
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
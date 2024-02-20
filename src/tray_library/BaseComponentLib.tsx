import { CustomNodeModel } from "../components/node/CustomNodeModel";

export function BaseComponentLibrary(nodeName: string): CustomNodeModel{

    if (nodeName === 'Start') {
        let node = new CustomNodeModel({ name: 'Start', color: 'rgb(255,102,102)', extras: { "type": "Start" } });
        node.addOutPortEnhance({label: '▶', name: 'out-0'});
        return node;
    }

    if (nodeName === 'Finish') {
        let node = new CustomNodeModel({ name: 'Finish', color: 'rgb(255,102,102)', extras: { "type": "Finish" } });
        node.addInPortEnhance({label: '▶', name: 'in-0'});
        node.addInPortEnhance({label: 'outputs', name: 'parameter-dynalist-outputs', varName: 'outputs', dataType: 'dynalist'});
        return node;
    }
}
import * as SRD from '@projectstorm/react-diagrams';
import {CustomNodeFactory} from "./CustomNodeFactory";
import { CustomNodeModel } from './CustomNodeModel';
import { ZoomCanvasAction } from '@projectstorm/react-canvas-core';
import { CustomDeleteItemsAction } from './CustomNodeWidget';
import { DefaultLinkModel } from '@projectstorm/react-diagrams';
import { Context } from '@jupyterlab/docregistry';

export class XpipesApplication {

	protected activeModel: SRD.DiagramModel;

	protected diagramEngine: SRD.DiagramEngine;
	//protected projectData: string;

	constructor(context?: Context) {

        this.diagramEngine = SRD.default({ registerDefaultZoomCanvasAction: false, registerDefaultDeleteItemsAction: false });
        this.activeModel = new SRD.DiagramModel();
        this.diagramEngine.getNodeFactories().registerFactory(new CustomNodeFactory());
        this.diagramEngine.getActionEventBus().registerAction(new ZoomCanvasAction({ inverseZoom: true }))
        this.diagramEngine.getActionEventBus().registerAction(new CustomDeleteItemsAction());

        const model = context.model.toJSON();

        //check if model.id is empty / does not have an id
        // if (model != undefined) {
        //     //this.activeModel.deserializeModel(model, this.diagramEngine);
        //     let deserializedModel = this.customDeserializeModel(model, this.diagramEngine);
        //     this.diagramEngine.setModel(deserializedModel);

        //     // let currentModel = this.diagramEngine.getModel().serialize();
        //     // context.model.fromJSON(currentModel);
        // } 
        // else {
            let startNode = new CustomNodeModel({ name: 'Start', color: 'rgb(255,102,102)', extras: { "type": "Start" } });
            startNode.addOutPortEnhance('▶', 'out-0');
            startNode.addOutPortEnhance('  ', 'parameter-out-1');
            startNode.setPosition(100, 100);

            let finishedNode = new CustomNodeModel({ name: 'Finish', color: 'rgb(255,102,102)', extras: { "type": "Finish" } });
            finishedNode.addInPortEnhance('▶', 'in-0');
            finishedNode.addInPortEnhance('  ', 'parameter-in-1');
            finishedNode.setPosition(700, 100);

            this.activeModel.addAll(startNode, finishedNode);
            this.diagramEngine.setModel(this.activeModel);
        // }
	}

    customDeserializeModel(modelContext: any, diagramEngine: SRD.DiagramEngine) {
        let tempModel = new SRD.DiagramModel();
        let links = modelContext["layers"][0]["models"];
        let nodes = modelContext["layers"][1]["models"];
        let gridSize = modelContext["gridSize"];
        let offsetX = modelContext["offsetX"];
        let offsetY = modelContext["offsetY"];
        let zoom = modelContext["zoom"];

        tempModel.setGridSize(gridSize);
        tempModel.setOffsetX(offsetX);
        tempModel.setOffsetY(offsetY);
        tempModel.setZoomLevel(zoom);

        for (let nodeID in nodes) {

            let node = nodes[nodeID];
            let newNode = new CustomNodeModel({
                id: node.id, type: node.type, name: node.name,
                color: node.color, extras: node.extras, locked: node.locked
            });
            newNode.setPosition(node.x, node.y);

            for (let portID in node.ports) {

                let port = node.ports[portID];
                if (port.alignment == "right") newNode.addOutPortEnhance(port.label, port.name, true, port.id);
                if (port.alignment == "left") newNode.addInPortEnhance(port.label, port.name, true, port.id);

            }

            tempModel.addAll(newNode);
            diagramEngine.setModel(tempModel);

        }

        for (let linkID in links) {


            let link = links[linkID];

            if (link.sourcePort && link.targetPort) {

                let newLink = new DefaultLinkModel();

                let sourcePort = tempModel.getNode(link.source).getPortFromID(link.sourcePort);
                newLink.setSourcePort(sourcePort);

                let targetPort = tempModel.getNode(link.target).getPortFromID(link.targetPort);
                newLink.setTargetPort(targetPort);

                tempModel.addAll(newLink);
                diagramEngine.setModel(tempModel);

            }

        }

        return tempModel
    }

	public getActiveDiagram(): SRD.DiagramModel {
		return this.activeModel;
	}

	public getDiagramEngine(): SRD.DiagramEngine {
		return this.diagramEngine;
	}
}
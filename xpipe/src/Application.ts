import * as SRD from '@projectstorm/react-diagrams';
import {CustomNodeFactory} from "./components/CustomNodeFactory";
import { CustomNodeModel } from './components/CustomNodeModel';
import { ActionEventBus, ZoomCanvasAction } from '@projectstorm/react-canvas-core';

/**
 * @author Dylan Vorster
 */
export class Application {

	protected activeModel: SRD.DiagramModel;

	protected diagramEngine: SRD.DiagramEngine;
	//protected projectData: string;

	constructor(projectData?:string) {

		
		this.diagramEngine = SRD.default({registerDefaultZoomCanvasAction: false});
		this.activeModel = new SRD.DiagramModel();
		this.diagramEngine.getNodeFactories().registerFactory(new CustomNodeFactory());
		this.diagramEngine.getActionEventBus().registerAction(new ZoomCanvasAction({inverseZoom:true}))

		let startNode = new CustomNodeModel({ name:'Start', color:'rgb(255,102,102)', extras:{ "type":"Start" } });
		startNode.addOutPortEnhance('▶', 'out-0');
		startNode.addOutPortEnhance('  ', 'parameter-out-1');
		startNode.setPosition(100, 100);

		let finishedNode = new CustomNodeModel({ name:'Finish', color:'rgb(255,102,102)', extras:{ "type":"Finish" } });
		finishedNode.addInPortEnhance('▶', 'in-0');
		finishedNode.addInPortEnhance('  ', 'parameter-in-1');
		finishedNode.setPosition(700, 100);

		this.activeModel.addAll(startNode, finishedNode);
		this.diagramEngine.setModel(this.activeModel);
		// //this.projectData;

		// //if the .xipe file has correct format, generate the nodes
		// try {

		// 	let links = projectData["layers"][0]["models"];
		// 	let nodes = projectData["layers"][1]["models"];

		// 	for (let nodeID in nodes){
				
		// 		let node =  nodes[nodeID];
		// 		let newNode = new CustomNodeModel({ name:node["name"], color:node["color"], extras: node["extras"] });
		// 		newNode.setPosition(node["x"], node["y"]);
				
		// 		for (let portID in node.ports){
					
		// 			let port = node.ports[portID];
		// 			if (port.alignment == "right") newNode.addOutPortEnhance(port.label, port.name);
		// 			if (port.alignment == "left") newNode.addInPortEnhance(port.label, port.name);
					
		// 		} 

		// 		this.activeModel.addAll(newNode);
		// 		this.diagramEngine.setModel(this.activeModel);
		// 	}
		// }

		// //if incorrect, generate the default nodes.
		// catch(error){
		// 	console.log(error.message);
		// 	console.log("Generating New Diagram");

			//initialize default start and finish node

		//}
	}

	public getActiveDiagram(): SRD.DiagramModel {
		return this.activeModel;
	}

	public getDiagramEngine(): SRD.DiagramEngine {
		return this.diagramEngine;
	}
}
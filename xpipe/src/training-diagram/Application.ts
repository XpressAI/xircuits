import * as SRD from '@projectstorm/react-diagrams';
import {CustomNodeFactory} from "./components/CustomNodeFactory";

/**
 * @author Dylan Vorster
 */
export class Application {

	protected activeModel: SRD.DiagramModel;

	protected diagramEngine: SRD.DiagramEngine;

	constructor() {
		this.diagramEngine = SRD.default();

		this.activeModel = new SRD.DiagramModel();

		this.diagramEngine.getNodeFactories().registerFactory(new CustomNodeFactory());
		//this.diagramEngine.getLinkFactories().registerFactory(new PathFindingLinkFactory());
		this.diagramEngine.setModel(this.activeModel);
	}



	public getActiveDiagram(): SRD.DiagramModel {
		return this.activeModel;
	}

	public getDiagramEngine(): SRD.DiagramEngine {
		return this.diagramEngine;
	}
}

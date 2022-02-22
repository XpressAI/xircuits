import * as SRD from '@projectstorm/react-diagrams';
import { CustomNodeFactory } from "./CustomNodeFactory";
import { CustomNodeModel } from './CustomNodeModel';
import { ZoomCanvasAction } from '@projectstorm/react-canvas-core';
import { CustomActionEvent } from '../commands/CustomActionEvent';
import { JupyterFrontEnd } from '@jupyterlab/application';

export class XircuitsApplication {

        protected activeModel: SRD.DiagramModel;

        protected diagramEngine: SRD.DiagramEngine;

        constructor(app: JupyterFrontEnd) {

                this.diagramEngine = SRD.default({ registerDefaultZoomCanvasAction: false, registerDefaultDeleteItemsAction: false });
                this.activeModel = new SRD.DiagramModel();
                this.diagramEngine.getNodeFactories().registerFactory(new CustomNodeFactory(app));
                this.diagramEngine.getActionEventBus().registerAction(new ZoomCanvasAction({ inverseZoom: true }))
                this.diagramEngine.getActionEventBus().registerAction(new CustomActionEvent({ app }));

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
        }

        public getActiveDiagram(): SRD.DiagramModel {
                return this.activeModel;
        }

        public getDiagramEngine(): SRD.DiagramEngine {
                return this.diagramEngine;
        }
}
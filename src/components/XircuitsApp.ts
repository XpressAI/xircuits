import * as SRD from '@projectstorm/react-diagrams';
import { CustomNodeFactory } from "./CustomNodeFactory";
import { CustomNodeModel } from './CustomNodeModel';
import { ZoomCanvasAction } from '@projectstorm/react-canvas-core';
import { CustomActionEvent } from '../commands/CustomActionEvent';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { CustomDiagramState } from './CustomDiagramState'
import { CustomLinkModel, TriangleLinkModel } from './link/CustomLinkModel';
import { CustomLinkFactory, TriangleLinkFactory } from './link/CustomLinkFactory';

export class XircuitsApplication {

        protected activeModel: SRD.DiagramModel;

        protected diagramEngine: SRD.DiagramEngine;

        constructor(app: JupyterFrontEnd) {

                this.diagramEngine = SRD.default({ registerDefaultZoomCanvasAction: false, registerDefaultDeleteItemsAction: false });
                this.activeModel = new SRD.DiagramModel();
                this.diagramEngine.getNodeFactories().registerFactory(new CustomNodeFactory(app));
                this.diagramEngine.getLinkFactories().registerFactory(new CustomLinkFactory());
                this.diagramEngine.getLinkFactories().registerFactory(new TriangleLinkFactory());
                this.diagramEngine.getActionEventBus().registerAction(new ZoomCanvasAction({ inverseZoom: true }))
                this.diagramEngine.getActionEventBus().registerAction(new CustomActionEvent({ app }));
                this.diagramEngine.getStateMachine().pushState(new CustomDiagramState());

                let startNode = new CustomNodeModel({ name: 'Start', color: 'rgb(255,102,102)', extras: { "type": "Start" } });
                startNode.addOutPortEnhance('▶', 'out-0');
                startNode.setPosition(100, 100);

                let finishedNode = new CustomNodeModel({ name: 'Finish', color: 'rgb(255,102,102)', extras: { "type": "Finish" } });
                finishedNode.addInPortEnhance('▶', 'in-0');
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

        public customDeserializeModel = (modelContext: any, diagramEngine: SRD.DiagramEngine) => {

                if (modelContext == null) {
                        // When context empty, just return
                        return;
                }

                let tempModel = new SRD.DiagramModel();
                let links = modelContext["layers"][0]["models"];
                let nodes = modelContext["layers"][1]["models"];
                let offsetX = modelContext["offsetX"];
                let offsetY = modelContext["offsetY"];
                let zoom = modelContext["zoom"];

                for (let nodeID in nodes) {

                        let node = nodes[nodeID];
                        let newNode = new CustomNodeModel({
                                id: node.id, type: node.type, name: node.name, locked: node.locked,
                                color: node.color, extras: node.extras
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

                                let newLink = new CustomLinkModel();
                                const newTriangleLink = new TriangleLinkModel();
                                const sourceNode = tempModel.getNode(link.source);
                                const targetNode = tempModel.getNode(link.target);

                                const sourcePort = sourceNode.getPortFromID(link.sourcePort);
                                const sourcePortName = sourcePort.getOptions()['name'];
                                const sourcePortTriangleName = 'out-0';
                                if (sourcePortName == sourcePortTriangleName) {
                                        if (sourceNode.getPorts()[sourcePortName].getOptions()['label'] == '▶') {
                                                // When source port is '▶', use triangle animation link
                                                newLink = newTriangleLink;
                                        }
                                }
                                newLink.setSourcePort(sourcePort);

                                const targetPort = targetNode.getPortFromID(link.targetPort);
                                const targetPortName = targetPort.getOptions()['name'];
                                const targetPortTriangleName = 'in-0';
                                if (targetPortName == targetPortTriangleName) {
                                        if (targetNode.getPorts()[targetPortName].getOptions()['label'] == '▶') {
                                                // When target port is '▶', use triangle animation link
                                                newLink = newTriangleLink;
                                        }
                                }
                                newLink.setTargetPort(targetPort);

                                tempModel.addAll(newLink);
                                diagramEngine.setModel(tempModel);
                        }
                }
                tempModel.setOffsetX(offsetX);
                tempModel.setOffsetY(offsetY);
                tempModel.setZoomLevel(zoom);
                return tempModel;
        }
}
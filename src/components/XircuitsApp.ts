import * as SRD from '@projectstorm/react-diagrams';
import { CustomNodeFactory } from "./CustomNodeFactory";
import { CustomNodeModel } from './CustomNodeModel';
import { ZoomCanvasAction } from '@projectstorm/react-canvas-core';
import { CustomActionEvent } from '../commands/CustomActionEvent';
import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';
import { CustomDiagramState } from './state/CustomDiagramState'
import { ParameterLinkModel, TriangleLinkModel } from './link/CustomLinkModel';
import { ParameterLinkFactory, TriangleLinkFactory } from './link/CustomLinkFactory';
import { PointModel } from '@projectstorm/react-diagrams';
import { Point } from '@projectstorm/geometry';

export class XircuitsApplication {

        protected activeModel: SRD.DiagramModel;

        protected diagramEngine: SRD.DiagramEngine;

        constructor(app: JupyterFrontEnd, shell: ILabShell) {

                this.diagramEngine = SRD.default({ registerDefaultZoomCanvasAction: false, registerDefaultDeleteItemsAction: false });
                this.activeModel = new SRD.DiagramModel();
                this.diagramEngine.getNodeFactories().registerFactory(new CustomNodeFactory(app, shell));
                this.diagramEngine.getLinkFactories().registerFactory(new ParameterLinkFactory());
                this.diagramEngine.getLinkFactories().registerFactory(new TriangleLinkFactory());
                this.diagramEngine.getActionEventBus().registerAction(new ZoomCanvasAction({ inverseZoom: true }))
                this.diagramEngine.getActionEventBus().registerAction(new CustomActionEvent({ app }));
                this.diagramEngine.getStateMachine().pushState(new CustomDiagramState());

                let startNode = new CustomNodeModel({ name: 'Start', color: 'rgb(255,102,102)', extras: { "type": "Start" } });
                startNode.addOutPortEnhance({label: '▶', name: 'out-0'});
                startNode.setPosition(100, 100);

                let finishedNode = new CustomNodeModel({ name: 'Finish', color: 'rgb(255,102,102)', extras: { "type": "Finish" } });
                finishedNode.addInPortEnhance({label: '▶', name: 'in-0'});
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

        public customDeserializeModel = (modelContext: any, initialRender?: boolean) => {

                if (modelContext == null) {
                        // When context empty, just return
                        return;
                }

                let tempModel = new SRD.DiagramModel({ id: modelContext.id });
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
                        newNode.setSelected(node.selected);

                        for (let portID of node.portsInOrder) {
                                const port = node.ports.find(p => p.id === portID);
                                newNode.addInPortEnhance({label: port.label, name: port.name, varName: port.varName, id: port.id, dataType: port.dataType, dynaPortOrder: port.dynaPortOrder, dynaPortRef: port.dynaPortRef});
                        }
                        for (let portID of node.portsOutOrder) {
                                const port = node.ports.find(p => p.id === portID);
                                newNode.addOutPortEnhance({label: port.label, name: port.name, id: port.id});
                        }
                        tempModel.addNode(newNode);
                }

                for (let linkID in links) {

                        let link = links[linkID];

                        if (link.sourcePort && link.targetPort) {

                                let newLink = new ParameterLinkModel({ id: link.id });
                                const newTriangleLink = new TriangleLinkModel({ id: link.id });
                                const sourceNode = tempModel.getNode(link.source);
                                const targetNode = tempModel.getNode(link.target);

                                if(!sourceNode || !targetNode) {
                                        const missingNodeId = !sourceNode ? link.source : link.target;
                                        const missingNodeType = !sourceNode ? 'Source' : 'Target';
                                        console.error(`${missingNodeType} node with id ${missingNodeId} not found!`);
                                        continue; // Skip to the next iteration of the loop.
                                }

                                const linkPoints = link.points;

                                const sourcePort = sourceNode.getPortFromID(link.sourcePort);
                                const sourcePortName = sourcePort.getOptions()['name'];
                                const sourcePortOptions = sourceNode.getPorts()[sourcePortName]?.getOptions()
                                if(!sourcePortOptions){
                                        console.error(`${sourcePortName} port not found!`);
                                        continue
                                }
                                const sourcePortLabel = sourcePortOptions['label'];
                                if (sourcePortLabel == '▶' || sourcePortName.includes('out-flow')) {
                                        // When source port is '▶', use triangle animation link
                                        // Also, use triangle animation link when the source port is a flowport
                                        newLink = newTriangleLink;
                                }

                                const targetPort = targetNode.getPortFromID(link.targetPort);
                                const targetPortName = targetPort.getOptions()['name'];
                                const targetPortOptions = targetNode.getPorts()[targetPortName]?.getOptions();
                                if(!targetPortOptions){
                                        console.error(`${targetPortName} port not found!`);
                                        continue
                                }
                                const targetPortLabel = targetPortOptions['label'];
                                if (targetPortLabel == '▶'){
                                        // When target port is '▶', use triangle animation link
                                        newLink = newTriangleLink;
                                }

                                // Set points on link if exist
                                const points = [];
                                linkPoints.map((point)=> {
                                        let newPoint = new PointModel({ id:point.id, link: link, position: new Point(point.x, point.y) })
                                        if (point.selected) { newPoint.setSelected(true) };
                                        points.push(newPoint)
                                })

                                newLink.setSourcePort(sourcePort);
                                newLink.setTargetPort(targetPort);
                                newLink.setSelected(link.selected);

                                if (initialRender) {
                                        // When initial rendering of xircuits, 
                                        // delay the rendering of points.
                                        setTimeout(() => {
                                                newLink.setPoints(points);
                                        }, 10)
                                }
                                else {
                                        newLink.setPoints(points);
                                }
                                tempModel.addLink(newLink);
                        }
                }
                tempModel.setOffsetX(offsetX);
                tempModel.setOffsetY(offsetY);
                tempModel.setZoomLevel(zoom);
                return tempModel;
        }
}
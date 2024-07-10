import * as SRD from '@projectstorm/react-diagrams';
import { CustomNodeFactory } from "./node/CustomNodeFactory";
import { CustomNodeModel } from './node/CustomNodeModel';
import { CustomActionEvent } from '../commands/CustomActionEvent';
import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';
import { CustomDiagramState } from './state/CustomDiagramState'
import { ParameterLinkModel, TriangleLinkModel } from './link/CustomLinkModel';
import { ParameterLinkFactory, TriangleLinkFactory } from './link/CustomLinkFactory';
import {
        DefaultLabelFactory, DefaultLinkFactory, DefaultPortFactory,
        LinkLayerFactory,
        NodeLayerFactory,
        PointModel,
        SelectionBoxLayerFactory
} from "@projectstorm/react-diagrams";
import { Point } from '@projectstorm/geometry';
import { BaseComponentLibrary } from '../tray_library/BaseComponentLib';
import { CustomPanAndZoomCanvasAction } from "./actions/CustomPanAndZoomCanvasAction";

export class XircuitsApplication {

        protected activeModel: SRD.DiagramModel;

        protected diagramEngine: SRD.DiagramEngine;

        constructor(app: JupyterFrontEnd, shell: ILabShell, getWidgetId: () => string) {
                this.diagramEngine = new SRD.DiagramEngine({ registerDefaultZoomCanvasAction: false, registerDefaultDeleteItemsAction: false });

                // Default Factories
                this.diagramEngine.getLayerFactories().registerFactory(new NodeLayerFactory());
	              this.diagramEngine.getLayerFactories().registerFactory(new LinkLayerFactory());
	              this.diagramEngine.getLayerFactories().registerFactory(new SelectionBoxLayerFactory());
	              this.diagramEngine.getLabelFactories().registerFactory(new DefaultLabelFactory());
                this.diagramEngine.getLinkFactories().registerFactory(new DefaultLinkFactory());
	              this.diagramEngine.getPortFactories().registerFactory(new DefaultPortFactory());

                // Custom Factories, Actions & State
                this.diagramEngine.getNodeFactories().registerFactory(new CustomNodeFactory(app, shell));
                this.diagramEngine.getLinkFactories().registerFactory(new ParameterLinkFactory());
                this.diagramEngine.getLinkFactories().registerFactory(new TriangleLinkFactory());
                this.diagramEngine.getActionEventBus().registerAction(new CustomPanAndZoomCanvasAction())
                this.diagramEngine.getActionEventBus().registerAction(new CustomActionEvent({ app, getWidgetId }));
                this.diagramEngine.getStateMachine().pushState(new CustomDiagramState());


                
                let startNode = BaseComponentLibrary('Start')
                startNode.setPosition(100, 100);
                let finishNode = BaseComponentLibrary('Finish')
                finishNode.setPosition(700, 100);

                this.activeModel = new SRD.DiagramModel();
                this.activeModel.addAll(startNode, finishNode);
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
                                const position = new Point(port.x, port.y);
                                newNode.addInPortEnhance({label: port.label, name: port.name, varName: port.varName, id: port.id, dataType: port.dataType, dynaPortOrder: port.dynaPortOrder, dynaPortRef: port.dynaPortRef, position});
                        }
                        for (let portID of node.portsOutOrder) {
                                const port = node.ports.find(p => p.id === portID);
                                const position = new Point(port.x, port.y);
                                newNode.addOutPortEnhance({label: port.label, name: port.name, id: port.id, position, dataType: port.dataType});
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
                                        if(sourceNode['name'].startsWith("Argument ")){
                                                newLink.getOptions()['__sub-type__'] = 'argument';
                                        }
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
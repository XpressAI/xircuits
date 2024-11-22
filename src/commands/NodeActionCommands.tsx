import * as SRD from '@projectstorm/react-diagrams';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { ITranslator } from '@jupyterlab/translation';
import { IXircuitsDocTracker } from '../index';
import * as _ from 'lodash';
import { NodeModel } from '@projectstorm/react-diagrams';
import { CustomNodeModel, CustomNodeModelOptions } from '../components/node/CustomNodeModel';
import { LinkModel } from '@projectstorm/react-diagrams';
import { XircuitsPanel } from '../XircuitsWidget';
import { Dialog, showDialog } from '@jupyterlab/apputils';
import { DefaultLinkModel } from '@projectstorm/react-diagrams';
import { BaseModel, BaseModelGenerics } from '@projectstorm/react-canvas-core';
import { copyIcon, cutIcon, pasteIcon, redoIcon, undoIcon } from '@jupyterlab/ui-components';
import { AdvancedComponentLibrary, fetchNodeByName } from '../tray_library/AdvanceComponentLib';
import { formDialogWidget } from '../dialog/formDialogwidget';
import { CommentDialog } from '../dialog/CommentDialog';
import React from 'react';
import { showFormDialog } from '../dialog/FormDialog';
import { CustomPortModel } from '../components/port/CustomPortModel';
import { CustomLinkModel, ParameterLinkModel, TriangleLinkModel } from '../components/link/CustomLinkModel';
import { PointModel } from '@projectstorm/react-diagrams';
import { Point } from '@projectstorm/geometry';
import { createArgumentNode, createLiteralNode, handleArgumentInput, handleLiteralInput } from '../tray_library/GeneralComponentLib';
import { CustomDynaPortModel } from '../components/port/CustomDynaPortModel';
import { fetchComponents } from '../tray_library/Component';
import { BaseComponentLibrary } from '../tray_library/BaseComponentLib';
import { commandIDs } from "./CommandIDs";

/**
 * Add the commands for node actions.
 */
export function addNodeActionCommands(
    app: JupyterFrontEnd,
    tracker: IXircuitsDocTracker,
    translator: ITranslator
): void {
    const trans = translator.load('jupyterlab');
    const { commands, shell } = app;

    /**
     * Whether there is an active xircuits.
     */
    function isEnabled(): boolean {
        return (
            tracker.currentWidget !== null &&
            tracker.currentWidget === shell.currentWidget
        );
    }

    function getLastSelectedNode() {
        const widget = tracker.currentWidget?.content as XircuitsPanel;
        const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
        let node;
        selectedEntities.map((x) => node = x);
        return node ?? null;
    }

    //Add command to open node's script at specific line
    commands.addCommand(commandIDs.openScript, {
        execute: async (args) => {
            let node, nodePath, nodeName, nodeLineNo;

            // call getLastSelectedNode() if opened from Xircuits canvas
            if (args['nodePath'] === undefined && args['nodeName'] === undefined && args['nodeLineNo'] === undefined) {
                node = getLastSelectedNode();
            }
    
            // Assign values based on whether args were provided or derived from getLastSelectedNode()
            nodePath = args['nodePath'] ?? node?.extras.path;
            nodeName = args['nodeName'] ?? node?.name;
            nodeLineNo = args['nodeLineNo'] ?? node?.extras.lineNo;
    
            if (nodeName.startsWith('Literal ') || nodeName.startsWith('Argument ')) {
                showDialog({
                    title: `${node.name} don't have its own script`,
                    buttons: [Dialog.warnButton({ label: 'OK' })]
                })
                return;
            }

            // Open node's file name
            const newWidget = await app.commands.execute(commandIDs.openDocManager, { path: nodePath });
            await newWidget.context.ready;

            // Go to end of node's line first before go to its class
            await app.commands.execute('fileeditor:go-to-line', { line: nodeLineNo[0].end_lineno });

            await new Promise(resolve => setTimeout(resolve, 10));
            // Then go to the specific line
            await app.commands.execute('fileeditor:go-to-line', { line: nodeLineNo[0].lineno });
        }
    });

    //Add command to open sub xircuits
    commands.addCommand(commandIDs.openXircuitsWorkflow, {
        execute: async (args) => {
            let node, nodePath;

            // call getLastSelectedNode() if opened from Xircuits canvas
            if (args['nodePath'] === undefined && args['nodeName'] === undefined && args['nodeLineNo'] === undefined) {
                node = getLastSelectedNode();
            }
    
            // Assign values based on whether args were provided or derived from getLastSelectedNode()
            nodePath = args['nodePath'] ?? node?.extras.path;
            let xircuitsPath = nodePath.replace(/\.py$/, '.xircuits');

            try {
                await app.commands.execute('docmanager:open', { path: xircuitsPath });
            } catch (error) {
                alert('Failed to Open Xircuits Workflow: ' + error);
            }
        }
    });

    //Add command to undo
    commands.addCommand(commandIDs.undo, {
        execute: () => {
            const widget = tracker.currentWidget?.content as XircuitsPanel;
            const model = widget.context.model.sharedModel;

            model.undo();
        },
        label: trans.__('Undo'),
        icon: undoIcon,
        isEnabled: () => {
            const widget = tracker.currentWidget?.content as XircuitsPanel;
            const canUndo = widget.context.model.sharedModel.canUndo();

            return canUndo ?? false;
        }
    });

    //Add command to redo
    commands.addCommand(commandIDs.redo, {
        execute: () => {
            const widget = tracker.currentWidget?.content as XircuitsPanel;
            const model = widget.context.model.sharedModel;

            model.redo();
        },
        label: trans.__('Redo'),
        icon: redoIcon,
        isEnabled: () => {
            const widget = tracker.currentWidget?.content as XircuitsPanel;
            const canRedo = widget.context.model.sharedModel.canRedo();

            return canRedo ?? false;
        }
    });

    //Add command to cut node
    commands.addCommand(commandIDs.cutNode, {
        execute: cutNode,
        label: trans.__('Cut'),
        icon: cutIcon,
        isEnabled: () => {
            const widget = tracker.currentWidget?.content as XircuitsPanel;
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            let isNodeSelected: boolean;
            if (selectedEntities.length > 0) {
                isNodeSelected = true
            }
            return isNodeSelected ?? false;
        }
    });

    //Add command to copy node
    commands.addCommand(commandIDs.copyNode, {
        execute: copyNode,
        label: trans.__('Copy'),
        icon: copyIcon,
        isEnabled: () => {
            const widget = tracker.currentWidget?.content as XircuitsPanel;
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            let isNodeSelected: boolean;
            if (selectedEntities.length > 0) {
                isNodeSelected = true
            }
            return isNodeSelected ?? false;
        }
    });

    //Add command to paste node
    commands.addCommand(commandIDs.pasteNode, {
        execute: pasteNode,
        label: trans.__('Paste'),
        icon: pasteIcon,
        isEnabled: () => {
            const clipboard = JSON.parse(localStorage.getItem('clipboard'));
            let isClipboardFilled: boolean
            if (clipboard) {
                isClipboardFilled = true
            }
            return isClipboardFilled ?? false;
        }
    });

    //Add command to edit literal component
    commands.addCommand(commandIDs.editNode, {
        execute: editParameter,
        label: trans.__('Edit'),
        isEnabled: () => {
            let isNodeSelected: boolean;
            const node = getLastSelectedNode();
            if (node.getOptions()["name"].startsWith("Literal ")) {
                isNodeSelected = true;
            }
            return isNodeSelected ?? false;
        }
    });

    //Add command to delete entities
    commands.addCommand(commandIDs.deleteEntity, {
        execute: deleteEntity,
        label: "Delete",
        isEnabled: () => {
            const widget = tracker.currentWidget?.content as XircuitsPanel;
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            let isNodeSelected: boolean
            if (selectedEntities.length > 0) {
                isNodeSelected = true
            }
            return isNodeSelected ?? false;
        }
    });

    // Add command to reload selected node
    commands.addCommand(commandIDs.reloadNode, {
        execute: async () => {

            await fetchComponents();

            const widget = tracker.currentWidget?.content as XircuitsPanel;
            const engine = widget.xircuitsApp.getDiagramEngine();
            const model = engine.getModel();
            const selected_entities = model.getSelectedEntities();
            const selected_nodes = selected_entities.filter(entity => entity instanceof NodeModel) as CustomNodeModel[];
            const nodesToRemove = [];
            const linksToRemove = [];
            const nodesToHighlight = [];

            for (let selected_node of selected_nodes) {

                if (selected_node.name == "Start") {
                    console.info(selected_node.name + " cannot be reloaded.");
                    continue;
                }
            
                let node;
            
                if (selected_node.name.startsWith("Literal ")) {
                    const nodeName = selected_node["name"];
                    const label = selected_node.getPorts()["out-0"].getOptions()["label"];
                    const nodeData = {
                        color: selected_node["color"],
                        type: selected_node["extras"]["type"],
                    };
                    const attached = selected_node["extras"]["attached"];
    
                    node = createLiteralNode({
                        nodeName,
                        nodeData,
                        inputValue: label,
                        type: nodeData.type,
                        attached
                    });
    
                } else if (selected_node.name.startsWith("Argument ")) {
                    const nodeName = selected_node["name"];
                    const nodeData = {
                        color: selected_node["color"],
                        type: selected_node["extras"]["type"],
                    };
                    const inputValue = nodeName.split(": ")[1];
    
                    node = createArgumentNode({
                        nodeData,
                        inputValue
                    });
    
                } else if (selected_node.name == "Finish") {
                    node = BaseComponentLibrary('Finish');
                } else {
                    // For other nodes, fetch from AdvancedComponentLibrary
                    try {
                        let current_node = await fetchNodeByName(selected_node.name);
                        node = AdvancedComponentLibrary({ model: current_node });
                        node.setPosition(selected_node.getX(), selected_node.getY());
                    } catch (error) {
                        let path = selected_node.getOptions()["extras"].path;
                        console.log(`Error reloading component from path: ${path}. Error: ${error.message}`);
                        selected_node.getOptions().extras["tip"] = `Component could not be loaded from path: \`${path}\`.\nPlease ensure that the component exists!`;
                        selected_node.getOptions().extras["borderColor"] = "red";
                        nodesToHighlight.push(selected_node);
                        continue;
                    }
                }
            
                let nodePositionX = selected_node.getX();
                let nodePositionY = selected_node.getY();
                
                // Add node at given position
                node.setPosition(nodePositionX, nodePositionY);
                engine.getModel().addNode(node);
                try {

                    // get the old ports
                    let ports = selected_node.getPorts();
                    for (let portName in ports) {
                        let port = ports[portName];
                
                        for (let linkID in port.links) {
                            let link = port.links[linkID];
                
                            if (link.getSourcePort() === port) {
                                let sourcePortName = link.getSourcePort().getName();
                                let newSourcePort = node.getPorts()[sourcePortName];
                                if (newSourcePort) {
                                    link.setSourcePort(newSourcePort);
                                } else {
                                    console.log(`Source port '${sourcePortName}' not found in reloaded node '${node.name}'.`);
                                    linksToRemove.push(link);
                                    continue;
                                }
                
                            } else if (link.getTargetPort() === port) {
                                
                                let targetPort = link.getTargetPort();
                                let targetPortName = targetPort.getName();
                                let newTargetPort = node.getPorts()[targetPortName];

                                if (!newTargetPort) {
                                    console.log(`Target port '${targetPortName}' not found in reloaded node '${node.name}'.`);
                                    linksToRemove.push(link);
                                    continue;
                                }

                                if (targetPort instanceof CustomDynaPortModel) {
                                    const newPort = newTargetPort.spawnDynamicPort({ offset: 1 });
                                    newPort.previous = newTargetPort.getID();
                                    newTargetPort.next = newPort.getID();
                                    }

                                link.setTargetPort(newTargetPort);

                                }
                                
                            engine.getModel().addLink(link);
                        }
                    }
                }

                catch (error) {
                    // Code to handle the exception
                    console.log('An error occurred:', error.message);
                }
                finally {
                    // Add old node to nodesToRemove
                    nodesToRemove.push(selected_node);
                }
            }

            // Remove old nodes and links
            for (const nodeToRemove of nodesToRemove) {
                engine.getModel().removeNode(nodeToRemove);
            }

            for (const linkToRemove of linksToRemove) {
                engine.getModel().removeLink(linkToRemove);
            }


            // Repaint canvas
            selected_nodes.forEach(node => node.setSelected(false));
            nodesToHighlight.forEach(node => node.setSelected(true));
            
            pruneLooseLinks(model);
            engine.repaintCanvas();

        },
        label: trans.__('Reload node')
    });

    function pruneLooseLinks(model: SRD.DiagramModel): void {
 
        const links = model.getLinks()

        // Iterate over all links and prune those that do not have either a source or a target port
        Object.values(links).forEach(link => {
        if (!link.getSourcePort() || !link.getTargetPort()) {
            model.removeLink(link);
            }
        });
    }

    //Add command to add node given position
    commands.addCommand(commandIDs.addNodeGivenPosition, {
        execute: (args) => {
            const node = args['node'] as unknown as CustomNodeModel;
            const nodePosition = args['nodePosition'] as any;

            const widget = tracker.currentWidget?.content as XircuitsPanel;

            const canvasNodePosition = widget.xircuitsApp.getDiagramEngine().getRelativeMousePoint(nodePosition)
            node.setPosition(canvasNodePosition);

            widget.xircuitsApp.getDiagramEngine().getModel().addNode(node);
        },
        label: trans.__('Add node')
    });

    //Add command to connect node given link
    commands.addCommand(commandIDs.connectNodeByLink, {
        execute: (args) => {
            const targetNode = args['targetNode'] as any;
            const sourceLink = args['sourceLink'] as any;
            const isParameterLink = args['isParameterLink'] as boolean;
            const widget = tracker.currentWidget?.content as XircuitsPanel;

            // Create new link to connect to new node automatically
            let newLink = new DefaultLinkModel();
            let sourcePort;
            let targetPort;

            // Get source link node port
            const linkPort = sourceLink.sourcePort;

            // When '▶' of sourcePort from inPort, connect to '▶' outPort of target node
            if (linkPort.getOptions()['name'] == "in-0") {
                sourcePort = targetNode.getPorts()["out-0"];
                targetPort = linkPort;
            } else if (isParameterLink) {
                // When looseLink is connected to parameter node
                const parameterNodeName = targetNode.getOutPorts()[0].getOptions()['name']
                sourcePort = targetNode.getPorts()[parameterNodeName];
                targetPort = linkPort;
            }
            else {
                // '▶' of sourcePort to '▶' of targetPort
                sourcePort = linkPort;
                targetPort = targetNode.getPorts()["in-0"];
                app.commands.execute(commandIDs.connectLinkToObviousPorts, { droppedSourceLink:sourceLink, targetNode });
            }
            newLink.setSourcePort(sourcePort);
            newLink.setTargetPort(targetPort);

            if (targetPort instanceof CustomDynaPortModel){
                const newPort = targetPort.spawnDynamicPort({ offset: 1 });
                newPort.previous = targetPort.getID();
                targetPort.next = newPort.getID();
                widget.xircuitsApp.getDiagramEngine().getModel().addNode(targetPort.getParent());
            }
            widget.xircuitsApp.getDiagramEngine().getModel().addLink(newLink);
            widget.xircuitsApp.getDiagramEngine().repaintCanvas();
        },
        label: trans.__('Link node')
    });

    //Add command to connect link to obvious port given link and target node
    commands.addCommand(commandIDs.connectLinkToObviousPorts, {
        execute: (args) => {
            const widget = tracker.currentWidget?.content as XircuitsPanel;
            const draggedLink = args['draggedLink'] as any;
            const droppedSourceLink = args['droppedSourceLink'] as any;
            // Check whether link is dropped or dragged
            const sourcePort = droppedSourceLink == undefined ? draggedLink.getSourcePort() : droppedSourceLink.sourcePort;
            const targetPort = droppedSourceLink == undefined ? draggedLink.getTargetPort() : droppedSourceLink.link.getTargetPort();
            const sourceNode = sourcePort.getNode();
            const targetNode = args['targetNode'] as any ?? targetPort.getNode();
            const outPorts = sourceNode['portsOut'];
            const inPorts = targetNode['portsIn'];

            if (sourcePort?.getOptions()['label'] != '▶' && targetPort?.getOptions()['label'] != '▶') {
                // When it's not ▶ being linked, just return
                return;
            }
            if (sourceNode['portsOut'].length <= 1) {
                // When node got no outputPort, just return
                return;
            }
    
            // Helper function to parse Union types
            const parseUnionType = (type: string): string[] => {
                const unionMatch = type.match(/^Union\[(.*)\]$/);
                if (unionMatch) {
                    return unionMatch[1].split(/[\|,]/).map(t => t.trim());
                }
                return [type];
            };
    
            for (let outPortIndex in outPorts) {
                const outPort = outPorts[outPortIndex];
                const outPortName = outPort.getOptions()['name'];
                const outPortLabel = outPort.getOptions()['label'];
                const outPortType = outPort.getOptions()['dataType'];
                const outPortLabelArr: string[] = outPortLabel.split('_');
                const outPortTypes = parseUnionType(outPortType);
    
                if (outPort.getOptions()['label'] == '▶') {
                    // Skip ▶ outPort
                    continue;
                }
    
                // Check if there are existing links from the target port
                if (Object.keys(outPort.getLinks()).length > 0) {
                    continue;
                }
    
                for (let inPortIndex in inPorts) {
                    const inPort = inPorts[inPortIndex];
                    const inPortName = inPort.getOptions()['name'];
                    // handler for compulsory [★] ports
                    const inPortLabel = inPort.getOptions()['label'].replace(/★/g, '');
                    const inPortType = inPort.getOptions()['dataType'] ?? '';
                    const inPortLabelArr: string[] = inPortLabel.split('_');
                    const inPortTypes = parseUnionType(inPortType);
                    // Compare if there is similarity for each word
                    const intersection = outPortLabelArr.filter(element => inPortLabelArr.includes(element));
    
                    // Check if there are existing links from the source port
                    if (Object.keys(inPort.getLinks()).length > 0) {
                        continue;
                    }
    
                    // Check datatype compatibility
                    const typesCompatible = outPortTypes.some(outType => 
                        inPortTypes.includes(outType) || inPortTypes.includes('any')
                    );
                    if (!typesCompatible) {
                        continue;
                    }
    
                    // Check label compatibility or intersection
                    if ((outPortLabel === inPortLabel && typesCompatible) || intersection.length >= 1) {
                        const newLink = new DefaultLinkModel();
                        const sourcePort = sourceNode.getPorts()[outPortName];
                        newLink.setSourcePort(sourcePort);
                        const targetPort = targetNode.getPorts()[inPortName];
                        newLink.setTargetPort(targetPort);

                        widget.xircuitsApp.getDiagramEngine().getModel().addLink(newLink);
                        break;
                    }
                }
            }
        },
        label: trans.__('Link obvious ports')
    });

    //Add command to add comment node at given position
    commands.addCommand(commandIDs.addCommentNode, {
        execute: async (args) => {
            const widget = tracker.currentWidget?.content as XircuitsPanel;
            
            const dialogOptions: Partial<Dialog.IOptions<any>> = {
                body: formDialogWidget(
                        <CommentDialog commentInput={""}/>
                ),
                buttons: [Dialog.cancelButton(), Dialog.okButton({ label: ('Submit') })]
            };

            // Prompt the user to enter input for commenting
            const dialogResult = await showFormDialog(dialogOptions);
            if (dialogResult["button"]["label"] == 'Cancel') {
                // When Cancel is clicked on the dialog, just return
                return false;
            }
            const commentVal = dialogResult["value"][''];
            let node = new CustomNodeModel({ name: 'Comment:', color: 'rgb(255,255,255)', extras: { "type": 'comment', 'commentInput': commentVal} });

            const nodePosition = args['nodePosition'] as any;
            node.setPosition(nodePosition);
            widget.xircuitsApp.getDiagramEngine().getModel().addNode(node);
        },
        label: trans.__('Add Comment')
    });

    function selectAllRelevantNodes(widget: XircuitsPanel){
        widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities().forEach(entity => {
            if(entity.getType() === 'custom-node'){
                const node = (entity as CustomNodeModel);
                // Find links to attached node and copy them too
                Object.values(node.getPorts()).forEach(port => {
                    Object.values(port.getLinks()).forEach(link => {
                        const parentNode = link.getSourcePort().getParent();
                        if(parentNode.getOptions()?.extras?.attached){
                            parentNode.setSelected(true);
                            link.setSelected(true);
                        }
                    })
                })
            }
        });

        return widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
    }

    function cutNode(): void {
        const widget = tracker.currentWidget?.content as XircuitsPanel;

        if (!widget) return;

        const engine = widget.xircuitsApp.getDiagramEngine();
        const selected = selectAllRelevantNodes(widget);
        const copies = selected.map(entity =>
            entity.serialize()
        );

        selected.forEach(node => node.remove());
        engine.repaintCanvas();

        localStorage.setItem('clipboard', JSON.stringify(copies));

    
    }

    function copyNode(): void {
        const widget = tracker.currentWidget?.content as XircuitsPanel;

        if (!widget) return;

        const copies = selectAllRelevantNodes(widget).map(entity => entity.serialize());

        localStorage.setItem('clipboard', JSON.stringify(copies));
    }

    function pasteNode(): void {
        const widget = tracker.currentWidget?.content as XircuitsPanel;
        if (!widget) return;
    
        const engine = widget.xircuitsApp.getDiagramEngine();
        const model = engine.getModel();
        const clipboard = JSON.parse(localStorage.getItem('clipboard'));
    
        if (!clipboard) return;
        model.clearSelection();
    
        const newNodeModels = [];
        let idMap = {};
    
        const clipboardNodes = clipboard.filter(serialized => serialized.type.includes('node'));
        const clipboardLinks = clipboard.filter(serialized => serialized.type.includes('link'));
    
        let totalX = 0, totalY = 0, nodesCount = clipboardNodes.length;
    
        clipboardNodes.forEach(serializedNode => {

            if (serializedNode.name === 'Start' || serializedNode.name === 'Finish') {
                console.log(serializedNode.name, " cannot be copied!")
                return;
            }

            let originalNodeInstance = model.getNodes().find(node => node.getID() === serializedNode.id);
            let clonedNodeModelInstance;
    
            if (originalNodeInstance) {
                clonedNodeModelInstance = originalNodeInstance.clone();
            } else {
                clonedNodeModelInstance = createNewNodeInstance(model, engine, serializedNode);
            }
    
            newNodeModels.push(clonedNodeModelInstance);
            idMap = mapNodeAndPortIds(serializedNode, clonedNodeModelInstance, idMap);
    
            totalX += clonedNodeModelInstance.getX();
            totalY += clonedNodeModelInstance.getY();
        });
    
        // Calculate the center of the group of nodes.
        const centerX = totalX / nodesCount;
        const centerY = totalY / nodesCount;
    
        placeNodes(engine, model, newNodeModels, widget.mousePosition, centerX, centerY);
        recreateLinks(engine, model, clipboardLinks, idMap, widget.mousePosition, centerX, centerY);
        app.commands.execute(commandIDs.reloadNode);
        engine.repaintCanvas();
    }
    
    function createNewNodeInstance(model: SRD.DiagramModel, engine: SRD.DiagramEngine, serializedNode): NodeModel {
        const clonedNodeModelInstance = model.getActiveNodeLayer()
                                        .getChildModelFactoryBank(engine)
                                        .getFactory(serializedNode.type)
                                        .generateModel({ initialConfig: serializedNode });
    
        clonedNodeModelInstance.deserialize({
            engine: engine,
            data: serializedNode,
            registerModel: () => {},
            getModel: function <T extends BaseModel<BaseModelGenerics>>(id: string): Promise<T> {
                throw new Error('Function not implemented.');
            }
        });
    
        return clonedNodeModelInstance;
    }
    
    function mapNodeAndPortIds(serializedNode, clonedNodeModelInstance: CustomNodeModel, idMap) {
        // Map the ID of the serialized node to the ID of the cloned node instance.
        idMap[serializedNode.id] = clonedNodeModelInstance.getID();
    
        // For each serialized port in the serialized node...
        serializedNode.ports.forEach(serializedPort => {
            // ...find the corresponding port in the cloned node instance by comparing names.
            const correspondingNewPort: any = Object.values(clonedNodeModelInstance.getPorts()).find((newPort: CustomPortModel) => newPort.getName() === serializedPort.name);
    
            // If the corresponding port exists, map the ID of the serialized port to the ID of the cloned port.
            if(correspondingNewPort) idMap[serializedPort.id] = correspondingNewPort.getID();
        });
    
        // Return the updated ID map.
        return idMap;
    }
    
    function placeNodes(engine: SRD.DiagramEngine, model: SRD.DiagramModel, newNodeModels: CustomNodeModel[], mousePosition: { x: number; y: number }, centerX: number, centerY: number): void {
        let clientMouseEvent = { clientX: mousePosition.x, clientY: mousePosition.y };
        let relativeMousePosition = engine.getRelativeMousePoint(clientMouseEvent);
    
        newNodeModels.forEach((modelInstance) => {
            // Get the offset position of the node relative to the group's center
            let nodeOffsetX = modelInstance.getX() - centerX;
            let nodeOffsetY = modelInstance.getY() - centerY;
    
            modelInstance.setPosition(
                relativeMousePosition.x + nodeOffsetX,
                relativeMousePosition.y + nodeOffsetY
            );
    
            model.addNode(modelInstance);
    
            if (modelInstance.getOptions()['type'] === 'default') {
                model.removeNode(modelInstance);
            }
    
            modelInstance.setSelected(true);
        });
    }

    function recreateLinks(engine: SRD.DiagramEngine, model: SRD.DiagramModel, clipboardLinks, idMap, mousePosition: { x: number; y: number }, centerX: number, centerY: number): void {
        clipboardLinks.forEach(serializedLink => {
            const newSourceID = idMap[serializedLink.sourcePort];
            const newTargetID = idMap[serializedLink.targetPort];

            if (newSourceID && newTargetID) {
                const { sourcePort, targetPort } = getSourceAndTargetPorts(model, newSourceID, newTargetID);
                if(sourcePort && targetPort) recreateLink(engine, model, serializedLink, sourcePort, targetPort, mousePosition, centerX, centerY);
            }
        });
    }    
    
    function getSourceAndTargetPorts(model: SRD.DiagramModel, newSourceID: string, newTargetID: string): { sourcePort, targetPort } {
        let sourcePort, targetPort;
    
        model.getSelectedEntities().forEach((entity) => {
            if (entity instanceof NodeModel) {
                if(entity.getPortFromID(newSourceID)) sourcePort = entity.getPortFromID(newSourceID);
                if(entity.getPortFromID(newTargetID)) targetPort = entity.getPortFromID(newTargetID);
            }
        });
    
        return { sourcePort, targetPort };
    }
    
    function recreateLink(engine: SRD.DiagramEngine, model: SRD.DiagramModel, serializedLink, sourcePort, targetPort, mousePosition: { x: number; y: number }, centerX: number, centerY: number): void {
        let originalLink = model.getLinks().find(link => link.getID() === serializedLink.id);
        let clonedLink;
        let points = [];
    
        let clientMouseEvent = { clientX: mousePosition.x, clientY: mousePosition.y };
        let relativeMousePosition = engine.getRelativeMousePoint(clientMouseEvent);
    
        if (originalLink) {
            clonedLink = originalLink.clone();
        } else {
            clonedLink = createNewLink(serializedLink);
            points = serializedLink.points.map(point => new PointModel({ id: point.id, link: clonedLink, position: new Point(point.x, point.y) }));
        }
    
        clonedLink.setSourcePort(sourcePort);
        clonedLink.setTargetPort(targetPort);
        clonedLink.setSelected(true);
    
        if (points.length > 0) clonedLink.setPoints(points);
    
        clonedLink.getPoints().forEach((point) => {
            // Adjust each point's position relative to the group's center
            let pointOffsetX = point.getX() - centerX;
            let pointOffsetY = point.getY() - centerY;
    
            point.setPosition(
                relativeMousePosition.x + pointOffsetX,
                relativeMousePosition.y + pointOffsetY
            );
    
            point.setSelected(true);
        });
    
        model.addLink(clonedLink);
    }
    
    function createNewLink(serializedLink): CustomLinkModel {
        if(serializedLink.type === 'parameter-link') return new ParameterLinkModel(serializedLink);
        else if(serializedLink.type === 'triangle-link') return new TriangleLinkModel(serializedLink);
    }
    

    async function editParameter(): Promise<void> {
        const widget = tracker.currentWidget?.content as XircuitsPanel;

        if (widget) {
            const selected_node = getLastSelectedNode();
            const nodeName = selected_node.getOptions()["name"];
            let updatedNode = null;
    
            if (nodeName.startsWith("Literal ")) {
                updatedNode = await editLiteral(widget, selected_node);
            } else if (nodeName.startsWith("Argument ")) {
                updatedNode = await editArgument(widget, selected_node);
            } else {
                showDialog({
                    title: 'Only Literal or Argument Node can be edited',
                    buttons: [Dialog.warnButton({ label: 'OK' })]
                });
                return;
            }
            
            if (updatedNode) {
                // Set new node to old node position
                let position = selected_node.getPosition();
                updatedNode.setPosition(position);
                widget.xircuitsApp.getDiagramEngine().getModel().addNode(updatedNode);
    
                // Update the links
                const links = widget.xircuitsApp.getDiagramEngine().getModel()["layers"][0]["models"];
                for (let linkID in links) {
                    let link = links[linkID];
                    if (link["sourcePort"] && link["targetPort"]) {
                        let newLink = new DefaultLinkModel();
                        
                        // a parameter node will have only 1 outPort
                        let sourcePort = Object.values(updatedNode.getPorts())[0] as CustomPortModel;
                        newLink.setSourcePort(sourcePort);
    
                        // This to make sure the new link came from the same literal node as previous link
                        let sourceLinkNodeId = link["sourcePort"].getParent().getID();
                        let sourceNodeId = selected_node.getOptions()["id"];
                        if (sourceLinkNodeId == sourceNodeId) {
                            newLink.setTargetPort(link["targetPort"]);
                        }
    
                        widget.xircuitsApp.getDiagramEngine().getModel().addLink(newLink);
                    }
                }

                // Remove old node
                selected_node.remove();
                widget.xircuitsApp.getDiagramEngine().repaintCanvas();
            }
        }
    }
    
    async function editLiteral(widget: XircuitsPanel, selected_node: any): Promise<any> {
        if (!selected_node.getOptions()["name"].startsWith("Literal ")) {
            showDialog({
                title: 'Only Literal Node can be edited',
                buttons: [Dialog.warnButton({ label: 'OK' })]
            });
            return null;
        }

        const connections = Object.values(selected_node.ports)
          .map((p: CustomPortModel) => Object.keys(p.links).length)
          .reduce((a, b) => a+b);

        const literalType = selected_node["extras"]["type"];
        let oldValue = selected_node.getPorts()["out-0"].getOptions()["label"];
        
        if (literalType == "chat") {
            oldValue = JSON.parse(oldValue);
        }
        
        const updateTitle = `Update ${literalType}`;
        let nodeData: CustomNodeModelOptions = {color: selected_node["color"], type: selected_node["extras"]["type"], extras: {attached: selected_node["extras"]["attached"]}}
        let updatedContent = await handleLiteralInput(selected_node["name"], nodeData, oldValue, literalType, updateTitle, connections);
        
        if (!updatedContent) {
            // handle case where Cancel was clicked or an error occurred
            return null;
        }
        
        return updatedContent;
    }
    
    async function editArgument(widget: XircuitsPanel, selected_node: any): Promise<any> {
        if (!selected_node.getOptions()["name"].startsWith("Argument ")) {
            showDialog({
                title: 'Only Argument Node can be edited',
                buttons: [Dialog.warnButton({ label: 'OK' })]
            });
            return null;
        }
        // Expected Format: Argument (datatype): ArgumentVarName
        let oldValue = selected_node.name.split(':')[1].trim();;

        const updateTitle = `Update Argument`;
        let nodeData: CustomNodeModelOptions = {color: selected_node["color"], type: selected_node["extras"]["type"]}
        let updatedContent = await handleArgumentInput(nodeData, updateTitle, oldValue);
        
        if (!updatedContent) {
            // handle case where Cancel was clicked or an error occurred
            return null;
        }
        
        return updatedContent;
    }

    function deleteEntity(): void {
        const widget = tracker.currentWidget?.content as XircuitsPanel;
        if (!widget) return;

        let selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
        const model = widget.xircuitsApp.getDiagramEngine().getModel();

        function isLiteralNode(node) {
            return node.getOptions()?.name?.startsWith("Literal ") ?? false;
        }

        // *Unselect attached literal nodes
        selectedEntities.forEach((entity) => {
            if (entity instanceof CustomNodeModel && isLiteralNode(entity)) {
                const isAttached = entity.getOptions()?.extras?.attached === true;
                if (isAttached) {
                    // If the literal node is attached, unselect it
                    entity.setSelected(false);
                }
            }
        });

        selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();

        // Logic to handle attached Literals
        selectedEntities.forEach((entity) => {
            if (entity instanceof CustomNodeModel && !isLiteralNode(entity)) {
                // For each non-literal node, check its input ports for attached literals
                entity.getInPorts().forEach((port: CustomPortModel) => {
                    const sourceNodes = port.getSourceNodes();
                    sourceNodes.forEach((sourceNode: CustomNodeModel) => {
                        if (sourceNode && isLiteralNode(sourceNode)) {
                            const isAttached = sourceNode.getOptions()?.extras?.attached === true;
                            if (isAttached) {
                                // Check if literal is connected to other nodes
                                const hasOtherConnections = sourceNode.getOutPorts().some(outPort => {
                                    return Object.values(outPort.getLinks()).some(link => {
                                        const targetNode = link.getTargetPort()?.getParent();
                                        return targetNode && targetNode !== entity && 
                                                !selectedEntities.includes(targetNode);
                                    });
                                });

                                if (!hasOtherConnections) {
                                    // If literal is only connected to this node, keep it selected for deletion
                                    sourceNode.setSelected(true);
                                } else {
                                    // If literal has other connections, unselect it
                                    sourceNode.setSelected(false);
                                }
                            }
                        }
                    });
                });
            }
        });

        selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
        
        // Separate collections for nodes and links
        let nodes = [];
        let links = [];
        let points = [];

        // Separating nodes and links
        selectedEntities.forEach((entity) => {
            if (entity instanceof CustomNodeModel) {
                nodes.push(entity);
            } else if (entity instanceof LinkModel) {
                links.push(entity);
            } else if (entity instanceof PointModel) {
                points.push(entity);
            }
        });

        // Processing Links
        links.forEach((link) => {
            const port = link.getTargetPort();
            if (port instanceof CustomDynaPortModel) {
                port.shiftPorts({ shouldShiftBack: true }) // delete
            }
            link.remove();
        });

        // Processing Points
        points.forEach((point) => {
            point.remove();
        });

        // Processing Nodes
        nodes.forEach((node) => {
            // Before deleting the node, Check each outPort's links and their targetPorts
            node.getOutPorts().forEach((outPort) => {
                const outPortLinks = outPort.getLinks();
                for (let linkId in outPortLinks) {
                    const link = model.getLink(linkId);
                    const targetPort = link.getTargetPort();
                    if (targetPort instanceof CustomDynaPortModel) {
                        targetPort.shiftPorts({ shouldShiftBack: true }) // delete
                    }
                }
            });

            if (node.getOptions()["name"] !== "undefined") {
                let modelName = node.getOptions()["name"];
                const errorMsg = `${modelName} node cannot be deleted!`;

                if (modelName !== 'Start' && modelName !== 'Finish') {
                    if (!node.isLocked()) {
                        node.remove();
                    } else {
                        showDialog({
                            title: 'Locked Node',
                            body: errorMsg,
                            buttons: [Dialog.warnButton({ label: 'OK' })]
                        });
                    }
                } else {
                    showDialog({
                        title: 'Undeletable Node',
                        body: errorMsg,
                        buttons: [Dialog.warnButton({ label: 'OK' })]
                    });
                }
            }
        });
        widget.xircuitsApp.getDiagramEngine().repaintCanvas();
    }

    // Add command to attach selected node
    commands.addCommand(commandIDs.attachNode, {
        execute: async () => {

            const widget = tracker.currentWidget?.content as XircuitsPanel;
            const model = widget.xircuitsApp.getDiagramEngine().getModel();
            const selected_entities = model.getSelectedEntities();
            const connected_literals = selected_entities.filter((entity): entity is CustomNodeModel => {
                return entity instanceof CustomNodeModel &&
                       entity.getOptions().name.startsWith("Literal ") &&
                       Object.keys(entity.getOutPorts()[0].getLinks()).length > 0;
            });

            connected_literals.forEach(node => {
                node.setSelected(false);
                node.getOptions().extras.attached = true;
                let parameterOutPort = node.getOutPorts()[0] as CustomPortModel;
                let connectedNodes = parameterOutPort.getTargetNodes();
                connectedNodes.forEach((node: CustomNodeModel) => node.setSelected(true));

            });
            widget.xircuitsApp.getDiagramEngine().repaintCanvas();
            widget.triggerCanvasUpdateSignal.emit(null);
        },
        label: trans.__('attach node')
    });

    // Add command to attach all parameter nodes
    commands.addCommand(commandIDs.attachAllNodes, {
        execute: async () => {

            const widget = tracker.currentWidget?.content as XircuitsPanel;
            const model = widget.xircuitsApp.getDiagramEngine().getModel();
            const selected_entities = model.getSelectedEntities();

            const literal_nodes = [];
            const selected_nodes = selected_entities.filter(entity => entity instanceof NodeModel) as CustomNodeModel[];
            selected_nodes.forEach(node => {
                node.setSelected(false);
                let inPorts = node.getInPorts();
                Object.values(inPorts).forEach((port: CustomPortModel) => {
                    let sourceNode = port.getSourceNodes()[0] as CustomNodeModel;
                    if (sourceNode && sourceNode['name'].startsWith('Literal ') && !sourceNode['extras']['attached']) {
                        sourceNode.getOptions().extras.attached = true;
                        sourceNode.setSelected(true);
                        literal_nodes.push(sourceNode);
                    }
                })
            });

            literal_nodes.forEach(node => {
                let parameterOutPort = node.getOutPorts()[0] as CustomPortModel;
                let connectedNodes = parameterOutPort.getTargetNodes();
                connectedNodes.forEach((node: CustomNodeModel) => node.setSelected(true));
            });

            widget.xircuitsApp.getDiagramEngine().repaintCanvas();
            widget.triggerCanvasUpdateSignal.emit(null);
        },
        label: trans.__('attach all nodes')
    });

    // Add command to detach all parameter nodes
    commands.addCommand(commandIDs.detachAllNodes, {
        execute: async () => {

            const widget = tracker.currentWidget?.content as XircuitsPanel;
            const model = widget.xircuitsApp.getDiagramEngine().getModel();
            const selected_entities = model.getSelectedEntities();

            const literal_nodes = [];
            const selected_nodes = selected_entities.filter(entity => entity instanceof NodeModel) as CustomNodeModel[];
            selected_nodes.forEach(node => {
                node.setSelected(false);
                let inPorts = node.getInPorts();
                Object.values(inPorts).forEach((port: CustomPortModel) => {
                    let sourceNode = port.getSourceNodes()[0] as CustomNodeModel;
                    if (sourceNode && sourceNode['name'].startsWith('Literal ') && sourceNode['extras']['attached']) {
                        sourceNode.getOptions().extras.attached = false;
                        sourceNode.setSelected(true);
                        literal_nodes.push(sourceNode);
                    }
                })
            });

            literal_nodes.forEach(node => {
                let parameterOutPort = node.getOutPorts()[0] as CustomPortModel;
                let connectedNodes = parameterOutPort.getTargetNodes();
                connectedNodes.forEach((node: CustomNodeModel) => node.setSelected(true));
            });

            widget.xircuitsApp.getDiagramEngine().repaintCanvas();
            widget.triggerCanvasUpdateSignal.emit(null);
        },
        label: trans.__('detach all nodes')
    });
    
}
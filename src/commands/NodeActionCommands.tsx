import { JupyterFrontEnd } from '@jupyterlab/application';
import { commandIDs } from '../components/xircuitBodyWidget';
import { ITranslator } from '@jupyterlab/translation';
import { IXircuitsDocTracker } from '../index';
import * as _ from 'lodash';
import { CustomNodeModel } from '../components/CustomNodeModel';
import { XPipePanel } from '../xircuitWidget';
import { Dialog, showDialog } from '@jupyterlab/apputils';
import { DefaultLinkModel } from '@projectstorm/react-diagrams';
import { BaseModel, BaseModelGenerics } from '@projectstorm/react-canvas-core';
import { copyIcon, cutIcon, pasteIcon, redoIcon, undoIcon } from '@jupyterlab/ui-components';
import { AdvancedComponentLibrary, fetchNodeByName } from '../tray_library/AdvanceComponentLib';
import { formDialogWidget } from '../dialog/formDialogwidget';
import { CommentDialog } from '../dialog/CommentDialog';
import React from 'react';
import { showFormDialog } from '../dialog/FormDialog';
import { inputDialog } from '../dialog/LiteralInputDialog';

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

    function selectedNode() {
        const widget = tracker.currentWidget?.content as XPipePanel;
        const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
        let node;
        selectedEntities.map((x) => node = x);
        return node ?? null;
    }

    //Add command to open node's script at specific line
    commands.addCommand(commandIDs.openScript, {
        execute: async (args) => {
            const node = selectedNode();
            const nodePath = args['nodePath'] as string ?? node.extras.path;
            const nodeName = args['nodeName'] as string ?? node.name;
            const nodeLineNo = args['nodeLineNo'] as number ?? node.extras.lineNo;

            if (nodeName.startsWith('Literal') || nodeName.startsWith('Argument')) {
                showDialog({
                    title: `${node.name} don't have its own script`,
                    buttons: [Dialog.warnButton({ label: 'OK' })]
                })
                return;
            }

            // Open node's file name
            const newWidget = await app.commands.execute(
                commandIDs.openDocManager,
                {
                    path: nodePath
                }
            );
            newWidget.context.ready.then(() => {
                // Go to end of node's line first before go to its class
                app.commands.execute('codemirror:go-to-line', {
                    line: nodeLineNo[0].end_lineno
                }).then(() => {
                    app.commands.execute('codemirror:go-to-line', {
                        line: nodeLineNo[0].lineno
                    })
                })
            });
        }
    });

    //Add command to undo
    commands.addCommand(commandIDs.undo, {
        execute: () => {
            const widget = tracker.currentWidget?.content as XPipePanel;
            const model = widget.context.model.sharedModel;

            model.undo();
        },
        label: trans.__('Undo'),
        icon: undoIcon,
        isEnabled: () => {
            const widget = tracker.currentWidget?.content as XPipePanel;
            const canUndo = widget.context.model.sharedModel.canUndo();

            return canUndo ?? false;
        }
    });

    //Add command to redo
    commands.addCommand(commandIDs.redo, {
        execute: () => {
            const widget = tracker.currentWidget?.content as XPipePanel;
            const model = widget.context.model.sharedModel;

            model.redo();
        },
        label: trans.__('Redo'),
        icon: redoIcon,
        isEnabled: () => {
            const widget = tracker.currentWidget?.content as XPipePanel;
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
            const widget = tracker.currentWidget?.content as XPipePanel;
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
            const widget = tracker.currentWidget?.content as XPipePanel;
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
        execute: editLiteral,
        label: trans.__('Edit'),
        isEnabled: () => {
            let isNodeSelected: boolean;
            const node = selectedNode();
            if (node.getOptions()["name"].startsWith("Literal")) {
                isNodeSelected = true;
            }
            return isNodeSelected ?? false;
        }
    });

    //Add command to delete node
    commands.addCommand(commandIDs.deleteNode, {
        execute: deleteNode,
        label: "Delete",
        isEnabled: () => {
            const widget = tracker.currentWidget?.content as XPipePanel;
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            let isNodeSelected: boolean
            if (selectedEntities.length > 0) {
                isNodeSelected = true
            }
            return isNodeSelected ?? false;
        }
    });

    //Add command to reload selected node
    commands.addCommand(commandIDs.reloadNode, {
        execute: async () => {
            const widget = tracker.currentWidget?.content as XPipePanel;
            const selected_node = selectedNode();

            // When a General Component is selected, just return
            if (selected_node.name.startsWith("Literal") || selected_node.name.startsWith("Argument")) {
                showDialog({
                    title: `${selected_node.name} cannot be reloaded`,
                    buttons: [Dialog.warnButton({ label: 'OK' })]
                })
                return
            }

            const current_node = await fetchNodeByName(selected_node.name)
            const node = AdvancedComponentLibrary({ model: current_node });
            const nodePosition = selected_node.position;

            // Add node at given position
            node.setPosition(nodePosition);
            widget.xircuitsApp.getDiagramEngine().getModel().addNode(node);

            // Get all connected links
            let links = widget.xircuitsApp.getDiagramEngine().getModel()["layers"][0]["models"];

            try {
                // Update the links
                for (let linkID in links) {

                    let link = links[linkID];

                    if (link["sourcePort"] && link["targetPort"]) {

                        const oldSourcePortLink = link['sourcePort'];
                        const oldTargetPortLink = link['targetPort'];
                        const sourcePortName = oldSourcePortLink.options.name;
                        const targetPortName = oldTargetPortLink.options.name;
                        const selectedNodeId = selected_node.getOptions()["id"];
                        let newLink = new DefaultLinkModel();

                        // When old link came from outPorts of selected node
                        if (oldSourcePortLink.parent.name == node.name) {
                            // Set rendered node's outPorts as sourcePort
                            let sourcePort = node.getPorts()[sourcePortName];
                            newLink.setSourcePort(sourcePort);

                            // This to make sure the target new link came from the same node as previous link
                            let sourceLinkNodeId = oldSourcePortLink.getParent().getID();
                            if (sourceLinkNodeId == selectedNodeId) {
                                newLink.setTargetPort(oldTargetPortLink);
                            }
                        }
                        // When old link go to inPorts of selected node
                        else if (oldTargetPortLink.parent.name == node.name) {
                            // This to make sure the source new link came from the same node as previous link
                            let targetLinkNodeId = oldTargetPortLink.getParent().getID();
                            if (targetLinkNodeId == selectedNodeId) {
                                newLink.setSourcePort(oldSourcePortLink);
                            }

                            // Set rendered node's inPorts as targetPort
                            let targetPort = node.getPorts()[targetPortName];
                            newLink.setTargetPort(targetPort);
                        }
                        widget.xircuitsApp.getDiagramEngine().getModel().addLink(newLink);
                    }
                }
            } catch{
                // No-op
            }
            finally {
                // Remove old node
                selected_node.remove();
            }
        },
        label: trans.__('Reload node')
    });

    //Add command to add node given position
    commands.addCommand(commandIDs.addNodeGivenPosition, {
        execute: (args) => {
            const node = args['node'] as unknown as CustomNodeModel;
            const nodePosition = args['nodePosition'] as any;

            const widget = tracker.currentWidget?.content as XPipePanel;

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
            const widget = tracker.currentWidget?.content as XPipePanel;

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
            widget.xircuitsApp.getDiagramEngine().getModel().addLink(newLink);
        },
        label: trans.__('Link node')
    });

    //Add command to connect link to obvious port given link and target node
    commands.addCommand(commandIDs.connectLinkToObviousPorts, {
        execute: (args) => {
            const widget = tracker.currentWidget?.content as XPipePanel;
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

            for (let outPortIndex in outPorts) {
                const outPort = outPorts[outPortIndex];
                const outPortName = outPort.getOptions()['name'];
                const outPortLabel = outPort.getOptions()['label'];
                const outPortType = outPort.getOptions()['type'];
                const outPortLabelArr: string[] = outPortLabel.split('_');
                if (outPort.getOptions()['label'] == '▶') {
                    // Skip ▶ outPort
                    continue
                };

                for (let inPortIndex in inPorts) {
                    const inPort = inPorts[inPortIndex];
                    const inPortName = inPort.getOptions()['name'];
                    const inPortLabel = inPort.getOptions()['label'];
                    const inPortType = inPort.getOptions()['type'];
                    const inPortLabelArr: string[] = inPortLabel.split('_');
                    // Compare if there is similarity for each word
                    const intersection = outPortLabelArr.filter(element => inPortLabelArr.includes(element));

                    if (outPortLabel == inPortLabel && outPortType == inPortType || intersection.length >= 1) {
                        // Create new link
                        const newLink = new DefaultLinkModel();
                        // Set sourcePort
                        const sourcePort = sourceNode.getPorts()[outPortName];
                        newLink.setSourcePort(sourcePort);
                        // Set targetPort
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
            const widget = tracker.currentWidget?.content as XPipePanel;
            
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

    function cutNode(): void {
        const widget = tracker.currentWidget?.content as XPipePanel;

        if (widget) {
            const engine = widget.xircuitsApp.getDiagramEngine();
            const selected = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities()
            const copies = selected.map(entity =>
                entity.clone().serialize()
            );

            // TODO: Need to make this event working to be on the command manager, so the user can undo
            // and redo it.
            // engine.fireEvent(
            //     {
            //         nodes: selected,
            //         links: selected.reduce(
            //             (arr, node) => [...arr, ...node.getAllLinks()],
            //             [],
            //         ),
            //     },
            //     'entitiesRemoved',
            // );
            selected.forEach(node => node.remove());
            engine.repaintCanvas();

            localStorage.setItem('clipboard', JSON.stringify(copies));

        }
    }

    function copyNode(): void {
        const widget = tracker.currentWidget?.content as XPipePanel;

        if (widget) {
            const copies = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities().map(entity =>
                entity.clone().serialize(),
            );

            localStorage.setItem('clipboard', JSON.stringify(copies));

        }
    }

    function pasteNode(): void {
        const widget = tracker.currentWidget?.content as XPipePanel;

        if (widget) {
            const engine = widget.xircuitsApp.getDiagramEngine();
            const model = widget.xircuitsApp.getDiagramEngine().getModel();

            const clipboard = JSON.parse(localStorage.getItem('clipboard'));
            if (!clipboard) return;

            model.clearSelection();

            const models = clipboard.map(serialized => {
                const modelInstance = model
                    .getActiveNodeLayer()
                    .getChildModelFactoryBank(engine)
                    .getFactory(serialized.type)
                    .generateModel({ initialConfig: serialized });

                modelInstance.deserialize({
                    engine: engine,
                    data: serialized,
                    registerModel: () => { },
                    getModel: function <T extends BaseModel<BaseModelGenerics>>(id: string): Promise<T> {
                        throw new Error('Function not implemented.');
                    }
                });

                return modelInstance;
            });

            models.forEach(modelInstance => {
                const oldX = modelInstance.getX();
                const oldY = modelInstance.getY();

                modelInstance.setPosition(oldX + 10, oldY + 10)
                model.addNode(modelInstance);
                // Remove any empty/default node
                if (modelInstance.getOptions()['type'] == 'default') model.removeNode(modelInstance)
                modelInstance.setSelected(true);
            });

            localStorage.setItem(
                'clipboard',
                JSON.stringify(
                    models.map(modelInstance =>
                        modelInstance.clone().serialize(),
                    ),
                ),
            );
            // TODO: Need to make this event working to be on the command manager, so the user can undo
            // and redo it.
            // engine.fireEvent({ nodes: models }, 'componentsAdded');
            widget.xircuitsApp.getDiagramEngine().repaintCanvas();
        }
    }

    async function editLiteral(): Promise<void> {
        const widget = tracker.currentWidget?.content as XPipePanel;

        if (widget) {
            const selected_node = selectedNode();

            if (!selected_node.getOptions()["name"].startsWith("Literal")) {
                showDialog({
                    title: 'Only Literal Node can be edited',
                    buttons: [Dialog.warnButton({ label: 'OK' })]
                })
                return
            }

            let node = null;
            const links = widget.xircuitsApp.getDiagramEngine().getModel()["layers"][0]["models"];
            const oldValue = selected_node.getPorts()["out-0"].getOptions()["label"];
            const literalType = selected_node["name"].split(" ")[1];
            let isStoreDataType: boolean = false;
            let isTextareaInput: string = "";
            
            switch(literalType){
                case "String":
                    isTextareaInput = 'textarea';
                    break;
                case "List":
                case "Tuple":
                case "Dict":
                    isStoreDataType = true;
                    break;
                case "True":
                case "False":
                    return;
                default:
                    break;
            }
            const newTitle = `Update ${literalType}`;
            const dialogOptions = inputDialog(newTitle, oldValue, literalType, isStoreDataType, isTextareaInput);
            const dialogResult = await showFormDialog(dialogOptions);
            if (dialogResult["button"]["label"] == 'Cancel') {
                // When Cancel is clicked on the dialog, just return
                return;
            }
            const strContent: string = dialogResult["value"][newTitle];

            node = new CustomNodeModel({ name: selected_node["name"], color: selected_node["color"], extras: { "type": selected_node["extras"]["type"] } });
            node.addOutPortEnhance(strContent, 'out-0');

            // Set new node to old node position
            let position = selected_node.getPosition();
            node.setPosition(position);
            widget.xircuitsApp.getDiagramEngine().getModel().addNode(node);

            // Update the links
            for (let linkID in links) {

                let link = links[linkID];

                if (link["sourcePort"] && link["targetPort"]) {

                    let newLink = new DefaultLinkModel();

                    let sourcePort = node.getPorts()["out-0"];
                    newLink.setSourcePort(sourcePort);

                    // This to make sure the new link came from the same literal node as previous link
                    let sourceLinkNodeId = link["sourcePort"].getParent().getID()
                    let sourceNodeId = selected_node.getOptions()["id"]
                    if (sourceLinkNodeId == sourceNodeId) {
                        newLink.setTargetPort(link["targetPort"]);
                    }

                    widget.xircuitsApp.getDiagramEngine().getModel().addLink(newLink)
                }
            }

            // Remove old node
            selected_node.remove();
        }
    }

    function deleteNode(): void {
        const widget = tracker.currentWidget?.content as XPipePanel;

        if (widget) {
            const node = selectedNode();
            if (!node) {
                // When no node selected, just return
                return;
            }
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            selectedEntities.forEach((node) => {
                if (node.getOptions()["name"] !== "undefined") {
                    let modelName = node.getOptions()["name"];
                    const errorMsg = `${modelName} node cannot be deleted!`
                    if (modelName !== 'Start' && modelName !== 'Finish') {
                        if (!node.isLocked()) {
                            node.remove()
                        } else {
                            showDialog({
                                title: 'Locked Node',
                                body: errorMsg,
                                buttons: [Dialog.warnButton({ label: 'OK' })]
                            });
                        }
                    }
                    else {
                        showDialog({
                            title: 'Undeletable Node',
                            body: errorMsg,
                            buttons: [Dialog.warnButton({ label: 'OK' })]
                        });
                    }
                }
            })
            widget.xircuitsApp.getDiagramEngine().repaintCanvas();
        }
    }
}
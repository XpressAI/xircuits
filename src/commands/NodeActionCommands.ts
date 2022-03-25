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

    //Add command to open canvas's node its script
    commands.addCommand(commandIDs.openScript, {
        execute:  () =>{
            const widget = tracker.currentWidget?.content as XPipePanel;
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            _.forEach(selectedEntities, (model) => {
                const filePath = model.extras.path
                app.commands.execute(commandIDs.openDocManager, {
                    path: filePath
                });
            });
            widget.xircuitsApp.getDiagramEngine().repaintCanvas();
        }
    });

    //Add command to undo
    commands.addCommand(commandIDs.undo, {
        execute:  () =>{
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
            const widget = tracker.currentWidget?.content as XPipePanel;
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            let isNodeSelected: boolean;
            _.forEach(selectedEntities, (model) => {
                if (model.getOptions()["name"].startsWith("Literal")) {
                    isNodeSelected = true;
                }
            });
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

    //Add command to add node
    commands.addCommand(commandIDs.addNode, {
        execute:  (args) =>{
            const node = args['node'] as unknown as CustomNodeModel;
            const nodePosition = args['nodePosition'] as any;

            const widget = tracker.currentWidget?.content as XPipePanel;
            node.setPosition(nodePosition);
            widget.xircuitsApp.getDiagramEngine().getModel().addNode(node);
        },
        label: trans.__('Add node')
    });

    //Add command to connect node given link
    commands.addCommand(commandIDs.connectNode, {
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
            const linkPort = sourceLink.getSourcePort();

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
            }
            newLink.setSourcePort(sourcePort);
            newLink.setTargetPort(targetPort);
            widget.xircuitsApp.getDiagramEngine().getModel().addLink(newLink);
        },
        label: trans.__('Link node')
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
                if(modelInstance.getOptions()['type'] == 'default') model.removeNode(modelInstance)
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

    function editLiteral(): void {
        const widget = tracker.currentWidget?.content as XPipePanel;

        if (widget) {
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            _.forEach(selectedEntities, (model) => {

                if (!model.getOptions()["name"].startsWith("Literal")) {
                    showDialog({
                        title: 'Only Literal Node can be edited',
                        buttons: [Dialog.warnButton({ label: 'OK' })]
                    })
                    return
                }

                let node = null;
                let links = widget.xircuitsApp.getDiagramEngine().getModel()["layers"][0]["models"];
                let oldValue = model.getPorts()["out-0"].getOptions()["label"]

                // Prompt the user to enter new value
                let theResponse = window.prompt('Enter New Value (Without Quotes):', oldValue);
                if (theResponse == null || theResponse == "" || theResponse == oldValue) {
                    // When Cancel is clicked or no input provided, just return
                    return
                }
                node = new CustomNodeModel({ name: model["name"], color: model["color"], extras: { "type": model["extras"]["type"] } });
                node.addOutPortEnhance(theResponse, 'out-0');

                // Set new node to old node position
                let position = model.getPosition();
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
                        let sourceNodeId = model.getOptions()["id"]
                        if (sourceLinkNodeId == sourceNodeId) {
                            newLink.setTargetPort(link["targetPort"]);
                        }

                        widget.xircuitsApp.getDiagramEngine().getModel().addLink(newLink)
                    }
                }

                // Remove old node
                model.remove();
            });
        }
    }

    function deleteNode(): void {
        const widget = tracker.currentWidget?.content as XPipePanel;

        if (widget) {
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            _.forEach(selectedEntities, (model) => {
                if (model.getOptions()["name"] !== "undefined") {
                    let modelName = model.getOptions()["name"];
                    const errorMsg = `${modelName} node cannot be deleted!`
                    if (modelName !== 'Start' && modelName !== 'Finish') {
                        if (!model.isLocked()) {
                            model.remove()
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
            });
            widget.xircuitsApp.getDiagramEngine().repaintCanvas();
        }
    }
}
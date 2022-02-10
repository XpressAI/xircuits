import { JupyterFrontEnd } from '@jupyterlab/application';
import { commandIDs } from '../components/xircuitBodyWidget';
import { ITranslator } from '@jupyterlab/translation';
import { IXircuitsDocTracker } from '../index';
import * as _ from 'lodash';
import { CustomNodeModel } from '../components/CustomNodeModel';
import { XPipePanel } from '../xircuitWidget';
import { Dialog, showDialog } from '@jupyterlab/apputils';
import { DefaultLinkModel } from '@projectstorm/react-diagrams';

/**
 * Add the commands for the xircuits's context menu.
 */
export function addContextMenuCommands(
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

    function editLiteral(): void {
        const widget = tracker.currentWidget?.content as XPipePanel;

        if (widget) {
            const selectedEntities = widget.xircuitsApp.getDiagramEngine().getModel().getSelectedEntities();
            _.forEach(selectedEntities, (model) => {

                let node = null;
                let links = widget.xircuitsApp.getDiagramEngine().getModel()["layers"][0]["models"];
                let oldValue = model.getPorts()["out-0"].getOptions()["label"]

                // Prompt the user to enter new value
                let theResponse = window.prompt('Enter New Value (Without Quotes):', oldValue);
                if(theResponse == null || theResponse == "" || theResponse == oldValue){
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
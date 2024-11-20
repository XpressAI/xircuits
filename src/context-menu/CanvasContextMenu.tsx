import * as React from 'react';

import { JupyterFrontEnd } from '@jupyterlab/application';
import { DiagramEngine, NodeModel, LinkModel } from '@projectstorm/react-diagrams';

import '../../style/ContextMenu.css'
import { commandIDs } from "../commands/CommandIDs";
import { CustomPortModel } from '../components/port/CustomPortModel';

export interface CanvasContextMenuProps {
	app: JupyterFrontEnd;
	engine: DiagramEngine;
	nodePosition?: {x: number, y: number};
}

export class CanvasContextMenu extends React.Component<CanvasContextMenuProps> {
	hideCanvasContextMenu() {
		//@ts-ignore
		this.props.engine.fireEvent({}, 'hidePanel');
	};
	
    render() {
        let models = this.props.engine.getModel().getSelectedEntities();
        let visibility = getMenuOptionsVisibility(models);

        const handleReloadNode = async () => {
            await this.props.app.commands.execute(commandIDs.refreshComponentList);
            let loadPromise = await this.props.app.commands.execute(commandIDs.reloadNode);
            await this.props.app.commands.execute(commandIDs.triggerLoadingAnimation, { loadPromise,
                loadingMessage: 'Reloading node...', loadingDisplayDuration: 10000, showLoadingAfter: 10 
            });
        };

        const handleAttachNode = async () => {
            await this.props.app.commands.execute(commandIDs.attachNode);
        };

        const handleAllAttachNodes = async () => {
            await this.props.app.commands.execute(commandIDs.attachAllNodes);
        };

        const handleDetachAllNodes = async () => {
            await this.props.app.commands.execute(commandIDs.detachAllNodes);
        };

        return (
            <div className="context-menu" onClick={this.hideCanvasContextMenu.bind(this)}>
                {visibility.showCutCopyPaste && (
                    <>
                        <div className="context-menu-option" onClick={() => this.props.app.commands.execute(commandIDs.cutNode)}>Cut</div>
                        <div className="context-menu-option" onClick={() => this.props.app.commands.execute(commandIDs.copyNode)}>Copy</div>
                        <div className="context-menu-option" onClick={() => this.props.app.commands.execute(commandIDs.pasteNode)}>Paste</div>
                    </>
                )}
                {visibility.showAttachNode && (
                    <div className="context-menu-option" onClick={handleAttachNode}>Attach</div>
                )}
                {visibility.showAttachAllNodes && (
                    <div className="context-menu-option" onClick={handleAllAttachNodes}>Attach Literals</div>
                )}
                {visibility.showDetachAllNodes && (
                    <div className="context-menu-option" onClick={handleDetachAllNodes}>Detach Literals</div>
                )}
                {visibility.showReloadNode && (
                <div className="context-menu-option" onClick={handleReloadNode}>Reload Node</div>
                )}
                {visibility.showEdit && (
                    <div className="context-menu-option" onClick={() => this.props.app.commands.execute(commandIDs.editNode)}>Edit</div>
                )}
                {visibility.showOpenScript && (
                    <div className="context-menu-option" onClick={() => this.props.app.commands.execute(commandIDs.openScript)}>Open Script</div>
                )}
                {visibility.showopenXircuitsWorkflow && (
                    <div className="context-menu-option" onClick={() => this.props.app.commands.execute(commandIDs.openXircuitsWorkflow)}>Open Workflow</div>
                )}
                {visibility.showDelete && (
                    <div className="context-menu-option" onClick={() => this.props.app.commands.execute(commandIDs.deleteEntity)}>Delete</div>
                )}
                {visibility.showUndoRedo && (
                    <>
                        <div className="context-menu-option" onClick={() => this.props.app.commands.execute(commandIDs.undo)}>Undo</div>
                        <div className="context-menu-option" onClick={() => this.props.app.commands.execute(commandIDs.redo)}>Redo</div>
                    </>
                )}
                {visibility.showAddComment && (
                    <div className="context-menu-option" onClick={() => this.props.app.commands.execute(commandIDs.addCommentNode, {nodePosition: this.props.nodePosition})}>Add Comment</div>
                )}
            </div>
        );
    }
}

export function getMenuOptionsVisibility(models) {

    function isLiteralNode(node) {
        return node.getOptions()?.name?.startsWith("Literal ") ?? false;
    }

    function isArgumentNode(node) {
        return node.getOptions()?.name?.startsWith("Argument ") ?? false;
    }

    function isComponentNode(node) {
        return node instanceof NodeModel && !isLiteralNode(node) && !isArgumentNode(node);
    }

    function isConnected(node): boolean {
        let outPorts = node.getOutPorts();
        let inPorts = node.getInPorts();
        return outPorts.some(port => Object.keys(port.getLinks()).length > 0) || 
               inPorts.some(port => Object.keys(port.getLinks()).length > 0);
    }
    
    function canAttachAllNodes(node) {
        let ports = node.getInPorts();
        return ports.some((port) => {
            let sourceNode = port.getSourceNodes()[0];
            return sourceNode?.getOptions()?.extras?.attached === false;
        });
    }

    function canDetachAllNodes(node) {
        let ports = node.getInPorts();
        return ports.some((port) => {
            let sourceNode = port.getSourceNodes()[0];
            return sourceNode?.getOptions()?.extras?.attached === true;
        });
    }

    function isXircuitsWorkflow(node) {
        return node.getOptions()?.extras?.type == 'xircuits_workflow' ?? false;
    }

    let isNodeSelected = models.some(model => model instanceof NodeModel);
    let isLinkSelected = models.some(model => model instanceof LinkModel);
    let literalNodes = models.filter(model => isLiteralNode(model));
    let parameterNodes = models.filter(model => !isComponentNode(model));
    let componentNodes = models.filter(model => isComponentNode(model));
    let isSingleParameterNodeSelected = parameterNodes.length === 1;
    let isSingleComponentNodeSelected = componentNodes.length === 1;
    let showReloadNode = isNodeSelected && componentNodes.length > 0;
    let showopenXircuitsWorkflow = isSingleComponentNodeSelected && models.some(model => isXircuitsWorkflow(model));
    let showAttachNode = literalNodes.length > 0 && literalNodes.some(model => isConnected(model));
    let showAttachAllNodes = componentNodes.some(model => canAttachAllNodes(model));
    let showDetachAllNodes = componentNodes.some(model => canDetachAllNodes(model));

    return {
        showCutCopyPaste: !models.length || isNodeSelected || isLinkSelected,
        showReloadNode: showReloadNode,
        showEdit: isSingleParameterNodeSelected,
        showOpenScript: isSingleComponentNodeSelected,
        showopenXircuitsWorkflow: showopenXircuitsWorkflow,
        showDelete: isNodeSelected || isLinkSelected || parameterNodes.length > 0,
        showUndoRedo: !models.length,
        showAddComment: !models.length,
        showAttachNode: showAttachNode,
        showAttachAllNodes: showAttachAllNodes,
        showDetachAllNodes: showDetachAllNodes
    };
}


export function countVisibleMenuOptions(visibility) {
    let count = Object.values(visibility).filter(isVisible => isVisible).length;

    // Adjusting the count for grouped options
    if (visibility.showCutCopyPaste) {
        // Cut, Copy, and Paste are grouped
        count += 2; // Adding for Copy and Paste
    }
    if (visibility.showUndoRedo) {
        // Undo and Redo are grouped
        count += 1; // Adding for Redo
    }

    return count;
}
import * as React from 'react';

import { JupyterFrontEnd } from '@jupyterlab/application';
import { DiagramEngine, NodeModel, LinkModel } from '@projectstorm/react-diagrams';
import { commandIDs } from '../components/XircuitsBodyWidget';

import '../../style/ContextMenu.css'

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
            let loadPromise = await this.props.app.commands.execute(commandIDs.reloadNode);
            await this.props.app.commands.execute(commandIDs.triggerLoadingAnimation, { loadPromise,
                loadingMessage: 'Reloading node...', loadingDisplayDuration: 10000, showLoadingAfter: 10 
            });
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
                {visibility.showReloadNode && (
                <div className="context-menu-option" onClick={handleReloadNode}>Reload Node</div>
                )}
                {visibility.showEdit && (
                    <div className="context-menu-option" onClick={() => this.props.app.commands.execute(commandIDs.editNode)}>Edit</div>
                )}
                {visibility.showOpenScript && (
                    <div className="context-menu-option" onClick={() => this.props.app.commands.execute(commandIDs.openScript)}>Open Script</div>
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
        return node.getOptions()?.name?.startsWith("Literal") ?? false;
    }

    function isArgumentNode(node) {
        return node.getOptions()?.name?.startsWith("Argument") ?? false;
    }

    function isComponentNode(node) {
        return !isLiteralNode(node) && !isArgumentNode(node);
    }

    let isNodeSelected = models.some(model => model instanceof NodeModel);
    let isLinkSelected = models.some(model => model instanceof LinkModel);
    let literalNodes = models.filter(model => isLiteralNode(model));
    let componentNodes = models.filter(model => isComponentNode(model));
    let isSingleLiteralNodeSelected = literalNodes.length === 1;
    let isSingleComponentNodeSelected = componentNodes.length === 1;
    let showReloadNode = isNodeSelected && componentNodes.length > 0;

    return {
        showCutCopyPaste: !models.length || isNodeSelected || isLinkSelected,
        showReloadNode: showReloadNode,
        showEdit: isSingleLiteralNodeSelected,
        showOpenScript: isSingleComponentNodeSelected,
        showDelete: isNodeSelected || isLinkSelected || literalNodes.length > 0,
        showUndoRedo: !models.length,
        showAddComment: !models.length
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
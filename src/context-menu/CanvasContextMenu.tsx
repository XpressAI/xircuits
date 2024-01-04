import * as React from 'react';

import styled from '@emotion/styled';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { DiagramEngine, NodeModel, LinkModel } from '@projectstorm/react-diagrams';
import { commandIDs } from '../components/XircuitsBodyWidget';

export interface CanvasContextMenuProps {
	app: JupyterFrontEnd;
	engine: DiagramEngine;
	nodePosition?: {x: number, y: number};
}

export const ContextMenu = styled.div`
	border-color: #000;
	border-radius: 25px;
	border-top: 10px;
	z-index: 10;
`;

export class CanvasContextMenu extends React.Component<CanvasContextMenuProps> {
	hideCanvasContextMenu() {
		//@ts-ignore
		this.props.engine.fireEvent({}, 'hidePanel');
	};
	
    render() {
        let models = this.props.engine.getModel().getSelectedEntities();
        let visibility = getMenuOptionsVisibility(models);

        return (
            <ContextMenu onClick={this.hideCanvasContextMenu.bind(this)}>
                {visibility.showCutCopyPaste && (
                    <>
                        <div className="option" onClick={() => this.props.app.commands.execute(commandIDs.cutNode)}>Cut</div>
                        <div className="option" onClick={() => this.props.app.commands.execute(commandIDs.copyNode)}>Copy</div>
                        <div className="option" onClick={() => this.props.app.commands.execute(commandIDs.pasteNode)}>Paste</div>
                    </>
                )}
                {visibility.showReloadNode && (
                    <div className="option" onClick={() => this.props.app.commands.execute(commandIDs.reloadNode)}>Reload Node</div>
                )}
                {visibility.showEdit && (
                    <div className="option" onClick={() => this.props.app.commands.execute(commandIDs.editNode)}>Edit</div>
                )}
                {visibility.showOpenScript && (
                    <div className="option" onClick={() => this.props.app.commands.execute(commandIDs.openScript)}>Open Script</div>
                )}
                {visibility.showDelete && (
                    <div className="option" onClick={() => this.props.app.commands.execute(commandIDs.deleteEntity)}>Delete</div>
                )}
                {visibility.showUndoRedo && (
                    <>
                        <div className="option" onClick={() => this.props.app.commands.execute(commandIDs.undo)}>Undo</div>
                        <div className="option" onClick={() => this.props.app.commands.execute(commandIDs.redo)}>Redo</div>
                    </>
                )}
                {visibility.showAddComment && (
                    <div className="option" onClick={() => this.props.app.commands.execute(commandIDs.addCommentNode, {nodePosition: this.props.nodePosition})}>Add Comment</div>
                )}
            </ContextMenu>
        );
    }
}

export function getMenuOptionsVisibility(models) {

	function isParameterNode(node) {
		return node.getOptions()["name"].startsWith("Literal");
	}
	
	let isNodeSelected = models.some(model => model instanceof NodeModel);
	let isLinkSelected = models.some(model => model instanceof LinkModel);
	let parameterNodes = models.filter(model => isParameterNode(model));
	let isSingleParameterNodeSelected = parameterNodes.length === 1;
	let multipleNodesSelected = models.filter(model => model instanceof NodeModel).length > 1;
	let multipleLinksSelected = models.filter(model => model instanceof LinkModel).length > 1;

	return {
		showCutCopyPaste: !models.length || isNodeSelected || isLinkSelected,
		showReloadNode: isNodeSelected && !multipleLinksSelected,
		showEdit: isSingleParameterNodeSelected,
		showOpenScript: isNodeSelected && !multipleNodesSelected,
		showDelete: isNodeSelected || isLinkSelected || parameterNodes.length > 0,
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
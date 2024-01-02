import * as React from 'react';

import styled from '@emotion/styled';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { DiagramEngine, NodeModel, LinkModel } from '@projectstorm/react-diagrams';
import { commandIDs } from '../components/xircuitBodyWidget';

export interface NodeActionsPanelProps {
	app: JupyterFrontEnd;
	engine: DiagramEngine;
	nodePosition?: {x: number, y: number};
}

export const ActionPanel = styled.div`
	border-color: #000;
	border-radius: 25px;
	border-top: 10px;
	z-index: 10;
`;

export class NodeActionsPanel extends React.Component<NodeActionsPanelProps> {
	hideNodeActionPanel() {
		//@ts-ignore
		this.props.engine.fireEvent({}, 'hidePanel');
	};
	
    isParameterNode(node) {
        return node.getOptions()["name"].startsWith("Literal");
    }

    getMenuOptionsVisibility(models) {
        let isNodeSelected = models.some(model => model instanceof NodeModel);
        let isLinkSelected = models.some(model => model instanceof LinkModel);
        let parameterNodes = models.filter(model => this.isParameterNode(model));
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

    render() {
        let models = this.props.engine.getModel().getSelectedEntities();
        let visibility = this.getMenuOptionsVisibility(models);

        return (
            <ActionPanel onClick={this.hideNodeActionPanel.bind(this)}>
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
            </ActionPanel>
        );
    }
}
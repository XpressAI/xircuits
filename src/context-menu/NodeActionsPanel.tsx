import * as React from 'react';

import styled from '@emotion/styled';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { commandIDs } from '../components/xircuitBodyWidget';

export interface NodeActionsPanelProps {
	app: JupyterFrontEnd;
	eng: DiagramEngine;
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
		this.props.eng.fireEvent({}, 'hidePanel');
	};
	render() {
		return (
			<ActionPanel onClick={this.hideNodeActionPanel.bind(this)}>
				<div className="option"
					onClick={() => {
						this.props.app.commands.execute(commandIDs.cutNode)
					}}>
					Cut
				</div>
				<div className="option"
					onClick={() => {
						this.props.app.commands.execute(commandIDs.copyNode)
					}}>
					Copy
				</div>
				<div className="option"
					onClick={() => {
						this.props.app.commands.execute(commandIDs.pasteNode)
					}}>
					Paste
				</div>
				<div className="option"
					onClick={() => {
						this.props.app.commands.execute(commandIDs.reloadNode)
					}}>
					Reload Node
				</div>
				<div className="option"
					onClick={() => {
						this.props.app.commands.execute(commandIDs.editNode)
					}}>
					Edit
				</div>
				<div className="option"
					onClick={() => {
						this.props.app.commands.execute(commandIDs.openScript)
					}}>
					Open Script
				</div>
				<div className="option"
					onClick={() => {
						this.props.app.commands.execute(commandIDs.deleteNode)
					}}>
					Delete
				</div>
				<div className="option"
					onClick={() => {
						this.props.app.commands.execute(commandIDs.undo)
					}}>
					Undo
				</div>
				<div className="option"
					onClick={() => {
						this.props.app.commands.execute(commandIDs.redo)
					}}>
					Redo
				</div>
				<div className="option"
					onClick={() => {
						this.props.app.commands.execute(commandIDs.addCommentNode,{nodePosition: this.props.nodePosition})
					}}>
					Add Comment
				</div>
			</ActionPanel>
		);
	}
}

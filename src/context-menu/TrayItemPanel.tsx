import * as React from 'react';

import styled from '@emotion/styled';

import { JupyterFrontEnd } from '@jupyterlab/application';
import { DefaultLinkModel, DiagramEngine } from '@projectstorm/react-diagrams';
import { CustomNodeModel } from '../components/CustomNodeModel';
import { GeneralComponentLibrary } from '../tray_library/GeneralComponentLib';
import { commandIDs } from '../components/xircuitBodyWidget';
import { AdvancedComponentLibrary } from '../tray_library/AdvanceComponentLib';

export interface TrayItemWidgetProps {
	currentNode: any;
	app: JupyterFrontEnd;
	eng: DiagramEngine;
	nodePosition?: {x: number, y: number};
	linkData?: DefaultLinkModel;
	isParameter?: boolean;
}

interface TrayStyledProps {
	color: string
}

export const Tray = styled.div<TrayStyledProps>`
	color: white;
	font-family: Helvetica, Arial;
	padding: 2px;
	width: auto;
	margin: 2px;
	border: solid 1px ${(p) => p.color};
	border-radius: 2px;
	margin-bottom: 2px;
	cursor: pointer;
`;

export class TrayItemPanel extends React.Component<TrayItemWidgetProps> {
	selectedNode() {
		let current_node = this.props.currentNode;
		let node: CustomNodeModel;
		if (current_node != undefined) {
			if (current_node.header == "GENERAL") {
				node = GeneralComponentLibrary({ model: current_node });
			} else {
				node = AdvancedComponentLibrary({ model: current_node });
			}
		}
		return node;
	}

	addNode(node) {
		const nodePosition = this.props.nodePosition;
		this.props.app.commands.execute(commandIDs.addNode, { node, nodePosition });
	}

	connectLink(node) {
		if (this.props.linkData == null) {
			return
		}
		const targetNode = node;
		const sourceLink = this.props.linkData as any;
		const isParameterLink = this.props.isParameter;
		this.props.app.commands.execute(commandIDs.connectNode, { targetNode, sourceLink, isParameterLink  });
	}

	hidePanelEvent() {
		//@ts-ignore
		this.props.eng.fireEvent({}, 'hidePanel');
	};

	render() {
		return (
			<Tray
				color={this.props.currentNode["color"] || "white"}
				onClick={(event) => {
					if (event.ctrlKey || event.metaKey) {
						const { commands } = this.props.app;
						commands.execute('docmanager:open', {
							path: this.props.currentNode["file_path"]
						});
						return;
					}
					let node = this.selectedNode();
					this.addNode(node);
					this.connectLink(node);
					this.hidePanelEvent();
					this.forceUpdate();
				}}
				className="tray-item">
				{this.props.currentNode["task"]}
			</Tray>
		);
	}
}

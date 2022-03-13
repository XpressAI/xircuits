import * as React from 'react';

import styled from '@emotion/styled';

import { JupyterFrontEnd } from '@jupyterlab/application';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { CustomNodeModel } from '../components/CustomNodeModel';

export interface TrayItemWidgetProps {
	model: any;
	color: any;
	name: string;
	path: string;
	app: JupyterFrontEnd;
	eng: DiagramEngine;
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
	render() {
		return (
			<Tray
				color={this.props.color || "white"}
				draggable={true}
				onDragStart={(event) => {
					event.dataTransfer.setData('storm-diagram-node', JSON.stringify(this.props.model));
					this.forceUpdate();
				}}
				// onClick={(event) => {
				// 	if (event.ctrlKey || event.metaKey) {
				// 		const { commands } = this.props.app;
				// 		commands.execute('docmanager:open', {
				// 			path: this.props.path
				// 		});
				// 	}
				// 	this.forceUpdate();
				// }}
				onClick={(event) => {
					let current_node: any;
					let node = new CustomNodeModel({ name: this.props.name, color: this.props.color, extras: this.props.model.type});
					let type_name_remappings = {
						"bool": "boolean",
						"str": "string"
					}

					current_node["variables"].forEach(variable => {
						let name = variable["name"];
						let type = type_name_remappings[variable["type"]] || variable["type"];

						switch (variable["kind"]) {
							case "InCompArg":
								node.addInPortEnhance(`★${name}`, `parameter-${type}-${name}`);
								break;
							case "InArg":
								node.addInPortEnhance(name, `parameter-${type}-${name}`);
								break;
							case "OutArg":
								node.addOutPortEnhance(name, `parameter-out-${type}-${name}`);
								break;
							default:
								console.warn("Unknown variable kind for variable", variable)
								break;
						}
					})
					let position = this.props.eng.getRelativeMousePoint(event)
                	node.setPosition(position);
					this.props.eng.getModel().addNode(node)
				}}
				onDoubleClick={(event) => {
					if (this.props.path != "") {
						const { commands } = this.props.app;
						commands.execute('docmanager:open', {
							path: this.props.path
						});
					}
					this.forceUpdate();
				}}
				className="tray-item">
				{this.props.name}
			</Tray>
		);
	}
}
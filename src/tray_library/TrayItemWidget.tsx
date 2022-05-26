import * as React from 'react';

import styled from '@emotion/styled';

import { JupyterFrontEnd } from '@jupyterlab/application';
import { commandIDs } from '../components/xircuitBodyWidget';

export interface TrayItemWidgetProps {
	model: any;
	color: any;
	name: string;
	path: string;
	app: JupyterFrontEnd;
	lineNo: number;
}

interface TrayStyledProps {
	color: string
}

export const Tray = styled.div<TrayStyledProps>`
	color: black;
	font-family: Helvetica, Arial;
	padding: 7px;
	width: auto;
	margin: 7px;
	border: solid 1px ${(p) => p.color};
	border-radius: 5px;
	margin-bottom: 2px;
	cursor: pointer;
`;

export class TrayItemWidget extends React.Component<TrayItemWidgetProps> {
	render() {
		return (
			<Tray
				color={this.props.color || "white"}
				draggable={true}
				onDragStart={(event) => {
					event.dataTransfer.setData('storm-diagram-node', JSON.stringify(this.props.model));
					this.forceUpdate();
				}}
				onClick={(event) => {
					if (event.ctrlKey || event.metaKey) {
						const { commands } = this.props.app;
						commands.execute(commandIDs.openScript, {
							nodePath: this.props.path,
							nodeName: this.props.name,
							nodeLineNo: this.props.lineNo
						});
						
					}
					this.forceUpdate();
				}}
				onDoubleClick={() => {
					if (this.props.path != "") {
						const { commands } = this.props.app;
						commands.execute(commandIDs.openScript, {
							nodePath: this.props.path,
							nodeName: this.props.name,
							nodeLineNo: this.props.lineNo
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
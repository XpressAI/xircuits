import * as React from 'react';
import styled from '@emotion/styled';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { Tooltip } from '@material-ui/core';

export interface TrayItemWidgetProps {
	model: any;
	color: any;
	name: string;
	path: string;
	app: JupyterFrontEnd;
}

interface TrayStyledProps {
	color: string
}

export const Tray = styled.div<TrayStyledProps>`
	color: black;
	font-family: Helvetica, Arial;
	padding: 5px;
	width: auto;
	margin: 0px 10px;
	border: solid 1px ${(p) => p.color};
	border-radius: 5px;
	margin-bottom: 2px;
	cursor: pointer;
`;

export class TrayItemWidget extends React.Component<TrayItemWidgetProps> {
	render() {
		return (
			<Tooltip title={this.props.name}>
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
							const openComponentFile = commands.execute('docmanager:open', {
								path: this.props.path,
								factory: 'Editor',
							});
						}
						this.forceUpdate();
					}}
					onDoubleClick={(event) => {
						if (this.props.path != "") {
							const { commands } = this.props.app;
							const openComponentFile = commands.execute('docmanager:open', {
								path: this.props.path,
								factory: 'Editor',
							});
						}
						this.forceUpdate();
					}}
					className="tray-item">
					{this.props.name}
				</Tray>
			</Tooltip>
		);
	}
}
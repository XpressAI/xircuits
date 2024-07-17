import * as React from 'react';
import styled from '@emotion/styled';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { commandIDs } from "../commands/CommandIDs";

import { 
    componentLibIcon, 
    branchComponentIcon, 
    workflowComponentIcon, 
    functionComponentIcon, 
    startFinishComponentIcon, 
    variableComponentIcon, 
    setVariableComponentIcon, 
    getVariableComponentIcon,
		infoIcon
} from "../ui-components/icons";

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
	font-family: Helvetica, Arial, sans-serif;
	padding: 7px;
	width: auto;
	margin: 7px;
	border: solid 1px ${(p) => p.color};
	border-radius: 5px;
	margin-bottom: 2px;
	cursor: pointer;
	display: flex;
	gap: 0.5em;
	overflow: hidden;
	align-items: center;
	
	& svg {
		height: 16px;
		width: 16px;
	}
	& > span {
		flex-grow: 1;
	}
`;

export class TrayItemWidget extends React.Component<TrayItemWidgetProps> {
	render() {
		const getNodeIcon = (type) => {
			switch (type) {
				case 'Start':
				case 'startFinish':
					return <startFinishComponentIcon.react />;
				case 'workflow':
				case 'xircuits_workflow':
					return <workflowComponentIcon.react />;
				case 'branch':
					return <branchComponentIcon.react />;
				case 'function':
					return <functionComponentIcon.react />;
				case 'context_set':
					return <setVariableComponentIcon.react />;
				case 'context_get':
					return <getVariableComponentIcon.react />;
				case 'variable':
					return <variableComponentIcon.react />;
				// component libraries were typed as 'debug' before v1.12.
				case 'debug':
				case 'library_component':
					return <componentLibIcon.react />;
				default:
					return null;
			}
		};

		let toolTip = {}
		if(!(this.props.model.name.startsWith("Literal ") || this.props.model.name.startsWith("Get Argument "))) {
			toolTip = {
				"data-for": "sidebar-tooltip",
				"data-tip": JSON.stringify({ model: this.props.model })
			}
		}

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
				className="tray-item"
				{...toolTip}
			>
				{getNodeIcon(this.props.model.type)}
				<span>{this.props.name}</span>
			</Tray>
		);
	}
}
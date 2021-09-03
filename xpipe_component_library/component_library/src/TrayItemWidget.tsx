import * as React from 'react';
import styled from '@emotion/styled';

export interface TrayItemWidgetProps {
	model: any;
	color?: string;
	name: string;
}
interface TrayStyledProps {
	color: string
}

export const Tray = styled.div<TrayStyledProps>`
	color: white;
	font-family: Helvetica, Arial;
	padding: 5px;
	width:auto;
	margin: 0px 10px;
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
				className="tray-item">
				{this.props.name}
			</Tray>
		);
	}
}

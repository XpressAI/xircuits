import * as React from 'react';
import styled from '@emotion/styled';

export interface XircuitsCanvasWidgetProps {
	color?: string;
	background?: string;
	children?: any;
}

//namespace S {
	export const Container = styled.div<{ color: string; background: string }>`
		height: 100%;
		background-color: ${(p) => p.background};
		display: flex;
		width : 15360px; // Prevent Dev tool effects on smaller monitors  

		> * {
			height: 100%;
			min-height: 100%;
			width: 100%;
		}
		
    background-image: radial-gradient(oklch(40% 0% 0) 1px, transparent 0);
    background-size: 15px 15px;
    background-position: -19px -19px;
	`;
//}

export class XircuitsCanvasWidget extends React.Component<XircuitsCanvasWidgetProps> {
	render() {
		return (
			<Container
				background={this.props.background || 'oklch(0.3 0.01 300 / 1)'}
				color={this.props.color || 'rgba(255,255,255, 0.05)'}>
				{this.props.children}
			</Container>
		);
	}
}

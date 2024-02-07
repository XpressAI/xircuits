import * as React from 'react';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core';
import { DefaultNodeModel, DefaultPortModel } from "@projectstorm/react-diagrams";
import styled from '@emotion/styled';

export interface CustomPortLabelProps {
	port: DefaultPortModel;
	engine: DiagramEngine;
	node: DefaultNodeModel;
}

namespace S {
	export const PortLabel = styled.div`
		display: flex;
		margin-top: 1px;
		align-items: center;
	`;

	export const Label = styled.div`
		padding: 0 5px;
		flex-grow: 1;
		white-space: pre-wrap; // Preserve line breaks and wrap text to the next line
		overflow:hidden;
		max-width: 40ch;
	`;

	export const SymbolContainer = styled.div<{ symbolType: string; selected: boolean; isOutPort: boolean }>`
		width: 15px;
		height: 15px;
		background: ${(p) => (p.selected ? 'oklch(1 0 0 / 0.5)' : 'rgba(0, 0, 0, 0.2)')};
		border-radius: ${(p) => (p.isOutPort ? '20px 0px 0px 20px' : '0px 20px 20px 0px')} ;
		display: ${(p) => p.symbolType == null ? 'none' : 'visible'};
		text-align: center;
		box-shadow: inset 0 2px 4px ${(p) => (p.selected ? 'rgb(0 0 0 / 0.05)' : 'rgb(0 0 0 / 0.01)')} ;
		border: 1px solid oklch(0 0 0 / 0.2);
		padding: 0 2px;
		margin: 2px 0;
		&:hover, &.hover {
			background: rgb(192, 255, 0);
			box-shadow:  ${(p) => p.selected ? '' : 'inset'} 0 4px 8px rgb(0 0 0 / 0.5);
		}
	`;

	export const Symbol = styled.div<{ isOutPort: boolean }>`
		color: black;
		font-weight: bold;
		font-size: 9px;
		font-family: Helvetica, Arial, sans-serif;
		padding:${(p) => (p.isOutPort ? '2px 0px 0px 2px' : '2px 2px 0px 0px')};
	`;

	export const Port = styled.div<{ isOutPort: boolean, hasLinks: boolean }>`
		width: 15px;
		height: 15px;
		background: ${(p) => p.hasLinks ? 'oklch(1 0 0 / 0.5)' : 'oklch(0 0 0 / 0.2)'};
		color: ${(p) => p.hasLinks ? 'oklch(0 0 0 / 0.8)' : 'oklch(1 0 0 / 0.8)'};
		border: 1px solid oklch(0 0 0 / 0.2);
		border-radius: ${(p) => (p.isOutPort ? '20px 0px 0px 20px' : '0px 20px 20px 0px')} ;
		box-shadow: ${(p) => p.hasLinks ? '' : 'inset'}  0 2px 4px ${(p) => (p.hasLinks ? 'rgb(0 0 0 / 0.1)' : 'rgb(0 0 0 / 0.05)')} ;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 2px;
		margin: 2px 0;
		&:hover, &.hover {
			background: rgb(192, 255, 0);
			box-shadow:  ${(p) => p.hasLinks ? '' : 'inset'} 0 4px 8px rgb(0 0 0 / 0.5);
		}
		& svg {
			stroke-width: 3;
			stroke: currentColor;
			fill: none;
			stroke-linecap: round;
			stroke-linejoin: round;
		}
	`;
}

export class CustomPortLabel extends React.Component<CustomPortLabelProps> {
	render() {
		let portName = this.props.port.getOptions().name;
		let portType;
		let symbolLabel;
		let isOutPort;
		if(portName.includes('parameter-out')){
			portType = portName.split("-")[2];
			isOutPort = true;
		} else {
			portType = portName.split("-")[1];
		}
		if (portType.includes(',')) {
			portType = 'union';
		}

		const symbolMap = {
			"string": '" "',
			"int": ' 1',
			"float": '1.0',
			"boolean": '⊤⊥',
			"time.time": '𝘵',
			"list": '[ ]',
			"tuple": '( )',
			"dict": '{ }',
			"dynalist": '«[]»',
			"dynatuple": '«()»',
			"union": ' U',
			"secret": '🗝️',
			"chat": '🗨',
			"any": '[_]',
			"0": null,
			"flow": null
		};
		
		if (portType in symbolMap) {
			symbolLabel = symbolMap[portType];
		} else {
			symbolLabel = '◎';
		}

		const isIn = !!this.props.port.getOptions().in
		const hasLinks = Object.keys(this.props.port.getLinks()).length > 0;
		const isTrianglePort = this.props.port.getOptions().label.indexOf('▶') >= 0 &&
			/* Workaround for Arguments being set up as triangle ports in other places */
			!this.props.node['name'].match('Argument \(.+?\):');

		const port = (
			<S.Port isOutPort={!isIn} hasLinks={hasLinks}>
				{!isTrianglePort ? null : (isIn ?
					<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" >
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<path d="M3 12h12" />
						<path d="M11 8l4 4l-4 4" />
						<path d="M12 21a9 9 0 0 0 0 -18" />
					</svg> : <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
						<path stroke="none" d="M0 0h24v24H0z" fill="none" />
						<path d="M9 12h12" />
						<path d="M17 16l4 -4l-4 -4" />
						<path d="M12 3a9 9 0 1 0 0 18" />
					</svg>)}
			</S.Port>
		);

		const propLinks = this.props.port.links;
		let portHasLink: boolean = false;
		if (Object.keys(propLinks).length != 0) {
			portHasLink = true;
		}


		const symbol = (
			<S.SymbolContainer symbolType={symbolLabel} selected={portHasLink} isOutPort={isOutPort}>
				<S.Symbol isOutPort={isOutPort}>
					{symbolLabel}
				</S.Symbol>
			</S.SymbolContainer>);
		
		const nodeType = this.props.node.getOptions().name

		const label = (
			<S.Label style={{ textAlign: (!this.props.port.getOptions().in && this.props.port.getOptions().label === '▶') ? 'right' : 'left' }}>
				{nodeType === "Literal Secret" ? "*****" : this.props.port.getOptions().label.replace('▶', '').trim()}
			</S.Label>);

		return (
			<S.PortLabel>
				{this.props.port.getOptions().in ? null : label}
				<PortWidget engine={this.props.engine} port={this.props.port}>
					{symbolLabel == null ? port : symbol}
				</PortWidget>
				{this.props.port.getOptions().in ? label : null}
			</S.PortLabel>
		);
	}
}

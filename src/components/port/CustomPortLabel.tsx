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
        width: 17px;
		height: 15px;
		border: 5px hidden;
		background: ${(p) => (p.selected ? 'white' : 'rgba(0, 0, 0, 0.2)')};
		border-radius: ${(p) => (p.isOutPort ? '20px 0px 0px 20px' : '0px 20px 20px 0px')} ;
		display: ${(p) => p.symbolType == null ? 'none' : 'visible'};
		text-align: center;
	`;

	export const Symbol = styled.div<{ isOutPort: boolean }>`
		color: black;
		font-weight: bold;
		font-size: 9px;
		font-family: Helvetica, Arial, sans-serif;
		padding:${(p) => (p.isOutPort ? '2px 0px 0px 2px' : '2px 2px 0px 0px')};
	`;

	export const Port = styled.div`
		width: 15px;
		height: 15px;
		background: rgba(255, 255, 255, 0.2);
		&:hover {
			background: rgb(192, 255, 0);
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
		// if multiple types provided, show the symbol for the first provided type
		if (portType.includes(',')) {
			portType = 'union';
		}

		switch (portType) {
			case "string":
				symbolLabel = '" "';
				break;
			case "int":
				symbolLabel = ' 1';
				break;
			case "float":
				symbolLabel = '1.0';
				break;
			case "boolean":
				symbolLabel = '⊤⊥';
				break;
			case "time.time":
				symbolLabel = '𝘵';
				break;
			case "list":
				symbolLabel = '[ ]';
				break;
			case "tuple":
				symbolLabel = '( )';
				break;
			case "dict":
				symbolLabel = '{ }';
				break;
			case "union":
				symbolLabel = ' U';
				break;
			case "secret":
				symbolLabel = '🗝️';
				break;
				case "any":
				symbolLabel = '[_]';
				break;
			case "0":
			case "flow":
				symbolLabel = null;
				break;
			default:
				symbolLabel = '◎';
				break;
		}

		const port = (
			<PortWidget engine={this.props.engine} port={this.props.port}>
				<S.Port />
			</PortWidget>
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
				{nodeType === "Literal Secret" ? "*****" : this.props.port.getOptions().label}
			</S.Label>);

		return (
			<S.PortLabel>
				{this.props.port.getOptions().in ? port : label}
				{symbol}
				{this.props.port.getOptions().in ? label : port}
			</S.PortLabel>
		);
	}
}

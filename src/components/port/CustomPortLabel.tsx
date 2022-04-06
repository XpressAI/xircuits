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
	`;

	export const SymbolContainer = styled.div<{ symbolType: string; selected: boolean; }>`
        width: 17px;
		height: 15px;
		border: 5px hidden;
		background: ${(p) => (p.selected ? 'white' : 'rgba(0, 0, 0, 0.2)')};
		border-radius: 0px 20px 20px 0px;
		display: ${(p) => p.symbolType == null ? 'none' : 'visible'};
		text-align: center;
	`;

	export const Symbol = styled.div`
		color: black;
		font-weight: bold;
		font-size: 9px;
		font-family: Helvetica, Arial, sans-serif;
		padding-top: 3px;
	`;

	export const Port = styled.div`
		width: 15px;
		height: 15px;
		background: rgba(255, 255, 255, 0.1);
		&:hover {
			background: rgb(192, 255, 0);
		}
	`;
}

export class CustomPortLabel extends React.Component<CustomPortLabelProps> {
	render() {
		let portType = this.props.port.getOptions().name.split("-")[1];
		let symbolLabel;

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
			case "list":
				symbolLabel = '[ ]';
				break;
			case "tuple":
				symbolLabel = '( )';
				break;
			case "dict":
				symbolLabel = '{ }';
				break;
			case "any":
				symbolLabel = '[_]';
				break;
			default:
				symbolLabel = null;
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
			<S.SymbolContainer symbolType={symbolLabel} selected={portHasLink}>
				<S.Symbol>
					{symbolLabel}
				</S.Symbol>
			</S.SymbolContainer>);

		const label = (
			<S.Label>
				{this.props.port.getOptions().label}
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
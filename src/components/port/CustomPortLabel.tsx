import * as React from 'react';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core';
import { DefaultNodeModel, DefaultPortModel } from "@projectstorm/react-diagrams";
import styled from '@emotion/styled';
import { JupyterFrontEnd } from "@jupyterlab/application";
import { commandIDs } from "../../commands/CommandIDs";
import Color from "colorjs.io";

export interface CustomPortLabelProps {
	port: DefaultPortModel;
	engine: DiagramEngine;
	node: DefaultNodeModel;
	app: JupyterFrontEnd;
}

export namespace S {
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
		text-overflow: ellipsis;
		max-width: 40ch;
	`;

	export const SymbolContainer = styled.div<{ symbolType: string; selected: boolean; isOutPort: boolean; attachedColor?: string }>`
		width: 15px;
		height: 15px;
		background: ${(p) => (p.selected ? 'oklch(1 0 0 / 0.5)' : 'oklch(50% 0 0 / 0.2)')};
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
		
		&.attached {
			padding: 0 2px 0 3px;
			border-radius: 20px;
			border: 0;
			background: ${(p) => p.attachedColor};
			
			&:hover, &.hover {
				background: rgb(192, 255, 0);
				box-shadow:  ${(p) => p.selected ? '' : 'inset'} 0 4px 8px rgb(0 0 0 / 0.5);
			}
		}
	`;

	export const Symbol = styled.div<{ selected: boolean; isOutPort: boolean }>`
		color: ${(p) => (p.selected ? 'black' : 'grey')};
		font-weight: bold;
		font-size: 9px;
		font-family: Helvetica, Arial, sans-serif;
		padding:${(p) => (p.isOutPort ? '2px 0px 0px 2px' : '2px 2px 0px 0px')};
	`;

	export const Port = styled.div<{ isOutPort: boolean, hasLinks: boolean; attachedColor?: string}>`
		width: 15px;
		height: 15px;
		background: ${(p) => p.hasLinks ? 'oklch(1 0 0 / 0.5)' : 'oklch(50% 0 0 / 0.2)'};
		color: ${(p) => p.hasLinks ? 'oklch(0% 0 0 / 0.8)' : 'oklch(1 0 0 / 0.8)'};
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
		&.attached {
			padding: 0 2px 0 3px;
			border-radius: 20px;
			border: 0;
			background: ${(p) => p.attachedColor};
			&:hover, &.hover {
				background: rgb(192, 255, 0);
				box-shadow:  ${(p) => p.hasLinks ? '' : 'inset'} 0 4px 8px rgb(0 0 0 / 0.5);
			}
		}
	`;
}

const PortLabel = ({nodeType, port}) => {
	const LITERAL_SECRET = "Literal Secret";

	let labelText = port.getOptions().label.replace('▶', '').trim();

	let attached = false;
	if(port.getOptions().in){
		Object.values(port.links).forEach(link => {
			if(link['sourcePort']['parent']['name'].startsWith('Literal ') && link['sourcePort']['parent']['extras']['attached']){
				attached = true;
				const label = link['sourcePort']['parent']['name'] === LITERAL_SECRET ? "*****" : link['sourcePort']['options']['label']
				labelText += ": "+(label.length > 18 ? label.substring(0, 15)+"..." : label)
			}
		})
	}

	return (
			<S.Label style={{ textAlign: (!port.getOptions().in && port.getOptions().label === '▶') ? 'right' : 'left', cursor: attached ? 'pointer' : 'inherit' }}>
				{nodeType === LITERAL_SECRET ? "*****" : labelText}
			</S.Label>
	);
}

export const symbolMap = {
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
		if (portType.includes('Union')) {
			portType = 'union';
		}
		
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

		let dblClickHandler = () => {};
		let attachedColor = null;
		if(this.props.port.getOptions().in){
			Object.values(this.props.port.links).forEach(link => {
				if(link['sourcePort']['parent']['name'].startsWith('Literal ') && link['sourcePort']['parent']['extras']['attached']){
					attachedColor = link['sourcePort']['parent']['options']['color'];

					dblClickHandler = () => {
						this.props.engine.getModel().clearSelection();
						link['sourcePort']['parent'].setSelected(true);
						this.props.app.commands.execute(commandIDs.editNode);
					}
				}
			})
		}

		if(attachedColor != null){
			const color = new Color(attachedColor);
			color.alpha = 0.75;
			color.oklch.c *= 1.2;
			const color1 = color.to('oklch').toString()
			color.oklch.c *= 1.2;
			color.oklch.l /= 2;
			const color2 = color.to('oklch').toString()

			attachedColor = `linear-gradient(${color1}, ${color2})`;
		}

		const port = (
			<S.Port isOutPort={!isIn} hasLinks={hasLinks} className={attachedColor ? 'attached' : null} attachedColor={attachedColor}>
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
			<S.SymbolContainer symbolType={symbolLabel} selected={portHasLink} isOutPort={isOutPort} className={attachedColor ? 'attached' : null}  attachedColor={attachedColor}>
				<S.Symbol isOutPort={isOutPort} selected={portHasLink}>
					{symbolLabel}
				</S.Symbol>
			</S.SymbolContainer>);
		
		const nodeType = this.props.node.getOptions().name

		function addHover(port: DefaultPortModel) {
			return (() => {
				for (let linksKey in port.getLinks()) {
					document.querySelector(`g[data-linkid='${linksKey}']`)?.classList.add("hover");
					const model = port.getLinks()[linksKey]
					if(model.getSourcePort() != null)
						document.querySelector(`div.port[data-nodeid="${model.getSourcePort().getNode().getID()}"][data-name='${model.getSourcePort().getName()}']>div>div`)?.classList.add("hover");
					if(model.getTargetPort() != null)
						document.querySelector(`div.port[data-nodeid="${model.getTargetPort().getNode().getID()}"][data-name='${model.getTargetPort().getName()}']>div>div`)?.classList.add("hover");
					if(attachedColor != null){
						if(model.getSourcePort() != null){
							Object.values(model.getSourcePort().getNode().getPorts()).forEach(p => {
								Object.values(p.getLinks()).forEach(l => {
									if(model.getTargetPort() != null)
										document.querySelector(`div.port[data-nodeid="${l.getTargetPort().getNode().getID()}"][data-name='${l.getTargetPort().getName()}']>div>div`)?.classList.add("hover");
								})
							})
						}
					}
				}
			});
		}

		function removeHover(port: DefaultPortModel) {
			return () => {
				for (let linksKey in port.getLinks()) {
					document.querySelector(`g[data-linkid='${linksKey}']`)?.classList.remove("hover");
					const model = port.getLinks()[linksKey]
					if(model.getSourcePort() != null)
						document.querySelector(`div.port[data-nodeid="${model.getSourcePort().getNode().getID()}"][data-name='${model.getSourcePort().getName()}']>div>div`)?.classList.remove("hover");
					if(model.getTargetPort() != null)
						document.querySelector(`div.port[data-nodeid="${model.getTargetPort().getNode().getID()}"][data-name='${model.getTargetPort().getName()}']>div>div`)?.classList.remove("hover");
					if(attachedColor != null){
						if(model.getSourcePort() != null){
							Object.values(model.getSourcePort().getNode().getPorts()).forEach(p => {
								Object.values(p.getLinks()).forEach(l => {
									if(model.getTargetPort() != null)
										document.querySelector(`div.port[data-nodeid="${l.getTargetPort().getNode().getID()}"][data-name='${l.getTargetPort().getName()}']>div>div`)?.classList.remove("hover");
								})
							})
						}
					}
				}
			};
		}

		const label = <PortLabel port={this.props.port} nodeType={nodeType} />

		return (
			<S.PortLabel onMouseOver={addHover(this.props.port)}
									 onMouseOut={removeHover(this.props.port)}
									 onDoubleClick={dblClickHandler}
			>
				{this.props.port.getOptions().in ? null : label}
				<PortWidget engine={this.props.engine} port={this.props.port}>
					<div>
						{symbolLabel == null ? port : symbol}
					</div>
				</PortWidget>
				{this.props.port.getOptions().in ? label : null}
			</S.PortLabel>
		);
	}
}

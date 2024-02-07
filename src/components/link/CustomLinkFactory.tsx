import { DefaultLinkFactory } from '@projectstorm/react-diagrams';
import * as React from 'react';
import { ParameterLinkModel, TriangleLinkModel } from './CustomLinkModel';
import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/react';

namespace S {
	export const Keyframes = keyframes`
		from {
			stroke-dashoffset: 24;
		}
		to {
			stroke-dashoffset: 0;
		}
	`;

	const selected = css`
		stroke-dasharray: 10, 2;
		animation: ${Keyframes} 1s steps(24) infinite;
	`;

	export const Path = styled.path<{ selected: boolean }>`
		${(p) => p.selected && selected};

		fill: none;
		pointer-events: auto;
		filter: drop-shadow(2px 2px 4px rgb(0 0 0 / 40%)) opacity(60%);
		
		body.low-powered-mode & {
			animation: none !important;
		}
	`;
}

function addHover(model: TriangleLinkModel | ParameterLinkModel){
	return (() => {
					document.querySelector(`div.port[data-nodeid='${model.getSourcePort().getNode().getID()}'][data-name='${model.getSourcePort().getName()}']>div`).classList.add("hover");
					document.querySelector(`div.port[data-nodeid="${model.getTargetPort().getNode().getID()}"][data-name='${model.getTargetPort().getName()}']>div`).classList.add("hover");
				});
}

function removeHover(model: TriangleLinkModel | ParameterLinkModel){
	return () => {
					document.querySelector(`div.port[data-nodeid='${model.getSourcePort().getNode().getID()}'][data-name='${model.getSourcePort().getName()}']>div`).classList.remove("hover");
					document.querySelector(`div.port[data-nodeid="${model.getTargetPort().getNode().getID()}"][data-name='${model.getTargetPort().getName()}']>div`).classList.remove("hover");
				}
}

export class ParameterLinkFactory extends DefaultLinkFactory {
	constructor() {
		super('parameter-link');
	}

	generateModel(): ParameterLinkModel {
		return new ParameterLinkModel();
	}

	generateLinkSegment(model: ParameterLinkModel, selected: boolean, path: string) {
		return (
			<S.Path
				onMouseOver={addHover(model)}
				onMouseOut={removeHover(model)}
				selected={selected}
				stroke={selected ? 'yellow' : model.getOptions().color}
				strokeWidth={model.getOptions().width}
				d={path}
			/>
		);
	}
}

export class TriangleLinkFactory extends DefaultLinkFactory {
	constructor() {
		super('triangle-link');
	}

	generateModel(): TriangleLinkModel {
		return new TriangleLinkModel();
	}

	generateLinkSegment(model: TriangleLinkModel, selected: boolean, path: string) {
		return (
			<S.Path
				onMouseOver={addHover(model)}
				onMouseOut={removeHover(model)}
				selected={!selected}
				stroke={!selected ? model.getOptions().selectedColor : 'yellow'}
				strokeWidth={model.getOptions().width}
				d={path}
			/>
		);
	}
}

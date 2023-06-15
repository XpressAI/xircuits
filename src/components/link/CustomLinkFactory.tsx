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
		
		body.low-powered-mode & {
			animation: none !important;
		}
	`;
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
				selected={!selected}
				stroke={!selected ? model.getOptions().selectedColor : 'yellow'}
				strokeWidth={model.getOptions().width}
				d={path}
			/>
		);
	}
}

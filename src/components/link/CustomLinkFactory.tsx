import { DefaultLinkFactory } from '@projectstorm/react-diagrams';
import * as React from 'react';
import { CustomLinkModel, TriangleLinkModel } from './CustomLinkModel';
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
	`;
}

export class CustomLinkFactory extends DefaultLinkFactory {
	constructor() {
		super('custom-link');
	}

	generateModel(): CustomLinkModel {
		return new CustomLinkModel();
	}

	generateLinkSegment(model: CustomLinkModel, selected: boolean, path: string) {
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


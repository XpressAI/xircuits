import { DefaultLinkFactory, DefaultLinkWidget } from "@projectstorm/react-diagrams";
import {  LinkWidget } from '@projectstorm/react-diagrams-core';
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

	const triangleLink = css`
		stroke-dasharray: 10, 2;
		animation: ${Keyframes} 1s steps(24) infinite;
	`;

	const selected = css`
		stroke: yellow;
	`;

	export const Path = styled.path<{ selected: boolean, isRegularLink: boolean }>`
		${(p) => p.selected && selected }
		${(p) => !p.isRegularLink && triangleLink }

		fill: none;
		pointer-events: auto;
		filter: drop-shadow(2px 2px 4px rgb(0 0 0 / 40%)) opacity(60%);
		
		body.low-powered-mode & {
			animation: none !important;
		}
	`;

	export const G = styled.g`
		g.hover & path {
			stroke: rgb(192, 255, 0);
		}
	`;
}

function addHover(model: TriangleLinkModel | ParameterLinkModel){
	return (() => {
					document.querySelector(`div.port[data-nodeid='${model.getSourcePort().getNode().getID()}'][data-name='${model.getSourcePort().getName()}']>div>div`)?.classList?.add("hover");
					document.querySelector(`div.port[data-nodeid="${model.getTargetPort().getNode().getID()}"][data-name='${model.getTargetPort().getName()}']>div>div`)?.classList?.add("hover");
				});
}

function removeHover(model: TriangleLinkModel | ParameterLinkModel){
	return () => {
					document.querySelector(`div.port[data-nodeid='${model.getSourcePort().getNode().getID()}'][data-name='${model.getSourcePort().getName()}']>div>div`)?.classList?.remove("hover");
					document.querySelector(`div.port[data-nodeid="${model.getTargetPort().getNode().getID()}"][data-name='${model.getTargetPort().getName()}']>div>div`)?.classList?.remove("hover");
				}
}

class SelectOnClickLinkWidget extends DefaultLinkWidget {
	constructor(type) {
		super(type);
	}
	addPointToLink(event: React.MouseEvent, index: number) {
		if (
			event.ctrlKey &&
			!this.props.link.isLocked() &&
			this.props.link.getPoints().length - 1 <= this.props.diagramEngine.getMaxNumberPointsPerLink()
		) {
			event.stopPropagation();

			const position = this.props.diagramEngine.getRelativeMousePoint(event);
			const point = this.props.link.point(position.x, position.y, index);
			event.persist();
			this.forceUpdate(() => {
				this.props.diagramEngine.getActionEventBus().fireAction({
					event,
					model: point
				});
			});
		}
	}

	render() {
		//ensure id is present for all points on the path
		var points = this.props.link.getPoints();
		var paths = [];
		this.refPaths = [];

		if (points.length === 2) {
			paths.push(
				this.generateLink(
					this.props.link.getSVGPath(),
					{
						onMouseDown: (event) => {
							this.props.selected?.(event);
							this.addPointToLink(event, 1);
						}
					},
					'0'
				)
			);

			// draw the link as dangeling
			if (this.props.link.getTargetPort() == null) {
				paths.push(this.generatePoint(points[1]));
			}
		} else {
			//draw the multiple anchors and complex line instead
			for (let j = 0; j < points.length - 1; j++) {
				paths.push(
					this.generateLink(
						LinkWidget.generateLinePath(points[j], points[j + 1]),
						{
							'data-linkid': this.props.link.getID(),
							'data-point': j,
							onMouseDown: (event) => {
								this.props.selected?.(event);
								this.addPointToLink(event, j + 1);
							}
						},
						j
					)
				);
			}

			if (this.renderPoints()) {
				//render the circles
				for (let i = 1; i < points.length - 1; i++) {
					paths.push(this.generatePoint(points[i]));
				}

				if (this.props.link.getTargetPort() == null) {
					paths.push(this.generatePoint(points[points.length - 1]));
				}
			}
		}

		return <S.G data-default-link-test={this.props.link.getOptions().testName}>{paths}</S.G>;
	}
}

class SelectOnClickLinkFactory extends DefaultLinkFactory {
	generateReactWidget(event: any): JSX.Element {
		return <SelectOnClickLinkWidget link={event.model} diagramEngine={this.engine} />;
	}
}

export class ParameterLinkFactory extends SelectOnClickLinkFactory {
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
				stroke={model.getOptions().color}
				strokeWidth={model.getOptions().width}
				d={path}
				isRegularLink={true}
			/>
		);
	}
}

export class TriangleLinkFactory extends SelectOnClickLinkFactory {
	constructor() {
		super('triangle-link');
	}

	generateModel(): TriangleLinkModel {
		return new TriangleLinkModel();
	}

	generateLinkSegment(model: TriangleLinkModel, selected: boolean, path: string) {
		const isRegularLink = model.getOptions()['__sub-type__'] === 'argument';
		return (
			<S.Path
				onMouseOver={addHover(model)}
				onMouseOut={removeHover(model)}
				isRegularLink={isRegularLink}
				selected={selected}
				stroke={isRegularLink ? model.getOptions().color :  model.getOptions().selectedColor}
				strokeWidth={model.getOptions().width}
				d={path}
			/>
		);
	}
}

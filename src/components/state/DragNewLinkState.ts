import {
	AbstractDisplacementState,
	AbstractDisplacementStateEvent,
	Action,
	ActionEvent,
	InputType
} from '@projectstorm/react-canvas-core';
import { DiagramEngine, LinkModel } from '@projectstorm/react-diagrams';
import { MouseEvent } from 'react';
import { CustomPortModel } from '../port/CustomPortModel';
import { CustomDynaPortModel } from '../port/CustomDynaPortModel';

export interface DragNewLinkStateOptions {
	allowLooseLinks?: boolean;
	allowLinksFromLockedPorts?: boolean;
}

export class DragNewLinkState extends AbstractDisplacementState<DiagramEngine> {
	port: CustomPortModel;
	link: LinkModel;
	config: DragNewLinkStateOptions;

	constructor(options: DragNewLinkStateOptions = {}) {
		super({ name: 'drag-new-link' });

		this.config = {
			allowLooseLinks: true,
			allowLinksFromLockedPorts: false,
			...options
		};

		this.registerAction(
			new Action({
				type: InputType.MOUSE_DOWN,
				fire: (event: ActionEvent<MouseEvent, CustomPortModel>) => {
					this.port = this.engine.getMouseElement(event.event) as CustomPortModel;
					if (!this.config.allowLinksFromLockedPorts && this.port.isLocked()) {
						this.eject();
						return;
					}
					this.link = this.port.createLinkModel();

					// if no link is given, just eject the state
					if (!this.link) {
						this.eject();
						return;
					}
					this.link.setSelected(true);
					this.link.setSourcePort(this.port);
					this.engine.getModel().addLink(this.link);
					this.port.reportPosition();
				}
			})
		);

		this.registerAction(
			new Action({
				type: InputType.MOUSE_UP,
				fire: (event: ActionEvent<MouseEvent>) => {
					const model = this.engine.getMouseElement(event.event);

					if (!(model instanceof CustomPortModel)) {
						this.handleLooseLink(event);
						return;
					}

					if (!this.port.canLinkToPort(model)) {
						this.link.remove();
						this.engine.repaintCanvas();
						return;
					}

					this.handleConnectedPort(model);
					this.engine.repaintCanvas();
				}
			})
		);
	}

	private handleConnectedPort(model: CustomPortModel) {
		if (model instanceof CustomDynaPortModel) {
			this.handleDynamicPort(model);
		} else {
			this.link.setTargetPort(model);
		}
		model.reportPosition();
	}

	private handleDynamicPort(model: CustomDynaPortModel) {
		// if the dynamic port has  an existing link, shift
		if (Object.keys(model.links).length > 0) {
			const newPort = model.shiftPorts();
			this.link.setTargetPort(newPort);
		} else {
			// otherwise spawn a new one at the end
			const newPort = model.spawnDynamicPort({ offset: 1 });
			newPort.previous = model.getID();
			model.next = newPort.getID();
			this.link.setTargetPort(model);
		}
	}

	private handleLooseLink(event: ActionEvent<MouseEvent>) {
		if (!this.config.allowLooseLinks) {
			// Weird behaviour where sourcePort's data is missing
			// For now just pass the port's data itself
			this.fireEvent(event.event, this.port);
			this.link.remove();
			this.engine.repaintCanvas();
		}
	}

	fireEvent = (linkEvent, sourcePort) => {
		//@ts-ignore
		this.engine.fireEvent({ link: this.link, linkEvent, sourcePort }, 'droppedLink');
	};

	/**
	 * Calculates the link's far-end point position on mouse move.
	 * In order to be as precise as possible the mouse initialXRelative & initialYRelative are taken into account as well
	 * as the possible engine offset
	 */
	fireMouseMoved(event: AbstractDisplacementStateEvent): any {
		const portPos = this.port.getPosition();
		const zoomLevelPercentage = this.engine.getModel().getZoomLevel() / 100;
		const engineOffsetX = this.engine.getModel().getOffsetX() / zoomLevelPercentage;
		const engineOffsetY = this.engine.getModel().getOffsetY() / zoomLevelPercentage;
		const initialXRelative = this.initialXRelative / zoomLevelPercentage;
		const initialYRelative = this.initialYRelative / zoomLevelPercentage;
		const linkNextX = portPos.x - engineOffsetX + (initialXRelative - portPos.x) + event.virtualDisplacementX;
		const linkNextY = portPos.y - engineOffsetY + (initialYRelative - portPos.y) + event.virtualDisplacementY;

		this.link.getLastPoint().setPosition(linkNextX, linkNextY);
		this.engine.repaintCanvas();
	}
}
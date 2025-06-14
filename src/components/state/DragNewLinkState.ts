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
	protected potentialPort: CustomPortModel | null = null;

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
					let model = this.engine.getMouseElement(event.event);
					// Allow connecting to node area
					if (!(model instanceof CustomPortModel)) {
						const point = this.engine.getRelativeMousePoint(event.event);
						model = this.findTargetIn0PortAtPosition(point);
					}

					if (!(model instanceof CustomPortModel)) {
						this.handleLooseLink(event);
						return;
					}

					if (!this.port.canLinkToPort(model)) {
						this.link.remove();
						this.engine.repaintCanvas();
						return;
					}

					// Re-enable pointer-events after we override them during hover
					document
					.querySelectorAll('div.port[data-nodeid][data-name]')
					.forEach(el => (el as HTMLElement).style.pointerEvents = '');

					this.handleConnectedPort(model);
					this.engine.repaintCanvas();
				}
			})
		);
	}

	// Get `in-0` port if cursor is inside node bounds
	private findTargetIn0PortAtPosition(point: { x: number, y: number }): CustomPortModel | null {
		const nodes = this.engine.getModel().getNodes();

		for (const node of nodes) {
			const bounds = node.getBoundingBox?.();
			if (!bounds?.getTopLeft || !bounds?.getBottomRight) continue;

			const topLeft = bounds.getTopLeft();
			const bottomRight = bounds.getBottomRight();
			const inPort = node.getPort?.('in-0');

			const isInside =
				point.x >= topLeft.x &&
				point.x <= bottomRight.x &&
				point.y >= topLeft.y &&
				point.y <= bottomRight.y;

			const isFlow =
				this.link.getOptions().type?.includes('flow') ||
				this.port.getOptions().label === '▶';

			if (isInside && inPort && isFlow && inPort instanceof CustomPortModel) {
				return inPort;
				}

		}
		return null;
	}

	private applyPortHoverEffect(port: CustomPortModel) {
		const nodeId = port.getNode().getID();
		const portName = port.getName();
		const selector = `div.port[data-nodeid="${nodeId}"][data-name='${portName}']>div>div`;
		document.querySelector(selector)?.classList.add("hover");
	}

	private removePortHoverEffect(port: CustomPortModel) {
		const nodeId = port.getNode().getID();
		const portName = port.getName();
		const selector = `div.port[data-nodeid="${nodeId}"][data-name='${portName}']>div>div`;
		document.querySelector(selector)?.classList.remove("hover");
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
	 * Updates the dragged link endpoint and highlights the nearest valid in-0 port,
	 * unless hovering over a different port within the same node.
	 * Accounts for engine zoom and offset to position the link accurately.
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

	// Get element under cursor (for avoiding highlight on sibling ports)
	const rawEv = event.event;
	const hovered =
		'clientX' in rawEv && 'clientY' in rawEv
		? (this.engine.getMouseElement(rawEv as MouseEvent) as unknown)
		: null;

	// Find target in-0 port to highlight
	let highlight: CustomPortModel | null = null;
	const pt = { x: linkNextX, y: linkNextY };
	const isFlowDrag =
		this.link.getOptions().type?.includes('flow') ||
		this.port.getOptions().label === '▶';

	for (const node of this.engine.getModel().getNodes()) {
		const bb = node.getBoundingBox?.();
		if (!bb) continue;

		const tl = bb.getTopLeft();
		const br = bb.getBottomRight();
		const inside =
		pt.x >= tl.x && pt.x <= br.x && pt.y >= tl.y && pt.y <= br.y;
		if (!inside) continue;

		const in0 = node.getPort?.('in-0') as CustomPortModel | undefined;
		if (!in0 || !isFlowDrag) break;

		// Skip highlight if hovering over another port in the same node
		if (hovered instanceof CustomPortModel && hovered !== in0) {
		if (hovered.getNode() === node) {
			highlight = null;
			break;
		}
		}

		highlight = in0;
		break;
	}

	// Apply or remove hover effect
	if (this.potentialPort && this.potentialPort !== highlight) {
		this.removePortHoverEffect(this.potentialPort);
	}
	if (highlight && this.potentialPort !== highlight) {
		this.applyPortHoverEffect(highlight);
	}

	this.potentialPort = highlight;
	}
}
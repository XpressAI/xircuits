import { MouseEvent } from 'react';
import {
	SelectingState,
	State,
	Action,
	InputType,
	ActionEvent,
	DragCanvasState
} from '@projectstorm/react-canvas-core';
import { DragNewLinkState } from './DragNewLinkState';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { CustomPortModel } from '../port/CustomPortModel';
import { DragDiagramItemsState } from './DragDiagramItemsState';

export class CustomDiagramState extends State<DiagramEngine> {
	dragCanvas: DragCanvasState;
	dragNewLink: DragNewLinkState;
	dragItems: DragDiagramItemsState;

	constructor() {
		super({
			name: 'custom-diagrams'
		});
		this.childStates = [new SelectingState()];
		this.dragCanvas = new DragCanvasState();
		this.dragNewLink = new DragNewLinkState({allowLooseLinks: false});
		this.dragItems = new DragDiagramItemsState();

		// determine what was clicked on
		this.registerAction(
			new Action({
				type: InputType.MOUSE_DOWN,
				fire: (event: ActionEvent<MouseEvent>) => {
					const element = this.engine.getActionEventBus().getModelForEvent(event);

					// the canvas was clicked on, transition to the dragging canvas state
					if (!element) {
						this.transitionWithEvent(this.dragCanvas, event);
					}
					// initiate dragging a new link
					else if (element instanceof CustomPortModel) {
						this.transitionWithEvent(this.dragNewLink, event);
					}
					// move the items (and potentially link points)
					else {
						this.transitionWithEvent(this.dragItems, event);
					}
				}
			})
		);
	}
}
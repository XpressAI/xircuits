import { MouseEvent } from 'react';

import { Action, ActionEvent, DragCanvasState, InputType, SelectingState, State } from '@projectstorm/react-canvas-core';

import { MoveItemsState } from './MoveItemsState';

export class DefaultState extends State {
  constructor() {
    super({
      name: 'default'
    });
    this.childStates = [new SelectingState()];

    // determine what was clicked on
    this.registerAction(
      new Action({
        type: InputType.MOUSE_DOWN,
        fire: event => {
          const element = this.engine.getActionEventBus().getModelForEvent(event as ActionEvent<MouseEvent<Element, globalThis.MouseEvent>>);

          // the canvas was clicked on, transition to the dragging canvas state
          if (!element) {
            this.transitionWithEvent(new DragCanvasState(), event);
          } else {
            this.transitionWithEvent(new MoveItemsState(), event);
          }
        }
      })
    );
  }
}
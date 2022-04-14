import { MouseEvent } from 'react';

import {
  Action,
  ActionEvent,
  AbstractDisplacementState,
  AbstractDisplacementStateEvent,
  BaseModel,
  BasePositionModel,
  CanvasEngine,
  InputType,
  State
} from '@projectstorm/react-canvas-core';
import { Point } from '@projectstorm/geometry';

export class MoveItemsState<E extends CanvasEngine = CanvasEngine> extends AbstractDisplacementState<E> {
  initialPositions: {
    [id: string]: {
      point: Point;
      item: BaseModel;
    };
  } = {};

  constructor() {
    super({
      name: 'move-items'
    });
    this.registerAction(
      new Action({
        type: InputType.MOUSE_DOWN,
        fire: event => {
          const target = event.event.target as HTMLElement | null;
          // find the first parent element that is allowed to be dragged (an element can be marked as non-draggable by specifying the "data-no-drag" attribute)
          let parentElement = target;
          while (parentElement && !parentElement.hasAttribute('data-no-drag')) {
            parentElement = parentElement.parentElement;
          }

          // if we could not find any draggable parent element then reject the drag
          if (parentElement && parentElement.hasAttribute('data-no-drag')) {
            this.eject();
            return;
          }

          const element = this.engine.getActionEventBus().getModelForEvent(event as ActionEvent<MouseEvent<Element, globalThis.MouseEvent>>);
          if (!element) {
            return;
          }
          if (!element.isSelected()) {
            this.engine.getModel().clearSelection();
          }
          element.setSelected(true);
          this.engine.repaintCanvas();
        }
      })
    );
  }

  activated(previous: State) {
    super.activated(previous);
    this.initialPositions = {};
  }

  fireMouseMoved(event: AbstractDisplacementStateEvent) {
    const items = this.engine.getModel().getSelectedEntities();
    const model = this.engine.getModel();
    for (const item of items) {
      if (item instanceof BasePositionModel) {
        if (item.isLocked()) {
          continue;
        }
        if (!this.initialPositions[item.getID()]) {
          this.initialPositions[item.getID()] = {
            point: item.getPosition(),
            item: item
          };
        }

        const pos = this.initialPositions[item.getID()].point;
        item.setPosition(model.getGridPosition(pos.x + event.virtualDisplacementX), model.getGridPosition(pos.y + event.virtualDisplacementY));
      }
    }
    this.engine.repaintCanvas();
  }
}
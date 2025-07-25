import { Action, ActionEvent, InputType } from '@projectstorm/react-canvas-core';
import { JupyterFrontEnd } from '@jupyterlab/application';

import { commandIDs } from "./CommandIDs";

interface CustomActionEventOptions {
  app: JupyterFrontEnd;
  getWidgetId: () => string;
}

export class CustomActionEvent extends Action {
  constructor(options: CustomActionEventOptions) {
    super({
      type: InputType.KEY_DOWN,
      fire: (e: ActionEvent<React.KeyboardEvent>) => {
        const app = options.app;
        // @ts-ignore
        if (app.shell._tracker._activeWidget && options.getWidgetId() === app.shell._tracker._activeWidget.id) {
          const { key, ctrlKey, metaKey, nativeEvent } = e.event;
          const cmd = ctrlKey || metaKey;

          const executeIf = (condition, command) => {
            if (condition) {
              e.event.preventDefault();
              e.event.stopPropagation();
              if (nativeEvent) {
                nativeEvent.stopImmediatePropagation();
              }
              app.commands.execute(command);
            }
          };

          executeIf(cmd && key === 'z', commandIDs.undo);
          executeIf(cmd && key === 'y', commandIDs.redo);
          executeIf(cmd && key === 's', commandIDs.saveXircuit);
          executeIf(cmd && key === 'x', commandIDs.cutNode);
          executeIf(cmd && key === 'c', commandIDs.copyNode);
          executeIf(cmd && key === 'v', commandIDs.pasteNode);
          executeIf(key === 'Delete' || key === 'Backspace', commandIDs.deleteEntity);
        }
      }
    });
  }
}
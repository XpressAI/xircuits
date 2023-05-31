import { Action, ActionEvent, InputType } from '@projectstorm/react-canvas-core';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { commandIDs } from '../components/xircuitBodyWidget';

interface CustomActionEventOptions {
    app: JupyterFrontEnd;
}

export class CustomActionEvent extends Action {
    constructor(options: CustomActionEventOptions) {
        
        super({
            type: InputType.KEY_DOWN,
            fire: (event: ActionEvent<React.KeyboardEvent>) => {
                const app = options.app;
                const keyCode = event.event.key;
                const ctrlKey = event.event.ctrlKey;
                
                const executeIf = (condition, command) => {
                    if(condition){
                        // @ts-ignore
                        event.event.stopImmediatePropagation();
                        app.commands.execute(command)
                    }
                }

                executeIf(ctrlKey && keyCode === 'z', commandIDs.undo);
                executeIf(ctrlKey && keyCode === 'y', commandIDs.redo);
                executeIf(ctrlKey && keyCode === 's', commandIDs.saveXircuit);
                executeIf(ctrlKey && keyCode === 'x', commandIDs.cutNode);
                executeIf(ctrlKey && keyCode === 'c', commandIDs.copyNode);
                executeIf(ctrlKey && keyCode === 'v', commandIDs.pasteNode);
                executeIf(keyCode == 'Delete' || keyCode == 'Backspace', commandIDs.deleteNode);
            }
        });
    }
}
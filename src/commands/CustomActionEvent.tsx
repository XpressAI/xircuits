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
                
                // Comment this first until the TODO below is fix
                // if (ctrlKey && keyCode === 'x') app.commands.execute(commandIDs.cutNode);
                // if (ctrlKey && keyCode === 'c') app.commands.execute(commandIDs.copyNode);
                // TODO: Fix this paste issue where it paste multiple times.
                // if (ctrlKey && keyCode === 'v') app.commands.execute(commandIDs.pasteNode);
                if (keyCode == 'Delete' || keyCode == 'Backspace') app.commands.execute(commandIDs.deleteNode);
            }
        });
    }
}
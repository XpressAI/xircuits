import { JupyterFrontEnd } from '@jupyterlab/application';
import { commandIDs } from '../components/XircuitsBodyWidget';
import { ITranslator } from '@jupyterlab/translation';
import { IXircuitsDocTracker } from '../index';
import * as _ from 'lodash';
import { showFormDialog } from '../dialog/FormDialog';
import { cancelDialog } from '../tray_library/GeneralComponentLib';
import { ComponentLibraryConfig } from '../tray_library/ComponentLibraryConfig';
import { newLibraryInputDialog } from '../dialog/NewLibraryDialog';
import { requestAPI } from '../server/handler';

/**
 * Add the commands for node actions.
 */
export function addChatActionCommands(
    app: JupyterFrontEnd,
    tracker: IXircuitsDocTracker,
    translator: ITranslator
): void {
    const trans = translator.load('jupyterlab');
    const { commands, shell } = app;

     /**
     * Whether there is an active xircuits.
     */
    function isEnabled(): boolean {
        return (
            tracker.currentWidget !== null &&
            tracker.currentWidget === shell.currentWidget
        );
    }

    commands.addCommand(commandIDs.createNewComponentLibrary, {
        execute: async (args) => {

            let libraries = await ComponentLibraryConfig();
            let inputValue;

            let dialogOptions = newLibraryInputDialog({ title: 'Create New Component', oldValue: "", libraries: libraries});
            let dialogResult = await showFormDialog(dialogOptions);
            if (cancelDialog(dialogResult)) return;
            
            const resultValue = dialogResult.value;
            if (resultValue['library-select'] === 'custom-option') {
            inputValue = resultValue['customLibrary']; // For custom library name
            } else {
            inputValue = resultValue['library-select']; // For selected predefined library
            }

            const componentCode = args['componentCode'] as any;
            const dataToSend = { "libraryName": inputValue, "componentCode": componentCode };
        
            try {
                const server_reply = await requestAPI<any>('library/new', {
                    body: JSON.stringify(dataToSend),
                    method: 'POST',
                });
                console.log(server_reply)
                return server_reply;
            } catch (reason) {
                console.error(
                    `Error on POST library/new ${dataToSend}.\n${reason}`
                );
            }
        }
    })
}

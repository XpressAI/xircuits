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
import { checkInput } from '../helpers/InputSanitizer';
import { XircuitsFactory } from '../XircuitsFactory';

/**
 * Add the commands for node actions.
 */
export function addLibraryActionCommands(
    app: JupyterFrontEnd,
    tracker: IXircuitsDocTracker,
    translator: ITranslator,
    factory: XircuitsFactory
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

    commands.addCommand(commandIDs.refreshComponentList, {
        execute: async (args) => {
            factory.refreshComponentsSignal.emit(args);
        }
    })

    commands.addCommand(commandIDs.createNewComponentLibrary, {
        execute: async (args) => {

            let componentCode = args['componentCode'] as any;
            let libraries = await ComponentLibraryConfig();
            let inputValue = "";
            let dialogResult;
            let type = "libraryname";
    
            do {
                let dialogOptions = newLibraryInputDialog({ 
                    title: 'Create New Component', 
                    oldValue: inputValue, 
                    libraries: libraries,
                    oldComponentCode: componentCode
                });
    
                dialogResult = await showFormDialog(dialogOptions);
                if (cancelDialog(dialogResult)) return;

                componentCode = dialogResult.value['component-code'];
                if (dialogResult.value['library-select'] === 'custom-option') {
                    inputValue = dialogResult.value['customLibrary']; // For custom library name
                } else {
                    inputValue = dialogResult.value['library-select']; // For selected predefined library
                }
    
            } while (!checkInput(inputValue, type))

            const dataToSend = { "libraryName": inputValue, "componentCode": componentCode };
        
            try {
                const server_reply = await requestAPI<any>('library/new', {
                    body: JSON.stringify(dataToSend),
                    method: 'POST',
                });

                await app.commands.execute(commandIDs.refreshComponentList);
                return server_reply;
            } catch (reason) {
                console.error(
                    `Error on POST library/new ${dataToSend}.\n${reason}`
                );
            }
        }
    })
}

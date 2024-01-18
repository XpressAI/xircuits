import {
    ISessionContext,
    SessionContext,
    SessionContextDialogs,
} from '@jupyterlab/apputils';
import { OutputAreaModel, SimplifiedOutputArea } from '@jupyterlab/outputarea';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { KernelMessage, ServiceManager } from '@jupyterlab/services';
import {
    ITranslator,
    nullTranslator,
    TranslationBundle,
} from '@jupyterlab/translation';
import { Message } from '@lumino/messaging';
import { StackedPanel } from '@lumino/widgets';
import { Log } from '../log/LogPlugin';
import { xircuitsIcon } from '../ui-components/icons';
import { XircuitsFactory } from '../XircuitsFactory';

/**
 * The class name added to the output panel.
 */
const PANEL_CLASS = 'jp-RovaPanel';

class CustomOutputArea extends SimplifiedOutputArea {
    constructor(options) {
        super(options);

        // Listen to the content change signal of the output area model
        this.model.changed.connect(this._scrollToBottom, this);
    }

    private _scrollToBottom(): void {
        // Scroll the output area to the bottom
        this.node.scrollTop = this.node.scrollHeight;
    }
}

export class OutputPanel extends StackedPanel {
    constructor(
        manager: ServiceManager.IManager,
        rendermime: IRenderMimeRegistry,
        XircuitsFactory: XircuitsFactory,
        translator?: ITranslator
    ) {
        super();
        this._translator = translator || nullTranslator;
        this._trans = this._translator.load('jupyterlab');
        this._XircuitsFactory = XircuitsFactory;
        this.addClass(PANEL_CLASS);
        this.id = 'xircuit-output-panel';
        this.title.label = this._trans.__('Xircuit Output');
        this.title.closable = true;
        this.title.icon = xircuitsIcon;

        this._sessionContext = new SessionContext({
            sessionManager: manager.sessions,
            specsManager: manager.kernelspecs,
            name: 'Xircuit Output Process',
        });

        this._outputareamodel = new OutputAreaModel();
        this._outputarea = new CustomOutputArea({
            model: this._outputareamodel,
            rendermime: rendermime,
        });

        this._sessionContextDialogs = new SessionContextDialogs();

        this.addWidget(this._outputarea);

        void this._sessionContext
            .initialize()
            .then(async (value) => {
                if (value) {
                    await this._sessionContextDialogs.selectKernel(this._sessionContext);
                    // Dispose panel when no kernel selected
                    if (this._sessionContext.hasNoKernel) {
                        super.dispose();
                    }
                }
            })
            .catch((reason) => {
                console.error(
                    `Failed to initialize the session in Xircuit Output.\n${reason}`
                );
            });
    }

    get session(): ISessionContext {
        return this._sessionContext;
    }

    dispose(): void {
        this._sessionContext.sessionManager.shutdown(this._sessionContext.session.id);
        this._sessionContext.dispose();
        this._sessionContext.sessionManager.refreshRunning();
        super.dispose();
    }

    execute(code: string, xircuitLogger: Log): void {
        SimplifiedOutputArea.execute(code, this._outputarea, this._sessionContext)
            .then((msg: KernelMessage.IExecuteReplyMsg) => {
                if (this._outputarea.model.toJSON().length > 0) {
                    for (let index = 0; index < this._outputarea.model.toJSON().length; index++) {
                        let is_error = this._outputarea.model.toJSON()[index].output_type == "error";

                        if (is_error) {
                            let ename = this._outputarea.model.toJSON()[index]["ename"] as string;
                            let evalue = this._outputarea.model.toJSON()[index]["evalue"] as string;
                            let traceback = this._outputarea.model.toJSON()[index]["traceback"] as string[];

                            if (evalue.includes("File") && evalue.includes("not found")) {
                                alert(ename + ": " + evalue + " Please compile first!");
                                xircuitLogger.error(ename + ": " + evalue);
                                console.log(evalue + " Please compile first!");
                                return;
                            }

                            for (let data of traceback) {
                                xircuitLogger.error(data);
                            }

                            return;
                        }

                        let text = this._outputarea.model.toJSON()[index]["text"] as string;
                        for (let text_index = 0; text_index < text.split("\n").length; text_index++) {
                            if (text.split("\n")[text_index].trim() != "") {
                                xircuitLogger.info(text.split("\n")[text_index]);
                            }
                        }
                    }
                }
            })
            .catch((reason) => console.error(reason));
    }

    protected onCloseRequest(msg: Message): void {
        super.onCloseRequest(msg);
        this.dispose();
    }

    private _sessionContext: SessionContext;
    private _outputarea: CustomOutputArea;
    private _outputareamodel: OutputAreaModel;
    private _sessionContextDialogs: SessionContextDialogs;
    private _XircuitsFactory: XircuitsFactory;

    private _translator: ITranslator;
    private _trans: TranslationBundle;
}
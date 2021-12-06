import { ABCWidgetFactory, DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';

import { Signal } from '@lumino/signaling';

import { IModelDB } from '@jupyterlab/observables';

import { Contents } from '@jupyterlab/services';

import { XPipeWidget, XPipePanel } from './xpipeWidget';

import { XPipeDocModel } from './xpipeModel';

import { bugIcon, checkIcon, circleIcon, editIcon, listIcon, refreshIcon, runIcon, saveIcon, undoIcon } from '@jupyterlab/ui-components';

import { ToolbarButton } from '@jupyterlab/apputils';

import { commandIDs } from './components/xpipeBodyWidget';
import { CommandIDs } from './log/LogPlugin';

import { ServiceManager } from '@jupyterlab/services';

const XPIPE_CLASS = 'xpipes-editor';

export class XpipeFactory extends ABCWidgetFactory<XPipeWidget, XPipeDocModel> {

  browserFactory: IFileBrowserFactory;
  app: JupyterFrontEnd;
  shell: ILabShell;
  commands: any;
  model: any;
  serviceManager: ServiceManager;
  saveXpipeSignal: Signal<this, any>;
  reloadXpipeSignal: Signal<this, any>;
  revertXpipeSignal: Signal<this, any>;
  compileXpipeSignal: Signal<this, any>;
  runXpipeSignal: Signal<this, any>;
  debugXpipeSignal: Signal<this, any>;
  breakpointXpipeSignal: Signal<this, any>;
  currentNodeSignal: Signal<this, any>;
  testXpipeSignal: Signal<this, any>;
  continueDebugSignal: Signal<this, any>;
  nextNodeDebugSignal: Signal<this, any>;
  stepOverDebugSignal: Signal<this, any>;
  terminateDebugSignal: Signal<this, any>;
  stepInDebugSignal: Signal<this, any>;
  stepOutDebugSignal: Signal<this, any>;
  evaluateDebugSignal: Signal<this, any>;
  debugModeSignal: Signal<this, any>;

  constructor(options: any) {
    super(options);
    this.browserFactory = options.browserFactory;
    this.app = options.app;
    this.shell = options.shell;
    this.commands = options.commands;
    this.model = options.modelName;
    this.serviceManager = options.serviceManager;
    this.saveXpipeSignal = new Signal<this, any>(this);
    this.reloadXpipeSignal = new Signal<this, any>(this);
    this.revertXpipeSignal = new Signal<this, any>(this);
    this.compileXpipeSignal = new Signal<this, any>(this);
    this.runXpipeSignal = new Signal<this, any>(this);
    this.debugXpipeSignal = new Signal<this, any>(this);
    this.breakpointXpipeSignal = new Signal<this, any>(this);
    this.currentNodeSignal = new Signal<this, any>(this);
    this.testXpipeSignal = new Signal<this, any>(this);
    this.continueDebugSignal = new Signal<this, any>(this);
    this.nextNodeDebugSignal = new Signal<this, any>(this);
    this.stepOverDebugSignal = new Signal<this, any>(this);
    this.terminateDebugSignal = new Signal<this, any>(this);
    this.stepInDebugSignal = new Signal<this, any>(this);
    this.stepOutDebugSignal = new Signal<this, any>(this);
    this.evaluateDebugSignal = new Signal<this, any>(this);
    this.debugModeSignal = new Signal<this, any>(this);
  }

  protected createNewWidget(context: DocumentRegistry.IContext<XPipeDocModel>): XPipeWidget {
    // Creates a blank widget with a DocumentWidget wrapper
    const props = {
      app: this.app,
      shell: this.shell,
      commands: this.commands,
      browserFactory: this.browserFactory,
      context: context,
      serviceManager: this.serviceManager,
      saveXpipeSignal: this.saveXpipeSignal,
      reloadXpipeSignal: this.reloadXpipeSignal,
      revertXpipeSignal: this.revertXpipeSignal,
      compileXpipeSignal: this.compileXpipeSignal,
      runXpipeSignal: this.runXpipeSignal,
      debugXpipeSignal: this.debugXpipeSignal,
      breakpointXpipeSignal: this.breakpointXpipeSignal,
      currentNodeSignal: this.currentNodeSignal,
      testXpipeSignal: this.testXpipeSignal,
      continueDebugSignal: this.continueDebugSignal,
      nextNodeDebugSignal: this.nextNodeDebugSignal,
      stepOverDebugSignal: this.stepOverDebugSignal,
      terminateDebugSignal: this.terminateDebugSignal,
      stepInDebugSignal: this.stepInDebugSignal,
      stepOutDebugSignal: this.stepOutDebugSignal,
      evaluateDebugSignal: this.evaluateDebugSignal,
      debugModeSignal: this.debugModeSignal
    };

    const content = new XPipePanel(props);

    const widget = new DocumentWidget({ content, context });
    widget.addClass(XPIPE_CLASS);
    widget.title.iconClass = 'jp-XpipeLogo';

    /**
     * Create a save button toolbar item.
     */
    let saveButton = new ToolbarButton({
      icon: saveIcon,
      tooltip: 'Save Xpipes',
      onClick: (): void => {
        this.commands.execute(commandIDs.saveXpipe);
      }
    });

    /**
     * Create a reload button toolbar item.
     */
    let reloadButton = new ToolbarButton({
      icon: refreshIcon,
      tooltip: 'Reload Xpipes from Disk',
      onClick: (): void => {
        this.commands.execute(commandIDs.reloadXpipe);
      }
    });

    /**
     * Create a revert button toolbar item.
     */
    let revertButton = new ToolbarButton({
      icon: undoIcon,
      tooltip: 'Revert Xpipes to Checkpoint',
      onClick: (): void => {
        this.commands.execute(commandIDs.revertXpipe);
      }
    });

    /**
     * Create a compile button toolbar item.
     */
    let compileButton = new ToolbarButton({
      icon: checkIcon,
      tooltip: 'Compile Xpipes',
      onClick: (): void => {
        this.commands.execute(commandIDs.compileXpipe);
      }
    });

    /**
     * Create a run button toolbar item.
     */
    let runButton = new ToolbarButton({
      icon: runIcon,
      tooltip: 'Run Xpipes',
      onClick: (): void => {
        this.commands.execute(commandIDs.runXpipe);
      }
    });

    /**
     * Create a debug button toolbar item.
     */
    let debugButton = new ToolbarButton({
      icon:bugIcon,
      tooltip: 'Open Xpipes Debugger and enable Image Viewer',
      onClick: (): void => {
        this.commands.execute(commandIDs.debugXpipe);
      }
    });

    /**
     * Create a log button toolbar item.
     */
     let logButton = new ToolbarButton({
      icon: listIcon,
      tooltip: 'Open log',
      onClick: (): void => {
        this.commands.execute(CommandIDs.openLog);
      }
    });

    /**
     * Create a test button toolbar item.
     */
    let testButton = new ToolbarButton({
      icon: editIcon,
      tooltip: 'For testing purpose',
      onClick: (): void => {
        this.commands.execute(commandIDs.testXpipe)
      }
    });
  
    widget.toolbar.insertItem(0,'xpipes-add-save', saveButton);
    widget.toolbar.insertItem(1,'xpipes-add-reload', reloadButton);
    widget.toolbar.insertItem(2,'xpipes-add-revert', revertButton);
    widget.toolbar.insertItem(3,'xpipes-add-compile', compileButton);
    widget.toolbar.insertItem(4,'xpipes-add-run', runButton);
    widget.toolbar.insertItem(5,'xpipes-add-debug', debugButton);
    widget.toolbar.insertItem(6,'xpipes-add-log', logButton);
    widget.toolbar.insertItem(7,'xpipes-add-test', testButton);

    return widget;
  }
}


export class XPipeDocModelFactory
  implements DocumentRegistry.IModelFactory<XPipeDocModel>
{
  /**
   * The name of the model.
   *
   * @returns The name
   */
  get name(): string {
    return 'xpipes-model';
  }

  /**
   * The content type of the file.
   *
   * @returns The content type
   */
  get contentType(): Contents.ContentType {
    return 'file';
  }

  /**
   * The format of the file.
   *
   * @returns the file format
   */
  get fileFormat(): Contents.FileFormat {
    return 'text';
  }

  /**
   * Get whether the model factory has been disposed.
   *
   * @returns disposed status
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Dispose the model factory.
   */
  dispose(): void {
    this._disposed = true;
  }

  /**
   * Get the preferred language given the path on the file.
   *
   * @param path path of the file represented by this document model
   * @returns The preferred language
   */
  preferredLanguage(path: string): string {
    return '';
  }

  /**
   * Create a new instance of XPipeDocModel.
   *
   * @param languagePreference Language
   * @param modelDB Model database
   * @returns The model
   */
  createNew(languagePreference?: string, modelDB?: IModelDB): XPipeDocModel {
    return new XPipeDocModel(languagePreference, modelDB);
  }

  private _disposed = false;
}

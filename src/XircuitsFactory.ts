import {
  ABCWidgetFactory,
  DocumentRegistry,
  DocumentWidget
} from '@jupyterlab/docregistry';
import {
  ILabShell,
  JupyterFrontEnd
} from '@jupyterlab/application';
import { Signal } from '@lumino/signaling';
import { XircuitsPanel } from './XircuitsWidget';
import {
  copyIcon,
  cutIcon,
  listIcon,
  pasteIcon,
  redoIcon,
  refreshIcon,
  runIcon,
  saveIcon,
  undoIcon,
  type LabIcon
} from "@jupyterlab/ui-components";
import { ToolbarButton } from '@jupyterlab/apputils';
import { LoggerCommandIDs } from './log/LogPlugin';
import { ServiceManager } from '@jupyterlab/services';
import { RunSwitcher } from './components/runner/RunSwitcher';
import { 
  lockIcon, 
  compileIcon,
  reloadAllIcon, 
  xircuitsIcon, 
  toggleAnimationIcon, 
  compileRunIcon
} from './ui-components/icons';
import { commandIDs } from "./commands/CommandIDs";
const XIRCUITS_CLASS = 'xircuits-editor';

export class XircuitsFactory extends ABCWidgetFactory<DocumentWidget> {

  app: JupyterFrontEnd;
  shell: ILabShell;
  commands: any;
  serviceManager: ServiceManager;
  fetchComponentsSignal: Signal<this, any>;
  fetchRemoteRunConfigSignal: Signal<this, any>;
  saveXircuitSignal: Signal<this, any>;
  compileXircuitSignal: Signal<this, any>;
  runXircuitSignal: Signal<this, any>;
  runTypeXircuitSignal: Signal<this, any>;
  lockNodeSignal: Signal<this, any>;
  triggerCanvasUpdateSignal: Signal<this, any>;
  triggerLoadingAnimationSignal: Signal<this, any>;
  reloadAllNodesSignal: Signal<this, any>;
  toggleAllLinkAnimationSignal: Signal<this, any>;
  refreshComponentsSignal: Signal<this, any>;
  toggleDisplayNodesInLibrary: Signal<this, any>;

  constructor(options: any) {
    super(options);
    this.app = options.app;
    this.shell = options.shell;
    this.commands = options.commands;
    this.serviceManager = options.serviceManager;
    this.fetchComponentsSignal = new Signal<this, any>(this);
    this.fetchRemoteRunConfigSignal = new Signal<this, any>(this);
    this.saveXircuitSignal = new Signal<this, any>(this);
    this.compileXircuitSignal = new Signal<this, any>(this);
    this.runXircuitSignal = new Signal<this, any>(this);
    this.runTypeXircuitSignal = new Signal<this, any>(this);
    this.lockNodeSignal = new Signal<this, any>(this);
    this.triggerCanvasUpdateSignal = new Signal<this, any>(this);
    this.triggerLoadingAnimationSignal = new Signal<this, any>(this);
    this.reloadAllNodesSignal = new Signal<this, any>(this);
    this.toggleAllLinkAnimationSignal = new Signal<this, any>(this);
    this.refreshComponentsSignal = new Signal<this, any>(this);
    this.toggleDisplayNodesInLibrary = new Signal<this, any>(this);
  }

  protected createNewWidget(context: DocumentRegistry.Context): DocumentWidget {
    // Creates a blank widget with a DocumentWidget wrapper
    const props = {
      app: this.app,
      shell: this.shell,
      commands: this.commands,
      context: context,
      serviceManager: this.serviceManager,
      fetchComponentsSignal: this.fetchComponentsSignal,
      fetchRemoteRunConfigSignal: this.fetchRemoteRunConfigSignal,
      saveXircuitSignal: this.saveXircuitSignal,
      compileXircuitSignal: this.compileXircuitSignal,
      runXircuitSignal: this.runXircuitSignal,
      runTypeXircuitSignal: this.runTypeXircuitSignal,
      lockNodeSignal: this.lockNodeSignal,
      triggerCanvasUpdateSignal: this.triggerCanvasUpdateSignal,
      triggerLoadingAnimationSignal: this.triggerLoadingAnimationSignal,
      reloadAllNodesSignal: this.reloadAllNodesSignal,
      toggleAllLinkAnimationSignal: this.toggleAllLinkAnimationSignal,
      refreshComponentsSignal: this.refreshComponentsSignal,
      toggleDisplayNodesInLibrary: this.toggleDisplayNodesInLibrary
    };

    const content = new XircuitsPanel(props);

    const widget = new DocumentWidget({ content, context });
    widget.addClass(XIRCUITS_CLASS);
    widget.title.icon = xircuitsIcon;

    const CommandButton = (commandId: string, icon: LabIcon, tooltip: string) => new ToolbarButton({
      icon, tooltip,
      onClick: () => {
        this.commands.execute(commandId)
      }
    })

    let saveButton = CommandButton(commandIDs.saveXircuit, saveIcon, 'Save (Ctrl+S)');
    let undoButton = CommandButton(commandIDs.undo, undoIcon, 'Undo (Ctrl+Z)');
    let redoButton = CommandButton(commandIDs.redo, redoIcon, 'Redo (Ctrl+Y)');
    let reloadButton = CommandButton(commandIDs.reloadDocManager, refreshIcon, 'Reload Xircuits from Disk');
    let cutButton = CommandButton(commandIDs.cutNode, cutIcon, 'Cut selected nodes');
    let copyButton = CommandButton(commandIDs.copyNode, copyIcon, 'Copy selected nodes');
    let pasteButton = CommandButton(commandIDs.pasteNode, pasteIcon, 'Paste nodes from the clipboard');
    let lockButton = CommandButton(commandIDs.lockXircuit, lockIcon, "Lock all non-general nodes connected from start node");
    let logButton = CommandButton(LoggerCommandIDs.openLog, listIcon, 'Open log');
    let reloadAllNodesButton = CommandButton(commandIDs.reloadAllNodes, reloadAllIcon, 'Reload all nodes');
    let toggleAllLinkAnimationButton = CommandButton(commandIDs.toggleAllLinkAnimation, toggleAnimationIcon, 'Toggle low power mode by disabling link animation');
    let compileButton = CommandButton(commandIDs.compileXircuit, compileIcon, 'Compile Xircuits');
    let compileAndRunButton = CommandButton(commandIDs.runXircuit, compileRunIcon,'Compile and Run Xircuits');

    widget.toolbar.insertItem(0, 'xircuits-add-undo', undoButton);
    widget.toolbar.insertItem(1, 'xircuits-add-redo', redoButton);
    widget.toolbar.insertItem(2, 'xircuits-add-reload', reloadButton);
    widget.toolbar.insertItem(3, 'xircuits-add-cut', cutButton);
    widget.toolbar.insertItem(4, 'xircuits-add-copy', copyButton);
    widget.toolbar.insertItem(5, 'xircuits-add-paste', pasteButton);
    widget.toolbar.insertItem(6, 'xircuits-add-lock', lockButton);
    widget.toolbar.insertItem(7, 'xircuits-add-log', logButton);
    widget.toolbar.insertItem(8, 'xircuits-add-toggle-all-link-animation', toggleAllLinkAnimationButton);
    widget.toolbar.insertItem(9, 'xircuits-add-reload-all', reloadAllNodesButton);
    widget.toolbar.insertItem(10, 'xircuits-add-save', saveButton);
    widget.toolbar.insertItem(11, 'xircuits-add-compile', compileButton);
    widget.toolbar.insertItem(12, 'xircuits-add-run', compileAndRunButton);
    widget.toolbar.insertItem(13, 'xircuits-run-type', new RunSwitcher(this));
    
    return widget;
  }
}

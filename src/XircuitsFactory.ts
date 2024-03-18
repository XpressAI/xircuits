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
  bugIcon,
  checkIcon,
  copyIcon,
  cutIcon,
  editIcon,
  listIcon,
  pasteIcon,
  redoIcon,
  refreshIcon,
  runIcon,
  saveIcon,
  undoIcon
} from '@jupyterlab/ui-components';
import { ToolbarButton } from '@jupyterlab/apputils';
import { commandIDs } from './components/XircuitsBodyWidget';
import { LoggerCommandIDs } from './log/LogPlugin';
import { ServiceManager } from '@jupyterlab/services';
import { RunSwitcher } from './components/runner/RunSwitcher';
import { lockIcon, reloadAllIcon, xircuitsIcon, toggleAnimationIcon } from './ui-components/icons';
const XIRCUITS_CLASS = 'xircuits-editor';

export class XircuitsFactory extends ABCWidgetFactory<DocumentWidget> {

  app: JupyterFrontEnd;
  shell: ILabShell;
  commands: any;
  serviceManager: ServiceManager;
  fetchComponentsSignal: Signal<this, any>;
  saveXircuitSignal: Signal<this, any>;
  compileXircuitSignal: Signal<this, any>;
  runXircuitSignal: Signal<this, any>;
  runTypeXircuitSignal: Signal<this, any>;
  lockNodeSignal: Signal<this, any>;
  triggerLoadingAnimationSignal: Signal<this, any>;
  reloadAllNodesSignal: Signal<this, any>;
  toggleAllLinkAnimationSignal: Signal<this, any>;
  refreshComponentsSignal: Signal<this, any>;

  constructor(options: any) {
    super(options);
    this.app = options.app;
    this.shell = options.shell;
    this.commands = options.commands;
    this.serviceManager = options.serviceManager;
    this.fetchComponentsSignal = new Signal<this, any>(this);
    this.saveXircuitSignal = new Signal<this, any>(this);
    this.compileXircuitSignal = new Signal<this, any>(this);
    this.runXircuitSignal = new Signal<this, any>(this);
    this.runTypeXircuitSignal = new Signal<this, any>(this);
    this.lockNodeSignal = new Signal<this, any>(this);
    this.triggerLoadingAnimationSignal = new Signal<this, any>(this);
    this.reloadAllNodesSignal = new Signal<this, any>(this);
    this.toggleAllLinkAnimationSignal = new Signal<this, any>(this);
    this.refreshComponentsSignal = new Signal<this, any>(this);
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
      saveXircuitSignal: this.saveXircuitSignal,
      compileXircuitSignal: this.compileXircuitSignal,
      runXircuitSignal: this.runXircuitSignal,
      runTypeXircuitSignal: this.runTypeXircuitSignal,
      lockNodeSignal: this.lockNodeSignal,
      triggerLoadingAnimationSignal: this.triggerLoadingAnimationSignal,
      reloadAllNodesSignal: this.reloadAllNodesSignal,
      toggleAllLinkAnimationSignal: this.toggleAllLinkAnimationSignal,
      refreshComponentsSignal: this.refreshComponentsSignal,
    };

    const content = new XircuitsPanel(props);

    const widget = new DocumentWidget({ content, context });
    widget.addClass(XIRCUITS_CLASS);
    widget.title.icon = xircuitsIcon;

    /**
     * Create a save button toolbar item.
     */
    let saveButton = new ToolbarButton({
      icon: saveIcon,
      tooltip: 'Save (Ctrl+S)',
      onClick: (): void => {
        this.commands.execute(commandIDs.saveXircuit);
      }
    });

    /**
     * Create a undo button toolbar item.
     */
    let undoButton = new ToolbarButton({
      icon: undoIcon,
      tooltip: 'Undo (Ctrl+Z)',
      onClick: (): void => {
        this.commands.execute(commandIDs.undo);
      }
    });

    /**
     * Create a redo button toolbar item.
     */
    let redoButton = new ToolbarButton({
      icon: redoIcon,
      tooltip: 'Redo (Ctrl+Y)',
      onClick: (): void => {
        this.commands.execute(commandIDs.redo);
      }
    });

    /**
     * Create a reload button toolbar item.
     */
    let reloadButton = new ToolbarButton({
      icon: refreshIcon,
      tooltip: 'Reload Xircuits from Disk',
      onClick: (): void => {
        this.commands.execute(commandIDs.reloadDocManager);
      }
    });

    /**
     * Create a cut button toolbar item.
     */
    let cutButton = new ToolbarButton({
      icon: cutIcon,
      tooltip: 'Cut selected nodes',
      onClick: (): void => {
        this.commands.execute(commandIDs.cutNode);
      }
    });

    /**
     * Create a copy button toolbar item.
     */
    let copyButton = new ToolbarButton({
      icon: copyIcon,
      tooltip: 'Copy selected nodes',
      onClick: (): void => {
        this.commands.execute(commandIDs.copyNode);
      }
    });

    /**
     * Create a paste button toolbar item.
     */
    let pasteButton = new ToolbarButton({
      icon: pasteIcon,
      tooltip: 'Paste nodes from the clipboard',
      onClick: (): void => {
        this.commands.execute(commandIDs.pasteNode);
      }
    });

    /**
     * Create a debug button toolbar item.
     */
    let debugButton = new ToolbarButton({
      icon:bugIcon,
      tooltip: 'Open Xircuits Debugger and enable Image Viewer',
      onClick: (): void => {
        this.commands.execute('Xircuit-editor:new-component-library'
        , {"componentCode": 'from xai_components.base import OutArg, InCompArg, Component\nimport pandas as pd\n\n@xai_component\nclass NewExample(Component):\n    file_path: InCompArg[str]\n    output_data: OutArg[pd.DataFrame]\n\n    def execute(self, ctx) -> None:\n        file_path = self.file_path.value\n        data = pd.read_csv(file_path)\n        self.output_data.value = data\n'});
      }
    });

    /**
     * Create a lock button toolbar item.
     */
    let lockButton = new ToolbarButton({
      icon: lockIcon,
      tooltip: "Lock all non-general nodes connected from start node",
      onClick: (): void => {
        this.commands.execute(commandIDs.lockXircuit);
      }
    });

    /**
     * Create a log button toolbar item.
     */
    let logButton = new ToolbarButton({
      icon: listIcon,
      tooltip: 'Open log',
      onClick: (): void => {
        this.commands.execute(LoggerCommandIDs.openLog);
      }
    });

    /**
     * Create a reload all button toolbar item.
     */
    let reloadAllNodesButton = new ToolbarButton({
      icon: reloadAllIcon,
      tooltip: 'Reload all nodes',
      onClick: (): void => {
        this.commands.execute(commandIDs.reloadAllNodes);
      }
    });

    /**
     * Create a button to toggle all link animation toolbar item.
     */
    let toggleAllLinkAnimationButton = new ToolbarButton({
      icon: toggleAnimationIcon,
      tooltip: 'Toggle low power mode by disabling link animation',
      onClick: (): void => {
        this.commands.execute(commandIDs.toggleAllLinkAnimation);
      }
    });
    
    /**
     * Create a compile button toolbar item.
     */
    let compileButton = new ToolbarButton({
      icon: checkIcon,
      tooltip: 'Compile Xircuits',
      onClick: (): void => {
        this.commands.execute(commandIDs.compileXircuit);
      }
    });

    /**
     * Create a compile and run button toolbar item.
     */
    let compileAndRunButton = new ToolbarButton({
      icon: runIcon,
      tooltip: 'Compile and Run Xircuits',
      onClick: (): void => {
        this.commands.execute(commandIDs.runXircuit);
      }
    });

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
    // widget.toolbar.insertItem(14, 'xircuits-new-library', debugButton)
    // TODO: Fix debugger
    // widget.toolbar.insertItem(5,'xircuits-add-debug', debugButton);
    

    return widget;
  }
}

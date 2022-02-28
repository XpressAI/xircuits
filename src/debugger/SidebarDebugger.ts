import { JupyterFrontEnd } from '@jupyterlab/application';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { Debugger } from '@jupyterlab/debugger';
import { Panel, SplitPanel, Widget, PanelLayout } from '@lumino/widgets';
import { commandIDs } from '../components/xircuitBodyWidget';
import { DebuggerWidget } from './DebuggerWidget';
import { XircuitFactory } from '../xircuitFactory';
import { Toolbar, CommandToolbarButton } from '@jupyterlab/apputils';
import { breakpointIcon, nextIcon } from '../ui-components/icons';

export const DebuggerCommandIDs = {
  continue: 'Xircuits-debugger:continue',
  terminate: 'Xircuits-debugger:terminate',
  stepOver: 'Xircuits-debugger:next',
  stepIn: 'Xircuits-debugger:step-in',
  stepOut: 'Xircuits-debugger:step-out',
  evaluate: 'Xircuits-debugger:evaluate-code',
}

/**
 * A Xircuits Debugger sidebar.
 */
 export class XircuitsDebuggerSidebar extends Panel {
    /**
     * Instantiate a new XircuitDebugger.Sidebar
     *
     * @param options The instantiation options for a XircuitDebugger.Sidebar
     */
    constructor(options: XircuitDebugger.IOptions) {
      super();
      const translator = options.translator || nullTranslator;
      const app = options.app;
      const xircuitFactory = options.widgetFactory;
      const trans = translator.load('jupyterlab');
      this.id = 'jp-debugger-sidebar';
      this.addClass('jp-DebuggerSidebar');
  
      this._body = new SplitPanel();
      this._body.orientation = 'vertical';
    //   this._body.addClass('jp-DebuggerSidebar-body');
      this.addWidget(this._body);
      const content = new DebuggerWidget( xircuitFactory );
      const header = new DebuggerHeader(translator);
      const toolbarPanel = new DebuggerToolbar();
      let debugMode;
      let inDebugMode;

      xircuitFactory.debugModeSignal.connect((_, args) => {
        debugMode = args["debugMode"];
        inDebugMode = args["inDebugMode"];
        app.commands.notifyCommandChanged();
      });

      /**
       * Create a continue button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xircuits-debugger-continue',
        new CommandToolbarButton({
          commands: app.commands,
          id: DebuggerCommandIDs.continue
        })
      );
      /**
       * Create a next node button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xircuits-debugger-next',
        new CommandToolbarButton({
          commands: app.commands,
          id: commandIDs.nextNode
        })
      );
      /**
       * Create a step over button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xircuits-debugger-step-over',
        new CommandToolbarButton({
          commands: app.commands,
          id: DebuggerCommandIDs.stepOver
        })
      );
      /**
       * Create a breakpoint button toolbar item.
       */
       toolbarPanel.toolbar.addItem(
        'xircuits-debugger-breakpoint',
        new CommandToolbarButton({
          commands: app.commands,
          id: commandIDs.breakpointXircuit
        })
      );
      /**
       * Create a terminate button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xircuits-debugger-terminate',
        new CommandToolbarButton({
          commands: app.commands,
          id: DebuggerCommandIDs.terminate
        })
      );
      /**
       * Create a step in button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xircuits-debugger-step-in',
        new CommandToolbarButton({
          commands: app.commands,
          id: DebuggerCommandIDs.stepIn
        })
      );
      /**
       * Create a step out button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xircuits-debugger-step-out',
        new CommandToolbarButton({
          commands: app.commands,
          id: DebuggerCommandIDs.stepOut
        })
      );
      /**
       * Create a evaluate code button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xircuits-debugger-evaluate-code',
        new CommandToolbarButton({
          commands: app.commands,
          id: DebuggerCommandIDs.evaluate
        })
      );

      // Add command signal to continue debugging xircuit
      app.commands.addCommand(DebuggerCommandIDs.continue, {
        caption: trans.__('Continue'),
        icon: Debugger.Icons.continueIcon,
        isEnabled: () => {
          return debugMode ?? false;
        },
        execute: args => {
          xircuitFactory.continueDebugSignal.emit(args);
        }
      });
      // Add command signal to toggle next node
      app.commands.addCommand(commandIDs.nextNode, {
        caption: trans.__('Next Node'),
        icon: nextIcon,
        isEnabled: () => {
          return inDebugMode ?? false;
        },
        execute: args => {
          xircuitFactory.nextNodeDebugSignal.emit(args);
        }
      });
      // Add command signal to toggle step over 
      app.commands.addCommand(DebuggerCommandIDs.stepOver, {
        caption: trans.__('Step Over'),
        icon: Debugger.Icons.stepOverIcon,
        isEnabled: () => {
          return inDebugMode ?? false;
        },execute: args => {
          xircuitFactory.stepOverDebugSignal.emit(args);
        }
      });
      // Add command signal to toggle breakpoint
      app.commands.addCommand(commandIDs.breakpointXircuit, {
        caption: trans.__('Toggle Breakpoint'),
        icon: breakpointIcon,
        isEnabled: () => {
          return debugMode ?? false;
        },
        execute: args => {
          xircuitFactory.breakpointXircuitSignal.emit(args);
        }
      });
      // Add command signal to terminate debugging xircuit
      app.commands.addCommand(DebuggerCommandIDs.terminate, {
        caption: trans.__('Terminate'),
        icon: Debugger.Icons.terminateIcon,
        isEnabled: () => {
          return debugMode ?? false;
        },
        execute: args => {
          xircuitFactory.terminateDebugSignal.emit(args);
        }
      });
      // // Add command signal to toggle step in
      // app.commands.addCommand(DebuggerCommandIDs.stepIn, {
      //   caption: trans.__('Step In'),
      //   icon: Debugger.Icons.stepIntoIcon,
      //   isEnabled: () => {
      //     return inDebugMode ?? false;
      //   },
      //   execute: args => {
      //     xircuitFactory.stepInDebugSignal.emit(args);
      //   }
      // });
      // // Add command signal to toggle step out
      // app.commands.addCommand(DebuggerCommandIDs.stepOut, {
      //   caption: trans.__('Step Out'),
      //   icon: Debugger.Icons.stepOutIcon,
      //   isEnabled: () => {
      //     return inDebugMode ?? false;
      //   },
      //   execute: args => {
      //     xircuitFactory.stepOutDebugSignal.emit(args);
      //   }
      // });
      // // Add command signal to evaluate debugging xircuit
      // app.commands.addCommand(DebuggerCommandIDs.evaluate, {
      //   caption: trans.__('Evaluate Code'),
      //   icon: Debugger.Icons.evaluateIcon,
      //   isEnabled: () => {
      //     return inDebugMode ?? false;
      //   },
      //   execute: args => {
      //     xircuitFactory.evaluateDebugSignal.emit(args);
      //   }
      // });

      this.addWidget(header);
      this.addWidget(toolbarPanel);
      this.addWidget(content);
      this.addClass('jp-DebuggerBreakpoints');
    }
  
    /**
     * Add an item at the end of the sidebar.
     *
     * @param widget - The widget to add to the sidebar.
     *
     * #### Notes
     * If the widget is already contained in the sidebar, it will be moved.
     * The item can be removed from the sidebar by setting its parent to `null`.
     */
    addItem(widget: Widget): void {
      this._body.addWidget(widget);
    }
  
    /**
     * Insert an item at the specified index.
     *
     * @param index - The index at which to insert the widget.
     *
     * @param widget - The widget to insert into to the sidebar.
     *
     * #### Notes
     * If the widget is already contained in the sidebar, it will be moved.
     * The item can be removed from the sidebar by setting its parent to `null`.
     */
    insertItem(index: number, widget: Widget): void {
      this._body.insertWidget(index, widget);
    }
  
    /**
     * A read-only array of the sidebar items.
     */
    get items(): readonly Widget[] {
      return this._body.widgets;
    }
  
    /**
     * Whether the sidebar is disposed.
     */
    isDisposed: boolean;
  
    /**
     * Dispose the sidebar.
     */
    dispose(): void {
      if (this.isDisposed) {
        return;
      }
      super.dispose();
    }
  
    /**
     * Container for debugger panels.
     */
    private _body: SplitPanel;
}

/**
 * The header for the Xircuits Debugger Panel.
 */
 export class DebuggerHeader extends Widget {
    /**
     * Instantiate a new DebuggerHeader.
     */
    constructor(translator?: ITranslator) {
      super({ node: document.createElement('div') });
      this.node.classList.add('jp-stack-panel-header');
  
      translator = translator || nullTranslator;
      const trans = translator.load('jupyterlab');
  
      const title = new Widget({ node: document.createElement('h2') });
      title.node.textContent = trans.__('Xircuits Debugger');
  
      const layout = new PanelLayout();
      layout.addWidget(title);
      this.layout = layout;
    }
}

/**
 * The toolbar for the XircuitsDebugger Panel.
 */
export class DebuggerToolbar extends Widget {
  /**
   * Instantiate a new DebuggerToolbar.
   */
  constructor() {
    super({ node: document.createElement('div') });
    this.node.classList.add('jp-debugger-toolbar-panel');
    const layout = new PanelLayout();
    layout.addWidget(this.toolbar);
    this.layout = layout;
  }

  /**
   * The toolbar for the xircuits debugger.
   */
  readonly toolbar = new Toolbar();
}

/**
 * A namespace for XircuitDebugger `statics`.
 */
export namespace XircuitDebugger {
  /**
   * Instantiation options for `XircuitsDebugger`.
   */
  export interface IOptions extends Panel.IOptions {
    /**
     * The front-end application ..
     */
    app?: JupyterFrontEnd;
    /**
     * The application language translator..
     */
    translator?: ITranslator;
    /**
     * The xircuit factory..
     */
    widgetFactory?: XircuitFactory;
  }
}

/**
 * A namespace for `XircuitsDebugger` statics.
 */
export namespace XircuitsDebugger {
/**
 * The debugger sidebar UI.
 */
  export class Sidebar extends XircuitsDebuggerSidebar {}
}
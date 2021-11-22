import { JupyterFrontEnd } from '@jupyterlab/application';
import { ToolbarButton } from '@jupyterlab/apputils';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { redoIcon } from '@jupyterlab/ui-components';
import { Debugger } from '@jupyterlab/debugger';
import { Panel, SplitPanel, Widget, PanelLayout } from '@lumino/widgets';
import { commandIDs } from '../components/xpipeBodyWidget';
import { BreakpointWidget } from './BreakpointWidget';
import { XpipeFactory } from '../xpipeFactory';
import { Toolbar } from '@jupyterlab/apputils';

export const DebuggerCommandIDs = {
  continue: 'Xpipes-debugger:continue',
  terminate: 'Xpipes-debugger:terminate',
  stepOver: 'Xpipes-debugger:next',
  stepIn: 'Xpipes-debugger:step-in',
  stepOut: 'Xpipes-debugger:step-out',
  evaluate: 'Xpipes-debugger:evaluate-code',
}

/**
 * A Xpipes Debugger sidebar.
 */
 export class XpipesDebuggerSidebar extends Panel {
    /**
     * Instantiate a new XpipeDebugger.Sidebar
     *
     * @param options The instantiation options for a XpipeDebugger.Sidebar
     */
    constructor(options: XpipeDebugger.IOptions) {
      super();
      const translator = options.translator || nullTranslator;
      const app = options.app;
      const xpipeFactory = options.widgetFactory;
      const trans = translator.load('jupyterlab');
      this.id = 'jp-debugger-sidebar';
      this.addClass('jp-DebuggerSidebar');
  
      this._body = new SplitPanel();
      this._body.orientation = 'vertical';
    //   this._body.addClass('jp-DebuggerSidebar-body');
      this.addWidget(this._body);
      const content = new BreakpointWidget( xpipeFactory );
      const header = new DebuggerHeader(translator);
      const toolbarPanel = new DebuggerToolbar();

      /**
       * Create a continue button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xpipes-debugger-continue',
        new ToolbarButton({
          icon: Debugger.Icons.continueIcon,
          onClick: async (): Promise<void> => {
            app.commands.execute(DebuggerCommandIDs.continue);
          },
          tooltip: trans.__('Continue')
        })
      );
      /**
       * Create a next node button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xpipes-debugger-next',
        new ToolbarButton({
          icon: redoIcon,
          onClick: async (): Promise<void> => {
            app.commands.execute(commandIDs.nextNode);
          },
          tooltip: trans.__('Next Node')
        })
      );
      /**
       * Create a step over button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xpipes-debugger-step-over',
        new ToolbarButton({
          icon: Debugger.Icons.stepOverIcon,
          onClick: async (): Promise<void> => {
            app.commands.execute(DebuggerCommandIDs.stepOver);
          },
          tooltip: trans.__('Step Over')
        })
      );
      /**
       * Create a terminate button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xpipes-debugger-terminate',
        new ToolbarButton({
          icon: Debugger.Icons.terminateIcon,
          onClick: async (): Promise<void> => {
            app.commands.execute(DebuggerCommandIDs.terminate);
          },
          tooltip: trans.__('Terminate')
        })
      );
      /**
       * Create a step in button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xpipes-debugger-step-in',
        new ToolbarButton({
          icon: Debugger.Icons.stepIntoIcon,
          onClick: async (): Promise<void> => {
            app.commands.execute(DebuggerCommandIDs.stepIn);
          },
          tooltip: trans.__('Step In')
        })
      );
      /**
       * Create a step out button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xpipes-debugger-step-out',
        new ToolbarButton({
          icon: Debugger.Icons.stepOutIcon,
          onClick: async (): Promise<void> => {
            app.commands.execute(DebuggerCommandIDs.stepOut);
          },
          tooltip: trans.__('Step Out')
        })
      );
      /**
       * Create a evaluate code button toolbar item.
       */
      toolbarPanel.toolbar.addItem(
        'xpipes-debugger-evaluate-code',
        new ToolbarButton({
          icon: Debugger.Icons.evaluateIcon,
          onClick: async (): Promise<void> => {
            app.commands.execute(DebuggerCommandIDs.evaluate);
          },
          tooltip: trans.__('Evaluate Code')
        })
      );

      // Add command signal to continue debugging xpipe
      app.commands.addCommand(DebuggerCommandIDs.continue, {
        execute: args => {
          xpipeFactory.continueDebugSignal.emit(args);
        }
      });
      // Add command signal to toggle next node
      app.commands.addCommand(commandIDs.nextNode, {
        execute: args => {
          xpipeFactory.nextNodeDebugSignal.emit(args);
        }
      });
      // Add command signal to toggle step over 
      app.commands.addCommand(DebuggerCommandIDs.stepOver, {
        execute: args => {
          xpipeFactory.stepOverDebugSignal.emit(args);
        }
      });
      // Add command signal to terminate debugging xpipe
      app.commands.addCommand(DebuggerCommandIDs.terminate, {
        execute: args => {
          xpipeFactory.terminateDebugSignal.emit(args);
        }
      });
      // Add command signal to toggle step in
      app.commands.addCommand(DebuggerCommandIDs.stepIn, {
        execute: args => {
          xpipeFactory.stepInDebugSignal.emit(args);
        }
      });
      // Add command signal to toggle step out
      app.commands.addCommand(DebuggerCommandIDs.stepOut, {
        execute: args => {
          xpipeFactory.stepOutDebugSignal.emit(args);
        }
      });
      // Add command signal to evaluate debugging xpipe
      app.commands.addCommand(DebuggerCommandIDs.evaluate, {
        execute: args => {
          xpipeFactory.evaluateDebugSignal.emit(args);
        }
      });

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
 * The header for the Xpipes Debugger Panel.
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
      title.node.textContent = trans.__('Xpipes Debugger');
  
      const layout = new PanelLayout();
      layout.addWidget(title);
      this.layout = layout;
    }
}

/**
 * The toolbar for the XpipesDebugger Panel.
 */
export class DebuggerToolbar extends Widget {
  /**
   * Instantiate a new DebuggerToolbar.
   */
  constructor() {
    super();
    const layout = new PanelLayout();
    layout.addWidget(this.toolbar);
    this.layout = layout;
  }

  /**
   * The toolbar for the xpipes debugger.
   */
  readonly toolbar = new Toolbar();
}

/**
 * A namespace for XpipeDebugger `statics`.
 */
export namespace XpipeDebugger {
  /**
   * Instantiation options for `XpipesDebugger`.
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
     * The xpipe factory..
     */
    widgetFactory?: XpipeFactory;
  }
}

/**
 * A namespace for `XpipesDebugger` statics.
 */
export namespace XpipesDebugger {
/**
 * The debugger sidebar UI.
 */
  export class Sidebar extends XpipesDebuggerSidebar {}
}
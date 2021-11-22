import { JupyterFrontEnd } from '@jupyterlab/application';
import { MainAreaWidget, ToolbarButton } from '@jupyterlab/apputils';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { redoIcon } from '@jupyterlab/ui-components';
import { Debugger } from '@jupyterlab/debugger';
import { Panel, SplitPanel, Widget, PanelLayout } from '@lumino/widgets';
import { commandIDs } from '../components/xpipeBodyWidget';
import { BreakpointWidget } from './BreakpointWidget';
import { XpipeFactory } from '../xpipeFactory';

export const DebuggerCommandIDs = {
  continue: 'Xpipes-debugger:continue',
  terminate: 'Xpipes-debugger:terminate',
  stepOver: 'Xpipes-debugger:next',
  stepIn: 'Xpipes-debugger:step-in',
  stepOut: 'Xpipes-debugger:step-out',
  evaluate: 'Xpipes-debugger:evaluate-code',
}

/**
 * A xpipe debugger sidebar.
 */
 export class XpipeDebuggerSidebar extends Panel {
    /**
     * Instantiate a new XpipeDebugger.Sidebar
     *
     * @param options The instantiation options for a XpipeDebugger.Sidebar
     */
    constructor(options: Breakpoints.IOptions) {
      super();
      const translator = options.translator || nullTranslator;
      const app = options.app;
      const xpipeFactory = options.widgetFactory;
      this.id = 'jp-debugger-sidebar';
      this.addClass('jp-DebuggerSidebar');
  
      this._body = new SplitPanel();
      this._body.orientation = 'vertical';
    //   this._body.addClass('jp-DebuggerSidebar-body');
      this.addWidget(this._body);
      const content = new BreakpointWidget( xpipeFactory );
      const debuggerToolbar = new MainAreaWidget<BreakpointWidget>({ content });

      /**
       * Create a continue button toolbar item.
       */
      let continueButton = new ToolbarButton({
        icon: Debugger.Icons.continueIcon,
        tooltip: 'Continue',
        onClick: (): void => {
          app.commands.execute(DebuggerCommandIDs.continue);
        }
      });
      /**
         * Create a next node button toolbar item.
         */
       let nextNodeButton = new ToolbarButton({
        icon: redoIcon,
        tooltip: 'Next Node',
        onClick: (): void => {
          app.commands.execute(commandIDs.nextNode);
        }
      });
      /**
       * Create a step over button toolbar item.
       */
       let stepOverButton = new ToolbarButton({
        icon: Debugger.Icons.stepOverIcon,
        tooltip: 'Step Over',
        onClick: (): void => {
          app.commands.execute(DebuggerCommandIDs.stepOver);
        }
      });
      /**
       * Create a terminate button toolbar item.
       */
      let terminateButton = new ToolbarButton({
        icon: Debugger.Icons.terminateIcon,
        tooltip: 'Terminate',
        onClick: (): void => {
          app.commands.execute(DebuggerCommandIDs.terminate);
        }
      });
      /**
       * Create a step in button toolbar item.
       */
      let stepInButton = new ToolbarButton({
        icon: Debugger.Icons.stepIntoIcon,
        tooltip: 'Step In',
        onClick: (): void => {
          app.commands.execute(DebuggerCommandIDs.stepIn);
        }
      });
      /**
       * Create a step out button toolbar item.
       */
      let stepOutButton = new ToolbarButton({
        icon: Debugger.Icons.stepOutIcon,
        tooltip: 'Step Out',
        onClick: (): void => {
          app.commands.execute(DebuggerCommandIDs.stepOut);
        }
      });
      /**
       * Create a evaluate code button toolbar item.
       */
      let evaluateCodeButton = new ToolbarButton({
        icon: Debugger.Icons.evaluateIcon,
        tooltip: 'Evaluate Code',
        onClick: (): void => {
          app.commands.execute(DebuggerCommandIDs.evaluate);
        }
      });

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
      debuggerToolbar.toolbar.insertItem(0, 'xpipe-debug-continue', continueButton)
      debuggerToolbar.toolbar.insertItem(1, 'xpipe-debug-next', nextNodeButton)
      debuggerToolbar.toolbar.insertItem(2, 'xpipe-debug-step-over', stepOverButton)
      debuggerToolbar.toolbar.insertItem(3, 'xpipe-debug-terminate', terminateButton)
      // debuggerToolbar.toolbar.insertItem(4, 'xpipe-debug-step-in', stepInButton)
      // debuggerToolbar.toolbar.insertItem(5, 'xpipe-debug-step-out', stepOutButton)
      // debuggerToolbar.toolbar.insertItem(6, 'xpipe-debug-evaluate-code', evaluateCodeButton)

      const header = new BreakpointHeader(translator);
      this.addWidget(header);
      this.addWidget(debuggerToolbar);
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
 * The header for a Breakpoint Panel.
 */
 export class BreakpointHeader extends Widget {
    /**
     * Instantiate a new BreakpointHeader.
     */
    constructor(translator?: ITranslator) {
      super({ node: document.createElement('div') });
      this.node.classList.add('jp-stack-panel-header');
  
      translator = translator || nullTranslator;
      const trans = translator.load('jupyterlab');
  
      const title = new Widget({ node: document.createElement('h2') });
      title.node.textContent = trans.__('Xpipe Debugger');
  
      const layout = new PanelLayout();
      layout.addWidget(title);
      this.layout = layout;
    }
}

/**
 * A namespace for Breakpoints `statics`.
 */
export namespace Breakpoints {
  /**
   * Instantiation options for `Breakpoints`.
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
 * A namespace for `Debugger` statics.
 */
export namespace XpipeDebugger {
/**
 * The debugger sidebar UI.
 */
  export class Sidebar extends XpipeDebuggerSidebar {}
}
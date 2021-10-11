import { JupyterFrontEnd } from '@jupyterlab/application';
import { MainAreaWidget, ToolbarButton } from '@jupyterlab/apputils';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { redoIcon } from '@jupyterlab/ui-components';

import { Panel, SplitPanel, Widget, PanelLayout } from '@lumino/widgets';
import { commandIDs } from '../components/xpipeBodyWidget';
import { BreakpointWidget } from './BreakpointWidget';
import { XpipeFactory } from '../xpipeFactory';


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
         * Create a next node button toolbar item.
         */
       let nextNodeButton = new ToolbarButton({
        icon: redoIcon,
        tooltip: 'Next Node',
        onClick: (): void => {
          app.commands.execute(commandIDs.nextNode);
        }
      });
      debuggerToolbar.toolbar.insertItem(0, 'xpipe-next-node', nextNodeButton)

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
      title.node.textContent = trans.__('Debugger');
  
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
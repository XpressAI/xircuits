import { JupyterFrontEnd } from "@jupyterlab/application";
import { Widget, DockLayout } from '@lumino/widgets';

export interface IXpipeDebuggerOptions {
    insertMode?: DockLayout.InsertMode;
    ref?: string;
}    

/**
 * Create the xpipe debugger widget at the bottom panel
 */
 export function createXpipeDebugger(
    app: JupyterFrontEnd,
    options?: IXpipeDebuggerOptions
  ): Promise<void> {
    let debuggerWidget = new Widget();
    debuggerWidget.id = 'xpipe-debugger';
    debuggerWidget.title.label = 'Xpipe Debugger';
    debuggerWidget.title.closable = true;

    var main_strip = document.createElement("div");
    main_strip.id = "bottom_main_strip";
    var navbar = document.createElement("div");
            var left = document.createElement("ul");
            left.id = "bottom_navbar_left";
                    var projects = document.createElement("li");
                    projects.textContent = 'Not yet implemented!';
            left.appendChild(projects);
    navbar.appendChild(left);
    main_strip.appendChild(navbar);
    debuggerWidget.node.appendChild(main_strip);

    debuggerWidget.disposed.connect(() => {
    debuggerWidget = null;
    app.commands.notifyCommandChanged();
    });
    app.shell.add(debuggerWidget, 'down',{
    ref: options.ref,
    mode: options.insertMode
    });
    app.shell.activateById(debuggerWidget.id);

    debuggerWidget.update();
    app.commands.notifyCommandChanged();
    
    return Promise.resolve();
}
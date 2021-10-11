import { JupyterFrontEnd } from "@jupyterlab/application";
import { Widget, DockLayout } from '@lumino/widgets';

export interface IXpipeAnalysisViewerOptions {
    insertMode?: DockLayout.InsertMode;
    ref?: string;
}    

/**
 * Create the xpipe analysis viewer widget at the main bottom panel
 */
 export function createXpipeAnalysisViewer(
    app: JupyterFrontEnd,
    options?: IXpipeAnalysisViewerOptions
  ): Promise<void> {
    let analysisWidget = new Widget();
    analysisWidget.id = 'xpipe-analysis';
    analysisWidget.title.label = 'Xpipe Analysis Viewer';
    analysisWidget.title.closable = true;

    var main_strip = document.createElement("div");
    main_strip.id = "bottom_main_strip";
    var navbar = document.createElement("div");
            var left = document.createElement("ul");
            left.id = "bottom_navbar_left";
                    var projects = document.createElement("li");
                    projects.textContent = 'The xpipe analysis viewer will be displayed here';
            left.appendChild(projects);
    navbar.appendChild(left);
    main_strip.appendChild(navbar);
    analysisWidget.node.appendChild(main_strip);

    analysisWidget.disposed.connect(() => {
    analysisWidget = null;
    app.commands.notifyCommandChanged();
    });
    app.shell.add(analysisWidget, 'main',{ 
        mode: 'split-bottom',
        activate: false} );
    app.shell.activateById(analysisWidget.id);

    analysisWidget.update();
    app.commands.notifyCommandChanged();
    
    return Promise.resolve();
}
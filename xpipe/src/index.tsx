import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

//import { WidgetTracker, IWidgetTracker } from '@jupyterlab/apputils';

import { Token } from '@lumino/coreutils';

// import { ExampleWidgetFactory, ExampleDocModelFactory } from './counter-factory';

// import { ExampleDocWidget } from './counter-widget';

//import { ExampleWidgetFactory, ExampleDocModelFactory } from './xpipe-factory';

//import { ExampleDocWidget } from './xpipe-widget';

import { XpipeFactory } from './xpipeFactory';

import { XpipeWidget } from './xpipeWidget';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { commandIDs } from './components/xpipeBodyWidget';


import {
  ICommandPalette,
  IThemeManager,
  WidgetTracker,
  ReactWidget
} from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

/**
 * The name of the factory that creates editor widgets.
 */
const FACTORY = 'Xpipe Factory';
import { DocumentWidget } from '@jupyterlab/docregistry';

import React from 'react';

import Sidebar from './components_xpipe/Sidebar';

// Export a token so other extensions can require it
// export const IExampleDocTracker = new Token<IWidgetTracker<ExampleDocWidget>>(
//   'exampleDocTracker'
// );

/**
 * Initialization data for the documents extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'xpipe',
  autoStart: true,
  requires: [
    ICommandPalette,
    ILauncher,
    IFileBrowserFactory,
    ILayoutRestorer,
    IMainMenu
  ],
  //provides: IExampleDocTracker,
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    launcher: ILauncher,
    browserFactory: IFileBrowserFactory,
    restorer: ILayoutRestorer,
    menu: IMainMenu,
    themeManager?: IThemeManager
  ) => {

    console.log('Xpipe is activated!');
    const widget = ReactWidget.create(<Sidebar />);
    widget.id = 'xpipe-component-sidebar';
    widget.title.iconClass = 'jp-SidebarLogo';

    restorer.add(widget, widget.id);
    app.shell.add(widget, "left");

    // Creating the widget factory to register it so the document manager knows about
    // our new DocumentWidget
    const xpipeFactory = new XpipeFactory({
      name: FACTORY,
      fileTypes: ['xpipe'],
      defaultFor: ['xpipe'],
      shell: app.shell,
      commands: app.commands,
      browserFactory: browserFactory,
      serviceManager: app.serviceManager
    });

    // register the filetype
    app.docRegistry.addFileType({
      name: 'xpipe',
      displayName: 'Xpipe',
      extensions: ['.xpipe'],
    });

    // Registering the widget factory
    app.docRegistry.addWidgetFactory(xpipeFactory);

    const tracker = new WidgetTracker<DocumentWidget>({
      namespace: "Xpipe Tracker"
    });


    // Add the widget to the tracker when it's created
    xpipeFactory.widgetCreated.connect((sender, widget) => {
      // Notify the instance tracker if restore data needs to update.
      void tracker.add(widget);

      // Notify the widget tracker if restore data needs to update
      widget.context.pathChanged.connect(() => {
        void tracker.save(widget);
      });
    });


    // Handle state restoration
    void restorer.restore(tracker, {
      command: commandIDs.openDocManager,
      args: widget => ({
        path: widget.context.path,
        factory: FACTORY
      }),
      name: widget => widget.context.path
    });



  },
};

export default extension;
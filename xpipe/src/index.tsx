import React from 'react';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import { Token } from '@lumino/coreutils';

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


import { XpipeFactory, XPipeDocModelFactory } from './xpipeFactory';

import { XPipeWidget } from './xpipeWidget';

import Sidebar from './components_xpipe/Sidebar';

const FACTORY = 'Xpipe Factory';

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

    const sidebarwidget = ReactWidget.create(<Sidebar />);
    sidebarwidget.id = 'xpipe-component-sidebar';
    sidebarwidget.title.iconClass = 'jp-SidebarLogo';

    restorer.add(sidebarwidget, sidebarwidget.id);
    app.shell.add(sidebarwidget, "left");

    // Creating the widget factory to register it so the document manager knows about
    // our new DocumentWidget
    const widgetFactory = new XpipeFactory({
      name: FACTORY,
      modelName: 'xpipe-model',
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
    app.docRegistry.addWidgetFactory(widgetFactory);
    
    const tracker = new WidgetTracker<XPipeWidget>({
      namespace: "Xpipe Tracker"
    });


    // Add the widget to the tracker when it's created
    widgetFactory.widgetCreated.connect((sender, widget) => {
      // Notify the instance tracker if restore data needs to update.
      void tracker.add(widget);

      // Notify the widget tracker if restore data needs to update
      widget.context.pathChanged.connect(() => {
        void tracker.save(widget);
      });
    });

    // Creating and registering the model factory for our custom DocumentModel
    const modelFactory = new XPipeDocModelFactory();
    app.docRegistry.addModelFactory(modelFactory);

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
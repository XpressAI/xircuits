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

const FACTORY = 'Xpipe editor';

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

    // Creating the sidebar widget
    const sidebarWidget = ReactWidget.create(<Sidebar />);
    sidebarWidget.id = 'xpipe-component-sidebar';
    sidebarWidget.title.iconClass = 'jp-XpipeLogo';

    restorer.add(sidebarWidget, sidebarWidget.id);
    app.shell.add(sidebarWidget, "left");

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
      iconClass: 'jp-XpipeLogo'
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

    // Add command signal to save xpipe
    app.commands.addCommand(commandIDs.saveXpipe, {
      execute: args => {
        widgetFactory.saveXpipeSignal.emit(args);
      }
    });

    // Add command signal to reload xpipe
    app.commands.addCommand(commandIDs.reloadXpipe, {
      execute: args => {
        widgetFactory.reloadXpipeSignal.emit(args);
      }
    });

    // Add command signal to revert xpipe
    app.commands.addCommand(commandIDs.revertXpipe, {
      execute: args => {
        widgetFactory.revertXpipeSignal.emit(args);
      }
    });

    // Add command signal to compile xpipe
    app.commands.addCommand(commandIDs.compileXpipe, {
      execute: args => {
        widgetFactory.compileXpipeSignal.emit(args);
      }
    });

    // Add command signal to run xpipe
    app.commands.addCommand(commandIDs.runXpipe, {
      execute: args => {
        widgetFactory.runXpipeSignal.emit(args);
      }
    });

    // Add command signal to debug xpipe
    app.commands.addCommand(commandIDs.debugXpipe, {
      execute: args => {
        widgetFactory.debugXpipeSignal.emit(args);
      }
    });

    // Add a command for creating a new xpipe file.
    app.commands.addCommand(commandIDs.createNewXpipe, {
      label: 'Xpipe File',
      iconClass: 'jp-XpipeLogo',
      caption: 'Create a new xpipe file',
      execute: () => {
        app.commands
          .execute(commandIDs.newDocManager, {
            path: browserFactory.defaultBrowser.model.path,
            type: 'file',
            ext: '.xpipe'
          })
          .then(model =>
            app.commands.execute(commandIDs.openDocManager, {
              path: model.path,
              factory: FACTORY
            })
          );
      }
    });

    // Add a launcher item if the launcher is available.
    if (launcher) {
      launcher.add({
        command: commandIDs.createNewXpipe,
        rank: 1,
        category: 'Other'
      });
    }
  },
};

export default extension;
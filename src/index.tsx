import React from 'react';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { commandIDs } from './components/xircuitBodyWidget';
import {
  WidgetTracker,
  ReactWidget
} from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { XircuitFactory } from './xircuitFactory';
import Sidebar from './tray_library/Sidebar';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { XircuitsDebugger } from './debugger/SidebarDebugger';
import { ITranslator } from '@jupyterlab/translation';
import { Log, logPlugin } from './log/LogPlugin';
import { requestAPI } from './server/handler';
import { OutputPanel } from './kernel/panel';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { DocumentWidget } from '@jupyterlab/docregistry';

const FACTORY = 'Xircuits editor';

/**
 * Initialization data for the documents extension.
 */
const xircuits: JupyterFrontEndPlugin<void> = {
  id: 'xircuits',
  autoStart: true,
  requires: [
    ILauncher,
    IFileBrowserFactory,
    ILayoutRestorer,
    IRenderMimeRegistry,
    IDocumentManager,
    ITranslator
  ],

  activate: async (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    browserFactory: IFileBrowserFactory,
    restorer: ILayoutRestorer,
    rendermime: IRenderMimeRegistry,
    docmanager: IDocumentManager,
    translator?: ITranslator
  ) => {

    console.log('Xircuits is activated!');

    // Creating the widget factory to register it so the document manager knows about
    // our new DocumentWidget
    const widgetFactory = new XircuitFactory({
      name: FACTORY,
      fileTypes: ['xircuits'],
      defaultFor: ['xircuits'],
      app: app,
      shell: app.shell,
      commands: app.commands,
      serviceManager: app.serviceManager
    });

    // register the filetype
    app.docRegistry.addFileType({
      name: 'xircuits',
      displayName: 'Xircuits',
      extensions: ['.xircuits'],
      iconClass: 'jp-XircuitLogo'
    });

    // Registering the widget factory
    app.docRegistry.addWidgetFactory(widgetFactory);

    const tracker = new WidgetTracker<DocumentWidget>({
      namespace: "Xircuits Tracker"
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

    // Handle state restoration
    void restorer.restore(tracker, {
      command: commandIDs.openDocManager,
      args: widget => ({
        path: widget.context.path,
        factory: FACTORY
      }),
      name: widget => widget.context.path
    });
    
    // Creating the sidebar widget for the xai components
    const sidebarWidget = ReactWidget.create(<Sidebar lab={app}/>);
    sidebarWidget.id = 'xircuits-component-sidebar';
    sidebarWidget.title.iconClass = 'jp-ComponentLibraryLogo';
    sidebarWidget.title.caption = "Xircuits Component Library";

    restorer.add(sidebarWidget, sidebarWidget.id);
    app.shell.add(sidebarWidget, "left");

    // Creating the sidebar debugger
    const sidebarDebugger = new XircuitsDebugger.Sidebar({ app, translator, widgetFactory })
    sidebarDebugger.id = 'xircuits-debugger-sidebar';
    sidebarDebugger.title.iconClass = 'jp-DebuggerLogo';
    sidebarDebugger.title.caption = "Xircuits Debugger";
    restorer.add(sidebarDebugger, sidebarDebugger.id);
    app.shell.add(sidebarDebugger, 'right', { rank: 1001 });

    // Add a command to open xircuits sidebar debugger
    app.commands.addCommand(commandIDs.openDebugger, {
      execute: () => {
        if (sidebarDebugger.isHidden) {
          app.shell.activateById(sidebarDebugger.id);
        }
      },
    });

    // Add a command for creating a new xircuits file.
    app.commands.addCommand(commandIDs.createNewXircuit, {
      label: 'Xircuits File',
      iconClass: 'jp-XircuitLogo',
      caption: 'Create a new xircuits file',
      execute: () => {
        app.commands
          .execute(commandIDs.newDocManager, {
            path: browserFactory.defaultBrowser.model.path,
            type: 'file',
            ext: '.xircuits'
          })
          .then(async model => {
            const newWidget = await app.commands.execute(
              commandIDs.openDocManager,
              {
                path: model.path,
                factory: FACTORY
              }
            );
            newWidget.context.ready.then(() => {
              app.commands.execute(commandIDs.saveXircuit, {
                path: model.path
              });
            });
          });
      }
    });

    async function requestToGenerateArbitraryFile(path: string, pythonScript: string) {
      const dataToSend = { "currentPath": path.split(".xircuits")[0] + ".py", "compilePythonScript": pythonScript };

      try {
        const server_reply = await requestAPI<any>('file/generate', {
          body: JSON.stringify(dataToSend),
          method: 'POST',
        });

        return server_reply;
      } catch (reason) {
        console.error(
          `Error on POST /xircuits/file/generate ${dataToSend}.\n${reason}`
        );
      }
    };

    app.commands.addCommand(commandIDs.createArbitraryFile, {
      execute: async args => {
        const current_path = tracker.currentWidget.context.path;
        const path = current_path;
        const message = typeof args['pythonCode'] === undefined ? '' : (args['pythonCode'] as string);
        const showOutput = typeof args['showOutput'] === undefined ? false : (args['showOutput'] as boolean);
        const request = await requestToGenerateArbitraryFile(path, message); // send this file and create new file

        if (request["message"] == "completed") {
          const model_path = current_path.split(".xircuits")[0] + ".py";
          await app.commands.execute(
            commandIDs.openDocManager,
            {
              path: model_path
            }
          );
          docmanager.closeFile(model_path);
          if (showOutput) {
            alert(`${model_path} successfully compiled!`);
          }
        } else {
          alert("Failed to generate arbitrary file!");
        }
      }
    });

    let outputPanel: OutputPanel;
    /**
      * Creates a output panel.
      *
      * @returns The panel
      */
    async function createPanel(): Promise<OutputPanel> {
      outputPanel = new OutputPanel(app.serviceManager, rendermime, widgetFactory, translator);
      app.shell.add(outputPanel, 'main', {
        mode: 'split-bottom'
      });
      return outputPanel;
    }

    async function requestToSparkSubmit(path: string, addArgs: string) {
      const dataToSend = { "currentPath": path, "addArgs": addArgs };

      try {
        const server_reply = await requestAPI<any>('spark/submit', {
          body: JSON.stringify(dataToSend),
          method: 'POST',
        });

        return server_reply;
      } catch (reason) {
        console.error(
          `Error on POST /xircuits/spark/submit ${dataToSend}.\n${reason}`
        );
      }
    };

    // Execute xircuits python script and display at output panel
    app.commands.addCommand(commandIDs.executeToOutputPanel, {
      execute: async args => {
        const xircuitsLogger = new Log(app);
        const current_path = tracker.currentWidget.context.path;
        const model_path = current_path.split(".xircuits")[0] + ".py";
        const message = typeof args['runCommand'] === 'undefined' ? '' : (args['runCommand'] as string);
        const debug_mode = typeof args['debug_mode'] === 'undefined' ? '' : (args['debug_mode'] as string);
        const runType = typeof args['runType'] === 'undefined' ? '' : (args['runType'] as string);
        const addArgs = typeof args['addArgsSparkSubmit'] === 'undefined' ? '' : (args['addArgsSparkSubmit'] as string);

        // Create the panel if it does not exist
        if (!outputPanel || outputPanel.isDisposed) {
          await createPanel();
        } else {
          outputPanel.dispose();
          await createPanel();
        }

        outputPanel.session.ready.then(async () => {
          let code = "%run " + model_path + message + debug_mode;

          // Run spark submit when run type is Spark Submit
          if (runType == 'spark-submit') {
            const request = await requestToSparkSubmit(model_path, addArgs);
            const errorMsg = request["stderr"];
            const outputMsg = request["stdout"];
            let msg = "";

            // Display the errors if there no output
            if (outputMsg != 0) {
              msg = outputMsg;
            } else {
              msg = errorMsg;
            }

            // Display the multi-line message
            const outputCode = `"""${msg}"""`;
            code = `print(${outputCode})`;
          }

          outputPanel.execute(code, xircuitsLogger);
        });
      },
    });

    // Add command signal to save xircuits
    app.commands.addCommand(commandIDs.saveXircuit, {
      execute: args => {
        widgetFactory.saveXircuitSignal.emit(args);
      }
    });

    // Add command signal to compile xircuits
    app.commands.addCommand(commandIDs.compileXircuit, {
      execute: args => {
        widgetFactory.compileXircuitSignal.emit(args);
      }
    });

    // Add command signal to run xircuits
    app.commands.addCommand(commandIDs.runXircuit, {
      execute: args => {
        widgetFactory.runXircuitSignal.emit(args);
      }
    });

    // Add command signal to debug xircuits
    app.commands.addCommand(commandIDs.debugXircuit, {
      execute: args => {
        widgetFactory.debugXircuitSignal.emit(args);
      }
    });

    // Add command signal to lock xircuits
    app.commands.addCommand(commandIDs.lockXircuit, {
      execute: args => {
        widgetFactory.lockNodeSignal.emit(args);
      }
    });

    // Add command signal to test xircuits
    app.commands.addCommand(commandIDs.testXircuit, {
      execute: args => {
        widgetFactory.testXircuitSignal.emit(args);
      }
    });

    // Add a launcher item if the launcher is available.
    if (launcher) {
      launcher.add({
        command: commandIDs.createNewXircuit,
        rank: 1,
        category: 'Other'
      });
    }
  },
};

/**
 * Export the plugins as default.
 */
const plugins: JupyterFrontEndPlugin<any>[] = [
  xircuits,
  logPlugin
];

export default plugins;

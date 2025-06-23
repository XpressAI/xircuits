import React from 'react';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import {
  WidgetTracker,
  ReactWidget,
  IWidgetTracker
} from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { XircuitsFactory } from './XircuitsFactory';
import Sidebar from './tray_library/Sidebar';
import { IDocumentManager, renameDialog } from '@jupyterlab/docmanager';
import { ITranslator } from '@jupyterlab/translation';
import { Log, logPlugin } from './log/LogPlugin';
import { requestAPI } from './server/handler';
import { OutputPanel } from './kernel/panel';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { runIcon, saveIcon } from '@jupyterlab/ui-components';
import { addNodeActionCommands } from './commands/NodeActionCommands';
import { addLibraryActionCommands } from './commands/LibraryActionCommands';
import { Token } from '@lumino/coreutils';
import { DockLayout } from '@lumino/widgets';
import { xircuitsIcon, componentLibIcon, changeFavicon, xircuitsFaviconLink } from './ui-components/icons';
import { createInitXircuits } from './helpers/CanvasInitializer';
import { addHelpResources } from './helpers/HelpResources';
import type { CommandRegistry } from "@lumino/commands/src";
import type { Signal } from "@lumino/signaling";
import { commandIDs } from "./commands/CommandIDs";
import { IEditorTracker } from '@jupyterlab/fileeditor';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { handleInstall } from './context-menu/TrayContextMenu';

const FACTORY = 'Xircuits editor';

// Export a token so other extensions can require it
export const IXircuitsDocTracker = new Token<IWidgetTracker<DocumentWidget>>(
  'xircuitsDocTracker'
);

/**
 * A class that tracks xircuits widgets.
 */
 export interface IXircuitsDocTracker
 extends IWidgetTracker<DocumentWidget> {}

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
    IMainMenu,
    ITranslator,
    IEditorTracker,
  ],
  provides: IXircuitsDocTracker,
  activate: async (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    browserFactory: IFileBrowserFactory,
    restorer: ILayoutRestorer,
    rendermime: IRenderMimeRegistry,
    docmanager: IDocumentManager,
    mainMenu?: IMainMenu,
    translator?: ITranslator,
    editorTracker?: IEditorTracker,
  ) => {

    console.log('Xircuits is activated!');

    // Creating the widget factory to register it so the document manager knows about
    // our new DocumentWidget
    const widgetFactory = new XircuitsFactory({
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
      icon: xircuitsIcon
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
    
    // Find the MainLogo widget in the shell and replace it with the Xircuits Logo
    const widgets = app.shell.widgets('top');
    let widgetIterator = widgets.next();
    
    while (!widgetIterator.done) {
      const widget = widgetIterator.value;
    
      if (widget.id === 'jp-MainLogo') {
        xircuitsIcon.element({
          container: widget.node,
          elementPosition: 'center',
          height: 'auto',
          width: '25px'
        });
        break;
      }
    
      widgetIterator = widgets.next();
    }

    // Change the favicon
    changeFavicon(xircuitsFaviconLink);

    // Creating the sidebar widget for the xai components
    const sidebarWidget = ReactWidget.create(<Sidebar app={app} factory={widgetFactory}/>);
    sidebarWidget.id = 'xircuits-component-sidebar';
    sidebarWidget.title.icon = componentLibIcon;
    sidebarWidget.title.caption = "Xircuits Component Library";

    restorer.add(sidebarWidget, sidebarWidget.id);
    app.shell.add(sidebarWidget, "left");

    // Additional commands for node action
    addNodeActionCommands(app, tracker, translator);

    // Additional commands for chat actions
    addLibraryActionCommands(app, tracker, translator, widgetFactory);

    // Additional main menu options for help resources
    addHelpResources(app, mainMenu, translator);

    // Commands to emit WidgetFactory signals
    const emitSignal = (signal: Signal<unknown, unknown>) =>  (args: unknown) => signal.emit(args);
    const signalConnections: [string, CommandRegistry.ICommandOptions][] = [
      [commandIDs.saveXircuit,
        {label: "Save", icon: saveIcon, execute: emitSignal(widgetFactory.saveXircuitSignal)}],
      [commandIDs.runXircuit,
        {label: "Run Xircuits", icon: runIcon, execute: emitSignal(widgetFactory.runXircuitSignal)}],
      [commandIDs.compileXircuit,
        {execute: emitSignal(widgetFactory.compileXircuitSignal)}],
      [commandIDs.fetchRemoteRunConfig,
        {execute: emitSignal(widgetFactory.fetchRemoteRunConfigSignal)}],
      [commandIDs.lockXircuit,
        {execute: emitSignal(widgetFactory.lockNodeSignal)}],
      [commandIDs.triggerCanvasUpdate,
        {execute: emitSignal(widgetFactory.triggerCanvasUpdateSignal)}],
      [commandIDs.triggerLoadingAnimation,
        {execute: emitSignal(widgetFactory.triggerLoadingAnimationSignal)}],
      [commandIDs.reloadAllNodes,
        {execute: emitSignal(widgetFactory.reloadAllNodesSignal)}],
      [commandIDs.toggleAllLinkAnimation,
        {execute: emitSignal(widgetFactory.toggleAllLinkAnimationSignal)}],
      [commandIDs.toggleLightMode,
        {execute: emitSignal(widgetFactory.toggleLightModeSignal)}]
    ]
    signalConnections.forEach(([cmdId, def]) => app.commands.addCommand(cmdId, def))


    // Add a command for creating a new xircuits file.
    app.commands.addCommand(commandIDs.createNewXircuit, {
      label: (args) => (args['isLauncher'] ? 'New Xircuits File' : 'Create New Xircuits'),
      icon: xircuitsIcon,
      caption: 'Create a new xircuits file',
      execute: async () => {
        const currentBrowser = browserFactory.tracker.currentWidget;
        if (!currentBrowser) {
          console.error("No active file browser found.");
          return;
        }
        const model = await app.commands
          .execute(commandIDs.newDocManager, {
            path: currentBrowser.model.path,
            type: "file",
            ext: ".xircuits"
          });

          // get init SRD json
          const fileContent = createInitXircuits(app, app.shell);

          // Use the document manager to write to the file
          await app.serviceManager.contents.save(model.path, {
            type: 'file',
            format: 'text',
            content: fileContent
          });

        await app.commands.execute(
          commandIDs.openDocManager,
          {
            path: model.path,
            factory: FACTORY
          }
        );
      }
    });

    async function requestToGenerateCompileFile(path: string, python_paths: any) {
      const data = {
        "outPath": path.split(".xircuits")[0] + ".py",
        "filePath": path,
        "pythonPaths": python_paths
      };

      try {
        return await requestAPI<any>('file/compile-recursive', {
          body: JSON.stringify(data),
          method: 'POST',
        });

      } catch (reason) {
        console.error(
          'Error on POST /xircuits/file/compile-recursive', data, reason
        );
      }
    }

    async function compileXircuitsFile(path: string, pythonPaths: any = {}): Promise<boolean> {
      try {
        const request = await requestToGenerateCompileFile(path, pythonPaths);
        if (request["message"] == "completed") {
          const modelPath = path.split(".xircuits")[0] + ".py";
          docmanager.closeFile(modelPath);

          if (modelPath.startsWith("xai_components/")) {
            console.info(`File ${modelPath} changed. Reloading components...`);
            await app.commands.execute(commandIDs.refreshComponentList);
          }
          return true;
        } else {
          console.log(request["message"]);
          return false;
        }
      } catch (err) {
        console.error(`Error compiling Xircuits file: ${path}`, err);
        return false;
      }
    }
   
    app.commands.addCommand(commandIDs.compileFile, {
      execute: async args => {
        const path = tracker.currentWidget.context.path;
   
        const pythonPaths = {};
        (args['componentList'] === undefined ? [] : args['componentList'] as []).filter(it => it['python_path']).forEach(it => {
          pythonPaths[it['name']] = it['python_path']
        });
   
        return await compileXircuitsFile(path, pythonPaths);
      }
    });
   

    // Auto-reload components when a component file changes
    editorTracker.widgetAdded.connect((sender, widget) => {
      const context = widget.context;

      if (context.path.endsWith('.py')) {
        context.fileChanged.connect(async () => {
          if(context.path.startsWith("xai_components/")){
            console.info(`File ${context.path} changed. Reloading components...`);
            await app.commands.execute(commandIDs.refreshComponentList);
          }
        });
      }

      if (context.path.endsWith('config.ini')) {
        context.fileChanged.connect(async () => {
          if(context.path.startsWith(".xircuits/")){
            await app.commands.execute(commandIDs.fetchRemoteRunConfig);
          }
        });
      }
    });

    let outputPanel: OutputPanel;
    /**
      * Creates a output panel.
      *
      * @returns The panel
      */
    async function createPanel(): Promise<OutputPanel> {
      let splitMode: DockLayout.InsertMode = 'split-bottom' as DockLayout.InsertMode; // default value
        
      try {
        const data = await requestAPI<any>('config/split_mode');
          splitMode = data.splitMode as DockLayout.InsertMode;
      } catch (err) {
        console.error('Error fetching split mode from server:', err);
      }
        
      outputPanel = new OutputPanel(app.serviceManager, rendermime, widgetFactory, translator);
      app.shell.add(outputPanel, 'main', { mode: splitMode });
      return outputPanel;
    }

    // Dispose the output panel when closing browser or tab
    window.addEventListener('beforeunload', function (e) {
      outputPanel.dispose();
    });

    // Execute command and display at output panel
    app.commands.addCommand(commandIDs.executeToOutputPanel, {
      execute: async args => {
        const xircuitsLogger = new Log(app);

        // Create the panel if it does not exist
        if (!outputPanel || outputPanel.isDisposed) {
          await createPanel();
        }
    
        outputPanel.session.ready.then(async () => {
          const code = args['code'] as string;
          outputPanel.execute(code, xircuitsLogger);
        });
      },
    });

    app.commands.addCommand(commandIDs.executeToTerminal, {
      label: 'Run in Terminal',
      execute: async args => {
        const command = args['command']; // Can be a string or an array
    
        const terminalWidget = await app.commands.execute('terminal:create-new');
        app.shell.add(terminalWidget, 'main', { mode: 'split-bottom' });
        const terminalSession = terminalWidget.content.session;

        return new Promise((resolve) => {
          let currentTerminalContent = "";
          terminalSession.messageReceived.connect((sender, message) => {
            for (let contentElement of message.content) {
              currentTerminalContent += contentElement;
            }
            if(currentTerminalContent.includes("ready to use.")){
              terminalSession.shutdown();
              resolve('Execution done.');
            }
          })

          if (Array.isArray(command)) {
            for (const cmd of command) {
              terminalSession.send({ type: 'stdin', content: [cmd + '\n'] });
            }
          } else if (typeof command === 'string') {
            terminalSession.send({ type: 'stdin', content: [command + '\n'] });
          } else {
            console.error('Invalid command type. Must be a string or an array of strings.');
          }
          })
        }
    });
    
    // Add a command for compiling a xircuits file from the file browser context menu.
    app.commands.addCommand(commandIDs.compileWorkflowFromFileBrowser, {
      label: 'Compile Xircuits',
      icon: xircuitsIcon,
      isVisible: () => {
        // Ensure that the command only shows for xircuits files
        return [...browserFactory.tracker.currentWidget.selectedItems()]
          .filter(item => item.type === 'file' && item.path.endsWith('.xircuits'))
          .length > 0;
      },
      execute: async () => {
        const selectedItems = Array.from(browserFactory.tracker.currentWidget.selectedItems());

        // Iterate through selected items and compile each one
        for (const xircuitsFile of selectedItems) {
          if (xircuitsFile.path.endsWith('.xircuits')) {
            await compileXircuitsFile(xircuitsFile.path);
          }
        }
        browserFactory.tracker.currentWidget.model.refresh();
      }
    });


    app.commands.addCommand(commandIDs.copyXircuitsToRoot, {
      label: 'Copy To Root Directory',
      isVisible: () => {
        const selectedItems = [...browserFactory.tracker.currentWidget.selectedItems()];
        // Only show if at least one file's path contains a slash (i.e. not in root)
        return selectedItems.some(item => item.path.indexOf('/') !== -1);
      },
      icon: xircuitsIcon,
      execute: async () => {
        const selectedItems = Array.from(browserFactory.tracker.currentWidget.selectedItems());
    
        for (const xircuitsFile of selectedItems) {
          const path = xircuitsFile.path;
          const fileName = path.split('/').pop();
          const rootPath = `/${fileName}`;
    
          try {
            await app.serviceManager.contents.copy(path, rootPath);
            await app.commands.execute('filebrowser:go-to-path', { path: '/' });
    
            // Open the file if needed, then prompt for renaming
            const openedWidget = await app.commands.execute(commandIDs.openDocManager, { path: rootPath, factory: FACTORY });
            const fileContext = docmanager.contextForWidget(openedWidget);
            if (fileContext) {
              await renameDialog(docmanager, fileContext);
            }
          } catch (err) {
            if (err.response && err.response.status === 400) {
              alert(`Error: The file '${fileName}' already exists in the root directory.`);
            } else {
              alert(`Error copying file '${fileName}': ${err.message || err}`);
            }
          }
        }
      }
    });

    app.commands.addCommand(commandIDs.runXircuitsFileFromFileBrowser, {
      label: 'Run Xircuits',
      icon: xircuitsIcon,
      isVisible: () => {
        return [...browserFactory.tracker.currentWidget.selectedItems()]
          .filter(item => item.type === 'file' && item.path.endsWith('.xircuits'))
          .length > 0;
      },
      execute: async () => {
        const selectedItems = Array.from(browserFactory.tracker.currentWidget.selectedItems());
        for (const xircuitsFile of selectedItems) {
          if (xircuitsFile.path.endsWith('.xircuits')) {
            await app.commands.execute(commandIDs.executeToTerminal, {
              command: `xircuits run ${xircuitsFile.path}`
            });
          }
        }
      }
    });

    // Add the commands to the context menu of the file browser
    app.contextMenu.addItem({
      command: commandIDs.compileWorkflowFromFileBrowser,
      selector: '.jp-DirListing-item[data-file-type="xircuits"]',
      rank: 0
    });

    app.contextMenu.addItem({
      command: commandIDs.runXircuitsFileFromFileBrowser,
      selector: '.jp-DirListing-item[data-file-type="xircuits"]',
      rank: 0
    });

    app.contextMenu.addItem({
      command: commandIDs.copyXircuitsToRoot,
      selector: '.jp-DirListing-item[data-file-type="xircuits"]',
      rank: 0
    });

    // Add a separator after Xircuits commands
    app.contextMenu.addItem({
      type: 'separator',
      selector: '.jp-DirListing-item[data-file-type="xircuits"]',
      rank: 0
    });

    // Add a command for creating a new Xircuits file when nothing is selected
    app.commands.addCommand(commandIDs.createNewXircuitInCurrentDir, {
      label: 'New Xircuits File',
      icon: xircuitsIcon,
      caption: 'Create a new Xircuits file in the current directory',
      execute: async () => {
        const currentBrowser = browserFactory.tracker.currentWidget;
        if (!currentBrowser) {
          console.error("No active file browser found.");
          return;
        }

        // Use the docmanager command to generate a new file with an incremented name
        const model = await app.commands.execute(commandIDs.newDocManager, {
          path: currentBrowser.model.path,
          type: "file",
          ext: ".xircuits"
        });

        // Create the default Xircuits graph (SRD JSON)
        const fileContent = createInitXircuits(app, app.shell);

        // Save the new file with Xircuits default content
        await app.serviceManager.contents.save(model.path, {
          type: 'file',
          format: 'text',
          content: fileContent
        });

        // Open the newly created Xircuits file in the editor
        await app.commands.execute(commandIDs.openDocManager, {
          path: model.path,
          factory: FACTORY
        });
      }
    });

    // Add the command to the file browser context menu when nothing is selected
    app.contextMenu.addItem({
      command: commandIDs.createNewXircuitInCurrentDir,
      selector: '.jp-DirListing-content',
      rank: 0
    });

    app.commands.addCommand(commandIDs.openXircuitsConfiguration, {
      label: 'Open Xircuits Configurations',
      icon: xircuitsIcon,
      execute: async () => {
        const configPath = `.xircuits/config.ini`;
        try {
          // Check if the file exists first
          await app.serviceManager.contents.get(configPath);
          // If we reach here, the file exists, so we can try to open it
          await docmanager.openOrReveal(configPath);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            alert('Xircuits configuration file not found. Check if it exists or enable hidden files when you launch Jupyter Lab.');
          } else {
            alert(`Error accessing Xircuits configuration: ${error.message}`);
          }
        }
      }
    });

    mainMenu.settingsMenu.addGroup([
      {
        command: commandIDs.openXircuitsConfiguration,
      },
    ], -1);

    // Add a launcher item if the launcher is available.
    if (launcher) {
      launcher.add({
        command: commandIDs.createNewXircuit,
        rank: 1,
        args: { isLauncher: true },
        category: 'Xircuits Templates'
      });
    }

    async function getInstalledLibraries(): Promise<Set<string>> {
      try {
        const result = await requestAPI<any>('library/get_config', {
          method: 'GET'
        });

        return new Set<string>(
          result.config.libraries
            .filter((lib: any) => lib.status === 'installed' && typeof lib.name === 'string')
            .map((lib: any) => lib.name)
        );
      } catch (err) {
        console.error('Failed to load library config via API:', err);
        return new Set();
      }
    }

    function registerTemplateButton(
      id: string,
      label: string,
      examplePath: string,
      libraries: string[],
      rank = 1
    ) {
      app.commands.addCommand(id, {
        label: label,
        caption: `Install ${libraries.join(', ')} and open the example`,
        icon: xircuitsIcon,
        execute: async () => {
          const currentPath = browserFactory.tracker.currentWidget?.model.path ?? '';
          const installedLibs = await getInstalledLibraries();

          for (const lib of libraries) {
            if (installedLibs.has(lib)) {
              console.log(`Library ${lib} already installed. Skipping.`);
              continue;
            }

            const ok = await handleInstall(app, lib, () =>
              app.commands.execute(commandIDs.refreshComponentList)
            );

              if (!ok) {
                console.warn(`Aborted: ${lib} not installed.`);
                return;
              }
            installedLibs.add(lib);
            }

          const model = await app.serviceManager.contents.copy(
            examplePath,
            currentPath || ''          
          );

          const finalPath = model.path;    

          // small delay to avoid the empty-canvas race
          await new Promise(res => setTimeout(res, 200));

          // Open the file and refresh the component list
          await app.commands.execute('docmanager:open', { path: finalPath });
          await app.commands.execute(commandIDs.refreshComponentList);

        }
      });

      // Add to Launcher
      launcher.add({
        command: id,
        category: 'Xircuits Templates',
        rank : rank
      });
    }
    

    /**
     * Checks for the existence of a subdirectory without triggering a 404 error.
     * 
     * @param parentPath - The parent directory (e.g., "" or ".xircuits")
     * @param childDir - The name of the subdirectory to check within the parent
     */
    
    async function dirExists(browser, parentPath, childDir) {
      try {
        const listing = await browser.get(parentPath, { content: true });

        return listing.content.some(
          entry => entry.type === 'directory' && entry.name === childDir
        );
      } catch (err) {
        return false;
      }
    }

    async function registerUserTemplates(
      launcher: ILauncher,
      app: JupyterFrontEnd
    ) {
      const browser = app.serviceManager.contents;

      const hasXircuits = await dirExists(browser, '', '.xircuits');
      if (!hasXircuits) return;

      const hasTemplates = await dirExists(browser, '.xircuits', 'templates');
      if (!hasTemplates) return;

      const list = await browser.get('.xircuits/templates');

      for (const item of list.content) {
        if (item.type === 'file' && item.path.endsWith('.xircuits')) {
          const fileName = item.name;
          const commandId = `xircuits:user-template-${fileName}`;

          app.commands.addCommand(commandId, {
            label: fileName.replace(/\.xircuits$/, ''),
            caption: `Open ${fileName} template`,
            icon: xircuitsIcon,
            execute: async () => {
              const currentPath =
                browserFactory.tracker.currentWidget?.model.path ?? '';
              try {
                const model = await browser.copy(item.path, currentPath || '');
                await new Promise(res => setTimeout(res, 200));
                await app.commands.execute('docmanager:open', { path: model.path });
                await app.commands.execute(commandIDs.refreshComponentList);
              } catch {
              }
            }
          });

          launcher.add({ command: commandId, category: 'User Templates' });
        }
      }
    }

    // Register example buttons
    registerTemplateButton(
      'xircuits:open-agent-example',
      'Agent',
      'xai_components/xai_agent/examples/agent_example.xircuits',
      ['AGENT', 'OPENAI'],
      2
    );
        registerTemplateButton(
      'xircuits:open-flask-example',
      'Service',
      'xai_components/xai_flask/examples/InlineExample.xircuits',
      ['FLASK'],
      3
    );
    
    await registerUserTemplates(launcher, app);

    // Reorders the launcher sections
    function reorderSections(sections: HTMLElement[]) {
      const xircuitsSection = sections.find(sec =>
        sec.textContent?.includes('Xircuits Templates')
      );
      const userTemplatesSection = sections.find(sec =>
        sec.textContent?.includes('User Templates')
      );
    
      if (xircuitsSection && xircuitsSection.parentElement) {
        xircuitsSection.parentElement.prepend(xircuitsSection);
    
        if (userTemplatesSection && userTemplatesSection !== xircuitsSection) {
          xircuitsSection.parentElement.insertBefore(
            userTemplatesSection,
            xircuitsSection.nextSibling
          );
        }
      }
    }
    
    
    function handleLauncher(ln: HTMLElement) {
      const sections = Array.from(
        ln.querySelectorAll<HTMLElement>('.jp-Launcher-section')
      );
      reorderSections(sections);
    }
    // Prevent reordering the same launcher multiple times.
    // layoutModified may trigger multiple times (e.g., theme change, panel move)
    app.restored.then(() => {
    const processed = new WeakSet<HTMLElement>();
    (app.shell as any).layoutModified?.connect(() => {
        document.querySelectorAll<HTMLElement>('.jp-Launcher').forEach(ln => {
          if (!processed.has(ln)) {
            requestAnimationFrame(() => handleLauncher(ln));
            processed.add(ln);
          }
        });
      });
    });

    app.commands.commandExecuted.connect((_sender, args) => {
      if (args.id === 'launcher:create') {
        requestAnimationFrame(() => {
          document.querySelectorAll<HTMLElement>('.jp-Launcher').forEach(launcher => {
            const sections = Array.from(
              launcher.querySelectorAll<HTMLElement>('.jp-Launcher-section')
            );
            reorderSections(sections);
          });
        });
      }
    });
    
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

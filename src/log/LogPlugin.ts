import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';
import { addIcon, clearIcon, listIcon } from '@jupyterlab/ui-components';
import * as nbformat from '@jupyterlab/nbformat';
import LogLevelSwitcher from './LogLevelSwitcher';
import {
  ICommandPalette,
  WidgetTracker} from '@jupyterlab/apputils';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import {
  MainAreaWidget,
  CommandToolbarButton,
} from '@jupyterlab/apputils';
import {
  LoggerRegistry,
  LogConsolePanel,
  IHtmlLog,
  ITextLog,
  IOutputLog,
} from '@jupyterlab/logconsole';
import { requestAPI } from '../server/handler';
import { DockLayout } from '@lumino/widgets';
import { commandIDs } from "../commands/CommandIDs";

/**
 * The command IDs used by the log plugin.
 */
export namespace LoggerCommandIDs {
  export const addCheckpoint = 'Xircuit-log:add-checkpoint';
  export const clear = 'Xircuit-log:clear';
  export const openLog = 'Xircuit-log:open';
  export const setLevel = 'Xircuit-log:set-level';
}

/**
 * Initialization data for the log plugin.
 */
export const logPlugin: JupyterFrontEndPlugin<void> = {
  id: 'xircuit-log',
  autoStart: true,
  requires: [
    ICommandPalette,
    ILayoutRestorer,
    IRenderMimeRegistry
  ],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    restorer: ILayoutRestorer,
    rendermime: IRenderMimeRegistry
  ) => {

    console.log('Xircuit-Log is activated!');

    let logConsolePanel: LogConsolePanel = null;
    let logConsoleWidget: MainAreaWidget<LogConsolePanel> = null;

    const loggertracker = new WidgetTracker<MainAreaWidget<LogConsolePanel>>({
      namespace: 'Xircuit-log',
    });

    if (restorer) {
      void restorer.restore(loggertracker, {
        command: LoggerCommandIDs.openLog,
        name: () => 'Xircuit-log'
      });
    }
  
    app.commands.addCommand(LoggerCommandIDs.addCheckpoint, {
      execute: () => logConsolePanel?.logger?.checkpoint(),
      icon: addIcon,
      isEnabled: () => !!logConsolePanel && logConsolePanel.source !== null,
      label: 'Add Checkpoint',
    });
    app.commands.addCommand(LoggerCommandIDs.clear, {
      execute: () => logConsolePanel?.logger?.clear(),
      icon: clearIcon,
      isEnabled: () => !!logConsolePanel && logConsolePanel.source !== null,
      label: 'Clear Log',
    });
    app.commands.addCommand(LoggerCommandIDs.setLevel, {
      execute: (args: any) => {
        if (logConsolePanel?.logger) {
          logConsolePanel.logger.level = args.level;
        }
      },
      isEnabled: () => !!logConsolePanel && logConsolePanel.source !== null,
      label: (args) => `Set Log Level to ${args.level as string}`,
    });

    const createLogConsoleWidget = async (): Promise<void> => {
      logConsolePanel = new LogConsolePanel(
        new LoggerRegistry({
          defaultRendermime: rendermime,
          maxLength: 1000,
        })
      );

      logConsolePanel.source = 'xircuit';

      logConsoleWidget = new MainAreaWidget<LogConsolePanel>({
        content: logConsolePanel,
      });
      
      logConsoleWidget.addClass('jp-LogConsole');
      logConsoleWidget.title.label = 'xircuits Log console';
      logConsoleWidget.title.icon = listIcon;

      logConsoleWidget.toolbar.addItem(
        'checkpoint',
        new CommandToolbarButton({
          commands: app.commands,
          id: LoggerCommandIDs.addCheckpoint,
        })
      );
      logConsoleWidget.toolbar.addItem(
        'clear',
        new CommandToolbarButton({
          commands: app.commands,
          id: LoggerCommandIDs.clear,
        })
      );
      logConsoleWidget.toolbar.addItem(
        'level',
        new LogLevelSwitcher(logConsoleWidget.content)
      );

      logConsoleWidget.disposed.connect(() => {
        logConsoleWidget = null;
        logConsolePanel = null;
        app.commands.notifyCommandChanged();
      });

      let splitMode: DockLayout.InsertMode = 'split-bottom' as DockLayout.InsertMode; // default value
        
      try {
        const data = await requestAPI<any>('config/split_mode');
        splitMode = data.splitMode as DockLayout.InsertMode;
      } catch (err) {
        console.error('Error fetching split mode from server:', err);
      }
    
      app.shell.add(logConsoleWidget, 'main', { mode: splitMode });

      loggertracker.add(logConsoleWidget);

      logConsoleWidget.update();
      app.commands.notifyCommandChanged();
    };

    app.commands.addCommand(LoggerCommandIDs.openLog, {
      label: 'Open Xircuits Log Console',
      caption: 'Xircuits log console',
      icon: listIcon,
      isToggled: () => logConsoleWidget !== null,
      execute: () => {
        if (logConsoleWidget) {
          logConsoleWidget.dispose();
        } else {
          createLogConsoleWidget();
        }
      },
    });

    palette.addItem({
      command: LoggerCommandIDs.openLog,
      category: 'Examples',
    });

    app.commands.addCommand('jlab-examples/custom-log-console:logHTMLMessage', {
      label: 'HTML log message',
      caption: 'Custom HTML log message example.',
      execute: () => {
        const msg: IHtmlLog = {
          type: 'html',
          level: 'debug',
          data: '<div>Hello world HTML!!</div>',
        };

        logConsolePanel?.logger?.log(msg);
      },
    });

    app.commands.addCommand('jlab-examples/custom-log-console:logTextMessage', {
      label: 'Text log message',
      caption: 'Custom text log message example.',
      execute: () => {
        const msg: ITextLog = {
          type: 'text',
          level: 'info',
          data: 'Hello world text!!',
        };

        logConsolePanel?.logger?.log(msg);
      },
    });

    app.commands.addCommand(commandIDs.outputMsg, {
      label: 'Output log message',
      caption: 'Output xircuits log message.',
      execute: args => {
        const outputMsg = typeof args['outputMsg'] === 'undefined' ? '' : (args['outputMsg'] as string);
        const setLevel = args['level'] as any;
        const data: nbformat.IOutput = {
          output_type: 'display_data',
          data: {
            'text/plain': outputMsg,
          },
        };

        const msg: IOutputLog = {
          type: 'output',
          level: setLevel,
          data,
        };

        logConsolePanel?.logger?.log(msg);
      },
    });
  
  },
};

/**
 * Interface for log severity level
 */
export interface LogInterface {

  /**
   * Set log severity level to debug
   */
  debug(primaryMessage: string, ...supportingData: any[]) : void;

  /**
   * Set log severity level to info
   */
  info(primaryMessage: string, ...supportingData: any[]) : void;

  /**
   * Set log severity level to warning
   */
  warn(primaryMessage: string, ...supportingData: any[]) : void;

  /**
   * Set log severity level to error
   */
  error(primaryMessage: string, ...supportingData: any[]) : void;

  /**
   * Set log severity level to critical
   */
  critical(primaryMessage: string, ...supportingData: any[]) : void;
}

/**
 * Emit output message to xircuit log based on severity level
 */
export class Log implements LogInterface {
  private app: JupyterFrontEnd;

  constructor(app: JupyterFrontEnd){
     this.app = app;
  }

  public debug(msg: string, ...supportingDetailes: any[]): void {
    this.emitLogMessage("debug", msg, supportingDetailes);
  }

  public info(msg: string, ...supportingDetailes: any[]): void {
    this.emitLogMessage("info", msg, supportingDetailes);
  }

  public warn(msg: string, ...supportingDetailes: any[]): void {
    this.emitLogMessage("warning", msg, supportingDetailes);
  }

  public error(msg: string, ...supportingDetailes: any[]): void {
    this.emitLogMessage("error", msg, supportingDetailes);
  }

  public critical(msg: string, ...supportingDetailes: any[]): void {
    this.emitLogMessage("critical", msg, supportingDetailes);
  }

  private emitLogMessage(
    msgType: "debug" | "info" | "warning" | "error" | "critical", 
    msg: string, 
    supportingDetailes: any[]
  ){
    
    if (supportingDetailes.length > 0) {
      const logMsg = msg + supportingDetailes;
      this.app.commands.execute(commandIDs.outputMsg,{
        outputMsg: logMsg,
        level: msgType
      });
    } else {
      this.app.commands.execute(commandIDs.outputMsg,{
        outputMsg: msg,
        level: msgType
      });
    }
  }
}
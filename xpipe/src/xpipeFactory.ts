import { ABCWidgetFactory, DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { ILabShell } from '@jupyterlab/application';
import { Signal } from '@lumino/signaling';

import { IModelDB } from '@jupyterlab/observables';

import { Contents } from '@jupyterlab/services';

//import { ExampleDocModel } from './xpipe-model';

//import { ExampleDocWidget, ExamplePanel } from './xpipe-widget';

import { XpipeWidget } from './xpipeWidget';

import { XPipeModel } from './xpipeModel';

const XPIPE_CLASS = 'xpipe-editor';

export class XpipeFactory extends ABCWidgetFactory<DocumentWidget, XPipeModel> {
  browserFactory: IFileBrowserFactory;
  shell: ILabShell;
  commands: any;
  addFileToXpipeSignal: Signal<this, any>;

  constructor(options: any) {
    super(options);
    this.browserFactory = options.browserFactory;
    this.shell = options.shell;
    this.commands = options.commands;
    this.addFileToXpipeSignal = new Signal<this, any>(this);
  }

  protected createNewWidget(context: DocumentRegistry.IContext<XPipeModel>): DocumentWidget {
    // Creates a blank widget with a DocumentWidget wrapper
    const props = {
      shell: this.shell,
      commands: this.commands,
      browserFactory: this.browserFactory,
      context: context,
      addFileToXpipeSignal: this.addFileToXpipeSignal,
    };

    const content = new XpipeWidget(props);

    const widget = new DocumentWidget({ content, context });
    widget.addClass(XPIPE_CLASS);
    //widget.title.icon = pipelineIcon;
    return widget;
  }
}
import { ABCWidgetFactory, DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { ILabShell } from '@jupyterlab/application';

import { Signal } from '@lumino/signaling';

import { IModelDB } from '@jupyterlab/observables';

import { Contents } from '@jupyterlab/services';

import { XPipeWidget, XPipePanel } from './xpipeWidget';

import { XPipeDocModel } from './xpipeModel';

const XPIPE_CLASS = 'xpipe-editor';

export class XpipeFactory extends ABCWidgetFactory<XPipeWidget, XPipeDocModel> {
  
  browserFactory: IFileBrowserFactory;
  shell: ILabShell;
  commands: any;
  addFileToXpipeSignal: Signal<this, any>;
  model: any;

  constructor(options: any) {
    super(options);
    this.browserFactory = options.browserFactory;
    this.shell = options.shell;
    this.commands = options.commands;
    this.addFileToXpipeSignal = new Signal<this, any>(this);
    this.model = options.modelName;
  }

  protected createNewWidget(context: DocumentRegistry.IContext<XPipeDocModel>): XPipeWidget {
    // Creates a blank widget with a DocumentWidget wrapper
    const props = {
      shell: this.shell,
      commands: this.commands,
      browserFactory: this.browserFactory,
      context: context,
      addFileToXpipeSignal: this.addFileToXpipeSignal,
    };

    const content = new XPipePanel(props);

    const widget = new DocumentWidget({ content, context });
    widget.addClass(XPIPE_CLASS);
    //widget.title.icon = pipelineIcon;
    return widget;
  }
}


export class XPipeDocModelFactory
  implements DocumentRegistry.IModelFactory<XPipeDocModel>
{
  /**
   * The name of the model.
   *
   * @returns The name
   */
  get name(): string {
    return 'xpipe-model';
  }

  /**
   * The content type of the file.
   *
   * @returns The content type
   */
  get contentType(): Contents.ContentType {
    return 'file';
  }

  /**
   * The format of the file.
   *
   * @returns the file format
   */
  get fileFormat(): Contents.FileFormat {
    return 'text';
  }

  /**
   * Get whether the model factory has been disposed.
   *
   * @returns disposed status
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Dispose the model factory.
   */
  dispose(): void {
    this._disposed = true;
  }

  /**
   * Get the preferred language given the path on the file.
   *
   * @param path path of the file represented by this document model
   * @returns The preferred language
   */
  preferredLanguage(path: string): string {
    return '';
  }

  /**
   * Create a new instance of XPipeDocModel.
   *
   * @param languagePreference Language
   * @param modelDB Model database
   * @returns The model
   */
  createNew(languagePreference?: string, modelDB?: IModelDB): XPipeDocModel {
    return new XPipeDocModel(languagePreference, modelDB);
  }

  private _disposed = false;
}

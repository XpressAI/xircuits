import { MimeDocument } from '@jupyterlab/docregistry';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { Widget } from '@lumino/widgets';
import * as ReactDOM from "react-dom";
import {CreateTrainingDiagramComponent} from "./training-diagram";
import { Toolbar } from './training-diagram/components/Toolbar';

/**
 * The default mime type for the extension.
 */
const MIME_TYPE = 'application/vnd.xpressai.xpipeline';

/**
 * The class name added to the extension.
 */
const CLASS_NAME = 'mimerenderer-xpipeline';

/**
 * A widget for rendering xpipeline.
 */
export class OutputWidget extends Widget implements IRenderMime.IRenderer {
  /**
   * Construct a new output widget.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    //this._mimeType = options.mimeType;
    this.addClass(CLASS_NAME);
  }

  /**
   * Render xpipeline into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
  
    let data = model.data[MIME_TYPE] as string;
    /**
     * Add the toolbar items to widget's toolbar
     */
    let panel = this.parent?.parent as unknown as MimeDocument;
    panel?.toolbar.insertItem(0, 'save', Toolbar.save());
    panel?.toolbar.insertItem(1, 'compile', Toolbar.compile());
    panel?.toolbar.insertItem(2, 'run', Toolbar.run());
    panel?.toolbar.insertItem(3, 'debug', Toolbar.debug());

    ReactDOM.render(CreateTrainingDiagramComponent(data), this.node);

    return Promise.resolve();
  }

  //private _mimeType: string;
}

/**
 * A mime renderer factory for xpipeline data.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [MIME_TYPE],
  createRenderer: options => new OutputWidget(options)
};

/**
 * Extension definition.
 */
const extension: IRenderMime.IExtension = {
  id: 'xpipe:plugin',
  rendererFactory,
  rank: 0,
  dataType: 'json',
  fileTypes: [
    {
      name: 'xpipeline',
      mimeTypes: [MIME_TYPE],
      extensions: ['.xpipe'],
      displayName: 'Xpipe'
    }
  ],
  documentWidgetFactoryOptions: {
    name: 'Xpipeline Viewer',
    primaryFileType: 'xpipeline',
    fileTypes: ['xpipeline'],
    defaultFor: ['xpipeline']
  }
};

export default extension;

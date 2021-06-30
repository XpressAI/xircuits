import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IThemeManager } from '@jupyterlab/apputils';

/**
 * Initialization data for the xpressai_theme extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'xpressai_theme',
  requires: [IThemeManager],
  autoStart: true,
  activate: (app: JupyterFrontEnd, manager: IThemeManager) => {
    console.log('JupyterLab extension xpressai_theme is activated!');
    const style = 'xpressai_theme/index.css';

    manager.register({
      name: 'xpressai_theme',
      isLight: true,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  }
};

export default extension;


import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ReactWidget } from '@jupyterlab/apputils';
import React from 'react';
import Sidebar from './Sidebar';


/**
 * Initialization data for the xpipe_component_library extension.
 */
const xpipe_component_library: JupyterFrontEndPlugin<void> = {
  id: 'xpipe_component_library:plugin',
  autoStart: true,
  requires: [ILabShell, ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    labShell: ILabShell,
    restorer: ILayoutRestorer
  ) => {
    console.log('JupyterLab extension xpipe_component_library is activated!');

    const widget = ReactWidget.create(<Sidebar />);
    widget.id = 'xpipe-component-library';

    restorer.add(widget, widget.id);
    labShell.add(widget, "left", { rank: 1000 });
  }
};

export default xpipe_component_library;


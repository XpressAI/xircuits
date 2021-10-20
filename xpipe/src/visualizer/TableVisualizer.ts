import { ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import {
    ITranslator,
    nullTranslator,
    TranslationBundle,
  } from '@jupyterlab/translation';
import { tableRowsIcon } from '@jupyterlab/ui-components';

import { DataGrid, DataModel } from '@lumino/datagrid';

import { StackedPanel } from '@lumino/widgets';
import { commandIDs } from '../components/xpipeBodyWidget';
import {
  MainAreaWidget,
  WidgetTracker} from '@jupyterlab/apputils';

/**
 * Initialization data for the visualizer plugin.
 */
 export const visualizerPlugin: JupyterFrontEndPlugin<void> = {
  id: 'xpipe-visualizer',
  autoStart: true,
  requires: [
    ILayoutRestorer
  ],
  activate: (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer
  ) => {

    console.log('Xpipe-visualizer is activated!');

    let visualizerTable: TableVisualizer = null;
    let visualizerWidget: MainAreaWidget<TableVisualizer> = null;

    const visualizerTracker = new WidgetTracker<MainAreaWidget<TableVisualizer>>({
      namespace: 'Xpipe-visualizer',
    });

    if (restorer) {
      void restorer.restore(visualizerTracker, {
        command: commandIDs.openTableVisualizer,
        name: () => 'Xpipe-visualizer'
      });
    }

    const createVisualizerWidget = (): void => {
      
      visualizerTable = new TableVisualizer();
      visualizerWidget = new MainAreaWidget<TableVisualizer>({
        content: visualizerTable,
      });
      visualizerWidget.title.label = 'Xpipe Visualizer';
      visualizerWidget.title.icon = tableRowsIcon;

      visualizerWidget.disposed.connect(() => {
        visualizerTable = null;
        visualizerWidget = null;
        app.commands.notifyCommandChanged();
      });

      app.shell.add(visualizerWidget, 'main', { mode: 'split-bottom' });
      visualizerTracker.add(visualizerWidget);

      visualizerWidget.update();
      app.commands.notifyCommandChanged();
    };

    app.commands.addCommand(commandIDs.openTableVisualizer, {
      label: 'Xpipe Table Visualizer',
      caption: 'Xpipe table visualizer',
      isToggled: () => visualizerWidget !== null,
      execute: () => {
        if (visualizerWidget) {
          visualizerWidget.dispose();
        } else {
          createVisualizerWidget();
        }
      },
    });
  },
};

export class TableVisualizer extends StackedPanel {
    constructor(translator?: ITranslator) {
      super();
      this._translator = translator || nullTranslator;
      this._trans = this._translator.load('jupyterlab');
  
      this.addClass('jp-example-view');
      this.id = 'table-visualizer';
      this.title.label = this._trans.__('Xpipe Visualizer');
      this.title.closable = true;
  
      const model = new LargeDataModel();
      const grid = new DataGrid();
      grid.dataModel = model;
  
      this.addWidget(grid);
    }
  
    private _translator: ITranslator;
    private _trans: TranslationBundle;
  }
  
  class LargeDataModel extends DataModel {
    rowCount(region: DataModel.RowRegion): number {
      return region === 'body' ? 1000000000000 : 2;
    }
  
    columnCount(region: DataModel.ColumnRegion): number {
      return region === 'body' ? 1000000000000 : 3;
    }
  
    data(region: DataModel.CellRegion, row: number, column: number): any {
      if (region === 'row-header') {
        return `R: ${row}, ${column}`;
      }
      if (region === 'column-header') {
        return `C: ${row}, ${column}`;
      }
      if (region === 'corner-header') {
        return `N: ${row}, ${column}`;
      }
      return `(${row}, ${column})`;
    }
  }
//previewHelper.ts
import { JupyterFrontEnd, ILabShell } from '@jupyterlab/application';
import { Widget } from '@lumino/widgets';
import { ComponentPreviewWidget, IComponentInfo } from './ComponentPreviewWidget';

export function togglePreviewWidget(app: JupyterFrontEnd, model: IComponentInfo) {
  const labShell = app.shell as ILabShell;
  const rightCollapsed = (labShell as any).rightCollapsed ?? (labShell as any).collapsedRight;

  const widgets: Widget[] = Array.from(labShell.widgets('right'));
  let widget = widgets.find(w => w.id === 'xircuits-doc-preview') as ComponentPreviewWidget | undefined;

  if (!widget) {
    widget = new ComponentPreviewWidget(app, model);
    widget.node.style.minWidth = '340px';
    labShell.add(widget, 'right', { rank: 0 });
    labShell.activateById(widget.id);
    return;
  }

  if (rightCollapsed) {
    labShell.expandRight();
    widget.setApp(app);      
    widget.setModel(model);  
    labShell.activateById(widget.id);
    return;
  }

  const currentName = widget.node.dataset.componentName;
  if (currentName === model.name) {
    labShell.collapseRight();
  } else {
    widget.setApp(app);
    widget.setModel(model);
    labShell.activateById(widget.id);
  }
}

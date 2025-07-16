import { JupyterFrontEnd, ILabShell } from '@jupyterlab/application';
import { ComponentPreviewWidget, IComponentInfo } from './ComponentPreviewWidget';

const PREVIEW_ID = 'xircuits-doc-preview';
const MIN_WIDTH  = '340px';

export function togglePreviewWidget(
  app: JupyterFrontEnd,
  model: IComponentInfo,
  neverCollapse = false
): void {
  const shell = app.shell as ILabShell;

  const rightCollapsed: boolean =
    (shell as any).rightCollapsed ?? (shell as any).collapsedRight ?? false;

  let widget: ComponentPreviewWidget | undefined;
  for (const w of shell.widgets('right')) {
    if (w.id === PREVIEW_ID) {
      widget = w as ComponentPreviewWidget;
      break;
    }
  }

  if (!widget) {
    widget = new ComponentPreviewWidget(app, model);
    widget.node.style.minWidth = MIN_WIDTH;
    shell.add(widget, 'right', { rank: 0 });
  }

  if (
    rightCollapsed ||
    widget.node.dataset.componentName !== model.name
  ) {
    widget.setApp(app);
    widget.setModel(model);
  }
  else if (!neverCollapse) {
    shell.collapseRight();
    return;
  }

  shell.expandRight();
  shell.activateById(widget.id);
}

import { JupyterFrontEnd, ILabShell } from '@jupyterlab/application';
import { ComponentPreviewWidget, IComponentInfo } from './ComponentPreviewWidget';
import { IXircuitsDocTracker } from '../index';

const PREVIEW_ID = 'xircuits-doc-preview';

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
    shell.add(widget, 'right', { rank: 0 });
  }

  const prevName = widget.node.dataset.componentName;
  const prevId   = widget.node.dataset.componentId;
  const newId    = model.node?.getID?.();

  const sameNode =
    !rightCollapsed &&
    prevName === model.name &&
    prevId === newId;

  if (!sameNode) {
    widget.setApp(app);
    widget.setModel(model);
  } else if (!neverCollapse) {
    shell.collapseRight();
    return;
  }

  shell.expandRight();
  shell.activateById(widget.id);
}

export function registerPreviewResetOnCanvasChange(
  app: JupyterFrontEnd,
  tracker: IXircuitsDocTracker
): void {
  const shell = app.shell as ILabShell;

  tracker.currentChanged.connect((_trk, panel) => {
    if (!panel) {
      resetPreview(shell);
      return;
    }

    const currentPath = panel.context.path;
    const lastPath    = (shell as any)._xirLastPath;

    if (currentPath !== lastPath) {
      (shell as any)._xirLastPath = currentPath;
      resetPreview(shell);
      shell.collapseRight();
    }
  });
}

function resetPreview(shell: ILabShell): void {
  const widget = Array.from(shell.widgets('right'))
    .find(w => w.id === 'xircuits-doc-preview') as ComponentPreviewWidget | undefined;

  if (widget) {
    widget.setModel(null);
  }
}

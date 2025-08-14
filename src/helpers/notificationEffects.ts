import { DiagramEngine } from '@projectstorm/react-diagrams';
import { Notification } from '@jupyterlab/apputils';

export function showNodeCenteringNotification(
  message: string,
  nodeId: string,
  engine?: DiagramEngine
) {
  const options: any = { autoClose: 3000 };

  if (engine) {
    options.actions = [
      {
        label: 'Show Node',
        caption: 'Show Node on canvas',
        callback: (event: MouseEvent) => {
          event.preventDefault();
          centerNodeInView(engine, nodeId);
        }
      }
    ];
  }

  Notification.error(message, options);
}

export function centerNodeInView(engine: DiagramEngine, nodeId: string) {
  const model = engine.getModel();
  const node  = model.getNode(nodeId);
  if (!node) return;

  const { x, y } = node.getPosition();
  const { width = 150, height = 100 } = (node as any).getSize?.() ?? {};

  const canvas  = (engine as any).canvas as HTMLElement;
  const content = canvas.closest(
    '.lm-Widget[role="region"][aria-label="main area content"]'
  ) as HTMLElement;
  if (!content) return;

  const { width: vpW, height: vpH } = content.getBoundingClientRect();
  const zoom = model.getZoomLevel() / 100;

  const offsetX = vpW / 2 - (x + width / 2) * zoom;
  const offsetY = vpH / 2 - (y + height / 2) * zoom;

  node.getOptions().extras["borderColor"]="red";
  node.setSelected(true);

  model.setOffset(offsetX, offsetY);
  engine.repaintCanvas();
}

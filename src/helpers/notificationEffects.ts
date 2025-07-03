import { DiagramEngine } from '@projectstorm/react-diagrams';

interface PendingLink {
  text: string;
  nodeId: string;
  engine: DiagramEngine;
}

const pendingLinks: PendingLink[] = [];
let observerStarted = false;

// Call this whenever Notification.error is triggered
export function zoomNodeOnNotificationHover(
  messageText: string,
  nodeId: string,
  engine: DiagramEngine
) {
  pendingLinks.push({ text: messageText, nodeId, engine });

  if (!observerStarted) {
    startToastObserver();
    observerStarted = true;
  }
}

function startToastObserver() {
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;

        // Get all .Toastify__toast elements
        const toastElements: HTMLElement[] = node.matches?.('.Toastify__toast')
          ? [node]
          : Array.from(node.querySelectorAll?.('.Toastify__toast') ?? []);

        toastElements.forEach((toastEl) => {
          if (toastEl.dataset.zoomified) return;

          const toastText =
            toastEl.querySelector('.jp-toast-message')?.textContent ?? '';

          const idx = pendingLinks.findIndex((p) => toastText.includes(p.text));
          if (idx === -1) return;

          const { nodeId, engine } = pendingLinks[idx];
          pendingLinks.splice(idx, 1);

          const nodeEl = document.querySelector(
            `[data-nodeid="${nodeId}"]`
          ) as HTMLElement | null;
          if (!nodeEl) return;

          toastEl.dataset.zoomified = 'true';
          attachInteractions(toastEl, nodeId, engine);
        });
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function attachInteractions(
  toastEl: HTMLElement,
  nodeId: string,
  engine: DiagramEngine
) {
  toastEl.style.cursor = 'pointer';
  toastEl.title = 'Click to center this node';

  const getNodeEl = () =>
    document.querySelector(`[data-nodeid="${nodeId}"]`) as HTMLElement | null;

  toastEl.addEventListener('mouseenter', () => {
    const nodeEl = getNodeEl();
    if (!nodeEl) return;

    // Toast hover effect
    toastEl.style.transition = 'transform .1s, box-shadow .1s';
    toastEl.style.transform = 'translateY(-2px)';
    toastEl.style.boxShadow = '0 4px 8px rgba(0,0,0,.1)';

    // Highlight and scale up the node
    nodeEl.style.transition = 'transform .2s';
    nodeEl.style.transform = 'scale(1.2)';
    nodeEl.style.border = '2px solid red';
    nodeEl.style.borderRadius = '8px';
  });

  toastEl.addEventListener('mouseleave', () => {
    const nodeEl = getNodeEl();
    if (!nodeEl) return;

    // Reset styles
    toastEl.style.transform = '';
    toastEl.style.boxShadow = '';

    nodeEl.style.transform = 'scale(1)';
    nodeEl.style.border = '';
    nodeEl.style.borderRadius = '';
  });

  toastEl.addEventListener('click', () => {
    centerNodeInView(engine, nodeId);
  });
}

// Center the given node in the visible viewport
export function centerNodeInView(engine: DiagramEngine, nodeId: string): void {
  const model = engine.getModel();
  const node = model.getNode(nodeId);
  if (!node) return;

  const { x, y } = node.getPosition();
  const { width = 150, height = 100 } = (node as any).getSize?.() ?? {};

  const canvas = (engine as any).canvas as HTMLElement;
  const contentWidget = canvas.closest(
    '.lm-Widget[role="region"][aria-label="main area content"]'
  ) as HTMLElement;
  if (!contentWidget) return;

  const { width: vpW, height: vpH } = contentWidget.getBoundingClientRect();
  const zoom = model.getZoomLevel() / 100;

  const nodeCenterX = x + width / 2;
  const nodeCenterY = y + height / 2;

  const offsetX = vpW / 2 - nodeCenterX * zoom;
  const offsetY = vpH / 2 - nodeCenterY * zoom;

  model.setOffset(offsetX, offsetY);
  engine.repaintCanvas();
}
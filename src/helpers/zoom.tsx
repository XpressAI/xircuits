// src/helpers/zoom.ts

import { DiagramEngine } from '@projectstorm/react-diagrams';

/**
 * Zooms the diagram so that all nodes fit within the viewport, with optional padding.
 * @param engine     Your DiagramEngine instance
 * @param padding    Extra space (in pixels) around the bounding box (default: 40)
 */
export function zoomToFit(engine: DiagramEngine, padding = 40): void {
    const model = engine.getModel();
    const nodes = model.getNodes();
    if (nodes.length === 0) {
        return;
    }

  // reset zoom & offset
    model.setZoomLevel(100);
    model.setOffset(0, 0);

  // find bounding box of all nodes
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    for (const node of nodes) {
    const { x, y } = node.getPosition();
    const { width = 150, height = 100 } = (node as any).getSize?.() ?? {};
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
    }

  // pad
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const contentWidth  = maxX - minX;
    const contentHeight = maxY - minY;

    // measure viewport
    const contentWidget = (engine as any).canvas.closest(
        '.lm-Widget[role="region"][aria-label="main area content"]'
    ) as HTMLElement;
    const { width: vpW, height: vpH } = contentWidget.getBoundingClientRect();

    // compute & clamp zoom (5%–150%)
    const rawZoom = Math.min(vpW / contentWidth, vpH / contentHeight);
    const zoom    = Math.max(0.05, Math.min(1.5, rawZoom * 0.995));
    model.setZoomLevel(zoom * 100);

    // center content
    const centerX = minX + contentWidth  / 2;
    const centerY = minY + contentHeight / 2;
    const offsetX = vpW / 2 - centerX * zoom;
    const offsetY = vpH / 2 - centerY * zoom;
    model.setOffset(offsetX, offsetY);

    engine.repaintCanvas();
    }

/**
 * Delay a zoomToFit by a single animation frame + timeout.
 * Useful if your model is still settling (e.g. on initial render).
 */
    export function delayedZoomToFit(engine: DiagramEngine, padding = 100): void {
    requestAnimationFrame(() => {
        setTimeout(() => zoomToFit(engine, padding), 300);
    });
    }

/**
 * Low-level helper: zooms by an arbitrary factor around the viewport center.
 * @param factor  e.g. 1.15 to zoom in 15%, 0.85 to zoom out 15%
 */
function zoomBy(engine: DiagramEngine, factor: number): void {
    const model = engine.getModel();
    const prevZoom = model.getZoomLevel() / 100;
    const newZoom = Math.max(0.05, Math.min(3.0, prevZoom * factor));
    const ratio = newZoom / prevZoom;

    const contentWidget = (engine as any).canvas.closest(
        '.lm-Widget[role="region"][aria-label="main area content"]'
    ) as HTMLElement;
    const { width: vpW, height: vpH } = contentWidget.getBoundingClientRect();

    const ox = model.getOffsetX();
    const oy = model.getOffsetY();
    const offsetX = (ox - vpW / 2) * ratio + vpW / 2;
    const offsetY = (oy - vpH / 2) * ratio + vpH / 2;

    model.setZoomLevel(newZoom * 100);
    model.setOffset(offsetX, offsetY);
    engine.repaintCanvas();
}

/** Zoom in 15% around the viewport center */
export function zoomIn(engine: DiagramEngine): void {
    zoomBy(engine, 1.15);
}

/** Zoom out 15% around the viewport center */
export function zoomOut(engine: DiagramEngine): void {
    zoomBy(engine, 0.85);
}

/**
 * Centers the viewport on the given node without changing the zoom level.
 * @param engine  The DiagramEngine instance
 * @param node    The node to center (must support getPosition and getSize)
 */
export function centerNodeInView(engine: DiagramEngine, node: any): void {
    const model = engine.getModel();
    const zoom = model.getZoomLevel() / 100;

    const { x, y } = node.getPosition();
    const { width = 150, height = 100 } = node.getSize?.() ?? {};

    const nodeCenterX = x + width / 2;
    const nodeCenterY = y + height / 2;

    const contentWidget = (engine as any).canvas.closest(
        '.lm-Widget[role="region"][aria-label="main area content"]'
    ) as HTMLElement;

    const { width: vpW, height: vpH } = contentWidget.getBoundingClientRect();

    const offsetX = vpW / 2 - nodeCenterX * zoom;
    const offsetY = vpH / 2 - nodeCenterY * zoom;

    model.setOffset(offsetX, offsetY);
    engine.repaintCanvas();
}
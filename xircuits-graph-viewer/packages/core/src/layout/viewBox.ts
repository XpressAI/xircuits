import type { XNode, NodeMetrics } from '../types.js';

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function computeViewBox(
  nodes: XNode[],
  metricsMap: Map<string, NodeMetrics>,
  padding: number = 40
): ViewBox {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const metrics = metricsMap.get(node.id);
    if (!metrics) continue;

    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + metrics.width);
    maxY = Math.max(maxY, node.y + metrics.height);
  }

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}

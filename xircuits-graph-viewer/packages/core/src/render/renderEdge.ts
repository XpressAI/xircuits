import type { XEdge, XNode, NodeMetrics, RenderOptions } from '../types.js';
import { g, el } from '../svg/builder.js';
import { bezierPath } from '../svg/bezier.js';

export function renderEdge(
  edge: XEdge,
  nodesById: Map<string, XNode>,
  metricsMap: Map<string, NodeMetrics>,
  options?: RenderOptions,
): string {
  if (!edge.points || edge.points.length < 2) return '';

  const p0 = edge.points[0];
  const p1 = edge.points[edge.points.length - 1];
  const d = bezierPath(p0.x, p0.y, p1.x, p1.y, 50);
  const extraClass = options?.edgeClassFn?.(edge) || '';
  const cls = edge.kind === 'flow' ? 'xg-edge xg-edge--flow' : 'xg-edge xg-edge--data';

  return g(
    { class: `xg-edge-group ${extraClass}`.trim(), 'data-edge-id': edge.id },
    el('path', { class: cls, d }),
  );
}

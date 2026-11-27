import type { XGraph, RenderOptions, NodeMetrics } from '../types.js';
import { svgRoot, g, el } from '../svg/builder.js';
import { computeNodeMetrics } from '../layout/metrics.js';
import { computeViewBox } from '../layout/viewBox.js';
import { renderDefs } from './renderDefs.js';
import { renderNode } from './renderNode.js';
import { renderEdge } from './renderEdge.js';
import { parse } from '../parser/parse.js';

export function renderToString(graph: XGraph, options: RenderOptions = {}): string {
  const {
    theme = 'dark',
    padding = 40,
    fitView = true,
    className,
    width,
    height,
  } = options;

  const metricsMap = new Map<string, NodeMetrics>();
  for (const node of graph.nodes) {
    metricsMap.set(node.id, computeNodeMetrics(node));
  }

  const viewBox = fitView
    ? computeViewBox(graph.nodes, metricsMap, padding)
    : { x: -graph.viewport.x, y: -graph.viewport.y, width: width || 800, height: height || 600 };

  const nodesById = new Map(graph.nodes.map(n => [n.id, n]));
  const defs = renderDefs(graph.nodes, theme);

  const edgeElements = graph.edges.map(edge => renderEdge(edge, nodesById, metricsMap, options));
  const nodeElements = graph.nodes.map(node => renderNode(node, metricsMap.get(node.id)!, options));

  const rootClass = ['xg-root', className].filter(Boolean).join(' ');

  return svgRoot(
    {
      viewBox: `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`,
      class: rootClass,
      'data-theme': theme,
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
    },
    defs,
    g({ class: 'xg-edges' }, ...edgeElements),
    g({ class: 'xg-nodes' }, ...nodeElements),
  );
}

export function renderToElement(graph: XGraph, options: RenderOptions = {}): SVGSVGElement {
  const svgString = renderToString(graph, options);
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  return doc.documentElement as unknown as SVGSVGElement;
}

export function renderXircuits(json: unknown, options: RenderOptions = {}): string {
  const graph = parse(json);
  return renderToString(graph, options);
}

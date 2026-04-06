// Types
export type {
  XGraph,
  XNode,
  XEdge,
  XPort,
  NodeMetrics,
  RenderOptions,
  PortDirection,
  PortKind,
  NodeKind,
  EdgeKind,
} from './types.js';

// Parser
export { parse } from './parser/parse.js';
export { validate } from './parser/validate.js';

// Layout
export { computeNodeMetrics } from './layout/metrics.js';
export { computeViewBox } from './layout/viewBox.js';

// Renderer
export { renderToString, renderToElement } from './render/renderGraph.js';

// Convenience: one-shot parse + render
export { renderXircuits } from './render/renderGraph.js';

// Container background CSS (matching Xircuits canvas)
export function getCanvasStyle(theme: 'dark' | 'light' = 'dark'): string {
  if (theme === 'dark') {
    return [
      'background-color: oklch(0.3 0.01 300)',
      'background-image: radial-gradient(oklch(40% 0 0) 1px, transparent 0)',
      'background-size: 15px 15px',
    ].join(';');
  }
  return [
    'background-color: #f5f5f5',
    'background-image: radial-gradient(oklch(85% 0 0) 1px, transparent 0)',
    'background-size: 15px 15px',
  ].join(';');
}

// Browser helper: fetch a .xircuits URL and render
export async function renderFromUrl(
  url: string,
  options?: import('./types.js').RenderOptions
): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  const json = await res.json();
  const { parse } = await import('./parser/parse.js');
  const { renderToString } = await import('./render/renderGraph.js');
  return renderToString(parse(json), options);
}

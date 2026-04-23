import React, { useEffect, useRef, useState } from 'react';
import { parse, renderToElement, getCanvasStyle } from '@xpressai/xircuits-viewer';
import { attachPanZoom } from '@xpressai/xircuits-viewer/interaction';
import type { PanZoomInstance } from '@xpressai/xircuits-viewer/interaction';
import type { XNode, XEdge, XGraph } from '@xpressai/xircuits-viewer';

function parseCanvasStyle(theme: 'dark' | 'light'): React.CSSProperties {
  return Object.fromEntries(
    getCanvasStyle(theme).split(';').map(s => {
      const [k, ...v] = s.split(':');
      return [k.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), v.join(':').trim()];
    })
  );
}

const controlBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 4,
  color: '#fff',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1,
  padding: 0,
};

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ZoomInIcon = () => (
  <svg {...iconProps}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const ZoomOutIcon = () => (
  <svg {...iconProps}><path d="M5 12h14" /></svg>
);
const FitIcon = () => (
  <svg {...iconProps}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <rect width="10" height="8" x="7" y="8" rx="1" />
  </svg>
);

export interface XircuitsGraphProps {
  /** URL or path to a .xircuits file. Fetched at mount time. */
  src?: string;
  /** Pre-loaded .xircuits JSON data. Takes precedence over src. */
  data?: object;
  /** Pre-parsed XGraph. Takes precedence over both data and src. */
  graph?: XGraph;
  theme?: 'dark' | 'light';
  /** Show the dotted-grid canvas background. Defaults to true. */
  showCanvasBackground?: boolean;
  interactive?: boolean;
  /** Show zoom +/−/fit controls. Defaults to true when interactive. */
  showControls?: boolean;
  fitView?: boolean;
  width?: number | string;
  height?: number | string;
  padding?: number;
  className?: string;
  style?: React.CSSProperties;
  onNodeClick?: (node: XNode) => void;
  onEdgeClick?: (edge: XEdge) => void;
  onError?: (error: Error) => void;
}

export function XircuitsGraph({
  src,
  data,
  graph: graphProp,
  theme = 'dark',
  showCanvasBackground = true,
  interactive = true,
  showControls,
  fitView = true,
  width = '100%',
  height = 400,
  padding,
  className,
  style,
  onNodeClick,
  onEdgeClick,
  onError,
}: XircuitsGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panZoomRef = useRef<PanZoomInstance | null>(null);
  const [fetchedData, setFetchedData] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayControls = showControls ?? interactive;

  // Fetch from src when no graph or data is provided
  useEffect(() => {
    if (graphProp || data || !src) return;
    let cancelled = false;

    fetch(src)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${src}: ${res.status}`);
        return res.json();
      })
      .then(json => { if (!cancelled) setFetchedData(json); })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          onError?.(err);
        }
      });

    return () => { cancelled = true; };
  }, [src, data, graphProp]);

  const resolvedData = data || fetchedData;

  // Render SVG when graph or data is available
  useEffect(() => {
    if (!containerRef.current) return;
    if (!graphProp && !resolvedData) return;

    const graph = graphProp ?? parse(resolvedData as object);
    const svg = renderToElement(graph, { theme, fitView, padding });

    containerRef.current.querySelectorAll('svg').forEach(el => el.remove());
    containerRef.current.appendChild(svg);

    panZoomRef.current = null;
    let cleanup: (() => void) | undefined;
    if (interactive) {
      const pz = attachPanZoom(svg);
      panZoomRef.current = pz;
      cleanup = pz.destroy;
    }

    const handleClick = (e: Event) => {
      const target = e.target as Element;

      if (onNodeClick) {
        const nodeEl = target.closest('.xg-node');
        if (nodeEl) {
          const nodeId = nodeEl.getAttribute('data-node-id');
          const node = graph.nodes.find(n => n.id === nodeId);
          if (node) onNodeClick(node);
        }
      }

      if (onEdgeClick) {
        const edgeEl = target.closest('.xg-edge-group');
        if (edgeEl) {
          const edgeId = edgeEl.getAttribute('data-edge-id');
          const edge = graph.edges.find(e => e.id === edgeId);
          if (edge) onEdgeClick(edge);
        }
      }
    };

    svg.addEventListener('click', handleClick);

    return () => {
      cleanup?.();
      panZoomRef.current = null;
      svg.removeEventListener('click', handleClick);
    };
  }, [graphProp, resolvedData, theme, interactive, fitView, padding]);

  const canvasCss = showCanvasBackground ? parseCanvasStyle(theme) : {};

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...canvasCss,
        ...style,
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        {error && <div style={{ color: 'red', padding: 8 }}>{error}</div>}
        {!graphProp && !resolvedData && !error && src && <div style={{ color: '#888', padding: 8 }}>Loading...</div>}
      </div>
      {displayControls && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          display: 'flex',
          gap: 4,
          zIndex: 10,
        }}>
          <button
            style={controlBtnStyle}
            onClick={() => panZoomRef.current?.zoomBy(0.8)}
            title="Zoom in"
            aria-label="Zoom in"
          ><ZoomInIcon /></button>
          <button
            style={controlBtnStyle}
            onClick={() => panZoomRef.current?.zoomBy(1.25)}
            title="Zoom out"
            aria-label="Zoom out"
          ><ZoomOutIcon /></button>
          <button
            style={controlBtnStyle}
            onClick={() => panZoomRef.current?.fitView()}
            title="Fit all nodes"
            aria-label="Fit all nodes"
          ><FitIcon /></button>
        </div>
      )}
    </div>
  );
}

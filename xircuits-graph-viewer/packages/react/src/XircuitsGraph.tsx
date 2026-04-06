import React, { useEffect, useRef, useState } from 'react';
import { parse, renderToElement } from 'xircuits-graph-core';
import { attachPanZoom } from 'xircuits-graph-core/interaction';
import type { XNode, XEdge } from 'xircuits-graph-core';

export interface XircuitsGraphProps {
  /** URL or path to a .xircuits file. Fetched at mount time. */
  src?: string;
  /** Pre-loaded .xircuits JSON data. Takes precedence over src. */
  data?: object;
  theme?: 'dark' | 'light';
  interactive?: boolean;
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
  theme = 'dark',
  interactive = true,
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
  const [fetchedData, setFetchedData] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch from src when no data is provided
  useEffect(() => {
    if (data || !src) return;
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
  }, [src, data]);

  const resolvedData = data || fetchedData;

  // Render SVG when data is available
  useEffect(() => {
    if (!containerRef.current || !resolvedData) return;

    const graph = parse(resolvedData);
    const svg = renderToElement(graph, { theme, fitView, padding });

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(svg);

    let cleanup: (() => void) | undefined;
    if (interactive) {
      cleanup = attachPanZoom(svg).destroy;
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
      svg.removeEventListener('click', handleClick);
    };
  }, [resolvedData, theme, interactive, fitView, padding]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
    >
      {error && <div style={{ color: 'red', padding: 8 }}>{error}</div>}
      {!resolvedData && !error && src && <div style={{ color: '#888', padding: 8 }}>Loading...</div>}
    </div>
  );
}

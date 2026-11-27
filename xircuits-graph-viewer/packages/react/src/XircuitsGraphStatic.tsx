import React, { useEffect, useState } from 'react';
import { parse, renderToString } from '@xpressai/xircuits-viewer';

export interface XircuitsGraphStaticProps {
  /** URL or path to a .xircuits file. Fetched at mount time. */
  src?: string;
  /** Pre-loaded .xircuits JSON data. Takes precedence over src. */
  data?: object;
  theme?: 'dark' | 'light';
  fitView?: boolean;
  width?: number | string;
  height?: number | string;
  padding?: number;
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: Error) => void;
}

export function XircuitsGraphStatic({
  src,
  data,
  theme = 'dark',
  fitView = true,
  width = '100%',
  height = 'auto',
  padding,
  className,
  style,
  onError,
}: XircuitsGraphStaticProps) {
  const [fetchedData, setFetchedData] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  let svgString = '';
  if (resolvedData) {
    const graph = parse(resolvedData);
    svgString = renderToString(graph, { theme, fitView, padding });
  }

  return (
    <div
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
    >
      {error && <div style={{ color: 'red', padding: 8 }}>{error}</div>}
      {!resolvedData && !error && src && <div style={{ color: '#888', padding: 8 }}>Loading...</div>}
      {svgString && <div dangerouslySetInnerHTML={{ __html: svgString }} />}
    </div>
  );
}

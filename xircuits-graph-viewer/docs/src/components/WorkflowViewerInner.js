import React, { useEffect, useRef, useState, useCallback } from 'react';
import { parse, renderToElement, getCanvasStyle } from '@xpressai/xircuits-viewer';
import { attachPanZoom } from '@xpressai/xircuits-viewer/interaction';
import { useColorMode } from '@docusaurus/theme-common';

const ZoomInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);
const ZoomOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
  </svg>
);
const FitIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <rect width="10" height="8" x="7" y="8" rx="1"/>
  </svg>
);

export default function WorkflowViewerInner({ src, height = 500 }) {
  const containerRef = useRef(null);
  const panZoomRef = useRef(null);
  const graphRef = useRef(null);
  const { colorMode } = useColorMode();
  const theme = colorMode === 'dark' ? 'dark' : 'light';
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef(null);

  const showControls = useCallback(() => {
    setVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 2000);
  }, []);

  // Fetch once
  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(src)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${src}: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!cancelled) {
          graphRef.current = parse(json);
          setLoaded(true);
          setLoading(false);
        }
      })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [src]);

  // Render when graph or theme changes
  useEffect(() => {
    if (!containerRef.current || !graphRef.current) return;

    // Save current viewBox before re-render
    const prevSvg = containerRef.current.querySelector('svg');
    const savedVB = prevSvg?.getAttribute('viewBox');

    if (panZoomRef.current) {
      panZoomRef.current.destroy();
      panZoomRef.current = null;
    }

    const svg = renderToElement(graphRef.current, { theme, fitView: true, padding: 40 });
    svg.style.width = '100%';
    svg.style.height = '100%';

    if (savedVB) svg.setAttribute('viewBox', savedVB);

    containerRef.current.querySelectorAll('svg').forEach(el => el.remove());
    containerRef.current.prepend(svg);
    panZoomRef.current = attachPanZoom(svg);
  }, [loaded, theme]);

  const bgStyle = getCanvasStyle(theme);
  const parsedBg = Object.fromEntries(
    bgStyle.split(';').filter(Boolean).map(s => {
      const [k, ...v] = s.split(':');
      return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.join(':').trim()];
    })
  );

  const btnStyle = {
    width: 32, height: 32,
    border: 'none', borderRadius: 6,
    background: 'rgba(0,0,0,0.55)',
    color: 'white',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <div
      style={{ position: 'relative', height, borderRadius: 8, overflow: 'hidden', ...parsedBg }}
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        {error && <p style={{ color: 'red', padding: 16 }}>{error}</p>}
        {loading && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', gap: 10, color: '#888',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
              animation: 'xg-spin 1s linear infinite',
            }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span>Loading workflow...</span>
            <style>{`@keyframes xg-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute', bottom: 12, right: 12,
        display: 'flex', gap: 4,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
        pointerEvents: visible ? 'auto' : 'none',
      }}>
        <button onClick={() => panZoomRef.current?.zoomBy(0.8)} style={btnStyle} title="Zoom In"><ZoomInIcon /></button>
        <button onClick={() => panZoomRef.current?.zoomBy(1.25)} style={btnStyle} title="Zoom Out"><ZoomOutIcon /></button>
        <button onClick={() => panZoomRef.current?.fitView()} style={btnStyle} title="Fit to View"><FitIcon /></button>
      </div>
    </div>
  );
}

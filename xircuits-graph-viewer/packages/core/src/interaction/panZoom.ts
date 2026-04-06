export interface PanZoomOptions {
  minZoom?: number;
  maxZoom?: number;
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
}

export interface PanZoomInstance {
  destroy: () => void;
  zoomBy: (factor: number) => void;
  fitView: () => void;
}

export function attachPanZoom(
  svg: SVGSVGElement,
  options: PanZoomOptions = {},
): PanZoomInstance {
  const { minZoom = 0.1, maxZoom = 4, onViewportChange } = options;

  const initialViewBox = readViewBox();
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let panStartVB = { x: 0, y: 0, w: 0, h: 0 };

  function readViewBox() {
    const vb = svg.getAttribute('viewBox')?.split(/\s+/).map(Number) || [0, 0, 800, 600];
    return { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
  }

  function writeViewBox(vb: { x: number; y: number; w: number; h: number }) {
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    onViewportChange?.({ x: vb.x, y: vb.y, zoom: svg.clientWidth / vb.w });
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const rect = svg.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    applyZoom(factor, mx, my);
  }

  function applyZoom(factor: number, anchorX = 0.5, anchorY = 0.5) {
    const vb = readViewBox();
    const newW = vb.w * factor;
    const newH = vb.h * factor;

    const currentZoom = svg.clientWidth / vb.w;
    const newZoom = svg.clientWidth / newW;
    if (newZoom < minZoom || newZoom > maxZoom) return;

    vb.x += (vb.w - newW) * anchorX;
    vb.y += (vb.h - newH) * anchorY;
    vb.w = newW;
    vb.h = newH;
    writeViewBox(vb);
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
    panStartVB = readViewBox();
    svg.setPointerCapture(e.pointerId);
    svg.style.cursor = 'grabbing';
  }

  function onPointerMove(e: PointerEvent) {
    if (!isPanning) return;
    const rect = svg.getBoundingClientRect();
    const vb = panStartVB;
    const dx = (e.clientX - startX) / rect.width * vb.w;
    const dy = (e.clientY - startY) / rect.height * vb.h;
    writeViewBox({ x: vb.x - dx, y: vb.y - dy, w: vb.w, h: vb.h });
  }

  function onPointerUp(e: PointerEvent) {
    if (!isPanning) return;
    isPanning = false;
    svg.releasePointerCapture(e.pointerId);
    svg.style.cursor = 'grab';
  }

  svg.style.cursor = 'grab';
  svg.addEventListener('wheel', onWheel, { passive: false });
  svg.addEventListener('pointerdown', onPointerDown);
  svg.addEventListener('pointermove', onPointerMove);
  svg.addEventListener('pointerup', onPointerUp);

  return {
    destroy() {
      svg.removeEventListener('wheel', onWheel);
      svg.removeEventListener('pointerdown', onPointerDown);
      svg.removeEventListener('pointermove', onPointerMove);
      svg.removeEventListener('pointerup', onPointerUp);
    },
    zoomBy(factor: number) {
      applyZoom(factor);
    },
    fitView() {
      writeViewBox(initialViewBox);
    },
  };
}

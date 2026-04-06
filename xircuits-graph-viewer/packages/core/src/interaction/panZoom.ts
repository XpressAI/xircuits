export interface PanZoomOptions {
  minZoom?: number;
  maxZoom?: number;
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
}

export function attachPanZoom(
  svg: SVGSVGElement,
  options: PanZoomOptions = {},
): { destroy: () => void } {
  const { minZoom = 0.1, maxZoom = 4, onViewportChange } = options;

  let viewBox = parseViewBox(svg);
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let startVBX = 0;
  let startVBY = 0;

  function parseViewBox(el: SVGSVGElement) {
    const vb = el.getAttribute('viewBox')?.split(/\s+/).map(Number) || [0, 0, 800, 600];
    return { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
  }

  function updateViewBox() {
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
    onViewportChange?.({
      x: viewBox.x,
      y: viewBox.y,
      zoom: svg.clientWidth / viewBox.w,
    });
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const rect = svg.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const newW = viewBox.w * factor;
    const newH = viewBox.h * factor;

    // Enforce zoom limits
    const currentZoom = svg.clientWidth / viewBox.w;
    const newZoom = svg.clientWidth / newW;
    if (newZoom < minZoom || newZoom > maxZoom) return;

    viewBox.x += (viewBox.w - newW) * mx;
    viewBox.y += (viewBox.h - newH) * my;
    viewBox.w = newW;
    viewBox.h = newH;

    updateViewBox();
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
    startVBX = viewBox.x;
    startVBY = viewBox.y;
    svg.setPointerCapture(e.pointerId);
    svg.style.cursor = 'grabbing';
  }

  function onPointerMove(e: PointerEvent) {
    if (!isPanning) return;
    const rect = svg.getBoundingClientRect();
    const dx = (e.clientX - startX) / rect.width * viewBox.w;
    const dy = (e.clientY - startY) / rect.height * viewBox.h;
    viewBox.x = startVBX - dx;
    viewBox.y = startVBY - dy;
    updateViewBox();
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
  };
}

import { parse, renderToElement, getCanvasStyle } from 'xircuits-graph-core';
import { attachPanZoom } from 'xircuits-graph-core/interaction';

let currentTheme = 'dark';
let currentJson = null;
let cleanupPanZoom = null;

const viewer = document.getElementById('viewer');
const fileInput = document.getElementById('file-input');
const filenameEl = document.getElementById('filename');
const themeToggle = document.getElementById('theme-toggle');
const dropZone = document.getElementById('drop-zone');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const fitBtn = document.getElementById('fit');
const controls = document.getElementById('controls');

// Store the current SVG element and viewBox for zoom/fit
let currentSvg = null;
let originalViewBox = null;

function renderGraph(json, name) {
  currentJson = json;

  let graph;
  try {
    graph = parse(json);
  } catch (e) {
    viewer.innerHTML = `<div class="empty-state"><p style="color:#ef4444">Error: ${e.message}</p></div>`;
    return;
  }

  if (cleanupPanZoom) {
    cleanupPanZoom();
    cleanupPanZoom = null;
  }

  const svg = renderToElement(graph, {
    theme: currentTheme,
    fitView: true,
    padding: 50,
  });

  // Apply container background (dot grid)
  viewer.style.cssText = getCanvasStyle(currentTheme);
  viewer.innerHTML = '';
  viewer.appendChild(svg);

  // Make SVG fill the container
  svg.style.width = '100%';
  svg.style.height = '100%';

  currentSvg = svg;
  originalViewBox = svg.getAttribute('viewBox');

  cleanupPanZoom = attachPanZoom(svg).destroy;
  controls.style.display = 'flex';

  if (name) filenameEl.textContent = name;
}

function zoomBy(factor) {
  if (!currentSvg) return;
  const vb = currentSvg.getAttribute('viewBox').split(/\s+/).map(Number);
  const cx = vb[0] + vb[2] / 2;
  const cy = vb[1] + vb[3] / 2;
  const newW = vb[2] * factor;
  const newH = vb[3] * factor;
  currentSvg.setAttribute('viewBox',
    `${cx - newW / 2} ${cy - newH / 2} ${newW} ${newH}`);
}

function fitView() {
  if (!currentSvg || !originalViewBox) return;
  currentSvg.setAttribute('viewBox', originalViewBox);
}

function handleFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      renderGraph(json, file.name);
    } catch {
      viewer.innerHTML = '<div class="empty-state"><p style="color:#ef4444">Invalid JSON file</p></div>';
    }
  };
  reader.readAsText(file);
}

// File input
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

// Drag and drop
dropZone?.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone?.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFile(e.dataTransfer.files[0]); });
dropZone?.addEventListener('click', () => fileInput.click());

viewer.addEventListener('dragover', (e) => e.preventDefault());
viewer.addEventListener('drop', (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); });

// Controls
zoomInBtn.addEventListener('click', () => zoomBy(0.8));
zoomOutBtn.addEventListener('click', () => zoomBy(1.25));
fitBtn.addEventListener('click', fitView);

themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  themeToggle.textContent = currentTheme === 'dark' ? 'Light' : 'Dark';
  if (currentJson) renderGraph(currentJson);
});

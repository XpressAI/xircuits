import { parse, renderToElement, getCanvasStyle } from '@xpressai/xircuits-viewer';
import { attachPanZoom } from '@xpressai/xircuits-viewer/interaction';

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
let panZoom = null;

function renderGraph(json, name) {
  currentJson = json;

  let graph;
  try {
    graph = parse(json);
  } catch (e) {
    viewer.innerHTML = `<div class="empty-state"><p style="color:#ef4444">Error: ${e.message}</p></div>`;
    return;
  }

  if (panZoom) {
    panZoom.destroy();
    panZoom = null;
  }

  const svg = renderToElement(graph, {
    theme: currentTheme,
    fitView: true,
    padding: 50,
  });

  viewer.style.cssText = getCanvasStyle(currentTheme);
  viewer.innerHTML = '';
  viewer.appendChild(svg);

  svg.style.width = '100%';
  svg.style.height = '100%';

  panZoom = attachPanZoom(svg);
  controls.style.display = 'flex';

  if (name) filenameEl.textContent = name;
}

function zoomBy(factor) {
  panZoom?.zoomBy(factor);
}

function fitView() {
  panZoom?.fitView();
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

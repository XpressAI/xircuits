# @xpressai/xircuits-viewer

Pure SVG renderer for `.xircuits` workflow files. Zero runtime dependencies. Parses the JSON format and produces self-contained SVG that visually matches the Xircuits editor.

![HelloXircuits rendered](https://raw.githubusercontent.com/XpressAI/xircuits/master/xircuits-graph-viewer/xircuits-hello.png)

## Install

```bash
npm install @xpressai/xircuits-viewer
```

## Usage

### From a URL (browser)

```js
import { renderFromUrl } from '@xpressai/xircuits-viewer';

const svg = await renderFromUrl('/workflows/MyWorkflow.xircuits', { theme: 'dark' });
document.getElementById('viewer').innerHTML = svg;
```

### From JSON data

```js
import { renderXircuits } from '@xpressai/xircuits-viewer';

const svg = renderXircuits(workflowJson, { theme: 'dark' });
```

### With pan/zoom

```js
import { parse, renderToElement } from '@xpressai/xircuits-viewer';
import { attachPanZoom } from '@xpressai/xircuits-viewer/interaction';

const res = await fetch('/workflows/MyWorkflow.xircuits');
const svg = renderToElement(parse(await res.json()), { theme: 'dark' });
document.body.appendChild(svg);
const { destroy, zoomBy, fitView } = attachPanZoom(svg);
```

### Container background

The SVG renders just the graph content. Apply the Xircuits dot-grid background on your container:

```js
import { getCanvasStyle } from '@xpressai/xircuits-viewer';

container.style.cssText = getCanvasStyle('dark');
```

## API

| Function | Description |
|----------|-------------|
| `renderFromUrl(url, options?)` | Fetch a `.xircuits` URL and return SVG string |
| `renderXircuits(json, options?)` | Parse JSON + render to SVG string |
| `parse(json)` | Parse `.xircuits` JSON into `XGraph` |
| `renderToString(graph, options?)` | Render `XGraph` to SVG string |
| `renderToElement(graph, options?)` | Render `XGraph` to DOM `SVGSVGElement` |
| `validate(json)` | Validate without parsing |
| `getCanvasStyle(theme?)` | CSS string for the dot-grid container background |
| `attachPanZoom(svg, options?)` | Add pan/zoom, returns `{ destroy, zoomBy, fitView }` |

### RenderOptions

```ts
{
  theme?: 'dark' | 'light';
  width?: number;
  height?: number;
  padding?: number;
  fitView?: boolean;
  className?: string;
}
```

## React

See [`@xpressai/xircuits-viewer-react`](https://www.npmjs.com/package/@xpressai/xircuits-viewer-react) for React components.

## License

MIT

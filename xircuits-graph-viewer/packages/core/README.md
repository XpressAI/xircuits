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

### Python component → node

Turn a single `@xai_component`-decorated Python class into an `XGraph` with one node — useful for live previews, docs playgrounds, or tooling that consumes component source.

```js
import { parsePythonComponent, renderToString } from '@xpressai/xircuits-viewer';

const { graph, error, warnings } = parsePythonComponent(`
@xai_component(color="blue")
class GreetUser(Component):
    name: InArg[str]
    message: OutArg[str]
`);

if (graph) {
  const svg = renderToString(graph, { theme: 'dark' });
}
```

Recognises the decorator (`color`), `InArg`/`InCompArg`/`OutArg`/`BaseComponent` fields, and docstrings (ignored). Python types are normalised (`str` → `string`, `bool` → `boolean`, `List[...]` → `list`) so port icons match those in real `.xircuits` workflows.

Regex-based and lightweight — it's designed for live-preview ergonomics, not arbitrary Python. Parses the first `@xai_component` class it finds.

### Container background

The SVG renders just the graph content. Apply the Xircuits dot-grid background on your container:

```js
import { getCanvasStyle } from '@xpressai/xircuits-viewer';

container.style.cssText = getCanvasStyle('dark');
```

## Minifier

`.xircuits` files from the Xircuits editor carry full UUIDs and high-precision coordinates that the viewer doesn't need. A bundled minifier cuts file size 57–85% so workflows load faster over the network.

### CLI

```bash
# Safe mode (best-effort compatible with the JupyterLab editor)
npx xircuits-minify MyWorkflow.xircuits

# Viewer-only; shortens UUIDs and strips cosmetic fields
npx xircuits-minify MyWorkflow.xircuits --aggressive

# Tune coordinate precision (default 0 = integer pixels)
npx xircuits-minify MyWorkflow.xircuits --precision 1
```

### Library

```js
import { minify, minifyWithStats } from '@xpressai/xircuits-viewer';

const compact = minify(workflowJson, { aggressive: true });
const { output, stats } = minifyWithStats(workflowJson);
// stats: { inputBytes, outputBytes, ratio, nodes, edges, ports, mode, precision }
```

## API

| Function | Description |
|----------|-------------|
| `renderFromUrl(url, options?)` | Fetch a `.xircuits` URL and return SVG string |
| `renderXircuits(json, options?)` | Parse JSON + render to SVG string |
| `parse(json)` | Parse `.xircuits` JSON into `XGraph` |
| `parsePythonComponent(source, options?)` | Parse Python component source into `{ graph, error, warnings }` |
| `renderToString(graph, options?)` | Render `XGraph` to SVG string |
| `renderToElement(graph, options?)` | Render `XGraph` to DOM `SVGSVGElement` |
| `validate(json)` | Validate without parsing |
| `getCanvasStyle(theme?)` | CSS string for the dot-grid container background |
| `attachPanZoom(svg, options?)` | Add pan/zoom, returns `{ destroy, zoomBy, fitView }` |
| `minify(json, options?)` | Minify a `.xircuits` JSON, returns compact string |
| `minifyWithStats(json, options?)` | Same, plus size/counts stats |

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

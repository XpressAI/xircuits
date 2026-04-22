# @xpressai/xircuits-viewer-react

React components for rendering `.xircuits` workflow files. Built on [`@xpressai/xircuits-viewer`](https://www.npmjs.com/package/@xpressai/xircuits-viewer).

![HelloXircuits rendered](https://raw.githubusercontent.com/XpressAI/xircuits/master/xircuits-graph-viewer/xircuits-hello.png)

## Install

```bash
npm install @xpressai/xircuits-viewer @xpressai/xircuits-viewer-react
```

## Usage

### Interactive (with pan/zoom)

```tsx
import { XircuitsGraph } from '@xpressai/xircuits-viewer-react';

// Point it at a .xircuits file — that's it
<XircuitsGraph src="/workflows/MyWorkflow.xircuits" />
```

With options:

```tsx
<XircuitsGraph
  src="/workflows/MyWorkflow.xircuits"
  theme="dark"
  height={500}
  interactive
  onNodeClick={(node) => console.log(node.name)}
/>
```

### Static (SSR-safe)

```tsx
import { XircuitsGraphStatic } from '@xpressai/xircuits-viewer-react';

<XircuitsGraphStatic src="/workflows/MyWorkflow.xircuits" theme="dark" />
```

### Pre-loaded data

```tsx
import workflow from './MyWorkflow.xircuits';

<XircuitsGraph data={workflow} />
```

### Live component preview (Python → node)

Drop-in: a two-line demo with a textarea editor and a live-updating node preview.

```tsx
import { ComponentPreview } from '@xpressai/xircuits-viewer-react';

<ComponentPreview value={code} onChange={setCode} />
```

Plug in a real editor (CodeMirror, Monaco, etc.) via the `editor` prop:

```tsx
import { ComponentPreview } from '@xpressai/xircuits-viewer-react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';

<ComponentPreview
  value={code}
  onChange={setCode}
  editor={({ value, onChange }) => (
    <CodeMirror value={value} onChange={onChange} extensions={[python()]} height="100%" />
  )}
  theme="dark"
/>
```

For full control over layout, skip `<ComponentPreview>` and compose it yourself — `parsePythonComponent` (re-exported here from `@xpressai/xircuits-viewer`) is a pure function, and `<XircuitsGraph>` accepts a pre-built graph:

```tsx
import { XircuitsGraph, parsePythonComponent } from '@xpressai/xircuits-viewer-react';

const { graph } = parsePythonComponent(pythonSource);
return graph ? <XircuitsGraph graph={graph} /> : null;
```

The parser itself is documented in the [core package README](../core/README.md#python-component--node) — what it recognises, what it doesn't, and how Python types map to xircuits type names.

## Props

### XircuitsGraph

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | URL to a `.xircuits` file |
| `data` | `object` | — | Pre-loaded JSON (takes precedence over `src`) |
| `graph` | `XGraph` | — | Pre-parsed graph (takes precedence over both `data` and `src`) |
| `theme` | `'dark' \| 'light'` | `'dark'` | Color theme |
| `showCanvasBackground` | `boolean` | `true` | Render the Xircuits dot-grid background on the container |
| `interactive` | `boolean` | `true` | Enable pan/zoom |
| `showControls` | `boolean` | same as `interactive` | Show zoom +/−/fit buttons in the corner |
| `fitView` | `boolean` | `true` | Auto-fit the graph on first render |
| `height` | `number \| string` | `400` | Container height |
| `width` | `number \| string` | `'100%'` | Container width |
| `padding` | `number` | `40` | Viewport padding |
| `onNodeClick` | `(node) => void` | — | Node click handler |
| `onEdgeClick` | `(edge) => void` | — | Edge click handler |
| `onError` | `(error) => void` | — | Error handler |

### XircuitsGraphStatic

Same props as above, minus `interactive`, `onNodeClick`, `onEdgeClick`.

### ComponentPreview

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | *required* | Python source code |
| `onChange` | `(v: string) => void` | *required* | Called on edit |
| `editor` | `React.ComponentType<{ value, onChange, language }>` | plain `<textarea>` | Editor slot — plug in Monaco, CodeMirror, etc. |
| `debounceMs` | `number` | `200` | Delay between typing and re-parsing |
| `onParseResult` | `(result) => void` | — | Fires on every re-parse with `{ graph, error, warnings }` |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | Editor/preview arrangement |
| `containerWidth` | `number \| string` | `'100%'` | Container width |
| `containerHeight` | `number \| string` | `400` | Container height |
| `editorRatio` | `number` | `0.5` | Editor size as a fraction of the container |
| *…XircuitsGraph props* | — | — | `theme`, `fitView`, `showControls`, etc. pass through to the viewer |

### parsePythonComponent

```ts
parsePythonComponent(source: string, options?: ParsePythonOptions): {
  graph: XGraph | null;   // null on fatal parse error
  error: string | null;   // human-readable fatal error
  warnings: string[];     // non-fatal notes (e.g. missing decorator)
}
```

`ParsePythonOptions`: `{ defaultColor?, includeFlowIn?, includeFlowOut? }`.

## License

MIT

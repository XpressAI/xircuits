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

## Props

### XircuitsGraph

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | URL to a `.xircuits` file |
| `data` | `object` | — | Pre-loaded JSON (takes precedence over `src`) |
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

## License

MIT

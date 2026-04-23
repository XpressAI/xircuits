import React, { useEffect, useMemo, useRef, useState } from 'react';
import { XircuitsGraph } from './XircuitsGraph.js';
import type { XircuitsGraphProps } from './XircuitsGraph.js';
import { parsePythonComponent } from '@xpressai/xircuits-viewer';
import type { ParseResult } from '@xpressai/xircuits-viewer';

export interface ComponentEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'python';
}

type GraphPassThrough = Omit<XircuitsGraphProps, 'src' | 'data' | 'graph'>;

export interface ComponentPreviewProps extends GraphPassThrough {
  /** Python source code to parse. */
  value: string;
  /** Called when the user edits the code. */
  onChange: (value: string) => void;
  /**
   * Editor component. Receives `{ value, onChange, language: 'python' }`.
   * Defaults to a plain <textarea>. Consumers plug in Monaco, CodeMirror, etc.
   */
  editor?: React.ComponentType<ComponentEditorProps>;
  /** Debounce in ms between typing and re-parsing. Defaults to 200. */
  debounceMs?: number;
  /** Called on parse result (fatal or warnings). Fires on every re-parse. */
  onParseResult?: (result: ParseResult) => void;
  /**
   * Layout direction of editor vs preview. Default 'horizontal' (editor left,
   * preview right).
   */
  layout?: 'horizontal' | 'vertical';
  /** Container width. Defaults to 100%. */
  containerWidth?: number | string;
  /** Container height. Defaults to 400. */
  containerHeight?: number | string;
  /** Ratio of editor-to-preview width (horizontal) or height (vertical). Default 0.5. */
  editorRatio?: number;
}

function DefaultTextareaEditor({ value, onChange }: ComponentEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      style={{
        width: '100%',
        height: '100%',
        border: 0,
        outline: 0,
        resize: 'none',
        background: '#0d0d14',
        color: '#e4e4ea',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 13,
        padding: 14,
        lineHeight: 1.6,
        tabSize: 4,
      }}
    />
  );
}

export function ComponentPreview({
  value,
  onChange,
  editor: Editor = DefaultTextareaEditor,
  debounceMs = 200,
  onParseResult,
  layout = 'horizontal',
  containerWidth = '100%',
  containerHeight = 400,
  editorRatio = 0.5,
  ...graphProps
}: ComponentPreviewProps) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), debounceMs);
    return () => clearTimeout(id);
  }, [value, debounceMs]);

  const parsed = useMemo(() => parsePythonComponent(debounced), [debounced]);

  // Report parse results to consumer.
  const lastReportedRef = useRef<ParseResult | null>(null);
  useEffect(() => {
    if (onParseResult && parsed !== lastReportedRef.current) {
      lastReportedRef.current = parsed;
      onParseResult(parsed);
    }
  }, [parsed, onParseResult]);

  // Keep the last good graph visible while the user edits into an invalid state.
  const lastGoodGraphRef = useRef(parsed.graph);
  if (parsed.graph) lastGoodGraphRef.current = parsed.graph;
  const graphToShow = lastGoodGraphRef.current;

  const isHoriz = layout === 'horizontal';
  const editorPct = `${Math.max(10, Math.min(90, editorRatio * 100))}%`;
  const previewPct = `${100 - Math.max(10, Math.min(90, editorRatio * 100))}%`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isHoriz ? 'row' : 'column',
        width: typeof containerWidth === 'number' ? `${containerWidth}px` : containerWidth,
        height: typeof containerHeight === 'number' ? `${containerHeight}px` : containerHeight,
        minHeight: 0,
      }}
    >
      <div style={{ [isHoriz ? 'width' : 'height']: editorPct, minHeight: 0, minWidth: 0 }}>
        <Editor value={value} onChange={onChange} language="python" />
      </div>
      <div style={{ [isHoriz ? 'width' : 'height']: previewPct, minHeight: 0, minWidth: 0, position: 'relative' }}>
        {graphToShow && (
          <XircuitsGraph
            graph={graphToShow}
            width="100%"
            height="100%"
            {...graphProps}
          />
        )}
        {!graphToShow && parsed.error && (
          <div style={{ padding: 16, color: '#888', fontSize: 13 }}>{parsed.error}</div>
        )}
      </div>
    </div>
  );
}

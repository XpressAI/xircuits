import React, { useEffect, useMemo, useRef, useState } from 'react';
import { XircuitsGraph, parsePythonComponent } from '@xpressai/xircuits-viewer-react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useColorMode } from '@docusaurus/theme-common';

const STARTER = `@xai_component(color="blue")
class GreetUser(Component):
    """Greets a user by name."""

    name: InArg[str]
    times: InCompArg[int]
    greeting: InArg[str]

    message: OutArg[str]

    body: BaseComponent

    def execute(self, ctx) -> None:
        self.message.value = f"Hello, {self.name.value}!"
`;

const DEBOUNCE_MS = 150;

function EditorChrome({ theme }) {
  const isDark = theme === 'dark';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: isDark
          ? 'linear-gradient(180deg, #15151c 0%, #101018 100%)'
          : 'linear-gradient(180deg, #f6f6fa 0%, #ededf3 100%)',
        borderBottom: isDark ? '1px solid #22222e' : '1px solid #e4e4ec',
        fontSize: 12,
      }}
    >
      <div style={{ display: 'flex', gap: 6 }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
      </div>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          padding: '4px 10px',
          borderRadius: '6px 6px 0 0',
          border: isDark ? '1px solid #22222e' : '1px solid #e4e4ec',
          borderBottom: 'none',
          marginBottom: -11,
          paddingBottom: 12,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 11.5,
          color: isDark ? '#eaeaf2' : '#222',
        }}
      >
        <span
          style={{
            width: 11,
            height: 11,
            display: 'inline-block',
            background: 'linear-gradient(135deg, #3776ab 50%, #ffd343 50%)',
            borderRadius: 2,
          }}
        />
        greet_user.py
      </div>
    </div>
  );
}

export default function HomeLivePreviewInner() {
  const [code, setCode] = useState(STARTER);
  const [debounced, setDebounced] = useState(STARTER);
  const { colorMode } = useColorMode();
  const theme = colorMode === 'dark' ? 'dark' : 'light';
  const isDark = theme === 'dark';

  useEffect(() => {
    const id = setTimeout(() => setDebounced(code), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [code]);

  const parsed = useMemo(() => parsePythonComponent(debounced), [debounced]);
  const lastGoodRef = useRef(parsed.graph);
  if (parsed.graph) lastGoodRef.current = parsed.graph;
  const graph = lastGoodRef.current;

  const panelStyle = {
    borderRadius: 14,
    overflow: 'hidden',
    border: isDark ? '1px solid #26262e' : '1px solid #e0e0e8',
    background: isDark ? '#0d0d14' : '#ffffff',
    boxShadow: isDark
      ? '0 20px 40px -20px rgba(0, 0, 0, 0.6)'
      : '0 10px 30px -15px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  };

  return (
    <section
      style={{
        padding: '48px 0 56px',
        background: isDark ? '#0f0f14' : '#f8f8fb',
        borderTop: isDark ? '1px solid #222' : '1px solid #e2e2ea',
        borderBottom: isDark ? '1px solid #222' : '1px solid #e2e2ea',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}
          >
            Write Python, see the node.
          </h2>
          <p
            style={{
              color: isDark ? '#9898a5' : '#666',
              fontSize: '1rem',
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            A xircuits component is just a Python class. Edit the code on the left;
            the node preview on the right updates as you type.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            alignItems: 'stretch',
          }}
          className="home-live-preview-grid"
        >
          {/* Editor card */}
          <div style={panelStyle}>
            <EditorChrome theme={theme} />
            <div style={{ flex: 1, minHeight: 440, overflow: 'hidden' }}>
              <CodeMirror
                value={code}
                onChange={setCode}
                height="100%"
                theme={isDark ? 'dark' : 'light'}
                extensions={[python()]}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  foldGutter: false,
                }}
                style={{ height: '100%', fontSize: 13 }}
              />
            </div>
          </div>

          {/* Viewer card */}
          <div style={panelStyle}>
            <div style={{ flex: 1, minHeight: 440, position: 'relative' }}>
              {graph && (
                <XircuitsGraph
                  graph={graph}
                  width="100%"
                  height="100%"
                  theme={theme}
                  fitView
                  interactive
                  showControls={false}
                  showCanvasBackground
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .home-live-preview-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

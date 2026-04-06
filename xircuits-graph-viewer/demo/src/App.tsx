import React, { useState } from 'react';
import { parse, renderToString } from 'xircuits-graph-core';
import helloXircuits from './fixtures/HelloXircuits.xircuits';

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const graph = parse(helloXircuits);
  const svgString = renderToString(graph, { theme, fitView: true, padding: 40 });

  return (
    <div>
      <h1>Xircuits Graph Viewer Demo</h1>
      <div className="container">
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            style={{
              padding: '6px 16px',
              background: '#333',
              color: 'white',
              border: '1px solid #555',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Toggle Theme ({theme})
          </button>
        </div>
        <div
          className="viewer"
          style={{
            height: 500,
            background: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
          }}
          dangerouslySetInnerHTML={{ __html: svgString }}
        />
      </div>
    </div>
  );
}

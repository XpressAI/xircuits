import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TreeView, TreeItem } from '@jupyter/react-components';
import { getTreeItemElement } from '@jupyterlab/ui-components';
import type { IONode } from './portPreview';

function useHostWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(e => e[0]?.contentRect && setW(e[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width: w };
}

function useMeasureFont() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = getComputedStyle(document.body).font || '13px sans-serif';
    return (s: string) => ctx.measureText(s).width;
  }, []);
}

// Split text into multiple lines based on available pixel width
function wrapByWidth(
  text: string,
  maxW: number,
  measure: (s: string) => number
): string[] {
  const result: string[] = [];
  const lines = text.split(/\r?\n/);

  for (let k = 0; k < lines.length; k++) {
    const line = lines[k];

    if (line === '') {
      // Preserve empty lines
      result.push('');
      continue;
    }

    let cur = '';
    const tokens = line.split(/(\s+)/);

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      const next = cur + tok;

      if (!cur || measure(next) <= maxW) {
        cur = next;
      } else {
        result.push(cur);
        cur = tok.replace(/^\s+/, '');
      }
    }

    if (cur) {
      result.push(cur);
    }
  }

  // Remove trailing empty line if it exists
  while (result.length && result[result.length - 1].trim() === '') {
    result.pop();
  }

  return result;
}

const Item: React.FC<{
  n: IONode;
  d?: number;
  hostWidth: number;
  measure: (s: string) => number;
}> = ({ n, d = 0, hostWidth, measure }) => {
  const [open, setOpen] = useState(true);
  const styles = getComputedStyle(document.documentElement);
  const INDENT = parseInt(styles.getPropertyValue('--io-indent')) || 16;
  const PAD_L  = parseInt(styles.getPropertyValue('--io-pad-left')) || 32;
  const PAD_R  = parseInt(styles.getPropertyValue('--io-pad-right')) || 24;
  const avail = Math.max(80, hostWidth - PAD_L - PAD_R - d * INDENT);

  const onToggle = (e: React.MouseEvent) => {
    const it = getTreeItemElement(e.target as HTMLElement);
    if (e.currentTarget === it) setOpen(o => !o);
  };

  const valueLines = n.valueBlock
    ? wrapByWidth(n.valueBlock, avail, measure)
    : null;

  return (
    <TreeItem
      className={`jp-TreeItem${d ? ' nested' : ''}`}
      expanded={open}
      onClick={onToggle}
    >
    {n.label && (
      <span
        className={`jp-TreeItem-label${n.valueBlock ? ' io-label-ellipsis' : ''}`}
        title={n.label}
      >
        {n.label}
      </span>
)}

      {valueLines &&
        valueLines.map((seg, i) => (
          <TreeItem key={i} className="jp-TreeItem nested" expanded>
            <span className="jp-TreeItem-label">{seg}</span>
          </TreeItem>
        ))}

      {n.children?.map((c, i) => (
        <Item
          key={i}
          n={c}
          d={d + 1}
          hostWidth={hostWidth}
          measure={measure}
        />
      ))}
    </TreeItem>
  );
};

export const IONodeTree: React.FC<{ data: IONode[] }> = ({ data }) => {
  const { ref, width } = useHostWidth();
  const measure = useMeasureFont();

  return (
    <div ref={ref}>
      <TreeView className="jp-TreeView">
        {data.map((n, i) => (
          <Item key={i} n={n} hostWidth={width} measure={measure} />
        ))}
      </TreeView>
    </div>
  );
};

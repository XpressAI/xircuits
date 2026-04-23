import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from '../packages/core/src/parser/parse.js';
import {
  minify,
  minifyWithStats,
} from '../packages/core/src/minifier/index.js';

const fixtureDir = resolve(__dirname, 'fixtures');

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(fixtureDir, name), 'utf-8'));
}

function collectIds(obj: unknown, out: Set<string> = new Set()): Set<string> {
  if (obj && typeof obj === 'object') {
    if (!Array.isArray(obj)) {
      const o = obj as Record<string, unknown>;
      if (typeof o.id === 'string') out.add(o.id);
      for (const v of Object.values(o)) collectIds(v, out);
    } else {
      for (const v of obj) collectIds(v, out);
    }
  }
  return out;
}

describe('minify (safe mode)', () => {
  const input = loadFixture('HelloXircuits.xircuits');

  it('produces valid .xircuits JSON that parse() accepts', () => {
    const out = minify(input);
    const reparsed = JSON.parse(out);
    expect(() => parse(reparsed)).not.toThrow();
  });

  it('preserves every original ID byte-for-byte', () => {
    const out = minify(input);
    const reparsed = JSON.parse(out);
    const originalIds = collectIds(input);
    const outputIds = collectIds(reparsed);
    for (const id of originalIds) {
      expect(outputIds.has(id)).toBe(true);
    }
  });

  it('strips selected and locked keys throughout', () => {
    const out = minify(input);
    expect(out).not.toMatch(/"selected":/);
    expect(out).not.toMatch(/"locked":/);
  });

  it('rounds coordinates to the requested precision', () => {
    const out = minify(input, { precision: 0 });
    const reparsed = JSON.parse(out) as Record<string, unknown>;
    const layers = reparsed.layers as Array<Record<string, unknown>>;
    const nodeLayer = layers.find(l => l.type === 'diagram-nodes')!;
    for (const node of Object.values(nodeLayer.models as Record<string, Record<string, unknown>>)) {
      expect(Number.isInteger(node.x)).toBe(true);
      expect(Number.isInteger(node.y)).toBe(true);
    }
  });

  it('honors non-zero precision', () => {
    const out = minify(input, { precision: 1 });
    const reparsed = JSON.parse(out) as Record<string, unknown>;
    const layers = reparsed.layers as Array<Record<string, unknown>>;
    const nodeLayer = layers.find(l => l.type === 'diagram-nodes')!;
    for (const node of Object.values(nodeLayer.models as Record<string, Record<string, unknown>>)) {
      const x = node.x as number;
      expect(Math.abs(x * 10 - Math.round(x * 10))).toBeLessThan(1e-9);
    }
  });

  it('reports consistent stats', () => {
    const { output, stats } = minifyWithStats(input);
    expect(stats.outputBytes).toBe(new TextEncoder().encode(output).length);
    expect(stats.mode).toBe('safe');
    expect(stats.nodes).toBeGreaterThan(0);
    expect(stats.edges).toBeGreaterThan(0);
    expect(stats.ports).toBeGreaterThan(0);
  });
});

describe('minify (aggressive mode)', () => {
  const input = loadFixture('HelloXircuits.xircuits');

  it('produces valid .xircuits JSON that parse() accepts', () => {
    const out = minify(input, { aggressive: true });
    const reparsed = JSON.parse(out);
    expect(() => parse(reparsed)).not.toThrow();
  });

  it('replaces every original ID with a short form', () => {
    const out = minify(input, { aggressive: true });
    const reparsed = JSON.parse(out);
    const originalIds = collectIds(input);
    const outputIds = collectIds(reparsed);
    for (const id of originalIds) {
      expect(outputIds.has(id)).toBe(false);
    }
    for (const id of outputIds) {
      expect(id === 'g' || /^[nep]\d+$/.test(id)).toBe(true);
    }
  });

  it('still resolves every link endpoint to a real node + port', () => {
    const out = minify(input, { aggressive: true });
    const graph = parse(JSON.parse(out));
    const nodeIds = new Set(graph.nodes.map(n => n.id));
    const portIds = new Set(graph.nodes.flatMap(n => [...n.portsIn, ...n.portsOut]).map(p => p.id));

    for (const edge of graph.edges) {
      expect(nodeIds.has(edge.sourceNodeId)).toBe(true);
      expect(nodeIds.has(edge.targetNodeId)).toBe(true);
      expect(portIds.has(edge.sourcePortId)).toBe(true);
      expect(portIds.has(edge.targetPortId)).toBe(true);
    }
  });

  it('preserves port ordering after rename', () => {
    const src = input as Record<string, unknown>;
    const origLayers = src.layers as Array<Record<string, unknown>>;
    const origNodeLayer = origLayers.find(l => l.type === 'diagram-nodes')!;
    const origModels = origNodeLayer.models as Record<string, Record<string, unknown>>;

    const out = minify(input, { aggressive: true });
    const reparsed = JSON.parse(out) as Record<string, unknown>;
    const newLayers = reparsed.layers as Array<Record<string, unknown>>;
    const newNodeLayer = newLayers.find(l => l.type === 'diagram-nodes')!;
    const newModels = newNodeLayer.models as Record<string, Record<string, unknown>>;

    const origNodes = Object.values(origModels);
    const newNodes = Object.values(newModels);
    expect(newNodes.length).toBe(origNodes.length);

    for (let i = 0; i < origNodes.length; i++) {
      const origInCount = (origNodes[i].portsInOrder as string[]).length;
      const origOutCount = (origNodes[i].portsOutOrder as string[]).length;
      expect((newNodes[i].portsInOrder as string[]).length).toBe(origInCount);
      expect((newNodes[i].portsOutOrder as string[]).length).toBe(origOutCount);
    }
  });

  it('strips viewer-unused fields', () => {
    const out = minify(input, { aggressive: true });
    expect(out).not.toMatch(/"curvyness":/);
    expect(out).not.toMatch(/"selectedColor":/);
    expect(out).not.toMatch(/"isSvg":/);
    expect(out).not.toMatch(/"transformed":/);
    expect(out).not.toMatch(/"alignment":/);
    expect(out).not.toMatch(/"parentNode":/);
  });

  it('beats safe mode on size', () => {
    const safe = minify(input, { aggressive: false });
    const aggr = minify(input, { aggressive: true });
    expect(aggr.length).toBeLessThan(safe.length);
  });

  it('tags stats as aggressive', () => {
    const { stats } = minifyWithStats(input, { aggressive: true });
    expect(stats.mode).toBe('aggressive');
  });
});

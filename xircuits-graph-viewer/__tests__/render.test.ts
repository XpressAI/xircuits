import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from '../packages/core/src/parser/parse.js';
import { renderToString } from '../packages/core/src/render/renderGraph.js';
import { computeNodeMetrics } from '../packages/core/src/layout/metrics.js';

const fixtureDir = resolve(__dirname, 'fixtures');

function loadFixture(name: string) {
  return JSON.parse(readFileSync(resolve(fixtureDir, name), 'utf-8'));
}

describe('renderToString', () => {
  it('renders HelloXircuits as valid SVG', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);
    const svg = renderToString(graph, { theme: 'dark' });

    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('data-theme="dark"');
    expect(svg).toContain('</svg>');
  });

  it('includes node elements', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);
    const svg = renderToString(graph);

    expect(svg).toContain('xg-node--start');
    expect(svg).toContain('xg-node--finish');
    expect(svg).toContain('xg-node--component');
    expect(svg).toContain('xg-node--literal');
    expect(svg).toContain('xg-node--comment');
  });

  it('includes edge elements', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);
    const svg = renderToString(graph);

    expect(svg).toContain('xg-edge--flow');
    expect(svg).toContain('xg-edge--data');
  });

  it('includes gradient definitions', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);
    const svg = renderToString(graph);

    expect(svg).toContain('<linearGradient');
    expect(svg).toContain('xg-grad-');
  });

  it('includes CSS styles', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);
    const svg = renderToString(graph);

    expect(svg).toContain('<style>');
    expect(svg).toContain('.xg-root');
    expect(svg).toContain('@keyframes xg-flow');
  });

  it('renders light theme', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);
    const svg = renderToString(graph, { theme: 'light' });

    expect(svg).toContain('data-theme="light"');
  });

  it('includes node names', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);
    const svg = renderToString(graph);

    expect(svg).toContain('Start');
    expect(svg).toContain('Finish');
    expect(svg).toContain('ConcatString');
    expect(svg).toContain('Print');
    expect(svg).toContain('Literal String');
  });

  it('includes comment text', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);
    const svg = renderToString(graph);

    expect(svg).toContain('Xircuits workflows are designed');
  });

  it('includes data-node-id attributes', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);
    const svg = renderToString(graph);

    expect(svg).toContain('data-node-id=');
  });

  it('includes port symbols', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);
    const svg = renderToString(graph);

    // Flow port icons
    expect(svg).toContain('xg-flow-in');
    expect(svg).toContain('xg-flow-out');
  });
});

describe('computeNodeMetrics', () => {
  it('computes metrics for a component node', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);
    const concat = graph.nodes.find(n => n.name === 'ConcatString')!;
    const metrics = computeNodeMetrics(concat);

    expect(metrics.width).toBeGreaterThanOrEqual(100);
    expect(metrics.height).toBeGreaterThan(26); // title + ports
    expect(metrics.titleHeight).toBe(26);
    expect(metrics.portPositions.size).toBe(5); // 3 in + 2 out
  });

  it('computes metrics for a comment node', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);
    const comment = graph.nodes.find(n => n.kind === 'comment')!;
    const metrics = computeNodeMetrics(comment);

    expect(metrics.width).toBeGreaterThan(0);
    expect(metrics.height).toBeGreaterThan(0);
    expect(metrics.titleHeight).toBe(0);
  });

  it('computes metrics for a literal node', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);
    const literal = graph.nodes.find(n => n.kind === 'literal')!;
    const metrics = computeNodeMetrics(literal);

    expect(metrics.width).toBeGreaterThanOrEqual(100);
    expect(metrics.height).toBe(26 + 19); // title + 1 port row (PORT_ROW_HEIGHT=19)
  });
});

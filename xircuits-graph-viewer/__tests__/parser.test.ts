import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from '../packages/core/src/parser/parse.js';
import { validate } from '../packages/core/src/parser/validate.js';

const fixtureDir = resolve(__dirname, 'fixtures');

function loadFixture(name: string) {
  return JSON.parse(readFileSync(resolve(fixtureDir, name), 'utf-8'));
}

describe('validate', () => {
  it('validates a correct .xircuits file', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const result = validate(json);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects non-object input', () => {
    const result = validate('not an object');
    expect(result.valid).toBe(false);
  });

  it('rejects missing layers', () => {
    const result = validate({ id: 'test' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing or invalid "layers" array');
  });
});

describe('parse', () => {
  it('parses HelloXircuits correctly', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);

    expect(graph.id).toBe('11b9d835-f7c3-4b78-a927-bec01ae39956');
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it('classifies Start node correctly', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);

    const start = graph.nodes.find(n => n.name === 'Start');
    expect(start).toBeDefined();
    expect(start!.kind).toBe('start');
    expect(start!.color).toBe('rgb(255,102,102)');
  });

  it('classifies Finish node correctly', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);

    const finish = graph.nodes.find(n => n.name === 'Finish');
    expect(finish).toBeDefined();
    expect(finish!.kind).toBe('finish');
  });

  it('classifies Literal nodes correctly', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);

    const literals = graph.nodes.filter(n => n.kind === 'literal');
    expect(literals.length).toBe(2); // Two "Literal String" nodes
  });

  it('classifies Comment nodes correctly', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);

    const comments = graph.nodes.filter(n => n.kind === 'comment');
    expect(comments.length).toBe(5);
    expect(comments[0].extras.commentInput).toBeDefined();
  });

  it('classifies component nodes correctly', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);

    const concat = graph.nodes.find(n => n.name === 'ConcatString');
    expect(concat).toBeDefined();
    expect(concat!.kind).toBe('component');
  });

  it('parses ports correctly', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);

    const concat = graph.nodes.find(n => n.name === 'ConcatString')!;
    expect(concat.portsIn.length).toBe(3); // flow + a + b
    expect(concat.portsOut.length).toBe(2); // flow + out

    const flowIn = concat.portsIn.find(p => p.kind === 'flow');
    expect(flowIn).toBeDefined();
    expect(flowIn!.label).toBe('▶');

    const paramA = concat.portsIn.find(p => p.label === 'a');
    expect(paramA).toBeDefined();
    expect(paramA!.kind).toBe('parameter');
    expect(paramA!.dataType).toBe('string');
  });

  it('parses edges correctly', () => {
    const json = loadFixture('HelloXircuits.xircuits');
    const graph = parse(json);

    const flowEdges = graph.edges.filter(e => e.kind === 'flow');
    const dataEdges = graph.edges.filter(e => e.kind === 'data');

    expect(flowEdges.length).toBe(3); // Start→Concat→Print→Finish
    expect(dataEdges.length).toBe(3); // Two literals→Concat, Concat→Print
  });
});

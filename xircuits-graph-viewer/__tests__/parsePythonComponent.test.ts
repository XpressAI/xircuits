import { describe, it, expect } from 'vitest';
import { parsePythonComponent } from '../packages/core/src/parsePythonComponent.js';

describe('parsePythonComponent', () => {
  it('returns an error on empty input', () => {
    const r = parsePythonComponent('');
    expect(r.graph).toBeNull();
    expect(r.error).toBeTruthy();
  });

  it('returns an error when no class is present', () => {
    const r = parsePythonComponent('# just a comment\nx = 1\n');
    expect(r.graph).toBeNull();
    expect(r.error).toMatch(/class/i);
  });

  it('parses class name and default color when decorator missing', () => {
    const r = parsePythonComponent(`class MyComp(Component):\n    pass\n`);
    expect(r.graph).not.toBeNull();
    expect(r.graph!.nodes[0].name).toBe('MyComp');
    expect(r.graph!.nodes[0].color).toBe('rgb(153,51,204)');
    expect(r.warnings.some(w => /decorator/i.test(w))).toBe(true);
  });

  it('extracts color from @xai_component decorator', () => {
    const src = `
@xai_component(color="green")
class Greeter(Component):
    pass
`;
    const r = parsePythonComponent(src);
    expect(r.graph!.nodes[0].color).toBe('green');
  });

  it('extracts InArg, InCompArg, OutArg, and BaseComponent ports', () => {
    const src = `
@xai_component(color="blue")
class Demo(Component):
    name: InArg[str]
    count: InCompArg[int]
    out: OutArg[float]
    body: BaseComponent
`;
    const r = parsePythonComponent(src);
    const node = r.graph!.nodes[0];

    // Input params: name, count (plus auto flow-in ▶)
    const paramIn = node.portsIn.filter(p => p.kind === 'parameter');
    expect(paramIn.map(p => p.varName)).toEqual(['name', 'count']);
    expect(paramIn[0].dataType).toBe('string'); // str → string
    expect(paramIn[1].dataType).toBe('int');

    // Output params: out (plus auto flow-out ▶ and body flow)
    const paramOut = node.portsOut.filter(p => p.kind === 'parameter');
    expect(paramOut.map(p => p.varName)).toEqual(['out']);
    expect(paramOut[0].dataType).toBe('float');

    // Flow ports: auto in ▶, auto out ▶, body (BaseComponent treated as flow-out)
    expect(node.portsIn.some(p => p.kind === 'flow' && p.label === '▶')).toBe(true);
    const outFlows = node.portsOut.filter(p => p.kind === 'flow');
    expect(outFlows.map(p => p.varName)).toEqual(['out-0', 'body']);
  });

  it('ignores docstring lines when scanning fields', () => {
    const src = `
@xai_component
class Demo(Component):
    """This is a docstring.

    message: OutArg[str]
    """
    real_in: InArg[str]
`;
    const r = parsePythonComponent(src);
    const names = r.graph!.nodes[0].portsIn
      .filter(p => p.kind === 'parameter').map(p => p.varName);
    expect(names).toEqual(['real_in']);
    expect(r.graph!.nodes[0].portsOut.some(p => p.varName === 'message')).toBe(false);
  });

  it('stops scanning at def execute()', () => {
    const src = `
@xai_component
class Demo(Component):
    real_in: InArg[str]

    def execute(self, ctx):
        phantom: InArg[int]
`;
    const r = parsePythonComponent(src);
    const names = r.graph!.nodes[0].portsIn
      .filter(p => p.kind === 'parameter').map(p => p.varName);
    expect(names).toEqual(['real_in']);
  });

  it('handles missing generic type as null dataType', () => {
    const src = `
@xai_component
class Demo(Component):
    body: BaseComponent
`;
    const r = parsePythonComponent(src);
    const body = r.graph!.nodes[0].portsOut.find(p => p.varName === 'body');
    expect(body).toBeDefined();
    expect(body!.dataType).toBeNull();
  });

  it('normalises Python types to xircuits type names', () => {
    const src = `
@xai_component
class Demo(Component):
    s: InArg[str]
    b: InArg[bool]
    lst: InArg[List[str]]
    d: InArg[dict]
    out: OutArg[Any]
`;
    const r = parsePythonComponent(src);
    const types = Object.fromEntries(
      [...r.graph!.nodes[0].portsIn, ...r.graph!.nodes[0].portsOut]
        .filter(p => p.kind === 'parameter')
        .map(p => [p.varName, p.dataType])
    );
    expect(types).toMatchObject({
      s: 'string',
      b: 'boolean',
      lst: 'list',
      d: 'dict',
      out: 'any',
    });
  });

  it('can skip flow-in/flow-out injection via options', () => {
    const src = `
class Demo(Component):
    pass
`;
    const r = parsePythonComponent(src, { includeFlowIn: false, includeFlowOut: false });
    const node = r.graph!.nodes[0];
    expect(node.portsIn).toEqual([]);
    expect(node.portsOut).toEqual([]);
  });

  it('tolerates non-xircuits python without crashing', () => {
    const src = `
def hello():
    return "world"

print(hello())
`;
    const r = parsePythonComponent(src);
    expect(r.graph).toBeNull();
    expect(r.error).toBeTruthy();
  });
});

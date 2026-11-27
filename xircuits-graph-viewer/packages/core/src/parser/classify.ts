import type { NodeKind, PortKind, PortDirection, EdgeKind } from '../types.js';

export function classifyNode(name: string, extras: Record<string, unknown>): NodeKind {
  const type = extras.type as string | undefined;

  if (type === 'comment') return 'comment';
  if (name.startsWith('Literal') || name.startsWith('Argument')) return 'literal';
  if (type === 'xircuits_workflow') return 'workflow';
  if (name === 'Start') return 'start';
  if (name === 'Finish') return 'finish';

  // Sub-kinds from extras.type
  if (type === 'branch') return 'branch';
  if (type === 'function') return 'function';
  if (type === 'context_set') return 'context_set';
  if (type === 'context_get') return 'context_get';
  if (type === 'variable') return 'variable';

  return 'component';
}

export function classifyPort(
  portName: string,
  label: string,
  isIn: boolean,
  nodeName: string
): { kind: PortKind; direction: PortDirection; dataType: string | null; varName: string } {
  const direction: PortDirection = isIn ? 'in' : 'out';

  // Flow ports: name starts with "in-" or "out-" (flow connectors with ▶ label)
  const isFlowPort =
    label === '▶' && !nodeName.startsWith('Argument');

  if (isFlowPort || portName.startsWith('out-') && label === '▶' || portName.startsWith('in-') && label === '▶') {
    return { kind: 'flow', direction, dataType: null, varName: label };
  }

  // Parameter ports: "parameter-TYPE-NAME" or "parameter-out-TYPE-NAME"
  let dataType: string | null = null;
  let varName = label;

  if (portName.startsWith('parameter-')) {
    const parts = portName.split('-');
    if (parts[1] === 'out') {
      // parameter-out-TYPE-NAME
      dataType = parts[2] || null;
    } else {
      // parameter-TYPE-NAME
      dataType = parts[1] || null;
    }
  }

  return { kind: 'parameter', direction, dataType, varName };
}

export function classifyEdge(type: string): EdgeKind {
  return type === 'triangle-link' ? 'flow' : 'data';
}

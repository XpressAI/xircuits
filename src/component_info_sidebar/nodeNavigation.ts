import type { NodeModel, PortModel } from '@projectstorm/react-diagrams';

function firstConnected(ports: PortModel[] | undefined) {
  return ports?.find(p => Object.keys(p.getLinks()).length > 0);
}

export function getPrevNode(cur: any): NodeModel | undefined {
  const inPort = firstConnected(cur?.portsIn);
  if (!inPort) return;
  const link = Object.values(inPort.getLinks())[0];
  const otherPort =
    link.getSourcePort() === inPort ? link.getTargetPort() : link.getSourcePort();
  return otherPort?.getParent();
}

export function getNextNode(cur: any): NodeModel | undefined {
  const outPort = firstConnected(cur?.portsOut);
  if (!outPort) return;
  const link = Object.values(outPort.getLinks())[0];
  const otherPort =
    link.getSourcePort() === outPort ? link.getTargetPort() : link.getSourcePort();
  return otherPort?.getParent();
}

export function isParamNode(n: any): boolean {
  const name = n?.getOptions?.().name ?? '';
  return name.startsWith('Literal') || name.startsWith('Argument');
}


export function getMainPath(node: NodeModel): NodeModel[] {
  const back: NodeModel[] = [];
  let cur: any = node;
  while (true) {
    const prev = getPrevNode(cur);
    if (!prev) break;
    back.push(prev);
    cur = prev;
  }
  back.reverse();

  const forward: NodeModel[] = [];
  cur = node;
  while (true) {
    const next = getNextNode(cur);
    if (!next) break;
    forward.push(next);
    cur = next;
  }
  return [...back, node, ...forward].filter(n => !isParamNode(n));
}

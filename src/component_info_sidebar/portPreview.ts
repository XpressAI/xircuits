import type { NodeModel, PortModel, LinkModel } from '@projectstorm/react-diagrams';

const isParamPort = (p: PortModel) =>
  ((p.getOptions() as any).name as string).startsWith('parameter');

const nodeType = (n?: NodeModel) =>
  (n as any)?.extras?.type ?? (n as any)?.getOptions?.().type ?? 'node';

const literalValue = (n?: NodeModel): string | undefined => {
  const v = (n as any)?.extras?.value;
  if (v === undefined || v === null) return;
  return typeof v === 'string' ? v : String(v);
};

const nodeValue = (n?: NodeModel): string | undefined => {
  if (!n) return;

  const lit = literalValue(n);
  if (lit !== undefined) return lit;

  const outs: PortModel[] | undefined = (n as any).portsOut;
  const p = outs?.find(isParamPort);
  if (!p) return;

  const opt: any = p.getOptions();
  return opt.label ?? opt.varName;
};

const portDisplayName = (p: PortModel) => {
  const opt: any = p.getOptions();
  return opt.varName ?? opt.label ?? opt.name;
};

const portDisplayType = (p: PortModel) => {
  const t: string | undefined = (p.getOptions() as any).dataType;
  return t ?? '';
};

const portLabel = (p?: PortModel) =>
  (p?.getOptions() as any)?.label ?? undefined;

function describeInputMd(p: PortModel): string {
  const links = Object.values(p.getLinks()) as LinkModel[];
  const name = portDisplayName(p);
  const dtype = portDisplayType(p);

  if (links.length === 0) {
    return `- **${name}** (${dtype})<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↳ *(unlinked)*`;
  }

  const l = links[0];
  const peerPort = l.getSourcePort() === p ? l.getTargetPort() : l.getSourcePort();
  const peerNode = peerPort?.getParent();

  const peerName = (peerNode as any)?.getOptions?.()?.name ?? 'Unknown';
  const peerType = nodeType(peerNode);

  const raw = portLabel(peerPort) ?? nodeValue(peerNode) ?? '';
  const val = raw.replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
  
  return (
    `- **${name}** (${dtype})<br>` +
    `&nbsp;&nbsp;&nbsp;&nbsp;↳ ${peerName} (${peerType})<br>` +
    `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• ${val}`
  );
}

function describeOutputMd(p: PortModel): string[] {
  const name = portDisplayName(p);
  const dtype = portDisplayType(p);
  const links = Object.values(p.getLinks()) as LinkModel[];

  if (links.length === 0) {
    return [`- **${name}** (${dtype})<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↳ *(unlinked)*`];
  }

  return links.map(l => {
    const peerPort = l.getSourcePort() === p ? l.getTargetPort() : l.getSourcePort();
    const peerNode = peerPort?.getParent();
    const peerName = (peerNode as any)?.getOptions?.()?.name ?? 'Unknown';
    const peerType = nodeType(peerNode);

    const inName = portDisplayName(peerPort);
    const inType = portDisplayType(peerPort);

    return (
      `- **${name}** (${dtype})<br>` +
      `&nbsp;&nbsp;&nbsp;&nbsp;↳ ${peerName} (${peerType})<br>` +
      `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• ${inName} (${inType})`
    );

  });
}

export function collectParamIO(node: NodeModel): { inputs: string[]; outputs: string[] } {
  const inputs: string[] = [];
  const outputs: string[] = [];

  (node as any).portsIn.forEach((p: PortModel) => {
    if (isParamPort(p)) inputs.push(describeInputMd(p));
  });

  (node as any).portsOut.forEach((p: PortModel) => {
    if (isParamPort(p)) describeOutputMd(p).forEach(o => outputs.push(o));
  });

  return { inputs, outputs };
}

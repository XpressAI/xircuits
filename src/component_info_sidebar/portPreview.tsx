import type { NodeModel, PortModel, LinkModel } from '@projectstorm/react-diagrams';

export interface IONode {
  label?: string;
  children?: IONode[];
  valueBlock?: string;
}

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

const portDisplayType = (p: PortModel) =>
  (p.getOptions() as any).dataType ?? '';

const portLabel = (p?: PortModel) =>
  (p?.getOptions() as any)?.label ?? undefined;

function buildInputTree(p: PortModel): IONode {
  const name = portDisplayName(p);
  const dtype = portDisplayType(p);

  const root: IONode = {
    label: `${name} (${dtype})`,
    children: []
  };

  const links = Object.values(p.getLinks()) as LinkModel[];
  if (links.length === 0) {
    root.children!.push({ label: '(unlinked)' });
    return root;
  }

  const l = links[0];
  const peerPort =
    l.getSourcePort() === p ? l.getTargetPort() : l.getSourcePort();
  const peerNode = peerPort?.getParent();

  const peerName = (peerNode as any)?.getOptions?.()?.name ?? 'Unknown';
  const peerType = nodeType(peerNode);

  const peer: IONode = {
    label: `${peerName} (${peerType})`
  };
  root.children!.push(peer);

  const raw = portLabel(peerPort) ?? nodeValue(peerNode) ?? '';
  if (raw.trim().length > 0) {
    peer.valueBlock = raw; 
  }

  return root;
}

function buildOutputTree(p: PortModel): IONode {
  const name = portDisplayName(p);
  const dtype = portDisplayType(p);

  const root: IONode = {
    label: `${name} (${dtype})`,
    children: []
  };

  const links = Object.values(p.getLinks()) as LinkModel[];
  if (links.length === 0) {
    root.children!.push({ label: '(unlinked)' });
    return root;
  }

  links.forEach(l => {
    const peerPort =
      l.getSourcePort() === p ? l.getTargetPort() : l.getSourcePort();
    const peerNode = peerPort?.getParent();

    const peerName = (peerNode as any)?.getOptions?.()?.name ?? 'Unknown';
    const peerType = nodeType(peerNode);

    const inName = portDisplayName(peerPort);
    const inType = portDisplayType(peerPort);

    const peer: IONode = {
      label: `${peerName} (${peerType})`,
      children: [{ label: `${inName} (${inType})` }]
    };

    root.children!.push(peer);
  });

  return root;
}

export function collectParamIO(
  node: NodeModel
): { inputs: IONode[]; outputs: IONode[] } {
  const inputs: IONode[] = [];
  const outputs: IONode[] = [];

  (node as any).portsIn.forEach((p: PortModel) => {
    if (isParamPort(p)) inputs.push(buildInputTree(p));
  });

  (node as any).portsOut.forEach((p: PortModel) => {
    if (isParamPort(p)) outputs.push(buildOutputTree(p));
  });

  return { inputs, outputs };
}

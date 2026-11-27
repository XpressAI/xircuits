import type { XGraph, XNode, XEdge, XPort } from '../types.js';
import { classifyNode, classifyPort, classifyEdge } from './classify.js';
import { validate } from './validate.js';

interface RawPort {
  id: string;
  name: string;
  alignment: string;
  parentNode: string;
  links: string[];
  in: boolean;
  label: string;
  varName: string;
  dataType: string;
  x: number;
  y: number;
  extras?: Record<string, unknown>;
}

interface RawNode {
  id: string;
  type: string;
  extras: Record<string, unknown>;
  x: number;
  y: number;
  ports: RawPort[];
  name: string;
  color: string;
  portsInOrder: string[];
  portsOutOrder: string[];
}

interface RawLink {
  id: string;
  type: string;
  source: string;
  sourcePort: string;
  target: string;
  targetPort: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
  curvyness: number;
  selectedColor: string;
}

interface RawLayer {
  type: string;
  models: Record<string, RawNode | RawLink>;
}

export function parse(json: unknown): XGraph {
  const { valid, errors } = validate(json);
  if (!valid) {
    throw new Error(`Invalid .xircuits file: ${errors.join(', ')}`);
  }

  const obj = json as Record<string, unknown>;
  const layers = obj.layers as RawLayer[];

  const linkLayer = layers.find(l => l.type === 'diagram-links');
  const nodeLayer = layers.find(l => l.type === 'diagram-nodes')!;

  const rawNodes = Object.values(nodeLayer.models) as RawNode[];
  const rawLinks = linkLayer
    ? (Object.values(linkLayer.models) as RawLink[])
    : [];

  // Build a port ID set for quick lookup
  const portMap = new Map<string, RawPort>();
  for (const rawNode of rawNodes) {
    for (const port of rawNode.ports) {
      portMap.set(port.id, port);
    }
  }

  const nodes: XNode[] = rawNodes.map(raw => {
    const kind = classifyNode(raw.name, raw.extras);

    // Order ports according to portsInOrder/portsOutOrder
    const portsInOrdered = orderPorts(raw.ports, raw.portsInOrder, true);
    const portsOutOrdered = orderPorts(raw.ports, raw.portsOutOrder, false);

    const portsIn: XPort[] = portsInOrdered.map(p => {
      const cls = classifyPort(p.name, p.label, true, raw.name);
      return {
        id: p.id,
        direction: cls.direction,
        kind: cls.kind,
        label: p.label,
        varName: cls.varName,
        dataType: p.dataType || cls.dataType,
        linkIds: p.links || [],
      };
    });

    const portsOut: XPort[] = portsOutOrdered.map(p => {
      const cls = classifyPort(p.name, p.label, false, raw.name);
      return {
        id: p.id,
        direction: cls.direction,
        kind: cls.kind,
        label: p.label,
        varName: cls.varName,
        dataType: p.dataType || cls.dataType,
        linkIds: p.links || [],
      };
    });

    return {
      id: raw.id,
      kind,
      name: raw.name,
      color: raw.color || 'red',
      x: raw.x,
      y: raw.y,
      portsIn,
      portsOut,
      extras: raw.extras || {},
    };
  });

  const edges: XEdge[] = rawLinks.map(raw => ({
    id: raw.id,
    kind: classifyEdge(raw.type),
    sourceNodeId: raw.source,
    sourcePortId: raw.sourcePort,
    targetNodeId: raw.target,
    targetPortId: raw.targetPort,
    points: raw.points || [],
    color: raw.color || 'gray',
  }));

  return {
    id: obj.id as string,
    viewport: {
      x: (obj.offsetX as number) || 0,
      y: (obj.offsetY as number) || 0,
      zoom: (obj.zoom as number) || 100,
    },
    nodes,
    edges,
  };
}

function orderPorts(
  ports: RawPort[],
  order: string[],
  isIn: boolean
): RawPort[] {
  if (!order || order.length === 0) {
    return ports.filter(p => p.in === isIn);
  }
  const portById = new Map(ports.map(p => [p.id, p]));
  return order.map(id => portById.get(id)).filter((p): p is RawPort => p != null);
}

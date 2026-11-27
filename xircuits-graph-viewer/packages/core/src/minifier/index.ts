export interface MinifyOptions {
  precision?: number;
  aggressive?: boolean;
}

export interface MinifyStats {
  inputBytes: number;
  outputBytes: number;
  ratio: number;
  nodes: number;
  edges: number;
  ports: number;
  mode: 'safe' | 'aggressive';
  precision: number;
}

const TRANSIENT_KEYS = new Set(['selected', 'locked']);

const EXTRAS_ALLOWLIST = new Set([
  'type',
  'path',
  'lineNo',
  'commentInput',
]);

type Json = unknown;

function roundTo(n: number, precision: number): number {
  if (!Number.isFinite(n)) return n;
  const f = Math.pow(10, precision);
  return Math.round(n * f) / f;
}

function stripTransient(value: Json): Json {
  if (value === null || value === undefined) return undefined;
  if (Array.isArray(value)) {
    return value.map(stripTransient).filter(v => v !== undefined);
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (TRANSIENT_KEYS.has(k)) continue;
      const cleaned = stripTransient(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return out;
  }
  return value;
}

function roundCoordsInPlace(graph: Record<string, unknown>, precision: number) {
  if (typeof graph.offsetX === 'number') graph.offsetX = roundTo(graph.offsetX, precision);
  if (typeof graph.offsetY === 'number') graph.offsetY = roundTo(graph.offsetY, precision);

  const layers = graph.layers as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(layers)) return;

  for (const layer of layers) {
    const models = layer.models as Record<string, Record<string, unknown>> | undefined;
    if (!models) continue;

    for (const model of Object.values(models)) {
      if (typeof model.x === 'number') model.x = roundTo(model.x as number, precision);
      if (typeof model.y === 'number') model.y = roundTo(model.y as number, precision);

      const ports = model.ports as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(ports)) {
        for (const port of ports) {
          if (typeof port.x === 'number') port.x = roundTo(port.x as number, precision);
          if (typeof port.y === 'number') port.y = roundTo(port.y as number, precision);
        }
      }

      const points = model.points as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(points)) {
        for (const p of points) {
          if (typeof p.x === 'number') p.x = roundTo(p.x as number, precision);
          if (typeof p.y === 'number') p.y = roundTo(p.y as number, precision);
        }
      }
    }
  }
}

function collectCounts(graph: Record<string, unknown>): { nodes: number; edges: number; ports: number } {
  let nodes = 0;
  let edges = 0;
  let ports = 0;
  const layers = graph.layers as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(layers)) return { nodes, edges, ports };

  for (const layer of layers) {
    const models = layer.models as Record<string, Record<string, unknown>> | undefined;
    if (!models) continue;
    if (layer.type === 'diagram-nodes') {
      for (const node of Object.values(models)) {
        nodes++;
        const nodePorts = node.ports as unknown[] | undefined;
        if (Array.isArray(nodePorts)) ports += nodePorts.length;
      }
    } else if (layer.type === 'diagram-links') {
      edges += Object.keys(models).length;
    }
  }
  return { nodes, edges, ports };
}

function applyAggressive(graph: Record<string, unknown>) {
  const nodeMap = new Map<string, string>();
  const portMap = new Map<string, string>();
  const edgeMap = new Map<string, string>();

  const layers = graph.layers as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(layers)) return;

  const nodeLayer = layers.find(l => l.type === 'diagram-nodes');
  const linkLayer = layers.find(l => l.type === 'diagram-links');

  if (nodeLayer) {
    const models = nodeLayer.models as Record<string, Record<string, unknown>>;
    let ni = 0;
    let pi = 0;
    for (const node of Object.values(models)) {
      const oldNodeId = node.id as string;
      nodeMap.set(oldNodeId, `n${ni++}`);
      const ports = node.ports as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(ports)) {
        for (const port of ports) {
          portMap.set(port.id as string, `p${pi++}`);
        }
      }
    }
  }

  if (linkLayer) {
    const models = linkLayer.models as Record<string, Record<string, unknown>>;
    let ei = 0;
    for (const link of Object.values(models)) {
      edgeMap.set(link.id as string, `e${ei++}`);
    }
  }

  if (typeof graph.id === 'string') graph.id = 'g';

  const rewriteLayer = (layer: Record<string, unknown>) => {
    delete layer.id;
    delete layer.isSvg;
    delete layer.transformed;
    delete layer.extras;

    const models = layer.models as Record<string, Record<string, unknown>>;
    const newModels: Record<string, Record<string, unknown>> = {};

    if (layer.type === 'diagram-nodes') {
      for (const node of Object.values(models)) {
        const newId = nodeMap.get(node.id as string)!;
        node.id = newId;

        delete node.selectedColor;
        delete node.width;
        delete node.height;
        delete node.type;

        const extras = node.extras as Record<string, unknown> | undefined;
        if (extras) {
          const filteredExtras: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(extras)) {
            if (EXTRAS_ALLOWLIST.has(k)) filteredExtras[k] = v;
          }
          if (Object.keys(filteredExtras).length > 0) {
            node.extras = filteredExtras;
          } else {
            delete node.extras;
          }
        }

        const ports = node.ports as Array<Record<string, unknown>> | undefined;
        if (Array.isArray(ports)) {
          for (const port of ports) {
            port.id = portMap.get(port.id as string)!;
            delete port.alignment;
            delete port.maximumLinks;
            delete port.parentNode;
            delete port.portType;
            delete port.type;

            const pextras = port.extras as Record<string, unknown> | undefined;
            if (!pextras || Object.keys(pextras).length === 0) {
              delete port.extras;
            }

            const links = port.links as string[] | undefined;
            if (Array.isArray(links)) {
              port.links = links
                .map(id => edgeMap.get(id))
                .filter((id): id is string => typeof id === 'string');
            }
          }
        }

        const portsInOrder = node.portsInOrder as string[] | undefined;
        if (Array.isArray(portsInOrder)) {
          node.portsInOrder = portsInOrder
            .map(id => portMap.get(id))
            .filter((id): id is string => typeof id === 'string');
        }
        const portsOutOrder = node.portsOutOrder as string[] | undefined;
        if (Array.isArray(portsOutOrder)) {
          node.portsOutOrder = portsOutOrder
            .map(id => portMap.get(id))
            .filter((id): id is string => typeof id === 'string');
        }

        newModels[newId] = node;
      }
    } else if (layer.type === 'diagram-links') {
      for (const link of Object.values(models)) {
        const newId = edgeMap.get(link.id as string)!;
        link.id = newId;

        delete link.width;
        delete link.curvyness;
        delete link.selectedColor;
        delete link.labels;
        delete link.extras;

        if (typeof link.source === 'string') link.source = nodeMap.get(link.source) ?? link.source;
        if (typeof link.target === 'string') link.target = nodeMap.get(link.target) ?? link.target;
        if (typeof link.sourcePort === 'string') link.sourcePort = portMap.get(link.sourcePort) ?? link.sourcePort;
        if (typeof link.targetPort === 'string') link.targetPort = portMap.get(link.targetPort) ?? link.targetPort;

        const points = link.points as Array<Record<string, unknown>> | undefined;
        if (Array.isArray(points)) {
          for (const p of points) {
            delete p.id;
            delete p.type;
          }
        }

        newModels[newId] = link;
      }
    }

    layer.models = newModels;
  };

  delete graph.gridSize;

  for (const layer of layers) rewriteLayer(layer);
}

function utf8Bytes(s: string): number {
  return new TextEncoder().encode(s).length;
}

export function minify(input: unknown, opts: MinifyOptions = {}): string {
  return minifyWithStats(input, opts).output;
}

export function minifyWithStats(
  input: unknown,
  opts: MinifyOptions = {}
): { output: string; stats: MinifyStats } {
  const precision = opts.precision ?? 0;
  const aggressive = opts.aggressive ?? false;

  const inputStr = JSON.stringify(input);
  const inputBytes = utf8Bytes(inputStr);

  const cloned = JSON.parse(inputStr);
  const stripped = stripTransient(cloned) as Record<string, unknown>;

  const counts = collectCounts(stripped);

  roundCoordsInPlace(stripped, precision);

  if (aggressive) applyAggressive(stripped);

  const output = JSON.stringify(stripped);
  const outputBytes = utf8Bytes(output);

  const stats: MinifyStats = {
    inputBytes,
    outputBytes,
    ratio: inputBytes === 0 ? 0 : 1 - outputBytes / inputBytes,
    nodes: counts.nodes,
    edges: counts.edges,
    ports: counts.ports,
    mode: aggressive ? 'aggressive' : 'safe',
    precision,
  };

  return { output, stats };
}

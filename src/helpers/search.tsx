import { DiagramModel, NodeModel } from '@projectstorm/react-diagrams';

export interface SearchResult {
    /** total number of matches */
    count: number;
    /** zero-based indices of matching nodes in model.getNodes() */
    indices: number[];
    /** target ports to highlight in UI when a Literal is attached */
    portHits: { nodeId: string; portName: string }[];
}

const getOptions = (n: any) => (n?.getOptions?.() ?? {}) as any;
const getNodeID = (n: any) => n?.getID?.() ?? n?.options?.id ?? getOptions(n)?.id;
const getPort = (n: any) => (Object.values(n?.getPorts?.() ?? {}) as any[])[0];

/**
 * Collect searchable texts only from ports (for literals).
 */
function collectLiteralValues(node: NodeModel): string[] {
    const rawName = String(getOptions(node).name || '');
    if (!rawName.startsWith('Literal ')) return [];

    const port = getPort(node);
    if (!port) return [];

    const label = port.getOptions?.()?.label;
    return label != null ? [String(label).toLowerCase()] : [];
}

/**
 * Return (nodeId, portName) of the opposite end connected to a Literal node.
 */
function getAttachedTargetByPortName(node: NodeModel): { nodeId: string; portName: string }[] {
    const results: { nodeId: string; portName: string }[] = [];

    const port = getPort(node);
    if (!port) return results;

    const links = Object.values(port.getLinks?.() ?? {}) as any[];
    for (const link of links) {
        const src = link.getSourcePort?.();
        const trg = link.getTargetPort?.();

        // Identify the opposite port on the link
        const otherPort = src?.getNode?.() === node ? trg : src;
        if (!otherPort) continue;

        const otherNodeId = getNodeID(otherPort.getNode?.());
        const otherPortName =
            otherPort.getName?.() ??
            otherPort.options?.name ??
            otherPort.getOptions?.()?.name;

        if (otherNodeId && otherPortName) {
            results.push({ nodeId: String(otherNodeId), portName: String(otherPortName) });
        }
    }

    return results;
}

/**
 * Search all nodes’ `options.name` (case-insensitive),
 * and also inside literal values from ports.
 */
export function searchModel(model: DiagramModel, text: string): SearchResult {
    const nodes = model.getNodes();
    const query = text.trim().toLowerCase();
    if (!query) {
        return { count: 0, indices: [], portHits: [] };
    }

    const idToIdx = new Map<string, number>();
    nodes.forEach((node: NodeModel, i) => {
        const id = getNodeID(node);
        if (id) idToIdx.set(String(id), i);
    });

    const indices = new Set<number>();
    const portHits: { nodeId: string; portName: string }[] = [];

    nodes.forEach((node, idx) => {
        const rawName = String(getOptions(node).name || '');
        const nameLower = rawName.toLowerCase();
        const texts = [nameLower, ...collectLiteralValues(node)];
        if (!texts.some((t) => t.includes(query))) return;

        const isLiteral = rawName.startsWith('Literal ');
        const isAttached = Boolean(getOptions(node).extras?.attached);

        if (isLiteral && isAttached) {
            const targets = getAttachedTargetByPortName(node);
            portHits.push(...targets);
            targets.forEach(({ nodeId }) => {
                const i = idToIdx.get(nodeId);
                if (typeof i === 'number') indices.add(i);
            });
        } else {
            indices.add(idx);
        }
    });

    const idxArr = Array.from(indices);
    return {
        count: idxArr.length,
        indices: idxArr,
        portHits
    };
}

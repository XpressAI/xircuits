import { DiagramModel, NodeModel } from '@projectstorm/react-diagrams';

export interface SearchResult {
  /** total number of matches */
    count: number;
  /** zero-based indices of matching nodes in model.getNodes() */
    indices: number[];
}

/**
 * Collect searchable texts only from ports (for literals).
 */
function collectLiteralValues(node: NodeModel): string[] {
    const texts: string[] = [];
    const opts = node.getOptions() as any;

    const nodeName = (opts.name || "").toLowerCase();
    const isLiteral = nodeName.startsWith("literal");

    if (isLiteral) {
        Object.values(node.getPorts()).forEach((p: any) => {
            const pOpt = p.getOptions?.() ?? {};
            if (pOpt.label) {
                texts.push(pOpt.label);
            }
        });
    }

    return texts.filter(Boolean).map((s) => String(s).toLowerCase());
}

/**
 * Search all nodes’ `options.name` (case-insensitive),
 * and also inside literal values from ports.
 */
export function searchModel(model: DiagramModel, text: string): SearchResult {
    const nodes = model.getNodes();
    const query = text.trim().toLowerCase();
    if (!query) {
        return { count: 0, indices: [] };
    }

    const indices: number[] = [];

    nodes.forEach((node: NodeModel, idx: number) => {
        const opts = node.getOptions() as any;
        const name: string = (opts.name || '').toString().toLowerCase();
        const texts = [name, ...collectLiteralValues(node)];
        if (texts.some((t) => t.includes(query))) {
            indices.push(idx);
        }
    });

    return {
        count: indices.length,
        indices
    };
}

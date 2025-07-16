import { DiagramModel, NodeModel } from '@projectstorm/react-diagrams';

export interface SearchResult {
  /** total number of matches */
    count: number;
  /** zero-based indices of matching nodes in model.getNodes() */
    indices: number[];
}

/**
 * Search all nodes’ `options.name` (case-insensitive).
 */
export function searchModel(model: DiagramModel, text: string): SearchResult {
    const nodes = model.getNodes();
    const query = text.trim().toLowerCase();
    if (!query) {
        return { count: 0, indices: [] };
    }

    const indices: number[] = [];
    const matches: string[] = [];

    nodes.forEach((node: NodeModel, idx: number) => {
        const opts = node.getOptions() as any;
        const name: string = (opts.name || '').toString();
        if (name.toLowerCase().includes(query)) {
        indices.push(idx);
        matches.push(name);
        }
    });

    return {
        count: indices.length,
        indices
    };
}

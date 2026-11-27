export function validate(json: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!json || typeof json !== 'object') {
    return { valid: false, errors: ['Input must be an object'] };
  }

  const obj = json as Record<string, unknown>;

  if (typeof obj.id !== 'string') {
    errors.push('Missing or invalid "id" field');
  }

  if (!Array.isArray(obj.layers)) {
    errors.push('Missing or invalid "layers" array');
    return { valid: false, errors };
  }

  const layers = obj.layers as Array<Record<string, unknown>>;

  const linkLayer = layers.find(l => l.type === 'diagram-links');
  const nodeLayer = layers.find(l => l.type === 'diagram-nodes');

  if (!nodeLayer) {
    errors.push('Missing diagram-nodes layer');
  }

  if (!linkLayer) {
    // Links layer is optional (a graph with no connections)
  }

  if (nodeLayer) {
    const models = nodeLayer.models;
    if (!models || typeof models !== 'object') {
      errors.push('diagram-nodes layer missing "models" object');
    }
  }

  return { valid: errors.length === 0, errors };
}

export const SYMBOL_MAP: Record<string, string | null> = {
  'string': '" "',
  'int': ' 1',
  'float': '1.0',
  'boolean': '⊤⊥',
  'time.time': '𝘵',
  'list': '[ ]',
  'tuple': '( )',
  'dict': '{ }',
  'dynalist': '«[]»',
  'dynatuple': '«()»',
  'union': ' U',
  'secret': '🗝️',
  'chat': '🗨',
  'any': '[_]',
  '0': null,
  'flow': null,
};

export const UNKNOWN_SYMBOL = '◎';

export function getPortSymbol(dataType: string | null): string | null {
  if (!dataType) return null;
  const lower = dataType.toLowerCase();
  if (lower in SYMBOL_MAP) return SYMBOL_MAP[lower];
  return UNKNOWN_SYMBOL;
}

// Flow port SVG icons (from CustomPortLabel.tsx)
export const FLOW_IN_ICON = [
  '<svg viewBox="0 0 24 24" width="12" height="12">',
  '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>',
  '<path d="M3 12h12"/>',
  '<path d="M11 8l4 4l-4 4"/>',
  '<path d="M12 21a9 9 0 0 0 0 -18"/>',
  '</svg>',
].join('');

export const FLOW_OUT_ICON = [
  '<svg viewBox="0 0 24 24" width="12" height="12">',
  '<path stroke="none" d="M0 0h24v24H0z" fill="none"/>',
  '<path d="M9 12h12"/>',
  '<path d="M17 16l4 -4l-4 -4"/>',
  '<path d="M12 3a9 9 0 1 0 0 18"/>',
  '</svg>',
].join('');

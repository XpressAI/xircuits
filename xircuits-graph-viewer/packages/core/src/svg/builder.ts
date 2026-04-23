type Attrs = Record<string, string | number | boolean | undefined>;

function attrString(attrs: Attrs): string {
  return Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== false)
    .map(([k, v]) => {
      if (v === true) return k;
      return `${k}="${escapeAttr(String(v))}"`;
    })
    .join(' ');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function el(tag: string, attrs: Attrs, ...children: string[]): string {
  const a = attrString(attrs);
  const open = a ? `<${tag} ${a}` : `<${tag}`;
  if (children.length === 0) {
    return `${open}/>`;
  }
  return `${open}>${children.join('')}</${tag}>`;
}

export function g(attrs: Attrs, ...children: string[]): string {
  return el('g', attrs, ...children);
}

export function rect(attrs: Attrs): string {
  return el('rect', attrs);
}

export function text(attrs: Attrs, content: string): string {
  return el('text', attrs, escapeXml(content));
}

export function path(attrs: Attrs): string {
  return el('path', attrs);
}

export function line(attrs: Attrs): string {
  return el('line', attrs);
}

export function svgRoot(attrs: Attrs, ...children: string[]): string {
  return el('svg', { xmlns: 'http://www.w3.org/2000/svg', ...attrs }, ...children);
}

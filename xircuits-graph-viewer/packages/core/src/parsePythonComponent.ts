import type { XGraph, XNode, XPort } from './types.js';

export interface ParseResult {
  graph: XGraph | null;
  error: string | null;
  warnings: string[];
}

export interface ParsePythonOptions {
  /** Node color to use when no @xai_component(color=...) is found. */
  defaultColor?: string;
  /** Whether to inject the standard flow-in (▶) port. */
  includeFlowIn?: boolean;
  /** Whether to inject the standard flow-out (▶) port. */
  includeFlowOut?: boolean;
}

const DEFAULT_COLOR = 'rgb(153,51,204)';

const FIELD_RE =
  /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(InArg|InCompArg|OutArg|BaseComponent)\s*(?:\[\s*(.+)\s*\])?\s*(?:=.*)?\s*(?:#.*)?$/;

const CLASS_RE = /^\s*class\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\([^)]*\))?\s*:\s*$/m;

const DECORATOR_RE = /@xai_component\s*(?:\(([^)]*)\))?/;

function extractKwarg(kwargs: string, key: string): string | null {
  const re = new RegExp(`\\b${key}\\s*=\\s*(?:(["'])([^"']*)\\1|([^,\\s)]+))`);
  const m = kwargs.match(re);
  return m ? (m[2] ?? m[3] ?? null) : null;
}

/**
 * Parse a Python source string containing a single @xai_component class into
 * an XGraph with one node. Designed for a live-preview use case where the
 * input may be mid-edit; non-fatal issues are returned as `warnings`.
 */
export function parsePythonComponent(
  source: string,
  options: ParsePythonOptions = {}
): ParseResult {
  const {
    defaultColor = DEFAULT_COLOR,
    includeFlowIn = true,
    includeFlowOut = true,
  } = options;

  const warnings: string[] = [];

  if (!source.trim()) {
    return { graph: null, error: 'Empty source', warnings };
  }

  const classMatch = source.match(CLASS_RE);
  if (!classMatch) {
    return { graph: null, error: 'No class definition found', warnings };
  }

  const className = classMatch[1];
  const classIndex = source.indexOf(classMatch[0]);

  const preClass = source.slice(0, classIndex);
  const decoratorMatch = preClass.match(DECORATOR_RE);
  let color = defaultColor;
  if (decoratorMatch) {
    const colorKw = extractKwarg(decoratorMatch[1] ?? '', 'color');
    if (colorKw) color = colorKw;
  } else {
    warnings.push('No @xai_component decorator found; using default color');
  }

  const classBody = source.slice(classIndex + classMatch[0].length);
  const fields = extractFields(classBody);

  const portsIn: XPort[] = [];
  const portsOut: XPort[] = [];

  if (includeFlowIn) {
    portsIn.push({
      id: 'preview-port-in-flow',
      direction: 'in',
      kind: 'flow',
      label: '▶',
      varName: 'in-0',
      dataType: null,
      linkIds: [],
    });
  }
  if (includeFlowOut) {
    portsOut.push({
      id: 'preview-port-out-flow',
      direction: 'out',
      kind: 'flow',
      label: '▶',
      varName: 'out-0',
      dataType: null,
      linkIds: [],
    });
  }

  let idCounter = 0;
  for (const f of fields) {
    const id = `preview-port-${idCounter++}`;
    if (f.kind === 'OutArg') {
      portsOut.push({
        id, direction: 'out', kind: 'parameter',
        label: f.varName, varName: f.varName,
        dataType: f.dataType,
        linkIds: [],
      });
    } else if (f.kind === 'BaseComponent') {
      portsOut.push({
        id, direction: 'out', kind: 'flow',
        label: f.varName, varName: f.varName,
        dataType: null,
        linkIds: [],
      });
    } else {
      // InArg / InCompArg
      portsIn.push({
        id, direction: 'in', kind: 'parameter',
        label: f.varName, varName: f.varName,
        dataType: f.dataType,
        linkIds: [],
      });
    }
  }

  const node: XNode = {
    id: 'preview-node',
    kind: 'component',
    name: className,
    color,
    x: 0,
    y: 0,
    portsIn,
    portsOut,
    extras: { type: 'debug' },
  };

  const graph: XGraph = {
    id: 'preview-graph',
    viewport: { x: 0, y: 0, zoom: 100 },
    nodes: [node],
    edges: [],
  };

  return { graph, error: null, warnings };
}

type FieldKind = 'InArg' | 'InCompArg' | 'OutArg' | 'BaseComponent';
interface Field {
  varName: string;
  kind: FieldKind;
  dataType: string | null;
}

// Map Python type annotations to the canonical xircuits type names used by
// the renderer's symbol table (see ./render/symbols.ts).
const PY_TYPE_TO_XIRCUITS: Record<string, string> = {
  str: 'string',
  bool: 'boolean',
  list: 'list', List: 'list',
  tuple: 'tuple', Tuple: 'tuple',
  dict: 'dict', Dict: 'dict',
  any: 'any', Any: 'any',
};

function normaliseDataType(raw: string | null): string | null {
  if (!raw) return null;
  const outer = raw.split('[')[0].trim();
  return PY_TYPE_TO_XIRCUITS[outer] ?? outer;
}

function extractFields(classBody: string): Field[] {
  const fields: Field[] = [];
  const lines = classBody.split('\n');

  let inDocstring = false;
  let docstringDelim = '';

  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    const trimmed = line.trim();

    if (inDocstring) {
      if (trimmed.includes(docstringDelim)) inDocstring = false;
      continue;
    }
    if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
      docstringDelim = trimmed.startsWith('"""') ? '"""' : "'''";
      const rest = trimmed.slice(3);
      if (!rest.includes(docstringDelim)) inDocstring = true;
      continue;
    }

    if (trimmed.startsWith('def ') || trimmed.startsWith('class ') || trimmed.startsWith('@')) {
      break;
    }

    const m = line.match(FIELD_RE);
    if (!m) continue;
    const [, varName, kind, dataType] = m;
    fields.push({
      varName,
      kind: kind as FieldKind,
      dataType: normaliseDataType(dataType ? dataType.trim() : null),
    });
  }

  return fields;
}

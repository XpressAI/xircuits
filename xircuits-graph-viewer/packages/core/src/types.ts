export type PortDirection = 'in' | 'out';
export type PortKind = 'flow' | 'parameter';
export type NodeKind =
  | 'start'
  | 'finish'
  | 'literal'
  | 'component'
  | 'workflow'
  | 'branch'
  | 'comment'
  | 'function'
  | 'context_set'
  | 'context_get'
  | 'variable';
export type EdgeKind = 'flow' | 'data';

export interface XPort {
  id: string;
  direction: PortDirection;
  kind: PortKind;
  label: string;
  varName: string;
  dataType: string | null;
  linkIds: string[];
}

export interface XNode {
  id: string;
  kind: NodeKind;
  name: string;
  color: string;
  x: number;
  y: number;
  portsIn: XPort[];
  portsOut: XPort[];
  extras: Record<string, unknown>;
}

export interface XEdge {
  id: string;
  kind: EdgeKind;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  points: Array<{ x: number; y: number }>;
  color: string;
}

export interface XGraph {
  id: string;
  viewport: { x: number; y: number; zoom: number };
  nodes: XNode[];
  edges: XEdge[];
}

export interface RenderOptions {
  theme?: 'dark' | 'light';
  width?: number;
  height?: number;
  padding?: number;
  fitView?: boolean;
  interactive?: boolean;
  className?: string;
  nodeClassFn?: (node: XNode) => string;
  edgeClassFn?: (edge: XEdge) => string;
}

export interface NodeMetrics {
  width: number;
  height: number;
  titleHeight: number;
  portRowHeight: number;
  portPositions: Map<string, { x: number; y: number }>;
}

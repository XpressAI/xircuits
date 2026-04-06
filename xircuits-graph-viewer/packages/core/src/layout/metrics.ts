import type { XNode, NodeMetrics } from '../types.js';

// Constants derived from Xircuits CSS
export const TITLE_HEIGHT = 26;
export const PORT_ROW_HEIGHT = 19; // 15px port + 2px margin top + 2px margin bottom
export const NODE_MIN_WIDTH = 100;
export const PORT_GAP = 10; // gap between in-port column and out-port column (margin-right: 10px)
export const PORT_DOT_SIZE = 15;
export const FONT_SIZE = 11;
export const CHAR_WIDTH = 6.6; // approx for sans-serif 11px
export const TITLE_ICON_SIZE = 15;
export const TITLE_PADDING_X = 5;
export const TITLE_PADDING_Y = 5;
export const PORT_LABEL_PADDING = 5; // padding: 0 5px on label
export const COMMENT_FONT_SIZE = 12;
export const COMMENT_CHAR_WIDTH = 7.2;
export const COMMENT_PADDING = 5;

export function measureTextWidth(text: string, charWidth: number = CHAR_WIDTH): number {
  return text.length * charWidth;
}

export function computeNodeMetrics(node: XNode): NodeMetrics {
  if (node.kind === 'comment') {
    return computeCommentMetrics(node);
  }

  // Title width = icon + padding + name text + padding
  const titleTextWidth = TITLE_PADDING_X + TITLE_ICON_SIZE + TITLE_PADDING_X + measureTextWidth(node.name) + TITLE_PADDING_X;

  // In-ports column width: dot(15) + label padding(5) + label text + label padding(5)
  let maxInWidth = 0;
  for (const port of node.portsIn) {
    const labelW = measureTextWidth(port.label) + PORT_LABEL_PADDING * 2;
    maxInWidth = Math.max(maxInWidth, PORT_DOT_SIZE + labelW);
  }

  // Out-ports column width: label padding(5) + label text + label padding(5) + dot(15)
  let maxOutWidth = 0;
  for (const port of node.portsOut) {
    const labelW = measureTextWidth(port.label) + PORT_LABEL_PADDING * 2;
    maxOutWidth = Math.max(maxOutWidth, labelW + PORT_DOT_SIZE);
  }

  const hasIn = node.portsIn.length > 0;
  const hasOut = node.portsOut.length > 0;
  const portsWidth = maxInWidth + (hasIn && hasOut ? PORT_GAP : 0) + maxOutWidth;

  const width = Math.max(NODE_MIN_WIDTH, titleTextWidth, portsWidth);

  const maxPortCount = Math.max(node.portsIn.length, node.portsOut.length);
  const bodyHeight = maxPortCount > 0 ? maxPortCount * PORT_ROW_HEIGHT : 0;
  const height = TITLE_HEIGHT + bodyHeight;

  // Compute port positions (relative to node top-left, at the connection point)
  const portPositions = new Map<string, { x: number; y: number }>();

  node.portsIn.forEach((port, i) => {
    portPositions.set(port.id, {
      x: 0, // left edge of node
      y: TITLE_HEIGHT + i * PORT_ROW_HEIGHT + PORT_ROW_HEIGHT / 2,
    });
  });

  node.portsOut.forEach((port, i) => {
    portPositions.set(port.id, {
      x: width, // right edge of node
      y: TITLE_HEIGHT + i * PORT_ROW_HEIGHT + PORT_ROW_HEIGHT / 2,
    });
  });

  return { width, height, titleHeight: TITLE_HEIGHT, portRowHeight: PORT_ROW_HEIGHT, portPositions };
}

function computeCommentMetrics(node: XNode): NodeMetrics {
  const title = 'Comment:';
  const text = (node.extras.commentInput as string) || '';
  const lines = text.split('\n');

  const titleWidth = measureTextWidth(title, COMMENT_CHAR_WIDTH) + COMMENT_PADDING * 2;
  const maxLineWidth = Math.max(...lines.map(l => measureTextWidth(l, COMMENT_CHAR_WIDTH)));
  const width = Math.max(NODE_MIN_WIDTH, titleWidth, maxLineWidth + COMMENT_PADDING * 2);

  // title line + content lines + padding
  const lineHeight = 18;
  const height = COMMENT_PADDING + 16 + lines.length * lineHeight + COMMENT_PADDING;

  return {
    width,
    height,
    titleHeight: 0,
    portRowHeight: 0,
    portPositions: new Map(),
  };
}

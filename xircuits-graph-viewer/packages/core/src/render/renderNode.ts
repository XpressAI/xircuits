import type { XNode, NodeMetrics, RenderOptions } from '../types.js';
import { g, rect, text, el, escapeXml } from '../svg/builder.js';
import { colorToGradientId } from './renderDefs.js';
import { renderPort } from './renderPort.js';
import { FONT_SIZE, TITLE_HEIGHT, TITLE_PADDING_X, TITLE_ICON_SIZE, COMMENT_PADDING } from '../layout/metrics.js';

export function renderNode(
  node: XNode,
  metrics: NodeMetrics,
  options?: RenderOptions,
): string {
  const extraClass = options?.nodeClassFn?.(node) || '';

  if (node.kind === 'comment') {
    return renderCommentNode(node, metrics, extraClass);
  }

  return renderStandardNode(node, metrics, extraClass);
}

function renderStandardNode(node: XNode, metrics: NodeMetrics, extraClass: string): string {
  const gradientId = colorToGradientId(node.color);
  const { width, height } = metrics;
  const bodyHeight = height - TITLE_HEIGHT;

  const elements: string[] = [];

  // Border
  elements.push(rect({ x: 0, y: 0, width, height, rx: 5, ry: 5, class: 'xg-node__border' }));

  // Title gradient
  elements.push(rect({ x: 0, y: 0, width, height: TITLE_HEIGHT, rx: 5, ry: 5, fill: `url(#${gradientId})` }));
  if (bodyHeight > 0) {
    elements.push(rect({ x: 0, y: TITLE_HEIGHT - 5, width, height: 5, fill: `url(#${gradientId})` }));
  }

  // Icon
  elements.push(renderNodeIcon(node.kind, TITLE_PADDING_X, (TITLE_HEIGHT - TITLE_ICON_SIZE) / 2));

  // Name
  elements.push(text(
    { x: TITLE_PADDING_X + TITLE_ICON_SIZE + TITLE_PADDING_X, y: TITLE_HEIGHT - 8, 'font-size': FONT_SIZE, class: 'xg-node__title-text' },
    node.name.length > 40 ? node.name.slice(0, 39) + '…' : node.name,
  ));

  // Body
  if (bodyHeight > 0) {
    elements.push(rect({ x: 0, y: TITLE_HEIGHT, width, height: bodyHeight, rx: 5, ry: 5, class: 'xg-node__body' }));
    elements.push(rect({ x: 0, y: TITLE_HEIGHT, width, height: Math.min(5, bodyHeight), class: 'xg-node__body' }));
  }

  // Ports
  node.portsIn.forEach((port, i) => elements.push(renderPort(port, width, i, TITLE_HEIGHT)));
  node.portsOut.forEach((port, i) => elements.push(renderPort(port, width, i, TITLE_HEIGHT)));

  return g(
    { class: `xg-node xg-node--${node.kind} ${extraClass}`.trim(), transform: `translate(${node.x}, ${node.y})`, 'data-node-id': node.id },
    ...elements,
  );
}

function renderCommentNode(node: XNode, metrics: NodeMetrics, extraClass: string): string {
  const { width, height } = metrics;
  const commentText = (node.extras.commentInput as string) || '';
  const elements: string[] = [];

  elements.push(rect({ x: 0, y: 0, width, height, rx: 5, ry: 5, class: 'xg-comment__bg' }));
  elements.push(text(
    { x: COMMENT_PADDING, y: COMMENT_PADDING + 12, 'font-size': 12, 'font-weight': 'bold', class: 'xg-comment__text' },
    'Comment:',
  ));

  const lines = commentText.split('\n');
  const tspans = lines.map((line, i) =>
    el('tspan', { x: COMMENT_PADDING, dy: i === 0 ? 18 : 18 }, escapeXml(line))
  ).join('');
  elements.push(el('text', { x: COMMENT_PADDING, y: COMMENT_PADDING + 14, 'font-size': 12, class: 'xg-comment__text' }, tspans));

  return g(
    { class: `xg-node xg-node--comment ${extraClass}`.trim(), transform: `translate(${node.x}, ${node.y})`, 'data-node-id': node.id },
    ...elements,
  );
}

// Map node kind → symbol ID (matching getNodeIcon in CustomNodeWidget.tsx)
function getIconSymbolId(kind: string, extrasType?: string): string {
  switch (kind) {
    case 'start':
    case 'finish':
      return 'xg-icon-start-finish';
    case 'workflow':
      return 'xg-icon-workflow';
    case 'branch':
      return 'xg-icon-branch';
    case 'function':
      return 'xg-icon-function';
    case 'context_set':
      return 'xg-icon-context_set';
    case 'context_get':
      return 'xg-icon-context_get';
    case 'variable':
      return 'xg-icon-variable';
    default:
      return 'xg-icon-component';
  }
}

function renderNodeIcon(kind: string, x: number, y: number): string {
  const symbolId = getIconSymbolId(kind);
  return el('use', {
    href: `#${symbolId}`,
    x, y,
    width: TITLE_ICON_SIZE,
    height: TITLE_ICON_SIZE,
    color: 'white',
  });
}

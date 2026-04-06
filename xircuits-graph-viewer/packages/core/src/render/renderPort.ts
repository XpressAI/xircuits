import type { XPort } from '../types.js';
import { g, text, el } from '../svg/builder.js';
import { getPortSymbol } from './symbols.js';
import { PORT_ROW_HEIGHT, PORT_DOT_SIZE, FONT_SIZE, PORT_LABEL_PADDING } from '../layout/metrics.js';

const SYMBOL_FONT_SIZE = 9;

export function renderPort(
  port: XPort,
  nodeWidth: number,
  rowIndex: number,
  titleHeight: number,
): string {
  const isOut = port.direction === 'out';
  const y = titleHeight + rowIndex * PORT_ROW_HEIGHT;
  const isConnected = port.linkIds.length > 0;
  const isFlow = port.kind === 'flow';
  const dotY = y + (PORT_ROW_HEIGHT - PORT_DOT_SIZE) / 2;

  if (isOut) {
    const dotX = nodeWidth - PORT_DOT_SIZE;
    const dot = renderDot(port, dotX, dotY, isOut, isConnected, isFlow);
    const label = isFlow ? '' : renderLabel(port.label, dotX - PORT_LABEL_PADDING, y, 'end');
    return g({ class: `xg-port xg-port--out xg-port--${isFlow ? 'flow' : 'param'}`, 'data-port-id': port.id }, dot, label);
  } else {
    const dotX = 0;
    const dot = renderDot(port, dotX, dotY, isOut, isConnected, isFlow);
    const label = isFlow ? '' : renderLabel(port.label, PORT_DOT_SIZE + PORT_LABEL_PADDING, y, 'start');
    return g({ class: `xg-port xg-port--in xg-port--${isFlow ? 'flow' : 'param'}`, 'data-port-id': port.id }, dot, label);
  }
}

function renderDot(
  port: XPort,
  x: number,
  y: number,
  isOut: boolean,
  isConnected: boolean,
  isFlow: boolean,
): string {
  const elements: string[] = [];
  const w = PORT_DOT_SIZE;
  const h = PORT_DOT_SIZE;
  const r = 8;

  // Half-rounded rect: out-ports rounded on left, in-ports rounded on right
  let d: string;
  if (isOut) {
    d = `M${x + r},${y} L${x + w},${y} L${x + w},${y + h} L${x + r},${y + h} A${r},${r} 0 0,1 ${x},${y + h - r} L${x},${y + r} A${r},${r} 0 0,1 ${x + r},${y}Z`;
  } else {
    d = `M${x},${y} L${x + w - r},${y} A${r},${r} 0 0,1 ${x + w},${y + r} L${x + w},${y + h - r} A${r},${r} 0 0,1 ${x + w - r},${y + h} L${x},${y + h}Z`;
  }

  const connClass = isConnected ? ' xg-port__dot--connected' : '';
  elements.push(el('path', { d, class: `xg-port__dot${connClass}` }));

  if (isFlow) {
    const iconRef = isOut ? '#xg-flow-out' : '#xg-flow-in';
    const flowClass = isConnected ? 'xg-port--flow--connected' : 'xg-port--flow--disconnected';
    elements.push(el('g', { class: flowClass },
      el('use', { href: iconRef, x: x + 1.5, y: y + 1.5, width: 12, height: 12 }),
    ));
  } else {
    const symbol = getPortSymbol(port.dataType);
    if (symbol) {
      const symClass = isConnected ? 'xg-port__symbol xg-port__symbol--connected' : 'xg-port__symbol xg-port__symbol--disconnected';
      elements.push(text(
        { x: x + w / 2, y: y + h - 3, 'text-anchor': 'middle', 'font-size': SYMBOL_FONT_SIZE, class: symClass },
        symbol,
      ));
    }
  }

  return elements.join('');
}

function renderLabel(label: string, x: number, y: number, anchor: 'start' | 'end'): string {
  const displayLabel = label.length > 40 ? label.slice(0, 37) + '...' : label;
  return text(
    { x, y: y + PORT_ROW_HEIGHT / 2 + FONT_SIZE / 2 - 1, 'text-anchor': anchor, 'font-size': FONT_SIZE, class: 'xg-port__label' },
    displayLabel,
  );
}

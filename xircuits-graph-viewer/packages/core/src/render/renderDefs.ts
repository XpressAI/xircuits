import { el } from '../svg/builder.js';
import type { XNode } from '../types.js';
import { titleGradient } from './colors.js';

export function renderDefs(nodes: XNode[], theme: 'dark' | 'light'): string {
  const gradients: string[] = [];
  const seenColors = new Set<string>();

  for (const node of nodes) {
    if (node.kind === 'comment') continue;
    const color = node.color;
    if (seenColors.has(color)) continue;
    seenColors.add(color);

    const { color1, color2 } = titleGradient(color);
    const gradId = colorToGradientId(color);
    gradients.push(
      el('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' },
        el('stop', { offset: '0%', 'stop-color': color1 }),
        el('stop', { offset: '100%', 'stop-color': color2 }),
      )
    );
  }

  const style = renderStyleBlock(theme);

  const flowInSymbol = el('symbol', { id: 'xg-flow-in', viewBox: '0 0 24 24' },
    el('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    el('path', { d: 'M3 12h12' }),
    el('path', { d: 'M11 8l4 4l-4 4' }),
    el('path', { d: 'M12 21a9 9 0 0 0 0 -18' }),
  );

  const flowOutSymbol = el('symbol', { id: 'xg-flow-out', viewBox: '0 0 24 24' },
    el('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    el('path', { d: 'M9 12h12' }),
    el('path', { d: 'M17 16l4 -4l-4 -4' }),
    el('path', { d: 'M12 3a9 9 0 1 0 0 18' }),
  );

  // Node icon symbols (from style/icons/*.svg in the Xircuits repo)
  const nodeIcons = renderNodeIconSymbols();

  return el('defs', {},
    style,
    ...gradients,
    flowInSymbol,
    flowOutSymbol,
    nodeIcons,
  );
}

export function colorToGradientId(color: string): string {
  return 'xg-grad-' + color.replace(/[^a-zA-Z0-9]/g, '_');
}

function renderNodeIconSymbols(): string {
  const s = el;
  // Each symbol extracted from style/icons/*.svg in the Xircuits repo
  // All use viewBox="0 0 24 24", stroke="currentColor" (inherited)

  const icons: string[] = [];

  // start-finish-component.svg (filled direction sign diamond)
  icons.push(s('symbol', { id: 'xg-icon-start-finish', viewBox: '0 0 24 24', fill: 'currentColor' },
    s('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    s('path', { d: 'M10.52 2.614a2.095 2.095 0 0 1 2.835 -.117l.126 .117l7.905 7.905c.777 .777 .816 2.013 .117 2.836l-.117 .126l-7.905 7.905a2.094 2.094 0 0 1 -2.836 .117l-.126 -.117l-7.907 -7.906a2.096 2.096 0 0 1 -.115 -2.835l.117 -.126l7.905 -7.905zm5.969 9.535l.01 -.116l-.003 -.12l-.016 -.114l-.03 -.11l-.044 -.112l-.052 -.098l-.076 -.105l-.07 -.081l-3.5 -3.5l-.095 -.083a1 1 0 0 0 -1.226 0l-.094 .083l-.083 .094a1 1 0 0 0 0 1.226l.083 .094l1.792 1.793h-5.085l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h5.085l-1.792 1.793l-.083 .094a1 1 0 0 0 1.403 1.403l.094 -.083l3.5 -3.5l.097 -.112l.05 -.074l.037 -.067l.05 -.112l.023 -.076l.025 -.117z' }),
  ));

  // component-library.svg (3D cube outline)
  icons.push(s('symbol', { id: 'xg-icon-component', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    s('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    s('path', { d: 'M21 16.008v-8.018a1.98 1.98 0 0 0 -1 -1.717l-7 -4.008a2.016 2.016 0 0 0 -2 0l-7 4.008c-.619 .355 -1 1.01 -1 1.718v8.018c0 .709 .381 1.363 1 1.717l7 4.008a2.016 2.016 0 0 0 2 0l7 -4.008c.619 -.355 1 -1.01 1 -1.718z' }),
    s('path', { d: 'M12 22v-10' }),
    s('path', { d: 'M12 12l8.73 -5.04' }),
    s('path', { d: 'M3.27 6.96l8.73 5.04' }),
  ));

  // workflow-component.svg (chart dots)
  icons.push(s('symbol', { id: 'xg-icon-workflow', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    s('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    s('path', { d: 'M5 7m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' }),
    s('path', { d: 'M16 15m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' }),
    s('path', { d: 'M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0' }),
    s('path', { d: 'M6 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0' }),
    s('path', { d: 'M9 17l5 -1.5' }),
    s('path', { d: 'M6.5 8.5l7.81 5.37' }),
    s('path', { d: 'M7 7l8 -1' }),
  ));

  // branch-component.svg (arrows split)
  icons.push(s('symbol', { id: 'xg-icon-branch', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    s('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    s('path', { d: 'M21 17h-8l-3.5 -5h-6.5' }),
    s('path', { d: 'M21 7h-8l-3.495 5' }),
    s('path', { d: 'M18 10l3 -3l-3 -3' }),
    s('path', { d: 'M18 20l3 -3l-3 -3' }),
  ));

  // function-component.svg (math function)
  icons.push(s('symbol', { id: 'xg-icon-function', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    s('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    s('path', { d: 'M3 19a2 2 0 0 0 2 2c2 0 2 -4 3 -9s1 -9 3 -9a2 2 0 0 1 2 2' }),
    s('path', { d: 'M5 12h6' }),
    s('path', { d: 'M15 12l6 6' }),
    s('path', { d: 'M15 18l6 -6' }),
  ));

  // set-variable-component.svg (world upload)
  icons.push(s('symbol', { id: 'xg-icon-context_set', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    s('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    s('path', { d: 'M21 12a9 9 0 1 0 -9 9' }),
    s('path', { d: 'M3.6 9h16.8' }),
    s('path', { d: 'M3.6 15h8.4' }),
    s('path', { d: 'M11.578 3a17 17 0 0 0 0 18' }),
    s('path', { d: 'M12.5 3c1.719 2.755 2.5 5.876 2.5 9' }),
    s('path', { d: 'M18 21v-7m3 3l-3 -3l-3 3' }),
  ));

  // get-variable-component.svg (world download)
  icons.push(s('symbol', { id: 'xg-icon-context_get', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    s('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    s('path', { d: 'M21 12a9 9 0 1 0 -9 9' }),
    s('path', { d: 'M3.6 9h16.8' }),
    s('path', { d: 'M3.6 15h8.4' }),
    s('path', { d: 'M11.578 3a17 17 0 0 0 0 18' }),
    s('path', { d: 'M12.5 3c1.719 2.755 2.5 5.876 2.5 9' }),
    s('path', { d: 'M18 14v7m-3 -3l3 3l3 -3' }),
  ));

  // variable-component.svg (variable x)
  icons.push(s('symbol', { id: 'xg-icon-variable', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    s('path', { stroke: 'none', d: 'M0 0h24v24H0z', fill: 'none' }),
    s('path', { d: 'M5 4c-2.5 5 -2.5 10 0 16m14 -16c2.5 5 2.5 10 0 16m-10 -11h1c1 0 1 1 2.016 3.527c.984 2.473 .984 3.473 1.984 3.473h1' }),
    s('path', { d: 'M8 16c1.5 0 3 -2 4 -3.5s2.5 -3.5 4 -3.5' }),
  ));

  return icons.join('');
}

function renderStyleBlock(theme: 'dark' | 'light'): string {
  const isDark = theme === 'dark';
  const css = `
.xg-root {
  font-family: sans-serif;
  font-size: 11px;
}
.xg-node__border {
  fill: none;
  stroke: ${isDark ? 'black' : 'oklch(0.8 0 0)'};
  stroke-width: 1;
}
.xg-node__title-text {
  fill: white;
  font-weight: 500;
  letter-spacing: 0.025rem;
}
.xg-node__body {
  fill: ${isDark
    ? 'oklch(10% 0 0 / 0.85)'
    : 'oklch(99% 0 0 / 0.85)'};
  stroke: none;
}
.xg-port__dot {
  fill: oklch(50% 0 0 / 0.2);
  stroke: oklch(0 0 0 / 0.2);
  stroke-width: 1;
}
.xg-port__dot--connected {
  fill: oklch(100% 0 0 / 0.5);
}
.xg-port__label {
  fill: ${isDark ? 'white' : 'black'};
}
.xg-port__symbol {
  font-weight: bold;
  font-family: Helvetica, Arial, sans-serif;
}
.xg-port__symbol--connected { fill: black; }
.xg-port__symbol--disconnected { fill: grey; }
.xg-port--flow use {
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}
.xg-port--flow--connected use { stroke: oklch(0% 0 0 / 0.8); }
.xg-port--flow--disconnected use { stroke: oklch(100% 0 0 / 0.8); }
.xg-edge--flow {
  stroke: rgb(0, 192, 255);
  stroke-width: 3;
  fill: none;
  stroke-dasharray: 10 2;
  animation: xg-flow 1s steps(24) infinite;
  filter: drop-shadow(2px 2px 4px rgb(0 0 0 / 40%)) opacity(60%);
}
.xg-edge--data {
  stroke: gray;
  stroke-width: 3;
  fill: none;
  filter: drop-shadow(2px 2px 4px rgb(0 0 0 / 40%)) opacity(60%);
}
.xg-comment__bg {
  fill: ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'oklch(0.98 0.13 108.65)'};
  stroke: ${isDark ? 'black' : '#ccc'};
  stroke-width: 2;
  rx: 5;
}
.xg-comment__text {
  fill: ${isDark ? 'white' : 'black'};
}
@keyframes xg-flow {
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
}
`;
  return el('style', {}, css);
}

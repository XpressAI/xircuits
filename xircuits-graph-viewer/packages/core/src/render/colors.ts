// Color utilities for title bar gradients.
// Replicates the Xircuits oklch gradient logic from CustomNodeWidget.tsx.
// Outputs oklch() CSS — requires a modern browser or renderer for full fidelity.

function parseColor(color: string): { r: number; g: number; b: number } {
  const named: Record<string, string> = {
    red: '#ff0000', blue: '#0000ff', green: '#008000', yellow: '#ffff00',
    orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', lightpink: '#ffb6c1',
    cyan: '#00ffff', white: '#ffffff', black: '#000000', gray: '#808080',
    grey: '#808080', salmon: '#fa8072', coral: '#ff7f50', teal: '#008080',
    navy: '#000080', maroon: '#800000', lime: '#00ff00', magenta: '#ff00ff',
    darkred: '#8b0000', darkblue: '#00008b', darkgreen: '#006400',
    goldenrod: '#daa520', tomato: '#ff6347', orchid: '#da70d6',
  };

  const lower = color.toLowerCase().trim();
  if (named[lower]) color = named[lower];

  const hexMatch = color.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    return {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
    };
  }

  const rgbMatch = color.match(/rgb\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]) / 255,
      g: parseInt(rgbMatch[2]) / 255,
      b: parseInt(rgbMatch[3]) / 255,
    };
  }

  return { r: 0.5, g: 0.5, b: 0.5 };
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function toOklab(r: number, g: number, b: number) {
  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l = Math.cbrt(l_), m = Math.cbrt(m_), s = Math.cbrt(s_);
  return {
    L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  };
}

function rgbToOklch(color: string): { l: number; c: number; h: number } {
  const { r, g, b } = parseColor(color);
  const lab = toOklab(srgbToLinear(r), srgbToLinear(g), srgbToLinear(b));
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = Math.atan2(lab.b, lab.a) * (180 / Math.PI);
  if (h < 0) h += 360;
  return { l: lab.L, c, h };
}

export interface GradientColors {
  color1: string;
  color2: string;
}

/**
 * Replicate the Xircuits title gradient from CustomNodeWidget.tsx:
 *   const color = new Color(p.background);
 *   color.alpha = 0.75; color.oklch.c *= 1.2;
 *   const color1 = color.to('oklch').toString()
 *   color.oklch.c *= 1.2; color.oklch.l /= 2;
 *   const color2 = color.to('oklch').toString()
 */
export function titleGradient(baseColor: string): GradientColors {
  const oklch = rgbToOklch(baseColor);

  const c1_c = oklch.c * 1.2;
  const c1 = `oklch(${(oklch.l * 100).toFixed(1)}% ${c1_c.toFixed(4)} ${oklch.h.toFixed(1)} / 0.75)`;

  const c2_c = c1_c * 1.2;
  const c2_l = oklch.l / 2;
  const c2 = `oklch(${(c2_l * 100).toFixed(1)}% ${c2_c.toFixed(4)} ${oklch.h.toFixed(1)} / 0.75)`;

  return { color1: c1, color2: c2 };
}

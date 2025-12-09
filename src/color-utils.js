// --- Utility: hex → RGB ---
export function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// --- Utility: RGB → hex ---
export function rgbToHex({ r, g, b }) {
  return (
    "#" +
    [r, g, b]
      .map(x => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const toLum = v =>
    (v / 255 <= 0.03928)
      ? v / 255 / 12.92
      : Math.pow((v / 255 + 0.055) / 1.055, 2.4);

  return 0.2126 * toLum(r) + 0.7152 * toLum(g) + 0.0722 * toLum(b);
}

// --- Contrast Ratio ---
export function contrastRatio(hex1, hex2) {
  const L1 = luminance(hex1);
  const L2 = luminance(hex2);
  const brightest = Math.max(L1, L2);
  const darkest = Math.min(L1, L2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function autoContrast(bg) {
  const white = "#ffffff";
  const black = "#000000";
  return contrastRatio(bg, white) >= contrastRatio(bg, black)
    ? white
    : black;
}

// --- HSL 変換 ---
export function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 1)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }

  return { h, s, l };
}

export function hslToRgb({ h, s, l }) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let rgb;
  if (0 <= h && h < 60) rgb = [c, x, 0];
  else if (60 <= h && h < 120) rgb = [x, c, 0];
  else if (120 <= h && h < 180) rgb = [0, c, x];
  else if (180 <= h && h < 240) rgb = [0, x, c];
  else if (240 <= h && h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return rgbToHex({
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255)
  });
}

// --- 色相調整 ---
export function adjustHue(hex, amount = 30) {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.h = (hsl.h + amount) % 360;
  return hslToRgb(hsl);
}

// --- 明度・彩度調整 ---
export function adjustLightness(hex, amount = 0.1) {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.l = Math.min(1, Math.max(0, hsl.l + amount));
  return hslToRgb(hsl);
}

export function adjustSaturation(hex, amount = 0.1) {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.s = Math.min(1, Math.max(0, hsl.s + amount));
  return hslToRgb(hsl);
}
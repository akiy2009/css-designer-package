// src/postcss-plugin.ts
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import { chooseBestTextColor, adjustLightnessToTarget, transforms, parseColor } from './color';
import { normalizeTokenColor } from './tokens';

export interface PluginOptions {
  tokens?: Record<string,string>;
  defaultContrastBase?: string;
  defaultContrastTarget?: number;
  tokenPrefix?: string;
}

function resolveVar(expr:string, tokens?: Record<string,string>): string | null {
  // var(--name, fallback)
  const inside = expr.slice(expr.indexOf('(')+1, expr.lastIndexOf(')')).split(',').map(s=>s.trim());
  const name = inside[0];
  const fallback = inside[1];
  if (!name.startsWith('--')) return fallback ?? null;
  if (tokens && tokens[name]) return tokens[name];
  return fallback ?? null;
}

export default function plugin(opts: PluginOptions = {}) {
  const tokens = opts.tokens ?? {};
  const defaultBase = opts.defaultContrastBase ?? '#ffffff';
  const defaultTarget = opts.defaultContrastTarget ?? 4.5;

  return {
    postcssPlugin: 'auto-design-tokens-optimizer',

    Root(root:any) {
      if (tokens && Object.keys(tokens).length > 0) {
        const normalized: Record<string,string> = {};
        for (const k of Object.keys(tokens)) {
          try {
            normalized[k] = normalizeTokenColor(tokens[k], { contrastBase: defaultBase, target: defaultTarget });
          } catch {
            normalized[k] = tokens[k];
          }
        }
        const rule = postcss.rule({ selector: ':root' });
        for (const k of Object.keys(normalized)) {
          rule.append({ prop: k, value: normalized[k] });
        }
        root.prepend(rule);
      }
    },

    Declaration(decl:any) {
      let parsed = valueParser(decl.value);
      let modified = false;

      parsed.walk(node => {
        if (node.type === 'function') {
          const fn = node.value.toLowerCase();
          const args = valueParser.stringify(node.nodes).split(',').map(s=>s.trim()).filter(Boolean);
          if (fn === 'contrast-auto') {
            const colorArg = args[0];
            const resolved = colorArg && colorArg.startsWith('var(') ? resolveVar(colorArg, tokens) : colorArg;
            const pick = chooseBestTextColor(resolved ?? colorArg);
            node.type = 'word'; node.value = pick; modified = true; return;
          }
          if (fn === 'adjust-contrast') {
            const fg = args[0]; const bg = args[1] ?? defaultBase; const t = args[2] ? parseFloat(args[2]) : defaultTarget;
            const rfg = fg && fg.startsWith('var(') ? resolveVar(fg, tokens) : fg;
            const rbg = bg && bg.startsWith('var(') ? resolveVar(bg, tokens) : bg;
            try {
              const result = adjustLightnessToTarget(rfg ?? fg, rbg ?? bg, t);
              node.type = 'word'; node.value = result.color; modified = true; return;
            } catch {}
          }
          if (['lighten','darken','saturate','desaturate','rotate-hue'].includes(fn)) {
            const color = args[0]; const amt = args[1] ? parseFloat(args[1]) : undefined;
            const resolved = color && color.startsWith('var(') ? resolveVar(color, tokens) : color;
            try {
              let out = resolved ?? color;
              if (fn === 'lighten') out = transforms.lighten(out, amt ?? 0.1);
              if (fn === 'darken') out = transforms.darken(out, amt ?? 0.1);
              if (fn === 'saturate') out = transforms.saturate(out, amt ?? 0.1);
              if (fn === 'desaturate') out = transforms.desaturate(out, amt ?? 0.1);
              if (fn === 'rotate-hue') out = transforms.rotateHue(out, amt ?? 30);
              node.type = 'word'; node.value = out; modified = true; return;
            } catch {}
          }
        } else if (node.type === 'word') {
          if (node.value.startsWith('var(')) {
            const resolved = resolveVar(node.value, tokens);
            if (resolved) { node.value = resolved; modified = true; }
          }
        }
      });

      if (modified) decl.value = parsed.toString();
    }
  };
}

export const postcss = true;

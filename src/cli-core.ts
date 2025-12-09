// src/cli-core.ts
import { readFileUtf8, writeFileUtf8, isJSONFile, isCSSFile } from './file-io';
import { optimizeTokens } from './optimizer';
import postcss from 'postcss';
import postcssPlugin from './postcss-plugin';

export interface CLIOptions {
  input: string;
  output?: string;
  target?: number;
  preset?: 'AA'|'AAA';
  format?: 'css'|'json';
  dryRun?: boolean;
  colorsOnly?: boolean;
  generateScale?: number;
  tokens?: Record<string,string>;
  verbose?: boolean;
}

function parsePreset(preset?: string): number {
  if (!preset) return 4.5;
  return preset.toUpperCase() === 'AAA' ? 7.0 : 4.5;
}

export async function runCLI(opts: CLIOptions) {
  const target = opts.target ?? parsePreset(opts.preset);
  if (isJSONFile(opts.input)) {
    // treat as tokens JSON
    const raw = readFileUtf8(opts.input);
    const tokens = JSON.parse(raw);
    const optimized = optimizeTokens(tokens, { contrastBase: '#ffffff', target, generateScale: opts.generateScale ?? 0 });
    const outStr = opts.format === 'css' ? tokensToCssVars(optimized) : JSON.stringify(optimized, null, 2);
    if (opts.dryRun) {
      console.log(outStr);
    } else {
      const outPath = opts.output ?? replaceExt(opts.input, `.optimized.${opts.format ?? 'json'}`);
      writeFileUtf8(outPath, outStr);
      console.log(`Wrote ${outPath}`);
    }
    return;
  } else if (isCSSFile(opts.input)) {
    const css = readFileUtf8(opts.input);
    // Use PostCSS plugin to process css (plugin will resolve tokens if provided)
    const plugin = postcssPlugin({ tokens: opts.tokens, defaultContrastBase: '#ffffff', defaultContrastTarget: target });
    const result = await postcss([ plugin ]).process(css, { from: opts.input });
    if (opts.dryRun) {
      console.log(result.css);
    } else {
      const outPath = opts.output ?? replaceExt(opts.input, `.optimized.css`);
      writeFileUtf8(outPath, result.css);
      console.log(`Wrote ${outPath}`);
    }
    return;
  } else {
    throw new Error('Unsupported input type. Provide .json or .css file.');
  }
}

function tokensToCssVars(tokens: Record<string,string | string[]>) {
  const lines:string[] = [':root {'];
  for (const k of Object.keys(tokens)) {
    const key = k.startsWith('--') ? k : `--${k}`;
    const val = Array.isArray(tokens[k]) ? tokens[k][Math.floor((tokens[k] as string[]).length/2)] : tokens[k] as string;
    lines.push(`  ${key}: ${val};`);
  }
  lines.push('}');
  return lines.join('\n');
}

function replaceExt(p:string, newExt:string) {
  return p.replace(/\.[^/.]+$/, newExt);
}

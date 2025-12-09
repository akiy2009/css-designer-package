import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
const pkg = require('./package.json');

export default [
  // ESM
  {
    input: 'src/index.ts',
    output: { file: pkg.module, format: 'es', sourcemap: true },
    plugins: [ resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json', declaration: true, declarationDir: 'dist/types' }) ]
  },
  // CJS
  {
    input: 'src/index.ts',
    output: { file: pkg.main, format: 'cjs', sourcemap: true, exports: 'named' },
    plugins: [ resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json', declaration: false }) ]
  },
  // PostCSS plugin ESM/CJS
  {
    input: 'src/postcss-plugin.ts',
    output: { file: 'dist/esm/postcss-plugin.esm.js', format: 'es', sourcemap: true },
    plugins: [ resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json', declaration: false }) ]
  },
  {
    input: 'src/postcss-plugin.ts',
    output: { file: 'dist/cjs/postcss-plugin.cjs.js', format: 'cjs', sourcemap: false, exports: 'default' },
    plugins: [ resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json', declaration: false }) ]
  },
  // CLI build (CJS)
  {
    input: 'src/cli.ts',
    output: { file: 'dist/bin/adt-optimize.cjs', format: 'cjs', sourcemap: false },
    plugins: [ resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json', declaration: false }) ]
  },
  // Test build
  {
    input: 'test/example.ts',
    output: [
      { file: 'dist/test/example.cjs.js', format: 'cjs', sourcemap: false },
      { file: 'dist/test/example.esm.js', format: 'es', sourcemap: false }
    ],
    plugins: [ resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json', declaration: false }) ]
  }
];

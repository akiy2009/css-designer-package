// test/example.ts
import postcss from 'postcss';
import plugin from '../src/postcss-plugin';

const css = `
:root {
  --brand: #5a7cff;
  --muted: #888;
}
.btn { background: var(--brand); color: contrast-auto(var(--brand)); }
.small { border-color: lighten(var(--brand), 0.12); }
`;

(async ()=>{
  const result = await postcss([ plugin({ tokens: { '--brand': '#5a7cff', '--muted': '#888' }, defaultContrastBase:'#ffffff' }) ]).process(css, { from: undefined });
  console.log(result.css);
})();

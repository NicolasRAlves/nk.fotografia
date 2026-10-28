// Verifica links e arquivos locais quebrados em todas as páginas do site.
//   node scripts/checar-links.mjs            → só arquivos locais (rápido, sem internet)
//   node scripts/checar-links.mjs --externos → também testa WhatsApp, Instagram, Threads etc.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EXTERNOS = process.argv.includes('--externos');
const IGNORAR = new Set(['templates', 'scripts', 'node_modules', '.git']);

function paginas(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return IGNORAR.has(n) ? [] : paginas(p);
    return n.endsWith('.html') ? [p] : [];
  });
}
const quebrados = [];
const externos = new Set();
let total = 0;

for (const pag of paginas(SITE)) {
  const html = readFileSync(pag, 'utf8').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const base = dirname(pag);
  const refs = [];
  for (const m of html.matchAll(/\s(?:href|src|poster|data-src|data-poster)="([^"]+)"/g)) refs.push(m[1]);
  for (const m of html.matchAll(/\s(?:srcset|data-srcset|imagesrcset)="([^"]+)"/g)) m[1].split(',').forEach((s) => refs.push(s.trim().split(/\s+/)[0]));
  // url(...) em estilos inline, ignorando o que está dentro dos placeholders borrados (data:)
  const semDataUri = html.replace(/url\(&quot;data:[\s\S]*?&quot;\)/g, '').replace(/url\(["']?data:[^)]*\)/g, '');
  for (const m of semDataUri.matchAll(/url\((?:&quot;|["'])?([^"')&]+)/g)) refs.push(m[1]);
  for (let ref of refs) {
    if (!ref || ref.startsWith('#') || ref.startsWith('data:') || ref.startsWith('mailto:') || ref.startsWith('tel:') || ref.startsWith('javascript:')) continue;
    if (/^https?:\/\//.test(ref)) { externos.add(ref.replace(/&amp;/g, '&')); continue; }
    total++;
    ref = decodeURIComponent(ref.split('#')[0].split('?')[0]);
    let alvo = ref.startsWith('/') ? join(SITE, ref) : join(base, ref);
    if (existsSync(alvo) && statSync(alvo).isDirectory()) alvo = join(alvo, 'index.html');
    if (!existsSync(alvo)) quebrados.push(`${relative(SITE, pag)} → ${ref}`);
  }
}
// referências dentro do CSS (fontes, cursor)
const css = join(SITE, 'assets/css/site.css');
for (const m of readFileSync(css, 'utf8').matchAll(/url\("?(\.\.\/[^")]+)"?\)/g)) {
  total++;
  if (!existsSync(join(dirname(css), m[1]))) quebrados.push(`assets/css/site.css → ${m[1]}`);
}

console.log(`${paginas(SITE).length} páginas · ${total} referências locais verificadas`);
if (quebrados.length) { console.log(`\n✗ ${quebrados.length} quebrado(s):`); quebrados.forEach((q) => console.log('  ' + q)); }
else console.log('✓ zero arquivos locais quebrados');

if (EXTERNOS) {
  console.log(`\nLinks externos (${externos.size}):`);
  for (const u of externos) {
    try {
      const r = await fetch(u, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
      console.log(`  ${r.ok ? '✓' : '✗'} ${r.status} ${u}${r.url !== u ? `  → ${r.url}` : ''}`);
    } catch (e) { console.log(`  ? ${u} (${e.message})`); }
  }
} else console.log(`(${externos.size} links externos não testados — use --externos)`);
process.exit(quebrados.length ? 1 : 0);

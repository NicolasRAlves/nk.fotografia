// Gera os arquivos SVG da marca em assets/brand/ e o favicon na raiz.
// Uso: node scripts/gerar-marca.mjs
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { monograma, diafragma, divisor, CORES } from './marca.mjs';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const brand = (n) => join(SITE, 'assets', 'brand', n);

writeFileSync(brand('nk-monograma.svg'), monograma({ cor: CORES.preto, titulo: 'NK' }));
writeFileSync(brand('nk-monograma-branco.svg'), monograma({ cor: CORES.branco, titulo: 'NK' }));
writeFileSync(brand('diafragma.svg'), diafragma({ cor: CORES.preto, titulo: 'Diafragma NK' }));
writeFileSync(brand('divisor-linhas.svg'), divisor().replace('currentColor', CORES.azul).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));

// Favicon: diafragma preto (no tema escuro do navegador, fica branco)
const fav = diafragma({ cor: 'var(--c)' }).replace('aria-hidden="true" focusable="false" ', '')
  .replace('<defs>', `<style>:root{--c:${CORES.preto}}@media (prefers-color-scheme:dark){:root{--c:#fff}}</style><defs>`);
writeFileSync(join(SITE, 'favicon.svg'), fav);

// Cursor de "foco" sobre as fotos (32×32): diafragma branco com contorno escuro
const cur = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="-6 -6 112 112"><circle cx="50" cy="50" r="52" fill="#0A0A0B" fill-opacity=".55"/>${diafragma({ cor: '#fff', id: 'cur' }).replace(/^<svg[^>]*>/, '').replace('</svg>', '')}</svg>`;
writeFileSync(brand('cursor-diafragma.svg'), cur);

// Mini guia de marca (para entregar ao cliente)
const cor = (nome, hex, uso, escuro = false) => `<figure class="cor"><div style="background:${hex};color:${escuro ? '#fff' : '#0A0A0B'}">${hex}</div><figcaption><b>${nome}</b><span>${uso}</span></figcaption></figure>`;
const guia = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Guia de marca · NK Fotografia</title><meta name="robots" content="noindex">
<link rel="icon" href="../../favicon.svg" type="image/svg+xml">
<style>
@font-face{font-family:Lexend;font-weight:400 800;src:url(../fonts/lexend-latin.woff2) format("woff2")}
@font-face{font-family:Inter;font-weight:400 700;src:url(../fonts/inter-latin.woff2) format("woff2")}
:root{--grad:linear-gradient(90deg,#CEF3E1,#B9DAEB,#A2BFF7)}
*{box-sizing:border-box}body{margin:0;font:400 16px/1.6 Inter,system-ui,sans-serif;color:#0A0A0B;background:#F5F6F3}
header{background:var(--grad);padding:56px 24px}main{max-width:1100px;margin:auto;padding:24px}
h1,h2,h3{font-family:Lexend,sans-serif;line-height:1.1;margin:0 0 .4em}h1{font-size:clamp(2rem,6vw,3.4rem)}
section{margin:56px 0}h2{font-size:1.6rem}.sub{color:#565B63;max-width:65ch}
.grade{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.cartao{background:#fff;border:1px solid #0001;border-radius:8px;padding:20px}
.cor{margin:0;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #0001}.cor div{height:110px;display:grid;place-items:end start;padding:12px;font:600 14px ui-monospace,Consolas,monospace}
.cor figcaption{padding:12px;display:grid;font-size:14px}.cor span{color:#565B63}
.lado{display:grid;gap:16px;grid-template-columns:1fr 1fr}.lado>div{background:var(--grad);border-radius:8px;padding:20px;display:grid;place-items:center;min-height:220px;position:relative;overflow:hidden}
.lado img{max-width:100%}.orig{width:428px;height:264px;max-width:100%;overflow:hidden;position:relative}.orig img{position:absolute;left:-172px;top:-234px;max-width:none}
.desenha path{stroke-dasharray:1;stroke-dashoffset:1;animation:d 1.2s calc(var(--i)*70ms) cubic-bezier(.5,0,.2,1) infinite alternate}
@keyframes d{to{stroke-dashoffset:0}}
.carimbo{font:800 clamp(2.4rem,8vw,5rem)/1 Lexend;text-transform:uppercase;color:#fff;-webkit-text-stroke:.07em #5898C8;paint-order:stroke fill;text-shadow:-.077em .077em 0 #5898C8;margin:0}
.wordmark{display:inline-flex;align-items:center;font:600 2rem Lexend;letter-spacing:.08em}.wordmark svg{width:.86em;height:.86em;margin:0 .03em}
.gira{animation:g 1.2s linear infinite;width:56px}@keyframes g{to{transform:rotate(360deg)}}
.dupla{display:inline-block;padding:6px 14px;font:600 1rem Lexend;position:relative}.dupla::after{content:"";position:absolute;left:14px;right:14px;bottom:0;height:6px;background:linear-gradient(#0A0A0B 0 2px,transparent 2px 4px,#0A0A0B 4px 6px)}
code{font:13px ui-monospace,Consolas,monospace;background:#0A0A0B0d;padding:2px 6px;border-radius:4px}
@media (max-width:700px){.lado{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.desenha path,.gira{animation:none;stroke-dashoffset:0}}
</style></head><body>
<header><div style="max-width:1100px;margin:auto">${monograma({ id: 'g1', titulo: 'NK' }).replace('<svg ', '<svg style="width:180px;margin-bottom:24px" ')}
<h1>Guia de marca · NK Fotografia</h1><p class="sub" style="color:#1d2a33">Nícolas Teodoro · fotógrafo e videomaker em São Paulo. Tudo no site nasce de três elementos do logo: as linhas paralelas do monograma, o diafragma no lugar do “O” e o degradê menta → pervinca.</p></div></header>
<main>
<section><h2>1. Monograma redesenhado em vetor</h2><p class="sub">O logo existia só em JPEG. O monograma foi medido pixel a pixel e redesenhado com 8 traços de espessura constante (20 unidades), o que permite animar o “desenho das linhas”. À esquerda, o original; à direita, o SVG.</p>
<div class="lado"><div><div class="orig"><img src="logo-original.jpeg" alt="Logo original (recorte do monograma)"></div><small>Original (JPEG)</small></div><div>${monograma({ id: 'g2', titulo: 'NK em SVG' }).replace('<svg ', '<svg style="width:428px;max-width:100%" ')}<small>SVG · <code>assets/brand/nk-monograma.svg</code></small></div></div>
<div class="grade" style="margin-top:16px"><div class="cartao" style="background:#0A0A0B;display:grid;place-items:center">${monograma({ id: 'g3', cor: '#fff', classe: 'desenha', desenhar: true }).replace('<svg ', '<svg style="width:200px" ')}</div><div class="cartao"><h3>Usos</h3><p>Animação de abertura (linhas se desenhando), rodapé, cabeçalho, marca em imagens de compartilhamento.</p></div></div></section>

<section><h2>2. Paleta</h2><p class="sub">Cores amostradas do arquivo do logo. O azul do contorno não passa no contraste AA para texto pequeno sobre branco: use-o em contornos, ícones, linhas e títulos grandes. Para links e texto, use o azul escuro.</p>
<div class="grade">${cor('Menta', CORES.menta, 'início do degradê')}${cor('Névoa', CORES.nevoa, 'meio do degradê')}${cor('Pervinca', CORES.pervinca, 'fim do degradê')}${cor('Azul NK', CORES.azul, 'contorno do wordmark · só elementos grandes')}${cor('Azul escuro', CORES.azulEscuro, 'links e texto (5,4:1 sobre branco)', true)}${cor('Preto NK', CORES.preto, 'monograma, diafragma, fundos de galeria', true)}${cor('Papel', '#F5F6F3', 'fundo claro das galerias')}</div>
<div style="height:80px;border-radius:8px;margin-top:16px;background:var(--grad)"></div><p class="sub"><code>linear-gradient(90deg, #CEF3E1, #B9DAEB, #A2BFF7)</code> — assinatura: hero, aberturas de seção e rodapé. As fotos vivem sobre preto ou papel; o degradê emoldura, nunca compete.</p></section>

<section><h2>3. Tipografia</h2><div class="grade"><div class="cartao"><p style="font:700 2.2rem/1.1 Lexend;margin:0 0 8px">Lexend</p><p>Títulos e botões, 600–800. Geometria larga e arredondada, a mais próxima do wordmark.</p></div><div class="cartao"><p style="font:600 2.2rem/1.1 Inter;margin:0 0 8px">Inter</p><p>Texto corrido, 400–700. Ótima leitura no celular.</p></div></div><p class="sub">As duas fontes ficam hospedadas no próprio site (<code>assets/fonts</code>), sem depender do Google Fonts.</p></section>

<section><h2>4. Os três motivos gráficos</h2><div class="grade">
<div class="cartao"><h3>Linhas paralelas</h3>${divisor().replace('<svg ', '<svg style="width:120px;color:#5898C8;margin:12px 0" ')}<p>Três traços no ângulo exato da perna do N (≈52°). Divisores, sobretítulos, sublinhado de menu que “duplica” quando ativo: <span class="dupla">Portfólio</span></p></div>
<div class="cartao"><h3>Diafragma</h3><div style="display:flex;gap:16px;align-items:center;margin:12px 0">${diafragma({ id: 'g4', classe: 'gira' })}${diafragma({ id: 'g5' }).replace('<svg ', '<svg style="width:32px" ')}</div><p>Transição do hero (a foto abre como um disparo), carregamento das galerias, cursor sobre as fotos e favicon.</p></div>
<div class="cartao" style="background:#0A0A0B;color:#fff"><h3>Carimbo</h3><p class="carimbo">Shows</p><p>Texto branco com contorno azul deslocado. Só em títulos grandes das páginas de evento.</p></div>
</div>
<p style="margin-top:24px"><span class="wordmark">NK FOT${diafragma({ id: 'g6' })}GRAFIA</span></p></section>

<section><h2>5. Tom de voz</h2><div class="cartao"><p>Próximo, direto, paulistano, sem exagero. Primeira pessoa (“eu fotografo”, “eu levo”). Gancho recorrente: <b>“Não deixe pra última hora.”</b> Nada inventado: nenhum preço, cliente, depoimento ou número além de “+3 anos”.</p></div></section>
<section><h2>Arquivos</h2><p><code>nk-monograma.svg</code> · <code>nk-monograma-branco.svg</code> · <code>nk-monograma-branco.png</code> · <code>diafragma.svg</code> · <code>divisor-linhas.svg</code> · <code>cursor-diafragma.svg</code> · <code>../../favicon.svg</code></p></section>
</main></body></html>`;
writeFileSync(brand('brand.html'), guia);

console.log('Marca gerada em assets/brand/ (SVGs + brand.html) + favicon.svg');

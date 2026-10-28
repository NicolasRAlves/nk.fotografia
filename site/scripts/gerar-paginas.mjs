// =====================================================================
// NK Fotografia · gerador de páginas (Node 18+, sem dependências)
//   node scripts/gerar-paginas.mjs
// Lê data/config.js + data/fotos.js + data/videos.js + templates/*.html
// e grava as páginas prontas (o site funciona sem build depois disso).
// =====================================================================
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { monograma, diafragma, divisor } from './marca.mjs';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function carregar(arquivo, chave) {
  const p = join(SITE, 'data', arquivo);
  if (!existsSync(p)) return null;
  const ctx = { window: {} };
  vm.runInNewContext(readFileSync(p, 'utf8'), ctx);
  return ctx.window[chave];
}
const C = carregar('config.js', 'NK');
const TODAS = carregar('fotos.js', 'NK_FOTOS') || [];
const VIDEOS = (carregar('videos.js', 'NK_VIDEOS') || []).filter((v) => C.mostrarFotosSensiveis || !v.sensivel);
const PH = !!C.mostrarPlaceholders;
const ANO = new Date().getFullYear();
const HOJE = new Date().toISOString().slice(0, 10);

// ---------- dados derivados ----------
const FOTOS = TODAS.filter((f) => f.larguras && (C.mostrarFotosSensiveis || !f.sensivel));
const foto = (id) => (id && FOTOS.find((f) => f.id === id)) || null;
const video = (id) => (id && VIDEOS.find((v) => v.id === id)) || null;
const fotosDe = (slug) => FOTOS.filter((f) => f.categoria === slug);
const capaDe = (c) => foto(c.capa) || fotosDe(c.slug)[0] || null;
const capa2De = (c) => {
  const a = capaDe(c), b = foto(c.capa2);
  return (b && b !== a ? b : fotosDe(c.slug).find((f) => f !== a)) || null;
};
const ATIVAS = C.categorias.filter((c) => c.ativa);
const VISIVEIS = ATIVAS.filter((c) => fotosDe(c.slug).length || PH);
const NUM = (C.contato.whatsappNumero || '').replace(/\D/g, '');

// ---------- utilidades ----------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ph = (txt, tipo = 'CLIENTE INFORMAR') => (PH ? `<span class="ph">[${tipo}: ${esc(txt)}]</span>` : '');
const abs = (p = '') => (C.siteUrl ? C.siteUrl.replace(/\/$/, '') + '/' + p.replace(/^\//, '') : null);
const waHref = (msg) => (NUM ? `https://wa.me/${NUM}?text=${encodeURIComponent(msg)}` : C.contato.whatsappLink);
const msgPadrao = (tipo) => tipo
  ? `Oi, Nícolas! Vim pelo site e queria saber sua disponibilidade para ${tipo.toLowerCase()}.`
  : 'Oi, Nícolas! Vim pelo site e queria saber sobre disponibilidade.';
const DIV = divisor();
const tpl = (nome) => readFileSync(join(SITE, 'templates', nome), 'utf8').replace(/<!--[\s\S]*?-->\s*/g, '');
function preencher(texto, dados, nome) {
  return texto.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in dados)) throw new Error(`${nome}: o campo {{${k}}} não foi preenchido pelo gerador`);
    return dados[k] ?? '';
  });
}

const ICONE = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01Zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28Z"/></svg>',
  insta: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none"/></svg>',
  seta: '<svg class="seta" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  foto: '<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h6l2.5-4h9L23 10h6v16H3z"/><circle cx="16" cy="17" r="5.5"/></svg>',
  video: '<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="19" height="16" rx="2"/><path d="M22 14l7-4v12l-7-4"/></svg>',
  drone: '<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="12" y="13" width="8" height="6" rx="1.5"/><path d="M12 14L7 9M20 14l5-5M12 18l-5 5M20 18l5 5"/><path d="M3 8h8M21 8h8M3 24h8M21 24h8"/></svg>',
  fechar: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  ant: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 4l-8 8 8 8"/></svg>',
  prox: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4l8 8-8 8"/></svg>',
  mudo: '<svg class="i-mudo" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
  som: '<svg class="i-som" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13"/></svg>',
  pausa: '<svg viewBox="0 0 14 14" aria-hidden="true" fill="currentColor"><rect x="2" y="1" width="3.5" height="12"/><rect x="8.5" y="1" width="3.5" height="12"/></svg>',
};

// ---------- imagens ----------
const srcset = (f, ext, R) => f.larguras.map((w) => `${R}${f.arquivo}-${w}.${ext} ${w}w`).join(', ');
/** <picture> com AVIF/WebP/JPEG, width/height sempre definidos. adiado = srcset em data-* (o JS carrega depois). */
function img(f, { R, sizes, eager = false, prioridade = false, alt, classe = '', adiado = false }) {
  const fb = f.larguras.filter((w) => w <= 960).at(-1) || f.larguras[0];
  const s = adiado ? 'data-srcset' : 'srcset';
  return `<picture><source type="image/avif" ${s}="${srcset(f, 'avif', R)}" sizes="${sizes}">` +
    `<source type="image/webp" ${s}="${srcset(f, 'webp', R)}" sizes="${sizes}">` +
    `<img${classe ? ` class="${classe}"` : ''} ${adiado ? 'data-src' : 'src'}="${R}${f.arquivo}-${fb}.jpg" ${s}="${srcset(f, 'jpg', R)}" sizes="${sizes}" ` +
    `width="${f.w}" height="${f.h}" alt="${esc(alt ?? f.alt)}"${eager ? '' : ' loading="lazy"'} decoding="async"${prioridade ? ' fetchpriority="high"' : ''}` +
    `${f.foco ? ` style="object-position:${esc(f.foco)}"` : ''} draggable="false"></picture>`;
}
/** nome do trabalho (subpasta de fotos-entrada), vindo de config.js → albuns */
const tituloAlbum = (f) => (f?.album && C.albuns?.[f.album]?.titulo) || '';
/** placeholder (LQIP): miniatura WebP de 24px como fundo; o navegador amplia com suavização.
 *  (Antes era um SVG com desfoque, mas cada SVG vira um documento à parte e travava o celular em galerias grandes.) */
function lqip(f) {
  return f?.lqip ? `background-image:url(${f.lqip})` : '';
}
const legendaExif = (f) => [f.exif?.camera, f.exif?.tecnica].filter(Boolean).join(' · ');

// ---------- componentes ----------
// Grid justified calculado logo depois da galeria, antes da 1ª pintura (evita deslocamento de layout).
// O galeria.js reaproveita a mesma função no resize, no filtro e no "carregar mais".
const JUSTIFIED = "window.NKlayout=window.NKlayout||function(g){var W=Math.floor(g.getBoundingClientRect().width);if(!W)return;var cs=getComputedStyle(g),alvo=parseFloat(cs.getPropertyValue('--alt'))||220,gap=parseFloat(cs.columnGap)||6,l=[],s=0,its=[].filter.call(g.querySelectorAll('.gi'),function(e){return!e.hidden&&!e.hasAttribute('data-lote')});function f(u){var lv=W-gap*(l.length-1),h=u?Math.min(alvo,lv/s):lv/s,us=0;l.forEach(function(e,k){var w=Math.floor(e._r*h);if(!u&&k===l.length-1)w=lv-us;us+=w;e.style.width=w+'px';e.style.height=Math.round(h)+'px'});l=[];s=0}its.forEach(function(e){e._r=e._r||parseFloat(e.style.getPropertyValue('--r'))||1.5;l.push(e);s+=e._r;if(s*alvo+gap*(l.length-1)>=W)f(0)});if(l.length)f(1);g.classList.add('is-js')};NKlayout(document.currentScript.previousElementSibling);";
function galeria(lista, R, { id = 'galeria-fotos', lote = 12 } = {}) {
  if (!lista.length) return '';
  const itens = lista.map((f, i) => {
    const r = f.w / f.h;
    const sizes = `(max-width: 599px) ${Math.min(Math.round(r * 160), 400)}px, (max-width: 1023px) ${Math.round(r * 220 * 1.2)}px, ${Math.round(r * 280 * 1.25)}px`;
    return `<a class="gi lqip" href="${R}${f.arquivo}-${f.larguras.at(-1)}.jpg" style="--r:${r.toFixed(4)};${lqip(f)}" data-cat="${f.categoria}" data-album="${tituloAlbum(f) ? f.album : ''}" ` +
      `data-legenda="${esc(f.legenda || tituloAlbum(f))}" data-exif="${esc(legendaExif(f))}"${i >= lote ? ' data-lote' : ''}>` +
      `<span class="gi__sp"></span>${img(f, { R, sizes })}</a>`;
  }).join('\n');
  return `<div class="galeria${C.marcaDagua ? ' marca-dagua' : ''}" id="${id}" data-galeria data-lote-tam="${lote}">\n${itens}\n</div><script>${JUSTIFIED}</script>` +
    `<div class="galeria-mais"${lista.length > lote ? '' : ' hidden'}><button type="button" class="btn btn--contorno" data-mais="${id}">Carregar mais fotos</button></div>`;
}
function galeriaPlaceholder(nome) {
  if (!PH) return '';
  return `<div class="galeria--placeholder">${Array.from({ length: 5 }, (_, i) =>
    `<div class="ph-bloco">${i === 0 ? `<span class="ph">[FOTOS: ${esc(nome.toLowerCase())} — 12 a 24 fotos]</span>` : ''}</div>`).join('')}</div>`;
}
function lightbox() {
  return `<dialog class="lb" aria-label="Visualizador de fotos" data-lb>
  <div class="lb__topo"><span class="lb__contador" data-lb-cont></span><button type="button" class="lb__btn" data-lb-fechar aria-label="Fechar (Esc)">${ICONE.fechar}</button></div>
  <div class="lb__palco" data-lb-palco>
    <div class="lb__trilho" data-lb-trilho></div>
    ${diafragma({ id: 'lbsp', classe: 'lb__spinner carregando' })}
    <button type="button" class="lb__btn lb__nav lb__nav--ant" data-lb-ant aria-label="Foto anterior">${ICONE.ant}</button>
    <button type="button" class="lb__btn lb__nav lb__nav--prox" data-lb-prox aria-label="Próxima foto">${ICONE.prox}</button>
  </div>
  <div class="lb__rodape"><p class="lb__legenda" data-lb-leg></p><p class="lb__exif" data-lb-exif></p><p class="lb__dica">Deslize para os lados para navegar · para baixo para fechar · pinça ou toque duplo para zoom</p></div>
</dialog>`;
}
function videoBloco(v, R, { dica = 'vídeo', formato = 'wide', auto = false } = {}) {
  if (!v) {
    if (!PH) return '';
    return `<div class="video video--${formato === 'reel' ? 'reel' : 'wide'}"><span class="rec">REC</span><div class="ph-bloco"><span class="ph">[VÍDEO: ${esc(dica)}${formato === 'reel' ? ' — vertical 9:16' : ' — 16:9'}]</span></div></div>`;
  }
  const cls = v.formato === 'reel' ? 'reel' : 'wide';
  const attrs = auto ? 'muted loop playsinline data-auto preload="none"' : 'controls playsinline preload="none"';
  const som = auto && v.audio ? `<button type="button" class="video__som" data-som aria-pressed="false" aria-label="Ativar som: ${esc(v.titulo)}">${ICONE.mudo}${ICONE.som}</button>` : '';
  return `<div class="video video--${cls}"><span class="rec">REC</span><video ${attrs} data-poster="${R}${v.poster}.webp" width="${v.w}" height="${v.h}" aria-label="${esc(v.titulo)}"><source src="${R}${v.arquivo}" type="video/${v.arquivo.endsWith('.webm') ? 'webm' : 'mp4'}"></video>${som}</div>`;
}
function cardsEventos(R, cats, classe = '') {
  const sizes = '(max-width: 599px) 78vw, (max-width: 999px) 46vw, 33vw';
  return `<ul class="cards ${classe}">` + cats.map((c) => {
    const a = capaDe(c), b = capa2De(c), n = fotosDe(c.slug).length;
    if (!a) {
      return `<li><a class="card-ev card-ev--vazio" href="${R}eventos/${c.slug}/">${monograma({ classe: 'mono-fundo', id: 'cv-' + c.slug })}` +
        `<span class="card-ev__txt"><span class="card-ev__nome">${esc(c.nome)}</span><span class="card-ev__qtd">Galeria em breve</span></span></a></li>`;
    }
    return `<li><a class="card-ev lqip" style="${lqip(a)}" href="${R}eventos/${c.slug}/">${img(a, { R, sizes, alt: '' })}` +
      `${b ? img(b, { R, sizes, alt: '', classe: 'card-ev__img2', adiado: true }) : ''}` +
      `<span class="card-ev__txt"><span class="card-ev__nome">${esc(c.nome)}</span><span class="card-ev__qtd">${n} foto${n === 1 ? '' : 's'} na galeria</span></span></a></li>`;
  }).join('') + '</ul>';
}
function processo() {
  return `<ol class="passos">${C.processo.map((p) => `<li><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p>` +
    (p.prazo === null ? `<span class="prazo">${ph('prazo desta etapa')}</span>` : p.prazo ? `<span class="prazo">${esc(p.prazo)}</span>` : '') + '</li>').join('')}</ol>`;
}
function bastidores(R) {
  const b = fotosDe('bastidores');
  if (b.length) return `<div class="mt-l">${galeria(b.slice(0, 8), R, { id: 'galeria-bastidores', lote: 8 })}</div>`;
  return PH ? `<div class="mt-l galeria--placeholder" style="color:#ccc">${Array.from({ length: 5 }, (_, i) => `<div class="ph-bloco">${i === 0 ? '<span class="ph">[FOTOS: bastidores / produção — destaque “PRODUÇÃO” do Instagram]</span>' : ''}</div>`).join('')}</div>` : '';
}
function faqBloco(lista, titulo) {
  const itens = lista.filter((q) => q.r || PH);
  if (!itens.length) return '';
  return `<section class="sec sec--branco" aria-labelledby="t-faq"><div class="wrap"><div class="cabeca"><p class="sobretitulo">${DIV} Dúvidas</p>` +
    `<h2 class="titulo titulo--m" id="t-faq">${esc(titulo)}</h2></div><div class="faq">` +
    itens.map((q) => `<details><summary>${esc(q.p)}</summary><div>${q.r ? `<p>${esc(q.r)}</p>` : ph(q.dica || 'resposta')}</div></details>`).join('') +
    '</div></div></section>';
}
function checador(R, { sel = '', id = 'ck', titulo = 'Não deixe pra última hora.', lead } = {}) {
  lead ??= 'Escolhe a data, o tipo de evento e o lugar. Eu te mostro quantos dias faltam e você já me chama com tudo preenchido.';
  const ops = VISIVEIS.map((c) => `<option${c.slug === sel ? ' selected' : ''}>${esc(c.nome)}</option>`).join('') + '<option>Outro tipo de evento</option>';
  return `<section class="sec sec--grad" id="disponibilidade" aria-labelledby="t-${id}">
  <div class="wrap checador">
    <div>
      <p class="sobretitulo">${DIV} Disponibilidade</p>
      <h2 class="checador__titulo" id="t-${id}">${esc(titulo)}</h2>
      <p class="lead">${esc(lead)}</p>
    </div>
    <div>
      <form class="form form--2" data-checador novalidate>
        <div class="campo"><label for="${id}-data">Data do evento</label><input type="date" id="${id}-data" name="data" required></div>
        <div class="campo"><label for="${id}-tipo">Tipo de evento</label><select id="${id}-tipo" name="tipo">${ops}</select></div>
        <div class="campo campo--cheio"><label for="${id}-local">Bairro ou cidade</label><input type="text" id="${id}-local" name="local" autocomplete="address-level2" placeholder="Ex.: Mooca, São Paulo"></div>
        <div class="campo--cheio"><button class="btn btn--escuro" type="submit">Ver quantos dias faltam</button></div>
      </form>
      <div class="resultado mt-l" data-resultado hidden>
        <p class="resultado__dias" data-dias aria-live="polite"></p>
        <div class="botoes"><a class="btn btn--grad" data-wa-btn href="${esc(waHref(msgPadrao()))}" target="_blank" rel="noopener">${ICONE.wa} Chamar no WhatsApp</a></div>
        <div class="msg-pronta" data-msg-pronta hidden>
          <label class="rotulo" for="${id}-msg">Mensagem pronta — copie e cole no WhatsApp</label>
          <textarea id="${id}-msg" readonly></textarea>
          <div class="botoes"><button type="button" class="btn btn--branco btn--sm" data-copiar="#${id}-msg">Copiar mensagem</button></div>
          <span class="copiado" aria-live="polite"></span>
        </div>
        <p class="resultado__nota">A agenda não é automática: a data só fica confirmada depois que a gente fecha pelo WhatsApp.</p>
      </div>
    </div>
  </div>
</section>`;
}
function retrato(R) {
  const f = foto(C.sobre.foto);
  if (f) return `<div class="retrato lqip" style="${lqip(f)}">${img(f, { R, sizes: '(max-width: 899px) 100vw, 50vw' })}</div>`;
  if (!PH) return `<div class="retrato" style="background:var(--grad);display:grid;place-items:center">${monograma({ id: 'ret', classe: 'mono' }).replace('<svg ', '<svg style="width:55%" ')}</div>`;
  return `<div class="retrato"><div class="ph-bloco"><span class="ph">[CLIENTE ENVIAR: retrato do Nícolas (tem no perfil do Instagram)]</span></div></div>`;
}
function mochilaMidia(R) {
  const v = video(C.videoEquipamento);
  return v ? `<div class="mochila-video">${videoBloco(v, R, { formato: 'reel' })}</div>` : ilustracaoCamera();
}
function equipamento() {
  if (video(C.videoEquipamento) && !C.equipamento.length) {
    return `<p>No vídeo eu abro a mochila e mostro o que vai comigo em cada cobertura. ${ph('lista do equipamento em texto (câmeras, lentes, áudio, drone, iluminação)')}</p>` +
      (C.reelEquipamento ? `<a class="link-seta" href="${esc(C.reelEquipamento)}" target="_blank" rel="noopener">Ver o reel no Instagram</a>` : '');
  }
  const reel = C.reelEquipamento || C.contato.instagram;
  const lista = C.equipamento.length
    ? `<ul class="lista-equip">${C.equipamento.map((e) => `<li><b>${esc(e.item)}</b><span>${esc(e.modelo || '')}</span></li>`).join('')}</ul>`
    : `<p>${ph('lista do equipamento (câmeras, lentes, áudio, drone, iluminação)')}</p>`;
  return lista + `<a class="link-seta" href="${esc(reel)}" target="_blank" rel="noopener">Ver o reel “Qual equipamento eu levo para um dia de cobertura”</a>` +
    (C.reelEquipamento ? '' : ` ${ph('link do reel')}`);
}
function ilustracaoCamera() {
  // câmera desenhada com traços paralelos, no mesmo desenho de linha do monograma
  return `<svg class="mochila-ilus" viewBox="0 0 260 190" aria-hidden="true" fill="none" stroke="currentColor" stroke-linejoin="miter">
  <path d="M14 56h56l16-28h88l16 28h56v118H14z" stroke-width="7"/>
  <path d="M30 72h48l16-28h72l16 28h48v86H30z" stroke-width="3" stroke="#5898C8"/>
  <path d="M196 40h30" stroke-width="7"/><path d="M28 40h26" stroke-width="7"/>
  <circle cx="130" cy="113" r="50" stroke-width="7"/><circle cx="130" cy="113" r="38" stroke-width="3" stroke="#5898C8"/>
  <g transform="translate(102 85) scale(.56)">${diafragma({ id: 'cam', cor: 'currentColor' }).replace(/^<svg[^>]*>/, '').replace('</svg>', '')}</g>
  </svg>`;
}
function precoTexto(c) {
  return typeof c.preco === 'number'
    ? `<p class="lead">A partir de <strong>R$ ${c.preco.toLocaleString('pt-BR')}</strong>. O valor final depende da data, da duração e dos formatos.</p>`
    : '<p class="lead">Valor sob consulta: depende da data, da duração e dos formatos que você escolher.</p>';
}

// ---------- moldura da página (topo, rodapé, flutuantes) ----------
function topo(R, atual, claro) {
  const mini = (c) => {
    const f = capaDe(c);
    return f ? `<span class="mini">${img(f, { R, sizes: '160px', alt: '' })}</span>` : '<span class="mini mini--vazio">em breve</span>';
  };
  const cur = (k) => (atual === k ? ' aria-current="page"' : '');
  const evAtual = atual === 'eventos' || atual?.startsWith?.('ev:');
  return `<a class="pular-link" href="#conteudo">Pular para o conteúdo</a>
<header class="topo${claro ? ' topo--claro' : ''}" data-topo>
  <div class="wrap topo__in">
    <a class="topo__marca" href="${R || './'}"><span class="sr-only">NK Fotografia — início</span>${monograma({ id: 'topo', classe: 'mono' })}<span class="wordmark" aria-hidden="true">NK FOT${diafragma({ id: 'wm', classe: 'o' })}GRAFIA</span></a>
    <nav class="topo__nav" aria-label="Principal"><ul>
      <li><button type="button" class="topo__eventos" aria-expanded="false" aria-controls="painel-eventos"${evAtual ? ' aria-current="true"' : ''}>Eventos ${ICONE.seta}</button></li>
      <li><a href="${R}portfolio/"${cur('portfolio')}>Portfólio</a></li>
      <li><a href="${R}sobre/"${cur('sobre')}>Sobre</a></li>
      <li><a href="${R}orcamento/"${cur('orcamento')}>Orçamento</a></li>
    </ul></nav>
    <a class="btn btn--sm btn--grad topo__wa" href="${esc(waHref(msgPadrao()))}" target="_blank" rel="noopener">${ICONE.wa} WhatsApp</a>
    <button type="button" class="topo__menu" aria-expanded="false" aria-controls="menu-m" aria-label="Abrir menu"><span></span></button>
  </div>
  <div class="painel-eventos" id="painel-eventos" hidden><div class="wrap">
    <ul>${VISIVEIS.map((c) => `<li><a href="${R}eventos/${c.slug}/"${atual === 'ev:' + c.slug ? ' aria-current="page"' : ''}>${mini(c)}${esc(c.nome)}</a></li>`).join('')}</ul>
    <a class="link-seta todos" href="${R}eventos/" style="color:#fff">Ver todos os eventos</a>
  </div></div>
</header>
<div class="menu-m" id="menu-m" hidden>
  <h2>Eventos</h2>
  <ul class="menu-m__cards">${VISIVEIS.map((c) => {
    const f = capaDe(c);
    return `<li><a${f ? '' : ' class="vazio"'} href="${R}eventos/${c.slug}/">${f ? img(f, { R, sizes: '45vw', alt: '' }) : ''}<span>${esc(c.nome)}</span></a></li>`;
  }).join('')}</ul>
  <ul class="menu-m__links">
    <li><a href="${R || './'}">Início <span aria-hidden="true">→</span></a></li>
    <li><a href="${R}portfolio/">Portfólio <span aria-hidden="true">→</span></a></li>
    <li><a href="${R}sobre/">Sobre <span aria-hidden="true">→</span></a></li>
    <li><a href="${R}orcamento/">Orçamento <span aria-hidden="true">→</span></a></li>
  </ul>
  <a class="btn btn--grad" href="${esc(waHref(msgPadrao()))}" target="_blank" rel="noopener">${ICONE.wa} Chamar no WhatsApp</a>
</div>`;
}
function rodape(R) {
  const contatos = [
    `<li><a href="${esc(waHref(msgPadrao()))}" target="_blank" rel="noopener">WhatsApp</a></li>`,
    `<li><a href="${C.contato.instagram}" target="_blank" rel="noopener">Instagram ${esc(C.contato.instagramUser)}</a></li>`,
    `<li><a href="${C.contato.threads}" target="_blank" rel="noopener">Threads ${esc(C.contato.instagramUser)}</a></li>`,
    C.contato.canal ? `<li><a href="${esc(C.contato.canal)}" target="_blank" rel="noopener">Canal “${esc(C.contato.canalNome)}”</a></li>` : (PH ? `<li>Canal “${esc(C.contato.canalNome)}” ${ph('link')}</li>` : ''),
    C.contato.email ? `<li><a href="mailto:${esc(C.contato.email)}">${esc(C.contato.email)}</a></li>` : (PH ? `<li>${ph('e-mail')}</li>` : ''),
  ].join('');
  return `<footer class="rodape">
  ${monograma({ id: 'rodfundo', classe: 'rodape__mono' })}
  <div class="wrap">
    <p class="rodape__chamada">Eternizando momentos em São Paulo.</p>
    <div class="botoes">
      <a class="btn btn--escuro" href="${esc(waHref(msgPadrao()))}" target="_blank" rel="noopener">${ICONE.wa} Chamar no WhatsApp</a>
      <a class="btn btn--contorno" href="${R}orcamento/">Montar meu orçamento</a>
    </div>
    <div class="rodape__grade">
      <div><h2>Contato</h2><ul>${contatos}</ul></div>
      <div><h2>Eventos</h2><ul>${VISIVEIS.map((c) => `<li><a href="${R}eventos/${c.slug}/">${esc(c.nome)}</a></li>`).join('')}</ul></div>
      <div><h2>Site</h2><ul>
        <li><a href="${R || './'}">Início</a></li><li><a href="${R}eventos/">Todos os eventos</a></li>
        <li><a href="${R}portfolio/">Portfólio</a></li><li><a href="${R}sobre/">Sobre</a></li><li><a href="${R}orcamento/">Orçamento</a></li>
      </ul></div>
    </div>
    <div class="rodape__base">
      <div class="rodape__marca">${monograma({ id: 'rodmarca', classe: 'mono', titulo: 'NK' })}<span><strong>NK Fotografia</strong> · Nícolas Teodoro<br>São Paulo, SP</span></div>
      <p class="mb-0">© ${ANO} NK Fotografia. Todas as fotos são protegidas por direito autoral.</p>
    </div>
  </div>
</footer>`;
}
function flutuantes(R) {
  const href = esc(waHref(msgPadrao()));
  return `<a class="wa-flutuante" href="${href}" target="_blank" rel="noopener" aria-label="Chamar no WhatsApp">${ICONE.wa}</a>
<nav class="barra-m" aria-label="Ações rápidas">
  <a class="btn btn--branco" href="${R}orcamento/">Orçamento</a>
  <a class="btn btn--grad" href="${href}" target="_blank" rel="noopener">${ICONE.wa} WhatsApp</a>
</nav>`;
}
const dadosCliente = () => JSON.stringify({
  wa: NUM, waLink: C.contato.whatsappLink, ph: PH,
  precos: Object.fromEntries(ATIVAS.map((c) => [c.nome, typeof c.preco === 'number' ? c.preco : null])),
}).replace(/</g, '\\u003c');

const PESSOA = { '@type': 'Person', name: 'Nícolas Teodoro', jobTitle: 'Fotógrafo e videomaker', sameAs: [C.contato.instagram, C.contato.threads] };
const NEGOCIO = () => {
  const o = {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'NK Fotografia',
    description: 'Fotografia e vídeo para eventos e conteúdo social em São Paulo. ' + C.experiencia + '.',
    founder: PESSOA, areaServed: { '@type': 'City', name: 'São Paulo' },
    address: { '@type': 'PostalAddress', addressLocality: 'São Paulo', addressRegion: 'SP', addressCountry: 'BR' },
    sameAs: [C.contato.instagram, C.contato.threads], knowsAbout: ATIVAS.map((c) => c.nome),
  };
  if (C.siteUrl) { o.url = abs(''); o.image = abs('assets/img/og/home.jpg'); o.logo = abs('assets/brand/nk-monograma.svg'); }
  if (NUM) o.telephone = '+' + NUM;
  if (C.contato.email) o.email = C.contato.email;
  return o;
};
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

// ---------- montagem de página ----------
const BASE = tpl('base.html');
const paginas = [];
function pagina(caminho, o) {
  const R = o.R;
  const og = existsSync(join(SITE, 'assets/img/og', (o.og || 'home') + '.jpg')) ? `assets/img/og/${o.og || 'home'}.jpg` : 'assets/img/og/home.jpg';
  const html = preencher(BASE, {
    R, titulo: esc(o.titulo), descricao: esc(o.descricao), ogTitulo: esc(o.ogTitulo || o.titulo),
    canonical: C.siteUrl ? `<link rel="canonical" href="${abs(o.url)}">\n<meta property="og:url" content="${abs(o.url)}">` : '<!-- canonical: preencha siteUrl em data/config.js -->',
    ogImagem: C.siteUrl ? abs(og) : R + og,
    preload: o.preload || '', jsonld: (o.jsonld || []).map(ld).join('\n'),
    introScript: o.intro ? "try{if(!sessionStorage.getItem('nk-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('intro-on')}catch(e){}" : '',
    bodyClasse: ['tem-barra', o.bodyClasse].filter(Boolean).join(' '),
    bodyEstilo: o.acento ? ` style="--acento:${o.acento}"` : '',
    intro: o.intro ? `<div class="intro" data-intro><div aria-hidden="true">${monograma({ id: 'intro', classe: 'mono', desenhar: true })}</div><button type="button" class="intro__pular" data-intro-pular>Pular abertura</button></div>` : '',
    topo: topo(R, o.atual, o.claro), main: o.main, rodape: rodape(R), flutuantes: flutuantes(R),
    lightbox: o.lightbox ? lightbox() : '', dados: dadosCliente(),
    scripts: (o.scripts || []).map((s) => `<script src="${R}assets/js/${s}" defer></script>`).join('\n'),
  }, caminho);
  const destino = join(SITE, caminho);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, html);
  if (o.url !== undefined && !o.semSitemap) paginas.push(o.url);
  console.log('  ✓', caminho);
}
const heroPreload = (f, R) => `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcset(f, 'avif', R)}" imagesizes="100vw" fetchpriority="high">`;

// ---------- HOME ----------
function home() {
  const R = '';
  const slides = (C.home.hero || []).map(foto).filter(Boolean);
  const catDe = (f) => C.categorias.find((c) => c.slug === f.categoria)?.nome || '';
  const heroSlides = slides.map((f, i) => `<div class="hero__slide lqip${i === 0 ? ' is-ativo' : ''}" style="${lqip(f)}" data-legenda="${esc(catDe(f))}">${img(f, { R, sizes: '100vw', eager: i === 0, prioridade: i === 0, adiado: i > 0, alt: i === 0 ? f.alt : '' })}</div>`).join('');
  const heroMeta = slides.length > 1 ? `<div class="hero__meta"><span class="hero__legenda" data-hero-leg aria-hidden="true">${esc(catDe(slides[0]))}</span>
    <div class="hero__dots">${slides.map((f, i) => `<button type="button" aria-label="Foto ${i + 1} de ${slides.length}: ${esc(catDe(f))}"${i === 0 ? ' aria-current="true"' : ''} data-hero-ir="${i}"></button>`).join('')}</div>
    <button type="button" class="hero__pausa" data-hero-pausa aria-label="Pausar a troca de fotos">${ICONE.pausa}</button></div>` : '';

  // ---------- MOSAICO "Momentos eternizados": um pouco de cada tipo de evento ----------
  let destaques = '';
  {
    const nomeCat = (f) => C.categorias.find((c) => c.slug === f.categoria)?.nome || '';
    // fotos que podem aparecer: categorias visíveis, nunca as sensíveis
    const pool = FOTOS.filter((f) => !f.sensivel && VISIVEIS.some((c) => c.slug === f.categoria));
    // alterna as categorias (1 de cada por vez) para o enchimento automático e o rolo ficarem variados
    const porCat = VISIVEIS.map((c) => pool.filter((f) => f.categoria === c.slug)).filter((l) => l.length);
    const alternado = [];
    for (let i = 0; porCat.some((l) => l[i]); i++) porCat.forEach((l) => l[i] && alternado.push(l[i]));
    const v = video(C.home.destaquesVideo);
    const slots = (C.home.destaques || []).map(foto).map((f) => (f && pool.includes(f) ? f : null));
    while (slots.length < 8) slots.push(null);
    const usadas = new Set(slots.filter(Boolean));
    slots.forEach((f, i) => {
      if (f || (i === 1 && v)) return;
      const vertical = i === 1; // o espaço 2 é alto; os pequenos pedem foto horizontal
      const p = alternado.find((x) => !usadas.has(x) && (vertical ? x.h > x.w : x.w >= x.h)) || alternado.find((x) => !usadas.has(x));
      if (p) { slots[i] = p; usadas.add(p); }
    });
    if (usadas.size || PH) {
      const AREAS = 'abcdefgh';
      const sizes = (i) => (i === 0 || i === 4 ? '(max-width: 599px) 100vw, (max-width: 1099px) 50vw, 600px' : '(max-width: 599px) 50vw, (max-width: 1099px) 25vw, 300px');
      const tiles = slots.map((f, i) => {
        if (i === 1 && v) return `<div class="mosaico__item mosaico__item--video" style="grid-area:b">${videoBloco(v, R, { formato: 'reel', auto: true })}</div>`;
        if (!f) return PH ? `<div class="mosaico__item" style="grid-area:${AREAS[i]}"><div class="ph-bloco" style="position:absolute;inset:0;min-height:0"><span class="ph">[FOTO]</span></div></div>` : '';
        const grande = i === 0 || i === 4 ? ' mosaico__tag--grande' : '';
        return `<a class="mosaico__item lqip" style="grid-area:${AREAS[i]};${lqip(f)}" href="${R}eventos/${f.categoria}/#galeria">${img(f, { R, sizes: sizes(i) })}` +
          `<span class="mosaico__tag${grande}">${esc(nomeCat(f))}</span></a>`;
      }).join('');
      const total = FOTOS.filter((f) => ATIVAS.some((c) => c.slug === f.categoria)).length;
      const mais = `<a class="mosaico__mais" style="grid-area:m" href="${R}portfolio/"><span class="mosaico__num">${total}</span><span class="mosaico__txt">fotos no portfólio, separadas por evento</span><span class="link-seta">Ver portfólio</span></a>`;
      // rolo de filme com outras fotos, alternando os eventos (decorativo; as mesmas fotos estão no portfólio)
      const resto = alternado.filter((f) => !usadas.has(f)).slice(0, 16);
      const quadro = (f) => `<span class="rolo__q" style="--r:${(f.w / f.h).toFixed(3)}">${img(f, { R, sizes: '240px', alt: '' })}</span>`;
      const rolo = resto.length >= 4 ? `<div class="rolo" aria-hidden="true"><div class="rolo__trilho">${resto.map(quadro).join('')}${resto.map(quadro).join('')}</div></div>` : '';
      destaques = `<section class="sec sec--escuro sec--destaques" aria-labelledby="t-destaques"><div class="wrap">
      <div class="cabeca cabeca--linha"><div><p class="sobretitulo">${DIV} Destaques</p><h2 class="titulo carimbo" id="t-destaques">Momentos eternizados</h2></div>
      <p class="lead mb-0">Show, casamento, chá revelação, ensaio: cada evento tem o seu ritmo, e eu me adapto a ele. <a class="link-seta" href="${R}portfolio/">Ver o portfólio completo</a></p></div>
      <div class="mosaico">${tiles}${mais}</div>
    </div>${rolo}</section>`;
    }
  }

  const fEx = foto(C.home.exemploFoto);
  const vEx = video(C.home.exemploVideo);
  const dEx = foto(C.home.exemploDrone) || video(C.home.exemploDrone);
  const midia = (conteudo, dica) => conteudo || (PH ? `<div class="ph-bloco"><span class="ph">[${dica}]</span></div>` : '');
  const formatos = `<div class="formatos">
    <article class="formato"><div class="formato__midia lqip" style="${lqip(fEx)}">${midia(fEx && img(fEx, { R, sizes: '(max-width: 899px) 100vw, 33vw' }), 'FOTO: exemplo de cobertura')}</div>
      <div class="formato__txt"><h3>${ICONE.foto} Foto</h3><p>Fotos tratadas do começo ao fim: ambiente, detalhes, gente e emoção. É a memória que fica.</p></div></article>
    <article class="formato"><div class="formato__midia">${vEx ? videoBloco(vEx, R, { auto: true }) : midia(null, 'VÍDEO: exemplo de vídeo de evento')}${vEx ? '' : '<span class="rec">REC</span>'}</div>
      <div class="formato__txt"><h3>${ICONE.video} Vídeo</h3><p>Do reel rápido ao vídeo de melhores momentos: o evento em movimento, com som e ritmo.</p></div></article>
    <article class="formato"><div class="formato__midia">${dEx ? (dEx.poster ? videoBloco(dEx, R) : img(dEx, { R, sizes: '(max-width: 899px) 100vw, 33vw' })) : midia(null, 'DRONE: exemplo de imagem aérea (destaque “Drones”)')}</div>
      <div class="formato__txt"><h3>${ICONE.drone} Drone</h3><p>Imagens aéreas que mostram o tamanho do lugar e da festa. Eu verifico as regras de voo do local antes.</p></div></article>
  </div>`;

  const reelsIds = C.home.reelsSociais || [];
  const reels = Array.from({ length: 3 }, (_, i) => videoBloco(video(reelsIds[i]), R, { dica: `reel ${i + 1} de conteúdo social`, formato: 'reel', auto: true })).filter(Boolean);
  const reelsSociais = reels.length ? `<ul class="reels">${reels.map((r) => `<li>${r}</li>`).join('')}</ul>` : '';

  const clientes = C.clientes.length
    ? `<section class="sec sec--branco" aria-labelledby="t-clientes"><div class="wrap"><p class="sobretitulo">${DIV} Clientes 💙</p><h2 class="titulo titulo--m" id="t-clientes">Clientes &amp; artistas</h2><div class="faixa-clientes">${C.clientes.map((c) => `<span>${esc(c.nome)}${c.instagram ? ` <small>${esc(c.instagram)}</small>` : ''}</span>`).join('')}</div></div></section>`
    : PH ? `<section class="sec sec--branco" aria-labelledby="t-clientes"><div class="wrap"><p class="sobretitulo">${DIV} Clientes 💙 · Artistas 🎶</p><h2 class="titulo titulo--m" id="t-clientes">Clientes &amp; artistas</h2><p>${ph('nomes ou @ de clientes e artistas AUTORIZADOS a aparecer no site')}</p></div></section>` : '';

  const insta = (C.home.instagram || []).map(foto).filter(Boolean).slice(0, 6);
  const tiles = insta.map((f) => `<a class="lqip" style="${lqip(f)}" href="${C.contato.instagram}" target="_blank" rel="noopener">${img(f, { R, sizes: '(max-width: 899px) 33vw, 16vw' })}</a>`);
  if (PH) while (tiles.length < 6) tiles.push('<div class="ph-bloco"><span class="ph">[FOTO]</span></div>');
  const gradeInsta = `<div class="insta">${tiles.join('')}</div>`;

  const main = preencher(tpl('home.html'), {
    R, divisor: DIV, experiencia: esc(C.experiencia), experienciaMin: 'há mais de 3 anos eternizando momentos',
    heroSlides, heroMeta, cardsEventos: cardsEventos(R, VISIVEIS), destaques, formatos, reelsSociais,
    processo: processo(), ilustracaoCamera: mochilaMidia(R), equipamento: equipamento(), retrato: retrato(R),
    textoCurto: C.sobre.textoCurto ? `<p>${esc(C.sobre.textoCurto)}</p>` : `<p>${ph('texto do carrossel “Quem está por trás desse perfil?”', 'CLIENTE ENVIAR')}</p>`,
    clientes, checador: checador(R, { id: 'ck-home' }), instagramUser: esc(C.contato.instagramUser), instagram: C.contato.instagram,
    iconeInsta: ICONE.insta, gradeInsta,
    // a página de conteúdo social só existe quando a categoria está visível; senão, aponta para o Instagram
    linkSocial: VISIVEIS.some((c) => c.slug === 'conteudo-social')
      ? `<a href="${R}eventos/conteudo-social/">Ver conteúdo para redes</a>`
      : `<a href="${C.contato.instagram}" target="_blank" rel="noopener">Ver no Instagram</a>`,
  }, 'home.html');

  pagina('index.html', {
    R, url: '', titulo: 'NK Fotografia | Fotógrafo de eventos em São Paulo — Nícolas Teodoro',
    descricao: `Fotógrafo de eventos em São Paulo: shows, casamentos, aniversários, 15 anos, festas infantis, chá revelação, ensaios e drone. ${C.experiencia}. Não deixe pra última hora.`,
    main, claro: true, intro: true, preload: slides[0] ? heroPreload(slides[0], R) : '', jsonld: [NEGOCIO()],
    atual: 'home', og: 'home',
  });
}

// ---------- PÁGINAS DE EVENTO ----------
function evento(c) {
  const R = '../../';
  const lista = fotosDe(c.slug);
  const capa = capaDe(c);
  const tema = c.tema || 'claro';
  const acento = { menta: 'var(--nk-menta)', nevoa: 'var(--nk-nevoa)', pervinca: 'var(--nk-pervinca)', azul: 'var(--nk-azul)' }[c.acento] || 'var(--nk-pervinca)';
  const fundoSemFoto = tema === 'ceu' ? 'var(--grad-ceu)' : tema === 'escuro' ? 'linear-gradient(135deg, #0A0A0B 0 55%, #1a2230)' : 'var(--grad)';
  const confirmar = c.confirmar ? ` ${ph('confirmar se esta categoria entra no site', 'CLIENTE CONFIRMAR')}` : '';
  const hero = `<section class="hero hero--evento${capa ? '' : ' hero--sem-foto'}"${capa ? '' : ` style="background:${fundoSemFoto};${tema === 'escuro' ? 'color:#fff' : ''}"`} aria-labelledby="t-hero">
  ${capa ? `<div class="hero__slides"><div class="hero__slide is-ativo lqip" style="${lqip(capa)}">${img(capa, { R, sizes: '100vw', eager: true, prioridade: true })}</div></div><div class="visor" aria-hidden="true"></div>` : ''}
  <div class="wrap hero__conteudo">
    <nav class="trilha" aria-label="Você está em"><a href="${R}">Início</a> / <a href="${R}eventos/">Eventos</a> / ${esc(c.nome)}</nav>
    <h1 class="carimbo" id="t-hero">${esc(c.nome)}</h1>
    <p class="hero__sub">${esc(c.frase)}${confirmar}</p>
    <div class="botoes">
      <a class="btn btn--grad" href="#disponibilidade">Ver disponibilidade para minha data</a>
      <a class="btn btn--contorno" href="#galeria"${tema === 'escuro' || capa ? ' style="color:#fff"' : ''}>Ver galeria</a>
    </div>
  </div>
  <div class="hero__faixa" aria-hidden="true"></div>
</section>`;

  const n = lista.length;
  // filtro por trabalho (só quando a categoria tem 2+ grupos de fotos)
  const grupos = [];
  for (const f of lista) {
    const k = tituloAlbum(f) ? f.album : 'outros';
    const g = grupos.find((x) => x.k === k) || (grupos.push({ k, nome: k === 'outros' ? 'Outros trabalhos' : tituloAlbum(f), n: 0 }), grupos.at(-1));
    g.n++;
  }
  grupos.sort((a, b) => (a.k === 'outros') - (b.k === 'outros'));
  const filtroTrabalhos = grupos.length > 1
    ? `<div class="chips" role="group" aria-label="Filtrar por trabalho" data-filtros data-filtro-attr="album" data-filtro-param="trabalho">` +
      `<button type="button" class="chip" aria-pressed="true" data-filtro="">Todos <small>${n}</small></button>` +
      grupos.map((g) => `<button type="button" class="chip" aria-pressed="false" data-filtro="${g.k}">${esc(g.nome)} <small>${g.n}</small></button>`).join('') +
      `</div><p class="sr-only" aria-live="polite" data-filtro-status></p>`
    : '';
  const inc = (c.incluso || C.inclusoPadrao).filter((i) => i.texto || PH);
  const incluso = inc.length
    ? `<ul class="grade-cartoes grade-cartoes--4">${inc.map((i) => `<li class="cartao cartao--linhas"><h3>${esc(i.titulo)}</h3><p>${i.texto ? esc(i.texto) : ph(i.dica || 'detalhe')}</p></li>`).join('')}</ul>`
    : '<p class="lead">Cada cobertura é montada pro seu evento. Me chama que eu te passo os detalhes.</p>';
  const comb = (c.combina || []).filter((x) => x.oferece === true || (x.oferece === null && PH));
  const combina = comb.length ? `<section class="sec" aria-labelledby="t-combina"><div class="wrap"><div class="cabeca"><p class="sobretitulo">${DIV} Adicionais</p>
    <h2 class="titulo titulo--m" id="t-combina">Combina com ${esc(c.nome.toLowerCase())}</h2></div>
    <ul class="grade-cartoes grade-cartoes--3">${comb.map((x) => `<li class="cartao cartao--linhas"><h3>${esc(x.titulo)}</h3><p>${esc(x.texto)}</p>${x.oferece === null ? `<span class="cartao__tag">${ph('oferece?', 'CONFIRMAR')}</span>` : ''}</li>`).join('')}</ul></div></section>` : '';

  const main = preencher(tpl('evento.html'), {
    R, slug: c.slug, nome: esc(c.nome), divisor: DIV, hero,
    galeriaSecClasse: tema === 'escuro' ? 'sec--escuro' : 'sec--claro',
    contagem: n ? `${n} foto${n === 1 ? '' : 's'} · toque para ampliar` : '', filtroTrabalhos,
    galeria: n ? galeria(lista, R) : galeriaPlaceholder(c.nome),
    video: videoBloco(video(c.video), R, { dica: c.videoDica || 'vídeo da categoria', formato: video(c.video)?.formato === 'reel' ? 'reel' : 'wide' }) || '<p class="lead">Vídeo em breve.</p>',
    preco: precoTexto(c), incluso, processo: processo(), bastidores: bastidores(R), combina,
    faq: faqBloco(c.faq || [], `Dúvidas sobre ${c.nome.toLowerCase()}`),
    cta: checador(R, { sel: c.slug, id: 'ck-ev', titulo: 'Não deixe pra última hora.', lead: `Me chama com a data do seu evento. O tipo “${c.nome}” já vai preenchido.` }),
  }, 'evento.html');

  const galeriaLD = { '@context': 'https://schema.org', '@type': 'ImageGallery', name: `${c.nome} — NK Fotografia`, description: c.descricao, author: PESSOA };
  if (C.siteUrl) {
    galeriaLD.url = abs(`eventos/${c.slug}/`);
    galeriaLD.image = lista.map((f) => ({ '@type': 'ImageObject', contentUrl: abs(`${f.arquivo}-${f.larguras.at(-1)}.jpg`), description: f.alt, creator: PESSOA, creditText: 'NK Fotografia', copyrightNotice: 'NK Fotografia' }));
  }
  pagina(`eventos/${c.slug}/index.html`, {
    R, url: `eventos/${c.slug}/`, titulo: `${c.seoTitulo} | NK Fotografia`, ogTitulo: `${c.nome} — NK Fotografia`,
    descricao: c.seoDescricao || c.descricao, main, claro: !!capa || tema === 'escuro', lightbox: n > 0,
    scripts: n > 0 ? ['galeria.js'] : [], preload: capa ? heroPreload(capa, R) : '', jsonld: [galeriaLD],
    atual: 'ev:' + c.slug, og: c.slug, bodyClasse: `tema-${tema}`, acento,
  });
}

// ---------- outras páginas ----------
function eventosIndex() {
  const R = '../';
  const main = preencher(tpl('eventos.html'), { R, divisor: DIV, cards: cardsEventos(R, VISIVEIS), processo: processo(), checador: checador(R, { id: 'ck-evs' }) }, 'eventos.html');
  pagina('eventos/index.html', { R, url: 'eventos/', titulo: 'Eventos | NK Fotografia — fotógrafo de eventos em SP', descricao: `Escolha o seu tipo de evento: ${VISIVEIS.map((c) => c.nome).join(', ')}. Fotografia e vídeo em São Paulo por Nícolas Teodoro.`, main, atual: 'eventos' });
}
function portfolio() {
  const R = '../';
  const comFotos = ATIVAS.filter((c) => fotosDe(c.slug).length);
  const ordem = Object.fromEntries(ATIVAS.map((c, i) => [c.slug, i]));
  const lista = FOTOS.filter((f) => f.categoria in ordem).sort((a, b) => ordem[a.categoria] - ordem[b.categoria]);
  const chips = `<button type="button" class="chip" aria-pressed="true" data-filtro="">Todos <small>${lista.length}</small></button>` +
    comFotos.map((c) => `<button type="button" class="chip" aria-pressed="false" data-filtro="${c.slug}">${esc(c.nome)} <small>${fotosDe(c.slug).length}</small></button>`).join('');
  const vazias = ATIVAS.filter((c) => !fotosDe(c.slug).length);
  const placeholders = PH && vazias.length ? `<div class="mt-l"><p class="sobretitulo">${DIV} Ainda sem fotos</p><p>${vazias.map((c) => ph(`${c.nome} — 12 a 24 fotos`, 'FOTOS')).join(' ')}</p></div>` : '';
  const main = preencher(tpl('portfolio.html'), { R, divisor: DIV, chips, galeria: galeria(lista, R, { id: 'galeria-portfolio' }), placeholders, checador: checador(R, { id: 'ck-port' }) }, 'portfolio.html');
  pagina('portfolio/index.html', { R, url: 'portfolio/', titulo: 'Portfólio | NK Fotografia — fotos de eventos em São Paulo', descricao: 'Portfólio de Nícolas Teodoro com filtro por evento: shows, casamentos, aniversários, festas infantis, chá revelação e ensaios em São Paulo.', main, atual: 'portfolio', lightbox: true, scripts: ['galeria.js'] });
}
function sobre() {
  const R = '../';
  const main = preencher(tpl('sobre.html'), {
    R, divisor: DIV, retrato: retrato(R), experienciaMin: 'há mais de 3 anos eternizando momentos',
    historia: C.sobre.historia ? C.sobre.historia.split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join('') : `<p>${ph('história do Nícolas (base: carrossel “Quem está por trás desse perfil?”)', 'CLIENTE ENVIAR')}</p>`,
    instagram: C.contato.instagram, instagramUser: esc(C.contato.instagramUser), threads: C.contato.threads, iconeInsta: ICONE.insta,
    comoTrabalho: C.sobre.comoTrabalho ? esc(C.sobre.comoTrabalho) : `Cada cobertura começa antes do evento: entender o que importa pra você e planejar onde eu preciso estar. ${ph('equipe? segundo fotógrafo? como é a produção?')}`,
    processo: processo(), bastidores: bastidores(R), ilustracaoCamera: mochilaMidia(R), equipamento: equipamento(),
    regiao: C.regiaoAtendimento ? esc(C.regiaoAtendimento) : `Eu sou de São Paulo e atendo eventos na cidade. ${ph('região de atendimento: só capital? Grande SP? viaja?')}`,
    faq: faqBloco(C.faqGeral, 'Perguntas frequentes'), checador: checador(R, { id: 'ck-sobre' }),
  }, 'sobre.html');
  const pessoa = { '@context': 'https://schema.org', ...PESSOA, description: `Fotógrafo e videomaker em São Paulo. ${C.experiencia}. ${C.especialidade}`, worksFor: { '@type': 'ProfessionalService', name: 'NK Fotografia' }, homeLocation: { '@type': 'City', name: 'São Paulo' } };
  if (C.siteUrl) pessoa.url = abs('sobre/');
  pagina('sobre/index.html', { R, url: 'sobre/', titulo: 'Sobre | Nícolas Teodoro — fotógrafo e videomaker em São Paulo', descricao: `Quem está por trás da NK Fotografia: Nícolas Teodoro, fotógrafo e videomaker em São Paulo. ${C.experiencia}. ${C.especialidade}`, main, atual: 'sobre', jsonld: [pessoa], lightbox: fotosDe('bastidores').length > 0, scripts: fotosDe('bastidores').length ? ['galeria.js'] : [] });
}
function orcamento() {
  const R = '../';
  const opcao = (tipo, nome, valor, extra = '', checked = false, slug = '') => `<label class="opcao"><input type="${tipo}" name="${nome}" value="${esc(valor)}"${slug ? ` data-slug="${slug}"` : ''}${checked ? ' checked' : ''}${tipo === 'radio' ? ' required' : ''}><span>${esc(valor)}${extra}</span></label>`;
  const svc = (lista, nome) => lista.filter((s) => s.oferece === true || (s.oferece === null && PH))
    .map((s) => opcao('checkbox', nome, s.nome, s.oferece === null ? ` ${ph('oferece?', 'CONFIRMAR')}` : '', s.id === 'foto' || s.id === 'fotos')).join('');
  const temPreco = ATIVAS.some((c) => typeof c.preco === 'number');
  const main = preencher(tpl('orcamento.html'), {
    R, divisor: DIV, waLink: esc(waHref(msgPadrao())), iconeWa: ICONE.wa,
    opcoesTipo: VISIVEIS.map((c) => opcao('radio', 'tipo', c.nome, '', false, c.slug)).join('') + opcao('radio', 'tipo', 'Outro tipo de evento'),
    opcoesFormatos: svc(C.formatos, 'formatos'), opcoesEntregas: svc(C.entregas, 'entregas'),
    precoNota: temPreco ? 'Os valores “a partir de” são uma referência; o orçamento final vem pelo WhatsApp.' : `Os valores são sob consulta. ${ph('pacotes e preços “a partir de”')}`,
  }, 'orcamento.html');
  pagina('orcamento/index.html', { R, url: 'orcamento/', titulo: 'Orçamento | Monte sua cobertura — NK Fotografia', descricao: 'Monte a cobertura do seu evento em São Paulo (foto, vídeo e drone) e mande o pedido pronto no WhatsApp do Nícolas Teodoro. Não deixe pra última hora.', main, atual: 'orcamento', scripts: ['orcamento.js'] });
}
function pagina404() {
  const R = C.siteUrl ? new URL(C.siteUrl).pathname.replace(/\/?$/, '/') : '/';
  const main = preencher(tpl('404.html'), { R, divisor: DIV }, '404.html');
  pagina('404.html', { R, url: '404.html', semSitemap: true, titulo: 'Página não encontrada | NK Fotografia', descricao: 'Essa página saiu do enquadramento. Veja o portfólio e os eventos da NK Fotografia.', main });
}

// ---------- execução ----------
console.log('Gerando páginas…');
console.log(`  placeholders: ${PH ? 'VISÍVEIS' : 'ocultos'} · fotos sensíveis: ${C.mostrarFotosSensiveis ? 'visíveis' : 'ocultas'} · fotos: ${FOTOS.length}/${TODAS.length}`);
home();
// limpa páginas de categorias que deixaram de ser visíveis
const pastaEventos = join(SITE, 'eventos');
if (existsSync(pastaEventos)) for (const d of readdirSync(pastaEventos)) {
  const p = join(pastaEventos, d);
  if (statSync(p).isDirectory() && !VISIVEIS.find((c) => c.slug === d)) {
    const arquivos = readdirSync(p);
    if (arquivos.length <= 1 && (!arquivos.length || arquivos[0] === 'index.html')) { rmSync(p, { recursive: true }); console.log('  – removida', `eventos/${d}/`); }
  }
}
VISIVEIS.forEach(evento);
eventosIndex(); portfolio(); sobre(); orcamento(); pagina404();

const dom = C.siteUrl ? C.siteUrl.replace(/\/$/, '') : 'https://DOMINIO-A-DEFINIR';
writeFileSync(join(SITE, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n${C.siteUrl ? '' : '<!-- [CLIENTE INFORMAR: domínio] Preencha siteUrl em data/config.js e rode o gerador de novo. -->\n'}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paginas.map((u) => `  <url><loc>${dom}/${u}</loc><lastmod>${HOJE}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(SITE, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /templates/\nDisallow: /scripts/\n\nSitemap: ${dom}/sitemap.xml\n`);
console.log(`  ✓ sitemap.xml (${paginas.length} URLs) e robots.txt${C.siteUrl ? '' : '  ⚠ siteUrl vazio: preencha o domínio no config.js'}`);
console.log(`Pronto: ${VISIVEIS.length} página(s) de evento: ${VISIVEIS.map((c) => c.slug).join(', ')}`);

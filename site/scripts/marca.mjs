// Geometria da marca NK, medida pixel a pixel no logo original (logo-nk.jpeg, 810×842).
// O monograma é feito de traços de largura constante (20 unidades), por isso é desenhado
// com <path stroke> — o que permite a animação de "desenhar as linhas".

const W = 20; // espessura de cada traço

// Cada traço: d = caminho central, clip = recorte opcional (x mínimo/máximo).
const TRACOS = [
  { d: 'M182 498V254.5L403.5 425.4V234' },                     // N: traço externo
  { d: 'M223 498V336.2L447.7 510', clip: { xMax: 413.5 } },    // N: traço interno
  { d: 'M363 234V394' },                                       // N: perna curta
  { d: 'M445.5 234V418' },                                     // K: haste
  { d: 'M552.2 220L417.5 470', clip: { xMin: 436 } },          // K: braço superior interno
  { d: 'M598.7 220L442.1 510' },                               // K: braço superior externo
  { d: 'M518.4 368.6L595.8 510' },                             // K: perna inferior externa
  { d: 'M495.7 410.8L549.7 510' },                             // K: perna inferior interna
];

export const VIEWBOX_MONO = '172 234 428 263.5';

/**
 * SVG do monograma NK.
 * @param {object} o
 * @param {string} o.id      sufixo único (para os clipPaths quando houver vários na página)
 * @param {string} o.cor     cor do traço (padrão currentColor)
 * @param {string} o.classe  classe CSS do <svg>
 * @param {boolean} o.desenhar  adiciona pathLength="1" para animar com stroke-dasharray
 * @param {string} o.titulo  texto acessível; vazio = decorativo (aria-hidden)
 */
export function monograma({ id = 'm', cor = 'currentColor', classe = '', desenhar = false, titulo = '' } = {}) {
  const defs = [];
  const paths = TRACOS.map((t, i) => {
    let clipAttr = '';
    if (t.clip) {
      const cid = `nkc-${id}-${i}`;
      const x = t.clip.xMin ?? 160;
      const x2 = t.clip.xMax ?? 620;
      defs.push(`<clipPath id="${cid}"><rect x="${x}" y="220" width="${x2 - x}" height="300"/></clipPath>`);
      clipAttr = ` clip-path="url(#${cid})"`;
    }
    return `<path d="${t.d}"${desenhar ? ' pathLength="1"' : ''}${clipAttr} style="--i:${i}"/>`;
  });
  const a11y = titulo ? `role="img" aria-label="${titulo}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="${classe}" viewBox="${VIEWBOX_MONO}" ${a11y} xmlns="http://www.w3.org/2000/svg">` +
    (defs.length ? `<defs>${defs.join('')}</defs>` : '') +
    `<g fill="none" stroke="${cor}" stroke-width="${W}" stroke-linejoin="miter" stroke-miterlimit="4" stroke-linecap="butt">${paths.join('')}</g></svg>`;
}

// ---------- Diafragma (o "O" de FOTOGRAFIA) ----------
// Círculo com abertura hexagonal e 6 frestas entre as lâminas (prolongamento das arestas do hexágono).
function pontosDiafragma(abertura = 0.42, giro = 15) {
  const c = 50, R = 48, r = R * abertura;
  const v = [];
  for (let k = 0; k < 6; k++) {
    const a = ((k * 60 + giro) * Math.PI) / 180;
    v.push([c + r * Math.cos(a), c + r * Math.sin(a)]);
  }
  const frestas = v.map((p, k) => {
    const q = v[(k + 1) % 6];
    const dx = q[0] - p[0], dy = q[1] - p[1], n = Math.hypot(dx, dy);
    const ex = q[0] + (dx / n) * 60, ey = q[1] + (dy / n) * 60;
    return `M${p[0].toFixed(2)} ${p[1].toFixed(2)}L${ex.toFixed(2)} ${ey.toFixed(2)}`;
  });
  const hex = 'M' + v.map(p => p.map(n => n.toFixed(2)).join(' ')).join('L') + 'Z';
  return { R, c, hex, frestas: frestas.join('') };
}

/** SVG do diafragma. Usa máscara (fundo transparente entre as lâminas). */
export function diafragma({ id = 'd', cor = 'currentColor', classe = '', titulo = '', abertura = 0.42 } = {}) {
  const { R, c, hex, frestas } = pontosDiafragma(abertura);
  const mid = `nkd-${id}`;
  const a11y = titulo ? `role="img" aria-label="${titulo}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="${classe}" viewBox="0 0 100 100" ${a11y} xmlns="http://www.w3.org/2000/svg">` +
    `<defs><mask id="${mid}"><circle cx="${c}" cy="${c}" r="${R}" fill="#fff"/><path d="${hex}" fill="#000"/>` +
    `<path d="${frestas}" stroke="#000" stroke-width="3.6" fill="none"/></mask></defs>` +
    `<circle cx="${c}" cy="${c}" r="${R}" fill="${cor}" mask="url(#${mid})"/></svg>`;
}

/** Três linhas paralelas no ângulo da perna do N (inclinação 1,2955 → ~52,3° da vertical). */
export function divisor({ classe = 'divisor' } = {}) {
  // 3 traços diagonais com o mesmo passo das diagonais do N (65 na horizontal = traço 20 + vão 20)
  const d = [0, 65, 130].map(o => `M${o} 0L${o + 77.7} 60`).join('');
  return `<svg class="${classe}" viewBox="-16 0 240 60"aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><path d="${d}" fill="none" stroke="currentColor" stroke-width="20"/></svg>`;
}

export const CORES = {
  menta: '#CEF3E1', nevoa: '#B9DAEB', pervinca: '#A2BFF7',
  azul: '#5898C8', azulEscuro: '#2F6FA3', preto: '#0A0A0B', branco: '#FFFFFF',
};

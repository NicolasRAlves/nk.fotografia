/* NK Fotografia · grid justified, "carregar mais", filtro por evento e lightbox (escritos à mão, sem bibliotecas) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const galerias = $$('[data-galeria]');
  if (!galerias.length) return;

  // ---------- grid justified: linhas de altura igual, respeitando a proporção de cada foto ----------
  const layout = (g) => (window.NKlayout ? window.NKlayout(g) : layoutLocal(g));
  function layoutLocal(g) {
    const W = Math.floor(g.getBoundingClientRect().width); // para baixo: clientWidth arredonda e a última foto quebrava a linha
    if (!W) return;
    const cs = getComputedStyle(g);
    const alvo = parseFloat(cs.getPropertyValue('--alt')) || 220; // ≈160px celular, ≈280px desktop (CSS)
    const gap = parseFloat(cs.columnGap) || 6;
    const itens = $$('.gi', g).filter((el) => !el.hidden && !el.hasAttribute('data-lote'));
    let linha = [], soma = 0;
    const fecha = (ultima) => {
      const livre = W - gap * (linha.length - 1);
      const h = ultima ? Math.min(alvo, livre / soma) : livre / soma;
      let usado = 0;
      linha.forEach((el, k) => {
        let w = Math.floor(el._r * h);
        if (!ultima && k === linha.length - 1) w = livre - usado; // fecha a linha no pixel exato
        usado += w;
        el.style.width = w + 'px';
        el.style.height = Math.round(h) + 'px';
      });
      linha = []; soma = 0;
    };
    itens.forEach((el) => {
      el._r ??= parseFloat(el.style.getPropertyValue('--r')) || 1.5;
      linha.push(el); soma += el._r;
      if (soma * alvo + gap * (linha.length - 1) >= W) fecha(false);
    });
    if (linha.length) fecha(true);
    g.classList.add('is-js');
  }
  // recalcula no resize (com debounce), só quando a largura muda
  const larguras = new WeakMap();
  let t;
  const ro = new ResizeObserver((ents) => {
    clearTimeout(t);
    t = setTimeout(() => ents.forEach(({ target: g }) => {
      if (larguras.get(g) !== g.clientWidth) { larguras.set(g, g.clientWidth); layout(g); }
    }), 120);
  });
  galerias.forEach((g) => { layout(g); larguras.set(g, g.clientWidth); ro.observe(g); });

  // ---------- carregar mais (lotes de 12) ----------
  function paginar(g, quantos) {
    const tam = Number(g.dataset.loteTam) || 12;
    const visiveis = $$('.gi', g).filter((el) => !el.hidden);
    visiveis.forEach((el, k) => el.toggleAttribute('data-lote', k >= quantos));
    g._mostrando = Math.min(quantos, visiveis.length);
    const mais = document.querySelector(`[data-mais="${g.id}"]`)?.parentElement;
    if (mais) mais.hidden = visiveis.length <= quantos;
    layout(g);
    return tam;
  }
  galerias.forEach((g) => { g._mostrando = Number(g.dataset.loteTam) || 12; });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mais]');
    if (!b) return;
    const g = document.getElementById(b.dataset.mais);
    const tam = Number(g.dataset.loteTam) || 12;
    const antes = g._mostrando;
    paginar(g, antes + tam);
    // leva o foco para a primeira foto nova (teclado/leitor de tela)
    $$('.gi', g).filter((el) => !el.hidden)[antes]?.focus({ preventScroll: true });
  });

  // ---------- filtro guardado na URL ----------
  // portfólio: por evento (?evento=drone) · página do evento: por trabalho (?trabalho=veigh)
  const filtros = $('[data-filtros]');
  if (filtros) {
    const g = galerias[0];
    const attr = filtros.dataset.filtroAttr || 'cat';
    const param = filtros.dataset.filtroParam || 'evento';
    const status = $('[data-filtro-status]');
    const chips = $$('[data-filtro]', filtros);
    function filtrar(slug, atualizarUrl = true) {
      const chip = chips.find((c) => c.dataset.filtro === slug) || chips[0];
      slug = chip.dataset.filtro;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      $$('.gi', g).forEach((el) => { el.hidden = !!slug && (el.dataset[attr] || 'outros') !== slug; });
      paginar(g, Number(g.dataset.loteTam) || 12);
      const n = $$('.gi', g).filter((el) => !el.hidden).length;
      if (status) status.textContent = `${n} foto${n === 1 ? '' : 's'}${slug ? ' de ' + chip.firstChild.textContent.trim() : ''}`;
      if (atualizarUrl) {
        const u = new URL(location.href);
        slug ? u.searchParams.set(param, slug) : u.searchParams.delete(param);
        history.replaceState(null, '', u);
      }
    }
    chips.forEach((c) => c.addEventListener('click', () => filtrar(c.dataset.filtro)));
    const inicial = new URLSearchParams(location.search).get(param);
    if (inicial) filtrar(inicial, false);
  }

  // ---------- lightbox ----------
  const lb = $('[data-lb]');
  if (!lb) return;
  const palco = $('[data-lb-palco]', lb);
  const trilho = $('[data-lb-trilho]', lb);
  const cont = $('[data-lb-cont]', lb);
  const leg = $('[data-lb-leg]', lb);
  const exif = $('[data-lb-exif]', lb);
  let lista = [], idx = 0, origem = null, img = null;
  let escala = 1, tx = 0, ty = 0;

  function aplicarZoom() { if (img) img.style.transform = `translate(${tx}px, ${ty}px) scale(${escala})`; }
  function resetZoom() { escala = 1; tx = ty = 0; aplicarZoom(); }

  function render() {
    const a = lista[idx];
    const pic = $('picture', a).cloneNode(true);
    $$('source, img', pic).forEach((n) => { n.sizes = '100vw'; });
    img = $('img', pic);
    img.removeAttribute('loading');
    img.className = 'lb__img is-carregando';
    palco.classList.add('is-carregando');
    const pronto = () => { img.classList.remove('is-carregando'); palco.classList.remove('is-carregando'); };
    img.addEventListener('load', pronto, { once: true });
    img.addEventListener('error', pronto, { once: true });
    trilho.style.transform = '';
    trilho.replaceChildren(pic);
    if (img.complete && img.naturalWidth) pronto();
    cont.textContent = `${idx + 1}/${lista.length}`;
    leg.textContent = a.dataset.legenda || '';
    exif.textContent = a.dataset.exif || '';
    resetZoom();
  }
  function nav(d) {
    if (lista.length < 2) return;
    idx = (idx + d + lista.length) % lista.length;
    render();
  }
  function abrir(a) {
    const g = a.closest('[data-galeria]');
    lista = $$('.gi', g).filter((el) => !el.hidden); // inclui as fotos ainda não carregadas do filtro atual
    idx = lista.indexOf(a);
    origem = a;
    render();
    lb.showModal();
    document.body.classList.add('lb-aberto');
    $('[data-lb-fechar]', lb).focus();
  }
  function fechar() { if (lb.open) lb.close(); }
  lb.addEventListener('close', () => {
    document.body.classList.remove('lb-aberto');
    trilho.replaceChildren();
    lb.style.background = '';
    origem?.focus({ preventScroll: true });
  });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('.gi');
    if (!a || !a.closest('[data-galeria]') || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    abrir(a);
  });
  $('[data-lb-fechar]', lb).addEventListener('click', fechar);
  $('[data-lb-ant]', lb).addEventListener('click', () => nav(-1));
  $('[data-lb-prox]', lb).addEventListener('click', () => nav(1));
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); nav(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); nav(1); }
  });

  // gestos: arrastar para os lados (navegar), para baixo (fechar), pinça e toque duplo (zoom)
  const ptrs = new Map();
  let x0 = 0, y0 = 0, dx = 0, dy = 0, modo = null, dist0 = 0, escala0 = 1, tx0 = 0, ty0 = 0, ultimoToque = 0;
  const distancia = () => { const [a, b] = [...ptrs.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  palco.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    palco.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) { x0 = e.clientX; y0 = e.clientY; dx = dy = 0; modo = null; tx0 = tx; ty0 = ty; }
    else if (ptrs.size === 2) { modo = 'pinca'; dist0 = distancia(); escala0 = escala; }
  });
  palco.addEventListener('pointermove', (e) => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (modo === 'pinca' && ptrs.size === 2) { escala = Math.min(4, Math.max(1, escala0 * distancia() / dist0)); aplicarZoom(); return; }
    dx = e.clientX - x0; dy = e.clientY - y0;
    if (escala > 1) { modo = 'arrasto'; tx = tx0 + dx; ty = ty0 + dy; aplicarZoom(); return; }
    if (!modo && Math.hypot(dx, dy) > 8) modo = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
    if (modo === 'h') trilho.style.transform = `translateX(${dx}px)`;
    if (modo === 'v' && dy > 0) {
      trilho.style.transform = `translateY(${dy}px) scale(${1 - Math.min(dy, 400) / 2000})`;
      lb.style.background = `rgba(6,6,7,${0.97 - Math.min(dy, 300) / 500})`;
    }
  });
  const soltar = (e) => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.delete(e.pointerId);
    if (modo === 'pinca') { if (ptrs.size === 0) { if (escala < 1.05) resetZoom(); modo = null; } return; }
    if (ptrs.size) return;
    if (modo === 'h' && Math.abs(dx) > 60) nav(dx < 0 ? 1 : -1);
    else if (modo === 'v' && dy > 110) fechar();
    else if (!modo && e.pointerType !== 'mouse') {
      const agora = Date.now();
      if (agora - ultimoToque < 300) { escala > 1 ? resetZoom() : (escala = 2.2, aplicarZoom()); ultimoToque = 0; }
      else ultimoToque = agora;
    }
    trilho.style.transform = '';
    lb.style.background = '';
    modo = null;
  };
  palco.addEventListener('pointerup', soltar);
  palco.addEventListener('pointercancel', soltar);
  palco.addEventListener('dblclick', (e) => { if (!e.target.closest('button')) { escala > 1 ? resetZoom() : (escala = 2.2, aplicarZoom()); } });
})();

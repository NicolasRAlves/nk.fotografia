/* NK Fotografia · comportamento comum a todas as páginas (sem dependências) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const html = document.documentElement;
  const reduz = matchMedia('(prefers-reduced-motion: reduce)');
  let DADOS = {};
  try { DADOS = JSON.parse($('#nk-dados').textContent); } catch (e) { /* sem dados */ }
  const sessao = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* modo privado */ } },
  };

  // ---------- WhatsApp ----------
  const waUrl = (msg) => (DADOS.wa ? `https://wa.me/${DADOS.wa}?text=${encodeURIComponent(msg)}` : DADOS.waLink);
  /** Atualiza o botão do WhatsApp e, sem número cadastrado, mostra a mensagem para copiar. */
  function aplicarMensagem(caixa, msg, ativo = true) {
    const btn = $('[data-wa-btn]', caixa);
    if (btn) {
      btn.href = waUrl(msg);
      btn.toggleAttribute('aria-disabled', !ativo);
      if (!ativo) btn.setAttribute('aria-disabled', 'true');
    }
    const mp = $('[data-msg-pronta]', caixa);
    if (mp) {
      mp.hidden = !!DADOS.wa || !ativo;
      $('textarea', mp).value = msg;
    }
  }
  window.NKwa = { waUrl, aplicarMensagem };

  // ---------- 1. abertura (uma vez por sessão; desligada com movimento reduzido) ----------
  if (html.classList.contains('intro-on')) {
    sessao.set('nk-intro', '1');
    const intro = $('[data-intro]');
    const fim = () => html.classList.remove('intro-on');
    intro?.addEventListener('animationend', (e) => { if (e.target === intro) fim(); });
    $('[data-intro-pular]')?.addEventListener('click', fim);
    setTimeout(fim, 2400); // garantia
  }

  // ---------- 2. topo ----------
  const topo = $('[data-topo]');
  const painel = $('#painel-eventos');
  const btnEventos = $('.topo__eventos');
  const btnMenu = $('.topo__menu');
  const menuM = $('#menu-m');
  const atualizaTopo = () => topo?.classList.toggle('topo--solido', scrollY > 30 || !painel?.hidden || !menuM?.hidden);
  addEventListener('scroll', atualizaTopo, { passive: true });
  atualizaTopo();

  function painelEventos(abrir) {
    if (!painel) return;
    painel.hidden = !abrir;
    btnEventos.setAttribute('aria-expanded', String(abrir));
    atualizaTopo();
  }
  btnEventos?.addEventListener('click', () => painelEventos(painel.hidden));
  if (matchMedia('(hover: hover)').matches && topo) {
    let t;
    btnEventos?.addEventListener('mouseenter', () => { clearTimeout(t); painelEventos(true); });
    topo.addEventListener('mouseleave', () => { t = setTimeout(() => painelEventos(false), 220); });
    painel?.addEventListener('mouseenter', () => clearTimeout(t));
  }
  document.addEventListener('click', (e) => { if (painel && !painel.hidden && !e.target.closest('[data-topo]')) painelEventos(false); });
  topo?.addEventListener('focusout', (e) => { if (painel && !painel.hidden && !topo.contains(e.relatedTarget)) painelEventos(false); });

  function menuCelular(abrir) {
    if (!menuM) return;
    menuM.hidden = !abrir;
    btnMenu.setAttribute('aria-expanded', String(abrir));
    btnMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-aberto', abrir);
    atualizaTopo();
    if (abrir) $('a', menuM)?.focus();
  }
  btnMenu?.addEventListener('click', () => menuCelular(menuM.hidden));
  menuM?.addEventListener('click', (e) => { if (e.target.closest('a')) menuCelular(false); });
  matchMedia('(min-width: 1000px)').addEventListener?.('change', (e) => { if (e.matches) menuCelular(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (painel && !painel.hidden) { painelEventos(false); btnEventos.focus(); }
    if (menuM && !menuM.hidden) { menuCelular(false); btnMenu.focus(); }
  });

  // ---------- imagens adiadas (data-srcset) ----------
  function ativarAdiadas(raiz) {
    $$('[data-srcset]', raiz).forEach((el) => { el.srcset = el.dataset.srcset; el.removeAttribute('data-srcset'); });
    $$('[data-src]', raiz).forEach((el) => { el.src = el.dataset.src; el.removeAttribute('data-src'); });
  }
  // segunda foto do cartão: só carrega quando o mouse passa (não pesa no celular)
  if (matchMedia('(hover: hover)').matches) {
    $$('.card-ev').forEach((c) => c.addEventListener('pointerenter', () => ativarAdiadas(c), { once: true }));
  }

  // ---------- 3. hero com transição de diafragma ----------
  const hero = $('[data-hero]');
  const slides = hero ? $$('.hero__slide', hero) : [];
  if (slides.length > 1) {
    let i = 0, timer = null, ocupado = false, visivel = true;
    let pausado = reduz.matches;
    const dots = $$('[data-hero-ir]', hero);
    const leg = $('[data-hero-leg]', hero);
    const btnPausa = $('[data-hero-pausa]', hero);
    const ICON_PLAY = '<svg viewBox="0 0 14 14" aria-hidden="true" fill="currentColor"><path d="M3 1l10 6-10 6z"/></svg>';
    const ICON_PAUSA = btnPausa.innerHTML;
    addEventListener('load', () => setTimeout(() => slides.slice(1).forEach(ativarAdiadas), 400), { once: true });

    function ir(n) {
      if (ocupado || n === i) return;
      ocupado = true;
      const atual = slides[i], prox = slides[n];
      ativarAdiadas(prox);
      const img = $('img', prox);
      const fim = () => { atual.classList.remove('is-ativo'); prox.classList.remove('is-entrando'); prox.classList.add('is-ativo'); ocupado = false; };
      const mostrar = () => {
        if (reduz.matches) { fim(); return; }
        prox.classList.add('is-entrando');
        prox.addEventListener('animationend', fim, { once: true });
      };
      if (img.complete && img.naturalWidth) mostrar();
      else { img.addEventListener('load', mostrar, { once: true }); img.addEventListener('error', () => { ocupado = false; }, { once: true }); }
      i = n;
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === n)));
      if (leg) leg.textContent = prox.dataset.legenda || '';
    }
    const tocar = () => { clearInterval(timer); if (!pausado && visivel && !document.hidden) timer = setInterval(() => ir((i + 1) % slides.length), 5500); };
    dots.forEach((d) => d.addEventListener('click', () => { ir(Number(d.dataset.heroIr)); tocar(); }));
    function setPausa(p) {
      pausado = p;
      btnPausa.innerHTML = p ? ICON_PLAY : ICON_PAUSA;
      btnPausa.setAttribute('aria-label', p ? 'Retomar a troca de fotos' : 'Pausar a troca de fotos');
      tocar();
    }
    btnPausa.addEventListener('click', () => setPausa(!pausado));
    if (pausado) setPausa(true);
    document.addEventListener('visibilitychange', tocar);
    new IntersectionObserver(([e]) => { visivel = e.isIntersecting; tocar(); }).observe(hero);
    tocar();
  }

  // ---------- 11. checador de disponibilidade ----------
  const dataBR = (s) => s.split('-').reverse().join('/');
  function diasAte(s) {
    const [y, m, d] = s.split('-').map(Number);
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    return Math.round((new Date(y, m - 1, d) - hoje) / 864e5);
  }
  function fraseDias(n) {
    if (n < 0) return 'Essa data já passou. Confere o dia?';
    if (n === 0) return '<strong>É hoje!</strong> Me chama agora que eu vejo se ainda dá.';
    if (n === 1) return '<strong>É amanhã!</strong> Corre que ainda pode dar.';
    if (n <= 14) return `Faltam <strong>${n} dias</strong>. Corre que ainda dá tempo.`;
    if (n <= 120) return `Faltam <strong>${n} dias</strong>. Bora garantir sua data.`;
    return `Faltam <strong>${n} dias</strong> (uns ${Math.round(n / 30.4)} meses). Ótimo: dá pra planejar com calma e garantir a data antes de todo mundo.`;
  }
  $$('[data-checador]').forEach((form) => {
    const res = form.parentElement.querySelector('[data-resultado]');
    const campoData = form.elements.data;
    function calcular(mostrarErro) {
      if (!campoData.value) { if (mostrarErro) campoData.reportValidity(); return; }
      const n = diasAte(campoData.value);
      const tipo = form.elements.tipo.value;
      const local = form.elements.local.value.trim();
      const evento = tipo === 'Outro tipo de evento' ? 'um evento' : `um evento de ${tipo}`;
      const msg = `Oi, Nícolas! Vim pelo site. Tenho ${evento} no dia ${dataBR(campoData.value)}${local ? ` em ${local}` : ''}. Você tem essa data disponível?`;
      res.hidden = false;
      $('[data-dias]', res).innerHTML = fraseDias(n);
      aplicarMensagem(res, msg, n >= 0);
    }
    form.addEventListener('submit', (e) => { e.preventDefault(); calcular(true); });
    form.addEventListener('change', () => calcular(false));
  });

  // ---------- copiar mensagem ----------
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copiar]');
    if (!b) return;
    const alvo = $(b.dataset.copiar);
    const aviso = b.closest('[data-msg-pronta]')?.querySelector('.copiado');
    try { await navigator.clipboard.writeText(alvo.value); }
    catch (err) { alvo.select(); document.execCommand('copy'); }
    if (aviso) aviso.textContent = 'Copiado! Agora é só abrir o WhatsApp e colar.';
  });

  // ---------- vídeos: tocam só quando visíveis, pausam fora da tela ----------
  const videos = $$('video');
  // pôster só quando o vídeo está chegando perto da tela (não pesa no carregamento inicial)
  const porPoster = (v) => { if (v.dataset.poster) { v.poster = v.dataset.poster; delete v.dataset.poster; } };
  if ('IntersectionObserver' in window) {
    const ioP = new IntersectionObserver((ents) => ents.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) { porPoster(target); ioP.unobserve(target); }
    }), { rootMargin: '600px 0px' });
    videos.forEach((v) => ioP.observe(v));
  } else videos.forEach(porPoster);
  if (videos.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((ents) => ents.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting && v.hasAttribute('data-auto') && !reduz.matches) {
        v.preload = 'auto'; v.play().catch(() => {});
      } else if (!isIntersecting && !v.paused) v.pause();
    }), { threshold: 0.4 });
    videos.forEach((v) => {
      if (v.hasAttribute('data-auto') && reduz.matches) v.controls = true;
      io.observe(v);
    });
  }

  // ---------- botão de som: liga o áudio de um vídeo e silencia os outros ----------
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-som]');
    if (!b) return;
    const v = b.parentElement.querySelector('video');
    const ligar = v.muted;
    $$('[data-som]').forEach((o) => {
      const ov = o.parentElement.querySelector('video');
      ov.muted = true;
      o.setAttribute('aria-pressed', 'false');
      o.setAttribute('aria-label', o.getAttribute('aria-label').replace(/^Desligar som/, 'Ativar som'));
    });
    if (ligar) {
      v.muted = false;
      if (v.paused) v.play().catch(() => {});
      b.setAttribute('aria-pressed', 'true');
      b.setAttribute('aria-label', b.getAttribute('aria-label').replace(/^Ativar som/, 'Desligar som'));
    }
  });

  // ---------- proteção leve das fotos (só nas fotos, não no site todo) ----------
  const FOTO = '.gi img, .hero__slide img, .card-ev img, .mosaico__item img, .rolo img, .insta img, .lb img, .formato__midia img, .retrato img';
  document.addEventListener('contextmenu', (e) => { if (e.target.matches?.(FOTO)) e.preventDefault(); });
  document.addEventListener('dragstart', (e) => { if (e.target.matches?.(FOTO)) e.preventDefault(); });
})();

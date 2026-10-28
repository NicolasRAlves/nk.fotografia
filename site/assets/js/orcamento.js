/* NK Fotografia · "Monte sua cobertura": formulário em etapas que só monta a mensagem (nada vai para servidor) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const form = $('[data-orcamento]');
  if (!form) return;
  let DADOS = {};
  try { DADOS = JSON.parse($('#nk-dados').textContent); } catch (e) { /* sem dados */ }

  const etapas = $$('.etapa', form);
  const prog = $$('.etapas-prog li', form);
  const status = $('[data-etapa-status]', form);
  const bVoltar = $('[data-voltar]', form);
  const bAvancar = $('[data-avancar]', form);
  let atual = 0;

  // ?evento=<slug> já marca o tipo de evento (links das páginas de categoria)
  const slug = new URLSearchParams(location.search).get('evento');
  if (slug) { const r = $(`input[name="tipo"][data-slug="${CSS.escape(slug)}"]`, form); if (r) r.checked = true; }

  function mostrar(n, focar = true) {
    atual = n;
    etapas.forEach((e, i) => e.classList.toggle('is-atual', i === n));
    prog.forEach((p, i) => { p.className = i < n ? 'is-feito' : i === n ? 'is-atual' : ''; });
    bVoltar.hidden = n === 0;
    bAvancar.hidden = n === etapas.length - 1;
    bAvancar.textContent = n === etapas.length - 2 ? 'Ver resumo' : 'Continuar';
    status.textContent = `Etapa ${n + 1} de ${etapas.length}`;
    if (n === etapas.length - 1) montar();
    if (focar) {
      const leg = $('legend', etapas[n]);
      leg.tabIndex = -1;
      leg.focus({ preventScroll: true });
      form.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  }
  function valida(fs) {
    for (const c of $$('input, select, textarea', fs)) {
      if (!c.checkValidity()) { c.reportValidity(); c.focus(); return false; }
    }
    return true;
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (valida(etapas[atual]) && atual < etapas.length - 1) mostrar(atual + 1);
  });
  bVoltar.addEventListener('click', () => mostrar(Math.max(0, atual - 1)));

  const dataBR = (s) => s.split('-').reverse().join('/');
  function diasAte(s) {
    const [y, m, d] = s.split('-').map(Number);
    const h = new Date(); h.setHours(0, 0, 0, 0);
    return Math.round((new Date(y, m - 1, d) - h) / 864e5);
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function montar() {
    const fd = new FormData(form);
    const v = (k) => (fd.get(k) || '').toString().trim();
    const lista = (k) => fd.getAll(k).join(', ');
    const n = v('data') ? diasAte(v('data')) : null;
    const quando = v('data') ? `${dataBR(v('data'))}${n !== null && n >= 0 ? ` (faltam ${n} dia${n === 1 ? '' : 's'})` : ''}` : '';
    const linhas = [
      ['Evento', v('tipo')],
      ['Data', quando],
      ['Início', v('hora')],
      ['Duração', v('duracao')],
      ['Local', v('local')],
      ['Convidados', v('convidados')],
      ['Formatos', lista('formatos')],
      ['Entrega', lista('entregas')],
      ['Observações', v('obs')],
    ].filter(([, x]) => x);

    $('[data-resumo]', form).innerHTML = linhas.map(([k, x]) => `<li><b>${k}</b><span>${esc(x)}</span></li>`).join('');
    const preco = DADOS.precos?.[v('tipo')];
    $('[data-estimativa]', form).textContent = typeof preco === 'number'
      ? `Referência: a partir de R$ ${preco.toLocaleString('pt-BR')}`
      : 'Valor: sob consulta';

    const msg = [
      `Oi, Nícolas! Vim pelo site e quero um orçamento.`,
      '',
      ...linhas.map(([k, x]) => `• ${k}: ${x}`),
      v('nome') ? `\n${v('nome')}` : '',
    ].join('\n').trim();
    window.NKwa.aplicarMensagem(etapas.at(-1), msg, true);
  }

  mostrar(0, false);
})();

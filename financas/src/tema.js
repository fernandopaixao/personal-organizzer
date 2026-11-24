/* Tema claro, escuro ou automático (segue o sistema), comum a todas as ferramentas da solução.
   Injetado no <head> de cada HTML por tools/build_financas.py e tools/injetar_seguranca.py.
   - A escolha fica só neste computador (localStorage 'gestao.tema') e vale para todas as ferramentas.
   - No escuro, as variáveis da identidade (--bv, --ink, --line...) ganham a paleta escura e as cores
     fixas das folhas de estilo, dos estilos inline e dos gráficos SVG são convertidas por papel
     (fundo, texto, borda), sem tocar no código de cada ferramenta. Voltar para o claro restaura tudo. */
(() => {
  if (window.gestaoTema) return;
  const CHAVE = 'gestao.tema', html = document.documentElement;
  const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : { matches: false, addEventListener() {} };
  const ler = () => { try { const v = localStorage.getItem(CHAVE); return v === 'claro' || v === 'escuro' ? v : 'auto'; } catch { return 'auto'; } };
  let pref = ler(), escuro = false;

  // ---- Paleta escura: mesmo azul-e-branco, invertido para azul-noite, com o azul de destaque mais claro no texto ----
  const VARS = '--bv:#2f5fd6;--bv-deep:#2550bd;--bv-t:#8fb0ff;--bv-deep-t:#a9c1ff;--bv-mid:#6c90ec;--bv-line:#2b3f78;--bv-soft:#131f40;'
    + '--ink:#e4e9f4;--muted:#9ba7c0;--faint:#64708e;--line:#1d2a47;--bg:#0a1122;--card:#101a30;'
    + '--late:#ff8aa1;--late-soft:#3b1729;--ok:#4fd1ae;--ok-soft:#0f3030;--raised:#18233d;--warn:#ffc65c;--warn-soft:#382a0d;'
    + '--rail:#081633;--rail-ink:#8495ba;--rail-on:#ffffff;--rail-active:#18306a';
  const CSS = `:root[data-tema="escuro"]{${VARS};color-scheme:dark}
:root[data-tema="escuro"] body{background:var(--bg);color:var(--ink)}
:root[data-tema="escuro"] dialog{background:var(--card);color:var(--ink)}
:root[data-tema="escuro"] .toast{background:#22304f!important;color:var(--ink)!important;box-shadow:0 8px 24px rgba(0,0,0,.5)!important}
:root[data-tema="escuro"] .ins.hi .m i,:root[data-tema="escuro"] .ins.hi .m em{background:#fff}
:root[data-tema="escuro"] img{filter:brightness(.92)}
:root[data-tema="escuro"] ::selection{background:#2b4590}
#temaSel{position:fixed;right:14px;bottom:14px;z-index:90;font:500 12px/1 var(--font,"Segoe UI"),system-ui,sans-serif}
#temaSel>button{width:34px;height:34px;border-radius:50%;border:1px solid var(--line,#e0e6f1);background:var(--card,#fff);color:var(--muted,#52607e);display:grid;place-items:center;cursor:pointer;box-shadow:0 2px 8px rgba(11,33,85,.12);padding:0}
#temaSel>button:hover{color:var(--bv,#1e4fc8);border-color:var(--bv-line,#dbe5fb)}
#temaSel svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
#temaSel .menu{position:absolute;right:0;bottom:42px;background:var(--card,#fff);border:1px solid var(--line,#e0e6f1);border-radius:12px;padding:4px;box-shadow:0 12px 32px rgba(11,33,85,.18);display:none;min-width:150px}
#temaSel.aberto .menu{display:block}
#temaSel .menu button{display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;border:0;border-radius:8px;background:none;color:var(--ink,#121f3d);cursor:pointer;text-align:left;font:inherit;font-size:12.5px}
#temaSel .menu button:hover{background:var(--bv-soft,#eef3fe)}
#temaSel .menu button.on{color:var(--bv,#1e4fc8);font-weight:650}
#temaSel .menu small{display:block;color:var(--muted,#52607e);font-size:10.5px;padding:4px 10px 6px}
@media print{#temaSel{display:none}}`;

  // ---- Cores: leitura, HSL e conversão por papel ----
  const NOMES = { white: [255, 255, 255], black: [0, 0, 0] };
  function parse(s) {
    s = s.trim().toLowerCase();
    if (NOMES[s]) return [...NOMES[s], 1];
    let m = s.match(/^#([0-9a-f]{3,8})$/);
    if (m) {
      let h = m[1]; if (h.length === 3 || h.length === 4) h = [...h].map(c => c + c).join('');
      if (h.length !== 6 && h.length !== 8) return null;
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1];
    }
    m = s.match(/^rgba?\(([^)]*)\)$/);
    if (m) {
      const p = m[1].split(/[\s,\/]+/).filter(Boolean); if (p.length < 3 || p.slice(0, 3).some(x => isNaN(parseFloat(x)))) return null;
      const a = p[3] == null ? 1 : (p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3]));
      return [+p[0], +p[1], +p[2], a];
    }
    return null;
  }
  function hsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (!d) return [0, 0, l];
    const s = d / (1 - Math.abs(2 * l - 1));
    const h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  function rgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return [r, g, b].map(v => Math.round(Math.min(1, Math.max(0, v + m)) * 255));
  }
  const fmt = ([r, g, b], a) => a >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${+a.toFixed(3)})`;
  const hex = c => '#' + c.slice(0, 3).map(v => v.toString(16).padStart(2, '0')).join('');
  // Cores da identidade com destino fixo, por papel (fundo, texto, borda).
  const FIXO = {
    '#ffffff': { f: '#101a30', b: '#1d2a47' }, '#f4f7fc': { f: '#0a1122' }, '#f8fafe': { f: '#0a1122' },
    '#1e4fc8': { f: '#2f5fd6', t: '#8fb0ff', b: '#2f5fd6' }, '#173fa6': { f: '#2550bd', t: '#a9c1ff', b: '#2550bd' },
    '#121f3d': { f: '#22304f', t: '#e4e9f4', b: '#33426a' }, '#c2334f': { f: '#d9475f', t: '#ff8aa1', b: '#c2334f' },
    '#eef3fe': { f: '#131f40', b: '#2b3f78' }, '#dbe5fb': { f: '#2b3f78', b: '#2b3f78' }, '#8fabee': { t: '#a6bcf0', b: '#4565ba' },
    '#e0e6f1': { f: '#1c2843', b: '#1d2a47' }, '#fdedf1': { f: '#3b1729', b: '#5c2540' },
  };
  function converter(papel, c) {
    const [r, g, b, a] = c, fx = FIXO[hex(c)];
    if (fx && fx[papel]) return fmt(parse(fx[papel]), a);
    let [h, s, l] = hsl([r, g, b]);
    const croma = s * (1 - Math.abs(2 * l - 1)), neutro = croma < 0.09;
    if (papel === 't') {                                   // texto: claro sobre fundo escuro
      if (l > 0.9) return null;                            // texto branco (sobre azul, vermelho...) continua branco
      if (neutro) return fmt(rgb(h, Math.min(s, 0.18), 0.92 - l * 0.62), a);
      return l >= 0.7 ? null : fmt(rgb(h, Math.min(s, 0.78), Math.max(0.7, l + 0.25)), a);
    }
    if (papel === 'b') {                                   // borda e contorno
      if (l < 0.5) return neutro ? fmt(rgb(h, Math.min(s, 0.2), 0.32), a) : null;
      if (neutro) return fmt(rgb(h || 226, Math.min(Math.max(s, 0.12), 0.25), 0.17 + (1 - l) * 0.9), a);
      return l > 0.75 ? fmt(rgb(h, Math.min(s, 0.42), 0.18 + (1 - l) * 0.6), a) : null;
    }
    // papel 'f' (fundo) e 'g' (desenho SVG)
    if (neutro) {
      if (l > 0.97 && a <= 0.5 && papel === 'f') return null;  // véu branco translúcido sobre cor (cards em destaque)
      if (l < 0.5) return papel === 'g' ? fmt(rgb(h, Math.min(s, 0.18), 0.92 - l * 0.62), a) : null;  // fundos escuros ficam (sombras, véus)
      return fmt(rgb(h || 226, Math.min(Math.max(s, 0.16), 0.3), 0.135 + (1 - l) * 0.95), a);
    }
    if (l >= 0.85) return fmt(rgb(h, Math.min(s, 0.45), 0.165 + (1 - l) * 0.55), a);   // tons suaves viram tons escuros
    if (l >= 0.62) return fmt(rgb(h, Math.min(s, 0.55), 0.3 + (l - 0.62) * 0.5), a);
    return null;                                           // cores cheias (destaques, barras) ficam
  }
  const RE_COR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^()]*\)|\b(?:white|black)\b/g;
  function trocar(papel, valor) {
    if (!valor || valor.includes('var(') || !RE_COR.test(valor)) return null;
    RE_COR.lastIndex = 0;
    let mudou = false;
    const novo = valor.replace(RE_COR, m => { const c = parse(m); const n = c && converter(papel, c); if (n) { mudou = true; return n; } return m; });
    return mudou ? novo : null;
  }
  const PAPEL = p => p === 'color' || p === 'caret-color' || p === '-webkit-text-fill-color' || p === 'text-decoration-color' ? 't'
    : p === 'background-color' || p === 'background-image' ? 'f'
    : p === 'fill' || p === 'stroke' || p === 'stop-color' ? 'g'
    : /^(border(-(top|right|bottom|left|block|inline)(-(start|end))?)?-color|outline-color|column-rule-color)$/.test(p) ? 'b'
    : p === 'box-shadow' ? 'b' : null;

  // ---- Conversão no lugar (folhas de estilo, estilos inline e atributos SVG), com restauração ----
  const regras = [];                                       // [style, prop, original, prioridade]
  let feitas = new WeakSet();
  // guardar(prop, valor, prioridade) devolve true para pular (valor já convertido); depois(prop, novo) registra o novo valor.
  function declaracoes(st, guardar, depois) {
    const props = []; for (let i = 0; i < st.length; i++) props.push(st[i]);
    for (const p of props) {
      if (p.startsWith('--')) continue;
      const papel = PAPEL(p); if (!papel) continue;
      const v = st.getPropertyValue(p); if (p === 'box-shadow' && !/inset|0px 0px 0px/.test(v)) continue;
      // Texto em azul BV usa a variante clara (--bv-t), que no claro nem existe e cai no próprio --bv.
      const n = papel === 't' && /var\(--bv(-deep)?\)/.test(v) ? v.replace(/var\(--(bv|bv-deep)\)/g, 'var(--$1-t, var(--$1))') : trocar(papel, v);
      if (!n || n === v) continue;
      const pr = st.getPropertyPriority(p);
      if (guardar(p, v, pr)) continue;
      st.setProperty(p, n, pr); if (depois) depois(p, st.getPropertyValue(p));
    }
  }
  function folha(sh) {
    if (!sh || feitas.has(sh)) return; let rs; try { rs = sh.cssRules; } catch { return; }
    feitas.add(sh);
    const ir = lista => { for (const r of lista) { if (r.style && !(r.selectorText || '').includes('temaSel')) declaracoes(r.style, (p, v, pr) => { regras.push([r.style, p, v, pr]); }); if (r.cssRules) ir(r.cssRules); } };
    ir(rs);
  }
  const ATR = ['fill', 'stroke', 'stop-color'];
  let ocupado = false;
  function elemento(el) {
    if (el.nodeType !== 1 || el.closest?.('#temaSel')) return;
    if (el.tagName === 'STYLE') { if (el.sheet) folha(el.sheet); return; }
    if (el.getAttribute('style')) {
      const ja = el.__temaProps || {};
      declaracoes(el.style, (p, v, pr) => { if (ja[p] && ja[p][1] === v) return true; ja[p] = [v, null, pr]; }, (p, n) => { ja[p][1] = n; });
      if (Object.keys(ja).length) el.__temaProps = ja;
    }
    for (const a of ATR) {
      const v = el.getAttribute(a); if (!v || (el.__temaAtr && el.__temaAtr[a] && el.__temaAtr[a][1] === v)) continue;
      const n = trocar('g', v); if (n) { (el.__temaAtr ||= {})[a] = [v, n]; el.setAttribute(a, n); }
    }
  }
  function arvore(raiz) {
    if (raiz.nodeType !== 1) return; elemento(raiz);
    raiz.querySelectorAll('[style],[fill],[stroke],[stop-color],style').forEach(elemento);
  }
  const obs = new MutationObserver(lista => {
    if (!escuro || ocupado) return; ocupado = true;
    try {
      for (const m of lista) {
        if (m.type === 'childList') m.addedNodes.forEach(arvore);
        else elemento(m.target);
        if (m.type === 'childList' && m.target.tagName === 'STYLE' && m.target.sheet) folha(m.target.sheet);
      }
    } finally { obs.takeRecords(); ocupado = false; }
  });
  function converterTudo() {
    ocupado = true;
    try { for (const sh of document.styleSheets) folha(sh); if (document.documentElement) arvore(document.documentElement); }
    finally { obs.takeRecords(); ocupado = false; }
  }
  function restaurarTudo() {
    ocupado = true;
    try {
      for (const [st, p, v, pr] of regras.splice(0)) st.setProperty(p, v, pr);
      feitas = new WeakSet([temaFolha]);
      document.querySelectorAll('[style],[fill],[stroke],[stop-color]').forEach(el => {
        if (el.__temaProps) { for (const [p, [v, n, pr]] of Object.entries(el.__temaProps)) if (el.style.getPropertyValue(p) === n) el.style.setProperty(p, v, pr); el.__temaProps = null; }
        if (el.__temaAtr) { for (const [a, [v, n]] of Object.entries(el.__temaAtr)) if (el.getAttribute(a) === n) el.setAttribute(a, v); el.__temaAtr = null; }
      });
    } finally { obs.takeRecords(); ocupado = false; }
  }

  // ---- Aplicar ----
  function aplicar() {
    const quer = pref === 'escuro' || (pref === 'auto' && mq.matches);
    html.dataset.temaEscolha = pref;
    if (quer === escuro && html.dataset.tema) return atualizarBotao();
    escuro = quer;
    html.dataset.tema = quer ? 'escuro' : 'claro';
    if (quer) { converterTudo(); obs.observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', ...ATR] }); }
    else { obs.disconnect(); restaurarTudo(); }
    atualizarBotao();
  }
  function escolher(v) {
    pref = v === 'claro' || v === 'escuro' ? v : 'auto';
    try { pref === 'auto' ? localStorage.removeItem(CHAVE) : localStorage.setItem(CHAVE, pref); } catch {}
    aplicar();
  }

  // ---- Seletor: botão redondo no canto, com Claro, Escuro e Automático ----
  const ICONE = {
    claro: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    escuro: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    auto: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor"/></svg>',
  };
  const NOME = { claro: 'Claro', escuro: 'Escuro', auto: 'Automático' };
  let caixa = null;
  function atualizarBotao() {
    if (!caixa) return;
    const b = caixa.firstChild; b.innerHTML = ICONE[pref];
    b.title = `Tema: ${NOME[pref]}${pref === 'auto' ? ` (agora ${escuro ? 'escuro' : 'claro'}, como o sistema)` : ''}`;
    b.setAttribute('aria-label', b.title);
    caixa.querySelectorAll('.menu button').forEach(x => { x.classList.toggle('on', x.dataset.t === pref); x.setAttribute('aria-checked', x.dataset.t === pref); });
  }
  function montarBotao() {
    if (caixa || !document.body) return;
    caixa = document.createElement('div'); caixa.id = 'temaSel';
    caixa.innerHTML = '<button type="button" aria-haspopup="menu"></button><div class="menu" role="menu">'
      + ['claro', 'escuro', 'auto'].map(t => `<button type="button" role="menuitemradio" data-t="${t}">${ICONE[t]}${NOME[t]}</button>`).join('')
      + '<small>Fica salvo só neste computador.</small></div>';
    caixa.firstChild.onclick = e => { e.stopPropagation(); caixa.classList.toggle('aberto'); };
    caixa.querySelector('.menu').onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; e.stopPropagation(); escolher(b.dataset.t); caixa.classList.remove('aberto'); };
    document.addEventListener('click', () => caixa.classList.remove('aberto'));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') caixa.classList.remove('aberto'); });
    document.body.appendChild(caixa);
    atualizarBotao();
  }

  const st = document.createElement('style'); st.id = 'temaCss'; st.textContent = CSS;
  (document.head || html).appendChild(st); const temaFolha = st.sheet; feitas.add(temaFolha);
  window.gestaoTema = { escolher, get escolha() { return pref; }, get escuro() { return escuro; } };
  aplicar();
  mq.addEventListener?.('change', () => { if (pref === 'auto') aplicar(); });
  window.addEventListener('storage', e => { if (e.key === CHAVE || e.key === null) { pref = ler(); aplicar(); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { montarBotao(); if (escuro) converterTudo(); });
  else montarBotao();
})();

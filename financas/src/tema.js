/* Tema claro, escuro ou automático (segue o sistema) e estilo Remessa ou Sereno, comuns a todas as ferramentas da solução.
   Estilo (ADR-0042): Remessa (padrão) leva o visual da tela de entrada para dentro das ferramentas (trilho e topo marinhos,
   faixa com o padrão de envelopes); Sereno tira a decoração (sem gradiente, faixas cheias nem sombras), para menos estímulo
   visual. A escolha fica em localStorage 'gestao.estilo' e vale com claro e com escuro.
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
  const CHAVE_E = 'gestao.estilo';
  const lerEstilo = () => { try { return localStorage.getItem(CHAVE_E) === 'sereno' ? 'sereno' : 'remessa'; } catch { return 'remessa'; } };
  let estilo = lerEstilo();
  html.dataset.estilo = estilo;
  try { if (window.top !== window) html.classList.add('tema-embutido'); } catch { html.classList.add('tema-embutido'); }

  // ---- Paleta escura: mesmo branco-e-azul, invertido para azul-noite, com o azul BV mais luminoso ----
  // Remessa escuro: azul-noite, derivado do marinho da tela de entrada. Sereno escuro: grafite neutro.
  const VARS = '--bv:#4a62e6;--bv-deep:#5d73f0;--bv-t:#a3b3ff;--bv-deep-t:#c0cbff;--bv-mid:#7f93f5;--bv-line:#2c3f8a;--bv-soft:#17255a;'
    + '--ink:#e8ecf8;--muted:#a3aed0;--faint:#66729c;--line:#1f2d5c;--bg:#09112c;--card:#0f1a3e;'
    + '--late:#ff8f85;--late-soft:#3b1830;--ok:#5fd3a0;--ok-soft:#0f3338;--raised:#15224d';
  const VARS_SERENO = '--bv:#4b5bd0;--bv-deep:#6170e0;--bv-t:#a7b2ff;--bv-deep-t:#c3cbff;--bv-mid:#7c88d8;--bv-line:#2f3450;--bv-soft:#1e2030;'
    + '--ink:#e6e6e9;--muted:#9b9ea6;--faint:#62656d;--line:#2a2b30;--bg:#121316;--card:#17181b;'
    + '--late:#e08a82;--late-soft:#2c1d1d;--ok:#7cc3a0;--ok-soft:#1a2722;--raised:#1e1f23';
  const CLARO_SERENO = '--bv:#3346c0;--bv-deep:#26379e;--bv-mid:#9aa3d6;--bv-line:#dfe2ef;--bv-soft:#f3f4f8;'
    + '--ink:#1c1d21;--muted:#64676f;--faint:#a5a8b0;--line:#ececef;--bg:#ffffff;--card:#ffffff;'
    + '--late:#b0483f;--late-soft:#f8eeec;--ok:#3a735a;--ok-soft:#eef4f0';
  // Superfície da marca, a mesma da tela de entrada (marca.js): gradiente marinho, brilho azul e padrão de envelopes.
  const ENVELOPES = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='96' viewBox='0 0 120 96'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='.07' stroke-width='1.4'%3E%3Crect x='14' y='18' width='40' height='26' rx='3'/%3E%3Cpath d='M15 20l19 13l19-13'/%3E%3Crect x='74' y='60' width='32' height='21' rx='3'/%3E%3Cpath d='M75 62l15 10l15-10'/%3E%3C/g%3E%3C/svg%3E\")";
  const MARINHO = `${ENVELOPES},radial-gradient(700px 420px at 10% 0%,rgba(77,134,255,.32),transparent 62%),linear-gradient(135deg,#0b2155 0%,#122f80 58%,#1e4fc8 100%)`;
  const R = ':root[data-estilo="remessa"]:not(.tema-embutido)', S = ':root[data-estilo="sereno"]';
  const RAIL = '.rail:not(.embutido .rail)';
  const ESTILOS = `
${R}:not([data-tema="escuro"]){--bg:#f4f6fb}
${R}:not([data-tema="escuro"]) .top:not(.hub .top){background:rgba(244,246,251,.94)}
${S}:not([data-tema="escuro"]) .top{background:rgba(255,255,255,.94)}
${R} ${RAIL}{background:${MARINHO};background-color:#0b2155;border-right:0}
${R} ${RAIL} .nv{color:rgba(255,255,255,.8)}
${R} ${RAIL} .nv:hover{color:#fff;background:rgba(255,255,255,.08)}
${R} ${RAIL} .nv.on{color:#0b2155;background:#fff;font-weight:650}
${R} ${RAIL} .nvg{color:rgba(255,255,255,.55)}
${R} ${RAIL} .logo{background:#fff;color:#0b2155}
${R} ${RAIL} .railver{color:rgba(255,255,255,.6)}
${R} ${RAIL} .nvt{background:rgba(255,255,255,.1);color:#fff}
${R} ${RAIL} .nvt.on,${R} ${RAIL} .nvt:hover{background:#fff;color:#0b2155}
@media (min-width:1000px){
${R} ${RAIL}{width:200px;align-items:stretch;padding:18px 12px}
${R} ${RAIL} .logo{margin:0 10px 14px}
${R} ${RAIL} .nv{width:auto;flex-direction:row;justify-content:flex-start;gap:10px;padding:8px 12px;font-size:13px;border-radius:12px}
${R} ${RAIL} .nv .b{position:static;margin-left:auto}
${R} ${RAIL} .nvg{width:auto;text-align:left;padding:0 12px;margin:14px 0 4px;font-size:10px}
${R} ${RAIL} .nvt{align-self:flex-start;margin:2px 0 2px 12px;width:auto;padding:0 10px}
${R} ${RAIL} .railver{padding:10px 12px 2px}
${R} body:not(.v2):has(${RAIL}) .main:not(.embutido .main){margin-left:200px}
}
${R} .hub .top{background:${MARINHO};background-color:#0b2155;color:#fff;margin:0 0 14px;padding:12px 18px;border-radius:0 0 20px 20px}
${R} .hub .top .btn{color:var(--ink)}
${R} .hub .top h1{color:#fff}${R} .hub .top .sub,${R} .hub .top .muted{color:rgba(255,255,255,.75)}
${R} .hub .top .marca{background:#fff;color:#0b2155;box-shadow:none}
${R} .hub .nav{background:rgba(255,255,255,.1)}
${R} .hub .nav a,${R} .hub .nav summary{color:rgba(255,255,255,.82)}
${R} .hub .nav a:hover,${R} .hub .nav summary:hover{color:#fff;background:rgba(255,255,255,.1)}
${R} .hub .nav a.on{background:#fff;color:#0b2155}
${R} .hub .nav .menu a{color:var(--ink)}
${R} .hub .hero{background:${MARINHO};background-color:#0b2155}
${R} .hub .hero:after{display:none}
${R} .ins.hi{background:${MARINHO};background-color:#0b2155;border-color:#0b2155}
${R} .top2{background:${MARINHO};background-color:#0b2155;border-bottom:0;color:#fff}
${R} .top2 .brand b{color:#fff}${R} .top2 .brand .code{color:rgba(255,255,255,.7)}
${R} .top2 .brand .logo{background:#fff;color:#0b2155}
${R} .top2 .tnav button{color:rgba(255,255,255,.8)}
${R} .top2 .tnav button:hover{color:#fff}
${R} .top2 .tnav button.on{background:#fff;color:#0b2155}
${S}:not([data-tema="escuro"]){${CLARO_SERENO}}
${S}[data-tema="escuro"]{${VARS_SERENO}}
${S} .hub .hero{background:var(--card);color:var(--ink);border:1px solid var(--line)}
${S} .hub .hero:after{display:none}
${S} .hub .hero h2,${S} .hub .hero .resumo b,${S} .hub .hero .num{color:var(--ink)}
${S} .hub .hero .dia,${S} .hub .hero .resumo,${S} .hub .hero .num small{color:var(--muted)}
${S} .marca{background:var(--ink);box-shadow:none}
${S} .ins.hi{background:var(--card);border-color:var(--bv);color:var(--ink)}
${S} .ins.hi .k,${S} .ins.hi .s,${S} .ins.hi .mod{color:var(--muted)}${S} .ins.hi .s b{color:var(--ink)}
${S} .ins.hi .m{background:var(--bv-soft)}${S} .ins.hi .m i,${S} .ins.hi .m em{background:var(--bv)!important}
${S} .hub .hero .sessao{background:var(--bg);border-color:var(--line);color:var(--muted)}
${S} .hub .hero .sessao button{background:var(--bv-soft);color:var(--bv)}
${S} .card,${S} .kpi{box-shadow:none}
${S} .rm-tela{background:var(--bg)!important}
${S} .rm-lado,${S} .rm-lado .rm-nome,${S} .rm-lado a,${S} .rm-rodape b,${S} .rm-vis-t b,${S} .rm-lado .rm-extra h2,${S} .rm-lado .rm-extra li{color:var(--ink)}
${S} .rm-lado .rm-frase,${S} .rm-lado .rm-sob,${S} .rm-rodape,${S} .rm-vis-t,${S} .rm-lado .rm-extra p{color:var(--muted)}
${S} .rm-lado .rm-extra li svg{stroke:var(--muted)}
${S} .rm-lado .rm-ver,${S} .rm-vis{background:var(--card);border-color:var(--line);color:var(--ink)}
${S} .rm-vis-b{background:var(--ink);color:var(--card)}
${S} .rm-lado .rm-logo svg{filter:none;outline:0}
${S} .rm-tela>.entrada,${S} .rm-tela>.lockcard,${S} .rm-tela>.welcome>.card,${S} .rm-tela>.welcome>:only-child{box-shadow:0 1px 3px rgba(20,20,30,.08)!important;border:1px solid var(--line)}`;
  const CSS = `:root[data-tema="escuro"]{${VARS};color-scheme:dark}${ESTILOS}
:root[data-tema="escuro"] body{background:var(--bg);color:var(--ink)}
:root[data-tema="escuro"] dialog{background:var(--card);color:var(--ink)}
:root[data-tema="escuro"] .toast{background:#2a3147!important;color:var(--ink)!important;box-shadow:0 8px 24px rgba(0,0,0,.5)!important}
:root[data-tema="escuro"] .ins.hi .m i,:root[data-tema="escuro"] .ins.hi .m em{background:#fff}
:root[data-tema="escuro"] img{filter:brightness(.92)}
:root[data-tema="escuro"] ::selection{background:#34407a}
#temaSel{position:fixed;right:14px;bottom:14px;z-index:90;font:500 12px/1 Inter,"Segoe UI",system-ui,sans-serif}
#temaSel>button{width:34px;height:34px;border-radius:50%;border:1px solid var(--line,#eceef4);background:var(--card,#fff);color:var(--muted,#6f7689);display:grid;place-items:center;cursor:pointer;box-shadow:0 2px 8px rgba(20,30,70,.12);padding:0}
#temaSel>button:hover{color:var(--bv,#223ad2);border-color:var(--bv-line,#d5dbf7)}
#temaSel svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
#temaSel .menu{position:absolute;right:0;bottom:42px;background:var(--card,#fff);border:1px solid var(--line,#eceef4);border-radius:12px;padding:4px;box-shadow:0 12px 32px rgba(20,30,70,.18);display:none;min-width:150px}
#temaSel.aberto .menu{display:block}
#temaSel .menu button{display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;border:0;border-radius:8px;background:none;color:var(--ink,#161a23);cursor:pointer;text-align:left;font:inherit;font-size:12.5px}
#temaSel .menu button:hover{background:var(--bv-soft,#f2f4fd)}
#temaSel .menu button.on{color:var(--bv,#223ad2);font-weight:650}
#temaSel .menu small{display:block;color:var(--muted,#6f7689);font-size:10.5px;padding:4px 10px 6px}
#temaSel .menu small.g{font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:8px 10px 2px}
#temaSel .menu button span{display:flex;flex-direction:column}#temaSel .menu button i{font-style:normal;font-size:10.5px;color:var(--muted,#6f7689);font-weight:400}
#temaSel .menu{min-width:210px}
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
  const FIXO_REMESSA = {
    '#ffffff': { f: '#0f1a3e', b: '#1f2d5c' }, '#fafafc': { f: '#09112c' }, '#fbfbfd': { f: '#09112c' }, '#f4f6fb': { f: '#09112c' },
    '#223ad2': { f: '#4a62e6', t: '#a3b3ff', b: '#4a62e6' }, '#002bab': { f: '#3a52d6', t: '#c0cbff', b: '#3a52d6' },
    '#161a23': { f: '#1c2a5a', t: '#e8ecf8', b: '#31447f' }, '#c4574f': { f: '#d9665d', t: '#ff8f85', b: '#c4574f' },
    '#f2f4fd': { f: '#17255a', b: '#2c3f8a' }, '#d5dbf7': { f: '#2c3f8a', b: '#2c3f8a' }, '#8e9de9': { t: '#a3b3ff', b: '#4f63c4' },
    '#eceef4': { f: '#15224d', b: '#1f2d5c' }, '#fbefee': { f: '#3b1830', b: '#5a2440' },
  };
  const FIXO_SERENO = {
    '#ffffff': { f: '#17181b', b: '#2a2b30' }, '#fafafc': { f: '#121316' }, '#fbfbfd': { f: '#121316' }, '#f4f6fb': { f: '#121316' },
    '#223ad2': { f: '#4b5bd0', t: '#a7b2ff', b: '#4b5bd0' }, '#002bab': { f: '#3d4cb8', t: '#c3cbff', b: '#3d4cb8' },
    '#161a23': { f: '#26272c', t: '#e6e6e9', b: '#3a3c43' }, '#c4574f': { f: '#c96a62', t: '#e08a82', b: '#b0483f' },
    '#f2f4fd': { f: '#1e2030', b: '#2f3450' }, '#d5dbf7': { f: '#2f3450', b: '#2f3450' }, '#8e9de9': { t: '#a7b2ff', b: '#4c5490' },
    '#eceef4': { f: '#1e1f23', b: '#2a2b30' }, '#fbefee': { f: '#2c1d1d', b: '#4a2a2a' },
  };
  // Tons neutros convertidos: azul-noite saturado no Remessa, quase cinza no Sereno.
  const NEUTRO = { remessa: { h: 226, sMin: 0.5, sMax: 0.62, base: 0.15, bS: 0.45, bBase: 0.2 }, sereno: { h: 230, sMin: 0.03, sMax: 0.05, base: 0.09, bS: 0.05, bBase: 0.17 } };
  function converter(papel, c) {
    const [r, g, b, a] = c, fx = (estilo === 'sereno' ? FIXO_SERENO : FIXO_REMESSA)[hex(c)], N = NEUTRO[estilo];
    if (fx && fx[papel]) return fmt(parse(fx[papel]), a);
    let [h, s, l] = hsl([r, g, b]);
    const croma = s * (1 - Math.abs(2 * l - 1)), neutro = croma < 0.09;
    if (papel === 't') {                                   // texto: claro sobre fundo escuro
      if (l > 0.9) return null;                            // texto branco (sobre azul, vermelho...) continua branco
      if (neutro) return fmt(rgb(h, Math.min(s, estilo === 'sereno' ? 0.04 : 0.2), 0.92 - l * 0.62), a);
      return l >= 0.7 ? null : fmt(rgb(h, Math.min(s, 0.78), Math.max(0.7, l + 0.25)), a);
    }
    if (papel === 'b') {                                   // borda e contorno
      if (l < 0.5) return neutro ? fmt(rgb(h, Math.min(s, 0.2), 0.32), a) : null;
      if (neutro) return fmt(rgb(h || N.h, N.bS, N.bBase + (1 - l) * 0.9), a);
      return l > 0.75 ? fmt(rgb(h, Math.min(s, 0.42), 0.18 + (1 - l) * 0.6), a) : null;
    }
    // papel 'f' (fundo) e 'g' (desenho SVG)
    if (neutro) {
      if (l > 0.97 && a <= 0.5 && papel === 'f') return null;  // véu branco translúcido sobre cor (cards em destaque)
      if (l < 0.5) return papel === 'g' ? fmt(rgb(h, Math.min(s, 0.18), 0.92 - l * 0.62), a) : null;  // fundos escuros ficam (sombras, véus)
      return fmt(rgb(h || N.h, Math.min(Math.max(s, N.sMin), N.sMax), N.base + (1 - l) * 0.95), a);
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
  function escolherEstilo(v) {
    estilo = v === 'sereno' ? 'sereno' : 'remessa';
    try { estilo === 'remessa' ? localStorage.removeItem(CHAVE_E) : localStorage.setItem(CHAVE_E, estilo); } catch {}
    aplicarEstilo();
  }
  // Troca de estilo com o escuro ligado: as cores fixas já convertidas voltam ao original e são convertidas de novo.
  function aplicarEstilo() {
    if (html.dataset.estilo === estilo) return atualizarBotao();
    html.dataset.estilo = estilo;
    if (escuro) { restaurarTudo(); converterTudo(); }
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
  const ESTILO = { remessa: ['Remessa', 'Marca, trilho e faixas marinhas'], sereno: ['Sereno', 'Menos estímulo visual'] };
  const ICONE_E = { remessa: '<svg viewBox="0 0 24 24"><rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M4 7l8 6 8-6"/></svg>', sereno: '<svg viewBox="0 0 24 24"><path d="M4 9h16M4 15h10"/></svg>' };
  let caixa = null;
  function atualizarBotao() {
    if (!caixa) return;
    const b = caixa.firstChild; b.innerHTML = ICONE[pref];
    b.title = `Tema: ${NOME[pref]}${pref === 'auto' ? ` (agora ${escuro ? 'escuro' : 'claro'}, como o sistema)` : ''}`;
    b.setAttribute('aria-label', b.title);
    b.title += ` · Estilo: ${ESTILO[estilo][0]}`; b.setAttribute('aria-label', b.title);
    caixa.querySelectorAll('.menu [data-t]').forEach(x => { x.classList.toggle('on', x.dataset.t === pref); x.setAttribute('aria-checked', x.dataset.t === pref); });
    caixa.querySelectorAll('.menu [data-e]').forEach(x => { x.classList.toggle('on', x.dataset.e === estilo); x.setAttribute('aria-checked', x.dataset.e === estilo); });
  }
  function montarBotao() {
    if (caixa || !document.body) return;
    caixa = document.createElement('div'); caixa.id = 'temaSel';
    caixa.innerHTML = '<button type="button" aria-haspopup="menu"></button><div class="menu" role="menu"><small class="g">Modo</small>'
      + ['claro', 'escuro', 'auto'].map(t => `<button type="button" role="menuitemradio" data-t="${t}">${ICONE[t]}${NOME[t]}</button>`).join('')
      + '<small class="g">Estilo</small>'
      + ['remessa', 'sereno'].map(e => `<button type="button" role="menuitemradio" data-e="${e}">${ICONE_E[e]}<span>${ESTILO[e][0]}<i>${ESTILO[e][1]}</i></span></button>`).join('')
      + '<small>Fica salvo só neste computador.</small></div>';
    caixa.firstChild.onclick = e => { e.stopPropagation(); caixa.classList.toggle('aberto'); };
    caixa.querySelector('.menu').onclick = e => { const b = e.target.closest('[data-t],[data-e]'); if (!b) return; e.stopPropagation(); if (b.dataset.e) escolherEstilo(b.dataset.e); else escolher(b.dataset.t); caixa.classList.remove('aberto'); };
    document.addEventListener('click', () => caixa.classList.remove('aberto'));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') caixa.classList.remove('aberto'); });
    document.body.appendChild(caixa);
    atualizarBotao();
  }

  const st = document.createElement('style'); st.id = 'temaCss'; st.textContent = CSS;
  (document.head || html).appendChild(st); const temaFolha = st.sheet; feitas.add(temaFolha);
  window.gestaoTema = { escolher, escolherEstilo, get escolha() { return pref; }, get escuro() { return escuro; }, get estilo() { return estilo; } };
  aplicar();
  mq.addEventListener?.('change', () => { if (pref === 'auto') aplicar(); });
  window.addEventListener('storage', e => { if (e.key === CHAVE || e.key === null) { pref = ler(); aplicar(); } if (e.key === CHAVE_E || e.key === null) { estilo = lerEstilo(); aplicarEstilo(); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { montarBotao(); if (escuro) converterTudo(); });
  else montarBotao();
})();

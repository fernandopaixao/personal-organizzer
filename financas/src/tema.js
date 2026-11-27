/* Tema claro, escuro ou automático (segue o sistema) e estilo Remessa ou Sereno, comuns a todas as ferramentas da solução.
   Estilo (ADR-0043): Remessa (padrão) leva o visual da tela de entrada para dentro das ferramentas (trilho e topo marinhos,
   faixa com o padrão de envelopes); Sereno tira a decoração (sem gradiente, faixas cheias nem sombras), para menos estímulo
   visual. A escolha fica em localStorage 'gestao.estilo' e vale com claro e com escuro.
   Preferências (ADR-0044): o botão redondo do canto abre o painel Preferências (Modo e Estilo visual: Remessa, Sereno,
   Clássico e Experimental) e os Ajustes de cada ferramenta mostram o mesmo bloco onde houver <div data-preferencias>.
   Clássico ('classico') é o visual de antes dos estilos; Experimental troca de pasta (visual.js, ADR-0038).
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
  const CHAVE_E = 'gestao.estilo', ESTILOS_OK = ['remessa', 'sereno', 'classico'];
  // Visual experimental (ADR-0034/0038): é outra pasta, não um estilo desta camada. Nas cópias dela o estilo fica
  // 'experimental' (sem o trilho marinho nem o Sereno por cima) e o escuro é o de antes (o mesmo do Clássico).
  const EXP = !!(window.remessaVisual && window.remessaVisual.experimental);
  const lerEstilo = () => { if (EXP) return 'experimental'; try { const v = localStorage.getItem(CHAVE_E); return ESTILOS_OK.includes(v) ? v : 'remessa'; } catch { return 'remessa'; } };
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
  // Clássico (e visual experimental): o escuro grafite-azulado de antes dos estilos (Central 15.18).
  const VARS_CLASSICO = '--bv:#5066ec;--bv-deep:#3a4fd6;--bv-t:#8d9cf9;--bv-deep-t:#a9b4ff;--bv-mid:#8190ee;--bv-line:#2f3a6b;--bv-soft:#1a2142;'
    + '--ink:#e6e9f2;--muted:#99a1b7;--faint:#68708a;--line:#262d40;--bg:#0e121c;--card:#161b29;'
    + '--late:#ec7d74;--late-soft:#3a1f24;--ok:#5cc292;--ok-soft:#15302a;--raised:#1e2436';
  const C = ':root:is([data-estilo="classico"],[data-estilo="experimental"])';
  const CLARO_SERENO = '--bv:#3346c0;--bv-deep:#26379e;--bv-mid:#9aa3d6;--bv-line:#dfe2ef;--bv-soft:#f3f4f8;'
    + '--ink:#1c1d21;--muted:#64676f;--faint:#a5a8b0;--line:#ececef;--bg:#ffffff;--card:#ffffff;'
    + '--late:#b0483f;--late-soft:#f8eeec;--ok:#3a735a;--ok-soft:#eef4f0';
  // Superfície da marca, a mesma da tela de entrada (marca.js): gradiente marinho, brilho azul e padrão de envelopes.
  const ENVELOPES = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='96' viewBox='0 0 120 96'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='.07' stroke-width='1.4'%3E%3Crect x='14' y='18' width='40' height='26' rx='3'/%3E%3Cpath d='M15 20l19 13l19-13'/%3E%3Crect x='74' y='60' width='32' height='21' rx='3'/%3E%3Cpath d='M75 62l15 10l15-10'/%3E%3C/g%3E%3C/svg%3E\")";
  const MARINHO = `${ENVELOPES},radial-gradient(700px 420px at 10% 0%,rgba(77,134,255,.32),transparent 62%),linear-gradient(135deg,#0b2155 0%,#122f80 58%,#1e4fc8 100%)`;
  const R = ':root[data-estilo="remessa"]:not(.tema-embutido)', S = ':root[data-estilo="sereno"]';
  const RAIL = '.rail:not(.embutido .rail)';
  const RC = ':root[data-estilo="remessa"]:not([data-tema="escuro"])';   // fundo azulado do Remessa claro, também em ferramenta embutida
  const ESTILOS = `
${RC}{--bg:#f4f6fb}
${RC} .top:not(.hub .top):not(.top2),${RC}.tema-embutido .top,${RC}.tema-embutido .rail{background:rgba(244,246,251,.94)}
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
${C}[data-tema="escuro"]{${VARS_CLASSICO}}
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
${S}:not([data-tema="escuro"]) ${RAIL}{background:#f7f7f9}
${S} .pi,${S} .pi-n{box-shadow:none;border:1px solid rgba(20,20,30,.12)}
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
#gtPainel{border:1px solid var(--line,#eceef4);border-radius:18px;padding:22px 24px;width:min(760px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:auto;background:var(--card,#fff);color:var(--ink,#161a23);box-shadow:0 24px 64px rgba(10,20,60,.28)}
#gtPainel::backdrop{background:rgba(9,17,44,.45)}
.gt-prefs{font:400 13px/1.45 Inter,"Segoe UI",system-ui,sans-serif;color:var(--ink,#161a23);text-align:left}
.gt-card{display:block}
.gt-prefs .gt-cab{display:flex;align-items:flex-start;gap:12px;margin-bottom:6px}.gt-prefs .gt-cab>div{flex:1}
.gt-prefs .gt-tit{display:block;font-family:var(--title,inherit);font-size:17px;font-weight:700;margin-bottom:2px}
.gt-card .gt-tit{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted,#6f7689)}
.gt-prefs .gt-sub,.gt-prefs .gt-rot span,.gt-prefs .gt-nota{display:block;color:var(--muted,#6f7689);font-size:12px}
.gt-prefs .gt-x{border:0;background:none;font-size:22px;line-height:1;color:var(--muted,#6f7689);cursor:pointer;padding:2px 6px;border-radius:8px}.gt-prefs .gt-x:hover{background:var(--bv-soft,#f2f4fd)}
.gt-prefs .gt-lin{display:grid;grid-template-columns:170px 1fr;gap:8px 20px;padding:14px 0;border-top:1px solid var(--line,#eceef4)}
.gt-prefs .gt-lin:first-of-type{border-top:0}
.gt-prefs .gt-rot b{display:block;font-size:13px;font-weight:650;margin-bottom:2px}
.gt-prefs .gt-ops{display:grid;gap:8px}
.gt-prefs .gt-modos{grid-template-columns:repeat(3,minmax(0,1fr))}
.gt-prefs .gt-estilos{grid-template-columns:repeat(auto-fill,minmax(118px,1fr))}
.gt-prefs .gt-ops button{font:inherit;color:inherit;background:var(--card,#fff);border:1px solid var(--line,#eceef4);border-radius:12px;padding:9px 11px;cursor:pointer;display:flex;align-items:center;gap:8px;text-align:left}
.gt-prefs .gt-estilos button{flex-direction:column;align-items:stretch;gap:4px;padding:8px 8px 10px}
.gt-prefs .gt-ops button:hover:not([disabled]){border-color:var(--bv-line,#d5dbf7)}
.gt-prefs .gt-ops button.on{border-color:var(--bv,#223ad2);box-shadow:0 0 0 1px var(--bv,#223ad2) inset;color:var(--bv-t,var(--bv,#223ad2))}
.gt-prefs .gt-ops button.on .gt-d{color:var(--muted,#6f7689)}
.gt-prefs .gt-ops button[disabled]{opacity:.55;cursor:not-allowed}
.gt-prefs .gt-ops button:focus-visible{outline:2px solid var(--bv,#223ad2);outline-offset:2px}
.gt-prefs .gt-ops svg{width:17px;height:17px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.gt-prefs .gt-n{font-weight:650;font-size:13px;padding:0 2px}.gt-prefs .gt-n em{font-style:normal;font-weight:500;font-size:10.5px;color:var(--muted,#6f7689);margin-left:4px}
.gt-prefs .gt-d{font-size:11.5px;line-height:1.4;color:var(--muted,#6f7689);padding:0 2px}
.gt-prefs .gt-nota{margin:4px 0 0;padding-top:12px;border-top:1px solid var(--line,#eceef4)}
.gt-mini{position:relative;display:block;height:64px;border-radius:9px;overflow:hidden;border:1px solid rgba(20,30,70,.12);background:#f4f6fb}
.gt-mini i{position:absolute;display:block;border-radius:4px}
.gt-mini .r{left:0;top:0;bottom:0;width:24%;border-radius:0}
.gt-mini .h{left:30%;right:6%;top:9px;height:15px}
.gt-mini .c{top:31px;height:24px;width:29%;background:#fff;border:1px solid #e6e9f2}.gt-mini .c+.c{left:65%}.gt-mini .c{left:30%}
.gt-m-remessa .r,.gt-m-remessa .h{background:linear-gradient(135deg,#0b2155,#122f80 58%,#1e4fc8)}
.gt-m-sereno{background:#fff}.gt-m-sereno .r{background:#fff;border-right:1px solid #ececef}.gt-m-sereno .h{background:#fff;border:1px solid #ececef}.gt-m-sereno .c{border-color:#ececef}
.gt-m-classico{background:#fafafc}.gt-m-classico .r{background:#fff;border-right:1px solid #eceef4}.gt-m-classico .h{background:#223ad2}
.gt-m-experimental{background:#f7f8fc}.gt-m-experimental .r{background:#0b2155}.gt-m-experimental .h{background:#1e4fc8;border-radius:7px}.gt-m-experimental .c{border-radius:8px}
@media (max-width:640px){.gt-prefs .gt-lin{grid-template-columns:1fr}.gt-prefs .gt-modos{grid-template-columns:1fr 1fr 1fr}}
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
  const FIXO_CLASSICO = {
    '#ffffff': { f: '#161b29', b: '#262d40' }, '#fafafc': { f: '#0e121c' }, '#fbfbfd': { f: '#0e121c' },
    '#223ad2': { f: '#5066ec', t: '#8d9cf9', b: '#5066ec' }, '#002bab': { f: '#3a4fd6', t: '#a9b4ff', b: '#3a4fd6' },
    '#161a23': { f: '#2a3147', t: '#e6e9f2', b: '#3a4258' }, '#c4574f': { f: '#d9665d', t: '#ec7d74', b: '#c4574f' },
    '#f2f4fd': { f: '#1a2142', b: '#2f3a6b' }, '#d5dbf7': { f: '#2f3a6b', b: '#2f3a6b' }, '#8e9de9': { t: '#a3afef', b: '#5d6cc4' },
    '#eceef4': { f: '#232a3c', b: '#262d40' }, '#fbefee': { f: '#3a1f24', b: '#5a2c30' },
  };
  // Tons neutros convertidos: azul-noite saturado no Remessa, quase cinza no Sereno, grafite-azulado no Clássico.
  const NEUTRO = { remessa: { h: 226, sMin: 0.5, sMax: 0.62, base: 0.15, bS: 0.45, bBase: 0.2 }, sereno: { h: 230, sMin: 0.03, sMax: 0.05, base: 0.09, bS: 0.05, bBase: 0.17 }, classico: { h: 226, sMin: 0.16, sMax: 0.3, base: 0.135, bS: 0.25, bBase: 0.17 } };
  NEUTRO.experimental = NEUTRO.classico;
  const FIXO = { remessa: FIXO_REMESSA, sereno: FIXO_SERENO, classico: FIXO_CLASSICO, experimental: FIXO_CLASSICO };
  function converter(papel, c) {
    const [r, g, b, a] = c, fx = FIXO[estilo][hex(c)], N = NEUTRO[estilo];
    if (fx && fx[papel]) return fmt(parse(fx[papel]), a);
    let [h, s, l] = hsl([r, g, b]);
    const croma = s * (1 - Math.abs(2 * l - 1)), neutro = croma < 0.09;
    if (papel === 't') {                                   // texto: claro sobre fundo escuro
      if (l > 0.9) return null;                            // texto branco (sobre azul, vermelho...) continua branco
      if (neutro) return fmt(rgb(h, Math.min(s, estilo === 'sereno' ? 0.04 : estilo === 'remessa' ? 0.2 : 0.18), 0.92 - l * 0.62), a);
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
  // Experimental é outra pasta (ADR-0038): escolher abre a mesma ferramenta lá; sair dele grava o estilo e volta.
  function escolherEstilo(v) {
    const rv = window.remessaVisual;
    if (v === 'experimental') { if (!EXP && rv && rv.par()) rv.trocar(); return; }
    const novo = ESTILOS_OK.includes(v) ? v : 'remessa';
    try { novo === 'remessa' ? localStorage.removeItem(CHAVE_E) : localStorage.setItem(CHAVE_E, novo); } catch {}
    if (EXP) { if (rv && rv.par()) rv.trocar(); return; }
    estilo = novo; aplicarEstilo();
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

  // ---- Preferências (ADR-0044): o botão redondo do canto abre o painel; os Ajustes de cada ferramenta mostram o mesmo
  //      bloco num card (<div data-preferencias>). Tudo fica só neste computador e vale para todas as ferramentas. ----
  const ICONE = {
    claro: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    escuro: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    auto: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor"/></svg>',
  };
  const NOME = { claro: 'Claro', escuro: 'Escuro', auto: 'Automático' };
  const ESTILO = {
    remessa: ['Remessa', 'O da tela de entrada: trilho e faixas marinhas.'],
    sereno: ['Sereno', 'Menos estímulo: sem gradiente nem sombras.'],
    classico: ['Clássico', 'O de antes: trilho branco, fundo neutro.'],
    experimental: ['Experimental', 'Outras cores e fontes, na pasta experimental/.'],
  };
  const ORDEM_E = ['remessa', 'sereno', 'classico', 'experimental'];
  const expDisponivel = () => { try { return EXP || !!(window.remessaVisual && window.remessaVisual.par()); } catch { return false; } };
  // Miniatura de cada estilo: trilho, faixa de destaque e dois cards, desenhados só com CSS (classes gt-m-*).
  const mini = e => `<span class="gt-mini gt-m-${e}" aria-hidden="true"><i class="r"></i><i class="h"></i><i class="c"></i><i class="c"></i></span>`;
  function prefsHtml(noPainel) {
    const exp = expDisponivel();
    return `<div class="gt-cab"><div><b class="gt-tit">Preferências</b><span class="gt-sub">Valem para todas as ferramentas da Remessa abertas neste computador. Nada vai para os arquivos de dados.</span></div>${noPainel ? '<button type="button" class="gt-x" data-gt-fechar aria-label="Fechar">×</button>' : ''}</div>
<div class="gt-lin"><div class="gt-rot"><b>Modo</b><span>Claro, escuro ou como o sistema.</span></div><div class="gt-ops gt-modos" role="radiogroup" aria-label="Modo">${['claro', 'escuro', 'auto'].map(t => `<button type="button" role="radio" data-t="${t}">${ICONE[t]}<span>${NOME[t]}</span></button>`).join('')}</div></div>
<div class="gt-lin"><div class="gt-rot"><b>Estilo visual</b><span>Muda a cara das telas, não o que elas mostram.</span></div><div class="gt-ops gt-estilos" role="radiogroup" aria-label="Estilo visual">${ORDEM_E.map(e => {
      const off = e === 'experimental' && !exp;
      return `<button type="button" role="radio" data-e="${e}" ${off ? 'disabled title="Abra a ferramenta pelo pacote completo (com a pasta experimental/) para usar este visual."' : ''}>${mini(e)}<span class="gt-n">${ESTILO[e][0]}${e === 'remessa' ? ' <em>padrão</em>' : ''}</span><span class="gt-d">${off ? 'Só no pacote completo, com a pasta experimental/.' : ESTILO[e][1]}</span></button>`;
    }).join('')}</div></div>
<p class="gt-nota">${EXP ? 'Você está no visual experimental. Escolher outro estilo abre a mesma ferramenta no visual atual, com os mesmos dados.' : 'O Experimental abre a mesma ferramenta na pasta experimental/, com os mesmos dados. Dá para voltar por aqui.'}</p>`;
  }
  let caixa = null, painel = null;
  function atualizarBotao() {
    const marca = raiz => {
      raiz.querySelectorAll('[data-t]').forEach(x => { const on = x.dataset.t === pref; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
      raiz.querySelectorAll('[data-e]').forEach(x => { const on = x.dataset.e === estilo; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
    };
    document.querySelectorAll('.gt-prefs').forEach(marca);
    if (!caixa) return;
    const b = caixa.firstChild; b.innerHTML = ICONE[pref];
    b.title = `Preferências · Modo: ${NOME[pref]}${pref === 'auto' ? ` (agora ${escuro ? 'escuro' : 'claro'}, como o sistema)` : ''} · Estilo: ${ESTILO[estilo][0]}`;
    b.setAttribute('aria-label', b.title);
  }
  // Preenche os <div data-preferencias> que as ferramentas põem nos Ajustes (renderizam de novo a cada troca de página).
  function preencher() {
    document.querySelectorAll('[data-preferencias]:not(.gt-prefs)').forEach(el => { el.classList.add('gt-prefs', 'gt-card'); el.innerHTML = prefsHtml(false); });
    atualizarBotao();
  }
  function abrirPreferencias() {
    if (!document.body) return;
    if (!painel) {
      painel = document.createElement('dialog'); painel.id = 'gtPainel'; painel.className = 'gt-prefs';
      painel.setAttribute('aria-label', 'Preferências');
      painel.addEventListener('click', e => { if (e.target === painel) painel.close(); });
    }
    painel.innerHTML = prefsHtml(true);
    if (!painel.isConnected) document.body.appendChild(painel);
    if (!painel.open) { try { painel.showModal(); } catch { painel.setAttribute('open', ''); } }
    atualizarBotao();
    painel.querySelector('[data-t].on, [data-t]')?.focus();
  }
  // Clique em qualquer bloco de preferências (painel ou card dos Ajustes).
  document.addEventListener('click', e => {
    const b = e.target && e.target.closest && e.target.closest('.gt-prefs [data-t], .gt-prefs [data-e], .gt-prefs [data-gt-fechar]');
    if (!b || b.disabled) return;
    e.stopPropagation();
    if (b.hasAttribute('data-gt-fechar')) { painel?.close(); return; }
    if (b.dataset.e) escolherEstilo(b.dataset.e); else escolher(b.dataset.t);
  }, true);
  function montarBotao() {
    if (caixa || !document.body) return;
    caixa = document.createElement('div'); caixa.id = 'temaSel';
    caixa.innerHTML = '<button type="button" aria-haspopup="dialog"></button>';
    caixa.firstChild.onclick = e => { e.stopPropagation(); abrirPreferencias(); };
    document.body.appendChild(caixa);
    preencher();
    new MutationObserver(() => { if (document.querySelector('[data-preferencias]:not(.gt-prefs)')) preencher(); }).observe(document.body, { childList: true, subtree: true });
  }

  const st = document.createElement('style'); st.id = 'temaCss'; st.textContent = CSS;
  (document.head || html).appendChild(st); const temaFolha = st.sheet; feitas.add(temaFolha);
  window.gestaoTema = { escolher, escolherEstilo, preferencias: abrirPreferencias, get escolha() { return pref; }, get escuro() { return escuro; }, get estilo() { return estilo; } };
  aplicar();
  mq.addEventListener?.('change', () => { if (pref === 'auto') aplicar(); });
  window.addEventListener('storage', e => { if (e.key === CHAVE || e.key === null) { pref = ler(); aplicar(); } if ((e.key === CHAVE_E || e.key === null) && !EXP) { estilo = lerEstilo(); aplicarEstilo(); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { montarBotao(); if (escuro) converterTudo(); });
  else montarBotao();
})();

/* ---------- Remessa · tela de entrada comum (ADR-0037) ----------
   Injetado pelo build no <head> de todas as ferramentas. Traz também o estilo da entrada em dois passos
   (.ent-*: 1 arquivo, 2 senha), usado pela Central e pelo núcleo das outras ferramentas. Quando a tela de entrada aparece
   (.lock da Central, .entrada do hub, .welcome das outras), põe o fundo da marca, o painel
   da Remessa à esquerda com o nome e a versão da ferramenta, e desloca a caixa para a direita.
   Não mexe em nada quando a ferramenta está embutida em outra (Férias dentro da Central). */
(() => {
  const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0b2155"/><rect x="5" y="9" width="22" height="15" rx="2" fill="#fff"/><path d="M5.8 10l10.2 7.6L26.2 10" fill="none" stroke="#0b2155" stroke-width="1.6" stroke-linejoin="round"/><circle cx="16" cy="17.6" r="3.2" fill="#4d86ff" stroke="#fff" stroke-width="1.1"/></svg>';
  const PADRAO = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='96' viewBox='0 0 120 96'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='.07' stroke-width='1.4'%3E%3Crect x='14' y='18' width='40' height='26' rx='3'/%3E%3Cpath d='M15 20l19 13l19-13'/%3E%3Crect x='74' y='60' width='32' height='21' rx='3'/%3E%3Cpath d='M75 62l15 10l15-10'/%3E%3C/g%3E%3C/svg%3E\")";
  const CSS = `
.rm-tela{--rm-larg:520px;position:relative;min-height:100vh;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,var(--rm-larg));align-items:center;gap:clamp(24px,6vw,96px);padding:6vh clamp(20px,8vw,140px) max(6vh,56px) clamp(20px,7vw,120px);box-sizing:border-box;
  background:${PADRAO},radial-gradient(900px 520px at 12% 18%,rgba(77,134,255,.38),transparent 62%),linear-gradient(135deg,#0b2155 0%,#122f80 58%,#1e4fc8 100%);background-color:#0b2155}
.lock.rm-tela{position:fixed;inset:0;place-items:center normal;overflow:auto}
.rm-tela>.rm-lado{color:#fff;max-width:440px;align-self:center}
.rm-lado .rm-logo{display:flex;align-items:center;gap:12px;margin-bottom:18px}.rm-lado .rm-logo svg{width:52px;height:52px;flex:none;filter:drop-shadow(0 6px 18px rgba(0,0,0,.25));border-radius:13px;outline:1px solid rgba(255,255,255,.18)}
.rm-lado .rm-nome{font:700 30px/1.1 var(--title,inherit);letter-spacing:-.02em;color:#fff}
.rm-lado .rm-frase{margin:0 0 18px;font-size:15px;line-height:1.55;color:rgba(255,255,255,.86)}
.rm-rodape{position:absolute;left:0;right:0;bottom:16px;text-align:center;font-size:12px;color:rgba(255,255,255,.62);letter-spacing:.01em}.rm-rodape b{color:#fff;font-weight:650}
.rm-tela .lockcard .appver{display:none}
.rm-lado .rm-ver{display:inline-flex;gap:8px;align-items:center;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);font-size:12.5px;color:#fff}
.rm-lado .rm-ver b{font-weight:700}.rm-lado .rm-sob{display:block;margin-top:14px;font-size:12px;color:rgba(255,255,255,.6)}
.rm-lado a{color:#fff;text-decoration:underline;text-underline-offset:3px}
.rm-tela>.welcome,.rm-tela>.entrada,.rm-tela>.lockcard{margin:0!important;width:100%;max-width:none!important;box-sizing:border-box}
.rm-tela>.entrada,.rm-tela>.lockcard,.rm-tela>.welcome>.card,.rm-tela>.welcome>:only-child{box-shadow:0 30px 80px rgba(3,10,40,.45)!important}
.rm-tela>.welcome{padding:0!important}
.lock.rm-tela{--rm-larg:420px}.rm-tela.rm-hub{--rm-larg:480px}
.rm-tela>.entrada{display:block!important;padding:0!important}.rm-tela>.entrada>.vitrine{display:none!important}
.rm-lado .rm-extra h2{font:600 19px/1.3 var(--title,inherit);color:#fff;margin:22px 0 6px}.rm-lado .rm-extra p{margin:0 0 12px;color:rgba(255,255,255,.82);font-size:13.5px;line-height:1.55}.rm-lado .rm-extra ul{list-style:none;margin:0 0 18px;padding:0;display:grid;gap:9px}.rm-lado .rm-extra li{display:flex;gap:10px;font-size:13px;color:rgba(255,255,255,.9)}.rm-lado .rm-extra li svg{width:18px;height:18px;flex:none;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;margin-top:1px}
.ent-passo{display:grid;grid-template-columns:26px minmax(0,1fr);gap:12px;margin-top:18px;transition:opacity .2s}
.ent-n{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--bv,#223ad2);color:#fff;font:700 12.5px/1 var(--title,inherit)}
.ent-passo.off{opacity:.5}.ent-passo.off .ent-n{background:var(--faint,#aab0bf)}
.ent-c{min-width:0}.ent-t{display:block;font-size:11px;font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#6f7689);margin:5px 0 8px}
.ent-arq{display:flex;align-items:center;gap:10px;border:1.5px solid var(--bv-line,#d5dbf7);background:var(--bv-soft,#f2f4fd);border-radius:12px;padding:10px 12px}
.ent-arq svg{width:24px;height:24px;flex:none;color:var(--bv,#223ad2)}.ent-arq b{display:block;font-size:13.5px;overflow-wrap:anywhere}.ent-arq span{display:block;font-size:11.5px;color:var(--muted,#6f7689)}
.ent-vazio{border:1.5px dashed var(--line,#e1e4ec);border-radius:12px;padding:10px 12px;font-size:12.5px;color:var(--muted,#6f7689)}
.ent-lista{display:grid;gap:6px;margin-top:8px}.ent-lista label{display:flex;gap:8px;align-items:center;font-size:12.5px;border:1px solid var(--line,#e1e4ec);border-radius:10px;padding:7px 10px;cursor:pointer}.ent-lista label:has(input:checked){border-color:var(--bv,#223ad2);background:var(--bv-soft,#f2f4fd)}
.ent-acoes{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.ent-campo{display:flex;gap:8px}.ent-campo input{flex:1;min-width:0;border:1px solid var(--line,#e1e4ec);border-radius:10px;padding:8px 10px;background:var(--card,#fff);color:inherit;outline:none;font-size:13px}
.ent-campo input:focus{border-color:var(--bv,#223ad2);box-shadow:0 0 0 3px var(--bv-soft,#f2f4fd)}.ent-campo input:disabled{background:transparent}
.ent-dica{font-size:11.5px;color:var(--muted,#6f7689);margin-top:6px}.ent-msg{font-size:12px;margin-top:6px;color:var(--late,#c4574f);min-height:0}
@media (max-width:900px){.rm-rodape{position:static;grid-column:1/-1;padding-top:8px}.rm-tela{grid-template-columns:1fr;padding:5vh 16px;gap:22px;align-content:start}.rm-tela>.rm-lado{max-width:none}.rm-lado .rm-frase{display:none}.rm-tela>.welcome,.rm-tela>.entrada,.rm-tela>.lockcard{justify-self:stretch;width:auto}}`;
  const versao = () => { try { if (typeof APP_VERSION !== 'undefined') return APP_VERSION; } catch {} try { if (typeof TOOL_VERSION !== 'undefined') return TOOL_VERSION; } catch {} return ''; };
  const ferramenta = () => (document.title || '').split('·')[0].trim();
  const lado = () => {
    const d = document.createElement('div'); d.className = 'rm-lado';
    d.innerHTML = `<div class="rm-logo">${SVG}<span class="rm-nome">Remessa</span></div>
      <p class="rm-frase">Envelopes lacrados numa caixa postal. Cada ferramenta guarda o que é seu num arquivo cifrado com a sua senha e troca com os times só o necessário, lacrado com a chave de cada time.</p>
      <span class="rm-sob">Nada sai do seu computador · <a href="apresentacao.html" target="_blank" rel="noopener">Conheça a Remessa</a></span>`;
    return d;
  };
  // A versão aparece uma vez só, no rodapé da tela de entrada.
  const rodape = () => {
    const d = document.createElement('div'); d.className = 'rm-rodape';
    const v = versao(), n = ferramenta().replace(/[<&>]/g, '');
    d.innerHTML = `${n}${v ? ` · versão <b>${String(v).replace(/[<&>]/g, '')}</b>` : ''} · Remessa`;
    return d;
  };
  const embutido = () => window.top !== window || document.documentElement.classList.contains('embutido') || document.body?.classList.contains('embutido') || !!document.querySelector('.embutido');
  function aplicar() {
    if (embutido()) return;
    const lock = document.querySelector('.lock:not(.rm-tela)');
    if (lock && lock.querySelector('.lockcard')) { lock.classList.add('rm-tela'); lock.insertBefore(lado(), lock.firstChild); lock.appendChild(rodape()); }
    for (const el of document.querySelectorAll('.welcome, .entrada')) {
      if (el.parentElement?.classList.contains('rm-tela')) continue;
      const w = document.createElement('div'), l = lado(), v = el.querySelector(':scope > .vitrine'); w.className = 'rm-tela';
      // Hub: o texto da vitrine (cockpit e módulos) vai para o painel da Remessa; a caixa fica só com as opções.
      if (v) { w.classList.add('rm-hub'); const x = document.createElement('div'); x.className = 'rm-extra'; x.append(...[...v.children].filter(c => !c.classList.contains('selo')).map(c => c.cloneNode(true))); l.querySelector('.rm-frase').replaceWith(x); }
      el.replaceWith(w); w.append(l, el, rodape());
    }
  }
  function iniciar() {
    if (!document.getElementById('rm-css')) { const s = document.createElement('style'); s.id = 'rm-css'; s.textContent = CSS; document.head.appendChild(s); }
    aplicar(); new MutationObserver(aplicar).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();

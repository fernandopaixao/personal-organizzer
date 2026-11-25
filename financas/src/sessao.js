/* sessao 1.1 · uma senha por sessão (ADR-0029, ADR-0035)
   Quem abre (hub, Central) guarda só em memória a senha que abriu o próprio arquivo. Quando a pessoa clica num link
   para outra ferramenta (target=_blank rel=opener), a janela nova pede a senha e o abridor responde uma vez, só nos
   90 segundos seguintes ao clique e só para uma janela aberta por ele (e.source.opener === window).
   1.1: o abridor também pode guardar a senha de uma ferramenta específica (definir(senha, 'central')); o link com
   data-sessao="central" leva essa senha em vez da senha da sessão. Serve para a Central com senha própria.
   A ferramenta aberta usa a senha só para abrir o próprio arquivo; se não servir, pede a senha como sempre.
   Nada vai para disco, localStorage ou para a pasta. Injetado em todos os HTMLs pelo build, junto com o tema. */
(() => {
  if (window.gestaoSessao) return;
  const SC = 'gestao-sessao/1', JANELA = 90e3;
  let senha = null, cliqueEm = 0, alvo = '', recebida = null, usada = false;
  const porAlvo = {};
  const temAlguma = () => !!senha || Object.keys(porAlvo).length > 0;
  document.addEventListener('click', e => {
    const a = e.target && e.target.closest && e.target.closest('a[target="_blank"][rel~="opener"]');
    if (a && temAlguma()) { cliqueEm = Date.now(); alvo = (a.dataset && a.dataset.sessao) || ''; }
  }, true);
  window.addEventListener('message', e => {
    const m = e.data; if (!m || m.schema !== SC) return;
    if (m.tipo === 'pedir') {
      const s = (alvo && porAlvo[alvo]) || senha;
      if (!s || !cliqueEm || Date.now() - cliqueEm > JANELA) return;
      let filha = false; try { filha = !!e.source && e.source.opener === window; } catch {}
      if (!filha) return;
      cliqueEm = 0; alvo = '';
      try { e.source.postMessage({ schema: SC, tipo: 'senha', senha: s }, '*'); } catch {}
    } else if (m.tipo === 'senha') {
      if (!window.opener || e.source !== window.opener || recebida !== null || typeof m.senha !== 'string' || !m.senha) return;
      recebida = m.senha.slice(0, 500);
      window.dispatchEvent(new Event('gestao-sessao'));
    }
  });
  // Página que vai trocar de visual (visual.js, ADR-0038): quem pede a senha é a versão que abre em seguida.
  if (window.opener && !window.__remessaTroca) try { window.opener.postMessage({ schema: SC, tipo: 'pedir' }, '*'); } catch {}
  window.gestaoSessao = {
    // definir(senha) troca a senha da sessão; definir(null) esquece todas; definir(senha, 'central') guarda a de uma ferramenta.
    definir(s, para) {
      if (para) { if (s) porAlvo[para] = String(s); else delete porAlvo[para]; return; }
      senha = s ? String(s) : null;
      if (!s) { cliqueEm = 0; alvo = ''; for (const k of Object.keys(porAlvo)) delete porAlvo[k]; }
    },
    get recebida() { return recebida; },
    // Entrega a senha recebida uma única vez (para abrir o próprio arquivo).
    usar() { if (recebida == null || usada) return null; usada = true; return recebida; },
    get usada() { return usada; }
  };
})();

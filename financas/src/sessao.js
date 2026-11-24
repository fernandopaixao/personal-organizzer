/* sessao 1.0 · uma senha por sessão (ADR-0029)
   Quem abre (hub, Central) guarda só em memória a senha que abriu o próprio arquivo. Quando a pessoa clica num link
   para outra ferramenta (target=_blank rel=opener), a janela nova pede a senha e o abridor responde uma vez, só nos
   90 segundos seguintes ao clique e só para uma janela aberta por ele (e.source.opener === window).
   A ferramenta aberta usa a senha só para abrir o próprio arquivo; se não servir, pede a senha como sempre.
   Nada vai para disco, localStorage ou para a pasta. Injetado em todos os HTMLs pelo build, junto com o tema. */
(() => {
  if (window.gestaoSessao) return;
  const SC = 'gestao-sessao/1', JANELA = 90e3;
  let senha = null, cliqueEm = 0, recebida = null, usada = false;
  document.addEventListener('click', e => {
    const a = e.target && e.target.closest && e.target.closest('a[target="_blank"][rel~="opener"]');
    if (a && senha) cliqueEm = Date.now();
  }, true);
  window.addEventListener('message', e => {
    const m = e.data; if (!m || m.schema !== SC) return;
    if (m.tipo === 'pedir') {
      if (!senha || !cliqueEm || Date.now() - cliqueEm > JANELA) return;
      let filha = false; try { filha = !!e.source && e.source.opener === window; } catch {}
      if (!filha) return;
      cliqueEm = 0;
      try { e.source.postMessage({ schema: SC, tipo: 'senha', senha }, '*'); } catch {}
    } else if (m.tipo === 'senha') {
      if (!window.opener || e.source !== window.opener || recebida !== null || typeof m.senha !== 'string' || !m.senha) return;
      recebida = m.senha.slice(0, 500);
      window.dispatchEvent(new Event('gestao-sessao'));
    }
  });
  if (window.opener) try { window.opener.postMessage({ schema: SC, tipo: 'pedir' }, '*'); } catch {}
  window.gestaoSessao = {
    definir(s) { senha = s ? String(s) : null; if (!s) cliqueEm = 0; },
    get recebida() { return recebida; },
    // Entrega a senha recebida uma única vez (para abrir o próprio arquivo).
    usar() { if (recebida == null || usada) return null; usada = true; return recebida; },
    get usada() { return usada; }
  };
})();

/* seguranca-comum 1.0 · aviso de senha e cofre, lembrete de teste da senha e "Onde estou?"
   Bloco injetado na Central e no Quadro por tools/injetar_seguranca.py (o mesmo texto das ferramentas de finanças).
   Usa um <dialog> próprio para não interferir nos diálogos da ferramenta. */
(() => {
  const css = `.f4d{border:0;border-radius:18px;padding:0;width:min(600px,94vw);max-height:90vh;box-shadow:0 24px 64px rgba(20,30,70,.25);font:13.5px/1.5 Inter,"Segoe UI",system-ui,sans-serif;color:#161a23}
  .f4d::backdrop{background:rgba(22,26,35,.35)}.f4d .h{padding:16px 20px;border-bottom:1px solid #eceef4;font:600 16px "BV Leve",Montserrat,Inter,sans-serif}
  .f4d .b{padding:16px 20px;overflow:auto;max-height:62vh}.f4d .f{display:flex;gap:8px;justify-content:flex-end;padding:12px 20px;border-top:1px solid #eceef4}
  .f4d button{font:inherit;cursor:pointer;border:1px solid #eceef4;background:#fff;border-radius:10px;padding:6px 12px;font-weight:550}
  .f4d button.p{background:#223ad2;border-color:#223ad2;color:#fff}.f4d button:disabled{opacity:.4;cursor:not-allowed}
  .f4d .cofre{border:1.5px solid #c4574f;background:#fbefee;border-radius:14px;padding:12px 14px;color:#6d2620}
  .f4d .kv{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:0 0 12px}.f4d .kv dt{color:#6f7689}.f4d .kv dd{margin:0;font-weight:600;word-break:break-all}
  .f4d .mp{display:grid;grid-template-columns:1fr 1fr;gap:10px}.f4d .mp div{border:1px solid #eceef4;border-radius:12px;padding:10px 12px;font-size:12.5px}
  .f4d h4{margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6f7689}.f4d .t{font-size:12.5px;padding:6px 0;border-bottom:1px solid #eceef4}
  .f4d input[type=password]{width:100%;border:1px solid #eceef4;border-radius:10px;padding:7px 10px;font:inherit}
  .f4btn{font:inherit;font-size:12px;cursor:pointer;border:1px solid #eceef4;background:#fff;border-radius:99px;padding:4px 11px;color:#6f7689;white-space:nowrap}.f4btn:hover{color:#161a23;border-color:#cfd3e0}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function abrir(html) {
    let d = document.getElementById('f4dlg');
    if (!d) { d = document.createElement('dialog'); d.id = 'f4dlg'; d.className = 'f4d'; document.body.appendChild(d); }
    d.innerHTML = html; if (!d.open) d.showModal(); return d;
  }
  const TXT = {
    senha: '<b>Esta senha é a única forma de abrir seus dados.</b> Ela não fica guardada em lugar nenhum e ninguém consegue recuperá-la. Se você esquecer, os dados se perdem.<br><br><b>Guarde agora num cofre de senhas</b> (por exemplo, o gerenciador de senhas da empresa) antes de continuar.',
    chave: '<b>Esta chave abre os arquivos do time na pasta compartilhada.</b> Quem tiver a chave lê e publica em nome do time.<br><br><b>Guarde no cofre de senhas</b> e envie só por mensagem direta no Teams ou por e-mail. <b>Nunca</b> coloque a chave na pasta compartilhada.',
    html: '<b>Este HTML leva a chave do time embutida.</b> Trate o arquivo como uma senha: envie só ao responsável do time, por mensagem direta ou e-mail, e nunca o deixe na pasta compartilhada.<br><br>Peça para a pessoa <b>guardar a chave no cofre de senhas</b>.'
  };
  // Resolve true só quando a pessoa marca "Já guardei no cofre" e continua.
  window.f4Cofre = (tipo = 'senha', extra = '') => new Promise(ok => {
    const d = abrir(`<div class="h">Guarde no cofre antes de seguir</div><div class="b"><div class="cofre">${TXT[tipo] || TXT.senha}</div>${extra}
      <label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" id="f4ok"> Já guardei no cofre de senhas</label></div>
      <div class="f"><button id="f4no">Voltar</button><button class="p" id="f4go" disabled>Continuar</button></div>`);
    let fim = false; const sai = v => { fim = true; d.close(); ok(v); };
    d.querySelector('#f4ok').onchange = ev => d.querySelector('#f4go').disabled = !ev.target.checked;
    d.querySelector('#f4no').onclick = () => sai(false); d.querySelector('#f4go').onclick = () => sai(true);
    d.addEventListener('close', function h() { if (d.open) return; d.removeEventListener('close', h); if (!fim) ok(false); });
  });
  // Lembrete: 30 dias depois da primeira confirmação e depois a cada 90 dias, pede a senha uma vez.
  // conferir(senha) -> Promise<boolean>. O estado fica no navegador (sem mudar o formato do arquivo).
  window.f4LembreteSenha = async (chave, conferir) => {
    let s = {}; try { s = JSON.parse(localStorage.getItem('f4.senha.' + chave) || '{}'); } catch {}
    const agora = Date.now();
    if (!s.desde) { s.desde = agora; try { localStorage.setItem('f4.senha.' + chave, JSON.stringify(s)); } catch {} return; }
    const base = s.teste || s.desde, lim = s.teste ? 90 : 30;
    if ((agora - base) / 864e5 < lim) return;
    const r = await new Promise(ok => {
      const d = abrir(`<div class="h">Confirme que a senha está no cofre</div><div class="b"><p style="margin-top:0">Para garantir que você não vai perder o acesso, digite a senha deste arquivo (ela deve estar no seu cofre de senhas).</p><input type="password" id="f4pw" autocomplete="current-password"><p id="f4msg" style="color:#c4574f;font-size:12px"></p></div>
        <div class="f"><button id="f4dep">Lembrar amanhã</button><button class="p" id="f4conf">Confirmar</button></div>`);
      let n = 0;
      d.querySelector('#f4dep').onclick = () => { d.close(); ok('adiar'); };
      d.querySelector('#f4conf').onclick = async () => { if (await conferir(d.querySelector('#f4pw').value)) { d.close(); ok('ok'); } else if (++n >= 2) { d.close(); ok('falhou'); } else d.querySelector('#f4msg').textContent = 'Senha não confere. Tente de novo.'; };
      d.querySelector('#f4pw').onkeydown = ev => { if (ev.key === 'Enter') d.querySelector('#f4conf').click(); };
    });
    if (r === 'ok') s.teste = agora; else if (r === 'adiar') s.teste = agora - (lim - 1) * 864e5;
    try { localStorage.setItem('f4.senha.' + chave, JSON.stringify(s)); } catch {}
    if (r === 'falhou') abrir(`<div class="h">Senha não confere</div><div class="b"><div class="cofre">Você não lembrou a senha. Enquanto o arquivo ainda está aberto, <b>troque a senha</b> e guarde a nova no cofre.</div></div><div class="f"><button class="p" onclick="this.closest('dialog').close()">Entendi</button></div>`);
  };
  const FERR = [
    ['Hub da solução', 'hub.html', 'Tela inicial do dia a dia: abre as outras ferramentas e deixa post-its para os times.'],
    ['Início da solução', 'inicio.html', 'Assistente: pergunta o uso, cria o primeiro arquivo e gera os HTMLs.'],
    ['Finanças do Grupo', 'financas_grupo.html', 'Consolidado das finanças: soma os planos publicados pelos times.'],
    ['Finanças do Time', 'financas_<time>.html', 'Dia a dia e futuro das finanças de um time.'],
    ['Central de Gestão', 'gestao_pessoal_vNN.html', 'Tarefas consolidado: gestão do gestor, iniciativas e times.'],
    ['Quadro do Time', 'quadro_<time>.html', 'Tarefas de um time: quadro, backlog, sprints e métricas.']
  ];
  // info = { ferramenta, versao, arquivo, pastaComum, voce, local: [], comum: [] }
  window.f4OndeEstou = info => {
    const d = abrir(`<div class="h">Onde estou?</div><div class="b"><dl class="kv"><dt>Ferramenta</dt><dd>${e(info.ferramenta)} <span style="color:#aab0bf;font-weight:400">${e(info.versao || '')}</span></dd>
      <dt>Arquivo aberto</dt><dd>${info.arquivo ? e(info.arquivo) : '<span style="color:#aab0bf">nenhum</span>'}</dd>
      <dt>Pasta sincronizada</dt><dd>${info.pastaComum ? e(info.pastaComum) : '<span style="color:#aab0bf">não ligada</span>'}</dd>${info.voce ? `<dt>Você neste computador</dt><dd>${e(info.voce)}</dd>` : ''}</dl>
      <div class="mp"><div><h4>Fica só neste computador</h4>${info.local.map(x => '• ' + e(x)).join('<br>')}</div><div><h4>Vai para a pasta sincronizada</h4>${info.comum.map(x => '• ' + e(x)).join('<br>')}</div></div>
      <h4 style="margin-top:16px">Ferramentas da Remessa</h4>${FERR.map(([n, a, t]) => `<div class="t"><b>${e(n)}</b> <code style="color:#aab0bf">${e(a)}</code>${n === info.ferramenta ? ' <b style="color:#223ad2">· você está aqui</b>' : ''}<br><span style="color:#6f7689">${e(t)}</span></div>`).join('')}
      <p style="font-size:12px;color:#6f7689">Os HTMLs não guardam dados. Os dados ficam em arquivos cifrados: o pessoal numa pasta só sua (de preferência no seu OneDrive, como backup), o comum na pasta sincronizada.</p></div>
      <div class="f"><button class="p" id="f4fecha">Fechar</button></div>`);
    d.querySelector('#f4fecha').onclick = () => d.close();
  };
  window.f4Abrir = abrir;
  // Volta ao Hub da solução (hub.html, na mesma pasta). Se o hub já está aberto numa aba
  // (ele se chama "gestao-hub"), só traz aquela aba para a frente, sem recarregar; senão abre o hub.
  window.f4VoltarAoHub = function () {
    let w = null; try { w = window.open('', 'gestao-hub'); } catch {}
    if (!w) { location.href = 'hub.html'; return; }
    let vazia = false; try { vazia = w.location.href === 'about:blank'; } catch {}
    if (vazia) w.location.href = new URL('hub.html', location.href).href;
    try { w.focus(); } catch {}
  };
  window.f4BotaoOnde = (alvo, infoFn) => { const el = typeof alvo === 'string' ? document.getElementById(alvo) : alvo; if (!el || el.querySelector('.f4btn')) return; el.innerHTML = '<button type="button" class="f4btn f4hub" title="Voltar ao Hub da solução (hub.html)">← Hub</button> <button type="button" class="f4btn" title="Qual ferramenta é esta, qual arquivo está aberto e o que é local ou compartilhado">Onde estou?</button>'; el.querySelector('.f4hub').onclick = f4VoltarAoHub; el.querySelector('.f4btn:not(.f4hub)').onclick = () => f4OndeEstou(infoFn()); };
})();

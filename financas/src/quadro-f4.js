/* ---------- Quadro 2.1 · senha obrigatória, cofre, "Onde estou?" e um arquivo por pessoa ----------
   Cada pessoa grava só o próprio arquivo na pasta sincronizada:
     times/<time>/quadro/<pessoa>-<computador>.json   (envelope gestao-envelope/1, conteúdo quadro-contrib/1)
   com o retrato do quadro dela. Quem abre o Quadro lê os arquivos das outras pessoas e une item a item
   (mergeDb: vence a alteração mais recente). Ninguém sobrescreve o arquivo de ninguém, então o OneDrive
   não gera cópias de conflito; se gerar (mesma pessoa e computador), as cópias também são lidas e depois apagadas. */
const CONTRIB = 'quadro-contrib/1';
function f4dispositivo() {
  let d = null; try { d = JSON.parse(localStorage.getItem('nucleo.dispositivo') || 'null'); } catch {}
  if (!d?.id) { d = { id: Array.from(crypto.getRandomValues(new Uint8Array(3)), x => x.toString(36).padStart(2, '0')).join('').slice(0, 5) }; try { localStorage.setItem('nucleo.dispositivo', JSON.stringify(d)); } catch {} }
  return d;
}
function f4eu() { try { return db?.team.slug ? localStorage.getItem('quadro.eu.' + db.team.slug) : null; } catch { return null; } }
const f4writer = () => `${f4eu()}~${f4dispositivo().id}`;
const f4arquivo = () => `${f4eu()}-${f4dispositivo().id}.json`;
let f4vistos = {}, f4syncT = null, f4sincronizando = false, f4ultima = { lidos: 0, publicado: null, erro: '' };
async function f4pasta(criar) {
  const root = await obterPasta(); if (!root || !db?.team.slug) return null;
  try { let d = await root.getDirectoryHandle('times', { create: criar }); d = await d.getDirectoryHandle(db.team.slug, { create: criar }); return await d.getDirectoryHandle('quadro', { create: criar }); } catch { return null; }
}
function f4quemSou() {
  return new Promise(ok => {
    const ps = activePeople();
    const d = f4Abrir(`<div class="h">Quem é você neste quadro?</div><div class="b"><p style="margin-top:0">Cada pessoa grava só o próprio arquivo na pasta do time, para o OneDrive nunca juntar duas versões. Escolha seu nome (fica guardado neste navegador).</p>
      <select id="f4eu" style="width:100%;padding:7px;border:1px solid #eceef4;border-radius:10px">${ps.map(p => `<option value="${esc(p.name)}">${esc(p.name)}</option>`).join('')}<option value="">Outro nome…</option></select>
      <input id="f4euN" placeholder="Seu nome" style="width:100%;margin-top:8px;padding:7px;border:1px solid #eceef4;border-radius:10px;${ps.length ? 'display:none' : ''}"></div>
      <div class="f"><button id="f4euNo">Agora não</button><button class="p" id="f4euOk">Confirmar</button></div>`);
    const sel = d.querySelector('#f4eu'), inp = d.querySelector('#f4euN');
    sel.onchange = () => inp.style.display = sel.value ? 'none' : '';
    d.querySelector('#f4euNo').onclick = () => { d.close(); ok(null); };
    d.querySelector('#f4euOk').onclick = () => {
      const nome = sel.value || inp.value.trim(); const s = slugify(nome).replace(/-/g, '').slice(0, 16); if (!s) return;
      try { localStorage.setItem('quadro.eu.' + db.team.slug, s); } catch {} d.close(); ok(s);
    };
  });
}
async function f4ler() {
  const dir = await f4pasta(false); if (!dir) return false;
  const { mapa } = await chaveiro(); let mudou = false, lidos = 0;
  const assinatura = () => JSON.stringify([db.cards, db.epics, db.features, db.sprints, db.people, db.settings, db.team]);
  for await (const [n, h] of dir.entries()) {
    if (h.kind !== 'file' || !n.endsWith('.json') || n.startsWith('.') || n === f4arquivo() || (f4compartilhado() && n === fileHandle?.name)) continue;
    try {
      const f = await h.getFile(); if (f4vistos[n] === f.lastModified) { lidos++; continue; }
      const env = JSON.parse(await f.text()), p = await decifrar(env, mapa);
      if (p.schema !== CONTRIB || env.team !== db.team.slug || p.source?.team !== db.team.slug) continue;
      const antes = assinatura();
      db = mergeDb(db, normalizeDb(p.db));
      f4vistos[n] = f.lastModified; lidos++;
      if (assinatura() !== antes) mudou = true;
    } catch { /* arquivo pela metade ou de outra chave: tenta de novo na próxima leitura */ }
  }
  f4ultima.lidos = lidos;
  if (mudou) { dirty = true; scheduleSave(); if (!$('#dlg').open) render(); else renderChrome(); }
  return mudou;
}
async function f4publicar() {
  const k = f4chaveDoTime(db.team.slug); if (!k || !f4eu()) return;
  const dir = await f4pasta(true); if (!dir) return;
  if (f4compartilhado()) { await f4limparCopias(dir); f4ultima.publicado = new Date().toISOString(); return; }   // 2.9: o arquivo de dados já é o arquivo da pessoa
  const chaveRev = 'quadro.contribRev.' + db.team.slug, rev = (+localStorage.getItem(chaveRev) || 0) + 1;
  const snap = structuredClone(db);
  const payload = { schema: CONTRIB, revision: rev, generatedAt: agoraComFuso(), source: { team: db.team.slug, writer: f4writer(), tool: TOOL, toolVersion: TOOL_VERSION }, db: snap };
  const env = { ...(await cifrar(payload, { key: k.key, kid: k.kid, team: db.team.slug })), writer: payload.source.writer };
  const texto = JSON.stringify(env), fh = await dir.getFileHandle(f4arquivo(), { create: true });
  const w = await fh.createWritable(); await w.write(texto); await w.close();       // troca atômica no close()
  if ((await (await fh.getFile()).text()) !== texto) throw new Error('gravação não confirmada');
  try { localStorage.setItem(chaveRev, String(rev)); } catch {}
  await f4limparCopias(dir);
  f4ultima.publicado = new Date().toISOString();
}
async function f4limparCopias(dir) {   // cópias de conflito do próprio arquivo: já foram unidas em f4ler
  const base = f4arquivo().replace(/\.json$/, ''), copia = new RegExp('^' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:-[^\\\\/]+?| ?\\(\\d+\\))\\.json$');
  for await (const [n] of dir.entries()) if (copia.test(n)) { try { await dir.removeEntry(n); } catch {} }
}
async function f4sincronizar() {
  if (f4sincronizando || !db || db.demo || !db.team.slug || !keysInfo?.atual) return;
  f4sincronizando = true;
  try { if (!(await obterPasta())) return; await f4ler(); if (f4eu()) await f4publicar(); f4ultima.erro = ''; }
  catch (e) { f4ultima.erro = e.message || String(e); }
  finally { f4sincronizando = false; }
}
function f4agendar() { clearTimeout(f4syncT); f4syncT = setTimeout(f4sincronizar, 4000); }
setInterval(f4sincronizar, 20000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) f4sincronizar(); });

// Senha obrigatória: quadros antigos sem senha ganham uma antes de continuar.
function f4exigirSenha() {
  return new Promise(ok => {
    const d = f4Abrir(`<div class="h">Proteja este quadro com senha</div><div class="b"><p style="margin-top:0">A partir do Quadro 2.1 todo arquivo de dados é cifrado. Este quadro ainda não tem senha: crie uma agora (pelo menos 12 caracteres).</p>
      <input type="password" id="f4p1" placeholder="Senha" autocomplete="new-password"><input type="password" id="f4p2" placeholder="Repita a senha" autocomplete="new-password" style="margin-top:8px"><p id="f4pm" style="color:#c4574f;font-size:12px"></p></div>
      <div class="f"><button class="p" id="f4pok">Continuar</button></div>`);
    d.addEventListener('cancel', ev => ev.preventDefault());
    d.querySelector('#f4pok').onclick = async () => {
      const a = d.querySelector('#f4p1').value, b = d.querySelector('#f4p2').value, m = d.querySelector('#f4pm');
      if (a.length < 12) return m.textContent = 'Use pelo menos 12 caracteres.'; if (a !== b) return m.textContent = 'As duas senhas não são iguais.';
      d.close(); if (!await f4Cofre('senha')) return f4exigirSenha().then(ok);
      const salt = crypto.getRandomValues(new Uint8Array(16)); fileKey = { key: await chaveDaSenha(a, salt), salt, iter: PBKDF2_ITER };
      lastMod = 0; dirty = true; await salvar(); toast('Quadro protegido por senha.'); ok(true);
    };
  });
}
async function f4senhaConfere(s) {
  if (!fileKey) return false;
  const k2 = await chaveDaSenha(s, fileKey.salt, fileKey.iter), iv = new Uint8Array(12), msg = te.encode('teste-de-senha');
  const [a, b] = await Promise.all([crypto.subtle.encrypt({ name: 'AES-GCM', iv }, fileKey.key, msg), crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k2, msg)]);
  return b64.enc(new Uint8Array(a)) === b64.enc(new Uint8Array(b));
}
function f4info() {
  return { ferramenta: 'Quadro do Time', versao: TOOL_VERSION, arquivo: db?.demo ? 'exemplo em memória' : fileHandle?.name, pastaComum: rootMem ? `${rootMem.name}/times/${db?.team.slug || '?'}/` : '', voce: f4eu() ? f4writer() : '',
    local: f4compartilhado() ? ['Chaves do time (no navegador, não exportáveis)', 'Nenhum arquivo de dados local: o quadro fica na pasta do time, cifrado com a chave do time'] : ['Arquivo do quadro (cifrado com a senha), numa pasta só sua (de preferência no seu OneDrive)', 'Chaves do time (no navegador, não exportáveis)'],
    comum: [`quadro/${f4eu() ? f4arquivo() : '<você>.json'}: ${f4compartilhado() ? 'seu arquivo de dados do quadro, cifrado com a chave do time' : 'seu retrato do quadro'} (só você grava)`, `quadro/${F4BASE}: base do quadro criada pela Central (só a Central grava)`, 'Arquivos das outras pessoas do time, unidos a cada 20 s', 'status.json e metricas.json para a Central', 'Leitura de postits/: post-its deixados para o time pelo Hub', `postits/vistos/${f4eu() ? f4arquivo() : '<você>.json'}: quais post-its você já viu (só você grava)`] };
}
// Ganchos nas funções do Quadro (as chamadas resolvem o nome na hora, então a troca vale para todos).
{
  const render0 = render; render = function () { const r = render0.apply(this, arguments); if (db) f4BotaoOnde('ondeEstou', f4info); return r; };
  const salvar0 = salvar; salvar = async function () { const r = await salvar0.apply(this, arguments); if (saveState === 'saved') f4agendar(); return r; };
  const apos0 = aposAbrir; aposAbrir = async function () {
    const r = await apos0.apply(this, arguments);
    if (db && !db.demo) {
      if (f4compartilhado()) await f4saiDaBase();
      else if (!fileKey) await f4exigirSenha();
      else setTimeout(() => f4LembreteSenha('quadro:' + (db.team.slug || fileHandle?.name), f4senhaConfere), 1500);
      if (keysInfo?.atual && db.team.slug && (await obterPasta()) && !f4eu()) await f4quemSou();
      f4sincronizar();
    }
    return r;
  };
}

/* ---------- Quadro 2.9 · quadro do time na pasta compartilhada, cifrado com a chave do time (ADR-0045) ----------
   times/<time>/quadro/quadro-do-time.json         base do quadro, criada pela Central ou pelo assistente (só eles gravam)
   times/<time>/quadro/<pessoa>-<computador>.json  arquivo de cada pessoa; no modo compartilhado é o próprio arquivo de dados
   Tudo em gestao-envelope/1 com a chave de integração do time (conteúdo quadro-contrib/1): ninguém precisa de senha
   pessoal e o time abre um único quadro, pronto. Continua valendo um escritor por arquivo (ADR-0007): cada um grava
   só o seu e a ferramenta une os demais a cada 20 s. Arquivos antigos com senha pessoal abrem como antes. */
const F4BASE = 'quadro-do-time.json';
const f4compartilhado = () => fileKey?.tipo === 'time';
// Chave que cifra: a mais nova do time (kid <time>-…), senão a do arquivo aberto, senão a última cadastrada.
function f4chaveDoTime(slug) {
  const l = keysInfo?.lista || [], doTime = l.filter(c => slug && (c.kid === slug || c.kid.startsWith(slug + '-')) && !c.kid.startsWith(slug + '-fin-'));
  return doTime.at(-1) || l.find(c => c.kid === fileKey?.kid) || keysInfo?.atual || null;
}
{
  const ser0 = serializar; serializar = async function (d) {
    if (!f4compartilhado()) return ser0.apply(this, arguments);
    keysInfo = await chaveiro(); const k = f4chaveDoTime(d.team.slug);
    if (!k) throw new Error('A chave do time não está neste navegador: cadastre a chave (GK1…) em Central › Chaves.');
    const chaveRev = 'quadro.contribRev.' + d.team.slug, rev = Math.max(+localStorage.getItem(chaveRev) || 0, fileKey.rev || 0) + 1;
    fileKey.rev = rev; fileKey.kid = k.kid; try { localStorage.setItem(chaveRev, String(rev)); } catch {}
    const payload = { schema: CONTRIB, revision: rev, generatedAt: agoraComFuso(), source: { team: d.team.slug, writer: f4writer(), tool: TOOL, toolVersion: TOOL_VERSION }, db: structuredClone(d) };
    return JSON.stringify({ ...(await cifrar(payload, { key: k.key, kid: k.kid, team: d.team.slug })), writer: payload.source.writer });   // dono em claro, fora do AAD (contratos)
  };
  const des0 = desserializar; desserializar = async function (texto) {
    let o = null; try { o = JSON.parse(texto); } catch {}
    if (o?.schema !== ENVELOPE) return des0.apply(this, arguments);
    keysInfo = await chaveiro();
    if (!keysInfo.mapa.has(o.kid)) throw new Error(`Este quadro é cifrado com a chave do time (${o.kid}), que ainda não está neste navegador. Cadastre a chave (GK1…) que o gestor enviou.`);
    const p = await decifrar(o, keysInfo.mapa);
    if (p.schema !== CONTRIB || p.source?.team !== o.team) throw new Error('Arquivo não é um quadro do time (quadro-contrib/1)');
    const d = normalizeDb(p.db);
    fileKey = { tipo: 'time', kid: o.kid, rev: p.revision, writer: String(p.source.writer || '') };
    // Quem é você neste quadro vem do próprio arquivo (pessoa~computador): o nome do arquivo continua o mesmo.
    const [eu] = fileKey.writer.split('~');
    if (eu && eu !== 'central' && d.team.slug) { try { if (!localStorage.getItem('quadro.eu.' + d.team.slug)) localStorage.setItem('quadro.eu.' + d.team.slug, eu); } catch {} }
    return d;
  };
}
// Abriu a base (ou o arquivo de outra pessoa): passa a gravar no próprio arquivo, nunca no dos outros.
async function f4saiDaBase() {
  if (!fileHandle || fileHandle.name === f4arquivo() && f4eu()) return;
  if (!f4eu() && !(await f4quemSou())) { toast('Sem escolher quem você é, o quadro abre só para leitura.'); return; }
  if (fileHandle.name === f4arquivo()) return;
  const dir = await f4pasta(true); if (!dir) { toast('Conecte a pasta compartilhada para gravar o seu arquivo do quadro.'); return; }
  fileHandle = await dir.getFileHandle(f4arquivo(), { create: true }); lastMod = 0; dirty = true;
  await salvar(); await IDB.set('dataFile', fileHandle);
  toast(`Você grava em times/${db.team.slug}/quadro/${f4arquivo()}.`);
}
function f4pedirChave() {
  return new Promise(ok => {
    const d = f4Abrir(`<div class="h">Chave do time</div><div class="b"><p style="margin-top:0">O quadro do time é cifrado com a chave de integração do time. Cole a chave (GK1…) que o gestor enviou por mensagem direta ou e-mail. Ela fica guardada neste navegador, sem poder ser copiada de volta.</p>
      <input type="password" id="f4ch" placeholder="GK1.…" autocomplete="off" spellcheck="false" style="width:100%"><p id="f4chm" style="color:#c4574f;font-size:12px"></p></div>
      <div class="f"><button id="f4chNo">Cancelar</button><button class="p" id="f4chOk">Cadastrar</button></div>`);
    d.querySelector('#f4chNo').onclick = () => { d.close(); ok(false); };
    d.querySelector('#f4chOk').onclick = async () => { try { await colarChave(d.querySelector('#f4ch').value); keysInfo = await chaveiro(); d.close(); ok(true); } catch (e) { d.querySelector('#f4chm').textContent = e.message; } };
  });
}
async function f4escolherTime(root) {
  const nomes = [];
  try { for await (const [n, h] of (await root.getDirectoryHandle('times')).entries()) { if (h.kind !== 'directory') continue; try { await h.getDirectoryHandle('quadro'); nomes.push(n); } catch {} } } catch {}
  if (!nomes.length) throw new Error('Ainda não há quadro de time nesta pasta. Peça ao gestor para criá-lo na Central (time › Integração › Criar o quadro do time na pasta).');
  if (nomes.length === 1) return nomes[0];
  return new Promise(ok => {
    const d = f4Abrir(`<div class="h">Qual time?</div><div class="b"><p style="margin-top:0">Esta pasta tem o quadro de mais de um time.</p><select id="f4tm" style="width:100%;padding:7px">${nomes.sort().map(n => `<option>${esc(n)}</option>`).join('')}</select></div>
      <div class="f"><button id="f4tmNo">Cancelar</button><button class="p" id="f4tmOk">Abrir</button></div>`);
    d.querySelector('#f4tmNo').onclick = () => { d.close(); ok(null); };
    d.querySelector('#f4tmOk').onclick = () => { const v = d.querySelector('#f4tm').value; d.close(); ok(v); };
  });
}
// Lê a base e os arquivos de cada pessoa em times/<time>/quadro/ e une tudo.
async function f4lerQuadroDoTime(dir, slug) {
  let out = null, semChave = '';
  for await (const [n, h] of dir.entries()) {
    if (h.kind !== 'file' || !n.endsWith('.json') || n.startsWith('.')) continue;
    try {
      const env = JSON.parse(await (await h.getFile()).text()); if (env.team !== slug) continue;
      const p = await decifrar(env, keysInfo.mapa); if (p.schema !== CONTRIB || p.source?.team !== slug) continue;
      const d = normalizeDb(p.db); out = out ? mergeDb(out, d) : d;
    } catch (e) { if (/não cadastrada/.test(e.message)) semChave = e.message; }
  }
  if (!out && semChave) throw new Error(`O quadro do time está cifrado com outra chave (${semChave}). Cadastre a chave atual do time.`);
  return out;
}
async function f4abrirCompartilhado() {
  if (!window.showDirectoryPicker && !rootMem) throw new Error('Este navegador não abre pastas. Use Edge ou Chrome.');
  keysInfo = await chaveiro();
  if (!keysInfo.atual && !(await f4pedirChave())) return;
  const root = (await obterPasta({ pedir: true })) || (await conectarPasta());
  const slug = PRESET?.team.slug || (await f4escolherTime(root)); if (!slug) return;
  let dir = null;
  try { dir = await (await (await root.getDirectoryHandle('times', { create: !!PRESET })).getDirectoryHandle(slug, { create: !!PRESET })).getDirectoryHandle('quadro', { create: !!PRESET }); } catch {}
  if (!dir) throw new Error(`Não achei times/${slug}/quadro/ na pasta ${root.name}. Confira se é a pasta compartilhada (Gestao-Compartilhado).`);
  let d = await f4lerQuadroDoTime(dir, slug);
  if (!d) {   // ninguém criou ainda: o HTML preparado pela Central cria o quadro com o nome e as pessoas do preset
    if (!PRESET) throw new Error(`Ainda não há quadro do time em times/${slug}/quadro/. Peça ao gestor para criá-lo na Central.`);
    db = newDb(PRESET.team.name, slug); if (PRESET.team.contact) db.team.contact = PRESET.team.contact;
    for (const x of PRESET.people) try { novaPessoa(x.name, x.role); } catch {}
    d = db;
  }
  db = d; if (!db.team.slug) db.team.slug = slug;
  if (!f4eu() && !(await f4quemSou())) { db = null; renderWelcome(); return toast('Escolha quem você é para abrir o quadro do time.'); }
  fileKey = { tipo: 'time', kid: f4chaveDoTime(slug)?.kid || keysInfo.atual.kid, rev: 0 };
  fileHandle = await dir.getFileHandle(f4arquivo(), { create: true }); lastMod = 0; dirty = true; saveState = 'pending';
  await salvar(); if (saveState === 'error') throw new Error('Não consegui gravar o seu arquivo do quadro: ' + saveErr);
  await IDB.set('dataFile', fileHandle);
  await aposAbrir();
  toast(`Quadro do time ${db.team.name} aberto da pasta compartilhada, cifrado com a chave do time.`);
}
// Arquivo só da pessoa (com senha) → quadro do time na pasta compartilhada. O arquivo antigo fica como está (cópia).
async function f4paraCompartilhado() {
  if (!db || db.demo) return;
  if (!db.team.slug) return toast('Defina o identificador do time antes (Central › Identificador do time).');
  keysInfo = await chaveiro();
  if (!keysInfo.atual && !(await f4pedirChave())) return;
  if (!(await obterPasta({ pedir: true }))) await conectarPasta();
  if (!f4eu() && !(await f4quemSou())) return;
  if (!confirm(`Passar este quadro para a pasta do time (times/${db.team.slug}/quadro/), cifrado com a chave do time? Daqui em diante você grava ${f4arquivo()} lá e não precisa mais da senha pessoal. O arquivo ${fileHandle?.name || ''} fica como está, como cópia.`)) return;
  const dir = await f4pasta(true); if (!dir) return toast('Não consegui abrir a pasta do time.');
  const outros = await f4lerQuadroDoTime(dir, db.team.slug); if (outros) db = mergeDb(db, outros);
  fileKey = { tipo: 'time', kid: f4chaveDoTime(db.team.slug)?.kid || keysInfo.atual.kid, rev: 0 };
  fileHandle = await dir.getFileHandle(f4arquivo(), { create: true }); lastMod = 0; dirty = true;
  await salvar(); if (saveState === 'error') throw new Error(saveErr);
  await IDB.set('dataFile', fileHandle); render();
  toast('Pronto: o quadro agora fica na pasta do time, cifrado com a chave do time.');
}

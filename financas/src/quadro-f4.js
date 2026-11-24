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
  const assinatura = () => JSON.stringify([db.cards, db.epics, db.sprints, db.people, db.settings, db.team]);
  for await (const [n, h] of dir.entries()) {
    if (h.kind !== 'file' || !n.endsWith('.json') || n.startsWith('.') || n === f4arquivo()) continue;
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
  const k = keysInfo?.atual; if (!k || !f4eu()) return;
  const dir = await f4pasta(true); if (!dir) return;
  const chaveRev = 'quadro.contribRev.' + db.team.slug, rev = (+localStorage.getItem(chaveRev) || 0) + 1;
  const snap = structuredClone(db);
  const payload = { schema: CONTRIB, revision: rev, generatedAt: agoraComFuso(), source: { team: db.team.slug, writer: f4writer(), tool: TOOL, toolVersion: TOOL_VERSION }, db: snap };
  const env = await cifrar(payload, { key: k.key, kid: k.kid, team: db.team.slug });
  const texto = JSON.stringify(env), fh = await dir.getFileHandle(f4arquivo(), { create: true });
  const w = await fh.createWritable(); await w.write(texto); await w.close();       // troca atômica no close()
  if ((await (await fh.getFile()).text()) !== texto) throw new Error('gravação não confirmada');
  try { localStorage.setItem(chaveRev, String(rev)); } catch {}
  const base = f4arquivo().replace(/\.json$/, ''), copia = new RegExp('^' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:-[^\\\\/]+?| ?\\(\\d+\\))\\.json$');
  for await (const [n] of dir.entries()) if (copia.test(n)) { try { await dir.removeEntry(n); } catch {} }   // cópias de conflito do próprio arquivo: já foram unidas em f4ler
  f4ultima.publicado = new Date().toISOString();
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
    local: ['Arquivo do quadro (cifrado com a senha), numa pasta só sua (de preferência no seu OneDrive)', 'Chaves do time (no navegador, não exportáveis)'],
    comum: [`quadro/${f4eu() ? f4arquivo() : '<você>.json'}: seu retrato do quadro (só você grava)`, 'Arquivos das outras pessoas do time, unidos a cada 20 s', 'status.json e metricas.json para a Central', 'Leitura de postits/: post-its deixados para o time pelo Hub', `postits/vistos/${f4eu() ? f4arquivo() : '<você>.json'}: quais post-its você já viu (só você grava)`] };
}
// Ganchos nas funções do Quadro (as chamadas resolvem o nome na hora, então a troca vale para todos).
{
  const render0 = render; render = function () { const r = render0.apply(this, arguments); if (db) f4BotaoOnde('ondeEstou', f4info); return r; };
  const salvar0 = salvar; salvar = async function () { const r = await salvar0.apply(this, arguments); if (saveState === 'saved') f4agendar(); return r; };
  const apos0 = aposAbrir; aposAbrir = async function () {
    const r = await apos0.apply(this, arguments);
    if (db && !db.demo) {
      if (!fileKey) await f4exigirSenha();
      else setTimeout(() => f4LembreteSenha('quadro:' + (db.team.slug || fileHandle?.name), f4senhaConfere), 1500);
      if (keysInfo?.atual && db.team.slug && (await obterPasta()) && !f4eu()) await f4quemSou();
      f4sincronizar();
    }
    return r;
  };
}

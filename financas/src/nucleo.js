/* ======================================================================
   nucleo-sync 1.0 · bloco comum das ferramentas da solução
   (finanças do grupo, finanças do time, assistente inicial)
   - criptografia: arquivo local com senha (PBKDF2 600k + AES-256-GCM)
     e envelope gestao-envelope/1 com chave aleatória por time
   - pasta sincronizada (OneDrive/SharePoint): escrita segura, um dono por
     arquivo, revisão monotônica, confere-antes-de-gravar, cópias de conflito
   - aviso de senha e cofre, lembrete de teste da senha, "Onde estou?"
   Este arquivo é injetado no HTML pelo build (tools/build_financas.py).
   ====================================================================== */
const NUCLEO_VERSION = '1.0.0';
const te = new TextEncoder(), td = new TextDecoder();
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = (p = '') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clamp = (s, n) => String(s ?? '').slice(0, n);
const slugify = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

const b64 = {
  enc: u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); },
  dec: s => Uint8Array.from(atob(s), c => c.charCodeAt(0)),
  urlDec: s => b64.dec(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)),
  urlEnc: u8 => b64.enc(u8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
};

/* ---------------------------- dinheiro e datas ---------------------------- */
// Valores sempre em centavos inteiros.
const fmtMoeda = (c, moeda = 'BRL', dec = false) => ((c || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: moeda, minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 });
const fmtCurto = (c) => { const v = (c || 0) / 100, a = Math.abs(v); return a >= 1e6 ? (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi' : a >= 1e3 ? (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' mil' : v.toLocaleString('pt-BR', { maximumFractionDigits: 0 }); };
// Aceita "12.400", "12.400,50", "12400.5", "12,4 mil", "1,2 mi", "R$ 3.000", "15k"
function parseValor(txt) {
  let s = String(txt ?? '').trim().toLowerCase().replace(/r\$\s*/g, '').replace(/\s+/g, ' ');
  if (!s) return null;
  let mult = 1;
  const m = /^(-?[\d.,]+)\s*(k|mil|mi|milh[oõ]es|milh[aã]o)?$/.exec(s);
  if (!m) return null;
  let n = m[1];
  if (m[2]) mult = m[2] === 'k' || m[2] === 'mil' ? 1e3 : 1e6;
  if (n.includes(',')) n = n.replace(/\./g, '').replace(',', '.');
  else if (/^\-?\d{1,3}(\.\d{3})+$/.test(n)) n = n.replace(/\./g, '');
  const v = Number(n);
  return Number.isFinite(v) ? Math.round(v * mult * 100) : null;
}
const pad2 = n => String(n).padStart(2, '0');
const hojeISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };
const mesAtual = () => hojeISO().slice(0, 7);
const mesesDoAno = ano => Array.from({ length: 12 }, (_, i) => `${ano}-${pad2(i + 1)}`);
const NOMES_MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const nomeMes = m => NOMES_MES[+m.slice(5, 7) - 1] + (m.slice(0, 4) !== String(new Date().getFullYear()) ? '/' + m.slice(2, 4) : '');
const somaMeses = (m, k) => { const [a, b] = m.split('-').map(Number); const t = a * 12 + (b - 1) + k; return `${Math.floor(t / 12)}-${pad2(t % 12 + 1)}`; };
const fmtData = iso => iso ? new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).toLocaleDateString('pt-BR') : '';
const fmtDataHora = iso => iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
function isoComFuso(d = new Date()) {
  const o = -d.getTimezoneOffset(), s = o >= 0 ? '+' : '-', a = Math.abs(o);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}${s}${pad2(Math.floor(a / 60))}:${pad2(a % 60)}`;
}

/* ------------------------------ IndexedDB kv ------------------------------ */
const kv = (() => {
  let dbp = null;
  const open = () => dbp ??= new Promise((ok, err) => { const r = indexedDB.open('nucleo-sync', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => ok(r.result); r.onerror = () => err(r.error); });
  const tx = async (mode, fn) => { const db = await open(); return new Promise((ok, err) => { const t = db.transaction('kv', mode); const st = t.objectStore('kv'); const r = fn(st); t.oncomplete = () => ok(r?.result); t.onerror = () => err(t.error); }); };
  return { get: k => tx('readonly', s => s.get(k)).catch(() => undefined), set: (k, v) => tx('readwrite', s => s.put(v, k)).catch(() => {}), del: k => tx('readwrite', s => s.delete(k)).catch(() => {}) };
})();

/* ---------------------- identidade do computador (dispositivo) ---------------------- */
// Identificador aleatório e curto, guardado no navegador. Junto com a pessoa forma o "dono"
// de um arquivo comum: ana-k3f9. Nunca usa o nome real do computador.
function dispositivo() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem('nucleo.dispositivo') || 'null'); } catch {}
  if (!d?.id) { d = { id: Array.from(crypto.getRandomValues(new Uint8Array(3)), x => x.toString(36).padStart(2, '0')).join('').slice(0, 5), nome: '' }; try { localStorage.setItem('nucleo.dispositivo', JSON.stringify(d)); } catch {} }
  return d;
}
function nomearDispositivo(nome) { const d = dispositivo(); d.nome = clamp(nome, 40); try { localStorage.setItem('nucleo.dispositivo', JSON.stringify(d)); } catch {} }

/* ---------------------- relógio lógico híbrido (HLC) ---------------------- */
// "<ms>.<contador>": cresce sempre, mesmo se o relógio do computador voltar.
function hlcAgora(visto) {
  let ult = { t: 0, c: 0 };
  try { ult = JSON.parse(localStorage.getItem('nucleo.hlc') || '{"t":0,"c":0}'); } catch {}
  const vis = hlcLer(visto);
  const fisico = Date.now();
  const t = Math.max(fisico, ult.t, vis.t);
  const c = t === ult.t && t === vis.t ? Math.max(ult.c, vis.c) + 1 : t === ult.t ? ult.c + 1 : t === vis.t ? vis.c + 1 : 0;
  try { localStorage.setItem('nucleo.hlc', JSON.stringify({ t, c })); } catch {}
  return `${t}.${c}`;
}
const hlcLer = h => { const m = /^(\d+)\.(\d+)$/.exec(String(h || '')); return m ? { t: +m[1], c: +m[2] } : { t: 0, c: 0 }; };
const hlcCmp = (a, b) => { const x = hlcLer(a), y = hlcLer(b); return x.t - y.t || x.c - y.c; };

/* ------------------------ arquivo local cifrado com senha ------------------------ */
const LOCAL_ENC = 'gestao-local-cifrado/1';
const PBKDF2_ITER = 600000;
async function chaveDaSenha(senha, salt, iter = PBKDF2_ITER) {
  const base = await crypto.subtle.importKey('raw', te.encode(senha), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
// ctx = { key, salt, iter, app }
async function cifrarLocal(obj, ctx) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: te.encode(LOCAL_ENC + '|' + ctx.app) }, ctx.key, te.encode(JSON.stringify(obj))));
  return JSON.stringify({ schema: LOCAL_ENC, app: ctx.app, kdf: { name: 'PBKDF2', hash: 'SHA-256', iter: ctx.iter, salt: b64.enc(ctx.salt) }, alg: 'A256GCM', iv: b64.enc(iv), ct: b64.enc(ct) });
}
function lerCabecalhoLocal(texto) {
  let o; try { o = JSON.parse(texto); } catch { throw new Error('O arquivo não é JSON (pode estar incompleto).'); }
  if (o?.schema !== LOCAL_ENC) throw new Error('Este arquivo não é um arquivo cifrado da solução.');
  return o;
}
async function decifrarLocal(texto, senha) {
  const o = lerCabecalhoLocal(texto);
  const salt = b64.dec(o.kdf.salt), iter = o.kdf.iter || PBKDF2_ITER;
  const key = await chaveDaSenha(senha, salt, iter);
  let pt;
  try { pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64.dec(o.iv), additionalData: te.encode(LOCAL_ENC + '|' + o.app) }, key, b64.dec(o.ct)); }
  catch { const e = new Error('Senha incorreta ou arquivo alterado.'); e.code = 'SENHA'; throw e; }
  return { dados: JSON.parse(td.decode(pt)), ctx: { key, salt, iter, app: o.app } };
}
async function novoCtx(senha, app) { const salt = crypto.getRandomValues(new Uint8Array(16)); return { key: await chaveDaSenha(senha, salt), salt, iter: PBKDF2_ITER, app }; }
// Confere uma senha digitada contra o contexto aberto, sem reabrir o arquivo.
async function senhaConfere(senha, ctx) {
  const k2 = await chaveDaSenha(senha, ctx.salt, ctx.iter), iv = new Uint8Array(12), msg = te.encode('teste-de-senha');
  const [a, b] = await Promise.all([crypto.subtle.encrypt({ name: 'AES-GCM', iv }, ctx.key, msg), crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k2, msg)]);
  return b64.enc(new Uint8Array(a)) === b64.enc(new Uint8Array(b));
}
function forcaSenha(s) {
  const tipos = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(s)).length;
  if (s.length < 12) return { ok: false, msg: 'Use pelo menos 12 caracteres.' };
  if (tipos < 2 && s.length < 20) return { ok: false, msg: 'Misture letras, números ou símbolos (ou use uma frase com 20+ caracteres).' };
  return { ok: true, msg: s.length >= 16 ? 'Senha forte.' : 'Senha aceitável.' };
}
function gerarSenhaForte() {
  const pal = 'acima,brisa,cacto,dente,euro,folha,girafa,horta,ilha,janela,kiwi,limao,manga,nuvem,ostra,pedra,quadro,rio,sapo,tigre,uva,vela,xale,zebra,cobre,trilho,farol,lontra,museu,pipoca'.split(',');
  const r = crypto.getRandomValues(new Uint32Array(5));
  return [0, 1, 2, 3].map(i => pal[r[i] % pal.length]).join('-') + '-' + (r[4] % 900 + 100);
}

/* --------------------- envelope gestao-envelope/1 (chave do time) --------------------- */
const ENVELOPE = 'gestao-envelope/1';
function lerChaveTexto(txt) {
  const m = /^GK1\.([a-z0-9]+(?:-[a-z0-9]+)*)\.([A-Za-z0-9_-]{43})$/.exec(String(txt).trim());
  if (!m) throw new Error('Chave inválida: formato esperado GK1.<id>.<43 caracteres>');
  const raw = b64.urlDec(m[2]);
  if (raw.length !== 32) throw new Error('Chave inválida: tamanho');
  return { kid: m[1], raw };
}
const importarChave = raw => crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
const gerarChaveTexto = kid => `GK1.${kid}.${b64.urlEnc(crypto.getRandomValues(new Uint8Array(32)))}`;
const aadDe = h => te.encode([ENVELOPE, h.content, h.team, h.kid, h.revision, h.generatedAt].join('|'));
// O cabeçalho ganha "writer" em claro (dono do arquivo). Ele não entra no AAD, para manter
// compatibilidade com o contrato; depois de decifrar, confere com payload.source.writer.
async function cifrarEnv(payload, { key, kid, team }) {
  const h = { schema: ENVELOPE, content: payload.schema, team, kid, revision: payload.revision, generatedAt: payload.generatedAt, alg: 'A256GCM' };
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aadDe(h) }, key, te.encode(JSON.stringify(payload))));
  return { ...h, writer: payload.source?.writer || undefined, iv: b64.enc(iv), ct: b64.enc(ct) };
}
async function decifrarEnv(env, chaves) {
  if (env?.schema !== ENVELOPE) throw new Error('Não é um envelope gestao-envelope/1');
  if (env.alg !== 'A256GCM') throw new Error('Algoritmo não suportado: ' + env.alg);
  const key = chaves.get(env.kid);
  if (!key) throw new Error(`Chave "${env.kid}" não cadastrada`);
  let pt;
  try { pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64.dec(env.iv), additionalData: aadDe(env) }, key, b64.dec(env.ct)); }
  catch { throw new Error('Falha ao decifrar: chave errada ou arquivo alterado/incompleto'); }
  const p = JSON.parse(td.decode(pt));
  if (p.schema !== env.content || p.revision !== env.revision || p.generatedAt !== env.generatedAt) throw new Error('Cabeçalho do envelope não confere com o conteúdo');
  if (env.writer && p.source?.writer !== env.writer) throw new Error('Dono no cabeçalho não confere com o conteúdo');
  return p;
}

/* ------------------------- pastas e arquivos (File System Access) ------------------------- */
const temFS = () => typeof window.showDirectoryPicker === 'function';
async function escolherPasta(id) { return window.showDirectoryPicker({ id, mode: 'readwrite' }); }
async function permissao(h, pedir = true) {
  if (!h?.queryPermission) return true;
  const o = { mode: 'readwrite' };
  if (await h.queryPermission(o) === 'granted') return true;
  return pedir ? (await h.requestPermission(o)) === 'granted' : false;
}
async function subpasta(raiz, caminho, criar = false) {
  let d = raiz;
  for (const p of caminho.filter(Boolean)) { try { d = await d.getDirectoryHandle(p, { create: criar }); } catch (e) { if (!criar && e.name === 'NotFoundError') return null; throw e; } }
  return d;
}
async function lerTexto(dir, nome) {
  try { const f = await (await dir.getFileHandle(nome)).getFile(); return await f.text(); }
  catch (e) { if (e.name === 'NotFoundError' || e.name === 'TypeMismatchError') return null; throw e; }
}
async function existe(dir, nome) { try { await dir.getFileHandle(nome); return true; } catch { try { await dir.getDirectoryHandle(nome); return true; } catch { return false; } } }
// Escrita atômica: createWritable grava num arquivo temporário e troca na hora do close().
// Depois relê e confere o conteúdo, para nunca deixar um arquivo pela metade sem perceber.
async function gravarSeguro(dir, nome, texto) {
  const fh = await dir.getFileHandle(nome, { create: true });
  const w = await fh.createWritable({ keepExistingData: false });
  try { await w.write(texto); await w.close(); } catch (e) { try { await w.abort(); } catch {} throw e; }
  const lido = await (await fh.getFile()).text();
  if (lido !== texto) throw new Error(`A gravação de ${nome} não pôde ser confirmada. Tente de novo.`);
}
// Arquivo local: guarda as N últimas versões em backup/ (no máximo uma a cada 30 min).
async function gravarLocal(dir, nome, texto, manter = 5, intervaloMin = 30) {
  const atual = await lerTexto(dir, nome);
  if (atual && atual !== texto) {
    const bk = await subpasta(dir, ['backup'], true);
    const base = nome.replace(/\.json$/, '');
    const nomes = []; for await (const [n] of bk.entries()) if (n.startsWith(base + '.') && n.endsWith('.json')) nomes.push(n);
    nomes.sort();
    const ult = nomes.at(-1), ultTxt = ult ? await lerTexto(bk, ult) : null;
    const mc = ult && /\.(\d{8}T\d{6})\.json$/.exec(ult), ultEm = mc ? Date.parse(mc[1].replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6Z')) : 0;
    if (ultTxt !== atual && Date.now() - ultEm > intervaloMin * 60000) {
      const carimbo = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
      await gravarSeguro(bk, `${base}.${carimbo}.json`, atual); nomes.push(`${base}.${carimbo}.json`);
    }
    for (const n of nomes.slice(0, Math.max(0, nomes.length - manter))) { try { await bk.removeEntry(n); } catch {} }
  }
  await gravarSeguro(dir, nome, texto);
}

/* -------------------- cópias de conflito do OneDrive / SharePoint -------------------- */
// O cliente do OneDrive não sobrescreve quando dois computadores gravam o mesmo arquivo:
// renomeia um deles ("plano-NOTEBOOK01.json", "plano-NOTEBOOK01-2.json", "plano (1).json").
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const reCopia = (base, ext = '.json') => new RegExp('^' + escRe(base) + '(?:-[^\\\\/]+?| ?\\(\\d+\\))?' + escRe(ext) + '$', 'i');
async function arquivosDoNome(dir, base, ext = '.json') {
  const re = reCopia(base, ext), out = [];
  for await (const [n, h] of dir.entries()) if (h.kind === 'file' && re.test(n)) out.push({ nome: n, principal: n === base + ext, handle: h });
  return out.sort((a, b) => (b.principal - a.principal) || a.nome.localeCompare(b.nome));
}
// Lê o arquivo e todas as cópias, decifra e escolhe o mais novo (maior revisão; empate: HLC).
// Arquivos que não decifram, de outro time ou de outro conteúdo são ignorados, sem derrubar nada.
async function lerEnvelopes(dir, base, chaves, { team, content }) {
  const res = { melhor: null, validos: [], invalidos: [], copias: [], conflito: false };
  if (!dir) return res;
  for (const a of await arquivosDoNome(dir, base)) {
    let texto = null;
    try { texto = await (await a.handle.getFile()).text(); } catch {}
    let env = null, p = null, erro = null;
    try { env = JSON.parse(texto); p = await decifrarEnv(env, chaves); } catch (e) { erro = e.message; }
    if (p && (env.team !== team || p.source?.team !== team || p.schema !== content)) { if (!a.principal) continue; erro = 'Arquivo de outro time ou de outro tipo'; p = null; }
    const item = { nome: a.nome, principal: a.principal, env, payload: p, erro };
    if (!a.principal) res.copias.push(item);
    if (p) res.validos.push(item); else res.invalidos.push(item);
  }
  res.validos.sort((x, y) => (y.payload.revision - x.payload.revision) || hlcCmp(y.payload.hlc, x.payload.hlc));
  res.melhor = res.validos[0] || null;
  res.conflito = res.copias.length > 0;
  return res;
}
// Publica um arquivo de dono único (ex.: plano.json do time, diretriz-<time>.json do grupo).
// 1) relê tudo (inclusive cópias); 2) recusa se o dono é outra pessoa ou outro computador,
// a menos que o usuário assuma; 3) revisão = maior revisão vista + 1; 4) grava atômico e confere;
// 5) apaga cópias de conflito que este mesmo dono pode reescrever (o retrato novo as substitui).
async function publicarUnico({ dir, base, montar, chave, team, writer, assumir = false, ultimaRevisao = 0 }) {
  const lido = await lerEnvelopes(dir, base, new Map([[chave.kid, chave.key]]), { team, content: montar.schema });
  const dono = lido.melhor?.payload.source?.writer;
  if (dono && dono !== writer && !assumir) {
    const [pd] = dono.split('~'), [pw] = writer.split('~');
    const e = new Error(pd === pw ? `Este arquivo foi publicado por você em outro computador (${dono}).` : `Este arquivo pertence a ${dono}.`);
    e.code = pd === pw ? 'DISPOSITIVO' : 'DONO'; e.dono = dono; throw e;
  }
  const maxRev = Math.max(ultimaRevisao, ...lido.validos.map(v => v.payload.revision), ...lido.invalidos.map(v => +v.env?.revision || 0), 0);
  const payload = montar.payload({ revision: maxRev + 1, generatedAt: isoComFuso(), hlc: hlcAgora(lido.melhor?.payload.hlc) });
  payload.source = { ...(payload.source || {}), team, writer };
  const env = await cifrarEnv(payload, { key: chave.key, kid: chave.kid, team });
  const texto = JSON.stringify(env, null, 1);
  await gravarSeguro(dir, base + '.json', texto);
  const conf = await decifrarEnv(JSON.parse(await lerTexto(dir, base + '.json')), new Map([[chave.kid, chave.key]]));
  if (conf.revision !== payload.revision) throw new Error('Outro computador gravou ao mesmo tempo. Leia a pasta e publique de novo.');
  const removidas = [];
  for (const c of lido.copias) {
    const cd = c.payload?.source?.writer;
    if (cd === writer || (assumir && c.payload && c.payload.revision <= payload.revision) || (!c.payload && c.erro && !c.env?.ct)) {
      try { await dir.removeEntry(c.nome); removidas.push(c.nome); } catch {}
    }
  }
  return { revision: payload.revision, generatedAt: payload.generatedAt, removidas, conflitos: lido.copias.length, payload };
}
// Aviso de "aberto em outro computador": arquivo pequeno renovado a cada minuto.
// É só aviso (o atraso do OneDrive torna trava pouco confiável). Só ids e horário, sem dados.
async function marcarAberto(dir, writer, ferramenta) {
  if (!dir) return;
  try { await gravarSeguro(dir, `.aberto-${writer.replace('~', '-')}.json`, JSON.stringify({ writer, ferramenta, ate: Date.now() + 3 * 60000 })); } catch {}
}
async function abertosEmOutros(dir, writer) {
  const out = []; if (!dir) return out;
  try {
    for await (const [n, h] of dir.entries()) {
      if (h.kind !== 'file' || !/^\.aberto-.*\.json$/.test(n)) continue;
      try { const o = JSON.parse(await (await h.getFile()).text()); if (o.writer !== writer && o.ate > Date.now()) out.push(o); } catch {}
    }
  } catch {}
  return out;
}
async function desmarcarAberto(dir, writer) { try { await dir?.removeEntry(`.aberto-${writer.replace('~', '-')}.json`); } catch {} }

/* ------------------------------- interface comum ------------------------------- */
// Volta ao Hub da solução (hub.html, na mesma pasta). Se o hub já está aberto numa aba
// (ele se chama "gestao-hub"), só traz aquela aba para a frente, sem recarregar; senão abre o hub.
function voltarAoHub() {
  let w = null; try { w = window.open('', 'gestao-hub'); } catch {}
  if (!w) { location.href = 'hub.html'; return; }
  let vazia = false; try { vazia = w.location.href === 'about:blank'; } catch {}
  if (vazia) w.location.href = new URL('hub.html', location.href).href;
  try { w.focus(); } catch {}
}
function toast(msg, ms = 3400) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), ms); }
function dlg() { let d = $('#dlg'); if (!d) { d = document.createElement('dialog'); d.id = 'dlg'; document.body.appendChild(d); } return d; }
function modal(html, cls = '') { const d = dlg(); d.className = cls; d.innerHTML = html; if (!d.open) d.showModal(); return d; }
function fecharModal() { const d = dlg(); if (d.open) d.close(); }
// O evento "close" chega depois, numa tarefa separada: se outro diálogo já abriu no lugar,
// o evento antigo é ignorado (d.open de novo verdadeiro).
function aoFechar(d, fn) { d.addEventListener('close', function h() { if (d.open) return; d.removeEventListener('close', h); fn(); }); }
function perguntar(titulo, html, botoes = [['ok', 'OK', 'pri']], cls = '') {
  return new Promise(ok => {
    const d = modal(`<div class="mh"><h2>${esc(titulo)}</h2></div><div class="mb">${html}</div><div class="mf">${botoes.map(([v, t, c]) => `<button class="btn ${c || ''}" data-r="${v}">${esc(t)}</button>`).join('')}</div>`, cls);
    let feito = false;
    const fim = v => { feito = true; fecharModal(); ok(v); };
    aoFechar(d, () => { if (!feito) ok(null); });
    $$('[data-r]', d).forEach(b => b.onclick = () => { const v = b.dataset.r; if (v !== 'no' && d._validar && !d._validar(v)) return; fim(v); });
  });
}

// Aviso de senha e cofre. tipo: 'senha' (arquivo local) | 'chave' (chave de time) | 'html' (HTML gerado com chave)
const TEXTO_COFRE = {
  senha: '<b>Esta senha é a única forma de abrir seus dados.</b> Ela não fica guardada em lugar nenhum e ninguém, nem quem fez a ferramenta, consegue recuperá-la. Se você esquecer, os dados se perdem.<br><br><b>Guarde agora num cofre de senhas</b> (por exemplo, o gerenciador de senhas da empresa) antes de continuar.',
  chave: '<b>Esta chave abre os arquivos do time na pasta compartilhada.</b> Quem tiver a chave lê e publica em nome do time.<br><br><b>Guarde no cofre de senhas</b> e envie ao responsável do time só por mensagem direta no Teams ou por e-mail. <b>Nunca</b> coloque a chave na pasta compartilhada.',
  html: '<b>Este HTML leva a chave do time embutida.</b> Trate o arquivo como uma senha: envie só ao responsável do time, por mensagem direta ou e-mail, e nunca o deixe na pasta compartilhada.<br><br>Peça para a pessoa <b>guardar a chave no cofre de senhas</b> ao abrir a ferramenta pela primeira vez.'
};
async function avisoCofre(tipo = 'senha', extra = '') {
  const d = modal(`<div class="mh"><h2>Guarde no cofre antes de seguir</h2></div><div class="mb">
    <div class="cofre">${TEXTO_COFRE[tipo]}</div>${extra}
    <label class="row" style="margin-top:10px"><input type="checkbox" id="cofreOk"> <span>Já guardei no cofre de senhas</span></label></div>
    <div class="mf"><button class="btn" data-r="no">Voltar</button><button class="btn pri" data-r="ok" disabled id="cofreBtn">Continuar</button></div>`);
  $('#cofreOk', d).onchange = e => $('#cofreBtn', d).disabled = !e.target.checked;
  return new Promise(ok => { $$('[data-r]', d).forEach(b => b.onclick = () => { fecharModal(); ok(b.dataset.r === 'ok'); }); aoFechar(d, () => ok(false)); });
}
// Cria a senha do arquivo local: força mínima, confirmação, gerador e aviso do cofre.
function criarSenhaDlg(titulo = 'Crie a senha do arquivo') {
  return new Promise(ok => {
    const d = modal(`<div class="mh"><h2>${esc(titulo)}</h2></div><div class="mb">
      <p class="muted small" style="margin-top:0">Todos os dados ficam cifrados com esta senha. Não existe arquivo sem senha.</p>
      <label class="field"><span>Senha</span><input class="sin" type="password" id="s1" autocomplete="new-password"></label>
      <label class="field"><span>Repita a senha</span><input class="sin" type="password" id="s2" autocomplete="new-password"></label>
      <div class="row"><button class="btn sm" id="sGer">Gerar senha forte</button><span class="small muted" id="sMsg"></span></div>
      <div class="small code" id="sMostra" style="margin-top:8px"></div></div>
      <div class="mf"><button class="btn" id="sNo">Cancelar</button><button class="btn pri" id="sOk">Continuar</button></div>`);
    const msg = t => $('#sMsg', d).innerHTML = t;
    $('#s1', d).oninput = () => { const f = forcaSenha($('#s1', d).value); msg(`<span class="${f.ok ? 'okc' : 'latec'}">${f.msg}</span>`); };
    $('#sGer', d).onclick = () => { const s = gerarSenhaForte(); $('#s1', d).value = $('#s2', d).value = s; $('#sMostra', d).textContent = 'Senha gerada: ' + s; msg('<span class="okc">Copie para o cofre agora.</span>'); };
    let fim = false;
    $('#sNo', d).onclick = () => { fim = true; fecharModal(); ok(null); };
    $('#sOk', d).onclick = async () => {
      const a = $('#s1', d).value, b = $('#s2', d).value, f = forcaSenha(a);
      if (!f.ok) return msg(`<span class="latec">${f.msg}</span>`);
      if (a !== b) return msg('<span class="latec">As duas senhas não são iguais.</span>');
      fim = true; fecharModal();
      ok(await avisoCofre('senha') ? a : null);
    };
    aoFechar(d, () => { if (!fim) ok(null); });
  });
}
function pedirSenhaDlg(titulo, errou) {
  return new Promise(ok => {
    const d = modal(`<div class="mh"><h2>${esc(titulo)}</h2></div><div class="mb">${errou ? '<p class="latec small" style="margin-top:0">Senha incorreta.</p>' : ''}
      <label class="field"><span>Senha</span><input class="sin" type="password" id="pw" autocomplete="current-password"></label>
      <p class="small muted">Esqueceu? A senha está no seu cofre de senhas. Sem ela não há como abrir o arquivo.</p></div>
      <div class="mf"><button class="btn" data-r="no">Cancelar</button><button class="btn pri" data-r="ok">Abrir</button></div>`);
    let fim = false;
    const go = v => { fim = true; const s = $('#pw', d).value; fecharModal(); ok(v === 'ok' ? s : null); };
    $$('[data-r]', d).forEach(b => b.onclick = () => go(b.dataset.r));
    $('#pw', d).onkeydown = e => { if (e.key === 'Enter') go('ok'); };
    setTimeout(() => $('#pw', d)?.focus(), 30);
    aoFechar(d, () => { if (!fim) ok(null); });
  });
}
// Lembrete periódico: 30 dias após criar e depois a cada 90, pede a senha uma vez.
// seg = { cofreConfirmadoEm, ultimoTesteEm }. Retorna true se o estado mudou.
async function lembreteTesteSenha(seg, ctx) {
  const base = seg.ultimoTesteEm || seg.cofreConfirmadoEm; if (!base) return false;
  const dias = (Date.now() - new Date(base).getTime()) / 864e5, limite = seg.ultimoTesteEm ? 90 : 30;
  if (dias < limite) return false;
  for (let i = 0; i < 2; i++) {
    const s = await pedirSenhaDlg('Confirme que a senha está no cofre', i > 0);
    if (s == null) { toast('Lembrete adiado para amanhã.'); seg.ultimoTesteEm = new Date(Date.now() - (limite - 1) * 864e5).toISOString(); return true; }
    if (await senhaConfere(s, ctx)) { seg.ultimoTesteEm = new Date().toISOString(); toast('Senha confirmada. Próximo lembrete em 90 dias.'); return true; }
  }
  await perguntar('Senha não confere', '<div class="cofre">Você não lembrou a senha. Enquanto o arquivo ainda está aberto, <b>troque a senha</b> (Ajustes › Trocar senha) e guarde a nova no cofre.</div>');
  return false;
}

// "Onde estou?": qual ferramenta é esta, qual arquivo está aberto, o que é local e o que é comum.
const FERRAMENTAS = [
  ['Hub da solução', 'hub.html', 'Tela inicial do dia a dia: abre as outras ferramentas e deixa post-its para os times.'],
  ['Início da solução', 'inicio.html', 'Assistente: pergunta o uso, cria o primeiro arquivo e gera os HTMLs.'],
  ['Finanças do Grupo', 'financas_grupo.html', 'Consolidado: soma os planos publicados pelos times. Uso do gestor.'],
  ['Finanças do Time', 'financas_<time>.html', 'Dia a dia e futuro das finanças de um time. Publica o plano para o grupo.'],
  ['Central de Gestão', 'gestao_pessoal_vNN.html', 'Tarefas consolidado: gestão do gestor, iniciativas e times.'],
  ['Quadro do Time', 'quadro_<time>.html', 'Tarefas de um time: quadro, backlog, sprints e métricas.'],
  ['Mapa de Férias', 'ferias.html', 'Férias e ausências do time e do grupo, somadas em níveis até a liderança.']
];
function ondeEstou(info) {
  const lin = (k, v) => `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:6px 0"><span class="muted">${k}</span><b style="text-align:right">${v}</b></div>`;
  modal(`<div class="mh"><h2>Onde estou?</h2></div><div class="mb">
    ${lin('Ferramenta', esc(info.ferramenta) + ` <span class="faint small">${esc(info.versao)}</span>`)}
    ${lin('Arquivo aberto (local)', info.arquivo ? `<span class="code">${esc(info.arquivo)}</span>` : '<span class="faint">nenhum</span>')}
    ${lin('Pasta local', info.pastaLocal ? `<span class="code">${esc(info.pastaLocal)}</span>` : '<span class="faint">não escolhida</span>')}
    ${lin('Pasta sincronizada (OneDrive)', info.pastaComum ? `<span class="code">${esc(info.pastaComum)}</span>` : '<span class="faint">não ligada</span>')}
    ${lin('Você neste computador', `<span class="code">${esc(info.writer || '')}</span>`)}
    <div class="map" style="margin-top:14px">
      <div><h4>Fica só neste computador</h4>${info.local.map(x => '• ' + esc(x)).join('<br>')}</div>
      <div><h4>Vai para a pasta sincronizada</h4>${info.comum.map(x => '• ' + esc(x)).join('<br>')}</div>
    </div>
    <p class="lbl" style="margin-top:16px">Ferramentas da solução</p>
    ${FERRAMENTAS.map(([n, a, d]) => `<div class="al"><span class="dot ${n === info.ferramenta ? '' : 'late'}" style="${n === info.ferramenta ? '' : 'background:var(--faint)'}"></span><div><b>${esc(n)}</b> <span class="code faint">${esc(a)}</span>${n === info.ferramenta ? ' <span class="chip bv">você está aqui</span>' : ''}<br><span class="muted">${esc(d)}</span></div></div>`).join('')}
    <p class="small muted">Os HTMLs não guardam dados: podem ser trocados por versões novas. Os dados ficam nos arquivos cifrados.</p>
    </div><div class="mf"><button class="btn pri" onclick="fecharModal()">Fechar</button></div>`, 'wide');
}

/* ----------------------- HTML embutido e pré-configuração ----------------------- */
async function lerEmbutido(id) {
  const el = document.getElementById(id); if (!el) throw new Error('HTML embutido não encontrado: ' + id);
  const bytes = b64.dec(el.textContent.trim());
  const s = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(s).text();
}
// Troca o bloco entre /*<MARCA>*/ e /*FIM-<MARCA>*/ por um JSON (escapado para <script>).
function aplicarPreset(html, marca, obj) {
  const ini = `/*${marca}*/`, fim = `/*FIM-${marca}*/`, i = html.indexOf(ini), j = html.indexOf(fim);
  if (i < 0 || j < i) throw new Error('O HTML não tem o marcador de pré-configuração ' + marca);
  const json = JSON.stringify(obj).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return html.slice(0, i + ini.length) + json + html.slice(j);
}
function baixar(nome, texto, tipo = 'application/json') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([texto], { type: tipo })); a.download = nome; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}
// Nome sugerido da pasta comum (aceita o nome antigo durante a transição)
const PASTA_COMUM = 'Gestao-Compartilhado', PASTA_COMUM_ANTIGA = 'Gestao-Integracao';
async function validarPastaComum(raiz) {
  const tem = await existe(raiz, 'times') || await existe(raiz, 'grupo') || await existe(raiz, 'central');
  const nomeOk = [PASTA_COMUM, PASTA_COMUM_ANTIGA].includes(raiz.name);
  return { tem, nomeOk };
}
// Checagens indiretas de que a pasta "local" não está sincronizada (o navegador não mostra o caminho).
async function suspeitaDeSincronizada(dir) {
  const sinais = [];
  if ([PASTA_COMUM, PASTA_COMUM_ANTIGA].includes(dir.name)) sinais.push('tem o nome da pasta compartilhada');
  if (/onedrive|sharepoint/i.test(dir.name)) sinais.push('o nome lembra OneDrive/SharePoint');
  try { for await (const [n] of dir.entries()) { if (/^desktop\.ini$/i.test(n)) sinais.push('tem desktop.ini'); if (n === 'times' || n === 'grupo') sinais.push('tem a estrutura da pasta compartilhada'); } } catch {}
  return [...new Set(sinais)];
}

/* ---- Finanças 1.2: peças visuais comuns (cards de leitura, barras horizontais, curva acumulada) ---- */
// Card de leitura: rótulo, número, medidor (pct de 0 a 1+, marca opcional) e uma frase que interpreta.
function cardLeitura({ k, v, pct = null, marca = null, s = '', tag = '', hi = false }) {
  const p = pct == null ? '' : `<div class="m ${pct > 1 ? 'over' : ''}"><i style="width:${Math.max(0, Math.min(1, pct)) * 100}%"></i>${marca != null ? `<em style="left:${Math.max(0, Math.min(1, marca)) * 100}%"></em>` : ''}</div>`;
  return `<div class="ins ${hi ? 'hi' : ''}"><div class="k">${k}${tag}</div><div class="v">${v}</div>${p}${s ? `<div class="s">${s}</div>` : ''}</div>`;
}
// Barras horizontais: [{ nome, valor, ref (marca preta), cap (marca de teto), rotulo, attrs }]
function barrasH(itens, fmt) {
  if (!itens.length) return '<div class="empty">Nada para mostrar ainda.</div>';
  const max = Math.max(1, ...itens.map(x => Math.max(x.valor || 0, x.ref || 0, x.cap || 0)));
  const pc = v => (v / max * 100).toFixed(2) + '%';
  return `<div class="hb">${itens.map(x => `<div class="n" title="${esc(x.titulo || '')}">${x.nome}</div><div class="tr" title="${esc(x.titulo || '')}"><i style="width:${pc(x.valor || 0)}${x.cor ? ';background:' + x.cor : ''}"></i>${x.ref ? `<em style="left:${pc(x.ref)}"></em>` : ''}${x.cap ? `<em class="cap" style="left:${pc(x.cap)}"></em>` : ''}</div><div class="val">${x.rotulo ?? fmt(x.valor || 0)}</div>`).join('')}</div>`;
}
// Curva acumulada do ano: séries [{ nome, cor, v: [por mês], ate (índice do último mês com dado), tracejada, area }]
function curvaAcumulada(ms, series, fmt, hojeIdx = -1) {
  const acc = series.map(s => { let a = 0; return { ...s, c: s.v.map((x, i) => (s.ate != null && i > s.ate) ? null : (a += x || 0)) }; });
  const max = Math.max(1, ...acc.flatMap(s => s.c.filter(x => x != null)));
  const W = 760, H = 230, pl = 10, pr = 96, pt = 12, pb = 26, X = i => pl + i * (W - pl - pr) / Math.max(1, ms.length - 1), Y = v => H - pb - (v / max) * (H - pt - pb);
  let svg = [0.25, 0.5, 0.75, 1].map(f => `<line x1="${pl}" x2="${W - pr}" y1="${Y(max * f)}" y2="${Y(max * f)}" stroke="var(--line)"/>`).join('');
  if (hojeIdx >= 0 && hojeIdx < ms.length) svg += `<line x1="${X(hojeIdx)}" x2="${X(hojeIdx)}" y1="${pt}" y2="${H - pb}" stroke="var(--bv-line)" stroke-dasharray="3 3"/><text x="${X(hojeIdx)}" y="${pt + 8}" text-anchor="middle" font-size="10" fill="var(--faint)">hoje</text>`;
  const ocupados = [];
  for (const s of acc) {
    const pts = s.c.map((v, i) => v == null ? null : [X(i), Y(v)]).filter(Boolean); if (!pts.length) continue;
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    if (s.area) svg += `<path d="${d} L${pts.at(-1)[0].toFixed(1)} ${H - pb} L${pts[0][0].toFixed(1)} ${H - pb} Z" fill="${s.cor}" opacity=".08"/>`;
    svg += `<path d="${d}" fill="none" stroke="${s.cor}" stroke-width="${s.fina ? 1.5 : 2.4}" ${s.tracejada ? 'stroke-dasharray="5 4"' : ''} stroke-linejoin="round" stroke-linecap="round"/>`;
    const u = pts.at(-1), ult = s.c.filter(x => x != null).at(-1); let ty = u[1] + 4; while (ocupados.some(o => Math.abs(o - ty) < 13)) ty += 13; ocupados.push(ty);
    svg += `<circle cx="${u[0]}" cy="${u[1]}" r="3.2" fill="${s.cor}"/><text x="${u[0] + 8}" y="${ty}" font-size="11" fill="${s.cor}" font-weight="600">${esc(fmt(ult))}</text>`;
  }
  svg += ms.map((m, i) => `<text x="${X(i)}" y="${H - 8}" text-anchor="middle" font-size="10.5" fill="var(--muted)">${nomeMes(m)}</text>`).join('');
  return `<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Curva acumulada do ano">${svg}</svg><div class="legend">${series.map(s => `<span><i style="background:${s.cor};${s.tracejada ? 'height:2px' : ''}"></i>${esc(s.nome)}</span>`).join('')}</div>`;
}
const pctTxt = (a, b) => b ? Math.round(a / b * 100) + '%' : '—';

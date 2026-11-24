/* ======================================================================
   Referência de criptografia e de escrita · contratos da solução de gestão
   Mesmo algoritmo do núcleo das ferramentas (financas/src/nucleo.js) e do
   Quadro do Time. Sem dependências. Funciona:
     - no navegador (Edge/Chrome, inclusive em páginas file://): <script src="cripto.js">
       e use window.GestaoCripto;
     - no Node 20+: const G = require('./cripto.js').
   Copie o que precisar. Não invente outro formato de envelope (ADR-0005).
   ====================================================================== */
(function (raiz, fabrica) {
  const api = fabrica(raiz.crypto || require('node:crypto').webcrypto);
  if (typeof module === 'object' && module.exports) module.exports = api; else raiz.GestaoCripto = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (crypto) {
  'use strict';
  const ENVELOPE = 'gestao-envelope/1';
  const te = new TextEncoder(), td = new TextDecoder();
  const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  const WRITER_RE = /^[a-z0-9]+~[a-z0-9]+$/;

  const b64 = {
    enc: u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); },
    dec: s => Uint8Array.from(atob(s), c => c.charCodeAt(0)),
    urlDec: s => b64.dec(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)),
    urlEnc: u8 => b64.enc(u8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  };

  /* ---------------------------- chaves GK1 ---------------------------- */
  // Texto da chave: GK1.<kid>.<32 bytes em base64url sem "=">. O kid não é segredo.
  function lerChaveTexto(txt) {
    const m = /^GK1\.([a-z0-9]+(?:-[a-z0-9]+)*)\.([A-Za-z0-9_-]{43})$/.exec(String(txt).trim());
    if (!m) throw new Error('Chave inválida: formato esperado GK1.<id>.<43 caracteres>');
    const raw = b64.urlDec(m[2]);
    if (raw.length !== 32) throw new Error('Chave inválida: tamanho');
    return { kid: m[1], raw };
  }
  // extractable = false: depois de importada, a chave não pode ser lida de volta pelo código.
  const importarChave = raw => crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  // Só quem administra o nível gera chaves (Central, Finanças do Grupo, Mapa de Férias). Está aqui para testes.
  const gerarChaveTexto = kid => `GK1.${kid}.${b64.urlEnc(crypto.getRandomValues(new Uint8Array(32)))}`;
  // Mapa kid → CryptoKey, a partir de textos GK1 (ignora os inválidos).
  async function mapaDeChaves(textos) {
    const m = new Map();
    for (const t of textos) { const k = lerChaveTexto(t); m.set(k.kid, await importarChave(k.raw)); }
    return m;
  }

  /* ---------------------------- envelope ---------------------------- */
  // Dados associados (AAD): amarram o cabeçalho em claro ao conteúdo cifrado.
  // "writer" NÃO entra no AAD (compatibilidade); ele é conferido contra payload.source.writer depois de decifrar.
  const aadTexto = h => [ENVELOPE, h.content, h.team, h.kid, h.revision, h.generatedAt].join('|');
  const aadDe = h => te.encode(aadTexto(h));

  // payload: o objeto do contrato (gestao-status/1, gestao-financas-plano/1...). Precisa ter schema, revision e generatedAt.
  // iv: só para vetores de teste. Em produção, NUNCA passe iv: ele é sorteado a cada gravação.
  async function cifrarEnv(payload, { key, kid, team }, iv) {
    if (!payload?.schema || !Number.isInteger(payload.revision) || !payload.generatedAt) throw new Error('payload sem schema, revision ou generatedAt');
    const h = { schema: ENVELOPE, content: payload.schema, team, kid, revision: payload.revision, generatedAt: payload.generatedAt, alg: 'A256GCM' };
    iv = iv || crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aadDe(h) }, key, te.encode(JSON.stringify(payload))));
    const env = { ...h, iv: b64.enc(iv), ct: b64.enc(ct) };
    if (payload.source?.writer) env.writer = payload.source.writer;
    return env;
  }
  // chaves: Map kid → CryptoKey. Lança erro em qualquer divergência: quem lê ignora o arquivo e segue.
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

  /* ------------------------ datas, dono e relógio ------------------------ */
  const pad2 = n => String(n).padStart(2, '0');
  // generatedAt: ISO 8601 com o fuso local explícito (ex.: 2026-11-24T16:05:00-03:00).
  function isoComFuso(d = new Date()) {
    const o = -d.getTimezoneOffset(), s = o >= 0 ? '+' : '-', a = Math.abs(o);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}${s}${pad2(Math.floor(a / 60))}:${pad2(a % 60)}`;
  }
  // Slug: minúsculas sem acento, palavras separadas por hífen, até 40 caracteres.
  const slugify = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  // Dono (writer) = <pessoa>~<computador>. pessoa = primeira palavra do slug do nome; computador = id aleatório
  // curto guardado no navegador/máquina (nunca o nome real do computador).
  const writerDe = (nome, computador) => `${slugify(nome).split('-')[0] || 'pessoa'}~${computador}`;
  const novoComputador = () => Array.from(crypto.getRandomValues(new Uint8Array(3)), x => x.toString(36).padStart(2, '0')).join('').slice(0, 5);
  // Nome do arquivo de quem escreve numa pasta com um arquivo por pessoa: <pessoa>-<computador>.json
  const arquivoDoWriter = w => w.replace('~', '-') + '.json';
  // Relógio lógico híbrido "<ms>.<contador>": cresce sempre, mesmo se o relógio do computador voltar.
  // estado = { t, c } guardado por quem escreve; visto = hlc do arquivo mais novo lido da pasta.
  const hlcLer = h => { const m = /^(\d+)\.(\d+)$/.exec(String(h || '')); return m ? { t: +m[1], c: +m[2] } : { t: 0, c: 0 }; };
  const hlcCmp = (a, b) => { const x = hlcLer(a), y = hlcLer(b); return x.t - y.t || x.c - y.c; };
  function hlcAgora(estado = { t: 0, c: 0 }, visto = '', agora = Date.now()) {
    const vis = hlcLer(visto), t = Math.max(agora, estado.t, vis.t);
    const c = t === estado.t && t === vis.t ? Math.max(estado.c, vis.c) + 1 : t === estado.t ? estado.c + 1 : t === vis.t ? vis.c + 1 : 0;
    estado.t = t; estado.c = c;
    return `${t}.${c}`;
  }

  /* ------------------------ cópias de conflito do OneDrive ------------------------ */
  // Para o arquivo "plano.json", são cópias: "plano-NOTEBOOK01.json", "plano-NOTEBOOK01-2.json", "plano (1).json".
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const reCopia = (base, ext = '.json') => new RegExp('^' + escRe(base) + '(?:-[^\\\\/]+?| ?\\(\\d+\\))?' + escRe(ext) + '$', 'i');
  // Entre o arquivo e as cópias já decifrados, vale o de maior revisão; empate: maior HLC.
  const maisNovo = payloads => payloads.slice().sort((x, y) => (y.revision - x.revision) || hlcCmp(y.hlc, x.hlc))[0] || null;
  // Próxima revisão ao publicar: maior revisão vista (arquivo, cópias, inclusive as que não abrem) + 1.
  const proximaRevisao = (revisoesVistas, ultimaPublicada = 0) => Math.max(ultimaPublicada, 0, ...revisoesVistas.filter(Number.isInteger)) + 1;

  return { ENVELOPE, SLUG_RE, WRITER_RE, b64, lerChaveTexto, importarChave, gerarChaveTexto, mapaDeChaves, aadTexto, aadDe, cifrarEnv, decifrarEnv,
    isoComFuso, slugify, writerDe, novoComputador, arquivoDoWriter, hlcLer, hlcCmp, hlcAgora, reCopia, maisNovo, proximaRevisao };
});

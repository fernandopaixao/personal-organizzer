/* ---------- Quadro 2.2 · post-its recebidos do Hub da solução ----------
   Lê times/<time>/postits/*.json (envelope gestao-envelope/1, conteúdo gestao-postits/1), um arquivo por autor,
   cifrados com a chave do time, e mostra os post-its no topo do quadro.
   Quando a pessoa marca "Vi", o Quadro grava só o próprio arquivo de recibo:
     times/<time>/postits/vistos/<pessoa>-<computador>.json   (conteúdo gestao-postits-vistos/1)
   Nada aqui grava o arquivo de outra pessoa, então o OneDrive não gera cópias de conflito. */
const PI_SCHEMA = 'gestao-postits/1', PI_VISTOS = 'gestao-postits-vistos/1';
let piNotas = [], piAbertos = false, piLendo = false, piAssinatura = '';
(() => {
  const st = document.createElement('style');
  st.textContent = `.pi-strip{margin:0 0 14px}.pi-h{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#52607e);margin:0 0 8px}
  .pi-row{display:flex;gap:12px;overflow-x:auto;padding:2px 2px 8px}
  .pi-n{flex:0 0 220px;border-radius:4px 4px 14px 4px;padding:10px 12px;font-size:13px;line-height:1.4;box-shadow:0 1px 2px rgba(11,33,85,.08),0 6px 14px rgba(11,33,85,.06);display:flex;flex-direction:column;gap:6px;word-break:break-word}
  .pi-n .tx{white-space:pre-wrap;flex:1}.pi-n .ft{font-size:11px;color:rgba(22,26,35,.62);display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .pi-n .para{font-size:11px;font-weight:650;color:rgba(22,26,35,.7)}.pi-n.visto{opacity:.6}
  .pi-n button{margin-left:auto;font:inherit;font-size:11px;font-weight:600;border:1px solid rgba(22,26,35,.18);background:rgba(255,255,255,.7);border-radius:99px;padding:1px 9px;cursor:pointer}
  .pi-c-amarelo{background:#fff4b8}.pi-c-rosa{background:#ffdbe4}.pi-c-verde{background:#d3f0e7}.pi-c-azul{background:#dde7ff}.pi-c-lilas{background:#ebdfff}
  .pi-h .n{background:var(--late,#c2334f);color:#fff;border-radius:99px;padding:0 7px;font-size:10.5px;letter-spacing:0}
  .pi-h button{font:inherit;text-transform:none;letter-spacing:0;font-weight:550;color:var(--bv,#1e4fc8);background:none;border:0;cursor:pointer;font-size:12px}`;
  document.head.appendChild(st);
})();
const piChaveVistos = () => 'quadro.postits.vistos.' + (db?.team.slug || '') + '.' + (f4eu() || '');
function piVistos() { try { return JSON.parse(localStorage.getItem(piChaveVistos()) || '{}'); } catch { return {}; } }
const piHoje = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
async function piPasta(criar) {
  const root = await obterPasta(); if (!root || !db?.team.slug) return null;
  try { let d = await root.getDirectoryHandle('times', { create: criar }); d = await d.getDirectoryHandle(db.team.slug, { create: criar }); return await d.getDirectoryHandle('postits', { create: criar }); } catch { return null; }
}
async function piLer() {
  if (piLendo || !db || db.demo || !db.team.slug || !keysInfo?.atual) return;
  piLendo = true;
  try {
    const dir = await piPasta(false), porAutor = new Map();
    if (dir) {
      const { mapa } = await chaveiro();
      for await (const [n, h] of dir.entries()) {
        if (h.kind !== 'file' || !n.endsWith('.json') || n.startsWith('.')) continue;
        try {
          const env = JSON.parse(await (await h.getFile()).text()), p = await decifrar(env, mapa);
          if (p.schema !== PI_SCHEMA || env.team !== db.team.slug || p.source?.team !== db.team.slug) continue;
          const w = p.source?.writer || n, ant = porAutor.get(w);
          if (!ant || p.revision > ant.revision) porAutor.set(w, p);    // cópia de conflito do OneDrive: vale a maior revisão
        } catch { /* arquivo pela metade ou de outra chave: tenta de novo na próxima leitura */ }
      }
    }
    const hj = piHoje(), out = [];
    for (const [w, p] of porAutor) for (const x of p.notes || []) {
      if (!x?.id || typeof x.text !== 'string' || (x.expiresAt && x.expiresAt < hj)) continue;
      out.push({ id: String(x.id), texto: String(x.text).slice(0, 500), cor: /^(amarelo|rosa|verde|azul|lilas)$/.test(x.color) ? x.color : 'amarelo', para: String(x.to || '').slice(0, 60), em: x.updatedAt || x.createdAt || '', ate: x.expiresAt || '', autor: String(p.source?.author?.name || w.split('~')[0]).slice(0, 60) });
    }
    out.sort((a, b) => String(b.em).localeCompare(String(a.em)));
    piNotas = out;
    const ass = JSON.stringify(out);
    if (ass !== piAssinatura) { piAssinatura = ass; if (view === 'board' && !$('#dlg')?.open && !document.getElementById('f4dlg')?.open) render(); }
  } finally { piLendo = false; }
}
async function piPublicarVistos() {
  const k = keysInfo?.atual; if (!k || !f4eu() || !db?.team.slug) return;
  const dir = await piPasta(true); if (!dir) return;
  const dv = await dir.getDirectoryHandle('vistos', { create: true });
  const vis = piVistos(), ids = new Set(piNotas.map(n => n.id));
  const seen = Object.entries(vis).filter(([id]) => ids.has(id)).map(([id, at]) => ({ id, at }));
  const chaveRev = 'quadro.postitsRev.' + db.team.slug, rev = (+localStorage.getItem(chaveRev) || 0) + 1;
  const payload = { schema: PI_VISTOS, revision: rev, generatedAt: agoraComFuso(), source: { team: db.team.slug, writer: f4writer(), tool: TOOL, toolVersion: TOOL_VERSION, author: { name: f4eu() } }, seen };
  const texto = JSON.stringify(await cifrar(payload, { key: k.key, kid: k.kid, team: db.team.slug }));
  const fh = await dv.getFileHandle(f4arquivo(), { create: true }), w = await fh.createWritable();
  await w.write(texto); await w.close();                                             // troca atômica no close()
  if ((await (await fh.getFile()).text()) !== texto) throw new Error('gravação não confirmada');
  try { localStorage.setItem(chaveRev, String(rev)); } catch {}
}
function piHtml() {
  if (!piNotas.length) return '';
  const vis = piVistos(), novos = piNotas.filter(n => !vis[n.id]), mostrar = piAbertos ? piNotas : novos;
  const fd = s => s ? new Date(s.length === 10 ? s + 'T12:00:00' : s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
  return `<section class="pi-strip"><div class="pi-h">Post-its para o time ${novos.length ? `<span class="n">${novos.length} novo${novos.length > 1 ? 's' : ''}</span>` : ''}
    ${piNotas.length > novos.length ? `<button data-pi="todos">${piAbertos ? 'Esconder os já vistos' : `Ver os já vistos (${piNotas.length - novos.length})`}</button>` : ''}</div>
    ${mostrar.length ? `<div class="pi-row">${mostrar.map(n => `<div class="pi-n pi-c-${n.cor} ${vis[n.id] ? 'visto' : ''}">${n.para ? `<span class="para">Para ${esc(n.para)}</span>` : ''}<div class="tx">${esc(n.texto)}</div>
      <div class="ft"><span>${esc(n.autor)} · ${esc(fd(n.em))}${n.ate ? ' · até ' + esc(fd(n.ate)) : ''}</span>${vis[n.id] ? '' : `<button data-pi="vi" data-id="${esc(n.id)}" title="Marca como visto; quem deixou o post-it vê no hub">Vi</button>`}</div></div>`).join('')}</div>` : ''}</section>`;
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-pi]'); if (!b) return;
  if (b.dataset.pi === 'todos') { piAbertos = !piAbertos; render(); return; }
  if (b.dataset.pi === 'vi') {
    if (!f4eu() && keysInfo?.atual && (await obterPasta())) await f4quemSou();   // o recibo leva o nome de quem viu
    const v = piVistos(); v[b.dataset.id] = new Date().toISOString();
    try { localStorage.setItem(piChaveVistos(), JSON.stringify(v)); } catch {}
    render();
    try { await piPublicarVistos(); } catch (er) { toast('Não foi possível avisar que você viu: ' + (er.message || er)); }
  }
});
setInterval(() => piLer().catch(() => {}), 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) piLer().catch(() => {}); });
{
  const vb0 = vBoard; vBoard = function () { return piHtml() + vb0.apply(this, arguments); };
  const sinc0 = f4sincronizar; f4sincronizar = async function () { const r = await sinc0.apply(this, arguments); await piLer().catch(() => {}); return r; };
}

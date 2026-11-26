// Teste do Quadro do Time 2.5: Iniciativa › Feature › Card (igual à Central) e exportação legível.
// Uso: node financas/testes/teste-quadro.js   (precisa do Playwright e do Chromium instalados)
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..');
let falhas = 0;
const ok = (c, msg) => { console.log((c ? '  ok  ' : '  FALHOU  ') + msg); if (!c) falhas++; };
const srv = http.createServer((q, r) => {
  const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
const central = fs.readdirSync(RAIZ).filter(n => /^gestao_pessoal_v\d+\.html$/.test(n)).sort((a, b) => parseInt(a.slice(15)) - parseInt(b.slice(15))).pop();

(async () => {
  await new Promise(r => srv.listen(0, r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } });
  const erros = [];
  const nova = async url => { const p = await ctx.newPage(); p.on('pageerror', e => erros.push(url + ': ' + e.message)); await p.goto(base + url); return p; };
  const q = await nova(process.env.QUADRO || '/ferramenta-time/quadro_do_time_v1.html');   // QUADRO=/dist/experimental/quadro_do_time_v1.html testa a versão experimental
  const ir = v => q.evaluate(v => { const bs = [...document.querySelectorAll(`[data-act=view][data-v="${v}"]`)]; (bs.find(b => b.offsetParent) || bs[0]).click(); }, v);
  await q.click('[data-act=demo]'); await q.waitForSelector('.kc');

  console.log('1. Hierarquia Iniciativa › Feature › Card');
  const tipos = await q.evaluate(() => [...document.querySelectorAll('#main .kc')].length);
  ok(tipos > 0, 'quadro de exemplo abre');
  ok(await q.evaluate(() => window.__qt.db.features.length === 2 && window.__qt.db.cards.some(c => c.featureId)), 'exemplo tem features do time com cards dentro');
  ok(await q.evaluate(() => !window.__qt.db.cards.some(c => c.kind === 'feature')), '"feature" não é mais tipo de card nos cards novos');
  // tela Iniciativas: iniciativa do time, sem vínculo, com features do time
  await q.evaluate(() => { const e = window.__qt.db.epics.find(x => !x.centralRef); document.querySelector('[data-act=view][data-v=epics]')?.click(); return e.id; });
  await q.waitForSelector('.ep-row');
  const e2 = await q.evaluate(() => window.__qt.db.epics.find(x => !x.centralRef).id);
  await q.click(`.ep-row[data-id="${e2}"]`);
  ok(await q.locator('.fcard[data-feat]').count() === 2, 'iniciativa do time mostra as 2 features do time, mesmo sem vínculo com a Central');
  // criar feature pelo formulário (duas colunas, sem prompt)
  await q.click(`[data-act=newFeat][data-epic="${e2}"]`); await q.waitForSelector('#feName');
  ok(await q.locator('#dlg .tf-main').count() === 1 && await q.locator('#dlg .tf-side').count() === 1, 'formulário de feature em duas colunas');
  await q.fill('#feName', 'Rastreamento de pedidos');
  await q.click('#dlg [data-act=feSet][data-k=owner]:not(.none)');
  await q.click('#dlg button.pri');
  const nf = await q.evaluate(() => window.__qt.db.features.find(f => f.name === 'Rastreamento de pedidos'));
  ok(nf && nf.epicId === e2 && nf.owner, 'feature do time criada na iniciativa, com responsável');
  // card dentro da feature
  await q.click(`.fcard[data-feat="${nf.id}"] [data-act=addCardFeat]`); await q.waitForSelector('#nfTitle');
  ok(await q.evaluate(id => document.querySelector('#dlg [data-nf=feature]').value === id, nf.id), 'novo card já vem com a feature escolhida');
  await q.fill('#nfTitle', 'Webhook de status do pedido'); await q.click('#dlg button.pri');
  const c1 = await q.evaluate(id => window.__qt.db.cards.find(c => c.title === 'Webhook de status do pedido'), nf.id);
  ok(c1 && c1.featureId === nf.id && c1.epicId === e2 && !c1.featureRef, 'card criado dentro da feature do time');
  // detalhe do card: trocar para a feature da Central, depois de volta
  const e1 = await q.evaluate(() => window.__qt.db.epics.find(x => x.centralRef === 'PAG-042').id);
  await q.evaluate(([cid, eid]) => { const c = window.__qt.db.cards.find(x => x.id === cid); window.__qt.ligarFeature(c, 'PAG-042.F2'); }, [c1.id, e1]);
  ok(await q.evaluate(([cid, eid]) => { const c = window.__qt.db.cards.find(x => x.id === cid); return c.featureRef === 'PAG-042.F2' && !c.featureId && c.epicId === eid; }, [c1.id, e1]), 'ligar à feature da Central troca a feature e a iniciativa do card');
  await q.evaluate(([cid, fid]) => { const c = window.__qt.db.cards.find(x => x.id === cid); window.__qt.ligarFeature(c, fid); }, [c1.id, nf.id]);
  await ir('backlog'); await q.click('[data-act=bFilter][data-v=all]');
  await q.click(`.lrow[data-card="${c1.id}"]`); await q.waitForSelector('#dlg [data-cf=feature]');
  const grupos = await q.evaluate(() => [...document.querySelectorAll('#dlg [data-cf=feature] optgroup')].map(g => g.label));
  ok(grupos.length === 1 && grupos[0] === 'Do time', 'card de iniciativa do time escolhe entre as features do time');
  ok(await q.locator('#dlg .fbox:has-text("feature do time")').count() === 1, 'detalhe do card mostra a feature do time');
  await q.keyboard.press('Escape');
  // card antigo do tipo feature: transformar em feature
  const velho = await q.evaluate(eid => { const c = window.__qt.db.cards.find(x => x.epicId === eid && !x.featureId && !x.cancelledAt); c.kind = 'feature'; return c.id; }, e2);
  await q.evaluate(() => window.__qt.render());
  await q.waitForSelector(`.lrow[data-card="${velho}"]`);
  await q.click(`.lrow[data-card="${velho}"]`); await q.waitForSelector('#dlg [data-act=cardToFeat]');
  q.once('dialog', d => d.accept());
  await q.click('#dlg [data-act=cardToFeat]');
  const tv = await q.evaluate(id => { const c = window.__qt.db.cards.find(x => x.id === id), f = window.__qt.db.features.find(x => x.id === c.featureId); return { kind: c.kind, f: f && f.name === c.title }; }, velho);
  ok(tv.kind === 'entrega' && tv.f, 'card antigo do tipo feature vira feature do time e fica dentro dela como entrega');
  await q.keyboard.press('Escape');

  console.log('2. Backlog e quadro por feature');
  await q.click('[data-act=bGroup][data-v=feature]');
  ok(await q.locator('.lgrp h3:has-text("Rastreamento de pedidos")').count() === 1 && await q.locator('.lgrp h3:has-text("Contratação no app")').count() === 1 && await q.locator('.lgrp h3:has-text("Sem feature")').count() === 1, 'backlog agrupa por feature (da Central e do time) e mostra "Sem feature"');
  await ir('board');
  await q.click('[data-act=lanes][data-v=feature]');
  ok(await q.locator('.lane .lh small:has-text("feature do time")').count() >= 1 && await q.locator('.lane .lh small:has-text("PAG-042.F")').count() >= 1, 'quadro tem raias por feature, da Central e do time');
  const somaL = () => q.evaluate(() => [...document.querySelectorAll('.lane .lh small')].reduce((s, x) => s + parseInt(x.textContent), 0));
  const soma = await somaL();
  await q.click('[data-act=lanes][data-v=epic]');
  const total = await somaL();
  await q.click('[data-act=lanes][data-v=none]');
  ok(soma === total && total > 0, `cada card aparece em uma raia só (${soma} = ${total})`);

  console.log('3. Publicação para a Central');
  const st = await q.evaluate(() => { const s = window.__qt.buildStatus(9, '2026-11-26T10:00:00-03:00'); return { s, er: window.__qt.validar(s) }; });
  const ini = st.s.initiatives.find(i => i.localId === e2);
  const itF = ini.items.filter(i => i.kind === 'feature'), filhos = ini.items.filter(i => i.featureLocalId);
  ok(!st.er.length, 'status.json válido' + (st.er.length ? ': ' + st.er.join('; ') : ''));
  ok(itF.length === 4 && filhos.length > 0 && filhos.every(i => itF.some(f => f.localId === i.featureLocalId) && i.featureRef === null), 'features do time vão como itens "feature" e os cards levam featureLocalId');
  ok(ini.items.findIndex(i => i.kind === 'feature') === 0, 'features vêm antes dos cards nos itens');
  // conciliação da Central: link FEAT → feature da Central move os cards
  const un = await q.evaluate(fid => { const c = window.__qt.catalog; c.links = [{ kind: 'feature', localId: fid, ref: 'PAG-042.F3' }]; window.__qt.catalog = c; const n = window.__qt.applyCatalogLinks(); const db = window.__qt.db; return { n, cards: db.cards.filter(x => x.featureRef === 'PAG-042.F3' && x.title === 'Webhook de status do pedido').length, viva: db.features.some(f => f.id === fid && !f.deleted) }; }, nf.id);
  ok(un.n === 1 && un.cards === 1 && !un.viva, 'quando o gestor une a feature do time a uma da Central, os cards passam para o código da Central');
  // mergeDb: duas pessoas criam FEAT com o mesmo número
  const mg = await q.evaluate(() => { const { mergeDb, db } = window.__qt; const a = structuredClone(db), b = structuredClone(db);
    const nfA = { id: 'FEAT-90', uid: 'a1', epicId: a.epics[0].id, name: 'A', status: 'open', upd: 1 }, nfB = { id: 'FEAT-90', uid: 'b1', epicId: b.epics[0].id, name: 'B', status: 'open', upd: 1 };
    a.features.push(nfA); b.features.push(nfB); a.seq.feature = 90; b.seq.feature = 90; a.cards[0].featureId = 'FEAT-90'; a.cards[0].featureRef = null; a.cards[0].upd = Date.now() + 5000;
    const m = mergeDb(a, b), fa = m.features.find(f => f.uid === 'a1'), fb = m.features.find(f => f.uid === 'b1');
    return { ids: [fa?.id, fb?.id], card: m.cards.find(c => c.id === a.cards[0].id).featureId }; });
  ok(mg.ids[0] && mg.ids[1] && mg.ids[0] !== mg.ids[1] && mg.card === mg.ids[0], 'união de arquivos renumera a feature repetida e mantém os cards nela');

  console.log('4. Exportar dados legíveis');
  await q.click('[data-act=exportar]'); await q.waitForSelector('#expGo');
  ok(await q.locator('#expGo').isDisabled(), 'botão de exportar fica desligado até confirmar que sai sem cifra');
  ok(await q.locator('#dlg:has-text("sai sem criptografia")').count() === 1, 'aviso de que o arquivo sai sem criptografia');
  await q.check('#expOk');
  let [dl] = await Promise.all([q.waitForEvent('download'), q.click('#expGo')]);
  const csv = fs.readFileSync(await dl.path(), 'utf8');
  ok(dl.suggestedFilename().endsWith('.csv') && csv.charCodeAt(0) === 0xfeff && csv.split('\r\n')[0].includes('Código;Título;Tipo;Coluna;Situação;Iniciativa'), 'CSV com BOM e separador ";" (abre no Excel)');
  const nCards = await q.evaluate(() => window.__qt.db.cards.filter(c => !c.deleted).length);
  ok(csv.trim().split('\r\n').length === nCards + 1, `CSV tem uma linha por card (${nCards})`);
  ok(/Alertas de latência;FEAT-\d+;time/.test(csv) && /Contratação no app;PAG-042\.F2;Central/.test(csv), 'CSV traz a feature do card e de onde ela vem');
  ok(!/"ct"|gestao-envelope/.test(csv), 'CSV sai em claro');
  await q.click('[data-act=exportar]'); await q.click('#dlg [data-act=expFmt][data-v=json]'); await q.check('#expOk');
  [dl] = await Promise.all([q.waitForEvent('download'), q.click('#expGo')]);
  const js = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  const iT = js.iniciativas.find(i => i.codigo === e2);
  ok(js.formato === 'quadro-exportacao/1' && /SEM criptografia/.test(js.aviso), 'JSON legível com formato e aviso');
  ok(iT && iT.features.some(f => f.origem === 'time' && f.cards.length) && js.iniciativas.find(i => i.codigoNaCentral === 'PAG-042').features.some(f => f.origem === 'Central' && f.cards.length), 'JSON segue Iniciativa › Feature › Card, com features da Central e do time');
  const nJs = js.iniciativas.reduce((s, i) => s + i.cardsSemFeature.length + i.features.reduce((t, f) => t + f.cards.length, 0), 0) + js.cardsSemIniciativa.length;
  ok(nJs === nCards, `JSON traz todos os cards uma vez (${nJs})`);
  await ir('settings');
  ok(await q.locator('button:has-text("Baixar cópia cifrada")').count() === 1 && await q.locator('#main [data-act=exportar]').count() === 1, 'Ajustes separa a cópia cifrada da exportação legível');
  await q.screenshot({ path: path.join(RAIZ, 'financas', 'testes', 'saida', 'quadro-ajustes.png') }).catch(() => {});

  console.log('5. Central mostra a feature do time e os cards dentro dela');
  const pc = await nova('/' + central);
  const r = await pc.evaluate(st => {
    const chk = igCheckStatus(st).payload, x = chk.initiatives.find(i => i.items.some(y => y.featureLocalId));
    const fLoc = x.items.find(y => y.kind === 'feature' && x.items.some(z => z.featureLocalId === y.localId)), filhos = x.items.filter(z => z.featureLocalId === fLoc.localId).length;
    const t = { id: 't1', slug: 'pagamentos', name: 'Pagamentos' }, ini = { id: 'i1', ref: 'PAG-077', name: 'Observabilidade' };
    db = { teams: [t], initiatives: [ini], tasks: [{ id: 'f1', type: 'feature', ref: 'PAG-077.F1', initiativeId: 'i1', title: 'Painel' }],
      integ: { received: { pagamentos: { status: { payload: chk, at: '2026-11-26T10:00:00-03:00' } } }, links: [{ teamId: 't1', kind: 'initiative', localId: x.localId, ref: 'PAG-077' }], ignored: [], aliases: [], suggest: [], merged: [] } };
    const antes = { soltos: igUnlinkedOf(t, x).map(y => y.localId), naFeature: igItemsOfFeature(db.tasks[0]).length };
    db.integ.links.push({ teamId: 't1', kind: 'feature', localId: fLoc.localId, ref: 'PAG-077.F1' });
    const depois = { soltos: igUnlinkedOf(t, x).map(y => y.localId), naFeature: igItemsOfFeature(db.tasks[0]).length, html: igFeatDs(db.tasks[0]) };
    return { fLoc: fLoc.localId, filhos, antes, depois, bloco: (() => { db.integ.links.pop(); return igUnlinkedItemsBlock(ini); })() };
  }, st.s).catch(e => ({ erro: e.message }));
  ok(!r.erro && r.antes.soltos.includes(r.fLoc), 'Central lista a feature do time para conciliar' + (r.erro ? ': ' + r.erro : ''));
  ok(!r.erro && r.bloco.includes('feature do time · ' + r.filhos + ' card(s)'), 'na iniciativa, a Central mostra a feature do time com a contagem de cards dela');
  ok(!r.erro && r.depois.naFeature === r.filhos + 1 && !r.depois.soltos.includes(r.fLoc), 'ligada a uma feature da Central, a feature do time leva os cards junto (downstream embaixo da feature)');
  ok(!r.erro && /padding-left:18px/.test(r.depois.html), 'cards da feature do time aparecem recuados embaixo dela');

  ok(!erros.length, 'sem erros de JavaScript' + (erros.length ? ': ' + erros.join(' | ') : ''));
  await browser.close(); srv.close();
  console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : '\nTodas as verificações passaram.');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

// Teste do Quadro do Time 2.8: Iniciativa › Feature › Card (igual à Central), exportação legível, Refinamento, desenho de sprints e sprint sincronizada com a Central.
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

  console.log('6. Refinamento: organizar, mover, dividir, juntar, desfazer, pronto e resumo');
  const rq = await nova(process.env.QUADRO || '/ferramenta-time/quadro_do_time_v1.html');
  await rq.click('[data-act=demo]'); await rq.waitForSelector('.kc');
  await rq.evaluate(() => { const bs = [...document.querySelectorAll('[data-act=view][data-v=refine]')]; (bs.find(b => b.offsetParent) || bs[0]).click(); });
  await rq.waitForSelector('.rlay');
  ok(await rq.locator('.tnav [data-v=refine]').count() === 1, 'Refinamento está no menu do topo');
  ok(await rq.locator('.rtree .rti[data-rdrop^="r:PAG-042.F"]').count() >= 2 && await rq.locator('.rtree .rti[data-rdrop^="t:FEAT-"]').count() >= 1, 'árvore mostra features da Central e do time');
  const semF = await rq.evaluate(() => window.__qt.rCardsOf('-').map(c => c.id));
  ok(semF.length > 0 && await rq.locator('.rin .rrow').count() === semF.length, 'coluna "Sem feature" lista os cards abertos sem feature');
  // arrastar dois cards de "Sem feature" para uma feature do time de outra iniciativa
  const alvoT = await rq.evaluate(() => { const f = window.__qt.db.features.find(x => !x.deleted); return { k: 't:' + f.id, epic: f.epicId }; });
  await rq.click(`.rin .rrow[data-card="${semF[0]}"] [data-act=rPick]`); await rq.click(`.rin .rrow[data-card="${semF[1]}"] [data-act=rPick]`);
  const dt = await rq.evaluateHandle(() => new DataTransfer());
  await rq.dispatchEvent(`.rin .rrow[data-card="${semF[0]}"]`, 'dragstart', { dataTransfer: dt });
  await rq.dispatchEvent(`.rtree .rti[data-rdrop="${alvoT.k}"]`, 'drop', { dataTransfer: dt });
  const mv = await rq.evaluate(([ids, k]) => ids.map(id => { const c = window.__qt.db.cards.find(x => x.id === id); return [window.__qt.fKey(c), c.epicId]; }), [semF.slice(0, 2), alvoT.k]);
  ok(mv.every(([k, e]) => k === alvoT.k && e === alvoT.epic), 'arrastar os selecionados para a feature move os dois e acerta a iniciativa deles');
  ok(await rq.locator('.toast.undo').count() === 1, 'aviso com Desfazer depois de mover');
  await rq.keyboard.press('Control+z');
  ok(await rq.evaluate(ids => ids.every(id => window.__qt.fKey(window.__qt.db.cards.find(x => x.id === id)) === '-'), semF.slice(0, 2)), 'Ctrl+Z desfaz a movimentação');
  // mover pelo formulário (M) para uma feature da Central
  await rq.click(`.rin .rrow[data-card="${semF[0]}"] [data-act=rPick]`); await rq.keyboard.press('m'); await rq.waitForSelector('#rmvK');
  ok(await rq.locator('#dlg .tf-main').count() === 1 && await rq.locator('#dlg .tf-side').count() === 1, 'Mover para… é um formulário em duas colunas');
  await rq.selectOption('#rmvK', 'r:PAG-042.F2'); await rq.click('#rmvForm button.pri');
  const m2 = await rq.evaluate(id => { const c = window.__qt.db.cards.find(x => x.id === id), e = window.__qt.db.epics.find(x => x.id === c.epicId); return { ref: c.featureRef, fid: c.featureId, ini: e?.centralRef }; }, semF[0]);
  ok(m2.ref === 'PAG-042.F2' && !m2.fid && m2.ini === 'PAG-042', 'card vai para a feature da Central e para a iniciativa ligada a ela');
  // ordem dentro da feature (Alt+↑)
  await rq.click('.rtree .rti[data-rdrop="r:PAG-042.F2"]');
  const ordem = await rq.evaluate(() => window.__qt.rCardsOf('r:PAG-042.F2').map(c => c.id));
  await rq.focus(`.rrow[data-card="${ordem[1]}"]`); await rq.keyboard.press('Alt+ArrowUp');
  ok(await rq.evaluate(() => window.__qt.rCardsOf('r:PAG-042.F2')[0].id) === ordem[1], 'Alt+↑ sobe o card na prioridade da feature');
  // dividir
  const alvoD = ordem[0];
  await rq.click(`.rrow[data-card="${alvoD}"] [data-act=rPick]`); await rq.click('[data-act=rDividir]'); await rq.waitForSelector('#rdvL');
  await rq.fill('#rdvL', 'Parte A\nParte B\nParte C'); await rq.fill('#rdvP', '2, 1, 1'); await rq.click('#rdvForm button.pri');
  const dv = await rq.evaluate(id => { const db = window.__qt.db, c = db.cards.find(x => x.id === id), n = db.cards.filter(x => x.splitFrom === id); return { t: c.title, pts: c.points, novos: n.map(x => [x.title, x.featureRef, x.points]), hist: c.history.length > 0 }; }, alvoD);
  ok(dv.t === 'Parte A' && dv.pts === 2 && dv.novos.length === 2 && dv.novos.every(x => x[1] === 'PAG-042.F2') && dv.novos[0][2] === 1, 'Dividir: o original vira a primeira parte e as outras nascem na mesma feature, com os pontos');
  // juntar
  const dois = await rq.evaluate(id => window.__qt.db.cards.filter(x => x.splitFrom === id).map(x => x.id), alvoD);
  for (const id of dois) await rq.click(`.rrow[data-card="${id}"] [data-act=rPick]`);
  await rq.click('[data-act=rJuntar]'); await rq.waitForSelector('#rjnForm'); await rq.click('#rjnForm button.pri');
  const jn = await rq.evaluate(([a, b]) => { const db = window.__qt.db, A = db.cards.find(x => x.id === a), B = db.cards.find(x => x.id === b); return { pts: A.points, canc: !!B.cancelledAt, motivo: B.cancelReason }; }, dois);
  ok(jn.pts === 2 && jn.canc && /juntado em/.test(jn.motivo), 'Juntar: um card fica (com a soma dos pontos) e o outro é cancelado com o motivo');
  // refinar: critérios e pronto para sprint
  await rq.evaluate(id => { const c = window.__qt.db.cards.find(x => x.id === id); delete c.ready; }, alvoD);
  await rq.click('[data-act=rStep][data-v=ref]'); await rq.waitForSelector('.rtab');
  await rq.click(`.rtab tr[data-card="${alvoD}"] td:nth-child(2)`); await rq.waitForSelector('#dlg form[data-act=rAccAdd]');
  await rq.fill('#dlg form[data-act=rAccAdd] input', 'Mostra o CET'); await rq.keyboard.press('Enter');
  await rq.waitForTimeout(50);
  for (const t of ['Critérios de aceite escritos', 'Tamanho combinado', 'Sem dependência aberta']) if (!await rq.locator(`#dlg [data-act=rRdy][data-v="${t}"].on`).count()) await rq.click(`#dlg [data-act=rRdy][data-v="${t}"]`);
  const rd = await rq.evaluate(id => { const c = window.__qt.db.cards.find(x => x.id === id); return { ac: c.acceptance.map(a => a.text), pronto: window.__qt.isReady(c), at: !!c.ready.at }; }, alvoD);
  ok(rd.ac.includes('Mostra o CET') && rd.pronto && rd.at, 'critério de aceite e os itens do pronto deixam o card pronto para sprint');
  await rq.keyboard.press('Escape');
  await rq.fill(`.rtab input[data-rpts="${alvoD}"]`, '5'); await rq.press(`.rtab input[data-rpts="${alvoD}"]`, 'Tab');
  ok(await rq.evaluate(id => window.__qt.db.cards.find(x => x.id === id).points, alvoD) === 5, 'tamanho editado direto na tabela do Refinar');
  // resumo
  await rq.click('[data-act=rResumo]'); await rq.waitForSelector('#rsN');
  await rq.fill('#rsN', 'Esperar o contrato do parceiro.');
  const txt = await rq.evaluate(() => window.__qt.rResumoTexto(window.__qt.rSessao()));
  ok(/Cards movidos entre features/.test(txt) && /dividido em/.test(txt) && /juntado/.test(txt) && /Esperar o contrato/.test(txt) && /Prontos para sprint nesta sessão: 1/.test(txt), 'Resumo traz movimentações, divisão, junção, prontos e decisões');
  ok(!/Iniciativas novas|Features novas/.test(txt), 'Resumo não conta como novo o que já existia antes da sessão');
  const [dlT] = await Promise.all([rq.waitForEvent('download'), rq.click('[data-act=rTxt]')]);
  ok(dlT.suggestedFilename().startsWith('refinamento-pagamentos-'), 'Resumo baixa em .txt');
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base }).catch(() => {});
  await rq.click('[data-act=rEncerrar]'); await rq.waitForFunction(() => !window.__qt.rSessao(), null, { timeout: 5000 }).catch(() => {});
  ok(await rq.evaluate(() => !window.__qt.rSessao() && window.__qt.db.refinements.length === 1 && !!window.__qt.db.refinements[0].endedAt), 'encerrar guarda a sessão no histórico do Quadro');
  // união de arquivos: sessão e critérios
  const mr = await rq.evaluate(() => { const { mergeDb, db } = window.__qt; const a = structuredClone(db), b = structuredClone(db); b.refinements = []; const m = mergeDb(a, b); return m.refinements.length; });
  ok(mr === 1, 'união de arquivos mantém o histórico de refinamentos');
  // exportação legível leva critérios e pronto
  ok(await rq.evaluate(id => { const j = window.__qt.exportLegivel(); const all = j.iniciativas.flatMap(i => [...i.cardsSemFeature, ...i.features.flatMap(f => f.cards)]); const c = all.find(x => x.codigo === id); return c.criteriosDeAceite.some(a => a.texto === 'Mostra o CET') && c.prontoParaSprint; }, alvoD), 'exportação legível leva critérios de aceite e pronto para sprint');
  await rq.screenshot({ path: path.join(RAIZ, 'financas', 'testes', 'saida', 'quadro-refinamento.png') }).catch(() => {});

  console.log('7. Desenhar sprints e planejar a sprint');
  const sq = await nova(process.env.QUADRO || '/ferramenta-time/quadro_do_time_v1.html');
  await sq.click('[data-act=demo]'); await sq.waitForSelector('.kc');
  await sq.evaluate(() => { const bs = [...document.querySelectorAll('[data-act=view][data-v=refine]')]; (bs.find(b => b.offsetParent) || bs[0]).click(); });
  await sq.click('[data-act=rStep][data-v=draw]'); await sq.waitForSelector('.rgrid');
  const sp = await sq.evaluate(() => window.__qt.db.sprints.filter(s => s.state === 'planned').sort((a, b) => a.start.localeCompare(b.start)).map(s => ({ id: s.id, end: s.end })));
  ok(sp.length === 2 && await sq.locator('.rgrid .rgh:has-text("em andamento")').count() === 1, 'grade mostra a sprint em andamento e as planejadas');
  ok(await sq.evaluate(() => window.__qt.rVazao()) > 0 && /de \d+ cards/.test(await sq.locator('.rgrid .rgh').nth(2).innerText()), 'capacidade pela vazão média das últimas sprints');
  const pv1 = await sq.evaluate(() => window.__qt.rPrevisao('r:PAG-042.F3'));
  ok(pv1 && pv1.end === sp[1].end, 'previsão da feature = fim da última sprint com card dela');
  // arrastar um card da F3 para a primeira planejada
  const c75 = await sq.evaluate(id => window.__qt.db.cards.find(c => c.sprintId === id && c.featureRef === 'PAG-042.F3').id, sp[1].id);
  const dt2 = await sq.evaluateHandle(() => new DataTransfer());
  await sq.dispatchEvent(`.rpill[data-card="${c75}"]`, 'dragstart', { dataTransfer: dt2 });
  await sq.dispatchEvent(`.rgrid .rgc[data-rsp="${sp[0].id}"]`, 'drop', { dataTransfer: dt2 });
  ok(await sq.evaluate(id => window.__qt.db.cards.find(c => c.id === id).sprintId, c75) === sp[0].id, 'arrastar o card entre sprints troca a sprint dele');
  const st2 = await sq.evaluate(() => window.__qt.buildStatus(5, '2026-11-26T10:00:00-03:00'));
  const f3 = st2.initiatives.flatMap(i => i.features || []).find(f => f.ref === 'PAG-042.F3');
  const esperado = await sq.evaluate(() => window.__qt.rPrevisao('r:PAG-042.F3')?.end);
  ok(f3 && f3.forecastEnd && f3.forecastEnd >= esperado, 'a previsão da feature pelo desenho vai no status.json (forecastEnd)');
  // mudar o escopo da sprint em andamento pede confirmação
  const ativa = await sq.evaluate(() => window.__qt.db.sprints.find(s => s.state === 'active').id);
  sq.once('dialog', d => d.dismiss());
  const n0 = await sq.evaluate(([id, a]) => window.__qt.rMudarSprint([id], a), [c75, ativa]);
  ok(n0 === 0, 'levar card para a sprint em andamento pergunta antes (cancelado, nada muda)');
  // planejar a sprint
  await sq.click('[data-act=rStep][data-v=plan]'); await sq.waitForSelector('.rplan');
  const naAntes = await sq.locator('.rplan .rpane').nth(0).locator('.rrow').count();
  const traz = sq.locator('.rplan [data-act=rTrazer]').first();
  if (await traz.count()) await traz.click();
  ok(await sq.locator('.rplan .rpane').nth(0).locator('.rrow').count() === naAntes + 1, 'Trazer coloca um card pronto na sprint');
  await sq.fill('.rplan [data-rsf=goal]', 'Contratação em homologação'); await sq.press('.rplan [data-rsf=goal]', 'Tab');
  await sq.fill('.rplan [data-rsf=capacity]', '9'); await sq.press('.rplan [data-rsf=capacity]', 'Tab');
  const pl = await sq.evaluate(id => { const s = window.__qt.db.sprints.find(x => x.id === id); return { goal: s.goal, cap: s.capacity }; }, sp[0].id);
  ok(pl.goal === 'Contratação em homologação' && pl.cap?.value === 9 && pl.cap.unit === 'cards', 'objetivo e capacidade gravados na sprint');
  ok(await sq.locator('.rplan:has-text("O que a Central vai ver")').count() === 1 && await sq.locator('.rplan [data-act=rIniciar]').count() === 0, 'com uma sprint em andamento, Iniciar fica para depois de fechá-la');
  // fechar a sprint em andamento com objetivo e comentário, depois iniciar a planejada
  await sq.evaluate(id => { const s = window.__qt.db.sprints.find(x => x.id === id); s.goal = 'Simulação pronta'; }, ativa);
  await sq.evaluate(() => { const bs = [...document.querySelectorAll('[data-act=view][data-v=sprints]')]; (bs.find(b => b.offsetParent) || bs[0]).click(); });
  await sq.click(`[data-act=closeSprint][data-id="${ativa}"]`); await sq.waitForSelector('#goalMet');
  await sq.click('#goalMet [data-v=partly]'); await sq.fill('#sprNote', 'Parceiro atrasou o contrato.');
  await sq.click(`#dlg [data-act=doClose][data-id="${ativa}"]`); await sq.waitForTimeout(100); await sq.keyboard.press('Escape');
  const fe = await sq.evaluate(id => { const s = window.__qt.db.sprints.find(x => x.id === id); return { g: s.goalMet, n: s.note, st: s.state, co: s.result.carriedOver }; }, ativa);
  ok(fe.g === 'partly' && fe.n === 'Parceiro atrasou o contrato.' && fe.st === 'closed' && fe.co >= 0, 'Fechar sprint grava objetivo atingido, a linha sobre a sprint e o que ficou aberto');
  await sq.evaluate(() => { const bs = [...document.querySelectorAll('[data-act=view][data-v=refine]')]; (bs.find(b => b.offsetParent) || bs[0]).click(); });
  await sq.click('[data-act=rStep][data-v=plan]'); await sq.waitForSelector('[data-act=rIniciar]');
  const esp = await sq.evaluate(id => window.__qt.db.cards.filter(c => c.sprintId === id && !c.cancelledAt && !c.deleted && c.col !== 'concluido').length, sp[0].id);
  await sq.click('[data-act=rIniciar]');
  const ini2 = await sq.evaluate(id => { const s = window.__qt.db.sprints.find(x => x.id === id); return { st: s.state, n: s.committed.length }; }, sp[0].id);
  ok(ini2.st === 'active' && ini2.n === esp && esp > naAntes, 'Iniciar a sprint grava o compromisso com os cards planejados (e os que vieram da anterior)');
  const novaS = await sq.evaluate(() => { const db = window.__qt.db; db.settings.refinement.cadenceDays = 7; document.querySelector('[data-act=rNovaSprint]').click(); const s = db.sprints.at(-1); return Math.round((new Date(s.end) - new Date(s.start)) / 864e5) + 1; });
  ok(novaS === 7, '+ Sprint usa a duração definida em Ajustes › Refinamento');
  await sq.screenshot({ path: path.join(RAIZ, 'financas', 'testes', 'saida', 'quadro-desenhar-sprints.png') }).catch(() => {});

  console.log('8. Sprint sincronizada com a Central (contratos 1.2)');
  const V = require(path.join(RAIZ, 'contratos', 'validar.js'));
  const s8 = await sq.evaluate(() => { const q = window.__qt, s = q.buildStatus(20, '2026-11-26T10:00:00-03:00'); return { s, er: q.validar(s) }; });
  const conf = p => [...V.porSchema(p, p.schema), ...V.regrasDoConteudo(p, null).erros];
  ok(!s8.er.length && !conf(s8.s).length, 'status.json com sprints[] válido no Quadro e no validador dos contratos' + (s8.er.length || conf(s8.s).length ? ': ' + [...s8.er, ...conf(s8.s)].join('; ') : ''));
  const sAt = (s8.s.sprints || []).find(s => s.state === 'active'), sFe = (s8.s.sprints || []).find(s => s.state === 'closed');
  ok(sAt && sAt.localId === sp[0].id && sAt.goal === 'Contratação em homologação' && sAt.committed === ini2.n && sAt.capacity?.value === 9, 'a sprint em andamento vai com objetivo, compromisso e capacidade');
  ok(sFe && sFe.localId === ativa && sFe.doneCommitted <= sFe.committed, 'a última sprint fechada vai junto, com compromisso × cumprido');
  ok((s8.s.sprints || []).filter(s => s.state === 'active').length === 1 && s8.s.sprints.length <= 8, 'no máximo uma sprint em andamento e 8 no total');
  const itS = s8.s.initiatives.flatMap(i => i.items || []).filter(i => i.sprintLocalId);
  ok(itS.length > 0 && itS.every(i => s8.s.sprints.some(s => s.localId === i.sprintLocalId)), 'cards levam sprintLocalId da sprint em que estão');
  ok(s8.s.initiatives.flatMap(i => i.features || []).filter(f => f.forecastEnd).every(f => ['sprints', 'due'].includes(f.forecastBasis)), 'previsão da feature diz de onde veio (forecastBasis)');
  // fechar a sprint gera o resultado que vai no metricas.json
  await sq.evaluate(id => { const s = window.__qt.db.sprints.find(x => x.id === id); s.goal = 'Contratação em homologação'; }, sp[0].id);
  await sq.evaluate(() => { const bs = [...document.querySelectorAll('[data-act=view][data-v=sprints]')]; (bs.find(b => b.offsetParent) || bs[0]).click(); });
  await sq.click(`[data-act=closeSprint][data-id="${sp[0].id}"]`); await sq.waitForSelector('#goalMet');
  await sq.click('#goalMet [data-v=yes]'); await sq.fill('#sprNote', 'Contratação liberada.');
  await sq.click(`#dlg [data-act=doClose][data-id="${sp[0].id}"]`); await sq.waitForSelector('[data-act=confirmPubMetrics]');
  const m8 = await sq.evaluate(id => { const q = window.__qt, s = q.db.sprints.find(x => x.id === id), r = q.sprintResultadoPub(s), m = q.buildMetrics(21, '2026-11-26T10:05:00-03:00', r); return { r, m, er: q.validar(m) }; }, sp[0].id);
  await sq.keyboard.press('Escape');
  ok(!m8.er.length && !conf(m8.m).length, 'metricas.json com o resultado da sprint válido' + (m8.er.length || conf(m8.m).length ? ': ' + [...m8.er, ...conf(m8.m)].join('; ') : ''));
  ok(m8.r.localId === sp[0].id && m8.r.goalMet === 'yes' && m8.r.note === 'Contratação liberada.' && m8.r.committed === ini2.n && m8.r.deliveredCommitted <= m8.r.committed && m8.r.delivered >= 0 && m8.r.carriedOver >= 0 && m8.r.capacity?.value === 9, 'o resultado leva objetivo atingido, a linha, compromisso × cumprido e capacidade');
  const og = m8.m.metrics.find(x => x.standard === 'sprint_goal_met');
  ok(og && og.data.series[0].points.some(p => p.v === 100) && og.data.series[0].points.some(p => p.v === 50), 'métrica nova "Objetivo da sprint atingido" (atingido 100, em parte 50)');

  console.log('9. Central 15.19: aba Sprints do time, histórico e alertas');
  const pc9 = await nova('/' + central);
  const c9 = await pc9.evaluate(([st, mt]) => {
    const chk = igCheckStatus(st).payload, mm = igCheckMetrics(mt).payload;
    const fx = chk.initiatives.flatMap(i => i.features || []).find(f => f.forecastEnd);
    const t = { id: 't1', slug: 'pagamentos', name: 'Pagamentos' }, ini = { id: 'i1', ref: 'PAG-042', name: 'Pix parcelado', teamId: 't1', bucket: 'now', start: '2026-10-01', end: '2026-12-20', phases: [], dependsOn: [], updates: [] };
    db = normalizeDb(emptyDb()); db.teams = [t]; db.initiatives = [ini]; db.tasks = fx ? [{ id: 'f1', type: 'feature', ref: fx.ref, initiativeId: 'i1', title: 'Contratação no app', end: '2026-01-05', assigneeId: '', start: '' }] : [];
    db.integ.received = { pagamentos: { status: { payload: chk, at: st.generatedAt, rev: st.revision } } }; db.integ.sprintHist = {};
    spGuardar('pagamentos', 'status', chk); spGuardar('pagamentos', 'metricas', mm);
    const x = spDoTime('t1'), html = tmSprintsHTML('t1');
    let rendered = false; try { $('#lock').classList.add('hidden'); $('#app').classList.remove('hidden'); teamSel = 't1'; tmView = 'sprints'; go('team'); renderTeam(); rendered = !!document.querySelector('#team .sp-tbl') && document.querySelector('#team [data-v=sprints]').classList.contains('on'); } catch (e) { rendered = e.stack.split('\n').slice(0,3).join(' | '); }
    return { nSp: chk.sprints.length, ativa: x.ativa?.name || null, hist: x.hist.map(h => ({ n: h.name, m: !!h.fromMetrics, g: h.goalMet, c: h.committed, d: h.deliveredCommitted, note: h.note })), html, home: spHomeCard(), meet: spMeetBlock('t1'), ds: db.tasks[0] ? igFeatDs(db.tasks[0]) : '', fx: !!fx, rendered, mmSprint: mm.sprint };
  }, [s8.s, m8.m]).catch(e => ({ erro: e.message + ' ' + e.stack }));
  ok(!c9.erro && c9.nSp === s8.s.sprints.length && c9.mmSprint?.goalMet === 'yes' && c9.mmSprint.committed === m8.r.committed, 'Central lê sprints[] do backlog e o resultado da sprint das métricas' + (c9.erro ? ': ' + c9.erro : ''));
  const hFe = (c9.hist || []).find(h => h.n === m8.r.name);
  ok(hFe && hFe.m && hFe.g === 'yes' && hFe.note === 'Contratação liberada.' && hFe.c === m8.r.committed && (c9.hist || []).length >= 2, 'a Central guarda o histórico das sprints (do backlog e das métricas)');
  ok(c9.html && c9.html.includes('Sprints fechadas') && c9.html.includes('Contratação liberada.') && c9.html.includes('atingido') && c9.html.includes('compromisso cumprido'), 'aba Sprints mostra as sprints fechadas com compromisso × cumprido, objetivo e a linha');
  ok(!c9.fx || (c9.html.includes('Previsão × prazo') && /depois do prazo/.test(c9.home)), 'previsão depois do prazo aparece na aba e no card de Hoje');
  ok(c9.rendered === true, 'a aba Sprints abre na visão do time' + (c9.rendered !== true ? ': ' + c9.rendered : ''));
  await pc9.screenshot({ path: path.join(RAIZ, 'financas', 'testes', 'saida', 'central-sprints.png'), fullPage: true }).catch(() => {});

  ok(!erros.length, 'sem erros de JavaScript' + (erros.length ? ': ' + erros.join(' | ') : ''));
  await browser.close(); srv.close();
  console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : '\nTodas as verificações passaram.');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

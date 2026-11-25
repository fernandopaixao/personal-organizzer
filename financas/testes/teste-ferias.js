// Teste de ponta a ponta do Mapa de Férias (ferias/ferias.html): time → gestor → liderança.
// Uso: node financas/testes/teste-ferias.js   (precisa do Playwright e do Chromium instalados)
// Como no teste das finanças, os seletores de pasta são trocados por pastas do OPFS do navegador.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const RAIZ = path.resolve(__dirname, '..', '..');
const SENHA = 'senha-de-teste-123';
let falhas = 0;
const ok = (c, msg) => { console.log((c ? '  ok  ' : '  FALHOU  ') + msg); if (!c) falhas++; };
const chave = kid => `GK1.${kid}.${crypto.randomBytes(32).toString('base64url')}`;

const srv = http.createServer((q, r) => {
  const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); fs.createReadStream(f).pipe(r);
});
const stub = mapa => `(() => { const M = ${JSON.stringify(mapa)};
  const put0 = IDBObjectStore.prototype.put; IDBObjectStore.prototype.put = function (v, k) { return put0.call(this, (typeof FileSystemHandle !== 'undefined' && v instanceof FileSystemHandle) ? null : v, k); };
  const dir = async nome => { let d = await navigator.storage.getDirectory(); for (const p of nome.split('/')) d = await d.getDirectoryHandle(p, { create: true }); return d; };
  window.showDirectoryPicker = async ({ id } = {}) => dir(M[id] || id);
})();`;
async function opfs(page, fn, ...args) { return page.evaluate(new Function('args', `return (async () => { const raiz = await navigator.storage.getDirectory();
  const dir = async (c, criar = false) => { let d = raiz; for (const p of c.split('/').filter(Boolean)) d = await d.getDirectoryHandle(p, { create: criar }); return d; };
  const ler = async (c, n) => { try { return await (await (await dir(c)).getFileHandle(n)).getFile().then(f => f.text()); } catch { return null; } };
  const listar = async c => { const o = []; try { for await (const [n] of (await dir(c)).entries()) o.push(n); } catch {} return o.sort(); };
  return (${fn})(...args); })()`), args); }
const btn = (p, r) => p.click(`#dlg [data-r="${r}"]`);
async function cofre(p) { await p.waitForSelector('#cofreOk'); await p.check('#cofreOk'); await p.click('#cofreBtn'); }
async function criarSenha(p) { await p.fill('#s1', SENHA); await p.fill('#s2', SENHA); await p.click('#sOk'); await cofre(p); }
const iso = d => d.toISOString().slice(0, 10);
const daqui = n => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const br = d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
// Segunda-feira daqui a ~3 semanas: datas sempre no futuro, independentes do dia em que o teste roda.
const seg = (() => { const d = daqui(21); d.setDate(d.getDate() + ((8 - d.getDay()) % 7)); return d; })();
const dia = n => { const d = new Date(seg); d.setDate(d.getDate() + n); return d; };

(async () => {
  await new Promise(r => srv.listen(0, r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();
  const ctxB = await browser.newContext();
  const erros = [];
  const nova = async (local) => { const p = await ctxB.newPage(); p.on('pageerror', e => erros.push(local + ': ' + e.message)); await p.addInitScript(stub({ 'ferias-local': local, 'ferias-comum': 'Gestao-Compartilhado' })); await p.goto(base + '/ferias/ferias.html'); return p; };
  async function criar(p, tipo, nome, slug, pessoa) {
    await p.click(tipo === 'grupo' ? '#iGrupo' : '#iTime'); await p.fill('#cN', nome); await p.fill('#cS', slug); await p.fill('#cP', pessoa); await p.click('#cOk');
    await btn(p, 'ok'); await criarSenha(p); await p.waitForSelector('#tNova');
  }
  async function ligar(p) { await p.click('[data-v="ajustes"]'); await p.click('#jPasta'); await p.waitForTimeout(150); if (await p.$('#dlg[open] [data-r="ok"]')) await btn(p, 'ok'); await p.waitForTimeout(300); }
  async function colarMinha(p, k) { await p.click('[data-v="ajustes"]'); await p.fill('#jCh', k); await p.click('#jChOk'); await cofre(p); await p.waitForTimeout(400); }
  const kTime = chave('pagamentos-2611'), kGrupo = chave('tecnologia-fin-2611');

  console.log('1. Time: Ana cria o arquivo, marca férias pela barra rápida e publica sozinha');
  const ana = await nova('LocalAna');
  ok(await ana.title() === 'Mapa de Férias', 'título reconhecido pelo hub');
  await criar(ana, 'time', 'Pagamentos', 'pagamentos', 'Ana Souza');
  const cab = JSON.parse(await opfs(ana, async () => ler('LocalAna', 'ferias-pagamentos.json')));
  ok(cab.schema === 'gestao-local-cifrado/1' && cab.app === 'ferias' && cab.kdf.iter === 600000 && !JSON.stringify(cab).includes('Ana'), 'arquivo local cifrado, sem texto em claro');
  await ligar(ana);
  await ana.fill('#jCh', chave('outro-time-2611')); await ana.click('#jChOk'); await cofre(ana); await ana.waitForTimeout(200);
  ok(!(await ana.textContent('#pg')).includes('outro-time-2611') && (await ana.$$eval('.toast', x => x.map(t => t.textContent).join(' '))).includes('não é de "pagamentos"'), 'chave de outro time recusada');
  await colarMinha(ana, kTime);
  await ana.click('[data-v="pessoas"]');
  await ana.fill('#qk', `Ana ${br(dia(0))} a ${br(dia(11))} férias`); await ana.press('#qk', 'Enter');
  ok(await ana.inputValue('#aI') === iso(dia(0)) && await ana.inputValue('#aF') === iso(dia(11)), 'barra rápida interpreta o período');
  await ana.fill('#aN', 'viagem para a praia'); await ana.click('#aOk');
  await ana.waitForTimeout(3500);
  const arqsTime = await opfs(ana, async () => listar('Gestao-Compartilhado/times/pagamentos/ferias'));
  const arqAna = arqsTime.find(n => n.startsWith('ana-'));
  ok(!!arqAna, 'time publica sozinho em times/pagamentos/ferias/<pessoa>-<computador>.json');
  const envAna = await opfs(ana, async n => ler('Gestao-Compartilhado/times/pagamentos/ferias', n), arqAna);
  ok(envAna && JSON.parse(envAna).schema === 'gestao-envelope/1' && !envAna.includes('praia') && !envAna.includes('Souza'), 'publicado cifrado com a chave do time, sem a nota');

  console.log('2. Time: Bruno cadastra no próprio arquivo e vê as férias da Ana somadas');
  const bruno = await nova('LocalBruno');
  await criar(bruno, 'time', 'Pagamentos', 'pagamentos', 'Bruno Lima');
  await ligar(bruno); await colarMinha(bruno, kTime);
  await bruno.click('#tNova'); await bruno.fill('#aI', iso(dia(7))); await bruno.dispatchEvent('#aI', 'change'); await bruno.fill('#aF', iso(dia(9))); await bruno.dispatchEvent('#aF', 'change');
  ok(/já há <b>1<\/b> outra/.test(await bruno.innerHTML('#aImp')) || /1<\/b> outra/.test(await bruno.innerHTML('#aImp')), 'impacto mostra a Ana fora no período');
  await bruno.click('#aSug'); ok(await bruno.$$eval('[data-sg]', x => x.length) >= 1, 'sugere períodos com menos gente fora');
  await bruno.click('#aOk'); await bruno.waitForTimeout(3500);
  await bruno.click('[data-v="calendario"]');
  for (let i = 0; i < 3 && !(await bruno.textContent('.tl')).includes('Ana Souza'); i++) await bruno.click('#cProx');
  ok((await bruno.textContent('.tl')).includes('Ana Souza'), 'calendário do Bruno mostra a Ana (lida da pasta)');

  console.log('3. Gestor: soma o time, cadastra as próprias férias e publica para a liderança');
  const fer = await nova('LocalFernando');
  await criar(fer, 'grupo', 'Tecnologia', 'tecnologia', 'Fernando');
  ok(await fer.$('[data-v="unidades"]') !== null, 'gestor tem a aba Unidades');
  await ligar(fer);
  await fer.click('[data-v="unidades"]'); await fer.click('#uNovo'); await fer.fill('#uN', 'Pagamentos'); await fer.click('#uOk');
  await fer.click('[data-ch="pagamentos"]'); await fer.fill('#kT', kTime); await btn(fer, 'ok'); await cofre(fer); await fer.waitForTimeout(600);
  ok(/2 pessoas · 2 ausências/.test(await fer.textContent('#pg')), 'unidade pagamentos lida: 2 pessoas e 2 ausências');
  await fer.click('#tNova'); await fer.fill('#aI', iso(dia(8))); await fer.dispatchEvent('#aI', 'change'); await fer.fill('#aF', iso(dia(8))); await fer.dispatchEvent('#aF', 'change'); await fer.selectOption('#aT', 'folga'); await fer.click('#aOk');
  await fer.click('[data-v="painel"]');
  const painel = await fer.textContent('#pg');
  ok(/3 fora/.test(painel), 'mapa mostra o pico de 3 pessoas fora no mesmo dia');
  ok(/Dias acima de 30% fora/.test(painel) && (await fer.$$('.hm .d.over')).length >= 1, 'mapa de calor marca os dias acima do limite');
  await fer.click(`[data-dia="${iso(dia(8))}"]`);
  const dd = await fer.textContent('#dlg');
  ok(dd.includes('Ana Souza') && dd.includes('Bruno Lima') && dd.includes('Fernando'), 'detalhe do dia lista quem está fora');
  await fer.click('#dlg .mf .pri');
  await fer.selectOption('#tUn', 'pagamentos'); ok(/\/ 2/.test(await fer.textContent('.ins.hi')), 'filtro por unidade');
  await fer.selectOption('#tUn', '');
  await colarMinha(fer, kGrupo);
  await fer.click('#jPub'); const pubTxt = await fer.textContent('#dlg'); await btn(fer, 'ok'); await fer.waitForTimeout(500);
  ok(/Pessoas3/.test(pubTxt.replace(/\s/g, '')) && pubTxt.includes('Pagamentos'), 'confere o que sobe antes de publicar');
  const arqsG = await opfs(fer, async () => listar('Gestao-Compartilhado/grupos/tecnologia/ferias'));
  ok(arqsG.some(n => n.startsWith('fernando-')), 'consolidado em grupos/tecnologia/ferias/ com a mesma chave das Finanças do Grupo');

  console.log('4. Liderança: soma o grupo do gestor como uma unidade (níveis)');
  const car = await nova('LocalCarla');
  await criar(car, 'grupo', 'Diretoria', 'diretoria', 'Carla');
  await ligar(car);
  await car.click('[data-v="unidades"]'); await car.click('#uNovoG'); await car.fill('#uN', 'Tecnologia'); await car.click('#uOk');
  await car.click('[data-ch="tecnologia"]'); await car.fill('#kT', kGrupo); await btn(car, 'ok'); await cofre(car); await car.waitForTimeout(600);
  ok(/3 pessoas · 3 ausências/.test(await car.textContent('#pg')), 'liderança lê o consolidado do gestor: 3 pessoas e 3 ausências');
  await car.click('[data-v="painel"]');
  ok(/3 fora/.test(await car.textContent('#pg')), 'liderança vê o mesmo pico de 3 pessoas');
  await car.click(`[data-dia="${iso(dia(8))}"]`);
  ok((await car.textContent('#dlg')).includes('Pagamentos'), 'liderança vê a unidade de origem de cada pessoa');
  await car.click('#dlg .mf .pri');

  console.log('5. Reabrir com a senha e migração');
  const ana2 = await nova('LocalAna');
  await ana2.click('#iAbrir'); await ana2.waitForSelector('#pw'); await ana2.fill('#pw', SENHA); await btn(ana2, 'ok');
  await ana2.waitForSelector('#tNova'); await ana2.click('[data-v="pessoas"]');
  ok((await ana2.textContent('#pg')).includes('Férias'), 'reabre o arquivo e mantém as férias');

  console.log('6. Central 15.10: férias dentro da Central (ADR-0033) e só o gestor cadastra (ADR-0035)');
  const kProd = chave('produto-fin-2611');
  const novaC = async () => { const p = await ctxB.newPage(); p.on('pageerror', e => erros.push('central: ' + e.message)); await p.goto(base + '/gestao_pessoal_v15.html');
    await p.evaluate(async k => { db = normalizeDb(Object.assign(emptyDb(), { settings: { selfName: 'Paula' }, teams: [{ id: 't1', name: 'Pagamentos', prefix: 'PAG', slug: 'pagamentos', createdAt: Date.now() }, { id: 't2', name: 'Sem pasta', createdAt: Date.now() }],
      people: [{ id: 'pe1', name: 'Diego Alves', teamIds: ['t1'] }, { id: 'pe2', name: 'Eva Dias', teamIds: ['t2'] }, { id: 'pe3', name: 'Gil Rocha', teamIds: [] }] }));
      igFinalize(db); db.integ.keys.t1 = [{ key: k, createdAt: '2026-11-01' }]; password = 'senha-da-central'; enter();
      let d = await navigator.storage.getDirectory(); IG.dir = await d.getDirectoryHandle('Gestao-Compartilhado'); IG.dirName = IG.dir.name; }, kTime);
    return p; };
  const quadroF = async p => { await p.waitForSelector('#ferias iframe'); const f = await (await p.$('#ferias iframe')).contentFrame(); await f.waitForSelector('#app > *'); return f; };
  const cen = await novaC();
  ok(await cen.evaluate(() => NAV.some(n => n.k === 'ferias') && !!document.querySelector('[data-go="ferias"]')), 'Central tem a página Férias no menu');
  await cen.click('[data-go="ferias"]'); let fc = await quadroF(cen);
  ok(await fc.evaluate(() => !!HOST && document.documentElement.classList.contains('embutido') && !document.getElementById('iAbrir')), 'abre dentro da Central, sem tela de arquivo nem de senha');
  ok(await fc.inputValue('#eP') === 'Paula', 'seu nome vem da Central');
  await fc.fill('#eN', 'Produto'); await fc.fill('#eP', 'Paula'); await fc.click('#eOk'); await fc.waitForSelector('#tNova'); await fc.waitForTimeout(800);
  ok(await cen.evaluate(() => db.ferias?.nivel === 'grupo' && db.ferias.unidade.slug === 'produto' && db.ferias.unidades.map(u => u.slug + ':' + u.origem + ':' + u.chaves.length).sort().join() === 'pagamentos:central:1,sem-pasta:central:0'), 'dados guardados no arquivo da Central; todos os times entram (chave da Integração quando houver)');
  ok(await cen.evaluate(() => db.ferias.pessoas.map(p => p.nome + '@' + (p.un || '')).sort().join() === 'Diego Alves@pagamentos,Eva Dias@sem-pasta,Gil Rocha@,Paula@'), 'pessoas da Central entram com o time delas');
  await fc.click('[data-v="unidades"]'); ok(/2 pessoas · 2 ausências/.test(await fc.textContent('#pg')), 'o que outra solução do time publica na pasta ainda soma: 2 pessoas e 2 ausências');
  ok(!(await fc.$('#tHub')) && !(await fc.$('#uNovo')) && !(await fc.$('#uHub')), 'sem "← Hub" e sem cadastro manual de times: a Central já cuida');
  const hoje = iso(new Date());
  await fc.click('#tNova'); await fc.fill('#aI', hoje); await fc.dispatchEvent('#aI', 'change'); await fc.fill('#aF', hoje); await fc.dispatchEvent('#aF', 'change'); await fc.selectOption('#aT', 'folga'); await fc.fill('#aN', 'consulta particular'); await fc.click('#aOk'); await fc.waitForTimeout(1300);
  ok(await cen.evaluate(() => db.ferias.ausencias.length === 1 && db.ferias.ausencias[0].nota === 'consulta particular'), 'ausência com nota guardada na Central');
  await fc.click('[data-v="pessoas"]');
  ok(/Pagamentos/.test(await fc.textContent('#pg')) && /Você e diretos/.test(await fc.textContent('#pg')), 'aba Pessoas agrupa por time');
  await fc.fill('#qk', `Diego ${br(dia(8))} férias`); await fc.press('#qk', 'Enter'); await fc.click('#aOk'); await fc.waitForTimeout(1300);
  const pl = await fc.evaluate(() => { const p = montarPayload({ revision: 0, generatedAt: '', hlc: '' }); return { d: p.people.find(x => x.name === 'Diego Alves'), a: p.absences.filter(x => x.person === 'pagamentos.diego-alves').length, ana: p.people.filter(x => x.name === 'Ana Souza').length }; });
  ok(pl.d?.unit === 'pagamentos' && pl.d.id === 'pagamentos.diego-alves' && pl.a === 1 && pl.ana === 1, 'o gestor marca as férias de quem é do time: sobem na unidade do time, somando sem duplicar com o que já está na pasta');
  await fc.click('[data-v="painel"]');
  ok(/3 fora/.test(await fc.textContent('#pg')) && !/Sem pasta: /.test(await fc.textContent('#pg')), 'mapa soma Diego com o que o time já publicou, sem alerta para time que não publica');
  await colarMinha(fc, kProd);
  await fc.click('#jPub'); await btn(fc, 'ok'); await fc.waitForTimeout(600);
  const arqsP = await opfs(cen, async () => listar('Gestao-Compartilhado/grupos/produto/ferias'));
  ok(arqsP.some(n => n.startsWith('paula-')), 'publica o consolidado em grupos/produto/ferias/ como antes (mesmo contrato)');
  const envP = await opfs(cen, async n => ler('Gestao-Compartilhado/grupos/produto/ferias', n), arqsP.find(n => n.startsWith('paula-')));
  ok(envP && !envP.includes('consulta'), 'a nota não sai da Central');
  // Times da Central mudam: a página Férias acompanha ao voltar para ela
  await cen.evaluate(k => { db.teams.push({ id: 't3', name: 'Cartões', prefix: 'CAR', slug: 'cartoes', createdAt: Date.now() }); db.integ.keys.t3 = [{ key: k, createdAt: '2026-11-01' }]; go('home'); }, chave('cartoes-2611'));
  ok(/Fora hoje/.test(await cen.textContent('#home')) && /Paula/.test(await cen.textContent('#home')), 'página Hoje da Central mostra quem está fora hoje');
  await cen.click('[data-go="ferias"]'); await cen.waitForTimeout(800);
  ok(await cen.evaluate(() => db.ferias.unidades.map(u => u.slug).sort().join() === 'cartoes,pagamentos,sem-pasta'), 'time novo na Central entra sozinho nas férias');
  await cen.setViewportSize({ width: 1280, height: 860 }); await fc.click('[data-v="painel"]'); await cen.waitForTimeout(300);
  if (process.env.TELAS) await cen.screenshot({ path: process.env.TELAS });
  // Migração: quem usava o Mapa de Férias separado traz o arquivo para a Central
  const cen2 = await novaC(); await cen2.click('[data-go="ferias"]'); const fc2 = await quadroF(cen2);
  await fc2.evaluate(() => { window.showOpenFilePicker = async () => { const d = await (await navigator.storage.getDirectory()).getDirectoryHandle('LocalFernando'); return [await d.getFileHandle('ferias-tecnologia.json')]; }; });
  await fc2.click('#eAntigo'); await fc2.waitForSelector('#pw'); await fc2.fill('#pw', SENHA); await btn(fc2, 'ok'); await fc2.waitForSelector('#tNova'); await fc2.waitForTimeout(600);
  ok(await cen2.evaluate(() => db.ferias.unidade.slug === 'tecnologia' && db.ferias.pessoas.some(p => p.nome === 'Fernando') && db.ferias.ausencias.length === 1 && db.ferias.chaves.length === 1), 'traz pessoas, ausências e a chave do nível acima do Mapa de Férias separado');
  ok(await cen2.evaluate(() => db.ferias.unidades.filter(u => u.slug === 'pagamentos').length === 1 && db.ferias.unidades.find(u => u.slug === 'pagamentos').origem === 'central'), 'o time que já estava no arquivo antigo vira o time da Central, sem duplicar');

  ok(!erros.length, 'sem erros de JavaScript' + (erros.length ? ': ' + erros.join(' | ') : ''));
  await browser.close(); srv.close();
  console.log(falhas ? `\n${falhas} falha(s).` : '\nTudo certo.');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

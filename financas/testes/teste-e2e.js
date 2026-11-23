// Teste de ponta a ponta das ferramentas de finanças e do assistente inicial.
// Uso: node financas/testes/teste-e2e.js   (precisa do Playwright e do Chromium instalados)
// Os seletores de pasta são trocados por pastas do sistema de arquivos privado do navegador (OPFS),
// então o teste roda sem diálogos. Simula também cópias de conflito do OneDrive e arquivo truncado.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..'), SAIDA = path.join(RAIZ, 'financas', 'testes', 'saida');
fs.mkdirSync(SAIDA, { recursive: true });
const SENHA = 'senha-de-teste-123', SENHA2 = 'outra-senha-456!';
let falhas = 0;
const ok = (c, msg) => { console.log((c ? '  ok  ' : '  FALHOU  ') + msg); if (!c) falhas++; };

const srv = http.createServer((q, r) => {
  const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});

// Cada página escolhe pastas do OPFS: o id do seletor aponta para um nome de pasta.
const stub = mapa => `(() => { const M = ${JSON.stringify(mapa)};
  const raiz = () => navigator.storage.getDirectory();
  const dir = async nome => { let d = await raiz(); for (const p of nome.split('/')) d = await d.getDirectoryHandle(p, { create: true }); return d; };
  window.showDirectoryPicker = async ({ id } = {}) => dir((window.__M || M)[id] || id);
  window.showOpenFilePicker = async () => { const n = window.__abrir; const d = await dir(n.dir); return [await d.getFileHandle(n.arq)]; };
})();`;

async function opfs(page, fn, ...args) { return page.evaluate(new Function('args', `return (async () => { const raiz = await navigator.storage.getDirectory();
  const dir = async (c, criar = false) => { let d = raiz; for (const p of c.split('/').filter(Boolean)) d = await d.getDirectoryHandle(p, { create: criar }); return d; };
  const ler = async (c, n) => { try { return await (await (await dir(c)).getFileHandle(n)).getFile().then(f => f.text()); } catch { return null; } };
  const gravar = async (c, n, t) => { const w = await (await (await dir(c, true)).getFileHandle(n, { create: true })).createWritable(); await w.write(t); await w.close(); };
  const listar = async c => { const o = []; try { for await (const [n] of (await dir(c)).entries()) o.push(n); } catch {} return o.sort(); };
  return (${fn})(...args); })()`), args); }

const btn = (page, r) => page.click(`#dlg [data-r="${r}"]`);
async function criarSenha(page, senha = SENHA) {
  await page.fill('#s1', senha); await page.fill('#s2', senha); await page.click('#sOk');
  await page.check('#cofreOk'); await page.click('#cofreBtn');
}
async function cofre(page) { await page.waitForSelector('#cofreOk'); await page.check('#cofreOk'); await page.click('#cofreBtn'); }
async function senhaAbrir(page, senha = SENHA) { await page.waitForSelector('#pw'); await page.fill('#pw', senha); await btn(page, 'ok'); }

(async () => {
  await new Promise(r => srv.listen(0, r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();
  const ctxB = await browser.newContext({ acceptDownloads: true });
  const erros = [];
  const nova = async (url, mapa) => { const p = await ctxB.newPage(); p.on('pageerror', e => erros.push(url + ': ' + e.message)); await p.addInitScript(stub(mapa)); await p.goto(base + url); return p; };

  console.log('1. Finanças do Grupo: criar arquivo, time, chave, diretriz e HTML do time');
  const g = await nova('/financas/financas_grupo.html', { 'fin-local': 'LocalGestor', 'fin-comum': 'Gestao-Compartilhado' });
  await g.click('#iNovo'); await g.fill('#cN', 'Tecnologia'); await g.fill('#cP', 'Fernando'); await g.fill('#cA', '2026'); await g.click('#cOk');
  await btn(g, 'ok'); await btn(g, 'ok'); await criarSenha(g);
  await g.waitForSelector('#tNovo');
  ok((await opfs(g, async () => listar('LocalGestor'))).includes('financas-grupo-tecnologia.json'), 'arquivo do grupo criado na pasta local');
  const cab = JSON.parse(await opfs(g, async () => ler('LocalGestor', 'financas-grupo-tecnologia.json')));
  ok(cab.schema === 'gestao-local-cifrado/1' && cab.kdf.iter === 600000 && !JSON.stringify(cab).includes('Tecnologia'), 'arquivo local cifrado (PBKDF2 600k, sem texto em claro)');
  await g.click('#tNovo'); await g.fill('#mN', 'Pagamentos'); await g.fill('#mP', 'PAG'); await g.fill('#mT', '1.000.000'); await g.fill('[data-cap="terceiros"]', '700 mil'); await g.click('#mOk');
  await g.click('[data-gk="pagamentos"]');
  await g.waitForSelector('#cofreOk'); const chave = await g.inputValue('#dlg input.code'); await cofre(g);
  ok(/^GK1\.pagamentos-fin-\d{4}\.[A-Za-z0-9_-]{43}$/.test(chave), 'chave de finanças gerada com aviso de cofre: ' + chave.slice(0, 24) + '…');
  await g.click('#tPasta'); await btn(g, 'ok');
  await g.waitForTimeout(300);
  await g.click('[data-pd="pagamentos"]'); await g.waitForTimeout(400);
  const dirs = await opfs(g, async () => listar('Gestao-Compartilhado/grupo/financas'));
  ok(dirs.includes('diretriz-pagamentos.json'), 'diretriz publicada em grupo/financas/');
  ok((await opfs(g, async () => listar('Gestao-Compartilhado'))).includes('LEIA-ME.md'), 'LEIA-ME criado na pasta comum');
  await g.click('[data-ht="pagamentos"]'); await g.check('#hCh'); await btn(g, 'ok');
  await g.waitForSelector('#cofreOk'); const txtHtml = await g.textContent('#dlg .cofre');
  const [dl] = await Promise.all([g.waitForEvent('download'), (async () => { await g.check('#cofreOk'); await g.click('#cofreBtn'); })()]);
  ok(/chave do time embutida/.test(txtHtml), 'aviso de cofre ao gerar HTML com chave');
  const htmlTime = path.join(SAIDA, 'financas_pagamentos.html'); await dl.saveAs(htmlTime);
  ok(fs.readFileSync(htmlTime, 'utf8').includes('"slug":"pagamentos"'), 'HTML do time gerado com pré-configuração');

  console.log('2. Finanças do Time (HTML gerado): criar, plano, lançamentos, publicar');
  const t = await nova('/financas/testes/saida/financas_pagamentos.html', { 'fin-local': 'LocalAna', 'fin-comum': 'Gestao-Compartilhado' });
  ok(/Pré-configurado pelo gestor/.test(await t.textContent('body')), 'tela inicial mostra pré-configuração');
  await t.click('#iNovo'); ok(await t.isDisabled('#cN'), 'nome do time travado pela pré-configuração');
  await t.fill('#cP', 'Ana Souza'); await t.click('#cOk'); await btn(t, 'ok'); await btn(t, 'ok'); await criarSenha(t);
  await cofre(t); // chave do preset
  await t.waitForSelector('#pNova');
  await t.click('#pNova'); await t.fill('#nN', 'Squad terceirizado'); await t.selectOption('#nC', 'terceiros'); await t.fill('#nI', 'PAG-042'); await t.fill('#nOM', '50.000'); await t.click('#nOk');
  await t.click('#pNova'); await t.fill('#nN', 'Licenças de observabilidade'); await t.selectOption('#nC', 'licencas'); await t.fill('#nOM', '12 mil'); await t.click('#nOk');
  await t.click('[data-v="resumo"]');
  await t.fill('#qk', 'Fatura squad janeiro 48.500 #squad 15/01'); await t.press('#qk', 'Enter');
  ok(await t.inputValue('#lV') === '48.500' && await t.inputValue('#lDt') === '2026-01-15', 'barra rápida interpreta valor e data');
  await t.click('#lOk');
  await t.click('[data-v="compromissos"]'); await t.click('#cNovo'); await t.fill('#kN', 'Datadog'); await t.fill('#kV', '13.000'); await t.selectOption('#kL', { label: 'Licenças de observabilidade' }); await t.fill('#kI', '2026-03'); await t.fill('#kF', '2026-12'); await t.click('#kOk');
  const tot = await t.evaluate(() => totais());
  ok(tot.orcado === (50000 * 12 + 12000 * 12) * 100, 'orçado do ano = soma das linhas');
  ok(tot.previsto === (50000 * 12 + 12000 * 2 + 13000 * 10) * 100, 'previsto usa contratos nos meses cobertos');
  await t.click('[data-v="grupo"]'); await t.click('#gPasta'); await t.waitForTimeout(500);
  ok(await t.evaluate(() => db.diretriz?.capTotal === 100000000), 'diretriz do grupo lida pelo time (teto R$ 1 mi)');
  ok(await t.evaluate(() => alertas().some(a => /acima do teto/.test(a[1]))) === false, 'sem alerta de teto ainda');
  await t.click('#tPub'); await t.waitForTimeout(600);
  const planoEnv = JSON.parse(await opfs(t, async () => ler('Gestao-Compartilhado/times/pagamentos/financas', 'plano.json')));
  ok(planoEnv.schema === 'gestao-envelope/1' && planoEnv.content === 'gestao-financas-plano/1' && planoEnv.revision === 1 && /^ana~/.test(planoEnv.writer), 'plano publicado cifrado, revisão 1, dono ana~<computador>');
  ok(!JSON.stringify(planoEnv).includes('Fatura') && !JSON.stringify(planoEnv).includes('Squad'), 'nada em claro na pasta comum');
  const pl = await t.evaluate(() => montarPlano({ revision: 0, generatedAt: '', hlc: '' }));
  ok(!JSON.stringify(pl).includes('Fatura squad'), 'lançamentos individuais não vão no plano publicado');

  console.log('3. Grupo lê a pasta, prévia e soma');
  await g.click('[data-v="revisar"]'); await g.click('#tLer'); await g.waitForTimeout(500);
  ok(await g.evaluate(() => pendentes.length) === 1, 'plano novo aparece na prévia');
  await g.click('[data-ap="pagamentos"]');
  const cons = await g.evaluate(() => consolidado().total);
  ok(cons.orcado === tot.orcado && cons.previsto === tot.previsto, 'consolidado soma exatamente o plano do time');

  console.log('4. Conflitos do OneDrive');
  // a) Outra pessoa publica uma revisão maior numa cópia de conflito "plano (1).json"
  await t.evaluate(async () => {
    const ch = chaveAtual(); const p = montarPlano({ revision: 7, generatedAt: isoComFuso(), hlc: hlcAgora() }); p.source.writer = 'bia~zz999'; p.lines[0].months['2026-06'].forecast += 1000000;
    const env = await cifrarEnv(p, { key: ch.key, kid: ch.kid, team: 'pagamentos' }); await gravarSeguro(dirPlano, 'plano (1).json', JSON.stringify(env));
  });
  // b) Uma cópia antiga com nome de computador
  await opfs(t, async () => gravar('Gestao-Compartilhado/times/pagamentos/financas', 'plano-NOTEBOOK01.json', await ler('Gestao-Compartilhado/times/pagamentos/financas', 'plano.json')));
  await g.click('#tLer'); await g.waitForTimeout(500);
  const pend = await g.evaluate(() => pendentes.map(x => ({ rev: x.p.revision, de: x.de })));
  ok(pend.length === 1 && pend[0].rev === 7 && pend[0].de === 'plano (1).json', 'grupo escolhe a cópia de maior revisão (7)');
  ok(await g.evaluate(() => saude.pagamentos.avisos.some(a => /cópia\(s\) de conflito/.test(a))), 'grupo avisa cópias de conflito');
  // c) O time tenta publicar: o dono atual é outra pessoa → pede para assumir
  await t.click('[data-v="grupo"]'); await t.click('#gLer'); await t.waitForTimeout(300);
  await t.click('#gPub'); await t.waitForSelector('#dlg [data-r="ok"]');
  ok(/pertence a bia~zz999/.test(await t.textContent('#dlg')), 'publicação bloqueada: arquivo pertence a outra pessoa');
  await btn(t, 'ok'); await t.waitForTimeout(700);
  const depois = await opfs(t, async () => listar('Gestao-Compartilhado/times/pagamentos/financas'));
  const env2 = JSON.parse(await opfs(t, async () => ler('Gestao-Compartilhado/times/pagamentos/financas', 'plano.json')));
  ok(env2.revision === 8, 'ao assumir, revisão = maior vista + 1 (8)');
  ok(!depois.includes('plano (1).json') && !depois.includes('plano-NOTEBOOK01.json'), 'cópias de conflito resolvidas e apagadas: ' + depois.filter(n => !n.startsWith('.')).join(', '));
  ok(depois.some(n => /^\.aberto-ana-/.test(n)), 'arquivo de aviso "aberto em outro computador" presente');
  // d) Arquivo truncado (sincronização pela metade): grupo ignora e mantém o último válido
  await g.evaluate(() => aplicar()); await g.waitForTimeout(100);
  const antes = await g.evaluate(() => db.retratos.pagamentos.payload.revision);
  await opfs(t, async () => { const t0 = await ler('Gestao-Compartilhado/times/pagamentos/financas', 'plano.json'); await gravar('Gestao-Compartilhado/times/pagamentos/financas', 'plano.json', t0.slice(0, t0.length / 2)); });
  await g.click('#tLer'); await g.waitForTimeout(400);
  ok(await g.evaluate(() => pendentes.length) === 0 && await g.evaluate(() => db.retratos.pagamentos.payload.revision) === antes, 'arquivo truncado é ignorado; último retrato válido continua');
  ok(await g.evaluate(() => saude.pagamentos.avisos.some(a => /não abre/.test(a))), 'saúde da soma avisa "arquivo não abre"');
  // e) Revisão mais antiga reaparecendo é ignorada
  await t.click('#tPub'); await t.waitForTimeout(500);
  await g.click('#tLer'); await g.waitForTimeout(300); await g.evaluate(() => aplicar());
  await t.evaluate(async () => { const ch = chaveAtual(); const p = montarPlano({ revision: 2, generatedAt: isoComFuso(), hlc: '' }); p.source.writer = writer(); await gravarSeguro(dirPlano, 'plano.json', JSON.stringify(await cifrarEnv(p, { key: ch.key, kid: ch.kid, team: 'pagamentos' }))); });
  await g.click('#tLer'); await g.waitForTimeout(300);
  ok(await g.evaluate(() => saude.pagamentos.avisos.some(a => /mais antigo/.test(a))), 'revisão antiga reaparecendo é ignorada com aviso');

  console.log('5. Senha: reabrir, senha errada, lembrete de teste');
  const t2 = await nova('/financas/testes/saida/financas_pagamentos.html', { 'fin-local': 'LocalAna', 'fin-comum': 'Gestao-Compartilhado' });
  await t2.click('#iAbrir'); await senhaAbrir(t2, 'errada-errada-1'); await t2.waitForSelector('#dlg .latec');
  ok(/Senha incorreta/.test(await t2.textContent('#dlg')), 'senha errada é recusada');
  await t2.fill('#pw', SENHA); await btn(t2, 'ok'); await t2.waitForSelector('#topo');
  ok(await t2.evaluate(() => db.lancamentos.length) === 1, 'reabre com a senha certa e mantém os dados');
  await t2.evaluate(() => { db.seg = { cofreConfirmadoEm: new Date(Date.now() - 40 * 864e5).toISOString() }; setTimeout(() => lembreteTesteSenha(db.seg, ctx), 0); });
  await senhaAbrir(t2); await t2.waitForTimeout(800);
  ok(await t2.evaluate(() => !!db.seg.ultimoTesteEm), 'lembrete de 30 dias pede e confirma a senha');
  ok((await opfs(t2, async () => listar('LocalAna/backup'))).length >= 1, 'backup rotativo na pasta local');

  console.log('6. Assistente inicial: responsável por um time, finanças + tarefas');
  const a = await nova('/inicio.html', { 'fin-local': 'LocalInicio', 'fin-comum': 'Gestao-Compartilhado' });
  await a.click('#prox'); await a.click('[data-p="responsavel"]'); await a.click('#prox');
  await a.click('[data-u="financas"]'); await a.click('[data-u="tarefas"]');
  ok((await a.textContent('#wz')).includes('Finanças do Time') && (await a.textContent('#wz')).includes('Quadro do Time'), 'mostra os HTMLs que serão gerados');
  await a.click('#prox'); await a.fill('#dN', 'Cartões'); await a.fill('#dPx', 'CAR'); await a.fill('#dP', 'Caio'); await a.click('#prox');
  await a.click('#pL'); await btn(a, 'ok'); await a.click('#pC'); await a.click('#prox');
  await a.click('#sC'); await criarSenha(a); await a.click('#prox');
  await a.waitForSelector('#mapa2', { timeout: 30000 });
  const loc = await opfs(a, async () => listar('LocalInicio'));
  ok(['financas_cartoes.html', 'financas-cartoes.json', 'quadro_cartoes.html', 'quadro-cartoes.json', 'onde-fica-cada-coisa.html'].every(n => loc.includes(n)), 'arquivos criados: ' + loc.join(', '));
  ok((await opfs(a, async () => listar('Gestao-Compartilhado/times'))).includes('cartoes'), 'estrutura criada na pasta comum');
  const cart = await opfs(a, async () => ler('LocalInicio', 'onde-fica-cada-coisa.html'));
  ok(/cofre de senhas/.test(cart) && !cart.includes(SENHA), 'cartão "onde fica cada coisa" com aviso de cofre e sem senha');
  // O arquivo criado pelo assistente abre nas Finanças do Time gerado por ele
  fs.writeFileSync(path.join(SAIDA, 'financas_cartoes.html'), await opfs(a, async () => ler('LocalInicio', 'financas_cartoes.html')));
  const t3 = await nova('/financas/testes/saida/financas_cartoes.html', { 'fin-local': 'LocalInicio' });
  await t3.click('#iAbrir'); await senhaAbrir(t3); await t3.waitForSelector('#topo');
  ok(await t3.evaluate(() => db.team.slug === 'cartoes' && db.pessoa.nome === 'Caio'), 'Finanças do Time abre o primeiro arquivo criado pelo assistente');
  // O Quadro gerado abre o arquivo cifrado criado pelo assistente
  fs.writeFileSync(path.join(SAIDA, 'quadro_cartoes.html'), await opfs(a, async () => ler('LocalInicio', 'quadro_cartoes.html')));
  const q = await nova('/financas/testes/saida/quadro_cartoes.html', {});
  await q.waitForFunction(() => window.__qt);
  await q.evaluate(async () => { const d = await (await navigator.storage.getDirectory()).getDirectoryHandle('LocalInicio'); window.__h = await d.getFileHandle('quadro-cartoes.json'); setTimeout(() => window.__qt.abrirArquivo(window.__h), 0); });
  await q.waitForSelector('#pw'); await q.fill('#pw', SENHA); await q.click('#dlg [data-x="ok"]'); await q.waitForTimeout(800);
  ok(await q.evaluate(() => window.__qt.db?.team?.slug === 'cartoes'), 'Quadro do Time abre o arquivo cifrado criado pelo assistente');

  console.log('7. Assistente: gestor, finanças + tarefas (Central)');
  const a2 = await nova('/inicio.html', { 'fin-local': 'LocalGestor2', 'fin-comum': 'Gestao-Compartilhado' });
  await a2.click('#prox'); await a2.click('[data-p="gestor"]'); await a2.click('#prox'); await a2.click('[data-u="financas"]'); await a2.click('[data-u="tarefas"]'); await a2.click('#prox');
  await a2.fill('#dN', 'Tecnologia'); await a2.fill('#dT', 'Pagamentos PAG\nCartões CAR'); await a2.fill('#dP', 'Fernando'); await a2.click('#prox');
  await a2.click('#pL'); await btn(a2, 'ok'); await a2.click('#prox'); await a2.click('#sC'); await criarSenha(a2, SENHA2); await a2.click('#prox');
  await a2.waitForSelector('#mapa2', { timeout: 30000 });
  const loc2 = await opfs(a2, async () => listar('LocalGestor2'));
  ok(['financas_grupo.html', 'financas-grupo-tecnologia.json', 'gestao_pessoal.html', 'gestao-tecnologia.json'].every(n => loc2.includes(n)), 'arquivos do gestor: ' + loc2.join(', '));
  fs.writeFileSync(path.join(SAIDA, 'financas_grupo_gerado.html'), await opfs(a2, async () => ler('LocalGestor2', 'financas_grupo.html')));
  const g2 = await nova('/financas/testes/saida/financas_grupo_gerado.html', { 'fin-local': 'LocalGestor2' });
  await g2.click('#iAbrir'); await senhaAbrir(g2, SENHA2); await g2.waitForSelector('#topo');
  ok(await g2.evaluate(() => db.times.map(t => t.slug + ':' + t.prefixo).join(',')) === 'pagamentos:PAG,cartoes:CAR', 'Finanças do Grupo abre com os times informados no assistente');
  fs.writeFileSync(path.join(SAIDA, 'gestao_gerada.html'), await opfs(a2, async () => ler('LocalGestor2', 'gestao_pessoal.html')));
  const c = await nova('/financas/testes/saida/gestao_gerada.html', {});
  await c.evaluate(() => { window.__abrir = { dir: 'LocalGestor2', arq: 'gestao-tecnologia.json' }; });
  await c.fill('#lockPass', SENHA2); await c.click('#btnOpen'); await c.waitForTimeout(1500);
  ok(await c.evaluate(() => !document.querySelector('#app').classList.contains('hidden')), 'Central abre o arquivo cifrado criado pelo assistente');

  for (const [p, n] of [[g, 'grupo-consolidado'], [t2, 'time-resumo']]) { await p.setViewportSize({ width: 1280, height: 860 }); await p.evaluate(() => { view = typeof vCons === 'function' ? 'consolidado' : 'resumo'; render(); }); await p.screenshot({ path: path.join(SAIDA, n + '.png') }); }
  await t2.evaluate(() => { view = 'plano'; render(); }); await t2.screenshot({ path: path.join(SAIDA, 'time-plano.png') });
  await a.screenshot({ path: path.join(SAIDA, 'inicio-pronto.png') });

  ok(erros.length === 0, 'sem erros de JavaScript nas páginas' + (erros.length ? ': ' + erros.join(' | ') : ''));
  await browser.close(); srv.close();
  console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : '\nTodas as verificações passaram.');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });

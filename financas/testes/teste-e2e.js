// Teste de ponta a ponta das ferramentas de finanças e do assistente inicial.
// Uso: node financas/testes/teste-e2e.js   (precisa do Playwright e do Chromium instalados)
// Os seletores de pasta são trocados por pastas do sistema de arquivos privado do navegador (OPFS),
// então o teste roda sem diálogos. Simula também cópias de conflito do OneDrive e arquivo truncado.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
// TEMA=escuro roda tudo com o sistema em modo escuro (o tema automático segue) e salva as telas em saida/escuro/.
const ESCURO = process.env.TEMA === 'escuro', SAIDA_URL = '/financas/testes/saida/' + (ESCURO ? 'escuro/' : '');
const RAIZ = path.resolve(__dirname, '..', '..'), SAIDA = path.join(RAIZ, 'financas', 'testes', 'saida', ESCURO ? 'escuro' : '');
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
  // No Chromium sem janela, ler um FileSystemHandle guardado no IndexedDB derruba a página: não guarda handles.
  const put0 = IDBObjectStore.prototype.put; IDBObjectStore.prototype.put = function (v, k) { return put0.call(this, (typeof FileSystemHandle !== 'undefined' && v instanceof FileSystemHandle) ? null : v, k); };
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
  const ctxB = await browser.newContext({ acceptDownloads: true, colorScheme: ESCURO ? 'dark' : 'light' });
  const erros = [];
  const nova = async (url, mapa) => { const p = await ctxB.newPage(); p.on('pageerror', e => erros.push(url + ': ' + e.message)); await p.addInitScript(stub(mapa)); await p.goto(base + url); return p; };

  console.log('1. Finanças do Grupo: criar arquivo, time, chave, diretriz e HTML do time');
  const g = await nova('/financas/financas_grupo.html', { 'fin-local': 'LocalGestor', 'fin-comum': 'Gestao-Compartilhado' });
  await g.click('#iNovo'); await g.fill('#cN', 'Tecnologia'); await g.fill('#cP', 'Fernando'); await g.fill('#cA', '2026'); await g.click('#cOk');
  await btn(g, 'ok'); await criarSenha(g);
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
  const t = await nova(SAIDA_URL + 'financas_pagamentos.html', { 'fin-local': 'LocalAna', 'fin-comum': 'Gestao-Compartilhado' });
  ok(/Pré-configurado pelo gestor/.test(await t.textContent('body')), 'tela inicial mostra pré-configuração');
  await t.click('#iNovo'); ok(await t.isDisabled('#cN'), 'nome do time travado pela pré-configuração');
  await t.fill('#cP', 'Ana Souza'); await t.click('#cOk'); await btn(t, 'ok'); await criarSenha(t);
  await cofre(t); // chave do preset
  await t.waitForSelector('#pNova');
  await t.click('#pNova'); await t.fill('#nN', 'Squad terceirizado'); await t.selectOption('#nC', 'terceiros'); await t.fill('#nI', 'PAG-042'); await t.fill('#nOM', '50.000'); await t.click('#nOk');
  await t.click('#pNova'); await t.fill('#nN', 'Licenças de observabilidade'); await t.selectOption('#nC', 'licencas'); await t.fill('#nOM', '12 mil'); await t.click('#nOk');
  await t.click('[data-v="resumo"]');
  await t.fill('#qk', 'Fatura squad janeiro 48.500 #squad 15/01'); await t.press('#qk', 'Enter');
  ok(await t.inputValue('#lV') === '48.500' && await t.inputValue('#lDt') === '2026-01-15', 'barra rápida interpreta valor e data');
  await t.click('#lOk');
  await t.click('[data-v="plano"]'); await t.click('[data-v="compromissos"]'); await t.click('#cNovo'); await t.fill('#kN', 'Datadog'); await t.fill('#kV', '13.000'); await t.selectOption('#kL', { label: 'Licenças de observabilidade' }); await t.fill('#kI', '2026-03'); await t.fill('#kF', '2026-12'); await t.click('#kOk');
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
  await g.click('[data-v="consolidado"]'); await g.click('[data-v="revisar"]'); await g.click('#tLer'); await g.waitForTimeout(500);
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
  const t2 = await nova(SAIDA_URL + 'financas_pagamentos.html', { 'fin-local': 'LocalAna', 'fin-comum': 'Gestao-Compartilhado' });
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
  await a.click('#prox'); await a.click('[data-p="responsavel"]');
  await a.click('[data-u="financas"]'); await a.click('[data-u="tarefas"]');
  ok((await a.textContent('#wz')).includes('Finanças do Time') && (await a.textContent('#wz')).includes('Quadro do Time'), 'perfil: lidera 1 time, finanças e tarefas; mostra os HTMLs que serão gerados');
  await a.click('#prox');
  const [kTarCar, kFinCar] = await a.evaluate(() => [gerarChaveTexto('cartoes-2501'), gerarChaveTexto('cartoes-fin-2611')]);
  await a.click('[data-k="sim"]'); await a.fill('#kT', 'GK1.quebrada'); await a.click('#kLer');
  ok(/GK1\.quebrada/.test(await a.textContent('#kErr')) && await a.isDisabled('#prox'), 'onboarding recusa chave inválida');
  await a.fill('#kT', kTarCar + '\n' + kFinCar); await a.fill('#kP', 'Gestao-Compartilhado'); await a.click('#kLer');
  const kTxt = await a.textContent('#wz');
  ok(/Tarefas do time/.test(kTxt) && /Finanças do time/.test(kTxt) && /cartoes-fin-2611/.test(kTxt), 'onboarding reconhece a chave de tarefas e a de finanças do time pelo kid');
  await a.click('#prox'); await cofre(a);
  ok(await a.isDisabled('#dS') && await a.inputValue('#dS') === 'cartoes', 'identificador do time vem da chave e fica travado');
  await a.fill('#dN', 'Cartões'); await a.fill('#dPx', 'CAR'); await a.fill('#dP', 'Caio'); await a.click('#prox');
  await a.click('#pL'); await a.waitForSelector('#pL ~ .chip'); await a.click('#pC'); await a.click('#prox');
  await a.click('#sC'); await criarSenha(a); await a.click('#prox');
  await a.waitForSelector('#mapa2', { timeout: 30000 });
  const loc = await opfs(a, async () => listar('LocalInicio'));
  ok(['financas_cartoes.html', 'financas-cartoes.json', 'quadro_cartoes.html', 'quadro-cartoes.json', 'onde-fica-cada-coisa.html', 'hub.html', 'hub-cartoes.json'].every(n => loc.includes(n)), 'arquivos criados: ' + loc.join(', '));
  ok((await opfs(a, async () => listar('Gestao-Compartilhado/times'))).includes('cartoes'), 'estrutura criada na pasta comum');
  const cart = await opfs(a, async () => ler('LocalInicio', 'onde-fica-cada-coisa.html'));
  ok(/cofre de senhas/.test(cart) && !cart.includes(SENHA), 'cartão "onde fica cada coisa" com aviso de cofre e sem senha');
  const dec = async arq => a.evaluate(async ([t, s]) => (await decifrarLocal(t, s)).dados, [await opfs(a, async n => ler('LocalInicio', n), arq), SENHA]);
  const ftDb = await dec('financas-cartoes.json'), hbDb = await dec('hub-cartoes.json');
  ok(ftDb.chaves.length === 1 && ftDb.chaves[0].kid === 'cartoes-fin-2611', 'Finanças do Time criado já com a chave de finanças do time');
  ok(hbDb.times[0].chaves[0]?.kid === 'cartoes-2501' && hbDb.times[0].chavesFin[0]?.kid === 'cartoes-fin-2611', 'hub criado com as duas chaves do time, separadas');
  ok((await opfs(a, async () => ler('LocalInicio', 'quadro_cartoes.html'))).includes(kTarCar), 'Quadro do Time gerado com a chave de tarefas na pré-configuração');
  ok(!(await opfs(a, async () => ler('LocalInicio', 'financas-cartoes.json'))).includes('cartoes-fin'), 'chave não aparece em claro no arquivo local');
  // O arquivo criado pelo assistente abre nas Finanças do Time gerado por ele
  fs.writeFileSync(path.join(SAIDA, 'financas_cartoes.html'), await opfs(a, async () => ler('LocalInicio', 'financas_cartoes.html')));
  const t3 = await nova(SAIDA_URL + 'financas_cartoes.html', { 'fin-local': 'LocalInicio' });
  await t3.click('#iAbrir'); await senhaAbrir(t3); await t3.waitForSelector('#topo');
  ok(await t3.evaluate(() => db.team.slug === 'cartoes' && db.pessoa.nome === 'Caio'), 'Finanças do Time abre o primeiro arquivo criado pelo assistente');
  // O Quadro gerado abre o arquivo cifrado criado pelo assistente
  fs.writeFileSync(path.join(SAIDA, 'quadro_cartoes.html'), await opfs(a, async () => ler('LocalInicio', 'quadro_cartoes.html')));
  const q = await nova(SAIDA_URL + 'quadro_cartoes.html', {});
  await q.waitForFunction(() => window.__qt);
  await q.evaluate(async () => { const d = await (await navigator.storage.getDirectory()).getDirectoryHandle('LocalInicio'); window.__h = await d.getFileHandle('quadro-cartoes.json'); setTimeout(() => window.__qt.abrirArquivo(window.__h), 0); });
  await q.waitForSelector('#pw'); await q.fill('#pw', SENHA); await q.click('#dlg [data-x="ok"]'); await q.waitForTimeout(800);
  ok(await q.evaluate(() => window.__qt.db?.team?.slug === 'cartoes'), 'Quadro do Time abre o arquivo cifrado criado pelo assistente');

  console.log('7. Assistente: gestor, finanças + tarefas (Central)');
  const a2 = await nova('/inicio.html', { 'fin-local': 'LocalGestor2', 'fin-comum': 'Gestao-Compartilhado' });
  await a2.click('#prox'); await a2.click('[data-p="gestor"]'); await a2.click('[data-u="financas"]'); await a2.click('[data-u="tarefas"]'); await a2.click('#prox');
  const kAcima = await a2.evaluate(() => gerarChaveTexto('tecnologia-fin-2611'));
  await a2.click('[data-k="sim"]'); await a2.fill('#kT', kAcima + '\n' + await a2.evaluate(() => gerarChaveTexto('pagamentos-2611'))); await a2.click('#kLer');
  ok(/nível acima/.test(await a2.textContent('#wz')) && /reaproveitada/.test(await a2.textContent('#wz')), 'gestor: chave de finanças da liderança vira "nível acima"; chave de tarefas de um time é reaproveitada');
  await a2.click('#prox'); await cofre(a2);
  await a2.fill('#dN', 'Tecnologia'); await a2.fill('#dT', 'Pagamentos PAG\nCartões CAR'); await a2.fill('#dP', 'Fernando'); await a2.click('#prox');
  await a2.click('#pL'); await a2.waitForSelector('#pL ~ .chip'); await a2.click('#prox'); await a2.click('#sC'); await criarSenha(a2, SENHA2); await a2.click('#prox');
  await a2.waitForSelector('#mapa2', { timeout: 30000 });
  const loc2 = await opfs(a2, async () => listar('LocalGestor2'));
  ok(['financas_grupo.html', 'financas-grupo-tecnologia.json', 'gestao_pessoal.html', 'gestao-tecnologia.json', 'hub.html', 'hub-tecnologia.json'].every(n => loc2.includes(n)), 'arquivos do gestor: ' + loc2.join(', '));
  fs.writeFileSync(path.join(SAIDA, 'financas_grupo_gerado.html'), await opfs(a2, async () => ler('LocalGestor2', 'financas_grupo.html')));
  const g2 = await nova(SAIDA_URL + 'financas_grupo_gerado.html', { 'fin-local': 'LocalGestor2' });
  await g2.click('#iAbrir'); await senhaAbrir(g2, SENHA2); await g2.waitForSelector('#topo');
  ok(await g2.evaluate(() => db.times.map(t => t.slug + ':' + t.prefixo).join(',')) === 'pagamentos:PAG,cartoes:CAR', 'Finanças do Grupo abre com os times informados no assistente');
  ok(await g2.evaluate(() => db.acima?.chaves?.[0]?.kid === 'tecnologia-fin-2611' && db.acima.chaves[0].origem === 'onboarding'), 'Finanças do Grupo criado com a chave do nível acima (db.acima)');
  fs.writeFileSync(path.join(SAIDA, 'gestao_gerada.html'), await opfs(a2, async () => ler('LocalGestor2', 'gestao_pessoal.html')));
  const c = await nova(SAIDA_URL + 'gestao_gerada.html', {});
  await c.evaluate(() => { window.__abrir = { dir: 'LocalGestor2', arq: 'gestao-tecnologia.json' }; });
  await c.fill('#lockPass', SENHA2); await c.click('#btnOpen'); await c.waitForTimeout(1500);
  ok(await c.evaluate(() => !document.querySelector('#app').classList.contains('hidden')), 'Central abre o arquivo cifrado criado pelo assistente');
  ok(await c.evaluate(() => document.querySelectorAll('#home .inss .ins').length === 4 && /Delegadas no prazo/.test(document.querySelector('#home .inss').textContent)), 'Hoje da Central abre com quatro cards de leitura');
  // Formulários no lugar no padrão único (v15.4): acordo com pílulas, validação no campo e Enter; atualização de iniciativa; prévia da importação
  await c.evaluate(() => { const f = mkForum({ name: 'Comitê', cadence: 'weekly', anchor: today(), participants: [] }); db.forums.push(f); db.initiatives.push({ id: 'i1', name: 'Migração', teamId: '', ownerId: '', bucket: 'now', start: today(), end: addD(today(), 30), progress: 0, autoProgress: true, phases: [], dependsOn: [], updates: [], createdAt: Date.now() }); changed(); go('forum'); openMeeting(f.id, today()); });
  await c.click('[data-agr="mt"] [data-act=agr-kind][data-v=decision]'); await c.focus('[data-agr="mt"] [data-agrt]'); await c.keyboard.press('Enter');
  ok(await c.evaluate(() => { const b = document.querySelector('[data-agr="mt"]'); return b.querySelector('[data-pri]').disabled && /decisão/.test(b.querySelector('.fx-err').textContent) && b.querySelector('[data-pri]').textContent === 'Registrar decisão'; }), 'acordo: pílula Decisão muda o verbo do botão e a validação aparece no campo');
  await c.fill('[data-agr="mt"] [data-agrt]', 'Adotar fluxo novo'); await c.keyboard.press('Enter'); await c.waitForTimeout(150);
  await c.click('[data-agr="mt"] [data-act=agr-kind][data-v=commitment]'); await c.fill('[data-agr="mt"] [data-agrt]', 'Enviar plano'); await c.keyboard.press('Enter'); await c.waitForTimeout(150);
  ok(await c.evaluate(() => db.agreements.map(g => g.kind + (g.taskId ? '+tarefa' : '')).join(',') === 'decision,commitment+tarefa'), 'acordo: decisão e compromisso registrados com Enter, compromisso vira tarefa');
  await c.evaluate(() => { openMeet = null; renderDrawer(); go('pulse'); }); await c.click('[data-act=pl-edit][data-id=i1]');
  await c.fill('[data-upd=i1]', 'Homologação começou'); await c.keyboard.press('Enter'); await c.waitForTimeout(150);
  ok(await c.evaluate(() => initById('i1').updates.length === 1), 'atualização de iniciativa no formulário no lugar');
  await c.evaluate(() => { $('#importDialog').showModal(); $('#impText').value = JSON.stringify({ schema: 'gestao-import/3', tasks: [{ title: 'A' }], updates: [{ initiative: 'Não existe', text: 'y' }] }); analyzeImport(); });
  ok(await c.evaluate(() => $('#impGo').textContent === 'Importar 1 item' && document.querySelectorAll('#impPrev .ipv button').length === 4), 'prévia da importação com contadores e verbo no botão');
  await c.evaluate(() => { $('#importDialog').close(); go('home'); });

  ok(await c.evaluate(() => /Onde estou/.test(document.getElementById('ondeEstou')?.textContent || '')), 'Central mostra o botão "Onde estou?"');
  await c.click('#ondeEstou .f4btn:not(.f4hub)'); ok(/Central de Gestão/.test(await c.textContent('#f4dlg')) && /gestao-tecnologia\.json/.test(await c.textContent('#f4dlg')), '"Onde estou?" da Central mostra ferramenta e arquivo');
  await c.click('#f4fecha');

  console.log('8. Quadro 2.1: senha obrigatória e um arquivo por pessoa');
  const qa = await nova('/ferramenta-time/quadro_do_time_v1.html', {});
  await qa.waitForFunction(() => window.__qt);
  // a) quadro antigo sem senha: a ferramenta exige criar uma
  await opfs(qa, async () => gravar('LocalVelho', 'quadro-velho.json', JSON.stringify({ schema: 'quadro-time/1', team: { name: 'Velho', slug: 'velho' } })));
  await qa.evaluate(async () => { const d = await (await navigator.storage.getDirectory()).getDirectoryHandle('LocalVelho'); setTimeout(async () => window.__qt.abrirArquivo(await d.getFileHandle('quadro-velho.json')), 0); });
  await qa.waitForSelector('#f4p1'); await qa.fill('#f4p1', 'curta'); await qa.fill('#f4p2', 'curta'); await qa.click('#f4pok');
  ok(/12 caracteres/.test(await qa.textContent('#f4pm')), 'senha curta recusada');
  await qa.fill('#f4p1', SENHA); await qa.fill('#f4p2', SENHA); await qa.click('#f4pok'); await qa.waitForSelector('#f4ok'); await qa.check('#f4ok'); await qa.click('#f4go'); await qa.waitForTimeout(1500);
  ok(JSON.parse(await opfs(qa, async () => ler('LocalVelho', 'quadro-velho.json'))).schema === 'quadro-time-cifrado/1', 'quadro sem senha passa a ser gravado cifrado');
  ok(await qa.evaluate(() => /Onde estou/.test(document.getElementById('ondeEstou')?.textContent || '')), 'Quadro mostra o botão "Onde estou?"');
  // b) duas pessoas, cada uma com o próprio arquivo local e o próprio arquivo na pasta comum
  const chaveTime = await qa.evaluate(() => 'GK1.cartoes-2611.' + btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''));
  const txtLocal = await opfs(qa, async () => ler('LocalInicio', 'quadro-cartoes.json'));
  await opfs(qa, async t => gravar('LocalBia', 'quadro-cartoes.json', t), txtLocal);
  const prepara = async (pg, dir, eu, disp) => {
    await pg.waitForFunction(() => window.__qt);
    await pg.evaluate(async ([chave, eu, disp]) => { await colarChave(chave); rootMem = await (await navigator.storage.getDirectory()).getDirectoryHandle('Gestao-Compartilhado');
      f4dispositivo = () => ({ id: disp }); f4eu = () => eu; }, [chaveTime, eu, disp]);
    await pg.evaluate(async dir => { const d = await (await navigator.storage.getDirectory()).getDirectoryHandle(dir); setTimeout(async () => window.__qt.abrirArquivo(await d.getFileHandle('quadro-cartoes.json')), 0); }, dir);
    await senhaAbrirQ(pg); await pg.waitForTimeout(1200);
  };
  const senhaAbrirQ = async pg => { await pg.waitForSelector('#pw'); await pg.fill('#pw', SENHA); await pg.click('#dlg [data-x="ok"]'); };
  const qc = await nova(SAIDA_URL + 'quadro_cartoes.html', {}); await prepara(qc, 'LocalInicio', 'caio', 'aaaaa');
  const qb = await nova(SAIDA_URL + 'quadro_cartoes.html', {}); await prepara(qb, 'LocalBia', 'bia', 'bbbbb');
  await qc.evaluate(async () => { novoCard({ title: 'Card do Caio', col: cols()[0].id }); touch(); await salvar(); await f4sincronizar(); });
  await qb.evaluate(async () => { novoCard({ title: 'Card da Bia', col: cols()[0].id }); touch(); await salvar(); await f4sincronizar(); });
  await qc.evaluate(() => f4sincronizar()); await qc.waitForTimeout(300);
  const arqs = (await opfs(qc, async () => listar('Gestao-Compartilhado/times/cartoes/quadro'))).filter(n => !n.startsWith('.'));
  ok(arqs.join(',') === 'bia-bbbbb.json,caio-aaaaa.json', 'um arquivo por pessoa e computador na pasta comum: ' + arqs.join(', '));
  const titulos = pg => pg.evaluate(() => db.cards.filter(c => !c.deleted).map(c => c.title).sort().join(' | '));
  ok(await titulos(qc) === 'Card da Bia | Card do Caio' && await titulos(qb) === 'Card da Bia | Card do Caio', 'as duas pessoas veem os cards das duas (união por item)');
  const ids = await qc.evaluate(() => db.cards.map(c => c.id).sort().join(','));
  ok(new Set(ids.split(',')).size === 2, 'códigos iguais criados ao mesmo tempo são renumerados: ' + ids);
  const env = JSON.parse(await opfs(qc, async () => ler('Gestao-Compartilhado/times/cartoes/quadro', 'caio-aaaaa.json')));
  ok(env.schema === 'gestao-envelope/1' && env.content === 'quadro-contrib/1' && !JSON.stringify(env).includes('Card do Caio'), 'arquivo da pessoa cifrado com a chave do time');
  // c) cópia de conflito do próprio arquivo: é lida, unida e apagada
  await qc.evaluate(async () => { const d = await f4pasta(false); const t = await (await (await d.getFileHandle('caio-aaaaa.json')).getFile()).text(); const w = await (await d.getFileHandle('caio-aaaaa-NOTEBOOK01.json', { create: true })).createWritable(); await w.write(t); await w.close(); });
  await qc.evaluate(async () => { novoCard({ title: 'Mais um', col: cols()[0].id }); touch(); await salvar(); await f4sincronizar(); });
  ok(!(await opfs(qc, async () => listar('Gestao-Compartilhado/times/cartoes/quadro'))).includes('caio-aaaaa-NOTEBOOK01.json'), 'cópia de conflito do próprio arquivo apagada depois de unida');
  await qb.evaluate(() => f4sincronizar()); await qb.waitForTimeout(300);
  ok(/Mais um/.test(await titulos(qb)), 'mudança nova chega para a outra pessoa');

  ok(!/Conferi, não está/.test(fs.readFileSync(path.join(RAIZ, 'inicio.html'), 'utf8') + fs.readFileSync(path.join(RAIZ, 'financas', 'financas_time.html'), 'utf8') + fs.readFileSync(path.join(RAIZ, 'financas', 'financas_grupo.html'), 'utf8') + fs.readFileSync(path.join(RAIZ, 'hub.html'), 'utf8')), 'sem a pergunta de confirmar o ícone do OneDrive');
  ok(await c.evaluate(() => /Hub/.test(document.querySelector('#ondeEstou .f4hub')?.textContent || '')) && await t2.evaluate(() => !!document.getElementById('tHub')) && await g2.evaluate(() => !!document.getElementById('tHub')) && await qb.evaluate(() => !!document.querySelector('#ondeEstou .f4hub')), 'botão "← Hub" na Central, no Quadro e nas Finanças do Grupo e do Time');
  console.log('9. Hub da solução: ferramentas, chaves e post-its para os times');
  fs.writeFileSync(path.join(SAIDA, 'hub_gerado.html'), await opfs(a2, async () => ler('LocalGestor2', 'hub.html')));
  const h = await nova(SAIDA_URL + 'hub_gerado.html', { 'fin-local': 'LocalGestor2', 'fin-comum': 'Gestao-Compartilhado' });
  await h.click('#iAbrir'); await senhaAbrir(h, SENHA2); await h.waitForSelector('#topo');
  ok(await h.evaluate(() => __hub.db.times.map(t => t.slug).join(',')) === 'pagamentos,cartoes', 'hub abre o arquivo criado pelo assistente, com os times do grupo');
  ok(await h.evaluate(() => __hub.db.times.every(t => t.chaves.length === 1)) && await h.evaluate(() => __hub.db.times[0].chaves[0].kid) === 'pagamentos-2611', 'hub já vem com a chave de cada time (a colada no assistente foi reaproveitada)');
  // daqui em diante o teste refaz o caminho manual (colar e importar chaves): começa sem as chaves geradas
  await h.evaluate(async () => { __hub.db.times.forEach(t => { t.chaves = []; t.chavesFin = []; }); await carregarChaves(); render(); });
  const titulosF = await h.evaluate(() => __hub.ferramentas.map(f => f.titulo).join(' | '));
  ok(/Central de Gestão/.test(titulosF) && /Finanças do Grupo/.test(titulosF) && !/Hub/.test(titulosF), 'hub encontra as ferramentas da pasta local: ' + titulosF);
  ok(await h.evaluate(() => [...document.querySelectorAll('a.tool')].every(a => !/^[a-z]+:/i.test(a.getAttribute('href')))), 'links das ferramentas são relativos (abrem o HTML ao lado do hub)');
  const cabHub = JSON.parse(await opfs(h, async () => ler('LocalGestor2', 'hub-tecnologia.json')));
  ok(cabHub.schema === 'gestao-local-cifrado/1' && cabHub.app === 'hub' && !JSON.stringify(cabHub).includes('pagamentos'), 'arquivo local do hub cifrado com a senha');
  // a) chave colada à mão (com aviso de cofre)
  const chavePag = await h.evaluate(() => gerarChaveTexto('pagamentos-2611'));
  await h.click('[data-ch="pagamentos"]'); await h.fill('#kT', 'GK1.errada'); await btn(h, 'ok');
  ok(/Chave inválida/.test(await h.textContent('#kM')), 'chave inválida recusada no lugar');
  await h.fill('#kT', chavePag); await btn(h, 'ok'); await cofre(h); await h.waitForTimeout(400);
  ok(await h.evaluate(() => !!chaveDoTime(timePorSlug('pagamentos'))), 'chave do time cadastrada depois do aviso de cofre');
  // b) times e chaves importados da Central (só leitura do arquivo dela)
  const chavePix = await h.evaluate(() => gerarChaveTexto('pix-2611'));
  await h.evaluate(async ([senha, kc, kp]) => {
    const obj = { version: 15, teams: [{ id: 't1', name: 'Cartões', slug: 'cartoes', prefix: 'CAR' }, { id: 't2', name: 'Pix', slug: 'pix' }, { id: 't3', name: 'Sem pasta' }], integ: { keys: { t1: [{ key: kc }], t2: [{ key: kp }, { key: gerarChaveTexto('pix-2510'), revokedAt: '2026-10-01' }] } } };
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), key = await chaveDaSenha(senha, salt);
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(obj))));
    const d = await (await navigator.storage.getDirectory()).getDirectoryHandle('LocalGestor2'), w = await (await d.getFileHandle('gestao-central-teste.json', { create: true })).createWritable();
    await w.write(JSON.stringify({ encrypted: true, format: 'gestao-cripto/2', iterations: 600000, salt: b64.enc(salt), iv: b64.enc(iv), data: b64.enc(ct) })); await w.close();
    window.__abrir = { dir: 'LocalGestor2', arq: 'gestao-central-teste.json' };
  }, [SENHA, chaveTime, chavePix]);
  await h.click('#aImp'); await senhaAbrir(h, SENHA); await h.waitForSelector('#dlg .cofre');
  ok(/1 time\(s\) novo\(s\) e 2 chave\(s\)/.test(await h.textContent('#dlg')) && /Sem pasta/.test(await h.textContent('#dlg')), 'importa times e chaves ativas da Central (revogada e time sem pasta ficam de fora)');
  await btn(h, 'ok');
  ok(await h.evaluate(() => __hub.db.times.map(t => t.slug + ':' + t.chaves.length).join(',')) === 'pagamentos:1,cartoes:1,pix:1', 'times e chaves no hub: pagamentos, cartões e pix');
  // c) liga a pasta sincronizada e publica um post-it para dois times
  await h.click('#bPasta'); await h.waitForTimeout(400);
  await h.click('[data-novo="cartoes"]'); await h.fill('#nT', 'Atualizem o status da CAR-7 antes do comitê.'); await h.fill('#nP', 'Bia');
  await h.check('.tchk input[value="pagamentos"]'); await h.click('#nOk'); await h.waitForTimeout(1500);
  const disp = await h.evaluate(() => dispositivo().id), arqHub = `fernando-${disp}.json`;
  for (const tm of ['cartoes', 'pagamentos']) ok((await opfs(h, async c => listar(c), `Gestao-Compartilhado/times/${tm}/postits`)).includes(arqHub), `post-it publicado em times/${tm}/postits/${arqHub}`);
  const envPi = JSON.parse(await opfs(h, async (c, n) => ler(c, n), 'Gestao-Compartilhado/times/cartoes/postits', arqHub));
  ok(envPi.schema === 'gestao-envelope/1' && envPi.content === 'gestao-postits/1' && envPi.kid.startsWith('cartoes') && envPi.writer === 'fernando~' + disp && !JSON.stringify(envPi).includes('CAR-7'), 'post-it cifrado com a chave do time e com o dono no cabeçalho');
  // d) o Quadro do time mostra o post-it e grava quem viu no próprio arquivo
  await qc.evaluate(async () => { view = 'board'; await piLer(); render(); });
  ok(await qc.evaluate(() => piNotas.length === 1 && /CAR-7/.test(document.querySelector('.pi-strip')?.textContent || '') && /Para Bia/.test(document.querySelector('.pi-strip').textContent)), 'Quadro do Time mostra o post-it recebido no topo do quadro');
  await qc.click('[data-pi="vi"]'); await qc.waitForTimeout(600);
  ok((await opfs(qc, async () => listar('Gestao-Compartilhado/times/cartoes/postits/vistos'))).includes('caio-aaaaa.json'), 'Quadro grava o recibo em postits/vistos/caio-aaaaa.json');
  ok(await qc.evaluate(() => !/CAR-7/.test(document.querySelector('.pi-strip')?.textContent || '')), 'post-it visto sai da faixa (fica em "ver os já vistos")');
  await qb.evaluate(async () => { view = 'board'; await piLer(); render(); });
  ok(await qb.evaluate(() => piNotas.length === 1 && !!document.querySelector('[data-pi="vi"]')), 'a outra pessoa do time também recebe, ainda não visto');
  await h.evaluate(() => __hub.atualizar()); await h.waitForTimeout(300);
  ok(/visto por caio/.test(await h.textContent('[data-time="cartoes"]')), 'hub mostra quem já viu o post-it');
  // e) cópia de conflito do OneDrive do arquivo do hub: resolvida na próxima publicação
  await h.evaluate(async n => { const d = await subpasta(raiz, ['times', 'cartoes', 'postits']); await gravarSeguro(d, n.replace('.json', '-NOTEBOOK01.json'), await lerTexto(d, n)); }, arqHub);
  const rev0 = await h.evaluate(() => __hub.db.publicacao.cartoes.revision);
  await h.evaluate(async () => { const n = notasDe('cartoes')[0]; n.texto += ' Obrigado!'; n.atualizadoEm = new Date().toISOString(); await publicar('cartoes'); });
  const lst = await opfs(h, async () => listar('Gestao-Compartilhado/times/cartoes/postits'));
  ok(!lst.some(n => /NOTEBOOK01/.test(n)) && await h.evaluate(() => __hub.db.publicacao.cartoes.revision) === rev0 + 1, 'cópia de conflito apagada e revisão sobe: ' + lst.join(', '));
  // f) post-it vencido não é publicado; removido some do Quadro
  await h.evaluate(async () => { notasDe('cartoes').push({ id: 'pi-velho', texto: 'Velho', cor: 'rosa', expira: '2000-01-01', criadoEm: '2000-01-01', atualizadoEm: '2000-01-01' }); await publicar('cartoes'); });
  await qc.evaluate(() => piLer());
  ok(await qc.evaluate(() => piNotas.length === 1 && /Obrigado/.test(piNotas[0].texto)), 'Quadro recebe a edição e não recebe post-it vencido');
  await h.evaluate(async () => { __hub.db.notas.cartoes = []; await publicar('cartoes'); });
  await qc.evaluate(() => piLer());
  ok(await qc.evaluate(() => piNotas.length === 0 && !document.querySelector('.pi-strip')), 'post-it removido no hub some do Quadro');
  ok(await qb.evaluate(() => /Onde estou/.test(document.getElementById('ondeEstou')?.textContent || '')) && /postits/.test(await qb.evaluate(() => JSON.stringify(f4info()))), '"Onde estou?" do Quadro cita os post-its');
  await h.setViewportSize({ width: 1280, height: 900 }); await h.evaluate(() => { notasDe('pagamentos').push({ id: 'pi-x', texto: 'Retro na sexta: tragam os números de incidentes do mês.', cor: 'verde', para: '', expira: '', criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() }); render(); });
  await h.evaluate(async () => { await publicar('pagamentos'); });
  await qb.evaluate(async () => { localStorage.removeItem(piChaveVistos()); await piLer(); render(); });
  await h.evaluate(async () => { notasDe('cartoes').push({ id: 'pi-y', texto: 'Parabéns pela entrega do cartão virtual! 🎉', cor: 'azul', para: '', expira: '', criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() }, { id: 'pi-z', texto: 'Bia, pode apresentar o resultado do piloto na quinta?', cor: 'amarelo', para: 'Bia', expira: '2099-12-01', criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() }); await publicar('cartoes'); });
  await qb.evaluate(async () => { await piLer(); render(); }); await qb.setViewportSize({ width: 1280, height: 760 });
  await qb.screenshot({ path: path.join(SAIDA, 'quadro-postits.png') });
  await h.waitForTimeout(3600); await h.evaluate(() => __hub.atualizar()); await h.screenshot({ path: path.join(SAIDA, 'hub.png'), fullPage: true });

  console.log('10. Planejamento multianual: time planeja 2027, grupo soma os anos');
  await t2.bringToFront(); await t2.evaluate(() => { view = 'resumo'; render(); });
  const prev2026dez = await t2.evaluate(() => previsto(db.linhas[0], '2026-12'));
  await t2.selectOption('#tAno', '+'); await t2.waitForSelector('#naA');
  await t2.selectOption('#naA', '2027'); await t2.selectOption('#naM', 'prev'); await t2.fill('#naR', '10'); await btn(t2, 'ok'); await t2.waitForTimeout(300);
  ok(await t2.evaluate(() => db.anos.join(',')) === '2026,2027', 'time adiciona 2027 ao horizonte do plano');
  ok(await t2.evaluate(() => db.linhas[0].orcado['2027-01']) === Math.round(prev2026dez * 1.1), '2027 começa com o previsto de 2026 + 10% de reajuste');
  ok(await t2.evaluate(() => anoV() === 2027 && view === 'plano' && totais().orcado > 0), 'o ano novo vira o ano em exibição, com orçado');
  await t2.evaluate(() => { modoPlano = 'anos'; render(); });
  ok(/2026[\s\S]*2027/.test(await t2.textContent('#pg')) && await t2.evaluate(() => !!document.querySelector('[data-va="2027"]')), 'aba Plano mostra a visão "Todos os anos"');
  await t2.evaluate(() => { view = 'futuro'; render(); });
  ok(/Vários anos/.test(await t2.textContent('#pg')) && /Horizonte/.test(await t2.textContent('#pg')), 'Futuro mostra o total de cada ano e do horizonte');
  ok(await t2.evaluate(() => db.ano === 2026 && totais(mesesAno(2026)).orcado === (50000 * 12 + 12000 * 12) * 100), 'ano base continua 2026, com os valores de antes');
  await t2.evaluate(() => { view = 'grupo'; render(); }); await t2.click('#gPasta'); await t2.waitForTimeout(500);
  await t2.click('#tPub'); await t2.waitForTimeout(600); if (await t2.evaluate(() => document.querySelector('#dlg')?.open)) { await btn(t2, 'ok'); await t2.waitForTimeout(600); }
  ok(JSON.parse(await opfs(t2, async () => ler('Gestao-Compartilhado/times/pagamentos/financas', 'plano.json'))).revision > 2, 'plano multianual publicado na pasta');
  const pl2 = await t2.evaluate(() => montarPlano({ revision: 0, generatedAt: '', hlc: '' }));
  ok(pl2.fiscalYear === 2026 && pl2.fiscalYears.join(',') === '2026,2027' && pl2.totalsByYear[2027].forecast > 0 && pl2.totals.budget === pl2.totalsByYear[2026].budget, 'plano publicado leva fiscalYears e totalsByYear (fiscalYear e totals continuam do ano base)');
  ok(pl2.lines.every(l => Object.keys(l.months).some(m => m.startsWith('2027-'))), 'plano publicado leva os meses de 2027 de cada linha');
  await g.bringToFront(); await g.click('[data-v="consolidado"]'); await g.click('#tLer'); await g.waitForTimeout(500); await g.evaluate(() => aplicar()); await g.waitForTimeout(100);
  const tAnos = await t2.evaluate(() => [2026, 2027].map(a => totais(mesesAno(a)).previsto));
  const gAnos = await g.evaluate(() => [2026, 2027].map(a => consolidado(mesesAno(a)).porTime.find(x => x.t.slug === 'pagamentos').tot.previsto));
  ok(gAnos.join() === tAnos.join(), 'grupo soma o time ano a ano: ' + gAnos.map(v => v / 100).join(' | '));
  ok(await g.evaluate(() => anosG().join(',')) === '2026,2027', 'grupo enxerga 2027 porque o time publicou 2027');
  await g.selectOption('#tAno', '2027'); await g.evaluate(() => { agrupar = 'anos'; render(); });
  ok(/Previsto por ano/.test(await g.textContent('#pg')) && /Previsto em 2027/.test(await g.textContent('#pg')), 'consolidado tem seletor de ano e a visão "Por ano"');
  await g.evaluate(() => { const t = timePorSlug('pagamentos'); tetoEditavel(t, 2027).total = 80000000; db.anos = [2026, 2027]; db.orcamento.porAno[2027] = 300000000; });
  const dir27 = await g.evaluate(() => montarDiretriz(timePorSlug('pagamentos'), { revision: 1, generatedAt: '', hlc: '' }));
  ok(dir27.capTotal === 100000000 && dir27.byYear[2027].capTotal === 80000000 && dir27.fiscalYears.join(',') === '2026,2027', 'diretriz leva o teto de cada ano (byYear), mantendo o do ano base');
  await g.evaluate(() => publicarDiretriz(timePorSlug('pagamentos'))); await g.waitForTimeout(400);
  await t2.bringToFront(); await t2.evaluate(() => { view = 'grupo'; render(); }); await t2.click('#gLer'); await t2.waitForTimeout(400);
  ok(await t2.evaluate(() => tetosDoAno(2027).capTotal === 80000000 && tetosDoAno(2026).capTotal === 100000000), 'time lê o teto de cada ano');
  ok(await t2.evaluate(() => alertas().some(a => /de 2027 acima do teto/.test(a[1]))), 'alerta de teto vale para o ano em exibição (2027)');
  const compatT = await t2.evaluate(() => { const d = structuredClone(db); delete d.anos; return normalizar(d).anos.join(','); });
  ok(compatT === '2026', 'arquivo do time sem "anos" (1.0) abre com o ano base');
  const compatG = await g.evaluate(() => { const d = structuredClone(db); delete d.anos; delete d.orcamento.porAno; d.orcamento.total = 5; for (const t of d.times) { delete t.tetos; t.teto = { total: 7, caps: {} }; } const n = normalizar(d); return n.anos.join(',') === String(n.ano) && n.orcamento.porAno[n.ano] === 5 && n.times.every(t => t.tetos[n.ano].total === 7); });
  ok(compatG, 'arquivo do grupo 1.0 migra orçamento e teto para o ano base');
  ok(await g.evaluate(() => anosPlano({ fiscalYear: 2026 }).join() === '2026' && somavel({ fiscalYear: 2026, currency: db.moeda })), 'plano 1.0 (sem fiscalYears) continua somando no ano dele');
  await g.evaluate(() => { anoVista = null; agrupar = 'anos'; view = 'consolidado'; render(); });
  await g.setViewportSize({ width: 1280, height: 860 }); await g.screenshot({ path: path.join(SAIDA, 'grupo-anos.png'), fullPage: true });
  await t2.evaluate(() => { anoVista = null; view = 'plano'; modoPlano = 'anos'; render(); }); await t2.setViewportSize({ width: 1280, height: 860 }); await t2.screenshot({ path: path.join(SAIDA, 'time-anos.png') });
  await t2.evaluate(() => { view = 'futuro'; render(); }); await t2.screenshot({ path: path.join(SAIDA, 'time-futuro-anos.png'), fullPage: true });
  await g.evaluate(() => { agrupar = 'time'; });

  console.log('12. Consolidação em níveis: gestor publica o consolidado para a liderança');
  const ch = await nova('/financas/financas_grupo.html', { 'fin-local': 'LocalChefe', 'fin-comum': 'Gestao-Compartilhado' });
  await ch.click('#iNovo'); await ch.fill('#cN', 'Diretoria Digital'); await ch.fill('#cP', 'Marina'); await ch.fill('#cA', '2026'); await ch.click('#cOk');
  await btn(ch, 'ok'); await criarSenha(ch); await ch.waitForSelector('#tNovo');
  await ch.click('#tNovoG'); await ch.fill('#mN', 'Tecnologia (Fernando)'); await ch.fill('#mS', 'tecnologia'); await ch.fill('#mT', '2.000.000'); await ch.click('#mOk');
  ok(await ch.evaluate(() => timePorSlug('tecnologia').tipo === 'grupo' && pastaUnidade(timePorSlug('tecnologia')).join('/') === 'grupos/tecnologia/financas'), 'liderança cadastra o grupo do gestor como unidade do tipo grupo');
  ok(!(await ch.textContent('#pg')).includes('HTML de finanças do time'), 'unidade do tipo grupo não oferece "HTML de finanças do time"');
  await ch.click('[data-gk="tecnologia"]'); await ch.waitForSelector('#cofreOk'); const chaveGrp = await ch.inputValue('#dlg input.code'); await cofre(ch);
  ok(/^GK1\.tecnologia-fin-\d{4}\.[A-Za-z0-9_-]{43}$/.test(chaveGrp), 'chave entre grupos no formato GK1.<grupo>-fin-AAMM');
  await ch.click('#tPasta'); await ch.waitForTimeout(300);
  await ch.evaluate(() => { tetoEditavel(timePorSlug('tecnologia'), 2027).total = 150000000; db.anos = [2026, 2027]; });
  await ch.click('[data-pd="tecnologia"]'); await ch.waitForTimeout(400);
  ok((await opfs(ch, async () => listar('Gestao-Compartilhado/grupos/tecnologia/financas'))).includes('diretriz.json'), 'diretriz da liderança em grupos/tecnologia/financas/diretriz.json');
  // Gestor: chave errada é recusada; a certa é cadastrada com aviso de cofre
  await g.bringToFront(); await g.click('[data-v="ajustes"]');
  ok(await g.evaluate(async () => { try { await cadastrarChaveAcima('GK1.outro-fin-2611.' + 'A'.repeat(43)); return false; } catch (e) { return /não do grupo/.test(e.message); } }), 'chave de outro grupo é recusada');
  await g.fill('#gAc', chaveGrp); await g.click('#gAcOk'); await cofre(g); await g.waitForTimeout(500);
  ok(await g.evaluate(() => db.acima.chaves.length === 1 && db.acima.diretriz?.revision === 1), 'gestor cadastra a chave da liderança e lê a diretriz dela');
  ok(await g.evaluate(() => tetoAcima(2026) === 200000000 && tetoAcima(2027) === 150000000), 'teto da liderança por ano chega ao gestor');
  ok(await g.evaluate(() => acimaPendente()), 'painel avisa que o consolidado ainda não subiu');
  await g.click('#gAcPub'); await g.waitForSelector('#dlg [data-r="ok"]');
  ok(/Entram: Pagamentos/.test(await g.textContent('#dlg')) && /2027/.test(await g.textContent('#dlg')), 'confirmação mostra o que sobe, por ano e por unidade');
  await btn(g, 'ok'); await g.waitForTimeout(600);
  const envAc = JSON.parse(await opfs(g, async () => ler('Gestao-Compartilhado/grupos/tecnologia/financas', 'plano.json')));
  ok(envAc.schema === 'gestao-envelope/1' && envAc.content === 'gestao-financas-plano/1' && envAc.team === 'tecnologia' && !JSON.stringify(envAc).includes('Squad'), 'consolidado publicado cifrado em grupos/tecnologia/financas/plano.json');
  const plAc = await g.evaluate(() => montarConsolidado({ revision: 0, generatedAt: '', hlc: '' }));
  ok(plAc.source.level === 'group' && plAc.units.map(u => u.slug).join() === 'pagamentos' && plAc.lines.every(l => /^pagamentos:|^grupo:/.test(l.id)) && !plAc.lines.some(l => /Squad|Licenças de observabilidade/.test(l.name)), 'uma linha por unidade e categoria, sem os nomes das linhas dos times');
  ok(await g.evaluate(() => !acimaPendente()), 'depois de publicar, o aviso some');
  // Liderança lê, revisa e soma o gestor como uma unidade
  await ch.bringToFront(); await ch.click('[data-v="consolidado"]'); await ch.click('#tLer'); await ch.waitForTimeout(500);
  ok(await ch.evaluate(() => pendentes.length === 1 && pendentes[0].t.slug === 'tecnologia'), 'consolidado do gestor aparece em Planos recebidos da liderança');
  await ch.evaluate(() => aplicar()); await ch.waitForTimeout(100);
  const gTot = await g.evaluate(() => [2026, 2027].map(a => { const t = consolidado(mesesAno(a)).total; return [t.orcado, t.previsto, t.realizado].join('/'); }));
  const chTot = await ch.evaluate(() => [2026, 2027].map(a => { const t = consolidado(mesesAno(a)).total; return [t.orcado, t.previsto, t.realizado].join('/'); }));
  ok(gTot.join() === chTot.join(), 'liderança soma exatamente o consolidado do gestor, ano a ano: ' + chTot.join(' | '));
  ok(await ch.evaluate(() => anosG().join(',')) === '2026,2027', 'liderança enxerga os anos que subiram');
  await ch.evaluate(() => { anoVista = 2027; agrupar = 'categoria'; render(); });
  ok(/Terceiros/.test(await ch.textContent('#pg')), 'liderança vê o consolidado por categoria');
  // Mudança embaixo: o aviso volta para o gestor
  await g.evaluate(() => { db.itens.push({ id: 'I-x', nome: 'Reserva', cat: 'outras', orcado: { '2026-12': 1000000 } }); });
  ok(await g.evaluate(() => acimaPendente()), 'mudança no consolidado reabre o aviso de publicar para a liderança');
  await g.evaluate(() => { db.itens = db.itens.filter(i => i.id !== 'I-x'); view = 'consolidado'; anoVista = null; render(); });
  await g.click('[data-v="times"]');
  ok(/Teto da liderança/.test(await g.textContent('#pg')), 'aba Times mostra o teto da liderança para repartir entre os times');
  ok(await g.evaluate(() => { const d = structuredClone(db); delete d.acima; for (const t of d.times) delete t.tipo; const n = normalizar(d); return n.acima.chaves.length === 0 && n.times.every(t => t.tipo === 'time'); }), 'arquivo do grupo 1.2 abre com tipo "time" e sem nível acima');
  ok(await g.evaluate(() => { const d = structuredClone(db); d.acima = { chaves: [{ kid: 'tecnologia-fin-2611', texto: 'x', em: '', origem: 'onboarding' }] }; const n = normalizar(d); return n.acima.chaves[0].origem === 'onboarding' && !!n.acima.publicacao; }), 'aceita db.acima vindo do onboarding');
  await ch.evaluate(() => { anoVista = null; agrupar = 'time'; view = 'consolidado'; render(); }); await ch.setViewportSize({ width: 1280, height: 860 }); await ch.screenshot({ path: path.join(SAIDA, 'lideranca-painel.png') });

  for (const [p, n] of [[g, 'grupo-consolidado'], [t2, 'time-resumo']]) { await p.setViewportSize({ width: 1280, height: 860 }); await p.evaluate(() => { view = typeof vCons === 'function' ? 'consolidado' : 'resumo'; render(); }); await p.screenshot({ path: path.join(SAIDA, n + '.png') }); }
  await t2.evaluate(() => { view = 'plano'; render(); }); await t2.screenshot({ path: path.join(SAIDA, 'time-plano.png') });
  await a.screenshot({ path: path.join(SAIDA, 'inicio-pronto.png') });

  console.log('13. Hub: chaves de finanças do grupo e visão dos times');
  await h.bringToFront(); await h.evaluate(() => { window.__abrir = { dir: 'LocalGestor', arq: 'financas-grupo-tecnologia.json' }; });
  await h.click('#aImpF'); await senhaAbrir(h, SENHA); await h.waitForSelector('#dlg .cofre');
  ok(/chave\(s\) de finanças/.test(await h.textContent('#dlg')), 'hub importa as chaves de finanças do arquivo do Finanças do Grupo (só leitura)');
  await btn(h, 'ok');
  ok(await h.evaluate(() => __hub.db.times.find(t => t.slug === 'pagamentos').chavesFin.length === 1 && __hub.db.times.find(t => t.slug === 'pagamentos').chaves.length === 1), 'chave de finanças fica separada da chave de tarefas do time');
  await h.evaluate(() => __hub.atualizar()); await h.waitForTimeout(300);
  const plH = await h.evaluate(() => __hub.recebidos.pagamentos.plano);
  const tAnos2 = await t2.evaluate(() => [2026, 2027].map(a => totais(mesesAno(a))));
  ok(plH && plH.porAno['2026'].previsto === tAnos2[0].previsto && plH.porAno['2027'].orcado === tAnos2[1].orcado, 'hub lê o plano agregado publicado pelo time (2026 e 2027)');
  ok(/Previsto dos times em \d{4}/.test(await h.textContent('.inss')) && /Times ativos na semana/.test(await h.textContent('.inss')), 'hub mostra cards de leitura da visão dos times');
  ok(await h.evaluate(() => !!document.querySelector('.hb')) && /previsto/.test(await h.textContent('[data-time="pagamentos"] .finl')), 'hub mostra barras por time e a linha de finanças no card do time');
  ok(!JSON.stringify(await opfs(h, async () => ler('LocalGestor2', 'hub-tecnologia.json'))).includes('pagamentos-fin'), 'chave de finanças só dentro do arquivo cifrado do hub');
  await h.setViewportSize({ width: 1280, height: 900 }); await h.screenshot({ path: path.join(SAIDA, 'hub-visao.png'), fullPage: true });

  console.log('14. Tema claro, escuro e automático');
  const fundo = p => p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const corCard = p => p.evaluate(() => { const e = document.querySelector('.card'); return e ? getComputedStyle(e).backgroundColor : ''; });
  const tPaginas = { hub: h, central: c, quadro: qc, grupo: g, time: t2, inicio: a };
  for (const [n, p] of Object.entries(tPaginas)) ok(await p.evaluate(() => !!document.getElementById('temaSel') && !!window.gestaoTema), `${n}: seletor de tema presente`);
  ok(await h.evaluate(() => document.documentElement.dataset.tema) === (ESCURO ? 'escuro' : 'claro'), 'automático segue o sistema');
  await h.evaluate(() => gestaoTema.escolher('claro')); const bgClaro = await fundo(h), cardClaro = await corCard(h);
  ok(bgClaro === 'rgb(250, 250, 252)', 'claro usa o fundo original: ' + bgClaro);
  await h.click('#temaSel>button'); await h.click('#temaSel [data-t="escuro"]');
  ok(await h.evaluate(() => document.documentElement.dataset.tema) === 'escuro' && await h.evaluate(() => localStorage.getItem('gestao.tema')) === 'escuro', 'escolha pelo seletor fica salva neste computador');
  ok(await fundo(h) === 'rgb(14, 18, 28)' && await corCard(h) !== cardClaro, 'escuro troca fundo e cards do hub');
  await c.waitForTimeout(200);
  ok(await c.evaluate(() => document.documentElement.dataset.tema) === 'escuro' && await fundo(c) === 'rgb(14, 18, 28)', 'outra ferramenta aberta acompanha a escolha (Central)');
  const corInline = await qc.evaluate(() => { const e = [...document.querySelectorAll('[style*="background"]')].find(x => x.offsetParent); return e ? getComputedStyle(e).backgroundColor : ''; });
  await h.evaluate(() => gestaoTema.escolher('claro')); await c.waitForTimeout(200);
  ok(await fundo(h) === bgClaro && await corCard(h) === cardClaro && await fundo(c) === 'rgb(250, 250, 252)', 'voltar para o claro restaura as cores originais');
  ok(corInline !== await qc.evaluate(() => { const e = [...document.querySelectorAll('[style*="background"]')].find(x => x.offsetParent); return e ? getComputedStyle(e).backgroundColor : ''; }) || !corInline, 'estilos inline também mudam com o tema (Quadro)');
  await h.evaluate(() => gestaoTema.escolher('auto'));
  ok(await h.evaluate(() => localStorage.getItem('gestao.tema')) === null && await h.evaluate(() => document.documentElement.dataset.tema) === (ESCURO ? 'escuro' : 'claro'), 'automático volta a seguir o sistema');

  console.log('15. Assistente: como funciona, "Estou com sorte" e checklist');
  const ls = await nova('/inicio.html', { 'fin-local': 'LocalSorte', 'fin-comum': 'CompSorte' });
  ok(await ls.evaluate(() => document.querySelectorAll('.ilu svg').length === 4 && /idioma que só vocês dois falam/.test(document.body.textContent)), 'primeira tela explica a solução em quatro desenhos (HTML e JSON, chave como idioma, níveis, OneDrive)');
  await ls.click('#sorte'); await ls.fill('#sN', 'Tecnologia'); await ls.fill('#sP', 'Fernando'); await ls.fill('#sT', 'Pagamentos PAG\nCartões CAR');
  await ls.click('#sL'); await ls.waitForSelector('#sL + .chip'); await ls.click('#sC'); await ls.click('#dlg [data-r="ok"]').catch(() => {}); await ls.waitForSelector('#sC + .chip');
  await ls.click('#sS'); await criarSenha(ls, SENHA2); await ls.waitForSelector('#sGo:not([disabled])');
  await ls.click('#sGo'); await cofre(ls); await ls.waitForSelector('.mapa-svg', { timeout: 30000 });
  const locS = await opfs(ls, async () => [await listar('LocalSorte'), await listar('LocalSorte/para-os-times'), await listar('LocalSorte/para-os-times/pagamentos')]);
  ok(['hub.html', 'gestao_pessoal.html', 'financas_grupo.html', 'onde-fica-cada-coisa.html', 'hub-tecnologia.json', 'gestao-tecnologia.json', 'financas-grupo-tecnologia.json'].every(n => locS[0].includes(n)), 'Estou com sorte: ferramentas do gestor geradas na pasta');
  ok(!locS[0].includes('ferias.html') && !locS[0].includes('ferias-tecnologia.json'), 'Estou com sorte: gestor não recebe Mapa de Férias à parte (férias ficam na Central, ADR-0033)');
  ok(locS[1].join() === 'cartoes,pagamentos' && ['quadro_pagamentos.html', 'financas_pagamentos.html', 'ferias.html', 'LEIA-ME.txt'].every(n => locS[2].includes(n)), 'Estou com sorte: Quadro, Finanças e Férias de cada time em para-os-times/<time>/');
  ok(/"chave":"GK1\.pagamentos-\d{4}\./.test(await opfs(ls, async () => ler('LocalSorte/para-os-times/pagamentos', 'ferias.html'))), 'Mapa de Férias do time leva a chave de tarefas do time');
  const qS = await opfs(ls, async () => ler('LocalSorte/para-os-times/pagamentos', 'quadro_pagamentos.html')), fS = await opfs(ls, async () => ler('LocalSorte/para-os-times/pagamentos', 'financas_pagamentos.html'));
  ok(/"key":"GK1\.pagamentos-\d{4}\./.test(qS) && /"chave":"GK1\.pagamentos-fin-\d{4}\./.test(fS) && /"pasta":"CompSorte"/.test(fS), 'HTMLs dos times já levam a chave certa e a pasta sincronizada');
  ok(await ls.evaluate(() => document.querySelectorAll('.tk').length === 2 && document.querySelectorAll('[data-ck]').length >= 8 && document.querySelectorAll('.inss .ins').length === 4), 'tela final com cards, desenho, chaves por time e checklist');
  await ls.click('[data-ck="cofre"]'); ok(/1/.test(await ls.textContent('#ckV')), 'checklist marca item e conta o progresso');
  ok(await ls.evaluate(() => { const m = document.querySelector('[data-ck="manter"]'); return !!m && /Sempre manter neste dispositivo/.test(m.closest('.ck').textContent) && /Windows/.test(m.closest('.ck').textContent) && /Mac/.test(m.closest('.ck').textContent); }), 'checklist pede "Sempre manter neste dispositivo" na pasta de troca, com o caminho no Windows e no Mac');
  ok(/Sempre manter neste dispositivo/.test(await opfs(ls, async () => ler('LocalSorte/para-os-times/pagamentos', 'LEIA-ME.txt'))) && /Sempre manter neste dispositivo/.test(await opfs(ls, async () => ler('CompSorte', 'LEIA-ME.md'))), 'LEIA-ME dos times e da pasta compartilhada orientam "Sempre manter neste dispositivo"');
  ok((await opfs(ls, async () => listar('CompSorte/times'))).join() === 'cartoes,pagamentos', 'pasta sincronizada recebe a estrutura dos times');
  await ls.setViewportSize({ width: 900, height: 900 }); await ls.screenshot({ path: path.join(SAIDA, 'inicio-sorte.png'), fullPage: true });
  fs.writeFileSync(path.join(SAIDA, 'gestao_sorte.html'), await opfs(ls, async () => ler('LocalSorte', 'gestao_pessoal.html')));
  const cS = await nova('/financas/testes/saida/gestao_sorte.html', {});
  await cS.evaluate(() => { window.__abrir = { dir: 'LocalSorte', arq: 'gestao-tecnologia.json' }; });
  await cS.fill('#lockPass', SENHA2); await cS.click('#btnOpen'); await cS.waitForTimeout(1500);
  ok(await cS.evaluate(() => db.teams.map(t => t.prefix + ':' + t.slug).join() === 'PAG:pagamentos,CAR:cartoes' && db.teams.every(t => /^GK1\./.test(igActiveKey(t.id)?.key || '')) && db.settings.selfName === 'Fernando'), 'Central abre com os times, prefixos, pastas e chaves de tarefas');
  ok(await cS.evaluate(() => db.ferias?.nivel === 'grupo' && db.ferias.unidade.slug === 'tecnologia' && db.ferias.unidades.map(u => u.slug + ':' + u.chaves.length).join() === 'pagamentos:1,cartoes:1'), 'Central já vem com as férias do grupo configuradas (times e chaves)');
  fs.writeFileSync(path.join(SAIDA, 'grupo_sorte.html'), await opfs(ls, async () => ler('LocalSorte', 'financas_grupo.html')));
  const gS = await nova('/financas/testes/saida/grupo_sorte.html', { 'fin-local': 'LocalSorte' });
  await gS.click('#iAbrir'); await senhaAbrir(gS, SENHA2); await gS.waitForSelector('#topo');
  ok(await gS.evaluate(() => db.times.every(t => t.chaves.length === 1 && /-fin-/.test(t.chaves[0].kid))), 'Finanças do Grupo abre com a chave de finanças de cada time');

  console.log('16. Central 15.5: finanças dos times, só leitura');
  await c.bringToFront(); await c.evaluate(() => { window.__M = { 'gestao-integracao': 'Gestao-Compartilhado' }; });
  ok(await c.evaluate(() => db.teams.every(t => /-fin-/.test(finKeyActive(t.id)?.key || '') && igActiveKey(t.id))), 'Central do assistente já vem com a chave de tarefas e a de finanças de cada time');
  await c.evaluate(() => { db.integ.finKeys = {}; }); // daqui em diante: o caminho manual (importar do Finanças do Grupo)
  await c.evaluate(() => igPickDir()); await c.waitForTimeout(600);
  ok(await c.evaluate(() => !Object.keys(db.integ.fin).length), 'sem chave de finanças, a Central não lê planos');
  ok(await c.evaluate(() => { try { finAddKey(db.teams.find(t => t.slug === 'pagamentos'), 'GK1.pagamentos-2611.' + 'A'.repeat(43)); return false; } catch (e) { return /chave de tarefas/.test(e.message); } }), 'recusa chave de tarefas no lugar da de finanças');
  await c.evaluate(() => { window.__abrir = { dir: 'LocalGestor', arq: 'financas-grupo-tecnologia.json' }; finImport(); });
  await c.waitForSelector('#finPw'); await c.fill('#finPw', SENHA); await c.click('dialog:has(#finPw) .btn.pri'); await c.waitForTimeout(1500);
  ok(await c.evaluate(() => db.integ.finKeys[db.teams.find(t => t.slug === 'pagamentos').id]?.length === 1 && !db.integ.finKeys[db.teams.find(t => t.slug === 'cartoes').id]), 'importa a chave de finanças do time do arquivo do Finanças do Grupo (só leitura)');
  const finC = await c.evaluate(() => db.integ.fin[db.teams.find(t => t.slug === 'pagamentos').id]);
  ok(finC && finC.years['2026'].f === plH.porAno['2026'].previsto && finC.years['2027'].b === plH.porAno['2027'].orcado, 'Central lê o plano publicado pelo time com os mesmos totais que o hub (2026 e 2027)');
  ok(finC && finC.cap['2026'] === 100000000, 'Central lê o teto da diretriz do grupo');
  ok(finC && typeof finC.ini === 'object' && !JSON.stringify(finC).includes('Squad'), 'retrato guarda totais e iniciativas, sem os nomes das linhas do time');
  await c.evaluate(() => { db.integ.fin[db.teams.find(t => t.slug === 'pagamentos').id].years['2026'] = { b: 1, f: 200000000, a: 0 }; go('home'); });
  ok(await c.evaluate(() => document.querySelectorAll('#home .inss .ins').length === 5 && /Finanças dos times/.test(document.querySelector('#home .inss').textContent) && /acima do teto/.test(document.querySelector('#home .inss').textContent)), 'Hoje ganha o card de finanças e avisa time acima do teto');
  await c.evaluate(() => go('teams')); ok(/previsto R\$/.test(await c.textContent('body')), 'card do time mostra a linha de finanças');
  await c.screenshot({ path: path.join(SAIDA, 'central-financas.png') });
  console.log('17. Central 15.6: finanças por iniciativa');
  ok(finC && finC.ini['PAG-042'] && finC.ini['PAG-042']['2026'].b > 0, 'retrato soma as linhas do time pelo código da iniciativa (PAG-042)');
  await c.evaluate(() => { IG.tab = 'conc'; IG.team = db.teams.find(t => t.slug === 'pagamentos').id; go('integ'); });
  ok(/sem iniciativa na Central/.test(await c.textContent('#integ')) && /PAG-042/.test(await c.textContent('#integ')), 'conciliação avisa código das finanças sem iniciativa na Central');
  await c.evaluate(() => { const i = initById('i1'); i.ref = 'PAG-042'; i.teamId = db.teams.find(t => t.slug === 'pagamentos').id; i.bucket = 'now'; changed(); });
  const fiC = await c.evaluate(() => finIni(initById('i1'), '2026'));
  ok(fiC && fiC.f === finC.ini['PAG-042']['2026'].f && fiC.b === finC.ini['PAG-042']['2026'].b && fiC.rows.length === 1, 'custo da iniciativa soma o que o time planejou para ela');
  ok(await c.evaluate(() => { const s = db.integ.fin[db.teams.find(t => t.slug === 'pagamentos').id]; s.ini['PAG-042.F2'] = { 2026: { b: 100, f: 200, a: 0 } }; const x = finIni(initById('i1'), '2026'); delete s.ini['PAG-042.F2']; return x.f === finIni(initById('i1'), '2026').f + 200; }), 'linha marcada com o código de uma feature (PAG-042.F2) entra na iniciativa');
  ok(!/sem iniciativa na Central/.test(await c.textContent('#integ')), 'aviso some quando a iniciativa existe');
  await c.evaluate(() => { go('pulse'); }); ok(await c.evaluate(() => /R\$/.test(document.querySelector('.pl-sub')?.textContent || '')), 'lista de iniciativas mostra o previsto da iniciativa');
  await c.evaluate(() => { openMeet = null; openInitId = 'i1'; renderDrawer(); }); await c.waitForTimeout(200);
  await c.click('#drawer [data-act="dr-tab"][data-v="fin"]');
  ok(/Por time/.test(await c.textContent('#drawer')) && /Pagamentos/.test(await c.textContent('#drawer')), 'painel da iniciativa ganha a aba Finanças com o custo por time');
  await c.screenshot({ path: path.join(SAIDA, 'central-financas-iniciativa.png') });

  console.log('18. Uma senha por sessão e hub da liderança');
  await h.bringToFront();
  const abrirDoHub = async alvo => { await h.evaluate(u => { const a = document.createElement('a'); a.id = 'sesLink'; a.href = u; a.target = '_blank'; a.rel = 'opener'; a.textContent = 'abrir'; document.body.appendChild(a); }, alvo);
    const [pp] = await Promise.all([h.waitForEvent('popup'), h.click('#sesLink')]); await h.evaluate(() => document.getElementById('sesLink').remove()); pp.on('pageerror', e => erros.push('popup: ' + e.message)); await pp.waitForLoadState(); return pp; };
  const pg = await abrirDoHub(SAIDA_URL + 'financas_grupo_gerado.html');
  await pg.waitForFunction(() => window.gestaoSessao && window.gestaoSessao.recebida !== null, null, { timeout: 5000 }).catch(() => {});
  ok(await pg.evaluate(() => gestaoSessao.recebida) === SENHA2, 'janela aberta pelo hub recebe a senha da sessão');
  ok(await pg.evaluate(() => pedirSenhaDlg('Senha das Finanças do Grupo', false, { sessao: true })) === SENHA2, 'Finanças do Grupo usa a senha da sessão para abrir o próprio arquivo, sem perguntar');
  pg.evaluate(() => pedirSenhaDlg('Senha das Finanças do Grupo', true, { sessao: true })).catch(() => {}); await pg.waitForSelector('#pw');
  ok(/não abre este arquivo/.test(await pg.textContent('#dlg')), 'se a senha da sessão não servir, pede a senha do arquivo com explicação');
  await pg.close();
  const pc = await abrirDoHub(SAIDA_URL + 'gestao_gerada.html');
  await pc.waitForFunction(() => document.getElementById('lockPass')?.value, null, { timeout: 5000 }).catch(() => {});
  ok(await pc.evaluate(() => document.getElementById('lockPass').value) === SENHA2 && /Senha da sessão/.test(await pc.textContent('#lockMsg')), 'Central aberta pelo hub chega com a senha preenchida');
  await pc.close();
  const [pw] = await Promise.all([h.waitForEvent('popup'), h.evaluate(u => { window.open(u, '_blank'); }, SAIDA_URL + 'financas_grupo_gerado.html')]);
  await pw.waitForLoadState(); await pw.waitForTimeout(500);
  ok(await pw.evaluate(() => gestaoSessao.recebida) === null, 'janela aberta sem clique num link do hub não recebe a senha');
  await pw.close();
  ok(await c.evaluate(() => gestaoSessao.recebida) === null && !(await c.evaluate(() => JSON.stringify(localStorage))).includes(SENHA2), 'senha da sessão só em memória (nada no localStorage)');
  // Hub 1.3 da liderança: gestor par como unidade "grupo", lido de grupos/<grupo>/financas/plano.json
  const arqChefe = (await opfs(h, async () => listar('LocalChefe'))).find(n => /^financas-grupo-.*\.json$/.test(n));
  await h.evaluate(a => { window.__abrir = { dir: 'LocalChefe', arq: a }; }, arqChefe);
  await h.click('#aImpF'); await senhaAbrir(h, SENHA); await h.waitForSelector('#dlg .cofre'); await btn(h, 'ok');
  ok(await h.evaluate(() => __hub.db.times.find(t => t.slug === 'tecnologia')?.tipo === 'grupo'), 'hub importa o gestor par como unidade do tipo grupo');
  await h.evaluate(() => __hub.atualizar()); await h.waitForTimeout(300);
  const plG = await h.evaluate(() => __hub.recebidos.tecnologia?.plano);
  ok(plG && plG.porAno['2026'] && plG.porAno['2027'] && plG.porAno['2026'].previsto === +gTot[0].split('/')[1], 'hub da liderança lê o consolidado que o gestor publicou (grupos/tecnologia/financas)');
  ok(/gestor/.test(await h.textContent('[data-time="tecnologia"]')) && /grupos\/tecnologia\//.test(await h.textContent('[data-time="tecnologia"]')) && !(await h.$('[data-time="tecnologia"] [data-novo]')), 'card do gestor mostra o consolidado, sem post-its');
  await h.evaluate(() => { const db = __hub.db, keep = db.times; db.times = keep.filter(t => t.slug === 'tecnologia'); window.__keep = keep; });
  ok(/Visão dos gestores/.test(await h.evaluate(() => __hub.painel())) && /Previsto dos gestores/.test(await h.evaluate(() => __hub.painel())), 'hub só com gestores mostra "Visão dos gestores"');
  await h.evaluate(() => { __hub.db.times = window.__keep; });
  await h.setViewportSize({ width: 1280, height: 900 }); await h.screenshot({ path: path.join(SAIDA, 'hub-lideranca.png'), fullPage: true });

  console.log('19. Assistente 2.2: pasta pessoal no OneDrive, dois tipos de arquivo e botão do hub');
  await ls.bringToFront();
  const sinais = await ls.evaluate(async () => { const r = await navigator.storage.getDirectory();
    const od = await r.getDirectoryHandle('OneDrive - Empresa', { create: true }); await (await od.getFileHandle('desktop.ini', { create: true })).createWritable().then(w => w.close());
    const comp = await r.getDirectoryHandle('CompSorte');
    return [await suspeitaDeSincronizada(od), await suspeitaDeSincronizada(comp)]; });
  ok(sinais[0].length === 0 && sinais[1].length > 0, 'pasta pessoal no OneDrive é aceita; só a pasta compartilhada gera aviso');
  ok(await ls.evaluate(() => !!document.querySelector('.dois') && /Ninguém lê sem a senha/.test(document.querySelector('.dois').textContent) && /Por que separadas/.test(document.querySelector('.dois').textContent) && !!document.querySelector('[data-ck="backup"]')), 'tela final explica os dois arquivos, a senha e pede a pasta pessoal no OneDrive no checklist');
  await ls.waitForFunction(() => /^blob:/.test(document.getElementById('abrirHub')?.href || ''), null, { timeout: 5000 }).catch(() => {});
  const [hp] = await Promise.all([ls.waitForEvent('popup'), ls.click('#abrirHub')]); hp.on('pageerror', e => erros.push('hub do assistente: ' + e.message));
  await hp.waitForLoadState(); await hp.waitForFunction(() => window.gestaoSessao && window.gestaoSessao.recebida !== null, null, { timeout: 5000 }).catch(() => {});
  ok(await hp.evaluate(() => /Hub da solução/.test(document.title + document.body.textContent) && gestaoSessao.recebida) === SENHA2, 'botão "Abrir o hub" abre o hub criado na pasta, já com a senha da sessão');
  await hp.close();
  await ls.screenshot({ path: path.join(SAIDA, 'inicio-dois-arquivos.png'), fullPage: true });

  console.log('20. Assistente 2.3: cada arquivo gerado abre pronto (chaves, arquivo e pasta lembrados)');
  // Contexto novo (IndexedDB limpo) e com os handles guardados de verdade: as ferramentas lembram arquivo e pasta.
  const ctxP = await browser.newContext({ colorScheme: ESCURO ? 'dark' : 'light' });
  const novaP = async (url, mapa) => { const p = await ctxP.newPage(); p.on('pageerror', e => erros.push(url + ': ' + e.message));
    await p.addInitScript(stub(mapa).replace('const put0', 'window.__lembrar = true; const put0').replace('IDBObjectStore.prototype.put = function', 'IDBObjectStore.prototype.__p = function')); await p.goto(base + url); return p; };
  const ap = await novaP('/inicio.html', { 'fin-local': 'LocalPronto', 'fin-comum': 'CompPronto' });
  await ap.click('#prox'); await ap.click('[data-p="gestor"]'); for (const u of ['financas', 'tarefas', 'ferias']) await ap.click(`[data-u="${u}"]`); await ap.click('#prox');
  await ap.click('[data-k="nao"]'); await ap.click('#prox');
  await ap.fill('#dN', 'Tecnologia'); await ap.fill('#dT', 'Pagamentos\nCartões'); await ap.fill('#dP', 'Fernando'); await ap.click('#prox');
  await ap.click('#pL'); await ap.waitForSelector('#pL ~ .chip'); await ap.click('#pC'); await btn(ap, 'ok'); await ap.waitForSelector('#pC ~ .chip');
  await ap.click('#prox'); await ap.click('#sC'); await criarSenha(ap, SENHA2); await ap.click('#prox');
  await ap.waitForSelector('#mapa2', { timeout: 30000 });
  const paraTimes = await opfs(ap, async () => [await listar('LocalPronto/para-os-times'), await listar('LocalPronto/para-os-times/pagamentos')]);
  ok(paraTimes[0].join() === 'cartoes,pagamentos' && ['quadro_pagamentos.html', 'financas_pagamentos.html', 'ferias.html', 'LEIA-ME.txt'].every(n => paraTimes[1].includes(n)), 'caminho normal do gestor também gera as chaves e para-os-times/<time>/');
  ok(await ap.evaluate(() => document.querySelectorAll('.tk').length === 2 && !/gere a chave/i.test(document.getElementById('wz').textContent)), 'tela final mostra as chaves de cada time e não pede para gerar chave à mão');
  const salvarP = async (arq, nome) => fs.writeFileSync(path.join(SAIDA, nome), await opfs(ap, async n => ler('LocalPronto', n), arq));
  await salvarP('hub.html', 'pronto_hub.html'); await salvarP('financas_grupo.html', 'pronto_grupo.html'); await salvarP('gestao_pessoal.html', 'pronto_central.html');
  ok(!(await opfs(ap, async () => listar('LocalPronto'))).some(n => /^ferias/.test(n)), 'gestor com Férias marcadas não recebe ferias.html nem ferias-<grupo>.json');
  // hub: abre direto o arquivo lembrado, já com os times, as chaves e a pasta sincronizada
  const hP = await novaP(SAIDA_URL + 'pronto_hub.html', {});
  await senhaAbrir(hP, SENHA2); await hP.waitForSelector('#topo'); await hP.waitForTimeout(500);
  ok(await hP.evaluate(() => __hub.db.times.every(t => t.chaves.length === 1) && raiz?.name === 'CompPronto'), 'hub abre sozinho o arquivo, com a chave de cada time e a pasta sincronizada ligada');
  // Finanças do Grupo: mesma coisa, sem escolher pasta
  const gP = await novaP(SAIDA_URL + 'pronto_grupo.html', {});
  await senhaAbrir(gP, SENHA2); await gP.waitForSelector('#topo'); await gP.waitForTimeout(500);
  ok(await gP.evaluate(() => db.times.map(t => t.prefixo + ':' + t.chaves.length).join() === 'PAG:1,CAR:1' && raiz?.name === 'CompPronto'), 'Finanças do Grupo abre sozinho, com prefixos sugeridos, chaves de finanças e pasta ligada');
  // Central: "Continuar com" o arquivo do assistente, pasta de integração já conectada, chaves de tarefas e de finanças
  const cP = await novaP(SAIDA_URL + 'pronto_central.html', {});
  await cP.waitForSelector('#btnLast:not(.hidden)', { timeout: 5000 });
  ok(/gestao-tecnologia\.json/.test(await cP.textContent('#btnLast')), 'Central oferece "Continuar com gestao-tecnologia.json" sem escolher arquivo');
  await cP.fill('#lockPass', SENHA2); await cP.click('#btnLast'); await cP.waitForFunction(() => !document.querySelector('#app').classList.contains('hidden'), null, { timeout: 8000 });
  ok(await cP.evaluate(async () => (await igLoadDir())?.name === 'CompPronto' && db.teams.map(t => t.prefix).join() === 'PAG,CAR' && db.teams.every(t => igActiveKey(t.id) && finKeyActive(t.id))), 'Central abre com a pasta de integração conectada, prefixos e as duas chaves de cada time');
  await cP.click('[data-go="ferias"]'); await cP.waitForSelector('#ferias iframe'); const feP = await (await cP.$('#ferias iframe')).contentFrame(); await feP.waitForSelector('#tNova', { timeout: 8000 }); await cP.waitForTimeout(600);
  ok(await feP.evaluate(() => db.unidade.slug === 'tecnologia' && db.unidades.every(u => u.chaves.length === 1 && u.origem === 'central') && raiz?.name === 'CompPronto'), 'página Férias da Central abre pronta: grupo, times com chave e a pasta da Integração, sem outra senha');
  // Central 15.8: botão em destaque para gerar a chave de integração dentro do time
  await cP.evaluate(() => { db.teams.push({ id: 'tmN', name: 'Pix Novo', prefix: '', slug: '', createdAt: Date.now() }); teamSel = 'tmN'; tmView = 'overview'; go('team'); });
  ok(await cP.evaluate(() => !!document.querySelector('#team .tmkey [data-act="tm-newkey"]') && !!document.querySelector('#team [data-act="tm-view"][data-v="integ"] .fdot')), 'time sem chave: aviso em destaque com "Gerar chave de integração" e ponto na aba Integração');
  await cP.setViewportSize({ width: 1280, height: 640 }); await cP.screenshot({ path: path.join(SAIDA, 'central-time-sem-chave.png') });
  await cP.click('#team .tmkey [data-act="tm-newkey"]'); await cP.waitForSelector('#cofreOk, #f4ok', { timeout: 5000 }).catch(() => {});
  ok(await cP.evaluate(() => { const t = teamById('tmN'); return t.slug === 'pix-novo' && t.prefix === 'PIX' && /^GK1\.pix-novo-\d{4}\./.test(igActiveKey('tmN')?.key || '') && tmView === 'integ'; }), 'um clique gera a chave, define pasta e prefixo e mostra a aba Integração do time');
  await cP.evaluate(() => document.querySelectorAll('dialog[open]').forEach(d => d.close()));
  await cP.setViewportSize({ width: 1280, height: 800 }); await cP.screenshot({ path: path.join(SAIDA, 'central-integracao-time.png') });
  await ap.setViewportSize({ width: 900, height: 900 }); await ap.screenshot({ path: path.join(SAIDA, 'inicio-pronto-gestor.png'), fullPage: true });
  await ctxP.close();

  ok(erros.length === 0, 'sem erros de JavaScript nas páginas' + (erros.length ? ': ' + erros.join(' | ') : ''));
  await browser.close(); srv.close();
  console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : '\nTodas as verificações passaram.');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });

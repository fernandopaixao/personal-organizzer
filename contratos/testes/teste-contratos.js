// Teste dos contratos: vetores, validador e exemplos lidos pelas PRÓPRIAS ferramentas.
// Uso: node contratos/testes/teste-contratos.js   (precisa do Playwright e do Chromium instalados)
// Prova que um arquivo gerado conforme contratos/ é lido pelo hub da liderança, pelas Finanças do Grupo,
// pelo Mapa de Férias e pelo Quadro do Time, com as funções de leitura reais de cada HTML.
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const http = require('http'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..'), C = path.join(RAIZ, 'contratos');
const V = require(path.join(C, 'validar.js'));
let falhas = 0;
const ok = (c, msg) => { console.log((c ? '  ok  ' : '  FALHOU  ') + msg); if (!c) falhas++; };
const node = (...a) => spawnSync(process.execPath, [path.join(C, 'validar.js'), ...a], { encoding: 'utf8' });
const EX = path.join(C, 'exemplos', 'Gestao-Compartilhado'), CO = path.join(C, 'exemplos', 'conteudo');
const lerEx = rel => JSON.parse(fs.readFileSync(path.join(EX, rel), 'utf8'));
const lerCo = rel => JSON.parse(fs.readFileSync(path.join(CO, rel), 'utf8'));
const CHAVES = fs.readFileSync(path.join(C, 'exemplos', 'CHAVES-DE-EXEMPLO.txt'), 'utf8').match(/GK1\.[a-z0-9-]+\.[A-Za-z0-9_-]{43}/g);
const chave = kid => CHAVES.find(k => k.startsWith(`GK1.${kid}.`));

(async () => {
  console.log('Validador e vetores');
  let r = node('vetores'); ok(r.status === 0, 'vetores de teste do envelope conferem');
  r = node('exemplos'); ok(r.status === 0 && / 0 com erro/.test(r.stdout), 'todos os exemplos passam no validador'); if (r.status) console.log(r.stdout);
  // Atualizado: os exemplos cifrados batem com o conteúdo em claro (rode contratos/exemplos/gerar.js se mudar).
  const G = require(path.join(C, 'referencia', 'cripto.js')), mapa = await G.mapaDeChaves(CHAVES);
  let iguais = true;
  for (const rel of fs.readdirSync(CO, { recursive: true }).filter(f => f.endsWith('.json'))) { try { iguais &&= JSON.stringify(await G.decifrarEnv(lerEx(rel), mapa)) === JSON.stringify(lerCo(rel)); } catch { iguais = false; } }
  ok(iguais, 'cada exemplo cifrado decifra exatamente no conteúdo em claro correspondente');

  console.log('O validador pega os erros comuns');
  const papel = rel => V.papelDoCaminho(rel);
  const errosDe = (p, rel) => [...V.porSchema(p, p.schema), ...V.regrasDoConteudo(p, papel(rel)).erros];
  const plano = lerCo('times/pagamentos/financas/plano.json');
  ok(errosDe({ ...plano, totals: { ...plano.totals, forecast: plano.totals.forecast + 1 } }, 'times/pagamentos/financas/plano.json').some(e => /totals\.forecast/.test(e)), 'totals diferente da soma dos meses');
  ok(errosDe(plano, 'times/cartoes/financas/plano.json').some(e => /source\.team/.test(e)), 'source.team diferente da pasta');
  ok(errosDe(plano, 'grupos/pagamentos/financas/plano.json').some(e => /level/.test(e)), 'plano de time na pasta de grupo');
  ok(errosDe({ ...plano, generatedAt: '2026-11-20T18:12:40' }, 'times/pagamentos/financas/plano.json').some(e => /fuso/.test(e)), 'generatedAt sem fuso');
  const { writer, ...semWriter } = plano.source;
  ok(errosDe({ ...plano, source: semWriter }, 'times/pagamentos/financas/plano.json').some(e => /writer/.test(e)), 'arquivo de dono único sem writer');
  ok(errosDe(lerCo('times/pagamentos/ferias/ana-k3f9a.json'), 'times/pagamentos/ferias/bruno-z9z9z.json').some(e => /deveria se chamar/.test(e)), 'nome do arquivo diferente do writer');
  const stc = lerCo('times/pagamentos/status.json'), comFilho = JSON.parse(JSON.stringify(stc));
  comFilho.initiatives[1].items[1].featureLocalId = 'FEAT-99';
  ok(errosDe(comFilho, 'times/pagamentos/status.json').some(e => /featureLocalId FEAT-99/.test(e)), 'card que aponta para uma feature do time que não existe (featureLocalId)');
  comFilho.initiatives[1].items[1].featureLocalId = 'FEAT-7'; comFilho.initiatives[1].items[1].featureRef = 'PAG-042.F2';
  ok(errosDe(comFilho, 'times/pagamentos/status.json').some(e => /só vale para item sem featureRef/.test(e)), 'card com featureRef e featureLocalId ao mesmo tempo');
  const spr = JSON.parse(JSON.stringify(stc)); spr.sprints[2].state = 'active';
  ok(errosDe(spr, 'times/pagamentos/status.json').some(e => /no máximo uma sprint/.test(e)), 'duas sprints em andamento no status.json');
  const spr2 = JSON.parse(JSON.stringify(stc)); spr2.sprints[1].doneCommitted = 99; spr2.initiatives[0].items[1].sprintLocalId = 'SPR-99';
  const e2 = errosDe(spr2, 'times/pagamentos/status.json');
  ok(e2.some(e => /doneCommitted maior/.test(e)) && e2.some(e => /SPR-99 não está em sprints/.test(e)), 'sprint com cumprido acima do compromisso e card apontando para sprint que não existe');
  const mtc = lerCo('times/pagamentos/metricas.json');
  ok(errosDe({ ...mtc, sprint: { ...mtc.sprint, goalMet: 'talvez' } }, 'times/pagamentos/metricas.json').some(e => /goalMet/.test(e)), 'resultado da sprint com goalMet fora da lista');
  ok(errosDe({ ...mtc, sprint: { ...mtc.sprint, deliveredCommitted: 20 } }, 'times/pagamentos/metricas.json').some(e => /deliveredCommitted maior/.test(e)), 'resultado da sprint com cumprido acima do compromisso');
  const st = lerEx('times/pagamentos/status.json');
  ok(V.regrasDoEnvelope({ ...st, kid: 'pagamentos-fin-2611' }, papel('times/pagamentos/status.json')).erros.some(e => /finanças/.test(e)), 'chave de finanças cifrando status');
  ok(!V.papelDoCaminho('times/pagamentos/outra-coisa.json'), 'caminho fora do layout');
  ok(V.papelDoCaminho('times/pagamentos/financas/plano-NOTEBOOK01.json')?.copiaDe === 'times/pagamentos/financas/plano.json', 'cópia de conflito do OneDrive reconhecida');

  // ---------------------------- ferramentas reais ----------------------------
  const srv = http.createServer((q, res) => {
    const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0]));
    if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise(ok2 => srv.listen(0, ok2));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();
  // Pasta falsa com a mesma interface do File System Access que as ferramentas usam (entries/getFileHandle/getFile).
  const PASTA = `(arqs => { const f = (n, t) => ({ kind: 'file', name: n, getFile: async () => ({ text: async () => t, lastModified: Date.now() }) });
    return { kind: 'directory', async *entries() { for (const [n, t] of Object.entries(arqs)) yield [n, f(n, t)]; },
      async getFileHandle(n) { if (!(n in arqs)) throw new DOMException('não existe', 'NotFoundError'); return f(n, arqs[n]); } }; })`;
  const arquivos = (...rels) => Object.fromEntries(rels.map(rel => [path.basename(rel), fs.readFileSync(path.join(EX, rel), 'utf8')]));
  async function abrir(url) { const p = await browser.newPage(); p.on('dialog', d => d.dismiss().catch(() => {})); await p.goto(base + url); await p.waitForLoadState('load'); return p; }
  const avaliar = (p, corpo, args) => p.evaluate(new Function('args', `return (async () => { const pasta = ${PASTA};
    const mapa = async (...ks) => { const m = new Map(); for (const t of ks) { const k = lerChaveTexto(t); m.set(k.kid, await importarChave(k.raw)); } return m; };
    ${corpo} })()`), args);

  console.log('Hub da liderança (hub.html)');
  let p = await abrir('/hub.html');
  let x = await avaliar(p, `const e = await lerEnvelopes(pasta(args.grupo), 'plano', await mapa(args.kGrupo), { team: 'canais', content: PLANO });
    const t = await lerEnvelopes(pasta(args.time), 'plano', await mapa(args.kFin), { team: 'pagamentos', content: PLANO });
    const pi = await decifrarEnv(JSON.parse(args.postit), await mapa(args.kTar));
    return { grupo: e.melhor && resumoPlano(e.melhor.payload), time: t.melhor && resumoPlano(t.melhor.payload), notas: pi.notes.length };`,
    { grupo: arquivos('grupos/canais/financas/plano.json'), time: arquivos('times/pagamentos/financas/plano.json'), postit: fs.readFileSync(path.join(EX, 'times/pagamentos/postits/marina-p8x2c.json'), 'utf8'),
      kGrupo: chave('canais-fin-2611'), kFin: chave('pagamentos-fin-2611'), kTar: chave('pagamentos-2611') });
  const cons = lerCo('grupos/canais/financas/plano.json');
  ok(x.grupo?.porAno?.['2026']?.previsto === cons.totalsByYear['2026'].forecast, `consolidado do grupo Canais lido pelo hub da liderança (previsto 2026 = ${x.grupo?.porAno?.['2026']?.previsto})`);
  ok(x.time?.porAno?.['2027'] && x.time.moeda === 'BRL', 'plano do time Pagamentos lido pelo hub, com os anos do horizonte');
  ok(x.notas === 2, 'post-its do time decifrados pelo hub');
  await p.close();

  console.log('Finanças do Grupo (financas/financas_grupo.html)');
  p = await abrir('/financas/financas_grupo.html');
  x = await avaliar(p, `const r = {};
    for (const [nome, dir, base, team, content, k] of args.casos) { const e = await lerEnvelopes(pasta(dir), base, await mapa(k), { team, content }); r[nome] = e.melhor ? e.melhor.payload.revision : 'nada: ' + (e.invalidos[0]?.erro || ''); }
    const c = await lerEnvelopes(pasta(args.conflito), 'plano', await mapa(args.kGrupo), { team: 'canais', content: PLANO_SCHEMA });
    r.conflito = { rev: c.melhor?.payload.revision, copias: c.copias.length };
    return r;`, {
    kGrupo: chave('canais-fin-2611'),
    conflito: { 'plano.json': fs.readFileSync(path.join(EX, 'grupos/canais/financas/plano.json'), 'utf8'), 'plano-NOTEBOOK01.json': fs.readFileSync(path.join(EX, 'grupos/canais/financas/plano.json'), 'utf8').replace('"revision": 6', '"revision": 5') },
    casos: [
      ['consolidado', arquivos('grupos/canais/financas/plano.json'), 'plano', 'canais', 'gestao-financas-plano/1', chave('canais-fin-2611')],
      ['diretrizGrupo', arquivos('grupos/canais/financas/diretriz.json'), 'diretriz', 'canais', 'gestao-financas-diretriz/1', chave('canais-fin-2611')],
      ['planoTime', arquivos('times/pagamentos/financas/plano.json'), 'plano', 'pagamentos', 'gestao-financas-plano/1', chave('pagamentos-fin-2611')],
      ['diretrizTime', arquivos('grupo/financas/diretriz-pagamentos.json'), 'diretriz-pagamentos', 'pagamentos', 'gestao-financas-diretriz/1', chave('pagamentos-fin-2611')]
    ] });
  ok(x.consolidado === 6, 'consolidado do grupo lido pelas Finanças do Grupo da liderança');
  ok(x.diretrizGrupo === 2, 'diretriz da liderança lida pelo gestor');
  ok(x.planoTime === 14, 'plano do time lido pelo gestor');
  ok(x.diretrizTime === 3, 'diretriz do gestor lida (arquivo diretriz-<time>.json)');
  ok(x.conflito.rev === 6 && x.conflito.copias === 1, 'cópia de conflito do OneDrive: fica a maior revisão');
  await p.close();

  console.log('Mapa de Férias (ferias/ferias.html)');
  p = await abrir('/ferias/ferias.html');
  x = await avaliar(p, `const t = await lerPastaFerias(pasta(args.time), 'pagamentos', await mapa(args.kTar));
    const g = await lerPastaFerias(pasta(args.grupo), 'canais', await mapa(args.kGrupo));
    return { t: [t.writers.length, t.pessoas.length, t.ausencias.length, t.erros.length], g: [g.writers.length, g.pessoas.length, g.ausencias.length, g.units.length, g.writers[0]?.level] };`,
    { time: arquivos('times/pagamentos/ferias/ana-k3f9a.json'), grupo: arquivos('grupos/canais/ferias/marina-p8x2c.json'), kTar: chave('pagamentos-2611'), kGrupo: chave('canais-fin-2611') });
  ok(JSON.stringify(x.t) === '[1,2,3,0]', `férias do time lidas (writers, pessoas, ausências, erros = ${x.t})`);
  ok(JSON.stringify(x.g) === '[1,3,4,2,"group"]', `férias consolidadas do grupo lidas pela liderança (${x.g})`);
  await p.close();

  console.log('Quadro do Time (ferramenta-time/quadro_do_time_v1.html)');
  p = await abrir('/ferramenta-time/quadro_do_time_v1.html');
  x = await avaliar(p, `const m = await mapa(args.kTar), r = {};
    for (const [n, t] of Object.entries(args.arqs)) { const c = await decifrar(JSON.parse(t), m); r[n] = c.schema === 'gestao-catalogo/1' ? c.initiatives.length : validar(c); }
    return r;`, { kTar: chave('pagamentos-2611'), arqs: { status: fs.readFileSync(path.join(EX, 'times/pagamentos/status.json'), 'utf8'), metricas: fs.readFileSync(path.join(EX, 'times/pagamentos/metricas.json'), 'utf8'), catalogo: fs.readFileSync(path.join(EX, 'central/catalogo-pagamentos.json'), 'utf8') } });
  ok(Array.isArray(x.status) && !x.status.length, 'status.json de exemplo passa na validação do próprio Quadro' + (x.status?.length ? ': ' + x.status.join('; ') : ''));
  ok(Array.isArray(x.metricas) && !x.metricas.length, 'metricas.json de exemplo passa na validação do próprio Quadro' + (x.metricas?.length ? ': ' + x.metricas.join('; ') : ''));
  ok(x.catalogo > 0, 'catálogo da Central decifrado pelo Quadro');
  await p.close();

  await browser.close(); srv.close();
  console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : '\nTodas as verificações passaram.');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

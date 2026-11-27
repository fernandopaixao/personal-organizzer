#!/usr/bin/env node
/* ======================================================================
   Validador dos contratos da solução de gestão · sem dependências (Node 20+)

   node contratos/validar.js pasta <raiz da pasta compartilhada> --chave GK1.… [--chave GK1.…]
        Percorre a pasta como as ferramentas leem: confere caminho, nome, envelope, decifra
        com as chaves dadas e valida o conteúdo (schema + regras). Sem chave, confere só o envelope.
   node contratos/validar.js arquivo <arquivo.json> [--como times/<time>/status.json] [--chave …]
        Um arquivo cifrado. --como diz onde ele vai ficar na pasta (senão usa o próprio caminho).
   node contratos/validar.js conteudo <conteudo.json> [--como …]
        O JSON do contrato ainda em claro, antes de cifrar.
   node contratos/validar.js cifrar <conteudo.json> --chave GK1.… [--saida arquivo.json]
        Valida e cifra no envelope gestao-envelope/1 (team = source.team; writer = source.writer).
   node contratos/validar.js decifrar <arquivo.json> --chave GK1.…
   node contratos/validar.js vetores      Confere os vetores de teste de contratos/vetores/.
   node contratos/validar.js exemplos     Valida contratos/exemplos/ com as chaves de exemplo.

   Sai com código 1 se houver erro. Avisos não reprovam.
   ====================================================================== */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const G = require('./referencia/cripto.js');
const AQUI = __dirname;

/* ------------------------ JSON Schema (subconjunto usado) ------------------------ */
const schemas = {};
for (const f of fs.readdirSync(path.join(AQUI, 'schemas')).filter(f => f.endsWith('.schema.json'))) {
  const s = JSON.parse(fs.readFileSync(path.join(AQUI, 'schemas', f), 'utf8')); schemas[s.$id] = s;
}
const tipoDe = v => v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v;
const FORMATOS = {
  'date': v => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v + 'T00:00:00Z')),
  'date-time': v => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/.test(v) && !isNaN(Date.parse(v))
};
function validarSchema(v, s, raiz, onde = '$', erros = []) {
  if (s === true || s === undefined) return erros;
  if (s === false) { erros.push(`${onde}: não permitido`); return erros; }
  if (s.$ref) { const alvo = s.$ref.replace(/^#\//, '').split('/').reduce((o, k) => o?.[k], raiz); if (!alvo) erros.push(`${onde}: $ref ${s.$ref} não encontrada`); else validarSchema(v, alvo, raiz, onde, erros); }
  if (s.type) { const tipos = [].concat(s.type), t = tipoDe(v); if (!tipos.some(x => x === t || (x === 'number' && t === 'integer'))) { erros.push(`${onde}: esperado ${tipos.join('|')}, veio ${t}`); return erros; } }
  if ('const' in s && JSON.stringify(v) !== JSON.stringify(s.const)) erros.push(`${onde}: deve ser ${JSON.stringify(s.const)}`);
  if (s.enum && !s.enum.some(x => JSON.stringify(x) === JSON.stringify(v))) erros.push(`${onde}: "${v}" fora da lista ${JSON.stringify(s.enum)}`);
  if (typeof v === 'string') {
    if (s.pattern && !new RegExp(s.pattern, 'u').test(v)) erros.push(`${onde}: "${String(v).slice(0, 60)}" não segue o padrão ${s.pattern}`);
    if (s.maxLength != null && [...v].length > s.maxLength) erros.push(`${onde}: mais de ${s.maxLength} caracteres`);
    if (s.minLength != null && [...v].length < s.minLength) erros.push(`${onde}: menos de ${s.minLength} caracteres`);
    if (s.format && FORMATOS[s.format] && !FORMATOS[s.format](v)) erros.push(`${onde}: não é ${s.format} válido`);
  }
  if (typeof v === 'number') {
    if (s.minimum != null && v < s.minimum) erros.push(`${onde}: menor que ${s.minimum}`);
    if (s.maximum != null && v > s.maximum) erros.push(`${onde}: maior que ${s.maximum}`);
  }
  if (Array.isArray(v)) {
    if (s.maxItems != null && v.length > s.maxItems) erros.push(`${onde}: mais de ${s.maxItems} itens`);
    if (s.items) v.forEach((x, i) => validarSchema(x, s.items, raiz, `${onde}[${i}]`, erros));
  }
  if (tipoDe(v) === 'object') {
    for (const k of s.required || []) if (!(k in v)) erros.push(`${onde}: falta "${k}"`);
    for (const [k, x] of Object.entries(v)) {
      if (s.propertyNames) { const e = validarSchema(k, s.propertyNames, raiz, `${onde}{${k}}`); erros.push(...e); }
      if (s.properties && k in s.properties) validarSchema(x, s.properties[k], raiz, `${onde}.${k}`, erros);
      else if (s.additionalProperties !== undefined && s.additionalProperties !== true) validarSchema(x, s.additionalProperties, raiz, `${onde}.${k}`, erros);
    }
  }
  if (s.anyOf && !s.anyOf.some(x => !validarSchema(v, x, raiz, onde).length)) erros.push(`${onde}: não atende a nenhuma das opções (anyOf)`);
  if (s.oneOf && s.oneOf.filter(x => !validarSchema(v, x, raiz, onde).length).length !== 1) erros.push(`${onde}: deve atender a exatamente uma opção (oneOf)`);
  if (s.not && !validarSchema(v, s.not, raiz, onde).length) erros.push(`${onde}: forma não permitida (not)`);
  return erros;
}
const porSchema = (v, id) => { const s = schemas[id]; return s ? validarSchema(v, s, s) : [`schema ${id} não existe em contratos/schemas/`]; };

/* ------------------------------ mapa da pasta ------------------------------ */
// Cada arquivo de dados da pasta compartilhada: onde fica, qual conteúdo, de quem é a chave e quem escreve.
// familia: 'tarefas' (chave do time, GK1.<time>-AAMM), 'financas' (GK1.<time|grupo>-fin-AAMM) ou 'grupo'
// (chave que a liderança gerou para o grupo: -fin- ou -fer-). dono: 'unico' (um arquivo, um dono),
// 'pessoa' (um arquivo por <pessoa>-<computador>) ou 'publicador' (status/métricas/catálogo, sem writer).
const SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*';
const MAPA = [
  { re: new RegExp(`^central/catalogo-(${SLUG})\\.json$`), content: 'gestao-catalogo/1', familia: 'tarefas', dono: 'publicador', quem: 'Central de Gestão' },
  { re: new RegExp(`^times/(${SLUG})/status\\.json$`), content: 'gestao-status/1', familia: 'tarefas', dono: 'publicador', quem: 'ferramenta do time' },
  { re: new RegExp(`^times/(${SLUG})/metricas\\.json$`), content: 'gestao-metricas/1', familia: 'tarefas', dono: 'publicador', quem: 'ferramenta do time' },
  { re: new RegExp(`^times/(${SLUG})/quadro/([^/]+)\\.json$`), content: 'quadro-contrib/1', familia: 'tarefas', dono: 'pessoa', interno: true, quem: 'Quadro do Time' },
  { re: new RegExp(`^times/(${SLUG})/financas/plano\\.json$`), content: 'gestao-financas-plano/1', familia: 'financas', dono: 'unico', nivel: 'team', quem: 'finanças do time' },
  { re: new RegExp(`^grupo/financas/diretriz-(${SLUG})\\.json$`), content: 'gestao-financas-diretriz/1', familia: 'financas', dono: 'unico', quem: 'Finanças do Grupo do gestor' },
  { re: new RegExp(`^grupos/(${SLUG})/financas/plano\\.json$`), content: 'gestao-financas-plano/1', familia: 'financas', dono: 'unico', nivel: 'group', quem: 'gestor do grupo (consolidado para a liderança)' },
  { re: new RegExp(`^grupos/(${SLUG})/financas/diretriz\\.json$`), content: 'gestao-financas-diretriz/1', familia: 'financas', dono: 'unico', quem: 'liderança' },
  { re: new RegExp(`^times/(${SLUG})/ferias/([^/]+)\\.json$`), content: 'gestao-ferias/1', familia: 'tarefas', dono: 'pessoa', nivel: 'team', quem: 'cada pessoa do time' },
  { re: new RegExp(`^grupos/(${SLUG})/ferias/([^/]+)\\.json$`), content: 'gestao-ferias/1', familia: 'grupo', dono: 'pessoa', nivel: 'group', quem: 'gestor do grupo (consolidado para a liderança)' },
  { re: new RegExp(`^times/(${SLUG})/postits/vistos/([^/]+)\\.json$`), content: 'gestao-postits-vistos/1', familia: 'tarefas', dono: 'pessoa', quem: 'cada pessoa do time' },
  { re: new RegExp(`^times/(${SLUG})/postits/([^/]+)\\.json$`), content: 'gestao-postits/1', familia: 'tarefas', dono: 'pessoa', quem: 'cada autor (Hub)' }
];
const IGNORADOS = [/(^|\/)\.aberto-[^/]*\.json$/, /^LEIA-ME\.md$/i, /^contrato\//, /^contratos\//, /^onde-fica-cada-coisa\.html$/, /(^|\/)\.[^/]*$/];
function papelDoCaminho(rel) {
  rel = rel.split(path.sep).join('/');
  for (const m of MAPA) { const x = m.re.exec(rel); if (x) return { ...m, team: x[1], nomeBase: x[2] || null, rel }; }
  // Cópias de conflito do OneDrive de arquivos de dono único ("plano-NOTEBOOK01.json", "status (1).json").
  const c = /^(.*\/)?([a-z-]+?)(?:-[^/]+?| ?\(\d+\))\.json$/.exec(rel);
  if (c) for (const m of MAPA.filter(m => m.dono !== 'pessoa')) { const orig = (c[1] || '') + c[2] + '.json', x = m.re.exec(orig); if (x) return { ...m, team: x[1], rel, copiaDe: orig }; }
  return null;
}

/* ------------------------------ regras além do schema ------------------------------ */
const ISO_FUSO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)$/;
const YMD = /^\d{4}-\d{2}-\d{2}$/, YM = /^\d{4}-\d{2}$/;
const INIT_RE = /^[A-Z]{2,5}-[0-9]{3,}$/, FEAT_RE = /^[A-Z]{2,5}-[0-9]{3,}\.F[0-9]+$/;
function regrasDoConteudo(p, papel) {
  const E = [], A = [], P = (c, m) => { if (!c) E.push(m); }, W = (c, m) => { if (!c) A.push(m); };
  P(ISO_FUSO.test(p.generatedAt || ''), 'generatedAt precisa ser ISO 8601 com fuso (ex.: 2026-11-24T16:05:00-03:00)');
  P(Number.isInteger(p.revision) && p.revision >= 1, 'revision precisa ser inteiro ≥ 1');
  const cat = p.schema === 'gestao-catalogo/1', timeDoConteudo = cat ? p.teams?.[0]?.slug : p.source?.team;
  P(G.SLUG_RE.test(timeDoConteudo || ''), cat ? 'teams[0].slug precisa ser o slug do time' : 'source.team precisa ser o slug do time ou do grupo');
  if (p.hlc !== undefined) P(/^\d+\.\d+$/.test(p.hlc), 'hlc no formato <ms>.<contador>');
  P(Buffer.byteLength(JSON.stringify(p)) <= 2e6, 'conteúdo acima de 2 MB');
  if (papel) {
    P(p.schema === papel.content, `neste caminho o conteúdo é ${papel.content}, veio ${p.schema}`);
    P(timeDoConteudo === papel.team, `${cat ? 'teams[0].slug' : 'source.team'} "${timeDoConteudo}" diferente do slug do caminho "${papel.team}"`);
    if (papel.dono !== 'publicador') P(G.WRITER_RE.test(p.source?.writer || ''), 'source.writer (<pessoa>~<computador>) é obrigatório neste arquivo');
    if (papel.dono === 'pessoa' && papel.nomeBase && p.source?.writer) {
      const esperado = G.arquivoDoWriter(p.source.writer).replace(/\.json$/, '');
      if (papel.nomeBase !== esperado) (papel.nomeBase.startsWith(esperado) ? W : P)(false, `o arquivo deveria se chamar ${esperado}.json (writer ${p.source.writer})${papel.nomeBase.startsWith(esperado) ? ': parece cópia de conflito do OneDrive' : ''}`);
    }
    if (papel.nivel === 'group') P(p.source?.level === 'group', 'em grupos/<grupo>/ o conteúdo leva source.level = "group"');
    if (papel.nivel === 'team') P(p.source?.level === undefined || p.source.level === 'team', 'em times/<time>/ source.level é "team" ou ausente');
  }
  const s = p.schema;
  if (cat) for (const i of p.initiatives || []) { P(INIT_RE.test(i.ref), `iniciativa ${i.ref}: código inválido`); P(i.team === timeDoConteudo, `iniciativa ${i.ref}: team diferente de teams[0].slug`); if (p.teams?.[0]?.prefix) W(i.ref.startsWith(p.teams[0].prefix + '-'), `iniciativa ${i.ref} sem o prefixo ${p.teams[0].prefix}`); }
  if (s === 'gestao-status/1') {
    const sps = p.sprints || [], spIds = new Set(sps.map(x => x.localId)), fLocTodas = new Set((p.initiatives || []).flatMap(i => (i.items || []).filter(x => x.kind === 'feature').map(x => x.localId)));
    P(sps.filter(x => x.state === 'active').length <= 1, 'sprints[]: no máximo uma sprint com state "active"');
    P(spIds.size === sps.length, 'sprints[]: localId repetido');
    for (const x of sps) {
      if (x.start && x.end) P(x.start <= x.end, `sprint ${x.localId}: end antes de start`);
      if (x.doneCommitted !== undefined) P(x.doneCommitted <= (x.committed ?? 0), `sprint ${x.localId}: doneCommitted maior que committed`);
      W(x.state !== 'planned' || x.doneCommitted === undefined, `sprint ${x.localId}: sprint planejada não tem doneCommitted`);
      for (const f of x.features || []) { P(!!f.ref !== !!f.localId, `sprint ${x.localId}: cada feature leva ref ou localId (um dos dois)`); if (f.ref) P(FEAT_RE.test(f.ref), `sprint ${x.localId}: feature ${f.ref} inválida`); if (f.localId) W(fLocTodas.has(f.localId), `sprint ${x.localId}: feature ${f.localId} não aparece como item kind "feature"`); }
    }
    for (const i of p.initiatives || []) for (const it of i.items || []) if (it.sprintLocalId !== undefined) P(spIds.has(it.sprintLocalId), `${it.localId}: sprintLocalId ${it.sprintLocalId} não está em sprints[]`);
    for (const i of p.initiatives || []) {
      P(i.ref === null || i.ref === undefined || INIT_RE.test(i.ref), `${i.localId}: ref inválido`);
      for (const f of i.features || []) { P(FEAT_RE.test(f.ref), `${i.localId}: feature ${f.ref} inválida`); if (i.ref) W(f.ref.startsWith(i.ref + '.'), `${f.ref} não é feature de ${i.ref}`); }
      const fLoc = new Set((i.items || []).filter(x => x.kind === 'feature').map(x => x.localId));
      for (const it of i.items || []) {
        P(!it.link || /^https:\/\//.test(it.link), `${it.localId}: link deve ser https`);
        if (it.featureLocalId !== undefined) { P(!it.featureRef, `${it.localId}: featureLocalId só vale para item sem featureRef`); P(fLoc.has(it.featureLocalId), `${it.localId}: featureLocalId ${it.featureLocalId} não é um item kind "feature" desta iniciativa`); }
        if (it.kind === 'feature' && it.featureRef) W(false, `${it.localId}: item kind "feature" com featureRef; feature é um nível (Iniciativa › Feature › Card), use kind "entrega" para o card que entrega a feature da Central`);
      }
      P(!i.link || /^https:\/\//.test(i.link), `${i.localId}: link deve ser https`);
    }
  }
  if (s === 'gestao-metricas/1') {
    const ids = new Set(), sp = p.sprint;
    if (sp) {
      if (sp.start && sp.end) P(sp.start <= sp.end, 'sprint: end antes de start');
      if (sp.deliveredCommitted !== undefined) P(sp.deliveredCommitted <= (sp.committed ?? 0), 'sprint: deliveredCommitted maior que committed');
      if (sp.deliveredCommitted !== undefined && sp.delivered !== undefined) P(sp.deliveredCommitted <= sp.delivered, 'sprint: deliveredCommitted maior que delivered');
      W(sp.goalMet === undefined || sp.goal, 'sprint: goalMet sem goal');
    }
    for (const m of p.metrics || []) {
      P(!ids.has(m.id), `métrica ${m.id} repetida`); ids.add(m.id);
      P(['team', 'initiative', 'feature'].includes(m.scope?.level ?? 'team'), `métrica ${m.id}: nada por pessoa (scope.level)`);
      W(m.standard || m.definition, `métrica ${m.id}: métrica própria sem definition (a Central mostra a definição ao passar o mouse; o Quadro exige)`);
    }
  }
  if (s === 'gestao-financas-plano/1') {
    const anos = (p.fiscalYears?.length ? p.fiscalYears : [p.fiscalYear]).map(Number);
    P(anos.includes(p.fiscalYear), 'fiscalYears precisa incluir fiscalYear');
    const cats = new Set((p.categories || []).map(c => c.id));
    const soma = ano => { const t = { budget: 0, forecast: 0, actual: 0 }; for (const l of p.lines || []) for (const [m, v] of Object.entries(l.months || {})) if (m.startsWith(ano + '-')) for (const k in t) t[k] += +v?.[k] || 0; return t; };
    for (const l of p.lines || []) {
      W(!cats.size || cats.has(l.category), `linha ${l.id}: categoria "${l.category}" fora de categories (o grupo soma em "Outras")`);
      for (const [m, v] of Object.entries(l.months || {})) { P(YM.test(m), `linha ${l.id}: mês ${m} fora do formato AAAA-MM`); for (const k of ['budget', 'forecast', 'actual']) if (v?.[k] !== undefined) P(Number.isInteger(v[k]), `linha ${l.id} ${m}.${k}: valores em centavos inteiros`); }
      if (l.initiative) W(INIT_RE.test(l.initiative), `linha ${l.id}: initiative "${l.initiative}" não parece código de iniciativa (PAG-042)`);
    }
    const t0 = soma(p.fiscalYear);
    if (p.totals) for (const k of ['budget', 'forecast', 'actual']) P((p.totals[k] || 0) === t0[k], `totals.${k} (${p.totals[k]}) diferente da soma dos meses de ${p.fiscalYear} (${t0[k]}): o hub mostra totals e o grupo soma os meses`);
    for (const [a, x] of Object.entries(p.totalsByYear || {})) { const ta = soma(a); for (const k of ['budget', 'forecast', 'actual']) P((x?.[k] || 0) === ta[k], `totalsByYear.${a}.${k} (${x?.[k]}) diferente da soma dos meses (${ta[k]})`); }
    W(p.totals, 'sem totals: o hub da liderança mostra os totais publicados');
    if (p.source?.level === 'group') {
      P(Array.isArray(p.units) && p.units.length, 'consolidado de grupo precisa de units (unidades somadas)');
      for (const l of p.lines || []) W(/^[a-z0-9-]+:[a-z0-9-]+(:[OC])?$/.test(l.id), `linha ${l.id}: no consolidado o id é <unidade>:<categoria>:<O|C> (ou grupo:<categoria>)`);
    }
    for (const m of p.closedMonths || []) P(YM.test(m), `closedMonths: ${m} fora do formato AAAA-MM`);
  }
  if (s === 'gestao-financas-diretriz/1') {
    if (papel && !papel.rel.startsWith('grupos/')) P(p.team?.slug === undefined || p.team.slug === papel.team, 'team.slug diferente do time do nome do arquivo');
    for (const [a, x] of Object.entries(p.byYear || {})) for (const v of Object.values(x.caps || {})) P(Number.isInteger(v), `byYear.${a}: tetos em centavos inteiros`);
  }
  if (s === 'gestao-ferias/1') {
    const ids = new Set((p.people || []).map(x => x.id));
    for (const a of p.absences || []) { P(ids.has(a.person), `ausência de "${a.person}" sem a pessoa em people`); P(YMD.test(a.start) && YMD.test(a.end) && a.start <= a.end, `ausência de ${a.person}: start ≤ end, datas AAAA-MM-DD`); }
    W(p.hlc, 'sem hlc: quem lê fica com o arquivo de HLC mais novo de cada pessoa; publique hlc');
    if (p.source?.level === 'group') { P(p.units?.length, 'consolidado de grupo precisa de units (a primeira é a própria unidade)'); if (p.units?.length) P(p.units[0].slug === p.source.team && !p.units[0].parent, 'units[0] é a própria unidade, com parent null'); }
  }
  if (s === 'gestao-postits/1') {
    const ids = new Set();
    for (const n of p.notes || []) { P(!ids.has(n.id), `post-it ${n.id} repetido`); ids.add(n.id); if (n.expiresAt) W(n.expiresAt >= new Date().toISOString().slice(0, 10), `post-it ${n.id} vencido (não deveria ser publicado)`); }
  }
  return { erros: E, avisos: A };
}

/* ------------------------------ envelope ------------------------------ */
function regrasDoEnvelope(env, papel) {
  const E = porSchema(env, 'gestao-envelope/1'), A = [];
  try { if (G.b64.dec(env.iv).length !== 12) E.push('iv precisa ter 12 bytes'); } catch { E.push('iv não é base64'); }
  try { if (G.b64.dec(env.ct).length < 17) E.push('ct curto demais (texto + tag de 16 bytes)'); } catch { E.push('ct não é base64'); }
  if (papel) {
    if (env.content !== papel.content) E.push(`neste caminho o conteúdo é ${papel.content}, o envelope diz ${env.content}`);
    if (env.team !== papel.team) E.push(`team "${env.team}" diferente do slug do caminho "${papel.team}"`);
    if (env.kid && !(env.kid === env.team || env.kid.startsWith(env.team + '-'))) A.push(`kid "${env.kid}" não começa pelo slug "${env.team}" (as ferramentas avisam ou recusam)`);
    const fin = /(^|-)fin(-|$)/.test(env.kid || '');
    if (papel.familia === 'financas' && !fin) A.push(`kid "${env.kid}": arquivos de finanças usam a chave de finanças (<slug>-fin-AAMM), separada da de tarefas (ADR-0006)`);
    if (papel.familia === 'tarefas' && fin) E.push(`kid "${env.kid}": a chave de finanças não pode cifrar ${papel.content} (ADR-0006)`);
    if (papel.dono !== 'publicador' && !env.writer) E.push('writer em claro no cabeçalho é obrigatório neste arquivo (um dono por arquivo, ADR-0007)');
    if (papel.copiaDe) A.push(`cópia de conflito do OneDrive de ${papel.copiaDe}: as ferramentas ficam com a maior revisão e limpam a cópia`);
    if (papel.interno) A.push(`${papel.content} é interno do Quadro do Time: outras soluções não escrevem aqui`);
  }
  return { erros: E, avisos: A };
}

/* ------------------------------ comandos ------------------------------ */
const args = process.argv.slice(2), cmd = args[0];
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const opts = n => args.flatMap((a, i) => a === n ? [args[i + 1]] : []);
const posicional = () => args.slice(1).find((a, i, l) => !a.startsWith('--') && !(i > 0 && l[i - 1].startsWith('--')));
let falhas = 0, total = 0;
function relatorio(nome, r) {
  total++;
  if (r.erros.length) falhas++;
  console.log(`${r.erros.length ? '✗' : r.avisos.length ? '!' : '✓'} ${nome}${r.info ? '  · ' + r.info : ''}`);
  for (const e of r.erros) console.log('    erro:  ' + e);
  for (const a of r.avisos) console.log('    aviso: ' + a);
}
const lerJson = f => JSON.parse(fs.readFileSync(f, 'utf8'));
async function checarCifrado(env, papel, chaves) {
  const r = regrasDoEnvelope(env, papel);
  if (r.erros.length && !env?.ct) return r;
  if (!chaves.has(env.kid)) { r.avisos.push(`sem a chave "${env.kid}": conteúdo não conferido`); r.info = `${env.content} rev. ${env.revision}`; return r; }
  try {
    const p = await G.decifrarEnv(env, chaves);
    if (papel?.interno) { r.info = `${p.schema} rev. ${p.revision} (interno)`; return r; }
    const c = regrasDoConteudo(p, papel), s = porSchema(p, p.schema);
    r.erros.push(...s, ...c.erros); r.avisos.push(...c.avisos);
    if (papel && papel.dono !== 'publicador' && env.writer !== p.source?.writer) r.erros.push('writer do cabeçalho diferente de source.writer');
    r.info = `${p.schema} rev. ${p.revision}${p.source?.writer ? ' · ' + p.source.writer : ''}`;
  } catch (e) { r.erros.push(e.message); }
  return r;
}
async function cmdPasta(raiz, chaves) {
  const andar = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? andar(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of andar(raiz).sort()) {
    const rel = path.relative(raiz, f).split(path.sep).join('/');
    if (IGNORADOS.some(re => re.test(rel))) continue;
    if (!rel.endsWith('.json')) { relatorio(rel, { erros: [], avisos: ['arquivo fora do contrato (as ferramentas ignoram)'] }); continue; }
    const papel = papelDoCaminho(rel);
    if (!papel) { relatorio(rel, { erros: ['caminho fora do layout da pasta compartilhada (contratos/01-arquitetura.md, seção 3)'], avisos: [] }); continue; }
    let env; try { env = lerJson(f); } catch { relatorio(rel, { erros: ['não é JSON (arquivo incompleto?)'], avisos: [] }); continue; }
    relatorio(rel, await checarCifrado(env, papel, chaves));
  }
}
async function main() {
  const chaves = await G.mapaDeChaves(opts('--chave'));
  if (cmd === 'pasta') await cmdPasta(posicional() || '.', chaves);
  else if (cmd === 'arquivo') { const f = posicional(), como = opt('--como'); relatorio(f, await checarCifrado(lerJson(f), papelDoCaminho(como || f.replace(/^.*?(?=(central|times|grupos?)\/)/, '')), chaves)); }
  else if (cmd === 'conteudo') {
    const f = posicional(), p = lerJson(f), como = opt('--como'), papel = como ? papelDoCaminho(como) : null;
    const c = regrasDoConteudo(p, papel); relatorio(f, { erros: [...porSchema(p, p.schema), ...c.erros], avisos: c.avisos, info: p.schema });
  }
  else if (cmd === 'cifrar') {
    const f = posicional(), p = lerJson(f), [texto] = opts('--chave');
    const c = regrasDoConteudo(p, null), e = [...porSchema(p, p.schema), ...c.erros];
    if (e.length) { relatorio(f, { erros: e, avisos: c.avisos }); process.exit(1); }
    const k = G.lerChaveTexto(texto), env = await G.cifrarEnv(p, { key: chaves.get(k.kid), kid: k.kid, team: p.source.team });
    const saida = JSON.stringify(env, null, 1);
    if (opt('--saida')) { fs.writeFileSync(opt('--saida'), saida); console.error(`gravado ${opt('--saida')}`); } else console.log(saida);
    return;
  }
  else if (cmd === 'decifrar') { console.log(JSON.stringify(await G.decifrarEnv(lerJson(posicional()), chaves), null, 2)); return; }
  else if (cmd === 'vetores') await cmdVetores();
  else if (cmd === 'exemplos') {
    const ks = fs.readFileSync(path.join(AQUI, 'exemplos', 'CHAVES-DE-EXEMPLO.txt'), 'utf8').match(/GK1\.[a-z0-9-]+\.[A-Za-z0-9_-]{43}/g);
    await cmdPasta(path.join(AQUI, 'exemplos', 'Gestao-Compartilhado'), await G.mapaDeChaves(ks));
    const dc = path.join(AQUI, 'exemplos', 'conteudo');
    for (const f of fs.readdirSync(dc, { recursive: true }).filter(f => f.endsWith('.json')).sort()) {
      const p = lerJson(path.join(dc, f)), c = regrasDoConteudo(p, papelDoCaminho(f));
      relatorio('conteudo/' + f, { erros: [...porSchema(p, p.schema), ...c.erros], avisos: c.avisos, info: p.schema });
    }
  }
  else { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(2, 19).join('\n').replace(/^ {3}/gm, '')); process.exit(cmd ? 1 : 0); }
  console.log(`\n${total} arquivo(s), ${falhas} com erro.`);
  process.exit(falhas ? 1 : 0);
}
async function cmdVetores() {
  const v = lerJson(path.join(AQUI, 'vetores', 'vetores-envelope.json'));
  for (const t of v.casos) {
    const r = { erros: [], avisos: [] };
    try {
      const k = G.lerChaveTexto(t.chave), mapa = await G.mapaDeChaves([t.chave]);
      if (G.b64.enc(k.raw) !== t.chaveBytesBase64) r.erros.push('bytes da chave não conferem');
      if (t.aad && G.aadTexto(t.envelope) !== t.aad) r.erros.push('AAD não confere');
      if (t.payloadJson) {
        const env = await G.cifrarEnv(JSON.parse(t.payloadJson), { key: mapa.get(k.kid), kid: k.kid, team: t.envelope.team }, G.b64.dec(t.envelope.iv));
        if (env.ct !== t.envelope.ct) r.erros.push('cifrar com o mesmo iv não reproduz o ct');
      }
      let p = null, erro = null; try { p = await G.decifrarEnv(t.envelope, mapa); } catch (e) { erro = e.message; }
      if (t.espera === 'ok' && !p) r.erros.push('deveria decifrar: ' + erro);
      if (t.espera === 'ok' && p && JSON.stringify(p) !== t.payloadJson) r.erros.push('conteúdo decifrado diferente do esperado');
      if (t.espera === 'falha' && p) r.erros.push('deveria falhar ao decifrar');
    } catch (e) { r.erros.push(e.message); }
    relatorio(`vetor ${t.nome}`, r);
  }
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { validarSchema, porSchema, papelDoCaminho, regrasDoConteudo, regrasDoEnvelope, checarCifrado, schemas };

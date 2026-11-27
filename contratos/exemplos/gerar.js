#!/usr/bin/env node
/* Gera os exemplos dos contratos: conteudo/ (em claro) e Gestao-Compartilhado/ (cifrados, no layout real da pasta).
   node contratos/exemplos/gerar.js
   Cenário: o time Pagamentos (prefixo PAG) do grupo Canais, gerido pela Marina; a liderança (Rafael) recebe o
   consolidado do grupo Canais. As chaves são PÚBLICAS e determinísticas (CHAVES-DE-EXEMPLO.txt): nunca use em dados reais.
   O iv também é determinístico, só para os arquivos não mudarem a cada geração. Em produção o iv é sempre aleatório. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), { createHash } = require('node:crypto');
const G = require('../referencia/cripto.js');
const AQUI = __dirname, CONT = path.join(AQUI, 'conteudo'), CIF = path.join(AQUI, 'Gestao-Compartilhado');
const sha = s => createHash('sha256').update(s).digest();
const chaveExemplo = kid => `GK1.${kid}.${G.b64.urlEnc(new Uint8Array(sha('contratos-exemplo|' + kid)))}`;
const KIDS = { tarefas: 'pagamentos-2611', finTime: 'pagamentos-fin-2611', grupo: 'canais-fin-2611' };
const gravar = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n'); };
const W = { ana: 'ana~k3f9a', marina: 'marina~p8x2c', rafael: 'rafael~d4m7z' };

/* ------------------------- conteúdos novos (os de integração já existem) ------------------------- */
const meses = (ano, f) => Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`${ano}-${String(i + 1).padStart(2, '0')}`, f(i)]).filter(([, v]) => v.budget || v.forecast || v.actual));
const soma = (lines, ano) => { const t = { budget: 0, forecast: 0, actual: 0 }; for (const l of lines) for (const [m, v] of Object.entries(l.months)) if (m.startsWith(ano + '-')) for (const k in t) t[k] += v[k] || 0; return t; };
const categorias = [{ id: 'pessoas', name: 'Pessoas', kind: 'OPEX' }, { id: 'ferramentas', name: 'Ferramentas e licenças', kind: 'OPEX' }, { id: 'infra', name: 'Infraestrutura', kind: 'OPEX' }, { id: 'projetos', name: 'Projetos (CAPEX)', kind: 'CAPEX' }];

// 1) Plano do time: times/pagamentos/financas/plano.json (Finanças do Time, chave de finanças do time)
const linhasTime = [
  { id: 'ln-terceiros', name: 'Squad terceirizada', category: 'pessoas', kind: 'OPEX', costCenter: 'CC-1020', supplier: 'Fornecedor A',
    months: { ...meses(2026, i => ({ budget: 4800000, forecast: i < 6 ? 4800000 : 5200000, actual: i < 10 ? (i < 6 ? 4800000 : 5200000) : 0 })), ...meses(2027, i => ({ budget: 0, forecast: i < 6 ? 5200000 : 0, actual: 0 })) } },
  { id: 'ln-licencas', name: 'Licenças de observabilidade', category: 'ferramentas', kind: 'OPEX', costCenter: 'CC-1020',
    months: { ...meses(2026, i => ({ budget: 350000, forecast: 350000, actual: i < 10 ? 350000 : 0 })), ...meses(2027, () => ({ budget: 0, forecast: 380000, actual: 0 })) } },
  { id: 'ln-pix-parc', name: 'Desenvolvimento Pix parcelado', category: 'projetos', kind: 'CAPEX', costCenter: 'CC-1020', initiative: 'PAG-042',
    months: meses(2026, i => ({ budget: i >= 6 ? 2000000 : 0, forecast: i >= 6 ? (i === 11 ? 3000000 : 2000000) : 0, actual: i >= 6 && i < 10 ? 2100000 : 0 })) }
];
const planoTime = {
  schema: 'gestao-financas-plano/1', revision: 14, generatedAt: '2026-11-20T18:12:40-03:00', hlc: '1763673160000.0',
  source: { team: 'pagamentos', writer: W.ana, tool: 'financas-time', toolVersion: '1.4.0' },
  team: { name: 'Pagamentos', slug: 'pagamentos' }, fiscalYear: 2026, fiscalYears: [2026, 2027], currency: 'BRL', planVersion: 'Reforecast 1',
  closedMonths: ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'],
  categories: categorias, lines: linhasTime,
  commitments: [{ name: 'Contrato da squad terceirizada', line: 'ln-terceiros', monthly: 5200000, start: '2026-07', end: '2027-06' }],
  totals: soma(linhasTime, 2026), totalsByYear: { 2026: soma(linhasTime, 2026), 2027: soma(linhasTime, 2027) }, directiveRevision: 3
};

// 2) Diretriz do gestor para o time: grupo/financas/diretriz-pagamentos.json (Finanças do Grupo, chave de finanças do time)
const diretrizTime = {
  schema: 'gestao-financas-diretriz/1', revision: 3, generatedAt: '2026-11-03T10:00:00-03:00', hlc: '1762174800000.0',
  source: { group: 'canais', tool: 'financas-grupo', toolVersion: '1.5.0', team: 'pagamentos', writer: W.marina },
  team: { name: 'Pagamentos', slug: 'pagamentos' }, fiscalYear: 2026, currency: 'BRL', categories: categorias, costCenters: ['CC-1020', 'CC-1030'],
  caps: { pessoas: 62000000, ferramentas: 4500000, projetos: 14000000 }, capTotal: 80500000, fiscalYears: [2026, 2027],
  byYear: { 2026: { caps: { pessoas: 62000000, ferramentas: 4500000, projetos: 14000000 }, capTotal: 80500000 }, 2027: { caps: { pessoas: 64000000 }, capTotal: 70000000 } },
  planVersion: 'Reforecast 1', publishBy: '2026-11-28', closingDay: 5, note: 'Reforecast até dia 28. Explique a variação do CAPEX do Pix parcelado.'
};

// 3) Consolidado do grupo para a liderança: grupos/canais/financas/plano.json (chave que a liderança gerou para o grupo)
const linhaGrupo = (unid, nome, c, months) => ({ id: `${unid}:${c.id}:${c.kind === 'CAPEX' ? 'C' : 'O'}`, name: `${nome} · ${c.name}`, category: c.id, kind: c.kind, months });
const cat = id => categorias.find(c => c.id === id);
const mesesDe = (ls, catId) => { const o = {}; for (const l of ls.filter(l => l.category === catId)) for (const [m, v] of Object.entries(l.months)) { const x = o[m] ??= { budget: 0, forecast: 0, actual: 0 }; for (const k in x) x[k] += v[k] || 0; } return o; };
const linhasCartoes = [{ category: 'pessoas', months: meses(2026, i => ({ budget: 3900000, forecast: 3900000, actual: i < 10 ? 3850000 : 0 })) }, { category: 'infra', months: meses(2026, i => ({ budget: 900000, forecast: 1000000, actual: i < 10 ? 980000 : 0 })) }];
const linhasConsol = [
  ...['pessoas', 'ferramentas', 'projetos'].map(c => linhaGrupo('pagamentos', 'Pagamentos', cat(c), mesesDe(linhasTime, c))),
  ...['pessoas', 'infra'].map(c => linhaGrupo('cartoes', 'Cartões', cat(c), mesesDe(linhasCartoes, c))),
  { id: 'grupo:ferramentas', name: 'Itens do grupo · Ferramentas e licenças', category: 'ferramentas', kind: 'OPEX', months: meses(2026, () => ({ budget: 120000, forecast: 120000, actual: 0 })) }
];
const consolidado = {
  schema: 'gestao-financas-plano/1', revision: 6, generatedAt: '2026-11-21T09:30:00-03:00', hlc: '1763728200000.0',
  source: { team: 'canais', tool: 'financas-grupo', toolVersion: '1.5.0', level: 'group', writer: W.marina },
  team: { name: 'Canais', slug: 'canais' }, fiscalYear: 2026, fiscalYears: [2026, 2027], currency: 'BRL', planVersion: 'Reforecast 1', closedMonths: [],
  categories: categorias, lines: linhasConsol, commitments: [],
  units: [{ slug: 'pagamentos', name: 'Pagamentos', kind: 'time', revision: 14, generatedAt: '2026-11-20T18:12:40-03:00', planVersion: 'Reforecast 1' },
    { slug: 'cartoes', name: 'Cartões', kind: 'time', revision: 9, generatedAt: '2026-11-19T15:02:11-03:00', planVersion: 'Reforecast 1' }],
  totals: soma(linhasConsol, 2026), totalsByYear: { 2026: soma(linhasConsol, 2026), 2027: soma(linhasConsol, 2027) }, directiveRevision: 2
};

// 4) Diretriz da liderança para o grupo: grupos/canais/financas/diretriz.json (Finanças do Grupo da liderança)
const diretrizGrupo = {
  schema: 'gestao-financas-diretriz/1', revision: 2, generatedAt: '2026-11-01T08:00:00-03:00', hlc: '1762002000000.0',
  source: { group: 'diretoria-digital', tool: 'financas-grupo', toolVersion: '1.5.0', team: 'canais', writer: W.rafael },
  team: { name: 'Canais', slug: 'canais' }, fiscalYear: 2026, currency: 'BRL', categories: categorias, costCenters: [],
  caps: {}, capTotal: 160000000, fiscalYears: [2026, 2027], byYear: { 2026: { caps: {}, capTotal: 160000000 }, 2027: { caps: {}, capTotal: 150000000 } },
  planVersion: 'Reforecast 1', publishBy: '2026-11-30'
};

// 5) Férias de uma pessoa do time: times/pagamentos/ferias/ana-k3f9a.json (chave de tarefas do time)
const feriasTime = {
  schema: 'gestao-ferias/1', revision: 5, generatedAt: '2026-11-18T11:20:00-03:00', hlc: '1763475600000.0',
  source: { team: 'pagamentos', tool: 'ferias', toolVersion: '1.2.0', level: 'team', writer: W.ana },
  unit: { name: 'Pagamentos', slug: 'pagamentos', kind: 'time' }, units: [{ slug: 'pagamentos', name: 'Pagamentos', kind: 'time', parent: null }],
  people: [{ id: 'ana-souza', name: 'Ana Souza', unit: 'pagamentos' }, { id: 'bruno-lima', name: 'Bruno Lima', unit: 'pagamentos' }],
  absences: [{ person: 'ana-souza', start: '2026-12-21', end: '2027-01-08', kind: 'ferias' }, { person: 'bruno-lima', start: '2026-12-08', end: '2026-12-08', kind: 'folga' }, { person: 'bruno-lima', start: '2027-01-12', end: '2027-01-30', kind: 'ferias' }],
  holidays: [{ date: '2026-12-25', name: 'Natal' }, { date: '2027-01-01', name: 'Confraternização universal' }]
};

// 6) Férias consolidadas do grupo para a liderança: grupos/canais/ferias/marina-p8x2c.json (chave do grupo)
const feriasGrupo = {
  schema: 'gestao-ferias/1', revision: 3, generatedAt: '2026-11-21T09:40:00-03:00', hlc: '1763728800000.0',
  source: { team: 'canais', tool: 'ferias', toolVersion: '1.2.0', level: 'group', writer: W.marina },
  unit: { name: 'Canais', slug: 'canais', kind: 'grupo' },
  units: [{ slug: 'canais', name: 'Canais', kind: 'grupo', parent: null }, { slug: 'pagamentos', name: 'Pagamentos', kind: 'time', parent: 'canais' }],
  people: [{ id: 'marina-alves', name: 'Pessoa 1', unit: 'canais' }, { id: 'pagamentos.ana-souza', name: 'Pessoa 2', unit: 'pagamentos' }, { id: 'pagamentos.bruno-lima', name: 'Pessoa 3', unit: 'pagamentos' }],
  absences: [{ person: 'pagamentos.bruno-lima', start: '2026-12-08', end: '2026-12-08', kind: 'folga' }, { person: 'pagamentos.ana-souza', start: '2026-12-21', end: '2027-01-08', kind: 'ferias' }, { person: 'marina-alves', start: '2027-01-04', end: '2027-01-15', kind: 'ferias' }, { person: 'pagamentos.bruno-lima', start: '2027-01-12', end: '2027-01-30', kind: 'ferias' }],
  holidays: [{ date: '2026-12-25', name: 'Natal' }],
  contributors: [{ slug: 'pagamentos', name: 'Pagamentos', kind: 'time', files: 2, lastGeneratedAt: '2026-11-18T11:20:00-03:00' }]
};

// 7) Post-its da gestora para o time: times/pagamentos/postits/marina-p8x2c.json (Hub, chave de tarefas do time)
const postits = {
  schema: 'gestao-postits/1', revision: 8, generatedAt: '2026-11-24T08:45:00-03:00', hlc: '1763984700000.0',
  source: { team: 'pagamentos', writer: W.marina, tool: 'hub', toolVersion: '1.4.0', author: { name: 'Marina' } },
  team: { name: 'Pagamentos', slug: 'pagamentos' },
  notes: [{ id: 'pi-mhx1a2b3c', text: 'Revisão do reforecast na quinta, 10h. Tragam a variação do CAPEX.', color: 'amarelo', createdAt: '2026-11-24T08:40:00-03:00', updatedAt: '2026-11-24T08:45:00-03:00', expiresAt: '2099-12-31' },
    { id: 'pi-mhx1d4e5f', text: 'Parabéns pela entrega do PAG-042.F1!', color: 'verde', to: 'Ana Souza', createdAt: '2026-11-22T17:00:00-03:00', updatedAt: '2026-11-22T17:00:00-03:00' }]
};
// 8) Recibo "Vi": times/pagamentos/postits/vistos/ana-k3f9a.json (Quadro do Time)
const vistos = {
  schema: 'gestao-postits-vistos/1', revision: 2, generatedAt: '2026-11-24T09:02:00-03:00',
  source: { team: 'pagamentos', writer: W.ana, tool: 'quadro_do_time_v1.html', toolVersion: '2.3.0', author: { name: 'Ana Souza' } },
  seen: [{ id: 'pi-mhx1d4e5f', at: '2026-11-24T09:02:00-03:00' }]
};

// 9) Base do quadro do time: times/pagamentos/quadro/quadro-do-time.json (Central de Gestão, chave de tarefas do time, ADR-0045)
const baseQuadro = {
  schema: 'quadro-contrib/1', revision: 1, generatedAt: '2026-11-27T16:10:00-03:00',
  source: { team: 'pagamentos', writer: 'central~gestor', tool: 'gestao_pessoal_v15.html', toolVersion: '15.22' },
  db: { schema: 'quadro-time/1', createdAt: '2026-11-27T16:10:00-03:00', upd: 1, team: { name: 'Pagamentos', slug: 'pagamentos', contact: '', upd: 1 },
    settings: { upd: 1, columns: [{ id: 'backlog', name: 'Backlog', wip: null }, { id: 'pronto', name: 'Pronto para fazer', wip: null }, { id: 'fazendo', name: 'Fazendo', wip: 6 }, { id: 'validacao', name: 'Validação', wip: 4 }, { id: 'concluido', name: 'Concluído', wip: null }], commitCol: 'pronto', startCol: 'fazendo', autoPublish: true },
    seq: { card: 0, epic: 0, sprint: 0, person: 2, feature: 0, refine: 0 },
    people: [{ id: 'P-1', uid: 'central-p1', name: 'Ana Souza', role: 'Desenvolvimento', active: true, createdAt: '2026-11-27T16:10:00-03:00', upd: 1 }, { id: 'P-2', uid: 'central-p2', name: 'Bruno Lima', role: 'Qualidade', active: true, createdAt: '2026-11-27T16:10:00-03:00', upd: 1 }],
    epics: [], features: [], cards: [], sprints: [], refinements: [], publish: { revision: 0, lastStatus: null, lastMetrics: null } }
};

// Métricas de integração: completa a definition das métricas próprias (boa prática; o Quadro exige).
const met = JSON.parse(fs.readFileSync(path.join(CONT, 'times/pagamentos/metricas.json'), 'utf8'));
const DEF = { lead_time_dist: 'Cards entregues nos últimos 90 dias por faixa de lead time (dias do compromisso à entrega).', compromisso_sprint: 'Cards na sprint quando ela começou e entregues até o fim dela ÷ cards na sprint quando ela começou.', bloqueados_por_motivo: 'Cards bloqueados agora, agrupados pelo motivo informado no bloqueio.' };
for (const m of met.metrics) if (!m.standard && !m.definition && DEF[m.id]) m.definition = DEF[m.id];
// Contratos 1.2: resultado da sprint no metricas.json e sprints ao vivo no status.json (campos opcionais, aditivos).
Object.assign(met.sprint, { localId: 'SPR-21', goal: 'Simulação de parcelas em produção', goalMet: 'partly', note: 'Homologação do parceiro atrasou; simulação pronta.',
  committed: 9, deliveredCommitted: 7, delivered: 8, added: 1, removed: 1, carriedOver: 2, capacity: { value: 9, unit: 'cards' } });
if (!met.metrics.some(m => m.id === 'objetivo_sprint')) met.metrics.push({ id: 'objetivo_sprint', standard: 'sprint_goal_met', name: 'Objetivo da sprint atingido',
  definition: 'Resposta de quem fechou a sprint: atingido = 100, em parte = 50, não = 0. Sprint sem objetivo fica sem valor.', group: 'previsibilidade', order: 3, scope: { level: 'team' },
  valueType: 'percent', unit: '%', direction: 'higher_is_better', grain: 'sprint', viz: { type: 'bar' },
  data: { series: [{ key: 'objetivo', label: 'Objetivo', points: [{ t: '2026-09-29', label: 'Sprint 19', v: 100 }, { t: '2026-10-13', label: 'Sprint 20', v: 100 }, { t: '2026-10-27', label: 'Sprint 21', v: 50 }] }] } });
const status = JSON.parse(fs.readFileSync(path.join(CONT, 'times/pagamentos/status.json'), 'utf8'));
status.sprints = [
  { localId: 'SPR-21', name: 'Sprint 21', start: '2026-10-27', end: '2026-11-09', state: 'closed', goal: 'Simulação de parcelas em produção', capacity: { value: 9, unit: 'cards' },
    committed: 9, doneCommitted: 7, added: 1, removed: 1, blocked: 0, features: [{ ref: 'PAG-042.F1', cards: 3 }, { ref: 'PAG-042.F2', cards: 2 }] },
  { localId: 'SPR-22', name: 'Sprint 22', start: '2026-11-10', end: '2026-11-23', state: 'active', goal: 'Contratação em homologação', capacity: { value: 8, unit: 'cards' },
    committed: 8, doneCommitted: 3, added: 1, removed: 0, blocked: 1, features: [{ ref: 'PAG-042.F2', cards: 5 }, { localId: 'FEAT-7', cards: 2 }] },
  { localId: 'SPR-23', name: 'Sprint 23', start: '2026-11-24', end: '2026-12-07', state: 'planned', capacity: { value: 8, unit: 'cards' }, committed: 6, blocked: 0, features: [{ ref: 'PAG-042.F2', cards: 2 }, { ref: 'PAG-042.F3', cards: 4 }] }
];
for (const i of status.initiatives) for (const it of i.items || []) { const sp = { 'CARD-295': 'SPR-22', 'CARD-344': 'SPR-22', 'CARD-320': 'SPR-23' }[it.localId]; if (sp) it.sprintLocalId = sp; }
for (const i of status.initiatives) for (const f of i.features || []) if (f.forecastEnd) f.forecastBasis = 'sprints';

const CONTEUDOS = {
  'times/pagamentos/metricas.json': [met, KIDS.tarefas],
  'times/pagamentos/status.json': [status, KIDS.tarefas],
  'central/catalogo-pagamentos.json': [null, KIDS.tarefas],
  'times/pagamentos/financas/plano.json': [planoTime, KIDS.finTime],
  'grupo/financas/diretriz-pagamentos.json': [diretrizTime, KIDS.finTime],
  'grupos/canais/financas/plano.json': [consolidado, KIDS.grupo],
  'grupos/canais/financas/diretriz.json': [diretrizGrupo, KIDS.grupo],
  'times/pagamentos/ferias/ana-k3f9a.json': [feriasTime, KIDS.tarefas],
  'grupos/canais/ferias/marina-p8x2c.json': [feriasGrupo, KIDS.grupo],
  'times/pagamentos/postits/marina-p8x2c.json': [postits, KIDS.tarefas],
  'times/pagamentos/postits/vistos/ana-k3f9a.json': [vistos, KIDS.tarefas],
  'times/pagamentos/quadro/quadro-do-time.json': [baseQuadro, KIDS.tarefas]
};

(async () => {
  for (const [rel, [obj, kid]] of Object.entries(CONTEUDOS)) {
    const fc = path.join(CONT, rel);
    if (obj) gravar(fc, obj);
    const p = JSON.parse(fs.readFileSync(fc, 'utf8'));
    const k = G.lerChaveTexto(chaveExemplo(kid)), key = await G.importarChave(k.raw);
    const team = p.schema === 'gestao-catalogo/1' ? p.teams[0].slug : p.source.team;
    const iv = new Uint8Array(sha(`iv|${rel}|${p.revision}`).subarray(0, 12));
    gravar(path.join(CIF, rel), await G.cifrarEnv(p, { key, kid, team }, iv));
  }
  fs.writeFileSync(path.join(AQUI, 'CHAVES-DE-EXEMPLO.txt'), `CHAVES DE EXEMPLO · PÚBLICAS · NUNCA USE EM DADOS REAIS

Elas abrem os arquivos de exemplo em Gestao-Compartilhado/. Foram derivadas de um texto fixo
(SHA-256 de "contratos-exemplo|<kid>") só para os exemplos serem reproduzíveis.
Chaves reais são 32 bytes aleatórios gerados pela ferramenta que administra o nível.

Chave de tarefas do time Pagamentos (status, métricas, catálogo, férias e post-its do time):
${chaveExemplo(KIDS.tarefas)}

Chave de finanças do time Pagamentos (plano do time e diretriz do gestor para o time):
${chaveExemplo(KIDS.finTime)}

Chave que a liderança gerou para o grupo Canais (consolidado financeiro, diretriz da liderança e férias do grupo):
${chaveExemplo(KIDS.grupo)}

Conferir: node contratos/validar.js exemplos
`);
  console.log(`${Object.keys(CONTEUDOS).length} exemplos gerados.`);
})();

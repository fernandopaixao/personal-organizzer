#!/usr/bin/env node
/* Gera contratos/vetores/vetores-envelope.json (rode só se a especificação mudar; os vetores são fixos).
   Chave = bytes 0x00..0x1f; iv = bytes 0xa0..0xab. NUNCA use iv fixo em produção. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), G = require('../referencia/cripto.js');
(async () => {
  const raw = Uint8Array.from({ length: 32 }, (_, i) => i), iv = Uint8Array.from({ length: 12 }, (_, i) => 0xa0 + i);
  const chave = `GK1.vetor-2611.${G.b64.urlEnc(raw)}`, key = await G.importarChave(raw);
  const caso = async (nome, payload, team, mexer, espera, nota) => {
    const env = await G.cifrarEnv(payload, { key, kid: 'vetor-2611', team }, iv);
    const out = { nome, nota, chave, chaveBytesBase64: G.b64.enc(raw), aad: G.aadTexto(env), payloadJson: JSON.stringify(payload), envelope: env, espera };
    if (mexer) { mexer(out.envelope); delete out.payloadJson; out.aad = undefined; }
    return out;
  };
  const status = { schema: 'gestao-status/1', source: { team: 'vetor', tool: 'vetor', toolVersion: '1' }, generatedAt: '2026-11-24T10:00:00-03:00', revision: 7, initiatives: [] };
  const postit = { schema: 'gestao-postits/1', revision: 3, generatedAt: '2026-11-24T10:00:00-03:00', hlc: '1763989200000.0', source: { team: 'vetor', writer: 'ana~k3f9a', tool: 'hub', toolVersion: '1.3.0', author: { name: 'Ana' } }, notes: [{ id: 'pi-1', text: 'Olá, time! Ação às 10h ✓', color: 'amarelo' }] };
  const casos = [
    await caso('status-minimo', status, 'vetor', null, 'ok', 'Envelope sem writer (status, métricas e catálogo).'),
    await caso('postit-com-writer', postit, 'vetor', null, 'ok', 'Arquivo de dono único: writer em claro no cabeçalho, fora do AAD, igual a source.writer. O texto tem acentos e um símbolo fora do ASCII: cifre os bytes UTF-8 de payloadJson.'),
    await caso('revisao-alterada', status, 'vetor', e => { e.revision = 8; }, 'falha', 'Alguém trocou a revisão no cabeçalho: o AAD muda e a decifragem falha.'),
    await caso('team-alterado', status, 'vetor', e => { e.team = 'outro-time'; }, 'falha', 'Trocar o time no cabeçalho também quebra o AAD.'),
    await caso('ct-truncado', status, 'vetor', e => { e.ct = e.ct.slice(0, -8); }, 'falha', 'Arquivo cortado (sincronização incompleta): a tag GCM não confere.'),
    await caso('writer-trocado', postit, 'vetor', e => { e.writer = 'bruno~z9z9z'; }, 'falha', 'writer em claro diferente de source.writer: quem lê recusa, mesmo decifrando.')
  ];
  const doc = { schema: 'gestao-vetores-envelope/1', descricao: 'Vetores de teste do envelope gestao-envelope/1 (AES-256-GCM, iv de 12 bytes, tag de 16 bytes ao fim do ct, AAD em UTF-8). Uma implementação nova precisa: (1) ler a chave GK1 e obter chaveBytesBase64; (2) montar exatamente o aad; (3) cifrar payloadJson com o iv do envelope e obter o mesmo ct; (4) decifrar os casos "ok" e recusar os casos "falha".', casos };
  fs.writeFileSync(path.join(__dirname, 'vetores-envelope.json'), JSON.stringify(doc, null, 2) + '\n');
  console.log(casos.length + ' vetores.');
})();

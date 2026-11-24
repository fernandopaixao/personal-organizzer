# ADR-0029 · Uma senha por sessão

**Status:** aceita · **Data:** 24/11/2026 (Hub 1.3, Central 15.7, Finanças do Grupo 1.4, Finanças do Time 1.3, Mapa de Férias 1.1, assistente 2.2) · **Origem:** decisão I2 da proposta "Finanças integradas no hub e na Central", aprovada pelo Fernando

## Contexto
O assistente cria todos os arquivos com a mesma senha, mas cada ferramenta pedia a senha de novo ao abrir. O gestor digitava a senha quatro ou cinco vezes por dia.

## Decisão
- Uma camada comum, `financas/src/sessao.js`, é injetada no `<head>` de todos os HTMLs pelo build, junto com o tema.
- **Quem abre** (hub, Central e o assistente no fim) guarda só em memória a senha que abriu o próprio arquivo.
- **Como a senha passa:** quando a pessoa clica num link para outra ferramenta (`target="_blank" rel="opener"`), a janela nova pede a senha por `postMessage` (`gestao-sessao/1`). O abridor responde **uma vez**, e só se:
  - houve um clique num link dele nos últimos 90 segundos;
  - quem pediu é uma janela aberta por ele (`e.source.opener === window`).
- **Quem recebe** usa a senha uma única vez, só para abrir o próprio arquivo:
  - Finanças do Grupo, Finanças do Time, Mapa de Férias e hub abrem sem perguntar (`pedirSenhaDlg(…, { sessao: true })`);
  - a Central chega com a senha preenchida na tela de entrada.
- Se a senha não servir, a ferramenta pede a senha dela e explica por quê.
- Nada vai para disco, `localStorage`, IndexedDB ou para a pasta. Bloquear a Central apaga a senha da sessão.

## Consequências
- **A favor:** na prática, uma senha por dia, abrindo tudo pelo hub. Cada arquivo continua cifrado com a própria senha, e cada ferramenta continua abrindo sozinha.
- **Contra:**
  - quem usa o computador desbloqueado, com o hub aberto, abre as outras ferramentas sem digitar a senha (alternativa recusada na I2: uma senha por ferramenta);
  - o `postMessage` usa `'*'` porque as páginas `file://` têm origem opaca. A proteção vem da checagem do abridor, do clique recente e da resposta única.

## Ao evoluir
- Uma ferramenta nova que abre o próprio arquivo com senha passa `{ sessao: true }` só nessa chamada, nunca em "Testar minha senha" ou ao ler o arquivo de outra ferramenta.
- Um link novo entre ferramentas usa `target="_blank" rel="opener"`.

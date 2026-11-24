# ADR-0032 · Uma pasta de contratos para outras soluções se acoplarem

**Status:** aceita · **Data:** 24/11/2026 · **Origem:** pedido do Fernando ("pasta de contratos que possa ser usada por outras soluções que precisam acoplar com a organização"), consolidando `integracao-time/contrato/` e `financas/contrato/`

## Contexto
Times e gestores pares começaram a usar a solução com ferramentas próprias (planilhas, sistemas, agentes). Para aparecer no hub do gestor e na visão da liderança (líder de líderes), eles precisam gravar arquivos que as ferramentas leiam e conciliem. As regras estavam espalhadas: schemas de integração só na pasta do projeto (`integracao-time/contrato/`), schemas de finanças, férias e post-its em `financas/contrato/`, criptografia e anti-conflito no código e em várias ADRs, sem exemplos de todos os arquivos nem um jeito de conferir.

## Decisão
1. **Uma pasta só, `contratos/`, na raiz do repositório**, que é a fonte de verdade de tudo o que é trocado pela pasta compartilhada: especificação (arquitetura e níveis, criptografia, regras de escrita, versionamento e códigos, guia "como integrar"), JSON Schemas de todos os arquivos, referência de criptografia, vetores de teste, exemplos em claro e cifrados no layout real e um validador.
2. **Autossuficiente**: sem rede, sem dependências (Node 20+ para o validador; a referência roda também no navegador). Vai inteira no .zip ([ADR-0024](0024-distribuicao-por-zip.md)) e pode ser copiada para `Gestao-Compartilhado/contrato/` (em claro, sem dados, [ADR-0003](0003-criptografia-sempre.md)).
3. **Extraída do comportamento real**: cada regra vem do que as ferramentas fazem hoje (`financas/src/nucleo.js`, Quadro, Central, Hub, Finanças, Mapa de Férias). Os exemplos são lidos pelas **funções de leitura reais** de cada ferramenta no teste `contratos/testes/teste-contratos.js`, que roda na CI.
4. `financas/contrato/` deixa de existir (fica só um aviso apontando para `contratos/`). Os documentos de `integracao-time/` continuam na pasta do projeto como histórico e detalhe; o que vale para integrar está em `contratos/`.

## Consequências
- **A favor:** quem integra recebe uma pasta e um comando (`node contratos/validar.js`) para saber se está certo antes de publicar; a liderança passa a receber consolidados de soluções que não são as nossas sem conversa caso a caso.
- **Contra:** mais um lugar para manter. Todo contrato novo ou alterado precisa atualizar schema, exemplo (`contratos/exemplos/gerar.js`), regra do validador e o histórico em `contratos/LEIA-ME.md`.

## Ao evoluir
- Contrato novo ou campo novo: mude `contratos/` no mesmo PR da ferramenta ([ADR-0022](0022-documentacao-no-mesmo-pr.md)), rode `node contratos/exemplos/gerar.js` e `node contratos/testes/teste-contratos.js`.
- Mudança que quebra vira versão `/2` do contrato ([ADR-0009](0009-contratos-json-versionados.md)), com período em que os leitores aceitam as duas.
- Os vetores de teste (`contratos/vetores/`) só mudam se a criptografia mudar, o que exige ADR própria.

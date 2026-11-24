# ADR-0025 · Consolidação financeira em níveis (gestor → liderança)

**Status:** aceita · **Data:** 24/11/2026 (PR #17, Finanças do Grupo 1.3) · **Origem:** [`plano-financas.md`](../plano-financas.md), seção 14

## Contexto
Gestores pares também usam a solução, e a liderança deles quer somar os consolidados de vários gestores sem ver o detalhe dos times.

## Decisão
- A liderança usa o mesmo Finanças do Grupo e cadastra cada gestor como uma unidade do tipo `grupo` (`db.times[].tipo`), com a chave de finanças `<grupo>-fin-AAMM`.
- O gestor guarda essa chave em `db.acima` e publica `grupos/<grupo>/financas/plano.json` (`gestao-financas-plano/1`, `source.level = "group"`, `units`): uma linha por unidade × categoria (× OPEX/CAPEX) e os itens do grupo, mês a mês, todos os anos. Os nomes das linhas dos times não sobem.
- A liderança publica o teto por ano em `grupos/<grupo>/financas/diretriz.json`.
- Mesmas regras de sempre: envelope cifrado, um dono por arquivo ([0007](0007-um-escritor-por-arquivo.md)), prévia antes de aplicar, só agregados na pasta ([0008](0008-local-individual-comum-sincronizado.md)).

## Consequências
- Funciona em quantos níveis forem precisos, porque cada nível é "um time" para o nível de cima.
- A liderança precisa ler a mesma pasta compartilhada (ou uma biblioteca com a mesma estrutura).

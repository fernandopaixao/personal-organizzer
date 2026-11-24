# ADR-0006 · Chave de finanças separada da chave de tarefas

**Status:** aceita · **Data:** 23/11/2026 (decisão D2 do plano de finanças) · **Origem:** `docs/plano-financas.md` §4.1

## Contexto
O time inteiro precisa da chave de tarefas para usar o Quadro. O plano financeiro costuma ser visto só pelo líder e pelo gestor.

## Decisão
Cada time tem **duas chaves**: tarefas (`GK1.<time>-AAMM.…`) e finanças (`GK1.<time>-fin-AAMM.…`). O envelope distingue as duas pelo `kid`. Post-its usam a chave de **tarefas** (todo o time lê).

## Consequências
- **A favor:** membro do time que só usa o Quadro não lê o plano financeiro.
- **Contra:** mais uma chave para entregar e guardar no cofre.

## Ao evoluir
- Ao criar um tipo de arquivo comum novo, decida explicitamente qual chave ele usa e registre no plano do recurso.

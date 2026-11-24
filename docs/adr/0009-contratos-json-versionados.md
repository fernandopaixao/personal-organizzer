# ADR-0009 · Contratos JSON versionados e tolerantes

**Status:** aceita · **Data:** 15/11/2026; ampliada em 23 e 24/11/2026 · **Origem:** `integracao-time/contrato/`, `financas/contrato/`

## Contexto
Ferramentas diferentes (inclusive ferramentas próprias dos times, adaptadas pelo caminho B) leem os arquivos umas das outras e evoluem em ritmos diferentes.

## Decisão
- Todo conteúdo começa com `"schema": "gestao-<nome>/<n>"` e tem um JSON Schema 2020-12.
- **Campos novos opcionais não mudam a versão**; quem lê ignora o que não conhece. Mudança incompatível cria `/<n+1>` e o leitor aceita as duas por um tempo (precedente: `gestao-import/2` e `/3`).
- Valores monetários em **centavos inteiros**, moeda explícita; o grupo recusa somar moedas diferentes.
- Precedente de evolução sem nova versão: o multianual (Finanças 1.1) acrescentou `fiscalYears` e `totalsByYear` ao plano e `byYear` à diretriz, mantendo `fiscalYear`, `totals`, `caps` e `capTotal` como os do ano base. Leitores 1.0 continuam funcionando.
- Cada lado manda nos seus campos; divergência vira alerta, nunca sobrescrita silenciosa.

| Contrato | Escritor | Pasta / arquivo |
|---|---|---|
| `gestao-envelope/1` | todos | envelope de qualquer arquivo comum |
| `gestao-catalogo/1` | Central | `central/catalogo-<time>.json` |
| `gestao-status/1` | time | `times/<time>/status.json` |
| `gestao-metricas/1` | time | `times/<time>/metricas.json` |
| `gestao-import/3` | agentes do Fernando | colado ou escolhido na Central |
| `gestao-financas-plano/1` | Finanças do Time | `times/<time>/financas/plano.json` |
| `gestao-financas-diretriz/1` | Finanças do Grupo | `grupo/financas/diretriz-<time>.json` |
| `financas-preset/1` | Finanças do Grupo / assistente | pré-configuração do HTML gerado |
| `gestao-postits/1`, `gestao-postits-vistos/1` | Hub / Quadro | `times/<time>/postits/…` |
| `gestao-local-cifrado/1` | todas | arquivo local |

## Ao evoluir
- Mudou um contrato? Atualize o schema, os exemplos e avise quem lê. Contratos da integração não mudam sem avisar a frente do Quadro do Time e os times do caminho B.
- O leitor sempre valida item a item: dado inválido vira lacuna ou aviso, nunca erro que derruba a tela.

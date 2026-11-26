# ADR-0042 · Sprint e métricas da sprint sincronizadas com a Central

**Status:** aceita · **Data:** 26/11/2026 · **Origem:** pedido do Fernando ("já planeja um formato em que a sprint e métricas da sprint sincronizem com o gestor"); plano em `refinamento/plano-refinamento.md` (pasta do projeto), etapa R3 · complementa a [ADR-0041](0041-refinamento-no-quadro.md) · segue a [ADR-0009](0009-contratos-json-versionados.md) (contratos só crescem) e a [ADR-0016](0016-cadencia-de-publicacao.md) (cadência) · **Fonte:** `contratos/schemas/`, `ferramenta-time/quadro_do_time_v1.html` (`statusSprints`, `sprintResultadoPub`), `gestao_pessoal_v15.html` (bloco "sprint do time sincronizada com a Central")

## Contexto
Desde a ADR-0041 o time desenha e planeja as sprints no Quadro, com objetivo, capacidade e compromisso. O gestor só via a sprint pelo nome, no `metricas.json` publicado ao fechar, e pela métrica "Compromisso cumprido". Ele não sabia qual sprint estava em andamento, o que entrou ou saiu dela, nem se a previsão de uma feature vinha do desenho das sprints ou do prazo dos cards. A Central também não guardava o histórico: cada remessa nova substituía a anterior.

## Decisão
1. **Contratos 1.2, só com campos opcionais** (leitor antigo ignora, ADR-0009). Nenhum arquivo novo, nenhuma chave nova, nenhuma cadência nova.
2. **Sprint ao vivo no `status.json`** (publicado a cada movimentação, como já era): bloco `sprints[]` com até 8 sprints (a última fechada, a em andamento e as próximas desenhadas), cada uma com `localId`, `name`, `start`, `end`, `state` (`planned`, `active`, `closed`), `goal`, `capacity {value, unit}`, `committed`, `doneCommitted`, `added`, `removed`, `blocked` e `features[]` (`ref` da Central ou `localId` da feature do time, com a quantidade de cards). Os cards levam `items[].sprintLocalId` e as features `features[].forecastBasis` (`sprints` quando a previsão saiu do desenho, `due` quando é o maior prazo dos cards).
3. **Resultado da sprint no `metricas.json`**, que continua sendo publicado ao fechar a sprint **com confirmação**: o objeto `sprint` que já existia ganha `localId`, `goal`, `goalMet` (`yes`, `partly`, `no`), `note`, `committed`, `deliveredCommitted`, `delivered`, `added`, `removed`, `carriedOver` e `capacity`. O dicionário ganha a métrica padrão `sprint_goal_met` (objetivo atingido: 100, em parte: 50, não: 0).
4. **Regras novas no validador:** no máximo uma sprint `active`; `localId` sem repetição; `sprintLocalId` aponta para uma sprint de `sprints[]`; `doneCommitted` e `deliveredCommitted` não passam do compromisso.
5. **A Central guarda o histórico das sprints** (`integ.sprintHist`, até 26 por time, no arquivo cifrado da Central). Cada remessa aplicada atualiza o histórico: o resultado das métricas vale mais que o retrato do backlog. Sprint que aparece fechada no backlog e sem métricas fica marcada "sem métricas publicadas".
6. **Central 15.19, só leitura:** aba **Sprints** no time (sprint em andamento com objetivo e compromisso × feitos, próximas sprints do desenho, previsão × prazo das features e sprints fechadas com compromisso × cumprido, objetivo e a linha do time), card **Sprints dos times** em Hoje (sprint que termina em até 2 dias ou passou do fim, sprint fechada sem métricas, previsão depois do prazo), bloco **Sprint** na abertura da reunião de status, linha da sprint no card de cada time em Hoje e "Sprint N" no downstream da feature.

## Consequências
- Quem planeja a sprint continua sendo o time. A Central não edita sprint nem compromisso.
- O gestor vê a sprint do time no mesmo dia, sem pedir status, e o histórico continua mesmo quando o time publica um retrato novo.
- Ferramenta de time própria (caminho B do guia) não precisa mandar `sprints[]`: sem ele, a aba Sprints mostra só o que vier no `metricas.json`.
- O histórico ocupa pouco (números e textos curtos) e é cortado em 26 sprints por time.

## Ao evoluir
- Campo novo de sprint entra como opcional, com regra no `validar.js`, exemplo em `exemplos/gerar.js` e linha no histórico do `contratos/LEIA-ME.md`.
- Pedidos de refinamento vindos da Central (gestor pedindo ao time para refinar uma feature) ficam para a etapa R4, com ADR própria.

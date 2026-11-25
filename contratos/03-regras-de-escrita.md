# 03 · Regras de escrita (anti-conflito)

*Contratos 1.0 · 25/11/2026 · decisões em [ADR-0007](../docs/adr/0007-um-escritor-por-arquivo.md) e [ADR-0016](../docs/adr/0016-cadencia-de-publicacao.md)*

O OneDrive não tem trava. Quando dois computadores gravam o mesmo arquivo antes de sincronizar, ele guarda os dois e renomeia um (`plano-NOTEBOOK01.json`, `plano (1).json`), e os atrasos de minutos são normais. As regras abaixo fazem esse caso virar raro e, quando acontece, ser resolvido sem perder dados. A implementação de referência é `publicarUnico` em `financas/src/nucleo.js`; [`referencia/cripto.js`](referencia/cripto.js) tem as peças (`reCopia`, `maisNovo`, `proximaRevisao`, `hlcAgora`).

## 1. Um dono por arquivo

- Cada arquivo tem **um único dono**, o `writer`: `<pessoa>~<computador>` (ex.: `ana~k3f9a`).
  - `pessoa` = primeira palavra do slug do nome (`Ana Souza` → `ana`).
  - `computador` = identificador aleatório curto (5 caracteres `a-z0-9`) gerado uma vez e guardado na máquina ou no navegador. **Nunca** o nome real do computador.
- O `writer` vai em `conteudo.source.writer` e em claro no cabeçalho do envelope.
- **Antes de gravar, leia o arquivo atual.** Se o dono é outro `writer`, não grave. Se é a mesma pessoa em outro computador, também não: avise ("este arquivo foi publicado por você em outro computador"). Só grave por cima com uma ação explícita de **assumir** (a pessoa trocou de computador ou combinou com o outro dono); ao assumir, a revisão continua crescendo.
- Quando várias pessoas contribuem para o mesmo assunto, **cada uma tem o próprio arquivo** `<pessoa>-<computador>.json` (o `~` vira `-` no nome) e quem lê une. É assim em férias, post-its, vistos e no Quadro.
- Status e métricas têm **um publicador por time** (a ferramenta do time escolhida pelo responsável); catálogo, só a Central. Esses três não levam `writer`.

## 2. Retrato completo, não diferença

Cada gravação contém **tudo** o que aquele dono publica naquele arquivo. Remover um item é publicar sem ele. Nunca grave só "o que mudou" e nunca dependa de quem lê ter visto a versão anterior.

## 3. Revisão e data

| Campo | Regra |
|---|---|
| `revision` | Inteiro ≥ 1. **Maior que qualquer revisão já vista** para aquele arquivo: a sua última publicação, o arquivo na pasta, as cópias de conflito e até as cópias que não abrem (use o `revision` em claro do cabeçalho). Fórmula: `max(vistas) + 1`. Quem lê descarta revisão menor que a última lida. |
| `generatedAt` | ISO 8601 **com fuso** (`2026-11-24T16:05:00-03:00`). Igual, como texto, no envelope e no conteúdo. |
| `hlc` | Relógio lógico híbrido `<ms>.<contador>`: desempata revisões iguais e, nas férias, escolhe o arquivo mais novo de cada pessoa. Recomendado em todos os arquivos com `writer`; **na prática obrigatório em férias**. Calcule com o maior `hlc` lido da pasta (`hlcAgora(estado, vistoNaPasta)`), para crescer mesmo se o relógio do computador voltar. |

Status e métricas do mesmo time usam **um contador só**: o Quadro calcula `max(revisão de status.json, revisão de metricas.json, a última que publicou) + 1`.

## 4. Gravar sem deixar arquivo pela metade

1. Releia o arquivo e as cópias de conflito (`reCopia(base)`: `base.json`, `base-<qualquer coisa>.json`, `base (n).json`).
2. Confira o dono (seção 1) e calcule a revisão (seção 3).
3. Monte o retrato completo, cifre e grave de forma **atômica**: escreva num temporário e troque no fim (no navegador, `createWritable()` + `close()`; em disco, grave `arquivo.tmp` na mesma pasta e renomeie). Não use nome `.json` para o temporário.
4. **Releia e decifre** o que gravou. Se a revisão lida não for a sua, outro computador gravou ao mesmo tempo: leia de novo e publique outra vez.
5. Apague as cópias de conflito que **você** pode reescrever (mesmo `writer`; ou, ao assumir, as de revisão menor ou igual). Cópias de outro dono ficam para ele.

## 5. Cadência

| Quem | Quando publica |
|---|---|
| Time (status, férias, post-its, vistos) | Automático, espaçado: no máximo a cada ~10 s e ao fechar a ferramenta. Não grave a cada tecla. |
| Time (métricas) | Ao fechar a sprint, depois de a pessoa confirmar. |
| Gestor e liderança (catálogo, diretriz, consolidado) | **Só por botão**, depois de uma prévia que mostra o que sobe e o que fica de fora ([ADR-0016](../docs/adr/0016-cadencia-de-publicacao.md), [ADR-0025](../docs/adr/0025-consolidacao-em-niveis.md)). |
| Quem lê | A cada 20 a 60 s e ao voltar para a aba. Nunca em laço apertado: cada leitura baixa arquivos do OneDrive. |

**Só grave quando o conteúdo mudou.** Para quem lê, cada gravação é uma **nova remessa**: o hub usa a data do arquivo (últimas 24 horas) e a Central e o Finanças do Grupo mostram a revisão nova para aplicar. Regravar o mesmo retrato com a revisão subindo gera avisos sem motivo ([ADR-0037](../docs/adr/0037-nome-remessa.md)).

## 6. Limites

- Até **2 MB** por conteúdo (antes de cifrar). Status: até 200 iniciativas e 500 itens por iniciativa; métricas: até 100 métricas e 400 pontos por série.
- Textos com os limites de cada schema (`maxLength`). Datas `AAAA-MM-DD`, meses `AAAA-MM`, dinheiro em **centavos inteiros**.
- Links só `https://`.

## 7. Conteúdo pessoal mínimo

Só sobe o que o outro lado precisa, de preferência agregado ([ADR-0008](../docs/adr/0008-local-individual-comum-sincronizado.md), [ADR-0014](../docs/adr/0014-metricas-autodescritivas.md)):

- Métricas **só do time** (`scope.level` `team`, `initiative` ou `feature`), nunca por pessoa.
- Férias: sem notas, sem tipos de saúde (licença entra como `outro`); no consolidado, o gestor pode trocar nomes por "Pessoa N".
- Consolidado financeiro: uma linha por unidade × categoria, sem os nomes das linhas dos times.

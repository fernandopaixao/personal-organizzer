# 01 · Arquitetura, níveis e layout da pasta

*Contratos 1.0 · 24/11/2026*

## 1. O modelo em uma frase

As ferramentas não conversam por rede: cada uma grava **arquivos JSON cifrados** numa **pasta compartilhada sincronizada pelo OneDrive** (uma biblioteca do SharePoint, normalmente `Gestao-Compartilhado`) e lê os arquivos que as outras gravaram. Não há servidor, API nem banco ([ADR-0001](../docs/adr/0001-html-de-arquivo-unico-sem-servidor.md), [ADR-0004](../docs/adr/0004-troca-por-arquivos-na-pasta-sincronizada.md)). Uma solução externa se integra **gravando e lendo os mesmos arquivos, no mesmo formato**.

## 2. Os níveis: time, gestor e liderança

```
  LIDERANÇA (líder de líderes)
  Hub da liderança · Finanças do Grupo da liderança · Central (página Férias, nível liderança)
        ▲  lê grupos/<grupo>/financas/plano.json e grupos/<grupo>/ferias/*.json
        │  grava grupos/<grupo>/financas/diretriz.json (teto por ano)
        │                                  chave do GRUPO: GK1.<grupo>-fin-AAMM (ou -fer-)
  GESTOR (dono de um grupo de times)
  Hub · Central de Gestão (com a página Férias) · Finanças do Grupo
        ▲  lê times/<time>/status.json, metricas.json, financas/plano.json, ferias/*.json
        │  grava central/catalogo-<time>.json, grupo/financas/diretriz-<time>.json,
        │        times/<time>/postits/<gestor>-<computador>.json
        │                     chaves do TIME: GK1.<time>-AAMM (tarefas) e GK1.<time>-fin-AAMM (finanças)
  TIME
  Quadro do Time (ou ferramenta própria) · Finanças do Time · férias só por outra solução (ADR-0034)
```

**Regra dos níveis** ([ADR-0025](../docs/adr/0025-consolidacao-em-niveis.md), [ADR-0026](../docs/adr/0026-ferias-em-niveis.md)): cada nível é "um time" para o nível de cima. O gestor soma os times e publica **um consolidado** como uma unidade do tipo `grupo`; a liderança soma os grupos (e times diretos, se tiver) do mesmo jeito. Funciona com quantos níveis forem precisos: um diretor que recebe vários líderes de líderes cadastra cada um como unidade `grupo`, e cada um deles publica o próprio consolidado em `grupos/<slug>/`.

O que a liderança enxerga de cada gestor:

| Assunto | Arquivo que o gestor publica | Quem lê na liderança | O que aparece |
|---|---|---|---|
| Finanças | `grupos/<grupo>/financas/plano.json` | Hub da liderança (totais por ano) e Finanças do Grupo da liderança (soma mês a mês, por categoria) | Orçado, previsto e realizado por ano, por unidade e categoria; versão do plano; data |
| Teto | `grupos/<grupo>/financas/diretriz.json` (a liderança escreve) | Finanças do Grupo do gestor | Teto por ano e prazo de publicação |
| Férias | `grupos/<grupo>/ferias/<gestor>-<computador>.json` | Página Férias da Central da liderança | Ausências de todas as pessoas do grupo (nomes opcionais), feriados, árvore de unidades |

O detalhe dos times (linhas do plano, cards, notas) **não sobe**: o consolidado leva uma linha por unidade × categoria ([ADR-0008](../docs/adr/0008-local-individual-comum-sincronizado.md)).

## 3. Layout da pasta compartilhada

A raiz é a pasta sincronizada (`Gestao-Compartilhado`; o nome antigo `Gestao-Integracao` também é aceito). Os caminhos abaixo são relativos a ela, em minúsculas, com `/` como separador. `<time>` e `<grupo>` são slugs ([04](04-versionamento-e-codigos.md)); `<w>` é `<pessoa>-<computador>`.

| Caminho | Conteúdo (`content`) | Chave | Quem escreve (dono) | Quem lê | Cadência |
|---|---|---|---|---|---|
| `central/catalogo-<time>.json` | [`gestao-catalogo/1`](schemas/gestao-catalogo-1.schema.json) | tarefas do time | Central de Gestão do gestor | Quadro ou ferramenta do time | Só pelo botão "Compartilhar" do gestor |
| `times/<time>/status.json` | [`gestao-status/1`](schemas/gestao-status-1.schema.json) | tarefas do time | Um publicador do time (Quadro ou ferramenta própria) | Central; o hub mostra a data | Automático, ~10 s depois de cada mudança |
| `times/<time>/metricas.json` | [`gestao-metricas/1`](schemas/gestao-metricas-1.schema.json) | tarefas do time | O mesmo publicador | Central | Ao fechar a sprint, com confirmação |
| `times/<time>/quadro/<w>.json` | `quadro-contrib/1` | tarefas do time | Cada pessoa no Quadro do Time | Quadro do Time | **Interno do Quadro:** outras soluções não escrevem |
| `times/<time>/financas/plano.json` | [`gestao-financas-plano/1`](schemas/gestao-financas-plano-1.schema.json) | finanças do time | Responsável financeiro do time | Finanças do Grupo do gestor, Central (só leitura), Hub | Pelo botão "Publicar plano" |
| `grupo/financas/diretriz-<time>.json` | [`gestao-financas-diretriz/1`](schemas/gestao-financas-diretriz-1.schema.json) | finanças do time | Finanças do Grupo do gestor | Finanças do Time | Pelo botão do gestor |
| `grupos/<grupo>/financas/plano.json` | `gestao-financas-plano/1` com `source.level = "group"` | do grupo | Gestor do grupo (consolidado) | Hub e Finanças do Grupo da liderança | Pelo botão, depois da prévia "o que sobe" |
| `grupos/<grupo>/financas/diretriz.json` | `gestao-financas-diretriz/1` | do grupo | Liderança | Finanças do Grupo do gestor | Pelo botão da liderança |
| `times/<time>/ferias/<w>.json` | [`gestao-ferias/1`](schemas/gestao-ferias-1.schema.json) (`level` `team`) | tarefas do time | Outra solução do time (a solução não grava aqui desde a Central 15.10: o gestor cadastra as férias do time na própria Central, [ADR-0034](../docs/adr/0034-ferias-so-o-gestor-cadastra.md)) | Página Férias da Central do gestor | Automático a cada mudança |
| `grupos/<grupo>/ferias/<w>.json` | `gestao-ferias/1` (`level` `group`) | do grupo | Gestor do grupo (consolidado, pela página Férias da Central) | Página Férias da liderança | Pelo botão, depois da prévia |
| `times/<time>/postits/<w>.json` | [`gestao-postits/1`](schemas/gestao-postits-1.schema.json) | tarefas do time | Cada autor (Hub) | Quadro do Time, Hub | Automático a cada mudança |
| `times/<time>/postits/vistos/<w>.json` | [`gestao-postits-vistos/1`](schemas/gestao-postits-vistos-1.schema.json) | tarefas do time | Cada pessoa do time (Quadro) | Hub | Ao clicar em "Vi" |
| `<qualquer pasta>/.aberto-<w>.json` | aviso de presença, em claro | nenhuma | Quem está com a ferramenta aberta | As ferramentas (só aviso) | A cada minuto, vale 3 min |
| `LEIA-ME.md`, `contrato/` | em claro, sem dados | nenhuma | Quem administra a pasta | Pessoas | Raramente |

Qualquer outro arquivo é ignorado pelas ferramentas. Não crie pastas novas dentro de `times/<time>/` ou `grupos/<grupo>/` sem um contrato novo ([ADR-0009](../docs/adr/0009-contratos-json-versionados.md)).

O aviso de presença tem o formato `{"writer":"ana~k3f9a","ferramenta":"ferias","ate":<ms>}` (só ids e horário). É opcional: serve para avisar "aberto em outro computador" e nunca é trava.

### Exemplo completo

[`exemplos/Gestao-Compartilhado/`](exemplos/Gestao-Compartilhado/) tem a pasta de um cenário real: o time **Pagamentos** (prefixo `PAG`) do grupo **Canais**, da gestora Marina, e a liderança que recebe o consolidado do grupo Canais.

```
Gestao-Compartilhado/
  central/catalogo-pagamentos.json
  grupo/financas/diretriz-pagamentos.json
  grupos/canais/financas/plano.json          ← lido pela liderança
  grupos/canais/financas/diretriz.json       ← escrito pela liderança
  grupos/canais/ferias/marina-p8x2c.json     ← lido pela liderança
  times/pagamentos/status.json
  times/pagamentos/metricas.json
  times/pagamentos/financas/plano.json
  times/pagamentos/ferias/ana-k3f9a.json
  times/pagamentos/postits/marina-p8x2c.json
  times/pagamentos/postits/vistos/ana-k3f9a.json
```

## 4. Como cada ferramenta lê (o que o seu arquivo precisa satisfazer)

| Quem lê | Passos |
|---|---|
| **Arquivo de dono único** (status, métricas, plano, diretriz, catálogo) | Lista o arquivo e as cópias de conflito do OneDrive (`plano-NOTEBOOK01.json`, `plano (1).json`); decifra cada um com as chaves cadastradas; descarta os que não abrem, de outro `team` ou de outro `content`; fica com a **maior `revision`** (empate: maior `hlc`); ignora se a revisão for menor que a última já lida. |
| **Pasta com um arquivo por pessoa** (férias, post-its, vistos) | Lê todos os `.json` da pasta (menos os que começam com `.`); decifra; descarta outro `team` ou `content`. Férias: fica com o arquivo de **maior `hlc`** de cada pessoa (prefixo do `writer` antes do `~`), para a mesma pessoa em dois computadores não somar em dobro. Post-its e vistos: maior `revision` por `writer`. |
| **Finanças do Grupo** (gestor e liderança) | Só soma plano na mesma moeda do grupo; casa `lines[].category` pelo `id` com as categorias do grupo (o que não casa vai para "Outras"); soma os meses (`months`), não os totais; mostra a revisão nova numa **prévia** e só aplica quando a pessoa confirma ([ADR-0013](../docs/adr/0013-downstream-previa-e-conciliacao.md)). |
| **Hub da liderança** | Mostra `totalsByYear` (ou `totals` do `fiscalYear`), `currency`, quantidade de `closedMonths` e `generatedAt`. Por isso os totais precisam bater com a soma dos meses. |
| **Mapa de Férias** (página Férias da Central) | Usa `people`, `absences` (datas válidas, `start ≤ end`), `units` (árvore) e `holidays`; tipos fora da lista viram "outro". |
| **Central** | Lê status e métricas só de times cadastrados, com chave cadastrada e não revogada; mostra itens do time como *downstream*, nunca como tarefa do gestor ([ADR-0013](../docs/adr/0013-downstream-previa-e-conciliacao.md)). |

Arquivo com problema (não decifra, cabeçalho diferente do conteúdo, outro time) é ignorado e aparece como aviso; nunca derruba a leitura dos outros.

## 5. O que fica fora destes contratos

- **Arquivos locais** de cada ferramenta (`gestao-local-cifrado/1`, `gestao-cripto/2` da Central, cifrados com a senha da pessoa): são da pessoa, ficam numa pasta só dela e nenhuma outra solução lê ou escreve ([ADR-0002](../docs/adr/0002-dados-fora-do-html.md), [ADR-0010](../docs/adr/0010-htmls-desacoplados.md)).
- **Importação por agentes** (`gestao-import/3`): é um arquivo que a pessoa escolhe na Central, com prévia. Está descrito em `integracao-time/06-prompts-para-agentes.md` e no exemplo `modelo-gestao-import-3.json` da pasta do projeto ([ADR-0015](../docs/adr/0015-agentes-por-arquivo.md)).
- **Mensagens entre janelas** (`gestao-sessao/1`, senha da sessão): internas das ferramentas ([ADR-0029](../docs/adr/0029-uma-senha-por-sessao.md)).
- **Ferramenta de feedbacks:** sem integração ([ADR-0021](../docs/adr/0021-feedbacks-fora-da-integracao.md)).

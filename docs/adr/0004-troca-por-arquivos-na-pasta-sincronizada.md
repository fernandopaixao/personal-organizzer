# ADR-0004 · Ferramentas conversam só por arquivos numa pasta sincronizada

**Status:** aceita · **Data:** 15/11/2026 (pasta SharePoint); 23/11/2026 (D1: biblioteca SharePoint sincronizada pelo cliente do OneDrive, nome `Gestao-Compartilhado`) · **Origem:** `integracao-time/01`, `docs/plano-financas.md` §5.2

## Contexto
A Central precisa receber o backlog e as métricas dos times e entregar a eles o catálogo de iniciativas. Finanças precisa somar os planos dos times. Não há servidor ([ADR-0001](0001-html-de-arquivo-unico-sem-servidor.md)).

## Decisão
O "barramento" é uma **biblioteca do SharePoint sincronizada pelo cliente do OneDrive** em cada máquina. As ferramentas leem e gravam arquivos JSON cifrados nessa pasta.

```
Gestao-Compartilhado/            (antes Gestao-Integracao; os dois nomes são aceitos)
  contrato/                      cópia de contratos/ (schemas, referência de cripto), em claro
  central/catalogo-<time>.json   só a Central escreve
  grupo/financas/diretriz-<time>.json   só o gestor escreve
  times/<time>/status.json       só o publicador do time
  times/<time>/metricas.json     só o publicador do time
  times/<time>/quadro/<pessoa>-<computador>.json
  times/<time>/financas/plano.json
  times/<time>/postits/<pessoa>-<computador>.json
  times/<time>/postits/vistos/<pessoa>-<computador>.json
  times/<time>/ferias/<pessoa>-<computador>.json
  grupos/<grupo>/financas/plano.json      consolidado do gestor para a liderança
  grupos/<grupo>/financas/diretriz.json   só a liderança escreve
  grupos/<grupo>/ferias/<pessoa>-<computador>.json
```

O layout completo, com chave, dono, leitores e cadência de cada arquivo, está em [`contratos/01-arquitetura.md`](../../contratos/01-arquitetura.md).

O Fernando administra a pasta. Cada time edita só `times/<time>/`.

## Consequências
- **A favor:** usa o que já existe na empresa, permissões por time no SharePoint, histórico de versões, não depende da conta de uma pessoa.
- **Contra:** o OneDrive não avisa as ferramentas (elas leem a pasta a cada 20 a 60 s e ao voltar para a aba); atrasos de minutos são normais; o OneDrive cria cópias de conflito, tratadas em [ADR-0007](0007-um-escritor-por-arquivo.md); nomes de arquivos e datas ficam visíveis para quem acessa a pasta.

## Alternativas consideradas
- Pasta no OneDrive pessoal do Fernando compartilhada: mais simples, mas presa à conta dele.
- Endpoints ou API: descartado ([ADR-0001](0001-html-de-arquivo-unico-sem-servidor.md)).

## Ao evoluir
- Toda troca nova entre ferramentas é **um arquivo novo** nesta pasta, com contrato próprio ([ADR-0009](0009-contratos-json-versionados.md)) e um único dono ([ADR-0007](0007-um-escritor-por-arquivo.md)).

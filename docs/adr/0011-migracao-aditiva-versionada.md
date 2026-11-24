# ADR-0011 · Migração aditiva e versionada, com backup automático

**Status:** aceita · **Data:** v11/v12 (06/11/2026), aplicada em todas as versões · **Origem:** `docs/plano-v12.md`

## Contexto
O arquivo de dados vive por anos; o HTML muda toda semana ([ADR-0002](0002-dados-fora-do-html.md)).

## Decisão
- O arquivo tem um número de versão (`DB_VERSION`, hoje 15 na Central). Ao abrir um arquivo antigo, a ferramenta **migra sozinha** (`normalizeDb`), **baixa um backup do original** e passa a gravar no formato novo.
- Migrações só **acrescentam** campos ou convertem estruturas; nada é apagado.
- A versão exibida ao usuário (`APP_VERSION`, hoje 15.2) é separada da versão do arquivo.
- HTMLs antigos ficam em `legacy/` como referência.

## Ao evoluir
- Campo novo: acrescente com valor padrão em `normalizeDb`, suba `DB_VERSION` só se a estrutura mudar e teste abrindo um arquivo da versão anterior.
- Mudou a Central? Suba `APP_VERSION` e os dois textos `v15.x` (barra lateral e tela de senha).

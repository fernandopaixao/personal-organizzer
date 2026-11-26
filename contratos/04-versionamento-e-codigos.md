# 04 · Versionamento, identificadores e códigos

*Contratos 1.0 · 24/11/2026 · decisões em [ADR-0009](../docs/adr/0009-contratos-json-versionados.md), [ADR-0011](../docs/adr/0011-migracao-aditiva-versionada.md) e [ADR-0012](../docs/adr/0012-modelo-iniciativa-feature.md)*

## 1. Versão dos contratos

- Todo conteúdo começa com `"schema": "<nome>/<n>"` (ex.: `gestao-financas-plano/1`). O envelope repete esse valor em `content`.
- **Dentro da mesma versão, só mudanças aditivas:** campos novos e opcionais, com significado claro quando ausentes. Os schemas marcam o que veio depois com "Desde 1.1", "Desde 1.3" etc. (versão da ferramenta que introduziu o campo).
- **Leitor tolerante:** quem lê ignora campos desconhecidos e não falha por eles. Quem publica não depende de o leitor conhecer um campo novo.
- **Mudança que quebra** (renomear, mudar tipo, mudar significado, tornar obrigatório) vira `<nome>/2`, com ADR, schema novo, exemplo e um período em que os leitores aceitam as duas versões. Até lá, quem publica continua gravando `/1`.
- A versão da **ferramenta** (`source.tool`, `source.toolVersion`) é só informativa. Preencha com o nome e a versão da sua solução.

| Contrato | Versão | Arquivo |
|---|---|---|
| Envelope | `gestao-envelope/1` | todos |
| Catálogo | `gestao-catalogo/1` | `central/catalogo-<time>.json` |
| Status | `gestao-status/1` | `times/<time>/status.json` |
| Métricas | `gestao-metricas/1` | `times/<time>/metricas.json` |
| Plano financeiro | `gestao-financas-plano/1` | `times/<time>/financas/plano.json`, `grupos/<grupo>/financas/plano.json` |
| Diretriz e teto | `gestao-financas-diretriz/1` | `grupo/financas/diretriz-<time>.json`, `grupos/<grupo>/financas/diretriz.json` |
| Férias | `gestao-ferias/1` | `times/<time>/ferias/<w>.json`, `grupos/<grupo>/ferias/<w>.json` |
| Post-its | `gestao-postits/1` | `times/<time>/postits/<w>.json` |
| Vistos | `gestao-postits-vistos/1` | `times/<time>/postits/vistos/<w>.json` |

## 2. Identificadores

| O quê | Formato | Exemplo | Quem define |
|---|---|---|---|
| Slug do time ou grupo | `^[a-z0-9]+(-[a-z0-9]+)*$`, até 40 caracteres (minúsculas, sem acento, hífen entre palavras) | `pagamentos`, `canais` | Quem cadastra o time na Central ou a unidade nas Finanças do Grupo. É o nome da pasta e não muda |
| Prefixo do time | `^[A-Z]{2,5}$` | `PAG` | Central, na criação do time. **Imutável** |
| Iniciativa | `<PREFIXO>-<3+ dígitos>` | `PAG-042` | Só a Central |
| Feature | `<iniciativa>.F<n>` | `PAG-042.F2` | Só a Central |
| Fase | `<iniciativa>.P<n>` | `PAG-042.P1` | Só a Central |
| `localId` | texto livre até 80 caracteres, estável | `EPIC-PIX-PARC`, `CARD-311` | A ferramenta do time (o id dela) |
| `writer` | `<pessoa>~<computador>`, `^[a-z0-9]+~[a-z0-9]+$` | `ana~k3f9a` | A solução que grava ([03](03-regras-de-escrita.md#1-um-dono-por-arquivo)) |
| Nome do arquivo por pessoa | `<pessoa>-<computador>.json` | `ana-k3f9a.json` | Derivado do `writer` |
| `kid` | `<slug>-AAMM`, `<slug>-fin-AAMM`, `<slug>-fer-AAMM`, com `-N` se repetir | `pagamentos-fin-2611` | Quem administra o nível ([02](02-criptografia.md#2-chaves)) |
| Id de métrica | `^[a-z0-9_]{1,60}$` | `lead_time` | O time; `standard` casa com o [dicionário](schemas/dicionario-metricas.json) |
| Id de pessoa nas férias | slug do nome no time; `<unidade>.<id>` no consolidado | `ana-souza`, `pagamentos.ana-souza` | Quem publica |
| Id de linha do plano | livre no time; `<unidade>:<categoria>:<O\|C>` ou `grupo:<categoria>` no consolidado | `pagamentos:pessoas:O` | Quem publica |
| Id de categoria | slug curto | `pessoas`, `ferramentas` | Finanças do Grupo (vai na diretriz); o time usa os mesmos ids |
| Id de post-it | único no mundo, ex.: `pi-<tempo><aleatório>` | `pi-mhx1a2b3c` | O autor |

**Regras dos códigos** ([ADR-0012](../docs/adr/0012-modelo-iniciativa-feature.md)):
- Os times **nunca inventam** `ref` de iniciativa, feature ou fase: só referenciam os que vieram no catálogo. Um item sem vínculo vai com `ref: null` (ou sem `featureRef`) e `localId` próprio. Uma feature criada pelo time também tem só `localId` (ex.: `FEAT-7`); os cards dela apontam para ela com `featureLocalId` ([ADR-0039](../docs/adr/0039-hierarquia-iniciativa-feature-card.md)).
- Feature pertence a uma iniciativa e a no máximo uma fase; não muda de iniciativa (só por união de iniciativas, que a Central comunica em `aliases`).
- Itens dos times entram na Central como *downstream* (andamento), nunca como tarefa do gestor.
- No plano financeiro, `lines[].initiative` aceita o código da iniciativa (`PAG-042`) para a Central mostrar o custo dela.

## 3. Valores e datas

- **Dinheiro:** centavos inteiros (R$ 1.234,56 → `123456`), moeda ISO 4217 em `currency` (`BRL`). O grupo só soma planos na mesma moeda.
- **Meses:** `AAAA-MM`. **Datas:** `AAAA-MM-DD`. **Instantes:** ISO 8601 com fuso.
- **Anos:** `fiscalYear` é o ano base (o ano em curso); `fiscalYears` é o horizonte; `totals` é do `fiscalYear` e `totalsByYear` traz cada ano. Os totais têm de ser a soma dos meses: o hub mostra os totais e o grupo soma os meses.
- **Status de iniciativa:** `ok`, `attn` (atenção), `late` (atrasada), `done`, `paused`.

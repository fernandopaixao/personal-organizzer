# ADR-0013 · Itens dos times só como downstream; nada muda sem prévia

**Status:** aceita · **Data:** 15/11/2026 (D4, D6) · **Origem:** `integracao-time/00` e `05`

## Decisão
- Cards dos times **nunca viram tarefa nem feature** na Central. Ligados a uma feature, aparecem **abaixo dela** como acompanhamento, só leitura; no máximo a Central sugere "Concluir feature?".
- **Cada lado manda nos seus campos:** iniciativas, features, prazos e fases são da Central; andamento granular, status reportado, itens e métricas são do time.
- **Prévia antes de aplicar:** arquivos dos times, importações de agentes e planos financeiros novos passam por uma tela de prévia com o que mudou.
- **Conciliação:** épicos do time sem vínculo podem ser unidos a uma iniciativa da Central, trazidos para ela ou ignorados; itens sem feature podem ser ligados, virar feature ou ser ignorados; uniões podem ser desfeitas. O código da iniciativa absorvida continua aceito como apelido (`aliases[]`).
- Métricas do time consideram o **backlog inteiro**, com e sem vínculo.

## Ao evoluir
- Dado vindo de fora nunca altera dado da Central sem aceite explícito.

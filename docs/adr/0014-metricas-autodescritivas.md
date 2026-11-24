# ADR-0014 · Métricas autodescritivas, só do time, e a Central só desenha

**Status:** aceita · **Data:** 15/11/2026 (D5, D9) · **Origem:** `integracao-time/02-esquema-de-metricas.md`

## Decisão
- Na v1, **só métricas do time**, calculadas pela ferramenta do time a partir da movimentação de cards. Métricas por pessoa têm formato reservado, **não implementado nem aceito**.
- Cada métrica traz os dados **e** como desenhá-los (tipo, unidade, granularidade, forma, visualização sugerida, direção boa). A Central **não calcula**: só desenha (KPI, linha, barras, empilhado, área, histograma, medidor, tabela).
- Dicionário `dicionario-metricas.json` casa métricas por `standard`, apelido ou mapeamento manual; casadas podem ser comparadas entre times; não mapeadas são aceitas em "Outras métricas do time".
- Cada métrica é tratada isoladamente: o que não dá para desenhar vira cartão "não foi possível exibir".

## Ao evoluir
- Métrica nova num time não exige mudar a Central. Para comparar entre times, acrescente ao dicionário.

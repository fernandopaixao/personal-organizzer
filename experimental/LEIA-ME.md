# Visual experimental

Fonte da versão experimental (visual novo) das ferramentas ([ADR-0034](../docs/adr/0034-visual-experimental.md)).
Aqui fica só o que é do visual; as funcionalidades vêm sempre do main.

| Arquivo | O que é |
|---|---|
| `src/identidade.css` | Trilho marinho, card de destaque sólido, fontes e o selo "Visual experimental" |
| `src/fontes/` | DM Sans e Plus Jakarta Sans (variáveis, só latim, SIL Open Font License), embutidas em base64 no build |
| `src/trocas.json` | Cores antigas → novas e trocas de fonte aplicadas nas fontes do main |

Montar: `python3 tools/build_experimental.py` (saída em `dist/experimental/`).
Montar e testar: `python3 tools/build_experimental.py --testar`.
O pacote (`python3 tools/empacotar.py`) monta e inclui a pasta `experimental/` sozinho.

O ícone da aba de cada ferramenta (marca Remessa) não fica aqui: vem de `financas/src/icones/` e vale também para o main ([ADR-0036](../docs/adr/0036-nome-remessa.md)).

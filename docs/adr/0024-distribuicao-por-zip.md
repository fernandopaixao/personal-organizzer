# ADR-0024 · Distribuição por .zip autossuficiente; CI só no repositório pessoal

**Status:** aceita · **Data:** 24/11/2026 · **Origem:** `tools/empacotar.py`, `.github/workflows/teste.yml`

## Contexto
A solução é levada para a empresa num arquivo .zip; nada passa pelo repositório da empresa. A automação de teste só pode rodar no repositório pessoal.

## Decisão
- `python3 tools/empacotar.py` gera `dist/gestao-solucao-AAAA-MM-DD.zip` com uma pasta única: as ferramentas lado a lado (hub, assistente, Central, Quadro, Finanças do Grupo e do Time), `contrato/`, `docs/` e `LEIA-ME.txt`. `dist/` não vai para o git.
- A CI (GitHub Actions, só no repositório pessoal) roda em cada PR e em cada push na `main`: confere que os HTMLs montados batem com a fonte (Python 3.12), roda o teste de ponta a ponta, confere a documentação ([0022](0022-documentacao-no-mesmo-pr.md)) e publica o .zip como artefato.
- Nada no .zip depende de rede, servidor ou da CI ([0001](0001-html-de-arquivo-unico-sem-servidor.md)).

## Consequências
- O .zip baixado do artefato da CI da `main` é a versão para levar à empresa.
- Uma ferramenta nova só chega à empresa se entrar no `empacotar.py`.

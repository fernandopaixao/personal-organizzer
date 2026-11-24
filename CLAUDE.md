# Regras para quem evolui este repositório (pessoas e agentes)

- **Documentação no mesmo PR** ([ADR-0022](docs/adr/0022-documentacao-no-mesmo-pr.md)): toda funcionalidade nova ou mudança de comportamento atualiza, no mesmo PR, `docs/funcionalidades.md`, `docs/passo-a-passo.md` e `docs/jornada-do-usuario.md` quando o caminho de quem usa muda, uma ADR quando a decisão vale para mais de uma ferramenta, e as versões no cabeçalho dos documentos e no `README.md`. A CI recusa PR que muda ferramenta sem mudar documento (exceção: `[sem-docs]` no título, só para correção sem efeito para quem usa).
- Antes de começar uma funcionalidade, siga o checklist de [`docs/adr/README.md`](docs/adr/README.md).
- Não edite à mão os blocos injetados nem as cópias embutidas: edite `financas/src/` e rode `python3 tools/injetar_seguranca.py` (use Python 3.12, o mesmo da CI). Teste com `node financas/testes/teste-e2e.js`.
- Mudou a Central: suba `APP_VERSION` e os dois textos `v15.x` no HTML.
- A solução chega à empresa num .zip (`python3 tools/empacotar.py`); nada pode depender de rede, servidor ou da CI.
- Textos para quem usa em português do Brasil.

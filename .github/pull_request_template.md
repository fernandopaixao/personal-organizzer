## O que muda para quem usa

<!-- Em poucas linhas: ferramenta, versão e o que a pessoa passa a ver ou fazer. -->

## Documentação (ADR-0022)

- [ ] `docs/funcionalidades.md` atualizado (o que faz, uso, objetivo)
- [ ] `docs/passo-a-passo.md` atualizado, se o caminho de quem usa mudou
- [ ] `docs/jornada-do-usuario.md` atualizado, se uma etapa mudou ou um atrito foi resolvido
- [ ] ADR nova ou atualizada, se a decisão vale para mais de uma ferramenta
- [ ] Versões no cabeçalho dos documentos e no `README.md`
- [ ] Mudou um arquivo da pasta compartilhada: `contratos/` atualizado (schema, exemplo, validador, histórico) ([ADR-0032](../docs/adr/0032-pasta-de-contratos.md))

## Build e teste

- [ ] `python3 tools/injetar_seguranca.py` (ou `tools/build_financas.py`) rodado, sem diferença pendente
- [ ] `node financas/testes/teste-e2e.js` passando
- [ ] `node contratos/testes/teste-contratos.js` passando, se mexeu em contratos ou na leitura da pasta

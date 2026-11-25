# ADR-0018 · Hub leve e separado do assistente

**Status:** aceita, revista pela [ADR-0035](0035-hub-cockpit-de-gestao.md) (o hub passa a ler, sem gravar, a Central e os quadros) · **Data:** 24/11/2026 (PR #11, #13) · **Origem:** `docs/plano-hub.md`

## Decisão
- `inicio.html` (assistente, ~600 KB) é de **uso único**: monta a solução, cria os primeiros arquivos cifrados e gera os HTMLs.
- `hub.html` (~85 KB) é a **tela do dia a dia**: lista os HTMLs da pasta local pelo `<title>`, abre por link relativo, mostra quando cada time publicou e deixa post-its cifrados para os times. Tem o próprio arquivo cifrado.
- Todas as ferramentas têm **← Hub**.

## Consequências
- A tela diária fica leve; gerar ferramentas e usar ferramentas não se misturam.
- O hub precisa estar na mesma pasta das ferramentas.

# ADR-0017 · Fonte em `financas/src/`, HTMLs montados por scripts e blocos comuns injetados

**Status:** aceita · **Data:** 16/11/2026 (HTML do time embutido); 23/11/2026 (núcleo e assistente) · **Origem:** `tools/`

## Contexto
O mesmo código (cripto, sincronização, aviso de cofre, "Onde estou?") precisa existir em seis HTMLs, e alguns HTMLs geram outros (Central gera o Quadro; o assistente gera todos; Finanças do Grupo gera Finanças do Time).

## Decisão
- **Núcleo comum** em `financas/src/nucleo.js` e `nucleo.css`, e **bloco de segurança** em `financas/src/seguranca.js`, mais blocos por ferramenta (`central-f4.js`, `quadro-f4.js`, `quadro-postits.js`).
- **Embutir:** HTML gerado vai dentro do gerador em gzip + base64, entre marcadores, com um bloco de pré-configuração.
- Scripts:

| Script | Faz |
|---|---|
| `python3 tools/build_financas.py` | Monta Finanças do Grupo, Finanças do Time, hub e assistente a partir de `financas/src/`, embutindo a Central mais nova e o Quadro |
| `python3 tools/embutir_quadro.py` | Embute o Quadro na Central (botão "HTML do time") |
| `python3 tools/injetar_seguranca.py` | Reinjeta os blocos `<script id="f4…">`/`f5postits` na Central e no Quadro, reembute o Quadro e roda o build |
| `build_financas.py` e `injetar_seguranca.py` | Também injetam o tema claro/escuro (`financas/src/tema.js`) no `<head>` de cada HTML como `<script id="tema">` ([ADR-0027](0027-tema-claro-escuro-compartilhado.md)) |
| `node financas/testes/teste-e2e.js` | Teste ponta a ponta (73 verificações) |

## Ao evoluir
- **Nunca edite à mão** os blocos injetados nem as cópias embutidas: edite a fonte e rode `injetar_seguranca.py`.
- Depois de mexer na Central ou no Quadro, rode `injetar_seguranca.py` e o teste e2e antes de abrir o PR.

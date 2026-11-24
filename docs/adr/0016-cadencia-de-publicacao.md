# ADR-0016 · Quando cada lado publica

**Status:** aceita · **Data:** 15/11/2026 (D7); finanças e post-its em 23 e 24/11/2026 · **Origem:** `integracao-time/05` §2 e §3

## Decisão
| O quê | Quando |
|---|---|
| Backlog do time (`status.json`) | Automático a cada movimentação de card (espera de ~10 s para agrupar) |
| Métricas do time | Ao **fechar a sprint, com confirmação**, ou "Publicar métricas agora" |
| Catálogo da Central | **Só pelo botão Compartilhar**, numa tela que mostra o já compartilhado, o novo, o alterado, o que sai e o que fica só na Central |
| Plano financeiro do time | Botão **Publicar para o grupo** e no fechamento do mês (com pergunta) |
| Diretriz do grupo | Publicada pelo gestor no Finanças do Grupo |
| Post-its | Alguns segundos depois da última mudança no hub |

## Por quê
O que é operacional e do time flui sozinho; o que é decisão do gestor (portfólio, metas) só sai quando ele revisa.

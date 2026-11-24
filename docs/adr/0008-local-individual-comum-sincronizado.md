# ADR-0008 · Dado individual local; só o pedaço comum vai para a pasta sincronizada

**Status:** aceita · **Data:** 23/11/2026 (D4 do plano de finanças: publicar só agregados) · **Origem:** `docs/plano-financas.md` §5

## Contexto
Muita coisa só interessa a uma pessoa (lançamentos detalhados, notas, cenários, chaves, rascunhos). Colocar isso na pasta sincronizada aumenta a exposição e a chance de conflito.

## Decisão
- Cada ferramenta tem uma **pasta local**, fora do OneDrive (sugestão: `C:\Users\<você>\GestaoLocal`), com o arquivo de dados individual, os HTMLs e o `backup/` com as 5 últimas versões cifradas.
- Na **pasta sincronizada** vai só **o mínimo que o outro lado precisa**: retratos e agregados.

| Ferramenta | Fica local | Vai para a pasta comum |
|---|---|---|
| Central | tudo do gestor | `central/catalogo-<time>.json` |
| Quadro do Time | preferências, filtros, rascunhos, cópia de trabalho | arquivo da pessoa em `quadro/`, `status.json`, `metricas.json`, recibos "Vi" |
| Finanças do Time | lançamentos, notas, cenários não publicados, chaves | `financas/plano.json` (agregado por mês × linha) |
| Finanças do Grupo | orçamento aprovado, reservas, notas, retratos de versões | `grupo/financas/diretriz-<time>.json` |
| Hub | times, chaves, histórico de post-its | post-its ativos por time |

- A ferramenta avisa sozinha quando a pasta local parece sincronizada (nome igual ao da comum, `desktop.ini`, cópias com nome de computador). **Desde 24/11/2026 não há mais confirmação manual** ("conferi que não tem o ícone do OneDrive"); só a checagem automática.

## Consequências
- **A favor:** menor exposição, menos conflito, cada time controla o que publica.
- **Contra:** o local não tem nuvem; se o disco quebrar, só sobra o backup. Mitigado pelo backup rotativo e pelo lembrete semanal de exportar uma cópia cifrada. Trocar de computador exige copiar a pasta local.

## Ao evoluir
- Antes de publicar um campo novo, pergunte "o outro lado precisa disso?". Se não, ele fica local.
- Não reintroduza confirmações manuais de "pasta fora do OneDrive" (pedido explícito do Fernando).

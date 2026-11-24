# ADR-0008 · Dado individual numa pasta só sua; só o pedaço comum vai para a pasta compartilhada

**Status:** aceita, revista em 24/11/2026 (pasta pessoal no OneDrive da pessoa) · **Data:** 23/11/2026 (D4 do plano de finanças: publicar só agregados) · **Origem:** `docs/plano-financas.md` §5; revisão pedida pelo Fernando

## Contexto
Muita coisa só interessa a uma pessoa (lançamentos detalhados, notas, cenários, chaves, rascunhos). Colocar isso na pasta sincronizada aumenta a exposição e a chance de conflito.

## Decisão
- Cada pessoa tem uma **pasta pessoal**, só dela, com o arquivo de dados individual de cada ferramenta, os HTMLs e o `backup/` com as 5 últimas versões cifradas.
- **Desde 24/11/2026 a recomendação é deixar a pasta pessoal no OneDrive da própria pessoa** (ex.: `OneDrive - Empresa\GestaoPessoal`). Assim ela tem backup e abre em outro computador. Antes era "fora do OneDrive". A pasta pessoal **nunca** é a pasta compartilhada com os times.
- **Por que separadas:** todo o grupo vê e sincroniza a pasta compartilhada. O arquivo pessoal tem as chaves de todos os times, notas e o detalhe, então fica onde só a pessoa mexe. Separar também mantém um dono por arquivo ([0007](0007-um-escritor-por-arquivo.md)).
- **Ninguém lê sem a senha:** o arquivo pessoal é cifrado com AES-GCM 256 e uma chave derivada da senha por PBKDF2 com 600 mil rodadas ([0003](0003-criptografia-sempre.md)). Estar no OneDrive não expõe o conteúdo.
- Na **pasta sincronizada** vai só **o mínimo que o outro lado precisa**: retratos e agregados.

| Ferramenta | Fica local | Vai para a pasta comum |
|---|---|---|
| Central | tudo do gestor | `central/catalogo-<time>.json` |
| Quadro do Time | preferências, filtros, rascunhos, cópia de trabalho | arquivo da pessoa em `quadro/`, `status.json`, `metricas.json`, recibos "Vi" |
| Finanças do Time | lançamentos, notas, cenários não publicados, chaves | `financas/plano.json` (agregado por mês × linha) |
| Finanças do Grupo | orçamento aprovado, reservas, notas, retratos de versões | `grupo/financas/diretriz-<time>.json` |
| Hub | times, chaves, histórico de post-its | post-its ativos por time |

- A ferramenta avisa sozinha só quando a pasta pessoal parece ser a **pasta compartilhada**: nome `Gestao-Compartilhado` ou estrutura `times/`, `grupo/`, `grupos/`. Estar no OneDrive não gera mais aviso. Não há confirmação manual.

## Consequências
- **A favor:** menor exposição, menos conflito, cada time controla o que publica.
- **Contra:** se a pessoa abrir a mesma ferramenta em dois computadores ao mesmo tempo, o OneDrive pode criar uma cópia de conflito do arquivo pessoal. A orientação é usar um computador de cada vez. Quem deixar a pasta pessoal fora do OneDrive continua com o backup rotativo e o lembrete de exportar.

## Ao evoluir
- Antes de publicar um campo novo, pergunte "o outro lado precisa disso?". Se não, ele fica local.
- Não reintroduza confirmações manuais sobre o OneDrive (pedido explícito do Fernando).

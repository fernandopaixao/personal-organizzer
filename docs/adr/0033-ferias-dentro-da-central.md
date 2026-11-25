# ADR-0033 · Férias dentro da Central do gestor

**Status:** aceita; itens 7 e "O que observar" completados pela [ADR-0036](0036-ferias-so-o-gestor-cadastra.md) (só o gestor cadastra) · **Data:** 24/11/2026 (Central 15.9, Mapa de Férias 1.3, assistente 2.4) · **Origem:** pedido do Fernando: "Não trate férias como um item a parte. Trate como uma ferramenta incluída no módulo do gestor. O objetivo é reduzir e simplificar a quantidade de módulos a gerir." Revê o item 1 da [ADR-0026](0026-ferias-em-niveis.md) para o gestor e a liderança.

## Contexto
O Mapa de Férias era um HTML à parte (`ferias.html`), com arquivo cifrado próprio (`ferias-<grupo>.json`), senha própria, pasta compartilhada ligada de novo e os times e chaves cadastrados uma segunda vez (ou importados do hub). Para o gestor, isso era mais um módulo para abrir, guardar, atualizar e explicar, embora tudo o que o Mapa precisa (times, chaves de tarefas, pasta compartilhada, pessoas) já esteja na Central.

## Decisão
1. **Férias é uma página da Central** (menu Pessoas › **Férias**). A Central leva uma cópia do Mapa de Férias embutida (`#feriasEmb`, gzip + base64, montada por `tools/build_financas.py`) e a abre num quadro da própria página, sem servidor.
2. **Um arquivo e uma senha.** Os dados das férias ficam em `db.ferias`, dentro do arquivo cifrado da Central, no mesmo formato de antes (`gestao-ferias-local/1`). Não há `ferias-<grupo>.json` nem senha das férias para o gestor.
3. **A Central entrega o que já tem** (objeto `FERIAS_HOST`): os times com pasta (identificador) e as chaves de tarefas ativas da Integração viram unidades sozinhos; time novo entra, time sem pasta fica de fora; a pasta compartilhada é a da Integração; o nome vem dos Ajustes da Central. Grupos de outros gestores (liderança) e a chave do nível acima continuam cadastrados na própria página.
4. **Mesmos arquivos na pasta.** A página lê `times/<time>/ferias/` e publica o consolidado em `grupos/<grupo>/ferias/<pessoa>-<computador>.json` (`gestao-ferias/1`), como antes: times, liderança e outras soluções não mudam nada ([ADR-0032](0032-pasta-de-contratos.md)). O gestor continua publicando por botão ([ADR-0016](0016-cadencia-de-publicacao.md)); as notas não saem do arquivo da Central.
5. **Migração por botão.** Quem usava o Mapa separado clica **Trazer do Mapa de Férias separado**, escolhe o `ferias-<grupo>.json` e digita a senha dele: pessoas, ausências, feriados, grupos e chaves vêm para a Central. O arquivo antigo só é lido.
6. **A Hoje da Central mostra "Fora hoje"**, lido de `db.ferias` (você, diretos e o último retrato de cada time).
7. **O assistente** não gera mais `ferias.html` nem `ferias-<grupo>.json` para o gestor: marcar Férias gera a Central já com `db.ferias` configurado (grupo, times e chaves). Para os times nada mudava nesta entrega; desde a [ADR-0036](0036-ferias-so-o-gestor-cadastra.md) eles não recebem mais ferramenta de férias.

## Consequências
- **A favor:** o gestor tem um módulo a menos para abrir, guardar e atualizar; times e chaves cadastrados uma vez só (na Central); o "fora hoje" aparece junto do resto do dia.
- **Exceção consciente à [ADR-0002](0002-dados-fora-do-html.md) e à [ADR-0010](0010-htmls-desacoplados.md):** o Mapa de Férias embutido não tem arquivo próprio; quem guarda é a Central. Continua valendo que nenhuma ferramenta lê o arquivo de outra: a Central entrega os dados ao quadro na mesma página, e a troca entre níveis segue pela pasta, por contrato.
- O `ferias.html` à parte deixou de ser distribuído ([ADR-0036](0036-ferias-so-o-gestor-cadastra.md)). A cópia embutida na Central é o mesmo código (modo embutido quando aberto pela Central), então correções valem para os dois.
- Ao mudar a Central, rode `python3 tools/injetar_seguranca.py`: ele reembute o Quadro e o Mapa de Férias. Teste em `node financas/testes/teste-ferias.js` (seção 6).

## O que observar ao evoluir
- Decidido na [ADR-0036](0036-ferias-so-o-gestor-cadastra.md): só o gestor cadastra.
- Mudança no formato `gestao-ferias-local/1` precisa de migração em `normalizar()` do Mapa e vale para o que está dentro da Central.

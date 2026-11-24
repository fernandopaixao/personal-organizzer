# ADR-0022 · Consolidação em níveis: cada nível soma os de baixo e publica um retrato para o de cima

**Status:** aceita · **Data:** 24/11/2026 · **Origem:** Finanças do Grupo 1.3 (`docs/plano-financas.md` §14) e Mapa de Férias 1.0 (`docs/plano-ferias.md`)

## Contexto
Outros gestores também usam a solução, e a liderança de vários gestores quer a mesma visão somada. Primeiro veio o consolidado financeiro (gestor → liderança); depois, as férias (time → gestor → liderança). As duas precisam funcionar em quantos níveis existirem, sem servidor e sem que uma ferramenta leia o arquivo de outra.

## Decisão
1. **Uma unidade é um time ou um grupo de outro gestor.** Quem consolida cadastra as unidades com o identificador delas (o mesmo slug usado nas pastas).
2. **Cada nível publica o próprio retrato** para o nível de cima, no mesmo formato que recebe dos de baixo, com `source.level = "group"`, na pasta `grupos/<grupo>/<assunto>/`. Quem está acima trata esse retrato como mais uma unidade. Repetir isso dá quantos níveis forem precisos.
3. **Chave entre grupos:** quem está acima gera `GK1.<grupo>-…` e envia por mensagem direta, com aviso de cofre. A mesma chave serve para todos os assuntos do grupo: a chave `GK1.<grupo>-fin-AAMM` das Finanças do Grupo também abre e publica as férias do grupo. Uma chave de outro identificador é recusada.
4. **Dentro do time**, as férias usam a chave de tarefas do time (a mesma do Quadro), porque o time inteiro já a tem e as ausências não são dado restrito como finanças ([ADR-0006](0006-chave-de-financas-separada.md) continua valendo para finanças).
5. **O gestor decide o que sobe:** publicar para a liderança é sempre por botão, com uma prévia do que vai e do que fica de fora ([ADR-0016](0016-cadencia-de-publicacao.md)). O time publica sozinho a cada mudança.
6. **Um dono por arquivo** ([ADR-0007](0007-um-escritor-por-arquivo.md)): finanças usa um `plano.json` por grupo; férias usa `<pessoa>-<computador>.json`, e quem lê fica com o arquivo mais novo de cada pessoa.
7. **Só o necessário sobe:** finanças sobe por unidade e categoria, sem os nomes das linhas; férias sobe pessoa e período, sem as notas (e com opção de trocar nomes por "Pessoa N").

## Consequências
- A liderança precisa ler a mesma pasta compartilhada (ou uma biblioteca do SharePoint sincronizada com a mesma estrutura).
- Uma unidade que ainda não publicou aparece como "ainda não publicou" e fica de fora da soma, sem travar o resto.
- O onboarding pode gravar a chave do nível acima já na criação do arquivo.

## Ao evoluir
Um assunto novo com consolidação usa a mesma pasta `grupos/<grupo>/<assunto>/`, o mesmo cadastro de unidades e a mesma chave do grupo. Não crie outro tipo de chave sem nova ADR.

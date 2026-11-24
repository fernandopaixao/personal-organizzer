# ADR-0026 · Férias em níveis: chave do time no time, chave do grupo entre níveis

**Status:** aceita, item 1 revisto pela [ADR-0033](0033-ferias-dentro-da-central.md) (o gestor e a liderança usam a página Férias da Central) · **Data:** 24/11/2026 · **Origem:** Mapa de Férias 1.0 (`docs/plano-ferias.md`), aplicando a [ADR-0025](0025-consolidacao-em-niveis.md) (consolidação em níveis)

## Contexto
O Fernando pediu férias com a mesma lógica de níveis das Finanças do Grupo 1.3: o time cadastra, sobe para o gestor, que cadastra as próprias e sobe para a liderança. O papel do líder é enxergar e planejar as ausências (dias com mais e menos gente fora). É apoio: não substitui a ferramenta oficial de férias.

## Decisão
1. **Um HTML para todos os níveis** (`ferias.html`, título "Mapa de Férias"), com o papel escolhido na criação do arquivo (time ou gestor/liderança). *Revisto pela [ADR-0033](0033-ferias-dentro-da-central.md): o gestor e a liderança usam a página Férias da Central; o `ferias.html` à parte fica para o papel de time.*
2. **Dentro do time, a chave de tarefas do time** (a mesma do Quadro): o time inteiro já a tem e ausências não são dado restrito como finanças ([ADR-0006](0006-chave-de-financas-separada.md) continua valendo para finanças).
3. **Entre níveis, a mesma chave do grupo** que a liderança gerou nas Finanças do Grupo (`GK1.<grupo>-fin-…`). O Mapa aceita qualquer chave cujo identificador comece pelo slug do grupo e também gera `GK1.<grupo>-fer-…` para quem não usa finanças.
4. **Um arquivo por pessoa e computador** em `times/<time>/ferias/` e `grupos/<grupo>/ferias/` ([ADR-0007](0007-um-escritor-por-arquivo.md)). Quem lê fica com o arquivo mais novo de cada pessoa, para o mesmo gestor em dois computadores não somar em dobro. Pessoas do mesmo time se unem pelo nome.
5. **O time publica sozinho; o gestor publica por botão**, depois de conferir o que sobe ([ADR-0016](0016-cadencia-de-publicacao.md)).
6. **Dado pessoal mínimo:** notas só locais, tipos sem saúde (licença entra como "Outra ausência") e opção de trocar nomes por "Pessoa N" ao subir para a liderança.

## Consequências
- Contrato novo `gestao-ferias/1` (`contratos/schemas/gestao-ferias-1.schema.json`).
- A liderança precisa ler a mesma pasta compartilhada.
- O onboarding pode criar o arquivo `gestao-ferias-local/1` já com a chave do time ou do nível acima.

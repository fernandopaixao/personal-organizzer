# ADR-0010 · HTMLs desacoplados

**Status:** aceita; exceções de leitura ampliadas pela [ADR-0028](0028-financas-na-central-so-leitura.md) (a Central lê as chaves do Finanças do Grupo e mostra finanças, revendo a D6), pela [ADR-0033](0033-ferias-dentro-da-central.md) (Férias embutida na Central) e pela [ADR-0035](0035-hub-cockpit-de-gestao.md) (o hub lê, sem gravar, o arquivo da Central) · **Data:** 23/11/2026 (plano de finanças, D6); 24/11/2026 (hub) · **Origem:** `docs/plano-financas.md` §1, `docs/plano-hub.md` §2

## Contexto
A solução cresceu de uma ferramenta para seis (Central, Quadro, Finanças do Grupo, Finanças do Time, Hub, assistente). Se uma depender dos dados da outra, uma versão nova quebra as demais e o público de cada dado se mistura.

## Decisão
- Cada HTML **abre e funciona sozinho**, com o próprio arquivo de dados.
- Nenhuma ferramenta lê o arquivo de dados de outra. Elas só se encontram pela pasta comum, por contratos ([ADR-0009](0009-contratos-json-versionados.md)).
- **Exceção única e só de leitura:** o hub pode "Importar times e chaves da Central", lendo o arquivo dela com a senha dela, sem alterar nada. *Hoje as exceções são todas de leitura, com a senha do dono e sem gravar: o hub importa da Central e do Finanças do Grupo e resume a Central no cockpit ([ADR-0035](0035-hub-cockpit-de-gestao.md)); a Central importa as chaves de finanças do Finanças do Grupo ([ADR-0028](0028-financas-na-central-so-leitura.md)).*
- A ligação entre finanças e tarefas é só o **código da iniciativa** (`PAG-042`) usado como rótulo. A Central **não** mostra finanças na v1 (D6). *Revisto pela [ADR-0028](0028-financas-na-central-so-leitura.md): desde a 15.5 a Central mostra as finanças dos times, só para leitura, pelo plano que eles publicam.*
- O hub abre as ferramentas por **link relativo** (precisam estar na mesma pasta). O botão **← Hub** traz a aba `gestao-hub` de volta sem recarregar.

## Consequências
- **A favor:** cada ferramenta pode mudar sozinha; quem só usa o Quadro não precisa de nada das finanças.
- **Contra:** mais de uma senha e mais de um arquivo para o gestor; navegação entre ferramentas é por abas. Mitigado pelo hub e pelo "Onde estou?".

## Ao evoluir
- Precisa de um dado de outra ferramenta? Publique um contrato na pasta comum em vez de ler o arquivo dela.
- Reavaliar D6 (resumo financeiro na Central) só como cartão de leitura alimentado por contrato.

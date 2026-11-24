# ADR-0010 · HTMLs desacoplados

**Status:** aceita · **Data:** 23/11/2026 (plano de finanças, D6); 24/11/2026 (hub) · **Origem:** `docs/plano-financas.md` §1, `docs/plano-hub.md` §2

## Contexto
A solução cresceu de uma ferramenta para seis (Central, Quadro, Finanças do Grupo, Finanças do Time, Hub, assistente). Se uma depender dos dados da outra, uma versão nova quebra as demais e o público de cada dado se mistura.

## Decisão
- Cada HTML **abre e funciona sozinho**, com o próprio arquivo de dados.
- Nenhuma ferramenta lê o arquivo de dados de outra. Elas só se encontram pela pasta comum, por contratos ([ADR-0009](0009-contratos-json-versionados.md)).
- **Exceção única e só de leitura:** o hub pode "Importar times e chaves da Central", lendo o arquivo dela com a senha dela, sem alterar nada.
- A ligação entre finanças e tarefas é só o **código da iniciativa** (`PAG-042`) usado como rótulo. A Central **não** mostra finanças na v1 (D6).
- O hub abre as ferramentas por **link relativo** (precisam estar na mesma pasta). O botão **← Hub** traz a aba `gestao-hub` de volta sem recarregar.

## Consequências
- **A favor:** cada ferramenta pode mudar sozinha; quem só usa o Quadro não precisa de nada das finanças.
- **Contra:** mais de uma senha e mais de um arquivo para o gestor; navegação entre ferramentas é por abas. Mitigado pelo hub e pelo "Onde estou?".

## Ao evoluir
- Precisa de um dado de outra ferramenta? Publique um contrato na pasta comum em vez de ler o arquivo dela.
- Reavaliar D6 (resumo financeiro na Central) só como cartão de leitura alimentado por contrato.

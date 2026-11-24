# ADR-0012 · Modelo Iniciativa › Feature, fases como agrupamento e códigos públicos

**Status:** aceita · **Data:** 15/11/2026 (v14) · **Origem:** `integracao-time/04-modelo-iniciativa-feature.md`

## Decisão
- **Iniciativa** pertence a um time; código `<PREFIXO>-<nnn>` (ex.: `PAG-042`). Andamento = features concluídas ÷ features.
- **Feature** (antigo "entregável") pertence a uma iniciativa e **nunca muda de iniciativa** (só por união de iniciativas). Fica em **no máximo uma fase**. Pode **depender de outra feature**. Código `PAG-042.F2`.
- **Fase** não é nível da hierarquia: é agrupamento de features no tempo; fases podem **se sobrepor**. Código `PAG-042.P1`.
- **Tarefa** é desacoplada: ligada a uma feature, a uma iniciativa ou a nada.
- **Códigos** com prefixo do time (2 a 5 letras), imutáveis, nunca reutilizados; o prefixo trava após o primeiro código. O `id` interno continua sendo a chave interna; o código é a chave pública da troca.

## Consequências
- Vínculo estável com as ferramentas dos times por código, sem depender de ids internos.
- Regras rígidas (feature em uma fase, sem mudar de iniciativa) simplificam o importador e a conciliação.

## Ao evoluir
- Qualquer tela ou importação nova deve respeitar essas invariantes; o importador já recusa violações.

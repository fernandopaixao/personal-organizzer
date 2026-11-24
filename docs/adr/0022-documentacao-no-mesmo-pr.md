# ADR-0022 · Documentação atualizada no mesmo PR da funcionalidade

**Status:** aceita · **Data:** 24/11/2026 · **Origem:** pedido do Fernando ("sempre atualizar as documentações quando uma nova funcionalidade for desenvolvida")

## Contexto
A solução é usada por vários gestores e times, chega à empresa num .zip que leva a documentação junto ([0024](0024-distribuicao-por-zip.md)) e é evoluída por várias frentes em paralelo. Quando a documentação fica para depois, o .zip sai com instruções desatualizadas e a próxima frente começa sem saber o que mudou.

## Decisão
- Toda funcionalidade nova ou mudança de comportamento **atualiza a documentação no mesmo PR**:
  - [`funcionalidades.md`](../funcionalidades.md): o que faz, uso e objetivo;
  - [`passo-a-passo.md`](../passo-a-passo.md): quando muda o caminho de quem usa;
  - [`jornada-do-usuario.md`](../jornada-do-usuario.md): quando muda uma etapa ou resolve um atrito da seção 7;
  - ADR nova quando a decisão vale para mais de uma ferramenta; plano do recurso em `docs/` quando há contrato ou regra nova;
  - versões no cabeçalho dos documentos e no `README.md`.
- A CI do repositório pessoal recusa o PR que muda ferramenta (`*.html`, `financas/src/`, `ferramenta-time/`, `tools/`) sem mudar nenhum documento (`docs/`, `README.md`, guias `.md`). Só correções sem efeito para quem usa podem pular, com `[sem-docs]` no título do PR.
- O template de PR traz o checklist; o `CLAUDE.md` traz a regra para os agentes.

## Consequências
- O .zip sempre leva a documentação da versão que contém.
- PR um pouco maior; em troca, nenhuma rodada de "atualizar docs" acumulada.

## Ao evoluir
Se um documento novo virar porta de entrada, inclua-o na lista acima e no passo "Documentação" da CI.

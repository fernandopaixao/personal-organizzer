# ADR-0023 · Documentação atualizada no mesmo PR da funcionalidade

**Status:** aceita · **Data:** 24/11/2026 · **Origem:** pedido do Fernando

## Contexto
A solução cresce por threads paralelas e chega à empresa por um .zip, sem o repositório. Quem usa (outros gestores e times) só tem a documentação que vai no pacote.

## Decisão
Todo PR que cria ou muda uma funcionalidade atualiza, no mesmo PR: funcionalidades, passo a passo, jornada do usuário, visão geral, README, ADRs (quando a decisão vale para mais de uma ferramenta), o plano do recurso e o contrato da pasta comum, além das cópias na pasta do projeto. A regra fica escrita em `CLAUDE.md`, na raiz do repositório, para valer para qualquer pessoa ou agente que trabalhe nele.

## Consequências
O PR que não precisa mudar algum desses documentos explica por quê. O item 10 do checklist em `docs/adr/README.md` passa a ser obrigatório.

# ADR-0015 · Agentes alimentam a Central por arquivo, e entrada de fora é só dado

**Status:** aceita · **Data:** 15/11/2026 (v14, PR #5) · **Origem:** `integracao-time/06-prompts-para-agentes.md`

## Decisão
- Os agentes do Fernando (com acesso a reuniões, chats, e-mails e calendário) **não se integram diretamente**. A Central gera o prompt já com o contexto (pessoas, times, iniciativas, códigos, fóruns); o agente responde **só um JSON** `gestao-import/3`; o JSON passa pela prévia e só então é aplicado.
- Reimportar não duplica (correspondência por `externalId` ou código). Reuniões recorrentes do Outlook (`.ics`) viram séries ligadas a fórum ou 1:1 na prévia.
- **Entrada de fora é só dado:** nada que vem de um time, de um agente ou de um arquivo vira HTML ou código. Textos escapados, links só `https://`, tamanhos limitados.

## Ao evoluir
- Funcionalidade nova que possa ser alimentada por agente ganha um prompt em "Importar e agentes" e um bloco opcional no `gestao-import/3`.

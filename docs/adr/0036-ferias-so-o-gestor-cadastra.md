# ADR-0036 · Férias: só o gestor cadastra

**Status:** aceita · **Data:** 25/11/2026 (Central 15.11, Mapa de Férias 1.4 dentro da Central, assistente 2.6) · **Origem:** escolha do Fernando na decisão aberta pela [ADR-0033](0033-ferias-dentro-da-central.md): "Só o gestor cadastra". Revê o papel de time da [ADR-0026](0026-ferias-em-niveis.md).

## Contexto
Com as férias do gestor dentro da Central (ADR-0033), sobrava um módulo só para os times: o `ferias.html` no papel de time, em que cada pessoa marcava as próprias férias e publicava em `times/<time>/ferias/`. O objetivo do Fernando é reduzir os módulos a gerir; as férias oficiais já ficam na ferramenta da empresa, e o gestor já sabe quem vai sair.

## Decisão
1. **Os times não usam ferramenta de férias.** O `ferias.html` sai do pacote (.zip), do assistente (nem gestor, nem responsável, nem membro recebem) e de `para-os-times/<time>/`. No assistente, a opção Férias aparece só para quem lidera vários times.
2. **O gestor marca as férias de todos na página Férias da Central.** Cada pessoa pode ter um **time** (`pessoa.un`); sem time, conta como "você e diretos". O botão **Trazer pessoas da Central** (e a primeira abertura) traz as pessoas cadastradas na Central com o primeiro time delas.
3. **Todos os times da Central viram unidades**, mesmo sem pasta (o identificador vem do nome) e sem chave: a chave só serve para ler o que outra solução do time publique.
4. **O que sobe para a liderança não muda de formato:** a pessoa de um time sobe com `unit` = time e `id` = `<time>.<pessoa>` em `grupos/<grupo>/ferias/` (`gestao-ferias/1`).
5. **`times/<time>/ferias/` continua no contrato** para outras soluções (receita D de `contratos/05-como-integrar.md`): a Central ainda lê esses arquivos quando o time tem chave, e soma sem duplicar quem o gestor já cadastrou (mesmo time e mesmo nome).

## Consequências
- **A favor:** um módulo a menos para os times e para o gestor distribuir; nenhuma chave de time precisa servir para férias; ninguém mais precisa combinar "o mesmo nome em todos os arquivos".
- **Contra:** o gestor digita as férias de todo o grupo. A barra rápida ("Ana 05/01 a 23/01 férias") e o calendário clicável deixam isso rápido; quem tem ferramenta própria pode publicar pelo contrato.
- Times sem publicação não geram alerta ("ainda não publicou") na página Férias.
- O `ferias/ferias.html` continua no repositório como fonte montada da cópia embutida e para os testes; não é distribuído. O código do papel de time fica para ler arquivos antigos e para os testes do contrato.

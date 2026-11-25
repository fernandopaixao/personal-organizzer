# ADR-0038 · Ligar o visual experimental pela tela de entrada

**Status:** aceita · **Data:** 25/11/2026 · **Origem:** pedido do Fernando ("permita ativar o modo experimental na tela de início"); complementa a [ADR-0034](0034-visual-experimental.md) · **Fonte:** `financas/src/visual.js` (injetado pelo build) e `financas/src/marca.js`

## Contexto
Desde a ADR-0034, o visual novo vai no pacote como a pasta `experimental/`, com as mesmas ferramentas montadas do main. Para usar, era preciso saber que a pasta existe e abrir `experimental/hub.html` à mão; para voltar, abrir o `hub.html` da pasta principal. Nada lembrava a escolha, e o atalho de sempre (o `hub.html`) voltava ao visual atual.

Também havia um furo: o hub aberto de `experimental/` lê a pasta pessoal (um nível acima) e montava os links como se as ferramentas estivessem ao lado dele. A Central gerada pelo assistente se chama `gestao_pessoal.html`, que não existe em `experimental/`, e o link quebrava.

Duas formas de ligar foram avaliadas:
- **Embutir o tema em cada HTML** e trocar na hora. Descartada: o visual novo troca 143 cores fixas uma a uma (inclusive em JavaScript), as fontes somam cerca de 120 KB por HTML (o assistente, que embute tudo, dobraria de tamanho) e a camada da ADR-0034 deixaria de ser separada.
- **Alternar entre as pastas**, lembrando a escolha. Escolhida: não muda o tamanho dos HTMLs atuais nem a montagem da experimental.

## Decisão
1. **A troca fica na tela de entrada.** O painel da Remessa (à esquerda, em todas as ferramentas) ganha a caixa **Visual experimental** com o botão **Experimentar o visual novo**; na versão experimental, **Voltar ao visual atual**. No assistente (`inicio.html`), a mesma caixa fica na primeira tela, abaixo de "Ver todas as ferramentas da Remessa".
2. **A escolha fica no navegador** (`localStorage`, chave `remessa-visual`), que é o mesmo para todos os HTMLs abertos pelo arquivo. Abrir uma ferramenta da pasta `experimental/` já conta como escolher o experimental.
3. **Com o experimental escolhido, cada ferramenta do visual atual abre a versão experimental dela** (na mesma aba, antes de pedir a senha). Só quando essa versão já abriu antes neste navegador (lista `remessa-visual-vistas`): assim nunca leva a um arquivo que não existe. Se a pasta `experimental/` sumir, `?visual=atual` no fim do endereço volta ao atual.
4. **O par de cada ferramenta:** o mesmo nome na outra pasta; para as que o assistente gera com outro nome e sem configuração embutida (Central, Hub, Finanças do Grupo, Início), o nome do pacote. A troca lembra de onde veio, então "Voltar" leva ao `gestao_pessoal.html` de onde a pessoa saiu. **Quadro e Finanças do Time gerados para um time não trocam**: levam a configuração do time no próprio HTML e a cópia genérica abriria sem ela.
5. **Hub aberto de `experimental/`:** cada link vai para a versão experimental quando ela existe em `experimental/` da pasta pessoal; senão, para a do visual atual, um nível acima (`../`).
6. **Senha por sessão:** a página que vai trocar de visual não pede a senha ao hub (`window.__remessaTroca`, lido pelo `sessao.js`); quem pede é a versão que abre em seguida.
7. O build põe `<script id="visual">` antes do tema em todos os HTMLs (`modo()` em `tools/build_financas.py`) e troca `EXP` por `true` só na montagem da experimental.

## Consequências
- Quem tem a pasta `experimental/` ao lado dos HTMLs liga o visual novo com um clique e continua abrindo o mesmo `hub.html` de sempre.
- A primeira troca de cada ferramenta é às cegas: se a pasta `experimental/` não estiver ao lado, o navegador mostra "arquivo não encontrado" e basta voltar. Depois disso, as trocas automáticas só acontecem para arquivos que já abriram.
- O assistente experimental gera as ferramentas já no visual novo, com os nomes de sempre, na pasta pessoal. Essas não oferecem a troca (não há par conhecido); para voltar, gere de novo pelo `inicio.html` da pasta principal.
- Nenhum arquivo de dados muda; Central 15.16, Hub 2.4, assistente 2.8.1, Quadro 2.3.3, Finanças do Grupo 1.7.1, do Time 1.5.1 e Mapa de Férias 1.5.1 (só a tela de entrada).

## Ao evoluir
- **Ferramenta nova sem configuração embutida** que o assistente grava com outro nome: inclua o título e o nome do pacote em `PACOTE` de `financas/src/visual.js`.
- **Promover o visual novo a padrão** (ver ADR-0034): tire a caixa de troca e o `visual.js`.
- Teste: `node financas/testes/teste-navegador.js`, seção 5.
- Relacionadas: [0034](0034-visual-experimental.md), [0029](0029-uma-senha-por-sessao.md), [0037](0037-nome-remessa.md).

## Telas
[Tela de entrada, visual atual](../telas/visual-troca-atual.png) · [Tela de entrada, visual experimental](../telas/visual-troca-experimental.png)

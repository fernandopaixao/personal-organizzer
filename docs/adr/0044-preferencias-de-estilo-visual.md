# ADR-0044 · Preferências: escolher o estilo visual (Remessa, Sereno, Clássico ou Experimental)

**Status:** aceita · **Data:** 27/11/2026 · **Origem:** pedido do Fernando ("Dois novos design systems foram adicionados ao repositório. Reveja as telas e os aplique. Nas preferências permita optar por qual estilo visual utilizar"); fonte em `financas/src/tema.js`

## Contexto
A [ADR-0043](0043-estilos-remessa-e-sereno.md) trouxe os dois design systems (Remessa e Sereno) para todas as ferramentas, escolhidos num menu pequeno do botão redondo do canto. Faltavam três coisas: um lugar com cara de **Preferências**, onde a pessoa vê as opções lado a lado; a volta ao **visual de antes** para quem se acostumou com ele; e juntar a escolha do **visual experimental** ([ADR-0034](0034-visual-experimental.md), [ADR-0038](0038-ligar-visual-experimental-na-entrada.md)), que só se ligava pela tela de entrada. A revisão das telas nos dois estilos também achou defeitos: no Remessa, o topo do Quadro ficava com texto branco sobre fundo claro (uma regra de fundo do topo cobria a superfície marinha), e as férias dentro da Central ficavam com a faixa de abas e o fundo brancos sobre a página azulada.

## Decisão
1. **Painel Preferências**, comum a todas as ferramentas e montado pela camada de tema (sem código novo em cada ferramenta):
   - o **botão redondo do canto** passa a abrir o painel (um `<dialog>` com fundo escurecido; fecha no ×, no Esc ou clicando fora);
   - a **Central** ganha o botão **Preferências** no topo, ao lado do olho de privacidade;
   - os **Ajustes** do Quadro, das Finanças do Time e do Grupo, do Mapa de Férias e do Hub mostram o mesmo bloco num card: basta a ferramenta pôr `<div data-preferencias></div>` e a camada preenche (também depois de cada nova renderização).
2. **Formulário em duas colunas** (rótulo e explicação à esquerda, opções à direita; uma coluna só em tela estreita), sem `prompt()`:
   - **Modo:** Claro, Escuro, Automático (como antes, `localStorage['gestao.tema']`);
   - **Estilo visual**, com miniatura de cada um: **Remessa** (padrão), **Sereno**, **Clássico** e **Experimental**.
3. **Clássico** é o visual de antes dos estilos (até a Central 15.19): trilho branco com siglas, fundo neutro e o escuro grafite-azulado original (fundo `#0e121c`, cards `#161b29`). Fica em `localStorage['gestao.estilo'] = 'classico'` e no `<html data-estilo="classico">`.
4. **Experimental** continua sendo outra pasta: escolher abre a mesma ferramenta em `experimental/` (`remessaVisual.trocar()`), e escolher outro estilo estando lá grava o estilo e volta para a versão atual. Nas cópias da pasta `experimental/` o estilo fica `experimental`: nem o trilho marinho do Remessa nem o Sereno passam por cima da identidade experimental, e o escuro é o original. A opção aparece desligada (com o motivo) quando a ferramenta não tem par na pasta experimental, como o Quadro e as Finanças do Time gerados para um time.
5. **Correções da revisão das telas:** topo do Quadro de volta à superfície marinha no Remessa; férias dentro da Central com o mesmo fundo azulado da página no Remessa; no Sereno, trilho neutro (`#f7f7f9`) e post-its com borda em vez de sombra, como pede o design system.

## Consequências
- Tudo continua só neste computador e não toca em arquivo de dados nem em contrato.
- Ferramenta nova ganha o painel de graça (botão do canto); para aparecer também nos Ajustes, um `<div data-preferencias></div>` basta.
- A caixa **Visual experimental** da tela de entrada continua: é o mesmo atalho para quem ainda não entrou.
- Teste: o e2e (§14) abre o painel, troca Modo e Estilo pelos botões, confere o Clássico no claro e no escuro, o botão da Central, o bloco nos Ajustes do Quadro e o topo marinho do Quadro. `ESTILO=classico node financas/testes/teste-e2e.js` roda tudo no Clássico (telas em `financas/testes/saida/classico/`); o `teste-ferias.js` aceita `ESTILO` e `TEMA=escuro` com `TELAS=arquivo.png`.

## Ao evoluir
- Estilo novo: entra em `ESTILOS_OK`, `ESTILO`, `ORDEM_E`, `FIXO` e `NEUTRO` de `tema.js`, com miniatura em `.gt-m-<estilo>`; as regras visuais seguem o padrão dos blocos `${R}` e `${S}`.
- Relacionadas: [0020](0020-principios-de-interface.md), [0027](0027-tema-claro-escuro-compartilhado.md), [0034](0034-visual-experimental.md), [0038](0038-ligar-visual-experimental-na-entrada.md), [0043](0043-estilos-remessa-e-sereno.md).

## Telas
[Preferências](../telas/preferencias-estilo.png) · Central: [Remessa](../telas/estilo-remessa-central-hoje.png), [Sereno](../telas/estilo-sereno-central-hoje.png), [Clássico](../telas/estilo-classico-central-hoje.png) · [Quadro no Remessa](../telas/estilo-remessa-quadro-topo.png)

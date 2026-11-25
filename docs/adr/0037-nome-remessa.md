# ADR-0037 · A solução se chama Remessa: envelopes lacrados numa caixa postal

**Status:** aceita · **Data:** 25/11/2026 · **Origem:** pedido do Fernando ("toda a comunicação se baseia em um paralelo de serviço de envelope e caixa postal... Vamos de Remessa. Altera o favicon, alguns termos na config e nos módulos. O texto quando chegar arquivo de integração (pode chamar de nova remessa); no onboard adicione um parágrafo explicando o porquê")

## Contexto
A solução não tinha nome: cada ferramenta tinha o seu (Central de Gestão, Quadro do Time, Hub da solução, Finanças, Mapa de Férias) e os documentos falavam em "a solução". As abas do navegador não tinham ícone no visual atual; só a versão experimental tinha um ícone por ferramenta.

A forma como as ferramentas conversam já é a de um correio: cada uma põe o que tem a dizer num **envelope cifrado** (`gestao-envelope/1`) com a **chave do time**, que funciona como um lacre, e deixa o envelope na **pasta compartilhada**, que funciona como uma caixa postal. Só quem tem a chave abre; o resto vê envelopes fechados. Cada envelope tem um único remetente ([ADR-0007](0007-um-escritor-por-arquivo.md)).

## Decisão
1. **Nome: Remessa.** É o nome da solução inteira. As ferramentas mantêm os nomes delas (Central de Gestão, Quadro do Time...), e o `<title>` de cada HTML **não muda**, porque o hub reconhece as ferramentas da pasta pelo título.
2. **Marca:** quadrado marinho (`#0b2155`) de cantos arredondados com um envelope branco fechado por um lacre azul (`#4d86ff`) sem letra. É o ícone do hub (a porta de entrada). Cada outra ferramenta mantém o desenho dela (blocos na Central, colunas no Quadro, barras no Finanças do Time, pizza no Finanças do Grupo, sol no Mapa de Férias, seta no Início) com um lacre azul no canto. A primeira versão tinha um lacre vermelho com "R"; o Fernando não gostou e escolheu o lacre azul sem letra (25/11/2026).
3. **Ícone da aba em todas as ferramentas, no main e na experimental:** os SVGs ficam em `financas/src/icones/` e a função `visual()` de `tools/build_financas.py` põe cada um, embutido como `data:` URI, no `<head>` do HTML, inclusive nas cópias embutidas (Central dentro do Início, Quadro dentro da Central, Finanças do Time dentro do Grupo). Nada depende de rede ([ADR-0024](0024-distribuicao-por-zip.md)). A pasta `experimental/src/icones/` deixa de existir ([ADR-0034](0034-visual-experimental.md)).
4. **"Nova remessa"** é o termo para um arquivo de integração que chegou de outra pessoa e ainda não foi aplicado: na Central (aba **Remessas** da Integração, cartão **Dos times**, aviso no menu), no Finanças do Grupo (planos dos times), no Finanças do Time (diretriz do grupo) e no Quadro (catálogo da Central). Os post-its continuam post-its.
5. **Por que o nome:** o Início explica o nome num parágrafo nas boas-vindas, e o mesmo texto (`POR_QUE_REMESSA` em `financas/src/inicio.html`) vai para o LEIA-ME da pasta compartilhada, o LEIA-ME de cada pasta em `para-os-times/` e o cartão "Onde fica cada coisa".

6. **Tela de entrada comum** (`financas/src/marca.js`, injetado pelo build em todas as ferramentas): quando a tela de entrada aparece (o cadeado da Central, a entrada do hub, a tela inicial das outras), o fundo vira o marinho da marca com envelopes em marca-d'água. À esquerda aparece o painel da Remessa, com o nome da ferramenta, a versão e o link **Conheça a Remessa**; a caixa de senha ou de abertura fica à direita. No hub, o texto do cockpit vai para o painel da esquerda. A tela não muda quando a ferramenta está embutida em outra (Férias dentro da Central).
7. **Página de apresentação** (`apresentacao.html`, fonte em `financas/src/apresentacao.html`). Explica a analogia com um desenho, as ferramentas (com ícones e as versões atuais, preenchidos pelo build), quem usa, a segurança e como começar. Vai no .zip, e o assistente a grava na pasta do gestor e na de cada time.

## Consequências
- Ícone novo ou ferramenta nova: desenhe o SVG em `financas/src/icones/<nome>.svg` (32×32, fundo `#0b2155`, um detalhe `#4d86ff` e o lacre azul no canto (círculo `#4d86ff` em 25.5, 25.5, raio 4)) e inclua o título dela em `ICONES` de `tools/build_financas.py`; o build recusa um HTML sem ícone.
- Texto novo que fale de um arquivo que chegou pela pasta usa "remessa" ("nova remessa", "remessas na caixa postal"). Texto que fale de "a solução" para quem usa pode dizer "a Remessa".
- Tela de entrada nova numa ferramenta: use `.welcome` (ou `.lock` com `.lockcard`) para ela ganhar o fundo e o painel da Remessa.
- Ferramenta nova ou versão nova: a apresentação lê as versões no build; inclua a ferramenta em `financas/src/apresentacao.html`.
- O teste de ponta a ponta confere o ícone com o lacre azul em todas as ferramentas, a aba Remessas e o parágrafo do Início.

# ADR-0032 · Identidade visual comum: azul e branco, trilho marinho, fontes embutidas

**Status:** aceita · **Data:** 24/11/2026 · **Origem:** pedido do Fernando ("otimize visualmente: não canse, seja elegante, simples de operar"; depois "mais brilho no azul", "vermelho e amarelo que conversem com o azul", "outras fontes, ficou muito sério"); fonte em `financas/src/identidade.css` e `financas/src/fontes/`

## Contexto
A solução fica aberta o expediente inteiro, ao lado do e-mail e das reuniões, e é usada por líderes de times e líderes de líderes. A empresa usa azul-marinho e branco. Até a v15.4 cada ferramenta tinha um azul vivo próprio (`#223ad2`), fundo quase branco (`#fafafc`), trilho branco, card de destaque com gradiente, vermelho-tijolo e amarelo-mostarda nos sinais, e a fonte Inter (que no Windows da empresa, sem rede, vira Segoe UI). O resultado era claro demais para ficar aberto o dia todo e sério demais.

O sistema visual foi desenhado à parte, como design system "Organizzer" (tokens, componentes e telas de referência), e esta ADR registra como ele entra nas ferramentas.

## Decisão
1. **Paleta** (tema claro), nas proporções 90% neutros · 8% azul · 2% sinais:
   - fundo da página `#f4f7fc` (cinza-azulado, nunca branco puro), cards `#ffffff`, bordas `#e0e6f1`, texto `#121f3d`, texto secundário `#52607e`;
   - azul de destaque `#1e4fc8` (botão primário, item ativo, série principal dos gráficos, card de destaque), hover `#173fa6`;
   - trilho lateral marinho `#0b2155`, com item ativo `#1a3d96`: a âncora da marca;
   - sinais da mesma família fria do azul: **carmim** `#c2334f` só para atraso e erro; **âmbar dourado** `#9a5c00` (texto) e `#d49200` (marca) só para "vence hoje" e meta; **verde-azulado** `#0d7a62` para "no prazo";
   - escuro: fundo `#0a1122`, cards `#101a30`, azul `#2f5fd6` (texto `#8fb0ff`), carmim `#ff8aa1`, âmbar `#ffc65c`, verde `#4fd1ae`, trilho `#081633`.
2. **Fontes:** DM Sans para texto (`--font`) e Plus Jakarta Sans para títulos, números de card e marca (`--title`). Arquivos variáveis, só latim, cerca de 90 KB juntos, licença SIL Open Font License, em `financas/src/fontes/`. Segoe UI continua como reserva.
3. **Uma camada só:** `financas/src/identidade.css`, injetada pelo build como `<style id="identidade">` logo antes do `<script id="tema">` (função `tema()` de `tools/build_financas.py`, usada também por `injetar_seguranca.py`). As fontes entram em base64 no build: nada depende de rede. Como vem depois do estilo da ferramenta, ela vale por cima dele: trilho marinho, card de destaque sólido, variáveis de fonte e as novas `--warn`, `--rail*`.
4. **Cores fixas** do CSS de cada ferramenta foram trocadas uma a uma pelo tom equivalente da paleta nova (azuis, neutros, vermelhos, âmbares, verdes), e o mapa `FIXO` de `tema.js` passou a usar os hex novos como chave. A camada de identidade só usa `var(--...)`, então o tema escuro não precisa convertê-la.
5. **Ícone da aba (favicon):** cada ferramenta tem o seu, no mesmo desenho: quadrado marinho de cantos arredondados com um pictograma branco e um detalhe azul. Central: quatro blocos; Quadro do Time: colunas do kanban; Hub: ponto central ligado a quatro; assistente: seta de início; Finanças do Time: barras; Finanças do Grupo: pizza; Mapa de Férias: sol. Os SVGs ficam em `financas/src/icones/` e o build (função `icone` em `tools/build_financas.py`) põe cada um como `<link rel="icon" id="favicon">` em data URI, escolhido pelo `<title>` do HTML. Sem arquivo à parte e sem rede: funciona aberto do disco, do OneDrive e do .zip.

## Consequências
- Todas as ferramentas, inclusive as cópias embutidas (HTML do time gerado pela Central, finanças do time geradas pelo grupo, tudo que o assistente gera), saem com o mesmo visual e o mesmo ícone de aba, o que ajuda a achar a ferramenta certa entre muitas abas abertas.
- Cada HTML cresce cerca de 120 KB pelas fontes; o `inicio.html`, que embute as outras ferramentas, passa de ~0,7 MB para ~1,7 MB. Continua um arquivo local, aberto sem rede.
- O teste e2e §14 confere os fundos novos (`#f4f7fc` no claro, `#0a1122` no escuro).
- HTMLs exportados (resumo de acordos e de status da Central, cartão "onde fica cada coisa") não levam as fontes embutidas: pedem DM Sans e caem na Segoe UI.

## Ao evoluir
- **Tela nova:** use as variáveis (`var(--bv)`, `var(--card)`, `var(--line)`, `var(--late)`, `var(--warn)`...). Um destaque azul por tela; carmim só para atraso; âmbar só para atenção.
- **Trocar a cor da marca** (se a empresa passar os valores oficiais): mude `--bv`/`--bv-deep` nos `:root` das ferramentas e `--rail*` em `identidade.css`, os equivalentes escuros em `tema.js` (`VARS` e `FIXO`) e rode `python3 tools/injetar_seguranca.py`.
- **Ferramenta nova:** desenhe o ícone em `financas/src/icones/<nome>.svg` (32×32, fundo `#0b2155`, um detalhe `#4d86ff`) e inclua o título dela em `ICONES` no build; sem isso o build para com erro.
- **Trocar a fonte:** ponha o `.woff2` em `financas/src/fontes/`, ajuste o `@font-face` e `--font`/`--title` em `identidade.css` e rode o build.
- Relacionadas: [0017](0017-build-embutir-e-injetar.md) (build e blocos injetados), [0020](0020-principios-de-interface.md) (princípios de interface), [0027](0027-tema-claro-escuro-compartilhado.md) (tema claro/escuro).

## Telas
[Central · Hoje (claro)](../telas/identidade-central-claro.png) · [Central · Hoje (escuro)](../telas/identidade-central-escuro.png) · [Quadro do Time](../telas/identidade-quadro-claro.png) · [Finanças do Time](../telas/identidade-time-claro.png) · [Hub (escuro)](../telas/identidade-hub-escuro.png) · [Ícones das abas](../telas/identidade-icones.png)

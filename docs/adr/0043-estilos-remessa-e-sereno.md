# ADR-0043 · Estilos Remessa e Sereno na camada de tema

**Status:** aceita · **Data:** 27/11/2026 · **Origem:** pedido do Fernando ("olhe a tela de login e recrie as telas a partir dela", depois "faz um segundo tema mais minimalista, com menos estímulo visual" e "implemente os 2"); modelos aprovados no Design System Remessa; fonte em `financas/src/tema.js`

## Contexto
A tela de entrada (`financas/src/marca.js`, [ADR-0037](0037-nome-remessa.md)) já tinha a identidade mais forte da solução: gradiente marinho com padrão de envelopes, painel branco, passos numerados. Lá dentro, as ferramentas voltavam a um branco neutro, com trilho branco de siglas, e o modo escuro era um cinza-grafite sem relação com a marca. Ao mesmo tempo, parte de quem usa prefere telas com menos cor e decoração.

## Decisão
1. **Dois eixos independentes no mesmo seletor** (botão redondo no canto, [ADR-0027](0027-tema-claro-escuro-compartilhado.md)):
   - **Modo:** Claro, Escuro, Automático (como antes, `localStorage['gestao.tema']`);
   - **Estilo:** **Remessa** (padrão) ou **Sereno** (`localStorage['gestao.estilo']`, ausente = Remessa). Fica no `<html data-estilo="...">`, só neste computador, e acompanha as outras ferramentas abertas (evento `storage`).
2. **Remessa** leva o visual da entrada para dentro das ferramentas, só com CSS na camada de tema:
   - trilho lateral (Central e Finanças) com o gradiente marinho e o padrão de envelopes; em telas de 1000px ou mais, fica com 200px e os nomes ao lado dos ícones; item ativo em pílula branca;
   - topo do Hub e do Quadro na mesma superfície marinha; a faixa de saudação do Hub e o indicador de destaque (`.ins.hi`) também;
   - fundo das páginas levemente azulado (`#f4f6fb`);
   - **escuro azul-noite**, derivado do marinho: fundo `#09112c`, cards `#0f1a3e`, bordas `#1f2d5c`, azul de botão `#4a62e6` com texto branco (4,9:1) e azul de texto `#a3b3ff`.
3. **Sereno** tira a decoração e mantém a informação:
   - sem gradiente, sem padrão de envelopes e sem faixas cheias (a faixa do Hub vira um card); sem sombra nos cards; indicador de destaque vira card com contorno azul;
   - um só azul (`#3346c0`) para ação e seleção; cores de estado mais contidas, sempre com texto;
   - fundo branco; a tela de entrada fica clara, com o painel com borda em vez de sombra profunda;
   - **escuro grafite neutro** (`#121316` / `#17181b`), sem tom azulado.
4. **Conversão do escuro por estilo:** os destinos fixos das cores (`FIXO_REMESSA`, `FIXO_SERENO`) e a saturação dos neutros convertidos (`NEUTRO`) dependem do estilo. Trocar de estilo com o escuro ligado restaura as cores originais e converte de novo.
5. **Não vale em ferramenta embutida** (Férias dentro da Central, cópias em iframe): o trilho e o topo marinhos ficam de fora (`.tema-embutido`, `.embutido`).

## Consequências
- Nenhum HTML-fonte muda de estrutura; o diff fica no bloco `<script id="tema">` injetado pelo build, como no [ADR-0027](0027-tema-claro-escuro-compartilhado.md). Ferramenta nova que use `.rail`, `.top`, `.hero` ou `.ins.hi` ganha os dois estilos de graça.
- O zip continua autossuficiente: nenhuma fonte, imagem ou script externo (o padrão de envelopes é um SVG em `data:`).
- O teste e2e verifica o estilo padrão, a troca para Sereno, a persistência, o Sereno escuro e a volta para Remessa com o escuro ligado (§14). `ESTILO=sereno node financas/testes/teste-e2e.js` roda tudo no Sereno (telas em `financas/testes/saida/sereno/`); combina com `TEMA=escuro`.
- O visual experimental ([ADR-0034](0034-visual-experimental.md)) continua à parte e não muda.

## Ao evoluir
- **Tela nova:** use as variáveis (`var(--bg)`, `var(--card)`, `var(--line)`, `var(--bv)`) e as classes comuns. Superfície que deve ser marinha no Remessa e neutra no Sereno: acrescente a regra nos blocos `${R}` e `${S}` de `ESTILOS`, em `tema.js`, não no HTML da ferramenta.
- Mudou `tema.js`? Rode `python3 tools/injetar_seguranca.py` (Python 3.12) e os testes, também com `ESTILO=sereno` e `TEMA=escuro`.
- Os modelos aprovados (1:1, times, todas as telas da Central) ficam no Design System Remessa; mudanças de estrutura de cada tela (faixa da pessoa no 1:1, cards de time) são PRs próprios de cada ferramenta.
- Relacionadas: [0020](0020-principios-de-interface.md), [0027](0027-tema-claro-escuro-compartilhado.md), [0037](0037-nome-remessa.md).

## Telas
Remessa: [Central](../telas/estilo-remessa-central.png) · [Central no escuro](../telas/estilo-remessa-escuro-central.png) · [Quadro](../telas/estilo-remessa-quadro.png) · Sereno: [Central](../telas/estilo-sereno-central.png) · [Hub](../telas/estilo-sereno-hub.png) · [Finanças no escuro](../telas/estilo-sereno-escuro-financas.png)

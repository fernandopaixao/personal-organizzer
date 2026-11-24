# ADR-0027 · Tema claro, escuro e automático numa camada compartilhada

**Status:** aceita · **Data:** 24/11/2026 · **Origem:** pedido do Fernando ("Adiciona modo escuro na interface"); fonte em `financas/src/tema.js`

## Contexto
Todas as ferramentas (hub, assistente, Central, Quadro do Time, Finanças do Grupo e do Time, Mapa de Férias) usam a mesma identidade branco e azul, mas cada uma tem o próprio CSS, centenas de cores fixas (`#fff`, `#eceef4`...) e estilos inline e gráficos SVG montados pelo JavaScript. Reescrever o CSS de cada HTML para o escuro mexeria em arquivos que outras frentes estão mudando ao mesmo tempo, e qualquer tela nova teria de lembrar do escuro.

## Decisão
1. **Uma camada só**, `financas/src/tema.js`, injetada no `<head>` de cada HTML como `<script id="tema">` pelos scripts de build (`build_financas.py` para hub, assistente e finanças; `injetar_seguranca.py` para Central e Quadro). Nenhum HTML-fonte precisa de marcador; quem usa `nucleo()` no build ganha o tema de graça (inclusive ferramentas novas).
2. **Três escolhas:** Claro, Escuro e Automático (segue o sistema, `prefers-color-scheme`). Padrão: Automático. A escolha fica só neste computador, em `localStorage['gestao.tema']`, e vale para todas as ferramentas abertas (evento `storage`). Não vai para nenhum arquivo de dados nem para a pasta comum.
3. **Seletor** num botão redondo no canto inferior direito, com menu Claro / Escuro / Automático. Some na impressão.
4. **Como o escuro é aplicado:**
   - as variáveis da identidade (`--bv`, `--ink`, `--muted`, `--line`, `--bg`, `--card`, `--late`, `--ok`...) ganham a paleta escura em `:root[data-tema="escuro"]`;
   - as cores fixas das folhas de estilo, dos estilos inline e dos atributos `fill`/`stroke` do SVG são **convertidas no lugar, por papel**: fundo claro vira superfície azul-noite, texto escuro vira texto claro, borda clara vira borda escura, tons suaves (azul, vermelho, âmbar, verde) viram o mesmo tom escuro; cores cheias (botões, barras, destaques) ficam;
   - texto em `var(--bv)` passa a usar a variante clara `--bv-t`, legível sobre o fundo escuro, sem mudar o azul dos botões;
   - um `MutationObserver` converte o que a tela desenhar depois; voltar para o claro restaura os valores originais.
5. **Paleta escura** no mesmo estilo do claro: fundo `#0e121c`, cards `#161b29`, bordas `#262d40`, texto `#e6e9f2`, azul BV `#5066ec` (texto `#8d9cf9`), vermelho `#ec7d74`, verde `#5cc292`. *Atualizada pela [ADR-0028](0028-identidade-visual-comum.md): fundo `#0a1122`, cards `#101a30`, azul `#2f5fd6` (texto `#8fb0ff`), carmim `#ff8aa1`, verde-azulado `#4fd1ae`.*

## Consequências
- O zip continua autossuficiente: o tema vai dentro de cada HTML, inclusive nas cópias embutidas (HTML do time gerado pela Central, finanças do time geradas pelo grupo, tudo que o assistente gera).
- Os HTMLs-fonte não mudam; o diff fica nos HTMLs montados, num bloco no `<head>`.
- O teste e2e verifica o seletor em todas as ferramentas, a troca e a restauração (§14), e roda inteiro no escuro com `TEMA=escuro node financas/testes/teste-e2e.js` (telas em `financas/testes/saida/escuro/`).

## Ao evoluir
- **Tela nova:** use as variáveis (`var(--card)`, `var(--line)`, `var(--ink)`...) em vez de cores fixas; a conversão automática cobre o resto, mas a variável é sempre mais previsível.
- Branco sólido sobre fundo colorido (ex.: marcador dentro do card azul) vira superfície escura; quando isso estiver errado, acrescente uma regra `:root[data-tema="escuro"] ...` no `CSS` de `tema.js`, não no HTML da ferramenta.
- Mudou `tema.js`? Rode `python3 tools/injetar_seguranca.py` (reinjeta em todos os HTMLs e remonta as cópias embutidas).
- Relacionadas: [0017](0017-build-embutir-e-injetar.md) (build e blocos injetados), [0020](0020-principios-de-interface.md) (princípios de interface).

## Telas
[Central · Hoje](../telas/tema-escuro-central-home.png) · [Central · Iniciativas](../telas/tema-escuro-central-road.png) · [Quadro com post-its](../telas/tema-escuro-quadro-postits.png) · [Hub](../telas/tema-escuro-hub.png) · [Finanças do Time](../telas/tema-escuro-financas-time.png) · [Seletor](../telas/tema-escuro-seletor.png) · [Central no claro, sem mudança](../telas/tema-claro-central-home.png)

# ADR-0034 · Visual novo como versão experimental, montada do main

**Status:** aceita · **Data:** 25/11/2026 · **Origem:** pedido do Fernando ("faça um merge da branch que tem outro modelo visual... crie uma pasta chamada experimental, coloque essa nova versão de interface lá... verifique se tem as mesmas funcionalidades do main"); visual desenhado na branch `claude/awesome-ride-0ctbfp` (design system "Organizzer"); fonte em `experimental/src/` e `tools/build_experimental.py`

## Contexto
Em 24/11/2026 foi desenhada uma identidade visual nova para todas as ferramentas: azul `#1e4fc8` com trilho lateral marinho `#0b2155`, fundo cinza-azulado `#f4f7fc`, sinais em carmim, âmbar e verde-azulado da mesma família, fontes DM Sans (texto) e Plus Jakarta Sans (títulos) embutidas, e um ícone de aba próprio para cada ferramenta. Ela ficou numa branch à parte enquanto o main seguia: entraram os contratos (ADR-0032) e as férias dentro da Central (ADR-0033).

O Fernando quer levar o visual novo para a empresa **ao lado** das versões atuais, para experimentar, sem trocar o que os times já usam, e com as mesmas funcionalidades do main.

Na comparação (merge do main na branch do visual, 25/11/2026), a branch não tinha nenhuma funcionalidade a mais nem a menos: todas as mudanças eram cores fixas trocadas uma a uma, variáveis de fonte, a paleta escura do `tema.js`, uma folha de identidade (`identidade.css`) e o ícone da aba. Os testes do main passam inteiros na versão com o visual novo.

## Decisão
1. **O visual novo vira uma camada, não uma cópia.** Em `experimental/src/` ficam só o que é do visual: `identidade.css` (trilho marinho, card de destaque sólido, fontes, selo "Visual experimental"), `fontes/` (DM Sans e Plus Jakarta Sans, variáveis, só latim, SIL Open Font License), `icones/` (um SVG por ferramenta) e `trocas.json` (pares de cor antiga → nova e trocas de fonte).
2. **Montada sempre do main.** `python3 tools/build_experimental.py` copia o repositório para uma pasta temporária, aplica `trocas.json` na Central, no Quadro e em `financas/src/`, põe a identidade, as fontes e os ícones em `financas/src/` da cópia e roda o build de sempre (`tools/injetar_seguranca.py`). A função `visual()` de `tools/build_financas.py` só injeta `<style id="identidade">` e o ícone da aba quando esses arquivos existem; no repositório eles não existem, então as versões atuais não mudam.
3. **Mesmas funcionalidades por construção.** Toda funcionalidade que entra no main entra na experimental no próximo pacote, inclusive as cópias embutidas (HTML do time gerado pela Central, finanças do time geradas pelo grupo, tudo o que o assistente gera). A CI roda `build_experimental.py --testar`: os testes de ponta a ponta, do Mapa de Férias e do aviso sem pastas rodam na versão experimental, com os fundos esperados do visual novo.
4. **No pacote, uma pasta `experimental/`.** `tools/empacotar.py` monta a versão experimental na hora e põe os 6 HTMLs em `experimental/` (hub, assistente, Central com a página Férias, Quadro, Finanças do Grupo e do Time; sem `ferias.html` desde a [ADR-0036](0036-ferias-so-o-gestor-cadastra.md)). Os HTMLs gerados não entram no repositório: nada de arquivo montado a mais para dar conflito entre PRs.
5. **Mesmos dados.** A versão experimental lê e grava os mesmos arquivos, com as mesmas senhas e chaves. Dá para alternar entre as duas a qualquer momento; o tema (claro, escuro ou automático) é o mesmo.

## Consequências
- Quem quiser experimentar abre `experimental/hub.html` (ou `experimental/inicio.html`) e volta quando quiser para o `hub.html` da pasta principal.
- Os HTMLs experimentais são maiores (cerca de 120 KB a mais cada, pelas fontes; o assistente com tudo embutido passa de 2 MB). Continuam arquivos locais, sem rede.
- O build da CI ganha cerca de 2 minutos (os testes rodam duas vezes: atual e experimental).
- Uma cor fixa nova criada no main entra na experimental com o tom antigo até alguém pôr o par em `trocas.json`. Variáveis (`var(--bv)`, `var(--card)`...) já mudam sozinhas.
- Os HTMLs exportados (resumos da Central, cartão "onde fica cada coisa") não levam as fontes embutidas: pedem DM Sans e caem na Segoe UI.

## Ao evoluir
- **Tela nova:** use variáveis de cor; assim ela fica certa no atual, no experimental e no escuro.
- **Cor fixa nova** que deve mudar no experimental: inclua o par em `experimental/src/trocas.json` (`cores`).
- **Ferramenta nova:** desenhe o ícone em `experimental/src/icones/<nome>.svg` (32×32, fundo `#0b2155`, um detalhe `#4d86ff`) e inclua o título dela em `ICONES` de `tools/build_financas.py`; sem isso o build experimental para com erro. Inclua o HTML em `saidas()` de `tools/build_experimental.py`.
- **Promover o visual novo a padrão:** aplique as trocas nas fontes do repositório (é o mesmo `build_experimental.py`, gravando por cima), mova `identidade.css`, `fontes/` e `icones/` para `financas/src/`, ajuste os fundos esperados no teste §14 e apague `experimental/`. Registre numa ADR que substitui esta.
- Relacionadas: [0017](0017-build-embutir-e-injetar.md) (build e blocos injetados), [0020](0020-principios-de-interface.md) (princípios de interface), [0024](0024-distribuicao-por-zip.md) (pacote .zip), [0027](0027-tema-claro-escuro-compartilhado.md) (tema claro/escuro).

## Telas
[Central · Times](../telas/experimental-central-times.png) · [Central · Integração do time](../telas/experimental-central-integracao.png) · [Hub](../telas/experimental-hub.png) · [Quadro do Time](../telas/experimental-quadro.png) · [Finanças do Time](../telas/experimental-time.png)

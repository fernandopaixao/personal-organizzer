# ADR-0020 · Princípios de interface comuns

**Status:** aceita · **Data:** 06/11/2026 (v12), consolidada em 23/11/2026 (plano de interface, v15) · **Origem:** `interface/plano-interface.md` §2

## Decisão
1. **Um destaque só:** azul `#223ad2` para ação e seleção; vermelho só para atraso/bloqueio; âmbar só para atenção. Fundo branco, cartões com borda fina.
2. **Cada informação tem um dono:** uma tela edita e mostra o dado inteiro; as outras mostram resumo com "abrir".
3. **Criar em modal, ver em painel lateral.**
4. **Formulário mínimo:** essencial primeiro, "Mais detalhes" recolhido, pílulas no lugar de listas curtas, validação no campo, botão com verbo.
5. **Teclado em tudo:** Ctrl+Enter salva, Esc fecha, setas navegam, teclas 1 a 8 trocam de página.
6. **Estados vazios que ensinam.**
7. **Diagramas antes de texto:** anéis, barras feito × prazo, trilhas de fases, faixa de pulso.
8. **Menos navegação:** juntar telas que mostram o mesmo dado (a v15 reorganizou a Central em 8 páginas sem telas duplicadas).

## Ao evoluir
- Pedido do Fernando de 24/11/2026 reforça: telas minimalistas, mais gráficos do que texto, cores neutras (branco e azul), cards que ajudam a interpretar, menos navegações.
- Aplicado nas Finanças 1.2: telas irmãs viram **abas no topo** (menu do Time de 7 para 4, do Grupo de 5 para 3); **cards de leitura** (número, medidor e uma frase que interpreta, card principal em azul cheio); gráficos no lugar de tabelas; só tons de azul nos gráficos, vermelho só para estouro.
- **Modo escuro** (24/11/2026): mesma identidade em azul-noite, por uma camada comum ([ADR-0026](0026-tema-claro-escuro-compartilhado.md)). Use variáveis de cor em telas novas.
- As peças ficam em `financas/src/nucleo.js` e `nucleo.css` (`cardLeitura`, `barrasH`, `curvaAcumulada`). Tela nova deve reaproveitá-las antes de criar componente próprio.

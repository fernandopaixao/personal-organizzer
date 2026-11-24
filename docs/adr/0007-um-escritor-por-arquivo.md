# ADR-0007 · Um escritor por arquivo, retrato completo e revisão monotônica

**Status:** aceita · **Data:** 15/11/2026 (um escritor por arquivo na integração); 23/11/2026 (núcleo de sincronização, Quadro com um arquivo por pessoa, D3) · **Origem:** `docs/plano-financas.md` §6

## Contexto
O OneDrive não tem trava. Se dois computadores gravam o mesmo arquivo antes de sincronizar, ele guarda os dois e renomeia um (`plano-NOTEBOOK01.json`, `plano (1).json`). Até o Quadro 2.0, várias pessoas gravavam o mesmo arquivo do time.

## Decisão
Todo arquivo comum segue as mesmas regras, implementadas uma vez no núcleo (`financas/src/nucleo.js`, função `publicarUnico`):

1. **Um único dono por arquivo**, gravado no cabeçalho (`writer`). Quando a mesma pessoa usa dois computadores, o dono é **pessoa + computador** (`ana-k3f9a`). A ferramenta se recusa a gravar arquivo de outro dono (existe "assumir" explícito, com revisão = maior + 1).
2. **Retrato completo, não diff.** Cada publicação contém tudo daquele escritor; remover é publicar sem o item.
3. **Escrita atômica** (`createWritable()`), seguida de releitura e decifragem para conferir.
4. **Revisão monotônica** (`revision`, `generatedAt`): quem lê descarta revisão menor que a última lida.
5. **Confere antes de gravar** (compare-and-swap otimista): relê, une se mudou, grava `max(revisões) + 1`.
6. **Detecção de cópias de conflito**: ao ler, procura `nome-*.json` e `nome (n).json`, fica com a maior revisão, avisa e limpa as cópias que pode reescrever.
7. **Gravação espaçada** (no máximo a cada ~10 s e ao fechar a aba).
8. **Último retrato válido em cache**: arquivo truncado ou inválido não decifra (GCM) e é ignorado.

Consequência direta: o Quadro do Time grava `times/<time>/quadro/<pessoa>-<computador>.json` e monta o quadro unindo os arquivos de todos, campo a campo, pela alteração mais recente. Post-its seguem o mesmo padrão (um arquivo por autor; recibos "Vi" um arquivo por leitor).

## Consequências
- **A favor:** conflito do OneDrive vira caso raro e, quando acontece, é resolvido sem perder dados; um arquivo com problema nunca derruba quem lê.
- **Contra:** mais arquivos na pasta; quem lê precisa unir vários arquivos; os nomes `<pessoa>-<computador>` ficam visíveis.

## Ao evoluir
- Arquivo comum novo: **sempre** um dono por arquivo e publicação pelo `publicarUnico`. Se várias pessoas precisam contribuir, cada uma tem o próprio arquivo e o leitor une (precedentes: Quadro, post-its, recibos "Vi").
- Teste os cenários de conflito no `teste-e2e.js` (cópia `(1)`, cópia `-COMPUTADOR`, revisão antiga reaparecendo, arquivo truncado).

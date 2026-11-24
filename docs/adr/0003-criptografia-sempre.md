# ADR-0003 · Criptografia sempre, senha sem recuperação

**Status:** aceita · **Data:** v11; PBKDF2 600 mil na v12 (06/11/2026); senha obrigatória em todas as ferramentas em 23/11/2026 (PR #10) · **Origem:** Central v12, plano de finanças

## Contexto
Os arquivos guardam notas de 1:1, feedbacks, planos financeiros e status de times. Eles circulam por pastas sincronizadas e podem ser copiados. O Quadro do Time tinha senha opcional até a versão 2.0.

## Decisão
- **Todo arquivo com dados é cifrado**, sem exceção. Arquivos locais usam AES-GCM 256 com chave derivada da senha por PBKDF2-SHA256 com **600 mil iterações** (`gestao-local-cifrado/1`). Arquivos da pasta comum usam chaves aleatórias por time ([ADR-0005](0005-chave-aleatoria-por-time.md)).
- A chave derivada fica **só na memória** enquanto a ferramenta está aberta; cada gravação usa um IV novo.
- **Não existe recuperação de senha** nem opção "lembrar senha". Senha ou chave nunca são gravadas em arquivo.
- Em todo HTML que cria senha, gera chave ou gera outro HTML aparece o **aviso de cofre** com a caixa obrigatória "Já guardei no cofre" (registrada com data no arquivo cifrado).
- **Lembrete de teste da senha** 30 dias depois da criação e depois a cada 90 dias, como faixa discreta no topo.
- Ficam em claro só arquivos sem dados: `LEIA-ME.md`, `contrato/`, `onde-fica-cada-coisa.html`.

## Consequências
- **A favor:** um arquivo copiado ou vazado não revela nada; o paradigma é igual em todas as ferramentas.
- **Contra:** senha perdida significa dado perdido. Mitigado pelo cofre, pelo lembrete e pelo backup cifrado rotativo.

## Ao evoluir
- Use o bloco comum (`financas/src/seguranca.js` e `nucleo.js`) para cifrar, pedir senha e mostrar o aviso de cofre. Não implemente cripto nova por ferramenta.
- Nenhum arquivo novo com dados pode nascer em claro, nem "temporariamente".

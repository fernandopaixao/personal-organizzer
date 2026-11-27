# ADR-0045 · Quadro do time na pasta compartilhada, cifrado com a chave do time

**Status:** aceita · **Data:** 27/11/2026 · **Origem:** pedido do Fernando ("cifra o arquivo do quadro do time pela chave de integração com a Central e permite, no formato da pasta de compartilhamento, a criação do arquivo que sirva para o quadro do time"); entre as duas opções apresentadas, ele escolheu "base da Central + um arquivo por pessoa" · revê em parte a [ADR-0003](0003-criptografia-sempre.md) e a [ADR-0029](0029-uma-senha-por-sessao.md) para o Quadro · mantém a [ADR-0005](0005-chave-aleatoria-por-time.md), a [ADR-0007](0007-um-escritor-por-arquivo.md) e a [ADR-0011](0011-migracao-aditiva-versionada.md) · **Fonte:** `financas/src/quadro-f4.js` (bloco "Quadro 2.9"), `gestao_pessoal_v15.html` (`igCriarQuadro`), `financas/src/inicio.html` (`criarBaseQuadro`), `contratos/schemas/quadro-contrib-1.schema.json`

## Contexto
O Quadro é usado pelo time inteiro. Até a 2.8, cada pessoa tinha um arquivo de dados só dela, cifrado com uma senha pessoal (obrigatória desde a 2.1), e publicava uma cópia em `times/<time>/quadro/<pessoa>-<computador>.json`, cifrada com a chave de integração do time. Quem abria unia os arquivos de todos. Na prática, cada pessoa precisava criar e guardar uma senha só para um quadro que já é do time, e o time não tinha "um quadro" para abrir: cada um criava o seu e só depois as cópias se encontravam.

A pergunta do Fernando foi se compartilhar o quadro significa compartilhar uma senha. Não deve: o segredo comum do time já existe, é a chave aleatória de integração (ADR-0005), que o gestor gera na Central e entrega por mensagem direta.

## Opções
1. **Um único arquivo para todos** (`times/<time>/quadro-<time>.json`). Fácil de entender, mas várias pessoas gravando o mesmo arquivo no OneDrive gera cópias de conflito e perde mudanças quando duas pessoas editam ao mesmo tempo. Fere a ADR-0007.
2. **Base criada pela Central + um arquivo por pessoa** (escolhida). A Central (ou o assistente) cria a base do quadro; cada pessoa grava só o próprio arquivo ao lado dela; o Quadro une tudo, como já fazia desde a 2.1.

## Decisão
1. **A pasta `times/<time>/quadro/` é o quadro do time.** Tudo lá é `gestao-envelope/1` com a chave de tarefas (integração) do time, conteúdo `quadro-contrib/1` (agora com schema em `contratos/`).
2. **Base do quadro: `quadro-do-time.json`.** Só a Central (botão **Criar o quadro do time na pasta**, no cartão da chave do time) ou o assistente Início ("Estou com sorte" e o caminho normal do gestor, quando a pasta compartilhada está ligada) gravam esse arquivo, com `writer` `central~gestor`. Ela leva o nome do time, as colunas padrão e as pessoas do time. Todas as datas de alteração (`upd`) da base são **1**: ela só semeia e nunca vence o que o time mudou depois. Recriar a base é seguro (o que o time fez continua) e só acrescenta quem faltava. O assistente não sobrescreve uma base que já existe.
3. **No Quadro 2.9, o arquivo da pessoa na pasta do time é o próprio arquivo de dados dela.** **Abrir o quadro do time na pasta compartilhada** (primeira opção das boas-vindas) cadastra a chave se faltar, liga a pasta, lê a base e os arquivos de todos, pergunta "Quem é você neste quadro?" e passa a gravar `<pessoa>-<computador>.json` com a chave do time. **Sem senha pessoal**: quem tem a chave do time no navegador abre. Ninguém grava o arquivo de outra pessoa nem a base (ADR-0007). Se alguém abrir a base ou o arquivo de outra pessoa, o Quadro passa a gravar no próprio.
4. **Qual chave cifra:** a mais nova do time no navegador (kid `<time>-…`, nunca a de finanças); quando o gestor troca a chave e a pessoa cadastra a nova, o salvamento seguinte já usa a nova. O envelope leva `writer` em claro, como os demais arquivos de dono único.
5. **Compatibilidade (ADR-0011):** arquivos com senha pessoal (`quadro-time-cifrado/1`) e o antigo `quadro-<slug>.json` abrem como antes. Em **Ajustes › Arquivo de dados**, **Passar para a pasta do time** une o quadro pessoal aos arquivos do time e passa a gravar na pasta; o arquivo antigo fica como estava, como cópia. Quadros 2.1 a 2.8 que ainda estejam em uso leem a base como mais um arquivo de pessoa e unem normalmente (a base traz `settings` completo com `upd` 1, então não troca as colunas de ninguém).
6. **Contratos 1.3 (aditivo):** schema `quadro-contrib-1.schema.json`, exemplo `times/pagamentos/quadro/quadro-do-time.json`, regras no validador (base só com `writer` `central~gestor` e `upd` 1; `db.team.slug` igual a `source.team`). O formato continua interno do Quadro: outras soluções não escrevem nesta pasta.

## Consequências
- O time abre **um** quadro, pronto, com nome e pessoas, e não cria senha para ele. O HTML do time com a chave embutida passa a ser o único segredo a entregar (já era tratado como senha, ADR-0031).
- Quem tem a chave do time lê o quadro inteiro. Era assim desde a 2.1 (as cópias de cada pessoa já usavam a chave do time); a diferença é que agora não existe mais uma cópia com senha pessoal. Chave vazou: **Vazou: trocar chave** na Central, como para o resto da integração (ADR-0005).
- Sem arquivo local, o backup é a própria pasta sincronizada; **Baixar cópia cifrada** continua nos Ajustes.
- A chave fica no navegador (CryptoKey não exportável). Navegador limpo pede a chave de novo: ela está no cofre e no HTML do time.

## Ao evoluir
- Botão **Trocar chave do time** dentro do Quadro (recifrar o próprio arquivo com a chave nova sem esperar o próximo salvamento) fica como evolução, se o Fernando pedir.
- Campo novo no quadro entra com `upd` e passa pela união item a item (`mergeDb`); a base sempre com `upd` 1.

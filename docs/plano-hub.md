# Hub da solução e post-its para os times

*24/11/2026 · Hub 1.1.0 e Quadro do Time 2.2.0*

## 1. O que é

O **Hub da solução** (`hub.html`) é a tela inicial do dia a dia. Ele faz duas coisas:

1. **Leva às outras ferramentas.** Lista os HTMLs que estão na pasta local (Central, Finanças do Grupo, Quadros e Finanças de cada time, assistente, cartão "Onde fica cada coisa") e abre cada um numa aba nova. Também mostra, por time, quando o Quadro, o status, as métricas e o plano financeiro foram atualizados na pasta sincronizada.
2. **Deixa post-its para os times.** Recados curtos, com cor, destinatário opcional e prazo, que aparecem no topo do Quadro do Time. Quem lê clica em **Vi**, e o hub mostra "visto por …".

### Voltar ao hub

Central, Quadro do Time e Finanças do Grupo e do Time têm o botão **← Hub** no topo (ao lado de "Onde estou?"). O hub dá à própria aba o nome `gestao-hub` e abre as ferramentas no mesmo grupo de abas, então o botão só traz a aba do hub de volta para a frente, sem recarregar nem pedir a senha de novo. Se o hub não estiver aberto, o botão abre o `hub.html` da mesma pasta.

## 2. Por que um hub novo e não o `inicio.html`

| | `inicio.html` (assistente) | `hub.html` (hub) |
|---|---|---|
| Quando se usa | Uma vez, para montar a solução ou trocar de computador | Todo dia, como tela inicial |
| Tamanho | ~600 KB: leva as quatro ferramentas embutidas para gerá-las | ~85 KB: não embute nada |
| Dados | Não tem arquivo próprio; cria o primeiro arquivo de cada ferramenta | Tem o próprio arquivo cifrado (times, chaves e seus post-its) |

Juntar os dois deixaria a tela do dia a dia pesada e misturaria "gerar ferramentas" com "usar". O assistente agora **também gera o hub** (`hub.html` e `hub-<nome>.json`, com os times já cadastrados), e o hub mostra o assistente na lista de ferramentas quando ele está na pasta.

**Desacoplamento mantido:** o hub nunca abre nem lê o arquivo de dados de outra ferramenta. Ele só cria links relativos para os HTMLs ao lado dele. A única leitura de outra ferramenta é opcional e só leitura: **Importar times e chaves da Central** lê o arquivo da Central com a senha dela, copia os times (com pasta definida) e as chaves ativas, e não altera nada.

## 3. Onde fica cada coisa

| Arquivo | Onde | Quem escreve | Cifrado com |
|---|---|---|---|
| `hub.html` | Pasta local, **ao lado das outras ferramentas** (os links são relativos) | — | — (HTML não guarda dados) |
| `hub-<nome>.json` | Pasta local, fora do OneDrive | O hub | Sua senha (`gestao-local-cifrado/1`, PBKDF2 600 mil) |
| `times/<time>/postits/<pessoa>-<computador>.json` | Pasta sincronizada pelo OneDrive | Só o autor, daquele computador | Chave de tarefas do time (`gestao-envelope/1`, conteúdo `gestao-postits/1`) |
| `times/<time>/postits/vistos/<pessoa>-<computador>.json` | Pasta sincronizada | Só aquela pessoa, pelo Quadro | Chave do time (conteúdo `gestao-postits-vistos/1`) |

O dado individual (lista de times, chaves, rascunhos e histórico dos seus post-its) fica local. Na pasta sincronizada vai só o pedaço comum: os post-its ativos de cada autor para cada time.

## 4. Regras de sincronização (as mesmas de `plano-financas.md`, seção 6)

- **Um arquivo por autor e computador.** O hub grava só `postits/<você>-<computador>.json`; o Quadro grava só `postits/vistos/<você>-<computador>.json`. Ninguém grava o arquivo de outra pessoa, então o OneDrive não tem o que juntar.
- **Retrato completo, não diff.** Cada publicação leva todos os post-its ativos daquele autor para aquele time. Remover é publicar sem ele. Perder uma versão intermediária não quebra nada.
- **Revisão monotônica e gravação conferida.** O hub usa `publicarUnico` do núcleo: relê o arquivo e as cópias, grava `max(revisões) + 1` com escrita atômica e relê para conferir.
- **Cópias de conflito do OneDrive** (`fernando-k3f9a-NOTEBOOK01.json`, `… (1).json`): quem lê fica com a maior revisão de cada autor; o hub apaga as cópias do próprio arquivo na publicação seguinte.
- **Gravação espaçada:** o hub publica alguns segundos depois da última mudança, não a cada tecla. O Quadro lê os post-its a cada 30 s, ao voltar para a aba e junto com a sincronização do quadro.
- **Um time não vê o post-it do outro.** Ao mandar o mesmo recado para vários times, o hub grava uma cópia em cada pasta, cifrada com a chave de cada time.
- **Post-it vencido** (data "mostrar até" no passado) não é publicado e o Quadro ignora.

## 5. Chaves e avisos de cofre

- O hub usa a **chave de tarefas** do time, a mesma que o Quadro já tem (`GK1.<time>-AAMM.…`). Não existe chave nova.
- Ao colar uma chave, o hub mostra o aviso de cofre ("guarde no cofre, envie só por mensagem direta, nunca na pasta compartilhada").
- Ao criar o arquivo do hub, a senha passa pelo aviso de cofre e pelo lembrete de teste (30 dias, depois a cada 90), como nas outras ferramentas.
- Ao importar da Central, o hub lembra que as chaves agora também ficam dentro do arquivo dele, protegidas pela sua senha.

## 6. Quadro do Time 2.2

- Faixa **Post-its para o time** no topo do quadro, com os post-its novos e o número de não vistos. "Ver os já vistos" mostra os demais.
- Botão **Vi** em cada post-it: marca neste navegador e grava o recibo da pessoa em `postits/vistos/`. Se o Quadro ainda não sabe quem é a pessoa, pergunta uma vez (o mesmo "Quem é você neste quadro?" do arquivo por pessoa).
- "Onde estou?" passa a citar os post-its.
- Código em `financas/src/quadro-postits.js`, injetado como `<script id="f5postits">` por `python3 tools/injetar_seguranca.py` (que também reembute o Quadro na Central e remonta o assistente).

## 7. Contratos novos

Em `financas/contrato/`: `gestao-postits-1.schema.json` e `gestao-postits-vistos-1.schema.json`. Os dois vão dentro de `gestao-envelope/1`, com `writer` em claro no cabeçalho conferido contra `source.writer` depois de decifrar. Os contratos da integração (`gestao-status/1`, `gestao-metricas/1`, `gestao-catalogo/1`) não mudaram. Uma ferramenta de time adaptada (caminho B do guia) pode exibir post-its lendo `times/<time>/postits/*.json` com a mesma chave.

## 8. Como testar

`node financas/testes/teste-e2e.js` (seção 9, 73 verificações no total): hub abre o arquivo criado pelo assistente, acha as ferramentas da pasta, recusa chave inválida, importa times e chaves da Central (ignora chave revogada e time sem pasta), publica um post-it para dois times, o Quadro de duas pessoas recebe, o recibo de "Vi" volta ao hub, cópia de conflito é apagada com revisão subindo, post-it vencido não chega e post-it removido some do Quadro.

## 9. Limites assumidos

- **Links relativos:** o hub precisa estar na mesma pasta dos HTMLs. Se não estiver, ele avisa. Ele também avisa se estiver numa pasta do OneDrive.
- **Atraso do OneDrive:** um post-it leva o tempo da sincronização (normalmente segundos, às vezes minutos) para chegar.
- **Metadados visíveis:** quem tem acesso à pasta vê os nomes dos arquivos (`fernando-k3f9a.json`) e quando mudaram, mas não o conteúdo.
- **Times com ferramenta própria** (caminho B) só veem post-its se adaptarem a leitura; o contrato está em `financas/contrato/`.

## 10. Hub 1.2 (24/11/2026): finanças dos times e importação do Finanças do Grupo

- **Importar do Finanças do Grupo:** o hub abre o arquivo do Finanças do Grupo com a senha dele, só para ler, e traz os times e as chaves de finanças ativas para `times[].chavesFin`. A chave de finanças também pode ser colada em Ajustes de cada time.
- **Plano de cada time:** com a chave de finanças, o hub lê `times/<time>/financas/plano.json` (`gestao-financas-plano/1`, com `totalsByYear`) pelo mesmo `lerEnvelopes` das outras ferramentas e mostra previsto, realizado e orçado no card do time.
- **Visão dos times:** cards de leitura (previsto dos times, realizado com a marca do mês, times ativos na semana, post-its vistos) e barras do previsto por time com a marca do orçado. O ano é o corrente; se nenhum time publicou o ano corrente, o hub usa o ano base mais recente publicado.
- Nada muda nas regras: o hub continua só lendo arquivos dos times, e as chaves ficam só dentro do arquivo cifrado do hub.

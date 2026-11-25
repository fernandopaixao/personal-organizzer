# Guia para os times · Quadro do Time e adaptação das ferramentas atuais

*15/11/2026, revisto em 25/11/2026 (Quadro do Time 2.3, Remessa) · para os times e para os agentes de desenvolvimento deles*

> **Para quem é:** cada time que acompanha iniciativas em nível de card e precisa enviar backlog e métricas para a Central de Gestão do gestor.
> **O que este guia resolve:** escolher entre (A) **usar o Quadro do Time** (`quadro_do_time_v1.html`, pronto) ou (B) **adaptar a ferramenta HTML que o time já tem**, seguindo a mesma arquitetura.
> **Referência formal:** a pasta [`contratos/`](../contratos/LEIA-ME.md) (schemas, criptografia com vetores de teste, exemplos cifrados e o validador `node contratos/validar.js`) e o guia [`contratos/05-como-integrar.md`](../contratos/05-como-integrar.md), com o checklist de conformidade. Este guia não muda nenhum contrato; quando houver dúvida, os schemas e a pasta `contratos/` valem. (O antigo "pacote 03", `integracao-time/03-pacote-para-agentes-do-time.md`, ficou como histórico na pasta do projeto do gestor; tudo o que ele trazia está em `contratos/`.)
> **Remessa:** a solução se chama Remessa. Cada arquivo que o time grava é um envelope lacrado com a chave do time, deixado na caixa postal (a pasta compartilhada); o que chega de outra pessoa aparece como **nova remessa**.

---

## 1. A arquitetura em uma página

```
Gestao-Compartilhado/                      (pasta do SharePoint, sincronizada pelo OneDrive; administrada pelo gestor)
  central/catalogo-<slug>.json             ← a Central escreve; o time só LÊ   (cifrado com a chave do time)
  times/<slug>/status.json                 ← o time escreve: backlog            (cifrado; a Central e o hub leem)
  times/<slug>/metricas.json               ← o time escreve: métricas do time   (cifrado; a Central e o hub leem)
  times/<slug>/quadro/<pessoa>-<pc>.json   ← cada pessoa do Quadro grava o seu  (só o Quadro lê)
  times/<slug>/postits/…                   ← post-its do gestor e recibos "Vi"  (seção 3.3)
```

O nome antigo `Gestao-Integracao` continua aceito. Em cada computador, marque a pasta como **Sempre manter neste dispositivo** (botão direito na pasta, no Explorador de Arquivos ou no Finder): sem isso, os arquivos dos outros ficam só na nuvem e a ferramenta não os lê. O layout completo está em [`contratos/01-arquitetura.md`](../contratos/01-arquitetura.md).

| Regra | O que significa na prática |
|---|---|
| Sem servidor | Nada de endpoint, API, banco externo ou chamada de rede. Só arquivos, lidos e gravados pela File System Access API (Edge e Chrome) |
| Um escritor por arquivo | O time grava **só** em `times/<seu-slug>/`; nunca em `central/`, nunca em outra pasta de time |
| Tudo cifrado | Todo arquivo da pasta é um envelope `gestao-envelope/1` (AES-256-GCM). A chave do time chega por Teams ou e-mail, nunca pela pasta. É trocada só se vazar |
| Retrato completo | Cada publicação reescreve o arquivo inteiro, com `revision` sempre maior |
| Hierarquia da Central | **Iniciativa › Feature** (`PAG-042`, `PAG-042.F2`). O épico do time liga a uma iniciativa; o card liga a uma feature. Fases (`PAG-042.P1`) são só contexto |
| Iniciativas laterais | Épico criado pelo time, sem código da Central, vai com `ref: null`. O gestor concilia depois; quando decidir, o catálogo traz `links[]` e a ferramenta grava o código sozinha |
| Backlog | Publicado **automaticamente** a cada movimentação de card (espera de ~10 s para agrupar mudanças). Publique só quando algo mudou: cada gravação vira uma "nova remessa" para o gestor |
| Métricas | Publicadas **ao fechar a sprint, com confirmação** (e por um botão "Publicar métricas agora"), com o campo `sprint` |
| Escopo das métricas | Só do **time**, calculadas a partir da movimentação de cards, sobre o **backlog inteiro** (com e sem vínculo, com e sem épico). **Nada por pessoa**: o formato individual existe reservado, mas está desligado |
| Nomes de métricas | Use `standard` quando seguir a definição padrão (dicionário em `contratos/schemas/dicionario-metricas.json`). Métricas próprias são aceitas, desde que tragam `definition` |

### Novidade no catálogo: fase e dependências da feature
Cada feature do catálogo pode trazer dois campos opcionais:

```json
{ "ref": "PAG-042.F2", "name": "Contratação no app", "status": "open", "due": "2026-11-28",
  "phase": "PAG-042.P2", "dependsOn": ["PAG-042.F1"] }
```

- `phase`: a fase em que a feature está (no máximo uma). Se faltar, procure a feature em `initiatives[].phases[].features`.
- `dependsOn`: códigos de features das quais esta depende.
- Para o time são **só leitura**: mostre a fase e avise quando o card está ligado a uma feature cuja dependência ainda está aberta na Central. Nada disso vai de volta no `status.json`; o contrato de status e o de métricas não mudaram.
- Features não mudam de iniciativa.

---

## 2. Caminho A · usar o Quadro do Time

`quadro_do_time_v1.html` é um arquivo único, sem instalação. Abra no Edge ou no Chrome (pode ser direto do disco, `file://`).

### 2.1 O que ele faz
| Tela | Para quê |
|---|---|
| **Quadro** | Kanban com limite de WIP em barras, arrastar e soltar, raias por iniciativa ou por pessoa, modo compacto, filtros rápidos (sprint, bloqueados, atrasados, iniciativa, responsável, busca). Cada card mostra o tipo, a cor da iniciativa, a feature da Central, bloqueio, prazo quando está perto e três pontos de envelhecimento (comparados com o histórico do próprio time). A coluna de entrega fica recolhida e a faixa de pulso no rodapé resume entregas, lead time e cards parados. Aviso "depende de F1" quando a feature depende de outra ainda aberta. A primeira coluna (Backlog) fica só na aba Backlog, a menos que Ajustes › Colunas diga para mostrá-la |
| **Backlog** | Lista de cards agrupada por iniciativa, responsável ou sprint, com filtros (abertos, atrasados, vencem em 7 dias, bloqueados, sem responsável, todos) e busca. Cada linha mostra tipo, código, feature, coluna, sprint (trocável ali mesmo), prazo relativo ("amanhã", "atrasado 2 d") e responsável; "+ Card" em cada grupo já cria o card naquele grupo |
| **Novo card** | Formulário no mesmo padrão da tarefa da Central: título grande, responsável por avatar (com "+ Nova pessoa"), prazo com atalhos, sprint, iniciativa, feature na Central (com fase e dependências), descrição; ao lado tipo, coluna inicial, pontos, link e "Mostrar ao gestor". "Criar outro em seguida" mantém o formulário aberto |
| **Criação rápida** | Barra no topo de todas as telas: `Ajustar retry @ana amanhã #PAG-042 F2 !bug` + Enter cria o card no Backlog com responsável, prazo (`hoje`, `amanhã` ou `dd/mm`), iniciativa (nome ou código da Central), feature e tipo. "Detalhes" abre o formulário já preenchido com o que foi digitado |
| **Sprints** | Planejar, iniciar (o compromisso é registrado no início) e fechar. Ao fechar, os cards abertos vão para a próxima sprint ou para o backlog, e a ferramenta pergunta se publica as métricas |
| **Iniciativas** | Lista à esquerda (ligadas à Central, do time sem vínculo, da Central ainda sem épico aqui com botão Trazer, concluídas) e o detalhe da iniciativa escolhida: progresso, cards em andamento, bloqueios, previsão do time comparada ao prazo da Central, distribuição dos cards por coluna, atualização de status de uma linha registrada ali mesmo, linha do tempo com fases, prazos das features, hoje, prazo e previsão, um cartão por feature (fase, dependências, progresso e cards abertos, com "+ Card nesta feature") e os cards sem feature, com seletor para ligar a uma feature |
| **Métricas** | Vazão, lead time, cycle time, WIP, idade do WIP, fluxo cumulativo, demanda que chega, cards fechados por sprint, compromisso cumprido, % bloqueado, itens no prazo, bloqueios por motivo e distribuição do lead time. "Ver JSON" mostra exatamente o que vai para a Central |
| **Central** | Slug do time, chave, pasta, catálogo, situação das publicações, prévia do `status.json` e do `metricas.json`, plano B. Quando chega um catálogo novo, o Quadro avisa **Nova remessa da Central** |
| **Post-its** | Faixa no topo com os recados que o gestor deixou pelo hub; **Vi** grava o recibo e o gestor vê quem leu |
| **Detalhes do card** | Título editável, coluna em trilha clicável, lead time, cycle time e tempo bloqueado do card, feature da Central com fase e dependências, notas, linha do tempo de movimentos e bloqueios; ao lado, responsável por avatar, tipo, prazo (com "vence em"), sprint, iniciativa, feature, pontos e link |
| **Ajustes** | Nome do time, pessoas do time, colunas (qual é o compromisso e qual é o início), senha do arquivo (obrigatória), cópia de segurança |

### 2.2 Primeiro uso (uma pessoa do time, uns 10 minutos)

> **Jeito mais rápido (desde 24/11/2026): o assistente.** O gestor manda o `inicio.html` (está no pacote .zip da solução) e, por mensagem direta, a chave do time e o nome da pasta sincronizada. Cada pessoa abre o `inicio.html`, responde "Você lidera times?", marca Tarefas (e Finanças, se cuida do dinheiro do time), cola a chave em "Seu líder compartilhou chaves?" e escolhe a pasta pessoal (só sua, de preferência no seu OneDrive) e a sincronizada. O assistente reconhece o time pela chave, cria o Quadro já configurado com ela, o arquivo cifrado com a senha da pessoa e o hub. Na primeira abertura do Quadro, só falta dizer quem é você. Os passos abaixo continuam valendo para quem recebe o HTML do time direto da Central.

> **HTML já configurado pelo gestor.** Na Central (página Times, aba **Integração** do time), o botão **HTML do time** gera uma cópia do Quadro (versão 1.1 ou mais nova) com o nome do time, o identificador (pasta), o prefixo dos códigos, as pessoas e o contato já preenchidos. Ao abrir, o aviso no topo confirma para qual time ele foi preparado, e "Criar quadro novo" vem preenchido, com o identificador travado. Se o gestor marcou "incluir a chave", ela é cadastrada sozinha na primeira abertura (só uma vez: se for removida, não volta). Nesse caso, guarde o HTML só com o time e nunca na pasta compartilhada (`Gestao-Compartilhado`). Sem a chave embutida, cole a que chegar por Teams ou e-mail (passo 3).

1. **Criar quadro novo**: nome do time, o identificador (slug) combinado com o gestor (ex.: `pagamentos`) e, se quiser, as pessoas do time (uma por linha, com o papel depois de `;`). Escolha onde salvar o arquivo `quadro-<slug>.json`: **numa pasta só sua** (de preferência no seu OneDrive), **nunca** dentro da pasta compartilhada. Crie a senha (obrigatória, 12 caracteres ou mais, sem recuperação) e guarde no cofre de senhas. Cada pessoa do time tem o próprio arquivo e a própria senha.
2. **Ajustes › Colunas**: deixe as colunas iguais às do time e marque a coluna de **compromisso** (onde o card entra no fluxo) e a de **início** (onde o trabalho começa). A última coluna é sempre a **entrega**. Defina limites de WIP.
3. **··· › Central**: cole a chave recebida do gestor (`GK1.<id>.<…>`), clique em **Conectar pasta** e escolha a raiz da pasta compartilhada (`Gestao-Compartilhado`, marcada como **Sempre manter neste dispositivo**). O catálogo é lido e as iniciativas da Central aparecem para vínculo. Responda **Quem é você neste quadro?** (nome e este computador).
4. **Iniciativas**: para cada iniciativa da Central que o time trabalha, crie o épico (o aviso "A Central tem N iniciativas sem épico aqui" faz isso num clique) ou ligue um épico existente. Épicos que são só do time ficam sem vínculo.
5. Nos cards, escolha a **Feature na Central** quando fizer sentido. Cards sem feature continuam valendo nas métricas.

**Pessoas do time** (Ajustes): adicione uma a uma (nome e papel; Enter já prepara a próxima) ou várias de uma vez, colando uma lista ou uma coluna do Excel. Nomes repetidos (inclusive com acento ou caixa diferentes) não são duplicados. Renomear uma pessoa atualiza os cards dela. Quem sai do time é **desativado**: continua nos cards antigos e sai das listas; remover só é possível para quem não tem cards. No card, dá para criar uma pessoa nova direto no campo Responsável. As pessoas servem só para atribuir cards: nenhuma métrica é calculada por pessoa.

### 2.3 Uso diário
- Cada pessoa abre o **próprio** `quadro-<slug>.json`, cifrado com a própria senha. As alterações dela vão, cifradas com a chave do time, para `times/<slug>/quadro/<pessoa>-<computador>.json` na pasta compartilhada; a ferramenta lê os arquivos de todos a cada 20 s e **une** as mudanças (vence a alteração mais recente de cada card; códigos criados ao mesmo tempo são renumerados). Ninguém grava o arquivo de outra pessoa, então o OneDrive não cria cópias de conflito. Um `quadro-<slug>.json` antigo, compartilhado, continua abrindo e é migrado.
- Os **post-its** do gestor aparecem no topo do quadro; clique **Vi** depois de ler.
- Quem quiser publicar precisa colar a chave **uma vez no próprio navegador**. A chave fica guardada como `CryptoKey` não exportável no IndexedDB; ela não vai para o arquivo do quadro.
- Depois de recarregar a página, o navegador pede de novo a permissão da pasta: a publicação fica "pendente" e sai no próximo clique, ou em **Central › Reconectar pasta**.
- **Sem a API** (navegador antigo ou bloqueado): **Central › Plano B** baixa `status.json` e `metricas.json` já cifrados para salvar em `times/<slug>/`, e lê o catálogo de um arquivo escolhido.

### 2.4 Migrar dados de uma ferramenta antiga para o Quadro
O arquivo do quadro é JSON aberto (`quadro-time/1`), então um agente pode escrever um conversor. Formato mínimo:

```json
{
  "schema": "quadro-time/1", "createdAt": "2026-11-15T09:00:00-03:00", "upd": 1794700000000,
  "team": { "name": "Pagamentos", "slug": "pagamentos", "contact": "", "upd": 0 },
  "settings": { "upd": 0, "commitCol": "pronto", "startCol": "fazendo", "autoPublish": true,
    "columns": [ { "id": "backlog", "name": "Backlog", "wip": null }, { "id": "pronto", "name": "Pronto para fazer", "wip": null },
                 { "id": "fazendo", "name": "Fazendo", "wip": 6 }, { "id": "concluido", "name": "Concluído", "wip": null } ] },
  "seq": { "card": 1, "epic": 1, "sprint": 0, "person": 1 },
  "people": [ { "id": "P-1", "uid": "1", "name": "Diego Reis", "role": "Desenvolvimento", "active": true, "upd": 0 } ],
  "epics": [ { "id": "EPIC-1", "uid": "1", "name": "Pix parcelado", "centralRef": "PAG-042", "status": "auto", "forecastEnd": "",
               "link": "", "updates": [], "featureNotes": {}, "upd": 0 } ],
  "cards": [ { "id": "CARD-1", "uid": "1", "title": "Tela de contratação", "kind": "história", "epicId": "EPIC-1",
               "featureRef": "PAG-042.F2", "owner": "Diego Reis", "due": "2026-11-21", "points": null, "notes": "", "link": "",
               "showToCentral": false, "col": "fazendo", "sprintId": null, "order": 1000, "upd": 0,
               "history": [ { "col": "backlog", "at": "2026-11-03T10:00:00-03:00" }, { "col": "fazendo", "at": "2026-11-05T09:12:00-03:00" } ],
               "blocked": null, "blocks": [ { "from": "2026-11-06T10:00:00-03:00", "to": "2026-11-07T15:00:00-03:00", "cat": "terceiro", "reason": "…" } ] } ],
  "sprints": [ { "id": "SPR-1", "uid": "1", "name": "Sprint 21", "start": "2026-10-27", "end": "2026-11-09", "goal": "",
                 "state": "closed", "committed": ["CARD-1"], "result": { "committed": 1, "deliveredCommitted": 1, "delivered": 1 }, "upd": 0 } ],
  "publish": { "revision": 0, "lastStatus": null, "lastMetrics": null }
}
```

- `history` é o que alimenta lead time, cycle time e fluxo cumulativo: converta o histórico de colunas que existir (a primeira entrada é a criação do card). Sem histórico, use uma entrada só com a coluna atual e a data de criação; as métricas de tempo começam a aparecer a partir das próximas movimentações.
- `owner` do card é o **nome** da pessoa (igual a `people[].name`); é o nome que vai para a Central em `items[].owner`. Se `people` faltar, a ferramenta cria as pessoas a partir dos responsáveis dos cards ao abrir o arquivo.
- `cat` do bloqueio: `terceiro`, `decisao`, `ambiente`, `negocio` ou `outro`.
- Preserve os ids antigos dos itens se o gestor já os conhece (eles viram `localId` na Central); senão use `CARD-<n>` e `EPIC-<n>`, e ajuste `seq`.

---

## 3. Caminho B · adaptar a ferramenta que o time já tem

A pasta `contratos/` descreve **o que** implementar (receita A de [`05-como-integrar.md`](../contratos/05-como-integrar.md)). O Quadro do Time é uma **implementação de referência funcionando**: copie as funções dele em vez de reescrever. Todas estão no bloco `<script>` do `quadro_do_time_v1.html`:

| Necessidade | Função no Quadro do Time | Observação |
|---|---|---|
| Cifrar e decifrar o envelope | `lerChaveTexto`, `importarChave`, `aadDe`, `cifrar`, `decifrar` | Idênticas a `contratos/referencia/cripto.js` (só o `b64.enc` foi feito em blocos, para arquivos grandes) |
| Chaveiro no navegador | `colarChave`, `chaveiro`, `removerChave` | `CryptoKey` com `extractable: false` no IndexedDB; a mais recente cifra |
| Pasta | `conectarPasta`, `obterPasta` | Permissão pedida só dentro de um clique |
| Catálogo | `lerCatalogo`, `lerCatalogoEnvelope`, `applyCatalogLinks` | Guarda o catálogo **ainda cifrado** no IndexedDB para abrir sem a pasta; aplica `links[]` e `aliases[]`; recusa catálogo de outro time |
| Fase e dependências | `featPhase`, `featDeps`, `openDeps` | Leem `phase` e `dependsOn`, com o recuo para `phases[].features` |
| Montar `status.json` | `buildStatus`, `derivedStatus`, `epicStatus` | Regras do schema [`gestao-status-1`](../contratos/schemas/gestao-status-1.schema.json) |
| Montar `metricas.json` | `buildMetrics` e as funções `commitAt`, `startAt`, `doneAt`, `colAt`, `blockedMs` | Marcos compromisso, início e entrega a partir do histórico de colunas |
| Validar antes de gravar | `validar` | Checagem mínima das regras obrigatórias; o teste completo é contra os schemas |
| Publicar | `publicar`, `gravarCifrado`, `lerRevisaoExistente`, `agendarStatus` | Revisão = maior entre o contador da ferramenta e a revisão já gravada na pasta, mais 1 (evita voltar a revisão quando duas pessoas publicam) |
| Plano B | `baixarCifrados` | Arquivos baixados já cifrados |
| Várias pessoas no mesmo quadro | `mergeDb`, `f4publicar`, `f4ler` | Cada pessoa publica o próprio arquivo em `times/<slug>/quadro/` e o Quadro une; só se a ferramenta do time também junta várias pessoas |

### 3.1 Passo a passo para o agente
1. **Entender a ferramenta atual.** Como guarda épicos, cards, colunas, bloqueios, sprints e se registra **quando** cada card mudou de coluna.
2. **Mapear os conceitos** (escreva o mapeamento no código e em `definition` das métricas):

   | Na ferramenta do time | No contrato |
   |---|---|
   | Épico, iniciativa, projeto | `initiatives[]` do `status.json` (`localId` = id interno estável) |
   | Código da Central no épico | `ref` (`PAG-042`) ou `null` |
   | História, tarefa, card | Entra nas métricas sempre; entra em `items[]` se tem feature ou é relevante para o gestor |
   | Card ligado a feature | `items[].featureRef` (`PAG-042.F2`) e uma entrada em `features[]` com a visão do time |
   | Coluna onde o card entra no fluxo | marco **compromisso** |
   | Coluna onde o trabalho começa | marco **início** |
   | Coluna final | marco **entrega** |
   | Etiqueta ou campo de bloqueio | `blockers[]` e métricas de bloqueio |
   | Sprint | campo `sprint` do `metricas.json` e métricas `sprint_closed` e `predictability` |

3. **Registrar histórico** se não existir: `card.history = [{ col, at }]` a cada movimentação e `card.blocks = [{ from, to, reason }]`, com migração que não perde dados. Enquanto não houver histórico, publique só o que dá para calcular (vazão pela data de conclusão, WIP, bloqueios por motivo) e use `v: null` nos períodos sem dado.
4. **Implementar a integração** copiando as funções da tabela acima: campo "Colar chave da Central", "Conectar pasta", leitura do catálogo, seletores "Iniciativa na Central" no épico e "Feature na Central" no card (mostrando fase e dependências), publicação automática do backlog com espera de ~10 s e publicação de métricas ao fechar a sprint com confirmação.
5. **Manter as métricas que o time já tem**, descrevendo cada uma no formato autodescritivo. Use `standard` quando seguir a definição padrão; para as próprias, preencha `definition`. Escopo só `team`, `initiative` ou `feature`.
6. **Testar** (seção 4).

### 3.2 Erros comuns
- Gravar o arquivo de dados da ferramenta (o quadro inteiro, em claro ou com a senha local) dentro da pasta compartilhada. Ele fica numa pasta só de quem usa; na pasta compartilhada só vão os arquivos dos contratos, sempre cifrados com a chave do time.
- Regravar `status.json` sem nada novo, com a revisão subindo: o gestor vê uma "nova remessa" a cada gravação.
- Calcular métricas só dos cards vinculados à Central. As métricas consideram o **quadro inteiro**.
- Métrica por pessoa, ranking ou "vazão por responsável". Não é aceito na v1. O nome do responsável pode ir em `items[].owner` e `blockers[].owner`, mas nenhuma métrica é quebrada por pessoa.
- Reaproveitar IV, guardar o texto da chave em `localStorage` ou no arquivo de dados, ou logar a chave no console.
- Usar o título do card como `localId`. Use o id interno, que nunca muda.
- Datas no formato brasileiro ou sem fuso em `generatedAt`.
- Gravar o arquivo em pedaços. Use `createWritable()` → `write()` → `close()`.
- Escrever fase ou dependência de volta para a Central. São do gestor; o time só lê.

---

### 3.3 Post-its do gestor (recomendado)

O Hub da solução do gestor deixa recados curtos para o time. O Quadro do Time já os mostra; uma ferramenta própria pode fazer o mesmo com a **mesma chave do time** e o mesmo envelope. Contratos: `gestao-postits/1` e `gestao-postits-vistos/1` (schemas em `contratos/schemas/`, no repositório e no pacote .zip).

**Onde ficam**

```
times/<slug>/postits/<pessoa>-<computador>.json          ← um arquivo por autor (o hub de cada gestor)
times/<slug>/postits/vistos/<pessoa>-<computador>.json   ← um arquivo por pessoa do time que leu (recibo "Vi")
```

O cabeçalho do envelope traz também `writer` em claro (`<pessoa>~<computador>`). Ele **não** entra no AAD; depois de decifrar, confira que é igual a `payload.source.writer`. Mais de um gestor pode deixar post-its para o mesmo time (cada um tem o próprio arquivo).

**Ler (a cada 30 s, ao voltar para a aba e ao abrir o quadro)**

```js
async function lerPostits(root, slug, chaves /* Map kid -> CryptoKey */) {
  const dir = await root.getDirectoryHandle('times').then(d => d.getDirectoryHandle(slug)).then(d => d.getDirectoryHandle('postits')).catch(() => null);
  if (!dir) return [];
  const porAutor = new Map(), hoje = new Date().toISOString().slice(0, 10);
  for await (const [nome, h] of dir.entries()) {
    if (h.kind !== 'file' || !nome.endsWith('.json') || nome.startsWith('.')) continue;
    try {
      const env = JSON.parse(await (await h.getFile()).text());
      const p = await decifrar(env, chaves);                              // decifrarEnv de contratos/referencia/cripto.js
      if (p.schema !== 'gestao-postits/1' || env.team !== slug || p.source?.team !== slug) continue;
      if (env.writer && env.writer !== p.source.writer) continue;          // dono não confere: ignore
      const w = p.source.writer, ant = porAutor.get(w);                    // cópias de conflito do OneDrive:
      if (!ant || p.revision > ant.revision) porAutor.set(w, p);           // vale a maior revisão de cada autor
    } catch { /* arquivo de outra chave ou incompleto: ignore, sem quebrar a tela */ }
  }
  return [...porAutor.values()].flatMap(p => (p.notes || []).map(n => ({ ...n, autor: p.source.author?.name || p.source.writer.split('~')[0] })))
    .filter(n => !n.expiresAt || n.expiresAt >= hoje);                     // vencido não aparece
}
```

Mostre o texto **sempre como texto** (nunca como HTML), com a cor (`amarelo`, `rosa`, `verde`, `azul`, `lilas`), o autor, o destinatário (`to`, ausente = o time todo) e um botão **Vi**.

**Gravar o recibo "Vi"** (opcional, mas é o que faz o gestor ver "visto por …")

```js
async function publicarVistos(root, slug, chave /* { kid, key } */, eu /* { pessoa, computador, nome } */, vistos /* [{ id, at }] */) {
  const dir = await root.getDirectoryHandle('times').then(d => d.getDirectoryHandle(slug)).then(d => d.getDirectoryHandle('postits', { create: true })).then(d => d.getDirectoryHandle('vistos', { create: true }));
  const writer = `${eu.pessoa}~${eu.computador}`, nome = `${eu.pessoa}-${eu.computador}.json`;
  const revision = (+localStorage.getItem('postits.vistos.rev') || 0) + 1;      // cresce sempre
  const payload = { schema: 'gestao-postits-vistos/1', revision, generatedAt: agoraComFuso(), source: { team: slug, writer, author: { name: eu.nome } }, seen: vistos };
  const env = { ...(await cifrar(payload, { key: chave.key, kid: chave.kid, team: slug })), writer };
  const w = await (await dir.getFileHandle(nome, { create: true })).createWritable();
  await w.write(JSON.stringify(env)); await w.close();
  localStorage.setItem('postits.vistos.rev', String(revision));
}
```

`<pessoa>` e `<computador>` são identificadores curtos só com letras minúsculas e números (ex.: `ana` e um código aleatório guardado no navegador). Cada pessoa grava **só o próprio arquivo**: nunca escreva no arquivo de outra pessoa nem no arquivo do gestor.


## 4. Como testar (vale para A e para B)

1. **Exemplos cifrados:** cadastre a chave **pública de exemplo** do time Pagamentos (`contratos/exemplos/CHAVES-DE-EXEMPLO.txt`, a de `pagamentos-2611`) e decifre `status.json`, `metricas.json` e `central/catalogo-pagamentos.json` de `contratos/exemplos/Gestao-Compartilhado/`. O resultado deve ser idêntico aos de `contratos/exemplos/conteudo/`. Com outra chave, a mensagem deve ser "Falha ao decifrar: chave errada ou arquivo alterado". Nunca use essa chave com dados reais.
2. **Pasta de teste:** copie `contratos/exemplos/Gestao-Compartilhado/central/` para uma pasta `Gestao-Compartilhado` de teste, conecte, confira que o catálogo mostra `PAG-042` com as features F1 a F3, a fase de cada uma e que F2 depende de F1 e F3 depende de F2.
3. **Publicar duas vezes** e conferir: `iv` diferente, `revision` maior, conteúdo nunca em claro na pasta.
4. **Validar** com o validador da solução (sem instalar nada além do Node 20+):
   ```
   node contratos/validar.js vetores                                   # sua cripto bate com a referência
   node contratos/validar.js conteudo status-decifrado.json --como times/<slug>/status.json
   node contratos/validar.js pasta <pasta de teste> --chave GK1.<slug>-AAMM.…
   ```
   No Quadro do Time, **Central › Ver status.json / Ver metricas.json** mostra o conteúdo que vai cifrado e o resultado da validação mínima.
5. **Checklist de conformidade** da seção 4 de [`contratos/05-como-integrar.md`](../contratos/05-como-integrar.md).
6. **Ponta a ponta:** publique na pasta real e confira no SharePoint que surge uma nova versão do arquivo, não uma cópia de conflito.

O Quadro do Time v1 passou por estes testes: os três exemplos cifrados decifram idênticos ao conteúdo, a chave errada é recusada, e o `status.json` e o `metricas.json` publicados validam contra `gestao-envelope/1`, `gestao-status/1` e `gestao-metricas/1` (validação com formatos). Também foram testados: vínculos e apelidos vindos do catálogo, recusa de catálogo de outro time, IV novo a cada gravação, arquivo do quadro com senha (sem texto em claro) e união de mudanças de duas pessoas.

---

## 5. Prompt pronto para o agente de desenvolvimento do time

```
Vamos ligar a nossa ferramenta HTML de acompanhamento à Central de Gestão do gestor.
Anexos: "guia-adaptacao-times.md", a pasta contratos/ inteira (comece por
contratos/LEIA-ME.md e contratos/05-como-integrar.md, receita A; schemas,
referencia/cripto.js, exemplos/ e validar.js) e quadro_do_time_v1.html
(implementação de referência).

1. Leia o código da nossa ferramenta e descreva como ela guarda épicos, cards, colunas,
   bloqueios, sprints e o histórico de movimentação.
2. Proponha o mapeamento da seção 3.1 do guia (marcos compromisso, início e entrega;
   o que vai para items[]; de onde vem a atualização de status; quais métricas padrão
   dá para calcular hoje e quais precisam de histórico). Espere minha confirmação.
3. Implemente copiando as funções indicadas na seção 3 do guia, sem servidor e sem
   chamadas de rede: chave e chaveiro, pasta, leitura do catálogo (com fase e
   dependências das features só para exibição), vínculo de épicos e cards,
   status.json automático com espera de ~10 s, metricas.json ao fechar a sprint com
   confirmação, contador de revisão e, se faltar, registro de histórico com migração.
4. Métricas só do time, sobre o quadro inteiro, nunca por pessoa. Use "standard" quando
   seguir a definição padrão; métricas próprias com "definition".
5. Rode os testes da seção 4 do guia (inclusive node contratos/validar.js) e o checklist
   da seção 4 de contratos/05-como-integrar.md.
Não mude o visual nem o comportamento existentes além do necessário.
```

Se o time preferir trocar de ferramenta, a alternativa é o caminho A com o conversor da seção 2.4.

---

## 6. Limites desta versão

- O Quadro do Time não substitui ferramentas com integração a repositórios ou a sistemas de tickets; ele é um quadro manual.
- A união de mudanças entre pessoas é por card (vence a mais recente). Duas pessoas editando o mesmo card ao mesmo tempo: fica a última gravação.
- A sincronização depende do OneDrive (atrasos de minutos são normais). Como cada pessoa grava só o próprio arquivo, cópias de conflito são raras; se aparecer uma do seu arquivo local, abra o principal e apague a cópia depois de conferir.
- Sem a File System Access API, o quadro não abre arquivos (o plano B cobre só a troca com a Central). Use Edge ou Chrome.

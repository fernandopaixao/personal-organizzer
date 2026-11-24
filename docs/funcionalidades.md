# Funcionalidades, usos e objetivos

*24/11/2026 · Central v15.9, Quadro do Time 2.4, Hub 1.5, Finanças do Grupo 1.6 e do Time 1.5, Mapa de Férias 1.3, assistente 2.4*

Este documento descreve **o que cada ferramenta faz, para quê e quando usar**. Para as regras técnicas por trás, veja as [decisões de arquitetura](adr/README.md). Para o caminho de quem usa, veja a [jornada do usuário](jornada-do-usuario.md) e o [passo a passo](passo-a-passo.md).

---

## 1. Objetivo da solução

Dar a um gestor de vários times, e aos próprios times, **um lugar organizado para tarefas, pessoas, rituais, portfólio de iniciativas, fluxo dos times e finanças**, sem servidor, sem instalação e com tudo cifrado. Os objetivos que guiam cada funcionalidade:

| Objetivo | Como aparece na solução |
|---|---|
| **Saber o que pede atenção agora** | Tela Hoje, faixas de alerta, envelhecimento de cards, "Pedindo atenção" nas finanças |
| **Não perder compromissos** | Tarefas delegadas com aderência e cobrança, acordos de fóruns que viram tarefas, combinados de 1:1 |
| **Conduzir rituais com menos preparo** | Pessoa 360 e modo Em conversa, pautas que rolam para a próxima reunião, reunião de status pré-preenchida |
| **Ver o portfólio e o fluxo dos times sem pedir relatório** | Catálogo de iniciativas compartilhado, backlog e métricas publicados pelos times |
| **Planejar e acompanhar o dinheiro** | Finanças do Time (dia a dia e futuro) e Finanças do Grupo (soma dos planos) |
| **Proteger dados sensíveis** | Criptografia sempre, dado individual local, um arquivo por dono |

---

## 2. Mapa das ferramentas

| Ferramenta | Arquivo | Para quem | Objetivo em uma frase |
|---|---|---|---|
| **Assistente** | `inicio.html` | Quem está começando ou trocando de computador | Montar a solução certa para o seu papel, já cifrada |
| **Hub** | `hub.html` | Gestor (e quem quiser) | Tela inicial: abrir ferramentas, ver o que os times publicaram, deixar post-its |
| **Central de Gestão** | `gestao_pessoal_v15.html` | Gestor | Gestão pessoal, de pessoas, rituais e portfólio |
| **Quadro do Time** | `quadro_do_time_v1.html` (gerado por time) | Cada time | Kanban, backlog, sprints e métricas de fluxo do time |
| **Finanças do Grupo** | `financas_grupo.html` | Gestor | Consolidar os planos financeiros dos times contra o orçamento |
| **Finanças do Time** | `financas_time.html` (gerado por time) | Responsável financeiro do time | Registrar gastos, planejar o ano e publicar o plano |
| **Mapa de Férias** | `ferias.html` | Time, gestor e liderança | Enxergar e planejar as ausências: que dias têm mais e menos gente fora, somando em níveis |
| **Cartão "Onde fica cada coisa"** | `onde-fica-cada-coisa.html` | Todos | Mapa em claro (sem dados) de arquivos e pastas |

Todas têm, no topo, **Onde estou?** (qual ferramenta, qual arquivo, o que é local e o que é compartilhado) e **← Hub**.

---

## 3. Assistente inicial (`inicio.html`)

**Objetivo:** fazer a primeira montagem sem a pessoa precisar entender a arquitetura.

**Como funciona (2.1).** A primeira tela explica a solução em quatro desenhos: o HTML é a ferramenta e o JSON é o caderno cifrado; a chave de integração é um idioma que só você e o time falam; quem lidera 1 time publica para o gestor, e quem lidera vários soma os times e publica para a liderança; a troca é por uma pasta sincronizada pelo OneDrive, onde cada pessoa grava só o próprio arquivo.

| Passo | O que acontece |
|---|---|
| Perfil | **Você lidera times?** "Sim, lidero 2 ou mais times" (gestor), "Sim, lidero 1 time" (responsável) ou "Não, faço parte de um time" (membro). Depois, **o que quer organizar**: tarefas, finanças ou os dois (membro só tarefas) |
| Chaves | **Seu líder compartilhou chaves de integração?** Cole as chaves (`GK1.…`, uma por linha) e o nome da pasta sincronizada que o líder indicou. O assistente diz o que cada chave é: tarefas do time (`<time>-AAMM`), finanças do time (`<time>-fin-AAMM`) ou, para o gestor, finanças da liderança (`<grupo>-fin-AAMM`, o "nível acima"). Chave que não serve ao perfil é mostrada como ignorada |
| Dados | Nome, identificador, prefixo, ano fiscal e moeda. O identificador do time (ou do grupo, para o gestor com chave da liderança) **vem da chave e fica travado**, para casar com os arquivos do líder |
| Pastas | Pasta **pessoal** (só sua, de preferência no seu OneDrive, como backup) e pasta **compartilhada**; aviso automático se a pessoal parecer ser a compartilhada |
| Senha | Criação da senha com aviso de cofre |
| Pronto | Grava os HTMLs do perfil, o primeiro arquivo cifrado de cada um **já com as chaves coladas**, o hub e o cartão "Onde fica cada coisa". Explica os **dois tipos de arquivo** (pessoal × comum, por que em pastas separadas, ninguém lê sem a senha), mostra os **próximos passos do perfil** e o botão **Abrir o hub** (2.2), que abre o hub criado já com a senha da sessão |

| Papel × uso | HTMLs gerados |
|---|---|
| Gestor + finanças | Finanças do Grupo (que gera o Finanças de cada time) |
| Gestor + tarefas | Central (que gera o Quadro de cada time) |
| Responsável + finanças | Finanças do Time |
| Responsável ou membro + tarefas | Quadro do Time |
| Qualquer papel + férias | Mapa de Férias: no time, cada pessoa marca as suas; no gestor, os times entram como unidades |
| Vários usos | A soma das linhas, cada HTML separado |

**Quem lidera vários times (2.3):** o caminho normal faz o mesmo que o Estou com sorte nas chaves. O assistente gera a chave de tarefas e, com Finanças, a de finanças de cada time (reaproveita a de tarefas que você colou para um dos times), sugere o prefixo de quem não tem (`PAG`, `CAR`), grava tudo na Central, no Finanças do Grupo, no Mapa de Férias e no hub, e gera `para-os-times/<time>/`. A tela final mostra as chaves com os botões de copiar.

**Tudo abre pronto (2.3, [ADR-0031](adr/0031-ferramentas-abrem-prontas.md)):** o assistente grava neste navegador onde ficou o arquivo de cada ferramenta e a pasta sincronizada. Ao abrir pelo hub, cada ferramenta abre sozinha o seu arquivo, com a senha da sessão e a pasta já ligada; a Central mostra **Continuar com gestao-….json** e já tem a pasta de integração. Ninguém escolhe pasta nem cola chave de novo neste computador.

Onde as chaves coladas vão parar: no hub (tarefas e finanças de cada time), no Quadro (chave de tarefas), no Finanças do Time (chave de finanças) e no Finanças do Grupo (`acima`, a chave da liderança). Nenhuma chave vai para a pasta compartilhada.

**Estou com sorte (2.1).** Para quem lidera times e quer tudo de uma vez. Uma tela só (grupo, times, seu nome, pasta, pasta sincronizada opcional e senha) e o assistente:

| Gera | Onde | Com o quê |
|---|---|---|
| Chaves de tarefas e de finanças de cada time | Dentro dos arquivos cifrados e dos HTMLs dos times | Aviso de cofre antes; botões para copiar cada chave depois |
| Hub, Central, Finanças do Grupo, Mapa de Férias e "Onde fica cada coisa" | Na pasta escolhida | Times, prefixos, pastas e chaves já cadastrados; uma senha para todos |
| Quadro do Time, Finanças do Time, Mapa de Férias e LEIA-ME de cada time | `para-os-times/<time>/` | A chave do time e a pasta sincronizada já configuradas |
| Estrutura da pasta sincronizada | `times/<time>/…`, `grupos/<grupo>/ferias/` | Só pastas vazias |

A tela final mostra cards (ferramentas geradas, times, chaves, arquivos cifrados), um desenho do que ficou em cada pasta, as chaves por time e um **checklist** (senha no cofre, pasta pessoal só sua e no seu OneDrive, pasta compartilhada sincronizando, hub mostrando os times, pasta ligada na Central e no Finanças do Grupo, chaves no cofre, pastas enviadas aos times). O caminho normal também termina com o checklist do perfil. As marcações ficam só no navegador.

**Quando usar:** uma vez, ou ao trocar de computador. O gestor manda a cada time a pasta `para-os-times/<time>/` (ou o mesmo `inicio.html`, com a chave por mensagem direta), e o time monta tudo sozinho.

---

## 4. Hub da solução (`hub.html`)

**Objetivo:** ser a porta de entrada diária e o canal de recados curtos para os times.

| Funcionalidade | Uso | Objetivo |
|---|---|---|
| **Lista de ferramentas** | Mostra os HTMLs da pasta local pelo título e abre cada um numa aba | Não procurar arquivos |
| **Situação por time** | Quando o Quadro, o status, as métricas e o plano financeiro mudaram na pasta | Saber se o time está publicando |
| **Post-its para os times** | Recado curto, com cor, destinatário opcional e "mostrar até"; um ou vários times | Comunicar sem reunião nem e-mail; aparece no topo do Quadro |
| **"Visto por…"** | Mostra quem clicou **Vi** no Quadro | Confirmar leitura |
| **Visão dos times** | Cards de leitura (previsto dos times, realizado com marca do mês, times ativos na semana, post-its vistos) e barras do previsto por time com a marca do orçado | Ver dinheiro e atividade dos times sem abrir outra ferramenta |
| **Finanças no card do time** | Previsto, realizado e orçado do ano do plano publicado pelo time | Saber se o time está dentro do plano |
| **Times e chaves** | Cadastrar times e colar chaves (de tarefas e de finanças), ou **Importar da Central** e **Importar do Finanças do Grupo** (só leitura, com a senha de cada um) | Reaproveitar o que a Central e o Finanças do Grupo já têm, sem colar chave por chave |
| **Hub da liderança (1.3)** | Importado do Finanças do Grupo da liderança, cada gestor par vira um card "gestor" com o consolidado que ele publica (`grupos/<grupo>/financas/`); o painel vira **Visão dos gestores** | A liderança vê cada gestor como uma linha, sem o detalhe dos times |
| **Abrir sem redigitar a senha (1.3)** | As ferramentas abertas pelos links do hub recebem a senha da sessão ([ADR-0029](adr/0029-uma-senha-por-sessao.md)) | Uma senha por dia |

---

## 5. Central de Gestão (v15.9)

**Identidade visual comum (15.9).** A Central, o Quadro (2.4) e as demais ferramentas passam a usar o mesmo visual azul e branco, com trilho marinho e fontes embutidas ([ADR-0032](adr/0032-identidade-visual-comum.md)). Nada muda no funcionamento.

**Chave de integração dentro do time (15.8).** Na visão do time, a aba **Integração** mostra a chave em destaque: **Gerar chave de integração** (um clique; se faltar, a Central sugere a pasta e o prefixo), **HTML do time (com a chave)**, **Copiar chave**, **Mensagem para o time**, **Chave de finanças** e **Vazou: trocar chave**, mais o que chega do time (backlog, métricas, plano). Time sem chave mostra o aviso com o botão também na **Visão do time** e no card da página Times.


**Objetivo:** concentrar o trabalho do gestor: o que ele faz, o que delegou, com quem conversa, em quais fóruns decide e como anda o portfólio.

Navegação em 8 páginas (teclas 1 a 8) e o botão **Importar e agentes** no topo.

### 5.1 Hoje (1)
- **Cards de leitura no topo:** o dia (feitas de quantas, atrasadas), delegadas no prazo, iniciativas em andamento em dia e rituais dos próximos 7 dias. Com a chave de finanças dos times (15.5), entra o card **Finanças dos times**: previsto do ano contra o teto ou o orçado, times acima do teto e planos sem publicar há mais de 35 dias. Cada card abre a página dona do dado.
- **Uso:** abrir o dia. Tarefas do dia e atrasadas, 1:1 da semana, fóruns dos próximos 7 dias, iniciativas pedindo atenção e o cartão **Dos times** (arquivos novos, alertas, épicos sem vínculo, times sem chave).
- **Objetivo:** responder "o que pede atenção agora" sem navegar.

### 5.2 Tarefas (2)
- **Vistas:** Minhas, Delegadas e Todas.
- **Uso:** registrar demandas (inclusive pela barra rápida), delegar com prazo, cobrar. Tarefa pode ficar ligada a uma feature, a uma iniciativa ou a nada.
- **Delegadas:** o que está com quem, prazos, cobranças e **aderência** por pessoa.
- **Objetivo:** não perder compromisso próprio nem delegado.

### 5.3 1:1 · Pessoa 360 (3)
- **Lista** agrupada em próximos 7 dias, atrasados e próximas semanas, com anel de cadência.
- **Indicadores:** último 1:1, entregas no prazo (6 meses), carga atual, evidências de feedback, iniciativas.
- **Abas:** Visão geral, Pauta, Trabalho, Iniciativas, Feedback, Histórico e Perfil (com objetivos opcionais).
- **Pauta** junta quatro fontes: o que você adicionou, o que veio de agentes, combinados abertos e sugestões (tarefas atrasadas ou bloqueadas).
- **Em conversa:** cronômetro, anotações, combinados e tarefas criados no meio da conversa; ao encerrar, resumo pronto para copiar no e-mail ou Teams.
- **Objetivo:** chegar preparado ao 1:1 e sair com combinados registrados.

### 5.4 Feedback (4)
- **Uso:** ciclos de feedback e evidências por pessoa (a anotação é feita na Pessoa 360).
- **Objetivo:** ter evidências acumuladas quando o ciclo chegar.

### 5.5 Iniciativas (5)
- **Vistas:** Lista (feito × prazo, fases, próxima feature, painel com abas), Semana (features e backlog da semana), Horizonte, Linha do tempo (fases sobrepostas) e Dependências.
- **Uso:** cadastrar iniciativas e features com código (`PAG-042`, `PAG-042.F2`), agrupar features em fases, registrar a atualização de uma linha (diário de bordo, num formulário no lugar que mostra a última atualização e só habilita **Registrar atualização** com texto), ver o **downstream** dos times abaixo de cada feature.
- **Finanças por iniciativa (15.6, só leitura):** com as chaves de finanças dos times, a lista mostra o previsto do ano ao lado do código. O painel da iniciativa ganha a aba **Finanças** (orçado, previsto, realizado, folga e uma barra por time). A conta soma, em todos os times, as linhas do plano marcadas com o código da iniciativa ou de uma feature dela ([ADR-0028](adr/0028-financas-na-central-so-leitura.md)).
- **Objetivo:** ver o portfólio e o que está atrasando, com o dado do time chegando sozinho.

### 5.6 Fóruns (6)
- **Abas:** Pautas, Acordos e Staff. Lista lateral para escolher o fórum, com busca.
- **Uso:** fóruns recorrentes com pauta por data (o que não foi discutido passa para a próxima), decisões e compromissos (que viram tarefas) num único formulário com pílulas **Compromisso / Decisão**, validação no campo e Enter para registrar (o mesmo na reunião de status do time), folha de acordos para copiar, imprimir ou baixar; Staff mostra a semana dos times.
- **Objetivo:** reuniões com pauta pronta e acordos que não se perdem.

### 5.7 Times (7)
- **Uso:** cadastro dos times (prefixo e pasta), **Métricas dos times** (fluxo publicado por eles), visão de cada time (backlog, features, reunião de status guiada, folha para o Teams) e **HTML do time** (gera o Quadro já configurado, com aviso de cofre).
- **Finanças (15.5, só leitura):** com a chave de finanças do time, o card do time mostra o previsto do ano contra o teto ou o orçado. A reunião de status ganha o bloco **Finanças** quando o time passou do teto ou não publica há mais de 35 dias ([ADR-0028](adr/0028-financas-na-central-so-leitura.md)).
- **Objetivo:** acompanhar cada time e entregar a ferramenta pronta.

### 5.8 Integração (8)
- **Uso:** pasta e chaves (gerar, copiar, revogar; **chave de finanças** por time, colada ou importada com **Chaves do Finanças do Grupo**), arquivos recebidos (com prévia), **Conciliação** (unir épicos, trazer para a Central, ligar itens a features, códigos das finanças dos times sem iniciativa na Central) e **Compartilhar** (tela que mostra o que vai para cada time).
- **Abrir o Finanças do Grupo (15.7):** botão em Integração e na aba Finanças da iniciativa; a senha da sessão vai junto.
- **Objetivo:** manter a Central e os times falando a mesma língua, sem sobrescrever nada.

### 5.9 Importar e agentes
- **Uso:** copiar um prompt pronto (com o contexto atual) para o agente de reuniões, chats e e-mails; colar o JSON `gestao-import/3` que ele devolve; revisar a prévia (contadores de novos, atualizados, iguais e ignorados que filtram a lista, itens agrupados por tipo, avisos destacados, erro explicado no lugar); aplicar com **Importar N itens**. Também lê `.ics` do Outlook para séries de reuniões.
- **Prompts:** demandas, delegação, iniciativas e fases, features de uma iniciativa, status, ata (decisões e compromissos), staff, pautas, preparar 1:1, pessoas e times, conciliação, métricas de time sem ferramenta.
- **Objetivo:** transformar o que foi dito em reuniões e mensagens em tarefas e pautas sem digitar.

---

## 6. Quadro do Time (2.3)

**Objetivo:** dar ao time uma ferramenta de fluxo pronta, que publica sozinha o que a Central precisa.

| Tela | Uso | Objetivo |
|---|---|---|
| **Quadro** | Kanban com raias (nenhuma, iniciativa ou pessoa), WIP visível, envelhecimento (âmbar acima da mediana, vermelho acima do p85), entrega recolhida, filtros, faixa de pulso, card em painel lateral (↑ ↓ Esc) | Ver gargalos e cards parados |
| **Post-its para o time** | Faixa no topo com os recados do hub; **Vi** grava o recibo | Receber recados do gestor |
| **Backlog** | Lista agrupável por iniciativa, responsável ou sprint, com "+ Card" | Preparar trabalho |
| **Criação rápida** | `Ajustar retry @ana amanhã #PAG-042 F2 !bug` | Criar card em uma linha |
| **Iniciativas** | Ligadas à Central, só do time, da Central sem épico (**Trazer**), concluídas | Ligar o trabalho do time ao portfólio |
| **Métricas** | Vazão, lead time, cycle time, WIP, idade do WIP, fluxo cumulativo, demanda, compromisso cumprido, % bloqueado; "Ver JSON" | Melhorar o fluxo e publicar para a Central |
| **Sprints** (menu ···) | Planejar, iniciar, fechar; ao fechar, pergunta se publica as métricas | Ritmo do time |
| **Central** (menu ···) | Slug, chave, pasta, catálogo, situação das publicações | Conferir a integração |
| **Ajustes** (menu ···) | Nome, pessoas, colunas (compromisso, início, mostrar Backlog), senha, cópia de segurança | Configurar |

Cada pessoa grava o **próprio arquivo** (`quadro/<pessoa>-<computador>.json`) e o Quadro une os arquivos de todos a cada 20 s. O backlog (`status.json`) é publicado a cada movimentação; as métricas, ao fechar a sprint.

**Times com ferramenta própria** podem continuar com ela adaptando-a ao contrato (caminho B em `ferramenta-time/guia-adaptacao-times.md`).

---

## 7. Finanças (1.2: multianual e interface minimalista)

As duas ferramentas de finanças planejam **vários anos**: o **ano base** é o ano em curso (meses fechados, realizado, alertas) e o **horizonte** é a lista de anos planejados. Um seletor de ano no topo troca o ano em exibição. As telas seguem o princípio de mais gráfico do que texto: **cards de leitura** (número, medidor e uma frase que interpreta, com o card principal em azul cheio), curva acumulada do ano e barras por categoria ou por time. Só tons de azul; vermelho apenas para o que passou do orçado ou do teto.

### 7.1 Finanças do Time (`financas_time.html`)

**Objetivo:** apoiar o dia a dia e o futuro do dinheiro de um time, publicando para o grupo só o agregado.

Menu com 4 entradas; as telas irmãs são abas no topo.

| Menu › aba | Uso | Objetivo |
|---|---|---|
| **Painel › Hoje** | Cards de leitura (previsto × orçado com folga ou excesso, realizado × previsto com a marca de quanto do ano passou, mês atual, teto do grupo ou ano seguinte), curva do ano acumulada com a linha de "hoje", "Onde vai o dinheiro" (barras por categoria com marca do orçado e do teto) e "Pedindo atenção" | Ver a saúde do ano numa tela |
| **Painel › Futuro e cenários** | Previsão rolante, cenários "e se" com **Aplicar ao previsto** e o card **Vários anos** (gráfico e tabela por ano, variação contra o ano anterior, total do horizonte) | Antecipar estouro ou folga, inclusive nos próximos anos |
| **Lançamentos** | Registrar gastos numa linha do plano (filtros por mês e linha); entrada rápida | Registrar o realizado |
| **Plano › Plano mês a mês** | Linhas do plano por mês (orçado, previsto, realizado), visão **Todos os anos** (linhas × anos) e **Fechar mês** | Manter o plano e fechar o mês |
| **Plano › Contratos** | Compromissos recorrentes (início, fim, valor); geram o previsto dos meses seguintes e, por padrão, terminam no fim do último ano do horizonte | Não esquecer gastos já contratados |
| **Ajustes › Grupo e pasta** | Ligar a pasta, ler a diretriz (tetos por ano e categorias), cadastrar a chave de finanças, **Ver o que vai** e **Publicar plano** | Publicar o agregado com segurança |
| **Ajustes › Time e segurança** | Time, ano base e anos do horizonte, seu nome e computador, categorias, trocar senha, baixar cópia cifrada, testar senha, meses fechados | Configurar |

No topo: seletor de ano, **+ Adicionar ano…** (vazio ou copiando o previsto/orçado do ano anterior com reajuste em %), indicador único "salvo e cifrado" + pasta, **Publicar para o grupo**, **← Hub** e **Onde estou?**.

Alertas: categoria acima do teto do ano, mês sem lançamento, contrato vencendo em 60 dias, divergência entre previsto e realizado, ano futuro do horizonte ainda vazio.

### 7.2 Finanças do Grupo (`financas_grupo.html`)

**Objetivo:** somar os planos dos times ano a ano, comparar com o orçamento aprovado e orientar os times, sem nunca alterar o número de um time.

Menu com 3 entradas.

| Menu › aba | Uso | Objetivo |
|---|---|---|
| **Painel › Consolidado** | Cards de leitura e barras por time com marca do orçado e do teto, para o ano escolhido; tabelas por time, categoria, iniciativa, OPEX × CAPEX e **Por ano** (time × ano, orçamento aprovado e saldo de cada ano); **Exportar CSV** com todos os anos | Visão do grupo, ano a ano |
| **Painel › Planos recebidos** | Planos novos dos times com prévia (Aplicar / **Aplicar todos**) e **Saúde da soma** (time sem plano, plano que não cobre o ano em exibição, plano desatualizado, moeda diferente, categoria fora da lista, cópia de conflito) | Só entra no consolidado o que foi revisto |
| **Painel › Versões** | **Fechar versão** (Orçamento original, Reforecast 1…) com todos os anos e comparar com hoje no ano em exibição | Comparar o plano com o que foi aprovado |
| **Times** | Por time: teto por ano e diretriz, gerar/copiar/revogar a chave de finanças, **Publicar diretriz**, **Gerar HTML** de finanças do time | Orientar e equipar os times |
| **Ajustes** | Nome do grupo, ano base e horizonte, orçamento aprovado por ano, versão pedida aos times, centros de custo, itens do grupo (reservas e rateios), categorias OPEX/CAPEX, trocar senha, baixar cópia cifrada | Configurar |

**Consolidação em níveis (1.3).** Um gestor de vários times pode encaminhar o próprio consolidado para a liderança, que também usa o Finanças do Grupo:

| Quem | Onde | O que faz |
|---|---|---|
| Liderança | **Times › + Grupo de outro gestor** | Cadastra o gestor como uma unidade (mesmo identificador do grupo dele) e gera a chave de finanças dele (`<grupo>-fin-AAMM`) |
| Gestor | **Ajustes › Nível acima · sua liderança** | Cola a chave da liderança (ou ela já vem do assistente). Chave de outro grupo é recusada |
| Gestor | **Publicar para a liderança** | Confere o que sobe (totais por ano, unidades que entram e as que ficam de fora) e publica `grupos/<grupo>/financas/plano.json` |
| Liderança | **Painel › Planos recebidos** | Aplica o consolidado do gestor, que soma ano a ano como uma unidade |
| Liderança → gestor | **Publicar diretriz** | O teto por ano desce em `grupos/<grupo>/financas/diretriz.json` e aparece no card do gestor |

Detalhes em [`plano-financas.md`](plano-financas.md), seção 14, e na [ADR-0025](adr/0025-consolidacao-em-niveis.md).

O grupo enxerga os anos do próprio horizonte **mais os anos publicados pelos times**. Um plano de outro ano não é mais descartado: soma no ano a que se refere. Arquivos e planos 1.0 abrem sem perguntar nada (o orçamento e os tetos antigos viram os do ano base).

## 8. Funcionalidades transversais

| Funcionalidade | Onde | Objetivo |
|---|---|---|
| **Senha obrigatória e aviso de cofre** | Todas | Ninguém abre o arquivo sem a senha; a pessoa guarda a senha antes de seguir |
| **Lembrete de teste da senha** | Todas | Descobrir cedo que a senha se perdeu (30 dias, depois a cada 90) |
| **Onde estou?** | Todas | Mostrar ferramenta, versão, arquivo, pasta local, pasta comum e o que vai para cada uma |
| **← Hub** | Central, Quadro, Finanças, Mapa de Férias | Voltar à tela inicial sem recarregar |
| **Backup cifrado rotativo** | Ferramentas com arquivo local | 5 últimas versões em `backup/` e lembrete semanal de exportar |
| **Detecção de cópias de conflito** | Todas que leem a pasta comum | Não perder dado escondido em `arquivo (1).json` |
| **Reconhecer arquivo errado** | Todas | Dizer qual HTML abre aquele arquivo |
| **Uma senha por sessão** | Hub, Central e assistente passam a senha; Finanças, Férias e Central recebem | Abrir pelo hub ou pela Central sem redigitar a senha. Só em memória, uma vez, para a janela recém-aberta ([ADR-0029](adr/0029-uma-senha-por-sessao.md)) |
| **Tema claro, escuro ou automático** | Todas | Botão redondo no canto inferior direito; Automático segue o sistema. A escolha fica só neste computador e vale para todas as ferramentas abertas ([ADR-0027](adr/0027-tema-claro-escuro-compartilhado.md)) |
| **Aviso quando não dá para abrir pastas** | Hub, Finanças, Mapa de Férias e assistente | No Safari, no Firefox, no celular, numa pré-visualização (Outlook, Teams, OneDrive) ou aberto de dentro do .zip, o aviso no topo diz o motivo e o que fazer, e todo botão responde ao clique ([ADR-0030](adr/0030-aviso-quando-nao-da-para-abrir-pastas.md)) |
| **Identidade visual comum** | Todas | Mesmo visual em toda a solução, feito para ficar aberto o dia todo: fundo cinza-azulado (não branco puro), cards brancos, trilho lateral marinho, um único destaque azul por tela, vermelho só para atraso e âmbar só para "vence hoje". Fontes DM Sans (texto) e Plus Jakarta Sans (títulos e números), embutidas no HTML para funcionar sem rede ([ADR-0032](adr/0032-identidade-visual-comum.md)) |
| **Migração automática** | Central (e demais quando o formato muda) | Abrir arquivo antigo na versão nova, com backup |
| **Pacote .zip** | `python3 tools/empacotar.py` (e a CI do repositório pessoal) | Levar a solução para a empresa num único arquivo: HTMLs lado a lado, contratos, documentação e LEIA-ME. Não passa pelo repositório da empresa |

---

## 9. Mapa de Férias (`ferias.html`, 1.1)

Apoio para **enxergar e planejar as ausências** do time e do grupo. Não substitui a ferramenta oficial de férias da empresa: não aprova, não controla saldo. O mesmo HTML serve ao time e ao gestor; o papel é escolhido ao criar o arquivo. Plano e decisões: [`plano-ferias.md`](plano-ferias.md).

| Tela | O que faz | Para quê |
|---|---|---|
| **Mapa** | Cards (fora hoje, pico do período, dias acima do limite, dias úteis sem ninguém fora), mapa de calor por dia, semanas mais cheias e mais tranquilas, barras por unidade; filtros por unidade e período | Ver de relance onde há mais e menos gente fora |
| **Calendário** | Mês a mês, uma linha por pessoa agrupada por unidade, com a contagem do dia no topo | Planejar e ajustar períodos, clicando na célula |
| **Pessoas / Diretos** | Cadastro de pessoas e ausências (férias, folga, treinamento, outra), barra rápida, nota só local | Registrar o que você sabe |
| **Unidades** (gestor) | Times e grupos de outros gestores, chaves, o que foi lido; importar do Hub e das Finanças do Grupo | Somar os níveis de baixo |
| **Ajustes** | Pasta, chave do time ou do nível acima, publicar, limite de pessoas fora, dias úteis, feriados, nomes para cima, senha | Configurar |

**Planejar:** ao marcar uma ausência, o formulário mostra quantas outras pessoas já estão fora e se algum dia passa do limite, e sugere os três períodos com menos gente fora nos próximos seis meses.

**Níveis:** cada membro do time publica o que cadastrou em `times/<time>/ferias/` (sozinho, a cada mudança, com a chave do time); o gestor soma os times, cadastra as próprias férias e as dos diretos e publica o consolidado em `grupos/<grupo>/ferias/` depois de conferir; a liderança cadastra o grupo do gestor como unidade e soma do mesmo jeito ([ADR-0025](adr/0025-consolidacao-em-niveis.md) e [ADR-0026](adr/0026-ferias-em-niveis.md)).

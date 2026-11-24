# Funcionalidades, usos e objetivos

*24/11/2026 · Central v15.2, Quadro do Time 2.2, Hub 1.1, Finanças do Grupo e do Time 1.0, assistente `inicio.html`*

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
| **Cartão "Onde fica cada coisa"** | `onde-fica-cada-coisa.html` | Todos | Mapa em claro (sem dados) de arquivos e pastas |

Todas têm, no topo, **Onde estou?** (qual ferramenta, qual arquivo, o que é local e o que é compartilhado) e **← Hub**.

---

## 3. Assistente inicial (`inicio.html`)

**Objetivo:** fazer a primeira montagem sem a pessoa precisar entender a arquitetura.

| Passo | O que acontece |
|---|---|
| Papel | Gestor de vários times, responsável por um time ou membro de um time |
| Uso | Finanças, tarefas ou os dois |
| Sobre o grupo / time | Nome, slug, prefixo de código, ano fiscal e moeda, pessoas |
| Onde guardar | Pasta **local** (fora do OneDrive) e pasta **sincronizada**; aviso automático se a local parecer sincronizada |
| Senha | Criação da senha com aviso de cofre; para o gestor, geração das chaves dos times |
| Pronto | Grava os HTMLs certos, o primeiro arquivo cifrado de cada um, o hub e o cartão "Onde fica cada coisa" |

| Papel × uso | HTMLs gerados |
|---|---|
| Gestor + finanças | Finanças do Grupo (que gera o Finanças de cada time) |
| Gestor + tarefas | Central (que gera o Quadro de cada time) |
| Responsável + finanças | Finanças do Time |
| Responsável ou membro + tarefas | Quadro do Time |
| Os dois | A soma das linhas, cada HTML separado |

**Quando usar:** uma vez, ou ao trocar de computador.

---

## 4. Hub da solução (`hub.html`)

**Objetivo:** ser a porta de entrada diária e o canal de recados curtos para os times.

| Funcionalidade | Uso | Objetivo |
|---|---|---|
| **Lista de ferramentas** | Mostra os HTMLs da pasta local pelo título e abre cada um numa aba | Não procurar arquivos |
| **Situação por time** | Quando o Quadro, o status, as métricas e o plano financeiro mudaram na pasta | Saber se o time está publicando |
| **Post-its para os times** | Recado curto, com cor, destinatário opcional e "mostrar até"; um ou vários times | Comunicar sem reunião nem e-mail; aparece no topo do Quadro |
| **"Visto por…"** | Mostra quem clicou **Vi** no Quadro | Confirmar leitura |
| **Times e chaves** | Cadastrar times e colar chaves, ou **Importar da Central** (só leitura) | Reaproveitar o que a Central já tem |

---

## 5. Central de Gestão (v15.2)

**Objetivo:** concentrar o trabalho do gestor: o que ele faz, o que delegou, com quem conversa, em quais fóruns decide e como anda o portfólio.

Navegação em 8 páginas (teclas 1 a 8) e o botão **Importar e agentes** no topo.

### 5.1 Hoje (1)
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
- **Uso:** cadastrar iniciativas e features com código (`PAG-042`, `PAG-042.F2`), agrupar features em fases, registrar a atualização de uma linha (diário de bordo), ver o **downstream** dos times abaixo de cada feature.
- **Objetivo:** ver o portfólio e o que está atrasando, com o dado do time chegando sozinho.

### 5.6 Fóruns (6)
- **Abas:** Pautas, Acordos e Staff. Lista lateral para escolher o fórum, com busca.
- **Uso:** fóruns recorrentes com pauta por data (o que não foi discutido passa para a próxima), decisões e compromissos (que viram tarefas), folha de acordos para copiar, imprimir ou baixar; Staff mostra a semana dos times.
- **Objetivo:** reuniões com pauta pronta e acordos que não se perdem.

### 5.7 Times (7)
- **Uso:** cadastro dos times (prefixo e pasta), **Métricas dos times** (fluxo publicado por eles), visão de cada time (backlog, features, reunião de status guiada, folha para o Teams) e **HTML do time** (gera o Quadro já configurado, com aviso de cofre).
- **Objetivo:** acompanhar cada time e entregar a ferramenta pronta.

### 5.8 Integração (8)
- **Uso:** pasta e chaves (gerar, copiar, revogar), arquivos recebidos (com prévia), **Conciliação** (unir épicos, trazer para a Central, ligar itens a features) e **Compartilhar** (tela que mostra o que vai para cada time).
- **Objetivo:** manter a Central e os times falando a mesma língua, sem sobrescrever nada.

### 5.9 Importar e agentes
- **Uso:** copiar um prompt pronto (com o contexto atual) para o agente de reuniões, chats e e-mails; colar o JSON `gestao-import/3` que ele devolve; revisar a prévia; aplicar. Também lê `.ics` do Outlook para séries de reuniões.
- **Prompts:** demandas, delegação, iniciativas e fases, features de uma iniciativa, status, ata (decisões e compromissos), staff, pautas, preparar 1:1, pessoas e times, conciliação, métricas de time sem ferramenta.
- **Objetivo:** transformar o que foi dito em reuniões e mensagens em tarefas e pautas sem digitar.

---

## 6. Quadro do Time (2.2)

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

## 7. Finanças (como está hoje)

> **Em revisão.** A interface de finanças está sendo otimizada em outra frente (telas mais minimalistas, mais gráficos, menos navegação, cards de interpretação e planejamento multianual). Esta seção descreve a **versão 1.0 atual** e será atualizada quando a nova interface entrar. As regras de dados (local × comum, agregados, chave de finanças) não devem mudar.

### 7.1 Finanças do Time (`financas_time.html`)

**Objetivo:** apoiar o dia a dia e o futuro do dinheiro de um time, publicando para o grupo só o agregado.

| Tela | Uso | Objetivo |
|---|---|---|
| **Resumo** | Orçado no ano, previsto no ano, realizado até o mês, saldo previsto; "Pedindo atenção"; por categoria; ano mês a mês | Ver a saúde do ano numa tela |
| **Lançamentos** | Registrar gastos numa linha do plano (filtros por mês e linha); entrada rápida | Registrar o realizado |
| **Plano** | Linhas do plano por mês (orçado, previsto, realizado); **Fechar mês** | Manter o plano e fechar o mês |
| **Contratos** | Compromissos recorrentes (início, fim, valor), restante no ano; geram o previsto dos meses seguintes | Não esquecer gastos já contratados |
| **Futuro** | Previsão rolante até o fim do ano; cenários "e se" com **Aplicar ao previsto** | Antecipar estouro ou folga |
| **Grupo** | Ligar a pasta, ler a diretriz (tetos e categorias), cadastrar a chave de finanças, **Ver o que vai** e **Publicar plano** | Publicar o agregado com segurança |
| **Ajustes** | Time e ano, seu nome e computador, categorias, trocar senha, baixar cópia cifrada, testar senha, meses fechados | Configurar |

Alertas: categoria acima do teto, mês sem lançamento, contrato vencendo em 60 dias, divergência entre previsto e realizado.

### 7.2 Finanças do Grupo (`financas_grupo.html`)

**Objetivo:** somar os planos dos times, comparar com o orçamento aprovado e orientar os times, sem nunca alterar o número de um time.

| Tela | Uso | Objetivo |
|---|---|---|
| **Consolidado** | Orçamento aprovado do grupo, orçado (times + grupo), previsto, realizado, saldo; cortes por mês, categoria, time, iniciativa e OPEX/CAPEX; exportar CSV | Visão do grupo |
| **Ler pasta** | Planos novos dos times com prévia (Aplicar / Aplicar todos) e **Saúde da soma** (time sem plano, plano desatualizado, moeda diferente, categoria fora da lista, cópia de conflito) | Só entra no consolidado o que foi revisto |
| **Times** | Por time: teto e diretriz, gerar/copiar/revogar a chave de finanças, publicar diretriz, gerar o **HTML de finanças do time** | Orientar e equipar os times |
| **Versões** | Fechar uma versão (Orçamento original, Reforecast 1…) e comparar com hoje | Comparar o plano com o que foi aprovado |
| **Ajustes** | Nome do grupo, ano fiscal, orçamento aprovado, versão pedida aos times, centros de custo, itens do grupo (reservas e rateios), categorias OPEX/CAPEX, trocar senha, baixar cópia cifrada | Configurar |

---

## 8. Funcionalidades transversais

| Funcionalidade | Onde | Objetivo |
|---|---|---|
| **Senha obrigatória e aviso de cofre** | Todas | Ninguém abre o arquivo sem a senha; a pessoa guarda a senha antes de seguir |
| **Lembrete de teste da senha** | Todas | Descobrir cedo que a senha se perdeu (30 dias, depois a cada 90) |
| **Onde estou?** | Todas | Mostrar ferramenta, versão, arquivo, pasta local, pasta comum e o que vai para cada uma |
| **← Hub** | Central, Quadro, Finanças | Voltar à tela inicial sem recarregar |
| **Backup cifrado rotativo** | Ferramentas com arquivo local | 5 últimas versões em `backup/` e lembrete semanal de exportar |
| **Detecção de cópias de conflito** | Todas que leem a pasta comum | Não perder dado escondido em `arquivo (1).json` |
| **Reconhecer arquivo errado** | Todas | Dizer qual HTML abre aquele arquivo |
| **Migração automática** | Central (e demais quando o formato muda) | Abrir arquivo antigo na versão nova, com backup |

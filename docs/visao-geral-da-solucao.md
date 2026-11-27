# Visão geral da solução · Central de Gestão, Quadro do Time e integração

*27/11/2026 · estado atual: Remessa · Central v15.21, Quadro do Time 2.8.1, Hub 2.4.1, Finanças do Grupo 1.7.2 e do Time 1.5.2, Mapa de Férias 1.5.2 (dentro da Central) e contratos 1.2 (detalhes em `docs/plano-v15.md`, `docs/plano-hub.md`, `docs/plano-financas.md` e [`contratos/`](../contratos/LEIA-ME.md))*

> **Por onde começar:** [funcionalidades, usos e objetivos](funcionalidades.md) · [jornada do usuário](jornada-do-usuario.md) · [passo a passo](passo-a-passo.md) · [decisões de arquitetura (ADRs)](adr/README.md)

Este documento explica a solução como um todo: quais ferramentas existem, para quem é cada uma, como os dados circulam entre elas e onde está a documentação detalhada de cada parte. É o ponto de partida para quem chega agora; os detalhes técnicos ficam nos documentos citados em cada seção.

---

## 1. Em uma página

A solução se chama **Remessa** ([ADR-0037](adr/0037-nome-remessa.md)): envelopes lacrados (arquivos cifrados com a chave de cada time) numa caixa postal (a pasta compartilhada). Só quem tem a chave abre; o que chega de outra pessoa é uma **nova remessa**.

A solução é um pequeno ecossistema de **ferramentas HTML de arquivo único**, sem servidor, sem instalação e sem chamadas de rede. Cada ferramenta guarda os dados num arquivo separado do HTML, e as ferramentas conversam apenas por **arquivos JSON cifrados numa pasta do SharePoint sincronizada** no computador de cada um.

```
                         ┌──────────────────────────────────────────────┐
  Agentes do Fernando    │          Central de Gestão (Fernando)         │
  (reuniões, chats,  ───►│  gestao_pessoal_v15.html + arquivo de dados   │
   e-mails)  JSON        │  cifrado com a senha do gestor               │
   gestao-import/3       └───────────────┬──────────────▲───────────────┘
                                         │ catálogo      │ status e métricas
                                         ▼ (Compartilhar)│ (lidos com prévia)
                 ┌────────────────────────────────────────────────────────┐
                 │  Pasta SharePoint "Gestao-Compartilhado" (tudo cifrado) │
                 │   central/catalogo-<time>.json   ← só a Central escreve │
                 │   times/<time>/status.json       ← só o time escreve    │
                 │   times/<time>/metricas.json     ← só o time escreve    │
                 └───────────────┬──────────────▲─────────────────────────┘
                                 ▼ lê catálogo   │ publica backlog e métricas
                 ┌────────────────────────────────────────────────────────┐
                 │  Ferramenta de cada time                                │
                 │  Quadro do Time 2.3 (pronto) ou ferramenta própria      │
                 │  adaptada ao contrato                                   │
                 └────────────────────────────────────────────────────────┘

  Ferramenta de feedbacks: faz parte do ecossistema, funciona por conta própria
  e não troca dados com nenhuma das ferramentas acima.
```

O desenho mostra só a troca de tarefas. Pela mesma pasta passam as finanças, os post-its do hub e os consolidados de finanças e férias para a liderança; o layout completo está em [`contratos/01-arquitetura.md`](../contratos/01-arquitetura.md).

| Peça | O que é | Quem usa | Onde está |
|---|---|---|---|
| **Hub da solução** | Cockpit de gestão (2.3): login único, cards e lista de atenção de todos os módulos (lidos sem gravar), abre as outras ferramentas e deixa post-its cifrados para os times, que aparecem no Quadro | Fernando (e quem quiser) | Repositório: `hub.html`, plano em `docs/plano-hub.md` |
| **Central de Gestão v15** | Gestão pessoal e de portfólio do gestor: tarefas, delegação, iniciativas e features, rituais, pessoas, métricas e integração com os times | Fernando | Repositório: `gestao_pessoal_v15.html`, plano em `docs/plano-v15.md`. Projeto: `gestao-v15/` |
| **Quadro do Time 2.8** | Quadro de cards, backlog, refinamento com o time, sprints, iniciativas ligadas à Central e métricas de fluxo do time | Cada time | Repositório e projeto: `ferramenta-time/` (HTML, guia, telas) |
| **Finanças do Grupo e do Time** | Plano financeiro multianual de cada time (lançamentos locais, plano agregado publicado) e consolidado do grupo ano a ano contra o orçamento, com cards de leitura e gráficos | Fernando (grupo) e responsável financeiro de cada time | Repositório: `financas/`, plano em `docs/plano-financas.md` |
| **Férias (página da Central)** | Férias e ausências em níveis (gestor → liderança): mapa de calor dos dias com mais e menos gente fora, calendário e sugestão de períodos. Fica na página **Férias da Central** (mesmo arquivo e senha, [ADR-0033](adr/0033-ferias-dentro-da-central.md)) e só o gestor cadastra, inclusive as pessoas dos times ([ADR-0036](adr/0036-ferias-so-o-gestor-cadastra.md)). Apoio, não substitui a ferramenta oficial | Gestores e liderança | Repositório: página Férias em `gestao_pessoal_v15.html`, montada a partir de `financas/src/ferias.html`; plano em `docs/plano-ferias.md` |
| **Assistente inicial** | Monta a solução para o papel da pessoa e cria os primeiros arquivos cifrados | Quem está começando | Repositório: `inicio.html` |
| **Visual experimental** | As mesmas ferramentas no visual novo (trilho marinho, DM Sans), com os mesmos dados, para experimentar ao lado das atuais | Quem quiser | Pacote: pasta `experimental/`, montada do main por `tools/build_experimental.py` a partir de `experimental/src/` ([ADR-0034](adr/0034-visual-experimental.md)) |
| **Integração** | Pasta SharePoint, contratos JSON versionados, envelope cifrado, chaves por time | Central, hub, finanças e ferramentas dos times ou de outras soluções | Repositório e .zip: [`contratos/`](../contratos/LEIA-ME.md) (fonte única, [ADR-0032](adr/0032-pasta-de-contratos.md)). Histórico do desenho: projeto, `integracao-time/` (documentos 00 a 06) |
| **Agentes do Fernando** | Agentes com acesso a reuniões, chats e e-mails que geram arquivos de importação para a Central | Fernando | Projeto: `integracao-time/06-prompts-para-agentes.md` |
| **Ferramenta de feedbacks** | Ferramenta separada para registrar feedbacks | Fernando | Fora deste repositório. Sem integração (seção 10) |

---

## 2. Princípios que valem para todas as ferramentas

1. **Um HTML, um arquivo de dados.** O HTML nunca guarda dados, então pode ser trocado por uma versão nova a qualquer momento. Os dados ficam num JSON separado.
2. **Sem servidor.** Nada de API, banco externo ou endpoint. Leitura e gravação pela File System Access API do navegador (**Edge ou Chrome**). Sem a API, há um plano B de baixar e enviar arquivos. Onde a API falta (Safari, Firefox, celular, pré-visualização do Outlook/Teams/OneDrive) ou o arquivo foi aberto de dentro do .zip, cada ferramenta diz o motivo e o que fazer ([ADR-0030](adr/0030-aviso-quando-nao-da-para-abrir-pastas.md)).
3. **Tudo cifrado.** O arquivo de dados da Central é cifrado com a senha do gestor (AES-GCM, PBKDF2 com 600 mil iterações). Os arquivos da pasta de integração são cifrados com chaves aleatórias por time (AES-256-GCM). As duas coisas são independentes.
4. **Migração aditiva.** Cada versão nova abre o arquivo da anterior, migra sozinha e baixa um backup do original. Versões antigas ficam em `legacy/`.
5. **Entrada de fora é só dado.** Nada que vem de um time ou de um agente vira HTML ou código. Textos são escapados, links só `https://`, tamanhos limitados.
6. **Nada muda sem o gestor ver.** Importações e arquivos dos times passam por uma prévia antes de serem aplicados.
7. **Dado individual local, pedaço comum sincronizado.** Cada ferramenta guarda o detalhe numa pasta pessoal só sua (de preferência no seu OneDrive); na pasta sincronizada vai só o que o outro lado precisa, de preferência agregado (desde 23/11/2026).
8. **Um escritor por arquivo.** Cada arquivo comum tem um único dono (pessoa + computador), é um retrato completo com revisão sempre maior, e cópias de conflito do OneDrive são detectadas e resolvidas.
9. **HTMLs desacoplados.** As ferramentas se encontram pela pasta comum. Ler o arquivo de outra é exceção, só de leitura e com a senha dela: o hub resume a Central no cockpit e importa times e chaves; a Central importa as chaves de finanças do Finanças do Grupo ([ADR-0010](adr/0010-htmls-desacoplados.md), [ADR-0035](adr/0035-hub-cockpit-de-gestao.md)).
10. **Mesma identidade no claro e no escuro, com o estilo à escolha.** Um painel **Preferências** comum (Modo: Claro, Escuro, Automático; Estilo visual: Remessa, Sereno, Clássico, Experimental; [ADR-0043](adr/0043-estilos-remessa-e-sereno.md), [ADR-0044](adr/0044-preferencias-de-estilo-visual.md)) em todas as ferramentas; a escolha fica só no computador e o escuro é aplicado por uma camada única, `financas/src/tema.js`, injetada no build (desde 24/11/2026).

Cada princípio tem uma decisão registrada em [`docs/adr/`](adr/README.md).

---

## 3. Central de Gestão (v15)

A ferramenta do Fernando. Abre com dois cliques em `gestao_pessoal_v15.html`, pede o arquivo de dados e a senha.

### 3.1 Telas

| Tecla | Página | Para quê |
|---|---|---|
| 1 | **Hoje** | Tarefas do dia, atrasos, 1:1 da semana, fóruns dos próximos 7 dias, iniciativas pedindo atenção, o cartão **Dos times** (arquivos novos, alertas, épicos sem vínculo, times sem chave) e **Fora hoje** (férias e ausências) |
| 2 | **Tarefas** | Vistas Minhas, Delegadas (o que está com quem, prazos, cobranças e aderência) e Todas; tarefas ligadas a uma feature, a uma iniciativa ou a nada |
| 3 | **1:1** | Pessoa 360: indicadores, pauta (minha, dos agentes, combinados e sugestões), trabalho, iniciativas, feedback, histórico e perfil; modo Em conversa com resumo para copiar |
| 4 | **Feedback** | Ciclos de feedback e evidências por pessoa |
| 5 | **Férias** | Mapa de Férias do grupo dentro da Central: mapa de calor, calendário, pessoas (você, diretos e as pessoas de cada time, cadastradas por você), times da Central e grupos de outros gestores, publicar para a liderança |
| 6 | **Iniciativas** | Lista (feito × prazo, fases, próxima feature, painel com abas), Semana, Horizonte, Linha do tempo com fases sobrepostas e Dependências |
| 7 | **Fóruns** | Pautas por data (o que não foi discutido rola para a próxima), Acordos (decisões e compromissos) e Staff (semana dos times) |
| 8 | **Times** | Cadastro dos times (prefixo de código e pasta de integração), Métricas dos times (fluxo publicado por eles) e visão de cada time com reunião de status guiada e folha para o Teams |
| 9 | **Integração** | Pasta e chaves, **Remessas** (arquivos que chegaram dos times; cada um ainda não aplicado é uma "nova remessa"), conciliação e compartilhamento com os times |

Teclas 1 a 9 trocam de página. O botão do topo **Importar e agentes** reúne a importação de JSON e os prompts para os agentes.

### 3.2 Histórico das versões

| Versão | O que trouxe |
|---|---|
| v11 | Base: tarefas, delegação, iniciativas, pessoas, arquivo cifrado com senha |
| v12 | Fóruns recorrentes com pautas por data, acordos compartilháveis (decisões e compromissos que viram tarefas), visão diária de iniciativas, PBKDF2 600 mil |
| v13 | Visão do time, reunião de status guiada pelo fórum do time, folha para colar no Teams |
| v14 | Modelo Iniciativa › Feature, integração com os times, métricas dos times, importação `gestao-import/3` com 12 prompts para agentes, menu agrupado, painel da iniciativa redesenhado |
| v15 | Navegação em 8 páginas sem telas duplicadas, Pessoa 360 no 1:1 com modo Em conversa e sessões registradas, formulários num padrão único |
| v15.9 | Página **Férias**: o Mapa de Férias do gestor e da liderança entra na Central (mesmo arquivo e senha, times e chaves da Integração) e a Hoje mostra quem está fora |
| v15.10 | Aberta pelo hub, entra direto com a senha da sessão quando o navegador já liberou o arquivo; o Hub 2.0 vira o cockpit de gestão e lê o resumo dela sem gravar ([ADR-0035](adr/0035-hub-cockpit-de-gestao.md)) |
| v15.11 | Só o gestor cadastra as férias: aba **Pessoas** com as pessoas de cada time e **Trazer pessoas da Central**; todos os times viram unidades; o `ferias.html` sai do pacote e do assistente ([ADR-0036](adr/0036-ferias-so-o-gestor-cadastra.md)) |
| v15.12 | Remessa: o nome da solução, o ícone da aba com o lacre azul e a aba **Remessas** na Integração; arquivo que chegou dos times é uma "nova remessa" ([ADR-0037](adr/0037-nome-remessa.md)) |
| v15.13 | Tela de entrada da Remessa (fundo marinho, painel com o link **Conheça a Remessa**) e a página `apresentacao.html` ([ADR-0037](adr/0037-nome-remessa.md)) |
| v15.14 | Entrada em dois passos em todas as ferramentas: primeiro o arquivo, depois a senha; versão só no rodapé ([ADR-0037](adr/0037-nome-remessa.md)) |
| v15.16 | Tela de entrada com a caixa **Visual experimental**: liga e desliga o visual novo em todas as ferramentas e lembra a escolha ([ADR-0038](adr/0038-ligar-visual-experimental-na-entrada.md)) |
| v15.17 | Prévia da importação dos agentes com **descartar linhas**: cada linha nova ou atualizada pode ser desmarcada antes de confirmar ([ADR-0013](adr/0013-downstream-previa-e-conciliacao.md)) |
| v15.18 | Feature criada pelo time chega com os cards dela (`featureLocalId`): na conciliação e no painel da iniciativa aparece com a contagem, e ligada a uma feature da Central leva os cards junto, recuados no downstream ([ADR-0039](adr/0039-hierarquia-iniciativa-feature-card.md)) |
| v15.19 | Aba **Sprints** no time, cartão **Sprints dos times** em Hoje e bloco Sprint na reunião de status: a sprint e o resultado dela chegam do Quadro 2.8 (contratos 1.2) e a Central guarda o histórico ([ADR-0042](adr/0042-sprint-sincronizada-com-a-central.md)) |
| v15.20 | Estilos **Remessa** (padrão: trilho e topo marinhos, escuro azul-noite) e **Sereno** (menos estímulo visual) em todas as ferramentas ([ADR-0043](adr/0043-estilos-remessa-e-sereno.md)) |
| v15.21 | Painel **Preferências** (botão do topo, botão redondo do canto e card nos Ajustes das outras ferramentas): Modo e **Estilo visual** Remessa, Sereno, Clássico (o de antes) ou Experimental; topo do Quadro de volta ao marinho no Remessa ([ADR-0044](adr/0044-preferencias-de-estilo-visual.md)) |

Detalhes da v15: `docs/plano-v15.md` (e da v14 em `docs/plano-v14.md`).

---

## 4. Modelo de dados: Iniciativa › Feature, fases e tarefas

```
Iniciativa  PAG-042  Pix parcelado no app
 ├─ Feature  PAG-042.F1  Simulação de parcelas      ┐ Fase PAG-042.P1 Construção  (01/10 a 28/11)
 ├─ Feature  PAG-042.F2  Contratação no app         ┘ Fase PAG-042.P2 Homologação (10/11 a 05/12)  ← fases sobrepostas
 │    └─ downstream do time Pagamentos: CARD-295, CARD-301 … 3 de 5 concluídos (só leitura)
 │         ◆ FEAT-7 Painel de erros (feature do time, ligada a esta) ─ CARD-340, CARD-344 recuados
 ├─ Feature  PAG-042.F3  Piloto com 1% da base      ─ Fase PAG-042.P3 Piloto (01/12 a 19/12)
 └─ Tarefas ligadas à iniciativa ou a uma feature (minhas e delegadas), sem hierarquia própria
```

| Entidade | Regras |
|---|---|
| **Iniciativa** | Pertence a um time. Código `<PREFIXO>-<nnn>` (ex.: `PAG-042`). O andamento automático conta features concluídas ÷ features. Pode depender de outras iniciativas |
| **Feature** | O antigo "entregável". Pertence a **uma** iniciativa e **nunca muda de iniciativa** (a única exceção é unir duas iniciativas que são a mesma). Está em **no máximo uma fase**. Pode **depender de outra feature**. Código `PAG-042.F2` |
| **Fase** | Não é mais nível da hierarquia: é um **agrupamento de features no tempo**. Fases podem começar juntas e **se sobrepor**. Código `PAG-042.P1`. Serve só de contexto para os times |
| **Tarefa** | **Desacoplada**: ligada a uma feature, a uma iniciativa ou a nada. Compromissos de reunião viram tarefas |
| **Feature do time** | Criada no Quadro (`FEAT-7`) quando a Central ainda não tem a feature, ou para iniciativas só do time. Mesma regra da feature da Central: pertence a uma iniciativa e não muda dela. Chega como item `kind: "feature"`, e os cards dela trazem `featureLocalId`. Na conciliação, **Ligar** ou **Criar feature** leva os cards junto ([ADR-0039](adr/0039-hierarquia-iniciativa-feature-card.md)) |
| **Item do time** | Card que vem do `status.json` do time. Quando ligado a uma feature, aparece **abaixo dela** como acompanhamento (downstream). **Nunca vira tarefa nem feature** e nunca altera a feature; no máximo a Central sugere "Concluir feature?" |

**Códigos.** O prefixo do time (2 a 5 letras, ex.: `PAG`) é definido ao criar o time e trava depois do primeiro código. Todos os códigos são imutáveis e nunca reutilizados; quem muda de time mantém o código original. O `id` interno continua sendo a chave interna; o código é a chave pública da troca com os times.

**A mesma hierarquia nos times.** O Quadro do Time trabalha em **Iniciativa › Feature › Card**: a feature vem da Central ou é criada pelo time, e o card fica em no máximo uma feature. A tarefa do gestor continua desacoplada; o card do time nunca vira tarefa ([ADR-0039](adr/0039-hierarquia-iniciativa-feature-card.md)).

Documento detalhado: `integracao-time/04-modelo-iniciativa-feature.md`.

---

## 5. Quadro do Time (2.7)

A ferramenta pronta para os times. Também é um HTML único (`ferramenta-time/quadro_do_time_v1.html`), aberto no Edge ou Chrome.

| Tela | Para quê |
|---|---|
| **Quadro** | Kanban com raias (iniciativa, feature ou pessoa), barras de WIP, envelhecimento dos cards, entrega recolhida, filtros rápidos, faixa de pulso e card em painel lateral; aviso quando a feature do card depende de outra ainda aberta. A coluna Backlog fica fora do quadro (opção em Ajustes) |
| **Backlog** | Lista agrupável (iniciativa, feature, responsável, sprint) com filtros e "+ Card" em cada grupo |
| **Novo card e criação rápida** | Formulário no padrão da tarefa da Central e barra rápida: `Ajustar retry @ana amanhã #PAG-042 F2 !bug` |
| **Refinamento** | Com o time: árvore Iniciativa › Feature, mover cards entre features (arrastar ou **M**), dividir, juntar, desfazer; tamanho, critérios de aceite e pronto para sprint; desenhar as próximas sprints (feature × sprint, capacidade pela vazão, previsão × prazo) e planejar a sprint (objetivo, prontos, Iniciar); resumo da sessão para o Teams ([ADR-0041](adr/0041-refinamento-no-quadro.md)) |
| **Sprints** | Planejar, iniciar, fechar; ao fechar, registra se o objetivo foi atingido e pergunta se publica as métricas |
| **Iniciativas** | Ligadas à Central, só do time, da Central ainda sem épico (botão Trazer) e concluídas; detalhe com progresso, bloqueios, previsão e as **features** (da Central e do time) com os cards de cada uma; **+ Feature do time** |
| **Exportar** | CSV dos cards ou JSON legível (Iniciativa › Feature › Card), sem criptografia, só depois de confirmar ([ADR-0040](adr/0040-exportar-dados-legiveis-com-confirmacao.md)) |
| **Métricas** | Vazão, lead time, cycle time, WIP, idade do WIP, fluxo cumulativo, demanda, compromisso cumprido, % bloqueado e outras; "Ver JSON" mostra o que vai para a Central |
| **Central** | Slug do time, chave, pasta, catálogo, situação das publicações |
| **Ajustes** | Nome do time, pessoas (desativar quem saiu), colunas (compromisso e início), senha, cópia cifrada e exportação legível |

Como funciona por dentro:
- Cada pessoa tem o próprio arquivo local, **sempre cifrado com senha** (obrigatória desde o Quadro 2.1), e publica as próprias alterações em `times/<time>/quadro/<pessoa>-<computador>.json`, cifrado com a chave do time.
- Quem abre o Quadro lê os arquivos de todos a cada 20 s e une as mudanças card a card (vence a alteração mais recente). Ninguém grava o arquivo de outra pessoa, então o OneDrive não gera cópias de conflito. O antigo `quadro-<slug>.json` compartilhado continua sendo aberto e migrado.
- No topo do quadro aparecem os **post-its** deixados pelo hub; **Vi** grava o recibo de leitura.
- O catálogo da Central fica guardado cifrado no navegador. Quando chega um catálogo novo, o Quadro avisa **Nova remessa da Central** (2.3.1).

**Times com ferramenta própria** não precisam trocar: o guia `ferramenta-time/guia-adaptacao-times.md` explica o caminho B (adaptar a ferramenta atual copiando as funções do Quadro), e o pacote `integracao-time/03-pacote-para-agentes-do-time.md` traz o contrato completo, código de referência, checklist e um prompt pronto para o agente de desenvolvimento do time.

---

## 6. Integração pela pasta SharePoint

### 6.1 A pasta

Desde 23/11/2026 o nome recomendado é `Gestao-Compartilhado` (biblioteca SharePoint sincronizada pelo cliente do OneDrive); `Gestao-Integracao` continua aceito. A pasta também recebe finanças (`grupo/financas/`, `times/<time>/financas/`), o Quadro por pessoa (`times/<time>/quadro/`), os post-its (`times/<time>/postits/`), as férias publicadas por outra solução (`times/<time>/ferias/<pessoa>-<computador>.json`; a solução não grava ali desde a 15.11) e os consolidados de cada grupo para a liderança (`grupos/<grupo>/financas/` e `grupos/<grupo>/ferias/`, [ADR-0025](adr/0025-consolidacao-em-niveis.md) e [ADR-0026](adr/0026-ferias-em-niveis.md)); a árvore completa está na [ADR-0004](adr/0004-troca-por-arquivos-na-pasta-sincronizada.md).

```
Gestao-Compartilhado/                   (administrada pelo Fernando)
  contrato/                             opcional: cópia de contratos/ para quem integra, em claro e sem dados
  central/catalogo-<slug>.json          a Central escreve; o time só lê
  times/<slug>/status.json              o time escreve: backlog (a Central e o hub leem)
  times/<slug>/metricas.json            o time escreve: métricas do time (a Central e o hub leem)
  times/<slug>/quadro/<w>.json          cada pessoa do Quadro escreve o seu
  times/<slug>/financas/plano.json      o responsável financeiro do time escreve
  times/<slug>/postits/…                post-its do hub e recibos "Vi"
  grupo/financas/diretriz-<slug>.json   o Finanças do Grupo escreve
  grupos/<grupo>/financas/ e ferias/    consolidados do gestor para a liderança
```

Cada time edita só a própria pasta `times/<slug>` e lê `central/`. O "barramento" é o cliente de sincronização do OneDrive que já existe nas máquinas. Em cada computador, a pasta fica marcada como **Sempre manter neste dispositivo**: com os "Arquivos sob demanda", um arquivo que está só na nuvem não chega às ferramentas (o assistente orienta isso desde a versão 2.5).

### 6.2 Regras da troca

| Regra | Significado |
|---|---|
| Um escritor por arquivo | Evita cópias de conflito e dispensa travas |
| Retrato completo | Cada publicação reescreve o arquivo inteiro, com `revision` sempre maior. Ler duas vezes dá o mesmo resultado |
| Contrato versionado | Todo conteúdo começa com `"schema": "gestao-xxx/1"`. Campos novos opcionais não mudam a versão; quem lê ignora o que não conhece |
| Conflitos do SharePoint | Se aparecer `status (1).json`, a Central lê as cópias e fica com a de `generatedAt` mais recente, avisando |
| Cada lado manda nos seus campos | Iniciativas, features, prazos e fases são da Central; andamento granular, status reportado, itens e métricas são do time. Divergência vira alerta, nunca sobrescrita silenciosa |

### 6.3 Os contratos

| Arquivo | Contrato | Conteúdo | Quando é publicado |
|---|---|---|---|
| `central/catalogo-<slug>.json` | `gestao-catalogo/1` | Iniciativas **daquele time** com código, responsável, horizonte, datas, features (com fase e dependências) e fases; `links[]` e `aliases[]` da conciliação | **Só pelo botão Compartilhar**, numa tela que mostra o já compartilhado, o novo, o alterado, o que sai e o que fica só na Central |
| `times/<slug>/status.json` | `gestao-status/1` | Iniciativas do time (ligadas ou não), status reportado, previsão, bloqueios e os itens do time | **Automaticamente** a cada movimentação de card (espera de ~10 s para agrupar mudanças) |
| `times/<slug>/metricas.json` | `gestao-metricas/1` | Métricas autodescritivas do time, com o campo `sprint` | **Ao fechar a sprint, com confirmação**, ou pelo botão "Publicar métricas agora" |

Os três vão dentro do envelope `gestao-envelope/1`. Schemas (JSON Schema 2020-12) de **todos** os arquivos trocados (também finanças, férias e post-its), exemplos em claro e cifrados, vetores de teste e o validador ficam em [`contratos/`](../contratos/LEIA-ME.md) ([ADR-0032](adr/0032-pasta-de-contratos.md)).

**Outras soluções** (ferramenta própria de um time, planilha de um gestor par, agente) se acoplam pelos mesmos arquivos: o guia [`contratos/05-como-integrar.md`](../contratos/05-como-integrar.md) mostra o que gravar para aparecer no hub do gestor e na visão da liderança, e `node contratos/validar.js` confere antes de publicar.

### 6.4 Criptografia e chaves

- **Uma chave por time**, 256 bits aleatórios gerados pela Central, **diferente da senha que abre a Central**. Quem tem a chave do Pagamentos lê só os arquivos do Pagamentos.
- A mesma chave serve para a Central cifrar o catálogo do time e para o time cifrar status e métricas.
- **Envelope:** cabeçalho em claro (schema, conteúdo, time, `kid`, revisão, data) e conteúdo cifrado em AES-256-GCM com IV novo a cada gravação. O cabeçalho entra como dado associado, então alterá-lo faz a decifragem falhar.
- **Entrega:** o texto `GK1.<kid>.<chave>` vai por mensagem direta no Teams ou por e-mail ao responsável do time, **nunca pela pasta**.
- **Troca:** só em caso de vazamento. "Revogar agora" invalida a chave na hora e a Central gera outra. Time novo só ganha a própria chave.
- **Onde ficam:** na Central, dentro do arquivo de dados (protegido pela senha do gestor). No time, como chave não exportável no navegador de quem publica.
- **O que fica visível sem chave:** nomes de arquivos e pastas, slug, `kid`, revisão, data e tamanho. Nomes, pessoas, status e métricas ficam cifrados.
- **Limites assumidos:** a chave é compartilhada dentro do time e não há assinatura digital; a Central sabe que o arquivo veio de alguém do time, não de qual pessoa.

Implementação de referência, sem dependências: [`contratos/referencia/cripto.js`](../contratos/referencia/cripto.js), com vetores de teste em `contratos/vetores/` ([especificação](../contratos/02-criptografia.md)).

### 6.5 O que sai da Central

Somente código, nome, responsável, horizonte, datas, features e fases das iniciativas daquele time. **Nunca** tarefas pessoais, notas de 1:1, fóruns, avaliações ou métricas por pessoa. Cada iniciativa pode ser marcada para não ser compartilhada.

Documentos detalhados: [`contratos/01-arquitetura.md`](../contratos/01-arquitetura.md), [`02-criptografia.md`](../contratos/02-criptografia.md) e [`03-regras-de-escrita.md`](../contratos/03-regras-de-escrita.md). O desenho original (15/11/2026, com a tela de compartilhamento e a cadência) está em `integracao-time/01` e `05`, na pasta do projeto.

---

## 7. Conciliação entre a Central e os times

Iniciativas nascem dos dois lados: na Central (com código, vão ao time pelo catálogo) e no time (épicos que o time abriu por conta própria, chegam com `ref: null`). A tela **Integração › Conciliação** junta os dois universos:

| Bloco | Ações |
|---|---|
| Épicos do time sem vínculo | **Unir** a uma iniciativa da Central, **Trazer para a Central** (cria a iniciativa com os itens como sugestão de features) ou **Ignorar**. Há sugestão de par por nome e por agente |
| Itens do time sem feature | **Ligar** a uma feature, **Criar feature** a partir do item ou **Ignorar**. Feature do time (◆) aparece com a contagem de cards; ligada ou criada, leva os cards junto, e o Quadro passa os cards para o código da Central no próximo catálogo |
| Uniões feitas | **Desfazer** |

Unir duas iniciativas da própria Central também é possível: escolhe-se a principal, tudo passa para ela, e o código da outra continua aceito como apelido. No próximo compartilhamento, o catálogo leva `links[]` e `aliases[]` e a ferramenta do time grava os códigos sozinha.

**As métricas do time consideram o backlog inteiro**, com e sem vínculo. O vínculo só decide onde um item aparece como downstream, nunca se ele entra na métrica.

---

## 8. Métricas

### 8.1 Escopo
Na v1, **só métricas do time**, calculadas pela ferramenta do time a partir da movimentação de cards. Métricas por pessoa têm formato reservado (arquivo e contrato separados), mas **não estão implementadas nem são aceitas**.

### 8.2 Métricas autodescritivas
Cada métrica traz os dados **e** a descrição de como desenhá-los (tipo de valor, unidade, granularidade, forma dos dados, visualização sugerida, direção boa). A Central **não calcula nada**: só desenha. Assim cada time pode medir o que quiser sem mudar a Central.

Visualizações suportadas: KPI, linha, barras, empilhado, área, histograma, medidor e tabela.

### 8.3 Métricas padrão
`throughput` (vazão), `sprint_closed`, `lead_time`, `cycle_time`, `wip`, `wip_age`, `cfd` (fluxo cumulativo), `blocked_pct`, `predictability` (compromisso cumprido), `items_on_time` e `arrival_rate` (demanda que chega). Definições no dicionário [`contratos/schemas/dicionario-metricas.json`](../contratos/schemas/dicionario-metricas.json) e no schema [`gestao-metricas-1`](../contratos/schemas/gestao-metricas-1.schema.json); o texto original está em `integracao-time/02-esquema-de-metricas.md`, seção 6 (pasta do projeto).

### 8.4 Dicionário e tolerância a erro
- O dicionário `contratos/schemas/dicionario-metricas.json` casa as métricas recebidas pelo campo `standard`, por apelido ou por mapeamento manual feito na Central. Métricas casadas podem ser **comparadas entre times**.
- Métricas não mapeadas são aceitas e desenhadas no grupo "Outras métricas do time".
- Cada métrica é tratada isoladamente: dado inválido vira lacuna, e o que não dá para desenhar vira um cartão "não foi possível exibir", sem quebrar a tela.

---

## 9. Agentes de reuniões, chats e e-mails

O Fernando usa agentes com acesso às transcrições de reuniões, chats e e-mails. Eles alimentam a Central **por arquivo**, não por integração direta:

1. Na Central, **Importar e agentes › Prompts para agentes** (ou o botão "Prompt para agente" no painel da iniciativa, na conciliação e nas métricas) copia um prompt já com o contexto atual: pessoas, times, iniciativas e features com códigos, fases e fóruns.
2. O agente responde **apenas com um JSON** no contrato `gestao-import/3`.
3. O JSON é colado ou escolhido em **Importar JSON**, passa pela prévia e só então é aplicado. Na prévia, as linhas que não servem podem ser desmarcadas e ficam de fora. Reimportar não duplica nada (correspondência por `externalId` ou código).

| Funcionalidade | Prompt |
|---|---|
| Demandas | Pendências e prioridades |
| Delegação | Delegações a cobrar |
| Iniciativas | Iniciativas e fases |
| Painel da iniciativa | Features de uma iniciativa |
| Reunião de status | Atualização de status das iniciativas |
| Fóruns | Ata: decisões e compromissos · Staff da semana · Pautas para meus fóruns |
| Pessoas | Preparar um 1:1 · Pessoas e times |
| Integração | Conciliar iniciativas do time (vira sugestão; nada é unido sem confirmação) |
| Métricas | Métricas de fluxo de um time sem ferramenta (arquivo `gestao-metricas/1` sem cifra) |

Garantias do importador: só aceita JSON; campos inválidos viram aviso; uma feature nunca muda de iniciativa nem fica em mais de uma fase; vínculos com times nunca são feitos sem confirmação. O formato `gestao-import/2` continua aceito.

Documento detalhado com os 12 prompts: `integracao-time/06-prompts-para-agentes.md`. Modelo de arquivo: `integracao-time/exemplos/agentes/modelo-gestao-import-3.json`.

---

## 10. Ferramenta de feedbacks

Faz parte do ecossistema uma **ferramenta de feedbacks**, usada para registrar e acompanhar feedbacks. Ela é **independente**: não lê nem grava na pasta de integração, não usa os contratos descritos aqui e não troca dados com a Central, com o Quadro do Time nem com os agentes. Este documento só registra que ela existe; nenhuma integração com ela está prevista.

---

## 11. Rotina típica

| Quem | Quando | O quê |
|---|---|---|
| Fernando | Uma vez por time | Cadastrar o time com prefixo e pasta, gerar a chave, enviar por Teams ou e-mail |
| Time | Uma vez | Abrir o Quadro (ou a ferramenta adaptada), colar a chave, conectar a pasta, ligar épicos às iniciativas da Central |
| Time | O tempo todo | Mover cards; o backlog é publicado sozinho |
| Time | Fim de sprint | Fechar a sprint e confirmar a publicação das métricas |
| Fernando | Ao abrir a Central | Revisar o que os times publicaram (prévia), conciliar épicos e itens sem vínculo |
| Fernando | Reunião de status | A atualização do time vem pré-preenchida; o downstream aparece abaixo de cada feature |
| Fernando | Quando muda o portfólio | Revisar a tela de compartilhamento e clicar **Compartilhar** |
| Fernando | Todo dia | Abrir o `hub.html`, ir para a ferramenta do momento e deixar post-its para os times quando precisar |
| Fernando | Ao planejar ausências | Central › **Férias**: ver os dias com mais gente fora, marcar as férias dele, dos diretos e das pessoas dos times e, quando mudar, publicar para a liderança |
| Time | Ao abrir o Quadro | Ler os post-its no topo do quadro e clicar **Vi** |
| Fernando | Depois de reuniões | Copiar o prompt certo, rodar no agente e importar o JSON com prévia |

---

## 12. Mapa da documentação

| Documento | Conteúdo |
|---|---|
| `docs/funcionalidades.md` (repositório) | O que cada ferramenta faz, para quê e quando usar |
| `docs/jornada-do-usuario.md` (repositório) | Jornada por papel (gestor, responsável, membro, financeiro) e atritos observados |
| `docs/passo-a-passo.md` (repositório) | Procedimentos: montar, cadastrar time, rotina, rituais, finanças, atualizar, trocar de computador, chave vazada |
| `docs/adr/` (repositório) | Decisões de arquitetura (ADRs) e checklist para funcionalidades novas |
| `docs/plano-financas.md` (repositório) | Finanças do grupo e do time, assistente, regras de sincronização |
| `README.md` (repositório) | A Remessa em uma página: como abrir, versões, telas da Central e onde está cada ferramenta |
| `experimental/LEIA-ME.md` (repositório) | Fonte do visual experimental e como montar |
| `docs/plano-ferias.md` (repositório) | Mapa de Férias: níveis, telas, decisões e contrato `gestao-ferias/1` |
| `docs/plano-hub.md` (repositório) | Hub da solução e post-its para os times (contratos `gestao-postits/1` e `gestao-postits-vistos/1`) |
| `docs/plano-v15.md` (repositório) | O que mudou na v15 e no Quadro 2.0 (plano; o estado atual está em `funcionalidades.md`) |
| `docs/plano-v14.md` (repositório) | O que mudou na v14 |
| `ferramenta-time/guia-adaptacao-times.md` | Quadro do Time (caminho A) e adaptação de ferramentas próprias (caminho B) |
| `integracao-time/00-LEIA-ME.md` | Índice da integração e todas as decisões tomadas |
| `integracao-time/01-arquitetura-troca-de-arquivos.md` | Pasta, contratos, vínculo por código, conflitos, criptografia e chaves |
| `integracao-time/02-esquema-de-metricas.md` | Métricas autodescritivas, visualizações, métricas padrão |
| `integracao-time/03-pacote-para-agentes-do-time.md` | Pacote autocontido para os times e os agentes de desenvolvimento deles |
| `integracao-time/04-modelo-iniciativa-feature.md` | Modelo Iniciativa › Feature, fases, tarefas, migração da v13 |
| `integracao-time/05-conciliacao-publicacao-e-dicionario.md` | Conciliação, cadência de publicação, tela de compartilhamento, dicionário |
| `integracao-time/06-prompts-para-agentes.md` | Contrato `gestao-import/3` e os 12 prompts |
| `contratos/` (repositório e pacote .zip) | **Fonte única dos contratos:** arquitetura e níveis, criptografia com vetores, regras de escrita, códigos, guia "como integrar", schemas, exemplos cifrados e validador |
| `integracao-time/contrato/` | Versão de 15/11/2026 dos schemas de integração (histórico; vale `contratos/`) |
| `integracao-time/exemplos/` | Exemplos em claro e cifrados (com chave de exemplo pública) |

Os documentos de `integracao-time/` ficam só na pasta do projeto, como histórico: não estão no repositório nem no .zip. Para entregar a um time ou a outra solução: a pasta `contratos/` e o guia dos times (`docs/guia-adaptacao-times.md` no .zip), com a chave real enviada à parte.

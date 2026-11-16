# Central de Gestão v14 · o que mudou

*15/11/2026 · a partir da v13. Abrir um arquivo da v13 migra os dados sozinho (a v13 continua no repositório em `legacy/`).*

## 1. Iniciativa › Feature
- O que era **entregável** (e "funcionalidade") vira **feature**, com o mesmo id. Entregável sem iniciativa vira tarefa (marcada `wasFeature`).
- Feature pertence a **uma** iniciativa e **nunca muda de iniciativa** (o campo trava na edição; a importação não move). Exceção: unir duas iniciativas que são a mesma.
- Cada feature está em **no máximo uma fase** e pode **depender de outra feature** (aparece como "↳" no painel).
- **Fases** viram agrupamentos de features no tempo: podem começar juntas e se sobrepor (a linha do tempo mostra faixas paralelas; a trilha marca todas as fases correntes).
- **Tarefas** ficam desacopladas: ligadas a uma feature, a uma iniciativa ou a nada. Demandas mostra só tarefas; features ficam nas iniciativas.
- O andamento automático da iniciativa conta features (quando há).
- Códigos com prefixo do time: iniciativa `PAG-042`, feature `PAG-042.F2`, fase `PAG-042.P1`. O prefixo (2 a 5 letras) e a pasta do time ficam no cadastro do time; o prefixo trava depois do primeiro código.

## 2. Integração com as ferramentas dos times (nova página "Integração")
- **Pasta e chaves:** conecta a pasta sincronizada do SharePoint (Edge/Chrome); uma chave por time (GK1…), copiar a chave ou uma mensagem pronta para Teams/e-mail, trocar só em caso de vazamento.
- **Recebidos:** lê `times/<pasta>/status.json` e `metricas.json` (cifrados), escolhe a cópia mais recente em caso de conflito do SharePoint, mostra prévia e aplica. Também importa arquivos manualmente.
- **Conciliação:** épicos do time sem vínculo (Unir, Trazer para a Central, Ignorar, com sugestão por nome e por agente); itens do time sem feature (Ligar, Criar feature, Ignorar); unir duas iniciativas da Central; desfazer uniões.
- **Compartilhamento:** mostra o que já foi compartilhado, o que é novo, alterado, o que vai sair, o que fica só na Central e os vínculos a informar; o botão Compartilhar cifra e grava `central/catalogo-<pasta>.json` (ou baixa o arquivo).
- **Downstream:** o painel da iniciativa mostra o status do time (andamento, previsão, atualização, bloqueios) e cada feature mostra os itens do time ligados a ela. A reunião de status sugere a atualização do time com um clique.

## 3. Métricas dos times
- Métricas › **Times (fluxo)**: desenha qualquer métrica autodescritiva (KPI, linha, barras, empilhado, área, histograma, medidor, tabela), casa com o dicionário (por `standard`, por apelido ou mapeamento manual), aceita métricas não mapeadas e compara times nas métricas do dicionário.
- Cada métrica é tratada isoladamente: dado inválido vira lacuna ou cartão "não foi possível exibir", e nada do arquivo vira HTML.

## 4. Agentes de reuniões, chats e e-mails
- Importação **gestao-import/3** (a /2 continua aceita): novas listas `features`, `updates`, `agreements` (decisões e compromissos), `teamLinks` (sugestões de conciliação) e `feature` nas tarefas; aceita também `gestao-metricas/1` e `gestao-status/1` sem cifra.
- 13 prompts, um por funcionalidade (inclui reuniões recorrentes do calendário), com o contexto (códigos e nomes) já incluído; botões "Prompt para agente" no painel da iniciativa, na conciliação e nas métricas. Guia completo em `integracao-time/06-prompts-para-agentes.md`.

## 5. Interface
- Menu lateral agrupado pelo fluxo do dia: **Meu dia** (Hoje, Demandas, Delegação), **Portfólio** (Iniciativas, Roadmap), **Rituais** (Fóruns, Staff, Pessoas), **Times** (Métricas, Integração), e atalhos para a visão de cada time.
- Teclas 1 a 0 trocam de página; o botão do topo virou "Importar e agentes".
- Hoje ganhou o cartão **Dos times**: arquivos novos, iniciativas que os times marcaram com atenção ou atraso, épicos sem vínculo e times sem chave.

## 7. Painel da iniciativa redesenhado
- Painel mais largo, com abas: **Visão geral**, **Features**, **Do time**, **Tarefas** e **Ajustes**.
- **Visão geral:** quatro indicadores (andamento, próxima feature, atrasadas e bloqueadas, status do time ou fim), linha do tempo com as fases em faixas paralelas (preenchidas conforme as features concluídas), losangos com os prazos das features, linha de hoje e fim da iniciativa; lista do que pede atenção; última atualização com sugestão do time.
- **Features:** agrupadas por fase, cada grupo com período, "em curso" e barra de conclusão; cada feature mostra de quem depende (em vermelho quando bloqueada), quem depende dela, o andamento dos itens do time e as tarefas ligadas.
- **Do time:** status do time, itens sem feature, métricas do time com escopo nesta iniciativa ou nas features dela e o downstream por feature.
- **Ajustes:** andamento, horizonte, datas das fases, dependências entre iniciativas e histórico de atualizações.

## 8. Reuniões recorrentes do calendário
- Importação de séries recorrentes (lista `calendarSeries` do gestao-import/3, gerada pelo Copilot com o prompt "Reuniões recorrentes do calendário", ou um arquivo .ics exportado do Outlook).
- Na prévia, cada série aparece com a associação sugerida e um seletor: fórum (ritual) existente, 1:1 com uma pessoa, fórum novo ou ignorar.
- Fórum: recebe recorrência (semanal, quinzenal, mensal), próxima data, horário, duração e participantes cadastrados. 1:1: a cadência da pessoa passa a seguir a série, e o dia e horário aparecem no topo do 1:1.
- Reimportar casa pela mesma série (seriesId ou UID do .ics) e só atualiza; séries diárias ou encerradas vêm como "ignorar" por padrão.

## 6. Testado
Fluxo completo no Chromium com os exemplos cifrados de `integracao-time/exemplos/`: criar time com prefixo, importar features pelo formato dos agentes, aplicar backlog e métricas, conciliar, compartilhar (o catálogo gerado decifra com a implementação de referência e valida no schema), métricas malformadas sem quebrar a tela, migração de dados da v13, todas as páginas sem erro no console.

## 9. Times: revisão e HTML do time (16/11/2026)
- **Correções no cadastro do time:** a pasta é sugerida a partir do nome; pasta inválida avisa (antes ficava vazia sem aviso); trocar a pasta de um time que já tem chave, catálogo compartilhado ou arquivos recebidos pede confirmação, porque a ferramenta do time continua publicando na pasta antiga; a pasta não pode ser apagada enquanto o time tem chave; o prefixo pode ser apagado enquanto não houver códigos emitidos; excluir um time apaga a chave dele (antes ela ficava guardada nos dados); "1 pessoa" e "1 iniciativa" no singular.
- **Cartão do time** mostra prefixo, pasta e situação da chave, com o botão **HTML do time** (também na visão do time e em Integração › Pasta e chaves).
- **HTML do time:** gera o Quadro do Time já configurado (contrato `quadro-preset/1`: nome, pasta, prefixo, pessoas do time, contato e, se marcado, a chave). A chave fica desmarcada por padrão. O Quadro vai embutido na Central (gzip + base64, ~70 KB); `tools/embutir_quadro.py` atualiza essa cópia quando o Quadro mudar, e o diálogo aceita um arquivo do Quadro mais novo.
- **Quadro do Time 1.1.0:** lê a pré-configuração (aviso na tela inicial, "Criar quadro novo" preenchido com identificador travado, chave cadastrada uma única vez, alerta na aba Central se o quadro aberto usa outro identificador). Sem pré-configuração, funciona como a 1.0.
- **Formulários de tarefa, feature e iniciativa redesenhados:** uma coluna com propriedades (ícone, rótulo e campo), título grande, tipo Tarefa/Feature no topo, "Alta prioridade" como botão ao lado do prazo, campos secundários em "Mais detalhes" (abre sozinho quando já há algo preenchido e mostra um resumo), iniciativa com período em uma linha, progresso manual só quando o automático está desligado, fases em linhas com dica quando vazias e dependências recolhidas. Botões dizem "Criar tarefa", "Criar feature" ou "Criar iniciativa".


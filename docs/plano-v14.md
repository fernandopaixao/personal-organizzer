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
- 12 prompts, um por funcionalidade, com o contexto (códigos e nomes) já incluído; botões "Prompt para agente" no painel da iniciativa, na conciliação e nas métricas. Guia completo em `integracao-time/06-prompts-para-agentes.md`.

## 5. Interface
- Menu lateral agrupado pelo fluxo do dia: **Meu dia** (Hoje, Demandas, Delegação), **Portfólio** (Iniciativas, Roadmap), **Rituais** (Fóruns, Staff, Pessoas), **Times** (Métricas, Integração), e atalhos para a visão de cada time.
- Teclas 1 a 0 trocam de página; o botão do topo virou "Importar e agentes".
- Hoje ganhou o cartão **Dos times**: arquivos novos, iniciativas que os times marcaram com atenção ou atraso, épicos sem vínculo e times sem chave.

## 6. Testado
Fluxo completo no Chromium com os exemplos cifrados de `integracao-time/exemplos/`: criar time com prefixo, importar features pelo formato dos agentes, aplicar backlog e métricas, conciliar, compartilhar (o catálogo gerado decifra com a implementação de referência e valida no schema), métricas malformadas sem quebrar a tela, migração de dados da v13, todas as páginas sem erro no console.

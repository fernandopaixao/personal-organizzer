# Central de Gestão v15 e Quadro do Time 2.0

*23/11/2026 · parte do plano de interface (`interface/plano-interface.md` na pasta do projeto)*

A v15 reorganiza a Central em 8 páginas, tira as telas duplicadas, transforma o 1:1 em uma visão completa da pessoa e põe os formulários num padrão único. O Quadro do Time 2.0 põe o kanban em primeiro lugar. Os contratos da integração (`gestao-import/3`, backlog, métricas, catálogo, chaves) **não mudaram**.

## 1. Decisões aplicadas

| | Decisão | Como ficou |
|---|---|---|
| D1 | Demandas e Delegação viram uma página só | **Tarefas**, com as vistas Minhas, Delegadas e Todas. A vista Delegadas mantém o painel de aderência e cobranças |
| D2 | Staff vira uma vista do fórum | **Fóruns** tem as abas Pautas, Acordos e Staff. A Staff mostra a semana dos times; o backlog e as features da semana foram para **Iniciativas › Semana** |
| D3 | Objetivos ficam na pessoa, opcionais | Campo `goals` na pessoa, editado na aba Perfil da Pessoa 360. Vazio não aparece em lugar nenhum |
| D4 | Métricas por pessoa saem de Métricas | **Times › Métricas dos times** mostra só o fluxo publicado pelos times. Carga, aderência e evidências de cada pessoa ficam na Pessoa 360 |
| D5 | Navegação do Quadro vai para o topo | Quadro, Backlog, Iniciativas e Métricas no topo; Sprints, Central e Ajustes no menu "···" (com aviso quando a Central pede atenção) |
| D6 | Coluna Backlog sai do quadro | A primeira coluna (antes do compromisso) fica só na aba Backlog. **Ajustes › Colunas** tem a opção "Mostrar a primeira coluna no quadro" |

## 2. Central v15

### 2.1 Navegação

| Tecla | Página | Vistas | O que juntou |
|---|---|---|---|
| 1 | Hoje | | |
| 2 | Tarefas | Minhas · Delegadas · Todas | Demandas + Delegação |
| 3 | 1:1 | Pessoa 360 | 1:1 da antiga Pessoas |
| 4 | Feedback | | Feedback da antiga Pessoas, sem o formulário repetido (anotar fica na Pessoa 360) |
| 5 | Iniciativas | Lista · Semana · Horizonte · Linha do tempo · Dependências | Iniciativas + Roadmap + semana da Staff |
| 6 | Fóruns | Pautas · Acordos · Staff | Fóruns + Staff |
| 7 | Times | Times · Métricas dos times · visão do time | Cadastro dos times + Visão do time + Métricas |
| 8 | Integração | | |

O filtro de time é o mesmo em Iniciativas, Linha do tempo e Staff: escolher um time numa delas vale para as outras.

### 2.2 Duplicatas removidas

- Faixa "Features · próximas 2 semanas" de Iniciativas (a mesma informação está em Iniciativas › Semana).
- Abas próprias da Staff (backlog, pauta), que repetiam Iniciativas e Fóruns.
- Seletor Pautas/Acordos na barra do fórum (virou aba).
- Métricas por pessoa e por tarefa (estão na Pessoa 360).
- Formulário de anotação na página Feedback (anotar fica na Pessoa 360; a página Feedback abre a aba Feedback da pessoa).
- O "Compartilhar" da visão do time **não** era duplicata do compartilhamento da Integração (gera a folha de status para o Teams) e foi mantido.

### 2.3 Pessoa 360 (1:1)

- **Lista à esquerda** agrupada em "Próximos 7 dias", "Atrasados" e "Próximas semanas", com anel de cadência e busca.
- **Cabeçalho** com papel, times, "Copiar resumo" e "▶ Iniciar 1:1".
- **Cinco indicadores**: último 1:1 (anel da cadência), entregas no prazo (com minigráfico de 6 meses), carga atual, evidências de feedback e iniciativas.
- **Abas**: Visão geral, Pauta, Trabalho, Iniciativas, Feedback, Histórico e Perfil.
- **Pauta** junta quatro fontes: itens que eu adicionei, itens vindos de agentes, combinados abertos com a pessoa e sugestões (tarefas atrasadas ou bloqueadas).
- **Em conversa**: três colunas (pauta, anotações, combinados), cronômetro, criação de combinado e tarefa no meio da conversa. Ao encerrar, mostra o resumo, que pode ser copiado formatado para e-mail ou Teams. Os combinados feitos no 1:1 **não** aparecem nos fóruns.
- Dados novos: `ooSessions` (sessões de 1:1), `agreements.personId` e `agreements.sessionId`, `people.goals`. `DB_VERSION` passou a 15; a migração é aditiva e testada com um arquivo da v14.

### 2.4 Formulários

Pessoa, time, fórum, ciclo e anotação seguem o mesmo padrão: campos essenciais primeiro, "Mais detalhes" recolhido, pílulas no lugar de listas curtas, validação no próprio campo, botão principal com o verbo ("Criar pessoa", "Salvar anotação") e **Ctrl+Enter** para salvar.

### 2.5 O que ficou diferente do plano

- Os formulários de atualização de iniciativa, de acordo e da prévia de importação continuam como estavam (são formulários no próprio painel, não diálogos). Ficam para a próxima rodada.
- "Conduzir reunião" do time continua na visão do time, com atalho a partir do fórum do time.
- O menu pequeno do 1:1 (`ooDialog`) foi mantido para ações rápidas.
- `<div id="ondeEstou">` está reservado no topo da Central e do Quadro para o seletor de onde os dados estão, que a frente de finanças vai preencher.

## 3. Quadro do Time 2.0

| Item | Como ficou |
|---|---|
| Topo | Nome e slug do time, abas principais, menu "···", criação rápida, situação do arquivo e "+ Card" |
| Sprint | Pílula com o nome, dias restantes e barra de progresso; troca entre sprint atual, todos os cards e sem sprint |
| Filtros | Bloqueados e Atrasados (com contagem), iniciativa, avatares dos responsáveis e busca |
| Raias | Nenhuma, por iniciativa ou por pessoa |
| Densidade | Confortável ou Compacto (só título, responsável e tempo na coluna) |
| Colunas | Barra de WIP em segmentos (vermelho quando passa do limite) e fundo de alerta na coluna estourada; "+ Adicionar card" em todas, menos na entrega |
| Entrega | Coluna recolhida por padrão, com a contagem; um clique abre |
| Card | Faixa com a cor da iniciativa, prazo só quando faltam 5 dias ou menos, chips de dependência e bloqueio, e três pontos de envelhecimento |
| Envelhecimento | Compara os dias na coluna com o histórico do próprio time: acima da mediana fica âmbar, acima do percentil 85 fica vermelho (sem histórico suficiente, usa 5 e 10 dias) |
| Pulso | Faixa no rodapé: entregues na sprint com barras das últimas 6 semanas, em andamento, lead time p85, cards envelhecendo (clique filtra) e colunas acima do limite |
| Detalhe do card | Painel lateral; ↑ e ↓ passam para o card de cima ou de baixo, Esc fecha; o card aberto fica destacado no quadro |
| Backlog | Sem o agrupamento por coluna (o quadro já é essa visão) |
| Preferências | Raias, densidade, filtros e entrega aberta ficam guardados no navegador de cada pessoa |

`TOOL_VERSION` passou a `2.0.0`. A cópia embutida na Central foi atualizada com `tools/embutir_quadro.py`.

## 4. Testes

- Arquivo criado na v14, aberto na v15: migração para a versão 15 sem erros, todas as páginas e todas as abas da Pessoa 360 abertas sem erro no console.
- Fluxo do 1:1 completo: iniciar, anotar, criar combinado e tarefa, encerrar, ver e copiar o resumo.
- Formulários: criação de pessoa e fórum com Ctrl+Enter e validação no campo.
- Quadro: exemplo "Ver exemplo" com raias, densidade, filtros, entrega aberta e recolhida, painel do card com ↑/↓, todas as telas do menu e a opção de mostrar a coluna Backlog, em 1440 px e 390 px de largura, sem erros no console.

## Versão exibida (24/11/2026)

A Central mostra a versão na barra lateral (rodapé) e na tela de senha: `APP_VERSION` no HTML (hoje **15.2**: 15.0 = v15 original, 15.1 = senha/cofre e "Onde estou?" do PR #10, 15.2 = lista lateral de fóruns). `DB_VERSION` continua sendo a versão do arquivo de dados (15). Ao mudar a Central, suba `APP_VERSION` nos dois lugares em que aparece no HTML (constante e textos `v15.x`).

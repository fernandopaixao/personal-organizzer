# Central de Gestão · v13: visão do time e reunião de status

Mantém todos os princípios da v12: dados fora do HTML e criptografados (AES-GCM 256, PBKDF2 600 mil), migração aditiva com backup automático, um único destaque de cor e os mesmos componentes visuais.

## Como chegar
Clique no nome de um time em **Hoje** (cartões "O que os times estão entregando"), em **Pessoas › Times**, ou nas linhas de time da **Staff** (Semana e Backlog). Com um time filtrado na Staff, o botão "Visão do time" também leva para lá. Dentro da tela, a faixa de times permite trocar de time sem voltar.

## 1. Visão do time
- **Indicadores:** iniciativas em andamento (barra por situação), entregas da semana (anel), atrasos (entregáveis e tarefas), tarefas abertas e quando foi a última reunião de status.
- **Entregáveis por iniciativa:** um cartão por iniciativa em "Agora" (e "Próximas" com entregável aberto), com barra feito × prazo, entregáveis abertos para concluir ali mesmo e os entregues nos últimos 14 dias.
- **Entregas da semana:** faixa de 7 dias com pontos e a lista de entregáveis e fases que vencem ou foram concluídas na semana (atrasados entram na semana atual). Navega entre semanas.
- **Resumo do backlog:** barra por horizonte (Agora, Próximas, Depois, Discovery) e as iniciativas de cada um.
- **Tarefas das iniciativas:** só tarefas ligadas às iniciativas do time, agrupadas por iniciativa, com filtros Abertas, Atrasadas, Até o fim da semana e Concluídas (14 dias).

## 2. Reunião de status
- Usa o fórum do time (fórum com o time definido; se não houver, cria **Status · Time**, semanal, com os membros como participantes). A reunião fica registrada na data de hoje, então aparece também em Fóruns.
- Roteiro em passos: **Abertura** (panorama, entregas atrasadas e pauta acumulada) → **uma iniciativa por vez** → **Fechamento**.
- Em cada iniciativa: trilha de fases (clicável), feito × prazo, status reportado (No prazo, Atenção, Atrasada; o calculado aparece como referência), atualização de uma linha que vai direto para o diário de bordo da iniciativa, entregáveis e tarefas da semana com data editável, bloqueios, e decisões ou compromissos ligados à iniciativa (compromisso vira tarefa da iniciativa).
- Relógio da reunião, tempo sugerido por item (duração ÷ itens) e barra de progresso das revisadas. Setas ← → do teclado avançam e voltam.
- No fechamento: resumo das iniciativas, decisões e compromissos, texto de resumo e o que passa para a próxima reunião. "Encerrar e compartilhar" leva à folha.

## 3. Compartilhar com o time (Teams)
- Folha limpa com cabeçalho do time, indicadores, iniciativas e entregáveis (status, %, atualização, próximos entregáveis), entregas da semana, tarefas em aberto, decisões, compromissos e backlog. Cada bloco pode ser incluído ou não.
- **Copiar para o Teams** copia com formatação (HTML com tabelas e cores de status, sem fundo colorido, para não perder legibilidade no Teams); também há copiar como texto, baixar .html e imprimir/PDF.
- Sem integração com o Teams: nada sai do computador além do que é colado.

## Modelo de dados (adições da v13)
```
meetings[]   { …, reviews: { [initiativeId]: { k: ok|attn|late, note, updId, done } }, order[], startedAt, endedAt }
agreements[] { …, initiativeId }
```
A nota de cada iniciativa é também gravada em `initiatives[].updates[]` (o `updId` liga as duas), então o diário de bordo e a tela Iniciativas ficam atualizados.

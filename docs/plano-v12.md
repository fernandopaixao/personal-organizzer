# Central de Gestão · plano da v12

## Princípios (valem para todas as versões)

- **Dados fora do HTML, sempre criptografados.** O HTML é só a ferramenta; os dados vivem num arquivo JSON separado, cifrado com AES-GCM 256. A chave é derivada da senha (PBKDF2-SHA256) e fica apenas na memória enquanto a ferramenta está aberta. Sem a senha não há recuperação.
- **Migração aditiva e versionada.** Ao abrir um arquivo de versão anterior, a ferramenta migra os dados, baixa um backup do arquivo original e passa a gravar no formato novo. Nada é perdido.
- **Elegante e minimalista.** Um único destaque de cor (`--bv`), tipografia de títulos (`--title`), cartões brancos com borda fina. Telas novas reaproveitam os mesmos componentes (`.card`, `.kpi`, `.sg`, `.tp`, `.chip`, `.ring`, `.ts-bar`, `.trk`, drawer lateral).
- **Menos esforço cognitivo.** Cada tela abre respondendo "o que pede atenção agora", com diagramas simples (anel de progresso, barra feito × prazo, trilha de fases, faixa de dias) e ordenação por urgência. Valores padrão inferidos do contexto, para digitar menos.

## O que entra na v12

### 1. Segurança do arquivo de dados
- PBKDF2 sobe de 250 mil para **600 mil iterações** (recomendação atual da OWASP).
- A chave é derivada **uma vez por sessão**; cada gravação usa um IV novo, então salvar continua instantâneo.
- Arquivos antigos abrem normalmente e são regravados com a chave mais forte.

### 2. Fóruns (reuniões recorrentes) e pautas acumuladas por data
- Cadastro do fórum: nome, cadência (semanal, quinzenal ou mensal no mesmo dia da semana), próxima reunião, horário, duração, time, participantes e objetivo.
- As ocorrências são **calculadas pela cadência**, sem integração com calendário.
- Cada pauta cai na próxima ocorrência (ou numa data escolhida). **O que não for marcado como discutido passa sozinho para a reunião seguinte**, com a marca "desde dd/mm".
- Cada pauta pode ter quem traz o assunto e um tempo estimado; a barra de carga mostra tempo estimado ÷ duração da reunião.
- Pela barra rápida: `pauta: assunto` (fórum em contexto ou staff) e `pauta comitê: assunto` (escolhe o fórum pelo começo do nome).
- A antiga "pauta da staff" vira o fórum **Staff semanal**, migrado automaticamente; a tela Staff mostra a pauta da reunião da semana.

### 3. Reunião e acordos para compartilhar
- Ao abrir uma reunião: pauta (marcar como discutida, mover, incluir), resumo, **decisões** e **compromissos** (quem, o quê, até quando).
- Todo compromisso vira tarefa real, entrando no acompanhamento de Delegação e de Demandas.
- Aba **Acordos**: folha limpa por reunião, últimos 30 dias ou compromissos em aberto, com indicadores, decisões numeradas, tabela de compromissos com status e a próxima pauta.
- Saídas: copiar com formatação (Outlook, Teams), copiar como texto, baixar página HTML, imprimir ou salvar em PDF. Só sai o conteúdo da folha.

### 4. Iniciativas no dia a dia
- Nova tela **Iniciativas**: uma linha por iniciativa em andamento, ordenada por atrasadas → atenção → sem atualização → em dia.
- Em cada linha: trilha de fases (clicável), barra **feito × prazo** com o traço de onde deveria estar hoje, próximo entregável, itens da semana e bloqueios, última atualização.
- **Atualização de uma linha** por iniciativa (diário de bordo), registrada direto na lista ou no painel lateral. Mais de 7 dias sem atualização acende o alerta.
- Faixa de entregáveis das próximas 2 semanas e indicadores clicáveis como filtros.
- Na tela Hoje: cartões "Fóruns · 7 dias" e "Iniciativas pedindo atenção".

### 5. Consistência visual
- Mesmos tokens e componentes em todas as telas novas; navegação lateral com 9 entradas (Hoje, Iniciativas, Demandas, Roadmap, Delegação, Fóruns, Staff, Pessoas, Métricas); no celular, a barra inferior rola.

## Modelo de dados (adições da v12)

```
forums[]       { id, name, cadence: weekly|biweekly|monthly, anchor (data da 1ª/próxima reunião), time, duration, teamId, participants[], purpose, archived }
agendaItems[]  { id, forumId, text, ownerId, teamId, initiativeId, minutes, status: open|done, date, origDate, doneAt }
agreements[]   { id, forumId, date, kind: decision|commitment, text, ownerId, due, taskId }
meetings[]     { id, forumId, date, summary }
initiatives[].updates[] { id, date, text }
settings.staffForumId
```

`staffTopics` (v11) é convertido em `agendaItems` do fórum da staff. A importação (`gestao-import/2`) passa a aceitar `forums` e `agenda`; `staffTopics` continua aceito.

## Próximos passos sugeridos
- Modelo de pauta por fórum (blocos fixos que se repetem em toda reunião).
- Exportar acordos de vários fóruns num resumo semanal único.
- Lembrete visual de compromissos vencendo antes da próxima reunião do fórum.

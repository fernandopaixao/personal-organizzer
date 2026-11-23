# personal-organizzer · Central de Gestão

Ferramenta de gestão pessoal em um único arquivo HTML, sem servidor e sem instalação.

- **Abrir:** dê dois cliques em `gestao_pessoal_v15.html` (Chrome ou Edge recomendados, para salvar direto no arquivo e usar a pasta de integração).
- **Dados:** ficam num arquivo JSON separado, criptografado com AES-GCM 256 e senha. O HTML não guarda nenhum dado, então pode ser atualizado à vontade.
- **Atualizar de versão:** abra o arquivo de dados atual na versão nova. A migração é automática e um backup do arquivo anterior é baixado.

## Telas

| Tecla | Página | Para quê |
|---|---|---|
| 1 | Hoje | Tarefas do dia, atrasos, 1:1 da semana, fóruns dos próximos 7 dias, iniciativas pedindo atenção e novidades dos times |
| 2 | Tarefas | Vistas Minhas, Delegadas (com aderência e cobranças) e Todas |
| 3 | 1:1 | **Pessoa 360**: pauta, trabalho, iniciativas, feedback, histórico e perfil da pessoa; modo **Em conversa** com cronômetro, anotações, combinados e resumo para copiar |
| 4 | Feedback | Ciclos e evidências de feedback por pessoa |
| 5 | Iniciativas | Lista, Semana, Horizonte, Linha do tempo (fases sobrepostas) e Dependências |
| 6 | Fóruns | Pautas, Acordos e Staff (semana dos times) |
| 7 | Times | Cadastro dos times, métricas publicadas pelos times e visão de cada time (backlog, features, reunião de status) |
| 8 | Integração | Pasta e chaves, arquivos recebidos, conciliação e compartilhamento com os times |

A visão geral da solução (Central, Quadro do Time, integração, métricas e agentes) está em [`docs/visao-geral-da-solucao.md`](docs/visao-geral-da-solucao.md). O plano da versão atual está em [`docs/plano-v15.md`](docs/plano-v15.md). As versões anteriores ficam em `legacy/` como referência.

## Ferramenta dos times

[`ferramenta-time/quadro_do_time_v1.html`](ferramenta-time/quadro_do_time_v1.html) é o **Quadro do Time** (2.0): quadro kanban com raias, WIP visível, envelhecimento dos cards e faixa de pulso, além de backlog, sprints, iniciativas ligadas à Central e métricas de fluxo do time, também num único HTML. Ele publica o backlog e as métricas do time, cifrados, na pasta compartilhada que a Central lê. Na Central, o botão **HTML do time** (Times) gera uma cópia já configurada para cada time; depois de mudar o Quadro, rode `python3 tools/embutir_quadro.py` para atualizar a cópia embutida na Central. O [`guia-adaptacao-times.md`](ferramenta-time/guia-adaptacao-times.md) explica como usá-lo ou como adaptar a ferramenta que o time já tem.

## Início da solução e finanças

- [`inicio.html`](inicio.html) é o **assistente**: pergunta o papel (gestor, responsável ou membro de um time) e o uso (finanças, tarefas ou os dois), cria o primeiro arquivo já cifrado, gera os HTMLs certos (cada um desacoplado, com o próprio arquivo) e o cartão `onde-fica-cada-coisa.html`.
- [`financas/financas_grupo.html`](financas/financas_grupo.html) é o **consolidado**: soma os planos publicados pelos times, compara com o orçamento do grupo, publica diretrizes (tetos e categorias) e gera o HTML de finanças de cada time.
- [`financas/financas_time.html`](financas/financas_time.html) é o **apoio do time**: lançamentos, contratos recorrentes, plano mensal, fechamento do mês, previsão rolante e cenários.
- Regras: tudo cifrado; dado individual fica numa pasta local fora do OneDrive; só o pedaço comum vai para a pasta sincronizada (`Gestao-Compartilhado`), com um único dono por arquivo e detecção de cópias de conflito do OneDrive.
- A Central e o Quadro (2.1) seguem as mesmas regras: senha obrigatória, aviso de cofre, botão "Onde estou?" e, no Quadro, um arquivo por pessoa em `times/<time>/quadro/`. Depois de mudar a Central ou o Quadro, rode `python3 tools/injetar_seguranca.py` (reinjeta o bloco comum, reembute o Quadro e remonta o assistente).
- Código-fonte em `financas/src/`; monte com `python3 tools/build_financas.py` e teste com `node financas/testes/teste-e2e.js`. Plano e decisões em [`docs/plano-financas.md`](docs/plano-financas.md).

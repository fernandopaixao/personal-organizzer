# personal-organizzer · Central de Gestão

Ferramenta de gestão pessoal em um único arquivo HTML, sem servidor e sem instalação.

- **Abrir:** dê dois cliques em `gestao_pessoal_v14.html` (Chrome ou Edge recomendados, para salvar direto no arquivo e usar a pasta de integração).
- **Dados:** ficam num arquivo JSON separado, criptografado com AES-GCM 256 e senha. O HTML não guarda nenhum dado, então pode ser atualizado à vontade.
- **Atualizar de versão:** abra o arquivo de dados atual na versão nova. A migração é automática e um backup do arquivo anterior é baixado.

## Telas

| Grupo | Tela | Para quê |
|---|---|---|
| Meu dia | Hoje | Tarefas do dia, atrasos, fóruns dos próximos 7 dias, iniciativas pedindo atenção e novidades dos times |
| | Demandas | Lista e quadro de tarefas (ligadas a feature, a iniciativa ou a nada) |
| | Delegação | O que está com quem, prazos, cobranças e aderência |
| Portfólio | Iniciativas | Feito × prazo, fases, próxima feature, atualização; painel com features, dependências e o downstream do time |
| | Roadmap | Horizontes, linha do tempo (fases sobrepostas) e dependências |
| Rituais | Fóruns | Reuniões recorrentes, pautas, decisões e compromissos |
| | Staff | Semana dos times, backlog e pauta da staff |
| | Pessoas | 1:1, feedback e times (com prefixo de código e pasta de integração) |
| Times | Métricas | Pessoas e tarefas; fluxo dos times (métricas publicadas pelas ferramentas deles) |
| | Integração | Pasta e chaves, arquivos recebidos, conciliação e compartilhamento com os times |
| | Visão do time | Resumo do backlog, features por iniciativa, reunião de status guiada |

A visão geral da solução (Central, Quadro do Time, integração, métricas e agentes) está em [`docs/visao-geral-da-solucao.md`](docs/visao-geral-da-solucao.md). O plano da versão atual está em [`docs/plano-v14.md`](docs/plano-v14.md). As versões anteriores ficam em `legacy/` como referência.

## Ferramenta dos times

[`ferramenta-time/quadro_do_time_v1.html`](ferramenta-time/quadro_do_time_v1.html) é o **Quadro do Time**: quadro de cards, backlog, sprints, iniciativas ligadas à Central e métricas de fluxo do time, também num único HTML. Ele publica o backlog e as métricas do time, cifrados, na pasta compartilhada que a Central lê. O [`guia-adaptacao-times.md`](ferramenta-time/guia-adaptacao-times.md) explica como usá-lo ou como adaptar a ferramenta que o time já tem.

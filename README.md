# personal-organizzer · Central de Gestão

Ferramenta de gestão pessoal em um único arquivo HTML, sem servidor e sem instalação.

- **Abrir:** dê dois cliques em `gestao_pessoal_v15.html` (Chrome ou Edge recomendados, para salvar direto no arquivo e usar a pasta de integração).
- **Dados:** ficam num arquivo JSON separado, criptografado com AES-GCM 256 e senha. O HTML não guarda nenhum dado, então pode ser atualizado à vontade.
- **Versão atual:** Central 15.10, Hub 2.0 (cockpit de gestão com login único, [ADR-0035](docs/adr/0035-hub-cockpit-de-gestao.md)), assistente 2.5 e Mapa de Férias 1.3. As férias do gestor e da liderança são uma página da Central, não mais uma ferramenta à parte ([ADR-0033](docs/adr/0033-ferias-dentro-da-central.md)). Se uma ferramenta disser "Daqui não dá para abrir pastas", ela foi aberta no Safari, no Firefox, no celular ou numa pré-visualização: o aviso diz o que fazer ([ADR-0030](docs/adr/0030-aviso-quando-nao-da-para-abrir-pastas.md)). A Central lê as finanças dos times e o custo de cada iniciativa, só para leitura ([ADR-0028](docs/adr/0028-financas-na-central-so-leitura.md)); o hub e a Central passam a senha da sessão para as ferramentas que abrem ([ADR-0029](docs/adr/0029-uma-senha-por-sessao.md)); o arquivo pessoal fica numa pasta só sua, de preferência no seu OneDrive ([ADR-0008](docs/adr/0008-local-individual-comum-sincronizado.md)); a pasta compartilhada fica marcada como **Sempre manter neste dispositivo** em cada computador, para o navegador ler os arquivos dos outros ([ADR-0004](docs/adr/0004-troca-por-arquivos-na-pasta-sincronizada.md)).
- **Atualizar de versão:** abra o arquivo de dados atual na versão nova. A migração é automática e um backup do arquivo anterior é baixado.

## Telas

| Tecla | Página | Para quê |
|---|---|---|
| 1 | Hoje | Cards de leitura (dia, delegadas, iniciativas, rituais e, com as chaves de finanças, finanças dos times), tarefas do dia, atrasos, 1:1 da semana, fóruns dos próximos 7 dias, iniciativas pedindo atenção e novidades dos times, quem está fora hoje |
| 2 | Tarefas | Vistas Minhas, Delegadas (com aderência e cobranças) e Todas |
| 3 | 1:1 | **Pessoa 360**: pauta, trabalho, iniciativas, feedback, histórico e perfil da pessoa; modo **Em conversa** com cronômetro, anotações, combinados e resumo para copiar |
| 4 | Feedback | Ciclos e evidências de feedback por pessoa |
| 5 | Férias | Mapa de Férias do grupo dentro da Central: dias com mais e menos gente fora, você e diretos, times vindos da Integração, publicar para a liderança |
| 6 | Iniciativas | Lista, Semana, Horizonte, Linha do tempo (fases sobrepostas) e Dependências; aba Finanças com o custo da iniciativa somando os times |
| 7 | Fóruns | Pautas, Acordos e Staff (semana dos times) |
| 8 | Times | Cadastro dos times, métricas publicadas pelos times, finanças de cada time (só leitura, 15.5) e visão de cada time (backlog, features, reunião de status) |
| 9 | Integração | Pasta e chaves, arquivos recebidos, conciliação e compartilhamento com os times |

**Documentação:** [funcionalidades, usos e objetivos](docs/funcionalidades.md) · [jornada do usuário](docs/jornada-do-usuario.md) · [passo a passo](docs/passo-a-passo.md) · [decisões de arquitetura (ADRs)](docs/adr/README.md), com o checklist para funcionalidades novas.

**Regra:** toda funcionalidade nova atualiza a documentação no mesmo PR ([ADR-0022](docs/adr/0022-documentacao-no-mesmo-pr.md)); a CI confere e o template de PR traz o checklist.

**Integrar outra solução:** a pasta [`contratos/`](contratos/LEIA-ME.md) tem tudo o que uma ferramenta de outro time, de um gestor par ou um agente precisa para gravar arquivos que o hub, a Central, as Finanças e o Mapa de Férias leem, até a visão da liderança: arquitetura e níveis, criptografia com vetores de teste, regras anti-conflito, códigos, schemas, exemplos cifrados e o validador `node contratos/validar.js` ([ADR-0032](docs/adr/0032-pasta-de-contratos.md)).

**Levar para a empresa:** `python3 tools/empacotar.py` gera `dist/gestao-solucao-AAAA-MM-DD.zip` com tudo lado a lado, a documentação, um LEIA-ME e a pasta `experimental/`. A CI do repositório pessoal gera o mesmo .zip como artefato de cada PR e da `main` ([ADR-0024](docs/adr/0024-distribuicao-por-zip.md)).

A visão geral da solução (Central, Quadro do Time, integração, métricas e agentes) está em [`docs/visao-geral-da-solucao.md`](docs/visao-geral-da-solucao.md). O plano da versão atual está em [`docs/plano-v15.md`](docs/plano-v15.md). As versões anteriores ficam em `legacy/` como referência.

## Ferramenta dos times

[`ferramenta-time/quadro_do_time_v1.html`](ferramenta-time/quadro_do_time_v1.html) é o **Quadro do Time** (2.2): quadro kanban com raias, post-its recebidos do hub, WIP visível, envelhecimento dos cards e faixa de pulso, além de backlog, sprints, iniciativas ligadas à Central e métricas de fluxo do time, também num único HTML. Ele publica o backlog e as métricas do time, cifrados, na pasta compartilhada que a Central lê. Na Central, o botão **HTML do time** (Times) gera uma cópia já configurada para cada time; depois de mudar o Quadro, rode `python3 tools/embutir_quadro.py` para atualizar a cópia embutida na Central. O [`guia-adaptacao-times.md`](ferramenta-time/guia-adaptacao-times.md) explica como usá-lo ou como adaptar a ferramenta que o time já tem.

## Hub da solução (tela inicial)

[`hub.html`](hub.html) é a **tela inicial do dia a dia**. Fica na pasta pessoal, ao lado das outras ferramentas, e:

- é o **cockpit de gestão** (Hub 2.0): saudação com a frase do dia, cards de todos os módulos (meu dia, delegadas, iniciativas, fora hoje, finanças, quadros, post-its), a lista única **Pede sua atenção**, pessoas fora e 1:1 em atraso, e cada time com iniciativas, bloqueios e métricas do quadro. O hub **lê, sem gravar**, o arquivo da Central e o que os times publicam ([ADR-0035](docs/adr/0035-hub-cockpit-de-gestao.md));
- **login único:** você entra uma vez no hub e as ferramentas abertas por ele não pedem a senha; a Central entra direto quando o navegador já liberou o arquivo. **Encerrar sessão** esquece as senhas;
- lista os HTMLs da pasta (Central, Finanças do Grupo, Quadros e Finanças de cada time, assistente) como módulos, cada um com uma linha do que está acontecendo nele;
- mostra por time quando o Quadro, o status, as métricas e o plano financeiro mudaram na pasta sincronizada;
- todas as ferramentas têm o botão **← Hub** no topo para voltar a ele;
- deixa **post-its para os times**: cada recado vai cifrado com a chave do time para `times/<time>/postits/<você>-<computador>.json` (um arquivo por autor, como o resto da solução) e aparece no topo do **Quadro do Time 2.2**. Quem lê clica em **Vi** e o hub mostra quem já viu.

- mostra a **Visão dos times** (1.2): cards de leitura e barras com o previsto, o realizado e o orçado de cada time, lidos do plano financeiro que o time publica.

Tem o próprio arquivo cifrado (`hub-<nome>.json`, com os times e as chaves), criado pelo assistente ou pelo próprio hub. As chaves podem ser coladas ou importadas da Central (tarefas) e do Finanças do Grupo (finanças). Detalhes em [`docs/plano-hub.md`](docs/plano-hub.md).

## Início da solução e finanças

- [`inicio.html`](inicio.html) é o **assistente** (2.1): explica a solução em quatro desenhos, tem o atalho **Estou com sorte** (gera de uma vez as ferramentas do gestor e as de cada time em `para-os-times/`, já com as chaves) e termina com um checklist. No caminho normal, pergunta se você lidera times (2 ou mais, 1, ou nenhum), o que quer organizar (tarefas, finanças) e se o seu líder compartilhou chaves e qual a pasta; lê as chaves, trava o identificador do time ou grupo a partir delas, cria o primeiro arquivo de cada ferramenta já cifrado e com as chaves, o hub e o cartão `onde-fica-cada-coisa.html`, e mostra os próximos passos do perfil ([ADR-0023](docs/adr/0023-onboarding-por-perfil-e-chave.md)).
- [`financas/financas_grupo.html`](financas/financas_grupo.html) é o **consolidado** (1.3): soma os planos publicados pelos times, compara com o orçamento do grupo, publica diretrizes (tetos e categorias), gera o HTML de finanças de cada time e, se a liderança também usa a solução, publica o consolidado para ela e recebe o teto de volta (consolidação em níveis, [ADR-0025](docs/adr/0025-consolidacao-em-niveis.md)).
- [`financas/financas_time.html`](financas/financas_time.html) é o **apoio do time**: lançamentos, contratos recorrentes, plano mensal e multianual, fechamento do mês, previsão rolante e cenários, com painel de cards e gráficos.
- Regras: tudo cifrado; dado individual fica numa pasta pessoal só sua (de preferência no seu OneDrive); só o pedaço comum vai para a pasta sincronizada (`Gestao-Compartilhado`), com um único dono por arquivo e detecção de cópias de conflito do OneDrive.
- A Central e o Quadro (2.2) seguem as mesmas regras: senha obrigatória, aviso de cofre, botão "Onde estou?" e, no Quadro, um arquivo por pessoa em `times/<time>/quadro/`. Depois de mudar a Central ou o Quadro, rode `python3 tools/injetar_seguranca.py` (reinjeta o bloco comum, reembute o Quadro e remonta o assistente).
- **Tema claro, escuro ou automático** em todas as ferramentas (inclusive as férias): botão redondo no canto inferior direito. Automático segue o sistema; a escolha fica só neste computador. A camada é `financas/src/tema.js`, injetada pelo build em todos os HTMLs ([ADR-0027](docs/adr/0027-tema-claro-escuro-compartilhado.md)). Para testar tudo no escuro: `TEMA=escuro node financas/testes/teste-e2e.js`.
- Código-fonte em `financas/src/`; monte com `python3 tools/build_financas.py` e teste com `node financas/testes/teste-e2e.js`. Plano e decisões em [`docs/plano-financas.md`](docs/plano-financas.md).

## Férias

Apoio para **enxergar e planejar as ausências** do time e do grupo (não substitui a ferramenta oficial de férias da empresa). Desde a Central 15.9, o gestor e a liderança usam a página **Férias da Central**: mesmo arquivo e mesma senha, os times e as chaves vêm da Integração e a pasta é a mesma ([ADR-0033](docs/adr/0033-ferias-dentro-da-central.md)). Quem usava o Mapa separado traz o arquivo antigo com **Trazer do Mapa de Férias separado**. O [`ferias/ferias.html`](ferias/ferias.html) à parte fica para as pessoas do time; a página da Central é o mesmo código, embutido pelo build.

- cada pessoa do time marca as próprias férias (ou o responsável marca as de todos) e a ferramenta publica sozinha, cifrado com a chave do time, em `times/<time>/ferias/`;
- o gestor, na Central, soma os times, marca as próprias férias e as dos diretos e vê o **mapa de calor** dos dias com mais e menos gente fora, as semanas mais tranquilas e quem está fora em cada dia; ao marcar uma ausência, a ferramenta mostra o impacto e sugere períodos com menos gente fora;
- o gestor publica o consolidado para a liderança em `grupos/<grupo>/ferias/`, com a mesma chave do grupo das Finanças do Grupo, e a liderança soma os gestores do mesmo jeito, em quantos níveis forem precisos.

Plano e decisões em [`docs/plano-ferias.md`](docs/plano-ferias.md); teste com `node financas/testes/teste-ferias.js`.

**Visual experimental:** a pasta `experimental/` do pacote traz as mesmas ferramentas, com os mesmos dados, num visual novo (trilho marinho, fontes DM Sans e Plus Jakarta Sans embutidas, ícone próprio em cada aba). Ela é montada do main a cada pacote por `python3 tools/build_experimental.py` (a partir de `experimental/src/`), e a CI roda nela os mesmos testes; as versões atuais não mudam ([ADR-0034](docs/adr/0034-visual-experimental.md)).


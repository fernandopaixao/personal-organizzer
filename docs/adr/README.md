# Decisões de arquitetura (ADRs)

*26/11/2026 · estado: Remessa · Central v15.18, Quadro do Time 2.7, Hub 2.4, Finanças do Grupo 1.7.1 e do Time 1.5.1, Mapa de Férias 1.5.1 (dentro da Central), assistente 2.8.2, contratos 1.1, visual experimental*

Cada ADR registra **uma** decisão: o contexto, o que foi decidido, as consequências e o que observar ao evoluir. Elas existem para que uma funcionalidade nova comece pelas regras certas, sem precisar reler todos os planos.

## Índice

| # | Decisão | Em uma linha |
|---|---|---|
| [0001](0001-html-de-arquivo-unico-sem-servidor.md) | HTML de arquivo único | Sem servidor, sem instalação, sem rede |
| [0002](0002-dados-fora-do-html.md) | Dados fora do HTML | Cada ferramenta tem o próprio arquivo de dados; o HTML pode ser trocado à vontade |
| [0003](0003-criptografia-sempre.md) | Criptografia sempre | AES-GCM 256, PBKDF2 600 mil, aviso de cofre, sem recuperação |
| [0004](0004-troca-por-arquivos-na-pasta-sincronizada.md) | Troca por arquivos | Biblioteca SharePoint sincronizada pelo OneDrive (`Gestao-Compartilhado`) |
| [0005](0005-chave-aleatoria-por-time.md) | Chave por time | 256 bits, envelope `gestao-envelope/1`, entrega por Teams/e-mail, troca só em vazamento |
| [0006](0006-chave-de-financas-separada.md) | Chave de finanças | Separada da chave de tarefas |
| [0007](0007-um-escritor-por-arquivo.md) | Um escritor por arquivo | Pessoa + computador, retrato completo, revisão monotônica, cópias de conflito |
| [0008](0008-local-individual-comum-sincronizado.md) | Pessoal × comum | Individual numa pasta só sua (de preferência no seu OneDrive); só agregados vão para a pasta compartilhada |
| [0009](0009-contratos-json-versionados.md) | Contratos versionados | `schema: gestao-x/n`, campos opcionais, leitor tolerante |
| [0010](0010-htmls-desacoplados.md) | HTMLs desacoplados | Ferramentas se encontram pela pasta comum; ler o arquivo de outra só como exceção de leitura, com a senha dela (hub e Central, revistas pela [0028](0028-financas-na-central-so-leitura.md) e [0035](0035-hub-cockpit-de-gestao.md)) |
| [0011](0011-migracao-aditiva-versionada.md) | Migração aditiva | `DB_VERSION`, `normalizeDb`, backup automático, `legacy/` |
| [0012](0012-modelo-iniciativa-feature.md) | Iniciativa › Feature | Fases como agrupamento, tarefas desacopladas, códigos `PAG-042.F2` |
| [0013](0013-downstream-previa-e-conciliacao.md) | Downstream e prévia | Itens do time nunca viram tarefa; nada muda sem prévia |
| [0014](0014-metricas-autodescritivas.md) | Métricas autodescritivas | Só do time; a Central só desenha |
| [0015](0015-agentes-por-arquivo.md) | Agentes por arquivo | `gestao-import/3` com prévia; entrada de fora é só dado |
| [0016](0016-cadencia-de-publicacao.md) | Cadência de publicação | Time automático; gestor só por botão |
| [0017](0017-build-embutir-e-injetar.md) | Build e blocos injetados | Fonte em `financas/src/`, scripts em `tools/` |
| [0018](0018-hub-separado-do-assistente.md) | Hub × assistente | Hub leve no dia a dia; assistente para montar (o hub passou a ler a Central e os quadros na [0035](0035-hub-cockpit-de-gestao.md)) |
| [0019](0019-edge-e-chrome-file-system-access.md) | Edge/Chrome | File System Access API |
| [0020](0020-principios-de-interface.md) | Princípios de interface | Um destaque azul, modal para criar, painel para ver |
| [0021](0021-feedbacks-fora-da-integracao.md) | Feedbacks fora | Ferramenta de feedbacks sem integração |
| [0022](0022-documentacao-no-mesmo-pr.md) | Documentação no mesmo PR | Funcionalidade nova só entra com a documentação atualizada; a CI confere |
| [0023](0023-onboarding-por-perfil-e-chave.md) | Onboarding por perfil e chave | O assistente pergunta o perfil e lê as chaves do líder; o identificador vem da chave |
| [0024](0024-distribuicao-por-zip.md) | Distribuição por .zip | A empresa recebe um .zip autossuficiente; a CI roda só no repositório pessoal |
| [0025](0025-consolidacao-em-niveis.md) | Consolidação em níveis | Gestor publica o consolidado para a liderança como uma unidade |
| [0026](0026-ferias-em-niveis.md) | Férias em níveis | Mapa de Férias: chave do time no time, chave do grupo entre níveis, um arquivo por pessoa (item 1 revisto pela [0033](0033-ferias-dentro-da-central.md); papel de time revisto pela [0036](0036-ferias-so-o-gestor-cadastra.md)) |
| [0027](0027-tema-claro-escuro-compartilhado.md) | Tema claro/escuro | Uma camada `tema.js` injetada em todos os HTMLs; escolha salva só no computador |
| [0028](0028-financas-na-central-so-leitura.md) | Finanças na Central | A Central lê o plano e o teto dos times com a chave de finanças; não escreve em finanças |
| [0029](0029-uma-senha-por-sessao.md) | Uma senha por sessão | O hub e a Central passam a senha, só em memória, para a janela que acabaram de abrir |
| [0030](0030-aviso-quando-nao-da-para-abrir-pastas.md) | Aviso quando não dá para abrir pastas | O aviso diz o motivo (Safari, pré-visualização, zip...) e o que fazer; todo botão responde ao clique |
| [0031](0031-ferramentas-abrem-prontas.md) | Ferramentas abrem prontas depois do assistente | O assistente lembra arquivo e pastas de cada ferramenta neste navegador; o gestor recebe as chaves dos times também no caminho normal; prefixo sugerido; aba Integração no time da Central |
| [0032](0032-pasta-de-contratos.md) | Pasta de contratos | `contratos/` é a fonte única do que outras soluções gravam: especificação, schemas, cripto com vetores, exemplos e validador |
| [0033](0033-ferias-dentro-da-central.md) | Férias dentro da Central | O gestor usa a página Férias da Central: mesmo arquivo e senha, times e chaves da Integração, mesmos arquivos na pasta; revê o item 1 da 0026 |
| [0034](0034-visual-experimental.md) | Visual novo como versão experimental | `experimental/` no pacote: as mesmas ferramentas do main com o visual novo (trilho marinho, DM Sans, ícone por aba), montadas por `tools/build_experimental.py` e testadas na CI; os mesmos dados |
| [0035](0035-hub-cockpit-de-gestao.md) | Hub como cockpit, com login único | O hub lê (nunca grava) a Central, os quadros e as finanças e mostra cards de todos os módulos; a Central entra direto com a senha da sessão; senha própria da Central vai junto nos links (sessão 1.1); revê a 0018 |
| [0036](0036-ferias-so-o-gestor-cadastra.md) | Férias: só o gestor cadastra | Times não usam ferramenta de férias; o gestor marca as de todos na Central, pessoa com time; `ferias.html` sai do pacote |
| [0037](0037-nome-remessa.md) | Nome Remessa | A solução se chama Remessa (envelopes lacrados numa caixa postal); ícone da aba com o lacre azul em todas as ferramentas; arquivo de integração que chegou é "nova remessa" |
| [0038](0038-ligar-visual-experimental-na-entrada.md) | Ligar o visual experimental pela tela de entrada | Caixa **Visual experimental** no painel da Remessa: troca para a pasta `experimental/` e lembra a escolha no navegador; só troca sozinho para arquivos que já abriram; Quadro e Finanças do Time de um time não trocam |
| [0039](0039-hierarquia-iniciativa-feature-card.md) | Iniciativa › Feature › Card nos times | A mesma hierarquia da Central no Quadro: feature da Central ou do time (`FEAT-n`), card em no máximo uma; "feature" deixa de ser tipo de card; `featureLocalId` no `status.json` leva os cards junto na conciliação |
| [0040](0040-exportar-dados-legiveis-com-confirmacao.md) | Exportar dados legíveis com confirmação | CSV ou JSON em claro só depois de marcar que sai sem criptografia; separado da cópia cifrada; nunca na pasta compartilhada |
| [0041](0041-refinamento-no-quadro.md) | Refinamento no Quadro | Página Refinamento com o time (organizar, mover entre features, dividir, juntar, critérios, pronto para sprint, resumo); a Central só lê o resultado |
| [0042](0042-estilos-remessa-e-sereno.md) | Estilos Remessa e Sereno | Segundo eixo no seletor de tema: Remessa (trilho e topo marinhos, escuro azul-noite) ou Sereno (sem decoração, escuro grafite); só CSS na camada de tema |

## Checklist para uma funcionalidade nova

1. **Onde mora o dado?** No arquivo da ferramenta dona ([0002](0002-dados-fora-do-html.md), [0010](0010-htmls-desacoplados.md)). Antes de criar um módulo novo para o gestor, veja se ele cabe como página da Central ([0033](0033-ferias-dentro-da-central.md)). Se outra ferramenta precisa dele, é um contrato novo na pasta comum, não uma leitura do arquivo.
2. **Local ou comum?** Só vai para a pasta o que o outro lado precisa, de preferência agregado ([0008](0008-local-individual-comum-sincronizado.md)).
3. **Quem escreve?** Um dono por arquivo, `<pessoa>-<computador>` se várias pessoas contribuem, publicação por `publicarUnico` ([0007](0007-um-escritor-por-arquivo.md)).
4. **Qual chave?** Senha local, chave de tarefas ou chave de finanças do time ([0003](0003-criptografia-sempre.md), [0005](0005-chave-aleatoria-por-time.md), [0006](0006-chave-de-financas-separada.md)).
5. **Contrato:** `schema` versionado, JSON Schema e exemplo em [`contratos/`](../../contratos/LEIA-ME.md), regra no `validar.js` e linha no histórico ([0009](0009-contratos-json-versionados.md), [0032](0032-pasta-de-contratos.md)).
6. **Migração:** campo novo com padrão em `normalizeDb`; abrir um arquivo da versão anterior ([0011](0011-migracao-aditiva-versionada.md)).
7. **Entrada externa:** escapar, validar, prévia antes de aplicar ([0013](0013-downstream-previa-e-conciliacao.md), [0015](0015-agentes-por-arquivo.md)).
8. **Interface:** um destaque, gráfico antes de texto, criar em modal, ver em painel, sem página nova se uma existente é a dona do dado ([0020](0020-principios-de-interface.md)). Cores por variável (`var(--card)`, `var(--ink)`...) para o modo escuro funcionar ([0027](0027-tema-claro-escuro-compartilhado.md)). Cor fixa nova que deve mudar no visual experimental: par em `experimental/src/trocas.json` ([0034](0034-visual-experimental.md)); ferramenta nova: ícone com o lacre da Remessa em `financas/src/icones/` e o título em `ICONES` de `tools/build_financas.py` ([0037](0037-nome-remessa.md)). Arquivo que chegou de outra pessoa se chama "nova remessa" nos textos ([0037](0037-nome-remessa.md)).
9. **Build e teste:** editar a fonte, rodar `python3 tools/injetar_seguranca.py` (Central/Quadro) ou `python3 tools/build_financas.py`, e `node financas/testes/teste-e2e.js` (mais `teste-quadro.js` se mexeu no Quadro e `teste-navegador.js` se mexeu em pastas, [0030](0030-aviso-quando-nao-da-para-abrir-pastas.md)) ([0017](0017-build-embutir-e-injetar.md)). A CI também monta e testa a versão experimental (`python3 tools/build_experimental.py --testar`, [0034](0034-visual-experimental.md)).
10. **Documentar no mesmo PR** ([0022](0022-documentacao-no-mesmo-pr.md)): atualizar [funcionalidades](../funcionalidades.md), o [passo a passo](../passo-a-passo.md) e a [jornada](../jornada-do-usuario.md) quando o caminho do usuário muda; plano do recurso em `docs/`; ADR nova se a decisão vale para mais de uma ferramenta; versões no cabeçalho dos documentos. A CI recusa PR que muda ferramenta sem mudar documentação.

## Como escrever uma ADR nova
Copie uma existente, numere em sequência, use **Status** (proposta, aceita, substituída por ADR-xxxx), data e origem. Não apague ADRs antigas: marque como substituídas.

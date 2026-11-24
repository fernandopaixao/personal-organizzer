# Decisões de arquitetura (ADRs)

*24/11/2026 · estado: Central v15.2, Quadro do Time 2.2, Hub 1.1, Finanças do Grupo e do Time 1.2*

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
| [0008](0008-local-individual-comum-sincronizado.md) | Local × comum | Individual fica na máquina; só agregados vão para a pasta |
| [0009](0009-contratos-json-versionados.md) | Contratos versionados | `schema: gestao-x/n`, campos opcionais, leitor tolerante |
| [0010](0010-htmls-desacoplados.md) | HTMLs desacoplados | Nenhuma ferramenta lê o arquivo de outra |
| [0011](0011-migracao-aditiva-versionada.md) | Migração aditiva | `DB_VERSION`, `normalizeDb`, backup automático, `legacy/` |
| [0012](0012-modelo-iniciativa-feature.md) | Iniciativa › Feature | Fases como agrupamento, tarefas desacopladas, códigos `PAG-042.F2` |
| [0013](0013-downstream-previa-e-conciliacao.md) | Downstream e prévia | Itens do time nunca viram tarefa; nada muda sem prévia |
| [0014](0014-metricas-autodescritivas.md) | Métricas autodescritivas | Só do time; a Central só desenha |
| [0015](0015-agentes-por-arquivo.md) | Agentes por arquivo | `gestao-import/3` com prévia; entrada de fora é só dado |
| [0016](0016-cadencia-de-publicacao.md) | Cadência de publicação | Time automático; gestor só por botão |
| [0017](0017-build-embutir-e-injetar.md) | Build e blocos injetados | Fonte em `financas/src/`, scripts em `tools/` |
| [0018](0018-hub-separado-do-assistente.md) | Hub × assistente | Hub leve no dia a dia; assistente para montar |
| [0019](0019-edge-e-chrome-file-system-access.md) | Edge/Chrome | File System Access API |
| [0020](0020-principios-de-interface.md) | Princípios de interface | Um destaque azul, modal para criar, painel para ver |
| [0021](0021-feedbacks-fora-da-integracao.md) | Feedbacks fora | Ferramenta de feedbacks sem integração |
| [0027](0027-tema-claro-escuro-compartilhado.md) | Tema claro/escuro | Uma camada `tema.js` injetada em todos os HTMLs; escolha salva só no computador |

## Checklist para uma funcionalidade nova

1. **Onde mora o dado?** No arquivo da ferramenta dona ([0002](0002-dados-fora-do-html.md), [0010](0010-htmls-desacoplados.md)). Se outra ferramenta precisa dele, é um contrato novo na pasta comum, não uma leitura do arquivo.
2. **Local ou comum?** Só vai para a pasta o que o outro lado precisa, de preferência agregado ([0008](0008-local-individual-comum-sincronizado.md)).
3. **Quem escreve?** Um dono por arquivo, `<pessoa>-<computador>` se várias pessoas contribuem, publicação por `publicarUnico` ([0007](0007-um-escritor-por-arquivo.md)).
4. **Qual chave?** Senha local, chave de tarefas ou chave de finanças do time ([0003](0003-criptografia-sempre.md), [0005](0005-chave-aleatoria-por-time.md), [0006](0006-chave-de-financas-separada.md)).
5. **Contrato:** `schema` versionado, JSON Schema e exemplo ([0009](0009-contratos-json-versionados.md)).
6. **Migração:** campo novo com padrão em `normalizeDb`; abrir um arquivo da versão anterior ([0011](0011-migracao-aditiva-versionada.md)).
7. **Entrada externa:** escapar, validar, prévia antes de aplicar ([0013](0013-downstream-previa-e-conciliacao.md), [0015](0015-agentes-por-arquivo.md)).
8. **Interface:** um destaque, gráfico antes de texto, criar em modal, ver em painel, sem página nova se uma existente é a dona do dado ([0020](0020-principios-de-interface.md)). Cores por variável (`var(--card)`, `var(--ink)`...) para o modo escuro funcionar ([0027](0027-tema-claro-escuro-compartilhado.md)).
9. **Build e teste:** editar a fonte, rodar `python3 tools/injetar_seguranca.py` (Central/Quadro) ou `python3 tools/build_financas.py`, e `node financas/testes/teste-e2e.js` ([0017](0017-build-embutir-e-injetar.md)).
10. **Documentar:** plano do recurso em `docs/`, ADR nova se a decisão vale para mais de uma ferramenta, e atualizar [funcionalidades](../funcionalidades.md) e o [passo a passo](../passo-a-passo.md).

## Como escrever uma ADR nova
Copie uma existente, numere em sequência, use **Status** (proposta, aceita, substituída por ADR-xxxx), data e origem. Não apague ADRs antigas: marque como substituídas.

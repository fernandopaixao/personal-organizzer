# Contratos de integração · Remessa

*Contratos 1.0 · 25/11/2026 · vale para Central v15.14, Quadro do Time 2.3.2, Hub 2.3, Finanças do Grupo 1.7, Finanças do Time 1.5 e Mapa de Férias 1.5 (dentro da Central)*

A solução se chama **Remessa** ([ADR-0037](../docs/adr/0037-nome-remessa.md)): cada arquivo desta pasta é um envelope lacrado com a chave do time, deixado na caixa postal (a pasta compartilhada). Nas ferramentas, um arquivo que chegou e ainda não foi aplicado aparece como **nova remessa**.

Esta pasta é **tudo o que outra solução precisa respeitar** para gravar arquivos que as ferramentas da solução leem e conciliam, até a visão da **liderança** (líder de líderes): o Hub da liderança, as Finanças do Grupo da liderança e a página Férias da Central. Vale para um time com ferramenta própria, um gestor par com planilha ou sistema próprio, um agente que gera arquivos, ou qualquer ferramenta nova.

Ela é autossuficiente: não depende de rede, servidor, pacote npm nem do repositório. Vai inteira no .zip da solução (`python3 tools/empacotar.py`) e pode ser copiada para a pasta compartilhada como `Gestao-Compartilhado/contrato/` (em claro, porque não tem dados).

## Por onde começar

| Se você quer... | Leia |
|---|---|
| Entender quem escreve o quê e onde | [01 · Arquitetura, níveis e layout da pasta](01-arquitetura.md) |
| Cifrar e decifrar os arquivos | [02 · Criptografia, chaves e vetores de teste](02-criptografia.md) |
| Gravar sem conflito no OneDrive | [03 · Regras de escrita (anti-conflito)](03-regras-de-escrita.md) |
| Saber como nomear times, códigos e versões | [04 · Versionamento, identificadores e códigos](04-versionamento-e-codigos.md) |
| Integrar na prática, passo a passo | [05 · Como integrar](05-como-integrar.md) |

## O que tem aqui

```
contratos/
  LEIA-ME.md                     este índice
  01-arquitetura.md … 05-como-integrar.md
  schemas/                       JSON Schema (2020-12) de cada arquivo trocado
    gestao-envelope-1.schema.json        envelope cifrado (todo arquivo da pasta)
    gestao-catalogo-1.schema.json        iniciativas e features da Central para um time
    gestao-status-1.schema.json          backlog e andamento publicados pelo time
    gestao-metricas-1.schema.json        métricas do time
    dicionario-metricas.json             métricas padrão e apelidos aceitos
    gestao-financas-plano-1.schema.json  plano financeiro do time e consolidado do grupo
    gestao-financas-diretriz-1.schema.json  diretriz e teto (gestor → time, liderança → grupo)
    gestao-ferias-1.schema.json          férias e ausências (pessoa do time e consolidado do grupo)
    gestao-postits-1.schema.json         post-its do hub para o time
    gestao-postits-vistos-1.schema.json  recibo "Vi" dos post-its
    financas-preset-1.md                 pré-configuração embutida no HTML de finanças (não é arquivo da pasta)
  referencia/cripto.js           implementação de referência (navegador e Node 20+, sem dependências)
  validar.js                     validador: pasta inteira, um arquivo, conteúdo em claro; também cifra e decifra
  vetores/vetores-envelope.json  vetores de teste do envelope (casos que abrem e que devem falhar)
  exemplos/
    CHAVES-DE-EXEMPLO.txt        chaves públicas dos exemplos (nunca use em dados reais)
    conteudo/                    o JSON de cada arquivo, em claro
    Gestao-Compartilhado/        os mesmos arquivos cifrados, no layout real da pasta
    gerar.js                     regenera os exemplos
  testes/teste-contratos.js      prova que as ferramentas reais leem os exemplos (repositório; usa Playwright)
```

## Regras que não se negociam

Um arquivo que quebra uma destas regras é **ignorado** por quem lê (sem derrubar nada, mas também sem aparecer):

1. **Tudo cifrado** no envelope `gestao-envelope/1` (AES-256-GCM, chave GK1 de 32 bytes, AAD amarrando o cabeçalho). Nenhum dado em claro na pasta. Chave nunca na pasta.
2. **Caminho certo:** cada conteúdo tem um lugar fixo ([01, seção 3](01-arquitetura.md#3-layout-da-pasta-compartilhada)); o `team` do envelope e o `source.team` do conteúdo são o slug da pasta.
3. **Chave certa:** tarefas, finanças e grupo têm chaves diferentes ([02, seção 2](02-criptografia.md#2-chaves)). Chave de finanças nunca cifra status, métricas, férias ou post-its.
4. **Um dono por arquivo:** só quem é dono grava; arquivos com várias pessoas viram um arquivo por pessoa (`<pessoa>-<computador>.json`); `writer` no cabeçalho igual a `source.writer`.
5. **Retrato completo** a cada gravação, com `revision` sempre maior que qualquer revisão já vista na pasta e `generatedAt` com fuso.
6. **Só agregados sobem:** o nível de cima recebe o que precisa, nunca o detalhe pessoal (notas, métricas por pessoa, nomes de linhas dos times no consolidado).
7. **Leitor tolerante:** campos desconhecidos são ignorados; mudança que quebra vira versão nova do contrato (`/2`).

## Conferir antes de publicar

```bash
node contratos/validar.js conteudo meu-plano.json --como times/pagamentos/financas/plano.json
node contratos/validar.js cifrar meu-plano.json --chave GK1.pagamentos-fin-2611.… --saida plano.json
node contratos/validar.js pasta "C:\Users\voce\OneDrive - Empresa\Gestao-Compartilhado" --chave GK1.… --chave GK1.…
node contratos/validar.js vetores        # sua implementação de cripto bate com a nossa?
node contratos/validar.js exemplos       # o validador está íntegro?
```

O validador sai com código 1 quando há erro (bom para usar em CI ou num agente). Avisos não reprovam.

## Histórico dos contratos

| Data | O que mudou |
|---|---|
| 15/11/2026 | `gestao-envelope/1`, `gestao-catalogo/1`, `gestao-status/1`, `gestao-metricas/1`, dicionário de métricas (Central v14 e Quadro do Time) |
| 23/11/2026 | `gestao-financas-plano/1`, `gestao-financas-diretriz/1` (finanças do grupo e do time); `writer` em claro no envelope |
| 24/11/2026 | `gestao-postits/1`, `gestao-postits-vistos/1` (Hub); plano e diretriz multianuais (`fiscalYears`, `byYear`, `totalsByYear`); consolidado do grupo (`source.level = "group"`, `units`); `gestao-ferias/1` |
| 24/11/2026 | Contratos 1.0: esta pasta única, com especificação, vetores de teste, exemplos de todos os arquivos e validador ([ADR-0032](../docs/adr/0032-pasta-de-contratos.md)) |
| 24/11/2026 | Nenhum formato mudou. Quem lê e publica as férias do gestor e da liderança passou a ser a página Férias da Central ([ADR-0033](../docs/adr/0033-ferias-dentro-da-central.md)); os arquivos `times/<time>/ferias/` e `grupos/<grupo>/ferias/` continuam iguais |
| 25/11/2026 | Nenhum formato mudou. Só o gestor cadastra as férias, na Central ([ADR-0036](../docs/adr/0036-ferias-so-o-gestor-cadastra.md)): as pessoas dos times entram no consolidado com `people[].id` `<time>.<slug>` e `unit` do time, como já previa o schema; `times/<time>/ferias/` fica para outra solução do time |
| 25/11/2026 | Nenhum formato mudou e o envelope continua igual. O Hub 2.0 (cockpit, [ADR-0035](../docs/adr/0035-hub-cockpit-de-gestao.md)) passou a ler `status.json` (iniciativas por situação e bloqueios) e `metricas.json` (até 3 métricas, as com `highlight` primeiro, com o último valor, a série e a faixa de `thresholds`; só métricas com série em `data.series[0].points`); a solução passou a se chamar Remessa ([ADR-0037](../docs/adr/0037-nome-remessa.md)) |

Mudou um contrato? Atualize nesta pasta o schema, o exemplo (`exemplos/gerar.js`), a regra no `validar.js` e esta tabela, no mesmo PR da ferramenta ([ADR-0022](../docs/adr/0022-documentacao-no-mesmo-pr.md)).

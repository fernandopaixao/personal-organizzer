# 05 · Como integrar

*Contratos 1.0 · 25/11/2026 (revisto para o Hub 2.0, as férias só do gestor e a Remessa)*

Guia prático para quem constrói outra solução (uma ferramenta do time, uma planilha com macro, um script, um agente) que precisa aparecer no hub do gestor e na visão da liderança. Antes, leia [01](01-arquitetura.md) para achar o seu arquivo na tabela do layout.

## 1. Antes de escrever código

1. **Qual nível você representa?** Um time (`times/<time>/`) ou um grupo para a liderança (`grupos/<grupo>/`).
2. **Quais arquivos você publica?** Só os da tabela de [01, seção 3](01-arquitetura.md#3-layout-da-pasta-compartilhada) cujo dono é o seu papel. Se precisa trocar algo que não está lá, é um contrato novo: fale com quem administra a solução antes.
3. **Peça a chave** a quem administra o nível de cima: a chave de tarefas e a de finanças do time vêm do gestor; a chave do grupo vem da liderança. Guarde no cofre. A chave nunca entra no código nem no repositório: leia de uma variável de ambiente, de um cofre ou peça à pessoa a cada sessão.
4. **Combine o slug** (e o prefixo, se for time) com quem cadastrou você. O slug é o nome da pasta e o `team` de todos os seus arquivos.
5. **Garanta um dono:** decida qual pessoa e qual computador publicam (o `writer`). Se várias pessoas vão publicar férias ou post-its, cada uma tem o próprio arquivo.
6. **Saiba quem vai ler.** Para o seu time aparecer no **hub** do gestor (cockpit), o hub também precisa da chave de tarefas do time: o gestor faz **Importar da Central** no hub depois de cadastrar você. Para as finanças, o hub precisa da chave de finanças (**Importar do Finanças do Grupo**).

## 2. O ciclo de publicação

```
montar o conteúdo (retrato completo)  →  validar  →  ler a pasta (arquivo + cópias)  →  conferir o dono
  →  revision = maior vista + 1, generatedAt com fuso, hlc  →  cifrar (IV novo)  →  gravar atômico
  →  reler e decifrar para conferir  →  limpar as suas cópias de conflito
```

Com a referência em JavaScript:

```js
const G = require('./contratos/referencia/cripto.js');           // no navegador: window.GestaoCripto
const { kid, raw } = G.lerChaveTexto(process.env.CHAVE_FIN);       // GK1.pagamentos-fin-2611.…
const key = await G.importarChave(raw);
const writer = G.writerDe('Ana Souza', idDoComputador);           // 'ana~k3f9a' (id guardado na máquina)
const revisao = G.proximaRevisao(revisoesVistasNaPasta, ultimaQuePubliquei);
const conteudo = { schema: 'gestao-financas-plano/1', revision: revisao, generatedAt: G.isoComFuso(), hlc: G.hlcAgora(estado, hlcMaisNovoDaPasta),
  source: { team: 'pagamentos', writer, tool: 'minha-ferramenta', toolVersion: '1.0.0' }, /* … resto do plano … */ };
const env = await G.cifrarEnv(conteudo, { key, kid, team: 'pagamentos' });
// grave JSON.stringify(env) em times/pagamentos/financas/plano.json de forma atômica e releia
```

Sem JavaScript, use o validador como ferramenta de linha de comando:

```bash
node contratos/validar.js conteudo plano.json --como times/pagamentos/financas/plano.json   # confere em claro
node contratos/validar.js cifrar plano.json --chave "$CHAVE_FIN" --saida plano.cifrado.json   # cifra
# copie plano.cifrado.json para Gestao-Compartilhado/times/pagamentos/financas/plano.json
node contratos/validar.js pasta "$PASTA" --chave "$CHAVE_FIN"                                   # confere como as ferramentas leem
```

O `cifrar` não lê a pasta nem calcula a revisão: quem chama garante a revisão maior e a gravação atômica.

**Publique só quando o conteúdo mudou.** Cada gravação vira uma **nova remessa** do outro lado: o hub do gestor marca "Nova remessa" no time quando a data do arquivo é das últimas 24 horas, e a Central e o Finanças do Grupo mostram a revisão nova para conferir e aplicar. Um script que regrava o mesmo conteúdo de hora em hora, com a revisão subindo, deixa o gestor com uma remessa nova o tempo todo. Compare o retrato com o último publicado e só grave se for diferente.

## 3. Receitas por cenário

### A. Time com ferramenta própria de tarefas → Central do gestor

- Publica `times/<time>/status.json` ([schema](schemas/gestao-status-1.schema.json), [exemplo](exemplos/conteudo/times/pagamentos/status.json)) e `times/<time>/metricas.json` ([schema](schemas/gestao-metricas-1.schema.json), [exemplo](exemplos/conteudo/times/pagamentos/metricas.json)) com a **chave de tarefas**.
- Lê `central/catalogo-<time>.json` para saber os códigos (`PAG-042`, `PAG-042.F2`) e referencia só esses.
- Status automático (~10 s depois de cada mudança); métricas ao fechar a sprint. Um contador de revisão para os dois.
- Métricas só do time; use `standard` do [dicionário](schemas/dicionario-metricas.json) quando a definição for a padrão; métrica própria leva `definition`.
- **O que o hub do gestor mostra** (Hub 2.0, [ADR-0035](../docs/adr/0035-hub-cockpit-de-gestao.md)): do `status.json`, as iniciativas que não estão `done` contadas por `status` (`ok`, `attn`, `late`; `paused` só entra no total) e os `blockers` com `text` e `since`; do `metricas.json`, até 3 métricas, as com `highlight: true` primeiro e depois por `order`, com o último ponto, a série e a cor do primeiro item de `thresholds` que o valor satisfaz. Marque `highlight` em até 3 métricas e dê a elas uma série em `data.series[0].points` (uma métrica só com `data.value` não aparece no hub) e `thresholds` para o hub pintar a situação. Iniciativa em `late` ou `attn` e bloqueio aberto entram na lista **Pede sua atenção** do gestor.
- Mais detalhes para adaptar uma ferramenta existente: `guia-adaptacao-times.md` (no pacote .zip, em `docs/`; no repositório, em `ferramenta-time/`).

### B. Time com planilha ou sistema financeiro próprio → Finanças do Grupo do gestor

- Publica `times/<time>/financas/plano.json` ([schema](schemas/gestao-financas-plano-1.schema.json), [exemplo](exemplos/conteudo/times/pagamentos/financas/plano.json)) com a **chave de finanças do time**, sem `source.level`.
- Lê `grupo/financas/diretriz-<time>.json` (teto, categorias, centros de custo, versão do plano e prazo) e usa os **mesmos ids de categoria**.
- Cada linha traz `months` com `budget`, `forecast` e `actual` em centavos; `totals` e `totalsByYear` são a soma dos meses. Meses fechados em `closedMonths`.
- O gestor vê a revisão nova numa prévia e aplica. Republicar a mesma revisão não muda nada.

### C. Gestor com ferramenta própria → liderança (líder de líderes)

É o cenário que alimenta a página da liderança.

- **Finanças:** publique `grupos/<grupo>/financas/plano.json` com a **chave do grupo** (`GK1.<grupo>-fin-…`, gerada pela liderança), `source.level = "group"` e `source.team = <grupo>` ([exemplo](exemplos/conteudo/grupos/canais/financas/plano.json)):
  - `units`: cada unidade somada (`slug`, `name`, `kind` `time` ou `grupo`, `revision` e `generatedAt` do plano dela, `planVersion`).
  - `lines`: uma linha por unidade × categoria × OPEX/CAPEX, `id` `<unidade>:<categoria>:<O|C>`, nome `<Unidade> · <Categoria>`; itens do próprio grupo em `grupo:<categoria>`. Sem os nomes das linhas dos times.
  - `categories` com os mesmos ids da liderança (os que não casam viram "Outras" lá).
  - `totals`, `totalsByYear` e `fiscalYears` coerentes com os meses; mesma `currency` da liderança.
  - Só entra o que o gestor conferiu: publique por botão, depois de mostrar o que sobe e o que fica de fora.
- **Teto:** leia `grupos/<grupo>/financas/diretriz.json` (a liderança escreve) e mostre `byYear[ano].capTotal`.
- **Férias:** publique `grupos/<grupo>/ferias/<pessoa>-<computador>.json` com a **chave do grupo**, `source.level = "group"` ([exemplo](exemplos/conteudo/grupos/canais/ferias/marina-p8x2c.json)): `units[0]` é o próprio grupo (`parent: null`), as unidades de baixo apontam para ela; `people[].id` é `<unidade>.<id>`; sem notas; nomes podem ir como "Pessoa N".
- **Se a sua ferramenta é a da liderança** (lê os grupos): leia `grupos/<grupo>/financas/plano.json` e `grupos/<grupo>/ferias/*.json` de cada gestor com a chave que você gerou para ele, siga as regras de leitura de [01, seção 4](01-arquitetura.md#4-como-cada-ferramenta-lê-o-que-o-seu-arquivo-precisa-satisfazer) e publique `grupos/<grupo>/financas/diretriz.json`.

### D. Férias de um time com ferramenta própria

Opcional: desde a Central 15.11 o gestor cadastra as férias do time na própria Central ([ADR-0036](../docs/adr/0036-ferias-so-o-gestor-cadastra.md)). Use este caminho só se o time já tem um sistema com as férias e quer que elas apareçam sozinhas; a Central soma esse arquivo às pessoas que o gestor cadastrou.

- Cada pessoa (ou o sistema, em nome dela) publica `times/<time>/ferias/<pessoa>-<computador>.json` com a **chave de tarefas do time** ([exemplo](exemplos/conteudo/times/pagamentos/ferias/ana-k3f9a.json)).
- `people[].id` é o slug do nome (`ana-souza`): o mesmo nome em dois arquivos é a mesma pessoa. Publique `hlc`.
- **Use o nome completo que o gestor cadastrou na Central.** Desde a 15.11 o gestor cadastra as pessoas do time na página Férias; a Central junta a pessoa dele com a do seu arquivo quando o slug do nome é igual (sem acento, minúsculas, espaços viram `-`: `Ana Souza` → `ana-souza`). Com nomes diferentes (`Ana` e `Ana Souza`), a mesma pessoa aparece duas vezes. Uma ausência com o mesmo início e fim nos dois lados conta uma vez só.
- Tipos: `ferias`, `folga`, `treinamento`, `outro`. Sem tipos de saúde, sem notas.

### E. Recados para o time (post-its)

- O autor publica `times/<time>/postits/<pessoa>-<computador>.json` com a chave de tarefas; quem leu publica `postits/vistos/<pessoa>-<computador>.json`. Post-it vencido (`expiresAt` no passado) não é publicado.

## 4. Checklist de conformidade

- [ ] Caminho e nome do arquivo exatamente como em [01](01-arquitetura.md#3-layout-da-pasta-compartilhada).
- [ ] `schema` do conteúdo = `content` do envelope; `team` = `source.team` = slug da pasta.
- [ ] Chave da família certa; `kid` começa pelo slug.
- [ ] `writer` no conteúdo e no cabeçalho (arquivos de dono único); nome do arquivo = `writer` com `-` (arquivos por pessoa).
- [ ] `revision` maior que todas as vistas; `generatedAt` com fuso e idêntico no envelope; `hlc` publicado.
- [ ] IV aleatório a cada gravação; gravação atômica; releitura depois de gravar.
- [ ] Retrato completo; nada pessoal além do necessário; dinheiro em centavos; totais = soma dos meses.
- [ ] `node contratos/validar.js vetores` passa com a sua implementação de cripto (ou você usa a referência).
- [ ] `node contratos/validar.js pasta <pasta> --chave …` sem erros na pasta real (ou numa cópia).
- [ ] O dono do nível de cima viu o seu arquivo aparecer na ferramenta dele (hub, Finanças do Grupo ou Central, inclusive a página Férias).

## 5. Quando algo não aparece

| Sintoma do lado de quem lê | Causa provável |
|---|---|
| "não abre com a chave cadastrada" | `kid` diferente do cadastrado, chave revogada, AAD montado diferente (confira com os vetores) |
| "ainda não publicou" | Caminho ou nome errado; arquivo começa com `.`; `team` diferente da pasta |
| "arquivo na pasta é mais antigo que o já lido" | `revision` não cresceu |
| Mesma pessoa contada duas vezes nas férias | `id` da pessoa diferente entre arquivos (use o slug do nome) |
| Totais do hub diferentes da soma no grupo | `totals`/`totalsByYear` não batem com os meses |
| Aparece na Central, mas não no hub | O hub não tem a chave do time: no hub, **Importar da Central** (tarefas) ou **Importar do Finanças do Grupo** (finanças) |
| Hub sem métricas do time | Nenhuma métrica com série em `data.series[0].points`, ou todas com `scope.level` `person` |
| "Nova remessa" o tempo todo | A solução regrava o arquivo sem mudança; publique só quando o conteúdo mudar |
| Valores em "Outras" | `category` fora dos ids da diretriz |
| Cópias `-NOTEBOOK` acumulando | Duas máquinas publicando com o mesmo `writer`, ou sem limpar as próprias cópias |

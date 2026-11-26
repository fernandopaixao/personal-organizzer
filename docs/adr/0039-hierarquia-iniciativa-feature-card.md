# ADR-0039 · Hierarquia Iniciativa › Feature › Card igual na Central e nos times

**Status:** aceita · **Data:** 26/11/2026 · **Origem:** pedido do Fernando ("garanta que feature possa ter cards associados; a hierarquia dos cards do modo gestor precisa ser a mesma dos times") · complementa a [ADR-0012](0012-modelo-iniciativa-feature.md) · **Fonte:** `ferramenta-time/quadro_do_time_v1.html`, `gestao_pessoal_v15.html` (downstream e conciliação), [`contratos/schemas/gestao-status-1.schema.json`](../../contratos/schemas/gestao-status-1.schema.json)

## Contexto
Na Central, o modelo é **Iniciativa › Feature › Tarefa** (ADR-0012): a feature é um nível, pertence a uma iniciativa, não muda dela e agrupa o que a entrega. No Quadro do Time até a 2.4 havia duas coisas diferentes com o mesmo nome:
- a **feature da Central**, que vinha do catálogo e só aparecia se a iniciativa do time estivesse ligada a uma da Central;
- o **tipo de card "feature"**, uma folha do quadro: não tinha cards dentro, e o gestor recebia como um item solto.

Resultado: numa iniciativa só do time (ou antes de a Central cadastrar as features), o time não tinha como agrupar cards numa feature, e o "card feature" passava a ideia errada de que a feature era um card.

## Decisão
1. **A mesma hierarquia nas duas pontas: Iniciativa › Feature › Card.** No Quadro, a feature é o nível entre a iniciativa e os cards. Fase continua sendo só agrupamento de features da Central no tempo.
2. **Duas origens de feature, o mesmo papel.** A feature pode vir da Central (catálogo, código `PAG-042.F2`, só leitura no Quadro) ou ser **criada pelo time** (`FEAT-<n>`, em `db.features`), dentro de uma iniciativa do time, ligada ou não à Central. Como na Central, **a feature não muda de iniciativa** e fica `aberta`, `concluída` ou `cancelada`.
3. **Cada card fica em no máximo uma feature:** `featureRef` (da Central) **ou** `featureId` (do time). Escolher uma limpa a outra; escolher a feature também acerta a iniciativa do card.
4. **"feature" deixa de ser tipo de card.** Os tipos passam a ser história, entrega, bug, spike e melhoria. Card antigo do tipo feature mostra o aviso e o botão **Transformar em feature**: cria a feature do time com o mesmo nome e coloca o card dentro dela como entrega, sem perder histórico nem métricas. Se o card já estava numa feature da Central, ele só vira entrega dela.
5. **Na Central, a feature do time chega como item `kind: "feature"`** no `status.json`, e os cards dela levam o campo opcional novo **`featureLocalId`** (contratos 1.1, aditivo). A Central:
   - lista a feature do time, com a contagem de cards, em **Itens do time sem feature** (conciliação e painel da iniciativa); os cards dela não aparecem soltos;
   - ao **Ligar** a feature do time a uma feature da Central (ou **Criar feature** a partir dela), os cards vão junto e aparecem no downstream, recuados embaixo da feature do time.
6. **Volta para o time pelo catálogo:** o vínculo da conciliação (`links[]` com `kind: "feature"` e o `localId` da feature do time) faz o Quadro passar os cards para o código da Central e encerrar a feature do time. O próprio time pode fazer o mesmo em **Unir com a da Central**, no formulário da feature.
7. **No Quadro, a hierarquia aparece em todas as telas:** Iniciativas mostra as features da Central e do time com os cards de cada uma e **+ Feature do time**; o Backlog agrupa por **Feature**; o Quadro tem raias por **Feature**; o card e o Novo card escolhem a feature num campo único, separado em "Da Central" e "Do time".

## Consequências
- O gestor vê a mesma árvore que o time trabalha, mesmo antes de cadastrar as features na Central, e concilia uma feature inteira de uma vez em vez de card a card.
- Leitor antigo ignora `featureLocalId` (leitor tolerante, ADR-0009): uma Central anterior à 15.18 continua mostrando a feature do time e os cards como itens soltos, como antes.
- Arquivos do Quadro 2.4 abrem sem migração destrutiva: `normalizeDb` cria `features: []` e `seq.feature`; os cards do tipo feature continuam como estão até alguém transformá-los.
- Várias pessoas no mesmo quadro: `mergeDb` une `features` como une épicos e cards e renumera `FEAT-<n>` repetido, levando os cards junto.

## Ao evoluir
- Ferramenta de time própria (caminho B do guia): publique a feature do time como item `kind: "feature"` antes dos cards dela e use `featureLocalId` nos cards; o validador de `contratos/` recusa `featureLocalId` que não aponta para um item `feature` da mesma iniciativa.
- Não crie um quarto nível (sub-feature, épico de épico): fase continua sendo agrupamento no tempo, e tarefa do gestor continua desacoplada dos cards dos times (ADR-0013).

# ADR-0041 · Refinamento com o time no Quadro; a Central só lê o resultado

**Status:** aceita · **Data:** 26/11/2026 · **Origem:** pedido do Fernando ("uma tela com os times que facilite o refinamento da demanda: criar iniciativas, funcionalidades, desenhar sprints, mover entregável entre features e depois ir pro planejamento de sprints"); plano em `refinamento/plano-refinamento.md` (pasta do projeto), decisões D1 a D8 aprovadas como recomendado · complementa a [ADR-0039](0039-hierarquia-iniciativa-feature-card.md) · **Fonte:** `ferramenta-time/quadro_do_time_v1.html` (bloco "Refinamento")

## Contexto
Até o Quadro 2.5, refinar a demanda com o time era espalhado: criar feature em Iniciativas, trocar a feature de um card por vez no painel do card, escolher a sprint de cada card no Backlog. Não havia como mover vários entregáveis de uma vez, dividir ou juntar cards, nem marcar o que está pronto para entrar numa sprint.

A pergunta era onde a tela deveria morar. Tudo que o refinamento mexe (cards, prioridade, tamanho, sprint, feature do time) é dado do time, gravado no arquivo de cada pessoa ([ADR-0007](0007-um-escritor-por-arquivo.md)). O que é do gestor (iniciativas e features com código, prazos, fases) já chega ao Quadro pelo catálogo.

## Decisão
1. **A página Refinamento fica no Quadro do Time**, no menu do topo entre Backlog e Sprints, em quatro passos: **Organizar** e **Refinar** (2.6), **Desenhar sprints** e **Planejar a sprint** (2.7). A Central **não ganha tela de edição** do refinamento: ela recebe o resultado pelos arquivos que o Quadro já publica.
2. **Organizar:** árvore Iniciativa › Feature (features da Central só leitura, do time editáveis), cards da feature escolhida na ordem de prioridade e a coluna **Sem feature** como entrada. Arrastar um ou mais cards para uma feature, ou **Mover para… (M)** num formulário de duas colunas. **Dividir** e **Juntar** cards. **Desfazer** (Ctrl+Z) das mudanças da sessão.
3. **As regras da ADR-0039 valem aqui:** a feature não muda de iniciativa; quem muda é o card, que vai para a iniciativa da feature escolhida, com aviso antes. Card concluído ou cancelado não se move.
4. **Refinar:** uma feature por vez, com **tamanho** (pontos, opcional), **critérios de aceite** e **pronto para sprint** (checklist do time em Ajustes › Refinamento, até 5 itens; dá para marcar à mão). Critérios e pronto **ficam no time** (D8): não vão para a Central.
5. **Dividir** mantém o histórico e as métricas no card original (ele vira a primeira parte ou é cancelado com o motivo); **Juntar** cancela os outros cards com "juntado em CARD-n" e leva os critérios para o card que fica.
6. **Desenhar sprints (2.7):** grade feature × sprint. A **capacidade** padrão é a **vazão em cards** das 3 últimas sprints fechadas (D3); em Ajustes dá para trocar para pontos. A **previsão de uma feature** é o fim da última sprint aberta com card dela; card sem sprint vira "depois de dd/mm". Para a feature da Central, o `forecastEnd` do `status.json` passa a ser o maior entre o prazo dos cards e essa previsão (campo que já existia). Mudar o escopo da sprint em andamento pede confirmação.
7. **Planejar a sprint (2.7):** objetivo, capacidade (guardada na sprint ao iniciar), cards prontos fora da sprint e **Iniciar sprint**. Ao fechar, a sprint guarda **objetivo atingido** (`goalMet`), uma linha (`note`), o que entrou e saiu depois do início (`added`, `removed`, derivados do compromisso) e o que ficou aberto (`result.carriedOver`).
8. **Resumo da sessão:** features novas, cards movidos, divididos, juntados, estimados e prontos, mais decisões, participantes e próximo refinamento. **Copiar para o Teams e encerrar** guarda a sessão em `refinements[]` no arquivo do Quadro.
9. **Feature criada no refinamento** segue o caminho que já existe: vai como item `kind: "feature"` no `status.json` e o gestor concilia na Central, levando os cards junto.

## Consequências
- O time refina sem depender do gestor; o gestor vê o resultado na conciliação e no downstream, sem uma segunda ferramenta editando a mesma coisa.
- Campos novos só no arquivo do Quadro (aditivos, `normalizeDb` cria os padrões): `rank`, `acceptance[]`, `ready`, `splitFrom`/`splitInto`, `mergedInto`, `cancelReason` nos cards; `settings.refinement`; `refinements[]` e `seq.refine`. O `mergeDb` une `refinements` como une cards e sprints. Arquivos 2.5 abrem sem migração destrutiva.
- O Desfazer vale só para as mudanças feitas nesta aba, na sessão aberta.
- Nenhum contrato muda nesta etapa.

## Ao evoluir
- Feature com código da Central continua só leitura no Quadro. Se o time precisa de uma, cria como feature do time e o gestor concilia.
- Ferramenta de time própria (caminho B do guia) não precisa ter refinamento: a Central não depende disso.
- A sprint ao vivo e o resultado da sprint na Central entram na etapa seguinte, com ADR própria para o que mudar nos contratos.

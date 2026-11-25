# ADR-0035 · Hub como cockpit de gestão, com login único

**Status:** aceita · **Data:** 25/11/2026 (Hub 2.0, Central 15.10, sessão 1.1) · **Origem:** pedido do Fernando ("refaça a interface do início (hub), deixe tudo mais bonito, faça com que o usuário logue uma única vez para navegar entre módulos e traga cards/informações relevantes de todos os módulos, como um cockpit de gestão") · revê o item "o hub nunca lê dados de outra ferramenta" da [ADR-0018](0018-hub-separado-do-assistente.md)

## Contexto
O hub era uma lista de links com post-its e uma visão das finanças dos times. Para saber o que pedia atenção, o gestor abria a Central, cada Quadro e as Finanças, um por um. A senha já passava do hub para as ferramentas ([ADR-0029](0029-uma-senha-por-sessao.md)), mas a Central ainda pedia um clique na tela de entrada, e uma Central com senha diferente da do hub pedia a senha toda vez.

## Decisão
1. **O hub vira o cockpit.** Uma tela com saudação e frase do dia, cards de leitura de todos os módulos, uma lista única "Pede sua atenção" (atrasado primeiro), pessoas (fora hoje, próximas ausências, 1:1 em atraso), os módulos com uma linha viva cada um e os times com indicadores, finanças e post-its.
2. **O hub lê, nunca grava, nos outros módulos:**
   - **Central:** abre o arquivo da Central com a senha da sessão, só para leitura. Acha o arquivo pelo que a própria Central lembra neste navegador, pelo arquivo escolhido no hub ou pelo `.json` da Central na pasta pessoal (o mais recente). Calcula um resumo com as mesmas regras da tela Hoje (tarefas atrasadas e de hoje, delegadas atrasadas e a cobrar, saúde das iniciativas "agora", 1:1 pela cadência, quem está fora pela página Férias) e descarta o resto. Relê só quando o arquivo muda.
   - **Quadros:** `status.json` (`gestao-status/1`) e `metricas.json` (`gestao-metricas/1`) que cada time já publica para a Central, com a chave de tarefas que o hub já tem. Mostra iniciativas no prazo, em atenção e atrasadas, bloqueios abertos e as métricas de destaque com a série.
   - **Finanças:** o plano agregado de cada time, como no Hub 1.2.
   Nenhum contrato muda.
3. **Login único.** A pessoa entra uma vez no hub. Tudo o que o hub abre recebe a senha da sessão (ADR-0029). Duas melhorias:
   - **Central 15.10** entra direto quando o navegador já liberou o último arquivo; se ainda precisa da confirmação do navegador, fica com a senha preenchida e um clique em "Continuar com …".
   - **Sessão 1.1:** se a Central tem senha diferente, a pessoa digita uma vez no cockpit; ela fica só na memória e vai junto nos links do hub para a Central (`data-sessao="central"`).
   - **Encerrar sessão** no topo esquece as senhas da memória e volta para a tela de entrada.
4. **Visual** com variáveis de cor, para valer no claro, no escuro e no visual experimental ([ADR-0034](0034-visual-experimental.md)).

## Consequências
- **A favor:** abrir o dia é abrir o hub. As ferramentas continuam separadas, cada uma dona do próprio arquivo.
- **Contra:**
  - o hub fica acoplado ao formato do arquivo da Central (`gestao-cripto/2` e os campos de tarefas, iniciativas, pessoas e férias). Mudança nesses campos precisa atualizar `resumoCentral` no hub;
  - quem tem o hub aberto com a sessão aberta vê o resumo da Central sem digitar a senha dela (o mesmo risco aceito na ADR-0029). Encerrar sessão resolve;
  - a leitura da Central custa uma derivação de chave (PBKDF2) por arquivo novo; o hub guarda a chave derivada só em memória e só relê quando o arquivo muda.

## Ao evoluir
- **Card novo no cockpit:** leia só o que a ferramenta dona já grava ou publica; nunca grave no arquivo de outra ferramenta.
- **Regra nova na tela Hoje da Central** (o que é atrasado, saúde da iniciativa): replique em `resumoCentral` de `financas/src/hub.html` e no teste da seção 18.
- **Link novo para a Central no hub:** use `linkF`, que põe `data-sessao="central"`.

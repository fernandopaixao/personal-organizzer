# ADR-0031 · Ferramentas abrem prontas depois do assistente

**Status:** aceita · **Data:** 24/11/2026 (assistente 2.3, Central 15.8, Hub 1.4, Finanças do Grupo 1.5, Finanças do Time 1.4, Mapa de Férias 1.2, Quadro do Time 2.3) · **Origem:** pedido do Fernando: "vendo os arquivos que ele gerou, ainda tive que manualmente recriar muita coisa, chaves etc. Automatize o máximo possível."

## Contexto
O assistente criava os arquivos cifrados, mas, ao abrir cada ferramenta, a pessoa ainda precisava:
- escolher de novo a pasta pessoal e o arquivo em cada ferramenta;
- ligar a pasta sincronizada em cada uma;
- no caminho normal do gestor (sem "Estou com sorte"), gerar a chave de cada time na Central e no Finanças do Grupo, colar a de finanças na Central e montar à mão o pacote de cada time;
- definir o prefixo do time antes de poder gerar a chave na Central.

## Decisão
- **O assistente lembra tudo neste navegador.** Ao criar os arquivos, ele grava no IndexedDB, para cada ferramenta, o arquivo e a pasta pessoal (`local:<ferramenta>`) e a pasta sincronizada (as mesmas chaves que a ferramenta já usava: `hub-raiz`, `fin-grupo-raiz:<grupo>`...). Na Central, grava `handle` e `igDir`; no Quadro, `dataFile` e `root`. Só ficam *handles* de pasta e de arquivo; nunca senha, chave ou dado.
- **Cada ferramenta abre sozinha** o arquivo lembrado quando o navegador ainda tem a permissão da pasta, usando a senha da sessão ([ADR-0029](0029-uma-senha-por-sessao.md)) quando veio do hub. Sem permissão, a tela inicial mostra **Abrir &lt;arquivo&gt;**: um clique libera a pasta. A Central mostra **Continuar com &lt;arquivo&gt;**.
- **Gestor, caminho normal = Estou com sorte nas chaves.** O assistente gera a chave de tarefas (e, com Finanças, a de finanças) de cada time, ou reaproveita a chave de tarefas que a pessoa colou para um dos times. Grava as chaves na Central (`integ.keys` e `integ.finKeys`), no Finanças do Grupo, no Mapa de Férias e no hub, e gera `para-os-times/<time>/` com as ferramentas do time.
- **Prefixo sugerido.** Time sem prefixo recebe um padrão (três primeiras letras, sem repetir: `PAG`, `CAR`). A Central faz o mesmo no botão **Gerar chave de integração** do time.
- **Central 15.8:** aba **Integração** dentro do time, com a chave em destaque (gerar, baixar o HTML do time, copiar, mensagem, finanças, trocar se vazar) e um aviso com o botão na Visão do time quando falta a chave.

## Consequências
- **A favor:** depois do assistente, o gestor abre o hub e as ferramentas já estão com arquivo, pasta, times, prefixos e chaves. A única coisa a fazer é guardar as chaves no cofre e mandar cada pasta `para-os-times/<time>/`.
- **Contra:**
  - o que fica lembrado vale para este navegador e este computador. Em outro computador, cada ferramenta pede a pasta uma vez (ou roda-se o assistente de novo apontando para a mesma pasta, escolhendo "Manter o existente");
  - rodar o assistente de novo aponta a Central e o Quadro para os arquivos recém-criados.

## Ao evoluir
- Ferramenta nova com arquivo pessoal: chame `lembrarArquivo(chave, dir, arquivo)` ao abrir, `botaoUltimo`/`ligarUltimo` na tela inicial e `abrirLembradoSePuder` na carga; e acrescente a ferramenta em `lembrarTudo()` do assistente.
- Nos testes automatizados (webdriver), o lembrar só vale com `window.__lembrar = true` (seção 20 do `teste-e2e.js`).

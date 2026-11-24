# ADR-0030 · Aviso claro quando não dá para abrir pastas

**Status:** aceita · **Data:** 24/11/2026 · **Origem:** relato do Fernando: a tela inicial do hub mostrava "Abra no Microsoft Edge ou no Google Chrome" e nenhum botão respondia

## Contexto
As ferramentas que leem pastas (Hub, Finanças do Time e do Grupo, Mapa de Férias e assistente inicial) dependem da File System Access API ([ADR-0019](0019-edge-e-chrome-file-system-access.md)). Ela falta no Safari, no Firefox, no Brave (desligada), no celular e em visualizadores embutidos, e o Chrome a recusa numa página aberta dentro de outra de outro endereço (pré-visualização do Outlook, Teams, OneDrive, SharePoint ou de outro aplicativo). Nesses casos a tela dizia só "abra no Edge ou no Chrome", mesmo quando a pessoa achava que já estava neles, e os botões ficavam mudos: o aviso aparecia como uma notificação curta no rodapé (às vezes fora da área visível) ou o erro era engolido.

## Decisão
1. **Um diagnóstico só, no núcleo comum** (`financas/src/nucleo.js`: `diagnosticoFS`, `avisoFS`, `semFS`). Ele descobre o motivo provável (celular, pré-visualização ou aplicativo, site, Brave, Firefox, Safari, outro navegador) e diz **o que fazer** naquele caso, com uma linha de detalhe (navegador e endereço) para ajudar quem dá suporte.
2. **O aviso fica no topo da tela inicial**, acima dos botões, e não embaixo.
3. **Todo botão que precisa de pastas responde ao clique.** Sem a função, o clique leva o aviso para o centro da tela e o faz piscar; dentro de uma janela, abre uma explicação. `escolherPasta` faz isso sozinha, então nenhum ponto que escolhe pasta fica mudo, e devolve `AbortError` para quem chama não repetir o aviso.
4. **`temFS()` só é verdadeiro se a pasta puder mesmo ser aberta**: a função existe e a página não está dentro de outra de outro endereço.
5. **Aberto de dentro do .zip** (pasta temporária do Windows ou anexo do Outlook), a ferramenta funciona, mas avisa para extrair o zip antes: o que for salvo ali pode sumir.
6. **Teste próprio** (`financas/testes/teste-navegador.js`, na CI): Safari, Firefox, celular, pré-visualização, Chromium normal e aberto de dentro do .zip, em todas as ferramentas acima.

## Consequências
- A Central e o Quadro do Time não mudam: eles têm plano B (enviar e baixar arquivos) e já explicavam a falta da função.
- Os botões não ficam desabilitados: desabilitar parecia "não faz nada" de novo.
- Um motivo novo (outro navegador ou visualizador) entra só em `diagnosticoFS`, e vale para todas as ferramentas na próxima montagem.

# ADR-0001 · Ferramentas em HTML de arquivo único, sem servidor

**Status:** aceita · **Data:** anterior a 06/11/2026 (v11), confirmada em todas as versões · **Origem:** Central v11

## Contexto
A solução nasceu como ferramenta pessoal de um gestor dentro de um ambiente corporativo. Não há servidor próprio, não é possível instalar software nas máquinas e os dados são sensíveis (pessoas, feedbacks, finanças). Os times também precisam usar as ferramentas sem pedir nada à TI.

## Decisão
Cada ferramenta é **um único arquivo `.html`** com HTML, CSS e JavaScript embutidos, aberto com dois cliques no navegador. Não há backend, API, banco externo nem chamadas de rede. Leitura e gravação de arquivos usam a File System Access API (ver [ADR-0019](0019-edge-e-chrome-file-system-access.md)).

## Consequências
- **A favor:** zero instalação, zero infraestrutura, funciona offline, fácil de distribuir (anexar, copiar para a pasta), o código é auditável abrindo o arquivo.
- **Contra:** arquivos grandes (a Central passa de 600 KB), sem bibliotecas externas por CDN, sem notificações em segundo plano, cada ferramenta só "sabe" de mudanças quando está aberta e lê a pasta.
- Testes automatizados rodam com Node + Playwright sobre o próprio HTML (`financas/testes/teste-e2e.js`).

## Alternativas consideradas
- Aplicação web com servidor: descartada por depender de infraestrutura e aprovação de TI.
- Planilhas: descartadas por não oferecerem cifragem, fluxo guiado nem interface específica.

## Ao evoluir
- Nada de dependência de rede (CDN, fontes remotas, telemetria). Se precisar de uma biblioteca, embuta o código.
- Funcionalidade nova entra no HTML existente ou num HTML novo e desacoplado ([ADR-0010](0010-htmls-desacoplados.md)), nunca num serviço.

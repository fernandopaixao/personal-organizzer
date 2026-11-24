# Regras do repositório

Fale e escreva em português.

## Toda funcionalidade nova atualiza a documentação no mesmo PR

Pedido do Fernando (24/11/2026). Um PR que cria ou muda uma funcionalidade só está pronto quando também atualiza:

1. `docs/funcionalidades.md` (o que faz, para quem, objetivo) e a tabela "Mapa das ferramentas" quando entra ferramenta nova;
2. `docs/passo-a-passo.md` (como usar, com a seção no sumário);
3. `docs/jornada-do-usuario.md` (etapas por papel e pontos de atenção);
4. `docs/visao-geral-da-solucao.md` (tabela da seção 1, árvore da pasta comum e mapa da documentação);
5. `README.md` (como abrir e para que serve);
6. `docs/adr/`: ADR nova quando a decisão vale para mais de uma ferramenta, e o índice em `docs/adr/README.md`;
7. o plano do recurso em `docs/plano-<recurso>.md` e o contrato em `financas/contrato/` se algo novo vai para a pasta comum;
8. as cópias na pasta do projeto (`documentacao/` e a pasta do recurso), quando o trabalho é feito numa thread do projeto.

Se uma funcionalidade não precisa mudar um desses documentos, diga no PR por quê.

## Build e teste

- Fontes em `financas/src/`. Depois de mudar qualquer fonte, a Central ou o Quadro, rode `python3 tools/injetar_seguranca.py` e faça commit dos HTMLs montados (a CI confere).
- Testes: `node financas/testes/teste-e2e.js` e `node financas/testes/teste-ferias.js`.
- Pacote para a empresa: `python3 tools/empacotar.py` (tudo o que for entregue precisa caber no .zip autossuficiente).
- Regras de arquitetura e o checklist de funcionalidade nova: `docs/adr/README.md`.

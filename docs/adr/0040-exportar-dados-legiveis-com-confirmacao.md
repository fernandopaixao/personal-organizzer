# ADR-0040 · Exportar dados legíveis só com confirmação explícita

**Status:** aceita · **Data:** 26/11/2026 · **Origem:** pedido do Fernando ("possibilidade de exportar dados decriptografados" na tela do kanban dos times) · exceção controlada à [ADR-0003](0003-criptografia-sempre.md) · **Fonte:** `ferramenta-time/quadro_do_time_v1.html` (`exportModal`, `exportCsv`, `exportLegivel`)

## Contexto
Todo arquivo da solução é cifrado (ADR-0003). A "Baixar cópia" do Quadro gerava o arquivo de dados cifrado com a senha: útil como backup, inútil para levar os cards a uma planilha, a outra ferramenta ou a um arquivo morto legível. O time precisava dos dados em claro, e a única saída era copiar da tela.

## Decisão
1. **Exportar dados legíveis** é uma ação própria, separada da cópia cifrada: botão **Exportar** na barra de filtros do quadro e **Exportar dados legíveis** em Ajustes, ao lado de **Baixar cópia cifrada (.json)**.
2. **Dois formatos:**
   - **Planilha dos cards (.csv):** um card por linha (código, título, tipo, coluna, situação, iniciativa e código na Central, feature, código e origem da feature, responsável, prazo, sprint, pontos, bloqueio, datas, link, notas); separador `;`, BOM UTF-8 e datas `dd/mm/aaaa`, para abrir direto no Excel em português. Célula que começa com `=`, `+`, `-` ou `@` ganha `'` na frente (não vira fórmula).
   - **JSON legível (.json, `quadro-exportacao/1`):** Iniciativa › Feature › Card ([ADR-0039](0039-hierarquia-iniciativa-feature-card.md)), com pessoas, sprints, colunas, atualizações de status, histórico de colunas e bloqueios de cada card, mais um campo `aviso` dizendo que o arquivo está sem criptografia.
3. **Confirmação obrigatória:** o diálogo diz em destaque que **o arquivo sai sem criptografia**, quem tiver o arquivo lê tudo, e pede para guardar numa pasta só sua e nunca na pasta compartilhada. O botão **Exportar sem cifra** só liga depois de marcar **Entendo que o arquivo sai sem criptografia**. Depois de baixar, o aviso aparece de novo.
4. **Nada vai para a pasta compartilhada:** a exportação só baixa para o computador de quem pediu. O formato `quadro-exportacao/1` não é contrato de troca e não entra em `contratos/`.

## Consequências
- O time leva os dados para planilha, arquivo morto ou outra ferramenta sem pedir ajuda e sem quebrar a regra de que a pasta comum só tem arquivos cifrados.
- O risco fica com uma decisão explícita de quem exporta, registrada na própria tela.

## Ao evoluir
- Outra ferramenta que ganhar exportação em claro segue o mesmo desenho: ação separada da cópia cifrada, aviso em destaque, confirmação marcada antes do botão ligar, e nunca gravar o arquivo em claro na pasta compartilhada.

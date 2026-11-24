# ADR-0023 · Onboarding por perfil, com as chaves do líder

**Status:** aceita · **Data:** 24/11/2026 · **Origem:** assistente 2.0 (`financas/src/inicio.html`)

## Contexto
O primeiro uso pedia várias ações em cada ferramenta (senha, chave, pasta, identificador), e o identificador digitado à mão podia não bater com o do líder. A solução também é usada por gestores pares, cada um com a própria liderança.

## Decisão
- O assistente pergunta **o perfil** (lidera 2 ou mais times, lidera 1 time, faz parte de um time), **o uso** (tarefas, finanças) e **se o líder compartilhou chaves**, com o nome da pasta sincronizada indicada por ele.
- O tipo da chave vem do `kid` ([0005](0005-chave-aleatoria-por-time.md), [0006](0006-chave-de-financas-separada.md)): `<time>-AAMM` (tarefas), `<time>-fin-AAMM` (finanças do time), `<grupo>-fin-AAMM` (finanças da liderança, "nível acima", só para o gestor). Chave que não serve ao perfil é mostrada como ignorada.
- O **identificador do time ou do grupo vem da chave** e fica travado.
- As chaves vão direto para os arquivos cifrados: hub (`times[].chaves`, `chavesFin`), Quadro (pré-configuração), Finanças do Time (`chaves`) e Finanças do Grupo (`acima.chaves`). Nunca para a pasta compartilhada.
- O gestor manda o `inicio.html` a cada time, com a chave por mensagem direta; gerar o HTML do time pela Central continua possível.

- **Estou com sorte (2.1):** o gestor gera numa tela só as chaves de tarefas e de finanças de cada time e todas as ferramentas, dele e dos times. Os HTMLs de `para-os-times/<time>/` levam a chave do time no preset (Quadro, Finanças do Time e Mapa de Férias), com aviso de cofre na primeira abertura. Por isso essa pasta é enviada só por mensagem direta ou e-mail, nunca pela pasta compartilhada.
- O assistente termina com um checklist do perfil; as marcações ficam só no navegador (`localStorage`), sem dado sensível.

## Consequências
- Um time monta tudo sozinho com uma chave e um nome de pasta.
- O formato do `kid` virou contrato: mudar o formato exige mudar o assistente, o hub e as finanças juntos.

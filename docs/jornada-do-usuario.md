# Jornada do usuário

*24/11/2026 · como cada papel conhece, monta, usa e mantém a solução*

A solução tem quatro papéis. A mesma pessoa pode ter mais de um (o gestor costuma ser também o dono das finanças do grupo; o líder do time costuma ser também o responsável financeiro).

| Papel | Quem é | Ferramentas que usa | O que espera da solução |
|---|---|---|---|
| **Gestor** | Fernando: gestor de vários times | Hub, Central, Finanças do Grupo, agentes | Saber o que pede atenção, não perder compromissos, ver portfólio, fluxo e dinheiro dos times sem pedir relatório |
| **Responsável pelo time** | Líder ou ponto focal de um time | Quadro do Time (publicador), às vezes Finanças do Time | Ferramenta pronta, pouco trabalho extra para reportar à gestão |
| **Membro do time** | Qualquer pessoa do time | Quadro do Time | Ver e mover os próprios cards, receber recados |
| **Responsável financeiro do time** | Quem cuida do dinheiro do time | Finanças do Time | Registrar gastos, prever o ano, publicar o plano sem planilha paralela |

---

## 1. Visão geral da jornada

```
 Montar          Configurar        Dia a dia              Rituais                  Fechamentos           Manter
 ─────────       ───────────       ─────────              ───────                  ───────────           ──────
 Assistente  ──► Times, chaves ──► Hub → Central/Quadro ──► 1:1, fóruns, status ──► Sprint / mês ────────► Versão nova,
 (uma vez)       e pastas          tarefas, cards,         com pauta pronta         publicar métricas     troca de computador,
                                   post-its, lançamentos                            e plano               senha, vazamento
```

---

## 2. Jornada do gestor

| Etapa | O que ele faz | Ferramenta | O que a solução garante | Ponto de atenção |
|---|---|---|---|---|
| **1. Montar** | Descompacta o .zip, abre `inicio.html`, responde "lidero 2 ou mais times" e "os dois", cola a chave da liderança se recebeu, informa o grupo e os times, escolhe as pastas, cria a senha | Assistente | Primeiro arquivo já cifrado, HTMLs do perfil, chaves já nos arquivos, próximos passos do perfil | Guardar a senha no cofre antes de seguir; pasta local fora do OneDrive |
| **2. Cadastrar times** | Cria cada time com prefixo (`PAG`) e pasta, gera a chave de tarefas e a de finanças | Central (Times, Integração) e Finanças do Grupo (Times) | Uma chave por time, aviso de cofre, prefixo travado após o primeiro código | Enviar a chave **por mensagem direta**, nunca na pasta |
| **3. Equipar os times** | Manda o `inicio.html` e, à parte, a chave e o nome da pasta (ou gera o **HTML do time** e o **HTML de finanças do time**) | Assistente, Central, Finanças do Grupo | O time monta tudo sozinho a partir da chave | O HTML não leva dados; a chave vai por mensagem direta |
| **4. Montar o portfólio** | Cadastra iniciativas, features e fases; clica **Compartilhar** | Central (Iniciativas, Integração) | Só sai o que ele revisou na tela de compartilhamento | Marcar o que não deve ir para o time |
| **5. Abrir o dia** | Abre o hub, lê os cards da Visão dos times (dinheiro e atividade), abre a Central | Hub → Central (Hoje) | Cards de leitura no topo da Hoje; atrasos, 1:1, fóruns, iniciativas em risco e novidades dos times | Arquivos novos dos times passam por prévia |
| **6. Trabalhar tarefas** | Registra demandas, delega, cobra | Central (Tarefas) | Aderência por pessoa e cobranças visíveis | |
| **7. Conversar com pessoas** | Prepara e conduz o 1:1 em modo Em conversa, copia o resumo | Central (1:1) | Pauta montada a partir de quatro fontes; combinados registrados | |
| **8. Conduzir fóruns** | Abre o fórum, discute a pauta, registra decisões e compromissos, compartilha os acordos | Central (Fóruns) | Pauta não discutida rola para a próxima; compromissos viram tarefas | |
| **9. Reunião de status** | Conduz a reunião do time com o status já preenchido pelo que o time publicou | Central (Times) | Downstream abaixo de cada feature; nada da Central muda sem aceite | |
| **10. Conciliar** | Une épicos do time a iniciativas, liga itens a features | Central (Integração) | Uniões podem ser desfeitas; códigos antigos viram apelidos | |
| **11. Usar agentes** | Depois de reuniões, copia o prompt certo, roda no agente, importa o JSON | Central (Importar e agentes) | Prévia antes de aplicar; reimportar não duplica | |
| **12. Recados** | Deixa post-its para um ou vários times e vê quem leu | Hub | Cifrados por time; um time não vê o post-it do outro | Atraso normal da sincronização |
| **13. Finanças** | Lê os planos novos dos times, revisa a prévia, olha o consolidado contra o orçamento, publica diretrizes, fecha versões | Finanças do Grupo (Painel) | Um time com problema nunca derruba a soma; "Saúde da soma" aponta o que falta; consolidado ano a ano | Informar orçamento e tetos de cada ano do horizonte |
| **14. Subir para a liderança** | Publica o consolidado para a liderança e recebe o teto dela | Finanças do Grupo (Ajustes › Nível acima) | Só sobe o total por ano e por unidade, cifrado com a chave da liderança | A liderança precisa ler a mesma pasta compartilhada |

## 3. Jornada do responsável pelo time

| Etapa | O que faz | Ferramenta | O que a solução garante | Ponto de atenção |
|---|---|---|---|---|
| **1. Receber** | Recebe o `inicio.html` (ou o HTML do Quadro) e, à parte, a chave e o nome da pasta | Teams / e-mail | A chave define o time; nada a digitar de identificador | Guardar a chave no cofre |
| **2. Primeiro uso** | No assistente: "lidero 1 time", cola a chave, escolhe as pastas e cria a senha; abre o Quadro já com a chave e diz quem é | Assistente → Quadro | Senha obrigatória, aviso de cofre, chave já no arquivo | Edge ou Chrome |
| **3. Ligar ao portfólio** | Em Iniciativas, liga épicos às iniciativas da Central ou usa **Trazer** | Quadro | Códigos da Central entram nos cards | |
| **4. Dia a dia** | Move cards, cria pela barra rápida, acompanha WIP e envelhecimento | Quadro | Backlog publicado sozinho a cada movimentação | |
| **5. Recados** | Lê post-its no topo e clica **Vi** | Quadro | O gestor vê quem leu | |
| **6. Fim de sprint** | Fecha a sprint e confirma a publicação das métricas | Quadro | Métricas autodescritivas, a Central só desenha | |
| **7. Convidar o time** | Envia o mesmo HTML às pessoas do time, com a chave por mensagem direta | Teams / e-mail | Cada pessoa grava o próprio arquivo, sem conflito | |

## 4. Jornada do membro do time

1. Recebe o HTML do Quadro e a chave do responsável.
2. Abre, cria a própria senha, cola a chave, conecta a pasta e responde "Quem é você neste quadro?".
3. Move os próprios cards, comenta, cria pela barra rápida.
4. Vê os post-its do gestor e clica **Vi**.
5. Não precisa fazer nada para reportar: o Quadro publica sozinho.

## 5. Jornada do responsável financeiro do time

| Etapa | O que faz | Ferramenta | Ponto de atenção |
|---|---|---|---|
| **1. Receber** | Recebe o HTML de finanças do time e a **chave de finanças** (diferente da chave de tarefas) | Teams / e-mail | Guardar no cofre |
| **2. Primeiro uso** | Cria a senha local, escolhe a pasta local e a sincronizada, cadastra a chave em Ajustes › Grupo e pasta | Finanças do Time | Pasta local fora do OneDrive |
| **3. Montar o plano** | Cria as linhas do plano (categoria, centro de custo, OPEX/CAPEX), orçado por mês, contratos recorrentes; adiciona os anos seguintes ao horizonte | Plano | Categorias e tetos seguem a diretriz do grupo |
| **4. Dia a dia** | Registra lançamentos e lê os cards e gráficos do Painel | Lançamentos, Painel › Hoje | Lançamentos ficam **só locais** |
| **5. Planejar** | Ajusta o previsto, simula cenários "e se", compara os anos no card Vários anos | Painel › Futuro e cenários | Cenários ficam locais até aplicar |
| **6. Fechar o mês** | Confere realizado × previsto, fecha o mês e publica o plano | Plano, Publicar para o grupo | Só o agregado vai para a pasta |

---

## 6. Momentos de manutenção (todos os papéis)

| Momento | O que fazer | Referência |
|---|---|---|
| **Versão nova de uma ferramenta** | Trocar o HTML e abrir o mesmo arquivo de dados; a migração é automática e baixa um backup | [Passo a passo §9](passo-a-passo.md#9-atualizar-para-uma-versão-nova) |
| **Trocar de computador** | Copiar a pasta local inteira (ou a cópia cifrada) e abrir com a senha do cofre | [Passo a passo §10](passo-a-passo.md#10-trocar-de-computador) |
| **Lembrete de teste da senha** | Digitar a senha do cofre; se falhar, trocar a senha enquanto o arquivo está aberto | [ADR-0003](adr/0003-criptografia-sempre.md) |
| **Chave vazou** | Gestor revoga e gera outra; envia ao responsável; o time cola a nova | [Passo a passo §11](passo-a-passo.md#11-uma-chave-vazou) |
| **Cópia de conflito encontrada** | Aceitar a resolução proposta pela ferramenta | [ADR-0007](adr/0007-um-escritor-por-arquivo.md) |
| **Prefere a tela escura** | Botão redondo no canto inferior direito de qualquer ferramenta: Claro, Escuro ou Automático (segue o sistema). Vale para todas as ferramentas neste computador | [Passo a passo §12](passo-a-passo.md#12-problemas-comuns) |
| **Pessoa saiu do time** | Desativar a pessoa nos Ajustes do Quadro; o arquivo dela continua lido | |

---

## 7. Atritos observados na revisão e oportunidades

Esta revisão olhou a solução como um todo em 24/11/2026. Os pontos abaixo não são defeitos urgentes; são oportunidades para as próximas evoluções.

| # | Atrito | Onde | Oportunidade |
|---|---|---|---|
| 1 | **Muitas senhas e chaves** para o gestor: senha da Central, do hub, de Finanças do Grupo, mais duas chaves por time | Gestor | **Melhorou no Hub 1.2:** o hub importa times e chaves da Central e do Finanças do Grupo, e o assistente 2.0 já grava as chaves coladas. As senhas continuam separadas por segurança; a integração das finanças no hub/Central está em proposta |
| 2 | ~~Finanças com 7 telas no time e 5 no grupo, com mais texto do que gráfico~~ | Finanças | **Resolvido na 1.2:** menu de 4 e 3 entradas, cards de leitura, curva acumulada e barras; planejamento multianual na 1.1. Feito depois: as mesmas peças estão no Hub 1.2 (Visão dos times) e na Hoje da Central 15.3 |
| 3 | ~~Três formulários da Central no padrão antigo~~ | Central | **Resolvido na 15.4:** atualização de iniciativa, acordo e prévia da importação com pílulas, validação no campo, verbo no botão e Enter |
| 4 | ~~Primeiro uso do time exige várias ações~~ | Quadro, Finanças do Time | **Resolvido no assistente 2.0:** onboarding por perfil (lidera times? finanças? chaves e pasta do líder), com as chaves já gravadas nos arquivos |
| 5 | **Hub depende de estar na mesma pasta** dos HTMLs | Hub | Já avisa; o assistente já grava tudo junto. Manter a orientação no cartão "Onde fica cada coisa" |
| 6 | ~~Times com ferramenta própria não veem post-its~~ | Caminho B | **Resolvido:** post-its no pacote para agentes dos times (`integracao-time/03`, seção 7.6) e no guia de adaptação (seção 3.3) |
| 7 | **Documentação espalhada** entre repositório e pasta do projeto | Docs | Este conjunto (ADRs, funcionalidades, jornada, passo a passo) vira a porta de entrada; a visão geral aponta para ele |

---

## 8. Jornada das férias (time, gestor e liderança)

O Mapa de Férias é apoio para a visão do grupo; o pedido oficial de férias continua na ferramenta da empresa.

| Etapa | Quem | O que faz | Ferramenta | Ponto de atenção |
|---|---|---|---|---|
| **1. Cadastrar** | Membro do time (ou o responsável) | Cria o próprio arquivo como "time", cola a chave do time e marca as férias | Mapa de Férias › Pessoas | Usar o mesmo nome em todos os arquivos para não duplicar a pessoa |
| **2. Subir para o gestor** | Automático | Cada mudança publica `times/<time>/ferias/<pessoa>-<computador>.json` | Pasta sincronizada | Sem a chave do time, nada sobe (aviso no Mapa) |
| **3. Enxergar o grupo** | Gestor | Soma os times, vê os dias com mais e menos gente fora, as semanas tranquilas e quem está fora em cada dia | Mapa, Calendário | Limite de pessoas fora ajustável (padrão 30%) |
| **4. Planejar** | Gestor e times | Ao marcar uma ausência, vê o impacto e pede sugestões de períodos com menos gente fora | Formulário de ausência | Apoio: o pedido oficial é feito na ferramenta da empresa |
| **5. Cadastrar as próprias** | Gestor | Marca as próprias férias e as dos diretos | Diretos | Notas ficam só locais |
| **6. Subir para a liderança** | Gestor | Cola a chave do grupo (a mesma das Finanças), confere e publica o consolidado | Ajustes › Nível acima | Opção de trocar nomes por "Pessoa N" |
| **7. Visão da liderança** | Liderança | Cadastra cada gestor como unidade e soma tudo, em quantos níveis existirem | Unidades, Mapa | A liderança precisa ler a mesma pasta compartilhada |

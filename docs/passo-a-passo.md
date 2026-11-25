# Passo a passo · como lidar com a solução

*24/11/2026 · Central v15.9, Quadro do Time 2.3, Hub 1.4, Finanças do Grupo 1.5 e do Time 1.4, Mapa de Férias 1.3, assistente 2.4, contratos 1.0*

Guia prático, na ordem em que as coisas costumam acontecer. Cada seção é independente. Antes de começar: use **Edge ou Chrome** no computador, abrindo o arquivo com dois cliques (não pela pré-visualização do Outlook, Teams ou OneDrive, nem de dentro do .zip), e tenha à mão um **cofre de senhas** (o gerenciador de senhas da empresa).

**Sumário**
1. [Montar a solução pela primeira vez](#1-montar-a-solução-pela-primeira-vez)
2. [Cadastrar um time e entregar a ferramenta](#2-cadastrar-um-time-e-entregar-a-ferramenta)
3. [Primeiro uso do Quadro do Time (time)](#3-primeiro-uso-do-quadro-do-time-time)
4. [Rotina diária do gestor](#4-rotina-diária-do-gestor)
5. [Rituais: 1:1, fóruns e reunião de status](#5-rituais-11-fóruns-e-reunião-de-status)
6. [Compartilhar o portfólio e conciliar com os times](#6-compartilhar-o-portfólio-e-conciliar-com-os-times)
7. [Usar os agentes de reuniões, chats e e-mails](#7-usar-os-agentes-de-reuniões-chats-e-e-mails)
8. [Finanças: do lançamento ao consolidado](#8-finanças-do-lançamento-ao-consolidado)
9. [Atualizar para uma versão nova](#9-atualizar-para-uma-versão-nova)
10. [Trocar de computador](#10-trocar-de-computador)
11. [Uma chave vazou](#11-uma-chave-vazou)
12. [Problemas comuns](#12-problemas-comuns)
13. [Férias: do time à liderança](#13-férias-do-time-à-liderança)
14. [Integrar outra solução pelos contratos](#14-integrar-outra-solução-pelos-contratos)

---

## 1. Montar a solução pela primeira vez

0. Descompacte o **.zip da solução** (`gestao-solucao-AAAA-MM-DD.zip`) numa pasta qualquer; ele traz o `inicio.html`, as ferramentas, a documentação e um LEIA-ME.
1. Crie uma **pasta pessoal**, só sua, de preferência dentro do **seu OneDrive** (por exemplo `OneDrive - Empresa\GestaoPessoal`). Ela é o seu backup se trocar de computador. Não use a pasta compartilhada com os times.
2. Garanta que a **biblioteca do SharePoint** do grupo (`Gestao-Compartilhado`) está sincronizada no seu computador pelo OneDrive.
3. Copie `inicio.html` para a pasta pessoal e abra com dois cliques.
4. **Perfil:** responda **Você lidera times?** (2 ou mais, 1, ou não) e **O que você quer organizar?** (tarefas, finanças ou os dois).
5. **Chaves:** se o seu líder mandou chaves (`GK1.…`), escolha **Sim, recebi**, cole uma por linha, clique **Conferir chaves** e informe o nome da pasta sincronizada que ele indicou. O assistente mostra o que cada chave é. Sem chave, escolha **Não, ainda não**: dá para colar depois dentro de cada ferramenta.
6. **Dados:** nome, prefixo de código, ano fiscal e moeda. Com chave, o identificador já vem dela e fica travado. O gestor lista os times que lidera.
7. Em **Pastas**, escolha a pasta pessoal e a pasta compartilhada. Se a ferramenta avisar que a pasta pessoal parece ser a compartilhada, escolha outra.
8. Em **Senha**, crie a senha, **guarde no cofre** e marque "Já guardei no cofre".
9. Em **Pronto**, a pasta pessoal passa a ter os HTMLs, os arquivos cifrados (já com as chaves), o `hub.html` e o `onde-fica-cada-coisa.html`. A tela explica os **dois tipos de arquivo**: o pessoal, cifrado com a sua senha e numa pasta só sua, e os comuns, cifrados com a chave de cada time na pasta compartilhada. Siga os **próximos passos** do seu perfil.
   Se você lidera vários times, o assistente já gerou a **chave de cada time** (tarefas e finanças) e a pasta `para-os-times/<time>/`: copie cada chave para o cofre com os botões da tela e mande cada pasta ao responsável por mensagem direta ou e-mail.
10. Clique **Abrir o hub**: ele abre já com a senha da sessão. Cada ferramenta aberta pelo hub abre sozinha o seu arquivo, com a pasta sincronizada ligada: não precisa escolher pasta nem colar chave neste computador. Em outro computador, cada ferramenta pede a pasta pessoal uma vez. A partir de agora o hub é a sua tela inicial; no dia a dia, abra o `hub.html` da pasta pessoal (dica: crie um atalho).

**Atalho: Estou com sorte.** Na primeira tela do assistente, quem lidera times pode clicar **Estou com sorte**:
1. Preencha o nome do grupo, o seu nome, os times (um por linha, com o prefixo se quiser), o ano e a moeda.
2. Escolha a pasta pessoal (só sua, de preferência no seu OneDrive), a pasta compartilhada (se já tiver) e crie a senha.
3. Clique **Gerar tudo** e confirme o aviso de cofre das chaves.
4. Na tela final, copie a chave de cada time para o cofre, siga o checklist e envie a cada responsável a pasta `para-os-times/<time>/` por mensagem direta ou e-mail (nunca pela pasta compartilhada). Depois clique **Abrir o hub**.
5. O time abre o `quadro_<time>.html`, o `financas_<time>.html` ou o `ferias.html`, cria a própria senha e guarda a chave quando a ferramenta pedir. As suas férias e as dos times ficam na página **Férias** da Central: não há `ferias.html` na sua pasta.

**Gestor: equipar cada time com o assistente.** Se preferir que o time rode o próprio assistente, depois de gerar as chaves dos times (seção 1 ou 2), mande a cada time o `inicio.html` e, por mensagem direta, a chave e o nome da pasta sincronizada. O responsável abre o assistente, escolhe "Sim, lidero 1 time", cola a chave e sai com o Quadro e/ou o Finanças do Time prontos. É o caminho recomendado; gerar o HTML do time pela Central (seção 2) continua valendo.

## 2. Cadastrar um time e entregar a ferramenta

**Tarefas (Quadro do Time)**
Times criados pelo assistente já têm prefixo, pasta e chave: pule para o passo 3.
1. Na Central, **Times › + Time**: o nome basta (prefixo e pasta podem ficar em branco).
2. Abra o time: o aviso em destaque mostra **Gerar chave de integração**. Um clique gera a chave e, se faltar, define a pasta e o prefixo (dá para mudar em **Editar time**). **Guarde no cofre**.
3. Na aba **Integração** do time, clique **HTML do time (com a chave)** (a tela mostra o aviso de cofre). Prefira enviar a chave separada do HTML.
4. Envie o HTML ao responsável e, **à parte, por mensagem direta no Teams ou por e-mail**, o texto da chave (`GK1.…`). Nunca coloque a chave na pasta compartilhada.
5. No hub, **Importar da Central** para poder mandar post-its a esse time.

**Finanças (Finanças do Time)**
1. No Finanças do Grupo, **Times**: cadastre o time, defina o **teto de cada ano** e a diretriz, e clique **Gerar chave** (chave de finanças, diferente da de tarefas).
2. **Publicar diretriz** para que o time veja tetos e categorias.
3. **Gerar HTML** de finanças do time e envie ao responsável financeiro, com a chave à parte (ou mande o `inicio.html` com a chave, como na seção 1).
4. No hub, **Importar do Finanças do Grupo**: os times e as chaves de finanças entram no hub, que passa a mostrar o plano de cada time na **Visão dos times**.

## 3. Primeiro uso do Quadro do Time (time)

1. Salve o HTML recebido numa pasta só sua (de preferência no seu OneDrive, nunca na pasta compartilhada) e abra no Edge ou Chrome.
2. Crie a **senha** do seu arquivo local e guarde no cofre.
3. Em **··· › Central**, cole a chave do time e conecte a pasta sincronizada (`Gestao-Compartilhado`).
4. Responda **Quem é você neste quadro?** (nome e este computador).
5. Em **Iniciativas**, ligue os épicos do time às iniciativas que vieram da Central, ou use **Trazer** para as que ainda não têm épico.
6. Pronto: cada movimentação de card publica o backlog sozinha. Ao **fechar a sprint**, confirme a publicação das métricas.
7. Para chamar o resto do time, envie o mesmo HTML e a chave por mensagem direta. Cada pessoa repete os passos 1 a 4.

## 4. Rotina diária do gestor

1. Abra o `hub.html` e digite a senha.
2. Veja na lista de times **quem publicou** (Quadro, status, métricas, plano).
3. Abra a **Central** pelo hub. A página **Hoje** mostra atrasos, 1:1 da semana, fóruns dos próximos 7 dias, iniciativas pedindo atenção e o cartão **Dos times**.
4. Se o cartão **Dos times** mostrar arquivos novos, vá em **Integração**, revise a prévia e aplique.
5. Registre e delegue em **Tarefas** (tecla 2). A barra rápida aceita texto livre.
6. Para mandar um recado a um time, volte ao hub (**← Hub**), clique **Novo post-it**, escolha o(s) time(s) e, se quiser, a pessoa e o "mostrar até". Depois acompanhe o **Visto por…**.

**Uma senha por dia.** Abra o hub com a senha do cofre e abra as outras ferramentas pelos links dele. O Finanças do Grupo, o Finanças do Time e o Mapa de Férias abrem sem pedir a senha de novo; a Central chega com a senha preenchida. A senha fica só na memória das janelas abertas e some ao fechar ([ADR-0029](adr/0029-uma-senha-por-sessao.md)).

## 5. Rituais: 1:1, fóruns e reunião de status

**1:1**
1. **1:1** (tecla 3): escolha a pessoa na lista.
2. Revise a aba **Pauta** (seus itens, itens dos agentes, combinados abertos e sugestões).
3. Clique **▶ Iniciar 1:1** para o modo **Em conversa**: anote, crie combinados e tarefas.
4. Ao encerrar, **copie o resumo** e envie por e-mail ou Teams.

**Fóruns**
1. **Fóruns** (tecla 6): escolha o fórum na lista lateral.
2. Em **Pautas**, marque o que foi discutido (o resto passa sozinho para a próxima ocorrência).
3. Registre **decisões** e **compromissos** (quem, o quê, até quando). Compromissos viram tarefas.
4. Em **Acordos**, copie ou imprima a folha para compartilhar.

**Reunião de status do time**
1. **Times** (tecla 7): abra o time e vá em **Reunião de status** (ou, no fórum do time, **Conduzir como reunião de status**).
2. O status vem pré-preenchido com o que o time publicou; o downstream aparece abaixo de cada feature.
3. Registre a atualização e gere a **folha para o Teams**.

## 6. Compartilhar o portfólio e conciliar com os times

1. Em **Iniciativas**, cadastre a iniciativa (código gerado com o prefixo do time), as features e as fases.
2. Marque como "não compartilhar" o que deve ficar só com você.
3. Em **Integração › Compartilhar**, revise o que é novo, alterado ou sai, e clique **Compartilhar**.
4. Quando o time publicar épicos ou itens sem vínculo, vá em **Integração › Conciliação**:
   - **Unir** o épico a uma iniciativa da Central, **Trazer para a Central** ou **Ignorar**;
   - **Ligar** o item a uma feature, **Criar feature** ou **Ignorar**;
   - **Desfazer** uma união, se necessário.
5. Compartilhe de novo para que o time receba os vínculos.

## 7. Usar os agentes de reuniões, chats e e-mails

1. Na Central, **Importar e agentes › Prompts para agentes**, escolha o prompt (ata, preparar 1:1, pautas, status…). Ele já vem com o contexto atual.
2. Cole o prompt no agente, junto com a reunião, o chat ou o e-mail.
3. Copie o **JSON** que o agente devolver.
4. Em **Importar JSON**, cole ou escolha o arquivo e revise a **prévia**.
5. Aplique. Reimportar o mesmo conteúdo não duplica nada.
6. Para séries de reuniões do Outlook, importe o `.ics` e associe cada série a um fórum ou 1:1 na prévia.

## 8. Finanças: do lançamento ao consolidado

**No time (Finanças do Time)**
1. **Plano › Plano mês a mês:** crie as linhas (categoria, centro de custo, OPEX/CAPEX, iniciativa opcional) e o orçado por mês. O "orçado mensal" de uma linha pode se repetir nos anos seguintes do plano.
2. **Plano › Contratos:** cadastre os compromissos recorrentes; eles geram o previsto dos meses seguintes.
3. **Lançamentos:** registre cada gasto numa linha do plano.
4. **Painel › Hoje:** leia os cards (folga ou excesso contra o orçado, ritmo do realizado, mês atual, teto), a curva do ano e "Onde vai o dinheiro".
5. **Painel › Futuro e cenários:** simule um cenário "e se" e use **Aplicar ao previsto** se for o caso.
6. Fim do mês: **Plano › Fechar mês**.
7. **Publicar para o grupo** (topo) ou **Ajustes › Grupo e pasta › Ver o que vai** e **Publicar plano**. Só o agregado por mês e linha vai para a pasta, com todos os anos do horizonte.

**Planejar mais de um ano**
1. No topo, **+ Adicionar ano…** e escolha começar vazio ou copiar o previsto/orçado do ano anterior com um reajuste em %.
2. Troque o ano no seletor do topo para editar o mês a mês daquele ano, ou use **Plano › Todos os anos** para ver linhas × anos (clique num ano para abrir o mês a mês).
3. Em **Painel › Futuro e cenários**, o card **Vários anos** mostra o total por ano e a variação contra o ano anterior.
4. Na virada do ano, em **Ajustes › Time e segurança**, mude o **ano base** para o novo ano. Tirar um ano do horizonte não apaga os valores.

**No grupo (Finanças do Grupo)**
1. Em **Ajustes**, informe o **orçamento aprovado de cada ano**; em **Times**, o teto de cada time por ano, e **Publicar diretriz**.
2. **Painel › Planos recebidos:** revise os planos novos de cada time e clique **Aplicar** (ou **Aplicar todos**). Confira a **Saúde da soma**.
3. **Painel › Consolidado:** escolha o ano no topo e leia os cards e as barras por time; a tabela **Por ano** mostra o horizonte inteiro; exporte CSV se precisar.
4. **Painel › Versões:** ao aprovar um orçamento ou reforecast, **Fechar versão**; depois, compare com hoje no ano em exibição.

**Consolidar em níveis (gestor → liderança)**
1. **Liderança:** em **Times › + Grupo de outro gestor**, cadastre o gestor com o mesmo identificador do grupo dele, gere a chave de finanças dele e mande por mensagem direta.
2. **Gestor:** cole a chave em **Ajustes › Nível acima · sua liderança** (se você montou pelo assistente com essa chave, ela já está lá).
3. **Gestor:** clique **Publicar para a liderança**, confira o que sobe (totais por ano e unidades que entram ou ficam de fora) e confirme.
4. **Liderança:** em **Painel › Planos recebidos**, aplique o consolidado do gestor; ele soma ano a ano como uma unidade.
5. **Liderança:** defina o teto do gestor por ano e **Publicar diretriz**; o gestor vê o teto no card do nível acima.

**Ver as finanças dos times na Central (15.5 e 15.6, só leitura)**
1. Na Central, vá em **Integração › Pasta e chaves** e confira se a pasta compartilhada está conectada.
2. Clique **Chaves do Finanças do Grupo**, escolha o arquivo `financas-grupo-<grupo>.json` e digite a senha dele. A Central só lê as chaves de finanças dos times; os times entram pela pasta (`pagamentos`, `cartoes`…). Para um time só, use **Chave de finanças** na linha do time e cole a chave `GK1.<time>-fin-…`.
3. A Central lê o plano publicado por cada time e o teto da diretriz. Depois disso, **Atualizar da pasta** traz os planos novos.
4. Leia o card **Finanças dos times** na Hoje e a linha de finanças no card de cada time. Na reunião de status, o bloco **Finanças** aparece quando o time passou do teto ou não publica o plano há mais de 35 dias.
5. **Custo por iniciativa (15.6):** no Finanças do Time, marque cada linha do plano com o código da iniciativa (`PAG-042`) ou da feature (`PAG-042.F2`). Na Central, a lista de Iniciativas mostra o previsto do ano ao lado do código, e o painel da iniciativa ganha a aba **Finanças**: orçado, previsto, realizado e folga, com uma barra por time. A soma inclui todos os times que marcaram linhas com o código.
6. Em **Integração › Conciliação**, o cartão **Códigos nas finanças do time sem iniciativa na Central** lista os códigos que não batem com nenhuma iniciativa. Corrija o código no Finanças do Time, ou crie ou una a iniciativa na Central.
7. Para mudar orçamento, teto ou plano, continue no Finanças do Grupo ou no Finanças do Time: a Central não grava nada de finanças.

**Liderança: ver os gestores no hub (Hub 1.3)**
1. No hub da liderança, clique **Importar do Finanças do Grupo**, escolha o arquivo do Finanças do Grupo da liderança e digite a senha dele.
2. Cada gestor cadastrado como **Grupo de outro gestor** entra como um card "gestor", com o consolidado que ele publicou (`grupos/<grupo>/financas/`).
3. O painel do topo vira **Visão dos gestores**: previsto, realizado e barras por gestor.

## 9. Atualizar para uma versão nova

1. Baixe o **.zip** novo e **substitua** os HTMLs antigos na pasta local (mesmo nome, se possível, para o hub encontrar).
2. Abra e escolha **o mesmo arquivo de dados** de sempre.
3. Se o formato mudou, a ferramenta migra sozinha e **baixa um backup** do arquivo anterior. Guarde o backup até confirmar que está tudo certo.
4. Confira a versão em **Onde estou?** (a Central também mostra na barra lateral).

## 10. Trocar de computador

1. Se a sua pasta pessoal está no seu OneDrive, ela já está no computador novo: entre no OneDrive e espere sincronizar. Senão, copie a **pasta pessoal inteira** do computador antigo (ou baixe uma cópia de cada arquivo: **Ajustes › Baixar cópia cifrada** nas Finanças e **Baixar cópia** nos Ajustes do Quadro).
2. Feche as ferramentas no computador antigo: use um computador de cada vez, para o OneDrive não criar cópia de conflito.
3. Sincronize a biblioteca `Gestao-Compartilhado` pelo OneDrive.
4. Abra o `hub.html` e cada ferramenta com a **senha do cofre**; reconecte as pastas quando o navegador pedir.
5. No Quadro e em Finanças do Time, informe o novo nome de computador. Você passa a gravar um arquivo novo (`<você>-<computador novo>.json`); o antigo continua sendo lido.

## 11. Uma chave vazou

1. **Gestor:** na Central, **Integração › Pasta e chaves**, clique **Vazou: trocar chave** no time afetado; a chave antiga deixa de abrir os arquivos na hora e uma nova é gerada (para finanças, o mesmo em Finanças do Grupo › Times › **Revogar chave**).
2. Envie a nova chave ao responsável por mensagem direta.
3. No hub, importe as chaves da Central de novo.
4. **Time:** cole a nova chave em **··· › Central** (Quadro) ou em **Ajustes › Grupo e pasta** (Finanças do Time). A próxima publicação já sai com a chave nova.

Os outros times não são afetados.

## 12. Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| "Senha incorreta" | Senha diferente da guardada | Tente a do cofre; não há recuperação |
| Ferramenta diz que o arquivo é de outra ferramenta | Arquivo errado | Abra no HTML indicado na mensagem |
| Aviso "cópia de conflito encontrada" | O OneDrive gravou duas versões | Aceite a resolução; a ferramenta fica com a maior revisão |
| Time não aparece como atualizado no hub ou na Central | Sincronização do OneDrive atrasada, ou time sem chave | Espere alguns minutos; confira a chave e a pasta em **Onde estou?** |
| Post-it não chegou ao Quadro | Atraso de sincronização, post-it vencido ou chave errada | Confira o "mostrar até" e a chave do time no hub |
| ← Hub abre uma aba nova | O hub não estava aberto | Normal; abra as ferramentas sempre a partir do hub |
| Hub não acha as ferramentas | O hub não está na mesma pasta dos HTMLs | Mova o `hub.html` para a pasta local das ferramentas |
| Não consigo gravar | Navegador sem File System Access API ou pasta sem permissão | Use Edge ou Chrome e autorize a pasta de novo |
| Aviso vermelho "Daqui não dá para abrir pastas" e os botões não seguem | O arquivo foi aberto no Safari, no Firefox, no celular ou numa pré-visualização (Outlook, Teams, OneDrive, SharePoint, biblioteca de outro aplicativo) | Faça o que o aviso diz: baixe o arquivo para uma pasta só sua e abra com dois cliques, ou botão direito > **Abrir com** > Microsoft Edge ou Google Chrome. A última linha do aviso mostra o navegador e o endereço detectados |
| Aviso para extrair o .zip | O HTML foi aberto de dentro do .zip ou de um anexo (pasta temporária) | Botão direito no .zip > **Extrair tudo**, leve a pasta para um lugar só seu e abra o HTML de lá |
| Quero a tela escura (ou ela ficou escura sem eu pedir) | O tema está em Automático e segue o sistema | Clique no botão redondo no canto inferior direito e escolha **Claro**, **Escuro** ou **Automático**. Fica salvo só neste computador e vale para todas as ferramentas |
| Aviso de que a pasta parece ser a compartilhada | Você escolheu a pasta dos times como pasta pessoal | Escolha uma pasta só sua (de preferência no seu OneDrive) |
| Uma ferramenta pediu a senha mesmo aberta pelo hub | A senha dessa ferramenta é diferente da do hub, ou passaram mais de 90 segundos do clique | Digite a senha do cofre; abra as ferramentas pelos links do hub |

---

## 13. Férias: do time à liderança

O **Mapa de Férias** é apoio para enxergar e planejar ausências; o pedido oficial continua na ferramenta da empresa. O time usa o `ferias.html`; o gestor e a liderança usam a página **Férias da Central** (Central 15.9, [ADR-0033](adr/0033-ferias-dentro-da-central.md)), sem outro arquivo nem outra senha.

**No time (cada pessoa, ou o responsável por todos)**
1. Abra `ferias.html`, escolha **Sou de um time**, informe o nome e o identificador do time (o mesmo do Quadro, ex.: `pagamentos`) e o seu nome. Escolha a pasta local (só sua, de preferência no seu OneDrive) e crie a senha.
2. **Ajustes:** ligue a pasta sincronizada e cole a **chave do time** (a mesma do Quadro).
3. **Pessoas:** marque as suas férias pela barra rápida ("05/01 a 23/01 férias") ou por **+ Ausência**. Se for o responsável, cadastre também os colegas que não usam a ferramenta, com o mesmo nome que eles usariam.
4. Pronto: a ferramenta publica sozinha a cada mudança. As notas ficam só no seu computador.

**No gestor (Central › Férias)**
1. Na Central, abra **Férias** (menu Pessoas, tecla 5). Na primeira vez, informe o nome do grupo e o identificador, o mesmo das Finanças do Grupo (ex.: `tecnologia`), e clique **Começar**. Se você já usava o Mapa de Férias separado, clique **Trazer do Mapa de Férias separado**, escolha o `ferias-<grupo>.json` e digite a senha dele: tudo vem para a Central.
2. **Unidades:** os times da Central que têm pasta e chave de tarefas (aba Integração do time) já aparecem, lidos da pasta da Integração. Para gestores abaixo de você, **+ Grupo de outro gestor** (ou importe das Finanças do Grupo).
3. **Diretos:** marque as suas férias e as de quem responde direto a você. A página **Hoje** da Central passa a mostrar quem está fora hoje.
4. **Mapa:** leia os cards, o mapa de calor (vermelho = acima do limite) e as semanas mais tranquilas; clique num dia para ver quem está fora. Ajuste o limite em **Ajustes**.
5. **Nível acima:** em **Ajustes**, cole a chave que a sua liderança gerou para o seu grupo (ou **Trazer das Finanças do Grupo**: a mesma chave `GK1.<grupo>-fin-…` serve) e **Publicar consolidado para a liderança**, depois de conferir o que sobe. Quando o consolidado muda, o Mapa avisa para publicar de novo.

**Na liderança**
1. Use a página **Férias** da sua Central, com o seu identificador (ou o `ferias.html` à parte, escolhendo **Sou gestor ou liderança**, se você não usa a Central).
2. **Unidades › + Grupo de outro gestor**, com o identificador do grupo dele. Se você já gerou a chave dele nas Finanças do Grupo, cole a mesma; senão, **Gerar chave para o gestor** e envie por mensagem direta.
3. O consolidado do gestor entra como uma unidade, com a unidade de origem de cada pessoa.

---

## 14. Integrar outra solução pelos contratos

Quando um time ou um gestor par usa uma ferramenta própria e quer aparecer no seu hub ou na visão da liderança. Tudo está em `contratos/` (no repositório e no .zip).

**Quem administra (você)**
1. Cadastre o time (Central, inclusive a página Férias, ou Finanças do Grupo) ou, se você é a liderança, o gestor como unidade **grupo**. Combine o **identificador** (slug) e, para times, o **prefixo**.
2. Gere as chaves que ele vai usar e envie por mensagem direta: tarefas (`GK1.<time>-AAMM`) e/ou finanças (`GK1.<time>-fin-AAMM`) para um time; a chave do grupo (`GK1.<grupo>-fin-AAMM`) para um gestor que vai publicar para a liderança.
3. Envie a pasta `contratos/` e diga por onde começar: `contratos/LEIA-ME.md` e a receita certa em `contratos/05-como-integrar.md` (A: tarefas para a Central; B: finanças do time; C: gestor para a liderança; D: férias; E: post-its).

**Quem integra (a outra solução)**
1. Rode `node contratos/validar.js vetores` com a sua implementação de criptografia (ou use `contratos/referencia/cripto.js`).
2. Monte o conteúdo seguindo o schema e o exemplo do arquivo; confira com `node contratos/validar.js conteudo <arquivo> --como <caminho na pasta>`.
3. Publique seguindo as regras de escrita (um dono, revisão maior, gravação atômica) e confira a pasta real com `node contratos/validar.js pasta <pasta> --chave GK1.…`.

**Conferir do seu lado:** o arquivo aparece na ferramenta que lê (hub, Central e a página Férias dela, ou Finanças do Grupo). Finanças e consolidados entram pela prévia, como os de qualquer time. Se não aparecer, a tabela "Quando algo não aparece" do guia diz a causa provável.


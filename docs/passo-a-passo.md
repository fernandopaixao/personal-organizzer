# Passo a passo · como lidar com a solução

*24/11/2026 · Central v15.4, Quadro do Time 2.2, Hub 1.2, Finanças do Grupo 1.3 e do Time 1.2, assistente 2.1*

Guia prático, na ordem em que as coisas costumam acontecer. Cada seção é independente. Antes de começar: use **Edge ou Chrome** e tenha à mão um **cofre de senhas** (o gerenciador de senhas da empresa).

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

---

## 1. Montar a solução pela primeira vez

0. Descompacte o **.zip da solução** (`gestao-solucao-AAAA-MM-DD.zip`) numa pasta qualquer; ele traz o `inicio.html`, as ferramentas, a documentação e um LEIA-ME.
1. Crie uma **pasta local** fora do OneDrive, por exemplo `C:\Users\<você>\GestaoLocal`. Evite `Documentos` e `Área de Trabalho` se o backup de pastas do OneDrive estiver ligado.
2. Garanta que a **biblioteca do SharePoint** do grupo (`Gestao-Compartilhado`) está sincronizada no seu computador pelo OneDrive.
3. Copie `inicio.html` para a pasta local e abra com dois cliques.
4. **Perfil:** responda **Você lidera times?** (2 ou mais, 1, ou não) e **O que você quer organizar?** (tarefas, finanças ou os dois).
5. **Chaves:** se o seu líder mandou chaves (`GK1.…`), escolha **Sim, recebi**, cole uma por linha, clique **Conferir chaves** e informe o nome da pasta sincronizada que ele indicou. O assistente mostra o que cada chave é. Sem chave, escolha **Não, ainda não**: dá para colar depois dentro de cada ferramenta.
6. **Dados:** nome, prefixo de código, ano fiscal e moeda. Com chave, o identificador já vem dela e fica travado. O gestor lista os times que lidera.
7. Em **Pastas**, escolha a pasta local e a pasta sincronizada. Se a ferramenta avisar que a pasta local parece sincronizada, escolha outra.
8. Em **Senha**, crie a senha, **guarde no cofre** e marque "Já guardei no cofre".
9. Em **Pronto**, a pasta local passa a ter os HTMLs, os arquivos cifrados (já com as chaves coladas), o `hub.html` e o `onde-fica-cada-coisa.html`. Siga os **próximos passos** que a tela mostra para o seu perfil.
10. Abra o `hub.html`. A partir de agora ele é a sua tela inicial.

**Atalho: Estou com sorte.** Na primeira tela do assistente, quem lidera times pode clicar **Estou com sorte**:
1. Preencha o nome do grupo, o seu nome, os times (um por linha, com o prefixo se quiser), o ano e a moeda.
2. Escolha a pasta (fora do OneDrive), a pasta sincronizada (se já tiver) e crie a senha.
3. Clique **Gerar tudo** e confirme o aviso de cofre das chaves.
4. Na tela final, copie a chave de cada time para o cofre, siga o checklist e envie a cada responsável a pasta `para-os-times/<time>/` por mensagem direta ou e-mail (nunca pela pasta compartilhada).
5. O time abre o `quadro_<time>.html`, o `financas_<time>.html` ou o `ferias.html`, cria a própria senha e guarda a chave quando a ferramenta pedir.

**Gestor: equipar cada time com o assistente.** Depois de gerar as chaves dos times (seção 2), mande a cada time o `inicio.html` e, por mensagem direta, a chave e o nome da pasta sincronizada. O responsável abre o assistente, escolhe "Sim, lidero 1 time", cola a chave e sai com o Quadro e/ou o Finanças do Time prontos. É o caminho recomendado; gerar o HTML do time pela Central (seção 2) continua valendo.

## 2. Cadastrar um time e entregar a ferramenta

**Tarefas (Quadro do Time)**
1. Na Central, **Times › + Time**: nome, prefixo (2 a 5 letras, ex.: `PAG`) e pasta do time.
2. Em **Integração › Pasta e chaves**, clique **Gerar chave** para o time e **guarde no cofre**.
3. Em **Times**, abra o time e clique **HTML do time** (a tela mostra o aviso de cofre). Prefira enviar a chave separada do HTML.
4. Envie o HTML ao responsável e, **à parte, por mensagem direta no Teams ou por e-mail**, o texto da chave (`GK1.…`). Nunca coloque a chave na pasta compartilhada.
5. No hub, **Importar da Central** para poder mandar post-its a esse time.

**Finanças (Finanças do Time)**
1. No Finanças do Grupo, **Times**: cadastre o time, defina o **teto de cada ano** e a diretriz, e clique **Gerar chave** (chave de finanças, diferente da de tarefas).
2. **Publicar diretriz** para que o time veja tetos e categorias.
3. **Gerar HTML** de finanças do time e envie ao responsável financeiro, com a chave à parte (ou mande o `inicio.html` com a chave, como na seção 1).
4. No hub, **Importar do Finanças do Grupo**: os times e as chaves de finanças entram no hub, que passa a mostrar o plano de cada time na **Visão dos times**.

## 3. Primeiro uso do Quadro do Time (time)

1. Salve o HTML recebido numa pasta local (fora do OneDrive) e abra no Edge ou Chrome.
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

## 9. Atualizar para uma versão nova

1. Baixe o **.zip** novo e **substitua** os HTMLs antigos na pasta local (mesmo nome, se possível, para o hub encontrar).
2. Abra e escolha **o mesmo arquivo de dados** de sempre.
3. Se o formato mudou, a ferramenta migra sozinha e **baixa um backup** do arquivo anterior. Guarde o backup até confirmar que está tudo certo.
4. Confira a versão em **Onde estou?** (a Central também mostra na barra lateral).

## 10. Trocar de computador

1. No computador antigo, copie a **pasta local inteira** (é o mais simples). Também dá para baixar uma cópia de cada arquivo: **Ajustes › Baixar cópia cifrada** nas Finanças e **Baixar cópia** nos Ajustes do Quadro.
2. No novo, crie a pasta local fora do OneDrive e cole o conteúdo.
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
| Aviso de que a pasta local parece sincronizada | A pasta está dentro do OneDrive | Escolha uma pasta fora do OneDrive |

---

## 13. Férias: do time à liderança

O **Mapa de Férias** (`ferias.html`) é apoio para enxergar e planejar ausências; o pedido oficial continua na ferramenta da empresa.

**No time (cada pessoa, ou o responsável por todos)**
1. Abra `ferias.html`, escolha **Sou de um time**, informe o nome e o identificador do time (o mesmo do Quadro, ex.: `pagamentos`) e o seu nome. Escolha a pasta local (fora do OneDrive) e crie a senha.
2. **Ajustes:** ligue a pasta sincronizada e cole a **chave do time** (a mesma do Quadro).
3. **Pessoas:** marque as suas férias pela barra rápida ("05/01 a 23/01 férias") ou por **+ Ausência**. Se for o responsável, cadastre também os colegas que não usam a ferramenta, com o mesmo nome que eles usariam.
4. Pronto: a ferramenta publica sozinha a cada mudança. As notas ficam só no seu computador.

**No gestor**
1. Abra `ferias.html`, escolha **Sou gestor ou liderança** e use o mesmo identificador do grupo das Finanças do Grupo (ex.: `tecnologia`).
2. **Unidades:** **Importar times do Hub** (traz os times e as chaves de tarefas) ou **+ Time** e cole a chave de cada um. Para gestores abaixo de você, **+ Grupo de outro gestor** (ou importe das Finanças do Grupo).
3. **Diretos:** marque as suas férias e as de quem responde direto a você.
4. **Mapa:** leia os cards, o mapa de calor (vermelho = acima do limite) e as semanas mais tranquilas; clique num dia para ver quem está fora. Ajuste o limite em **Ajustes**.
5. **Nível acima:** em **Ajustes**, cole a chave que a sua liderança gerou para o seu grupo (ou **Trazer das Finanças do Grupo**: a mesma chave `GK1.<grupo>-fin-…` serve) e **Publicar consolidado para a liderança**, depois de conferir o que sobe. Quando o consolidado muda, o Mapa avisa para publicar de novo.

**Na liderança**
1. Crie o arquivo como gestor, com o seu identificador.
2. **Unidades › + Grupo de outro gestor**, com o identificador do grupo dele. Se você já gerou a chave dele nas Finanças do Grupo, cole a mesma; senão, **Gerar chave para o gestor** e envie por mensagem direta.
3. O consolidado do gestor entra como uma unidade, com a unidade de origem de cada pessoa.

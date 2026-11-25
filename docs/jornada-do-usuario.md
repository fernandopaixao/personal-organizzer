# Jornada do usuário

*25/11/2026 · como cada papel conhece, monta, usa e mantém a Remessa · Central v15.12, Hub 2.1, assistente 2.7*

A solução tem quatro papéis. A mesma pessoa pode ter mais de um (o gestor costuma ser também o dono das finanças do grupo; o líder do time costuma ser também o responsável financeiro). Quem integra uma **outra solução** pelos contratos tem a jornada própria na [seção 9](#9-jornada-de-quem-integra-outra-solução).

| Papel | Quem é | Ferramentas que usa | O que espera da solução |
|---|---|---|---|
| **Gestor** | Fernando: gestor de vários times | Hub, Central, Finanças do Grupo, agentes | Saber o que pede atenção, não perder compromissos, ver portfólio, fluxo e dinheiro dos times sem pedir relatório |
| **Responsável pelo time** | Líder ou ponto focal de um time | Quadro do Time (publicador), às vezes Finanças do Time | Ferramenta pronta, pouco trabalho extra para reportar à gestão |
| **Membro do time** | Qualquer pessoa do time | Quadro do Time | Ver e mover os próprios cards, receber recados |
| **Responsável financeiro do time** | Quem cuida do dinheiro do time | Finanças do Time | Registrar gastos, prever o ano, publicar o plano sem planilha paralela |

---

## 1. Visão geral da jornada

A solução se chama **Remessa**: as ferramentas trocam envelopes lacrados (cifrados com a chave do time) numa caixa postal (a pasta compartilhada). O Início explica o nome nas boas-vindas; no dia a dia, o que chega de outra pessoa aparece como **nova remessa** ([ADR-0037](adr/0037-nome-remessa.md)).

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
| **1. Montar** | Descompacta o .zip numa pasta pessoal no seu OneDrive, abre `inicio.html`, lê os quatro desenhos de como funciona e usa **Estou com sorte** (tudo de uma vez, já com as chaves dos times e da liderança; termina num passo a passo visual: mesa, remessas para os times, remessa para a liderança e, por último, apontar a caixa postal) ou responde "lidero 2 ou mais times" e os usos, cola a chave da liderança se recebeu, informa o grupo e os times, escolhe as pastas, cria a senha | Assistente | Primeiro arquivo já cifrado, HTMLs do perfil, chaves dos times geradas nos dois caminhos e já nos arquivos, `para-os-times/<time>/`, cada ferramenta abrindo sozinha com arquivo e pasta lembrados | Guardar a senha no cofre antes de seguir; pasta pessoal só sua (no seu OneDrive), separada da compartilhada; pasta compartilhada marcada como **Sempre manter neste dispositivo** (o checklist pede); no fim, **Abrir o hub** |
| **2. Cadastrar times** | Times do assistente já chegam prontos. Time novo: cria com o nome e clica **Gerar chave de integração** no próprio time (prefixo e pasta sugeridos); a de finanças, no Finanças do Grupo | Central (Times › time › Integração) e Finanças do Grupo (Times) | Uma chave por time, aviso de cofre, prefixo travado após o primeiro código | Enviar a chave **por mensagem direta**, nunca na pasta |
| **3. Equipar os times** | Manda o `inicio.html` e, à parte, a chave e o nome da pasta (ou gera o **HTML do time** e o **HTML de finanças do time**) | Assistente, Central, Finanças do Grupo | O time monta tudo sozinho a partir da chave | O HTML não leva dados; a chave vai por mensagem direta |
| **4. Montar o portfólio** | Cadastra iniciativas, features e fases; clica **Compartilhar**; acompanha o custo de cada iniciativa na aba Finanças | Central (Iniciativas, Integração) | Só sai o que ele revisou na tela de compartilhamento; o custo soma todos os times que marcaram linhas com o código | Marcar o que não deve ir para o time |
| **5. Abrir o dia** | Abre o hub com a senha do cofre (a única vez no dia), lê o cockpit: frase do dia, cards de todos os módulos e a lista Pede sua atenção; abre a Central pelo hub, que entra direto | Hub (cockpit) → Central (Hoje) | Cards de leitura no topo da Hoje, com o card Finanças dos times quando a Central tem as chaves de finanças; atrasos, 1:1, fóruns, iniciativas em risco e novidades dos times | Arquivos novos dos times passam por prévia |
| **6. Trabalhar tarefas** | Registra demandas, delega, cobra | Central (Tarefas) | Aderência por pessoa e cobranças visíveis | |
| **7. Conversar com pessoas** | Prepara e conduz o 1:1 em modo Em conversa, copia o resumo | Central (1:1) | Pauta montada a partir de quatro fontes; combinados registrados | |
| **8. Conduzir fóruns** | Abre o fórum, discute a pauta, registra decisões e compromissos, compartilha os acordos | Central (Fóruns) | Pauta não discutida rola para a próxima; compromissos viram tarefas | |
| **9. Reunião de status** | Conduz a reunião do time com o status já preenchido pelo que o time publicou | Central (Times) | Downstream abaixo de cada feature; bloco Finanças quando o time passou do teto; nada da Central muda sem aceite | |
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
| **2. Primeiro uso** | Cria a senha local, escolhe a pasta local e a sincronizada, cadastra a chave em Ajustes › Grupo e pasta | Finanças do Time | Pasta pessoal só sua (de preferência no seu OneDrive) |
| **3. Montar o plano** | Cria as linhas do plano (categoria, centro de custo, OPEX/CAPEX), orçado por mês, contratos recorrentes; adiciona os anos seguintes ao horizonte | Plano | Categorias e tetos seguem a diretriz do grupo |
| **4. Dia a dia** | Registra lançamentos e lê os cards e gráficos do Painel | Lançamentos, Painel › Hoje | Lançamentos ficam **só locais** |
| **5. Planejar** | Ajusta o previsto, simula cenários "e se", compara os anos no card Vários anos | Painel › Futuro e cenários | Cenários ficam locais até aplicar |
| **6. Fechar o mês** | Confere realizado × previsto, fecha o mês e publica o plano | Plano, Publicar para o grupo | Só o agregado vai para a pasta |

---

## 6. Momentos de manutenção (todos os papéis)

| Momento | O que fazer | Referência |
|---|---|---|
| **Versão nova de uma ferramenta** | Trocar o HTML e abrir o mesmo arquivo de dados; a migração é automática e baixa um backup | [Passo a passo §9](passo-a-passo.md#9-atualizar-para-uma-versão-nova) |
| **Trocar de computador** | Se a pasta pessoal está no seu OneDrive, só esperar sincronizar; senão, copiar a pasta inteira (ou a cópia cifrada). Marcar a pasta compartilhada como **Sempre manter neste dispositivo** e abrir com a senha do cofre | [Passo a passo §10](passo-a-passo.md#10-trocar-de-computador) |
| **Lembrete de teste da senha** | Digitar a senha do cofre; se falhar, trocar a senha enquanto o arquivo está aberto | [ADR-0003](adr/0003-criptografia-sempre.md) |
| **Chave vazou** | Gestor revoga e gera outra; envia ao responsável; o time cola a nova | [Passo a passo §11](passo-a-passo.md#11-uma-chave-vazou) |
| **Cópia de conflito encontrada** | Aceitar a resolução proposta pela ferramenta | [ADR-0007](adr/0007-um-escritor-por-arquivo.md) |
| **Prefere a tela escura** | Botão redondo no canto inferior direito de qualquer ferramenta: Claro, Escuro ou Automático (segue o sistema). Vale para todas as ferramentas neste computador | [Passo a passo §12](passo-a-passo.md#12-problemas-comuns) |
| **Quer experimentar o visual novo** | Abrir `experimental/hub.html` do pacote com o mesmo arquivo e a mesma senha; voltar pelo `hub.html` da pasta principal quando quiser | [Passo a passo §15](passo-a-passo.md#15-experimentar-o-visual-novo), [ADR-0034](adr/0034-visual-experimental.md) |
| **Pessoa saiu do time** | Desativar a pessoa nos Ajustes do Quadro; o arquivo dela continua lido | |

---

## 7. Atritos observados na revisão e oportunidades

Esta revisão olhou a solução como um todo em 24/11/2026. Os pontos abaixo não são defeitos urgentes; são oportunidades para as próximas evoluções.

| # | Atrito | Onde | Oportunidade |
|---|---|---|---|
| 1 | **Muitas senhas e chaves** para o gestor: senha da Central, do hub, de Finanças do Grupo, mais duas chaves por time | Gestor | **Melhorou no Hub 1.2:** o hub importa times e chaves da Central e do Finanças do Grupo, e o assistente 2.0 já grava as chaves coladas. As senhas continuam separadas por segurança. **Hub 2.0:** login único, a pessoa entra uma vez no hub e navega entre os módulos; uma Central com outra senha é digitada uma vez por sessão ([ADR-0035](adr/0035-hub-cockpit-de-gestao.md)). **Central 15.5 e 15.6:** importa as chaves de finanças do Finanças do Grupo e mostra, só para leitura, as finanças dos times e o custo de cada iniciativa somando os times ([ADR-0028](adr/0028-financas-na-central-so-leitura.md)). **Resolvido na 15.7 e no Hub 1.3:** uma senha por sessão ([ADR-0029](adr/0029-uma-senha-por-sessao.md)) |
| 2 | ~~Finanças com 7 telas no time e 5 no grupo, com mais texto do que gráfico~~ | Finanças | **Resolvido na 1.2:** menu de 4 e 3 entradas, cards de leitura, curva acumulada e barras; planejamento multianual na 1.1. Feito depois: as mesmas peças estão no Hub 1.2 (Visão dos times) e na Hoje da Central 15.3 |
| 3 | ~~Três formulários da Central no padrão antigo~~ | Central | **Resolvido na 15.4:** atualização de iniciativa, acordo e prévia da importação com pílulas, validação no campo, verbo no botão e Enter |
| 4 | ~~Primeiro uso do time exige várias ações~~ | Quadro, Finanças do Time | **Resolvido no assistente 2.0 e 2.1:** "Estou com sorte" gera as ferramentas de cada time já com a chave, e um checklist acompanha o que falta; onboarding por perfil (lidera times? finanças? chaves e pasta do líder), com as chaves já gravadas nos arquivos |
| 5 | **Hub depende de estar na mesma pasta** dos HTMLs | Hub | Já avisa; o assistente já grava tudo junto. Manter a orientação no cartão "Onde fica cada coisa" |
| 6 | ~~Times com ferramenta própria não veem post-its~~ | Caminho B | **Resolvido:** post-its no pacote para agentes dos times (`integracao-time/03`, seção 7.6) e no guia de adaptação (seção 3.3) |
| 7 | **Documentação espalhada** entre repositório e pasta do projeto | Docs | Este conjunto (ADRs, funcionalidades, jornada, passo a passo) vira a porta de entrada; a visão geral aponta para ele. **Melhorou com a pasta `contratos/`** (no repositório e no .zip), que substitui os schemas e exemplos de `integracao-time/`; os documentos 00 a 06 de `integracao-time/` continuam só na pasta do projeto, como histórico ([ADR-0032](adr/0032-pasta-de-contratos.md)) |
| 8 | ~~Hub com botões mudos fora do Edge/Chrome~~ | Hub, Finanças, Férias, assistente | **Resolvido no Hub 1.3.1:** o aviso no topo diz o motivo (Safari, pré-visualização, celular, zip) e o que fazer, e todo botão responde ([ADR-0030](adr/0030-aviso-quando-nao-da-para-abrir-pastas.md)) |
| 9 | ~~Ferramentas geradas pediam pasta, arquivo e chaves de novo~~ | Assistente, todas | **Resolvido no assistente 2.3:** arquivo e pasta lembrados, chaves dos times também no caminho normal, prefixo sugerido e botão de chave em destaque no time da Central ([ADR-0031](adr/0031-ferramentas-abrem-prontas.md)) |

---

## 8. Jornada das férias (gestor e liderança)

O Mapa de Férias é apoio para a visão do grupo; o pedido oficial de férias continua na ferramenta da empresa. O gestor e a liderança usam a página **Férias da Central** (mesmo arquivo e mesma senha; [ADR-0033](adr/0033-ferias-dentro-da-central.md)). Desde a Central 15.11, só o gestor cadastra: as pessoas dos times não usam ferramenta de férias ([ADR-0036](adr/0036-ferias-so-o-gestor-cadastra.md)).

| Etapa | Quem | O que faz | Ferramenta | Ponto de atenção |
|---|---|---|---|---|
| **1. Trazer as pessoas** | Gestor | Na primeira vez, as pessoas cadastradas na Central vêm sozinhas, cada uma com o seu time; depois, **Trazer pessoas da Central** traz quem entrou | Central › Férias › Pessoas | Todos os times da Central viram unidades, com ou sem pasta |
| **2. Cadastrar as férias** | Gestor | Marca as férias de cada pessoa, a partir do que o time combinou com ele (1:1, ritual, ferramenta oficial) | Central › Férias › Pessoas | O time não cadastra nada; se outra solução publicar em `times/<time>/ferias/`, a Central soma do mesmo jeito |
| **3. Enxergar o grupo** | Gestor | Abre a página Férias da Central e vê os dias com mais e menos gente fora, as semanas tranquilas e quem está fora em cada dia | Central › Férias › Mapa, Calendário | Limite de pessoas fora ajustável (padrão 30%) |
| **4. Planejar** | Gestor | Ao marcar uma ausência, vê o impacto e pede sugestões de períodos com menos gente fora | Formulário de ausência | Apoio: o pedido oficial é feito na ferramenta da empresa |
| **5. Cadastrar as próprias** | Gestor | Marca as próprias férias e as dos diretos | Central › Férias › Pessoas | Notas ficam só no arquivo da Central. A página Hoje mostra quem está fora hoje |
| **6. Subir para a liderança** | Gestor | Cola a chave do grupo (a mesma das Finanças), confere e publica o consolidado | Central › Férias › Ajustes | Opção de trocar nomes por "Pessoa N" |
| **7. Visão da liderança** | Liderança | Na página Férias da própria Central, cadastra cada gestor como unidade e soma tudo, em quantos níveis existirem | Central › Férias › Unidades, Mapa | A liderança precisa ler a mesma pasta compartilhada |
| **Mudança (15.9)** | Gestor que usava o Mapa separado | Central › Férias › **Trazer do Mapa de Férias separado**, escolhe `ferias-<grupo>.json` e digita a senha dele | Central › Férias | O arquivo antigo só é lido; depois pode ser guardado como cópia |

---

## 9. Jornada de quem integra outra solução

Times e gestores pares que já têm ferramenta própria não precisam trocar: eles se acoplam pelos contratos (`contratos/`, [ADR-0032](adr/0032-pasta-de-contratos.md)).

| Etapa | Quem | O que faz | Onde | Ponto de atenção |
|---|---|---|---|---|
| **1. Combinar** | Gestor (ou liderança) e o responsável da outra solução | Cadastra o time ou o gestor como unidade, combina slug e prefixo, envia as chaves por mensagem direta e a pasta `contratos/` | Central (com a página Férias), Finanças do Grupo | Chave nunca na pasta nem no código |
| **2. Entender** | Quem integra | Lê o LEIA-ME e a receita do seu caso; acha o arquivo e a chave na tabela do layout | `contratos/LEIA-ME.md`, `01` e `05` | Só publica arquivos cujo dono é o seu papel |
| **3. Implementar** | Quem integra | Usa a referência de criptografia ou confere a própria com os vetores; monta o conteúdo a partir do exemplo | `referencia/cripto.js`, `vetores/`, `exemplos/` | Retrato completo, revisão sempre maior, totais = soma dos meses |
| **4. Validar** | Quem integra | Confere conteúdo e pasta com o validador | `node contratos/validar.js` | Avisos não reprovam; erros fazem o arquivo ser ignorado |
| **5. Aparecer** | Gestor ou liderança | Vê o arquivo no hub, na Central, nas Finanças do Grupo ou na página Férias da Central; aplica pela prévia | Ferramenta de quem lê | Moeda e categorias iguais às do grupo |
| **6. Manter** | Ambos | Contrato novo ou versão `/2` vem com ADR, schema, exemplo e período de convivência | `contratos/LEIA-ME.md`, histórico | Leitor tolerante: campo desconhecido é ignorado |


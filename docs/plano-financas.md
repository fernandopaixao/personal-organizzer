# Plano · Finanças do grupo e do time, assistente inicial e sincronização segura

*23/11/2026 · F0 a F4 implementados (PR #10)*

Este plano acrescenta finanças à solução sem quebrar o que já existe (Central v14, Quadro do Time 1.1, contratos da integração). Ele também muda três regras gerais que passam a valer para todas as ferramentas: **criptografia sempre**, **dado individual na máquina e pedaço comum na pasta sincronizada**, e **nenhum arquivo comum escrito por duas pessoas**.

---

## 1. Resumo em uma página

| Peça | O que é | Novo ou existente |
|---|---|---|
| **Início da solução** (`inicio.html`) | Assistente que pergunta o uso esperado, cria o primeiro arquivo cifrado, gera os HTMLs certos e mostra um mapa de onde fica cada coisa | **Novo** |
| **Finanças do Grupo** (`financas_grupo.html`) | Consolidado: soma os planejamentos publicados pelos times, compara com o orçamento do grupo, projeta o ano | **Novo** |
| **Finanças do Time** (`financas_time.html`) | Apoio do dia a dia (lançamentos, compromissos, alertas) e do futuro (previsão mês a mês, cenários) de um time | **Novo** |
| **Tarefas · Consolidado** | A própria Central de Gestão (v15) | Existente, ajustada |
| **Tarefas · 1 time** | O Quadro do Time (2.0) | Existente, ajustado |

Os quatro HTMLs são **desacoplados**: cada um abre e funciona sozinho, com o próprio arquivo de dados. Eles só se encontram pela pasta sincronizada, através de contratos JSON cifrados. Finanças não depende da Central nem do Quadro; a única ligação opcional é o código da iniciativa (`PAG-042`), usado como rótulo.

```
                   inicio.html  (assistente: pergunta o uso, gera os HTMLs, cria o 1º arquivo)
                        │ gera
     ┌──────────────────┼───────────────────────┬────────────────────────┐
     ▼                  ▼                       ▼                        ▼
 Finanças do Grupo   Finanças do Time      Central (tarefas,       Quadro do Time
  (consolidado)       (1 time)              consolidado)            (tarefas, 1 time)
     │  local: orçamento    │  local: lançamentos     │ local: dados do     │ local: preferências,
     │  aprovado, notas     │  detalhados, notas      │ gestor              │ rascunhos
     ▼                      ▼                         ▼                     ▼
 ┌──────────────────────── Pasta sincronizada pelo OneDrive (tudo cifrado) ────────────────────────┐
 │ grupo/financas/diretriz-<time>.json   ← só o gestor escreve                                      │
 │ grupo/catalogo-<time>.json            ← só a Central escreve (já existe)                         │
 │ times/<time>/financas/plano.json      ← só o responsável financeiro do time escreve             │
 │ times/<time>/status.json, metricas.json  (já existem)                                            │
 │ times/<time>/quadro/<pessoa>-<dispositivo>.json  ← um arquivo por pessoa e computador            │
 └──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Conceitos de finanças

### 2.1 Finanças do time
É a ferramenta de quem cuida do dinheiro de um time (líder ou ponto focal). Dois usos:

**Dia a dia (acompanhamento)**
- **Lançamentos**: o que foi gasto ou contratado, com data, valor, categoria, centro de custo, fornecedor, iniciativa (opcional) e observação. Entrada rápida no estilo da barra do Quadro: `Licença Datadog 12.400 #licencas @mar PAG-042`.
- **Compromissos recorrentes**: contratos, licenças, squads terceirizados. Geram sozinhos o previsto dos meses seguintes até o fim do contrato.
- **Fechamento do mês**: confere realizado contra previsto, marca o mês como fechado e pergunta se publica (mesmo padrão do fechamento de sprint).
- **Alertas**: categoria acima do teto, mês sem lançamento, contrato vencendo em 60 dias, divergência entre previsto e realizado acima de X %.

**Futuro (planejamento)**
- **Plano anual por mês**: orçado (o que foi aprovado), previsto (o que se espera agora) e realizado.
- **Previsão rolante**: realizado nos meses fechados + compromissos + previsto manual nos meses abertos, até o fim do ano e mais 12 meses.
- **Cenários "e se"**: copiar o plano, mexer (ex.: contratar 2 pessoas em março, cortar uma licença) e comparar. Cenários ficam **locais** até o time escolher publicar um.
- **Por iniciativa**: quanto cada iniciativa (`PAG-042`) custa no ano, quando o código vem do catálogo da Central.

### 2.2 Finanças do grupo
É a ferramenta do gestor (Fernando). **Soma os JSONs dos planejamentos dos times** e nunca altera o número de um time.
- **Consolidado**: totais por mês, categoria, time, iniciativa e tipo (OPEX/CAPEX), com orçado × previsto × realizado.
- **Orçamento do grupo** (local do gestor): o valor aprovado para o grupo, reservas e rateios que não pertencem a nenhum time. O consolidado mostra "soma dos times + itens do grupo" contra esse orçamento.
- **Diretrizes para os times**: teto por time e categoria, lista de categorias e centros de custo válidos, calendário de fechamento e cenário oficial. Publicadas pelo gestor; o time lê e vê o teto dentro da ferramenta.
- **Versões do plano**: "Orçamento original", "Reforecast 1", "Reforecast 2". Ao fechar uma versão, o grupo guarda um retrato do que cada time tinha publicado naquele dia, para comparar depois.
- **Prévia antes de aplicar**: como na Central, cada plano novo de um time aparece numa prévia com o que mudou (por exemplo "Pagamentos subiu o previsto de março em R$ 40 mil") antes de entrar no consolidado.
- **Saúde da soma**: avisa time sem plano publicado, plano desatualizado (mais de N dias), moeda ou ano fiscal diferente, categoria fora da lista e cópia de conflito encontrada.

### 2.3 Por que "soma de JSONs" funciona
Cada time publica um **retrato completo** do seu plano (não um diff). O grupo lê todos os retratos, valida cada um isoladamente e soma. Se um arquivo não decifra ou está inválido, o grupo continua usando o último retrato válido daquele time, marcado "sem atualização desde dd/mm". Assim um time com problema nunca derruba o consolidado.

---

## 3. Assistente inicial (`inicio.html`)

### 3.1 O que pergunta
1. **Qual é o seu papel?** Gestor de vários times / responsável por um time / membro de um time.
2. **O que você quer organizar?** Finanças, tarefas ou os dois.
3. Com isso escolhe a combinação:

| Papel × uso | HTMLs gerados |
|---|---|
| Gestor + finanças | Finanças do Grupo (e, a partir dele, um Finanças do Time pré-configurado por time) |
| Gestor + tarefas | Central de Gestão (que já gera o Quadro de cada time) |
| Responsável por um time + finanças | Finanças do Time |
| Responsável ou membro + tarefas | Quadro do Time |
| "Os dois" | A soma das linhas acima; cada HTML continua separado |

4. **Dados do primeiro arquivo**: nome do grupo ou do time, slug, prefixo de código, ano fiscal e moeda (finanças), pessoas (tarefas).
5. **Pastas** (passo guiado, seção 5.3): a pasta **local** (dado individual) e a pasta **sincronizada pelo OneDrive** (pedaço comum).
6. **Senha** do arquivo local e, para o gestor, geração das **chaves dos times** (seção 4).

### 3.2 O que faz
- Cria o **primeiro arquivo de dados já cifrado** na pasta local (não existe mais arquivo sem senha).
- Cria a estrutura de pastas na pasta sincronizada e grava um `LEIA-ME.md` em claro, sem dados.
- Gera os HTMLs escolhidos **pré-configurados** (mesmo mecanismo do "HTML do time" de hoje: HTML embutido em gzip + base64 e um bloco de pré-configuração entre marcadores). O assistente embute as quatro ferramentas; o script `tools/embutir.py` (generalização do `embutir_quadro.py`) mantém as cópias atualizadas.
- Gera um **cartão "Onde fica cada coisa"** (HTML em claro, sem dados nem segredos): quais arquivos você tem, onde estão, qual HTML abre qual arquivo, o que é local e o que é compartilhado, e o que fazer se trocar de computador.

### 3.3 Ajudar o usuário a se localizar
- Todo HTML gerado ganha um botão **"Onde estou?"** no topo: mostra qual ferramenta é esta, qual arquivo está aberto, qual pasta comum está ligada, quais outras ferramentas existem na solução e qual delas usar para cada tarefa.
- Ao abrir um HTML sem arquivo, a tela inicial pergunta "É a primeira vez?" e leva ao passo a passo de criar o primeiro arquivo, em vez de só pedir um arquivo.
- Se a pessoa abrir o arquivo errado (por exemplo, um plano de finanças no Quadro), a ferramenta reconhece o `schema` e diz qual HTML usar.

---

## 4. Criptografia sempre e aviso de senha

### 4.1 Regras
| Arquivo | Como é cifrado | Muda em relação a hoje? |
|---|---|---|
| Dado local de cada ferramenta | AES-256-GCM com chave derivada da senha (PBKDF2 600 mil, como a Central) | **Sim para o Quadro**: a senha hoje é opcional e passa a ser obrigatória |
| Arquivos na pasta sincronizada | `gestao-envelope/1` com chave aleatória por time | Não (já é assim) |
| Cache no navegador (catálogo, último retrato válido) | Cifrado com a chave do time, chave não exportável no IndexedDB | Não |
| `LEIA-ME.md`, `contrato/`, cartão "Onde fica cada coisa" | Em claro, por não terem dados | Não |

**Chave de finanças separada da chave de tarefas** (recomendado): o time inteiro precisa da chave de tarefas, mas o plano financeiro normalmente é visto só pelo líder e pelo gestor. Cada time teria então duas chaves (`pagamentos-2611` e `pagamentos-fin-2611`). O envelope já suporta isso pelo `kid`. Ver decisão D2.

### 4.2 Aviso de senha e cofre
Em **todo HTML que gera outro HTML ou cria um arquivo** (assistente, Central no "HTML do time", Finanças do Grupo no "HTML de finanças do time") e no primeiro uso de cada HTML gerado:

- Tela de aviso antes de criar a senha ou entregar a chave: *"Esta senha é a única forma de abrir seus dados. Ninguém, nem o autor da ferramenta, consegue recuperá-la. Guarde agora num cofre de senhas (por exemplo, o gerenciador de senhas da empresa)."*
- Caixa obrigatória **"Já guardei no cofre"** para seguir. A confirmação fica registrada no arquivo cifrado com a data.
- Para as chaves dos times, o mesmo aviso, mais: *"Envie a chave por mensagem direta no Teams ou e-mail, nunca na pasta compartilhada."*
- **Lembrete de teste**: 30 dias depois da criação, e depois a cada 90 dias, a ferramenta pede para digitar a senha uma vez ("confirme que você ainda tem a senha no cofre"). Se errar, sugere trocar a senha enquanto o arquivo ainda está aberto.
- A ferramenta **nunca** grava senha ou chave em arquivo, nem oferece "lembrar senha".

---

## 5. Dado individual local e pedaço comum na pasta sincronizada

### 5.1 O que fica onde
| Ferramenta | Local (só na máquina, fora do OneDrive) | Comum (pasta sincronizada) |
|---|---|---|
| Finanças do Time | Lançamentos detalhados, notas, anexos referenciados, cenários não publicados, chaves (no navegador) | `times/<time>/financas/plano.json`: plano agregado por mês × categoria × linha (orçado, previsto, realizado), compromissos resumidos, data do último fechamento |
| Finanças do Grupo | Orçamento aprovado do grupo, reservas, notas do gestor, retratos de versões, chaves | `grupo/financas/diretriz-<time>.json`: tetos, categorias, calendário, cenário oficial |
| Central (tarefas consolidado) | Tudo o que é do gestor (como hoje) | `grupo/catalogo-<time>.json` (como hoje) |
| Quadro (tarefas 1 time) | Preferências, filtros, rascunhos, cópia de trabalho | `times/<time>/quadro/<pessoa>-<dispositivo>.json` (seção 6.2), `status.json`, `metricas.json` |

O que vai para a pasta comum é sempre **o mínimo necessário para o outro lado**: agregados e retratos, nunca o detalhe individual.

### 5.2 OneDrive e a decisão de SharePoint de 15/11
O cliente do OneDrive sincroniza do mesmo jeito uma pasta do OneDrive pessoal e uma biblioteca do SharePoint (pela opção "Sincronizar" ou "Adicionar atalho ao Meu OneDrive"). Para as ferramentas não muda nada: elas enxergam uma pasta local sincronizada, com as mesmas cópias de conflito.

A diferença é **de quem é a pasta**:
- **Biblioteca SharePoint sincronizada pelo OneDrive** (recomendado): a pasta é do grupo, permissões por time, histórico de versões configurável, não depende da conta de uma pessoa. Mantém a decisão de 15/11 e só troca o nome do mecanismo de sincronização.
- **Pasta no OneDrive pessoal do Fernando compartilhada com os times**: mais simples de montar, mas fica presa à conta dele (se ele sair ou a conta mudar, a pasta vai junto), e cada time precisa receber compartilhamento manual.

Se a intenção for a segunda opção, **é uma mudança** da decisão de 15/11. Ver decisão D1.

Nome sugerido da pasta: `Gestao-Compartilhado` (substitui `Gestao-Integracao`; as ferramentas aceitam os dois nomes durante a transição).

### 5.3 Garantir que o local é mesmo local
Um ponto de atenção: com o "backup de pastas" do OneDrive ligado, `Documentos` e `Área de Trabalho` **também sincronizam**. Um arquivo "local" salvo ali vai para a nuvem e perde a proteção contra conflito.
- O assistente recomenda uma pasta própria, por exemplo `C:\Users\<você>\GestaoLocal`, e avisa sozinho quando a pasta escolhida parece sincronizada (sem pedir confirmação manual desde 24/11/2026).
- O navegador não revela o caminho completo de uma pasta, então a ferramenta não consegue checar isso sozinha com certeza. Ela faz duas checagens indiretas: avisa se a pasta escolhida tem o mesmo nome da pasta comum ou contém arquivos típicos do OneDrive (`desktop.ini`, cópias com nome de computador), e pede uma confirmação "conferi que esta pasta não está no OneDrive".
- **Cópia de segurança do local**: como o local não vai para a nuvem, a ferramenta guarda as 5 últimas versões cifradas numa subpasta `backup/` e lembra, uma vez por semana, de exportar uma cópia cifrada para onde a pessoa preferir.

---

## 6. Evitar sobreposição e conflito na sincronização

O OneDrive não tem trava: se dois computadores gravam o mesmo arquivo antes de sincronizar, ele mantém os dois e renomeia um (`plano-NOTEBOOK01.json`, `plano (1).json`). O plano é **não deixar isso acontecer** e, quando acontecer mesmo assim, **resolver sem perder dados**.

### 6.1 Mecanismos (valem para todos os HTMLs, numa biblioteca comum `nucleo-sync`)
| # | Mecanismo | O que evita |
|---|---|---|
| 1 | **Um arquivo por escritor.** Cada arquivo comum tem um único dono gravado no cabeçalho (`writer`). A ferramenta se recusa a gravar num arquivo cujo dono não é ela | Duas pessoas escrevendo o mesmo arquivo |
| 2 | **Dono = pessoa + dispositivo** quando a mesma pessoa usa dois computadores (`ana-NOTEBOOK01`). O identificador do dispositivo é aleatório e fica no navegador | A mesma pessoa gerando conflito consigo mesma |
| 3 | **Escrita atômica.** Grava pelo `createWritable()` da File System Access API, que escreve num arquivo temporário e troca de uma vez ao fechar. Depois relê e decifra para confirmar | Arquivo pela metade sendo sincronizado |
| 4 | **Integridade pelo GCM.** Arquivo truncado ou corrompido não decifra; quem lê ignora e usa o último retrato válido em cache | Ler lixo no meio de uma sincronização |
| 5 | **Revisão monotônica no cabeçalho** (`revision`, `generatedAt`, `writer`, `device`). Quem lê descarta revisão menor que a última lida | Arquivo antigo voltando (restauração de versão, computador que ficou desligado) |
| 6 | **Confere antes de gravar** (compare-and-swap otimista): antes de salvar, relê o arquivo; se a revisão mudou desde a última leitura, une primeiro e só depois grava `max(revisões) + 1` | Sobrescrever algo que chegou de outro dispositivo |
| 7 | **Detecção de cópias de conflito do OneDrive.** Ao ler, procura arquivos com o mesmo prefixo (`plano-*.json`, `plano (n).json`), decifra todos, une ou escolhe pela maior revisão, mostra o aviso "cópia de conflito encontrada" e oferece "resolver e limpar" (apaga só cópias que a própria ferramenta pode reescrever) | Dados escondidos em cópias que ninguém vê |
| 8 | **Aviso de "aberto em outro lugar".** Um arquivo pequeno `.aberto-<dono>.json` com dispositivo e horário, renovado a cada minuto. É só aviso, não trava (o atraso do OneDrive torna travas pouco confiáveis) | Mesma pessoa editando em dois computadores ao mesmo tempo |
| 9 | **Gravação espaçada.** Salva no máximo a cada 10 s e sempre ao fechar a aba; nunca a cada tecla | Rajadas de versões que aumentam a chance de conflito |
| 10 | **Retrato completo, não diff.** Cada publicação contém tudo daquele escritor. Perder uma versão intermediária não quebra nada | Estado inconsistente se uma sincronização falhar |
| 11 | **Relógio lógico híbrido** nas alterações (contador + horário), para ordenar mudanças mesmo com relógios de computadores diferentes | Relógio errado decidindo quem vence |

### 6.2 Quadro do Time com várias pessoas (mudança no Quadro)
Hoje o Quadro guarda tudo em **um** arquivo do time que várias pessoas gravam, com união a cada 20 s. Isso contraria as novas regras (dado comum escrito por várias pessoas). Proposta para o Quadro 2.0:
- Cada pessoa grava só o próprio arquivo `times/<time>/quadro/<pessoa>-<dispositivo>.json` com as alterações que ela fez (cards criados, movidos, editados, com relógio lógico por campo e marcas de exclusão).
- Quem abre o Quadro lê todos os arquivos da pasta e monta o quadro unindo campo a campo (vence a alteração mais recente pelo relógio lógico). Ninguém sobrescreve o arquivo de ninguém, então não há cópia de conflito.
- De tempos em tempos cada pessoa compacta o próprio arquivo (guarda só o estado final dos cards que mexeu).
- `status.json` e `metricas.json` continuam com um único publicador por time.
- Migração: o Quadro 2.0 abre o `quadro-<slug>.json` atual, divide por autor da última alteração e passa a gravar no novo formato, mantendo o arquivo antigo como backup.

### 6.3 Finanças com mais de uma pessoa no time
Na v1, **um único responsável publica** `plano.json` (como o publicador de status). Se o time quiser que várias pessoas lancem gastos, cada uma publica `times/<time>/financas/lancamentos-<pessoa>-<dispositivo>.json` (só agregados do que ela lançou) e o responsável une tudo antes de publicar o plano. Fica para a fase 2 se houver demanda.

### 6.4 Como vamos testar
Testes automáticos com Playwright e o sistema de arquivos privado do navegador (como os testes do Quadro hoje), simulando: duas gravações concorrentes, cópias `-NOTEBOOK01` e `(1)`, arquivo truncado, revisão antiga reaparecendo, relógio de um computador adiantado em 2 horas e o mesmo usuário em dois dispositivos.

---

## 7. Contratos novos

Todos dentro do envelope `gestao-envelope/1`, com esquema JSON em `contrato/` e exemplos cifrados, no mesmo padrão dos atuais.

| Contrato | Quem escreve | Conteúdo principal |
|---|---|---|
| `gestao-financas-plano/1` | Finanças do Time | `source.team`, ano fiscal, moeda, versão do plano, `lines[]` (id, categoria, centro de custo, OPEX/CAPEX, iniciativa opcional, fornecedor opcional, `months{"2026-03": {budget, forecast, actual}}`), compromissos resumidos, meses fechados |
| `gestao-financas-diretriz/1` | Finanças do Grupo | Ano fiscal, moeda, categorias e centros de custo válidos, teto por categoria e mês, calendário de fechamento, cenário oficial, prazo para publicar |
| `financas-preset/1` | Finanças do Grupo / assistente | Pré-configuração do HTML de finanças de um time (nome, slug, pasta, categorias, chave opcional desmarcada por padrão) |
| `gestao-financas-local/1` | Cada ferramenta de finanças | Formato do arquivo local (não vai para a pasta) |
| `gestao-sync/1` | Todas | Campos comuns de cabeçalho: `writer`, `device`, `revision`, `generatedAt`, `hlc` |

Valores sempre em **centavos inteiros** (sem ponto flutuante) e moeda explícita. O grupo recusa somar moedas diferentes.

---

## 8. Fases de implementação

| Fase | Entrega | Depende de |
|---|---|---|
| **F0** | `nucleo-sync` (cripto, escrita segura, detecção de conflito, relógio lógico, aviso de senha e cofre, "Onde estou?") como bloco único que o build injeta em cada HTML; contratos e exemplos | Decisões D1 a D3 |
| **F1** | Assistente `inicio.html` (gera Central e Quadro já existentes) e aviso de senha no "HTML do time" da Central | F0 |
| **F2** | Finanças do Time v1: lançamentos, compromissos, plano mensal, previsão rolante, fechamento e publicação | F0 |
| **F3** | Finanças do Grupo v1: consolidado, prévia, diretrizes, versões, HTML de finanças por time; assistente passa a gerar os dois | F2 |
| **F4** | Quadro do Time 2.0 (senha obrigatória, local + arquivo por pessoa) e Central v15 (senha/cofre, pasta nova, nome `Gestao-Compartilhado`) | F0, decisão D3 |
| **F5** | Documentação (visão geral, pacote para times, guia de finanças), testes de conflito e PRs | Todas |

Cada fase vira um PR separado no repositório, com o mesmo padrão dos anteriores (HTML único, plano em `docs/`, cópia em `/mnt/project-files/`).

---

## 9. Decisões

Em 23/11/2026 o Fernando pediu para implementar sem responder às perguntas abaixo; seguimos as recomendações e elas estão valendo. Qualquer uma pode ser revista.


| # | Pergunta | Decisão adotada |
|---|---|---|
| **D1** | A pasta comum continua sendo uma biblioteca SharePoint (sincronizada pelo OneDrive) ou passa a ser uma pasta do seu OneDrive pessoal? | Biblioteca SharePoint sincronizada pelo cliente do OneDrive. Não depende da sua conta e mantém a decisão de 15/11 |
| **D2** | Finanças usa uma chave própria por time, separada da chave de tarefas? | Sim. O plano financeiro costuma ter público menor que o quadro |
| **D3** | O Quadro do Time muda para "um arquivo por pessoa" (seção 6.2)? | Sim, é o que garante zero conflito com várias pessoas. Alternativa mais simples: manter o arquivo único só na pasta local de uma pessoa, mas aí o time perde o quadro compartilhado |
| **D4** | O que o time publica para o grupo: agregado por mês × categoria × linha, ou também os lançamentos individuais? | Só o agregado. O detalhe fica local, como pede o paradigma |
| **D5** | Categorias e centros de custo: o grupo define uma lista fechada ou os times podem criar novas? | Lista do grupo, com "Outras" aceita e destacada no consolidado (mesmo espírito do dicionário de métricas) |
| **D6** | A Central mostra um resumo financeiro das iniciativas (só leitura)? | Não na v1, para manter os HTMLs desacoplados. Reavaliar depois do F3 |

---

## 10. Riscos e limites assumidos

- **Local não tem nuvem.** O dado individual fica protegido de conflito e de exposição, mas some se o disco quebrar. Mitigado pelo backup rotativo e pelo lembrete de exportação.
- **Senha perdida = dado perdido.** Por isso o aviso do cofre e o lembrete de teste. Não existe recuperação por desenho.
- **O OneDrive não avisa a ferramenta.** A ferramenta só descobre mudanças lendo a pasta (a cada 20 a 60 s, e ao voltar para a aba). Atrasos de sincronização de minutos são normais e esperados.
- **Metadados visíveis.** Nomes de arquivo, de pasta e de quem escreve (`<pessoa>-<dispositivo>`) aparecem para quem tem acesso à pasta. Se o nome da pessoa for sensível, usamos um apelido ou identificador curto.
- **Edge ou Chrome continuam obrigatórios** (File System Access API).

---

## 11. Estado da implementação (23/11/2026)

| Fase | Situação | Onde |
|---|---|---|
| F0 núcleo comum | Feito | `financas/src/nucleo.js` e `nucleo.css`, injetados pelo build em cada HTML |
| F1 assistente | Feito | `inicio.html` (raiz do repositório). Gera Finanças do Grupo/Time, Central e Quadro, cria o primeiro arquivo cifrado de cada um e o cartão `onde-fica-cada-coisa.html` |
| F2 Finanças do Time | Feito | `financas/financas_time.html` (1.1.0, multianual: seção 12) |
| F3 Finanças do Grupo | Feito | `financas/financas_grupo.html` (1.1.0, multianual: seção 12), com "HTML de finanças do time" |
| F4 Central e Quadro | Feito sobre a Central v15 e o Quadro 2.0 (que vira 2.1.0): senha obrigatória no Quadro (quadros antigos sem senha pedem uma ao abrir), aviso de cofre ao criar senha, gerar/copiar chave e gerar "HTML do time" com chave, lembrete de teste da senha, botão "Onde estou?" nas duas, e Quadro com **um arquivo por pessoa e computador** em `times/<time>/quadro/<pessoa>-<computador>.json` (cifrado com a chave do time, unido item a item a cada 20 s) | `financas/src/seguranca.js`, `central-f4.js`, `quadro-f4.js`, injetados por `python3 tools/injetar_seguranca.py` |
| F5 documentação e testes | Feito para F0 a F3 | `financas/testes/teste-e2e.js` (53 verificações), contratos em `financas/contrato/` |

Como montar: `python3 tools/build_financas.py` (lê a Central mais nova e o Quadro, sem alterá-los, e gera os três HTMLs). Como testar: `node financas/testes/teste-e2e.js`.

O que o teste cobre: criação dos arquivos sempre cifrados (nada em claro na pasta local nem na comum), aviso de cofre ao criar senha, gerar chave e gerar HTML com chave; diretriz do grupo lida pelo time; plano publicado só com agregados; prévia e soma no grupo; cópia de conflito `plano (1).json` com revisão maior escolhida; cópia `plano-NOTEBOOK01.json` resolvida; publicação bloqueada quando o dono é outra pessoa e "assumir" com revisão = maior + 1; arquivo truncado ignorado mantendo o último válido; revisão antiga reaparecendo ignorada; senha errada recusada; lembrete de 30 dias; backup rotativo; assistente nas combinações "responsável: finanças + tarefas" e "gestor: finanças + tarefas", com a Central, o Quadro e as Finanças abrindo os arquivos que ele criou.

O teste também cobre o F4: quadro antigo sem senha passa a ser cifrado, senha curta recusada, duas pessoas com arquivos próprios vendo os cards uma da outra, códigos iguais renumerados, cópia de conflito do próprio arquivo unida e apagada, e o botão "Onde estou?" na Central e no Quadro.

Limites conhecidos desta versão: o navegador não revela o caminho completo da pasta, então a checagem "a pasta local não está no OneDrive" é indireta (nome, `desktop.ini`, estrutura) mais a confirmação da pessoa; lançamentos de várias pessoas do mesmo time (seção 6.3) ficam para quando houver demanda; o arquivo antigo compartilhado do Quadro continua funcionando (união a cada 20 s), mas o recomendado agora é o arquivo local de cada pessoa mais a pasta sincronizada; e o nome da pasta comum recomendado é `Gestao-Compartilhado`, mas `Gestao-Integracao` continua aceito.
| Hub e post-its (24/11/2026) | Feito | `hub.html` (fonte `financas/src/hub.html`), post-its em `times/<time>/postits/` e Quadro 2.2 (`financas/src/quadro-postits.js`). Ver `docs/plano-hub.md` |

## 12. Planejamento multianual (24/11/2026, Finanças 1.1.0)

Pedido: "Permita planejamento financeiro multi anual", nas Finanças do Time e do Grupo, com o consolidado do grupo somando os anos dos times.

**Modelo.** O ano fiscal continua existindo como **ano base** (o ano em curso: meses fechados, realizado, alertas). Ao lado dele há o **horizonte** (`anos`), a lista de anos planejados. Os valores já eram guardados por mês (`AAAA-MM`), então nada muda no formato dos valores: um ano a mais é só mais meses.

**Finanças do Time**
- Seletor de ano no topo (Resumo, Lançamentos, Plano, Contratos, Futuro) e "+ Adicionar ano…": o ano novo começa vazio ou com o previsto/orçado do ano anterior, com reajuste em %.
- Plano ganha a visão "Todos os anos" (linhas × anos, orçado e previsto). Clicar num ano abre o mês a mês daquele ano.
- "Orçado mensal" de uma linha pode repetir nos anos seguintes do plano. Contratos novos terminam, por padrão, no fim do último ano.
- Futuro ganha o card "Vários anos": gráfico e tabela por ano, variação contra o ano anterior e total do horizonte (o cenário "e se" aparece em cada ano).
- Alertas: teto do grupo do ano em exibição e aviso quando um ano futuro do horizonte ainda está vazio.
- Ajustes: ano base (escolhido entre os anos do plano) e lista de anos; tirar um ano do horizonte não apaga os valores.

**Finanças do Grupo**
- Orçamento aprovado por ano (`orcamento.porAno`) e teto de cada time por ano (`times[].tetos[ano]`), editados no ano escolhido no topo.
- O grupo enxerga os anos do próprio horizonte **mais os anos publicados pelos times**. O consolidado soma cada ano separado, pelos meses daquele ano.
- Consolidado: seletor de ano e a visão "Por ano" (time × ano, total, orçamento aprovado e saldo de cada ano).
- Saúde da soma avisa quando o plano de um time não cobre o ano em exibição. Versões guardam todos os anos e comparam no ano em exibição. CSV exporta todos os anos.

**Contratos (compatíveis com 1.0).**
- Plano: `fiscalYear` (ano base) e `totals` (do ano base) continuam; entram `fiscalYears` e `totalsByYear`. As linhas levam os meses de todos os anos do horizonte e os 12 meses seguintes.
- Diretriz: `caps`/`capTotal` continuam sendo os do ano base; entram `fiscalYears` e `byYear` (ano → `{caps, capTotal}`).
- Preset do HTML do time leva `anos`.
- Um plano 1.0 (sem `fiscalYears`) soma no ano dele. Arquivos locais 1.0 abrem sem perguntar nada: o horizonte vira só o ano base, e o orçamento e os tetos antigos viram os do ano base.
- Antes, o grupo **descartava** da soma um plano de ano diferente do seu; agora todo plano na mesma moeda entra, cada ano no seu lugar.

Teste: seção 10 de `financas/testes/teste-e2e.js` (adicionar 2027 com reajuste, publicar, grupo somar 2026 e 2027, teto por ano na diretriz, migração de arquivos 1.0).

## 13. Interface das finanças (24/11/2026, Finanças 1.2.0)

Pedido: telas minimalistas, com mais gráficos do que texto, em branco e azul com destaques discretos, menos navegação e cards que ajudem a interpretar.

- **Menos navegação.** O Time passou de 7 para 4 entradas no menu e o Grupo de 5 para 3. As telas irmãs viraram abas no topo:
  - Time: **Painel** (Hoje, Futuro e cenários), **Lançamentos**, **Plano** (Plano mês a mês, Contratos), **Ajustes** (Grupo e pasta, Time e segurança).
  - Grupo: **Painel** (Consolidado, Planos recebidos, Versões), **Times**, **Ajustes**.
- **Cards de leitura.** Cada card traz o número, um medidor e uma frase que interpreta:
  - previsto contra o orçado, com a folga ou o excesso;
  - realizado contra o previsto, com a marca de quanto do ano já passou;
  - o mês atual;
  - o teto do grupo, ou o ano seguinte do plano.
  
  O card principal fica em azul cheio.
- **Gráficos no lugar de tabelas.**
  - Curva do ano acumulada (orçado, previsto e realizado, com a linha de "hoje").
  - "Onde vai o dinheiro": barras por categoria, com marca do orçado e do teto.
  - No Grupo, barras por time com a marca do orçado e do teto.
  
  As tabelas detalhadas continuam no Grupo (Por time, categoria, iniciativa, OPEX × CAPEX, Por ano) e no Plano.
- **Cores.** Só tons de azul nos gráficos (o realizado em azul escuro). O vermelho fica para o que passou do orçado ou do teto. A barra de status junta "salvo e cifrado" e a pasta num único indicador.
- As peças visuais ficam em `nucleo.js` (`cardLeitura`, `barrasH`, `curvaAcumulada`) e `nucleo.css`, para reaproveitar no Hub e nas próximas telas.

## 14. Consolidação em níveis (24/11/2026, Finanças do Grupo 1.3.0)

Pedido: um gestor de vários times encaminha o consolidado para a liderança, que também usa as Finanças do Grupo para consolidar vários gestores.

**Como funciona**
1. **A liderança cadastra o gestor.** Na aba Times, ela usa "+ Grupo de outro gestor", com o mesmo identificador do grupo do gestor (ex.: `tecnologia`), e gera a chave: `GK1.<grupo>-fin-AAMM.<43>`. A chave segue por mensagem direta, sempre com o aviso de cofre.
2. **O gestor cola a chave.** O campo fica em Ajustes > "Nível acima · sua liderança". Uma chave de outro grupo é recusada.
3. **O gestor publica para a liderança.** Antes de publicar, ele confere o que sobe: totais por ano, as unidades que entram e as que ficam de fora (sem plano aplicado ou com plano ainda não revisado).
   - O arquivo vai para `grupos/<grupo>/financas/plano.json`: um envelope `gestao-envelope/1` com conteúdo `gestao-financas-plano/1`, `source.level = "group"` e `units`.
   - Vai uma linha por unidade × categoria (× OPEX/CAPEX) mais os itens do grupo, mês a mês e com todos os anos. Os nomes das linhas dos times não vão.
   - Quando o consolidado muda depois da última publicação, o Painel mostra um aviso com o botão para publicar de novo.
4. **A liderança soma o gestor como uma unidade.** O consolidado do gestor aparece em Planos recebidos, é aplicado e somado ano a ano, como o plano de um time. Funciona em quantos níveis forem precisos.
5. **A diretriz desce.** A liderança publica o teto por ano em `grupos/<grupo>/financas/diretriz.json`. O gestor vê o teto no card de orçamento do Painel e, na aba Times, quanto dos tetos das suas unidades já foi repartido.

**Regras mantidas:** tudo cifrado, um único dono por arquivo (o gestor dono do `plano.json`, a liderança dona do `diretriz.json`), revisão crescente, cópias de conflito do OneDrive resolvidas pela maior revisão.

**Premissa:** a liderança precisa ler a mesma pasta compartilhada (ou uma biblioteca do SharePoint sincronizada com a mesma estrutura).

**Arquivo local:** `db.acima = { chaves, publicacao, diretriz }` no gestor, e `db.times[].tipo = 'time' | 'grupo'` na liderança. Arquivos 1.2 abrem com `tipo: 'time'` e sem nível acima. O onboarding pode gravar `db.acima.chaves` com `origem: 'onboarding'`.

Teste: seção 12 de `financas/testes/teste-e2e.js`.

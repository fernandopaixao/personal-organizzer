# Mapa de Férias · plano e decisões (1.0, 24/11/2026)

Pedido do Fernando: "time cadastra, sobe para o líder (consolidado), que cadastra a própria (sobe para o líder)", com a mesma lógica de níveis das Finanças do Grupo 1.3. Complementos:
- o papel do líder é **enxergar e planejar as ausências do grupo**: que dias têm mais gente fora e quais têm menos;
- é **apoio para a visão do grupo**: não substitui a ferramenta oficial de férias da empresa, então não tem aprovação nem fluxo de pedido.

## 1. O que é
Uma ferramenta nova e desacoplada, `ferias.html` (título **Mapa de Férias**), com o próprio arquivo cifrado `ferias-<identificador>.json` na pasta local. O mesmo HTML serve aos dois papéis, escolhidos na criação do arquivo:

| Papel | Cadastra | Vê | Publica |
|---|---|---|---|
| **Time** (cada membro ou o responsável) | As próprias férias e, se quiser, as dos colegas | O mapa do time, somando o que cada membro publicou | Sozinho, a cada mudança: `times/<time>/ferias/<pessoa>-<computador>.json` |
| **Gestor ou liderança** | As próprias férias e as dos diretos (quem não está num time) | O mapa do grupo inteiro: times, grupos de outros gestores, você e diretos | Por botão, depois de conferir: `grupos/<grupo>/ferias/<pessoa>-<computador>.json` |

A liderança cadastra o grupo do gestor como uma **unidade** e soma o consolidado dele como se fosse um time. Funciona em quantos níveis forem precisos ([ADR-0025](adr/0025-consolidacao-em-niveis.md) e [ADR-0026](adr/0026-ferias-em-niveis.md)).

## 2. Telas
- **Mapa** (padrão): cards de leitura (fora hoje, pico do período, dias acima do limite, dias úteis sem ninguém fora), lista "Pedindo atenção", **mapa de calor** dos meses (cada dia colorido pela quantidade de pessoas fora; vermelho acima do limite; clique abre quem está fora), **semanas mais cheias** e **mais tranquilas** e barras **por unidade** (ou por pessoa, no time). Filtros no topo: unidade e período (próximos 3 ou 6 meses, este ano, próximo ano).
- **Calendário**: um mês por vez, uma linha por pessoa agrupada por unidade, com a contagem de pessoas fora no dia no topo (vermelho acima do limite). Clicar numa célula das suas pessoas marca ou edita uma ausência.
- **Pessoas / Diretos**: quem você cadastra, com as ausências futuras e passadas; barra rápida ("Ana 05/01 a 23/01 férias").
- **Unidades** (só gestor): times e grupos de outros gestores, chaves, o que foi lido; importar times e chaves do Hub e grupos das Finanças do Grupo (só leitura, com a senha daquela ferramenta).
- **Ajustes**: pasta sincronizada, chave do time ou do nível acima, publicar, limite de pessoas fora (padrão 30%), dias úteis, feriados, enviar nomes para cima, segurança.

**Planejar uma ausência:** o formulário mostra o impacto (quantas outras pessoas já estão fora no dia mais cheio e quantos dias passam do limite) e o botão **Sugerir períodos com menos gente fora** propõe três janelas com o mesmo número de dias úteis nos próximos seis meses.

## 3. Decisões
| # | Decisão | Por quê |
|---|---|---|
| F1 | Um HTML só para time e gestor, com o papel escolhido na criação | Menos arquivos no zip; os dois papéis usam o mesmo mapa |
| F2 | Time usa a **chave de tarefas** do time (a do Quadro) | O time inteiro já a tem; férias não são dado restrito |
| F3 | Entre grupos, a **mesma chave do grupo** das Finanças (`GK1.<grupo>-fin-…`) serve; o Mapa também gera `GK1.<grupo>-fer-…` para quem não usa finanças | "Mesma chave" pedida; uma chave por grupo para todos os assuntos |
| F4 | Um arquivo por pessoa e computador; quem lê fica com o mais novo de cada pessoa | Sem conflito do OneDrive; o mesmo gestor em dois computadores não soma em dobro |
| F5 | Pessoas do mesmo time se unem pelo nome (slug) | Ana pode cadastrar as próprias férias e o responsável também, sem duplicar |
| F6 | Notas ficam só no arquivo local; tipos sem saúde (licença entra como "Outra ausência") | Dado pessoal mínimo na pasta |
| F7 | Gestor pode trocar nomes por "Pessoa N" ao publicar para a liderança | A liderança planeja por quantidade; nomes são opcionais |
| F8 | Sem aprovação, sem saldo de férias | Não substitui a ferramenta oficial |
| F9 | Contagem só em dias úteis (dias da semana configuráveis, feriados cadastrados por nível) | É o que importa para a capacidade |
| F10 | Não mexe no `inicio.html` nesta entrega | O onboarding por perfil está em outra thread; a sugestão é gerar o Mapa de Férias no perfil de gestor e de time |

## 4. Contrato
`gestao-ferias/1` (`contratos/schemas/gestao-ferias-1.schema.json`), dentro do envelope `gestao-envelope/1`: `unit`, `units` (árvore), `people` (id, nome, unidade de origem), `absences` (pessoa, início, fim inclusive, tipo), `holidays` e, no grupo, `contributors`.

## 5. Arquivo local
`gestao-ferias-local/1`: `nivel` (time/grupo), `unidade`, `pessoa`, `eu`, `pessoas`, `ausencias` (com `nota`), `feriados`, `config` (`limite`, `diasUteis`, `nomesAcima`), `chaves` (do time ou do nível acima), `unidades` (com chaves), `retratos` (último lido de cada unidade, para abrir sem a pasta), `publicacao`, `seg`.

## 6. Teste
`node financas/testes/teste-ferias.js`: Ana e Bruno no mesmo time (cada um publica o próprio arquivo e um vê o outro), Fernando soma o time, marca a própria folga, vê o pico de 3 pessoas e publica com a chave das Finanças; Carla (liderança) soma o grupo do Fernando e vê as mesmas 3 pessoas. Roda na CI.

## 7. Próximos passos sugeridos
- Onboarding por perfil: gerar o Mapa de Férias para gestor e time, com a chave do nível acima.
- Hub: mostrar "fora hoje" por time, lendo `times/<time>/ferias/` com a chave do time que o hub já tem.

## Gerado pelo assistente (24/11/2026)

O `inicio.html` 2.1 gera o Mapa de Férias quando a pessoa marca "Férias" no perfil, e também no "Estou com sorte". No gestor, o arquivo `ferias-<grupo>.json` já sai com os times como unidades (cada uma com a chave de tarefas do time) e, se houver, a chave da liderança. No time, o arquivo sai com a chave do time. O `ferias.html` de `para-os-times/<time>/` leva a chave do time no preset (`chave`), e a ferramenta pede o aviso de cofre ao criar o arquivo.

## Dentro da Central (1.3, Central 15.9, 24/11/2026)

Pedido do Fernando: "Não trate férias como um item a parte. Trate como uma ferramenta incluída no módulo do gestor. O objetivo é reduzir e simplificar a quantidade de módulos a gerir." Decisão em [ADR-0033](adr/0033-ferias-dentro-da-central.md).

- **Página Férias na Central** (menu Pessoas, tecla 5). O build (`tools/build_financas.py`) embute o Mapa de Férias montado na Central (`#feriasEmb`) e a Central o abre num quadro da própria página. O código é o mesmo do `ferias.html`: quando aberto pela Central (objeto `FERIAS_HOST`), entra no **modo embutido**.
- **Modo embutido:** sem tela de arquivo e de senha; os dados ficam em `db.ferias` no arquivo da Central (formato `gestao-ferias-local/1`); os times com pasta e as chaves de tarefas ativas da Integração viram unidades (`origem: 'central'`) e acompanham a Central a cada vez que a página abre; a pasta compartilhada é a da Integração; o menu vira abas no topo; sem "← Hub", "Onde estou?" e seletor de tema próprios (a Central já tem).
- **Migração:** **Trazer do Mapa de Férias separado** (primeira tela e Ajustes) lê o `ferias-<grupo>.json` com a senha dele e traz tudo; o arquivo antigo não é alterado. Arquivo do papel "time" é recusado.
- **Hoje da Central:** cartão **Fora hoje** (você, diretos e o último retrato de cada time).
- **Assistente 2.4:** o gestor que marca Férias recebe a Central com `db.ferias` pronto (grupo, times e chaves) e não recebe mais `ferias.html` nem `ferias-<grupo>.json`. Os times continuam recebendo `para-os-times/<time>/ferias.html`.
- **Contrato:** nada muda. A página lê `times/<time>/ferias/` e publica em `grupos/<grupo>/ferias/` como antes.
- **Teste:** seção 6 de `financas/testes/teste-ferias.js` (abre na Central, times e chave da Integração, lê o time, publica, nota fica na Central, "Fora hoje", time novo, migração do arquivo antigo) e o caminho do assistente no `teste-e2e.js`.
- **Decidido em 25/11:** só o gestor cadastra (seção abaixo).

## Só o gestor cadastra (1.4, Central 15.11, 25/11/2026)

Decisão do Fernando no card do thread: "Só o gestor cadastra". Registrada em [ADR-0036](adr/0036-ferias-so-o-gestor-cadastra.md).

- **Os times não recebem ferramenta de férias.** O `ferias.html` saiu do pacote (`tools/empacotar.py`), do assistente 2.6 (nem para o gestor, nem para os times, nem em `para-os-times/<time>/`) e do hub. O assistente não cria mais `times/<time>/ferias/`; só `grupos/<grupo>/ferias/` para o gestor. O arquivo continua no repositório como fonte da cópia embutida na Central e dos testes.
- **Aba Pessoas** (antes "Diretos"): agrupada em "Você e diretos" e um grupo por time. O formulário de pessoa tem o campo **Time**; a ausência mostra o time da pessoa.
- **Trazer pessoas da Central:** botão na aba Pessoas e passo automático na primeira vez. Lê as pessoas da Central (`FERIAS_HOST.pessoas`), cada uma com o primeiro time dela, e só acrescenta quem falta.
- **Todos os times da Central viram unidades**, com ou sem pasta e chave (o identificador cai para o nome do time quando não há slug). Time sem pasta não gera aviso.
- **Consolidado:** as pessoas de cada time sobem com `people[].id` `<time>.<slug>` e `unit` do time, deduplicadas contra o que outra solução publicar em `times/<time>/ferias/`. Contrato `gestao-ferias/1` sem mudança.
- **Teste:** seção 6 de `teste-ferias.js` (pessoas da Central por time, ausência de pessoa de time no consolidado, "3 fora", sem aviso de pasta) e `teste-e2e.js` (para-os-times sem `ferias.html`).

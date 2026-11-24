# ADR-0028 · Finanças dos times na Central, só leitura

**Status:** aceita · **Data:** 24/11/2026 (Central 15.5, revisão da decisão D6) · **Origem:** proposta "Integrar finanças no hub e na Central", aprovada pelo Fernando com as recomendações I1 a I4

## Contexto
A decisão D6 deixava finanças fora da Central: o gestor abria o Finanças do Grupo para ver dinheiro e a Central para ver o resto. O Fernando pediu "tudo integrado no hub/Central". O Hub 1.2 já mostra o previsto dos times. Faltava a Central cruzar o dinheiro com os times, a reunião de status e, depois, as iniciativas.

## Decisão
- A Central **lê** o plano que cada time publica (`times/<pasta>/financas/plano*.json`, `gestao-financas-plano/1`, a revisão mais alta) e o teto da diretriz do grupo (`grupo/financas/diretriz-<pasta>.json`). Ela **nunca escreve** em finanças. Orçamento, tetos, consolidado e publicação continuam no Finanças do Grupo.
- Para isso, a Central precisa da **chave de finanças** de cada time ([0006](0006-chave-de-financas-separada.md)). A chave fica em `db.integ.finKeys`, separada da chave de tarefas, e tem dois caminhos de entrada:
  - colada à mão;
  - importada do arquivo do Finanças do Grupo, com a senha dele. É só leitura, a mesma exceção à [0010](0010-htmls-desacoplados.md) que o hub já faz, e nada é gravado naquele arquivo.
- A Central guarda só um **retrato** de cada plano (`db.integ.fin`):
  - totais por ano;
  - soma por código de iniciativa, por ano;
  - teto e revisão.

  Os nomes das linhas do time não ficam na Central.
- Onde aparece:
  - card **Finanças dos times** na Hoje (previsto contra o teto ou o orçado, times acima do teto, planos sem publicar há mais de 35 dias);
  - linha de finanças no card do time (Times e Iniciativas);
  - bloco **Finanças** na reunião de status, só quando há o que tratar.
- Sem a chave de finanças, nada disso aparece (I3).

## Consequências
- **A favor:** o gestor vê dinheiro e trabalho no mesmo lugar, sem uma terceira tela. Quem só tem a chave de tarefas continua sem ver finanças.
- **Contra:** a Central passa a guardar mais uma chave por time, e o retrato fica tão atual quanto a última leitura da pasta.

## Ao evoluir
- Etapa 2: custo por iniciativa, somando todos os times (I4), a partir de `fin[time].ini`.
- Etapa 3: uma senha por sessão para as janelas abertas pelo hub ou pela Central (I2), e o hub da liderança.
- Se um dia a Central precisar escrever em finanças, isso é uma decisão nova que substitui esta.

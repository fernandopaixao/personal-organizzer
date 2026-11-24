# ADR-0002 · Dados sempre fora do HTML, um arquivo de dados por ferramenta

**Status:** aceita · **Data:** v11, reforçada na v12 (06/11/2026) · **Origem:** Central v11/v12

## Contexto
Se os dados ficassem dentro do HTML, cada versão nova da ferramenta exigiria copiar os dados de um arquivo para o outro, e qualquer cópia do HTML levaria os dados junto.

## Decisão
O HTML **nunca guarda dados**. Cada ferramenta abre e grava **o próprio arquivo JSON cifrado**, separado do HTML:

| Ferramenta | Arquivo de dados |
|---|---|
| Central de Gestão | arquivo escolhido pelo gestor (ex.: `gestao-fernando.json`) |
| Quadro do Time | arquivo local da pessoa + `times/<time>/quadro/<pessoa>-<computador>.json` |
| Finanças do Grupo / do Time | arquivo local próprio + publicações na pasta comum |
| Hub | `hub-<nome>.json` |

Um HTML gerado pode trazer um **bloco de pré-configuração** (nome do time, slug, pasta), mas nunca dados de uso.

## Consequências
- **A favor:** trocar de versão é trocar o HTML; o HTML pode circular livremente; backup é copiar um arquivo.
- **Contra:** a pessoa precisa saber qual arquivo abrir com qual HTML. Mitigado pelo botão **Onde estou?**, pelo cartão `onde-fica-cada-coisa.html` e pelo reconhecimento do `schema` (a ferramenta diz qual HTML usar quando recebe o arquivo errado).

## Ao evoluir
- Dado novo vai para o arquivo de dados com migração aditiva ([ADR-0011](0011-migracao-aditiva-versionada.md)), nunca para constantes no HTML.

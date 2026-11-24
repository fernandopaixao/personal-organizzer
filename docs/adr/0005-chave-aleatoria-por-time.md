# ADR-0005 · Uma chave aleatória por time, separada da senha, dentro de um envelope

**Status:** aceita · **Data:** 15/11/2026 · **Origem:** `integracao-time/01` §8, decisões D1 a D1c

## Contexto
Os arquivos da pasta comum são lidos por mais de uma pessoa (a Central e o time). A senha pessoal do gestor não pode ser compartilhada, e um time não deve ler o arquivo de outro.

## Decisão
- **Uma chave de 256 bits aleatória por time**, gerada pela Central, **diferente da senha** que abre a Central. Formato de texto: `GK1.<kid>.<base64url>`.
- Todo arquivo comum vai dentro do envelope **`gestao-envelope/1`**: cabeçalho em claro (schema, conteúdo, time, `kid`, revisão, data, `writer`) e conteúdo em AES-256-GCM com IV novo. O cabeçalho entra como dado associado (AAD), então alterá-lo faz a decifragem falhar.
- A chave vai ao responsável do time **por mensagem direta no Teams ou por e-mail, nunca pela pasta**.
- **Troca só em caso de vazamento**: "Vazou: trocar chave" (em Integração) invalida a chave na hora e a Central gera outra. Sem rotação periódica. Time novo só ganha a própria chave.
- Na Central, as chaves ficam dentro do arquivo de dados (protegido pela senha). No time, ficam como chave não exportável no navegador e dentro do arquivo local cifrado.

## Consequências
- **A favor:** vazamento de uma chave afeta um time só; quem tem a pasta sem a chave vê apenas metadados.
- **Contra:** a chave é compartilhada dentro do time e não há assinatura digital, então a Central sabe que o arquivo veio do time, não de qual pessoa. O campo `writer` é conferido contra o conteúdo decifrado, mas não é prova criptográfica.

## Ao evoluir
- Use [`contratos/referencia/cripto.js`](../../contratos/referencia/cripto.js) (confira com `node contratos/validar.js vetores`) ou o núcleo comum. Não invente formato de envelope novo.
- Recurso novo que precise de público diferente do time inteiro ganha **chave própria** (precedente: [ADR-0006](0006-chave-de-financas-separada.md)).

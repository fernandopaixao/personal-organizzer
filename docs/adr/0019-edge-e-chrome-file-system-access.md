# ADR-0019 · Edge ou Chrome com a File System Access API

**Status:** aceita · **Data:** 15/11/2026 (D3) · **Origem:** `integracao-time/00`

## Decisão
O navegador padrão é **Edge ou Chrome**, por causa da File System Access API (gravar no mesmo arquivo, ler pastas, escrita atômica). Sem a API há um plano B de baixar e enviar arquivos, só como reserva.

## Consequências
- Firefox e Safari não são suportados para uso pleno. Quando a função falta, cada ferramenta diz o motivo e o que fazer ([ADR-0030](0030-aviso-quando-nao-da-para-abrir-pastas.md)).
- O navegador não revela o caminho completo de uma pasta, por isso a checagem "local fora do OneDrive" é indireta ([ADR-0008](0008-local-individual-comum-sincronizado.md)).
- Cada pasta precisa ser autorizada pela pessoa no navegador; a autorização pode ser pedida de novo após reiniciar.

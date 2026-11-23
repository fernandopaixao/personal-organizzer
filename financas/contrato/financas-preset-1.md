# financas-preset/1

Pré-configuração gravada entre `/*FIN-PRESET*/` e `/*FIM-FIN-PRESET*/` no HTML das Finanças do Time, pela ferramenta Finanças do Grupo ("HTML de finanças do time") ou pelo assistente `inicio.html`.

```json
{ "schema": "financas-preset/1", "team": { "nome": "Pagamentos", "slug": "pagamentos", "prefixo": "PAG" },
  "ano": 2026, "moeda": "BRL", "categorias": [{ "id": "pessoas", "nome": "Pessoas", "tipo": "OPEX" }],
  "centros": ["CC-1020"], "pasta": "Gestao-Compartilhado", "contato": "Fernando",
  "chave": "GK1.pagamentos-fin-2611.<43 caracteres> (opcional, desmarcado por padrão)", "geradoEm": "…" }
```

Com `chave`, o HTML vira um segredo: a ferramenta mostra o aviso de cofre ao gerar e o time confirma que guardou a chave no cofre no primeiro uso.

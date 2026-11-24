# 02 · Criptografia, chaves e vetores de teste

*Contratos 1.0 · 24/11/2026 · decisões em [ADR-0003](../docs/adr/0003-criptografia-sempre.md), [ADR-0005](../docs/adr/0005-chave-aleatoria-por-time.md) e [ADR-0006](../docs/adr/0006-chave-de-financas-separada.md)*

Implementação de referência: [`referencia/cripto.js`](referencia/cripto.js) (Web Crypto; navegador e Node 20+, sem dependências). É o mesmo algoritmo de `financas/src/nucleo.js` e do Quadro do Time. Se puder, copie em vez de reescrever.

## 1. Resumo

| Item | Valor |
|---|---|
| Algoritmo | AES-256-GCM (`alg: "A256GCM"`) |
| Chave | 32 bytes aleatórios, uma por time/finalidade, em texto `GK1.<kid>.<base64url>` |
| IV (nonce) | 12 bytes **aleatórios e novos a cada gravação**, em base64 padrão |
| Tag | 16 bytes, colada ao fim do texto cifrado (padrão do Web Crypto), em `ct` |
| Texto claro | bytes UTF-8 de `JSON.stringify(conteúdo)` |
| AAD | `gestao-envelope/1|<content>|<team>|<kid>|<revision>|<generatedAt>` em UTF-8 |
| Base64 | `iv` e `ct` em base64 padrão (com `+`, `/`, `=`); só o segredo da chave usa base64url sem `=` |

## 2. Chaves

### Formato

```
GK1.<kid>.<43 caracteres base64url>
     │      └── os 32 bytes da chave (base64url, sem "=")
     └── identificador da chave (slug: a-z, 0-9 e hífen). Não é segredo e vai em claro no envelope.
```

Regex: `^GK1\.([a-z0-9]+(?:-[a-z0-9]+)*)\.([A-Za-z0-9_-]{43})$`. Depois de decodificar, o segredo tem de ter exatamente 32 bytes. Importe com `extractable: false`.

### Famílias de chave

| Família | `kid` | Quem gera | Cifra | Quem tem |
|---|---|---|---|---|
| **Tarefas do time** | `<time>-AAMM` (ex.: `pagamentos-2611`) | Central de Gestão (time › Integração) | catálogo, status, métricas, quadro, férias do time, post-its, vistos | Gestor e todo o time |
| **Finanças do time** | `<time>-fin-AAMM` | Finanças do Grupo do gestor | plano do time e diretriz do gestor para o time | Gestor e responsável financeiro do time |
| **Do grupo** | `<grupo>-fin-AAMM` (ou `<grupo>-fer-AAMM`, gerada pelo Mapa de Férias para quem não usa finanças) | Ferramenta da **liderança** (Finanças do Grupo ou Mapa de Férias), ao cadastrar o gestor como unidade `grupo` | consolidado financeiro, diretriz da liderança e férias consolidadas do grupo | Liderança e o gestor daquele grupo |

- Se o `kid` já existe, as ferramentas acrescentam `-2`, `-3`... (`pagamentos-2611-2`).
- O `kid` **sempre começa pelo slug** do time ou grupo dono da pasta. As ferramentas conferem: o Mapa de Férias aceita `kid === slug` ou `kid` começando por `slug-`; as Finanças do Grupo exigem `<grupo>-` na chave do nível acima; a Central exige `<time>-fin` na chave de finanças.
- **Chave de finanças nunca cifra tarefas, férias ou post-its**, e a chave de tarefas nunca cifra finanças ([ADR-0006](../docs/adr/0006-chave-de-financas-separada.md)): o time inteiro tem a chave de tarefas; finanças é restrito.
- Uma solução externa **não gera chave para o nível de cima**: ela recebe a chave de quem administra aquele nível. Só gere chave se a sua solução administra o nível (ex.: uma liderança com ferramenta própria gerando a chave de cada gestor).

### Entrega, guarda e troca

- Entrega só por **mensagem direta no Teams ou e-mail**. Guarda no **cofre de senhas**. **Nunca** na pasta compartilhada, em repositório, em log ou em prompt de agente.
- Um HTML com chave embutida (`financas-preset/1`, Quadro pré-configurado) é um segredo do mesmo nível.
- Troca **só quando vaza**: o dono do nível revoga a chave antiga, gera outra e envia; quem publica republica com a nova. Chave revogada deixa de ser aceita na hora (Central e Finanças do Grupo); o Mapa de Férias guarda as chaves anteriores só para ler arquivos antigos. Publique **sempre com a chave mais recente**.

## 3. Envelope `gestao-envelope/1`

Schema: [`schemas/gestao-envelope-1.schema.json`](schemas/gestao-envelope-1.schema.json).

```json
{
 "schema": "gestao-envelope/1",
 "content": "gestao-financas-plano/1",
 "team": "pagamentos",
 "kid": "pagamentos-fin-2611",
 "revision": 14,
 "generatedAt": "2026-11-20T18:12:40-03:00",
 "alg": "A256GCM",
 "writer": "ana~k3f9a",
 "iv": "<16 caracteres base64>",
 "ct": "<base64 do texto cifrado + tag>"
}
```

| Campo | Regra |
|---|---|
| `content` | Igual a `conteudo.schema` |
| `team` | Slug da pasta (`times/<time>/` ou `grupos/<grupo>/`; no catálogo, o time do nome do arquivo); igual a `conteudo.source.team` (no catálogo, `teams[0].slug`) |
| `kid` | Identificador da chave usada |
| `revision`, `generatedAt` | Iguais aos do conteúdo, **byte a byte** (`generatedAt` é texto, não reformate) |
| `writer` | Obrigatório em arquivos de dono único publicados pelo núcleo (plano, diretriz, férias, post-its, vistos): igual a `conteudo.source.writer`. Ausente em catálogo, status e métricas. Fica **fora** do AAD (compatibilidade com o contrato de 15/11) |

### Cifrar

```js
const h = { schema: 'gestao-envelope/1', content: p.schema, team, kid, revision: p.revision, generatedAt: p.generatedAt, alg: 'A256GCM' };
const iv = crypto.getRandomValues(new Uint8Array(12));
const aad = new TextEncoder().encode(['gestao-envelope/1', h.content, h.team, h.kid, h.revision, h.generatedAt].join('|'));
const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad }, key, new TextEncoder().encode(JSON.stringify(p)));
const env = { ...h, writer: p.source?.writer, iv: b64(iv), ct: b64(new Uint8Array(ct)) };
```

`revision` entra no AAD como o número em decimal, sem zeros à esquerda (`14`, não `"014"`).

### Decifrar (o que as ferramentas conferem, nesta ordem)

1. `schema === "gestao-envelope/1"` e `alg === "A256GCM"`; senão, ignora.
2. Procura a chave pelo `kid`; sem chave cadastrada (ou revogada), ignora.
3. Decifra com o AAD remontado **a partir do cabeçalho**. Falhou (chave errada, cabeçalho mexido, arquivo cortado pela sincronização): ignora.
4. `conteudo.schema === content`, `conteudo.revision === revision`, `conteudo.generatedAt === generatedAt`; se houver `writer`, `conteudo.source.writer === writer`. Divergiu: ignora.
5. `team` do envelope e `conteudo.source.team` iguais ao slug esperado pela pasta. Divergiu: ignora.

Em Python (biblioteca `cryptography`), o equivalente é `AESGCM(chave).encrypt(iv, texto, aad)`, que já devolve texto + tag no formato de `ct`.

## 4. Vetores de teste

[`vetores/vetores-envelope.json`](vetores/vetores-envelope.json) traz casos com chave e IV fixos (chave = bytes `00..1f`, IV = bytes `a0..ab`; **só para teste**):

| Caso | Espera | Confere |
|---|---|---|
| `status-minimo` | abre | AAD exato, mesmo `ct` ao cifrar com o mesmo IV |
| `postit-com-writer` | abre | `writer` fora do AAD; texto com acentos e símbolo fora do ASCII (UTF-8) |
| `revisao-alterada` | falha | cabeçalho mexido quebra o AAD |
| `team-alterado` | falha | idem |
| `ct-truncado` | falha | arquivo cortado não passa na tag |
| `writer-trocado` | falha | decifra, mas `writer` ≠ `source.writer` |

Uma implementação nova está certa quando: lê `chave` e chega em `chaveBytesBase64`; monta exatamente o `aad`; cifra `payloadJson` com o IV do envelope e obtém o mesmo `ct`; abre os casos `ok` e recusa os casos `falha`. Com Node: `node contratos/validar.js vetores` (confere a referência). Para conferir a sua, compare as suas saídas com os campos do JSON.

## 5. O que nunca fazer

- Reusar IV com a mesma chave (no GCM isso expõe os dados). Os exemplos desta pasta usam IV derivado só para não mudarem a cada geração; **em produção, IV sempre aleatório**.
- Inventar outro formato de envelope, outro algoritmo, compressão ou campos cifrados à parte.
- Gravar qualquer dado em claro na pasta (nem "só para depurar"). Para conferir, use `node contratos/validar.js decifrar`.
- Colocar a chave dentro do conteúdo, do nome do arquivo ou de um campo do envelope.
- Derivar a chave de uma senha: chaves de troca são aleatórias. Senha (PBKDF2-SHA-256, 600 mil iterações, `gestao-local-cifrado/1`) é só para o arquivo local de cada pessoa, fora destes contratos.

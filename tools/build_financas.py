#!/usr/bin/env python3
"""Monta as ferramentas de finanças e o assistente inicial a partir de financas/src/.

    python3 tools/build_financas.py

- injeta o núcleo comum (financas/src/nucleo.css e nucleo.js) em cada HTML;
- injeta o tema claro/escuro/automático (financas/src/tema.js) e a senha por sessão (financas/src/sessao.js) no <head> de cada HTML;
- ícone da aba da marca Remessa em cada HTML (financas/src/icones/, ADR-0037) e, só na versão experimental
  (tools/build_experimental.py), a identidade visual (função visual, ADR-0034);
- financas/financas_time.html   ← src/time.html
- financas/financas_grupo.html  ← src/grupo.html (+ Finanças do Time embutido, para gerar o HTML de cada time)
- hub.html                      ← src/hub.html (tela inicial do dia a dia, sem nada embutido)
- ferias/ferias.html            ← src/ferias.html (Mapa de Férias montado: fonte da cópia na Central e dos testes; não vai no pacote, ADR-0036)
- Central (gestao_pessoal_v*.html, a mais nova) ← cópia do Mapa de Férias embutida em #feriasEmb: a página Férias (ADR-0033)
- inicio.html                   ← src/inicio.html (+ Finanças do Time, Finanças do Grupo, Central, Quadro e Hub embutidos)

Os HTMLs embutidos vão em gzip + base64 dentro de <script type="text/plain" id="...">.
Rode de novo sempre que a Central (gestao_pessoal_v*.html, a mais nova) ou o Quadro mudarem.
Na Central, este script só troca o bloco #feriasEmb; no Quadro, nada.
"""
import base64, gzip, hashlib, pathlib, re


def gzip_estavel(dados: bytes) -> bytes:
    """gzip com cabeçalho fixo (mtime 0, sem nome, OS=255): o mesmo resultado em qualquer versão do Python.
    gzip.compress muda bytes do cabeçalho entre o 3.12 e o 3.13, e a CI compara os HTMLs montados."""
    import struct, zlib
    c = zlib.compressobj(9, zlib.DEFLATED, -15, 8, 0)
    corpo = c.compress(dados) + c.flush()
    return b'\x1f\x8b\x08\x00\x00\x00\x00\x00\x02\xff' + corpo + struct.pack('<II', zlib.crc32(dados) & 0xffffffff, len(dados) & 0xffffffff)

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SRC = RAIZ / 'financas' / 'src'

def central():
    cs = sorted(RAIZ.glob('gestao_pessoal_v*.html'), key=lambda p: int(re.search(r'v(\d+)', p.name).group(1)))
    return cs[-1]

def tema(html):
    """Põe (ou troca) <script id="tema"> com financas/src/tema.js logo antes do primeiro </head>.
    Fica no <head> para o tema escuro valer antes da primeira pintura, sem piscar em branco."""
    js = (SRC / 'tema.js').read_text(encoding='utf-8')
    assert '</script' not in js.lower()
    tag = f'<script id="tema">\n{js}</script>'
    if '<script id="tema">' in html:
        return visual(sessao(re.sub(r'<script id="tema">.*?</script>', lambda m: tag, html, count=1, flags=re.S)))
    i = html.index('</head>')
    return visual(sessao(html[:i] + tag + '\n' + html[i:]))

# ---- Marca Remessa (ADR-0037) e visual experimental (ADR-0034) ----
# O ícone da aba (financas/src/icones/, um por ferramenta, com o lacre azul da Remessa no canto) entra em todos os HTMLs,
# inclusive nas cópias embutidas. identidade.css só existe na cópia temporária que
# tools/build_experimental.py monta (vinda de experimental/src/): aí cada HTML ganha também o visual novo.
ICONES = {'Central de Gestão': 'central', 'Quadro do Time': 'quadro', 'Hub da solução': 'hub',
          'Início da solução': 'inicio', 'Finanças do Time': 'financas-time',
          'Finanças do Grupo': 'financas-grupo', 'Mapa de Férias': 'ferias'}

def visual(html):
    if (SRC / 'identidade.css').exists():
        css = (SRC / 'identidade.css').read_text(encoding='utf-8')
        for nome in re.findall(r'/\*FONTE:([\w.-]+)\*/', css):
            b64 = base64.b64encode((SRC / 'fontes' / nome).read_bytes()).decode('ascii')
            css = css.replace(f'/*FONTE:{nome}*/', f'url(data:font/woff2;base64,{b64}) format("woff2")')
        assert '</style' not in css.lower()
        html = re.sub(r'<style id="identidade">.*?</style>\n?', '', html, count=1, flags=re.S)
        i = html.index('<script id="tema">')
        html = html[:i] + f'<style id="identidade">\n{css}</style>\n' + html[i:]
    if (SRC / 'icones').is_dir():
        from urllib.parse import quote
        i = html.index('</head>')
        t = re.search(r'<title>([^<]*)</title>', html[:i])
        nome = next((v for k, v in ICONES.items() if t and t.group(1).strip().startswith(k)), None)
        assert nome, f'sem ícone para o título {t.group(1) if t else None!r}: inclua em ICONES'
        svg = (SRC / 'icones' / f'{nome}.svg').read_text(encoding='utf-8').strip()
        href = 'data:image/svg+xml,' + quote(svg, safe=" =:/'")  # aspas duplas viram %22: o href fica entre aspas duplas
        html = re.sub(r'<link rel="icon" id="favicon"[^>]*>\n?', '', html, count=1)
        i = html.index('</head>')
        html = html[:i] + f'<link rel="icon" id="favicon" type="image/svg+xml" href="{href}">\n' + html[i:]
    return html

def sessao(html):
    """Põe (ou troca) <script id="sessao"> com financas/src/sessao.js logo depois do tema: uma senha por sessão (ADR-0029)."""
    js = (SRC / 'sessao.js').read_text(encoding='utf-8')
    assert '</script' not in js.lower()
    tag = f'<script id="sessao">\n{js}</script>'
    if '<script id="sessao">' in html:
        return re.sub(r'<script id="sessao">.*?</script>', lambda m: tag, html, count=1, flags=re.S)
    i = html.index('</head>')
    return html[:i] + tag + '\n' + html[i:]

def nucleo(html):
    css = (SRC / 'nucleo.css').read_text(encoding='utf-8')
    js = (SRC / 'nucleo.js').read_text(encoding='utf-8')
    assert '/*NUCLEO-CSS*/' in html and '/*NUCLEO-JS*/' in html
    return tema(html.replace('/*NUCLEO-CSS*/', css, 1).replace('/*NUCLEO-JS*/', js, 1))

def embutir(html, ident, conteudo: bytes, versao=''):
    b64 = base64.b64encode(gzip_estavel(conteudo)).decode('ascii')
    sha = hashlib.sha256(conteudo).hexdigest()[:16]
    bloco = f'<script type="text/plain" id="{ident}" data-version="{versao}" data-sha256="{sha}">{b64}</script>'
    marca = f'<!--EMB:{ident}-->'
    assert marca in html, marca
    return html.replace(marca, bloco, 1), len(b64)

def versao(txt):
    m = re.search(r"TOOL_VERSION = '([^']+)'", txt)
    return m.group(1) if m else ''

def embutir_ferias_na_central(fer):
    """Põe (ou troca) a cópia do Mapa de Férias dentro da Central, antes do </body> (ADR-0033)."""
    c = central(); txt = c.read_text(encoding='utf-8'); dados = fer.encode('utf-8')
    b64 = base64.b64encode(gzip_estavel(dados)).decode('ascii'); sha = hashlib.sha256(dados).hexdigest()[:16]
    bloco = f'<script type="text/plain" id="feriasEmb" data-version="{versao(fer)}" data-sha256="{sha}">{b64}</script>'
    if 'id="feriasEmb"' in txt:
        txt = re.sub(r'<script type="text/plain" id="feriasEmb"[^>]*>[^<]*</script>', lambda m: bloco, txt, count=1)
    else:
        i = txt.rindex('</body>'); txt = txt[:i] + bloco + '\n' + txt[i:]
    c.write_text(txt, encoding='utf-8')

def main():
    tempo = nucleo((SRC / 'time.html').read_text(encoding='utf-8'))
    (RAIZ / 'financas' / 'financas_time.html').write_text(tempo, encoding='utf-8')
    grupo = nucleo((SRC / 'grupo.html').read_text(encoding='utf-8'))
    grupo, _ = embutir(grupo, 'finTimeEmb', tempo.encode('utf-8'), versao(tempo))
    (RAIZ / 'financas' / 'financas_grupo.html').write_text(grupo, encoding='utf-8')
    hub = nucleo((SRC / 'hub.html').read_text(encoding='utf-8'))
    (RAIZ / 'hub.html').write_text(hub, encoding='utf-8')
    fer = nucleo((SRC / 'ferias.html').read_text(encoding='utf-8'))
    (RAIZ / 'ferias').mkdir(exist_ok=True)
    (RAIZ / 'ferias' / 'ferias.html').write_text(fer, encoding='utf-8')
    embutir_ferias_na_central(fer)
    ini = nucleo((SRC / 'inicio.html').read_text(encoding='utf-8'))
    c = central(); q = RAIZ / 'ferramenta-time' / 'quadro_do_time_v1.html'
    ini, _ = embutir(ini, 'finTimeEmb', tempo.encode('utf-8'), versao(tempo))
    ini, _ = embutir(ini, 'finGrupoEmb', grupo.encode('utf-8'), versao(grupo))
    ini, _ = embutir(ini, 'centralEmb', c.read_bytes(), c.stem)
    ini, _ = embutir(ini, 'quadroEmb', q.read_bytes(), versao(q.read_text(encoding='utf-8')))
    ini, _ = embutir(ini, 'hubEmb', hub.encode('utf-8'), versao(hub))
    (RAIZ / 'inicio.html').write_text(ini, encoding='utf-8')
    for p in [RAIZ / 'financas' / 'financas_time.html', RAIZ / 'financas' / 'financas_grupo.html', RAIZ / 'hub.html', RAIZ / 'ferias' / 'ferias.html', RAIZ / 'inicio.html']:
        print(f'{p.relative_to(RAIZ)}: {p.stat().st_size // 1024} KB')
    print(f'Central embutida: {c.name}; Quadro: {q.name}')

if __name__ == '__main__':
    main()

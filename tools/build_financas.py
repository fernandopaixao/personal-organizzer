#!/usr/bin/env python3
"""Monta as ferramentas de finanças e o assistente inicial a partir de financas/src/.

    python3 tools/build_financas.py

- injeta o núcleo comum (financas/src/nucleo.css e nucleo.js) em cada HTML;
- financas/financas_time.html   ← src/time.html
- financas/financas_grupo.html  ← src/grupo.html (+ Finanças do Time embutido, para gerar o HTML de cada time)
- inicio.html                   ← src/inicio.html (+ Finanças do Time, Finanças do Grupo, Central e Quadro embutidos)

Os HTMLs embutidos vão em gzip + base64 dentro de <script type="text/plain" id="...">.
Rode de novo sempre que a Central (gestao_pessoal_v*.html, a mais nova) ou o Quadro mudarem.
Este script só lê a Central e o Quadro; não altera esses arquivos.
"""
import base64, gzip, hashlib, pathlib, re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SRC = RAIZ / 'financas' / 'src'

def central():
    cs = sorted(RAIZ.glob('gestao_pessoal_v*.html'), key=lambda p: int(re.search(r'v(\d+)', p.name).group(1)))
    return cs[-1]

def nucleo(html):
    css = (SRC / 'nucleo.css').read_text(encoding='utf-8')
    js = (SRC / 'nucleo.js').read_text(encoding='utf-8')
    assert '/*NUCLEO-CSS*/' in html and '/*NUCLEO-JS*/' in html
    return html.replace('/*NUCLEO-CSS*/', css, 1).replace('/*NUCLEO-JS*/', js, 1)

def embutir(html, ident, conteudo: bytes, versao=''):
    b64 = base64.b64encode(gzip.compress(conteudo, 9, mtime=0)).decode('ascii')
    sha = hashlib.sha256(conteudo).hexdigest()[:16]
    bloco = f'<script type="text/plain" id="{ident}" data-version="{versao}" data-sha256="{sha}">{b64}</script>'
    marca = f'<!--EMB:{ident}-->'
    assert marca in html, marca
    return html.replace(marca, bloco, 1), len(b64)

def versao(txt):
    m = re.search(r"TOOL_VERSION = '([^']+)'", txt)
    return m.group(1) if m else ''

def main():
    tempo = nucleo((SRC / 'time.html').read_text(encoding='utf-8'))
    (RAIZ / 'financas' / 'financas_time.html').write_text(tempo, encoding='utf-8')
    grupo = nucleo((SRC / 'grupo.html').read_text(encoding='utf-8'))
    grupo, _ = embutir(grupo, 'finTimeEmb', tempo.encode('utf-8'), versao(tempo))
    (RAIZ / 'financas' / 'financas_grupo.html').write_text(grupo, encoding='utf-8')
    ini = nucleo((SRC / 'inicio.html').read_text(encoding='utf-8'))
    c = central(); q = RAIZ / 'ferramenta-time' / 'quadro_do_time_v1.html'
    ini, _ = embutir(ini, 'finTimeEmb', tempo.encode('utf-8'), versao(tempo))
    ini, _ = embutir(ini, 'finGrupoEmb', grupo.encode('utf-8'), versao(grupo))
    ini, _ = embutir(ini, 'centralEmb', c.read_bytes(), c.stem)
    ini, _ = embutir(ini, 'quadroEmb', q.read_bytes(), versao(q.read_text(encoding='utf-8')))
    (RAIZ / 'inicio.html').write_text(ini, encoding='utf-8')
    for p in [RAIZ / 'financas' / 'financas_time.html', RAIZ / 'financas' / 'financas_grupo.html', RAIZ / 'inicio.html']:
        print(f'{p.relative_to(RAIZ)}: {p.stat().st_size // 1024} KB')
    print(f'Central embutida: {c.name}; Quadro: {q.name}')

if __name__ == '__main__':
    main()

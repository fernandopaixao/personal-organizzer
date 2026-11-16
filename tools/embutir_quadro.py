#!/usr/bin/env python3
"""Embute o Quadro do Time (ferramenta-time/quadro_do_time_v1.html) na Central de Gestão.

A Central gera o "HTML do time" a partir desta cópia embutida (gzip + base64 no
elemento <script type="text/plain" id="quadroEmb">). Rode sempre que o Quadro mudar:

    python3 tools/embutir_quadro.py
"""
import base64, gzip, hashlib, pathlib, re, sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
QUADRO = RAIZ / 'ferramenta-time' / 'quadro_do_time_v1.html'
CENTRAL = RAIZ / 'gestao_pessoal_v14.html'

def main():
    q = QUADRO.read_bytes()
    txt = q.decode('utf-8')
    if '/*QUADRO-PRESET*/' not in txt:
        sys.exit('O Quadro não tem o marcador /*QUADRO-PRESET*/ (precisa da versão 1.1 ou mais nova).')
    ver = re.search(r"TOOL_VERSION = '([^']+)'", txt).group(1)
    b64 = base64.b64encode(gzip.compress(q, 9, mtime=0)).decode('ascii')
    sha = hashlib.sha256(q).hexdigest()[:16]
    bloco = f'<script type="text/plain" id="quadroEmb" data-version="{ver}" data-sha256="{sha}">{b64}</script>'
    c = CENTRAL.read_text(encoding='utf-8')
    if 'id="quadroEmb"' in c:
        c = re.sub(r'<script type="text/plain" id="quadroEmb"[^>]*>[^<]*</script>', lambda m: bloco, c, count=1)
    else:
        i = c.rindex('</body>')
        c = c[:i] + bloco + '\n' + c[i:]
    CENTRAL.write_text(c, encoding='utf-8')
    print(f'Quadro {ver} ({len(q)//1024} KB, gzip+base64 {len(b64)//1024} KB, sha256 {sha}) embutido em {CENTRAL.name}')

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Injeta o bloco comum de segurança (financas/src/seguranca.js: aviso de cofre, lembrete de teste
da senha e "Onde estou?") e os ganchos de cada ferramenta na Central e no Quadro do Time.

    python3 tools/injetar_seguranca.py

- Central (gestao_pessoal_v*.html mais nova): <script id="f4seg"> + <script id="f4central"> (financas/src/central-f4.js)
- Quadro (ferramenta-time/quadro_do_time_v1.html): <script id="f4seg"> + <script id="f4quadro"> (financas/src/quadro-f4.js)
  + <script id="f5postits"> (financas/src/quadro-postits.js: post-its recebidos do Hub)
Também injeta no <head> das duas o tema claro/escuro/automático (<script id="tema">, financas/src/tema.js)
e o ícone da aba (<link id="favicon">, financas/src/icones/).
Pode rodar quantas vezes quiser: os blocos são substituídos. Depois atualiza a cópia do Quadro embutida
na Central (tools/embutir_quadro.py) e remonta finanças e assistente (tools/build_financas.py).
"""
import pathlib, re, subprocess, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from build_financas import tema  # noqa: E402

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SRC = RAIZ / 'financas' / 'src'

def injetar(arq, blocos):
    s = arq.read_text(encoding='utf-8')
    for ident, fonte in blocos:
        js = (SRC / fonte).read_text(encoding='utf-8')
        assert '</script' not in js.lower()
        tag = f'<script id="{ident}">\n{js}</script>'
        if f'<script id="{ident}">' in s:
            s = re.sub(rf'<script id="{ident}">.*?</script>', lambda m: tag, s, count=1, flags=re.S)
        else:
            i = s.rindex('</body>'); s = s[:i] + tag + '\n' + s[i:]
    s = tema(s)
    arq.write_text(s, encoding='utf-8')
    print('ok', arq.relative_to(RAIZ))

def main():
    cs = sorted(RAIZ.glob('gestao_pessoal_v*.html'), key=lambda p: int(re.search(r'v(\d+)', p.name).group(1)))
    injetar(RAIZ / 'ferramenta-time' / 'quadro_do_time_v1.html', [('f4seg', 'seguranca.js'), ('f4quadro', 'quadro-f4.js'), ('f5postits', 'quadro-postits.js')])
    injetar(cs[-1], [('f4seg', 'seguranca.js'), ('f4central', 'central-f4.js')])
    for t in ['embutir_quadro.py', 'build_financas.py']:
        subprocess.run([sys.executable, str(RAIZ / 'tools' / t)], check=True)

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Monta a versão experimental (visual novo) das ferramentas a partir das fontes do main (ADR-0034).

    python3 tools/build_experimental.py                  → dist/experimental/ (7 HTMLs)
    python3 tools/build_experimental.py --testar         → monta e roda os testes do repositório nela
    python3 tools/build_experimental.py --saida PASTA    → monta em outra pasta

Como funciona (nada é editado no repositório):
1. copia o repositório para uma pasta temporária;
2. aplica experimental/src/trocas.json (cores e fontes antigas → novas) na Central, no Quadro e em financas/src/;
3. copia experimental/src/identidade.css, fontes/ e icones/ para financas/src/ da cópia;
4. roda o build de sempre (tools/injetar_seguranca.py) na cópia: a função visual() de build_financas.py
   injeta a identidade e o ícone da aba em cada HTML, inclusive nas cópias embutidas;
5. copia os HTMLs montados para a saída.

Assim a versão experimental tem sempre as mesmas funcionalidades do main: só o visual muda.
Com --testar, os testes de ponta a ponta, do Mapa de Férias e do aviso sem pastas rodam na cópia
(com os fundos esperados do visual novo, trocas "teste" de trocas.json).
"""
import json, pathlib, re, shutil, subprocess, sys, tempfile

RAIZ = pathlib.Path(__file__).resolve().parent.parent
EXP = RAIZ / 'experimental' / 'src'
IGNORAR = shutil.ignore_patterns('.git', 'dist', 'node_modules', 'saida', '__pycache__', 'experimental')
TESTES = ['financas/testes/teste-e2e.js', 'financas/testes/teste-ferias.js', 'financas/testes/teste-navegador.js']


def central(raiz):
    cs = sorted(raiz.glob('gestao_pessoal_v*.html'), key=lambda p: int(re.search(r'v(\d+)', p.name).group(1)))
    return cs[-1]


def saidas(raiz):
    """Arquivo no pacote experimental → arquivo montado na cópia."""
    c = central(raiz)
    return {
        'hub.html': raiz / 'hub.html',
        'inicio.html': raiz / 'inicio.html',
        c.name: c,
        'quadro_do_time_v1.html': raiz / 'ferramenta-time' / 'quadro_do_time_v1.html',
        'financas_grupo.html': raiz / 'financas' / 'financas_grupo.html',
        'financas_time.html': raiz / 'financas' / 'financas_time.html',
        'ferias.html': raiz / 'ferias' / 'ferias.html',
    }


def trocador(trocas):
    cores = {k.lower(): v for k, v in trocas['cores'].items()}
    # Uma passada só (sem cadeias): '#abc' não pode casar com o começo de '#abcdef'.
    rx = re.compile('|'.join(re.escape(k) + (r'(?![0-9a-fA-F])' if k.startswith('#') else '')
                             for k in sorted(cores, key=len, reverse=True)), re.I)

    def aplicar(txt):
        txt = rx.sub(lambda m: cores[m.group(0).lower()], txt)
        for de, para in trocas['textos']:
            txt = txt.replace(de, para)
        return txt
    return aplicar


def montar(saida, testar=False, manter=False):
    trocas = json.loads((EXP / 'trocas.json').read_text(encoding='utf-8'))
    aplicar = trocador(trocas)
    tmp = pathlib.Path(tempfile.mkdtemp(prefix='gestao-experimental-'))
    copia = tmp / 'repo'
    try:
        shutil.copytree(RAIZ, copia, ignore=IGNORAR)
        src = copia / 'financas' / 'src'
        alvos = [central(copia), copia / 'ferramenta-time' / 'quadro_do_time_v1.html']
        alvos += [p for p in src.rglob('*') if p.suffix in ('.html', '.js', '.css')]
        for p in alvos:
            p.write_text(aplicar(p.read_text(encoding='utf-8')), encoding='utf-8')
        shutil.copy2(EXP / 'identidade.css', src / 'identidade.css')
        shutil.copytree(EXP / 'fontes', src / 'fontes')
        shutil.copytree(EXP / 'icones', src / 'icones')
        subprocess.run([sys.executable, str(copia / 'tools' / 'injetar_seguranca.py')], check=True, stdout=subprocess.DEVNULL)
        saida = pathlib.Path(saida); saida.mkdir(parents=True, exist_ok=True)
        for nome, p in saidas(copia).items():
            html = p.read_text(encoding='utf-8')
            assert '<style id="identidade">' in html and 'id="favicon"' in html, f'{nome} saiu sem o visual novo'
            shutil.copy2(p, saida / nome)
        falhas = []
        if testar:
            t = copia / 'financas' / 'testes' / 'teste-e2e.js'
            txt = t.read_text(encoding='utf-8')
            for de, para in trocas['teste']:
                txt = txt.replace(de, para)
            t.write_text(txt, encoding='utf-8')
            for teste in TESTES:
                print(f'== {teste} (experimental)', flush=True)
                r = subprocess.run(['node', str(copia / teste)], cwd=copia)
                if r.returncode:
                    falhas.append(teste)
        if manter:
            print(f'cópia montada mantida em {copia}')
        return falhas
    finally:
        if not manter:
            shutil.rmtree(tmp, ignore_errors=True)


def main():
    args = sys.argv[1:]
    saida = RAIZ / 'dist' / 'experimental'
    if '--saida' in args:
        saida = pathlib.Path(args[args.index('--saida') + 1]).resolve()
    falhas = montar(saida, testar='--testar' in args, manter='--manter' in args)
    for p in sorted(saida.glob('*.html')):
        print(f'{p.relative_to(RAIZ) if p.is_relative_to(RAIZ) else p}: {p.stat().st_size // 1024} KB')
    if falhas:
        sys.exit('Falharam na versão experimental: ' + ', '.join(falhas))


if __name__ == '__main__':
    main()

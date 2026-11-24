#!/usr/bin/env python3
"""Gera o pacote .zip autossuficiente da solução, para levar para a empresa sem passar por repositório.

    python3 tools/empacotar.py            → dist/gestao-solucao-AAAA-MM-DD.zip

O pacote tem uma pasta só, com todos os HTMLs lado a lado (o hub abre as ferramentas por link
relativo, então elas precisam estar na mesma pasta), os contratos e a documentação de uso.
Não leva dados: nenhum arquivo .json de dados é incluído. Rode antes o build
(python3 tools/injetar_seguranca.py) para que as cópias embutidas estejam em dia.
"""
import datetime, pathlib, re, sys, zipfile

RAIZ = pathlib.Path(__file__).resolve().parent.parent

def central():
    cs = sorted(RAIZ.glob('gestao_pessoal_v*.html'), key=lambda p: int(re.search(r'v(\d+)', p.name).group(1)))
    return cs[-1]

def main():
    hoje = datetime.date.today().isoformat()
    nome = f'gestao-solucao-{hoje}'
    arquivos = {
        'hub.html': RAIZ / 'hub.html',
        'inicio.html': RAIZ / 'inicio.html',
        central().name: central(),
        'quadro_do_time_v1.html': RAIZ / 'ferramenta-time' / 'quadro_do_time_v1.html',
        'financas_grupo.html': RAIZ / 'financas' / 'financas_grupo.html',
        'financas_time.html': RAIZ / 'financas' / 'financas_time.html',
    }
    for f in sorted((RAIZ / 'financas' / 'contrato').iterdir()):
        arquivos[f'contrato/{f.name}'] = f
    for d in ['passo-a-passo.md', 'funcionalidades.md', 'jornada-do-usuario.md', 'visao-geral-da-solucao.md']:
        arquivos[f'docs/{d}'] = RAIZ / 'docs' / d
    arquivos['docs/guia-adaptacao-times.md'] = RAIZ / 'ferramenta-time' / 'guia-adaptacao-times.md'
    faltam = [k for k, p in arquivos.items() if not p.exists()]
    if faltam:
        sys.exit('Faltam arquivos: ' + ', '.join(faltam))
    leia = f"""Solução de gestão · pacote de {hoje}

1. Copie esta pasta para uma pasta LOCAL, fora do OneDrive (ex.: C:\\Users\\voce\\GestaoLocal).
2. Primeira vez: abra inicio.html no Edge ou Chrome e siga o assistente.
   Já usa a solução: substitua os HTMLs antigos por estes e abra os mesmos arquivos de dados
   (a migração é automática e baixa um backup).
3. Depois, abra sempre o hub.html: ele leva às outras ferramentas.

Este pacote não contém dados. Senhas e chaves ficam no seu cofre de senhas.
Guia completo: docs/passo-a-passo.md
"""
    saida = RAIZ / 'dist'; saida.mkdir(exist_ok=True)
    zipf = saida / f'{nome}.zip'
    with zipfile.ZipFile(zipf, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr(f'{nome}/LEIA-ME.txt', leia)
        for k, p in arquivos.items():
            z.write(p, f'{nome}/{k}')
    print(f'{zipf.relative_to(RAIZ)}: {zipf.stat().st_size // 1024} KB, {len(arquivos) + 1} arquivos')

if __name__ == '__main__':
    main()

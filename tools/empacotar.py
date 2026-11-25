#!/usr/bin/env python3
"""Gera o pacote .zip autossuficiente da solução, para levar para a empresa sem passar por repositório.

    python3 tools/empacotar.py            → dist/gestao-solucao-AAAA-MM-DD.zip

O pacote tem uma pasta só, com todos os HTMLs lado a lado (o hub abre as ferramentas por link
relativo, então elas precisam estar na mesma pasta), os contratos (contratos/), a documentação de uso
e a pasta experimental/ com as mesmas ferramentas no visual novo (tools/build_experimental.py, ADR-0034).
Não leva dados: nenhum arquivo .json de dados é incluído. Rode antes o build
(python3 tools/injetar_seguranca.py) para que as cópias embutidas estejam em dia.
"""
import datetime, pathlib, re, sys, tempfile, zipfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from build_experimental import montar as montar_experimental  # noqa: E402

RAIZ = pathlib.Path(__file__).resolve().parent.parent

def central():
    cs = sorted(RAIZ.glob('gestao_pessoal_v*.html'), key=lambda p: int(re.search(r'v(\d+)', p.name).group(1)))
    return cs[-1]

def main():
    hoje = datetime.date.today().isoformat()
    nome = f'gestao-solucao-{hoje}'
    arquivos = {
        'hub.html': RAIZ / 'hub.html',
        'apresentacao.html': RAIZ / 'apresentacao.html',
        'inicio.html': RAIZ / 'inicio.html',
        central().name: central(),
        'quadro_do_time_v1.html': RAIZ / 'ferramenta-time' / 'quadro_do_time_v1.html',
        'financas_grupo.html': RAIZ / 'financas' / 'financas_grupo.html',
        'financas_time.html': RAIZ / 'financas' / 'financas_time.html',
        # Sem ferias.html: as férias ficam na página Férias da Central e só o gestor cadastra (ADR-0036).
    }
    # Pasta de contratos inteira (ADR-0032): especificação, schemas, referência de cripto, validador,
    # vetores e exemplos com chaves públicas. Fica de fora só o teste do repositório (precisa do Playwright).
    for f in sorted((RAIZ / 'contratos').rglob('*')):
        rel = f.relative_to(RAIZ).as_posix()
        if f.is_file() and not rel.startswith('contratos/testes/'):
            arquivos[rel] = f
    for f in sorted((RAIZ / 'docs' / 'adr').glob('*.md')):
        arquivos[f'docs/adr/{f.name}'] = f
    for d in ['passo-a-passo.md', 'funcionalidades.md', 'jornada-do-usuario.md', 'visao-geral-da-solucao.md']:
        arquivos[f'docs/{d}'] = RAIZ / 'docs' / d
    arquivos['docs/guia-adaptacao-times.md'] = RAIZ / 'ferramenta-time' / 'guia-adaptacao-times.md'
    # Versão experimental (ADR-0034): montada agora, a partir das mesmas fontes, numa pasta temporária.
    tmp = pathlib.Path(tempfile.mkdtemp(prefix='gestao-pacote-'))
    montar_experimental(tmp)
    for f in sorted(tmp.glob('*.html')):
        arquivos[f'experimental/{f.name}'] = f
    faltam = [k for k, p in arquivos.items() if not p.exists()]
    if faltam:
        sys.exit('Faltam arquivos: ' + ', '.join(faltam))
    leia = f"""Solução de gestão · pacote de {hoje}

1. Copie esta pasta para uma pasta LOCAL, fora do OneDrive (ex.: C:\\Users\\voce\\GestaoLocal).
2. Primeira vez: abra inicio.html no Edge ou Chrome e siga o assistente.
   Já usa a solução: substitua os HTMLs antigos por estes e abra os mesmos arquivos de dados
   (a migração é automática e baixa um backup).
3. Depois, abra sempre o hub.html: ele leva às outras ferramentas.

Quer experimentar o visual novo? Abra experimental/hub.html (ou experimental/inicio.html).
São as mesmas ferramentas, com os mesmos arquivos de dados, só com outro visual.
Para voltar, abra de novo o hub.html desta pasta.

Este pacote não contém dados. Senhas e chaves ficam no seu cofre de senhas.
Guia completo: docs/passo-a-passo.md
Outra solução precisa gerar arquivos que a solução lê (até a visão da liderança)?
Entregue a pasta contratos/ (comece por contratos/LEIA-ME.md).
"""
    saida = RAIZ / 'dist'; saida.mkdir(exist_ok=True)
    zipf = saida / f'{nome}.zip'
    with zipfile.ZipFile(zipf, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr(f'{nome}/LEIA-ME.txt', leia)
        for k, p in arquivos.items():
            z.write(p, f'{nome}/{k}')
    for f in tmp.glob('*'):
        f.unlink()
    tmp.rmdir()
    print(f'{zipf.relative_to(RAIZ)}: {zipf.stat().st_size // 1024} KB, {len(arquivos) + 1} arquivos')

if __name__ == '__main__':
    main()

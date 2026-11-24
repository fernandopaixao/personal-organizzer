/* ---------- Central · aviso de cofre, lembrete de teste da senha e "Onde estou?" ---------- */
function f4infoCentral() {
  return { ferramenta: 'Central de Gestão', versao: 'v' + (typeof APP_VERSION !== 'undefined' ? APP_VERSION : DB_VERSION), arquivo: handle?.name || (db ? 'aberto sem vínculo (salvar baixa uma cópia)' : ''), pastaComum: (typeof IG !== 'undefined' && IG.dirName) || '',
    local: ['Seu arquivo de dados (cifrado com a senha), numa pasta fora do OneDrive', 'As chaves dos times (dentro do arquivo cifrado)'],
    comum: ['central/catalogo-<time>.json: iniciativas e features de cada time', 'Leitura de times/<time>/status.json e metricas.json'] };
}
{
  const enter0 = enter;
  enter = function () {
    const r = enter0.apply(this, arguments);
    f4BotaoOnde('ondeEstou', f4infoCentral);
    setTimeout(() => f4LembreteSenha('central:' + (handle?.name || 'arquivo'), async s => s === password), 1500);
    return r;
  };
}

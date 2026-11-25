/* visual 1.0 · liga e desliga o visual experimental pela tela de entrada (ADR-0038)
   Injetado pelo build no <head> de todas as ferramentas, antes do tema e da senha por sessão. O build troca
   EXP pelo valor certo: true só nos HTMLs montados por tools/build_experimental.py (pasta experimental/ do pacote).
   - A escolha fica neste navegador (localStorage 'remessa-visual': 'experimental' ou 'atual'). Abrir uma ferramenta
     da pasta experimental/ já conta como escolher o experimental.
   - Uma ferramenta do visual atual, com o experimental escolhido, abre a versão experimental dela (location.replace),
     mas só quando essa versão já abriu antes neste navegador (lista 'remessa-visual-vistas'). Nunca leva a um
     arquivo que não existe; se a pasta experimental/ sumir, basta abrir com ?visual=atual no fim do endereço.
   - O par de cada ferramenta: o mesmo nome na outra pasta; para as que o assistente gera com outro nome e sem
     configuração embutida (Central, Hub, Finanças do Grupo, Início), o nome do pacote. Quadro e Finanças do Time
     gerados para um time levam a configuração do time no próprio HTML: esses não trocam (a cópia genérica abriria sem ela).
   Os dados são os mesmos nas duas versões: nada aqui toca em arquivo de dados. */
(() => {
  if (window.remessaVisual) return;
  const EXP = /*EXP*/false;
  const K = 'remessa-visual', KV = 'remessa-visual-vistas', KP = 'remessa-visual-par';
  const PACOTE = { 'Central de Gestão': '{{CENTRAL}}', 'Hub da solução': 'hub.html', 'Início da solução': 'inicio.html', 'Finanças do Grupo': 'financas_grupo.html', 'Remessa': 'apresentacao.html' };
  const ler = (k, padrao) => { try { const v = localStorage.getItem(k); return v == null ? padrao : JSON.parse(v); } catch { return padrao; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  let embutido = false; try { embutido = window.top !== window; } catch { embutido = true; }
  const partes = decodeURIComponent(location.pathname).split('/');
  const nome = partes.at(-1) || '', pasta = partes.at(-2) || '';
  const naPastaExp = EXP && pasta === 'experimental';
  const titulo = () => (document.title || '').split('·')[0].trim();
  const url = rel => { try { return new URL(rel, location.href).href.split(/[?#]/)[0]; } catch { return ''; } };
  // O par desta página na outra versão (endereço completo), ou '' quando não há par seguro.
  function par() {
    if (embutido || !/\.html?$/i.test(nome)) return '';
    const pares = ler(KP, {}), aqui = url(nome);
    if (pares[aqui]) return pares[aqui];
    if (EXP) return naPastaExp ? url('../' + nome) : '';   // experimental fora da pasta experimental/: sem par conhecido
    const arq = Object.entries(PACOTE).find(([t]) => titulo().startsWith(t))?.[1];
    if (arq) return url('experimental/' + arq);
    // Quadro e Finanças do Time: só a cópia do pacote (mesmo nome) troca; a gerada para um time leva a configuração dele.
    return ['quadro_do_time_v1.html', 'financas_time.html'].includes(nome) ? url('experimental/' + nome) : '';
  }
  const params = new URLSearchParams(location.search);
  if (params.get('visual') === 'atual') gravar(K, 'atual');
  const escolhido = () => ler(K, 'atual');
  if (naPastaExp && !embutido) {
    const vistas = ler(KV, []), aqui = url(nome);
    if (!vistas.includes(aqui)) gravar(KV, [aqui, ...vistas].slice(0, 60));
    if (escolhido() !== 'experimental') gravar(K, 'experimental');
  }
  // Visual atual com o experimental escolhido: abre a versão experimental, se ela já abriu antes neste navegador.
  if (!EXP && !embutido && escolhido() === 'experimental' && params.get('visual') !== 'atual') {
    const alvo = par();
    // __remessaTroca: a senha por sessão não pede a senha ao abridor nesta página, e sim na que abre em seguida.
    if (alvo && ler(KV, []).includes(alvo)) { window.__remessaTroca = true; location.replace(alvo + location.search + location.hash); }
  }
  window.remessaVisual = {
    experimental: EXP, naPastaExp,
    get escolhido() { return escolhido(); },
    par,
    // Nome no pacote da ferramenta com este título, quando ela não leva configuração embutida (Central, Hub, Grupo, Início).
    pacote: t => Object.entries(PACOTE).find(([k]) => String(t || '').startsWith(k))?.[1] || '',
    // Troca de visual pela tela de entrada: lembra a escolha e abre a outra versão na mesma aba.
    trocar() {
      const alvo = par(); if (!alvo) return false;
      const pares = ler(KP, {}); pares[alvo] = url(nome); gravar(KP, pares);
      gravar(K, EXP ? 'atual' : 'experimental');
      location.assign(alvo);
      return true;
    }
  };
})();

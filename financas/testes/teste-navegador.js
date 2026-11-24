// Teste do aviso "daqui não dá para abrir pastas" (ADR-0030) nas ferramentas que leem pastas:
// Hub, Finanças do Time, Finanças do Grupo, Mapa de Férias e assistente inicial.
// Uso: node financas/testes/teste-navegador.js   (precisa do Playwright e do Chromium instalados)
//
// Simula os lugares onde a função de abrir pastas falta ou é recusada (Safari, Firefox, celular,
// pré-visualização dentro de outra página, site) e confere que:
//  - a tela inicial diz o motivo e o que fazer;
//  - todo botão que precisa de pastas responde ao clique (o aviso pisca ou abre uma explicação);
//  - no Chromium normal, aberto pelo arquivo (file://), não há aviso e os botões seguem;
//  - aberto de dentro do .zip (pasta temporária), aparece o aviso para extrair, mas tudo funciona.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..');
let falhas = 0;
const ok = (c, msg) => { console.log((c ? '  ok  ' : '  FALHOU  ') + msg); if (!c) falhas++; };

const FERRAMENTAS = [
  { arq: 'hub.html', botoes: ['#iAbrir', '#iNovo'] },
  { arq: 'financas/financas_time.html', botoes: ['#iAbrir', '#iNovo'] },
  { arq: 'financas/financas_grupo.html', botoes: ['#iAbrir', '#iNovo'] },
  { arq: 'ferias/ferias.html', botoes: ['#iAbrir', '#iTime', '#iGrupo'] },
  { arq: 'inicio.html', botoes: ['#prox'] },
];
const UA = {
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
  celular: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
};
const semApi = 'delete window.showDirectoryPicker; delete Window.prototype.showDirectoryPicker;';

// Um clique "respondeu" quando o aviso piscou ou abriu uma explicação.
async function respondeu(frame) {
  return frame.evaluate(() => !!document.querySelector('#avisoFS.pisca') || /abrir pastas|abrir a pasta/i.test(document.querySelector('dialog[open]')?.innerText || ''));
}
async function limpar(frame) {
  await frame.evaluate(() => { document.querySelector('#avisoFS')?.classList.remove('pisca'); const d = document.querySelector('dialog[open]'); if (d) d.close(); });
}
async function conferirSemApi(frame, t, rotulo, espera) {
  const aviso = await frame.locator('#avisoFS').innerText().catch(() => '');
  ok(espera.test(aviso), `${t.arq} (${rotulo}): o aviso diz o motivo`);
  for (const b of t.botoes) {
    await limpar(frame);
    await frame.click(b);
    await frame.waitForTimeout(150);
    ok(await respondeu(frame), `${t.arq} (${rotulo}): o botão ${b} responde ao clique`);
  }
}

(async () => {
  const browser = await chromium.launch();

  // 1) Navegadores sem a função: Safari, Firefox e celular, abrindo o arquivo direto.
  for (const [rotulo, ua, espera] of [['Safari', UA.safari, /Safari/], ['Firefox', UA.firefox, /Firefox/], ['celular', UA.celular, /celular/]]) {
    const ctx = await browser.newContext({ userAgent: ua });
    await ctx.addInitScript(semApi);
    for (const t of FERRAMENTAS) {
      const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
      await p.goto('file://' + path.join(RAIZ, t.arq)); await p.waitForTimeout(300);
      await conferirSemApi(p.mainFrame(), t, rotulo, espera);
      ok(!erros.length, `${t.arq} (${rotulo}): sem erro de JavaScript ${erros.join(' | ')}`);
      await p.close();
    }
    await ctx.close();
  }

  // 2) Dentro de outra página de outra origem (como uma pré-visualização): a função existe, mas é recusada.
  const srv = http.createServer((q, r) => {
    const u = new URL(q.url, 'http://x');
    if (u.pathname === '/moldura') { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return r.end(`<iframe src="${u.searchParams.get('src')}" style="width:1000px;height:900px"></iframe>`); }
    const f = path.join(RAIZ, decodeURIComponent(u.pathname));
    if (!f.startsWith(RAIZ) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); fs.createReadStream(f).pipe(r);
  });
  await new Promise(r => srv.listen(0, r));
  const porta = srv.address().port;
  {
    const ctx = await browser.newContext();
    for (const t of FERRAMENTAS) {
      const p = await ctx.newPage();
      await p.goto(`http://localhost:${porta}/moldura?src=${encodeURIComponent(`http://127.0.0.1:${porta}/${t.arq}`)}`); await p.waitForTimeout(500);
      await conferirSemApi(p.frames()[1], t, 'pré-visualização', /pré-visualização/);
      await p.close();
    }
    await ctx.close();
  }
  srv.close();

  // 3) Chromium normal, aberto pelo arquivo: sem aviso, e "Abrir a pasta local" chega ao seletor de pastas.
  {
    const ctx = await browser.newContext();
    await ctx.addInitScript('window.showDirectoryPicker = async () => { window.__pediuPasta = true; throw new DOMException("cancelou", "AbortError"); };');
    for (const t of FERRAMENTAS) {
      const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
      await p.goto('file://' + path.join(RAIZ, t.arq)); await p.waitForTimeout(300);
      ok(!(await p.$('#avisoFS')), `${t.arq} (Chromium, arquivo): sem aviso`);
      if (t.botoes.includes('#iAbrir')) { await p.click('#iAbrir'); await p.waitForTimeout(150); ok(await p.evaluate(() => window.__pediuPasta === true), `${t.arq} (Chromium, arquivo): "Abrir a pasta local" abre o seletor`); }
      ok(!erros.length, `${t.arq} (Chromium, arquivo): sem erro de JavaScript ${erros.join(' | ')}`);
      await p.close();
    }
    await ctx.close();
  }

  // 4) Aberto de dentro do .zip (Windows extrai para a pasta temporária): avisa para extrair, mas segue.
  {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nav-'));
    const dir = path.join(tmp, 'Temp', 'Temp1_gestao-solucao.zip'); fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(path.join(RAIZ, 'hub.html'), path.join(dir, 'hub.html'));
    const ctx = await browser.newContext();
    await ctx.addInitScript('window.showDirectoryPicker = async () => { window.__pediuPasta = true; throw new DOMException("cancelou", "AbortError"); };');
    const p = await ctx.newPage();
    await p.goto('file://' + path.join(dir, 'hub.html')); await p.waitForTimeout(300);
    ok(/Extrair tudo/.test(await p.locator('#avisoFS').innerText().catch(() => '')), 'hub.html (dentro do .zip): avisa para extrair');
    await p.click('#iAbrir'); await p.waitForTimeout(150);
    ok(await p.evaluate(() => window.__pediuPasta === true), 'hub.html (dentro do .zip): os botões seguem funcionando');
    await ctx.close(); fs.rmSync(tmp, { recursive: true, force: true });
  }

  await browser.close();
  console.log(falhas ? `\n${falhas} falha(s)` : '\nTudo certo.');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

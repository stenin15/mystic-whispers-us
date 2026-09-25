// Os desfechos da análise, incluindo as duas condições de corrida.
//
//   node auditoria/testes/01-caminhos-de-erro-da-analise.mjs
//
// Ver _comum.mjs para BASE_URL e CHROMIUM_PATH.

import path from 'node:path';
import { abrirNavegador, silenciarTerceiros, ateOEscaneamento, criarPlacar, BASE, CORS, LEITURA, SAIDA } from './_comum.mjs';

const p = criarPlacar();
const navegador = await abrirNavegador();

async function cenario(nome, tratadorPalm, esperaMs = 20000, ajustes = {}) {
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const eventos = [];
  await ctx.route(/functions\/v1\/palm-analysis/, tratadorPalm);
  await ctx.route(/functions\/v1\/track-event/, async (r) => {
    try {
      const b = JSON.parse(r.request().postData() || '{}');
      eventos.push({ nome: b.event_name, corpo: b });
    } catch { /* corpo ilegível */ }
    return r.fulfill({ status: 200, headers: CORS(), body: '{"ok":true}' });
  });
  await ctx.route(/functions\/v1\/(generate-palm-report|text-to-speech|get-entitlement)/, (r) =>
    r.fulfill({ status: 200, headers: CORS(), body: '{}' }));
  await silenciarTerceiros(ctx);
  if (ajustes.antesDeCarregar) await ctx.addInitScript(ajustes.antesDeCarregar);

  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e).slice(0, 120)));
  await ateOEscaneamento(page, '?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_line&ttclid=TTCLID_DE_TESTE');
  if (ajustes.durante) await ajustes.durante(page);
  await page.waitForTimeout(esperaMs);

  const estado = await page.evaluate(() => ({
    path: location.pathname,
    texto: document.body.innerText.replace(/\s+/g, ' ').slice(0, 140),
    temBotaoRetry: [...document.querySelectorAll('button')].some((b) => /try my reading again/i.test(b.innerText)),
    guardouLeitura: (() => { try { return !!JSON.parse(localStorage.getItem('mwus_funnel_v1')).state.analysisResult; } catch { return null; } })(),
  }));
  await page.screenshot({ path: path.join(SAIDA, `${nome}.png`), fullPage: true });
  return { estado, eventos, erros, page, ctx };
}

const resposta = (corpo, status = 200) => (r) => r.fulfill({ status, headers: CORS(), body: JSON.stringify(corpo) });
const demora = (ms, corpo) => async (r) => { await new Promise((x) => setTimeout(x, ms)); return r.fulfill({ status: 200, headers: CORS(), body: JSON.stringify(corpo) }); };

// Neutraliza o AbortController: simula um navegador em que o cancelamento não
// surte efeito, que é a única situação em que a resposta chega DEPOIS de o
// cinto de segurança de 30s já ter mostrado a tela de erro.
const semAbort = () => { window.AbortController.prototype.abort = function () { /* no-op */ }; };

console.log('\n════ A) IA responde 500 ════');
{
  const { estado, eventos, erros, ctx } = await cenario('A-erro-500', resposta({ error: 'upstream failed' }, 500));
  p.log('A) NÃO navega para /resultado', estado.path === '/analise', 'ficou em ' + estado.path);
  p.log('A) mostra a tela de erro com botão de tentar de novo', estado.temBotaoRetry, estado.texto.slice(0, 70));
  p.log('A) NÃO grava leitura no store', estado.guardouLeitura === false);
  p.log('A) registrou AnalysisFailed', eventos.some((e) => e.nome === 'AnalysisFailed'), eventos.map((e) => e.nome).join(' | '));
  const corpoFalha = eventos.find((e) => e.nome === 'AnalysisFailed')?.corpo;
  p.log('A) o ttclid chega em tiktok.ttclid, que é onde a função lê',
    corpoFalha?.tiktok?.ttclid === 'TTCLID_DE_TESTE',
    'tiktok=' + JSON.stringify(corpoFalha?.tiktok ?? null) + ' · utm=' + JSON.stringify(corpoFalha?.utm?.utm_content ?? null));
  p.log('A) o motivo da falha é recuperável pelo event_id',
    /^analysis_server_/.test(corpoFalha?.event_id ?? ''), 'event_id=' + corpoFalha?.event_id);
  p.log('A) sem erro de JavaScript', erros.length === 0, erros.join(' | '));
  await ctx.close();
}

console.log('\n════ B) IA responde 200 com corpo inútil ════');
{
  const { estado, eventos, ctx } = await cenario('B-corpo-vazio', resposta({ energyType: {} }));
  p.log('B) trata 200 inútil como falha', estado.path === '/analise' && estado.temBotaoRetry);
  p.log('B) motivo registrado = empty',
    /^analysis_empty_/.test(eventos.find((e) => e.nome === 'AnalysisFailed')?.corpo?.event_id ?? ''),
    'event_id=' + eventos.find((e) => e.nome === 'AnalysisFailed')?.corpo?.event_id);
  await ctx.close();
}

console.log('\n════ C) IA nunca responde — timeout do AbortController ════');
{
  const t0 = Date.now();
  const { estado, eventos, ctx } = await cenario('C-timeout', async () => { await new Promise(() => {}); }, 34000);
  p.log('C) para na tela de erro em vez de pendurar', estado.temBotaoRetry, `${Math.round((Date.now() - t0) / 1000)}s de cenário`);
  p.log('C) NÃO navega para /resultado', estado.path === '/analise');
  p.log('C) motivo registrado = timeout',
    /^analysis_timeout_/.test(eventos.find((e) => e.nome === 'AnalysisFailed')?.corpo?.event_id ?? ''),
    'event_id=' + eventos.find((e) => e.nome === 'AnalysisFailed')?.corpo?.event_id);
  await ctx.close();
}

console.log('\n════ D) IA responde certo ════');
{
  const { estado, eventos, erros, ctx } = await cenario('D-sucesso', resposta(LEITURA));
  p.log('D) navega para /resultado', estado.path === '/resultado');
  p.log('D) gravou a leitura no store', estado.guardouLeitura === true);
  p.log('D) registrou AnalysisSucceeded', eventos.some((e) => e.nome === 'AnalysisSucceeded'), eventos.map((e) => e.nome).join(' | '));
  p.log('D) sem erro de JavaScript', erros.length === 0, erros.join(' | '));
  await ctx.close();
}

console.log('\n════ E) falha e depois "tentar de novo" com a IA de volta ════');
{
  let chamadas = 0;
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await ctx.route(/functions\/v1\/palm-analysis/, (r) => {
    chamadas++;
    return chamadas === 1
      ? r.fulfill({ status: 500, headers: CORS(), body: '{"error":"boom"}' })
      : r.fulfill({ status: 200, headers: CORS(), body: JSON.stringify(LEITURA) });
  });
  await ctx.route(/functions\/v1\/(track-event|generate-palm-report|text-to-speech)/, (r) => r.fulfill({ status: 200, headers: CORS(), body: '{}' }));
  await silenciarTerceiros(ctx);
  const page = await ctx.newPage();
  await ateOEscaneamento(page);
  await page.waitForTimeout(8000);
  const antes = await page.evaluate(() => location.pathname);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /try my reading again/i.test(b.innerText))?.click());
  await page.waitForTimeout(20000);
  const depois = await page.evaluate(() => ({ path: location.pathname, leitura: (() => { try { return !!JSON.parse(localStorage.getItem('mwus_funnel_v1')).state.analysisResult; } catch { return null; } })() }));
  p.log('E) primeira tentativa parou no erro', antes === '/analise');
  p.log('E) "tentar de novo" refaz a chamada e conclui', depois.path === '/resultado' && depois.leitura === true, `chamadas=${chamadas}`);
  await page.screenshot({ path: path.join(SAIDA, 'E-retry.png'), fullPage: true });
  await ctx.close();
}

// ── As duas condições de corrida apontadas na revisão ───────────────────────

console.log('\n════ F) resposta ATRASADA depois da tela de erro ════');
{
  // Com o abort neutralizado, a chamada fica pendente além dos 30s do cinto de
  // segurança. A tela de erro aparece; a resposta (de SUCESSO) chega depois.
  // Ela tem que ser descartada inteira: nada de leitura, nada de navegação,
  // nada de evento de sucesso.
  const { estado, eventos, ctx } = await cenario(
    'F-resposta-atrasada',
    demora(38000, LEITURA),
    46000,
    { antesDeCarregar: semAbort },
  );
  p.log('F) a tela de erro aparece e PERMANECE', estado.path === '/analise' && estado.temBotaoRetry, 'path=' + estado.path);
  p.log('F) a resposta atrasada NÃO grava a leitura', estado.guardouLeitura === false, 'analysisResult=' + estado.guardouLeitura);
  p.log('F) a resposta atrasada NÃO emite sucesso', !eventos.some((e) => e.nome === 'AnalysisSucceeded'), eventos.map((e) => e.nome).join(' | '));
  p.log('F) exatamente um desfecho registrado', eventos.filter((e) => /^Analysis(Succeeded|Failed)$/.test(e.nome)).length === 1,
    `${eventos.filter((e) => /^Analysis(Succeeded|Failed)$/.test(e.nome)).length} evento(s)`);
  await ctx.close();
}

console.log('\n════ G) "tentar de novo" com a tentativa anterior ainda pendente ════');
{
  // Tentativa 1 fica pendente (abort neutralizado) → erro aos 30s.
  // A visitante clica em tentar de novo; a tentativa 2 responde rápido e conclui.
  // Depois disso, a tentativa 1 finalmente responde — e não pode mexer em nada.
  let chamadas = 0;
  const eventos = [];
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await ctx.addInitScript(semAbort);
  await ctx.route(/functions\/v1\/palm-analysis/, async (r) => {
    chamadas++;
    if (chamadas === 1) {
      await new Promise((x) => setTimeout(x, 40000)); // responde bem depois
      return r.fulfill({ status: 200, headers: CORS(), body: JSON.stringify({ ...LEITURA, energyType: { ...LEITURA.energyType, name: 'TENTATIVA ANTIGA' } }) });
    }
    return r.fulfill({ status: 200, headers: CORS(), body: JSON.stringify(LEITURA) });
  });
  await ctx.route(/functions\/v1\/track-event/, async (r) => {
    try { eventos.push(JSON.parse(r.request().postData() || '{}').event_name); } catch { /* ignore */ }
    return r.fulfill({ status: 200, headers: CORS(), body: '{"ok":true}' });
  });
  await ctx.route(/functions\/v1\/(generate-palm-report|text-to-speech|get-entitlement)/, (r) => r.fulfill({ status: 200, headers: CORS(), body: '{}' }));
  await silenciarTerceiros(ctx);
  const page = await ctx.newPage();
  await ateOEscaneamento(page);
  await page.waitForTimeout(33000); // deixa o cinto de segurança disparar
  const noErro = await page.evaluate(() => ({ path: location.pathname, retry: [...document.querySelectorAll('button')].some((b) => /try my reading again/i.test(b.innerText)) }));
  p.log('G) tentativa 1 pendente vira tela de erro', noErro.path === '/analise' && noErro.retry);

  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /try my reading again/i.test(b.innerText))?.click());
  await page.waitForTimeout(20000);
  const depoisDoRetry = await page.evaluate(() => ({ path: location.pathname, nome: (() => { try { return JSON.parse(localStorage.getItem('mwus_funnel_v1')).state.analysisResult?.energyType?.name ?? null; } catch { return null; } })() }));
  p.log('G) a tentativa 2 conclui normalmente', depoisDoRetry.path === '/resultado' && depoisDoRetry.nome === 'The Quiet Flame', `leitura="${depoisDoRetry.nome}"`);

  await page.waitForTimeout(16000); // a tentativa 1 responde agora
  const final = await page.evaluate(() => ({ path: location.pathname, nome: (() => { try { return JSON.parse(localStorage.getItem('mwus_funnel_v1')).state.analysisResult?.energyType?.name ?? null; } catch { return null; } })() }));
  p.log('G) a tentativa ANTIGA não sobrescreve a leitura', final.nome === 'The Quiet Flame', `leitura="${final.nome}"`);
  p.log('G) a tentativa ANTIGA não tira a visitante do resultado', final.path === '/resultado', 'path=' + final.path);
  p.log('G) um desfecho por tentativa, sem duplicar',
    eventos.filter((e) => /^Analysis(Succeeded|Failed)$/.test(e)).length === 2,
    eventos.filter((e) => /^Analysis/.test(e)).join(' | '));
  await page.screenshot({ path: path.join(SAIDA, 'G-retry-com-pendente.png'), fullPage: true });
  await ctx.close();
}

await navegador.close();
p.encerrar();

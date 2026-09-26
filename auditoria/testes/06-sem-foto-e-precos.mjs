// Regra "sem foto não há leitura", e a consistência do preço do anúncio até a
// sessão da Stripe.
//
//   node auditoria/testes/06-sem-foto-e-precos.mjs

import path from 'node:path';
import { abrirNavegador, silenciarTerceiros, criarPlacar, BASE, CORS, LEITURA, SAIDA } from './_comum.mjs';

const p = criarPlacar();
const navegador = await abrirNavegador();
const PIX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAJUlEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAA4NcAKvgAAdK6L0oAAAAASUVORK5CYII=', 'base64');

async function ctxBase(paid = []) {
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const corpos = [];
  await ctx.route(/supabase\.co\/functions\/v1\//, async (r) => {
    const u = r.request().url().split('/').pop();
    if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 200, headers: CORS(), body: '' });
    try { corpos.push({ fn: u, body: JSON.parse(r.request().postData() || '{}') }); } catch { /* ignore */ }
    let b = { ok: true };
    if (u.includes('palm-analysis')) b = LEITURA;
    else if (u.includes('get-entitlement')) b = { paidProducts: paid, isPaid: paid.length > 0 };
    else if (u.includes('create-checkout-session')) b = { url: 'https://checkout.stripe.com/c/pay/cs_x' };
    return r.fulfill({ status: 200, headers: CORS(), body: JSON.stringify(b) });
  });
  await ctx.route(/supabase\.co\/storage/, (r) => r.fulfill({ status: 200, headers: CORS(), body: '{"Key":"x/palm.png"}' }));
  await ctx.route(/checkout\.stripe\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Stripe Checkout (simulado)</h1>' }));
  await silenciarTerceiros(ctx);
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e).slice(0, 120)));
  return { ctx, page, corpos, erros };
}
const txt = (page) => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim());

// ── 1. o atalho sem foto não existe mais ───────────────────────────────────
{
  const { ctx, page } = await ctxBase();
  await page.goto(BASE + '/?utm_medium=paid&utm_content=static_love', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /start my reading/i.test(b.innerText))?.click());
  await page.waitForTimeout(2500);
  const t = await txt(page);
  p.log('/foto não oferece mais "Skip for now"', !/skip for now/i.test(t));
  p.log('e diz por que a foto é necessária', /without it, there is no reading/i.test(t));
  const semFoto = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /start my reading/i.test(x.innerText)); b?.click(); return true; });
  await page.waitForTimeout(2500);
  p.log('seguir sem escolher foto continua em /foto, com aviso', new URL(page.url()).pathname === '/foto' && /please upload a clear photo/i.test(await txt(page)), semFoto ? 'clicou sem foto' : '');
  await page.screenshot({ path: path.join(SAIDA, 'sem-foto-01-foto.png'), fullPage: true });
  await ctx.close();
}

// ── 2. /analise sem foto na memória volta para /foto ───────────────────────
{
  const { ctx, page } = await ctxBase();
  await page.goto(BASE + '/?utm_medium=paid', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  // estado de quem já passou pela foto e depois atualizou a página: hasHandPhoto
  // fica no storage, mas a imagem em si não é persistida.
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('mwus_funnel_v1') || '{}');
    s.state = { ...(s.state || {}), hasSeenVsl: true, hasHandPhoto: true, name: 'Sarah', quizAnswers: [] };
    localStorage.setItem('mwus_funnel_v1', JSON.stringify(s));
  });
  await page.goto(BASE + '/analise', { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  p.log('/analise sem a imagem em memória volta para /foto', new URL(page.url()).pathname === '/foto', '→ ' + new URL(page.url()).pathname);
  await ctx.close();
}

// ── 3. com foto, o caminho completo funciona e a leitura é dela ────────────
let precoNoCheckout = null;
{
  const { ctx, page, corpos, erros } = await ctxBase();
  await page.goto(BASE + '/?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_love&ttclid=TT_PRECO', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const tLanding = await txt(page);
  p.log('o anúncio promete $9.90 na primeira tela', /\$9\.90/.test(tLanding));
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /start my reading/i.test(b.innerText))?.click());
  await page.waitForTimeout(2000);
  await page.setInputFiles('input[type=file]', { name: 'palm.png', mimeType: 'image/png', buffer: PIX });
  await page.waitForTimeout(2500);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => /start my reading/i.test(x.innerText))?.click());
  await page.waitForTimeout(2500);
  await page.fill('input', 'Sarah'); await page.waitForTimeout(300);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => /continue/i.test(x.innerText))?.click());
  await page.waitForTimeout(900);
  for (let i = 0; i < 4; i++) {
    const n = await page.evaluate(() => {
      if (document.body.innerText.includes('Try my reading again')) return 0;
      const o = [...document.querySelectorAll('button')].filter((b) => b.offsetParent && b.getBoundingClientRect().height >= 40 && !/continue/i.test(b.innerText));
      if (!o.length) return 0; o[0].click(); return o.length;
    });
    if (!n) break; await page.waitForTimeout(1100);
  }
  for (let i = 0; i < 30; i++) { if (new URL(page.url()).pathname === '/resultado') break; await page.waitForTimeout(2000); }
  p.log('com foto, chega ao resultado', new URL(page.url()).pathname === '/resultado');
  await page.waitForTimeout(2500);
  const tRes = await txt(page);
  // a observação de abertura tem que vir da análise, não de texto fixo
  p.log('a frase de abertura vem da análise real, não é fixa',
    tRes.includes('Your heart line curves toward the index finger'),
    'usa palmObservations');
  p.log('não repete a frase fixa antiga', !/your palm reveals emotional patterns tied to timing/i.test(tRes));
  p.log('o selo fabricado "Rare pattern detected" saiu', !/rare pattern detected/i.test(tRes));
  // O conteúdo dos cards vem de result.blocks[1..] + result.strengths. Com a
  // leitura de teste sobra uma força, então ela tem que aparecer — e o texto
  // fabricado antigo não pode.
  p.log('os cards bloqueados usam conteúdo da própria leitura',
    tRes.includes('Deep intuition') && tRes.includes('You read a room before it speaks'),
    'força e descrição da análise na tela');
  p.log('o texto fabricado dos cards saiu',
    !/specific fork that appears in people/i.test(tRes) && !/fate line in your palm reveals a timing pattern/i.test(tRes));
  p.log('o trecho rotulado como leitura real continua citado', /gently curves downward/.test(tRes));
  const m = tRes.match(/\$9\.90|\$29\.90/g) || [];
  p.log('o resultado mostra preço coerente', m.length > 0, [...new Set(m)].join(' e '));
  await page.screenshot({ path: path.join(SAIDA, 'sem-foto-03-resultado.png'), fullPage: true });

  // ── 4. preço: resultado → checkout → Stripe ─────────────────────────────
  corpos.length = 0;
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /unlock my full reading/i.test(x.innerText)); b.scrollIntoView({ block: 'center' }); b.click(); });
  await page.waitForTimeout(4500);
  const ic = corpos.find((c) => c.fn === 'track-event' && c.body.event_name === 'InitiateCheckout');
  p.log('InitiateCheckout leva o valor do plano completo', ic?.body?.value === 29.9 && ic?.body?.currency === 'USD', `value=${ic?.body?.value} ${ic?.body?.currency}`);
  const ses = corpos.find((c) => c.fn === 'create-checkout-session');
  p.log('a sessão da Stripe é pedida para o produto certo', ses?.body?.productCode === 'complete', 'productCode=' + ses?.body?.productCode);
  p.log('o preço NÃO é enviado pelo cliente (a Stripe é a fonte)', ses && !('amount' in ses.body) && !('price' in ses.body), 'campos: ' + Object.keys(ses?.body || {}).join(', '));
  p.log('sem erro de JavaScript no percurso', erros.length === 0, erros.join(' | '));
  await ctx.close();
}

// ── 5. o plano básico: $9.90 do anúncio até a Stripe ───────────────────────
{
  const { ctx, page, corpos } = await ctxBase();
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => localStorage.setItem('mwus_funnel_v1', JSON.stringify({ state: {
    hasSeenVsl: true, name: 'Sarah', quizAnswers: [], mainConcern: 'Wrong timing',
    analysisResult: { energyType: { name: 'The Quiet Flame', description: 'x', icon: 'flame' }, strengths: [{ title: 'a', desc: 'b', icon: 'eye' }], blocks: [], spiritualMessage: 'm' },
    purchases: { basic: false, complete: false, guide: false },
  }, version: 0 })));
  await page.goto(BASE + '/checkout?plan=basic', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const t = await txt(page);
  precoNoCheckout = (t.match(/\$\d+\.\d{2}/g) || []).filter((v, i, a) => a.indexOf(v) === i);
  p.log('o checkout mostra exatamente os dois preços do produto', precoNoCheckout.sort().join(' ') === '$29.90 $9.90', precoNoCheckout.join(' · '));
  corpos.length = 0;
  // Com plan=basic o rótulo do botão do plano básico muda; casa pelo preço.
  const b = await page.evaluate(() => {
    const x = [...document.querySelectorAll('button,a')].filter((e) => e.offsetParent)
      .find((e) => /\$9\.90/.test(e.innerText) && /reading/i.test(e.innerText));
    if (!x) return null; x.click(); return x.innerText.replace(/\s+/g, ' ').slice(0, 50);
  });
  await page.waitForTimeout(4000);
  const ses = corpos.find((c) => c.fn === 'create-checkout-session');
  const ic = corpos.find((c) => c.fn === 'track-event' && c.body.event_name === 'InitiateCheckout');
  p.log('o $9.90 do anúncio vira productCode "basic" na Stripe', ses?.body?.productCode === 'basic', `botão "${b}" · productCode=${ses?.body?.productCode}`);
  p.log('e o evento carrega 9.9 USD', ic?.body?.value === 9.9 && ic?.body?.currency === 'USD', `value=${ic?.body?.value} ${ic?.body?.currency}`);
  p.log('a visitante chega à Stripe', /Stripe Checkout/i.test(await txt(page)));
  await page.screenshot({ path: path.join(SAIDA, 'precos-checkout.png'), fullPage: true });
  await ctx.close();
}

await navegador.close();
p.encerrar();

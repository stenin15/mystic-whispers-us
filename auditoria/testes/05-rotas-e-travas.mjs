// Entradas diretas, travas por leitura e player da VSL.
// Cobre os achados da revisão completa do funil de 26/09.
//
//   node auditoria/testes/05-rotas-e-travas.mjs

import path from 'node:path';
import { abrirNavegador, silenciarTerceiros, criarPlacar, BASE, CORS, SAIDA } from './_comum.mjs';

const p = criarPlacar();
const navegador = await abrirNavegador();
const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
let rede = [];
await ctx.route(/supabase\.co\/functions\/v1\//, async (r) => {
  const u = r.request().url().split('/').pop();
  rede.push(u);
  if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 200, headers: CORS(), body: '' });
  const b = u.includes('create-checkout-session') ? { url: 'https://checkout.stripe.com/c/pay/cs_x' } : { ok: true };
  return r.fulfill({ status: 200, headers: CORS(), body: JSON.stringify(b) });
});
await ctx.route(/checkout\.stripe\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Stripe Checkout (simulado)</h1>' }));
await silenciarTerceiros(ctx);
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(String(e).slice(0, 120)));

// Semeia sempre na origem do site — nunca com outra página aberta.
const semear = async (comLeitura) => {
  if (!page.url().startsWith(BASE)) { await page.goto(BASE + '/', { waitUntil: 'load' }); await page.waitForTimeout(1500); }
  await page.evaluate((tem) => localStorage.setItem('mwus_funnel_v1', JSON.stringify({ state: {
    hasSeenVsl: true, name: 'Sarah', quizAnswers: [], mainConcern: 'Wrong timing',
    analysisResult: tem ? { energyType: { name: 'The Quiet Flame', description: 'x', icon: 'flame' }, strengths: [{ title: 'a', desc: 'b', icon: 'eye' }], blocks: [], spiritualMessage: 'm' } : null,
    purchases: { basic: false, complete: false, guide: false },
  }, version: 0 })), comLeitura);
};

// ── entrada direta /enviar-foto ────────────────────────────────────────────
await page.goto(BASE + '/enviar-foto', { waitUntil: 'load' });
await page.waitForTimeout(3500);
const entrada = await page.evaluate(() => ({ path: location.pathname, upload: !!document.querySelector('input[type=file]') }));
p.log('/enviar-foto leva ao passo da foto', entrada.path === '/foto', '→ ' + entrada.path);
p.log('e a tela da foto está funcional', entrada.upload);

// ── travas por "tem leitura?" ──────────────────────────────────────────────
for (const rota of ['/checkout?plan=complete', '/upsell', '/oferta/guia-exclusivo']) {
  await semear(false);
  await page.goto(BASE + rota, { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  const destino = await page.evaluate(() => location.pathname);
  p.log(`${rota.split('?')[0]} sem leitura → landing em 1 salto`, destino === '/', '→ ' + destino);
}

// ── checkout com leitura ───────────────────────────────────────────────────
await semear(true);
await page.goto(BASE + '/checkout?plan=complete', { waitUntil: 'load' });
await page.waitForTimeout(3500);
const t = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
p.log('/checkout com leitura abre', await page.evaluate(() => location.pathname) === '/checkout');
p.log('os dois planos aparecem', /\$29\.90/.test(t) && /\$9\.90/.test(t));
p.log('sem as afirmações removidas', !/\$97/.test(t) && !/women across the us/i.test(t));
p.log('pagamento único, sem assinatura, reembolso de 7 dias', /one-time/i.test(t) && /no subscription/i.test(t) && /7-day/i.test(t));
rede = [];
const btn = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /unlock my reading/i.test(x.innerText)); if (!b) return null; b.click(); return b.innerText.replace(/\s+/g, ' '); });
await page.waitForTimeout(4000);
p.log('o botão cria a sessão da Stripe e leva para lá',
  rede.some((u) => /create-checkout-session/.test(u)) && /Stripe Checkout/i.test(await page.evaluate(() => document.body.innerText)),
  `botão "${btn}"`);

// ── player da VSL ──────────────────────────────────────────────────────────
// Só faz sentido com VITE_VSL_VIDEO_URL definida no build.
await page.goto(BASE + '/', { waitUntil: 'load' });
await page.waitForTimeout(4000);
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } scrollTo(0, 0); });
await page.waitForTimeout(2000);
const v = await page.evaluate(() => {
  const todos = [...document.querySelectorAll('video')];
  const vis = todos.filter((x) => x.offsetParent !== null); // o player desktop fica oculto no mobile
  const r = vis[0] ? vis[0].getBoundingClientRect() : null;
  return { total: todos.length, visiveis: vis.length, w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0,
    placeholder: /video coming soon/i.test(document.body.innerText),
    play: [...document.querySelectorAll('button[aria-label]')].some((b) => b.getAttribute('aria-label') === 'Play') };
});
if (v.placeholder) {
  console.log('  (pulado: build sem VITE_VSL_VIDEO_URL — a seção mostra o placeholder)');
} else {
  p.log('o player da VSL está montado, e só um fica visível', v.visiveis === 1 && v.w > 0 && v.h > 0, `${v.total} no DOM, ${v.visiveis} visível · ${v.w}x${v.h}`);
  p.log('se o autoplay não rolar, aparece o botão de play', v.play, 'degradação correta');
}
p.log('sem erro de JavaScript', erros.length === 0, erros.join(' | '));
await page.screenshot({ path: path.join(SAIDA, 'rotas-e-travas.png'), fullPage: true });

await navegador.close();
p.encerrar();

// Perna de navegador do TikTok sem o fbq, variantes do topo e as afirmações
// removidas do checkout.
//
//   node auditoria/testes/02-tracking-hero-e-afirmacoes.mjs

import path from 'node:path';
import { abrirNavegador, silenciarTerceiros, criarPlacar, BASE, SAIDA } from './_comum.mjs';

const p = criarPlacar();
const navegador = await abrirNavegador();

// ── 1. tracking.ts: sem fbq, o ttq ainda recebe ─────────────────────────────
// Simula bloqueador de anúncio: o script do Meta nunca carrega, então
// window.fbq não existe. O ttq é substituído por um espião antes de o app subir.
async function medirTtq(comFbq) {
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  if (!comFbq) await ctx.route(/connect\.facebook\.net/, (r) => r.abort());
  await ctx.route(/analytics\.tiktok\.com/, (r) => r.abort()); // não carrega o sdk real
  await ctx.route(/clarity\.ms|utmify|vercel-scripts|supabase\.co/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.addInitScript((temFbq) => {
    window.__ttq = [];
    window.ttq = {
      page: () => window.__ttq.push('page'),
      track: (e) => window.__ttq.push(e),
      identify() {}, load() {}, instances() {},
    };
    if (!temFbq) {
      try { delete window.fbq; } catch { /* ignore */ }
      Object.defineProperty(window, 'fbq', { get: () => undefined, set: () => {}, configurable: true });
    }
  }, comFbq);
  await page.goto(BASE + '/?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_love', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /start my reading/i.test(b.innerText))?.click());
  await page.waitForTimeout(2000);
  const out = await page.evaluate(() => ({ ttq: window.__ttq || [], temFbq: typeof window.fbq === 'function' }));
  await ctx.close();
  return out;
}

const semFbq = await medirTtq(false);
p.log('tracking: sem fbq, a perna de navegador do TikTok continua disparando',
  semFbq.ttq.length > 0 && !semFbq.temFbq,
  `fbq presente=${semFbq.temFbq} · eventos no ttq=${semFbq.ttq.length} [${[...new Set(semFbq.ttq)].join(', ')}]`);

// ── 2. o topo do tráfego pago é UM só ──────────────────────────────────────
// O teste A/B por utm_content foi retirado: todo clique pago vê a mesma tela.
async function topo(url) {
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await silenciarTerceiros(ctx);
  await ctx.route(/supabase\.co/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto(BASE + url, { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  const h = await page.evaluate(() => {
    const el = document.querySelector('h1');
    return {
      h1: el ? el.innerText.replace(/\s+/g, ' ').trim() : null,
      passo2: [...document.querySelectorAll('span')].map((s) => s.innerText).find((t) => /The AI reads/i.test(t)) || null,
    };
  });
  return { page, ctx, h };
}

const comLove = await topo('/?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_love');
p.log('anúncio "love": topo com a pergunta sobre como ela ama', /how you love/i.test(comLove.h.h1 || ''), comLove.h.h1);
p.log('e o passo 2 fala da linha do coração', /heart line/i.test(comLove.h.passo2 || ''), comLove.h.passo2);
await comLove.page.screenshot({ path: path.join(SAIDA, 'hero-pago.png') });
await comLove.ctx.close();

const comLine = await topo('/?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_line');
p.log('anúncio "line": MESMO topo, sem duplicação', comLine.h.h1 === comLove.h.h1, comLine.h.h1);
await comLine.ctx.close();

const semContent = await topo('/?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01');
p.log('anúncio sem utm_content: MESMO topo', semContent.h.h1 === comLove.h.h1, semContent.h.h1);
await semContent.ctx.close();

const semUtm = await topo('/');
p.log('orgânico: não vê o topo pago', !/how you love/i.test(semUtm.h.h1 || ''), 'h1=' + (semUtm.h.h1 || 'nenhum (landing é imagem)'));
await semUtm.ctx.close();

// ── 3. as afirmações sem lastro sumiram do checkout ────────────────────────
{
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await silenciarTerceiros(ctx);
  await ctx.route(/supabase\.co/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto(BASE + '/?utm_medium=paid', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /start my reading/i.test(b.innerText))?.click());
  await page.waitForTimeout(1200);
  await page.goto(BASE + '/checkout?plan=complete', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const t = await page.evaluate(() => document.body.innerText);
  p.log('checkout: "$97 value" removido', !/\$97/.test(t));
  p.log('checkout: "Women across the US..." removido', !/Women across the US/i.test(t));
  p.log('checkout: a página continua montando normalmente', t.length > 400, `${t.length} caracteres`);
  await page.screenshot({ path: path.join(SAIDA, 'checkout-sem-afirmacoes.png'), fullPage: true });
  await ctx.close();
}

await navegador.close();
p.encerrar();

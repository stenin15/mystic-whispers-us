// Medição isolada do bug do fbq: quantos eventos chegam à PERNA DE NAVEGADOR do
// TikTok quando o connect.facebook.net está bloqueado.
//
//   node auditoria/testes/03-ttq-sem-fbq.mjs
//
// Para comparar com o código anterior:
//   git stash && npm run build && node auditoria/testes/03-ttq-sem-fbq.mjs
//   git stash pop && npm run build
//
// Atenção ao escopo: isto mede só a perna de navegador. Os eventos que também
// são enviados pelo servidor (CompleteRegistration, InitiateCheckout, Purchase)
// nunca dependeram deste caminho.

import { abrirNavegador, silenciarTerceiros, BASE } from './_comum.mjs';

const navegador = await abrirNavegador();
const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
await ctx.route(/connect\.facebook\.net/, (r) => r.abort());
await ctx.route(/analytics\.tiktok\.com|clarity\.ms|utmify|vercel-scripts|supabase\.co/, (r) => r.abort());
await silenciarTerceiros(ctx);
const page = await ctx.newPage();
await page.addInitScript(() => {
  window.__ttq = [];
  window.ttq = { page: () => window.__ttq.push('page'), track: (e) => window.__ttq.push(e), identify() {}, load() {}, instances() {} };
  try { delete window.fbq; } catch { /* ignore */ }
  Object.defineProperty(window, 'fbq', { get: () => undefined, set: () => {}, configurable: true });
});
await page.goto(BASE + '/?utm_medium=paid&utm_content=static_love', { waitUntil: 'load' });
await page.waitForTimeout(2500);
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /start my reading/i.test(b.innerText))?.click());
await page.waitForTimeout(2000);
const r = await page.evaluate(() => ({ n: (window.__ttq || []).length, ev: [...new Set(window.__ttq || [])] }));
console.log(`eventos na perna de navegador do TikTok, sem o fbq: ${r.n}  [${r.ev.join(', ')}]`);
await navegador.close();

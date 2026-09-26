// Conta quantas vezes palm-analysis é chamada numa visita. Deve ser 1.
//
//   node auditoria/testes/04-chamadas-a-ia-por-visita.mjs

import { abrirNavegador, silenciarTerceiros, ateOEscaneamento, BASE, CORS } from './_comum.mjs';

const navegador = await abrirNavegador();
const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
let n = 0;
await ctx.route(/functions\/v1\/palm-analysis/, (r) => {
  n++;
  console.log(`  → palm-analysis, chamada ${n}`);
  return r.fulfill({ status: 500, headers: CORS(), body: '{"error":"boom"}' });
});
await ctx.route(/functions\/v1\/(track-event|generate-palm-report|text-to-speech)/, (r) => r.fulfill({ status: 200, headers: CORS(), body: '{}' }));
await silenciarTerceiros(ctx);
const page = await ctx.newPage();
await ateOEscaneamento(page);
await page.waitForTimeout(14000);
console.log(`\ntotal de chamadas a palm-analysis numa visita: ${n}`);
if (n !== 1) process.exitCode = 1;
await navegador.close();

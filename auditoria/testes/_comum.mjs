// Utilidades compartilhadas pelos scripts de teste.
//
// Portabilidade: nada aqui depende do caminho de ninguém.
//   BASE_URL        onde o `vite preview` está servindo   (padrão http://localhost:5175)
//   CHROMIUM_PATH   binário do Chromium, se o Playwright não achar sozinho (opcional)
// As capturas saem em `auditoria/testes/saida/`, ao lado dos scripts.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const BASE = (process.env.BASE_URL || 'http://localhost:5175').replace(/\/$/, '');
export const ORIGEM = new URL(BASE).origin;

const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const SAIDA = path.join(AQUI, 'saida');
fs.mkdirSync(SAIDA, { recursive: true });

export function abrirNavegador() {
  const exe = process.env.CHROMIUM_PATH;
  return chromium.launch(exe ? { executablePath: exe } : {});
}

export const CORS = () => ({
  'Access-Control-Allow-Origin': ORIGEM,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
});

export const LEITURA = {
  energyType: { name: 'The Quiet Flame', description: 'You feel deeply before you speak.', icon: 'flame' },
  strengths: [{ title: 'Deep intuition', desc: 'You read a room before it speaks.', icon: 'eye' }],
  blocks: [{ title: 'Overthinking', desc: 'You rehearse conversations.', icon: 'brain' }],
  spiritualMessage: 'Your timing is not late. It is yours.',
  palmObservations: 'Your heart line curves toward the index finger.',
};

// Bloqueia os pixels e scripts de terceiros: nenhum evento real sai daqui.
export async function silenciarTerceiros(ctx) {
  await ctx.route(/facebook\.net|analytics\.tiktok|clarity\.ms|utmify|vercel-scripts/, (r) => r.abort());
}

// Percorre landing → foto → coleta e para na fase de escaneamento.
// Não clica em nada da tela de erro: o laço para assim que ela aparece.
export async function ateOEscaneamento(page, query = '?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_line') {
  await page.goto(BASE + '/' + query, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /start my reading/i.test(b.innerText))?.click());
  await page.waitForTimeout(1500);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /skip for now/i.test(b.innerText))?.click());
  await page.waitForTimeout(1500);
  await page.fill('input', 'Sarah');
  await page.waitForTimeout(300);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => /continue/i.test(x.innerText))?.click());
  await page.waitForTimeout(800);
  for (let i = 0; i < 4; i++) {
    const n = await page.evaluate(() => {
      if (document.body.innerText.includes('Try my reading again')) return 0;
      const o = [...document.querySelectorAll('button')].filter(
        (b) => b.offsetParent && b.getBoundingClientRect().height >= 40 && !/continue/i.test(b.innerText),
      );
      if (!o.length) return 0;
      o[0].click();
      return o.length;
    });
    if (!n) break;
    await page.waitForTimeout(900);
  }
}

export function criarPlacar() {
  const linhas = [];
  return {
    log(nome, ok, detalhe = '') {
      linhas.push({ nome, ok, detalhe });
      console.log((ok ? 'PASS' : 'FAIL').padEnd(5), nome, detalhe ? '· ' + detalhe : '');
    },
    encerrar() {
      const f = linhas.filter((l) => !l.ok);
      console.log('\n═══════ RESUMO ═══════');
      console.log(`${linhas.length - f.length}/${linhas.length} passaram`);
      f.forEach((x) => console.log('  FALHA:', x.nome, '·', x.detalhe));
      if (f.length) process.exitCode = 1;
    },
  };
}

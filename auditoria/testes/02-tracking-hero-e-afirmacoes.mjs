import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT='/tmp/claude-0/-home-user-mystic-whispers-us/c62a0810-4848-5548-883f-debadfa24a2c/scratchpad/evidencias';
const B='http://localhost:5175';
const res=[]; const log=(n,ok,d='')=>{res.push({n,ok,d}); console.log((ok?'PASS':'FAIL').padEnd(5),n,d?'· '+d:'')};
const browser=await chromium.launch({executablePath:EXE});

// ── 1. tracking.ts: sem fbq, o TikTok ainda recebe ──────────────────────────
// Simula bloqueador de anúncio: o script do Meta nunca carrega, então window.fbq
// não existe. O ttq é substituído por um espião para contar o que chegaria.
async function medirTtq(comFbq){
  const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  if(!comFbq) await ctx.route(/connect\.facebook\.net/, r=>r.abort());
  await ctx.route(/analytics\.tiktok\.com/, r=>r.abort()); // não carrega o sdk real
  await ctx.route(/clarity\.ms|utmify|vercel-scripts|supabase\.co/, r=>r.abort());
  const page=await ctx.newPage();
  await page.addInitScript((temFbq)=>{
    window.__ttq=[];
    // espião instalado ANTES do app: o loader do projeto vê window.ttq definido
    // e devolve cedo, então o objeto abaixo é o que recebe as chamadas.
    window.ttq = {
      page: () => window.__ttq.push('page'),
      track: (e,p,o) => window.__ttq.push(e),
      identify(){}, load(){}, instances(){},
    };
    if(!temFbq){ try{ delete window.fbq; }catch{} Object.defineProperty(window,'fbq',{get:()=>undefined,set:()=>{},configurable:true}); }
  }, comFbq);
  await page.goto(B+'/?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_love',{waitUntil:'load'});
  await page.waitForTimeout(2500);
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/start my reading/i.test(b.innerText))?.click());
  await page.waitForTimeout(2000);
  const out = await page.evaluate(()=>({ ttq: window.__ttq||[], temFbq: typeof window.fbq === 'function' }));
  await ctx.close();
  return out;
}

const semFbq = await medirTtq(false);
log('tracking: sem fbq, o TikTok recebe eventos assim mesmo',
    semFbq.ttq.length > 0 && !semFbq.temFbq,
    `fbq presente=${semFbq.temFbq} · eventos no ttq=${semFbq.ttq.length} [${[...new Set(semFbq.ttq)].join(', ')}]`);

// ── 2. variante do topo por utm_content ─────────────────────────────────────
async function topo(url){
  const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await ctx.route(/facebook\.net|analytics\.tiktok|clarity\.ms|utmify|vercel-scripts|supabase\.co/, r=>r.abort());
  const page=await ctx.newPage();
  await page.goto(B+url,{waitUntil:'load'}); await page.waitForTimeout(2200);
  const h = await page.evaluate(()=>{
    const el=document.querySelector('h1');
    return { h1: el ? el.innerText.replace(/\s+/g,' ').trim() : null,
             passo2: [...document.querySelectorAll('span')].map(s=>s.innerText).find(t=>/The AI reads/i.test(t)) || null };
  });
  return {page, ctx, h};
}

const love = await topo('/?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_love');
log('hero love: headline continua a promessa do anúncio',
    /how you love/i.test(love.h.h1||''), love.h.h1);
log('hero love: passo 2 fala da linha do coração',
    /heart line/i.test(love.h.passo2||''), love.h.passo2);
await love.page.screenshot({path:`${OUT}/hero-love.png`,fullPage:false}); await love.ctx.close();

const line = await topo('/?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_line');
log('hero controle: os outros anúncios mantêm o texto atual',
    /one photo of your palm/i.test(line.h.h1||'') && !/how you love/i.test(line.h.h1||''), line.h.h1);
await line.page.screenshot({path:`${OUT}/hero-controle.png`,fullPage:false}); await line.ctx.close();

const semUtm = await topo('/');
log('orgânico: nenhuma das variantes aparece',
    !/how you love|A reading of the lines that are actually there/i.test(semUtm.h.h1||''), 'h1='+semUtm.h.h1);
await semUtm.ctx.close();

// ── 3. as afirmações sem lastro sumiram do checkout ─────────────────────────
{
  const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await ctx.route(/facebook\.net|analytics\.tiktok|clarity\.ms|utmify|vercel-scripts|supabase\.co/, r=>r.abort());
  const page=await ctx.newPage();
  await page.goto(B+'/?utm_medium=paid',{waitUntil:'load'}); await page.waitForTimeout(1200);
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/start my reading/i.test(b.innerText))?.click()); await page.waitForTimeout(1200);
  await page.goto(B+'/checkout?plan=complete',{waitUntil:'load'}); await page.waitForTimeout(2500);
  const t = await page.evaluate(()=>document.body.innerText);
  log('checkout: "$97 value" removido', !/\$97/.test(t));
  log('checkout: "Women across the US..." removido', !/Women across the US/i.test(t));
  log('checkout: a página continua montando normalmente', t.length>400, `${t.length} caracteres`);
  await page.screenshot({path:`${OUT}/checkout-sem-afirmacoes.png`,fullPage:true});
  await ctx.close();
}

await browser.close();
console.log('\n═══════ RESUMO ═══════');
const f=res.filter(r=>!r.ok); console.log(`${res.length-f.length}/${res.length} passaram`);
f.forEach(x=>console.log('  FALHA:',x.n,'·',x.d));

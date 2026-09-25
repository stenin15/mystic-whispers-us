import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const B='http://localhost:5175';
const browser=await chromium.launch({executablePath:EXE});
const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
await ctx.route(/connect\.facebook\.net/, r=>r.abort());
await ctx.route(/analytics\.tiktok\.com|clarity\.ms|utmify|vercel-scripts|supabase\.co/, r=>r.abort());
const page=await ctx.newPage();
await page.addInitScript(()=>{
  window.__ttq=[];
  window.ttq={ page:()=>window.__ttq.push('page'), track:(e)=>window.__ttq.push(e), identify(){}, load(){}, instances(){} };
  try{ delete window.fbq; }catch{}
  Object.defineProperty(window,'fbq',{get:()=>undefined,set:()=>{},configurable:true});
});
await page.goto(B+'/?utm_medium=paid&utm_content=static_love',{waitUntil:'load'}); await page.waitForTimeout(2500);
await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/start my reading/i.test(b.innerText))?.click());
await page.waitForTimeout(2000);
const r = await page.evaluate(()=>({n:(window.__ttq||[]).length, ev:[...new Set(window.__ttq||[])]}));
console.log(`eventos que chegaram ao ttq sem o fbq: ${r.n}  [${r.ev.join(', ')}]`);
await browser.close();

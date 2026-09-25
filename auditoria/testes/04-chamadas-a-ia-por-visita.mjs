import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const B='http://localhost:5175';
const CORS={'Access-Control-Allow-Origin':'http://localhost:5175','Content-Type':'application/json','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
const browser=await chromium.launch({executablePath:EXE});
const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
let n=0;
await ctx.route(/functions\/v1\/palm-analysis/, r=>{ n++; console.log('  → palm-analysis chamada', n, 'em', new Date().toISOString().slice(17,23)); return r.fulfill({status:500,headers:CORS,body:'{"error":"boom"}'}); });
await ctx.route(/functions\/v1\/(track-event|generate-palm-report|text-to-speech)/, r=>r.fulfill({status:200,headers:CORS,body:'{}'}));
await ctx.route(/facebook\.net|analytics\.tiktok|clarity\.ms|utmify|vercel-scripts/, r=>r.abort());
const page=await ctx.newPage();
await page.goto(B+'/?utm_medium=paid',{waitUntil:'load'}); await page.waitForTimeout(1500);
await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/start my reading/i.test(b.innerText))?.click()); await page.waitForTimeout(1200);
await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/skip for now/i.test(b.innerText))?.click()); await page.waitForTimeout(1500);
// marca o histórico de renders observando o DOM da coleta
await page.fill('input','Sarah'); await page.waitForTimeout(300);
await page.evaluate(()=>[...document.querySelectorAll('button')].find(x=>/continue/i.test(x.innerText))?.click()); await page.waitForTimeout(700);
for(let i=0;i<4;i++){const c=await page.evaluate(()=>{const o=[...document.querySelectorAll('button')].filter(b=>b.offsetParent&&b.getBoundingClientRect().height>=40&&!/continue/i.test(b.innerText));if(!o.length)return 0;o[0].click();return o.length});if(!c)break;await page.waitForTimeout(900);}
await page.waitForTimeout(14000);
console.log('\ntotal de chamadas a palm-analysis numa visita:', n);
await browser.close();

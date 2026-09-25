import { chromium } from 'playwright';
const EXE='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT='/tmp/claude-0/-home-user-mystic-whispers-us/c62a0810-4848-5548-883f-debadfa24a2c/scratchpad/evidencias';
const B='http://localhost:5175';
const res=[]; const log=(n,ok,d='')=>{res.push({n,ok,d}); console.log((ok?'PASS':'FAIL').padEnd(5),n,d?'· '+d:'')};
const CORS={'Access-Control-Allow-Origin':'http://localhost:5175','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
const LEITURA={energyType:{name:'The Quiet Flame',description:'You feel deeply before you speak.',icon:'flame'},strengths:[{title:'Deep intuition',desc:'You read a room before it speaks.',icon:'eye'}],blocks:[{title:'Overthinking',desc:'You rehearse conversations.',icon:'brain'}],spiritualMessage:'Your timing is not late. It is yours.',palmObservations:'Your heart line curves toward the index finger.'};

const browser=await chromium.launch({executablePath:EXE});

// percorre landing -> foto -> coleta, e para na fase de escaneamento
async function ateAnalise(page){
  await page.goto(B+'/?utm_source=tiktok&utm_medium=paid&utm_campaign=cold01&utm_content=static_line',{waitUntil:'load'});
  await page.waitForTimeout(1500);
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/start my reading/i.test(b.innerText))?.click());
  await page.waitForTimeout(1500);
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/skip for now/i.test(b.innerText))?.click());
  await page.waitForTimeout(1500);
  await page.fill('input','Sarah'); await page.waitForTimeout(300);
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(x=>/continue/i.test(x.innerText))?.click());
  await page.waitForTimeout(800);
  for(let i=0;i<4;i++){
    const naColeta = await page.evaluate(()=>!document.body.innerText.includes('Try my reading again'));
    if(!naColeta) break;
    const n=await page.evaluate(()=>{const o=[...document.querySelectorAll('button')].filter(b=>b.offsetParent&&b.getBoundingClientRect().height>=40&&!/continue/i.test(b.innerText));if(!o.length)return 0;o[0].click();return o.length});
    if(!n)break; await page.waitForTimeout(900);
  }
}

async function cenario(nome, palmHandler, espera=20000){
  const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const eventos=[];
  await ctx.route(/functions\/v1\/palm-analysis/, palmHandler);
  await ctx.route(/functions\/v1\/track-event/, async r=>{
    try{ const b=JSON.parse(r.request().postData()||'{}'); eventos.push(b.event_name+':'+(b.analysis_outcome??'')); }catch{}
    return r.fulfill({status:200,headers:CORS,body:'{"ok":true}'});
  });
  await ctx.route(/functions\/v1\/(generate-palm-report|text-to-speech|get-entitlement)/, r=>r.fulfill({status:200,headers:CORS,body:'{}'}));
  await ctx.route(/facebook\.net|analytics\.tiktok|clarity\.ms|utmify|vercel-scripts/, r=>r.abort());
  const page=await ctx.newPage();
  const erros=[]; page.on('pageerror',e=>erros.push(String(e).slice(0,120)));
  await ateAnalise(page);
  await page.waitForTimeout(espera);
  const estado = await page.evaluate(()=>({
    path: location.pathname,
    texto: document.body.innerText.replace(/\s+/g,' ').slice(0,160),
    temBotaoRetry: [...document.querySelectorAll('button')].some(b=>/try my reading again/i.test(b.innerText)),
    guardouLeitura: (()=>{try{return !!JSON.parse(localStorage.getItem('mwus_funnel_v1')).state.analysisResult}catch{return null}})(),
  }));
  await page.screenshot({path:`${OUT}/${nome}.png`,fullPage:true});
  return {estado, eventos, erros, page, ctx};
}

console.log('\n════ A) IA responde 500 ════');
{
  const {estado,eventos,erros,ctx} = await cenario('A-erro-500', r=>r.fulfill({status:500,headers:CORS,body:'{"error":"upstream failed"}'}));
  log('A) NÃO navega para /resultado', estado.path==='/analise', 'ficou em '+estado.path);
  log('A) mostra a tela de erro com botão de tentar de novo', estado.temBotaoRetry, estado.texto.slice(0,80));
  log('A) NÃO grava leitura no store', estado.guardouLeitura===false, 'analysisResult='+estado.guardouLeitura);
  log('A) registrou AnalysisFailed no servidor', eventos.some(e=>e.startsWith('AnalysisFailed')), eventos.join(' | '));
  log('A) sem erro de JavaScript', erros.length===0, erros.join(' | '));
  await ctx.close();
}

console.log('\n════ B) IA responde 200 com corpo inútil ════');
{
  const {estado,eventos,ctx} = await cenario('B-corpo-vazio', r=>r.fulfill({status:200,headers:CORS,body:'{"energyType":{}}'}));
  log('B) trata 200 inútil como falha', estado.path==='/analise' && estado.temBotaoRetry, 'path='+estado.path);
  log('B) motivo registrado = empty', eventos.some(e=>e==='AnalysisFailed:empty'), eventos.join(' | '));
  await ctx.close();
}

console.log('\n════ C) IA nunca responde (timeout real do AbortController) ════');
{
  const t0=Date.now();
  const {estado,eventos,ctx} = await cenario('C-timeout', async r=>{ await new Promise(()=>{}); }, 34000);
  log('C) para na tela de erro em vez de pendurar', estado.temBotaoRetry, `${Math.round((Date.now()-t0)/1000)}s até o fim do cenário`);
  log('C) NÃO navega para /resultado', estado.path==='/analise', 'path='+estado.path);
  log('C) motivo registrado = timeout', eventos.some(e=>e==='AnalysisFailed:timeout'), eventos.join(' | '));
  await ctx.close();
}

console.log('\n════ D) IA responde certo ════');
{
  const {estado,eventos,erros,ctx} = await cenario('D-sucesso', r=>r.fulfill({status:200,headers:CORS,body:JSON.stringify(LEITURA)}));
  log('D) navega para /resultado', estado.path==='/resultado', 'path='+estado.path);
  log('D) gravou a leitura no store', estado.guardouLeitura===true, 'analysisResult='+estado.guardouLeitura);
  log('D) registrou AnalysisSucceeded', eventos.some(e=>e.startsWith('AnalysisSucceeded')), eventos.join(' | '));
  log('D) sem erro de JavaScript', erros.length===0, erros.join(' | '));
  await ctx.close();
}

console.log('\n════ E) falha e depois "tentar de novo" com a IA de volta ════');
{
  let chamadas=0;
  const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await ctx.route(/functions\/v1\/palm-analysis/, r=>{
    chamadas++;
    return chamadas===1
      ? r.fulfill({status:500,headers:CORS,body:'{"error":"boom"}'})
      : r.fulfill({status:200,headers:CORS,body:JSON.stringify(LEITURA)});
  });
  await ctx.route(/functions\/v1\/(track-event|generate-palm-report|text-to-speech)/, r=>r.fulfill({status:200,headers:CORS,body:'{}'}));
  await ctx.route(/facebook\.net|analytics\.tiktok|clarity\.ms|utmify|vercel-scripts/, r=>r.abort());
  const page=await ctx.newPage();
  await ateAnalise(page);
  await page.waitForTimeout(8000);
  const antes = await page.evaluate(()=>location.pathname);
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/try my reading again/i.test(b.innerText))?.click());
  await page.waitForTimeout(20000);
  const depois = await page.evaluate(()=>({path:location.pathname, leitura:(()=>{try{return !!JSON.parse(localStorage.getItem('mwus_funnel_v1')).state.analysisResult}catch{return null}})()}));
  log('E) primeira tentativa parou no erro', antes==='/analise', 'path='+antes);
  log('E) "tentar de novo" refaz a chamada e conclui', depois.path==='/resultado' && depois.leitura===true, `chamadas=${chamadas} path=${depois.path}`);
  await page.screenshot({path:`${OUT}/E-retry.png`,fullPage:true});
  await ctx.close();
}

await browser.close();
console.log('\n═══════ RESUMO ═══════');
const f=res.filter(r=>!r.ok); console.log(`${res.length-f.length}/${res.length} passaram`);
f.forEach(x=>console.log('  FALHA:',x.n,'·',x.d));

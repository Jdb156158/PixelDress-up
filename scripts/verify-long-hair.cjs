const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.TEST_URL||'http://localhost:4186';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true});
 page.setDefaultTimeout(15000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(base);await page.waitForFunction(()=>document.querySelector('.doll')?.toDataURL().length>10000);
 const outfitCount=process.env.SMOKE?1:8;
 const looks=[];
 for(let outfit=0;outfit<outfitCount;outfit++){
  await page.locator('[data-category=outfit]').click();await page.locator(`[data-item="${outfit}"]`).click();if(outfit>=3)await page.locator('#buy-outfit').click();
  await page.locator('[data-category=hair]').click();
  for(let hair=8;hair<16;hair++){
   await page.locator('[data-hair-group=short]').click();await page.locator(`[data-item="${hair-8}"]`).click();await page.locator('.doll').evaluate(c=>{window.shortHairPixels=c.getContext('2d').getImageData(0,0,405,724).data;});
   await page.locator('[data-hair-group=long]').click();assert.equal(await page.locator('[data-item]').count(),8);
   await page.waitForFunction(()=>longHairImages.length===8&&longHairImages.every(image=>image.complete&&image.naturalWidth));
   await page.locator(`[data-item="${hair}"]`).click();const comparison=await page.locator('.doll').evaluate(c=>{
    const short=window.shortHairPixels,long=c.getContext('2d').getImageData(0,0,405,724).data;let added=0,headChanged=0;
    for(let y=330;y<560;y++)for(let x=0;x<405;x++){const p=(y*405+x)*4;if(long[p+3]>200&&long.slice(p,p+4).some((value,c)=>Math.abs(value-short[p+c])>24))added++;}
    for(let y=50;y<180;y++)for(let x=90;x<315;x++){const p=(y*405+x)*4;if(short[p+3]>200&&long.slice(p,p+3).some((value,c)=>Math.abs(value-short[p+c])>24))headChanged++;}
    const preserved=[[200,250],[135,225],[260,225],[200,650]].every(([x,y])=>{const p=(y*405+x)*4;return long.slice(p,p+4).every((value,c)=>Math.abs(value-short[p+c])<=3);});
    return {added,preserved,headChanged};
   });
   assert.ok(comparison.added>800,`outfit ${outfit}, hair ${hair}: long tails must be visible (${comparison.added})`);
   assert.ok(comparison.headChanged>2000,`hair ${hair}: the old bob must be replaced, not retained (${comparison.headChanged})`);
   assert.ok(comparison.preserved,'face and shoes must stay unchanged apart from alpha rounding');
   const preview=await page.locator(`[data-hair="${hair}"]`).evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return {height:c.height,edge:[...Array(c.width).keys()].some(x=>d[x*4+3]||d[((c.height-1)*c.width+x)*4+3])};});
   assert.equal(preview.height,560);assert.equal(preview.edge,false,'long hair must fit inside preview');
   if(outfit===0)looks.push(await page.locator('.doll').evaluate(c=>c.toDataURL()));
  }
 }
 assert.equal(new Set(looks).size,8,'all eight long silhouettes must be distinct');
 const selected=await page.locator('.doll').evaluate(c=>c.toDataURL());
 await page.locator('[data-action=photo]').click();assert.equal(await page.locator('.export-preview').getAttribute('src'),selected);await page.locator('.modal-close').click();
 await page.locator('[data-page=home]').click();assert.equal(await page.locator('.doll').evaluate(c=>c.toDataURL()),selected,'home must show selected long hair');
 await page.reload();await page.waitForFunction(expected=>document.querySelector('.doll')?.toDataURL()===expected,selected);
 await page.locator('[data-category=hair]').click();assert.equal(await page.locator('[data-hair-group=long]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-item="15"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-hair-group=short]').click();await page.locator('[data-item="0"]').click();await page.locator('[data-hair-group=long]').click();await page.locator('[data-item="8"]').click();await page.locator('[data-action=undo]').click();assert.equal(await page.locator('[data-item="0"]').getAttribute('aria-pressed'),'true');
 await page.evaluate(()=>{Math.random=()=>.999;});await page.locator('[data-action=random]').click();assert.equal(await page.locator('[data-item="15"]').getAttribute('aria-pressed'),'true');
 await page.setViewportSize({width:320,height:568});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.locator('[data-item="8"]').click();await page.setViewportSize({width:390,height:844});
 fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/long-hair-phone.png'});
 const gallery=await browser.newPage({viewport:{width:1200,height:430},deviceScaleFactor:1});
 await gallery.setContent(`<body style="margin:0;background:#fce6ed;color:#875868;font:18px sans-serif"><h2 style="text-align:center;margin:22px">新增八款长发</h2><main style="display:grid;grid-template-columns:repeat(8,1fr);gap:8px;padding:16px">${looks.map((src,i)=>`<article style="background:#fff9f4;border:1px solid #e3afc3;border-radius:18px;text-align:center;padding:14px 0"><img src="${src}" style="width:100%;image-rendering:pixelated"><p>${['樱花长直','奶茶波浪','雾蓝双马尾','薄荷侧编','薰衣草长卷','蜂蜜双麻花','玫瑰高马尾','栗子公主辫'][i]}</p></article>`).join('')}</main></body>`);
 await gallery.screenshot({path:'docs/long-hair-preview.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log(`PASS: 8 long hairstyles × ${outfitCount} outfits, distinct visible tails, protected face/shoes, complete previews, home, export, reload, undo, random and 320px layout`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

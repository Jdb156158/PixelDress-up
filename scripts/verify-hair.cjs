const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.TEST_URL||'http://localhost:4186';
const hairPoints=[[200,45],[170,125],[210,160],[55,225],[340,270],[100,300],[300,305]];
const protectedPoints=[[200,250],[135,225],[260,225],[134,170],[238,171],[290,137],[350,137],[322,174],[82,251],[317,251]];
const hue=([r,g,b])=>{const hi=Math.max(r,g,b),lo=Math.min(r,g,b),delta=hi-lo;if(!delta)return 0;return ((hi===r?(g-b)/delta:hi===g?(b-r)/delta+2:(r-g)/delta+4)*60+360)%360;};
const pixel=(pixels,x,y)=>pixels.slice((y*405+x)*4,(y*405+x)*4+4);
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.waitForFunction(()=>document.querySelector('.doll')?.toDataURL().length>10000);
 const head=()=>page.locator('.doll').evaluate(c=>Array.from(c.getContext('2d').getImageData(0,0,405,330).data));
 for(let outfit=0;outfit<8;outfit++){
  await page.locator('[data-category=outfit]').click();await page.locator(`[data-item="${outfit}"]`).click();
  if(outfit>=3)await page.locator('#buy-outfit').click();
  await page.locator('[data-category=hair]').click();await page.locator('[data-item="0"]').click();const original=await head();
  for(let color=1;color<8;color++){
   await page.locator(`[data-item="${color}"]`).click();const dyed=await head();
   const anchorHue=hue(pixel(dyed,...hairPoints[0]));
   for(const point of hairPoints){
    const rgba=pixel(dyed,...point);assert.ok(rgba[3]>200,`hair sample must be opaque at ${point}`);
    const distance=Math.abs(hue(rgba)-anchorHue);assert.ok(Math.min(distance,360-distance)<12,`outfit ${outfit}, hair ${color}: missed highlight or tip at ${point}`);
   }
   for(const point of protectedPoints)assert.deepEqual(pixel(dyed,...point),pixel(original,...point),`outfit ${outfit}, hair ${color}: changed face, ear or bow at ${point}`);
   if(outfit===0){const preview=await page.locator(`[data-hair="${color}"]`).evaluate(c=>Array.from(c.getContext('2d').getImageData(0,0,405,330).data));assert.deepEqual(preview,dyed,'preview must match the actual hair tint');}
  }
  await page.locator('[data-item="0"]').click();assert.deepEqual(await head(),original,'original pink hair must be restored');
 }
 assert.deepEqual(errors,[]);console.log('PASS: all 8 outfits × 7 hair colors cover highlights, bangs and tips; face, ears and bow unchanged; previews match; pink restores');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

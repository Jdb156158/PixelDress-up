const {chromium}=require('playwright');
const assert=require('node:assert/strict');
require('node:fs').mkdirSync('test-results',{recursive:true});
const base=process.env.TEST_URL||'http://localhost:4186';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);
 const ghosts=()=>page.locator('.drag-ghost').count();
 const beginDrag=async()=>{
  const r=await page.locator('[data-cell="22"]').boundingBox();
  await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2+18,r.y+r.height/2+12,{steps:4});
  assert.equal(await ghosts(),1,'drag must show one temporary item');
 };
 for(const destination of ['home','dress']){
  await page.locator('[data-page="merge"]').click();const before=await page.locator('.cell').evaluateAll(els=>els.map(el=>el.getAttribute('aria-label')));await beginDrag();
  await page.locator(`[data-page="${destination}"]`).press('Enter');
  assert.equal(await ghosts(),0,`drag icon must not remain over ${destination}`);
  await page.mouse.up();assert.equal(await ghosts(),0,'released pointer must not revive a cancelled icon');
  await page.locator('[data-page="merge"]').click();assert.deepEqual(await page.locator('.cell').evaluateAll(els=>els.map(el=>el.getAttribute('aria-label'))),before,'switching pages must cancel without moving or merging items');
 }
 await page.locator('[data-page="merge"]').click();await beginDrag();
 await page.locator('[data-cell="24"]').press('Enter');
 assert.equal(await ghosts(),0,'board redraw must remove the previous drag');await page.mouse.up();
 await beginDrag();await page.locator('[data-cell="22"]').evaluate(el=>el.releasePointerCapture(1));await page.mouse.move(220,420);
 assert.equal(await ghosts(),0,'losing pointer capture must cancel the drag');await page.mouse.up();
 await beginDrag();await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
 assert.equal(await ghosts(),0,'window blur must cancel the drag');await page.mouse.up();
 await beginDrag();await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
 assert.equal(await ghosts(),0,'page visibility changes must cancel the drag');await page.mouse.up();
 await beginDrag();const target=await page.locator('[data-cell="23"]').boundingBox();await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:4});await page.mouse.up();
 assert.equal(await ghosts(),0);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('pixel-dress-up-v1')).board[23].level),1,'normal drag must still merge');
 await page.locator('[data-page="home"]').click();await page.screenshot({path:'test-results/merge-drag-home.png'});
 await page.locator('[data-page="dress"]').click();await page.screenshot({path:'test-results/merge-drag-dress.png'});
 const touchContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const touch=await touchContext.newPage();await touch.goto(base);await touch.locator('[data-page="merge"]').tap();
 const cd=await touchContext.newCDPSession(touch),r=await touch.locator('[data-cell="22"]').boundingBox(),x=r.x+r.width/2,y=r.y+r.height/2;
 await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+18,y:y+12}]});assert.equal(await touch.locator('.drag-ghost').count(),1);
 await cd.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.equal(await touch.locator('.drag-ghost').count(),0,'touch cancellation must remove the icon');
 await touch.locator('[data-page="home"]').tap();assert.equal(await touch.locator('.drag-ghost').count(),0);await touchContext.close();
 assert.deepEqual(errors,[]);console.log('PASS: page switches, board redraw, lost capture, blur, visibility and touch cancellation clear drag icons; normal merging works');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

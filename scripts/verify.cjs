const { chromium } = require('playwright');
const assert = require('node:assert/strict');
require('node:fs').mkdirSync('test-results', {recursive:true});
const base = process.env.TEST_URL || 'http://localhost:4186';
(async () => {
 const browser = await chromium.launch({ headless:true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {}) });
 const context = await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true,reducedMotion:'reduce'});
 const page = await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pixel-dress-up-v1')));
 const canvas=()=>page.locator('.doll').evaluate(c=>c.toDataURL());
 const click=s=>page.locator(s).click();
 try {
 await page.goto(base);await page.waitForFunction(()=>document.querySelector('.doll')?.toDataURL().length>10000);
 const original=await canvas();
 await click('[data-category="makeup"]');
 const visibleFace=()=>page.locator('.doll').evaluate(c=>{const scale=c.getBoundingClientRect().height/c.height;const face=document.createElement('canvas');face.width=Math.round(270*scale);face.height=Math.round(120*scale);const ctx=face.getContext('2d');ctx.drawImage(c,70,175,270,120,0,0,face.width,face.height);return Array.from(ctx.getImageData(0,0,face.width,face.height).data);});
 const bareFace=await visibleFace();
 for(let i=1;i<8;i++){
  await click(`[data-item="${i}"]`);const face=await visibleFace();let changed=0;
  for(let p=0;p<face.length;p+=4)if(Math.max(...[0,1,2].map(c=>Math.abs(face[p+c]-bareFace[p+c])))>=24)changed++;
  assert.ok(changed>=120,`makeup ${i} must be visible at phone size (${changed} changed pixels)`);
 }
 await click('[data-item="0"]');assert.equal(await canvas(),original);
 console.log('PASS: all seven makeup looks visibly change face at phone scale; natural look restores original');
 for(const [key,value] of [['hair',1],['face',2],['makeup',1],['shoes',2]]){
  await click(`[data-category="${key}"]`);const before=await canvas();await click(`[data-item="${value}"]`);assert.notEqual(await canvas(),before,`${key} must change doll pixels`);assert.equal((await saved())[key],value);
 }
 await click('[data-category="outfit"]');await click('[data-item="2"]');assert.equal((await saved()).outfit,2);
 await click('[data-action="undo"]');assert.equal((await saved()).outfit,0);
 await click('[data-item="3"]');await click('#buy-outfit');assert.equal((await saved()).coins,4280);assert.equal((await saved()).outfit,3);
 await click('[data-action="photo"]');const downloadPromise=page.waitForEvent('download');await click('#download-look');const download=await downloadPromise;assert.equal(download.suggestedFilename(),'pixel-dress-up.png');await click('.modal-close');
 await page.reload();await page.waitForFunction(()=>document.querySelector('.doll')?.toDataURL().length>10000);assert.equal((await saved()).outfit,3);assert.notEqual(await canvas(),original);
 console.log('PASS: five dress categories, undo, unlock, PNG export, persistence');
 await click('[data-page="home"]');await click('[data-action="edit"]');
 const furniture=page.locator('[data-furniture="1"]');const r=await furniture.boundingBox();
 await page.mouse.move(r.x+r.width*.5,r.y+r.height*.65);await page.mouse.down();await page.mouse.move(r.x+r.width*.5+30,r.y+r.height*.65+15,{steps:8});await page.mouse.up();
 await click('[data-action="flip"]');await click('[data-action="save-room"]');let room=(await saved()).furniture;assert.ok(room[0].x>17);assert.equal(room[0].flip,true);
 await click('[data-action="edit"]');await click('[data-add-furniture="3"]');await click('[data-action="save-room"]');assert.equal((await saved()).furniture.length,6);
 await click('[data-action="edit"]');await click('[data-action="collect"]');await click('[data-action="cancel-edit"]');assert.equal((await saved()).furniture.length,6);
 await page.reload();await click('[data-page="home"]');assert.equal(await page.locator('.furniture').count(),6);
 await page.screenshot({path:'test-results/home.png'});
 console.log('PASS: furniture drag, flip, add, save, cancel, reload');
 await click('[data-page="merge"]');await click('[data-cell="29"]');await click('[data-cell="30"]');assert.deepEqual((await saved()).board[30],{kind:'sweet',level:1});
 const coins=(await saved()).coins;await click('[data-action="order"]');let s=await saved();assert.equal(s.order,1);assert.equal(s.coins,coins+180);assert.equal(s.gems,37);assert.equal(s.board[30],null);assert.equal(s.board[38],null);
 await click('[data-cell="24"]');s=await saved();assert.equal(s.energy,119);assert.equal(s.produced,1);
 await click('[data-cell="0"]');assert.equal((await saved()).coins,coins+175);assert.equal((await saved()).board[0],null);
 const a=await page.locator('[data-cell="22"]').boundingBox(),b=await page.locator('[data-cell="23"]').boundingBox();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:10});await page.mouse.up();
 assert.equal((await saved()).board[23].level,1);assert.equal((await saved()).board[22],null);
 await page.reload();assert.equal((await saved()).order,1);
 console.log('PASS: click merge, drag merge, order consumption/rewards, generator, crate, persistence');
 for(const [w,h] of [[320,640],[390,844],[1440,1000]]){
  await page.setViewportSize({width:w,height:h});for(const view of ['dress','home','merge']){await click(`[data-page="${view}"]`);const dims=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,sh:document.documentElement.scrollHeight,ih:innerHeight}));assert.ok(dims.sw<=dims.iw,`${view} horizontal overflow at ${w}`);assert.ok(dims.sh<=dims.ih,`${view} vertical overflow at ${w}`);}
 }
 await click('[data-page="dress"]');await page.screenshot({path:'test-results/desktop.png'});
 assert.deepEqual(errors,[]);console.log('PASS: 320×640 / 390×844 / 1440×1000 layouts, no page or HTTP errors');
 await click('[data-action="settings"]');await click('#reset-game');await click('#confirm-reset');const reset=await saved();assert.equal(reset.coins,4580);assert.equal(reset.order,0);assert.deepEqual(reset.unlocked,[0,1,2]);assert.equal(reset.board[0].kind,'crate');assert.equal(reset.board[22].level,0);
 console.log('PASS: confirmed reset restores original resources, wardrobe and board');
 const touchContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const touch=await touchContext.newPage();await touch.goto(base);await touch.locator('[data-page="merge"]').tap();
 const cd=await touchContext.newCDPSession(touch);const t1=await touch.locator('[data-cell="31"]').boundingBox(),t2=await touch.locator('[data-cell="32"]').boundingBox();const tx=t1.x+t1.width/2,ty=t1.y+t1.height/2;
 await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tx,y:ty}]});for(let i=1;i<=8;i++)await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:tx+(t2.x-t1.x)*i/8,y:ty}]});await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.equal(await touch.evaluate(()=>JSON.parse(localStorage.getItem('pixel-dress-up-v1')).board[32].level),1);await touch.locator('[data-cell="24"]').tap();assert.equal(await touch.evaluate(()=>JSON.parse(localStorage.getItem('pixel-dress-up-v1')).energy),119);await touchContext.close();
 console.log('PASS: mobile touch drag merge and touch generator');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

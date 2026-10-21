const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.TEST_URL||'http://localhost:4186/';
const names=['草莓奶油','午后心事','晴空来信','午夜玫瑰','葡萄软糖','薄荷来信','桃子汽水','月光晚安'];
fs.mkdirSync('test-results/outfit-audit',{recursive:true});
fs.mkdirSync('docs/outfit-audit',{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{
  const context=await browser.newContext({viewport:{width:815,height:871},deviceScaleFactor:2});const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(base);await page.waitForFunction(()=>document.body.dataset.characterReady==='true');
  await page.evaluate(()=>{window.doll3d.controls.enableDamping=false;window.doll3d.mixer.timeScale=0;});
  const draw=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  async function pose(motion,angle,time=.5){
   await page.evaluate(({motion,angle,time})=>{const d=window.doll3d;d.play(motion);d.mixer.timeScale=1;d.mixer.update(.4);d.mixer.setTime(time);d.mixer.timeScale=0;const c=d.controls;c.object.position.set(Math.sin(angle)*5,1.16,Math.cos(angle)*5);c.update();},{motion,angle,time});await draw();
  }
  async function handProbe(){
   const pixels=()=>page.evaluate(()=>{const d=window.doll3d,c=document.querySelector('.doll'),copy=document.createElement('canvas');copy.width=c.width;copy.height=c.height;const ctx=copy.getContext('2d');ctx.drawImage(c,0,0);return[-1,1].map(sign=>{const v=d.controls.target.clone().set(sign*.63,.825,.02).project(d.controls.object),r=Math.round(c.height*.09/2.37);return Array.from(ctx.getImageData(Math.round((1+v.x)*c.width/2-r),Math.round((1-v.y)*c.height/2-r),r*2,r*2).data);});});
   const before=await pixels();await page.evaluate(async()=>{const T=await import('three'),image=new T.DataTexture(new Uint8Array([0,255,0,255]),1,1);image.needsUpdate=true;window.skinProbe=[];window.doll3d.model.traverse(n=>{const u=n.material?.userData?.paint;if(u&&['body','hands'].includes(n.material.userData.slot)){window.skinProbe.push([u,u.characterPaint.value]);u.characterPaint.value=image;}});});await draw();assert.deepEqual(await pixels(),before,'a reference image must never add hand details');await page.evaluate(()=>{for(const[u,image]of window.skinProbe)u.characterPaint.value=image;delete window.skinProbe;});await draw();
  }
  const reports=[];
  for(let outfit=0;outfit<8;outfit++){
   await page.locator(`[data-item="${outfit}"]`).click();if(outfit>2)await page.locator('#buy-outfit').click();await page.waitForFunction(i=>window.doll3d.look.outfit===i,outfit);
   await pose('idle',0,0);await handProbe();
   if([1,2,5,6].includes(outfit)){
    const raisedCaps=await page.evaluate(async()=>{const T=await import('three'),d=window.doll3d,points=[];d.model.updateMatrixWorld(true);for(const sign of[-1,1]){const ray=new T.Raycaster(new T.Vector3(sign*.32,1.20,-5),new T.Vector3(0,0,1));points.push(ray.intersectObject(d.model,true).filter(hit=>hit.object.visible&&hit.object.parent.visible&&hit.object.material?.userData.slot==='outfit').length);}return points;});
    assert.deepEqual(raisedCaps,[0,0],'sleeve caps must not protrude above either rear shoulder');
   }
   const frames=[];
   for(const [label,motion,angle,time]of [['正面','idle',0,0],['右侧','idle',Math.PI/2,0],['背面','idle',Math.PI,0],['左侧','idle',-Math.PI/2,0],['挥手','wave',0,.5],['走路','walk',Math.PI/6,.375]]){
    await pose(motion,angle,time);
    if(label==='背面'&&[3,7].includes(outfit))await page.locator('.dress-scene').screenshot({path:`docs/outfit-${outfit+1}-rear-room.png`});
    frames.push({label,src:await page.locator('.doll').evaluate(c=>c.toDataURL())});
    const valid=await page.evaluate(()=>{const active=[];let finite=true;window.doll3d.model.traverse(n=>{if(n.userData.slot&&n.visible)active.push(n.userData.slot);if(n.isBone&&!n.matrixWorld.elements.every(Number.isFinite))finite=false;});return{active,finite};});
    assert.equal(valid.active.filter(s=>s==='hands').length,1);assert.equal(valid.active.filter(s=>s==='outfit').length,1);assert.equal(valid.finite,true);
   }
   // Scrub the complete clips, including all raised-arm and stride extrema.
   for(const motion of ['wave','walk'])for(let frame=0;frame<=12;frame++){
    await pose(motion,0,frame*.25);
    assert.equal(await page.evaluate(()=>{let valid=true;window.doll3d.model.traverse(n=>{if(n.isBone&&!n.matrixWorld.elements.every(Number.isFinite))valid=false;});return valid;}),true);
   }
   const sheet=await context.newPage();await sheet.setViewportSize({width:960,height:920});await sheet.setContent(`<body style="margin:0;padding:18px;background:#fff2f6;color:#754455;font:15px sans-serif;text-align:center"><h2 style="margin:0 0 12px">${outfit+1}. ${names[outfit]}</h2><main style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${frames.map(f=>`<section style="background:#c5d8db;border:1px solid #edc9d4;border-radius:18px"><img src="${f.src}" style="width:100%;height:365px;object-fit:contain"><p style="margin:4px 0 12px">${f.label}</p></section>`).join('')}</main></body>`);await sheet.screenshot({path:`docs/outfit-audit/${outfit+1}.png`,fullPage:true});await sheet.close();
   reports.push({outfit,name:names[outfit],views:frames.map(f=>f.label),motionFrames:26,handTextureIndependent:true});console.log(`PASS ${outfit+1}/8 ${names[outfit]}: four views, wave and walk, full clips, hand texture isolation`);
  }
  assert.deepEqual(errors,[]);fs.writeFileSync('test-results/outfit-audit/report.json',JSON.stringify(reports,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

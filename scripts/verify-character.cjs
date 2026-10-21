const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.TEST_URL||'http://localhost:4186/';
fs.mkdirSync('test-results',{recursive:true});
function checkAsset(){
 const bytes=fs.readFileSync('dist/assets/character-3d/strawberry.vrm');assert.equal(bytes.toString('ascii',0,4),'glTF');
 const jsonLength=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.toString('utf8',20,20+jsonLength));
 assert.ok(gltf.extensions.VRMC_vrm);assert.ok(gltf.extensions.VRMC_springBone);assert.equal(gltf.images?.length||0,0,'the character must be real geometry, not layered image planes');
 assert.deepEqual(gltf.animations.map(a=>a.name).sort(),['idle','walk','wave']);
 const humanoid=gltf.extensions.VRMC_vrm.humanoid.humanBones;
 for(const name of ['hips','spine','chest','head','leftUpperArm','rightHand','leftUpperLeg','rightFoot'])assert.ok(humanoid[name]);
 const groups=gltf.nodes.filter(n=>n.extras?.slot);assert.equal(groups.length,18);
 const bob=groups.find(n=>n.extras.slot==='hair'&&n.extras.option===0);
 const wig=gltf.meshes[bob.mesh].primitives.find(p=>gltf.materials[p.material].name==='rose hair');
 const bounds=gltf.accessors[wig.attributes.POSITION],depth=bounds.max[2]-bounds.min[2],width=bounds.max[0]-bounds.min[0];
 assert.ok(depth/width>.85,'the default head silhouette needs rounded front-to-back volume');
 for(const group of groups){assert.equal(group.skin,0,'all modules must share the same authored skin');for(const primitive of gltf.meshes[group.mesh].primitives){assert.ok(primitive.attributes.JOINTS_0!==undefined);assert.ok(primitive.attributes.WEIGHTS_0!==undefined);}}
 assert.equal(gltf.skins[0].joints.length,24);
 const binaryOffset=28+jsonLength;
 for(const mesh of gltf.meshes)for(const primitive of mesh.primitives){
  const accessor=gltf.accessors[primitive.attributes.WEIGHTS_0],view=gltf.bufferViews[accessor.bufferView];
  assert.equal(accessor.componentType,5126);
  for(let i=0;i<accessor.count;i++){const offset=binaryOffset+(view.byteOffset||0)+(accessor.byteOffset||0)+i*(view.byteStride||16);let sum=0;for(let k=0;k<4;k++)sum+=bytes.readFloatLE(offset+k*4);assert.ok(Math.abs(sum-1)<.002,'skin weights must be normalized');}
 }
 console.log('PASS: original 3D geometry, VRM humanoid and spring bones, 24 shared bones, 18 weighted modules, 3 native animation clips');
}
(async()=>{
 checkAsset();
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{
 const context=await browser.newContext({viewport:{width:815,height:871},acceptDownloads:true});const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(base);await page.waitForFunction(()=>document.body.dataset.characterReady==='true');
 const click=s=>page.locator(s).click();
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pixel-dress-up-v1')));
 const look=()=>page.evaluate(()=>window.doll3d.look);
 async function choose(category,i){await click(`[data-category="${category}"]`);if(category==='hair')await click(`[data-hair-group="${i<8?'short':'long'}"]`);await click(`[data-item="${i}"]`);await page.waitForFunction(({category,i})=>window.doll3d.look[category]===i,{category,i});}
 await page.evaluate(()=>{window.doll3d.mixer.timeScale=0;});
 const signatures={};
 for(const [category,count] of [['hair',16],['face',8],['makeup',8],['shoes',8]]){
  signatures[category]=new Set();
  for(let i=0;i<count;i++){
   await choose(category,i);assert.equal((await state())[category],i);assert.equal((await look())[category],i);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   signatures[category].add(await page.locator('.doll').evaluate(c=>c.toDataURL()));
   const part=await page.evaluate(()=>{const out=[];window.doll3d.model.traverse(n=>{if(n.userData.slot&&n.visible)out.push([n.userData.slot,n.userData.option]);});return out;});
   for(const slot of ['body','hair','outfit','shoes','hands'])assert.equal(part.filter(p=>p[0]===slot).length,1);
  }
  assert.ok(signatures[category].size>=(category==='hair'?8:count),`${category} choices must actually change rendered pixels while animation is paused`);
 }
 await click('[data-category=outfit]');
 for(let i=0;i<8;i++){await click(`[data-item="${i}"]`);if(i>2)await click('#buy-outfit');assert.equal((await look()).outfit,i);}
 // Changing the reference image must never draw another hand onto the physical skin meshes.
 await choose('outfit',0);
 const handPixels=()=>page.evaluate(()=>{
  const c=document.querySelector('.doll'),copy=document.createElement('canvas');copy.width=c.width;copy.height=c.height;const ctx=copy.getContext('2d');ctx.drawImage(c,0,0);
  return [-1,1].map(sign=>{const point=window.doll3d.controls.target.clone().set(sign*.63,.825,.02).project(window.doll3d.controls.object),x=(point.x+1)*c.width/2,y=(1-point.y)*c.height/2,r=Math.round(c.height*.09/2.37);return Array.from(ctx.getImageData(Math.round(x-r),Math.round(y-r),r*2,r*2).data);});
 });
 const physicalHands=await handPixels();
 await page.evaluate(async()=>{const THREE=await import('three');window.skinProbe=[];const image=new THREE.DataTexture(new Uint8Array([0,255,0,255]),1,1);image.needsUpdate=true;window.doll3d.model.traverse(node=>{const u=node.material?.userData?.paint;if(u&&['body','hands'].includes(node.material.userData.slot)){window.skinProbe.push([u,u.characterPaint.value]);u.characterPaint.value=image;}});});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 assert.deepEqual(await handPixels(),physicalHands,'arms and hands must never sample the reference body image');
 await page.evaluate(()=>{for(const [u,image]of window.skinProbe)u.characterPaint.value=image;delete window.skinProbe;});
 console.log('PASS: actual hand pixels stay unchanged when the body reference texture is replaced; no painted extra hands');
 const beforeUndo=(await state()).outfit;await click('[data-action=undo]');assert.notEqual((await look()).outfit,beforeUndo);
 await click('[data-action=random]');assert.equal((await look()).hair,(await state()).hair);
 console.log('PASS: all 16 hair looks, eight eye / makeup / shoe looks, eight outfits, coin unlocking, undo, random; original state drives 3D modules');
 await page.evaluate(()=>{window.doll3d.mixer.timeScale=1;window.doll3d.play('idle');});
 const box=await page.locator('.doll').boundingBox(),angle=await page.evaluate(()=>window.doll3d.controls.getAzimuthalAngle());
 await page.mouse.move(box.x+box.width*.7,box.y+box.height*.55);await page.mouse.down();await page.mouse.move(box.x+box.width*.25,box.y+box.height*.55,{steps:12});await page.mouse.up();await page.waitForTimeout(180);assert.ok(Math.abs(await page.evaluate(()=>window.doll3d.controls.getAzimuthalAngle())-angle)>.4);
 await page.locator('.doll').dblclick();assert.equal(await page.evaluate(()=>window.doll3d.motion),'idle');assert.ok(Math.abs(await page.evaluate(()=>window.doll3d.controls.getAzimuthalAngle()))<.01);
 await page.locator('.doll').click();assert.equal(await page.evaluate(()=>window.doll3d.motion),'wave');await page.locator('.doll').press('Space');assert.equal(await page.evaluate(()=>window.doll3d.motion),'walk');
 const bones=()=>page.evaluate(()=>{let wrist;window.doll3d.model.traverse(n=>{if(n.name==='rightHand')wrist=n.matrixWorld.elements.slice();});return wrist;});
 const wrist=await bones();await page.waitForTimeout(150);assert.notDeepEqual(await bones(),wrist);
 await choose('hair',0);assert.equal(await page.evaluate(()=>window.doll3d.motion),'walk');
 await click('[data-action=photo]');assert.ok((await page.locator('.export-preview').getAttribute('src')).length>10000);const dl=page.waitForEvent('download');await click('#download-look');assert.equal((await dl).suggestedFilename(),'pixel-dress-up.png');await click('.modal-close');
 const saved=await state();await page.reload();await page.waitForFunction(()=>document.body.dataset.characterReady==='true');assert.equal((await look()).hair,saved.hair);assert.equal((await look()).outfit,saved.outfit);
 console.log('PASS: actual rotation and skeletal motion, swap while walking, original PNG export and original saved progress');
 for(let i=0;i<3;i++){
  await click('[data-page=merge]');assert.equal(await page.locator('.doll').count(),0);assert.equal(await page.locator('.cell').count(),63);
  await click('[data-page=home]');assert.equal(await page.locator('.doll-3d').count(),1);assert.equal((await look()).hair,saved.hair);
  await click('[data-page=dress]');assert.equal(await page.locator('.doll-3d').count(),1);
 }
 await click('[data-page=home]');await click('[data-action=edit]');await click('[data-action=flip]');await click('[data-action=save-room]');assert.equal((await state()).furniture[0].flip,true);assert.equal(await page.locator('.doll-3d').count(),1);
 await click('[data-page=merge]');await click('[data-cell="29"]');await click('[data-cell="30"]');assert.equal((await state()).board[30].level,1);await click('[data-action=order]');assert.equal((await state()).order,1);await click('[data-cell="24"]');assert.equal((await state()).energy,119);
 console.log('PASS: home / merge / dress transitions, furniture save, merge, order and generation with original game logic');
 const original=await context.newPage();await original.goto(new URL('./classic.html',base).href);
 const layout=target=>target.evaluate(()=>Object.fromEntries(['#game','.hud','#content','.scene','.categories','.wardrobe','.bottom-nav'].map(s=>{const r=document.querySelector(s)?.getBoundingClientRect();return[s,r&&[r.x,r.y,r.width,r.height].map(x=>Math.round(x*100)/100)];})));
 for(const [width,height]of [[320,640],[390,844],[815,871],[1440,1000]]){
  await page.setViewportSize({width,height});await original.setViewportSize({width,height});
  for(const view of ['dress','home','merge']){
   await click(`[data-page=${view}]`);await original.locator(`[data-page=${view}]`).click();assert.deepEqual(await layout(page),await layout(original),`${view} must retain original layout at ${width}`);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight),false);
  }
 }
 await click('[data-page=dress]');
 await page.evaluate(()=>window.doll3d.front());await choose('outfit',0);await choose('hair',0);await choose('face',0);await choose('makeup',0);await choose('shoes',0);await page.evaluate(()=>window.doll3d.play('idle'));
 await click('[data-category=outfit]');
 await page.setViewportSize({width:815,height:871});await page.screenshot({path:'docs/character-3d-preview.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'docs/character-3d-mobile.png'});
 await choose('hair',8);const snaps=[];
 for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]){await page.evaluate(angle=>{const c=window.doll3d.controls;c.enableDamping=false;c.object.position.set(Math.sin(angle)*5,1.16,Math.cos(angle)*5);c.update();},angle);await page.waitForTimeout(80);snaps.push(await page.locator('.doll').screenshot());}
 for(let i=0;i<snaps.length;i++)fs.writeFileSync(`test-results/character-view-${i}.png`,snaps[i]);
 const gallery=await context.newPage();await gallery.setViewportSize({width:1240,height:590});await gallery.setContent(`<body style="margin:0;background:#fff2f5;color:#844b61;font:16px sans-serif;text-align:center"><h2>同一个模型的正面、侧面与背面</h2><main style="display:flex;justify-content:center;gap:12px">${snaps.map((bytes,i)=>`<section><img style="width:280px;height:450px;object-fit:contain;border-radius:16px" src="data:image/png;base64,${bytes.toString('base64')}"><p>${['正面','右侧','背面','左侧'][i]}</p></section>`).join('')}</main></body>`);await gallery.screenshot({path:'docs/character-3d-views.png'});await gallery.close();

 const phoneContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const phone=await phoneContext.newPage();await phone.goto(base);await phone.waitForFunction(()=>document.body.dataset.characterReady==='true');
 const r=await phone.locator('.doll').boundingBox(),cdp=await phoneContext.newCDPSession(phone);const start=await phone.evaluate(()=>window.doll3d.controls.getAzimuthalAngle());
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width*.8,y:r.y+r.height*.6}]});for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:r.x+r.width*(.8-.6*i/8),y:r.y+r.height*.6}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await phone.waitForTimeout(150);assert.ok(Math.abs(await phone.evaluate(()=>window.doll3d.controls.getAzimuthalAngle())-start)>.4);
 await phone.locator('[data-page=merge]').tap();assert.equal(await phone.locator('.doll-3d').count(),0);await phone.locator('[data-page=dress]').tap();assert.equal(await phone.locator('.doll-3d').count(),1);
 assert.deepEqual(errors,[]);console.log('PASS: exact original page region sizes at four viewport widths, real touch rotation, no page or HTTP errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

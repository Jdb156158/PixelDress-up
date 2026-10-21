import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {VRMLoaderPlugin} from '@pixiv/three-vrm';
import {paintedMaterial,tintPaint,hairBoundsTexture} from './doll-paint.js?v=7';

// This renderer uses the existing game's state, scene position and UI. It never owns game logic.
const canvas=document.createElement('canvas');canvas.className='doll doll-3d';canvas.tabIndex=0;
canvas.setAttribute('aria-label','当前搭配的 3D 女孩，拖动旋转，轻点挥手，双击回到正面，空格切换走路');
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-.7,.7,1.2,-1.2,.1,20);
camera.position.set(0,1.16,5);
const controls=new OrbitControls(camera,canvas);controls.target.set(0,1.12,0);controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=true;controls.dampingFactor=.12;controls.rotateSpeed=.7;controls.minPolarAngle=Math.PI*.40;controls.maxPolarAngle=Math.PI*.56;controls.update();
const textureLoader=new THREE.TextureLoader();
const [characterPaint,outfitPaint]=await Promise.all(['strawberry-paint.png','outfits-paint.png'].map(name=>textureLoader.loadAsync('assets/character-3d/'+name)));
for(const texture of [characterPaint,outfitPaint]){texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;}
const images={character:characterPaint,outfits:outfitPaint,bounds:hairBoundsTexture(characterPaint.image)};
const unlit=new Set(['cocoa lashes','berry eyes','iris glow','milk highlights','rose cheeks','smile','eye shadow']);
const materials=[],parts=[];let model,vrm,mixer,action,motion='idle',look,pending=window.dollLook,ready=false,last=performance.now(),elapsed=1,pointerStart;
const hairPalette=['#ef8fa8','#a67d67','#a4b9cb','#a6c9b6','#b6a3d3','#edc889','#cb6784','#96705e'];
const eyePalette=['#76253e','#69527f','#427966','#9d7338','#4f789a','#a1466d','#715347','#464350'];
const faceCheeks=['#f7a2ac','#ee929e','#faadbc','#efb393','#dc82aa','#c5a5d6','#f69a8b','#d38fa6'];
const lipPalette=['#c75f79','#bf5b66','#cb527e','#b97857','#a84674','#ad78a4','#c86c62','#b4507b'];
function applyLook(state){
 look={...state};
 const hair=Number(state.hair)||0,outfit=Number(state.outfit)||0,shoe=Number(state.shoes)||0;
 const hairPart=hair<8?0:hair-7,outfitPart=[0,1,2,3,0,2,1,3][outfit],shoePart=[0,0,1,0,0,1,0,0][shoe];
 for(const part of parts){const {slot,option}=part.userData;part.visible=slot==='body'||slot==='hands'&&Number(option)===0||slot==='hair'&&Number(option)===hairPart||slot==='outfit'&&Number(option)===outfitPart||slot==='shoes'&&Number(option)===shoePart;}
 const palette=hairPalette[hair<8?hair:hair-8];
 for(const material of materials){
  const slot=material.userData.slot,u=material.userData.paint;
  u.paintHue.value=0;u.paintSaturation.value=1;u.paintGain.value=1;
  if(slot==='hair'||slot==='body')tintPaint(material,palette,hairPalette[0]);
  if(slot==='shoes')tintPaint(material,['#e96b99','#b7876b','#7898b7','#4d3c49','#b28ace','#85bba9','#81605b','#b65c7d'][shoe],'#e96b99');
  if(slot==='outfit'&&outfit>=4)tintPaint(material,['#b39be0','#8fcab7','#eda18e','#b8a27b'][outfit-4],outfit===5?'#789cc4':'#ed719e');
  u.paintEye.value.set(eyePalette[state.face||0]).convertLinearToSRGB();u.paintCheek.value.set(faceCheeks[state.makeup||0]).convertLinearToSRGB();u.paintLip.value.set(lipPalette[state.makeup||0]).convertLinearToSRGB();u.paintMakeup.value=state.makeup?1:0;
 }

}
function resize(){if(!canvas.isConnected)return;const {width,height}=canvas.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);const h=2.37;camera.left=-h*width/height/2;camera.right=h*width/height/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();}
const observer=new ResizeObserver(resize);observer.observe(canvas);
function front(){const damping=controls.enableDamping;controls.enableDamping=false;controls.update();camera.position.set(0,1.16,5);controls.target.set(0,1.12,0);controls.update();controls.enableDamping=damping;}
function play(name){if(!ready)return;const clip=model.animations.find(clip=>clip.name===name);if(!clip)return;const next=mixer.clipAction(clip);if(next!==action){next.reset().play();action?.fadeOut(.2);next.fadeIn(.2);action=next;}motion=name;}
function mount(detail){
 pending=detail;if(!detail)return;
 const placeholder=document.querySelector('.doll');
 if(!placeholder){canvas.remove();return;}
 if(placeholder!==canvas){placeholder.replaceWith(canvas);resize();}
 canvas.style.pointerEvents=detail.page==='home'?'none':'';
 if(ready)applyLook(detail.state);
}
window.addEventListener('doll-look',event=>mount(event.detail));
canvas.addEventListener('pointerdown',event=>{pointerStart={x:event.clientX,y:event.clientY};});
canvas.addEventListener('pointerup',event=>{if(pointerStart&&Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)<5)play(motion==='wave'?'idle':'wave');pointerStart=null;});
canvas.addEventListener('dblclick',()=>{front();play('idle');});
canvas.addEventListener('keydown',event=>{if(event.code==='Space'){event.preventDefault();play(motion==='walk'?'idle':'walk');}if(event.key==='Home'){event.preventDefault();front();}if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const offset=camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0,1,0),event.key==='ArrowLeft'?.3:-.3);camera.position.copy(controls.target).add(offset);controls.update();}});
const loader=new GLTFLoader();loader.register(parser=>new VRMLoaderPlugin(parser));
try{
 const gltf=await loader.loadAsync('assets/character-3d/strawberry.vrm?v=7');model=gltf.scene;model.animations=gltf.animations;vrm=gltf.userData.vrm;vrm.humanoid.autoUpdateHumanBones=false;
 const meshes=[];model.traverse(node=>{if(node.userData.slot)parts.push(node);if(node.isMesh)meshes.push(node);});
 for(const node of meshes){
  let owner=node;while(owner&&!owner.userData.slot)owner=owner.parent;const slot=owner?.userData.slot;
  const source=node.material;
  // The painted facial surface replaces the prototype's separate round eyes and drawn tubes.
  if(slot==='body'&&source.name!=='peach porcelain'||slot==='hair'&&['hair satin','hair shadows'].includes(source.name)){node.visible=false;continue;}
  const material=paintedMaterial(source,slot,owner?.userData.option,images);
  node.material=material;node.frustumCulled=false;materials.push(material);
  if(slot!=='hair'&&!unlit.has(source.name)&&!['hair satin','hair shadows','warm gold'].includes(source.name)){
   const outlineMaterial=new THREE.MeshBasicMaterial({color:slot==='hair'?0x8a324f:0x875261,side:THREE.BackSide});
   outlineMaterial.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed += normal * 0.0015;');};
   const outline=new THREE.SkinnedMesh(node.geometry,outlineMaterial);outline.bind(node.skeleton,node.bindMatrix);outline.morphTargetInfluences=node.morphTargetInfluences;outline.frustumCulled=false;outline.userData.outline=true;node.add(outline);
  }
 }
 scene.add(model);mixer=new THREE.AnimationMixer(model);ready=true;mount(pending);play('idle');document.body.dataset.characterReady='true';
}catch(error){console.error('3D 人物加载失败',error);canvas.setAttribute('aria-label','人物加载失败，请刷新重试');}
renderer.setAnimationLoop(now=>{const delta=Math.min((now-last)/1000,.04);last=now;if(!ready||!canvas.isConnected||document.hidden)return;elapsed+=delta;mixer.update(delta);const phase=elapsed%5.2;vrm.expressionManager.setValue('blink',phase<.12?Math.sin(phase/.12*Math.PI):0);vrm.update(delta);controls.update();renderer.render(scene,camera);});
window.doll3d={front,play,get motion(){return motion;},get model(){return model;},get look(){return look;},get renderer(){return renderer;},get mixer(){return mixer;},controls};
mount(pending);

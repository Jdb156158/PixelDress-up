'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const KEY = 'pixel-dress-up-v1';
const icons = {
 home:'<g stroke-linejoin="round" stroke-linecap="round"><path d="M23 5h4v9h-4Z" fill="#f8d6dc" stroke="#bd708c" stroke-width="1.2"/><path d="M6 15 16 6l10 9v14H6Z" fill="#fff4e3" stroke="#bf8790" stroke-width="1.2"/><path d="M2 15 15 3q1-1 2 0l13 12-3 3L16 8 5 18Z" fill="#ec88aa" stroke="#bc6688" stroke-width="1.2"/><path d="m5 14 11-10 11 10" fill="none" stroke="#ffc4d6" stroke-width="1.2"/><path d="M12 19h8v10h-8Z" fill="#f4a0bb" stroke="#bd708c" stroke-width="1.1"/><path d="M16 20v8m-3-4h6" stroke="#ffe7e9" stroke-width=".9"/><path d="M4 29h24" stroke="#cfb49b" stroke-width="2"/><path d="M2 28q-2-5 2-5 0-5 3-3 4 0 2 5 3 4-2 4Zm25 1q-4-3 0-5-1-5 3-4 4 2 1 5 3 4-4 4Z" fill="#97b96d" stroke="#7f9e5b" stroke-width=".8"/><path d="M5 24v5m24-5-1 5" stroke="#d5df9b" stroke-width="1"/></g>',
 merge:'<g stroke-linejoin="round"><path d="M3 10h6V7a3 3 0 0 1 6 0v3h6v6h-3a3 3 0 0 0 0 6h3v7H3v-7h3a3 3 0 0 0 0-6H3Z" fill="#f198b6" stroke="#bf6d90" stroke-width="1.3"/><path d="M5 12h6V7a1 1 0 0 1 2 0" fill="none" stroke="#ffd3e0" stroke-width="1.2" stroke-linecap="round"/><path d="M21 10h1V7a3 3 0 0 1 6 0v3h2v6h-2a3 3 0 0 0 0 6h2v7h-9v-7h-3a3 3 0 0 1 0-6h3Z" fill="#ffd15a" stroke="#d4a23c" stroke-width="1.3"/><path d="M23 12h1V7a1 1 0 0 1 2 0m-3 20h5" fill="none" stroke="#fff1ab" stroke-width="1.2" stroke-linecap="round"/></g>',
 dress:'<g stroke-linejoin="round" stroke-linecap="round"><path d="m11 3 5 3 5-3 2 5-4 5 10 15q-13 5-26 0l10-15-4-5Z" fill="#f4a4c4" stroke="#b85d85" stroke-width="1.3"/><path d="m12 5 4 3 4-3m-7 8h6" fill="none" stroke="#fff5e7" stroke-width="1.8"/><path d="m13 16-5 11m8-11v13m3-13 5 11" fill="none" stroke="#ffdae8" stroke-width="1.5"/><path d="M5 27q11 4 22 0" fill="none" stroke="#fff0e6" stroke-width="2"/><path d="m12 12 4 2 4-2v5l-4-2-4 2Z" fill="#e678a4" stroke="#b85d85" stroke-width=".8"/><circle cx="16" cy="14" r="1.3" fill="#ffe0eb"/></g>',
 face:'<g stroke-linejoin="round"><path d="M5 19C2 8 8 2 16 2s14 6 11 17l-5 7H10Z" fill="#b48679" stroke="#a1746b" stroke-width=".8"/><circle cx="6" cy="19" r="3" fill="#f8dfc9"/><circle cx="26" cy="19" r="3" fill="#f8dfc9"/><path d="M7 13q9-1 12-7 2 7 6 8v8c-1 10-17 10-18 0Z" fill="#ffebd7" stroke="#d9b6a6" stroke-width=".7"/><path d="M5 17C4 6 10 3 17 3q12 1 10 14-6-2-9-9-2 7-13 9Z" fill="#b48679"/><path d="M8 9q3-4 7-4" fill="none" stroke="#d2a293" stroke-width="1.2" stroke-linecap="round"/></g>',
 hair:'<g stroke-linejoin="round"><path d="M16 3C5 3 2 12 4 26l7 3 2-10h6l2 10 7-3C31 12 27 3 16 3Z" fill="#bd8b83" stroke="#a67470" stroke-width=".9"/><path d="M10 14h12v9q-6 9-12 0Z" fill="#fff0df"/><path d="M7 17C6 7 13 5 18 5q8 0 8 12l-5-2-2-6-2 6-5-2-1 5Z" fill="#bd8b83"/><path d="M8 13q1-6 6-7m-8 15 1 4m18-4-1 4" fill="none" stroke="#d6aaa0" stroke-width="1.2" stroke-linecap="round"/></g>',
 makeup:'<g transform="rotate(14 16 16)" stroke-linejoin="round"><path d="M12 16V7q0-3 8-5v14Z" fill="#ed83a3" stroke="#aa677b" stroke-width="1"/><path d="M14 7q2-2 4-2v9" fill="none" stroke="#ffc1ce" stroke-width="1.5" stroke-linecap="round"/><path d="M11 15h10v8H11Z" fill="#e6b36d" stroke="#b68555" stroke-width="1"/><path d="M13 17v4" stroke="#ffe6a0" stroke-width="1.8"/><path d="M10 23h12v7H10Z" fill="#b77f64" stroke="#95684f" stroke-width="1"/><path d="M12 24h8" stroke="#dba98a" stroke-width="1"/></g>',
 shirt:'<g stroke-linejoin="round" stroke-linecap="round"><path d="m9 4-7 6 5 7 4-2v14h10V15l4 2 5-7-7-6-7 3Z" fill="#ee82ad" stroke="#cf6994" stroke-width="1.1"/><path d="M11 5q5 6 10 0" fill="none" stroke="#cd5c8a" stroke-width="1.5"/><path d="m5 10 4-3m4 11v8m2 1h4" fill="none" stroke="#f7a3c3" stroke-width="1.3"/></g>',
 shoes:'<g stroke-linejoin="round" stroke-linecap="round"><path d="M4 22c6 0 10-4 14-10l4-7 7 3-3 9-2 12h-3l-1-9C14 25 8 28 3 26q-2-2 1-4Z" fill="#c7859a" stroke="#966677" stroke-width="1.2"/><path d="m18 12 5-6 4 2-4 9Z" fill="#f7d1da" stroke="#ad7187" stroke-width=".9"/><path d="M5 23q6 0 10-4m7 3v5" fill="none" stroke="#edb3c7" stroke-width="1.2"/><path d="M4 26q7 2 16-6m2 9h3" fill="none" stroke="#9c6378" stroke-width="1.2"/></g>',
 undo:'<path d="M11 7 3 13l8 6v-5h7q9 0 9 12h4Q32 9 18 9h-7Z"/>',
 random:'<path d="m22 1 9 7-9 7V9c-8 0-12 18-21 18v-5C9 22 12 4 22 4Z"/><path d="m22 17 9 7-9 7v-5h-3l-6-7 3-4 5 6h1Z"/><path d="m1 5 6 0 6 7-3 4-5-6H1Z"/>',
 camera:'<path d="M1 8h8l3-5h8l3 5h8v22H1Z"/><circle cx="16" cy="19" r="7" fill="#fff6ee"/>',
 settings:'<path d="m13 1 6 0 2 5 5 1 4 5-3 5 1 5-5 5-5-1-5 4-5-3v-6l-5-4 1-6 5-2Z"/><circle cx="16" cy="15" r="5" fill="#fff8ef"/>',
 sofa:'<path d="M6 5h20v16H6Z"/><path d="M1 13h7v11h16V13h7v16H1Z"/>',
 flip:'<path d="m13 2-12 14 12 14Zm6 0 12 14-12 14Z"/>',
 collect:'<path d="M3 15h7l6 7 6-7h7v15H3Z"/><path d="M13 1h6v11h6l-9 9-9-9h6Z"/>',
 check:'<path d="m2 17 5-5 6 6L26 3l5 5-18 22Z"/>',
 lock:'<path d="M8 14V9a8 8 0 0 1 16 0v5h4v17H4V14Zm4 0h8V9a4 4 0 0 0-8 0Z"/>',
 close:'<path d="m5 1 11 11L27 1l4 4-11 11 11 11-4 4-11-11L5 31l-4-4 11-11L1 5Z"/>',
 heart:'<path d="M16 29 3 16C-5 5 10-3 16 7c6-10 21-2 13 9Z"/>'
};
function icon(name) { return `<svg viewBox="0 0 32 32" aria-hidden="true" fill="currentColor">${icons[name] || icons.heart}</svg>`; }
$$('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
const initialFurniture = [
 {id:1,type:0,x:17,y:77,w:43,flip:false},
 {id:2,type:1,x:85,y:96,w:42,flip:false},
 {id:3,type:2,x:50,y:87,w:57,flip:false},
 {id:4,type:5,x:88,y:66,w:23,flip:false},
 {id:5,type:6,x:10,y:98,w:33,flip:false}
];
function newBoard() {
 const b = Array.from({length:63}, () => ({kind:'crate'}));
 [16,17,22,23,24,25,29,30,31,32,36,37,38,39,40,43,44,45,46].forEach(i => b[i] = null);
 b[24] = {kind:'generator'};
 for(const i of [22,23,31,32]) b[i] = {kind:'fabric',level:0};
 for(const i of [29,30]) b[i] = {kind:'sweet',level:0};
 b[38] = {kind:'fabric',level:1};
 return b;
}
const defaults = {energy:120,coins:4580,gems:36,outfit:0,hair:0,face:0,makeup:0,shoes:0,unlocked:[0,1,2],furniture:initialFurniture,board:newBoard(),order:0,produced:0,sound:true};
let state;
try { state = {...structuredClone(defaults),...JSON.parse(localStorage.getItem(KEY) || 'null')}; } catch { state = structuredClone(defaults); }
delete state.skirt;
let page = 'dress', category = 'outfit', editing = false, draft = null, selectedFurniture = null, selectedCell = null;
const history = [];
let toastTimer;
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { toast('浏览器存储不可用，本次进度暂存于页面'); } updateHUD(); }
function updateHUD() { for(const k of ['energy','coins','gems']) $(`#${k}`).textContent = state[k].toLocaleString('en-US'); }
function toast(message) { const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600); }
let audio;
function sound(pitch = 650) { if(!state.sound) return; try { audio ||= new (window.AudioContext || window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.type='sine';o.frequency.setValueAtTime(pitch,audio.currentTime);o.frequency.exponentialRampToValueAtTime(pitch*1.35,audio.currentTime+.1);g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.15);o.start();o.stop(audio.currentTime+.16); } catch {} }
function modal(html) { $('#modal-body').innerHTML=html;$('#modal').showModal(); }
$('.modal-close').onclick=()=>$('#modal').close();
$('#modal').onclick=e=>{if(e.target===$('#modal')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};
const characters = new Image(); characters.src='assets/characters.png';characters.onload=()=>drawDolls();
const bounds = [145,639,1132,1627];
const outfitNames=['草莓奶油','午后心事','晴空来信','午夜玫瑰','葡萄软糖','薄荷来信','桃子汽水','月光晚安'];
const outfitSource=[0,1,2,3,0,2,1,3];
const outfitHue=[0,0,0,0,55,280,335,60];
const furnitureNames=['沙发','桌椅','地毯','挂画','收纳','灯具','植物','墙饰'];
function sprite(index, region='outfit', filter='') {
 const i=outfitSource[index]??index;
 const box = region==='outfit' ? [bounds[i]-8,0,405,724] : region==='hair' ? [bounds[0]-8,0,405,324] : region==='face'||region==='makeup' ? [bounds[0]+67,169,263,139] : [bounds[i]-8,589,405,130];
 return `<svg class="item-art" viewBox="${box.join(' ')}" aria-hidden="true" style="filter:${filter||`hue-rotate(${outfitHue[index]||0}deg)`}"><defs><clipPath id="char-${index}-${region}"><rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"/></clipPath></defs><image clip-path="url(#char-${index}-${region})" href="assets/characters.png" width="2172" height="724"/></svg>`;
}
const furnitureBounds = [[0,50,495,350],[497,0,400,405],[902,60,508,338],[1438,20,326,378],[25,414,424,427],[577,396,235,460],[918,433,491,407],[1442,391,308,470]];
function furnitureArt(type) { const b=furnitureBounds[type];return `<svg viewBox="${b.join(' ')}" aria-hidden="true"><defs><clipPath id="furniture-${type}"><rect x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}"/></clipPath></defs><image clip-path="url(#furniture-${type})" href="assets/furniture.png" width="1774" height="887"/></svg>`; }
function drawDolls() { $$('.doll').forEach(canvas=>drawDoll(canvas)); }
function drawDoll(canvas) {
 if(!characters.complete || !characters.naturalWidth)return;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,405,724);ctx.imageSmoothingEnabled=false;
 const source=outfitSource[state.outfit];ctx.drawImage(characters,bounds[source]-8,0,405,724,0,0,405,724);
 // Keep the shared pose while independently changing hair, eyes and shoes.
 const pixels=ctx.getImageData(0,0,405,724), d=pixels.data;
 const hueHair=[0,48,310,160,235,95,340,25][state.hair];
 const hueDress=outfitHue[state.outfit];
 const eyePalette=[[109,29,54],[81,66,126],[56,104,88],[133,88,32],[64,91,127],[145,55,94],[91,63,51],[55,52,67]][state.face];
 const rotate=(r,g,b,deg)=>{const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [(0.213+c*.787-s*.213)*r+(.715-c*.715-s*.715)*g+(.072-c*.072+s*.928)*b,(.213-c*.213+s*.143)*r+(.715+c*.285+s*.14)*g+(.072-c*.072-s*.283)*b,(.213-c*.213-s*.787)*r+(.715-c*.715+s*.715)*g+(.072+c*.928+s*.072)*b];};
 for(let y=0;y<724;y++)for(let x=0;x<405;x++){
  const p=(y*405+x)*4;if(d[p+3]<50)continue;
  const r=d[p],g=d[p+1],b=d[p+2];let hue=0;
  if(y<312 && r>g*1.18 && b>g*1.1 && r>130)hue=hueHair;
  if(y>=312&&y<573)hue=hueDress;
  if(hue){const c=rotate(r,g,b,hue);d[p]=c[0];d[p+1]=c[1];d[p+2]=c[2];}
  if(state.face&&y>195&&y<265&&x>85&&x<310&&r<160&&g<85&&b<115){d[p]=eyePalette[0];d[p+1]=eyePalette[1];d[p+2]=eyePalette[2];}
 }
 ctx.putImageData(pixels,0,0);
 if(state.shoes){const shoeSource=[0,1,2,3,0,2,3,1][state.shoes];ctx.clearRect(0,608,405,116);ctx.filter=`hue-rotate(${[0,40,0,0,55,280,30,320][state.shoes]}deg)`;ctx.drawImage(characters,bounds[shoeSource]-8,608,405,116,0,608,405,116);ctx.filter='none';}
 if(state.makeup){const blush=['','#f3989e','#f084b4','#eda879','#db83b7','#e5a7bd','#e99991','#d888a9'][state.makeup];ctx.globalAlpha=.18+state.makeup*.035;ctx.fillStyle=blush;for(const x of [112,282]){ctx.beginPath();ctx.ellipse(x,264,22,9,0,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
}
function doll(){return '<canvas class="doll" width="405" height="724" aria-label="当前搭配的像素女孩"></canvas>';}
function heading(title,sub){return `<div class="scene-heading"><h2>${title}</h2><small>${sub}</small></div>`;}
function render(){
 $('.bottom-nav').style.display=editing?'none':'flex';
 $$('.bottom-nav button').forEach(b=>{b.classList.toggle('active',b.dataset.page===page);b.setAttribute('aria-current',b.dataset.page===page?'page':'false');});
 if(page==='dress')renderDress();else if(page==='home')renderHome();else renderMerge();
 updateHUD();drawDolls();
}
function renderDress(){
 const categories=[['face','face','脸'],['hair','hair','发'],['makeup','makeup','妆'],['outfit','shirt','衣'],['shoes','shoes','鞋']];
 $('#content').innerHTML=`<section class="scene dress-scene" aria-label="装扮工作室">${heading('装扮工作室','DRESSING STUDIO')}<div class="scene-tools"><button class="round-button" data-action="photo" aria-label="保存搭配图片">${icon('camera')}</button><button class="round-button" data-action="settings" aria-label="设置">${icon('settings')}</button></div>${doll()}<div class="scene-bottom"><button class="round-button" data-action="undo" aria-label="撤销上次搭配">${icon('undo')}</button><span class="outfit-tag">♡ ${outfitNames[state.outfit]} ♡</span><button class="round-button" data-action="random" aria-label="随机搭配">${icon('random')}</button></div></section><div class="categories" role="tablist" aria-label="装扮分类">${categories.map(([key,i,label])=>`<button role="tab" aria-selected="${category===key}" class="category ${category===key?'active':''}" data-category="${key}">${icon(i)}<span>${label}</span></button>`).join('')}</div><section class="wardrobe" aria-label="我的衣橱"><div class="panel-label"><b>✿ 我的衣橱</b><small>${category==='outfit'?'每一件，都有小小心动':'轻点试穿 · 遇见新的自己'}</small></div><div class="item-grid">${Array.from({length:8},(_,i)=>itemCard(i)).join('')}</div></section>`;
}
const optionNames={hair:['樱花粉','奶茶棕','雾蓝灰','薄荷绿','浅薰衣草','蜂蜜金','玫瑰红','栗子棕'],face:['甜心莓莓','紫罗兰','森林来信','琥珀时光','蓝色星辰','桃花眼眸','可可日记','夜空微光'],makeup:['自然素颜','蜜桃微醺','樱花气色','杏子奶油','莓果心事','温柔月光','珊瑚落日','玫瑰晚霞'],shoes:['草莓玛丽珍','奶茶小皮鞋','海盐小皮鞋','黑糖蝴蝶结','薰衣草鞋','薄荷小皮鞋','可可蝴蝶结','玫瑰小皮鞋']};
function itemCard(i){
 const locked=category==='outfit'&&!state.unlocked.includes(i),selected=state[category]===i;
 const filters=category==='hair'?[0,48,310,160,235,95,340,25]:category==='face'?[0,55,140,310,220,20,330,170]:[0,280,55,160,320,210,25,90];
 const art=sprite(category==='outfit'?i:category==='shoes'?[0,1,2,3,0,2,3,1][i]:0,category,category==='outfit'?'':`hue-rotate(${filters[i]}deg)`);
 const name=category==='outfit'?outfitNames[i]:optionNames[category][i];
 return `<button class="item-card ${locked?'locked':''} ${selected?'selected':''}" data-item="${i}" aria-label="${name}${locked?'，需 '+(i===3?300:450)+' 金币解锁':''}" aria-pressed="${selected}">${art}${locked?`<i class="lock-badge">${icon('lock')}</i>`:''}<span class="${locked?'price':''}">${locked?'● '+(i===3?300:450):name}</span></button>`;
}
function changeLook(key,value){history.push(Object.fromEntries(['outfit','hair','face','makeup','shoes'].map(k=>[k,state[k]])));if(history.length>30)history.shift();state[key]=value;save();render();sound();$('.doll')?.classList.add('pop');}
function unlock(i){const cost=i===3?300:450;modal(`<div class="modal-icon">${sprite(i)}</div><h2>${outfitNames[i]}</h2><p>把这份心动带回衣橱。<br>解锁后可以随时穿搭。</p><button id="buy-outfit">● ${cost} 金币解锁</button><button class="secondary" id="later">再想想</button>`);$('#later').onclick=()=>$('#modal').close();$('#buy-outfit').onclick=()=>{if(state.coins<cost){toast('金币还不够，去二合完成订单吧');return;}state.coins-=cost;state.unlocked.push(i);$('#modal').close();changeLook('outfit',i);toast('新装扮已加入衣橱 ♡');};}
function renderHome(){
 const furniture=editing?draft:state.furniture;
 $('#content').innerHTML=`<section class="scene home-scene ${editing?'editing':''}" aria-label="我的小屋">${heading(editing?'家具布置':'我的小屋',editing?'MAKE ROOM FOR JOY':'MY LITTLE HOME')}<div class="scene-tools">${editing?'':`<button class="pill-button" data-action="edit">${icon('sofa')} 家具布置</button>`}</div>${furniture.map(f=>`<button class="furniture ${f.flip?'flip':''} ${selectedFurniture===f.id?'selected':''}" style="left:${f.x}%;top:${f.y}%;width:${f.w}%" data-furniture="${f.id}" data-type="${f.type}" aria-label="${furnitureNames[f.type]}${editing?'，拖动调整位置':''}">${furnitureArt(f.type)}</button>`).join('')}${doll()}<div class="home-caption"><span>${editing?'拖动家具布置 · 轻点选中家具':'♡ 今天也要好好生活 ♡'}</span></div></section>${editing?`<section class="furniture-inventory"><div class="panel-label"><b>✿ 家具仓库</b><small>轻点添加 · 拖动摆放</small></div><div class="item-grid">${furnitureNames.map((name,i)=>`<button class="item-card ${furniture.find(f=>f.id===selectedFurniture)?.type===i?'selected':''}" data-add-furniture="${i}" aria-label="添加${name}"><div class="item-art">${furnitureArt(i)}</div><span>${name}</span></button>`).join('')}</div></section><div class="edit-actions"><button data-action="cancel-edit">${icon('close')}取消</button><button data-action="flip">${icon('flip')}翻转</button><button data-action="collect">${icon('collect')}收回</button><button data-action="save-room" class="save">${icon('check')}保存</button></div>`:''}`;
 bindFurnitureDrag();
}
function bindFurnitureDrag(){
 $$('.furniture').forEach(el=>el.addEventListener('pointerdown',e=>{
  if(!editing){sound(850);toast('点击右上角「家具布置」装饰小屋');return;}
  e.preventDefault();selectedFurniture=Number(el.dataset.furniture);$$('.furniture').forEach(n=>n.classList.toggle('selected',n===el));
  const f=draft.find(x=>x.id===selectedFurniture),r=$('.home-scene').getBoundingClientRect();const start={x:e.clientX,y:e.clientY,fx:f.x,fy:f.y};el.setPointerCapture(e.pointerId);
  const move=ev=>{f.x=Math.min(97,Math.max(3,start.fx+(ev.clientX-start.x)/r.width*100));f.y=Math.min(103,Math.max(f.type===3||f.type===7?16:42,start.fy+(ev.clientY-start.y)/r.height*100));el.style.left=f.x+'%';el.style.top=f.y+'%';};
  const end=()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',end);el.removeEventListener('pointercancel',end);};
  el.addEventListener('pointermove',move);el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 }));
}
function itemIcon(item){
 if(!item)return '';
 const open='<svg viewBox="0 0 64 64" aria-hidden="true" shape-rendering="crispEdges" stroke="#77513e" stroke-width="2" stroke-linejoin="round">';
 if(item.kind==='crate')return open+'<path d="M5 5h54v54H5Z" fill="#c69257"/><path d="M9 9h46v46H9Z" fill="#dbaa6b"/><path d="m6 6 52 52M58 6 6 58" stroke="#9c683f" stroke-width="3"/><path d="M8 6h48M6 8v48" stroke="#f6d8a3"/><path d="m27 26 11 11m-11 0 11-11" stroke="#fff7df" stroke-width="4"/><path d="M44 45h12v10H44Z" fill="#fff5dc" stroke="#d5ac87"/><path d="M46 48h7m-7 3h7" stroke="#eeb5a4"/></svg>';
 if(item.kind==='generator')return open+'<path d="m9 16 43 0 6 39-47 4-7-32Z" fill="#c98e4d"/><path d="M12 20h37l4 29-38 4Z" fill="#f6d5a1"/><g fill="#e480b4"><path d="M15 30h11v18H15Z"/><path d="M18 27h5v4h-5Z" fill="#fff8ed"/></g><path d="M31 22h11v18H31Z" fill="#71b8a1"/><path d="M34 20h5v4h-5Z" fill="#fff8ed"/><path d="M31 40h11v14H31Z" fill="#92b9e0"/><path d="M34 37h5v4h-5Z" fill="#fff8ed"/><path d="m49 2-10 16h8l-4 14L60 11h-9l4-9Z" fill="#ffe180" stroke="#bc8237"/></svg>';
 const l=item.level||0;
 if(item.kind==='fabric'){
  if(l===0)return open+'<path d="m12 21 28-12 12 8-2 14 10 10-30 15-19-10Z" fill="#fff6df"/><path d="m33 12 9-3 10 8-2 12-9 5-9-10Z" fill="#ef9a9f"/><path d="M11 24c-9 0-8 21 3 23 12 2 11-18 1-20-8-1-7 14-1 14 4 0 4-8 1-8" fill="#fff5df"/><path d="m26 36 24-7" stroke="#cfbaa0"/></svg>';
  if(l===1)return open+'<path d="m15 10 34 2 8 37-37 7-13-12Z" fill="#f4a2b7"/><path d="m16 16 27 2M18 23l26 2M21 30l25 1M22 38l27 0M23 45l27-2" stroke="#ffe6df" stroke-width="4"/><path d="M11 44V17c0-9 15-9 16 0v28c-4-7-15-7-16-1Z" fill="#eb7d9d"/><path d="M17 15c-4-7 10-8 6 2" fill="none" stroke="#a94d70"/></svg>';
  if(l===2)return open+'<path d="m9 8 41 3 6 43-42 3Z" fill="#a5d4e7"/><path d="m13 13 32 3 5 33-31 3Z" fill="#fcf0db"/><path d="m19 20 9-3 8 5 7-2 5 10-8 5-1 13-20-1 1-14-6-4Z" fill="#ec8cac"/><path d="M26 28h8v17h-8Z" fill="#ffc9d9"/></svg>';
  return open+`<path d="m20 6 12 6 12-6 8 12-10 7 14 30H8l14-30-10-7Z" fill="${l===3?'#f6a7c1':l===4?'#aeb4e2':'#e9c97e'}"/><path d="M23 25h18M13 49h38" stroke="#fff4e4" stroke-width="4"/><path d="m25 16 7 4 7-4v10l-7-4-7 4Z" fill="#d9618d"/></svg>`;
 }
 const color=['#88cbbb','#ec9db9','#c8b1e4','#e4bc70','#db8d9a','#acbfe3'][Math.min(l,5)];
 return open+`<path d="m12 34 5 23h32l5-23Z" fill="${color}"/><path d="m20 38 3 16m7-16 1 17m9-17-1 17m9-17-3 16" stroke="#ffffff66"/><path d="M10 32c0-8 9-9 9-13 0-5 7-4 8-9 9 4 6 9 15 10 6 1 5 6 9 7 7 3 5 12-1 12H17c-6 0-10-3-7-7Z" fill="${l>1?'#f5c3d9':'#fff0cd'}"/><path d="M17 30h33M24 22h17" stroke="#e6bca7"/><circle cx="33" cy="10" r="6" fill="${l%2?'#9e6e53':'#e85a70'}"/><path d="m34 5 6-5" stroke="#659347" stroke-width="3"/>${l>=2?'<path d="m11 10 3 4 4-4-4-4Zm36 0 3 4 4-4-4-4Z" fill="#e9ba59"/>':''}</svg>`;
}
const itemNames={fabric:['棉布卷','玫瑰布料','心动设计图','蝴蝶结洋装','月光礼服','星光礼服'],sweet:['樱桃纸杯蛋糕','草莓奶油蛋糕','梦幻甜点','蜂蜜甜点','玫瑰甜点','星光甜点']};
function nameOf(item){return item?item.kind==='crate'?'神秘包裹':item.kind==='generator'?'缝纫材料箱':itemNames[item.kind][item.level]:'空格';}
function requirements(){const level=Math.min(1+Math.floor(state.order/2),4);return [{kind:'fabric',level},{kind:'sweet',level:Math.min(1+Math.floor(state.order/3),4)}];}
function have(req){return state.board.filter(x=>x?.kind===req.kind&&x.level===req.level).length;}
function renderMerge(){
 const req=requirements(),ready=req.every(r=>have(r)>0),s=state.board[selectedCell];
 $('#content').innerHTML=`<section class="merge-screen"><div class="merge-title"><h2>缝纫小日常 <span style="color:#dc8fa9">✿</span></h2><small>一点点合成，一点点心动</small></div><div class="order-panel"><div class="order-label">当前<br>订单</div>${req.map(r=>`<div class="order-object" title="${nameOf(r)}">${itemIcon(r)}<small>${Math.min(have(r),1)}/1 ${have(r)?'✓':''}</small></div>`).join('')}<div class="order-reward">奖励<br><b>● ${180+state.order*40}</b></div><button data-action="order" class="${ready?'ready':''}">${ready?'交付 ♡':'查看'}</button></div><div class="board-wrap"><div class="merge-board" aria-label="二合棋盘">${state.board.map((item,i)=>`<button class="cell ${item?.kind==='crate'?'crate':item?'filled':''} ${item?.kind==='generator'?'generator':''} ${selectedCell===i?'selected':''}" data-cell="${i}" aria-label="第${i+1}格，${nameOf(item)}">${itemIcon(item)}</button>`).join('')}</div></div><div class="merge-info"><div>${itemIcon(s||{kind:'generator'})}</div><div><p>${s?nameOf(s):'把相同的小物合在一起'}</p><small>${s?.kind==='generator'?'轻点材料箱 · 消耗 1 体力产出':s?.kind==='crate'?'轻点包裹，花费 5 金币拆开':s?'拖动合成，或点选两个相同物品':'拖动合成 · 轻点材料箱获得小物'}</small></div><button data-action="${s?.kind==='generator'?'produce':'merge-help'}">${s?.kind==='generator'?'产出 ϟ 1':'玩法'}</button></div></section>`;
 bindBoard();
}
function moveItem(from,to){
 if(from===to||!state.board[from]||['crate','generator'].includes(state.board[from].kind))return false;
 const a=state.board[from],b=state.board[to];
 if(b?.kind==='crate'||b?.kind==='generator'){toast('先拆开包裹，给小物腾个位置');return false;}
 if(b&&a.kind===b.kind&&a.level===b.level){if(a.level>=5){toast('已是最高等级，可以留作收藏 ♡');return false;}state.board[to]={kind:a.kind,level:a.level+1};state.board[from]=null;sound(950);toast(`合成了「${nameOf(state.board[to])}」 ✧`);}
 else if(!b){state.board[to]=a;state.board[from]=null;sound(450);}
 else{toast('需要两个相同等级的物品才能合成');return false;}
 selectedCell=to;save();renderMerge();$(`[data-cell="${to}"]`)?.classList.add('pop');return true;
}
function selectCell(i){const item=state.board[i];if(item?.kind==='generator'){selectedCell=i;produce();return;}if(item?.kind==='crate'){if(state.coins<5){toast('需要 5 金币才能拆开包裹');return;}state.coins-=5;state.board[i]=null;selectedCell=i;save();renderMerge();sound(400);toast('包裹已拆开，多了一点空间');return;}if(selectedCell!==null&&selectedCell!==i&&state.board[selectedCell]&&!['crate','generator'].includes(state.board[selectedCell].kind)){if(moveItem(selectedCell,i))return;}selectedCell=i;renderMerge();sound(500);}
function produce(){if(state.energy<1){toast('体力不够了，点击顶部闪电补充');return;}const empty=state.board.findIndex(x=>!x);if(empty<0){toast('棋盘满了，先合成或拆开包裹吧');return;}state.energy--;state.board[empty]={kind:state.produced++%3===2?'sweet':'fabric',level:0};selectedCell=empty;save();renderMerge();sound(750);$(`[data-cell="${empty}"]`)?.classList.add('pop');}
function bindBoard(){
 $$('.cell').forEach(el=>el.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;const from=Number(el.dataset.cell),item=state.board[from];const startX=e.clientX,startY=e.clientY;let ghost=null,moved=false;el.setPointerCapture(e.pointerId);
  const move=ev=>{if(!item||['crate','generator'].includes(item.kind))return;if(!moved&&Math.hypot(ev.clientX-startX,ev.clientY-startY)>7){moved=true;ghost=document.createElement('div');ghost.className='drag-ghost';ghost.innerHTML=itemIcon(item);document.body.append(ghost);el.style.opacity='.35';}if(ghost){ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';}};
  const end=ev=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',end);el.removeEventListener('pointercancel',cancel);ghost?.remove();el.style.opacity='';if(moved){const target=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('[data-cell]');if(target)moveItem(from,Number(target.dataset.cell));}else selectCell(from);};
  const cancel=()=>{ghost?.remove();el.style.opacity='';el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',end);el.removeEventListener('pointercancel',cancel);};
  el.addEventListener('pointermove',move);el.addEventListener('pointerup',end);el.addEventListener('pointercancel',cancel);
 }));
 $$('.cell').forEach(el=>el.addEventListener('click',e=>{if(e.detail===0)selectCell(Number(el.dataset.cell));}));
}
function completeOrder(){const req=requirements();if(!req.every(r=>have(r)>0)){modal(`<div class="modal-icon">${icon('heart')}</div><h2>一份心动订单</h2><p>准备好「${nameOf(req[0])}」和<br>「${nameOf(req[1])}」，就可以交付啦。<br>相同等级的小物合成，向心动靠近一点。</p><button id="back-to-board">继续合成</button>`);$('#back-to-board').onclick=()=>$('#modal').close();return;}
 req.forEach(r=>{state.board[state.board.findIndex(x=>x?.kind===r.kind&&x.level===r.level)]=null;});const reward=180+state.order*40;state.coins+=reward;state.gems++;state.energy=Math.min(120,state.energy+10);state.order++;selectedCell=null;save();renderMerge();sound(1100);toast(`订单完成！ +${reward} 金币 · +1 钻石 ♡`);
}
function photo(){const c=$('.doll');if(!c)return;modal(`<h2>今天的心动搭配</h2><p>${outfitNames[state.outfit]} · 只属于你的小小风格</p><img class="export-preview" src="${c.toDataURL('image/png')}" alt="搭配预览"><button id="download-look">保存透明 PNG</button>`);$('#download-look').onclick=()=>{const a=document.createElement('a');a.download='pixel-dress-up.png';a.href=c.toDataURL('image/png');a.click();toast('搭配图片已导出 ♡');};}
function settings(){modal(`<div class="modal-icon">${icon('settings')}</div><h2>小屋设置</h2><p>搭配、金币和小屋布置会自动保存在此浏览器。</p><div class="settings-row">轻柔交互音<button id="toggle-sound">${state.sound?'已开启':'已关闭'}</button></div><button class="secondary" id="reset-game">重新开始</button>`);$('#toggle-sound').onclick=e=>{state.sound=!state.sound;e.target.textContent=state.sound?'已开启':'已关闭';save();sound();};$('#reset-game').onclick=()=>{modal(`<h2>重新开始这段小日常？</h2><p>将清空此浏览器中的搭配、家具布置和合成进度。</p><button class="secondary" id="keep-progress">保留进度</button><button id="confirm-reset">确认重新开始</button>`);$('#keep-progress').onclick=()=>$('#modal').close();$('#confirm-reset').onclick=()=>{state=structuredClone(defaults);history.length=0;selectedCell=null;save();$('#modal').close();render();toast('新的小日常开始了 ♡');};};}
const actions={
 undo(){const previous=history.pop();if(!previous){toast('已经是最初的搭配啦');return;}Object.assign(state,previous);save();render();sound(450);},
 random(){history.push(Object.fromEntries(['outfit','hair','face','makeup','shoes'].map(k=>[k,state[k]])));state.outfit=state.unlocked[Math.floor(Math.random()*state.unlocked.length)];for(const k of ['hair','face','makeup','shoes'])state[k]=Math.floor(Math.random()*8);save();render();sound(850);toast('今日份的小惊喜 ♡');},
 photo,settings,
 edit(){editing=true;draft=structuredClone(state.furniture);selectedFurniture=draft[0]?.id??null;render();toast('拖动家具调整位置，完成后点击保存');},
 'cancel-edit'(){editing=false;draft=null;selectedFurniture=null;render();toast('已取消本次布置');},
 flip(){const f=draft.find(f=>f.id===selectedFurniture);if(!f){toast('先轻点选中一件家具');return;}f.flip=!f.flip;renderHome();sound();},
 collect(){const f=draft.find(f=>f.id===selectedFurniture);if(!f){toast('先轻点选中一件家具');return;}draft=draft.filter(f=>f.id!==selectedFurniture);selectedFurniture=null;renderHome();toast('家具已收回仓库，随时可以再次添加');},
 'save-room'(){state.furniture=structuredClone(draft);editing=false;draft=null;selectedFurniture=null;save();render();sound(900);toast('小屋布置已保存 ♡');},
 produce,order:completeOrder,
 'merge-help'(){modal(`<div class="modal-icon">${itemIcon({kind:'generator'})}</div><h2>一点点合成魔法</h2><p>① 轻点材料箱，消耗 1 体力产出小物<br>② 拖动两个相同等级的小物进行合成<br>也可以依次轻点两个小物完成合成<br>③ 完成顶部订单，获得金币与钻石<br>轻点包裹，花 5 金币开拓更多空间</p><button id="got-it">开始小日常 ♡</button>`);$('#got-it').onclick=()=>$('#modal').close();},
 energy(){if(state.energy>=120){toast('体力满满，去二合开启今天的小日常');return;}modal(`<h2>补充一点能量</h2><p>用 2 颗钻石兑换 30 体力。</p><button id="buy-energy">◆ 2 · 补充 30 体力</button>`);$('#buy-energy').onclick=()=>{if(state.gems<2){toast('钻石不足，完成订单可以获得钻石');return;}state.gems-=2;state.energy=Math.min(120,state.energy+30);save();$('#modal').close();toast('能量已补充 ♡');};},
 coins(){toast('在二合中完成订单，就能赚取金币解锁新装扮');},gems(){toast('完成每份二合订单，都能获得 1 颗钻石');}
};
document.addEventListener('click',e=>{
 const nav=e.target.closest('[data-page]');if(nav){page=nav.dataset.page;selectedCell=null;render();sound(550);return;}
 const cat=e.target.closest('[data-category]');if(cat){category=cat.dataset.category;renderDress();drawDolls();sound(500);return;}
 const item=e.target.closest('[data-item]');if(item){const i=Number(item.dataset.item);if(category==='outfit'&&!state.unlocked.includes(i))unlock(i);else changeLook(category,i);return;}
 const add=e.target.closest('[data-add-furniture]');if(add){if(draft.length>=16){toast('小屋已经很热闹了，先收回一些家具吧');return;}const type=Number(add.dataset.addFurniture);selectedFurniture=Date.now();draft.push({id:selectedFurniture,type,x:50,y:type===3||type===7?42:80,w:[43,42,57,22,35,23,33,22][type],flip:false});renderHome();sound();return;}
 const action=e.target.closest('[data-action]');if(action&&actions[action.dataset.action])actions[action.dataset.action]();
});
updateHUD();render();

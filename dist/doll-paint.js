import * as THREE from 'three';

// Project the authored color sheets onto the actual weighted mesh surfaces in their rest pose.
// This is a surface material: all sides keep real depth and the same skeletal deformation.
const helpers=`
varying vec3 paintPosition;
varying vec3 paintNormal;
uniform sampler2D characterPaint;
uniform sampler2D outfitPaint;
uniform sampler2D hairBounds;
uniform float paintSlot;
uniform float paintOption;
uniform float paintHue;
uniform float paintSaturation;
uniform float paintGain;
uniform vec3 paintEye;
uniform vec3 paintCheek;
uniform vec3 paintLip;
uniform float paintMakeup;
uniform float paintAccessory;
uniform vec3 paintFallback;
vec3 paintLinear(vec3 c){return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(vec3(.04045),c));}
vec3 pigment(vec3 c){
 float hi=max(c.r,max(c.g,c.b)),lo=min(c.r,min(c.g,c.b)),d=hi-lo,h=0.0;
 if(d>.0001){if(hi==c.r)h=mod((c.g-c.b)/d,6.0);else if(hi==c.g)h=(c.b-c.r)/d+2.0;else h=(c.r-c.g)/d+4.0;}
 h=fract(h/6.0+paintHue)*6.0;
 float sat=hi>.001?d/hi:0.0;float value=hi*mix(1.0,paintGain,smoothstep(.08,.22,d));
 float chroma=value*clamp(sat*paintSaturation,0.0,1.0),x=chroma*(1.0-abs(mod(h,2.0)-1.0));
 vec3 rgb=h<1.0?vec3(chroma,x,0.0):h<2.0?vec3(x,chroma,0.0):h<3.0?vec3(0.0,chroma,x):h<4.0?vec3(0.0,x,chroma):h<5.0?vec3(x,0.0,chroma):vec3(chroma,0.0,x);
 return clamp(rgb+value-chroma,0.0,1.0);
}
vec3 artSample(vec2 pixel, bool outfit){
 return outfit ? texture2D(outfitPaint,vec2(pixel.x/1536.0,1.0-pixel.y/1024.0)).rgb : texture2D(characterPaint,vec2(pixel.x/2048.0,1.0-pixel.y/768.0)).rgb;
}
vec3 paintedSurface(){
 vec3 p=paintPosition,n=normalize(paintNormal);float back=1.0-smoothstep(-.18,.18,n.z);
 vec3 c;
 if(paintSlot==1.0){
  // A continuous painted bob surface supplies strand shadows and broad pearly gleams.
  float z=p.y;
  if(paintOption>0.0 && z<1.55)z=1.26+(z-.56)/.99*.29;
  float row=clamp(704.0-321.0*z,28.0,319.0);
  vec2 frontBounds=texture2D(hairBounds,vec2(1.0/6.0,(row+.5)/768.0)).rg;
  vec2 sideBounds=texture2D(hairBounds,vec2(.5,(row+.5)/768.0)).rg;
  vec2 rearBounds=texture2D(hairBounds,vec2(5.0/6.0,(row+.5)/768.0)).rg;
  vec2 frontUV=vec2(clamp(315.0+p.x*321.0,frontBounds.x+3.0,frontBounds.y-3.0),row);
  vec2 rearUV=vec2(clamp(1765.0-p.x*321.0,rearBounds.x+3.0,rearBounds.y-3.0),row);
  vec2 sideUV=vec2(clamp(1305.0-p.z/1.45*450.0,sideBounds.x+3.0,sideBounds.y-3.0),row);
  vec3 rearHair=artSample(rearUV,false),frontHair=artSample(frontUV,false),sideHair=artSample(sideUV,false);
  if(paintAccessory<.5){
   if(min(frontHair.r,min(frontHair.g,frontHair.b))>.84)frontHair=artSample(vec2(mix(315.0,frontUV.x,.75),row),false);
   if(min(rearHair.r,min(rearHair.g,rearHair.b))>.84)rearHair=artSample(vec2(mix(1765.0,rearUV.x,.75),row),false);
   if(min(sideHair.r,min(sideHair.g,sideHair.b))>.84||sideHair.g>sideHair.b*1.03)sideHair=artSample(vec2(mix(sideBounds.x,sideBounds.y,.72),row),false);
  }
  float frontWeight=pow(max(n.z,0.0),3.0),rearWeight=pow(max(-n.z,0.0),3.0),sideWeight=pow(abs(n.x),3.0);
  if(frontWeight+rearWeight+sideWeight<.01)frontWeight=1.0;
  if(paintOption>0.0&&p.y<1.52){sideHair=rearHair;frontHair=rearHair;}
  c=(frontHair*frontWeight+rearHair*rearWeight+sideHair*sideWeight)/(frontWeight+rearWeight+sideWeight);
  c=paintAccessory>.5?vec3(1.0,.95,.87):pigment(c);
 }else if(paintSlot==2.0){
  vec2 front, rear;bool outfits=paintOption>0.0;
  if(outfits){float center=paintOption<1.5?265.0:paintOption<2.5?754.0:1251.0;front=vec2(center+p.x*221.0,505.0-p.y*221.0);rear=vec2(center-p.x*221.0,1007.0-p.y*221.0);}
  else{front=vec2(315.0+p.x*321.0,733.0-p.y*321.0);rear=vec2(1765.0-p.x*321.0,733.0-p.y*321.0);}
  c=mix(artSample(front,outfits),artSample(rear,outfits),back);
  bool straySkin=c.r>c.g+.035&&c.g>c.b+.025&&c.r>.70&&p.y<.98&&abs(p.x)>.34;
  if(straySkin)c=paintFallback;
  // Long sleeves and the lowest lace have no matching silhouette in the color sheets.
  // Shade those mesh regions directly instead of stretching background or skin pixels.
  if((paintOption==1.0||paintOption==2.0)&&abs(p.x)>.255&&p.y>1.25-.84*abs(p.x)){
   float cuff=(abs(p.x)/1.10-.235)/.325;
   float stripe=(smoothstep(.79,.81,cuff)-smoothstep(.84,.86,cuff))+(smoothstep(.90,.92,cuff)-smoothstep(.95,.97,cuff));
   vec3 trim=paintOption==1.0?vec3(.95,.49,.61):vec3(.18,.25,.40);
   c=mix(vec3(1.0,.97,.92),trim,clamp(stripe,0.0,1.0));
  }
  if(p.y<.605){
   float edge=exp(-pow((p.y-.586)/.008,2.0));
   vec3 trim=paintOption==2.0?vec3(.39,.55,.77):vec3(.94,.49,.62);
   c=mix(vec3(1.0,.96,.91),trim,edge*.65);
  }
  c=pigment(c);
 }else if(paintSlot==3.0){
  c=mix(artSample(vec2(315.0+p.x*321.0,733.0-p.y*321.0),false),artSample(vec2(1765.0-p.x*321.0,733.0-p.y*321.0),false),back);
  float sat=max(c.r,max(c.g,c.b))-min(c.r,min(c.g,c.b));c=mix(c,pigment(c),smoothstep(.06,.18,sat));
 }else{
  bool head=paintSlot==0.0&&p.y>1.235;
  vec2 front=vec2(315.0+p.x*321.0,(head?704.0:733.0)-p.y*321.0);
  c=head?artSample(front,false):vec3(1.0,.84,.74);
  // Only the forward facial surface carries the eyes and mouth; sides keep skin shading.
  float face=smoothstep(.06,.32,n.z);
  if(head){
   bool hairPixel=(front.y<205.0||(front.y<226.0&&abs(front.x-315.0)<42.0)||(abs(front.x-315.0)>108.0&&front.y<330.0))&&c.r>c.g+.015&&c.b>c.g-.04;
   if(hairPixel)c=pigment(c);
   float iris=step(205.0,front.y)*step(front.y,270.0)*step(220.0,front.x)*step(front.x,410.0)*step(c.g*1.3,c.r)*step(c.g*1.05,c.b)*step(c.g,.45);
   float value=max(c.r,max(c.g,c.b));c=mix(c,paintEye*value*1.7,iris*.65);
   float blush=exp(-pow((abs(front.x-315.0)-79.0)/24.0,2.0)-pow((front.y-269.0)/11.0,2.0));c=mix(c,paintCheek,blush*paintMakeup*.40);
   float lips=exp(-pow((front.x-315.0)/16.0,2.0)-pow((front.y-282.0)/9.0,2.0));c=mix(c,paintLip,lips*paintMakeup*.40);
   c=mix(vec3(1.0,.84,.74),c,face);
  }
 }
 float light=max(dot(n,normalize(vec3(-.35,.5,1.0))),0.0);
 float volume=paintSlot==4.0||(paintSlot==0.0&&p.y<1.235)?.82+.18*light:.94+.06*light;
 return paintLinear(c)*volume;
}
`;
export function paintedMaterial(source,slot,option,images){
 const material=new THREE.MeshBasicMaterial({color:0xffffff});material.name=source.name;material.userData.slot=slot;
 const uniform={characterPaint:{value:images.character},outfitPaint:{value:images.outfits},hairBounds:{value:images.bounds},paintSlot:{value:{body:0,hands:4,hair:1,outfit:2,shoes:3}[slot]},paintOption:{value:Number(option)},paintHue:{value:0},paintSaturation:{value:1},paintGain:{value:1},paintEye:{value:new THREE.Color('#76253e')},paintCheek:{value:new THREE.Color('#f7a2ac')},paintLip:{value:new THREE.Color('#c75f79')},paintMakeup:{value:0},paintAccessory:{value:source.name==='warm ivory'?1:0},paintFallback:{value:Number(option)===3&&source.name==='sailor ink'?new THREE.Color('#382e39').convertLinearToSRGB():source.color.clone().convertLinearToSRGB()}};
 material.userData.paint=uniform;
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniform);
  shader.vertexShader='varying vec3 paintPosition;\nvarying vec3 paintNormal;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npaintPosition=position;paintNormal=normal;');
  shader.fragmentShader=helpers+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=paintedSurface();');
 };
 material.customProgramCacheKey=()=> 'painted-doll-v3';
 return material;
}
export function tintPaint(material,color,base){
 const tint=new THREE.Color(color).convertLinearToSRGB().getHSL({}),original=new THREE.Color(base).convertLinearToSRGB().getHSL({}),u=material.userData.paint;
 u.paintHue.value=tint.h-original.h;
 u.paintSaturation.value=original.s>0?tint.s/original.s:1;
 u.paintGain.value=tint.l/original.l;
}

export function hairBoundsTexture(image){
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
 const ranges=[[80,550,315],[1060,1490,1305],[1520,2015,1765]],data=new Float32Array(3*768*4);
 for(let row=0;row<768;row++)for(let view=0;view<3;view++){
  const [start,end,center]=ranges[view];let left=end,right=start;
  for(let x=start;x<end;x++){const p=(row*image.width+x)*4,r=pixels[p],g=pixels[p+1],b=pixels[p+2];if(r-g>18&&b-g>3){left=Math.min(left,x);right=Math.max(right,x);}}
  if(right-left<12){left=center-12;right=center+12;}
  const offset=(row*3+view)*4;data[offset]=left;data[offset+1]=right;data[offset+2]=center;data[offset+3]=1;
 }
 const texture=new THREE.DataTexture(data,3,768,THREE.RGBAFormat,THREE.FloatType);texture.minFilter=texture.magFilter=THREE.NearestFilter;texture.needsUpdate=true;return texture;
}

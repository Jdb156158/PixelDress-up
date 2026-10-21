"""Build an original modular, skinned chibi doll in Blender, then export VRM 1.0.
Run: .tools/blender-python/bin/python scripts/build-character.py
"""
import bpy, math, json, struct
from mathutils import Vector, Quaternion
from pathlib import Path
from collections import defaultdict
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/assets/character-3d';OUT.mkdir(parents=True,exist_ok=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for data in list(bpy.data.materials):bpy.data.materials.remove(data)
PI=math.pi

def material(name,color,roughness=.7):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;m.use_backface_culling=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=roughness
 return m
skin=material('peach porcelain',(1,.82,.71));cream=material('warm ivory',(.98,.94,.82));pink=material('strawberry silk',(.96,.32,.49));pale=material('blush cotton',(1,.78,.80));deep=material('raspberry ribbon',(.63,.10,.26));sole=material('rose soles',(.46,.17,.24));white=material('milk highlights',(1,.99,.94));cheek=material('rose cheeks',(.96,.44,.49));lip=material('smile',(.62,.14,.23));ink=material('cocoa lashes',(.025,.008,.015));iris=material('berry eyes',(.25,.018,.085),.24);irislight=material('iris glow',(.89,.21,.37),.3);blue=material('powder blue',(.39,.60,.81));navy=material('sailor ink',(.12,.23,.39));gold=material('warm gold',(.95,.65,.25),.35)
eyeshadow=material('eye shadow',(.93,.60,.67))
hairmat=material('rose hair',(.94,.38,.51));hairlight=material('hair satin',(1,.66,.72));hairdark=material('hair shadows',(.64,.16,.29))
# Every mesh is authored in one rest pose and shares this armature.
bones={
 'hips':((0,0,.73),(0,0,.88),None),'spine':((0,0,.88),(0,0,1.02),'hips'),'chest':((0,0,1.02),(0,0,1.17),'spine'),'neck':((0,0,1.17),(0,0,1.30),'chest'),'head':((0,0,1.30),(0,0,1.97),'neck'),
 'hairLeft':((-.38,.08,1.54),(-.43,.14,1.0),'head'),'hairRight':((.38,.08,1.54),(.43,.14,1.0),'head'),'hairBack':((0,.32,1.55),(0,.35,.91),'head'),
 'skirtFront':((0,-.08,.94),(0,-.20,.59),'hips'),'skirtBack':((0,.08,.94),(0,.20,.59),'hips')}
for side,sign in [('left',1),('right',-1)]:
 bones[side+'Shoulder']=((sign*.10,0,1.15),(sign*.235,0,1.14),'chest')
 bones[side+'UpperArm']=((sign*.235,0,1.14),(sign*.39,0,.98),side+'Shoulder')
 bones[side+'LowerArm']=((sign*.39,0,.98),(sign*.56,-.015,.84),side+'UpperArm')
 bones[side+'Hand']=((sign*.56,-.015,.84),(sign*.60,-.02,.82),side+'LowerArm')
 bones[side+'UpperLeg']=((sign*.13,0,.75),(sign*.13,0,.43),'hips')
 bones[side+'LowerLeg']=((sign*.13,0,.43),(sign*.13,0,.12),side+'UpperLeg')
 bones[side+'Foot']=((sign*.13,0,.12),(sign*.13,-.16,.08),side+'LowerLeg')
 bpy.ops.object.select_all(action='DESELECT')
bpy.ops.object.armature_add();rig=bpy.context.object;rig.name='DollRig';bpy.ops.object.mode_set(mode='EDIT');rig.data.edit_bones.remove(rig.data.edit_bones[0])
for name,(a,b,parent) in bones.items():
 bone=rig.data.edit_bones.new(name);bone.head=a;bone.tail=b
 if parent:bone.parent=rig.data.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT')
for bone in rig.pose.bones:bone.rotation_mode='XYZ'
slot='body';option=0;pieces=defaultdict(list)

def finish(obj,name,mat,bone='head',weights=None):
 obj.name=name;obj.data.materials.append(mat)
 bpy.context.view_layer.objects.active=obj;obj.select_set(True)
 bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);obj.select_set(False)
 for face in obj.data.polygons:face.use_smooth=True
 if weights:
  groups={}
  for v in obj.data.vertices:
   w=weights(v.co)
   for b,value in w.items():
    if value>0:
     if b not in groups:groups[b]=obj.vertex_groups.new(name=b)
     groups[b].add([v.index],value,'REPLACE')
 else:obj.vertex_groups.new(name=bone).add(list(range(len(obj.data.vertices))),1,'REPLACE')
 mod=obj.modifiers.new('Shared skeleton','ARMATURE');mod.object=rig;obj.parent=rig
 pieces[(slot,option)].append(obj)
 return obj

def ell(name,loc,scale,mat,bone='head',segments=24,rings=16):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc);obj=bpy.context.object;obj.scale=scale
 return finish(obj,name,mat,bone)

def mesh(name,verts,faces,mat,bone='head',weights=None):
 data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update();obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj)
 return finish(obj,name,mat,bone,weights)

def tube(name,points,radii,mat,bone='head',sides=10,flat=1,weights=None):
 # A closed volumetric strand, not a camera-facing card.
 verts=[];faces=[];points=[Vector(p) for p in points]
 for j,p in enumerate(points):
  tangent=(points[min(j+1,len(points)-1)]-points[max(0,j-1)]).normalized();ref=Vector((0,1,0))
  if abs(tangent.dot(ref))>.9:ref=Vector((1,0,0))
  axis=tangent.cross(ref).normalized();other=tangent.cross(axis).normalized()
  for k in range(sides):
   t=2*PI*k/sides;verts.append(p+radii[j]*(axis*math.cos(t)+other*math.sin(t)*flat))
 for j in range(len(points)-1):
  for k in range(sides):a=j*sides+k;b=j*sides+(k+1)%sides;faces.append((a,b,b+sides,a+sides))
 faces.extend([tuple(reversed(range(sides))),tuple((len(points)-1)*sides+k for k in range(sides))])
 return mesh(name,verts,faces,mat,bone,weights)

def bezier(a,b,c,d,n=18):
 a,b,c,d=map(Vector,(a,b,c,d));return [(1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d for t in [i/(n-1) for i in range(n)]]

def lock(name,a,b,c,d,width,mat=hairmat,bone='head',weights=None):
 pts=bezier(a,b,c,d,22);r=[max(.010,width*(.28+.72*math.sin(PI*(i/21)**.8))*(1-(i/21)**8)) for i in range(22)]
 return tube(name,pts,r,mat,bone,10,.42,weights)

def line(name,points,r,mat,bone='head'):return tube(name,points,[r]*len(points),mat,bone,8)

def loft(name,rows,mat,bone='hips',pleats=0,weights=None):
 verts=[];faces=[];n=64
 for z,rx,ry in rows:
  for k in range(n):
   t=2*PI*k/n;f=1+pleats*math.cos(12*t);verts.append((rx*f*math.sin(t),-ry*f*math.cos(t),z))
 for j in range(len(rows)-1):
  for k in range(n):a=j*n+k;b=j*n+(k+1)%n;faces.append((a,b,b+n,a+n))
 if rows[-1][0]<rows[0][0]:faces=[tuple(reversed(face)) for face in faces]
 return mesh(name,verts,faces,mat,bone,weights)

def ring(name,z,rx,ry,mat,r=.008,bone='hips',scallop=0):
 points=[]
 for k in range(129):
  t=2*PI*k/128;points.append((rx*math.sin(t),-ry*math.cos(t),z+scallop*math.cos(t*16)))
 return line(name,points,r,mat,bone)

def ribbon_patch(name,outline,y,mat,bone):
 # Pillow-thin closed cloth; mirrored pieces keep the same outward-facing winding.
 area=sum(outline[i][0]*outline[(i+1)%len(outline)][1]-outline[(i+1)%len(outline)][0]*outline[i][1] for i in range(len(outline)))
 if area>0:outline=list(reversed(outline))
 cx=sum(p[0] for p in outline)/len(outline);cz=sum(p[1] for p in outline)/len(outline)
 verts=[(cx,y-.022,cz)]+[(x,y,z) for x,z in outline]+[(cx,y+.012,cz)]
 n=len(outline);faces=[]
 for k in range(n):faces.extend([(0,1+k,1+(k+1)%n),(n+1,1+(k+1)%n,1+k)])
 return mesh(name,verts,[tuple(reversed(f)) for f in faces],mat,bone)

def bow(name,center,size,mat=pink,bone='chest'):
 x,y,z=center
 for sign in [-1,1]:
  outline=[(x+sign*size*u,z+size*v) for u,v in [(0,.08),(.83,.42),(.97,.28),(.97,-.31),(.75,-.39),(0,-.08)]]
  if sign<0:outline.reverse()
  ribbon_patch(name+' loop',outline,y,mat,bone)
  tail=[(x+sign*size*u,z+size*v) for u,v in [(.12,-.08),(.48,-.12),(.68,-.92),(.36,-.81),(.17,-.96)]]
  if sign<0:tail.reverse()
  ribbon_patch(name+' tail',tail,y+.012,mat,bone)
 ell(name+' knot',(x,y-.028,z),(size*.18,size*.12,size*.21),mat,bone,16,10)

def heart(name,center,size,mat,bone='hips'):
 x,y,z=center;outline=[]
 for i in range(48):
  t=2*PI*i/48;outline.append((x+size*math.sin(t)**3,y,z+size*(13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t))/16))
 verts=[(x,y-.004,z)]+outline;faces=[(0,1+(i+1)%48,1+i) for i in range(48)]
 mesh(name,verts,faces,mat,bone)

def arm_weights(co):
 sign=1 if co.x>=0 else -1;s='left' if sign==1 else 'right';z=co.z
 if z>=1.09:return {'chest':.2,s+'UpperArm':.8}
 if z>.96:return {s+'UpperArm':1}
 mix=max(0,min(1,(z-.89)/.10));return {s+'UpperArm':mix,s+'LowerArm':1-mix}
# Body surface / limbs. Covered torso regions are hidden by the chosen outfit.
ell('neck',(0,0,1.235),(.066,.063,.090),skin,'neck')
loft('torso',[(.73,.16,.10),(.87,.17,.11),(.99,.19,.125),(1.10,.225,.13),(1.16,.19,.11)],skin,'chest')
for side,sign in [('left',1),('right',-1)]:
 pts=[(sign*(.235+.325*t),-.015*t,1.14-.30*t) for t in [i/16 for i in range(17)]]
 tube(side+' arm',pts,[.068-.027*(i/16) for i in range(17)],skin,side+'UpperArm',14,1,arm_weights)
 # At the knee the weight blend is shared between both continuous limb segments.
 def legweights(co,s=side):
  mix=max(0,min(1,(co.z-.38)/.10));return {s+'UpperLeg':mix,s+'LowerLeg':1-mix}
 pts=[(sign*.13,0,.75-.63*t) for t in [i/20 for i in range(21)]]
 tube(side+' leg',pts,[.073-.024*(i/20) for i in range(21)],skin,side+'UpperLeg',14,1,legweights)
# Rounded anime head with soft cheeks and a compact chin.
verts=[];faces=[];n=64;m=40
for j in range(m+1):
 phi=PI*j/m;v=math.cos(phi);z=1.75+.43*v
 for k in range(n):
  t=2*PI*k/n;rad=math.sin(phi);jaw=1-.08*max(0,-v)
  x=.48*rad*math.cos(t)*jaw;y=.32*rad*math.sin(t)
  if y<0:y=-.335*(rad*abs(math.sin(t)))**.80
  verts.append((x,y,z))
for j in range(m):
 for k in range(n):a=j*n+k;b=j*n+(k+1)%n;faces.append((a,b,b+n,a+n))
mesh('porcelain face',verts,[tuple(reversed(face)) for face in faces],skin)
for sign in [-1,1]:
 ell('ear',(sign*.448,0,1.57),(.063,.041,.076),skin)
 ell('ear blush',(sign*.475,-.022,1.57),(.023,.018,.044),cheek)
 ell('cheek',(sign*.292,-.318,1.432),(.044,.004,.016),cheek)
# Eyes are thin curved geometry on the face, without protruding eyeballs or a raised nose.
eye_objects=[]
for sign in [-1,1]:
 x=sign*.190
 ell('soft eye shadow',(x,-.337,1.681),(.106,.003,.021),eyeshadow)
 eye_objects.append(ell('lash shape',(x,-.327,1.563),(.112,.009,.112),ink))
 eye_objects.append(ell('eye white',(x,-.338,1.555),(.102,.005,.105),white))
 eye_objects.append(ell('iris',(x,-.346,1.550),(.099,.005,.108),iris))

 eye_objects.append(ell('pupil',(x,-.356,1.582),(.061,.003,.071),ink))
 eye_objects.append(ell('eye sparkle',(x-.026,-.361,1.600),(.021,.002,.021),white,segments=16,rings=10))
 eye_objects.append(ell('tiny sparkle',(x+.030,-.361,1.533),(.010,.002,.011),white,segments=12,rings=8))
 # Soft upper lid with three outer lashes, like the pixel reference.
 eye_objects.append(line('upper lid',bezier((x-.105,-.347,1.605),(x-.078,-.355,1.689),(x+.075,-.355,1.689),(x+.110,-.347,1.605),22),.011,ink))
 for k in range(3):
  start=(x+sign*(.079+k*.009),-.350,1.626+k*.008);end=(start[0]+sign*.026,-.350,start[2]+.017)
  eye_objects.append(line('eyelash',[start,end],.007,ink))
 line('eyebrow',bezier((x-.060,-.312,1.755),(x-.02,-.327,1.768),(x+.02,-.327,1.768),(x+.06,-.312,1.755),12),.005,hairdark)
ell('nose tint',(0,-.329,1.456),(.012,.003,.008),cheek)
line('smile',bezier((-.030,-.323,1.405),(-.016,-.333,1.378),(.016,-.333,1.378),(.030,-.323,1.405),16),.006,lip)
# Hands are modular and share exactly the same wrist socket and bone.
for variant in range(2):
 slot='hands';option=variant
 for side,sign in [('left',1),('right',-1)]:
  x=sign*.57;mat=skin if variant==0 else cream
  ell('palm',(x,-.020,.825),(.065 if not variant else .068,.033,.043),mat,side+'Hand')
  ell('thumb',(x-sign*.040,-.039,.85),(.025,.030,.043),mat,side+'Hand',16,10)
  if variant==0:
   for k in range(3):ell('fingertip',(x+sign*(k-1)*.023,-.021,.800),(.018,.025,.018),mat,side+'Hand',12,8)
  else:
   ell('mitten cuff',(x,-.015,.855),(.061,.051,.025),pale,side+'Hand')
   bow('mitten bow',(x,-.063,.835),.038,pink,side+'Hand')
# One cohesive, rounded wig surface per style. Painted strands replace the old parallel strips.
def sample_profile(profile,t):
 u=t*(len(profile)-1);i=min(len(profile)-2,int(u));f=u-i
 a=Vector(profile[max(0,i-1)]);b=Vector(profile[i]);c=Vector(profile[i+1]);d=Vector(profile[min(len(profile)-1,i+2)])
 return .5*((2*b)+(-a+c)*f+(2*a-5*b+4*c-d)*f*f+(-a+3*b-3*c+d)*f*f*f)
for variant in range(9):
 slot='hair';option=variant
 long=variant in [1,2,5,8]
 profile=[(2.24,.003,.003,0),(2.205,.15,.17,0),(2.13,.29,.29,.08),(2.02,.43,.36,.48),(1.87,.52,.38,.84),(1.69,.56,.37,1.02),(1.49,.56,.33,1.06)]
 profile+=([(1.22,.55,.30,1.07),(.94,.50,.27,1.07),(.64,.44,.24,1.05)] if long else [(1.36,.51,.27,1.06),(1.31,.41,.20,1.08)])
 rows=60;cols=72;verts=[];faces=[]
 for layer in range(2):
  for r in range(rows):
   z,rx,ry,opening=sample_profile(profile,r/(rows-1))
   for c in range(cols):
    theta=opening+(2*PI-2*opening)*c/(cols-1)
    wave=(.022 if variant==2 else .043 if variant==5 else 0)*math.sin((z-.6)*12+theta*2)*max(0,min(1,(1.60-z)/.30))
    radius=max(.002,rx-layer*.028+wave)
    x=radius*math.sin(theta);y=-max(.002,ry-layer*.026+wave*.4)*math.cos(theta)
    bottom=(.014*math.cos(theta*9))*max(0,(r/(rows-1)-.92)/.08)
    verts.append((x,y,z+bottom))
 count=rows*cols
 for layer in range(2):
  offset=layer*count
  for r in range(rows-1):
   for c in range(cols-1):
    a=offset+r*cols+c;f=(a,a+cols,a+cols+1,a+1);faces.append(f if not layer else tuple(reversed(f)))
 for r in range(rows-1):
  for c in [0,cols-1]:
   a=r*cols+c;f=(a,a+count,a+count+cols,a+cols);faces.append(f if c==0 else tuple(reversed(f)))
 for c in range(cols-1):
  a=(rows-1)*cols+c;faces.append((a,a+1,a+1+count,a+count))
 def wig_weights(co):
  t=max(0,min(1,(1.53-co.z)/.62)) if long else 0
  return {'head':1-t,'hairBack':t}
 mesh('rounded continuous wig',verts,faces,hairmat,weights=wig_weights)
 if variant==3:
  for sign in [-1,1]:
   pts=bezier((sign*.41,.02,1.69),(sign*.73,.13,1.55),(sign*.69,.17,.91),(sign*.53,.09,.64),36)
   radii=[.035+.13*math.sin(PI*(i/35)**.60)**.7 for i in range(36)];radii[-1]=.020
   tube('rounded twin tail',pts,radii,hairmat,'hairLeft' if sign<0 else 'hairRight',24)
   bow('ponytail tie',(sign*.49,-.11,1.59),.08,pink,'head')
 if variant in [4,6]:
  for sign in ([1] if variant==4 else [-1,1]):
   for strand in range(3):
    pts=[]
    for k in range(60):
     t=k/59;phase=t*PI*7+strand*2*PI/3
     pts.append((sign*(.49+.02*math.sin(t*PI))+.039*math.sin(phase),-.08+.031*math.cos(phase),1.64-1.01*t))
    tube('soft woven braid',pts,[.030*(1-.35*k/59) for k in range(60)],hairmat,'hairRight' if sign>0 else 'hairLeft',12)
   bow('braid tie',(sign*.49,-.13,.70),.065,pink,'hairRight' if sign>0 else 'hairLeft')
 if variant==7:
  pts=bezier((0,.31,2.01),(0,.71,1.94),(0,.68,1.05),(0,.42,.65),42)
  tube('rounded high ponytail',pts,[.025+.19*math.sin(PI*(i/41)**.65)**.65 for i in range(42)],hairmat,'hairBack',32)
  bow('ponytail bow',(0,.45,2.01),.13,pink,'head')
 if variant==8:
  for strand in range(3):
   pts=[]
   for k in range(50):
    t=PI*.30+PI*1.40*k/49;phase=k/49*PI*10+strand*2*PI/3
    pts.append(((.53+.018*math.sin(phase))*math.sin(t),-(.36+.018*math.sin(phase))*math.cos(t),1.80+.04*math.cos(t)+.018*math.cos(phase)))
   tube('princess braided crown',pts,[.019]*50,hairmat,'head',10)
 bow('hair bow',(.40,-.39,1.94),.125,cream,'head')
# Clothes are authored on the base body, with cloth motion bones on the skirt.
for variant in range(4):
 slot='outfit';option=variant;cloth=cream if variant in [0,1] else blue if variant==2 else navy;trim=pink if variant in [0,1,3] else navy
 def torso_w(co):
  t=max(0,min(1,(co.z-.87)/.20));return {'hips':1-t,'chest':t}
 loft('fitted bodice',[(.88,.18,.12),(.97,.19,.135),(1.07,.22,.145),(1.14,.21,.13),(1.18,.13,.09)],cream if variant==2 else cloth,'chest',weights=torso_w)
 def skirt_w(co):
  t=max(0,min(.32,(.95-co.z)*.8));b='skirtFront' if co.y<0 else 'skirtBack';return {'hips':1-t,b:t}
 rows=[(.93,.18,.125),(.87,.22,.16),(.77,.30,.225),(.64,.39,.29),(.58,.405,.31)]
 loft('bell skirt',rows,pale if variant==1 else cloth,pleats=.035 if variant==0 else .065,weights=skirt_w)
 if variant==0:
  # Blush gores alternate with ivory panels, as in the reference dress.
  for k in range(10):
   middle=2*PI*k/10;v=[];f=[]
   for z,rx,ry in rows:
    for j in range(7):
     t=middle+(j/6-.5)*.31;v.append(((rx+.003)*math.sin(t),-(ry+.003)*math.cos(t),z))
   for r in range(len(rows)-1):
    for j in range(6):a=r*7+j;f.append((a,a+7,a+8,a+1))
   mesh('blush skirt gore',v,f,pale,weights=skirt_w)
 # Continuous ruffled fabric around the hem.
 rows=[(.60,.407,.314),(.565,.421,.326),(.545,.425,.330)]
 loft('ivory petticoat',rows,pale if variant==0 else cream,pleats=.035,weights=skirt_w)
 ring('hem ribbon',.615,.400,.305,trim,.010,scallop=.004)
 ring('ruffle scallops',.545,.427,.331,cream,.018,scallop=.012)
 ring('lace upper edge',.575,.426,.330,cream,.007,scallop=.012)
 ring('waist piping',.923,.188,.134,trim,.011)
 for side,sign in [('left',1),('right',-1)]:
  if variant in [1,2]:
   sleeve_mat=cream
   # Bury a small rounded sleeve cap inside the bodice; a full diagonal cap
   # protrudes above the shoulder as a white triangle in the rear view.
   pts=[(sign*.19,0,1.12)]+[(sign*(.235+.325*t),-.015*t,1.12-.28*t) for t in [i/16 for i in range(17)]]
   radii=[.035]+[.083+.012*math.sin(PI*i/16)-.003*i/16 for i in range(17)]
   tube('long cloth sleeve',pts,radii,sleeve_mat,side+'UpperArm',20,1,arm_weights)
   tube('sleeve cuff',[(sign*.535,-.014,.863),(sign*.56,-.015,.84)],[.084,.082],pale if variant==1 else navy,side+'LowerArm',20,1,arm_weights)
  else:
   ell('puff sleeve',(sign*.242,0,1.10),(.105,.122,.110),cloth,side+'UpperArm')
   ell('sleeve cuff',(sign*.275,0,1.047),(.083,.104,.026),cream,side+'UpperArm')
 # Two collar lobes have depth and meet at the neck.
 for sign in [-1,1]:ell('collar',(sign*.064,-.114,1.151),(.078,.035,.044),cream if variant==0 else navy,'chest')
 bow('chest ribbon',(0,-.182,1.063),.135,trim,'chest')
 if variant==0:
  for t in [-.66,0,.66]:
   x=.397*math.sin(t);y=-.315*math.cos(t)
   heart('heart embroidery',(x,y-.008,.673),.045,pink)
  for side,sign in [('left',1),('right',-1)]:
   for dx,dz in [(-.02,0),(.025,.02),(0,-.035)]:heart('sleeve heart',(sign*.25+dx,-.121,1.11+dz),.016,pale,side+'UpperArm')
 elif variant==1:
  # Cream cardigan over a pink pleated skirt.
  for sign in [-1,1]:
   ribbon_patch('cardigan front',[(sign*.018,.90),(sign*.19,.90),(sign*.20,1.13),(sign*.08,1.17),(sign*.018,1.04)],-.15,cream,'chest')
  for z in [1.0,.956,.916]:ell('cardigan button',(0,-.177,z),(.009,.006,.009),pink,'chest',12,8)
 elif variant==2:
  for sign in [-1,1]:
   ribbon_patch('sailor collar',[(0,1.07),(sign*.18,1.16),(sign*.13,1.19),(0,1.10)],-.162,navy,'chest')
  ring('sailor stripe',.653,.382,.286,cream,.009)
  for z in [1.007,.958]:ell('brass button',(0,-.149,z),(.013,.009,.013),gold,'chest',12,8)
 else:
  for t in [-.68,.68]:bow('skirt ribbon',(.39*math.sin(t),-.31*math.cos(t),.675),.07,pink,'hips')
  for z in [.96,1.00]:line('corset lacing',[(-.045,-.154,z+.012),(.045,-.154,z-.012)],.005,pink,'chest')
# Shoes and socks, built as complete paired modules.
for variant in range(2):
 slot='shoes';option=variant;shoe=pink if variant==0 else navy
 for side,sign in [('left',1),('right',-1)]:
  x=sign*.13;foot=side+'Foot';leg=side+'LowerLeg'
  ell('shoe sole',(x,-.065,.048),(.119,.165,.034),sole if variant==0 else navy,foot)
  ell('rounded toe',(x,-.078,.108),(.118,.154,.085),shoe,foot)
  tube('cream sock',[(x,0,.12),(x,0,.345)],[.063,.068],cream,leg,20)
  ell('sock cuff',(x,0,.357),(.080,.074,.026),white,leg)
  if variant==0:
   for k in range(12):
    t=2*PI*k/12;ell('sock lace',(x+.074*math.sin(t),.069*math.cos(t),.351),(.014,.014,.016),white,leg,10,8)
   ell('shoe opening',(x,-.063,.170),(.077,.075,.012),cream,foot)
   line('Mary Jane strap',[(x-.087,-.025,.163),(x,-.050,.184),(x+.087,-.025,.163)],.013,pink,foot)
   bow('shoe ribbon',(x,-.213,.135),.055,pink,foot)
   ell('strap button',(x+sign*.080,-.039,.16),(.013,.012,.013),gold,foot,12,8)
  else:
   ell('boot upper',(x,.005,.215),(.071,.076,.108),blue,leg)
   ell('boot cuff',(x,0,.305),(.080,.083,.022),cream,leg)
   for z in [.18,.222,.263]:line('boot lace',[(x-.039,-.072,z),(x+.039,-.072,z)],.006,cream,leg)
   bow('boot ribbon',(x,-.080,.29),.038,cream,leg)
# Keep the reference's front proportions while giving the skull and every wig
# enough front-to-back volume for a rounded profile. Accessories move with them.
for (part,variant),objects in pieces.items():
 for obj in objects:
  group=obj.vertex_groups.get('head')
  for vertex in obj.data.vertices:
   weight=next((g.weight for g in vertex.groups if group and g.group==group.index),0)
   vertex.co.z-=.075*weight
   if part=='hair' or weight>0:vertex.co.y*=1.45
for (part,variant),objects in pieces.items():
 if part=='hair':continue
 for obj in objects:
  head_group=obj.vertex_groups.get('head')
  for vertex in obj.data.vertices:
   head_weight=next((g.weight for g in vertex.groups if head_group and g.group==head_group.index),0)
   if not head_weight:vertex.co.x*=1.10
bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
for bone in rig.data.edit_bones:
 if bone.name.startswith(('left','right')):bone.head.x*=1.10;bone.tail.x*=1.10
bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
# Combine each authored part into a single selectable object; preserve materials and bone weights.
bpy.ops.object.select_all(action='DESELECT')
for (part,variant),objects in pieces.items():
 for obj in objects:obj.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();obj=bpy.context.object;obj.name=f'{part}_{variant}';obj['slot']=part;obj['option']=variant
 if part=='body':
  # Eyes are isolated below by material so blinks do not squash the face.
  basis=obj.shape_key_add(name='Basis');blink=obj.shape_key_add(name='blink')
  eye_mats={m.name for m in [ink,white,iris,irislight]};indices=set()
  for face in obj.data.polygons:
   if obj.data.materials[face.material_index].name in eye_mats:
    for ix in face.vertices:
     if 1.35<obj.data.vertices[ix].co.z<1.65:indices.add(ix)
  for ix in indices:blink.data[ix].co.z=1.485+(basis.data[ix].co.z-1.485)*.035
 bpy.ops.object.select_all(action='DESELECT')
# Bake three native skeletal animation clips. The rest pose remains shared across all variants.
rig.animation_data_create();fps=30
def turn(name,axis,angle):
 q=rig.data.bones[name].matrix_local.to_quaternion();rig.pose.bones[name].rotation_euler=(q.inverted()@Quaternion(Vector(axis),angle)@q).to_euler()

for name in ['idle','wave','walk']:
 action=bpy.data.actions.new(name);rig.animation_data.action=action
 for frame in range(0,91,3):
  phase=2*PI*frame/90
  for bone in rig.pose.bones:bone.rotation_euler=(0,0,0);bone.location=(0,0,0)
  rig.pose.bones['chest'].rotation_euler.x=.018*math.sin(phase)
  rig.pose.bones['head'].rotation_euler.z=.025*math.sin(phase)
  if name=='wave':
   turn('rightUpperArm',(0,1,0),1.45)
   turn('rightLowerArm',(0,1,0),.36+.25*math.sin(phase*3))
   turn('rightHand',(0,1,0),.15*math.sin(phase*3))
   rig.pose.bones['head'].rotation_euler.z=-.065
  elif name=='walk':
   for side,sign in [('left',1),('right',-1)]:
    step=math.sin(phase*2)*sign
    turn(side+'UpperLeg',(1,0,0),.38*step)
    turn(side+'LowerLeg',(1,0,0),-max(0,-step)*.45)
    turn(side+'UpperArm',(1,0,0),-.25*step)
   rig.pose.bones['hips'].location.y=.014*abs(math.sin(phase*2))
  for key in ['hips','chest','head','rightUpperArm','rightLowerArm','rightHand','leftUpperArm','leftLowerArm','leftHand','leftUpperLeg','leftLowerLeg','rightUpperLeg','rightLowerLeg']:
   rig.pose.bones[key].keyframe_insert('rotation_euler',frame=frame,group=key)
   if key=='hips':rig.pose.bones[key].keyframe_insert('location',frame=frame,group=key)
 track=rig.animation_data.nla_tracks.new();track.name=name;strip=track.strips.new(name,0,action);strip.action_frame_end=90;track.mute=True
 rig.animation_data.action=None
for bone in rig.pose.bones:bone.rotation_euler=(0,0,0);bone.location=(0,0,0)
scene=bpy.context.scene;scene.render.fps=fps;scene.frame_start=0;scene.frame_end=90;scene.frame_set(0)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'art/character/strawberry.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'strawberry.glb'),export_format='GLB',export_animations=True,export_animation_mode='ACTIONS',export_nla_strips=True,export_force_sampling=True,export_extras=True,export_morph=True,export_skins=True)
# VRM 1.0 is a glTF extension. Add the explicit humanoid and facial mappings to the authored GLB.
raw=(OUT/'strawberry.glb').read_bytes();jlen,jtype=struct.unpack_from('<II',raw,12);data=json.loads(raw[20:20+jlen]);binary=raw[20+jlen:]
node_by_name={node.get('name'):i for i,node in enumerate(data['nodes'])}
human={name:{'node':node_by_name[name]} for name in bones if name in node_by_name and not name.startswith(('hair','skirt'))}
body_node=node_by_name.get('body_0');morph=[]
for i,node in enumerate(data['nodes']):
 if node.get('name')=='body_0' and 'mesh' in node:morph.append({'node':i,'index':0,'weight':1})
vrm={'specVersion':'1.0','meta':{'name':'Strawberry / Pixel Dress-up','version':'1.0','authors':['Pixel Dress-up'],'copyrightInformation':'Original model authored for Pixel Dress-up','licenseUrl':'https://vrm.dev/licenses/1.0/','avatarPermission':'everyone','allowExcessivelyViolentUsage':False,'allowExcessivelySexualUsage':False,'commercialUsage':'corporation','allowPoliticalOrReligiousUsage':False,'allowAntisocialOrHateUsage':False,'creditNotation':'unnecessary','allowRedistribution':True,'modification':'allowModificationRedistribution'},'humanoid':{'humanBones':human},'expressions':{'preset':{'blink':{'isBinary':False,'morphTargetBinds':morph}},'custom':{}}}
data.setdefault('extensions',{})['VRMC_vrm']=vrm
data.setdefault('extensionsUsed',[]).append('VRMC_vrm')
# Spring bones follow the head; body colliders constrain long hair at the shoulders.
data['extensions']['VRMC_springBone']={'specVersion':'1.0','colliders':[{'node':node_by_name['chest'],'shape':{'sphere':{'offset':[0,0,0],'radius':.22}}}],'colliderGroups':[{'name':'shoulders','colliders':[0]}],'springs':[{'name':name,'joints':[{'node':node_by_name[name],'hitRadius':.045,'stiffness':1.5,'gravityPower':.02,'gravityDir':[0,-1,0],'dragForce':.65}],'colliderGroups':[0]} for name in ['hairLeft','hairRight','hairBack']]}
data['extensionsUsed'].append('VRMC_springBone')
encoded=json.dumps(data,separators=(',',':')).encode();encoded+=b' '*((-len(encoded))%4)
vrm_bytes=struct.pack('<III',0x46546c67,2,20+len(encoded)+len(binary))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+binary
(OUT/'strawberry.vrm').write_bytes(vrm_bytes)
report={'blender':bpy.app.version_string,'vertices':sum(len(o.data.vertices) for o in bpy.data.objects if o.type=='MESH'),'bones':len(bones),'modules':[{ 'slot':p,'option':i} for p,i in pieces],'animations':[a.name for a in bpy.data.actions],'vrmBytes':len(vrm_bytes),'source':'art/character/strawberry.blend','originalGeometry':True}
(OUT/'model-info.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))

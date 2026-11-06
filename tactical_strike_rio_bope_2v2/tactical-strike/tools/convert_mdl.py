"""Convert supplied GoldSrc IDST v10 geometry, indexed textures and bone animation.
Independent format reader. Format reference: ValveSoftware/halflife engine/studio.h.
Usage: python tools/convert_mdl.py MODEL.mdl OUTPUT_DIR
"""
import struct,json,sys,math
from pathlib import Path
from PIL import Image
b=Path(sys.argv[1]).read_bytes();out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
def u(fmt,o):return struct.unpack_from('<'+fmt,b,o)
def name(s):return s.split(b'\0')[0].decode('latin1')
assert b[:4]==b'IDST' and u('i',4)[0]==10
nb,bi=u('ii',140);nt,ti=u('ii',180);ns,si=u('ii',164);np,pi=u('ii',204);nref,nfam,skinindex=u('iii',192)
bones=[]
for i in range(nb):
 r=u('32s8i12f',bi+112*i);bones.append({'name':name(r[0]),'parent':r[1],'value':list(r[9:15]),'scale':list(r[15:21])})
textures=[]
for i in range(nt):
 n,flags,w,h,idx=u('64s4i',ti+80*i);im=Image.frombytes('P',(w,h),b[idx:idx+w*h]);im.putpalette(b[idx+w*h:idx+w*h+768]);
 if flags&64:im.info['transparency']=255
 im.convert('RGBA').save(out/f'texture-{i}.png');textures.append({'name':name(n),'url':f'texture-{i}.png','width':w,'height':h,'masked':bool(flags&64)})
groups=[];triangles=0
for part in range(np):
 n,count,base,idx=u('64s3i',pi+76*part)
 # First bodygroup variant is the standard visible model; blank optional backpack skipped.
 r=u('64sif10i',idx);nm,mi,nv,vbi,vi,nn,nbi,ni=r[3:11]
 for j in range(nm):
  ntris,ptr,skinref,_,_=u('5i',mi+20*j);texid=u('h',skinindex+2*skinref)[0];t=textures[texid];g={'texture':texid,'positions':[],'normals':[],'bones':[],'normalBones':[],'uv':[]}
  while True:
   count=u('h',ptr)[0];ptr+=2
   if count==0:break
   strip=[u('4h',ptr+8*k) for k in range(abs(count))];ptr+=abs(count)*8
   for k in range(2,len(strip)):
    ids=([k-2,k-1,k] if k%2==0 else [k-1,k-2,k]) if count>0 else [0,k-1,k]
    triangles+=1
    for k2 in ids:
     v,n,s,tv=strip[k2];g['positions'].extend(u('3f',vi+v*12));g['normals'].extend(u('3f',ni+n*12));g['bones'].append(b[vbi+v]);g['normalBones'].append(b[nbi+n]);g['uv'].extend([s/t['width'],1-tv/t['height']])
  groups.append(g)
def quat(a):
 x,y,z=[v/2 for v in a];sx,cx=math.sin(x),math.cos(x);sy,cy=math.sin(y),math.cos(y);sz,cz=math.sin(z),math.cos(z)
 return [sx*cy*cz-cx*sy*sz,cx*sy*cz+sx*cy*sz,cx*cy*sz-sx*sy*cz,cx*cy*cz+sx*sy*sz]
def channel(ptr,offset,frame):
 if not offset:return 0
 p=ptr+offset;k=frame
 while True:
  valid,total=u('BB',p);assert total>0
  if k<total:return u('h',p+2*(min(k+1,valid)))[0] if valid else 0
  k-=total;p+=2*(valid+1)
animations={}
for i in range(ns):
 p=si+176*i;n=name(u('32s',p)[0])
 if n not in ['idle1','walk','run','ref_aim_rifle','ref_aim_onehanded','ref_aim_knife']:continue
 fps=u('f',p+32)[0];nf=u('i',p+56)[0];blends,idx=u('ii',p+120);sg=u('i',p+156)[0];assert sg==0
 if blends==9:idx+=4*nb*12
 frames=[]
 for f in range(nf):
  frame=[]
  for k,bone in enumerate(bones):
   ptr=idx+k*12;offsets=u('6H',ptr);v=[bone['value'][c]+channel(ptr,offsets[c],f)*bone['scale'][c] for c in range(6)]
   frame.extend(v[:3]+quat(v[3:]))
  frames.append(frame)
 animations[n]={'fps':fps,'frames':frames}
result={'name':'BOPE','bones':[{'name':x['name'],'parent':x['parent'],'position':x['value'][:3],'quaternion':quat(x['value'][3:])} for x in bones],'groups':groups,'textures':textures,'animations':animations,'triangles':triangles}
# Compact finite data, retaining precision for smooth animation.
def rounded(x):
 if isinstance(x,float):assert math.isfinite(x);return round(x,6)
 if isinstance(x,list):return [rounded(v) for v in x]
 if isinstance(x,dict):return {k:rounded(v) for k,v in x.items()}
 return x
(out/'model.json').write_text(json.dumps(rounded(result),separators=(',',':')))
print(out,triangles,'triangles',len(bones),'bones',list(animations))

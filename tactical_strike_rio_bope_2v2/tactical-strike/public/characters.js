import * as THREE from 'three';
export const OPERATORS=['gign','gsg9','sas','urban'].map(id=>({id,name:'BOPE '+id.toUpperCase(),role:'Skin enviada · CS 1.6'}));
const assets=[];
let loading;
function skeleton(data){const bones=data.bones.map(b=>{const bone=new THREE.Bone();bone.name=b.name;bone.position.fromArray(b.position);bone.quaternion.fromArray(b.quaternion);return bone;});data.bones.forEach((b,i)=>{if(b.parent>=0)bones[b.parent].add(bones[i]);});bones[0].updateMatrixWorld(true);return bones;}
export function loadOperators(){return loading??=Promise.all(OPERATORS.map(async(p,index)=>{
 const base='/models/bope/'+p.id+'/';const res=await fetch(base+'model.json');if(!res.ok)throw new Error('Personagem '+p.id+' não encontrado');const data=await res.json();const bones=skeleton(data);
 const loader=new THREE.TextureLoader();const materials=await Promise.all(data.textures.map(async t=>{const map=await loader.loadAsync(base+t.url);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.LinearFilter;return new THREE.MeshStandardMaterial({map,roughness:.9,metalness:0,side:THREE.DoubleSide,alphaTest:t.masked?.5:0});}));
 const geometries=data.groups.map(g=>{const positions=[],normals=[],indices=[],weights=[];const v=new THREE.Vector3();for(let i=0;i<g.bones.length;i++){const m=bones[g.bones[i]].matrixWorld;v.fromArray(g.positions,i*3).applyMatrix4(m);positions.push(...v.toArray());v.fromArray(g.normals,i*3).transformDirection(bones[(g.normalBones||g.bones)[i]].matrixWorld);normals.push(...v.toArray());indices.push(g.bones[i],0,0,0);weights.push(1,0,0,0);}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(g.uv,2));geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));return geometry;});
 assets[index]={data,geometries,materials};
}));}
export function createOperator(index=0){index=((index%4)+4)%4;const asset=assets[index];if(!asset)throw new Error('Carregue os personagens antes de criá-los');const {data,geometries,materials}=asset;
 const root=new THREE.Group(),model=new THREE.Group(),bones=skeleton(data);model.add(bones[0]);const rig=new THREE.Skeleton(bones);const meshes=[];
 data.groups.forEach((g,i)=>{const mesh=new THREE.SkinnedMesh(geometries[i],materials[g.texture]);mesh.bind(rig,new THREE.Matrix4());mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;model.add(mesh);meshes.push(mesh);});
 // GoldSrc: inches, Z-up, +X forward. Game: metres, Y-up, +Z forward.
 model.scale.setScalar(.025);model.rotation.set(-Math.PI/2,-Math.PI/2,0,'YXZ');root.add(model);root.name=OPERATORS[index].name;
 root.userData.rig={bones,data,model,time:0,weapon:'rifle'};root.userData.operator=index;animateOperator(root,0,0);root.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(model,true);const ratio=1.8/(bounds.max.y-bounds.min.y);model.scale.multiplyScalar(ratio);model.position.y=-bounds.min.y*ratio;root.userData.height=1.8;
 root.userData.rig.held=createHeldWeapons();root.add(root.userData.rig.held);animateOperator(root,0,0);
 return root;
}
const q=new THREE.Quaternion(),v=new THREE.Vector3();
export function animateOperator(root,dt,speed=0){const rig=root.userData.rig;if(!rig)return;rig.time+=dt;const clip=rig.data.animations[speed>.15?(speed>4?'run':'walk'):'idle1'];const frame=rig.time*clip.fps;const count=Math.max(1,clip.frames.length-1);const a=clip.frames[Math.floor(frame)%count],b=clip.frames[(Math.floor(frame)+1)%count],alpha=frame%1;
 const aim=rig.data.animations[{rifle:'ref_aim_rifle',pistol:'ref_aim_onehanded',knife:'ref_aim_knife'}[rig.weapon]].frames[0];
 rig.bones.forEach((bone,i)=>{if((i>=2&&i<=34)||i===49){bone.position.fromArray(aim,i*7);bone.quaternion.fromArray(aim,i*7+3);return;}bone.position.fromArray(a,i*7).lerp(v.fromArray(b,i*7),alpha);bone.quaternion.fromArray(a,i*7+3).slerp(q.fromArray(b,i*7+3),alpha);});
 if(rig.held){root.updateMatrixWorld(true);rig.bones[24].getWorldPosition(v);root.worldToLocal(v);rig.held.position.copy(v);for(const child of rig.held.children)child.visible=child.name===rig.weapon;} 
}

export function setOperatorWeapon(root,weapon){if(root.userData.rig&&['rifle','pistol','knife'].includes(weapon))root.userData.rig.weapon=weapon;}
const heldSteel=new THREE.MeshStandardMaterial({color:0x35434e,metalness:.65,roughness:.4}),heldBlack=new THREE.MeshStandardMaterial({color:0x141b22,roughness:.7}),heldEdge=new THREE.MeshStandardMaterial({color:0xbacbd5,metalness:.8,roughness:.25});
const unitBox=new THREE.BoxGeometry(1,1,1);
function createHeldWeapons(){const root=new THREE.Group();function box(g,m,x,y,z,w,h,d){const b=new THREE.Mesh(unitBox,m);b.position.set(x,y,z);b.scale.set(w,h,d);g.add(b);}
 for(const name of ['rifle','pistol','knife']){const g=new THREE.Group();g.name=name;root.add(g);
 if(name==='rifle'){box(g,heldSteel,0,.035,.14,.065,.09,.36);box(g,heldBlack,0,.02,-.13,.07,.12,.2);box(g,heldBlack,0,.04,.43,.027,.027,.24);box(g,heldBlack,0,-.08,.12,.045,.17,.075);box(g,heldBlack,0,.105,.1,.05,.04,.07);for(let i=0;i<5;i++)box(g,heldBlack,0,.09,.22+i*.025,.07,.012,.012);}
 else if(name==='pistol'){box(g,heldSteel,0,.04,.06,.055,.065,.19);box(g,heldBlack,0,-.015,0,.045,.1,.055);}
 else{box(g,heldBlack,0,0,.015,.035,.035,.12);box(g,heldSteel,0,0,.085,.09,.015,.02);const blade=new THREE.Mesh(new THREE.ConeGeometry(.037,.22,3),heldEdge);blade.rotation.x=Math.PI/2;blade.position.z=.2;blade.scale.z=.2;g.add(blade);}}
 return root;
}

const teamMaterials=[0xffb52e,0x6ecbff].map(color=>new THREE.MeshBasicMaterial({color}));
const markerGeometry=new THREE.SphereGeometry(.065,8,6);
export function setOperatorTeam(root,team){if(!root.userData.teamMarker){const marker=new THREE.Mesh(markerGeometry,teamMaterials[team]);marker.position.y=2.02;root.add(marker);root.userData.teamMarker=marker;}root.userData.teamMarker.material=teamMaterials[team];}
export function disposeOperator(root){const skeletons=new Set();root.traverse(o=>{if(o.isSkinnedMesh)skeletons.add(o.skeleton);});skeletons.forEach(s=>s.dispose());}

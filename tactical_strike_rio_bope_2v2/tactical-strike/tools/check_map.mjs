import * as THREE from 'three';
import {Octree} from 'three/addons/math/Octree.js';
import {Capsule} from 'three/addons/math/Capsule.js';
import fs from 'node:fs';
for(const id of ['rio','chaves']){
 const d=JSON.parse(fs.readFileSync(new URL('../public/maps/'+id+'/map.json',import.meta.url))),root=new THREE.Group();
 for(const g of d.groups){if(!g.solid)continue;const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(g.positions,3));root.add(new THREE.Mesh(geometry));}
 const oct=new Octree().fromGraphNode(root);let min=Infinity,max=-Infinity;
 for(let i=0;i<d.spawns.length;i++){const p=new THREE.Vector3(...d.spawns[i].position),cap=new Capsule(p.clone().add(new THREE.Vector3(0,.35,0)),p.clone().add(new THREE.Vector3(0,1.3,0)),.35);
  for(let n=0;n<90;n++){cap.translate(new THREE.Vector3(0,-.05,0));for(let k=0;k<4;k++){const h=oct.capsuleIntersect(cap);if(!h)break;cap.translate(h.normal.multiplyScalar(h.depth+.00001));}}
  const fall=cap.start.y-.35-p.y;min=Math.min(min,fall);max=Math.max(max,fall);if(fall<-4||!Number.isFinite(fall))throw new Error(id+' spawn fell through floor: '+i);
 }
 console.log(id+': '+d.spawns.length+' spawns have floors; settled offset '+min.toFixed(2)+' to '+max.toFixed(2));
}

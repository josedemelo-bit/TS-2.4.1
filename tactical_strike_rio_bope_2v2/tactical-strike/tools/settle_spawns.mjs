import * as THREE from 'three';
import {Octree} from 'three/addons/math/Octree.js';
import {Capsule} from 'three/addons/math/Capsule.js';
import fs from 'node:fs';
const id=process.argv[2]||'rio';if(!['rio','chaves'].includes(id))throw Error('Unknown map');
const file=new URL('../public/maps/'+id+'/map.json',import.meta.url),d=JSON.parse(fs.readFileSync(file)),root=new THREE.Group();
for(const g of d.groups){if(!g.solid)continue;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(g.positions,3));root.add(new THREE.Mesh(geo));}
const oct=new Octree().fromGraphNode(root);
for(const s of d.spawns){const p=new THREE.Vector3(...s.position),c=new Capsule(p.clone().add(new THREE.Vector3(0,.35,0)),p.clone().add(new THREE.Vector3(0,1.3,0)),.35);
 for(let n=0;n<90;n++){c.translate(new THREE.Vector3(0,-.05,0));for(let k=0;k<4;k++){const hit=oct.capsuleIntersect(c);if(!hit)break;c.translate(hit.normal.multiplyScalar(hit.depth+.00001));}}
 if(c.start.y-.35<p.y-4)throw Error('Missing spawn floor');s.position=[c.start.x,c.start.y-.35,c.start.z].map(x=>Math.round(x*100000)/100000);
}
d.spawns=[0,1].flatMap(team=>{const pool=d.spawns.filter((s,i)=>(s.team??(i<16?0:1))===team);if(!pool.length)return [];const anchor=new THREE.Vector3(...pool[0].position);return pool.sort((a,b)=>new THREE.Vector3(...a.position).distanceToSquared(anchor)-new THREE.Vector3(...b.position).distanceToSquared(anchor));});
d.spawnsSettled=true;fs.writeFileSync(file,JSON.stringify(d));console.log(id+': grounded '+d.spawns.length+' spawns');

import * as THREE from 'three';
// Original game-ready view models, built from beveled parts and shared materials.
export function createWeapons(camera){
 const fill=new THREE.PointLight(0xd5e8ff,2.2,3,1.2);fill.position.set(-.25,.35,.2);camera.add(fill);
 const root=new THREE.Group();camera.add(root);root.position.set(.29,-.27,-.45);
 const steel=new THREE.MeshStandardMaterial({color:0x293641,metalness:.82,roughness:.3});
 const black=new THREE.MeshStandardMaterial({color:0x101820,metalness:.3,roughness:.65});
 const edge=new THREE.MeshStandardMaterial({color:0xb4c5ce,metalness:.9,roughness:.2});
 const accent=new THREE.MeshStandardMaterial({color:0xe9af56,metalness:.6,roughness:.35});
 const glove=new THREE.MeshStandardMaterial({color:0x26362f,roughness:.9});
 const sleeve=new THREE.MeshStandardMaterial({color:0x526273,roughness:.95});
 function box(g,m,x,y,z,w,h,d,angle=0){const shape=new THREE.Shape(),r=Math.min(w,h)*.12;
  shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:1,steps:1});geo.translate(0,0,-d/2);const mesh=new THREE.Mesh(geo,m);mesh.position.set(x,y,z);mesh.rotation.x=angle;g.add(mesh);return mesh;}
 function tube(g,m,x,y,z,r,len){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,12),m);mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,z);g.add(mesh);return mesh;}
 const rifle=new THREE.Group();root.add(rifle);
 box(rifle,steel,0,0,-.14,.105,.12,.38); // receiver
 box(rifle,black,0,-.025,.14,.1,.13,.19);box(rifle,black,0,-.045,.24,.12,.18,.035); // stock
 box(rifle,steel,0,.006,-.43,.098,.09,.24); // handguard
 for(let i=0;i<7;i++){box(rifle,black,.051,0,-.34-i*.029,.008,.027,.018);box(rifle,black,0,.063,-.32-i*.032,.11,.013,.014);}
 tube(rifle,steel,0,.012,-.64,.018,.2);tube(rifle,black,0,.012,-.755,.026,.06);
 box(rifle,black,0,-.13,-.16,.065,.2,.09,-.14);box(rifle,steel,0,-.23,-.175,.075,.035,.1,-.14); // magazine
 for(let i=0;i<3;i++)box(rifle,black,.035,-.1-i*.035,-.16,.006,.008,.065);
 box(rifle,black,0,-.12,.04,.065,.17,.065,-.27); // grip
 box(rifle,steel,.06,0,-.09,.01,.035,.095);box(rifle,accent,.068,.026,-.08,.009,.016,.029);
 box(rifle,black,0,.09,-.12,.072,.055,.085); // optic frame
 box(rifle,edge,-.031,.13,-.12,.012,.06,.055);box(rifle,edge,.031,.13,-.12,.012,.06,.055);box(rifle,edge,0,.16,-.12,.07,.012,.055);
 const dot=new THREE.Mesh(new THREE.SphereGeometry(.005,8,8),new THREE.MeshBasicMaterial({color:0xff5544}));dot.position.set(0,.13,-.15);rifle.add(dot);
 box(rifle,steel,0,-.085,-.01,.07,.016,.09); // trigger guard
 const pistol=new THREE.Group();root.add(pistol);
 box(pistol,steel,0,.015,-.08,.085,.085,.25);box(pistol,black,0,-.05,-.06,.075,.055,.18);tube(pistol,black,0,.02,-.215,.019,.03);
 box(pistol,black,0,-.12,.01,.072,.17,.08,-.2);box(pistol,accent,.045,.009,-.025,.007,.025,.055);
 for(let i=0;i<5;i++)box(pistol,black,.045,.025,.015-i*.014,.005,.04,.006);
 box(pistol,black,0,.065,-.18,.018,.025,.018);box(pistol,black,-.025,.065,.017,.012,.022,.025);box(pistol,black,.025,.065,.017,.012,.022,.025);
 const knife=new THREE.Group();root.add(knife);
 box(knife,black,0,-.015,.025,.055,.055,.18);for(let i=0;i<6;i++)box(knife,glove,0,-.015,-.04+i*.025,.06,.06,.008);
 box(knife,steel,0,-.015,-.082,.135,.025,.025);
 const verts=[0,.007,-.39,-.048,.007,-.105,.048,.007,-.105, 0,.007,-.39,0,.028,-.12,-.048,.007,-.105, 0,.007,-.39,.048,.007,-.105,0,.028,-.12, 0,.007,-.39,.048,.007,-.105,-.048,.007,-.105];
 const bladeGeo=new THREE.BufferGeometry();bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));bladeGeo.computeVertexNormals();const blade=new THREE.Mesh(bladeGeo,new THREE.MeshStandardMaterial({color:0xbacbd5,metalness:.95,roughness:.2,side:THREE.DoubleSide}));knife.add(blade);
 for(const model of [rifle,pistol,knife]){box(model,glove,.005,-.12,.08,.09,.095,.12);box(model,sleeve,.055,-.19,.23,.115,.12,.28,-.3);}
 box(rifle,glove,-.055,-.075,-.38,.095,.075,.13);box(rifle,sleeve,-.14,-.17,-.23,.12,.12,.3,-.55);
 const flash=new THREE.Mesh(new THREE.ConeGeometry(.055,.16,6),new THREE.MeshBasicMaterial({color:0xffd787}));flash.rotation.x=-Math.PI/2;root.add(flash);flash.visible=false;
 let current='rifle',recoil=0,slash=0,time=0,flashTime=0;
 return {root,set(w){current=w;rifle.visible=w==='rifle';pistol.visible=w==='pistol';knife.visible=w==='knife';},fire(){if(current==='knife')slash=1;else{recoil=1;flashTime=.045;}},update(dt,moving,reloading){time+=dt;recoil=Math.max(0,recoil-dt*10);slash=Math.max(0,slash-dt*3.5);flashTime-=dt;flash.visible=flashTime>0;flash.position.set(0,.012,current==='rifle'?-.82:-.26);
 root.position.set(.29+Math.sin(time*9)*.007*moving-Math.sin(slash*Math.PI)*.22,-.27+Math.cos(time*18)*.006*moving-(reloading?.12:0),-.45+recoil*.055);
 root.rotation.set(recoil*.07+(reloading?-.45:0),Math.sin(slash*Math.PI)*.7,-Math.sin(slash*Math.PI)*.8+(reloading?-.3:0));}};
}

const THREE = require('three');
const WEAPONS = {
 pistol: {size:12,reserve:48,damage:28,delay:280,range:100,cost:0,reload:1400},
 rifle: {size:30,reserve:90,damage:34,delay:110,range:140,cost:1600,reload:1900},
 knife: {size:0,reserve:0,damage:55,delay:650,range:2.2,cost:0,reload:0}
};
class Match {
 constructor(spawns,blocked=()=>false,now=()=>Date.now(),durations={}) {
  this.spawns=spawns;this.blocked=blocked;this.now=now;this.durations={buy:20000,live:90000,end:5000,...durations};
  this.players={};this.phase='waiting';this.round=0;this.scores=[0,0];this.deadline=0;this.message='Aguardando 4 jogadores';this.epoch=0;
 }
 add(id,name){if(this.players[id])return true;if(Object.keys(this.players).length>=4)return false;
  const count=t=>Object.values(this.players).filter(p=>p.team===t).length;
  this.players[id]={id,name:String(name||'Operador').slice(0,16),team:count(0)<=count(1)?0:1,ready:false,credits:800,kills:0,deaths:0};this.resetPlayer(this.players[id]);return true;
 }
 resetPlayer(p){const index=Object.values(this.players).filter(q=>q.team===p.team).indexOf(p);const teamSpawns=this.spawns.filter((s,i)=>(s.team??(i<16?0:1))===p.team);const s=teamSpawns[index%teamSpawns.length]||this.spawns[0];
  Object.assign(p,{x:s.position[0],y:s.position[1]+1.65,z:s.position[2],yaw:s.yaw,hp:100,armor:0,alive:true,weapon:'pistol',inventory:{pistol:{ammo:12,reserve:48}},lastShot:-Infinity,reloadAt:0,lastMove:this.now(),spawn:this.epoch});
 }
 ready(id){const p=this.players[id];if(!p||!['waiting','finished'].includes(this.phase))return;p.ready=!p.ready;
  if(Object.keys(this.players).length===4&&Object.values(this.players).every(p=>p.ready)){this.scores=[0,0];this.round=0;for(const p of Object.values(this.players)){p.credits=800;p.kills=p.deaths=0;}this.startRound();}}
 startRound(){this.round++;this.epoch++;this.phase='buy';this.deadline=this.now()+this.durations.buy;this.message='FASE DE COMPRA';for(const p of Object.values(this.players))this.resetPlayer(p);}
 remove(id){delete this.players[id];if(this.phase!=='waiting'){this.phase='waiting';this.deadline=0;this.message='Jogador saiu. Aguardando 4 para nova partida.';this.scores=[0,0];this.round=0;}for(const p of Object.values(this.players))p.ready=false;}
 buy(id,item){const p=this.players[id];if(!p||this.phase!=='buy')return false;
  if(item==='armor'&&p.armor===0&&p.credits>=400){p.credits-=400;p.armor=50;return true;}
  if(item==='rifle'&&!p.inventory.rifle&&p.credits>=1600){p.credits-=1600;p.inventory.rifle={ammo:30,reserve:90};p.weapon='rifle';return true;}return false;
 }
 equip(id,weapon){const p=this.players[id];if(!p||!p.alive||!WEAPONS[weapon]||!(weapon==='knife'||p.inventory[weapon]))return;p.weapon=weapon;p.reloadAt=0;}
 reload(id){const p=this.players[id];if(!p||!p.alive||!['buy','live'].includes(this.phase)||p.weapon==='knife'||p.reloadAt)return;
  const w=WEAPONS[p.weapon],inv=p.inventory[p.weapon];if(inv.ammo<w.size&&inv.reserve>0)p.reloadAt=this.now()+w.reload;
 }
 move(id,d){const p=this.players[id];if(!p||!p.alive||this.phase!=='live')return false;
  if(!d||!['x','y','z','yaw'].every(k=>Number.isFinite(d[k])))return false;
  const dt=Math.min(.3,Math.max(.05,(this.now()-p.lastMove)/1000));p.lastMove=this.now();
  if(Math.hypot(d.x-p.x,d.z-p.z)>dt*9+.3||Math.abs(d.y-p.y)>dt*23+.5)return false;
  if(Math.abs(d.x)>256||Math.abs(d.z)>256||d.y<-80||d.y>256)return false;
  Object.assign(p,{x:d.x,y:d.y,z:d.z,yaw:d.yaw});return true;
 }
 shoot(id,d){const p=this.players[id],now=this.now();if(!p||!p.alive||this.phase!=='live'||p.reloadAt)return null;
  const w=WEAPONS[p.weapon],inv=p.inventory[p.weapon];if(now-p.lastShot<w.delay||p.weapon!=='knife'&&inv.ammo<=0)return null;
  if(!d||!Array.isArray(d.direction)||d.direction.length!==3||!d.direction.every(Number.isFinite))return null;
  const dir=new THREE.Vector3(...d.direction);if(dir.lengthSq()<.9||dir.lengthSq()>1.1)return null;dir.normalize();p.lastShot=now;if(inv)inv.ammo--;
  const origin=new THREE.Vector3(p.x,p.y,p.z),ray=new THREE.Ray(origin,dir);let target=null,dist=w.range,point=null;
  for(const q of Object.values(this.players)){if(!q.alive||q.team===p.team)continue;
   const hit=ray.intersectBox(new THREE.Box3(new THREE.Vector3(q.x-.3,q.y-1.65,q.z-.3),new THREE.Vector3(q.x+.3,q.y+.2,q.z+.3)),new THREE.Vector3());
   if(hit&&origin.distanceTo(hit)<dist){target=q;point=hit;dist=origin.distanceTo(hit);}}
  if(!target||this.blocked(origin,point))return {hit:false};
  const head=p.weapon!=='knife'&&point.y>target.y-.22;let damage=w.damage*(head?3:1);const absorbed=Math.min(target.armor,Math.ceil(damage*.5));target.armor-=absorbed;damage-=absorbed;target.hp=Math.max(0,target.hp-damage);
  if(target.hp===0){target.alive=false;target.deaths++;p.kills++;p.credits=Math.min(5000,p.credits+200);this.message=p.name+' eliminou '+target.name;
   if(!Object.values(this.players).some(q=>q.team===target.team&&q.alive))this.end(p.team);}
  return {hit:true,killed:!target.alive,head};
 }
 end(winner){if(this.phase!=='live')return;this.phase='end';this.deadline=this.now()+this.durations.end;if(winner!==null)this.scores[winner]++;
  this.message=winner===null?'TEMPO ESGOTADO · EMPATE':(winner===0?'ALPHA':'BRAVO')+' VENCEU O ROUND';
  for(const p of Object.values(this.players))p.credits=Math.min(5000,p.credits+(p.team===winner?900:700));}
 tick(){const now=this.now();for(const p of Object.values(this.players)){if(p.reloadAt&&now>=p.reloadAt){const i=p.inventory[p.weapon],w=WEAPONS[p.weapon];if(i){const n=Math.min(w.size-i.ammo,i.reserve);i.ammo+=n;i.reserve-=n;}p.reloadAt=0;}}
  if(!this.deadline||now<this.deadline)return;
  if(this.phase==='buy'){this.phase='live';this.deadline=now+this.durations.live;this.message='ELIMINE A DUPLA ADVERSÁRIA';for(const p of Object.values(this.players))p.lastMove=now;}
  else if(this.phase==='live')this.end(null);
  else if(this.phase==='end'){if(Math.max(...this.scores)>=5){this.phase='finished';this.deadline=0;this.message=(this.scores[0]>this.scores[1]?'ALPHA':'BRAVO')+' VENCEU A PARTIDA';for(const p of Object.values(this.players))p.ready=false;}else this.startRound();}
 }
 snapshot(){return {players:this.players,phase:this.phase,round:this.round,scores:this.scores,remaining:Math.max(0,this.deadline-this.now()),message:this.message};}
}
module.exports={Match,WEAPONS};

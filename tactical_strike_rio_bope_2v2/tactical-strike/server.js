const express=require('express'),http=require('http'),path=require('path');
const {Server}=require('socket.io'),THREE=require('three');
const {Match}=require('./match');
const app=express(),server=http.createServer(app),io=new Server(server);
app.use('/vendor/three',express.static(path.join(__dirname,'node_modules/three')));
app.use(express.static(path.join(__dirname,'public')));
const maps=new Map();
function getMap(id){if(maps.has(id))return maps.get(id);const map=require('./public/maps/'+id+'/map.json');
 const walls=map.groups.filter(g=>g.solid).map(g=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(g.positions,3));geo.computeBoundingSphere();return new THREE.Mesh(geo,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));});
 const ray=new THREE.Raycaster();const blocked=(a,b)=>{ray.set(a,b.clone().sub(a).normalize());ray.far=a.distanceTo(b)-.03;return ray.intersectObjects(walls).length>0;};
 const entry={map,blocked};maps.set(id,entry);return entry;
}
const rooms=new Map();
io.on('connection',socket=>{
 let room=null,code=null;
 socket.on('join',data=>{if(room)return;code=String(data?.room||'AMIGOS').toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,16)||'AMIGOS';
  const mapId=data?.map==='chaves'?'chaves':'rio';
  if(!rooms.has(code)){const {map,blocked}=getMap(mapId);const match=new Match(map.spawns,blocked);match.mapId=mapId;rooms.set(code,match);}
  if(rooms.get(code).mapId!==mapId){socket.emit('rejected','Esta sala usa outro mapa. Escolha '+(rooms.get(code).mapId==='rio'?'Rio':'Vila do Chaves')+' ou outro código de sala.');return;}
  room=rooms.get(code);
  if(!room.add(socket.id,data?.name)){room=null;socket.emit('rejected','Sala cheia. Use outro código.');return;}
  socket.join(code);socket.emit('message','Sala '+code+' · Clique em PRONTO quando todos entrarem.');
 });
 socket.on('ready',()=>room?.ready(socket.id));socket.on('buy',item=>{if(!room?.buy(socket.id,item))socket.emit('message','Compra indisponível: confira créditos e fase.');});
 socket.on('equip',w=>room?.equip(socket.id,w));socket.on('reload',()=>room?.reload(socket.id));
 socket.on('move',d=>{if(room&&!room.move(socket.id,d)){const p=room.players[socket.id];if(p)socket.emit('correction',{x:p.x,y:p.y,z:p.z});}});
 socket.on('shoot',d=>{const result=room?.shoot(socket.id,d);if(result)socket.emit('shotResult',result);});
 socket.on('disconnect',()=>{if(!room)return;room.remove(socket.id);if(!Object.keys(room.players).length)rooms.delete(code);});
});
const ticker=setInterval(()=>{for(const [code,room]of rooms){room.tick();io.to(code).emit('match',{...room.snapshot(),map:room.mapId});}},50);
const PORT=process.env.PORT||3000;server.listen(PORT,'0.0.0.0',()=>console.log('Tactical Strike na porta '+PORT));
process.on('SIGTERM',()=>{clearInterval(ticker);io.close();server.close();});

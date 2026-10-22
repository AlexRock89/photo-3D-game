const {load,edited}=require('./simulation.cjs');
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c=load(edited),run=s=>vm.runInContext(s,c);
const sources=JSON.parse(fs.readFileSync(edited+'/audio/sources.json','utf8'));
c.fetch=async path=>({ok:true,arrayBuffer:async()=>{const b=fs.readFileSync(edited+'/'+path);assert(b.length>2000);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}});
const node=()=>({connect(){},gain:{value:1},threshold:{value:0},knee:{value:0},ratio:{value:0},pan:{value:0}});
c.audioStub={currentTime:0,destination:{},createGain:node,createDynamicsCompressor:node,createStereoPanner:node,decodeAudioData:async b=>({duration:1,data:b}),createBufferSource:()=>({connect(){},start(){},stop(){if(this.onended)this.onended();}})};
vm.runInContext(fs.readFileSync(edited+'/soundscape.js','utf8'),c);
run('actx=()=>audioStub');
(async()=>{
 await run('Soundscape.preload()');await run('Soundscape.warm(audioStub)');assert.equal(run('Soundscape.status.loaded'),18);
 assert.equal(sources.length,18);assert(sources.every(s=>s.license==='CC0-1.0'));
 assert.equal(run("Soundscape.names.hipster"),'hi');assert.equal(run("Soundscape.names.fashion"),'whistle');
 // No character chatter just because the player is standing beside someone.
 run("startGame();S.t=10;S.clients=[new Fashion()];S.pl.x=490;S.pl.y=178;S.fr={x:20,y:20,w:60,h:40};Soundscape.update();S.t+=1;Soundscape.update()");
 assert.equal(run('Soundscape.status.count'),0);
 // Every type is audible when framed, even if the player is far away.
 for(const type of ['Clown','Fashion','Hipster','Barista','Grandpa','Family','CoupleDog','Wedding','Busker','Jogger']){
  run(`Soundscape.reset();S.clients=[new ${type}()];S.t=20;S.pl.x=20;S.pl.y=20;S.fr={...S.clients[0].members()[0]};Soundscape.update();S.t+=.4;Soundscape.update();`);
  const id=run('S.clients[0].id');if(id==='hipster'||id==='fashion')assert.equal(run('Soundscape.status.last'),id==='hipster'?'hi':'whistle');assert.equal(run('Soundscape.status.event'),'aim:'+id);
  const count=run('Soundscape.status.count');run('S.t+=20;Soundscape.update()');assert.equal(run('Soundscape.status.count'),count,'no repeated chatter while staying aimed');
  run('Soundscape.photo(S.fr)');assert.equal(run('Soundscape.status.event'),'photo:'+id,'aim must not suppress photo');
  run('Soundscape.photo(S.fr)');assert.equal(run('Soundscape.status.count'),count+1,'photo cooldown');
 }
 // Tourists are pests rather than paying clients, but still react to the camera.
 run("Soundscape.reset();S.t=80;S.clients=[];S.pests=[new Tourist(700,450)];S.fr={x:685,y:412,w:40,h:45};Soundscape.update();S.t+=.4;Soundscape.update()");
 assert.equal(run('Soundscape.status.event'),'aim:tourist');
 run('Soundscape.photo(S.fr)');assert.equal(run('Soundscape.status.event'),'photo:tourist');
 run("Soundscape.reset();S.t=90;S.fr={x:20,y:20,w:40,h:45};Soundscape.selfie(S.pests[0])");assert.equal(run('Soundscape.status.count'),0,'off-camera selfies remain quiet');
 run("S.fr={x:685,y:412,w:40,h:45};Soundscape.selfie(S.pests[0])");assert.equal(run('Soundscape.status.event'),'selfie:tourist');
 // One short flash per selfie stop, with no rapid strobing.
 run("const touristTest=new Tourist(700,450);touristTest.tx=700;touristTest.ty=450;touristTest.upd(.01);let flashEdges=0,wasLit=false;for(let i=0;i<75;i++){touristTest.upd(.02);const lit=touristTest.flashT>0;if(lit&&!wasLit)flashEdges++;wasLit=lit;}");
 assert.equal(run('flashEdges'),1);
 // A brief sweep does not chatter; mute, help and portrait all silence reactions.
 run("Soundscape.reset();S.clients=[new Fashion()];S.fr={...S.clients[0].members()[0]};S.t=50;Soundscape.update();S.t+=.1;Soundscape.update();");assert.equal(run('Soundscape.status.count'),0);
 for(const flag of ['mute','help','portrait']){run(`S.${flag}=true;S.t+=1;Soundscape.update();Soundscape.photo(S.fr);Soundscape.sync()`);assert.equal(run('Soundscape.status.count'),0);run(`S.${flag}=false`);}
 // Each animal only reacts when reached by the flash, once per species per cooldown.
 const cases=[['coo',"S.pigeons=[{x:100,y:100}];"],['meow',"S.cat={x:100,y:100};"],['monkey',"S.monkey={x:100,y:100};"],['bark',"S.pests=[{kind:'dog',x:100,y:100}];"]];
 for(const [name,setup]of cases){
  run(`Soundscape.reset();S.t=60;S.clients=[];S.pigeons=[];S.pests=[];S.cat={x:900,y:600};S.monkey={x:900,y:600};${setup}Soundscape.scare(600,100,60);`);assert.equal(run('Soundscape.status.count'),0);
  run('Soundscape.scare(100,100,60)');assert.equal(run('Soundscape.status.event'),'flash:'+name);run('Soundscape.scare(100,100,60)');assert.equal(run('Soundscape.status.count'),1);
 }
 console.log('PASS: 18 local assets, all 10 aim/photo voices, distant subjects, dwell/repeat control, mute/pause, tourist aim/photo/selfie, single selfie flash, 4 flash species.');
})().catch(e=>{console.error(e);process.exitCode=1;});

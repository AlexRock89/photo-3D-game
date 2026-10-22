'use strict';
/* Foley and designed character cues, loaded once from this site's audio/ directory.
   Source credits and CC0 licenses: audio/CREDITS.txt and audio/sources.json. */
const Soundscape = (() => {
  const files = ['shutter','laugh','sip','whistle','cook','snore','children','kiss','fanfare','guitar','cheer','coo','bark','meow','monkey','duck','roar','tourist'];
  const names = {clown:'laugh',fashion:'whistle',hipster:'sip',barista:'cook',grandpa:'snore',family:'children',couple:'kiss',wedding:'fanfare',busker:'guitar',jogger:'cheer',tourist:'tourist'};
  const bytes = new Map(), decoded = new Map(), pending = new Map(), playing = new Set(), heard = new Map(), animalHeard = new Map();
  let preloadJob, warmContext, warmJob, context, bus, generation=0, aimId=null, aimSince=0, aimSpoken=false, lastEgg=-10, lastPhoto=-10, nextVoice=0;
  const status = {loaded:0,failed:[],last:'',event:'',count:0};
  function allowed(){return !S.mute&&!S.help&&!S.portrait&&S.mode==='play';}
  function preload(){
    if(!preloadJob)preloadJob=Promise.all(files.map(async name=>{
      try{const r=await fetch('audio/'+name+'.mp3');if(!r.ok)throw new Error(r.status);bytes.set(name,await r.arrayBuffer());}
      catch(e){status.failed.push(name);console.warn('Audio unavailable: '+name,e);}
    }));
    return preloadJob;
  }
  function output(a){
    if(context!==a){context=a;decoded.clear();pending.clear();bus=a.createGain();const limiter=a.createDynamicsCompressor();limiter.threshold.value=-9;limiter.knee.value=12;limiter.ratio.value=4;bus.connect(limiter);limiter.connect(a.destination);}
    return bus;
  }
  function prepare(a,name){
    output(a);
    if(decoded.has(name))return Promise.resolve(decoded.get(name));
    if(!pending.has(name))pending.set(name,preload().then(async()=>{
      if(!bytes.has(name))return null;
      try{const b=await a.decodeAudioData(bytes.get(name).slice(0));decoded.set(name,b);status.loaded=decoded.size;return b;}
      catch(e){if(!status.failed.includes(name))status.failed.push(name);console.warn('Audio decoding failed: '+name,e);return null;}
    }));
    return pending.get(name);
  }
  // Called by the existing user-gesture audio unlock; never creates an audio context by itself.
  function warm(a){if(!a)return Promise.resolve();if(warmContext!==a){warmContext=a;warmJob=Promise.all(files.map(name=>prepare(a,name)));}return warmJob;}
  function stopChannel(channel){
    for(const item of [...playing])if(!channel||item.channel===channel){try{item.source.stop();}catch(e){}playing.delete(item);}
  }
  function start(a,name,b,x,volume,options){
    if(!allowed()||!b)return false;
    const channel=options.channel||'effect';
    if(channel==='voice')stopChannel('voice');
    if(playing.size>=7)return false;
    try{
      const source=a.createBufferSource(),g=a.createGain(),item={source,channel};source.buffer=b;
      g.gain.value=volume*(channel==='voice'?1.05:.85);source.connect(g);
      if(a.createStereoPanner){const pan=a.createStereoPanner();pan.pan.value=clamp((x-(S.cam.x+VW/2))/(VW/2),-.7,.7);g.connect(pan);pan.connect(output(a));}else g.connect(output(a));
      playing.add(item);source.onended=()=>playing.delete(item);source.start(a.currentTime+(options.delay||0));
      status.last=name;status.event=options.event||channel;status.count++;return true;
    }catch(e){console.warn('Audio playback failed: '+name,e);return false;}
  }
  function play(name,x=S.pl.x,y=S.pl.y,volume=1,force=false,options={}){
    name=name==='parade'?'fanfare':name==='fashion'?'whistle':name;
    if(!files.includes(name)||!allowed())return false;
    const a=actx();if(!a)return false;
    // Camera feedback must remain audible even when the photographed subject is far from the player.
    const gain=force?volume:volume*Math.max(.45,1-dist(x,y,S.cam.x+VW/2,S.cam.y+VH/2)/650);
    const b=decoded.get(name);if(b)return start(a,name,b,x,gain,options);
    const ticket=generation,at=S.t;
    prepare(a,name).then(b=>{if(ticket===generation&&allowed()&&S.t-at<.65&&(!options.valid||options.valid()))start(a,name,b,x,gain,options);});
    return true;
  }
  function reset(){generation++;stopChannel();heard.clear();animalHeard.clear();aimId=null;aimSpoken=false;aimSince=0;lastEgg=lastPhoto=-10;lastSelfie=-10;nextVoice=0;status.last='';status.event='';status.count=0;}
  function subjects(f){
    if(!f)return [];
    const cx=f.x+f.w/2,cy=f.y+f.h/2;
    const tourists=S.pests.filter(p=>p.kind==='tourist').map((p,i)=>({id:'tourist',audioId:'tourist:'+i,x:p.x,y:p.y,members:()=>[{x:p.x-8,y:p.y-32,w:16,h:32}]}));
    return [...S.clients,...tourists].map(c=>{
      const visible=c.members().filter(b=>frac(b,f)>=.6);
      if(!visible.length||!names[c.id])return null;
      const distance=Math.min(...visible.map(b=>dist(cx,cy,b.x+b.w/2,b.y+b.h/2)));
      return {c,distance};
    }).filter(Boolean).sort((a,b)=>a.distance-b.distance).map(a=>a.c);
  }
  function update(){
    if(!allowed()||S.intro>0){aimId=null;return;}
    const c=subjects(S.fr)[0],id=c?(c.audioId||c.id):null;
    if(id!==aimId){aimId=id;aimSince=S.t;aimSpoken=false;}
    // Stable aim, one line per entry. No automatic repeating while the frame stays on a character.
    if(!c||aimSpoken||S.t-aimSince<.32||S.t<nextVoice||S.t<(heard.get(id)||0))return;
    if(play(names[c.id],c.x,c.y,.72,true,{channel:'voice',event:'aim:'+c.id,valid:()=>aimId===id})){aimSpoken=true;heard.set(id,S.t+7);nextVoice=S.t+1.2;}
  }
  function scare(x,y,r){
    const targets=[];const p=S.pigeons.find(p=>dist(p.x,p.y,x,y)<=r);if(p)targets.push(['coo',p]);
    if(S.cat&&dist(S.cat.x,S.cat.y,x,y)<=r)targets.push(['meow',S.cat]);
    if(S.monkey&&(S.monkeyOn>0||dist(S.monkey.x,S.monkey.y,x,y)<=r))targets.push(['monkey',S.monkey]);
    const dog=S.pests.find(p=>p.kind==='dog'&&dist(p.x,p.y,x,y)<=r);if(dog)targets.push(['bark',dog]);
    const couple=S.clients.find(c=>c.id==='couple'&&dist(c.dx,c.dy,x,y)<=r);if(couple&&!dog)targets.push(['bark',{x:couple.dx,y:couple.dy}]);
    targets.sort((a,b)=>dist(a[1].x,a[1].y,x,y)-dist(b[1].x,b[1].y,x,y)).slice(0,4).forEach(([name,p],i)=>{
      if(S.t<(animalHeard.get(name)||0))return;
      if(play(name,p.x,p.y,.65,true,{channel:'animal',event:'flash:'+name,delay:.09+i*.07}))animalHeard.set(name,S.t+1.2);
    });
  }
  function photo(f){
    const c=subjects(f)[0];
    // Photos have their own cooldown: aiming never suppresses the shutter reaction.
    if(c&&S.t-lastPhoto>=1.2){
      play(names[c.id],c.x,c.y,.88,true,{channel:'voice',event:'photo:'+c.id,delay:.13});
      lastPhoto=S.t;heard.set(c.audioId||c.id,S.t+7);aimId=c.audioId||c.id;aimSpoken=true;nextVoice=S.t+1.5;
    }
    if(S.t-lastEgg<3)return;
    if(frac({x:DINO.x-33,y:DINO.y-40,w:62,h:45},f)>.28){play('roar',DINO.x,DINO.y,.75,true,{event:'photo:dino',delay:.12});lastEgg=S.t;S.dinoRoarUntil=S.t+2;addText(DINO.x,DINO.y-44,'Р-р-р!','#fff0c2');}
    else if(inside(640,344,f)||frac({x:603,y:327,w:74,h:43},f)>.3){play('duck',640,356,.8,true,{event:'photo:duck',delay:.1});lastEgg=S.t;S.duckQuackUntil=S.t+1;}
  }
  let lastSelfie=-10;
  function selfie(p){
    // A tourist's own selfie clicks only when its raised phone is in the camera frame.
    if(!S.fr||!inside(p.x,p.y-24,S.fr)||S.t-lastSelfie<1.5)return;
    if(play('shutter',p.x,p.y,.4,true,{event:'selfie:tourist'}))lastSelfie=S.t;
  }
  function sync(){
    const on=allowed();if(bus)bus.gain.value=on?1:0;
    if(!on){if(playing.size)stopChannel();generation++;aimId=null;}
  }
  return {play,update,scare,photo,selfie,reset,sync,preload,warm,names,subjects,status};
})();

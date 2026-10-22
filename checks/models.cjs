const {load,edited}=require('./simulation.cjs');const fs=require('fs'),vm=require('vm'),assert=require('assert');const c=load(edited);
const oldCreate=c.document.createElement;c.document.createElement=()=>{const el=oldCreate();const get=el.getContext;el.getContext=type=>type==='webgl2'?null:get();return el;};
c.Path2D=class{};c.ParkCanvasRenderer=class{constructor(){this.shadowMap={};this.domElement={};}setSize(){}setPixelRatio(){}setClearColor(){}render(){}};
for(const f of ['vendor/three.js','soundscape.js','parade.js','visual-icons.js','evening.js'])vm.runInContext(fs.readFileSync(edited+'/'+f,'utf8'),c);
vm.runInContext('const THREE=window.THREE;',c);vm.runInContext(fs.readFileSync(edited+'/scene3d.js','utf8'),c);
const run=s=>vm.runInContext(s,c);
run('startGame();S.texts=[];Park3D.draw(0);');
assert(run("['dad','mom','boy','girl'].every(k=>Park3D.models.has('family:'+k))"));
run('const beforeMom=Park3D.models.get("family:mom");S.clients.find(c=>c.id==="family").parts.reverse();Park3D.draw(.016);');assert(run('beforeMom===Park3D.models.get("family:mom")'));
assert.equal(run('Park3D.models.get("oksana:0").knees.length'),2);assert.equal(run('Park3D.models.get("oksana:0").elbows.length'),2);
run('S.rmb=true;for(let i=0;i<90;i++){S.t=i/60;Park3D.draw(S.t);}');assert(run('Park3D.models.get("oksana:0").camera.position.y>30.5'));
run('Parade.state.direction=0;Parade.spawn();Parade.update(3);Park3D.draw(2);');assert(run('[...Park3D.models.values()].every(h=>Number.isFinite(h.group.position.x)&&Number.isFinite(h.group.rotation.y))'));
run('for(let i=0;i<180;i++)Parade.update(1/60);Park3D.draw(2.1);');assert(run('[...Park3D.models.values()].some(h=>h.kind==="horse"&&h.legs.length===4)'));
run('S.flash=1;Park3D.draw(2.2);');assert(run('Park3D.scene.children.some(o=>o.visible&&o.children.some(c=>c.isMesh&&c.renderOrder===100))'));
console.log('PASS: persistent family identity, articulated knees/elbows, raised focus camera, horse model, finite poses and flash star.');

// The final stage ramps smoothly, drives all lamps and gives the hero a separate left-hand torch.
const drawContext=c.document.getElementById('game').getContext('2d');drawContext.createRadialGradient=drawContext.createLinearGradient=()=>({addColorStop(){}});
run("startGame();S.t=144");assert.equal(run('eveningAmount()'),0);run('S.t=149');assert.equal(run('eveningAmount()'),.5);run('S.t=154');assert.equal(run('eveningAmount()'),1);
run("S.help=true;const pausedDusk=eveningAmount();update(1);S.help=false");assert.equal(run('eveningAmount()'),run('pausedDusk'));
run("S.t=160;S.rmb=false;S.pl.moving=true;S.pl.moveAngle=Math.PI/2;S.pests=[new Tourist(700,450),new Tourist(750,450)];S.pests[0].flashT=.1;S.pests[0].st='selfie';for(let i=0;i<90;i++)Park3D.draw(160+i/60)");
assert(run("Park3D.lighting.lamps.length===LAMPS.length&&Park3D.lighting.lamps.every(l=>l.intensity>0)"));
assert(run("Park3D.models.get('oksana:0').torch.visible&&Park3D.lighting.torch.intensity>0"));
assert(run("Park3D.models.get('oksana:0').torch.parent===Park3D.models.get('oksana:0').elbows[1]"));
assert(run('Park3D.lighting.torch.target.position.x>Park3D.lighting.torch.position.x+95'));
assert(run("Park3D.models.get('pest0:0').phone&&Park3D.models.get('pest0:0').phoneFlash.visible"));
assert(run("Park3D.models.get('pest1:0').phone&&!Park3D.models.get('pest1:0').phoneFlash.visible"));
run('startGame();Park3D.draw(0)');assert.equal(run('Park3D.lighting.amount'),0);assert.equal(run('Park3D.lighting.torch.intensity'),0);assert(run("!Park3D.models.get('oksana:0').torch.visible"));
console.log('PASS: dusk ramp/pause/reset, every lamp, held torch and directional beam, two independent selfie rigs and flashes.');

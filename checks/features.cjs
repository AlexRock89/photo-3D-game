const {load,edited}=require('./simulation.cjs');
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c=load(edited);for(const f of ['soundscape.js','parade.js'])vm.runInContext(fs.readFileSync(edited+'/'+f,'utf8'),c,{filename:f});
const run=s=>vm.runInContext(s,c);
// New event crosses all four routes without penetrating any footprint, including the horse.
for(let direction=0;direction<4;direction++){
 run(`startGame();Parade.state.direction=${direction};Parade.spawn();`);
 for(let i=0;i<1800;i++){
  run('Parade.update(1/60)');
  assert(run('Parade.state.actors.every(a=>!a.visible||navPointFree(a.x,a.y,a.pad))'),'parade collision direction '+direction);
 }
 assert.equal(run('Parade.state.phase'),'idle');
 assert.equal(run('Parade.state.actors.length'),0);
 assert(run('Parade.state.elapsed<29.9'),'route must finish naturally, not time out');
}
run('startGame();S.t=16;Parade.onShot(100);Parade.onShot(100);Parade.onShot(100);Parade.update(.01);');assert.equal(run('Parade.state.phase'),'warning');
run('Parade.update(3.1);');assert.equal(run('Parade.state.phase'),'crossing');
run('startGame();S.t=16;S.score=600;Parade.update(.01);');assert.equal(run('Parade.state.phase'),'warning');
run('startGame();S.t=16;S.score=600;Parade.state.count=2;Parade.update(.01);');assert.equal(run('Parade.state.phase'),'idle');
function shot(parade,safe){return run(`startGame();S.clients=[new Fashion()];S.clients[0].pose=2;S.pigeons=[];S.pests=[];S.cat.x=30;S.cat.y=80;S.monkey.x=30;S.monkey.y=80;S.focus=1;S.fr={x:460,y:142,w:60,h:40,cx:490,cy:162,sx:0,sy:0};S.safeT=${safe};Parade.state.phase='${parade?'crossing':'idle'}';Parade.state.actors=[{visible:true,kind:'dancer',x:490,y:178}];takeShot();S.score;`);}
assert.equal(shot(false,0),180);assert.equal(shot(true,0),130);assert.equal(shot(true,10),180);
// Both photo Easter eggs follow their current world positions.
run("startGame();S.mode='play';S.t=20;S.clients=[];Soundscape.photo({x:DINO.x-35,y:DINO.y-45,w:70,h:60})");assert(run('S.dinoRoarUntil>S.t'));
run("S.t+=4;Soundscape.photo({x:590,y:310,w:100,h:80})");assert(run('S.duckQuackUntil>S.t'));
console.log('PASS: four parade routes, obstacle clearance, triggers/cap, scoring/protection, relocated photo Easter eggs.');

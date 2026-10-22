'use strict';
/* A performance event, independent of ordinary clients and their scoring. */
const Parade = (() => {
  const state={phase:'idle',actors:[],count:0,good:0,scoreAt:0,cooldown:0,warning:0};
  const horizontal=[[40,360],[540,360],[570,299],[711,299],[746,360],[1240,360]];
  const vertical=[[640,48],[640,270],[565,302],[565,410],[640,446],[640,680]];
  function reset(){Object.assign(state,{phase:'idle',actors:[],count:0,good:0,scoreAt:0,cooldown:0,warning:0});}
  function onShot(points){state.good=points>=80?state.good+1:0;}
  function warn(){state.phase='warning';state.warning=3;state.direction=Math.floor(Math.random()*4);state.count++;state.good=0;state.scoreAt=S.score;S.toasts.unshift({t:3.4,l1:'МУЗЫКАЛЬНЫЙ КАРАВАН',l2:'Через 3 секунды на центральной аллее. В кадре: −30%.',col:'#af75ab'});Soundscape.play('parade',S.pl.x,S.pl.y,.55,true);}
  function spawn(){const route=(state.direction<2?horizontal:vertical).map(([x,y])=>({x,y}));if(state.direction%2)route.reverse();state.phase='crossing';state.elapsed=0;state.route=route;
    state.actors=['dancer','guitarist','child','horse','dancer','drummer','child'].map((kind,i)=>({kind,key:'parade'+i,x:route[0].x,y:route[0].y,step:1,delay:i*.58,ph:i,visible:false,done:false,dir:1,pad:kind==='horse'?9:4}));}
  function update(dt){if(state.phase==='idle'){state.cooldown=Math.max(0,state.cooldown-dt);if(state.count<2&&S.t>15&&S.time>26&&state.cooldown<=0&&(state.good>=3||S.score-state.scoreAt>=600))warn();return;}
    if(state.phase==='warning'){state.warning-=dt;if(state.warning<=0)spawn();return;}
    state.elapsed+=dt;
    for(const a of state.actors){a.delay-=dt;if(a.delay>0||a.done)continue;a.visible=true;a.ph+=dt*(a.kind==='child'?10:6);const target=state.route[a.step];navMove(a,target.x,target.y,a.kind==='horse'?68:70,dt,a.pad);if(dist(a.x,a.y,target.x,target.y)<3){a.step++;a._navRoute=null;if(a.step>=state.route.length){a.done=true;a.visible=false;}}}
    if(state.actors.every(a=>a.done)||state.elapsed>30){state.phase='idle';state.actors=[];state.cooldown=45;state.good=0;state.scoreAt=S.score;}
  }
  function inFrame(f){return state.phase==='crossing'&&state.actors.some(a=>a.visible&&frac({x:a.x-(a.kind==='horse'?12:7),y:a.y-(a.kind==='child'?20:34),w:a.kind==='horse'?24:14,h:a.kind==='child'?20:34},f)>=.2);}
  function draw(c){for(const a of state.actors){if(!a.visible)continue;const i=Number(a.key.slice(-1)),o={modelKey:a.key,ph:a.ph,moving:true,dir:a.dir,parade:a.kind,top:i%2?'#b85861':'#438a95',pants:'#444d67',hair:i%2?'#65492f':'#493c33',hs:a.kind==='dancer'?'long':'short'};
      if(a.kind==='horse'){horse(c,a.x,a.y,o);continue;}
      if(a.kind==='dancer'){o.dress=i%2?'#d89d46':'#b85878';o.l=1;o.r=1;}
      if(a.kind==='child')kidPerson(c,a.x,a.y,o);else person(c,a.x,a.y,o);
    }}
  return{state,reset,onShot,update,inFrame,draw,spawn};
})();

'use strict';
/* Browser sizing, rendering and lifecycle. */
function render(){ctx.setTransform(3,0,0,3,0,0);ctx.clearRect(0,0,VW,VH);if(S.mode==='title'){S.cam.x=255+Math.sin(S.tt*.06)*35;S.cam.y=250+Math.cos(S.tt*.06)*20;}Park3D.draw(S.mode==='play'?S.t:S.tt);Object.assign(canvas.dataset,{mode:S.mode,time:S.time.toFixed(2),x:S.pl.x.toFixed(1),y:S.pl.y.toFixed(1),focus:S.focus.toFixed(2),score:String(S.score),shots:S.st?String(S.st.shots):'0',captures:String(S.shots.filter(s=>s.img).length),help:String(S.help),page:String(S.helpPage),renderer:Park3D.renderer.software?'canvas3d':'webgl',renderMs:(Park3D.renderer.lastMs||0).toFixed(1),clients:String(S.clients.length)});if(S.mode==='play')drawWeather();capturePending();if(S.mode==='play'){if(S.fr)drawFrame();drawHUD();if(S.flash>0){ctx.globalAlpha=S.flash*.16;ctx.fillStyle='#fffbe8';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1;}}else if(S.mode==='title')drawTitle();else drawEnd();drawTouch();if(S.help)drawHelp();Soundscape.sync();canvas.dataset.evening=eveningAmount().toFixed(2);canvas.dataset.tourists=String(S.pests.filter(p=>p.kind==='tourist').length);canvas.dataset.audioReady=String(Soundscape.status.loaded);canvas.dataset.audioEvent=Soundscape.status.event;canvas.dataset.audioCount=String(Soundscape.status.count);canvas.dataset.parade=Parade.state.phase;canvas.dataset.paradeCount=String(Parade.state.count);canvas.dataset.weather=S.wx?S.wx.type:'clear';canvas.dataset.wind=S.wx?String(S.wx.dir):'0';canvas.style.cursor=S.mode!=='play'||S.help||S.intro>0?'default':'none';};
fit=function(){
 const wrap=document.getElementById('wrap'),header=document.querySelector('header'),hint=document.getElementById('hint'),style=getComputedStyle(document.body),viewport=window.visualViewport;
 const height=viewport?viewport.height:window.innerHeight,full=!!document.fullscreenElement;
 const padding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom),gap=parseFloat(getComputedStyle(wrap).gap)||0;
 const h=Math.max(90,height-padding-header.offsetHeight-hint.offsetHeight-gap*2-2),w=Math.max(160,wrap.clientWidth-2),scale=Math.min(w/VW,h/VH);
 const width=Math.floor(VW*scale),ch=Math.floor(VH*scale);canvas.style.width=width+'px';canvas.style.height=ch+'px';document.getElementById('stage').style.width=(width+2)+'px';header.style.maxWidth=(width+2)+'px';hint.style.maxWidth=(width+2)+'px';
};
window.addEventListener('resize',()=>requestAnimationFrame(fit));
document.addEventListener('fullscreenchange',fit);
if(window.visualViewport)window.visualViewport.addEventListener('resize',fit);
document.getElementById('help').onclick=()=>{S.help=!S.help;S.helpPage=0;};
document.getElementById('sound').onclick=()=>{actx();S.mute=!S.mute;};document.getElementById('music').onclick=()=>{actx();S.noMusic=!S.noMusic;};const exitFull=document.createElement('button');exitFull.id='exit-full';exitFull.textContent='⛶';exitFull.setAttribute('aria-label','Выйти из полного экрана');exitFull.title='Выйти из полного экрана · Esc';document.body.appendChild(exitFull);
function immersive(on){document.body.classList.toggle('immersive',on);fit();}
async function toggleFullscreen(){if(document.fullscreenElement){await document.exitFullscreen();return;}if(document.body.classList.contains('immersive')){immersive(false);return;}try{await document.documentElement.requestFullscreen();if(!document.fullscreenElement)immersive(true);}catch(e){immersive(true);}}
document.getElementById('full').onclick=toggleFullscreen;exitFull.onclick=toggleFullscreen;
window.addEventListener('keydown',e=>{if(e.code==='Escape'&&document.body.classList.contains('immersive'))immersive(false);});
window.addEventListener('keydown',e=>{if(['Space','Enter','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&document.activeElement.tagName==='BUTTON')document.activeElement.blur();});
setInterval(()=>{for(const[id,val,label]of[['sound',S.mute,'звук'],['music',S.noMusic,'музыку']]){const b=document.getElementById(id);b.setAttribute('aria-pressed',String(val));b.setAttribute('aria-label',(val?'Включить ':'Выключить ')+label);}},300);
Soundscape.preload();
Promise.all([document.fonts.load('700 28px Bitter'),document.fonts.load('400 9px "Nunito Sans"'),document.fonts.load('800 9px "Nunito Sans"')]).catch(()=>{}).then(()=>{document.getElementById('loading').hidden=true;fit();window.bootGame();});

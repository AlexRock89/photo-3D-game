'use strict';
let T, uiText, cameraIcon, drawTitle, drawHUD, drawBonusRadar, drawHelp;
/* Smooth, high-resolution interface. Coordinates stay in the original 640×360 space. */
const UI={cream:'#f5f0df',ink:'#334e3e',muted:'#7b8b72',green:'#597852',gold:'#c4a468',red:'#b36f60',line:'#d7dcc6'};
function round(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=.6;c.stroke();}}
function pill(text,x,y,w,fill=UI.cream,fg=UI.ink,h=21){round(ctx,x,y,w,h,h/2,fill);uiCentered(text,x+w/2,y+h/2,8,fg,'center','700');}
function strokeLine(x,y,x1,y1,col,width=1){ctx.strokeStyle=col;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x1,y1);ctx.stroke();}
function corners(x,y,w,h,col){const l=8;ctx.strokeStyle=col;ctx.lineWidth=S.focus>=.95?2.2:1.2;ctx.lineCap='round';for(const[px,py,sx,sy]of[[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){ctx.beginPath();ctx.moveTo(px+sx*l,py);ctx.lineTo(px,py);ctx.lineTo(px,py+sy*l);ctx.stroke();}}
function drawFrame(){const f=S.fr,sharp=S.focus>=.95,col=sharp?'#154d37':'#fffdf3';
  if(S.focus>.05){ctx.fillStyle=`rgba(33,50,37,${.31*S.focus})`;ctx.fillRect(0,0,VW,f.sy);ctx.fillRect(0,f.sy+f.h,VW,VH-f.sy-f.h);ctx.fillRect(0,f.sy,f.sx,f.h);ctx.fillRect(f.sx+f.w,f.sy,VW-f.sx-f.w,f.h);}
  ctx.save();ctx.shadowColor=sharp?'#fffde8':'#203b36';ctx.shadowBlur=sharp?5:3;corners(f.sx,f.sy,f.w,f.h,col);ctx.restore();
  ctx.globalAlpha=.35;for(const k of [1/3,2/3]){strokeLine(f.sx+f.w*k,f.sy,f.sx+f.w*k,f.sy+f.h,col,.45);strokeLine(f.sx,f.sy+f.h*k,f.sx+f.w,f.sy+f.h*k,col,.45);}ctx.globalAlpha=1;
  strokeLine(f.sx+f.w/2-2,f.sy+f.h/2,f.sx+f.w/2+2,f.sy+f.h/2,col,.6);strokeLine(f.sx+f.w/2,f.sy+f.h/2-2,f.sx+f.w/2,f.sy+f.h/2+2,col,.6);
  round(ctx,f.sx,f.sy+f.h+5,f.w,2,1,'#365342');round(ctx,f.sx,f.sy+f.h+5,Math.max(.1,f.w*S.focus),2,1,sharp?'#154d37':'#efe3bc');
  if(S.rmb||S.focus>.05){const label=sharp?'ФОКУС ГОТОВ':'ФОКУС '+Math.round(S.focus*100)+'%';pill(label,f.sx+f.w/2-37,Math.max(48,f.sy-16),74,sharp?'#154d37':UI.cream,sharp?'#fff7e5':UI.ink,13);}
  if(S.monkeyOn>0){const x=f.sx+f.w/2,y=f.sy+f.h/2;ctx.fillStyle='#8c7355';ctx.beginPath();ctx.ellipse(x,y,24,23,0,0,7);ctx.fill();for(const dx of [-23,23]){ctx.beginPath();ctx.arc(x+dx,y-10,9,0,7);ctx.fill();}ctx.fillStyle='#d9c29a';ctx.beginPath();ctx.ellipse(x,y+4,17,16,0,0,7);ctx.fill();for(const dx of [-7,7]){ctx.fillStyle=UI.ink;ctx.beginPath();ctx.ellipse(x+dx,y-3,2.2,3.5,0,0,7);ctx.fill();}uiText('У-У! А-А!',x,y+29,9,UI.cream,'center','700');}
}
const BONUS_GLYPH={coffee:'☕',lens:'◎',flash:'ϟ',clock:'◷',x2:'×2'};
function drawWeather(){const w=S.wx;if(!w||w.type==='clear')return;ctx.save();const f=w.fade;if(w.type==='rain'){ctx.fillStyle=`rgba(75,102,118,${.1*f})`;ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=.4*f;for(const p of WXP)strokeLine(p.x,p.y,p.x-2,p.y+6,'#e5efdf',.6);}else if(w.type==='snow'){ctx.globalAlpha=.8*f;ctx.fillStyle='#f6f8ea';for(const p of WXP){ctx.beginPath();ctx.arc(p.x,p.y,p.v>1?1.4:.8,0,7);ctx.fill();}}else{ctx.globalAlpha=.3*f;for(const p of WXP)strokeLine(p.x,p.y,p.x-Math.cos(w.dir)*16,p.y-Math.sin(w.dir)*16,'#f4f2dc',.65);}ctx.restore();}
function capturePending(){const e=S.pending;if(!e)return;S.pending=null;try{const cv=document.createElement('canvas');cv.width=e.w*3;cv.height=e.h*3;const c=cv.getContext('2d');if(e.focus<.5&&'filter'in c)c.filter='blur(2px)';c.drawImage(canvas,e.sx*3,e.sy*3,e.w*3,e.h*3,0,0,cv.width,cv.height);e.img=cv;}catch(err){console.warn('Capture unavailable',err);}}
function drawEnd(){ctx.fillStyle='rgba(55,75,47,.66)';ctx.fillRect(0,0,VW,VH);round(ctx,76,12,488,336,8,UI.cream);uiText('СЪЁМКА ОКОНЧЕНА',320,25,7,UI.muted,'center','700');uiText('Ещё один день в кадре',320,42,26,UI.ink,'center','400','Georgia,serif');uiText(S.score+' очков',320,73,14,UI.ink,'center','700');uiText(S.rank+(S.newBest?' · НОВЫЙ РЕКОРД!':''),320,93,7.1,UI.muted,'center','700');
  if(!S.top.length){cameraIcon(306,158,28,UI.muted);uiText('Портфолио пока пустое. Голуби победили.',320,203,9,UI.ink,'center');}
  S.top.forEach((s,i)=>{const x=112+(i%3)*141,y=111+Math.floor(i/3)*89;round(ctx,x,y,132,82,4,'#fffdf5',UI.line);const scale=Math.min(123/s.img.width,54/s.img.height),w=s.img.width*scale,h=s.img.height*scale;ctx.drawImage(s.img,x+66-w/2,y+4+(54-h)/2,w,h);uiText(s.who,x+8,y+62,6.7,UI.ink,'left','700');uiText('+'+s.score,x+124,y+62,7.5,UI.green,'right','700');});
  round(ctx,215,297,210,27,13.5,UI.ink);uiCentered(S.endT>1.2?'Ещё одна съёмка  →':'Сохраняем воспоминания…',320,310.5,9,UI.cream,'center','700');uiText('Рекорд: '+S.best+'     ·     Достижения: '+achCount()+'/'+ACH.length,320,333,7,UI.muted,'center');
}
function drawTouch(){if(!S.touch||S.help)return;const b=helpBtnRect();if(S.mode==='play'){if(S.intro>0){ctx.fillStyle='rgba(49,68,43,.7)';ctx.fillRect(0,0,VW,VH);round(ctx,80,65,480,222,9,UI.cream);uiText('Два пальца — и ты фотограф',320,87,22,UI.ink,'center','400','Georgia,serif');uiText('ЛЕВЫЙ ПАЛЕЦ',185,140,8,UI.green,'center','700');uiText('Тяни джойстик — Оксана бежит',185,163,8,UI.ink,'center');uiText('ПРАВЫЙ ПАЛЕЦ',455,140,8,UI.green,'center','700');uiText('Веди рамку · Держи для фокуса',455,163,8,UI.ink,'center');uiText('Отпусти — снимок',455,177,8,UI.ink,'center');pill('КОСНИСЬ, ЧТОБЫ НАЧАТЬ',223,234,194,UI.ink,UI.cream,26);}else{const j=S.joy;ctx.globalAlpha=.8;ctx.fillStyle='rgba(245,240,223,.3)';ctx.strokeStyle='rgba(245,240,223,.9)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(TZ.jx,TZ.jy,TZ.jr,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=UI.cream;ctx.beginPath();ctx.arc(TZ.jx+(j.kx||0),TZ.jy+(j.ky||0),j.on?14:12,0,7);ctx.fill();ctx.globalAlpha=1;if(!S.st||S.st.shots<1)pill('ДЕРЖИ — ФОКУС · ОТПУСТИ — СНИМОК',325,326,284,'rgba(245,240,223,.85)',UI.ink,22);}}
  round(ctx,b.x,b.y,b.w,b.h,9,UI.cream);uiCentered('?',b.x+b.w/2,b.y+b.h/2,16,UI.ink,'center','700');}

Object.assign(UI,{cream:'#fff7e5',ink:'#315747',muted:'#7b8874',green:'#547b50',gold:'#d6a24b',red:'#c67260',line:'#dfdfc8'});
// Text uses measured visible glyph bounds, independent of the font's ascender padding.
function uiFont(size,weight,family){
 if(family.includes('Georgia')&&!family.includes('Bitter')){family='"Bitter",Georgia,serif';weight='600';}
 ctx.font=`${weight} ${size}px ${family}`;ctx.textBaseline='alphabetic';
}
function uiCentered(text,x,cy,size=9,col=UI.ink,align='left',weight='400',family='"Nunito Sans",Arial,sans-serif'){
 uiFont(size,weight,family);const m=ctx.measureText(text);
 const ascent=m.actualBoundingBoxAscent??size*.75,descent=m.actualBoundingBoxDescent??size*.2;
 ctx.fillStyle=col;ctx.textAlign=align;ctx.fillText(text,x,cy+(ascent-descent)/2);
}
uiText=function(text,x,y,size=9,col=UI.ink,align='left',weight='400',family='"Nunito Sans",Arial,sans-serif'){
 uiCentered(text,x,y+size/2,size,col,align,weight,family);
};
function iconLabel(text,icon,x,cy,{size=8,iconSize=14,gap=7,col=UI.ink,weight='800',center=false}={}){
 uiFont(size,weight,'"Nunito Sans",Arial,sans-serif');
 const width=iconSize+gap+ctx.measureText(text).width,left=center?x-width/2:x;
 gameIcon(ctx,icon,left,cy-iconSize/2,iconSize,col);
 uiCentered(text,left+iconSize+gap,cy,size,col,'left',weight);
}

T=function(str,x,y,col,size=8,align='left'){if(S.touch)str=touchText(str);ctx.font=`800 ${size>=16?size:size*1.05}px "Nunito Sans",Arial,sans-serif`;ctx.textAlign=align;ctx.textBaseline='top';ctx.lineJoin='round';ctx.lineWidth=2;ctx.strokeStyle='rgba(39,62,43,.5)';ctx.strokeText(str,x,y);ctx.fillStyle=col||UI.cream;ctx.fillText(str,x,y);};
cameraIcon=function(x,y,size=16,col=UI.ink){gameIcon(ctx,'camera',x,y,size,col);};
drawTitle=function(){
 ctx.fillStyle='rgba(45,65,38,.04)';ctx.fillRect(0,0,VW,VH);round(ctx,22,20,263,321,10,UI.cream);round(ctx,42,37,224,23,11.5,'#e4ecd4');uiCentered('ТРИ МИНУТЫ. ТЫСЯЧА ИСТОРИЙ',154,48.5,6.9,UI.green,'center','800');
 uiText('обычный день',43,80,25,UI.ink,'left','700','"Bitter",Georgia,serif');uiText('ФОТОГРАФА',42,113,28,'#bc704e','left','700','"Bitter",Georgia,serif');
 strokeLine(45,159,261,159,'#e4c49a',.7);uiText('ГЛАВНАЯ РОЛЬ — ОКСАНА КЛИМЕНКО',45,173,7,'#8a638e','left','800');
 uiText('Гуляй по парку. Лови удачный момент.',45,194,9,UI.ink,'left','600');uiText('И не дай голубям испортить кадр.',45,208,9,'#7d8b71');
 round(ctx,44,239,219,34,17,'#c77a52');iconLabel('НАЧАТЬ СЪЁМКУ','camera',153.5,256,{size:9.4,iconSize:18,gap:9,col:UI.cream,center:true});
 uiText(S.touch?'Коснись экрана, чтобы начать':'Клик или Enter — начать · Пробел — правила',153,282,7.1,UI.muted,'center','600');strokeLine(45,300,261,300,UI.line,.6);
 gameIcon(ctx,'star',44,309,13,'#d3a14b');uiCentered(String(S.best),64,315.5,11,UI.ink,'left','800');uiCentered('лучший счёт',95,315.5,6.8,UI.muted);uiCentered('Достижения '+achCount()+'/'+ACH.length,262,315.5,7.2,'#8c69a5','right','700');
 for(const[n,x]of[['coffee',470],['clock',509],['flash',548]])bonusBubble(ctx,n,x,292,14);pill('ОДИН ПАРК. ЦЕЛАЯ ЖИЗНЬ.',435,322,177,'rgba(255,247,229,.95)',UI.ink,21);
};
function noticeCard(x,y,w,h,heading,description,kind,tone){const style={gold:['#fff0be','#ac7720','#e9bd53'],purple:['#f1e5ff','#7751a5','#b493d8'],blue:['#e8f5ff','#407d9d','#89bdd8'],coral:['#ffe4d6','#a75340','#de997c'],green:['#e9f3d9','#537c43','#aac383']}[tone]||['#fff7e5',UI.ink,'#d8dabb'];ctx.save();ctx.shadowColor='rgba(42,65,43,.16)';ctx.shadowBlur=8;ctx.shadowOffsetY=2;round(ctx,x,y,w,h,8,style[0],style[2]);ctx.shadowBlur=0;ctx.shadowOffsetY=0;round(ctx,x+7,y+(h-25)/2,25,25,8,style[2]);gameIcon(ctx,kind,x+12,y+(h-15)/2,15,'#fff9e9');uiCentered(heading,x+40,y+h/2-(description?7:0),8.1,style[1],'left','800');if(description)uiCentered(description,x+40,y+h/2+7,6.9,style[1],'left','600');ctx.restore();}
drawToast=function(){if(!S.toasts.length)return;const t=S.toasts[0],s=t.l1;let tone='blue',kind='person',title=s,y=79,x=145,w=350,h=t.l2?40:29;
 if(/ДОСТИЖЕНИЕ/.test(s)){tone='purple';kind='star';title=s.replace('ДОСТИЖЕНИЕ: ','');x=179;w=282;y=91;}
 else if(/ЭТАП/.test(s)){tone='green';kind='flag';y=70;h=43;}
 else if(/ДОЖДЬ|СНЕГ|ВЕТЕР|ПОГОДА|ЯСНО|СЪЁМКА НАЧАЛАСЬ/.test(s)){tone='blue';kind=/ДОЖДЬ/.test(s)?'rain':/СНЕГ/.test(s)?'snow':/ВЕТЕР/.test(s)?'wind':'sun';x=172;w=296;y=73;}
 else if(/КАРАВАН/.test(s)){tone='purple';kind='music';y=76;x=140;w=360;}
 else if(/ТУРИСТ|СОБАК|СТАЯ|ГОЛУБ/.test(s)){tone='coral';kind='warning';y=80;}
 ctx.globalAlpha=Math.min(1,t.t*4,(3.4-t.t)*5);if(kind==='flag'){round(ctx,x,y,w,43,5,'#597a4f');round(ctx,x,y,5,43,2,'#e7c476');gameIcon(ctx,'flag',x+14,y+11,21,'#f5d58b');uiText(title,x+46,y+8,8.3,'#fff7e5','left','800');if(t.l2)uiText(t.l2,x+46,y+23,6.4,'#e7efce','left','600');}else if(kind==='star'){round(ctx,x,y,w,45,12,'#f3e4fc','#b08ac8');ctx.fillStyle='#d5af59';ctx.beginPath();ctx.arc(x+20,y+13,17,0,7);ctx.fill();gameIcon(ctx,'star',x+9,y+2,22,'#fff5d1');uiText('ДОСТИЖЕНИЕ ОТКРЫТО',x+45,y+5,5.5,'#a57b38','left','800');uiText(title,x+45,y+14,8.4,'#77509b','left','800');if(t.l2)uiText(t.l2,x+45,y+29,6.4,'#8e739d','left','600');}else noticeCard(x,y,w,h,title,t.l2,kind,tone);ctx.globalAlpha=1;
};
drawBonusRadar=function(){for(const b of S.bonuses){const sx=b.x-S.cam.x,sy=b.y-S.cam.y-22;if(sx>16&&sx<VW-16&&sy>48&&sy<VH-34)continue;if(b.life<3&&Math.floor(b.life*6)%2)continue;const dx=sx-320,dy=sy-180,k=Math.min(294/Math.max(1,Math.abs(dx)),117/Math.max(1,Math.abs(dy)),1),x=320+dx*k,y=Math.max(S.alert&&320+dx*k>440?112:63,180+dy*k);bonusBubble(ctx,b.type,x,y,12);const a=Math.atan2(dy,dx);ctx.fillStyle=BONUS_STYLE[b.type].ink;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*19,y+Math.sin(a)*19);ctx.lineTo(x+Math.cos(a+.4)*13,y+Math.sin(a+.4)*13);ctx.lineTo(x+Math.cos(a-.4)*13,y+Math.sin(a-.4)*13);ctx.fill();}};
drawHUD=function(){
 round(ctx,12,10,616,32,8,'rgba(255,249,233,.97)');round(ctx,12,10,88,32,8,S.time<15?'#ffe0c9':'#e4edcf');cameraIcon(24,18,16,UI.green);uiText('СЪЁМКА',49,15,6.2,UI.muted,'left','800');uiText(fmtTime(S.time),49,24,12,S.time<15?'#ac4d3e':UI.ink,'left','800');
 const wx=S.wx?S.wx.type:'clear';gameIcon(ctx,wx==='clear'?'sun':wx,111,19,14,wx==='clear'?'#c19434':'#5f9bb6');uiText('ПОГОДА',132,15,5.9,UI.muted,'left','800');uiText(S.wx?WX_NAME[wx]:'ЯСНО',132,26,7.3,'#558b8d','left','800');
 uiText(String(S.score),320,14,18,'#b47643','center','800');uiText('ОЧКИ',320,33,5.5,UI.muted,'center','800');uiText(S.combo>1?'СЕРИЯ ×'+(1+.25*(S.combo-1)):'РЕКОРД',515,16,6.2,'#906ba8','right','800');uiText(S.combo>1?'Лови следующий момент':String(S.best),515,26,8,UI.ink,'right','700');strokeLine(530,17,530,35,UI.line,.6);uiText('ЭТАП '+(S.stage+1)+'/5',544,16,6.1,UI.muted,'left','800');round(ctx,544,29,70,3,1.5,'#e4e8ce');round(ctx,544,29,Math.max(1,70*Math.min(1,(S.t%STAGE_LEN)/STAGE_LEN)),3,1.5,'#9bb572');
 if(wx==='wind')windCompass(198,26,S.wx.dir);
 if(eveningAmount()>.15){gameIcon(ctx,'moon',235,20,12,'#797ba0');uiCentered('ВЕЧЕР',253,26,6.4,'#797ba0','left','800');}
 const active=[['coffee',S.speedT],['lens',S.lensT],['flash',S.safeT],['x2',S.x2],['clock',S.clockT]].filter(a=>a[1]>0);active.forEach(([n,val],i)=>{const y=54+i*25,s=BONUS_STYLE[n];round(ctx,14,y,145,21,10.5,s.fill,s.rim);bonusBubble(ctx,n,25,y+10,9);uiCentered(s.label,42,y+10.5,7.8,s.ink,'left','800');uiCentered(Math.ceil(val)+' с',151,y+10.5,7,s.ink,'right','800');});
 if(S.alert){const n=S.alert.type,s=BONUS_STYLE[n];round(ctx,455,53,172,40,9,s.fill,s.rim);bonusBubble(ctx,n,473,72,12);uiText('В ПАРКЕ: '+s.label.toUpperCase(),493,61,7,s.ink,'left','800');uiText(S.alert.on?'Он рядом, подбери!':'Стрелка подскажет, где искать',493,74,6.4,s.ink);}
 if(S.banner){const lines=S.banner.lines,n=lines.length,h=14+n*11,x=S.touch?113:75,w=S.touch?514:490,positive=!lines.some(l=>/ПУСТО|СОВЕТ|ПОРТИТ|ВЛЕЗ|ПРОБЕЖАЛ|МАРТЫШКА/.test(l.s)),fill=positive?'#e6f2d4':'#ffead8',ink=positive?'#537a45':'#a56342',y=VH-h-9;round(ctx,x,y,w,h,8,fill);gameIcon(ctx,positive?'camera':'frame',x+10,y+h/2-9,18,ink);lines.forEach((l,i)=>uiText(l.s,x+w/2+9,y+7+i*11,i===0?8.4:6.8,ink,'center',i===0?'800':'600'));}
 else if(S.hint>0&&!S.touch){pill('Веди рамку на клиента · Держи ПКМ для фокуса · ЛКМ — снимок',158,328,324,'rgba(255,247,229,.95)',UI.ink,19);}
 drawBonusRadar();drawToast();
};
const RULE_TABS=['Кадр и очки','Помехи','Погода','Управление','Достижения'];
function helpHeader(){ctx.fillStyle='rgba(42,65,44,.7)';ctx.fillRect(0,0,VW,VH);round(ctx,32,14,576,332,11,UI.cream);iconLabel(S.mode==='play'?'ПАУЗА · СЪЁМКА ПОДОЖДЁТ':'ПРАВИЛА ИГРЫ','camera',54,37,{size:6.7,iconSize:16,gap:9,col:'#aa794b'});uiCentered('×',581,37,19,'#8b725f','center','600');uiText(HELP_TITLES[S.helpPage],54,51,15.5,UI.ink,'left','700','"Bitter",Georgia,serif');const fills=['#e1ebce','#ffe1d0','#dceef7','#ebe1f6','#f5e5b7'];RULE_TABS.forEach((s,i)=>{const x=54+i*107;round(ctx,x,79,101,20,10,i===S.helpPage?['#63804d','#c67e59','#689db0','#9477ac','#ba9347'][i]:fills[i]);uiCentered(s,x+50.5,89,7,i===S.helpPage?UI.cream:['#5b7750','#ac6947','#5b879d','#8a6a9b','#a08442'][i],'center','800');});}
function ruleBlock(title,lines,x,y,col=UI.green,iconName=null){if(iconName)iconLabel(title,iconName,x,y+5.5,{size:7.5,iconSize:12,gap:6,col});else uiCentered(title,x,y+5.5,7.5,col,'left','800');lines.forEach((s,j)=>uiText(s,x,y+16+j*11,7.6,UI.ink,'left','600'));}
drawHelp=function(){helpHeader();const pg=S.helpPage;
 if(pg===0){ruleBlock('ЛОВИ МОМЕНТ',['В рамке должно быть хотя бы 60% фигуры.','Прыжок, поцелуй, соло и удачная поза','приносят больше очков.'],55,112,'#b27b46','camera');ruleBlock('НАВОДИ ФОКУС',['Держи ПКМ до зелёной рамки: до ×2,5 к очкам.','Клиент в центре — больше очков. Семью, пару','и свадьбу старайся снимать целиком.'],55,174,'#65909c','frame');uiText('Кадр от 80 очков продолжает серию до ×2.',55,237,7,'#8e6ca5','left','800');uiText('Повтор одного клиента 7 секунд даёт лишь 20% очков.',55,248,6.6,UI.muted);
 round(ctx,412,110,172,145,9,'#e8eed7');iconLabel('ОЦЕНКА КАДРА','star',423,126,{size:7,iconSize:14,gap:8,col:UI.green});[['Шедевр','300+'],['Отлично','180+'],['Норм','80+'],['Мазня','10–70'],['Пусто','0']].forEach(([s,n],i)=>{uiText(s,425,147+i*20,8,UI.ink,'left','700');uiText(n,571,147+i*20,8,i<2?'#bf8b3d':UI.green,'right','800');});
 const people=[['clown','Клоун'],['fashion','Модница'],['hipster','Хипстер'],['family','Семья'],['barista','Бариста'],['grandpa','Дедушка'],['busker','Музыкант'],['couple','Пара'],['jogger','Бегун'],['wedding','Свадьба']];people.forEach(([k,s],i)=>{const x=57+i*52.5;portraitIcon(ctx,k,x,266,25);uiText(s,x+12.5,294,5.8,UI.muted,'center','700');});
 }else if(pg===1){const rows=[['pigeon','ГОЛУБЬ','−22% за каждого в кадре. Летит к рамке и пугается вспышки.'],['cat','КОТ','−25% к кадру. Гуляет возле клиентов и убегает от вспышки.'],['monkey','МАРТЫШКА','Крадёт бонусы. На объективе оставляет только 20% очков.'],['tourist','ТУРИСТ · С 44 СЕКУНД','−25% к кадру. Селфи-палка в кадре; вспышкой не напугать.'],['dog','СОБАКА · С 80 СЕКУНД','−25% к кадру. Носится по парку и пугается вспышки.'],['busker','МУЗЫКАЛЬНЫЙ КАРАВАН','−30% за шествие в кадре. После 3 удачных кадров или 600 очков.']];rows.forEach(([k,title,desc],i)=>{const y=109+i*31;round(ctx,54,y,531,29,8,i%2?'#fff1d9':'#efe9dc');portraitIcon(ctx,k,60,y+2,25);uiText(title,99,y+5,7.8,['#668b9f','#b9874d','#97704d','#8c73a7','#8d9560','#9a63a2'][i],'left','800');uiText(desc,99,y+18,7.1,UI.ink,'left','600');});}
 else if(pg===2){const rows=[['sun','ЯСНО','#fff0bd','#b38b2e',['Погода без помех.','Лови лучшие моменты!']],['wind','ВЕТЕР','#e6efd9','#79915c',['По ветру бег быстрее до 30%.','Против ветра — медленнее.']],['rain','ДОЖДЬ','#e2f0f8','#5f94b0',['Фокус в 1,7 раза дольше.','Начинай фокусироваться заранее.']],['snow','СНЕГ','#eee8f9','#9c83bb',['Бег медленнее на 25%.','Планируй маршрут по парку.']]];rows.forEach(([ic,title,fill,ink,lines],i)=>{const x=54+(i%2)*271,y=111+Math.floor(i/2)*82;round(ctx,x,y,260,73,9,fill);gameIcon(ctx,ic,x+15,y+17,28,ink);uiText(title,x+56,y+12,10,ink,'left','800');lines.forEach((s,j)=>uiText(s,x+56,y+32+j*13,7.8,UI.ink,'left','600'));});iconLabel('Случайная погода в начале съёмки. Потом меняется каждые 35–50 секунд.','clock',57,287.5,{size:7.2,iconSize:13,gap:7,col:UI.muted,weight:'400'});uiText('Этап 5/5 — сумерки: фонари загораются, у Оксаны появляется фонарик.',57,299,7,UI.muted);}
 else if(pg===3){round(ctx,54,109,240,193,9,'#e6edda');iconLabel('ТВОЯ КАМЕРА',S.touch?'phone':'keyboard',65,128.5,{size:8.5,iconSize:19,gap:9,col:UI.green});const controls=S.touch?[['ЛЕВЫЙ ПАЛЕЦ','Тяни джойстик — гулять'],['ПРАВЫЙ ПАЛЕЦ','Веди рамку за пальцем'],['ДЕРЖИ / ОТПУСТИ','Фокус / снимок'],['КНОПКА ?','Пауза и правила']]:[['WASD / СТРЕЛКИ','Гулять по парку'],['МЫШЬ / ЛКМ','Рамка / снимок'],['УДЕРЖИВАТЬ ПКМ','Навести фокус'],['ПРОБЕЛ','Пауза и правила'],['M / N','Звук / музыка']];controls.forEach(([a,b],i)=>{const y=153+i*26;uiText(a,67,y,7.5,UI.green,'left','800');uiText(b,67,y+11,7.5,UI.ink,'left','600');});
 const rows=[['coffee','Бег быстрее · 9 секунд'],['lens','Быстрый фокус · 12 секунд'],['flash','Защита от помех · 10 секунд'],['clock','+8 секунд к съёмке'],['x2','Очки вдвое · 10 секунд']];rows.forEach(([k,s],i)=>{const y=111+i*35,style=BONUS_STYLE[k];round(ctx,308,y,277,31,10,style.fill);bonusBubble(ctx,k,326,y+15,12);uiText(style.label,348,y+4,8.2,style.ink,'left','800');uiText(s,348,y+17,7.2,UI.ink,'left','600');});uiText('Бонус живёт 14 секунд. Стрелка покажет путь.',310,288,6.7,UI.muted);uiText('Голоса — при наведении камеры и снимке.',310,298,6.7,'#8a6a9b');}
 else{ACH.forEach((a,i)=>{const x=55+(i<5?0:278),y=112+(i%5)*36,got=!!S.ach[a.id];round(ctx,x-2,y-2,258,31,7,got?'#f5e4ad':i%2?'#e9e3f0':'#e8ecd9');gameIcon(ctx,got?'star':'check',x+5,y+4,17,got?'#ba8a35':'#a4ac91');uiText(a.name,x+31,y+2,7,got?'#a47731':UI.green,'left','800');uiText(a.desc,x+31,y+15,6.3,UI.muted);});}
 strokeLine(54,310,586,310,UI.line,.6);iconLabel(S.touch?'Коснись вкладки или листай касанием':'Вкладки / ← → — листать · Пробел — '+(S.mode==='play'?'продолжить':'закрыть'),'arrow',55,326,{size:7.1,iconSize:12,gap:9,col:UI.muted,weight:'700'});uiCentered((pg+1)+' / 5',585,326,8,UI.ink,'right','800');
};
function handleHelpPointer(x,y){if(x>564&&y<55){S.help=false;return;}if(y>=76&&y<=102&&x>=54&&x<589){S.helpPage=Math.min(4,Math.floor((x-54)/107));return;}if(y>310){S.helpPage=(S.helpPage+1)%5;} }


function windCompass(x,y,a){
 ctx.save();ctx.translate(x,y);ctx.fillStyle='#e3eee5';ctx.beginPath();ctx.arc(0,0,11,0,Math.PI*2);ctx.fill();ctx.rotate(a);
 ctx.fillStyle='#285f56';ctx.beginPath();ctx.moveTo(8.5,0);ctx.lineTo(-1,-5);ctx.lineTo(-1,-2);ctx.lineTo(-8,-2);ctx.lineTo(-8,2);ctx.lineTo(-1,2);ctx.lineTo(-1,5);ctx.closePath();ctx.fill();
 const travel=((S.t*1.6)%1)*10-8;ctx.globalAlpha=.65;ctx.fillStyle='#fffbe8';ctx.beginPath();ctx.arc(travel,0,1.1,0,7);ctx.fill();ctx.restore();
}

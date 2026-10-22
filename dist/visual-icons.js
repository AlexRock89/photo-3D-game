'use strict';
// One small vector icon set shared by menus, rules, notifications and world bubbles.
const CAMERA_MARK='M8 3H16L18 7H20A3 3 0 0 1 23 10V19A3 3 0 0 1 20 22H4A3 3 0 0 1 1 19V10A3 3 0 0 1 4 7H6ZM12 10A4.5 4.5 0 1 0 12 19A4.5 4.5 0 1 0 12 10Z';
const BONUS_STYLE={coffee:{ink:'#98502c',rim:'#e5a24e',fill:'#fff0cf',label:'Кофе'},lens:{ink:'#287aab',rim:'#71bce6',fill:'#e0f4ff',label:'Объектив'},flash:{ink:'#a36a06',rim:'#edc444',fill:'#fff3b5',label:'Вспышка'},clock:{ink:'#27857e',rim:'#64c8b4',fill:'#ddf8ef',label:'Время'},x2:{ink:'#8553b8',rim:'#b799e4',fill:'#f0e5ff',label:'Очки ×2'}};
function gameIcon(c,name,x,y,size=24,col='#355644'){
 c.save();c.translate(x,y);c.scale(size/24,size/24);c.fillStyle=col;c.strokeStyle=col;c.lineWidth=2.8;c.lineCap='round';c.lineJoin='round';const circle=(x,y,r,fill=true)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);fill?c.fill():c.stroke();};const path=(d,fill=false)=>{const p=new Path2D(d);fill?c.fill(p):c.stroke(p);};
 switch(name){
 case 'camera':c.fill(new Path2D(CAMERA_MARK),'evenodd');break;
 case 'coffee':path('M3 7H16V14C16 21 3 21 3 14Z',true);path('M16 9H19C24 9 23 16 16 16M3 22H19M7 2V4M12 1V4');break;
 case 'clock':circle(12,13,9);c.strokeStyle='#fff9df';path('M12 7V13L17 16');c.strokeStyle=col;path('M9 1H15M12 1V4M20 4L22 6');break;
 case 'flash':path('M14 1L4 14H11L9 23L21 9H14Z',true);break;
 case 'lens':circle(12,12,10);c.strokeStyle='#e1f6ff';c.lineWidth=2;circle(12,12,6,false);c.fillStyle='#e1f6ff';circle(10,9,2);break;
 case 'x2':path('M3 7L9 17M9 7L3 17');c.font='900 18px "Nunito Sans",sans-serif';c.textBaseline='middle';c.fillText('2',12,13);break;
 case 'star':path('M12 1L15 8L23 9L17 14L19 22L12 18L5 22L7 14L1 9L9 8Z',true);break;
 case 'heart':path('M12 21L3 12C-3 5 7-1 12 6C17-1 27 5 21 12Z',true);break;
 case 'moon':path('M18 2C11-1 2 4 2 12C2 21 13 26 20 19C11 21 6 10 12 4C14 2 16 2 18 2Z',true);break;
 case 'sun':circle(12,12,4,true);for(let i=0;i<8;i++){const a=i*Math.PI/4;path(`M${12+Math.cos(a)*7} ${12+Math.sin(a)*7}L${12+Math.cos(a)*10} ${12+Math.sin(a)*10}`);}break;
 case 'wind':path('M2 8H16C22 8 22 1 17 2M2 13H20M5 18H14C20 18 18 24 14 22');break;
 case 'rain':case 'snow':path('M5 13C-1 12 1 5 7 6C9-1 20 1 20 8C26 9 24 14 19 14H5Z',true);if(name==='rain')path('M6 18L4 22M12 18L10 22M18 18L16 22');else for(const x of[6,13,20]){path(`M${x} 18V23M${x-2} 20H${x+2}`);}break;
 case 'warning':path('M12 2L23 22H1Z',true);c.strokeStyle='#fff5dd';path('M12 8V14');c.fillStyle='#fff5dd';circle(12,18,1.2);break;
 case 'check':path('M4 12L9 18L21 5');break;
 case 'frame':path('M2 9V3H9M15 3H22V9M22 15V22H15M9 22H2V15M9 12H15M12 9V15');break;
 case 'keyboard':c.strokeRect(1,5,22,15);for(let y=9;y<=13;y+=4)for(let x=5;x<=20;x+=4)c.fillRect(x,y,1.5,1.5);c.fillRect(6,17,12,1.5);break;
 case 'phone':path('M7 1H17A2 2 0 0 1 19 3V21A2 2 0 0 1 17 23H7A2 2 0 0 1 5 21V3A2 2 0 0 1 7 1Z');path('M10 4H14M11 20H13');break;
 case 'music':path('M9 17V4L21 2V15M9 8L21 6');circle(6,18,3);circle(18,16,3);break;
 case 'flag':path('M5 22V2M5 3H21L17 8L21 13H5');break;
 case 'arrow':path('M3 12H21M14 5L21 12L14 19');break;
 default:circle(12,7,4);path('M3 23V20C3 10 21 10 21 20V23Z',true);
 }c.restore();
}
function bonusBubble(c,type,x,y,r=15){const s=BONUS_STYLE[type];c.save();c.fillStyle='rgba(43,62,64,.14)';c.beginPath();c.ellipse(x+1,y+r+3,r*.55,2.2,0,0,7);c.fill();c.shadowColor=s.rim+'66';c.shadowBlur=r*.3;c.fillStyle=s.fill;c.strokeStyle=s.rim;c.lineWidth=1.8;c.beginPath();c.arc(x,y,r,0,7);c.fill();c.stroke();c.shadowBlur=0;c.strokeStyle='#fffdf5';c.lineWidth=1.7;c.beginPath();c.arc(x,y,r-3,Math.PI*1.13,Math.PI*1.55);c.stroke();gameIcon(c,type,x-r*.65,y-r*.65,r*1.3,s.ink);c.restore();}
function portraitIcon(c,kind,x,y,size=30){c.save();c.translate(x,y);c.scale(size/40,size/40);const colors={pigeon:'#d5e8f0',cat:'#ffe0b1',monkey:'#ecd8b4',dog:'#e9e4c2',tourist:'#e1e3ff',clown:'#ffe6cc',fashion:'#efdef8',family:'#e2edcb',hipster:'#efd8ce',barista:'#d6efdf',grandpa:'#e9e0ce',wedding:'#f8e3e4',couple:'#f5dbe9',jogger:'#d5eceb',busker:'#e5ddfa',hero:'#e4e6d9'};c.fillStyle=colors[kind]||'#e2ecd5';c.beginPath();c.arc(20,20,20,0,7);c.fill();c.save();c.beginPath();c.arc(20,20,19,0,7);c.clip();
 const ellipse=(x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();};
 if(kind==='pigeon'){ellipse(18,28,12,7,'#95a5ac');ellipse(14,27,7,5,'#718994');ellipse(25,18,6,7,'#6d918c');c.fillStyle='#d49b48';c.fill(new Path2D('M30 17L37 20L30 22Z'));ellipse(27,17,1.2,1.2,'#263d46');c.strokeStyle='#bd8975';c.lineWidth=1.5;c.beginPath();c.moveTo(15,34);c.lineTo(14,38);c.moveTo(22,34);c.lineTo(22,38);c.stroke();}
 else if(['cat','dog','monkey'].includes(kind)){const cat=kind==='cat',monkey=kind==='monkey',base=cat?'#ce975d':monkey?'#9f7957':'#af9164';ellipse(20,35,12,10,base);ellipse(20,22,12,11,base);if(cat){c.fillStyle=base;c.fill(new Path2D('M9 17L9 5L18 13ZM22 13L31 5L31 18Z'));}else{for(const xx of[8,32])ellipse(xx,monkey?19:15,monkey?6:5,monkey?6:9,base);}ellipse(20,26,monkey?9:7,6,'#f1dbb5');for(const xx of[15,25])ellipse(xx,20,1.4,1.8,'#2e4035');ellipse(20,25,1.8,1.3,cat?'#a56565':'#493b32');}
 else{const top={hero:'#303d38',clown:'#e1b64a',fashion:'#af87cb',hipster:'#b97661',family:'#6f9fca',barista:'#83b794',grandpa:'#ae926a',wedding:'#f7f2df',couple:'#d29cae',jogger:'#68b1a7',busker:'#a088c1',tourist:'#d69b61'}[kind]||'#7eaa88';ellipse(20,39,16,13,top);ellipse(20,20,10,12,'#e9bd99');let hair={hero:'#44372f',clown:'#ce8060',fashion:'#9f7091',family:'#806044',barista:'#493f36',grandpa:'#d6d2bd',wedding:'#b99362',couple:'#805439',jogger:'#423d35',busker:'#4c3d35',tourist:'#87613c'}[kind]||'#75533a';ellipse(20,12,10,6,hair);if(kind==='hero'){ellipse(25,9,8,7,hair);ellipse(15,10,7,5,hair);c.fillStyle='#d9e0d3';c.fillRect(9,21,1,8);}if(kind==='fashion'||kind==='busker')for(const xx of[10,30])ellipse(xx,22,3,10,hair);if(kind==='barista'){ellipse(20,7,12,5,'#f7f3df');}if(kind==='hipster'){ellipse(20,9,11,5,'#ceac57');ellipse(20,28,8,4,hair);}if(kind==='tourist'){ellipse(20,8,12,5,'#b59bd5');c.fillStyle='#a085c5';c.fillRect(20,8,15,3);}for(const xx of[16,24])ellipse(xx,20,1.1,1.8,'#354136');if(kind==='clown')ellipse(20,24,3,2.8,'#c96759');else{c.strokeStyle='#9f6b59';c.lineWidth=1;c.beginPath();c.arc(20,25,3,0,Math.PI);c.stroke();}if(kind==='wedding'){c.fillStyle='#fff9ec';c.fillRect(8,12,3,20);c.fillRect(29,12,3,20);}if(kind==='grandpa'){c.fillStyle='#787e6e';c.fillRect(7,8,26,3);c.fillRect(12,3,16,7);}}
 c.restore();c.strokeStyle='rgba(255,255,245,.85)';c.lineWidth=1;c.beginPath();c.arc(20,20,19,0,7);c.stroke();c.restore();}

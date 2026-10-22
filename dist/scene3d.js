'use strict';
/* The simulation remains in game.js. This adapter only replaces its visual layer.
   Orthographic projection maps ground coordinates 1:1 to the original aim/scoring space. */
function horse(c,x,y,o) {}
const Park3D = (() => {
  const T3 = THREE, G = Math.SQRT2;
  let renderer;
  try { const probe=document.createElement('canvas'); if(!probe.getContext('webgl2'))throw new Error('WebGL unavailable'); renderer = new T3.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'}); }
  catch(e) { renderer=new ParkCanvasRenderer(); }
  renderer.setSize(1920,1080); renderer.setPixelRatio(1);
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=T3.PCFSoftShadowMap;
  renderer.outputColorSpace=T3.SRGBColorSpace;
  renderer.setClearColor('#91aa7b');
  const scene=new T3.Scene();
  const camera=new T3.OrthographicCamera(-320,320,180,-180,1,4000);
  const duskSky=new T3.Color('#c4d4f5'),duskSun=new T3.Color('#d7e4ff');
  const ambient=new T3.HemisphereLight('#fff7e7','#7f9270',2.55);scene.add(ambient);
  const sun=new T3.DirectionalLight('#fff1d5',2.6);sun.position.set(-250,850,180);sun.castShadow=true;
  Object.assign(sun.shadow.camera,{left:-870,right:870,top:850,bottom:-850,near:1,far:2200});
  sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-0.00035;sun.shadow.normalBias=.65;sun.shadow.radius=3;
  sun.target.position.set(640,0,500);scene.add(sun,sun.target);
  const mats=new Map(), geos=new Map();
  const palette={'#ff4d6d':'#cf7c6c','#4aa3ff':'#7aa9c5','#8aff7a':'#a3b875','#c77dff':'#a18abe','#ffd23f':'#d7b968','#ff7ac6':'#be8e9d','#ff7a59':'#c98d73','#ff4d6d':'#c97169','#7a3ff2':'#8887a3','#ff5d73':'#c97c66','#ff2d4d':'#ba6558','#ff9ad0':'#c9a4ad','#ff3d7f':'#bc7c77','#2f6bff':'#6b8ca3','#ff6b6b':'#c9887c','#19b5a5':'#76a59b','#e9a23b':'#bca074','#ffb000':'#c8a45f','#ff9f1c':'#ce9c64'};
  function color(c){return palette[c]||c||'#d8d1b8';}
  function mat(c,extra){const key=c+JSON.stringify(extra||{});if(!mats.has(key))mats.set(key,new T3.MeshStandardMaterial({color:color(c),roughness:1,metalness:0,flatShading:true,...extra}));return mats.get(key);}
  function geo(key,fn){if(!geos.has(key))geos.set(key,fn());return geos.get(key);}
  function mesh(parent,geometry,c,x=0,y=0,z=0,sx=1,sy=1,sz=1){const m=new T3.Mesh(geometry,mat(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(p,x,y,z,w,h,d,c){return mesh(p,geo('box',()=>new T3.BoxGeometry(1,1,1)),c,x,y,z,w,h,d);}
  function ball(p,x,y,z,rx,ry,rz,c,detail=1){return mesh(p,geo('ico'+detail,()=>new T3.IcosahedronGeometry(1,detail)),c,x,y,z,rx,ry,rz);}
  function cyl(p,x,y,z,rt,rb,h,c,n=12){return mesh(p,geo(`c${rt},${rb},${h},${n}`,()=>new T3.CylinderGeometry(rt,rb,h,n)),c,x,y,z);}
  function rod(p,a,b,r,c,n=8){const mid=new T3.Vector3().addVectors(a,b).multiplyScalar(.5),v=new T3.Vector3().subVectors(b,a);const m=cyl(p,mid.x,mid.y,mid.z,r,r,v.length(),c,n);m.quaternion.setFromUnitVectors(new T3.Vector3(0,1,0),v.normalize());return m;}
  const v=(x,y,z)=>new T3.Vector3(x,y,z);
  function group(p,x=0,y=0,z=0){const g=new T3.Group();g.position.set(x,y,z);p.add(g);return g;}
  function place(x,y,h=0){return group(scene,x,h,y*G);}
  function ring(p,x,y,z,r,t,c,sx=1,sz=1){const m=mesh(p,geo(`ring${r},${t}`,()=>new T3.TorusGeometry(r,t,6,40)),c,x,y,z,sx,sz,1);m.rotation.x=-Math.PI/2;return m;}
  function plane(x,y,w,h,c,height=.12){const m=box(scene,x+w/2,height/2,(y+h/2)*G,w,height,h*G,c);m.castShadow=false;return m;}
  function sign(p,text,x,y,z,w,h,bg='#f7f2df',fg='#365345'){
    const cv=document.createElement('canvas');cv.width=512;cv.height=160;const c=cv.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,512,160);c.fillStyle=fg;c.font='bold 66px Trebuchet MS,Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,83,470);
    const tex=new T3.CanvasTexture(cv);tex.colorSpace=T3.SRGBColorSpace;
    const m=new T3.Mesh(new T3.PlaneGeometry(w,h),new T3.MeshBasicMaterial({map:tex,side:T3.DoubleSide}));m.position.set(x,y,z);p.add(m);return m;
  }
  function flower(p,x,z,c){cyl(p,x,2.4,z,.32,.32,4.8,'#637b4c',5);ball(p,x,5,z,2.1,1.5,2.1,c,0);ball(p,x,5.9,z,.75,.55,.75,'#dfc080',0);}
  // A quiet, tidy park. Paths and solid objects keep all original positions.
  plane(-500,-500,2300,1800,'#80aa71',.03);
  plane(0,0,1280,720,'#93b57d',.06);
  plane(62,336,1156,48,'#e3d5b1');plane(616,62,48,596,'#e3d5b1');plane(62,612,1156,40,'#e3d5b1');plane(840,130,170,60,'#e3d5b1');
  const plaza=place(640,360);cyl(plaza,0,.2,0,134,134,.5,'#e3d5b1',64).scale.z=1.035;
  const track='#ba8d73';plane(30,30,1220,32,track);plane(30,658,1220,32,track);plane(30,30,32,660,track);plane(1218,30,32,660,track);
  for(const y of [35,57,663,685])plane(35,y,1210,.8,'#e0c6a6',.21);
  for(const x of [35,57,1223,1245])plane(x,35,.8,650,'#e0c6a6',.21);
  for(let x=42;x<1240;x+=22){plane(x,45,9,.7,'#ead8bb',.24);plane(x,673,9,.7,'#ead8bb',.24);}
  for(let y=50;y<670;y+=22){plane(45,y,.7,8,'#ead8bb',.24);plane(1233,y,.7,8,'#ead8bb',.24);}
  // White painted fence, hedges and a few clipped borders.
  for(let x=5;x<1280;x+=15){const p=place(x,13);box(p,0,12,0,3,24,3,'#f2eedb');cyl(p,0,25.5,0,0,2,3,'#f2eedb',4);}
  box(scene,640,9,13*G,1280,2.4,2,'#f2eedb');box(scene,640,19,13*G,1280,2.4,2,'#f2eedb');
  for(let y=60;y<720;y+=24){ball(scene,5,9,y*G,9,12,17,'#68875d');ball(scene,1274,9,y*G,9,12,17,'#68875d');}
  for(let x=20;x<1280;x+=24)ball(scene,x,8,712*G,17,10,9,'#68875d');
  let seed=11;function rn(){return (seed=seed*16807%2147483647)/2147483647;}
  function bed(x,y,w,h){plane(x-2,y-2,w+4,h+4,'#a99579',2);plane(x,y,w,h,'#6b8050',2.3);const p=place(x,y,1.5);for(let i=0;i<w*h/140;i++)flower(p,4+rn()*(w-8),(4+rn()*(h-8))*G,['#e8dfc6','#c5877b','#d8bd78','#aaa4b9'][Math.floor(rn()*4)]);}
  FLOWER_BEDS.forEach(b=>bed(...b));
  for(const [x,y]of [[420,440],[860,470]]){const p=place(x,y,.3);cyl(p,0,0,0,12,12,.1,'#9db7af',20).scale.z=.5;}
  plane(1036,566,52,64,'#b98c7e');
  const trees=[];
  for(const [x,y,k]of TREES){const p=place(x,y),c=['#69975d','#718f60','#99aa61','#538d7d'][k];cyl(p,0,13,0,2.4,3.3,26,'#8e7757',7);rod(p,v(0,14,0),v(8,29,0),1.6,'#8e7757');const crown=group(p);ball(crown,0,36,0,16,19,15,c,1);ball(crown,-8,32,2,10,12,10,c,1);ball(crown,8,37,0,10,12,11,c,1);trees.push(p);}
  // Fountain with a proper stone basin, animated water and a little duck.
  const fountain=place(640,356),waterM=mat('#93b8b4');
  cyl(fountain,0,3,0,49,49,6,'#b9b9a1',48).scale.z=.94;
  cyl(fountain,0,6.2,0,43,43,.4,'#a0c5bd',48).scale.z=.94;
  ring(fountain,0,7,0,46,3.2,'#e2dfc9',1,.94);
  cyl(fountain,0,12,0,4,6,13,'#d7d6bd',12);cyl(fountain,0,20,0,12,10,3,'#d7d6bd',24);cyl(fountain,0,21.6,0,9,9,.4,'#a0c5bd',24);
  const jets=[];for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const points=[];for(let j=0;j<=16;j++){const k=j/16;points.push(v(Math.cos(a)*17*k,22+18*Math.sin(Math.PI*k)-13*k,Math.sin(a)*17*k));}const curve=new T3.CatmullRomCurve3(points);const m=mesh(fountain,new T3.TubeGeometry(curve,16,.65,4,false),'#d1e6da');m.castShadow=false;jets.push(m);}
  const duck=group(fountain,26,9,0);ball(duck,0,0,0,5,2.8,3.2,'#e0c273');ball(duck,3,3,0,2.4,2.6,2,'#e0c273');box(duck,5,2.5,0,2.5,1,1.6,'#c98f50');ball(duck,3.8,3.8,1.7,.45,.45,.45,'#283b31',0);
  // Coffee van.
  const van=place(920,115);box(van,0,21,0,110,36,33,'#c7b477');box(van,0,36,0,108,8,35,'#e3d7b6');box(van,1,18,17,74,24,1,'#53746b');box(van,0,11,20,84,3,9,'#b5906a');
  for(const x of [-38,38])for(const z of [-15,15]){const wheel=cyl(van,x,6,z,6,6,4,'#3c4940',12);wheel.rotation.x=Math.PI/2;const hub=cyl(van,x,6,z+Math.sign(z)*2.1,2.5,2.5,.4,'#b7c0ac',10);hub.rotation.x=Math.PI/2;}
  box(van,-46,24,17.3,15,18,1,'#abc6be');box(van,49,21,17.3,5,4,1,'#f7e5ac');
  for(let i=0;i<12;i++){const roof=box(van,-44+i*8,37,22,8,2,18,i%2?'#ede9d4':'#a76f60');roof.rotation.x=-.15;box(van,-44+i*8,34,30,8,4,1.5,i%2?'#ede9d4':'#a76f60');}
  box(van,0,49,0,50,13,2,'#f5edd4');sign(van,'КОФЕ',0,49,1.1,43,11);cyl(van,-21,41,0,.7,.7,10,'#6f7e68');cyl(van,21,41,0,.7,.7,10,'#6f7e68');
  const tram=place(230,206);cyl(tram,0,2,0,22,22,3,'#596f74',32).scale.z=.85;cyl(tram,0,4,0,18,18,1,'#3e5251',32).scale.z=.85;ring(tram,0,4,0,21,1.8,'#9eac9a',1,.85);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;box(tram,Math.cos(a)*20,4,Math.sin(a)*17,1.5,1,1.5,'#d5c693');}
  // Friendly dinosaur sculpture.
  const dino=place(DINO.x,DINO.y);ball(dino,0,18,0,20,18,12,'#7c9e7a');ball(dino,17,33,0,11,10,8,'#7c9e7a');ball(dino,-23,10,0,15,6,5,'#7c9e7a');ball(dino,1,12,8,13,10,5,'#c1caa0');for(const x of [-11,9])ball(dino,x,4,6,6,5,7,'#779374');ball(dino,21,36,6,2,2,1,'#f5edda');ball(dino,21.6,36,6.7,.8,1,.5,'#293f34',0);for(let i=0;i<5;i++)cyl(dino,-13+i*7,36,0,0,3.5,7,'#c2a26b',3);
  const bench=place(1120,298);for(const x of [-14,14]){box(bench,x,5,1,2,10,14,'#536653');box(bench,x,15,-5,2,18,2,'#536653');}for(let i=0;i<3;i++)box(bench,0,11,-4+i*4,35,2.3,3,'#b0926a');for(let i=0;i<3;i++)box(bench,0,17+i*3.5,-6,35,2.5,2,'#b0926a');
  const stage=place(330,566);box(stage,0,4,0,72,8,28,'#a78f6d');for(let i=0;i<8;i++)box(stage,-31+i*9,8.2,0,8.6,.4,28,'#c1a27d');for(const x of [-37,37])box(stage,x,28,-15,2.5,48,2.5,'#526b56');box(stage,0,49,-15,76,3,3,'#526b56');box(stage,0,28,-16,68,38,1.5,'#a9b49a');for(let i=0;i<5;i++)ball(stage,-25+i*12.5,46,-12,2,2,2,['#d7bd79','#bf887d','#9bafaf'][i%3],0);
  const arch=place(1062,556);for(const x of [-25,25])cyl(arch,x,27,0,1.8,1.8,54,'#efe8d3',8);ring(arch,0,54,0,25,1.8,'#efe8d3').rotation.x=0;
  // Upper half of a wedding arch; stems hidden by a garland of flowers.
  const archRing=arch.children[2];arch.remove(archRing);
  for(let i=0;i<=18;i++){const a=i/18*Math.PI;ball(arch,Math.cos(a)*25,54+Math.sin(a)*18,0,3,3,3,i%3===0?'#c7a18e':i%3===1?'#eeead6':'#9aaa7c',0);if(i)rod(arch,v(Math.cos((i-1)/18*Math.PI)*25,54+Math.sin((i-1)/18*Math.PI)*18,0),v(Math.cos(a)*25,54+Math.sin(a)*18,0),1,'#e8e4d0');}
  const lampModels=[];
  for(const [x,y]of LAMPS){const p=place(x,y);cyl(p,0,22,0,1,1.5,44,'#536959',8);cyl(p,0,3,0,2.5,3,6,'#536959',8);const window=box(p,0,46,0,6,7,6,'#f0dfae');window.material=mat('#f0dfae',{emissive:'#ffd78e',emissiveIntensity:0});for(const dx of[-3.1,3.1])for(const dz of[-3.1,3.1])box(p,dx,46,dz,.55,7,.55,'#536959');cyl(p,0,51,0,0,5,4,'#536959',4);lampModels.push({x,y,window});}
  const balloons=[];for(let i=0;i<BALLOONS.length;i++){const [x,y]=BALLOONS[i],p=place(x,y);for(let j=0;j<3;j++){const bx=(j-1)*7,by=44+(j===1?6:0);rod(p,v(0,0,0),v(bx,by,0),.22,'#d9d4bf',4);const b=ball(p,bx,by,0,5,6.5,5,['#db927b','#e3c96b','#7db3c8'][(i+j)%3],1);balloons.push({m:b,by,phase:i+j});}box(p,0,1,0,3,2,3,'#b6b49d');}
  for(const child of scene.children)child.userData.staticPark=true;
  scene.updateMatrixWorld(true);scene.attach(duck);duck.userData.staticPark=false;
  const flashStar=group(scene);const starShape=new T3.Shape();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?1.8:9;if(i===0)starShape.moveTo(Math.cos(a)*r,Math.sin(a)*r);else starShape.lineTo(Math.cos(a)*r,Math.sin(a)*r);}starShape.closePath();
  const starMesh=new T3.Mesh(new T3.ShapeGeometry(starShape),new T3.MeshBasicMaterial({color:'#fff2a6',side:T3.DoubleSide,depthTest:false}));starMesh.rotation.x=-Math.PI/4;starMesh.renderOrder=100;flashStar.add(starMesh);flashStar.visible=false;

  const evening=createEveningLighting(scene,lampModels);

  // A shared acoustic guitar: the same readable silhouette for the busker and procession.
  function acousticGuitar(parent){
    const p=group(parent,3,20,6);p.name='acoustic-guitar';p.rotation.z=.85;p.rotation.x=-.16;
    const outline=new T3.Shape();outline.moveTo(0,-9);
    outline.bezierCurveTo(-9,-9,-9,-3,-5,1);outline.bezierCurveTo(-3,3,-7,4,-6,7);
    outline.bezierCurveTo(-5,10,5,10,6,7);outline.bezierCurveTo(7,4,3,3,5,1);
    outline.bezierCurveTo(9,-3,9,-9,0,-9);outline.closePath();
    const body=mesh(p,new T3.ExtrudeGeometry(outline,{depth:2.8,bevelEnabled:true,bevelSize:.35,bevelThickness:.3,bevelSegments:1,steps:1,curveSegments:8}),'#bc713a');body.name='guitar-body';
    const face=mesh(p,new T3.ShapeGeometry(outline),'#e4b573',0,0,3.13);face.name='guitar-soundboard';
    const rosette=cyl(p,0,3,3.24,2.6,2.6,.12,'#85532f',24);rosette.rotation.x=Math.PI/2;
    const hole=cyl(p,0,3,3.34,2.05,2.05,.14,'#2b2821',24);hole.rotation.x=Math.PI/2;hole.name='guitar-soundhole';
    box(p,0,-4.4,3.4,4.4,1.3,.5,'#533b2b');box(p,0,-4.1,3.72,3.5,.24,.15,'#f3e1b5');
    box(p,0,17,1.7,2.8,18,2.3,'#815431');box(p,0,17,3.03,2.9,18,.4,'#48352c');
    const head=box(p,0,28.3,1.8,4.3,6,2,'#9a6338');head.name='guitar-headstock';
    for(let i=0;i<10;i++)box(p,0,9.6+i*1.55,3.28,2.9,.16,.13,'#d7c8a3');
    for(let i=0;i<6;i++){
      const x=(i-2.5)*.39,string=rod(p,v(x,-4.1,3.88),v(x,26.1,3.5),.065,'#f4e4bb',4);string.name='guitar-string';
      const side=i<3?-1:1,y=26.5+(i%3)*1.8;
      rod(p,v(side*1.5,y,1.8),v(side*2.8,y,1.8),.23,'#d9cbaa',6);
      const peg=ball(p,side*3,y,1.8,.65,.5,.5,'#efe2bd',0);peg.name='guitar-tuner';
    }
    return p;
  }
  function guitarPose(h,t,solo){
    h.instrument.rotation.z=.85+Math.sin(t*(solo?8:2))*(solo?.035:.012);
    // Solve both short articulated arms against points on the actual held model.
    h.root.updateMatrixWorld(true);
    for(let i=0;i<2;i++){
      const target=h.instrument.localToWorld(v(i===0?1.6:0,i===0?-1.5+Math.sin(t*(solo?22:9))*1.5:14,4.5));
      h.root.worldToLocal(target);const shoulder=h.arms[i].position,delta=target.sub(shoulder);
      const length=Math.min(10.65,Math.max(1,delta.length())),axis=delta.normalize();
      const along=(25-5.8*5.8+length*length)/(2*length),bend=Math.sqrt(Math.max(0,25-along*along));
      const side=v(0,0,1).addScaledVector(axis,-axis.z).normalize();
      const elbow=axis.clone().multiplyScalar(along).addScaledVector(side,bend);
      h.arms[i].quaternion.setFromUnitVectors(v(0,-1,0),elbow.clone().normalize());
      const forearm=axis.multiplyScalar(length).sub(elbow).applyQuaternion(h.arms[i].quaternion.clone().invert());
      h.elbows[i].quaternion.setFromUnitVectors(v(0,-1,0),forearm.normalize());
    }
  }

  // Simple low-poly humanoid: separate limbs are animated, no sprite billboards.
  function human(o={},hero=false,kid=false){
    const p=group(scene),root=group(p),h={group:p,root,knees:[],elbows:[]};const skin=o.skin||'#f2cdb0',hc=o.hair||'#594638',top=hero?'#303432':(o.top||'#b78570'),pants=hero?'#303432':(o.pants||'#556473'),shoe=hero?'#303631':(o.shoes||'#ece8d8');
    h.legs=[];for(const x of [-3,3]){const leg=group(root,x,17,0);box(leg,0,-3.5,0,4.3,7,4.7,pants);const knee=group(leg,0,-7,0);box(knee,0,-3.2,0,3.8,6.4,4.1,pants);ball(knee,0,-7.5,1.5,2.8,1.8,4,shoe);h.knees.push(knee);h.legs.push(leg);}
    if(o.dress){h.skirt=group(root,0,21,0);cyl(h.skirt,0,-6,0,5.6,o.parade?11:9,12,o.dress,10);ring(h.skirt,0,-11.7,0,o.parade?10.6:8.6,.5,'#f2d9bd');}
    cyl(root,0,24,0,5.5,4.5,14,top,6).scale.z=.69;ball(root,0,30,0,5.7,2.5,3.6,top);
    cyl(root,0,33,0,1.8,2,4,skin,8);h.head=group(root,0,39,0);ball(h.head,0,0,0,5,6.1,4.7,skin,1);ball(h.head,0,-1,3.4,3.7,3.5,2.1,skin,1);
    for(const x of [-4.8,4.8])ball(h.head,x,-.3,0,1.1,1.6,1.2,skin,1);
    const face=group(h.head);h.face=face;for(const x of [-1.9,1.9]){ball(face,x,.1,4.75,.45,.85,.42,'#31382f');box(face,x,1.6,4.55,1.7,.35,.4,hc);}
    ball(face,0,-1,5.2,.75,1,1,skin,0);rod(face,v(-1.2,-2.9,4.65),v(0,-3.2,4.9),.16,'#a26f60',5);rod(face,v(0,-3.2,4.9),v(1.3,-2.7,4.65),.16,'#a26f60',5);
    if(o.nose)ball(face,0,-1,5.2,1.8,1.8,1.8,o.nose,1);
    if(o.glasses){for(const x of [-2.1,2.1])box(face,x,.1,5,3.4,2,.6,'#3c453c');box(face,0,.3,5,1.5,.4,.5,'#3c453c');}
    if(o.beard||o.stache)ball(face,0,-3,3.7,3.6,1.6,2,o.beard||o.stache,0);
    const hs=hero?'quiff':o.hs;
    if(hs==='quiff'){
      ball(h.head,0,3,-.9,5.4,4.8,4.6,hc,1);ball(h.head,2.2,5.2,1,4.7,4,4.1,hc,1);ball(h.head,-2,4.5,1.5,3.5,2.8,3.6,hc,1);ball(h.head,3.5,1,-1,2.4,4.2,4,hc,1);box(h.head,-4.5,1.4,-.3,1.4,5,4,hc);
      for(let j=0;j<3;j++)ball(h.head,2.5-j*2,6.5-j*.55,1.1,2.7,1.5,3.3,j===1?'#554337':hc,0);
    }else if(hs==='bald'){for(const x of [-4.3,4.3])ball(h.head,x,1,-1,1.2,2,3,hc,0);}
    else{ball(h.head,0,3,-.6,5.2,3.6,4.8,hc,1);ball(h.head,-3.4,1,1,2,2.8,2.7,hc,0);if(['long','bob','wavy'].includes(hs)){ball(h.head,0,-1.5,-2.8,5.5,7,3,hc,1);for(const x of [-4.4,4.4])ball(h.head,x,-2,-1,1.6,5,2.5,hc,1);}if(hs==='bun')ball(h.head,0,6,-3,3,3,3,hc);if(hs==='curly')for(let i=0;i<7;i++){const a=i/7*6.28;ball(h.head,Math.cos(a)*4,2+Math.sin(a)*3,-.5,2.2,2,2.6,hc,0);}}
    h.arms=[];for(let i=0;i<2;i++){const x=i?-6.5:6.5,piv=group(root,x,29,0);box(piv,0,-2.5,0,3.5,5,3.8,hero?top:(o.sleeve||top));const elbow=group(piv,0,-5,0);box(elbow,0,-2.2,0,3,4.4,3.2,hero?top:(o.sleeve||top));ball(elbow,0,-5.8,.2,1.8,2,1.8,skin,1);h.elbows.push(elbow);h.arms.push(piv);}
    if(hero){
      const lapel=new T3.Shape();lapel.moveTo(-4,31);lapel.lineTo(-1,27);lapel.lineTo(-3,22);lapel.lineTo(-4.7,27);lapel.closePath();const m=mesh(root,new T3.ShapeGeometry(lapel),'#414440',0,0,3.4);m.material.side=T3.DoubleSide;const mr=m.clone();mr.scale.x=-1;root.add(mr);
      for(const x of [-1.8,1.8])for(let j=0;j<3;j++)ball(root,x,25-j*3.3,3.6,.6,.6,.45,'#d9d4ba',0);
      rod(h.head,v(-5,-.2,.8),v(-5,-5,.8),.2,'#c9d0c7',6);ball(h.head,-5,0,1,.7,.7,.7,'#d9ded3',0);
      const cam=group(root,7,24,6);box(cam,0,0,0,8,5,4,'#333e39');box(cam,0,2,0,3.5,2,3,'#424d47');const lens=cyl(cam,0,0,3,2.2,2.6,3,'#3f5352',12);lens.rotation.x=Math.PI/2;const glass=cyl(cam,0,0,4.7,1.6,1.6,.5,'#83a9a9',12);glass.rotation.x=Math.PI/2;ball(cam,2,1,2.1,.4,.4,.2,'#d6c496',0);h.camera=cam;
      const torch=group(h.elbows[1],0,-5.8,.2);const body=cyl(torch,0,0,0,1.9,1.9,8,'#365456',10);body.rotation.x=Math.PI/2;const rim=cyl(torch,0,0,5,2.8,2.1,3,'#c6a768',10);rim.rotation.x=Math.PI/2;const bulb=cyl(torch,0,0,6.7,2.2,2.2,.5,'#fff0c7',12);bulb.rotation.x=Math.PI/2;bulb.material=mat('#fff0c7',{emissive:'#ffeac2',emissiveIntensity:0});h.torch= torch;h.torchBulb=bulb;torch.visible=false;

    }
    if(o.tourist){
      // The original canvas-only pole never became a model; keep the whole rig in 3D.
      const rig=group(root,10,20,8);rod(rig,v(0,0,0),v(8,40,0),.65,'#71878b');rod(rig,v(0,0,0),v(1.1,5.5,0),1.05,'#354c51');
      const phone=group(rig,8,40,0);box(phone,0,0,0,6.6,10.8,1.5,'#293c44');box(phone,0,0,.81,5.3,8.9,.14,'#8dc9da');box(phone,0,3.9,.92,2,.35,.12,'#334b55');ball(phone,-1.9,3.6,-.9,.65,.65,.2,'#243c4a',0);ball(phone,1.8,3.7,-.95,.6,.6,.2,'#fff0c4',0);h.selfieRig=rig;h.phone=phone;
      h.phoneFlash=group(scene);const flare=new T3.Mesh(new T3.ShapeGeometry(starShape),new T3.MeshBasicMaterial({color:'#fff8d8',side:T3.DoubleSide,depthTest:false}));flare.rotation.x=-Math.PI/4;flare.scale.setScalar(.7);flare.renderOrder=101;h.phoneFlash.add(flare);h.phoneFlash.visible=false;
    }
    if(o.hat){const hc=o.hatc||'#8d9777';if(o.hat==='veil'){box(h.head,0,3,-4,10,2,3,'#eeeede');box(h.head,0,-2,-5,11,12,.5,'#eeeede');}else if(o.hat==='band'||o.hat==='bandana'){cyl(h.head,0,3,0,5.4,5.4,1.5,hc,12);}else{cyl(h.head,0,5,0,4.8,5.2,5,hc,12);if(o.hat==='fedora'||o.hat==='top')cyl(h.head,0,2.8,0,7,7,1,hc,12);if(o.hat==='chef')ball(h.head,0,8,0,6,3.5,5,hc,1);}}
    if(o.hat==='chef'){box(root,0,21,3.8,8,12,.5,'#dcad79');rod(root,v(-3,30,3.6),v(-3,23,3.9),.45,'#d1b398');rod(root,v(3,30,3.6),v(3,23,3.9),.45,'#d1b398');}
    if(o.nose){for(let i=0;i<3;i++)ball(root,0,28-i*4,4,1,1,1,['#bc5661','#4388af','#bc5661'][i],0);for(const x of[-2,2])ball(root,x,31,4,2,1.2,1,'#bf5264',0);}
    if(o.beard){for(const x of[-3,0,3])box(root,x,24,3.6,.6,12,.3,'#d59972');for(const y of[20,24,28])box(root,0,y,3.6,8,.6,.3,'#d59972');}
    if(o.dress&&o.glasses){box(root,8,14,1,5,6,3,'#a5526a');ring(root,8,18,1,2.2,.4,'#d9ad60').rotation.x=0;}
    if(o.parade==='guitarist'||o.guitar){h.instrument=acousticGuitar(root);rod(root,v(-5,31,1),v(7,14,5),.65,'#514336');}
    if(o.parade==='drummer'){const inst=group(root,0,17,7);cyl(inst,0,0,0,5,5,7,'#b77a48');cyl(inst,0,3.7,0,5,5,.6,'#f4e5bd');h.instrument=inst;}
    if(kid)p.scale.setScalar(.62);
    h.hero=hero;h.o=o;return h;
  }
  function animal(kind,o={}){
    const p=group(scene),root=group(p),h={group:p,root,kind,legs:[]};
    if(kind==='horse'){
      ball(root,0,18,0,8,8,16,'#987254');ball(root,0,29,11,5,12,5,'#987254');ball(root,0,37,15,4.8,5.5,8,'#987254');ball(root,0,34,21,4.5,3,4,'#d2b28a');
      for(const x of[-3,3]){cyl(root,x,44,13,.3,1.5,5,'#76523d',5);ball(root,x*1.3,39,17,.55,.7,.5,'#283a31');}
      for(const x of[-5.5,5.5])for(const z of[-10,10]){const leg=group(root,x,15,z);box(leg,0,-6,0,2.8,13,3,'#987254');box(leg,0,-13,1,3.2,3,4,'#443c34');h.legs.push(leg);}
      for(let i=0;i<7;i++)ball(root,0,26+i*2,6+i,2,3,3,'#4e4033',0);
      h.tail=group(root,0,24,-15);rod(h.tail,v(0,0,0),v(0,-15,-5),1.6,'#4e4033');box(root,0,26,-1,14,2,16,'#a65565');
    }else if(kind==='pigeon'){
      ball(root,0,4,0,4.4,3.5,6,'#a5ada7');ball(root,0,8,4,2.7,3.4,2.8,'#768e87');ball(root,0,7.2,6.6,1,.9,2,'#c7a266',0);for(const x of [-1.7,1.7]){ball(root,x,8.8,5.3,.45,.45,.45,'#303e35',0);rod(root,v(x,1,0),v(x,0,2),.3,'#b9927c',4);}box(root,0,3,-5,3,1,5,'#7b8886');h.wings=[];for(const x of [-3.4,3.4]){const w=group(root,x,5,0);ball(w,Math.sign(x)*1,0,-.7,1.5,2,5,'#899a96');h.wings.push(w);}
    }else if(kind==='monkey'){
      ball(root,0,7,0,4,5.5,3,'#8d7354');ball(root,0,15,1,4.3,4.5,4,'#8d7354');ball(root,0,14,3.3,3.2,3.3,1.8,'#cbb08d');for(const x of [-4.4,4.4]){ball(root,x,15,0,2,2,1.3,'#8d7354');ball(root,x,15,1,1.2,1.2,.5,'#cbb08d');ball(root,x/3,15.5,4.7,.45,.7,.5,'#293c32',0);rod(root,v(x,8,0),v(x,1,1),1.2,'#8d7354');}for(const x of [-2,2])ball(root,x,1,1,1.7,1,2,'#8d7354');const curve=new T3.CatmullRomCurve3([v(0,5,-2),v(0,3,-7),v(0,7,-10),v(0,11,-8)]);h.tail=mesh(root,new T3.TubeGeometry(curve,10,.9,5,false),'#8d7354');
    }else{
      const isCat=kind==='cat',body=isCat?'#bd9366':(o.body||'#dfd4b5'),patch=o.pat||'#a48a65';ball(root,0,6,0,4,3.8,7,body);ball(root,0,10,6,3.7,3.8,3.8,body);ball(root,0,8.7,8.3,2.5,1.7,2.5,isCat?body:'#eae3ce');ball(root,0,9,10,.6,.5,.5,isCat?'#b17f75':'#3d4638',0);
      for(const x of [-2.4,2.4]){ball(root,x,10.7,8.5,.48,.65,.45,'#344b39',0);if(isCat)cyl(root,x,13.8,6,0,1.6,3.4,body,3);else ball(root,x*1.3,10.5,5.8,1.6,3.2,1.5,patch,1);}
      for(const x of [-2.5,2.5])for(const z of [-4,4]){const leg=group(root,x,5,z);box(leg,0,-2.5,0,1.8,5,2,body);h.legs.push(leg);}
      const curve=new T3.CatmullRomCurve3([v(0,7,-5),v(0,9,-9),v(1,13,-10),v(2,14,-8)]);h.tail=mesh(root,new T3.TubeGeometry(curve,8,isCat?.75:1.3,5,false),body);
      if(!isCat)ball(root,0,8,-1,3.8,1.8,3,patch,1);
    }
    return h;
  }
  const models=new Map();let records=[],collecting=false,activeKey='',index=0;
  const silent=new Proxy({},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
  function record(kind,x,y,o,kid){records.push({key:activeKey+':'+(o&&o.modelKey!==undefined?o.modelKey:index++),kind,x,y,o:o||{},kid});}
  const legacy={person,kidPerson,pigeon,cat,monkey,dog,drawOksana,shadow,horse};
  person=function(c,x,y,o){if(collecting)record('person',x,y,o);else legacy.person(c,x,y,o);};
  kidPerson=function(c,x,y,o){if(collecting)record('person',x,y,o,true);else legacy.kidPerson(c,x,y,o);};
  for(const kind of ['pigeon','cat','monkey','dog','horse']){const fn=(c,x,y,o)=>{if(collecting)record(kind,x,y,o);else legacy[kind](c,x,y,o);};if(kind==='pigeon')pigeon=fn;if(kind==='cat')cat=fn;if(kind==='monkey')monkey=fn;if(kind==='dog')dog=fn;if(kind==='horse')horse=fn;}
  drawOksana=function(c,x,y,o){if(collecting)record('hero',x,y,o);else legacy.drawOksana(c,x,y,o);};
  shadow=function(c,x,y,r){if(!collecting)legacy.shadow(c,x,y,r);};
  function collectEntity(key,fn){activeKey=key;index=0;fn();}
  const extras=new Map();
  function extra(key,make){if(!extras.has(key))extras.set(key,make());const obj=extras.get(key);obj.visible=true;return obj;}
  function cup(){const p=group(scene);cyl(p,0,0,0,2.6,1.9,5,'#f1ebd6',12);cyl(p,0,2.6,0,2.3,2.3,.2,'#8b7255',12);return p;}
  function heart(){const p=group(scene);ball(p,-1.4,0,0,2,2,1,'#bb7c73',0);ball(p,1.4,0,0,2,2,1,'#bb7c73',0);const m=cyl(p,0,-2,0,0,3,3,'#bb7c73',4);m.rotation.z=Math.PI;return p;}
  function updateExtras(t){for(const m of extras.values())m.visible=false;
    for(const cl of S.clients){if(cl.id==='hipster'||cl.id==='barista'){const up=!!cl.phase,m=extra(cl.id+'cup',cup);m.position.set(cl.x+8,up?49:23,cl.y*G+6);if(up&&cl.id==='barista'){const h=extra('latteheart',heart);h.position.set(cl.x+8,62+Math.sin(t*4),cl.y*G);}}
      if(['fashion','wedding','couple'].includes(cl.id)&&(cl.pose===2||cl.kiss)){const h=extra(cl.id+'heart',heart);h.position.set(cl.x,60+Math.sin(t*4),cl.y*G);}

      if(cl.id==='clown')for(let i=0;i<3;i++){const m=extra('ball'+i,()=>ball(scene,0,0,0,2,2,2,['#be8072','#91a5a8','#c9b476'][i],1));const a=t*6+i*2.09;m.position.set(cl.x+Math.cos(a)*9,55+cl.jz*G+Math.abs(Math.sin(a))*12,cl.y*G);}
      if(cl.id==='grandpa'){const m=extra('paper',()=>{const p=group(scene);box(p,0,0,0,13,8,.3,'#e8e3cc');for(let i=0;i<3;i++)box(p,0,2-i*2, .2,9,.4,.2,'#9fa493');return p;});m.position.set(cl.x,21,cl.y*G+7);}
    }
  }
  // Camera-facing musical notes leave the soundboard during the actual solo.
  const musicNotes={particles:[],next:0,lastTime:0};
  function drawMusicNotes(){
    const t=S.t,notes=musicNotes.particles;
    if(S.mode!=='play'||t<musicNotes.lastTime){notes.length=0;musicNotes.next=t;}
    musicNotes.lastTime=t;
    for(let i=notes.length-1;i>=0;i--)if(t-notes[i].born>=1.6)notes.splice(i,1);
    const busker=S.clients.find(c=>c.id==='busker'),h=models.get('busker:0');
    if(S.mode==='play'&&!S.help&&S.intro<=0&&busker&&busker.solo&&h&&h.group.visible&&t>=musicNotes.next){
      const origin=h.instrument.localToWorld(v(0,3,5)),index=Math.round(t/.22);
      notes.push({born:t,origin,index});musicNotes.next=t+.22;
    }
    if(!busker||!h||!h.group.visible){notes.length=0;return;}
    ctx.save();
    for(const n of notes){
      const age=t-n.born,k=age/1.6,dir=n.index%2?1:-1;
      const world=n.origin.clone().add(v(dir*(5+18*k)+Math.sin(age*5+n.index)*3,9+39*k,5*k));
      world.project(camera);const x=(world.x+1)*VW/2,y=(1-world.y)*VH/2;
      if(x<-15||x>VW+15||y<45||y>VH+15)continue;
      ctx.save();ctx.translate(x,y);ctx.rotate(dir*(.1+Math.sin(age*3)*.1));
      ctx.globalAlpha=Math.min(1,age/.08)*Math.min(1,(1.6-age)/.45);
      const col=['#b97533','#608755','#8f69aa'][n.index%3];
      // Filled heads, thick stems and a light rim stay legible over the grass.
      ctx.lineCap='round';ctx.lineJoin='round';
      for(const outline of [true,false]){
        ctx.strokeStyle=outline?'#fff5d9':col;ctx.fillStyle=col;ctx.lineWidth=outline?2.8:1.35;
        ctx.beginPath();ctx.moveTo(1.5,0);ctx.lineTo(1.5,-8);ctx.lineTo(6,-9);ctx.lineTo(6,-2);ctx.stroke();
        for(const [dx,dy]of [[0,0],[4.5,-2]]){ctx.beginPath();ctx.ellipse(dx,dy,2,1.4,-.35,0,Math.PI*2);if(outline)ctx.stroke();else ctx.fill();}
      }
      ctx.restore();
    }
    ctx.restore();
  }
  let animationTime=0,animationDt=1/60,lastAnimationTime=null;
  function approach(current,target,rate=12){return current+(target-current)*(1-Math.exp(-rate*animationDt));}
  function angleToward(current,target){return current+Math.atan2(Math.sin(target-current),Math.cos(target-current))*(1-Math.exp(-12*animationDt));}
  function updateModel(r){
    let h=models.get(r.key);if(!h){h=r.kind==='person'||r.kind==='hero'?human({...r.o,guitar:r.key.startsWith('busker:')},r.kind==='hero',r.kid):animal(r.kind,r.o);models.set(r.key,h);}const o=r.o;h.group.visible=true;
    const z=(o.z||0)*G,dx=h.lastX===undefined?0:r.x-h.lastX,dy=h.lastY===undefined?0:r.y-h.lastY,motion=Math.hypot(dx,dy);h.lastX=r.x;h.lastY=r.y;h.group.position.set(r.x,z,r.y*G);
    const ph=o.ph||0,moving=!!o.moving||motion>.02,sw=moving?Math.sin(ph)*.48:0;
    let heading=h.heading===undefined?0:h.heading;
    if(r.kind==='hero'){heading=S.rmb&&S.fr?Math.atan2(S.fr.cx-S.pl.x,(S.fr.cy-S.pl.y)*G):S.pl.moving?S.pl.moveAngle:heading;h.camera.position.y=approach(h.camera.position.y,S.rmb?31:24);h.camera.position.x=approach(h.camera.position.x,S.rmb?(eveningAmount()>0?5.3:1.5):7);}
    else if(motion>.025&&motion<12)heading=Math.atan2(dx,dy*G);
    else if(r.kind==='person'&&!moving)heading=o.back?Math.PI:(o.look||0)*.75;
    else if(h.heading===undefined&&r.kind!=='person')heading=(o.dir||1)*Math.PI/2;
    h.heading=heading;h.group.rotation.y=angleToward(h.group.rotation.y,heading);
    if(r.kind==='hero'||r.kind==='person'){
      for(let i=0;i<2;i++){h.legs[i].rotation.x=approach(h.legs[i].rotation.x,i?-sw:sw);h.knees[i].rotation.x=approach(h.knees[i].rotation.x,moving?Math.max(0,Math.sin(ph+(i?Math.PI:0)))*.55:0);}
      h.root.position.y=moving?Math.abs(Math.cos(ph))*.75:Math.sin(animationTime*1.8+r.x)*.2;
      h.root.rotation.z=approach(h.root.rotation.z,o.parade==='dancer'?Math.sin(ph)*.1:moving?Math.sin(ph)*.025:0);
      h.face.visible=true;
      if(!h.hero)for(let i=0;i<2;i++){const mode=i===0?(o.r||0):(o.l||0),side=i===0?1:-1;h.arms[i].rotation.z=approach(h.arms[i].rotation.z,mode===2?side*2.4:mode===1?side*.9:mode===3?side*.5:side*.08);h.arms[i].rotation.x=approach(h.arms[i].rotation.x,(i?-sw:sw)*.65);h.elbows[i].rotation.x=approach(h.elbows[i].rotation.x,mode===3?-.8:mode===1?-.5:-.1);}
      if(r.kind==='hero'){for(let i=0;i<2;i++){h.arms[i].rotation.x=approach(h.arms[i].rotation.x,S.rmb?-1.35:i?sw*.6:-.65);h.arms[i].rotation.z=approach(h.arms[i].rotation.z,S.rmb?(i?-.25:.25):i?-.08:.2);h.elbows[i].rotation.x=approach(h.elbows[i].rotation.x,S.rmb?-.65:-.2);}}
      const dusk=eveningAmount();
      if(h.hero&&dusk>0){
        h.arms[1].rotation.x=-1.0;h.arms[1].rotation.z=-.12;h.elbows[1].rotation.x=-.28;
        h.torch.rotation.x=-h.arms[1].rotation.x-h.elbows[1].rotation.x;
        h.camera.position.x=approach(h.camera.position.x,S.rmb?5.3:7);
      }
      if(h.selfieRig){
        h.arms[0].rotation.z=.35;h.arms[0].rotation.x=-.7;h.elbows[0].rotation.x=-.55;
        h.selfieRig.rotation.z=approach(h.selfieRig.rotation.z,o.selfie?-.08:.12);h.selfieRig.rotation.x=approach(h.selfieRig.rotation.x,o.selfie?-.18:.05);
        h.head.rotation.y=approach(h.head.rotation.y,o.selfie?.23:0);
        h.phoneFlash.visible=!!o.phoneFlash;
        if(h.phoneFlash.visible){h.group.updateMatrixWorld(true);h.phone.getWorldPosition(h.phoneFlash.position);h.phoneFlash.position.y+=3;h.phoneFlash.position.z+=2;h.phoneFlash.rotation.z=animationTime*2;}
      }
      if(h.instrument&&h.instrument.name==='acoustic-guitar')guitarPose(h,animationTime,r.key.startsWith('busker:')&&!!S.clients.find(c=>c.id==='busker'&&c.solo));
      if(o.parade==='drummer')for(let i=0;i<2;i++)h.elbows[i].rotation.x=-.7+Math.sin(ph*2+i*Math.PI)*.3;
      h.head.rotation.x=approach(h.head.rotation.x,o.sleep?.23+Math.sin(animationTime*2)*.05:Math.sin(animationTime*1.3+r.x)*.025);
      if(h.skirt){h.skirt.rotation.z=Math.sin(ph)*.04*(moving?1:0);h.skirt.scale.set(1+Math.abs(sw)*.08,1,1);}
    }else if(r.kind==='pigeon'){h.root.position.y=o.fly?1:Math.sin(ph*2)*.35;for(let i=0;i<2;i++)h.wings[i].rotation.z=approach(h.wings[i].rotation.z,o.fly?Math.sin(ph*2)*1.15*(i?1:-1):0,28);h.root.rotation.x=approach(h.root.rotation.x,o.peck?.38:0);}
    else{for(let i=0;i<h.legs.length;i++)h.legs[i].rotation.x=moving?Math.sin(ph*2+(i===0||i===3?0:Math.PI))*.5:0;if(h.tail)h.tail.rotation.y=Math.sin(animationTime*3+ph*.2)*.22;h.root.position.y=moving?Math.abs(Math.sin(ph))* (r.kind==='horse'?.7:r.kind==='monkey'?2:.5):0;}
  }
  function bonusModel(b){const p=group(scene),cv=document.createElement('canvas');cv.width=160;cv.height=160;const c=cv.getContext('2d');c.scale(4,4);bonusBubble(c,b.type,20,18,15);const tex=new T3.CanvasTexture(cv);tex.colorSpace=T3.SRGBColorSpace;const m=new T3.Mesh(new T3.PlaneGeometry(36,36),new T3.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:T3.DoubleSide}));m.rotation.x=-Math.PI/4;p.add(m);return p;}
  const bonusModels=new Map();
  function draw(t){animationTime=t;animationDt=lastAnimationTime===null?1/60:Math.min(.05,Math.max(0,t-lastAnimationTime));lastAnimationTime=t;records=[];collecting=true;
    for(const cl of S.clients)collectEntity(cl.id,()=>cl.draw(silent,t));
    if(typeof Parade!=='undefined')collectEntity('parade',()=>Parade.draw(silent));
    for(let i=0;i<S.pigeons.length;i++)collectEntity('pigeon'+i,()=>S.pigeons[i].draw(silent));
    for(let i=0;i<S.pests.length;i++)collectEntity('pest'+i,()=>S.pests[i].draw(silent));
    collectEntity('cat',()=>S.cat.draw(silent));collectEntity('monkey',()=>S.monkey.draw(silent));
    collectEntity('oksana',()=>drawOksana(silent,S.pl.x,S.pl.y,{dir:S.pl.dir,ph:S.pl.ph,moving:S.pl.moving}));collecting=false;
    for(const h of models.values()){h.group.visible=false;if(h.phoneFlash)h.phoneFlash.visible=false;}for(const r of records)updateModel(r);updateExtras(t);
    for(const [b,m] of bonusModels)if(!S.bonuses.includes(b)){scene.remove(m);m.traverse(o=>{if(o.isMesh&&o.material.map){o.material.map.dispose();o.material.dispose();o.geometry.dispose();}});bonusModels.delete(b);}
    for(const b of S.bonuses){let m=bonusModels.get(b);if(!m){m=bonusModel(b);bonusModels.set(b,m);}m.position.set(b.x,30+Math.sin(b.t*4)*2,b.y*G);m.visible=!(b.life<3&&Math.floor(b.life*6)%2);m.rotation.y=Math.sin(t*.8)*.18;}
    for(const b of balloons)b.m.position.y=b.by+Math.sin(t*1.2+b.phase)*.6;
    duck.position.set(640+Math.cos(t*.22)*26,9+Math.sin(t*3)*.35,356*G+Math.sin(t*.22)*22);duck.rotation.y=-t*.22;duck.rotation.z=S.duckQuackUntil>S.t?Math.sin(t*22)*.12:0;
    flashStar.visible=S.mode==='play'&&S.flash>.08;const hero=models.get('oksana:0');if(hero&&flashStar.visible){scene.updateMatrixWorld(true);hero.camera.getWorldPosition(flashStar.position);flashStar.position.y+=3;flashStar.position.z+=5;flashStar.scale.setScalar(.65+S.flash*.65);starMesh.rotation.z=t*1.3;}

    const cx=Math.round(S.cam.x)+320,cz=(Math.round(S.cam.y)+180)*G;
    camera.position.set(cx,1000,cz+1000);camera.lookAt(cx,0,cz);camera.updateMatrixWorld();
    const rainy=S.wx&&S.wx.type==='rain'&&S.mode==='play',dusk=eveningAmount();sun.intensity=lerp(rainy?1.5:2.6,.48,dusk);ambient.intensity=lerp(rainy?2.3:2.55,1.45,dusk);ambient.color.set('#fff7e7').lerp(duskSky,dusk);sun.color.set('#fff1d5').lerp(duskSun,dusk);evening.update(dusk,hero);
    renderer.render(scene,camera);ctx.drawImage(renderer.domElement,0,0,VW,VH);evening.draw(ctx,camera,!!renderer.software,hero);drawMusicNotes();
    for(const tx of S.texts){ctx.globalAlpha=1-Math.pow(tx.t/1.5,3);T(tx.text,tx.x-S.cam.x,tx.y-S.cam.y-tx.t*16,tx.col,tx.big?14:8,'center');}ctx.globalAlpha=1;
  }
  function project(x,y,height=0){const p=new T3.Vector3(x,height,y*G).project(camera);return{x:(p.x+1)*VW/2,y:(1-p.y)*VH/2};}
  return{draw,project,scene,camera,renderer,models,musicNotes,lighting:evening.state,records:()=>records,scale:3};
})();

'use strict';
/* Dusk lighting shares simulation time with the final stage. The 2D bloom pass
   also supplies warm pools and a readable torch beam for the CPU 3D renderer. */
function createEveningLighting(scene,lamps){
  const moon=new THREE.DirectionalLight('#b9d4ff',0);moon.position.set(1050,650,-250);scene.add(moon);
  const lampLights=lamps.map(l=>{const p=new THREE.PointLight('#ffd18b',0,145,2);p.position.set(l.x,43,l.y*Math.SQRT2);scene.add(p);return p;});
  const torch=new THREE.SpotLight('#ffeac2',0,185,.40,.72,2);torch.castShadow=false;scene.add(torch,torch.target);
  const state={amount:0,lamps:lampLights,torch,moon};
  function update(amount,hero){
    state.amount=amount;moon.intensity=amount*.65;
    lamps.forEach((l,i)=>{lampLights[i].intensity=amount*2100;l.window.material.emissive.set('#ffd78e');l.window.material.emissiveIntensity=amount*2.4;});
    torch.intensity=0;
    if(hero&&hero.torch){
      hero.torch.visible=amount>.001;hero.torchBulb.material.emissiveIntensity=amount*3;
      if(amount>.001){scene.updateMatrixWorld(true);hero.torchBulb.getWorldPosition(torch.position);const heading=hero.group.rotation.y;torch.target.position.set(torch.position.x+Math.sin(heading)*100,1,torch.position.z+Math.cos(heading)*100);torch.target.updateMatrixWorld();torch.intensity=amount*14000;}
    }
  }
  function screen(p,camera){const v=p.clone().project(camera);return{x:(v.x+1)*320,y:(1-v.y)*180};}
  function glow(c,x,y,rx,ry,rgb,alpha){
    c.save();c.translate(x,y);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(${rgb},${alpha})`);g.addColorStop(.35,`rgba(${rgb},${alpha*.55})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.beginPath();c.arc(0,0,rx,0,Math.PI*2);c.fill();c.restore();
  }
  function draw(c,camera,software,hero){
    const a=state.amount;if(a<=0)return;
    c.save();
    // Keep the menus, HUD, aim frame and notices outside this world-only grading pass.
    c.fillStyle=`rgba(29,38,77,${a*(software?.35:.075)})`;c.fillRect(0,0,640,360);
    c.globalCompositeOperation='screen';glow(c,520,-30,420,300,'148,179,242',a*.075);
    lamps.forEach(l=>{
      const ground=screen(new THREE.Vector3(l.x,.5,l.y*Math.SQRT2),camera),bulb=screen(new THREE.Vector3(l.x,46,l.y*Math.SQRT2),camera);
      glow(c,ground.x,ground.y+2,47,25,'255,190,91',a*.20);
      glow(c,bulb.x,bulb.y,15,15,'255,209,125',a*.65);
      glow(c,bulb.x,bulb.y,3.7,4.7,'255,238,174',a*.95);
    });
    if(hero&&hero.torch.visible){
      const p=screen(torch.position,camera),q=screen(torch.target.position,camera),dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
      for(const [width,opacity]of[[35,.045],[27,.07],[18,.09]]){
        const g=c.createLinearGradient(p.x,p.y,q.x,q.y);g.addColorStop(0,`rgba(255,240,194,${a*opacity*.3})`);g.addColorStop(.6,`rgba(255,236,185,${a*opacity})`);g.addColorStop(1,'rgba(255,236,185,0)');
        c.fillStyle=g;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x+nx*width,q.y+ny*width);c.quadraticCurveTo(q.x+dx*.13,q.y+dy*.13,q.x-nx*width,q.y-ny*width);c.closePath();c.fill();
      }
      glow(c,q.x,q.y,30,18,'255,229,166',a*.19);glow(c,p.x,p.y,6,6,'255,243,199',a*.7);
    }
    c.restore();
  }
  return {update,draw,state};
}

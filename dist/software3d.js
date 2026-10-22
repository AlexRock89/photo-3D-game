'use strict';
/* CPU projection of the same 3D geometry. Static park objects are baked once
   into sprites; actors remain articulated 3D meshes and keep the original hit boxes. */
class ParkCanvasRenderer {
  constructor(){this.domElement=document.createElement('canvas');this.c=this.domElement.getContext('2d');this.shadowMap={};this.cache=new WeakMap();this.clear='#91aa7b';this.software=true;this.staticSprites=null;this.lastMs=0;}
  setSize(w,h){this.domElement.width=Math.min(w,1280);this.domElement.height=Math.round(this.domElement.width*h/w);}
  setPixelRatio(){}setClearColor(c){this.clear=c;}
  extract(root){const result=[];root.traverseVisible(o=>{
    if(!o.isMesh||!o.geometry.attributes.position||!o.material.visible)return;
    const matrix=o.matrixWorld.elements,pos=o.geometry.attributes.position,idx=o.geometry.index,n=pos.count;let data=this.cache.get(o);
    if(!data||data.matrix.some((v,i)=>Math.abs(v-matrix[i])>1e-7)){
      const verts=new Float64Array(n*3);for(let i=0;i<n;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);verts[i*3]=matrix[0]*x+matrix[4]*y+matrix[8]*z+matrix[12];verts[i*3+1]=matrix[1]*x+matrix[5]*y+matrix[9]*z+matrix[13];verts[i*3+2]=matrix[2]*x+matrix[6]*y+matrix[10]*z+matrix[14];}
      const material=o.material,color=material.color.clone().convertLinearToSRGB(),rgb=[color.r*255,color.g*255,color.b*255],tris=[];
      for(let j=0;j<(idx?idx.count:n);j+=3){const a=(idx?idx.getX(j):j)*3,b=(idx?idx.getX(j+1):j+1)*3,d=(idx?idx.getX(j+2):j+2)*3;
        const ux=verts[b]-verts[a],uy=verts[b+1]-verts[a+1],uz=verts[b+2]-verts[a+2],vx=verts[d]-verts[a],vy=verts[d+1]-verts[a+1],vz=verts[d+2]-verts[a+2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const len=Math.hypot(nx,ny,nz)||1;nx/=len;ny/=len;nz/=len;if(material.side!==THREE.DoubleSide&&ny+nz<-.0001)continue;
        const light=Math.max(.69,Math.min(1.1,.8+.28*Math.max(0,-.45*nx+.84*ny+.3*nz))),col=`rgb(${Math.min(255,Math.round(rgb[0]*light))},${Math.min(255,Math.round(rgb[1]*light))},${Math.min(255,Math.round(rgb[2]*light))})`;
        tris.push({x:[verts[a],verts[b],verts[d]],y:[Math.SQRT1_2*(verts[a+2]-verts[a+1]),Math.SQRT1_2*(verts[b+2]-verts[b+1]),Math.SQRT1_2*(verts[d+2]-verts[d+1])],depth:(verts[a+1]+verts[a+2]+verts[b+1]+verts[b+2]+verts[d+1]+verts[d+2])/3,col,height:(verts[a+1]+verts[b+1]+verts[d+1])/3,floor:Math.max(verts[a+1],verts[b+1],verts[d+1])<7.5,uv:material.map?[(idx?idx.getX(j):j),(idx?idx.getX(j+1):j+1),(idx?idx.getX(j+2):j+2)].map(i=>[o.geometry.attributes.uv.getX(i),o.geometry.attributes.uv.getY(i)]):null,texture:material.map&&material.map.image});}
      data={matrix:matrix.slice(),tris};this.cache.set(o,data);
    }result.push(...data.tris);
  });return result;}
  polygon(c,t,dx=0,dy=0){const x=t.x,y=t.y;c.fillStyle=t.col;c.beginPath();c.moveTo(x[0]+dx,y[0]+dy);c.lineTo(x[1]+dx,y[1]+dy);c.lineTo(x[2]+dx,y[2]+dy);c.closePath();if(!t.texture){c.fill();c.strokeStyle=t.col;c.lineWidth=t.floor?.35:.22;c.stroke();}
    if(t.texture){const image=t.texture,uv=t.uv.map(([u,v])=>[u*image.width,(1-v)*image.height]);const[u0,v0]=uv[0],[u1,v1]=uv[1],[u2,v2]=uv[2],x0=x[0]+dx,x1=x[1]+dx,x2=x[2]+dx,y0=y[0]+dy,y1=y[1]+dy,y2=y[2]+dy,D=u0*(v1-v2)+u1*(v2-v0)+u2*(v0-v1);if(Math.abs(D)<1e-8)return;c.save();c.clip();const a=(x0*(v1-v2)+x1*(v2-v0)+x2*(v0-v1))/D,b=(y0*(v1-v2)+y1*(v2-v0)+y2*(v0-v1))/D,cc=(x0*(u2-u1)+x1*(u0-u2)+x2*(u1-u0))/D,d=(y0*(u2-u1)+y1*(u0-u2)+y2*(u1-u0))/D,e=x0-a*u0-cc*v0,ff=y0-b*u0-d*v0;c.transform(a,b,cc,d,e,ff);c.drawImage(image,0,0);c.restore();}
  }
  bake(scene){const floor=[],sprites=[];
    for(const root of scene.children)if(root.userData.staticPark){const tris=this.extract(root),upper=[];for(const t of tris)(t.floor?floor:upper).push(t);if(!upper.length)continue;
      let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity;for(const t of upper)for(let i=0;i<3;i++){minx=Math.min(minx,t.x[i]);maxx=Math.max(maxx,t.x[i]);miny=Math.min(miny,t.y[i]);maxy=Math.max(maxy,t.y[i]);}
      const x=Math.floor(minx)-2,y=Math.floor(miny)-2,w=Math.ceil(maxx)-x+2,h=Math.ceil(maxy)-y+2;if(w>1500||h>1500)continue;
      const cv=document.createElement('canvas');cv.width=w*2;cv.height=h*2;const c=cv.getContext('2d');c.scale(2,2);upper.sort((a,b)=>a.depth-b.depth);for(const t of upper)this.polygon(c,t,-x,-y);
      sprites.push({image:cv,x,y,w,h,depth:root.position.z+root.position.y});
    }
    const cv=document.createElement('canvas');cv.width=2960;cv.height=1900;const c=cv.getContext('2d');c.scale(2,2);c.translate(100,150);floor.sort((a,b)=>a.height-b.height||a.depth-b.depth);for(const t of floor)this.polygon(c,t);
    for(const[x,y]of TREES)this.shadow(c,x+6,y+4,16,6,.11);
    for(const[x,y,rx,ry]of[[640,356,50,31],[920,115,58,20],[DINO.x,DINO.y,29,13],[1120,298,22,9]])this.shadow(c,x+4,y+4,rx,ry,.12);
    this.floorImage=cv;this.staticSprites=sprites;
  }
  shadow(c,x,y,rx,ry,alpha){c.save();c.translate(x,y);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(40,62,33,${alpha})`);g.addColorStop(1,'rgba(40,62,33,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,rx,0,7);c.fill();c.restore();}
  render(scene,camera){const start=performance.now(),c=this.c,k=this.domElement.width/640,cx=camera.position.x-320,cy=(camera.position.z-1000)*Math.SQRT1_2-180;c.setTransform(k,0,0,k,0,0);c.fillStyle=this.clear;c.fillRect(0,0,640,360);scene.updateMatrixWorld(true);if(!this.staticSprites)this.bake(scene);c.drawImage(this.floorImage,-100-cx,-150-cy,1480,950);
    const items=[];for(const s of this.staticSprites)if(s.x+s.w>cx&&s.x<cx+640&&s.y+s.h>cy&&s.y<cy+360)items.push(s);
    for(const root of scene.children){if(root.userData.staticPark||!root.visible||(!root.isGroup&&!root.isMesh))continue;const x=root.position.x,y=root.position.z*Math.SQRT1_2-root.position.y*Math.SQRT1_2;if(x<cx-90||x>cx+730||y<cy-40||y>cy+450)continue;const tris=this.extract(root);if(!tris.length)continue;tris.sort((a,b)=>a.depth-b.depth);items.push({tris,depth:root.position.z+root.position.y+.1});if(root.position.y<35)this.shadow(c,x-cx+2,y-cy+2,8,3,.14);}
    items.sort((a,b)=>a.depth-b.depth);for(const item of items){if(item.image)c.drawImage(item.image,item.x-cx,item.y-cy,item.w,item.h);else for(const t of item.tris)this.polygon(c,t,-cx,-cy);}
    c.setTransform(1,0,0,1,0,0);this.lastMs=performance.now()-start;
  }
}

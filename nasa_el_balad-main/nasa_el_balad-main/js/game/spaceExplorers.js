import { playWelcomeSound, playSuckSound } from "../music.js";
import { createExploration } from "./exploration.js";
import { hasCertificate, subscribe as subscribeProgress } from "./progress.js";

function createCertificateBadgeTexture(THREE, planetName) {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#123b70";
  ctx.beginPath();
  ctx.moveTo(28, 12);
  ctx.arcTo(308, 12, 308, 116, 18);
  ctx.arcTo(308, 116, 12, 116, 18);
  ctx.arcTo(12, 116, 12, 12, 18);
  ctx.arcTo(12, 12, 308, 12, 18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#f4c450";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.fillStyle = "#f4c450";
  ctx.font = "bold 62px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✓", 64, 64);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px Arial, sans-serif";
  ctx.fillText(planetName.toUpperCase(), 196, 48);
  ctx.font = "bold 25px Arial, sans-serif";
  ctx.fillText("CERTIFIED", 196, 88);
  return new THREE.CanvasTexture(canvas);
}

// Original Space Explorers scene (home, travel, landing, planet surfaces),
// ported unchanged, plus hooks for zoom and the exploration-object system.
export function startGame() {
const THREE = window.THREE;
const $=id=>document.getElementById(id);
const PL=[
 {n:'Earth',d:'Our home! The only planet we know with oceans, clouds and life.',r:2,p:[-6.5,2.2,-6],c:0x4aa8ff,t:'earth'},
 {n:'Moon',d:'Earth’s dusty grey friend. Humans have walked on it!',r:.75,p:[-3.1,-2.3,-1],c:0xdddddd,t:'moon'},
 {n:'Mars',d:'The red planet. Rovers are exploring it right now!',r:1.3,p:[5.2,-1.6,-4],c:0xff7a45,t:'mars'},
 {n:'Jupiter',d:'The giant of the solar system, with a storm bigger than Earth.',r:3.4,p:[8,3.6,-15],c:0xffc48a,t:'jup'},
 {n:'Saturn',d:'Famous for its glittering rings made of ice and rock.',r:2.5,p:[-9.5,-2.6,-13],c:0xf3dca0,t:'sat',ring:1}
];
function showLand(p){$('lt').textContent='You landed on '+p.n+'! 🎉';$('ld').textContent='Great flying, explorer! The full '+p.n+' adventure is coming in the next phase.';$('land').style.display='flex'}
let gl=null;
try{const c=document.createElement('canvas');gl=c.getContext('webgl2')||c.getContext('webgl')}catch(e){}
let destroy=()=>{};
if(!gl||typeof THREE==='undefined'){
  $('fallback').style.display='flex';$('ui').style.display='none';
  const cols=['#4aa8ff','#cfcfcf','#e0623a','#e3b07a','#e8d08a'];
  const row=document.querySelector('#fallback .row');row.innerHTML='';
  PL.forEach((p,i)=>{const b=document.createElement('button');b.textContent=p.n;b.style.background=`radial-gradient(circle at 30% 30%,#fff8,${cols[i]} 40%,#000 130%)`;b.onclick=()=>showLand(p);row.appendChild(b)});
  $('back').onclick=()=>$('land').style.display='none';
}else destroy=init();
return ()=>destroy();

function init(){
const offs=[];const on=(t,e,f,o)=>{t.addEventListener(e,f,o);offs.push(()=>t.removeEventListener(e,f,o))};let raf=0;
const R=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(devicePixelRatio,2));R.setSize(innerWidth,innerHeight);
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;document.body.prepend(R.domElement);
const S=new THREE.Scene();S.fog=new THREE.FogExp2(0x070722,.004);
const cam=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,600);
const H=new THREE.Vector3(0,.3,8);
function homePos(){const a=innerWidth/innerHeight;H.set(0,.3,a<1?8+(1-a)*8:8)}
homePos();cam.position.copy(H);
const amb=new THREE.AmbientLight(0x6670c0,.55);S.add(amb);var neb=[];
const sun=new THREE.DirectionalLight(0xfff2e0,2.4);sun.position.set(10,6,9);S.add(sun,sun.target);sun.shadow.mapSize.set(2048,2048);const sc_=sun.shadow.camera;sc_.left=sc_.bottom=-14;sc_.right=sc_.top=14;sc_.near=.5;sc_.far=100;sc_.updateProjectionMatrix();sun.shadow.bias=-.0005;sun.shadow.normalBias=.03;
const rim=new THREE.PointLight(0x8a4dff,1.2,60);rim.position.set(-6,3,-2);S.add(rim);

// ---------- procedural textures ----------
const rnd=(a,b)=>a+Math.random()*(b-a);
function mk(f){const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');f(x,512,256);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
function blobs(x,w,h,col,n,a,b,al){x.fillStyle=col;x.globalAlpha=al;for(let i=0;i<n;i++){x.beginPath();x.ellipse(rnd(0,w),rnd(0,h),rnd(a,b),rnd(a,b)*.6,rnd(0,3),0,7);x.fill()}x.globalAlpha=1}
function bands(x,w,h,cols,n){for(let i=0;i<n;i++){x.fillStyle=cols[Math.floor(rnd(0,cols.length))];x.globalAlpha=.8;x.fillRect(0,i*h/n,w,h/n+2)}x.globalAlpha=1;blobs(x,w,h,'#fff',40,10,40,.07);blobs(x,w,h,'#000',40,10,40,.06)}
const TX={
 earth:()=>mk((x,w,h)=>{x.fillStyle='#1b5fb8';x.fillRect(0,0,w,h);blobs(x,w,h,'#2f9a4a',45,15,45,1);blobs(x,w,h,'#9a8a4a',25,8,22,.9);blobs(x,w,h,'#fff',50,10,35,.4);x.fillStyle='#fff';x.fillRect(0,0,w,14);x.fillRect(0,h-14,w,14)}),
 moon:()=>mk((x,w,h)=>{x.fillStyle='#a9a9ad';x.fillRect(0,0,w,h);blobs(x,w,h,'#6e6e74',60,4,18,.6);blobs(x,w,h,'#d4d4d8',40,3,10,.5)}),
 mars:()=>mk((x,w,h)=>{x.fillStyle='#b4502c';x.fillRect(0,0,w,h);blobs(x,w,h,'#7a2f18',50,10,35,.6);blobs(x,w,h,'#d98a5a',40,8,25,.4);x.fillStyle='#fff';x.globalAlpha=.8;x.fillRect(0,0,w,10);x.fillRect(0,h-10,w,10);x.globalAlpha=1}),
 jup:()=>mk((x,w,h)=>{bands(x,w,h,['#d9b48a','#b5815a','#f0dcc0','#8c5a3c','#e8c9a0'],16);x.fillStyle='#b8442c';x.beginPath();x.ellipse(340,170,34,18,0,0,7);x.fill()}),
 sat:()=>mk((x,w,h)=>bands(x,w,h,['#e8d08a','#cdb06a','#f4e6b8','#bfa060'],14))
};
function glowTex(c){const k=document.createElement('canvas');k.width=k.height=128;const x=k.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,c);g.addColorStop(.35,c.replace(/[\d.]+\)$/,'.25)'));g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(k)}

// ---------- background ----------
{const n=3500,g=new THREE.BufferGeometry(),pos=new Float32Array(n*3),col=new Float32Array(n*3);
 for(let i=0;i<n;i++){const r=rnd(70,260),a=rnd(0,6.283),b=Math.acos(rnd(-1,1));pos.set([r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a)],i*3);const c=new THREE.Color().setHSL(rnd(.5,.95),.7,rnd(.6,.95));col.set([c.r,c.g,c.b],i*3)}
 g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
 var stars=new THREE.Points(g,new THREE.PointsMaterial({size:1.8,sizeAttenuation:false,vertexColors:true,fog:false}));S.add(stars)}
[['rgba(138,77,255,.9)',[-50,20,-120],150],['rgba(0,170,255,.8)',[60,-10,-140],170],['rgba(255,90,170,.7)',[0,50,-160],140],['rgba(255,150,60,.5)',[-70,-40,-150],110]].forEach(([c,p,s])=>{
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(c),blending:THREE.AdditiveBlending,transparent:true,opacity:.55,depthWrite:false,fog:false}));sp.position.set(...p);sp.scale.set(s,s*.7,1);S.add(sp);neb.push(sp)});
const rocks=[];
for(let i=0;i<16;i++){const g=new THREE.IcosahedronGeometry(rnd(.1,.35),1),v=g.attributes.position;for(let j=0;j<v.count;j++)v.setXYZ(j,v.getX(j)*rnd(.75,1.25),v.getY(j)*rnd(.75,1.25),v.getZ(j)*rnd(.75,1.25));g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x7d7268,roughness:1,flatShading:true}));m.userData={a:rnd(0,6.28),rad:rnd(5,13),y:rnd(-4,4),s:rnd(.02,.06),sp:new THREE.Vector3(rnd(-1,1),rnd(-1,1),rnd(-1,1)).multiplyScalar(.4)};S.add(m);rocks.push(m)}

// ---------- planets ----------
const planetPickerButtons=new Map();
const planets=PL.map((d,i)=>{
 const grp=new THREE.Group();grp.position.set(...d.p);
 const mat=new THREE.MeshStandardMaterial({map:TX[d.t](),roughness:.9,metalness:0,transparent:true});
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(d.r,64,48),mat);mesh.userData.i=i;grp.add(mesh);
 const atm=new THREE.Mesh(new THREE.SphereGeometry(d.r*1.06,48,32),new THREE.MeshBasicMaterial({color:d.c,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,side:THREE.BackSide,depthWrite:false}));grp.add(atm);
 const col='rgba('+[d.c>>16&255,d.c>>8&255,d.c&255]+',.9)';
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(col),blending:THREE.AdditiveBlending,transparent:true,opacity:.35,depthWrite:false}));glow.scale.setScalar(d.r*4);grp.add(glow);
 let ring;if(d.ring){ring=new THREE.Mesh(new THREE.RingGeometry(d.r*1.4,d.r*2.4,80),new THREE.MeshBasicMaterial({color:0xd9c487,transparent:true,opacity:.65,side:THREE.DoubleSide}));ring.rotation.x=Math.PI/2.3;ring.rotation.y=.25;grp.add(ring)}
 const certificateBadgeTexture=createCertificateBadgeTexture(THREE,d.n);
 const certificateBadgeMaterial=new THREE.SpriteMaterial({map:certificateBadgeTexture,transparent:true,depthTest:false,depthWrite:false,fog:false});
 const certificateBadge=new THREE.Sprite(certificateBadgeMaterial);
 certificateBadge.position.set(0,d.r+Math.max(.7,d.r*.45),0);
 const badgeWidth=Math.max(1.25,d.r*1.25);
 certificateBadge.scale.set(badgeWidth,badgeWidth*.4,1);
 certificateBadge.renderOrder=10;
 certificateBadge.visible=hasCertificate(d.n);
 grp.add(certificateBadge);
 S.add(grp);
 return{d,grp,mesh,mat,glow,atm,ring,certificateBadge,certificateBadgeTexture,certificateBadgeMaterial,base:grp.position.clone(),hov:0,ph:rnd(0,6)}});
const updateCertificateBadges=()=>{
 planets.forEach(p=>{p.certificateBadge.visible=hasCertificate(p.d.n)});
 planetPickerButtons.forEach((button,planet)=>{const earned=hasCertificate(planet);button.classList.toggle('planet-certified',earned);button.setAttribute('aria-label',earned?`${planet}, certificate earned`:planet);button.title=earned?`${planet} certificate earned`:`Explore ${planet}`});
};
offs.push(()=>planets.forEach(p=>{p.certificateBadgeMaterial.dispose();p.certificateBadgeTexture.dispose()}));
offs.push(subscribeProgress(updateCertificateBadges));

// ---------- child astronaut ----------
const A=new THREE.Group(),body=new THREE.Group();A.add(body);S.add(A);
const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.1},o));
const white=M(0xf4f6ff,{roughness:.5}),orange=M(0xff8a2a),grey=M(0x9aa3bd,{metalness:.5}),skin=M(0xf2b48c,{roughness:.7});
const add=(p,g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o};
add(body,new THREE.CylinderGeometry(.3,.34,.62,24),white,0,0,0);
add(body,new THREE.BoxGeometry(.26,.2,.05),orange,0,.08,.31);
[-.07,.07].forEach(x=>add(body,new THREE.SphereGeometry(.03,8,8),M(0x40e0ff,{emissive:0x0088aa}),x,.08,.34));
add(body,new THREE.CylinderGeometry(.35,.35,.08,24),orange,0,-.3,0);
add(body,new THREE.TorusGeometry(.26,.06,10,24),grey,0,.34,0).rotation.x=Math.PI/2;
const pack=add(body,new THREE.BoxGeometry(.5,.62,.26),M(0xc9cfe6),0,.02,-.32);
[-.12,.12].forEach(x=>add(pack,new THREE.BoxGeometry(.06,.6,.28),orange,x,0,0));
const head=new THREE.Group();head.position.y=.82;body.add(head);
add(head,new THREE.SphereGeometry(.37,32,24),skin);
add(head,new THREE.SphereGeometry(.385,24,16,0,6.283,0,1.45),M(0x4a2c18,{roughness:.9}),0,.02,-.02);
[-.14,.14].forEach(x=>{add(head,new THREE.SphereGeometry(.085,16,16),M(0x161025,{roughness:.2}),x,.04,.31);add(head,new THREE.SphereGeometry(.028,8,8),new THREE.MeshBasicMaterial({color:0xffffff}),x+.025,.07,.385);add(head,new THREE.SphereGeometry(.07,12,12),M(0xff8fa0,{transparent:true,opacity:.5}),x*1.6,-.1,.28)});
const smile=add(head,new THREE.TorusGeometry(.1,.017,8,20,Math.PI),M(0x8a2a2a),0,-.07,.345);smile.rotation.z=Math.PI;
const glass=add(head,new THREE.SphereGeometry(.56,40,30),new THREE.MeshPhysicalMaterial({color:0x9fd8ff,transparent:true,opacity:.22,roughness:0,metalness:.1,clearcoat:1}));
add(head,new THREE.TorusGeometry(.5,.07,14,36),white,0,-.3,0).rotation.x=Math.PI/2;
[-.56,.56].forEach(x=>add(head,new THREE.CylinderGeometry(.1,.1,.14,16),orange,x,0,0).rotation.z=Math.PI/2);
const antenna=add(head,new THREE.CylinderGeometry(.015,.015,.28,6),grey,.3,.55,-.1);add(head,new THREE.SphereGeometry(.04,8,8),M(0xff4040,{emissive:0xff0000}),.3,.7,-.1);
const limb=(x,y,len,r,m,end,endM)=>{const g=new THREE.Group();g.position.set(x,y,0);add(g,new THREE.CylinderGeometry(r,r*.9,len,14),m,0,-len/2,0);add(g,end,endM,0,-len-.02,end.type==='BoxGeometry'?.04:0);body.add(g);return g};
const armL=limb(-.4,.25,.44,.08,white,new THREE.SphereGeometry(.1,12,12),orange),armR=limb(.4,.25,.44,.08,white,new THREE.SphereGeometry(.1,12,12),orange);
const legL=limb(-.15,-.32,.48,.1,white,new THREE.BoxGeometry(.2,.14,.3),orange),legR=limb(.15,-.32,.48,.1,white,new THREE.BoxGeometry(.2,.14,.3),orange);
const flame=new THREE.Group();flame.position.set(0,-.2,-.5);flame.rotation.x=-Math.PI/2;flame.visible=false;A.add(flame);
const fm=new THREE.MeshBasicMaterial({color:0xffa030,transparent:true,opacity:.9,blending:THREE.AdditiveBlending}),f1=add(flame,new THREE.ConeGeometry(.16,.9,12),fm,0,-.45,0);f1.rotation.x=Math.PI;
const f2=add(flame,new THREE.ConeGeometry(.09,.6,12),new THREE.MeshBasicMaterial({color:0x9ff0ff,blending:THREE.AdditiveBlending}),0,-.3,0);f2.rotation.x=Math.PI;
A.scale.setScalar(1.25);const A0=new THREE.Vector3(0,-.35,0);A.position.copy(A0);

// speed streaks that rush past the flying astronaut
const SN=260,sg=new THREE.BufferGeometry(),sP=new Float32Array(SN*6),sA=new Float32Array(SN),sR=new Float32Array(SN),sZ=new Float32Array(SN);
for(let i=0;i<SN;i++){sA[i]=rnd(0,6.283);sR[i]=rnd(.5,2.8);sZ[i]=Math.random()}
sg.setAttribute('position',new THREE.BufferAttribute(sP,3));
const streaks=new THREE.LineSegments(sg,new THREE.LineBasicMaterial({color:0xcdefff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));streaks.frustumCulled=false;streaks.visible=false;S.add(streaks);
function streaksTick(pos,dir,side,upv,amt,dt){
 if(amt<=.004){streaks.visible=false;return}
 streaks.visible=true;streaks.material.opacity=.1+amt*.65;
 for(let i=0;i<SN;i++){
  sZ[i]=(sZ[i]+dt*(.25+amt*1.1))%1;
  const z=sZ[i],al=7-z*28,ca=Math.cos(sA[i])*sR[i],sa=Math.sin(sA[i])*sR[i];
  const x=pos.x+dir.x*al+side.x*ca+upv.x*sa,y=pos.y+dir.y*al+upv.y*sa,zz=pos.z+dir.z*al+side.z*ca+upv.z*sa;
  const l=(.5+amt*2.6)*(.25+z*.75);
  sP[i*6]=x;sP[i*6+1]=y;sP[i*6+2]=zz;sP[i*6+3]=x-dir.x*l;sP[i*6+4]=y-dir.y*l;sP[i*6+5]=zz-dir.z*l;
 }
 sg.attributes.position.needsUpdate=true;
}

// ---------- interaction ----------
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2(),mouse={x:0,y:0},tip=$('tip');
let hover=-1,state='home',sel=-1,t0=0,tn=0,retFrom=null,faceQ=new THREE.Quaternion(),homeQ=new THREE.Quaternion();

let suctionPlayed = false;
const hud=$('hud');
function hit(e){ptr.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ptr,cam);const h=ray.intersectObjects(planets.map(p=>p.mesh))[0];return h?h.object.userData.i:-1}
function setTip(i,e){if(i<0){tip.style.display='none';return}const d=PL[i],status=hasCertificate(d.n)?' · 🏅 Certificate earned':'';tip.innerHTML=`<b>${d.n}${status}</b><p>${d.d}</p><i>🚀 Click to explore ${d.n}!</i>`;tip.style.display='block';tip.style.left=Math.min(innerWidth-280,Math.max(8,e.clientX+18))+'px';tip.style.top=Math.min(innerHeight-130,Math.max(8,e.clientY+14))+'px'}
R.domElement.addEventListener('pointermove',e=>{mouse.x=e.clientX/innerWidth*2-1;mouse.y=e.clientY/innerHeight*2-1;if(state!=='home')return;hover=hit(e);R.domElement.style.cursor=hover>=0?'pointer':'default';setTip(hover,e)});
R.domElement.addEventListener('pointerdown',e=>{if(state!=='home')return;const i=hit(e);if(i<0)return;if(e.pointerType==='touch'&&hover!==i){hover=i;setTip(i,e);return}go(i)});
function reveal(){$('hero').style.opacity=0;$('hero').style.transform='translateX(-50%) translateY(-30px)';$('actions').style.opacity=0;$('actions').style.pointerEvents='none';$('picker').style.display='flex'}
$('start').onclick=e=>{EX.unlock();const r=document.createElement('div');r.className='rocket';r.textContent='🚀';const b=e.currentTarget.getBoundingClientRect();r.style.left=b.left+b.width/2+'px';r.style.top=b.top+'px';document.body.appendChild(r);setTimeout(()=>r.remove(),1400);setTimeout(reveal,350)};
$('picker').querySelectorAll('.chip').forEach(b=>b.remove());
PL.forEach((d,i)=>{
 const b=document.createElement('button');
 b.className='chip';
 b.innerHTML=`<span class="planet-picker-name">${d.n}</span><span class="planet-certificate-check" aria-hidden="true">✓</span>`;
 b.onclick=()=>{if(state==='home')go(i)};
 planetPickerButtons.set(d.n,b);
 $('picker').appendChild(b);
});
updateCertificateBadges();

function go(i){

  // Prevent entering Earth
  if(PL[i].n === 'Earth'){
    $('hud').textContent = "Earth is our home! 🌍 You can't explore it. Choose another planet!";
    $('hud').style.opacity = 1;

    setTimeout(()=>{
      if(state === 'home'){
        $('hud').style.opacity = 0;
      }
    }, 3500);

    return;
  }

  EX.unlock();
  sel=i;
  state='travel';
  suctionPlayed = false;
  t0=tn;
  tip.style.display='none';
  hover=-1;
  reveal();
  $('picker').style.display='none';
  $('abort').style.display='block';
  homeQ.copy(A.quaternion);
  camLook.set(0,0,0);
  flight=0;
  flameBase=1;
  cruiseDur=0;
  cam.fov=55;
  cam.updateProjectionMatrix();
}

$('abort').onclick=$('back').onclick=()=>{if(state==='surface'||state==='descend'){exitSurface();return}if(state==='travel'||state==='landed'){$('land').style.display='none';$('abort').style.display='none';retFrom={c:cam.position.clone(),p:A.position.clone(),q:A.quaternion.clone(),f:cam.fov,s:A.scale.x};state='ret';t0=tn;hud.style.opacity=0}};
const LOCK=1.4,IGN=1.1,ARR=1.5; // lock on · ignition · arrival
let cruiseDur=0;
const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,cl=u=>Math.max(0,Math.min(1,u)),smo=u=>u*u*(3-2*u);
const tmp=new THREE.Object3D(),V=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
function msg(s){if(hud.textContent!==s){hud.textContent=s;hud.style.opacity=1}}
let fade=0,flight=0,flameBase=1;
const camLook=new THREE.Vector3(),CV=new THREE.Vector3(),CL=new THREE.Vector3();
const TV1=new THREE.Vector3(),TV2=new THREE.Vector3(),TV3=new THREE.Vector3(),TV4=new THREE.Vector3(),TV5=new THREE.Vector3(),TV6=new THREE.Vector3(),TQ1=new THREE.Vector3(),TQ2=new THREE.Vector3(),TQ3=new THREE.Vector3(),FL=new THREE.Vector3();
// cinematic side tracking shot: the camera rides alongside the astronaut at his own speed and
// looks slightly past him, so his profile stays framed with the planet ahead in the background
function flightCam(pos,dir,side,t,dt,dist,fov,shake){
 cam.fov+=(fov-cam.fov)*Math.min(1,dt*2.5);cam.updateProjectionMatrix();
 const hh=Math.atan(Math.tan(38*Math.PI/180)*cam.aspect),sr=Math.tan(Math.min(hh*1.17,1.13)),n=Math.sqrt(1+sr*sr);
 CV.copy(pos).addScaledVector(side,dist*sr/n).addScaledVector(dir,-dist/n).addScaledVector(up,dist*.26);
 if(shake>0){CV.addScaledVector(up,Math.sin(t*2.1)*.06*shake).addScaledVector(dir,Math.sin(t*1.3)*.05*shake)}
 const k=Math.min(1,1-Math.exp(-8*dt));
 cam.position.lerp(CV,k);
 FL.copy(pos).sub(cam.position).normalize().addScaledVector(dir,.34).normalize();
 camLook.lerp(CL.copy(cam.position).addScaledVector(FL,14),k);cam.lookAt(camLook);
}
function travel(t,dt){
 const p=planets[sel],P=p.grp.position,r=p.d.r;
 tmp.position.copy(A0);tmp.lookAt(P);faceQ.copy(tmp.quaternion);
 const dir=TV1.copy(P).sub(A0).normalize();
 const side=TV2.crossVectors(dir,up).normalize();
 const upv=TV3.crossVectors(side,dir).normalize();
 const E=TV4.copy(P).addScaledVector(dir,-(r*2.2+.9));  // arrival point in front of the planet
 const LP=TV5.copy(P).addScaledVector(dir,-(r+.55));    // touch-down point
 const S0=TV6.copy(A0).addScaledVector(dir,-.4);        // slight pull-back before launch
 const span=Math.max(2,S0.distanceTo(E));
 const bulge=Math.min(3.2,Math.max(1.7,span*.5));
 if(!cruiseDur)cruiseDur=Math.max(2,Math.min(4.3,(span+bulge*1.5)/2.6)); // short hops stay cinematic, long ones don't drag
 const ctrl=TQ3.copy(S0).addScaledVector(dir,span*.5).addScaledVector(side,bulge).addScaledVector(upv,bulge*.55);
 const bez=u=>{const m=1-u;return TQ1.set(0,0,0).addScaledVector(S0,m*m).addScaledVector(ctrl,2*m*u).addScaledVector(E,u*u)};
 let a=t;
 if(a<LOCK){ // 1 · lock on: he turns toward the planet while the camera slides in behind him
  const u=smo(cl(a/LOCK));fade=Math.min(1,u*1.7);flight=.12*u;
  msg('Locking on to '+p.d.n+'…');
  A.position.copy(A0);A.quaternion.slerpQuaternions(homeQ,faceQ,u);
  flameBase=.4+u*.4;flame.visible=u>.6;
  flightCam(A0,dir,side,t,dt,6.2,58+u*8,.12);
  streaksTick(A0,dir,side,upv,.06*u,dt);
  return;
 }
 a-=LOCK;A.quaternion.copy(faceQ);fade=1;
 if(a<IGN){ // 2 · ignition
  const u=smo(cl(a/IGN));flight=.25+u*.35;
  msg('Engines on! 🔥');
  A.position.lerpVectors(A0,S0,u);
  flame.visible=true;flameBase=.9+u*.6;
  flightCam(A.position,dir,side,t,dt,5.6,68+u*4,.3);
  streaksTick(A.position,dir,side,upv,.1+u*.16,dt);
  return;
 }
 a-=IGN;
 if(a<cruiseDur){ // 3 · cruise: he physically flies the curved path toward the planet
  const u=ease(cl(a/cruiseDur));flight=1;
  msg(u<.6?'Warp speed! ✨':'Almost there…');
  A.position.copy(bez(u));flame.visible=true;
  flightCam(A.position,dir,side,t,dt,5.4,76+Math.sin(u*Math.PI)*8,.9);
  streaksTick(A.position,dir,side,upv,1,dt);
  return;
 }
 a-=cruiseDur;
 if(a<ARR){

  // Play suction sound only once
  if (!suctionPlayed) {
    suctionPlayed = true;
    playSuckSound();
  }

  // 4 · arrival: decelerate onto the planet
  const u=ease(cl(a/ARR));
  flight=.6*(1-u);
  msg('Touchdown on '+p.d.n+'! 🌍');
  A.position.lerpVectors(E,LP,u);
  A.scale.setScalar(1.25*(1-.65*u));
  flame.visible=u<.8;
  flameBase=1-u*.5;
  flightCam(A.position,dir,side,t,dt,5.4-u*1.5,76-u*18,.25);
  streaksTick(A.position,dir,side,upv,.5*(1-u),dt);
  return;
}
 // 5 · he has reached the planet — hand over to the landing screen
 A.position.copy(LP);A.scale.setScalar(1.25*.35);flame.visible=false;flight=0;
 flightCam(A.position,dir,side,t,dt,3.9,58,0);
 cam.fov=58;cam.updateProjectionMatrix();streaks.material.opacity=0;streaks.visible=false;
 if(state!=='landed'){state='landed';hud.style.opacity=0;startSurface(sel)}
}
function loop(ms){tn=ms/1000;raf=requestAnimationFrame(loop);const t=tn;const dt=Math.min(.05,Math.max(.001,tn-lastT));lastT=tn;
 stars.rotation.y=t*.003;
 rocks.forEach(m=>{const u=m.userData;u.a+=u.s*.01;m.position.set(Math.cos(u.a)*u.rad,u.y+Math.sin(t*.3+u.a)*.3,Math.sin(u.a)*u.rad-4);m.rotation.x+=u.sp.x*.01;m.rotation.y+=u.sp.y*.01});
 planets.forEach((p,i)=>{p.mesh.rotation.y+=.0025*(1+(i===3?2:0));p.grp.position.set(p.base.x,p.base.y+Math.sin(t*.5+p.ph)*.25,p.base.z);
  p.hov+=((i===hover?1:0)-p.hov)*.12;const s=1+p.hov*.15+(i===sel?fade*.07:0);p.mesh.scale.setScalar(s);
  const dim=state!=='home'&&state!=='ret'?(i===sel?0:fade*.85):0;
  p.glow.material.opacity=(.3+p.hov*.7)*(1-dim)+(i===sel?Math.sin(t*6)*.1*fade:0);p.glow.scale.setScalar(p.d.r*(4+p.hov*1.4+(i===sel?fade*1.2:0)));p.mat.opacity=1-dim;p.atm.material.opacity=.12*(1-dim)+p.hov*.15;if(p.ring)p.ring.material.opacity=.65*(1-dim)});
 // astronaut life
 // idle float blended with a zero-gravity flight pose
 const fly=state==='travel'?Math.min(1,flight):0,idl=1-fly;
 body.position.y=Math.sin(t*1.1)*.09*idl+Math.sin(t*3.1)*.05*fly;
 body.rotation.x=Math.sin(t*.55)*.06*idl+(.44+Math.sin(t*2.2)*.07)*fly;
 body.rotation.z=Math.sin(t*.7)*.08*idl+Math.sin(t*1.7)*.14*fly;
 body.rotation.y=Math.sin(t*1.15)*.07*fly;
 head.rotation.y=(Math.sin(t*.45)*.55+(state==='home'?mouse.x*.5:0))*idl+Math.sin(t*1.25)*.14*fly;
 head.rotation.x=(Math.sin(t*.8)*.08+(state==='home'?mouse.y*.25:0))*idl+(-.36+Math.sin(t*2.3)*.07)*fly;
 armL.rotation.set(Math.sin(t*1.3)*.25*idl+(-.3+Math.sin(t*3.1)*.22)*fly,0,(-.35+Math.sin(t*.9)*.15)*idl+(-1.05+Math.sin(t*2.1)*.13)*fly);
 armR.rotation.set(Math.sin(t*1.3+2)*.25*idl+(-.3+Math.sin(t*3.1+2.3)*.22)*fly,0,(.35-Math.sin(t*.9+1)*.15)*idl+(1.05+Math.sin(t*2.4)*.13)*fly);
 legL.rotation.set(Math.sin(t*1.1)*.3*idl+(.42+Math.sin(t*2.9)*.3)*fly,0,-.08-.07*fly);
 legR.rotation.set(Math.sin(t*1.1+3)*.3*idl+(.42+Math.sin(t*2.9+2.6)*.3)*fly,0,.08+.07*fly);
 if(flame.visible){const k=1+Math.sin(t*40)*.2;flame.scale.set(flameBase*k,flameBase*k,flameBase*(1+Math.sin(t*55)*.3))}
 if(state==='home'){A.position.copy(A0);A.rotation.y=Math.sin(t*.3)*.35;A.rotation.x=0;cam.position.set(H.x+mouse.x*-.6,H.y+mouse.y*.4,H.z);cam.lookAt(0,0,0)}
 else if(state==='travel'||state==='landed')travel(t-t0,dt);else if(state==='surface'||state==='descend')surfaceTick(dt);
 else if(state==='ret'){const u=ease(cl((t-t0)/2));fade=1-u;streaks.visible=false;cam.fov=55;cam.updateProjectionMatrix();cam.position.lerpVectors(retFrom.c,H,u);A.position.lerpVectors(retFrom.p,A0,u);A.scale.setScalar(retFrom.s+(1.25-retFrom.s)*u);A.quaternion.slerpQuaternions(retFrom.q,new THREE.Quaternion(),u);flame.visible=false;cam.lookAt(V.set(0,0,0).lerp(A.position,1-u));
  if(u>=1){state='home';$('picker').style.display='flex';sel=-1;fade=0}}
 R.render(S,cam)}
var lastT=0;const TOUCH=matchMedia('(pointer:coarse)').matches;const W=new THREE.Group(),SK=new THREE.Group(),SD=new THREE.Vector3(.5,.4,.6);W.visible=SK.visible=false;S.add(W,SK);A.traverse(o=>{if(o.isMesh)o.castShadow=true});glass.castShadow=f1.castShadow=f2.castShadow=false;const skyM=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new THREE.Color()},bot:{value:new THREE.Color()}},vertexShader:'varying float h;void main(){h=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 top;uniform vec3 bot;varying float h;void main(){gl_FragColor=vec4(mix(bot,top,pow(clamp(h,0.,1.),.5)),1.);}'});const sky=new THREE.Mesh(new THREE.SphereGeometry(450,24,16),skyM);sky.renderOrder=-1;sky.frustumCulled=false;SK.add(sky);const spr=c=>new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(c),blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false}));const sunS=spr('rgba(255,240,200,.9)'),earthS=spr('rgba(90,160,255,.95)');earthS.position.set(-120,150,-330);earthS.scale.setScalar(26);const ringM=new THREE.Mesh(new THREE.RingGeometry(150,300,96),new THREE.MeshBasicMaterial({color:0xe8d8a0,transparent:true,opacity:.5,side:THREE.DoubleSide,fog:false,depthWrite:false}));ringM.rotation.x=Math.PI/2-.5;SK.add(sunS,earthS,ringM);const DN=300,dg=new THREE.BufferGeometry(),dp=new Float32Array(DN*3);for(let k=0;k<DN*3;k++)dp[k]=rnd(-14,14);dg.setAttribute('position',new THREE.BufferAttribute(dp,3));const dust=new THREE.Points(dg,new THREE.PointsMaterial({size:.07,transparent:true,opacity:.4,depthWrite:false}));dust.frustumCulled=false;dust.visible=false;S.add(dust);const CF={Moon:{top:0x000000,bot:0x04050a,fog:[0x000000,.0008],sun:[0xffffff,3.1,[.62,.3,.5]],amb:[0x2b3242,.3],sunCol:'rgba(255,255,240,.95)',sunS:38,stars:1,g:3.2,amp:1.2,f:.035,c:[0x63646b,0xc2c3c9],rock:[0x8b8b92,150,.3,3.2,'rock'],cr:96,crmin:2.4,crmax:15,crfar:145,crd:.24,cr2:1,curve:.00025,rim:0,res:280,pseg:26,ph:[10,30],pr:[22,48],pd:[112,195],desc:11,peak:0x9a9aa1,earth:1,msg:'Welcome to the Moon! Gravity is weak here, so try a big jump! 🌙'},Mars:{top:0x8a5238,bot:0xe2a577,fog:[0xd89a70,.007],sun:[0xffe0c0,2.2,[.45,.35,.65]],amb:[0xb56a4a,.6],sunCol:'rgba(255,220,170,.8)',sunS:30,g:6,amp:2.6,f:.03,dune:1.3,c:[0x8a3a1e,0xc4673a],rock:[0x6b3624,90,.4,3,'rock'],peak:0x7a3a24,msg:'Welcome to Mars, the red planet! 🔴'},Earth:{top:0x3a86dc,bot:0xcde6ff,fog:[0xbfdcf5,.006],sun:[0xfff4e0,2.6,[.5,.5,.6]],amb:[0x90b4e8,.75],sunCol:'rgba(255,250,220,.9)',sunS:60,g:12,amp:2.4,f:.03,c:[0x2e7d33,0x7bbd4c],rock:[0x7b766e,30,.4,2,'rock'],trees:70,peak:0x5b7a5a,msg:'Welcome home to Earth! 🌍'},Jupiter:{top:0x7b4a2c,bot:0xf2c994,fog:[0xe6b886,.008],sun:[0xffe6c8,2.2,[.4,.5,.6]],amb:[0xd89a66,.75],sunCol:'rgba(255,230,190,.8)',sunS:35,g:16,amp:1.2,f:.02,band:1,c:[0xd8a064,0xf6ddb4],rock:[0xf6eadb,60,1,3,'puff'],peak:0xf0dcc0,puffPeak:1,msg:'Jupiter has no solid ground, so you landed on a floating cloud deck! ☁️'},Saturn:{top:0x2f2a58,bot:0xe9dcae,fog:[0xcfc19c,.007],sun:[0xf4efe0,2,[.5,.4,.6]],amb:[0xaab0d4,.65],sunCol:'rgba(255,245,215,.8)',sunS:28,stars:1,g:10,amp:1.8,f:.025,c:[0xc9b886,0xf2ead0],rock:[0xcfeaff,70,.5,3,'ice'],peak:0xdfeeff,ring:1,msg:'Saturn is a gas giant too, so you landed on an icy cloud-top! ❄️'}};let SEED=0,OBS=[],CFG=CF.Moon,CR=[];const hs=(x,z)=>{const n=Math.sin(x*127.1+z*311.7+SEED)*43758.5453;return n-Math.floor(n)};const vn=(x,z)=>{const xi=Math.floor(x),zi=Math.floor(z),u=x-xi,v=z-zi,a=u*u*(3-2*u),b=v*v*(3-2*v);return(hs(xi,zi)*(1-a)+hs(xi+1,zi)*a)*(1-b)+(hs(xi,zi+1)*(1-a)+hs(xi+1,zi+1)*a)*b};const fbm=(x,z)=>(vn(x,z)*.5+vn(x*2.1,z*2.1)*.25+vn(x*4.3,z*4.3)*.125+vn(x*8.7,z*8.7)*.0625)/.9375;const sm=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)};function hf(x,z){const C=CFG,d=Math.hypot(x,z),fl=sm((d-6)/16);let h=(fbm(x*C.f,z*C.f)-.45)*C.amp*2*fl;if(C.dune)h+=Math.sin((x*.6+z*.35)*.22+fbm(x*.02,z*.02)*5)*C.dune*fl;for(const c of CR){const dx=x-c.x,dz=z-c.z,q2=(dx*dx+dz*dz)/(c.r*c.r);if(C.cr2){if(q2>3.6)continue;const q=Math.sqrt(q2);let s;if(q<.7)s=-(1-.12*q*q);else if(q<1){const e=(q-.7)/.3;s=-.941+1.161*e*e*(3-2*e)}else s=.22*Math.exp(-Math.pow((q-1)*4.4,2));h+=c.d*s}else{const q=Math.sqrt(q2);if(q<1)h-=c.d*(1-q*q);else if(q<1.4)h+=c.d*.3*Math.exp(-Math.pow((q-1.08)*7,2))}}const m=Math.max(0,d-75);return h+m*m*(C.rim??.011)*(.4+fbm(x*.02,z*.02)*1.2)-(C.curve||0)*d*d}
function build(i){CFG=CF[PL[i].n];SEED=i*17.3+3;CR=[];OBS=[];while(W.children.length){const o=W.children[0];W.remove(o);o.geometry&&o.geometry.dispose&&o.geometry.dispose()}for(let k=0;k<(CFG.cr||0);k++){const r=rnd(CFG.crmin||4,CFG.crmax||13),a=rnd(0,6.283),dd=CFG.crfar?Math.random()*CFG.crfar+r+7:rnd(r+18,90);CR.push({x:Math.cos(a)*dd,z:Math.sin(a)*dd,r,d:r*(CFG.crd||.2)})}const RS=CFG.res||210,g=new THREE.PlaneGeometry(420,420,RS,RS);g.rotateX(-Math.PI/2);const pos=g.attributes.position,col=new Float32Array(pos.count*3),c0=new THREE.Color(CFG.c[0]),c1=new THREE.Color(CFG.c[1]),tc=new THREE.Color();for(let k=0;k<pos.count;k++){const x=pos.getX(k),z=pos.getZ(k),h=hf(x,z);pos.setY(k,h);const t=CFG.band?.5+.5*Math.sin(z*.1+fbm(x*.03,z*.03)*5):Math.min(1,Math.max(0,fbm(x*.12,z*.12)*1.4-.15+h*.04));let tn=1;if(CFG.cr2)for(const c of CR){const dx=x-c.x,dz=z-c.z,q2=(dx*dx+dz*dz)/(c.r*c.r);if(q2<1)tn-=.2*(1-q2);else if(q2<2.1)tn+=.14*(1-(Math.sqrt(q2)-1)/.45)}tc.lerpColors(c0,c1,t).multiplyScalar((.88+hs(x*3,z*3)*.24)*tn);col.set([tc.r,tc.g,tc.b],k*3)}g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();const ter=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));ter.receiveShadow=true;if(CFG.cr2)ter.castShadow=true;W.add(ter);const[pc,pn,smn,smx,kind]=CFG.rock,PM=new THREE.MeshStandardMaterial({color:pc,roughness:.95,flatShading:kind!=='puff'}),rg=[0,1,2].map(()=>{const q=new THREE.IcosahedronGeometry(1,1),v=q.attributes.position;for(let j=0;j<v.count;j++){const k=rnd(.75,1.2);v.setXYZ(j,v.getX(j)*k,v.getY(j)*k,v.getZ(j)*k)}q.computeVertexNormals();return q}),put=(m,x,z,r,dy=0)=>{m.position.set(x,hf(x,z)+dy,z);m.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true});W.add(m);OBS.push({x,z,r})};for(let k=0;k<pn;k++){const a=rnd(0,6.283),dd=7+Math.sqrt(Math.random())*58,x=Math.cos(a)*dd,z=Math.sin(a)*dd,s=Math.pow(Math.random(),2)*(smx-smn)+smn;let m;if(kind==='ice'){m=new THREE.Mesh(new THREE.ConeGeometry(.5,2.4,5),PM);m.scale.setScalar(s);m.rotation.set(rnd(-.2,.2),rnd(0,6),rnd(-.2,.2));put(m,x,z,.5*s,s*1.1)}else if(kind==='puff'){m=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),PM);m.scale.set(s*1.4,s*.8,s*1.4);put(m,x,z,s*1.3,s*.15)}else{m=new THREE.Mesh(rg[k%3],PM);m.scale.set(s*rnd(.8,1.2),s*rnd(.5,.9),s*rnd(.8,1.2));m.rotation.y=rnd(0,6);put(m,x,z,s*.9,s*.1)}}const tr=new THREE.MeshStandardMaterial({color:0x6b4a2a,roughness:1}),lf=new THREE.MeshStandardMaterial({color:0x2c7a38,roughness:.9,flatShading:true});for(let k=0;k<(CFG.trees||0);k++){const a=rnd(0,6.283),dd=8+Math.sqrt(Math.random())*58,s=rnd(1,2.2),tg=new THREE.Group();const t1=new THREE.Mesh(new THREE.CylinderGeometry(.12,.15,1.2,6),tr);t1.position.y=.6;const t2=new THREE.Mesh(new THREE.ConeGeometry(.9,1.6,8),lf);t2.position.y=1.8;const t3=new THREE.Mesh(new THREE.ConeGeometry(.65,1.3,8),lf);t3.position.y=2.6;tg.add(t1,t2,t3);tg.scale.setScalar(s);put(tg,Math.cos(a)*dd,Math.sin(a)*dd,.5*s)}const pm=new THREE.MeshStandardMaterial({color:CFG.peak,roughness:1,flatShading:true});const[ph0,ph1]=CFG.ph||[25,60],[pr0,pr1]=CFG.pr||[14,30],[pd0,pd1]=CFG.pd||[105,170];for(let k=0;k<22;k++){const a=k/22*6.283+rnd(-.1,.1),dd=rnd(pd0,pd1),h=rnd(ph0,ph1),r=rnd(pr0,pr1),x=Math.cos(a)*dd,z=Math.sin(a)*dd;let m;if(CFG.puffPeak){m=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),pm);m.scale.set(r*1.3,h*.5,r*1.3);m.position.set(x,hf(x,z),z)}else{m=new THREE.Mesh(new THREE.ConeGeometry(r,h,CFG.pseg||7),pm);m.position.set(x,hf(x,z)+h*.4,z)}W.add(m)}
 EX.setup(PL[i].n,OBS)}
function enterWorld(i){build(i);const C=CFG;planets.forEach(p=>p.grp.visible=false);rocks.forEach(m=>m.visible=false);streaks.visible=false;neb.forEach(n=>n.visible=false);W.visible=SK.visible=true;stars.visible=!!C.stars;skyM.uniforms.top.value.set(C.top).multiplyScalar(.85);skyM.uniforms.bot.value.set(C.bot).multiplyScalar(.82);S.fog=new THREE.FogExp2(new THREE.Color(C.fog[0]).multiplyScalar(.92),C.fog[1]*.9);amb.color.set(C.amb[0]);amb.intensity=C.amb[1]*.75;rim.intensity=0;sun.color.set(C.sun[0]);sun.intensity=C.sun[1]*.65;sun.castShadow=true;sun.shadow.normalBias=C.cr2?.12:.03;SD.set(...C.sun[2]).normalize();sunS.material.map=glowTex(C.sunCol);sunS.material.needsUpdate=true;sunS.scale.setScalar(C.sunS*5);sunS.position.copy(SD).multiplyScalar(400);earthS.visible=!!C.earth;ringM.visible=!!C.ring;dust.visible=i!==1;dust.material.color.set(C.bot);A.scale.setScalar(.4375);SF.yaw=.5;SF.pitch=.9;SF.heading=SF.yaw;SF.t=0;SF.vy=0;SF.vel.set(0,0,0);SF.g=C.g;SF.grounded=false;SF.fy=26;SF.dist=C.desc||3.7;A.position.set(0,26.39,0);A.rotation.set(0,SF.heading,0);flame.visible=true;flameBase=1;$('stick').style.display=$('jbtn').style.display=TOUCH?'block':'none';$('ctrl').style.display=TOUCH?'none':'block';placeCam(1,0);stars.position.copy(cam.position);SK.position.copy(cam.position)}
function leaveWorld(){EX.reset();W.visible=SK.visible=false;dust.visible=false;planets.forEach(p=>p.grp.visible=true);rocks.forEach(m=>m.visible=true);streaks.visible=false;neb.forEach(n=>n.visible=true);stars.visible=true;stars.position.set(0,0,0);S.fog=new THREE.FogExp2(0x070722,.004);amb.color.set(0x6670c0);amb.intensity=.55;rim.intensity=1.2;sun.color.set(0xfff2e0);sun.intensity=2.4;sun.position.set(10,6,9);sun.target.position.set(0,0,0);sun.castShadow=false;body.position.set(0,0,0);body.scale.set(1,1,1);body.rotation.set(0,0,0);$('stick').style.display=$('jbtn').style.display=$('ctrl').style.display='none';if(document.exitPointerLock)document.exitPointerLock()}
function startSurface(i){$('flash').style.background={Moon:'#dfe3ff',Mars:'#ffb48a',Earth:'#bfe0ff',Jupiter:'#ffd9a0',Saturn:'#fff1c4'}[PL[i].n];$('flash').style.opacity=1;setTimeout(()=>{if(state!=='landed')return;enterWorld(i);state='descend';$('flash').style.opacity=0},900)}
function exitSurface(){if(SF.exiting)return;SF.exiting=true;$('abort').style.display='none';$('flash').style.background='#fff';$('flash').style.opacity=1;setTimeout(()=>{leaveWorld();state='landed';travel(1e3,.016);retFrom={c:cam.position.clone(),p:A.position.clone(),q:A.quaternion.clone(),f:55,s:A.scale.x};state='ret';t0=tn;hud.style.opacity=0;SF.exiting=false;$('flash').style.opacity=0},900)}
const keys={},SF={yaw:0,pitch:.3,heading:0,vel:new THREE.Vector3(),vy:0,g:10,grounded:true,fy:0,t:0,landT:0,phase:0,jr:false,tj:{x:0,z:0},drag:null,dp:null,dist:3.7,exiting:false,s:{lL:0,lR:0,aL:0,aR:0,az:.3,lean:0}};
on(window,'keydown',e=>{if(window.ATHAR_CHALLENGE_OPEN)return;keys[e.code]=1;if(state==='surface'){if(/Space|Arrow/.test(e.code))e.preventDefault();if(e.code==='KeyE'&&!e.repeat)EX.toggle();if(e.code==='Escape')EX.close();if(e.code==='KeyK'&&!e.repeat)window.dispatchEvent(new CustomEvent('athar:challenge'));if(e.code==='KeyR'&&!e.repeat)window.dispatchEvent(new CustomEvent('athar:story'))}});on(window,'keyup',e=>{keys[e.code]=0});const look=(dx,dy)=>{SF.yaw-=dx*.0035;SF.pitch=Math.max(-.1,Math.min(1.25,SF.pitch+dy*.003))};R.domElement.addEventListener('pointerdown',e=>{if(state==='surface'){SF.drag={x:e.clientX,y:e.clientY};SF.dp={x:e.clientX,y:e.clientY}}});on(window,'pointerup',()=>SF.drag=null);on(window,'pointermove',e=>{if(state!=='surface')return;if(document.pointerLockElement)look(e.movementX,e.movementY);else if(SF.drag){look(e.clientX-SF.drag.x,e.clientY-SF.drag.y);SF.drag.x=e.clientX;SF.drag.y=e.clientY}});
R.domElement.addEventListener('wheel',e=>{if(state!=='surface'&&state!=='descend')return;e.preventDefault();SF.dist=Math.max(1.6,Math.min(10,SF.dist*Math.exp(e.deltaY*.0012)))},{passive:false});
R.domElement.addEventListener('click',e=>{if(state!=='surface'||EX.isOpen())return;const moved=SF.dp&&Math.hypot(e.clientX-SF.dp.x,e.clientY-SF.dp.y)>6;if(!moved&&EX.click(e))return;if(!TOUCH&&R.domElement.requestPointerLock){try{const p=R.domElement.requestPointerLock();p&&p.catch&&p.catch(()=>{})}catch(e){}}});const st=$('stick'),kn=st.firstElementChild,sp=e=>{const b=st.getBoundingClientRect(),x=(e.clientX-b.left-b.width/2)/(b.width/2),y=(e.clientY-b.top-b.height/2)/(b.height/2),l=Math.hypot(x,y),k=l>1?1/l:1;SF.tj.x=x*k;SF.tj.z=-y*k;kn.style.transform='translate('+x*k*35+'px,'+y*k*35+'px)'},rs=()=>{SF.tj.x=SF.tj.z=0;kn.style.transform=''};st.addEventListener('pointerdown',e=>{st.setPointerCapture(e.pointerId);sp(e)});st.addEventListener('pointermove',e=>{if(e.buttons)sp(e)});st.addEventListener('pointerup',rs);st.addEventListener('pointercancel',rs);$('jbtn').onpointerdown=()=>SF.jr=true;
$('ebtn').onpointerdown=e=>{e.preventDefault();EX.toggle()};
const EX=createExploration({THREE,$,W,cam,A,hf,TOUCH,glowTex,getState:()=>state});
const TV=new THREE.Vector3(),DV=new THREE.Vector3();function placeCam(snap,dt){const target=EX.cameraTarget();if(target){TV.set(target.x,target.y,target.z);DV.set(target.x+4,target.y+2.6,target.z+5);const gh=hf(DV.x,DV.z)+.45;if(DV.y<gh)DV.y=gh;cam.position.lerp(DV,1-Math.exp(-7*dt));cam.lookAt(TV);return}const p=A.position,cp=Math.cos(SF.pitch);TV.set(p.x,p.y+.28,p.z);DV.set(Math.sin(SF.yaw)*cp,Math.sin(SF.pitch),Math.cos(SF.yaw)*cp).multiplyScalar(SF.dist).add(TV);const gh=hf(DV.x,DV.z)+.45;if(DV.y<gh)DV.y=gh;if(snap)cam.position.copy(DV);else cam.position.lerp(DV,1-Math.exp(-12*dt));cam.lookAt(TV)}
function pose(sh,mode,t,dt){const w=Math.min(1,sh/1.2),r=Math.max(0,Math.min(1,(sh-3.6)/3.4)),T={};let sy=1,bob=0;if(mode==='fall'){T.lL=.2+Math.sin(t*3)*.12;T.lR=.1+Math.sin(t*3+1)*.12;T.aL=T.aR=-.3;T.az=.9;T.lean=.12}else if(mode==='air'){if(SF.vy>0){T.lL=-.6;T.lR=.1;T.aL=T.aR=-2.2;T.az=.45;T.lean=-.05}else{T.lL=.3;T.lR=.15;T.aL=T.aR=-.4;T.az=1.1;T.lean=.08}}else{SF.phase+=dt*sh*2;const sn=Math.sin(SF.phase),a=(.55+.6*r)*w;T.lL=sn*a;T.lR=-sn*a;T.aL=-sn*a*.85;T.aR=sn*a*.85;T.az=.3-.12*w;T.lean=.04+r*.28*w;sy=1+Math.sin(t*2)*.012*(1-w);bob=Math.abs(Math.sin(SF.phase))*.05*w;if(SF.landT>0){const k=Math.sin(SF.landT/.3*Math.PI);sy-=.15*k;T.lL=T.lR=-.5*k;T.az=.5}}const s=SF.s,c=1-Math.exp(-16*dt);for(const k in T)s[k]+=(T[k]-s[k])*c;legL.rotation.set(s.lL,0,-.08);legR.rotation.set(s.lR,0,.08);armL.rotation.set(s.aL,0,-s.az);armR.rotation.set(s.aR,0,s.az);body.rotation.set(s.lean,0,0);body.scale.y=sy;body.position.y=bob-.89*(1-sy);head.rotation.set(0,Math.sin(t*.5)*.25*(1-w),0)}
function surfaceTick(dt){const t=tn;sun.position.copy(A.position).addScaledVector(SD,40);sun.target.position.copy(A.position);if(state==='descend'){SF.t+=dt;const u=Math.min(1,SF.t/3.8);A.position.set(0,.39+26*Math.pow(1-u,1.6),0);SF.pitch=.9-.62*u;flame.visible=u<.94;pose(0,'fall',t,dt);if(u>=1){state='surface';SF.grounded=true;SF.fy=0;SF.landT=.3;SF.vy=0;SF.dist=3.7;flame.visible=false;hud.textContent='';msg(CFG.msg);setTimeout(()=>{if(state==='surface')hud.style.opacity=0},6000)}}else{const lk=EX.isOpen()||!!window.ATHAR_CHALLENGE_OPEN,ky=(a,b)=>!lk&&(keys[a]||keys[b])?1:0;let ix=ky('KeyD','ArrowRight')-ky('KeyA','ArrowLeft')+(lk?0:SF.tj.x),iz=ky('KeyW','ArrowUp')-ky('KeyS','ArrowDown')+(lk?0:SF.tj.z);const n=Math.hypot(ix,iz),il=Math.min(1,n);if(n>0){ix/=n;iz/=n}const sy=Math.sin(SF.yaw),cy=Math.cos(SF.yaw),dx=(-sy*iz+cy*ix)*il,dz=(-cy*iz-sy*ix)*il,run=!lk&&(keys.ShiftLeft||keys.ShiftRight||(TOUCH&&il>.85)),mv=run?8.5:4.2,k=1-Math.exp(-(SF.grounded?14:4)*dt);SF.vel.x+=(dx*mv-SF.vel.x)*k;SF.vel.z+=(dz*mv-SF.vel.z)*k;let nx=A.position.x+SF.vel.x*dt,nz=A.position.z+SF.vel.z*dt;for(let it=0;it<2;it++)for(const o of OBS){const ex=nx-o.x,ez=nz-o.z,m=o.r+.32,d2=ex*ex+ez*ez;if(d2<m*m&&d2>1e-6){const d=Math.sqrt(d2);nx=o.x+ex/d*m;nz=o.z+ez/d*m}}const rr=Math.hypot(nx,nz);if(rr>68){nx*=68/rr;nz*=68/rr}const sh=Math.hypot(nx-A.position.x,nz-A.position.z)/dt;if(il>.05){const df=Math.atan2(dx,dz)-SF.heading;SF.heading+=Math.atan2(Math.sin(df),Math.cos(df))*(1-Math.exp(-14*dt))}const gr=hf(nx,nz),want=!lk&&(keys.Space||SF.jr);SF.jr=false;if(SF.grounded){if(want){SF.vy=6.2;SF.grounded=false}else SF.fy+=(gr-SF.fy)*Math.min(1,dt*30)}if(!SF.grounded){SF.vy-=SF.g*dt;SF.fy+=SF.vy*dt;if(SF.fy<=gr&&SF.vy<=0){SF.fy=gr;SF.grounded=true;SF.landT=.3;SF.vy=0}}A.position.set(nx,SF.fy+.39,nz);A.rotation.set(0,SF.heading,0);SF.landT=Math.max(0,SF.landT-dt);pose(sh,SF.grounded?'walk':'air',t,dt)}placeCam(0,dt);SK.position.copy(cam.position);stars.position.copy(cam.position);EX.tick(dt,t,state==='surface');const ax=A.position.x,ay=A.position.y,az=A.position.z,wd=dt*.7;for(let k=0;k<DN;k++){const j=k*3;dp[j]=ax+((dp[j]+wd-ax+14)%28+28)%28-14;dp[j+1]=ay+((dp[j+1]-ay+2)%7+7)%7-2;dp[j+2]=az+((dp[j+2]-az+14)%28+28)%28-14}dg.attributes.position.needsUpdate=true}
on(window,'resize',()=>{R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();homePos()});
window.ATHAR_GAME={exitToSolar:()=>{const a=$('abort');if(a&&a.onclick)a.onclick()}};
raf=requestAnimationFrame(loop);
return ()=>{delete window.ATHAR_GAME;cancelAnimationFrame(raf);offs.forEach(f=>f());EX.reset();if(document.exitPointerLock)document.exitPointerLock();R.dispose();R.domElement.remove()};
}
}
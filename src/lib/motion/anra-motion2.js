// Ported verbatim from the Claude Design "NEYU Health" artifact (anra-motion2.js).
// Registers <anra-city>, <anra-converge>, <anra-electro>, <anra-funnel>, <anra-meteors>, <anra-typeph>.
// Client-only — loaded by src/components/MotionElements.tsx.
(function(){
if(window.__anraMotion2)return;window.__anraMotion2=1;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease=k=>1-Math.pow(1-Math.max(0,Math.min(1,k)),3);
class B extends HTMLElement{
  connectedCallback(){
    if(this._c)return;
    if(!this.style.display)this.style.display='block';
    if(!this.style.position)this.style.position='relative';
    if(!this.style.width)this.style.width='100%';
    if(!this.style.height)this.style.height='100%';
    const c=document.createElement('canvas');c.setAttribute('aria-hidden','true');
    c.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y';
    this.appendChild(c);this._c=c;this._ctx=c.getContext('2d');
    this._ro=new ResizeObserver(()=>this._size());this._ro.observe(this);
    this._vis=true;this._io=new IntersectionObserver(e=>{this._vis=e[e.length-1].isIntersecting;});this._io.observe(this);
    this._t0=performance.now();this.init&&this.init();this._size();
    const loop=t=>{this._raf=requestAnimationFrame(loop);if(!this._vis||!this._w)return;this.frame(RM?2.2:(t-this._t0)/1000);};
    this._raf=requestAnimationFrame(loop);
  }
  disconnectedCallback(){cancelAnimationFrame(this._raf);this._ro&&this._ro.disconnect();this._io&&this._io.disconnect();this._c&&this._c.remove();this._c=null;this.cleanup&&this.cleanup();}
  _size(){if(!this._c)return;const r=this.getBoundingClientRect();const d=Math.min(2,devicePixelRatio||1);this._w=r.width;this._h=r.height;this._c.width=Math.max(1,r.width*d);this._c.height=Math.max(1,r.height*d);this._ctx.setTransform(d,0,0,d,0,0);this.resized&&this.resized();}
  attr(n,d){const v=this.getAttribute(n);return v==null||v===''?d:v;}
}

/* Knowledge convergence: particles stream from each node into the core */
class Converge extends B{
  static get observedAttributes(){return['nodes','active'];}
  attributeChangedCallback(){this._parse();}
  init(){this._parse();this.ps=[];}
  _parse(){this.nodes=(this.getAttribute('nodes')||'').split(';').filter(Boolean).map(s=>s.split(',').map(Number));this.active=parseInt(this.getAttribute('active')||'-1',10);}
  frame(t){const g=this._ctx,W=this._w,H=this._h;g.clearRect(0,0,W,H);const cx=W/2,cy=H/2;if(!this.ps)this.ps=[];
    if(!RM)this.nodes.forEach((n,i)=>{const act=i===this.active;if(Math.random()<(act?.55:.14)&&this.ps.length<300){const sx=n[0]/100*W,sy=n[1]/100*H;const ang=Math.atan2(cy-sy,cx-sx)+Math.PI/2;const bend=(Math.random()-.5)*W*.2;
      this.ps.push({sx,sy,mx:(sx+cx)/2+Math.cos(ang)*bend,my:(sy+cy)/2+Math.sin(ang)*bend,t:0,sp:.005+Math.random()*.007,c:act?'42,132,228':(Math.random()<.55?'110,168,182':'42,132,228'),r:Math.random()*1.5+.7});}});
    for(let i=this.ps.length-1;i>=0;i--){const p=this.ps[i];p.t+=p.sp;if(p.t>=1){this.ps.splice(i,1);continue;}const u=p.t,iu=1-u;const x=iu*iu*p.sx+2*iu*u*p.mx+u*u*cx,y=iu*iu*p.sy+2*iu*u*p.my+u*u*cy;
      const a=Math.sin(u*Math.PI);g.fillStyle='rgba('+p.c+','+(a*.85)+')';g.beginPath();g.arc(x,y,p.r*(1-u*.35),0,7);g.fill();}
    const R=Math.min(W,H)*.175;for(let k=0;k<64;k++){const a=k/64*Math.PI*2+t*.22;const rr=R+Math.sin(t*1.8+k*.9)*3.5;g.fillStyle='rgba(110,168,182,'+(.22+.3*(.5+.5*Math.sin(t*2.6+k*.7)))+')';g.beginPath();g.arc(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,1.2,0,7);g.fill();}
    const R2=Math.min(W,H)*.485;g.strokeStyle='rgba(42,132,228,.28)';g.lineWidth=1;for(let k=0;k<120;k++){const a=k/120*Math.PI*2-t*.05;const l=k%10===0?7:3;g.beginPath();g.moveTo(cx+Math.cos(a)*R2,cy+Math.sin(a)*R2);g.lineTo(cx+Math.cos(a)*(R2-l),cy+Math.sin(a)*(R2-l));g.stroke();}
  }
}

/* Precision funnel: population narrowing to one person */
class Funnel extends B{
  static get observedAttributes(){return['stage'];}
  attributeChangedCallback(){this.stage=parseInt(this.getAttribute('stage')||'0',10);}
  init(){this.stage=parseInt(this.getAttribute('stage')||'0',10);this.d=Array.from({length:560},()=>({r:Math.random(),a:Math.random()*Math.PI*2,rad:Math.sqrt(Math.random()),ph:Math.random()*7}));}
  frame(t){const g=this._ctx,W=this._w,H=this._h;g.clearRect(0,0,W,H);const cx=W/2,cy=H/2,R=Math.min(W,H)*.46;const st=this.stage;const frac=[1,.42,.16,.05,0][st];
    const cols=['169,201,209','110,168,182','127,185,198','183,165,214','243,195,178'];
    this.d.forEach((p,i)=>{const you=i===0;const keep=you||p.r<frac;let tx,ty;
      if(you&&st>=4){tx=cx;ty=cy;}
      else if(keep){const rr=R*(.1+.9*Math.sqrt(frac||.001))*p.rad;tx=cx+Math.cos(p.a+t*.06)*rr;ty=cy+Math.sin(p.a+t*.06)*rr*.85;}
      else{const rr=R*(.95+.3*p.rad);tx=cx+Math.cos(p.a+t*.01)*rr;ty=cy+Math.sin(p.a+t*.01)*rr*.85;}
      if(p.x==null){p.x=tx;p.y=ty;}p.x+=(tx-p.x)*.045;p.y+=(ty-p.y)*.045;
      const tw=.55+.45*Math.sin(t*2+p.ph);
      if(you&&st>=4){for(let k=0;k<3;k++){const ph=((t*.5+k/3)%1);g.strokeStyle='rgba(243,195,178,'+(1-ph)*.7+')';g.lineWidth=1.5;g.beginPath();g.arc(p.x,p.y,8+ph*60,0,7);g.stroke();}
        g.fillStyle='#F3C3B2';g.beginPath();g.arc(p.x,p.y,8,0,7);g.fill();g.fillStyle='#F7F5F1';g.font="600 13px 'DM Sans', sans-serif";g.textAlign='center';g.fillText('You',p.x,p.y-18);return;}
      if(keep){g.fillStyle='rgba('+cols[st]+','+(.45+.5*tw)+')';g.beginPath();g.arc(p.x,p.y,st===0?1.5:2.1,0,7);g.fill();}
      else{g.fillStyle='rgba(120,130,135,'+(.12+.08*tw)+')';g.beginPath();g.arc(p.x,p.y,1.1,0,7);g.fill();}});
  }
}

/* Meteors */
class Meteors extends B{
  init(){this.m=[];this.s=Array.from({length:40},()=>({x:Math.random(),y:Math.random(),p:Math.random()*7}));}
  frame(t){const g=this._ctx,W=this._w,H=this._h;g.clearRect(0,0,W,H);const c=this.attr('color','247,245,241');const n=parseInt(this.attr('count','7'),10);
    this.s.forEach(s=>{g.fillStyle='rgba('+c+','+(.15+.25*(.5+.5*Math.sin(t*1.5+s.p)))+')';g.fillRect(s.x*W,s.y*H,1.2,1.2);});
    if(!RM&&this.m.length<n&&Math.random()<.05)this.m.push({x:Math.random()*W*1.3,y:-10-Math.random()*40,v:2.6+Math.random()*3.4,l:50+Math.random()*130});
    const ang=Math.PI*.72,ca=Math.cos(ang),sa=Math.sin(ang);
    for(let i=this.m.length-1;i>=0;i--){const m=this.m[i];m.x+=ca*m.v;m.y+=sa*m.v;if(m.y>H+60||m.x<-220){this.m.splice(i,1);continue;}
      const tx=m.x-ca*m.l,ty=m.y-sa*m.l;const gr=g.createLinearGradient(m.x,m.y,tx,ty);gr.addColorStop(0,'rgba('+c+',.95)');gr.addColorStop(1,'rgba('+c+',0)');g.strokeStyle=gr;g.lineWidth=1.4;g.beginPath();g.moveTo(m.x,m.y);g.lineTo(tx,ty);g.stroke();g.fillStyle='rgba('+c+',1)';g.beginPath();g.arc(m.x,m.y,1.5,0,7);g.fill();}
  }
}

/* Electro border */
class Electro extends B{
  resized(){const pad=6,W=this._w,H=this._h,w=W-2*pad,h=H-2*pad,r=Math.min(parseFloat(this.attr('radius','20')),w/2,h/2),x=pad,y=pad,P=[],step=5;
    const line=(x1,y1,x2,y2,nx,ny)=>{const n=Math.max(1,Math.round(Math.hypot(x2-x1,y2-y1)/step));for(let i=0;i<n;i++){const u=i/n;P.push([x1+(x2-x1)*u,y1+(y2-y1)*u,nx,ny]);}};
    const arc=(cx,cy,a0,a1)=>{const n=Math.max(2,Math.round(r*(a1-a0)/step));for(let i=0;i<n;i++){const a=a0+(a1-a0)*i/n;P.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r,Math.cos(a),Math.sin(a)]);}};
    line(x+r,y,x+w-r,y,0,-1);arc(x+w-r,y+r,-Math.PI/2,0);line(x+w,y+r,x+w,y+h-r,1,0);arc(x+w-r,y+h-r,0,Math.PI/2);line(x+w-r,y+h,x+r,y+h,0,1);arc(x+r,y+h-r,Math.PI/2,Math.PI);line(x,y+h-r,x,y+r,-1,0);arc(x+r,y+r,Math.PI,Math.PI*1.5);this.P=P;}
  frame(t){const g=this._ctx,W=this._w,H=this._h;g.clearRect(0,0,W,H);const P=this.P;if(!P)return;const dark=this.attr('tone','light')==='dark';const inten=parseFloat(this.attr('intensity','1'));
    let grad;if(g.createConicGradient){grad=g.createConicGradient(t*.9,W/2,H/2);grad.addColorStop(0,'rgba(110,168,182,1)');grad.addColorStop(.33,'rgba(42,132,228,1)');grad.addColorStop(.66,'rgba(243,169,147,.95)');grad.addColorStop(1,'rgba(110,168,182,1)');}else grad='rgba(42,132,228,1)';
    for(let pass=0;pass<2;pass++){g.beginPath();P.forEach((p,i)=>{const n=Math.sin(i*.33+t*8)*.7+Math.sin(i*.91-t*12.5)*.55+Math.sin(i*2.7+t*19)*.35*(Math.sin(t*3+i*.05)>.3?1.6:.6);const amp=(pass?.9:2.2)*inten;const x=p[0]+p[2]*n*amp,y=p[1]+p[3]*n*amp;i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();
      g.strokeStyle=pass?(dark?'rgba(253,252,250,.9)':'rgba(63,111,124,.75)'):grad;g.lineWidth=pass?.9:1.8;g.shadowColor='rgba(42,132,228,.8)';g.shadowBlur=pass?3:12;g.stroke();}
    g.shadowBlur=0;}
}

/* Typewriter placeholder */
class TypePh extends HTMLElement{
  connectedCallback(){if(this._on)return;this._on=1;this.style.pointerEvents='none';
    this.innerHTML='<span></span><span aria-hidden="true" style="display:inline-block;width:2px;height:1.05em;background:#2A84E4;margin-left:2px;vertical-align:-3px;animation:caret 1s steps(1) infinite"></span>';
    const sp=this.firstChild;const words=(this.getAttribute('words')||'').split('|');let wi=0,ci=0,dir=1,hold=0;
    if(RM){sp.textContent=words[0];return;}
    this._iv=setInterval(()=>{const w=words[wi%words.length];if(hold>0){hold--;return;}if(dir>0){ci++;if(ci>=w.length){dir=-1;hold=48;}}else{ci-=2;if(ci<=0){ci=0;dir=1;wi++;hold=8;}}sp.textContent=w.slice(0,ci);},38);}
  disconnectedCallback(){clearInterval(this._iv);this._on=0;}
}

/* Holographic 3D city map of Calgary */
const LAT0=51.03,LON0=-114.06,KX=111.32*Math.cos(LAT0*Math.PI/180),KZ=111;
const WP=(lat,lon)=>[(lon-LON0)*KX,(lat-LAT0)*KZ];
const ROADS={'Deerfoot Tr':[[51.17,-114.03],[51.12,-114.02],[51.08,-114.03],[51.055,-114.04],[51.02,-114.03],[50.98,-114.025],[50.94,-114.02],[50.89,-113.99]],
 'Glenmore Tr':[[50.985,-114.21],[50.985,-114.12],[50.982,-114.06],[50.98,-114.0],[50.975,-113.93]],
 '16 Ave N':[[51.067,-114.26],[51.067,-114.1],[51.067,-114.0],[51.068,-113.93]],
 'Crowchild Tr':[[51.13,-114.21],[51.09,-114.16],[51.065,-114.13],[51.03,-114.12],[50.99,-114.12]],
 'Macleod Tr':[[51.045,-114.063],[51.0,-114.068],[50.95,-114.07],[50.9,-114.075]],
 'Blackfoot Tr':[[51.03,-114.04],[51.0,-114.045],[50.975,-114.045],[50.95,-114.05]],
 '36 St NE':[[51.11,-113.985],[51.07,-113.985],[51.04,-113.985]],
 'Memorial Dr':[[51.055,-114.12],[51.052,-114.07],[51.05,-114.03],[51.048,-113.98]]};
const RIVER=[[51.09,-114.26],[51.095,-114.2],[51.075,-114.13],[51.056,-114.08],[51.052,-114.06],[51.045,-114.035],[51.03,-114.02],[51.0,-114.015],[50.96,-114.02],[50.92,-114.0],[50.88,-113.97]];
const CL={ne:{ll:[51.0784,-113.993],n:'North East Clinic',a:'201 – 3151 27 St NE'},mm:{ll:[50.975,-114.043],n:'Meadow Miles Clinic',a:'250 – 8500 Blackfoot Trail SE'}};
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
const BLD=Array.from({length:70},()=>{const [x,z]=WP(51.047,-114.066);return {x:x+(rnd()-.5)*2.4,z:z+(rnd()-.5)*1.2,h:.15+Math.pow(rnd(),2)*1.3};});
class City extends B{
  static get observedAttributes(){return['focus'];}
  attributeChangedCallback(){this.focus=this.getAttribute('focus')||'all';}
  init(){this.focus=this.attr('focus','all');this.cam={tx:0,tz:0,yaw:-.4,pitch:1.0,d:30};this.drag=0;this.hits=[];
    const c=this._c;let sx=0,sy=0,d0=0,moved=false;
    c.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;d0=this.drag;moved=false;this._down=true;c.style.cursor='grabbing';});
    addEventListener('pointermove',this._pm=e=>{if(!this._down)return;const dx=e.clientX-sx;if(Math.abs(dx)>4)moved=true;this.drag=d0+dx*.008;});
    addEventListener('pointerup',this._pu=e=>{if(!this._down)return;this._down=false;c.style.cursor='grab';if(moved)return;const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      const hit=this.hits.find(hh=>Math.hypot(hh.x-x,hh.y-y)<46);const k=hit?hit.k:'all';this.setAttribute('focus',k);this.dispatchEvent(new CustomEvent('anra-focus',{detail:k,bubbles:true,composed:true}));});
    c.style.cursor='grab';}
  cleanup(){removeEventListener('pointermove',this._pm);removeEventListener('pointerup',this._pu);}
  frame(t){const g=this._ctx,W=this._w,H=this._h;g.clearRect(0,0,W,H);
    const r=this.getBoundingClientRect(),vh=innerHeight;const prog=Math.max(0,Math.min(1,(vh-r.top)/(vh+r.height)));
    const f=this.focus;const tgt=f==='ne'||f==='mm'?WP(CL[f].ll[0],CL[f].ll[1]):[0,.5];
    const T={tx:tgt[0],tz:tgt[1],yaw:-.55+(prog-.5)*1.3+this.drag+(RM?0:Math.sin(t*.08)*.06),pitch:f==='all'?1.02:.9,d:f==='all'?(W<600?38:30)-prog*4:(W<600?17:13)};
    const C=this.cam;for(const k in T)C[k]+=(T[k]-C[k])*(RM?1:.05);
    const cy_=Math.cos(C.yaw),sy_=Math.sin(C.yaw),cp=Math.cos(C.pitch),sp=Math.sin(C.pitch),F=Math.min(W,H)*1.35,ox=W/2,oy=H*.56;
    const P=(x,y,z)=>{const px=x-C.tx,pz=z-C.tz;const xr=px*cy_-pz*sy_,zr=px*sy_+pz*cy_;const vy=y*cp+zr*sp,vz=-y*sp+zr*cp+C.d;if(vz<.6)return null;return [ox+xr*F/vz,oy-vy*F/vz,vz];};
    const poly=(pts,y)=>{g.beginPath();let st=false;pts.forEach(q=>{const p=P(q[0],y||0,q[1]);if(!p){st=false;return;}st?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);st=true;});};
    const bg=g.createRadialGradient(ox,oy,10,ox,oy,Math.max(W,H)*.8);bg.addColorStop(0,'#16252B');bg.addColorStop(1,'#0C1215');g.fillStyle=bg;g.fillRect(0,0,W,H);
    for(let gx=-22;gx<=22;gx+=2){for(let s=-22;s<22;s+=2){const a=P(gx,0,s),b=P(gx,0,s+2),c=P(s,0,gx),d=P(s+2,0,gx);if(a&&b){g.strokeStyle='rgba(110,168,182,'+Math.min(.14,2.2/a[2])+')';g.lineWidth=1;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();}if(c&&d){g.strokeStyle='rgba(110,168,182,'+Math.min(.14,2.2/c[2])+')';g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(d[0],d[1]);g.stroke();}}}
    const ring=[];for(let i=0;i<=72;i++){const a=i/72*Math.PI*2;ring.push([Math.cos(a)*13.5,Math.sin(a)*14.5]);}poly(ring);g.strokeStyle='rgba(42,132,228,.55)';g.lineWidth=1.4;g.stroke();
    poly(RIVER.map(q=>WP(q[0],q[1])));g.strokeStyle='rgba(84,150,196,.5)';g.lineWidth=4;g.stroke();
    g.font="500 11px 'DM Sans', sans-serif";
    Object.entries(ROADS).forEach(([n,pts],ri)=>{const w=pts.map(q=>WP(q[0],q[1]));poly(w);g.strokeStyle='rgba(110,168,182,.5)';g.lineWidth=1.5;g.setLineDash([]);g.stroke();
      if(!RM){poly(w);g.setLineDash([2,16]);g.lineDashOffset=-t*(22+ri*3);g.strokeStyle='rgba(215,235,240,.95)';g.lineWidth=1.8;g.stroke();g.setLineDash([]);}
      const m=w[Math.floor(w.length/2)],p=P(m[0],0,m[1]);if(p&&p[2]<C.d*1.6){g.fillStyle='rgba(169,201,209,.75)';g.textAlign='left';g.fillText(n,p[0]+6,p[1]-4);}});
    const rv=WP(51.0,-114.015),rp=P(rv[0],0,rv[1]);if(rp){g.fillStyle='rgba(120,175,210,.8)';g.fillText('Bow River',rp[0]+6,rp[1]);}
    BLD.map(b=>({b,p:P(b.x,0,b.z)})).filter(o=>o.p).sort((a,b)=>b.p[2]-a.p[2]).forEach(({b,p})=>{const top=P(b.x,b.h,b.z);if(!top)return;const gr=g.createLinearGradient(p[0],p[1],top[0],top[1]);gr.addColorStop(0,'rgba(110,168,182,.05)');gr.addColorStop(1,'rgba(169,201,209,.7)');g.strokeStyle=gr;g.lineWidth=Math.max(1.5,14/p[2]);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(top[0],top[1]);g.stroke();g.fillStyle='rgba(215,235,240,.9)';g.fillRect(top[0]-1,top[1]-1,2,2);});
    const dt=WP(51.047,-114.066),dp=P(dt[0],1.6,dt[1]);if(dp){g.fillStyle='rgba(215,235,240,.8)';g.textAlign='center';g.fillText('Downtown',dp[0],dp[1]-6);}
    const ap=WP(51.13,-114.01),app=P(ap[0],0,ap[1]);if(app){g.fillStyle='rgba(169,201,209,.6)';g.textAlign='left';g.fillText('YYC Airport',app[0]+6,app[1]);g.beginPath();g.arc(app[0],app[1],2,0,7);g.fill();}
    this.hits=[];
    Object.entries(CL).forEach(([k,c])=>{const [x,z]=WP(c.ll[0],c.ll[1]);const on=f===k;const base=P(x,0,z),top=P(x,on?3:2.2,z);if(!base||!top)return;this.hits.push({k,x:base[0],y:base[1]});
      for(let i=0;i<3;i++){const ph=((t*.45+i/3)%1);const rr=.2+ph*(on?2.2:1.3);const pts=[];for(let j=0;j<=36;j++){const a=j/36*Math.PI*2;pts.push([x+Math.cos(a)*rr,z+Math.sin(a)*rr]);}poly(pts);g.strokeStyle=(on?'rgba(243,169,147,':'rgba(110,168,182,')+(1-ph)*.8+')';g.lineWidth=1.4;g.stroke();}
      const gr=g.createLinearGradient(base[0],base[1],top[0],top[1]);gr.addColorStop(0,on?'rgba(243,169,147,.95)':'rgba(110,168,182,.9)');gr.addColorStop(1,'rgba(42,132,228,0)');g.strokeStyle=gr;g.lineWidth=on?4:3;g.beginPath();g.moveTo(base[0],base[1]);g.lineTo(top[0],top[1]);g.stroke();
      g.fillStyle=on?'#F3A993':'#6EA8B6';g.beginPath();g.arc(base[0],base[1],on?6:4.5,0,7);g.fill();
      g.font="600 13px 'DM Sans', sans-serif";const tw=Math.max(g.measureText(c.n).width,on?150:0)+22,bx=top[0]-tw/2,by=top[1]-(on?48:34);
      g.fillStyle='rgba(12,18,21,.86)';g.strokeStyle=on?'rgba(243,169,147,.8)':'rgba(110,168,182,.6)';g.lineWidth=1;g.beginPath();g.roundRect?g.roundRect(bx,by,tw,on?42:26,8):g.rect(bx,by,tw,on?42:26);g.fill();g.stroke();
      g.fillStyle='#F7F5F1';g.textAlign='center';g.fillText(c.n,top[0],by+17);if(on){g.font="400 11px 'DM Sans', sans-serif";g.fillStyle='rgba(215,235,240,.8)';g.fillText(c.a,top[0],by+33);}});
    g.textAlign='left';g.font="600 11px 'DM Sans', sans-serif";g.fillStyle='rgba(169,201,209,.9)';g.fillText('CALGARY · LIVE CARE MAP',16,24);
    const lat=LAT0+C.tz/KZ,lon=LON0+C.tx/KX;g.font="400 11px 'DM Sans', sans-serif";g.fillStyle='rgba(169,201,209,.7)';g.fillText(lat.toFixed(4)+'° N  '+Math.abs(lon).toFixed(4)+'° W',16,H-16);
    const kx=W-34,ky=34;g.strokeStyle='rgba(169,201,209,.5)';g.beginPath();g.arc(kx,ky,16,0,7);g.stroke();const na=-C.yaw-Math.PI/2;g.fillStyle='#F3A993';g.beginPath();g.moveTo(kx+Math.cos(na)*13,ky+Math.sin(na)*13);g.lineTo(kx+Math.cos(na+2.6)*6,ky+Math.sin(na+2.6)*6);g.lineTo(kx+Math.cos(na-2.6)*6,ky+Math.sin(na-2.6)*6);g.fill();g.fillStyle='rgba(215,235,240,.8)';g.textAlign='center';g.fillText('N',kx+Math.cos(na)*24,ky+Math.sin(na)*24+4);
  }
}

customElements.get('anra-converge')||customElements.define('anra-converge',Converge);
customElements.get('anra-funnel')||customElements.define('anra-funnel',Funnel);
customElements.get('anra-meteors')||customElements.define('anra-meteors',Meteors);
customElements.get('anra-electro')||customElements.define('anra-electro',Electro);
customElements.get('anra-typeph')||customElements.define('anra-typeph',TypePh);
customElements.get('anra-city')||customElements.define('anra-city',City);
})();

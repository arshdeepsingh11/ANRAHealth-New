// Ported verbatim from the Claude Design "NEYU Health" artifact (anra-motion.js).
// Registers <anra-chart>, <anra-dotmap>, <anra-morph>, <anra-particles> custom elements.
// Client-only — loaded by src/components/MotionElements.tsx.
(function(){
if(window.__anraMotion)return;window.__anraMotion=1;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease=k=>1-Math.pow(1-Math.max(0,Math.min(1,k)),3);
const FONT="500 11px 'DM Sans', system-ui, sans-serif";
class Base extends HTMLElement{
  connectedCallback(){
    if(this._c)return;
    if(!this.style.display)this.style.display='block';
    if(!this.style.position)this.style.position='relative';
    if(!this.style.width)this.style.width='100%';
    if(!this.style.height)this.style.height='100%';
    const c=document.createElement('canvas');c.setAttribute('aria-hidden','true');
    c.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';
    this.appendChild(c);this._c=c;this._ctx=c.getContext('2d');
    this._ro=new ResizeObserver(()=>this._size());this._ro.observe(this);
    this._vis=true;this._io=new IntersectionObserver(e=>{this._vis=e[e.length-1].isIntersecting;});this._io.observe(this);
    this._t0=performance.now();this._pt=performance.now();
    this.init&&this.init();this._size();
    const loop=t=>{this._raf=requestAnimationFrame(loop);if(!this._vis||!this._w)return;this.frame(RM?2.2:(t-this._t0)/1000);};
    this._raf=requestAnimationFrame(loop);
  }
  disconnectedCallback(){cancelAnimationFrame(this._raf);this._ro&&this._ro.disconnect();this._io&&this._io.disconnect();this._c&&this._c.remove();this._c=null;this.cleanup&&this.cleanup();}
  _size(){if(!this._c)return;const r=this.getBoundingClientRect();const d=Math.min(2,devicePixelRatio||1);this._w=r.width;this._h=r.height;this._c.width=Math.max(1,r.width*d);this._c.height=Math.max(1,r.height*d);this._ctx.setTransform(d,0,0,d,0,0);this.resized&&this.resized();}
  attr(n,d){const v=this.getAttribute(n);return v==null||v===''?d:v;}
}

/* ---------- particles ---------- */
class Particles extends Base{
  init(){this._m={x:-9999,y:-9999};this._pm=e=>{const r=this.getBoundingClientRect();this._m={x:e.clientX-r.left,y:e.clientY-r.top};};addEventListener('pointermove',this._pm,{passive:true});}
  cleanup(){removeEventListener('pointermove',this._pm);}
  resized(){const n=Math.min(170,Math.round(this._w*this._h/parseFloat(this.attr('density','9000'))));
    this.p=Array.from({length:n},()=>({x:Math.random()*this._w,y:Math.random()*this._h,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,r:Math.random()*1.5+.4,c:Math.random()<.55?'110,168,182':(Math.random()<.8?'140,111,184':'243,160,130')}));}
  frame(){const g=this._ctx,W=this._w,H=this._h,m=this._m,dark=this.attr('tone','light')==='dark';g.clearRect(0,0,W,H);
    for(const p of this.p){if(!RM){p.x+=p.vx;p.y+=p.vy;}const dx=p.x-m.x,dy=p.y-m.y,d=dx*dx+dy*dy;if(d<12000){const f=(1-d/12000)*.9,l=Math.sqrt(d)+1;p.x+=dx/l*f;p.y+=dy/l*f;}
      if(p.x<-5)p.x=W+5;if(p.x>W+5)p.x=-5;if(p.y<-5)p.y=H+5;if(p.y>H+5)p.y=-5;
      g.fillStyle='rgba('+p.c+','+(dark?.8:.55)+')';g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill();}
    if(this.attr('links','1')==='1'){g.lineWidth=.6;const P=this.p;for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],dx=a.x-b.x,dy=a.y-b.y,d=dx*dx+dy*dy;if(d<8000){g.strokeStyle='rgba(110,168,182,'+((dark?.35:.2)*(1-d/8000))+')';g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();}}}
  }
}

/* ---------- charts ---------- */
const beat=ph=>{ph=((ph%1)+1)%1;const G=(c,w,a)=>a*Math.exp(-Math.pow((ph-c)/w,2));return G(.12,.035,.12)+G(.27,.008,-.12)+G(.3,.012,1)+G(.325,.01,-.28)+G(.52,.05,.26);};
const pulse=ph=>{ph=((ph%1)+1)%1;const G=(c,w,a)=>a*Math.exp(-Math.pow((ph-c)/w,2));return G(.14,.05,1)+G(.34,.06,.42)+Math.max(0,.3-ph*.35);};
const noise=(x,s)=>Math.sin(x*1.7+s)*.5+Math.sin(x*3.1+s*1.3)*.3+Math.sin(x*5.3+s*.7)*.2;
class Chart extends Base{
  static get observedAttributes(){return['mode','param','color'];}
  attributeChangedCallback(n,o,v){if(o!==v){this._prev=this._cur;this._pt=performance.now();}}
  frame(t){const g=this._ctx,W=this._w,H=this._h;g.clearRect(0,0,W,H);const mode=this.attr('mode','ecg');const col=this.attr('color','#3F6F7C');const p=parseFloat(this.attr('param','50'));const k=RM?1:ease((performance.now()-this._pt)/800);g.font=FONT;g.lineJoin='round';g.lineCap='round';(this[mode]||this.signal).call(this,g,W,H,t,col,p,k);}
  grid(g,W,H,n){g.strokeStyle='rgba(20,24,27,.06)';g.lineWidth=1;for(let i=1;i<n;i++){const y=Math.round(H*i/n)+.5;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}}
  label(g,txt,x,y,c,al){g.fillStyle=c||'#5A626A';g.textAlign=al||'left';g.fillText(txt,x,y);}
  trace(g,W,H,t,fn,speed,beats,col,amp,base){this.grid(g,W,H,4);const head=((t*speed)%1)*W;g.lineWidth=2;
    for(let x=0;x<W;x+=2){const gap=(head-x+W)%W;const a=Math.max(0,1-gap/(W*.92));if(gap<10)continue;const y1=base-fn((x/W)*beats)*amp,y2=base-fn(((x+2)/W)*beats)*amp;g.strokeStyle=col;g.globalAlpha=a;g.beginPath();g.moveTo(x,y1);g.lineTo(x+2,y2);g.stroke();}
    g.globalAlpha=1;const hy=base-fn((head/W)*beats)*amp;g.fillStyle=col;g.beginPath();g.arc(head,hy,3.5,0,7);g.fill();g.globalAlpha=.25;g.beginPath();g.arc(head,hy,9,0,7);g.fill();g.globalAlpha=1;}
  ecg(g,W,H,t,col){this.trace(g,W,H,t,beat,.22,Math.max(3,Math.round(W/110)),col,H*.52,H*.72);this.label(g,'ECG · illustrative',8,16);}
  flow(g,W,H,t,col){this.trace(g,W,H,t,pulse,.2,Math.max(3,Math.round(W/120)),col,H*.5,H*.82);this.label(g,'Arterial pulse waveform',8,16);}
  resp(g,W,H,t,col){this.grid(g,W,H,4);const f=x=>Math.sin(x*Math.PI*2*2.2-t*1.3)*.8+Math.sin(x*Math.PI*2*4.4-t*2.6)*.12;const base=H*.55,amp=H*.3;
    const gr=g.createLinearGradient(0,base-amp,0,H);gr.addColorStop(0,col+'33');gr.addColorStop(1,col+'00');g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=3)g.lineTo(x,base-f(x/W)*amp);g.lineTo(W,H);g.fillStyle=gr;g.fill();
    g.beginPath();for(let x=0;x<=W;x+=3){const y=base-f(x/W)*amp;x?g.lineTo(x,y):g.moveTo(x,y);}g.strokeStyle=col;g.lineWidth=2;g.stroke();this.label(g,'Airflow · inhale / exhale',8,16);}
  glucose(g,W,H,t,col,p,k){this.grid(g,W,H,4);const lo=H*.62,hi=H*.32;g.fillStyle='rgba(110,168,182,.12)';g.fillRect(0,hi,W,lo-hi);
    const G=(x,c,w,a)=>a*Math.exp(-Math.pow((x-c)/w,2));const f=x=>.35+G(x,.22,.05,.38)+G(x,.52,.06,.46)+G(x,.8,.06,.4)+Math.sin(x*40+t)*.008;
    const y=x=>H*.9-f(x)*H*.72;const end=Math.min(1,(t*.12)%1.15);g.beginPath();for(let x=0;x<=W*end;x+=2){const yy=y(x/W);x?g.lineTo(x,yy):g.moveTo(x,yy);}g.strokeStyle=col;g.lineWidth=2;g.stroke();
    const cx=W*end;if(end<1){g.fillStyle=col;g.beginPath();g.arc(cx,y(end),4,0,7);g.fill();}
    ['Breakfast','Lunch','Dinner'].forEach((m,i)=>{const x=[.22,.52,.8][i]*W;this.label(g,m,x,H-6,'#8A9197','center');});this.label(g,'Glucose across a day · target band',8,16);}
  bp(g,W,H,t,col){this.grid(g,W,H,4);const n=14,y=v=>H-12-(v-60)/(160-60)*(H-34);g.fillStyle='rgba(110,168,182,.12)';g.fillRect(0,y(130),W,y(80)-y(130));
    for(let i=0;i<n;i++){const x=16+i*(W-32)/(n-1);const s=124+Math.sin(i*1.3)*8+Math.cos(i*.7)*5+(i===n-1?Math.sin(t*2)*2:0),d=79+Math.sin(i*1.1+1)*5;
      const vis=Math.min(1,Math.max(0,(t*3-i*.25)));g.globalAlpha=RM?1:Math.max(.15,vis);g.strokeStyle='rgba(63,111,124,.35)';g.lineWidth=2;g.beginPath();g.moveTo(x,y(s));g.lineTo(x,y(d));g.stroke();
      g.fillStyle=col;g.beginPath();g.arc(x,y(s),i===n-1?5:3.5,0,7);g.fill();g.fillStyle='#8C6FB8';g.beginPath();g.arc(x,y(d),3.5,0,7);g.fill();}
    g.globalAlpha=1;this.label(g,'Home blood pressure · 14 days',8,16);this.label(g,'systolic ●  diastolic ●',W-8,16,'#8A9197','right');}
  ldl(g,W,H,t,col,p,k){this.grid(g,W,H,5);const v=p/10;if(this._cur==null)this._cur=v;const prev=this._prev==null?v:this._prev;const cur=prev+(v-prev)*k;this._cur=cur;
    const y=val=>H-18-(val-1)/(6.5-1)*(H-40);g.fillStyle='rgba(110,168,182,.13)';g.fillRect(0,y(3.5),W,y(1)-y(3.5));g.setLineDash([4,4]);g.strokeStyle='rgba(63,111,124,.5)';g.beginPath();g.moveTo(0,y(3.5));g.lineTo(W,y(3.5));g.stroke();g.setLineDash([]);
    this.label(g,'Usual target 3.5',W-8,y(3.5)-6,'#2F5561','right');
    const pts=[cur+.5,cur+.2,cur+.35,cur+.1,cur].map((vv,i)=>({x:24+i*(W-60)/4,y:y(vv),v:vv}));g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));g.strokeStyle=col;g.lineWidth=2;g.stroke();
    pts.forEach((q,i)=>{g.fillStyle=i===4?(cur>3.5?'#B26A12':col):'#FDFCFA';g.strokeStyle=i===4?'transparent':col;g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,i===4?6+Math.sin(t*3)*1:3.5,0,7);g.fill();g.stroke();});
    const last=pts[4];g.font="600 13px 'DM Sans', sans-serif";this.label(g,cur.toFixed(1)+' mmol/L',last.x,last.y-14,'#14181B','center');g.font=FONT;
    ['2022','2023','2024','2025','Now'].forEach((l,i)=>this.label(g,l,pts[i].x,H-4,'#8A9197','center'));this.label(g,'LDL cholesterol · illustrative history',8,16);}
  activity(g,W,H,t,col,p,k){this.grid(g,W,H,4);const days='MTWTFSS'.split('');const w=[.12,.18,.1,.2,.14,.16,.1];if(this._cur==null)this._cur=p;const prev=this._prev==null?p:this._prev;const cur=prev+(p-prev)*k;this._cur=cur;
    const max=80,bw=(W-40)/7;const y=m=>H-20-(m/max)*(H-44);const tgt=150/7;
    days.forEach((d,i)=>{const m=cur*w[i];const x=20+i*bw+bw*.2;const hh=H-20-y(m);g.fillStyle=m>=tgt?col:'rgba(110,168,182,.45)';const r=4;g.beginPath();g.roundRect?g.roundRect(x,y(m),bw*.6,Math.max(2,hh),r):g.rect(x,y(m),bw*.6,hh);g.fill();this.label(g,d,x+bw*.3,H-5,'#8A9197','center');});
    g.setLineDash([4,4]);g.strokeStyle='rgba(140,111,184,.7)';g.beginPath();g.moveTo(0,y(tgt));g.lineTo(W,y(tgt));g.stroke();g.setLineDash([]);this.label(g,'150 min/week guideline',W-8,y(tgt)-6,'#6A5096','right');this.label(g,'Active minutes per day',8,16);}
  dna(g,W,H,t,col){const n=Math.round(W/14),cy=H/2,A=H*.32;for(let i=0;i<n;i++){const x=10+i*(W-20)/(n-1),ph=i*.42+t*1.1,s=Math.sin(ph),c=Math.cos(ph);const y1=cy+s*A,y2=cy-s*A;
      g.strokeStyle='rgba(140,111,184,'+(.12+.2*Math.abs(c))+')';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y1);g.lineTo(x,y2);g.stroke();
      const r1=2+1.8*(c+1)/2,r2=2+1.8*(1-c)/2;g.fillStyle=i%7===3?'#F3A993':'#6EA8B6';g.globalAlpha=.45+.55*(c+1)/2;g.beginPath();g.arc(x,y1,r1,0,7);g.fill();g.fillStyle='#8C6FB8';g.globalAlpha=.45+.55*(1-c)/2;g.beginPath();g.arc(x,y2,r2,0,7);g.fill();g.globalAlpha=1;}}
  hr(g,W,H,t,col){this.grid(g,W,H,4);const f=x=>x<.62?70+80*Math.pow(x/.62,1.3):150-60*(1-Math.exp(-(x-.62)*6));const y=v=>H-16-(v-50)/(170-50)*(H-36);
    g.fillStyle='rgba(243,195,178,.25)';g.fillRect(0,0,W*.62,H);this.label(g,'Exercise',8,H-6,'#7A3E2A');this.label(g,'Recovery',W*.64,H-6,'#2F5561');
    const end=(t*.1)%1.1,e=Math.min(1,end);g.beginPath();for(let x=0;x<=W*e;x+=2){const yy=y(f(x/W));x?g.lineTo(x,yy):g.moveTo(x,yy);}g.strokeStyle=col;g.lineWidth=2.2;g.stroke();
    const bx=W*e,bv=f(e);g.fillStyle=col;g.beginPath();g.arc(bx,y(bv),4.5,0,7);g.fill();g.font="600 13px 'DM Sans', sans-serif";this.label(g,Math.round(bv)+' bpm',Math.min(W-40,bx+8),y(bv)-8,'#14181B');g.font=FONT;this.label(g,'Heart rate during a stress echo',8,16);}
  echo(g,W,H,t,col){const cx=W/2,cy=6,R=H*.95,a0=Math.PI/2-.62,a1=Math.PI/2+.62;g.save();g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,R,a0,a1);g.closePath();g.fillStyle='#1C2226';g.fill();g.clip();
    const beatK=.5+.5*Math.sin(t*5.6);for(let i=0;i<260;i++){const a=a0+Math.random()*(a1-a0),r=Math.random()*R;g.fillStyle='rgba(169,201,209,'+(Math.random()*.35)+')';g.fillRect(cx+Math.cos(a)*r,cy+Math.sin(a)*r,1.6,1.6);}
    g.strokeStyle='rgba(207,226,231,.8)';g.lineWidth=3;g.beginPath();g.ellipse(cx-R*.12,cy+R*.55,R*(.13+.03*beatK),R*(.2+.04*beatK),.3,0,7);g.stroke();g.beginPath();g.ellipse(cx+R*.14,cy+R*.52,R*(.1+.025*beatK),R*(.15+.03*beatK),-.2,0,7);g.stroke();g.restore();this.label(g,'Echocardiogram view · illustrative',8,H-6);}
  trend(g,W,H,t,col){this.grid(g,W,H,4);const f=x=>.35+.4*x+Math.sin(x*9)*.04;const y=v=>H-16-v*(H-36);const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(110,168,182,.3)');gr.addColorStop(1,'rgba(110,168,182,0)');
    g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=3)g.lineTo(x,y(f(x/W)));g.lineTo(W,H);g.fillStyle=gr;g.fill();g.beginPath();for(let x=0;x<=W;x+=3){const yy=y(f(x/W));x?g.lineTo(x,yy):g.moveTo(x,yy);}g.strokeStyle=col;g.lineWidth=2;g.stroke();
    const e=(t*.08)%1;g.fillStyle='#8C6FB8';g.beginPath();g.arc(e*W,y(f(e)),4.5,0,7);g.fill();this.label(g,'Risk factors in range, over time',8,16);}
  bars(g,W,H,t,col){const rows=['ApoB','Lp(a)','hs-CRP','HbA1c','Vitamin D'],n=rows.length,rh=(H-20)/n;rows.forEach((r,i)=>{const y=14+i*rh+rh/2;this.label(g,r,0,y+4,'#3A4147');const x0=78,w=W-90;g.fillStyle='#EFECE6';g.fillRect(x0,y-3,w,6);g.fillStyle='rgba(110,168,182,.35)';g.fillRect(x0+w*.15,y-3,w*.45,6);
      const v=.2+.6*((Math.sin(i*2.1)+1)/2)+Math.sin(t*1.2+i)*.03;g.fillStyle=v>.6?'#B26A12':col;g.beginPath();g.arc(x0+w*v,y,5,0,7);g.fill();});}
  signal(g,W,H,t){this.grid(g,W,H,4);[['#6EA8B6',0,.5],['#8C6FB8',2,.62],['#3F6F7C',4,.38]].forEach(([c,s,b])=>{g.beginPath();for(let x=0;x<=W;x+=3){const yy=H*b+noise(x/W*6-t*.7,s)*H*.14;x?g.lineTo(x,yy):g.moveTo(x,yy);}g.strokeStyle=c;g.lineWidth=2;g.stroke();const ey=H*b+noise(6-t*.7,s)*H*.14;g.fillStyle=c;g.beginPath();g.arc(W-4,ey,3.5,0,7);g.fill();});this.label(g,'Connected signals',8,16);}
}

/* ---------- morphing text ---------- */
class Morph extends HTMLElement{
  connectedCallback(){if(this._on)return;this._on=1;const id='anraMorph'+Math.random().toString(36).slice(2,7);
    const grad=this.getAttribute('gradient')||'linear-gradient(90deg,#8C6FB8,#6EA8B6 55%,#3F6F7C)';
    const sp='grid-area:1/1;white-space:nowrap;background:'+grad+';-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;padding:0 .04em .12em';
    this.style.display='inline-block';
    this.innerHTML='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="'+id+'"><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140"/></filter></defs></svg><span aria-hidden="true" style="display:inline-grid;filter:url(#'+id+') blur(.4px)"><span style="'+sp+'"></span><span style="'+sp+'"></span></span>';
    const [a,b]=this.querySelectorAll('span > span');this.a=a;this.b=b;this.words=(this.getAttribute('words')||'you').split('|');this.setAttribute('aria-label',this.words.join(', '));this.i=0;
    a.textContent=this.words[0];b.textContent=this.words[1%this.words.length];
    if(RM){a.style.opacity=1;b.style.opacity=0;this._iv=setInterval(()=>{this.i++;a.textContent=this.words[this.i%this.words.length];},3200);return;}
    let last=performance.now(),cool=2.4,morph=0;const MT=1.1,CT=2.4;
    const set=f=>{b.style.filter='blur('+Math.min(8/f-8,100)+'px)';b.style.opacity=Math.pow(f,.4);const r=1-f;a.style.filter='blur('+Math.min(8/r-8,100)+'px)';a.style.opacity=Math.pow(r,.4);};
    const loop=now=>{this._raf=requestAnimationFrame(loop);const dt=(now-last)/1000;last=now;cool-=dt;
      if(cool<=0){morph+=dt;let f=morph/MT;if(f>=1){f=1;cool=CT;morph=0;this.i++;a.textContent=this.words[this.i%this.words.length];b.textContent=this.words[(this.i+1)%this.words.length];a.style.filter='none';a.style.opacity=1;b.style.opacity=0;b.style.filter='none';return;}set(f);}
      else{a.style.filter='none';a.style.opacity=1;b.style.filter='none';b.style.opacity=0;}};
    this._raf=requestAnimationFrame(loop);}
  disconnectedCallback(){cancelAnimationFrame(this._raf);clearInterval(this._iv);this._on=0;}
}

/* ---------- dotted map: Alberta + Calgary lens ---------- */
const AB=[[-120,60],[-110,60],[-110,49],[-114.06,49],[-114.7,49.55],[-114.7,50.1],[-115.4,50.6],[-116.3,51.4],[-117.2,52.1],[-118.3,52.85],[-119.3,53.3],[-120,53.8]];
const inPoly=(x,y,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const [xi,yi]=P[i],[xj,yj]=P[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;};
const YYC=[-114.066,51.047],CLIN={ne:{ll:[-113.99,51.08],n:'North East'},mm:{ll:[-114.04,50.975],n:'Meadow Miles'}};
class DotMap extends Base{
  static get observedAttributes(){return['focus'];}
  attributeChangedCallback(){this._pt=performance.now();}
  resized(){const W=this._w,H=this._h,wide=W>560;
    const mapW=wide?W*.44:W*.62,mapH=H-24;const lonS=mapW/10,latS=mapH/11;const s=Math.min(lonS/Math.cos(54.5*Math.PI/180)*Math.cos(54.5*Math.PI/180),latS);
    this.proj=(lon,lat)=>[16+(lon+120)*s*1.0*(mapW/(10*s))*1,12+(60-lat)*latS];
    const pts=[];const step=Math.max(6,Math.round(W/110));for(let x=16;x<16+mapW;x+=step)for(let y=12;y<12+mapH;y+=step){const lon=-120+(x-16)/mapW*10,lat=60-(y-12)/latS;if(inPoly(lon,lat,AB))pts.push([x,y]);}
    this.pts=pts;this.step=step;this.yyc=this.proj(YYC[0],YYC[1]);
    const lr=wide?Math.min(H*.42,W*.24):Math.min(W*.3,H*.3);this.lens={x:wide?W*.74:W*.76,y:wide?H*.5:H*.66,r:lr};
    const lp=[];const ls=Math.max(5,Math.round(lr/11));for(let x=-lr;x<=lr;x+=ls)for(let y=-lr;y<=lr;y+=ls){if(x*x+y*y<lr*lr*.94)lp.push([x,y]);}this.lpts=lp;this.ls=ls;
    this.lensP=(lon,lat)=>[this.lens.x+(lon-YYC[0])/.22*lr*Math.cos(51*Math.PI/180)*1.6,this.lens.y-(lat-YYC[1])/.16*lr*.8];}
  frame(t){const g=this._ctx,W=this._w,H=this._h;g.clearRect(0,0,W,H);const [cx,cy]=this.yyc;const focus=this.attr('focus','');
    for(const [x,y] of this.pts){const d=Math.hypot(x-cx,y-cy);const w=.5+.5*Math.sin(d/18-t*2.2);g.fillStyle='rgba(63,111,124,'+(.16+.3*w*Math.max(0,1-d/400))+')';g.beginPath();g.arc(x,y,this.step*.22,0,7);g.fill();}
    g.fillStyle='#8C6FB8';g.beginPath();g.arc(cx,cy,4,0,7);g.fill();for(let i=0;i<2;i++){const ph=((t*.6+i*.5)%1);g.strokeStyle='rgba(140,111,184,'+(1-ph)*.6+')';g.lineWidth=1.5;g.beginPath();g.arc(cx,cy,4+ph*26,0,7);g.stroke();}
    g.font=FONT;g.fillStyle='#14181B';g.fillText('Calgary',cx+10,cy+4);g.fillStyle='#8A9197';g.fillText('ALBERTA',20,this._h-14);
    const L=this.lens;g.strokeStyle='rgba(140,111,184,.35)';g.setLineDash([3,4]);g.lineWidth=1;g.beginPath();g.moveTo(cx,cy);g.lineTo(L.x-L.r*.98,L.y);g.stroke();g.setLineDash([]);
    g.fillStyle='rgba(253,252,250,.9)';g.beginPath();g.arc(L.x,L.y,L.r,0,7);g.fill();g.strokeStyle='rgba(110,168,182,.5)';g.stroke();
    for(const [x,y] of this.lpts){const w=.5+.5*Math.sin((x+y)/30+t*1.2);g.fillStyle='rgba(110,168,182,'+(.18+.22*w)+')';g.beginPath();g.arc(L.x+x,L.y+y,this.ls*.2,0,7);g.fill();}
    const [dx,dy]=this.lensP(YYC[0],YYC[1]);g.fillStyle='#8A9197';g.beginPath();g.arc(dx,dy,2.5,0,7);g.fill();g.fillText('Downtown',dx+6,dy+3);
    const k=ease((performance.now()-this._pt)/500);
    Object.entries(CLIN).forEach(([key,c])=>{const [x,y]=this.lensP(c.ll[0],c.ll[1]);const on=focus===key;const r=(on?7+2*k:5);
      for(let i=0;i<2;i++){const ph=((t*.7+i*.5+(key==='mm'?.25:0))%1);g.strokeStyle='rgba(63,111,124,'+(1-ph)*(on?.7:.4)+')';g.lineWidth=1.5;g.beginPath();g.arc(x,y,r+ph*(on?26:16),0,7);g.stroke();}
      g.fillStyle=on?'#3F6F7C':'#6EA8B6';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle='#14181B';g.font=(on?"600 ":"500 ")+"12px 'DM Sans', sans-serif";g.fillText(c.n,x+r+6,y+4);});
  }
}

customElements.get('anra-particles')||customElements.define('anra-particles',Particles);
customElements.get('anra-chart')||customElements.define('anra-chart',Chart);
customElements.get('anra-morph')||customElements.define('anra-morph',Morph);
customElements.get('anra-dotmap')||customElements.define('anra-dotmap',DotMap);
})();

'use strict';
/* ===== Ink grimoire seals: hand-inked, wobbly, sepia & dried blood; cached to bitmaps ===== */
const INK={bone:'#cbb48a',blood:'#7e2116',faded:'#8d7a5c'};
const SCH_INK={'Ограждение':['#c4bca2',4,2,'sat'],'Вызов':['#cdb389',5,2,'moon'],'Прорицание':['#d0be8e',6,2,'sun'],'Очарование':['#c6a796',7,3,'ven'],'Воплощение':['#c79f78',3,1,'mars'],'Иллюзия':['#b6b4a2',9,4,'merc'],'Некромантия':['#a9a58a',5,2,'sat'],'Преобразование':['#cbae72',8,3,'jup']};
const F=n=>n.toFixed(1);
function inkKit(seed){const r=prng(seed>>>0||1);const j=a=>(r()-.5)*a;
 const line=(x1,y1,x2,y2,w=.9)=>{const mx=(x1+x2)/2+j(1.6),my=(y1+y2)/2+j(1.6);return `M${F(x1+j(.5))} ${F(y1+j(.5))}Q${F(mx)} ${F(my)} ${F(x2+j(.5))} ${F(y2+j(.5))}`};
 const circ=(cx,cy,R,n=40,gap=0)=>{let d='';const ph=r()*6.28,st=gap?Math.floor(n*(1-gap)):n;for(let i=0;i<=st;i++){const a=ph+i/n*Math.PI*2,rr=R+j(R*.025)+Math.sin(a*3+ph)*R*.01;d+=(i?'L':'M')+F(cx+rr*Math.cos(a))+' '+F(cy+rr*Math.sin(a))}return d};
 const glyph=(x,y,s,rot)=>{let d='';const k=Math.floor(r()*6);const P=(a,b)=>{const c=Math.cos(rot),si=Math.sin(rot);return [x+(a*c-b*si)*s,y+(a*si+b*c)*s]};const L=(a,b,c2,d2)=>{const p=P(a,b),q=P(c2,d2);d+=line(p[0],p[1],q[0],q[1])};
  L(0,-1,0,1);if(k===0){L(0,-1,.6,-.4);L(0,-.2,.6,.4)}else if(k===1){L(-.5,-.6,.5,.2)}else if(k===2){L(0,0,.6,-.6);L(0,0,-.6,-.6)}else if(k===3){L(-.5,1,.5,1);L(0,-.3,.5,-.8)}else if(k===4){const p=P(.4,-.6);d+=`M${F(p[0]+.9*s)} ${F(p[1])}a${F(.4*s)} ${F(.4*s)} 0 1 0 .1 0`}else{L(0,-1,-.6,-.2);L(-.6,-.2,.2,.3)}return d};
 const band=(R,n)=>{let d='';for(let i=0;i<n;i++){const a=i/n*Math.PI*2+r()*.04;d+=glyph(50+R*Math.cos(a),50+R*Math.sin(a),2.1,a+Math.PI/2)}return d};
 const star=(n,k,R,rot=-Math.PI/2)=>{let d='';const pts=[...Array(n)].map((_,i)=>[50+R*Math.cos(rot+i*2*Math.PI/n),50+R*Math.sin(rot+i*2*Math.PI/n)]);if(k<2){pts.forEach((p,i)=>{const q=pts[(i+1)%n];d+=line(p[0],p[1],q[0],q[1])})}else{const g=(a,b)=>b?g(b,a%b):a;const cyc=g(n,k);for(let c=0;c<cyc;c++){let i=c;do{const q=(i+k)%n;d+=line(pts[i][0],pts[i][1],pts[q][0],pts[q][1]);i=q}while(i!==c)}}return [d,pts]};
 const ball=(x,y,R=1.3)=>circ(x,y,R,10);
 return {r,j,line,circ,glyph,band,star,ball}}
const PLAN={sat:'M-2-8v13M-5-5h6M-2 0q6-4 6 3q0 4-3 6',jup:'M-6-4q4-5 5 1q0 3-5 6h11M3-8v14',mars:'M2-2l6-6M5-8h3v3',sun:'',ven:'M0 1v8M-3 5h6',merc:'M0 1v8M-3 5h6M-4-11q4 4 8 0',moon:'M2-7a7 7 0 1 0 0 14a5 5 0 1 1 0-14'};
function planet(K,key,x,y,s){const t=`translate(${x} ${y}) scale(${s})`;let d=PLAN[key]||'';let extra='';if(key==='sun')extra=`<path transform="${t}" d="${K.circ(0,0,6,24)}"/><circle transform="${t}" r="1.2" fill="currentColor"/>`;if(key==='ven'||key==='merc')extra=`<path transform="${t}" d="${K.circ(0,-3,4,20)}"/>`;if(key==='mars')extra=`<path transform="${t}" d="${K.circ(-2,2,4.5,20)}"/>`;return `<path transform="${t}" d="${d}"/>`+extra}
function nameSigil(K,text,R){const A='абвгдеёжзийклмнопрстуфхцчшщъыьэюя';const ch=[...text.toLowerCase()].map(c=>A.indexOf(c)).filter(i=>i>=0).slice(0,9);if(ch.length<3)ch.push(3,17,29);
 const pts=ch.map(i=>{const a=-Math.PI/2+i/A.length*Math.PI*2;const rr=R*(.45+((i*7)%5)/8);return [50+rr*Math.cos(a),50+rr*Math.sin(a)]});let d='';
 for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]];const mx=(a[0]+b[0])/2+K.j(10),my=(a[1]+b[1])/2+K.j(10);d+=`M${F(a[0])} ${F(a[1])}Q${F(mx)} ${F(my)} ${F(b[0])} ${F(b[1])}`;if(K.r()<.35){const nx=b[1]-a[1],ny=a[0]-b[0],l=Math.hypot(nx,ny)||1;d+=K.line(mx-nx/l*4,my-ny/l*4,mx+nx/l*4,my+ny/l*4)}}
 const s=pts[0],e=pts[pts.length-1],p=pts[pts.length-2];const nx=e[1]-p[1],ny=p[0]-e[0],l=Math.hypot(nx,ny)||1;d+=K.ball(s[0],s[1],2)+K.line(e[0]-nx/l*5,e[1]-ny/l*5,e[0]+nx/l*5,e[1]+ny/l*5);return d}
/* main seal: kind spell|npc|item ; returns svg markup */
function inkSealSvg(o){const K=inkKit(hsh(o.key));const S=SCH_INK[o.school]||['#c9b48a',5+Math.floor(K.r()*4),2,['sat','jup','mars','ven','merc','moon','sun'][Math.floor(K.r()*7)]];const ink=o.ink||S[0];
 let a=K.circ(50,50,46.5,60)+K.circ(50,50,40.5,56,K.r()<.3?.04:0)+K.band(43.5,o.kind==='npc'?22:26);
 const [st,pts]=K.star(S[1],S[2],o.kind==='npc'?26:36,o.school==='Некромантия'?Math.PI/2:-Math.PI/2);
 let b=st+pts.map(p=>K.ball(p[0],p[1],1.4)).join('')+K.circ(50,50,o.kind==='npc'?30:20,36);
 if(o.kind!=='npc'&&K.r()<.6)b+=K.circ(50,50,24,40);
 const c=nameSigil(K,o.name||o.key,o.kind==='npc'?24:16);
 const bl=o.blood?`<path d="${K.circ(50+K.j(30),50+K.j(30),3+K.r()*5,14)}" fill="${INK.blood}" opacity=".55" stroke="none"/>`:'';
 const fid='f'+(hsh(o.key)%99999);
 const fl=o.inline?'':`filter="url(#${fid})"`,bg=o.inline?'':'style="filter:blur(.8px)"';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="${o.cls||'iseal'}" width="${o.size||100}" height="${o.size||100}" style="color:${ink}"><defs><filter id="${fid}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="${hsh(o.key)%97}"/><feDisplacementMap in="SourceGraphic" scale="1.3"/></filter></defs>
 <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" ${fl}>
 <g opacity=".22" stroke-width="2.4" ${bg}><path d="${a}"/><path d="${b}"/></g>
 <path d="${a}" stroke-width=".55" opacity=".8"/><path d="${b}" stroke-width=".7" opacity=".9"/>
 <path d="${c}" stroke="${o.kind==='npc'||o.blood?INK.blood:'currentColor'}" stroke-width="1.15"/>
 <g stroke-width=".8" opacity=".85">${planet(K,S[3],50,50,o.kind==='npc'?.55:.8)}</g>${bl}</g></svg>`}
const SEAL_CACHE=new Map();
function inkSeal(o){const k=JSON.stringify(o);let u=SEAL_CACHE.get(k);if(!u){u='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(inkSealSvg(o));SEAL_CACHE.set(k,u)}return `<img class="${o.cls||'iseal'}" src="${u}" width="${o.size||100}" height="${o.size||100}" alt="" decoding="async" loading="lazy">`}
/* overrides */
spellSigil=function(s,size=100,cls='ssig'){const o={key:s.id,name:s.n,school:s.sc,kind:'spell',blood:!!s.dt,size,cls:cls+' iseal'};return /big/.test(cls)?inkSealSvg({...o,inline:1}):inkSeal(o)};
npcSigil=function(c,size=56){return inkSeal({key:c.id+c.n,name:c.n,kind:'npc',size,cls:'nsig iseal'})};
runeRing=function(r=46,col='#d9b46a',n=24){const K=inkKit(hsh(col+n+r));const c=/d42a22|blood/.test(col)?INK.blood:INK.bone;return `<svg viewBox="0 0 100 100" fill="none" stroke="${c}" stroke-linecap="round" opacity=".75"><path d="${K.circ(50,50,r,64)+K.circ(50,50,r-9,60)}" stroke-width=".45"/><path d="${K.band(r-4.5,n+10)}" stroke-width=".55"/></svg>`};
function marg(K,x,y,w,rows){let d='';for(let i=0;i<rows;i++){let cx=x;const yy=y+i*7;while(cx<x+w-3){d+=K.glyph(cx,yy,1.6,K.j(.2));cx+=3+K.r()*2.4;if(K.r()<.12)cx+=4}}return d}
spellArt=function(s){const K=inkKit(hsh(s.id+'p'));const ink=(SCH_INK[s.sc]||['#c9b48a'])[0];
 let blots='';if(s.dt)for(let i=0;i<3+K.r()*4;i++){const bx=K.r()*400,by=K.r()*160,br=1.5+K.r()*5;blots+=`<path d="${K.circ(bx,by,br,9)}" fill="#4a120c" opacity="${F(.3+K.r()*.3)}"/><path d="M${F(bx)} ${F(by)}l${F(K.j(30))} ${F(K.j(30))}" stroke="#4a120c" stroke-width="${F(br/3)}" opacity=".35"/>`};
 const diag=K.circ(200,80,74,80)+K.circ(200,80,60,70)+K.line(80,80,320,80)+K.line(200,-5,200,165)+K.line(110,10,290,150)+K.line(290,10,110,150);
 const plate=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="pg"><stop offset="0" stop-color="#3a2a1a"/><stop offset=".7" stop-color="#1c130c"/><stop offset="1" stop-color="#0c0806"/></radialGradient><filter id="pn"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3"/><feColorMatrix values="0 0 0 0 .35 0 0 0 0 .25 0 0 0 0 .15 0 0 0 .35 0"/></filter></defs>
 <rect width="400" height="160" fill="url(#pg)"/><rect width="400" height="160" filter="url(#pn)"/>${blots}
 <g fill="none" stroke="${ink}" stroke-linecap="round" opacity=".28" stroke-width=".7"><path d="${diag}"/></g>
 <g fill="none" stroke="${INK.faded}" stroke-linecap="round" opacity=".55" stroke-width=".55"><path d="${marg(K,14,24,92,15)}"/><path d="${marg(K,300,24,88,15)}"/></g>
 <text x="22" y="150" fill="${INK.blood}" opacity=".7" font-family="Caveat,cursive" font-size="13">${esc(s.sc)} · ${s.l?s.l+'-й круг':'заговор'}</text></svg>`;let u=SEAL_CACHE.get('pl'+s.id);if(!u){u='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(plate);SEAL_CACHE.set('pl'+s.id,u)}
 return `<div class="sp-art inkp" style="--sc:${ink}"><img class="sp-plate" src="${u}" alt=""><div class="sp-art-sig">${spellSigil(s,132,'ssig big')}</div></div>`};
/* empty-state seal + ink tab glyphs */
(function(){const u=SEAL_CACHE.size,es=inkSealSvg({key:'empty',name:'пустота',kind:'item',ink:INK.faded});document.documentElement.style.setProperty('--esig',`url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(es)}")`);
 const G={sess:'sun',npc:'moon',spell:'merc',item:'jup',combat:'mars',dice:'sat',pcs:'ven',map:'sun',notes:'merc',rules:'sat'};
 const tab=(k,i)=>{const K=inkKit(hsh('tab'+k));return `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-linecap="round" class="tabseal"><path d="${K.circ(50,50,44,40)}" stroke-width="3"/>${planet(K,G[k],50,52,3.2).replace(/<path /g,'<path stroke-width="1.6" ')}</svg>`};
 const fix=()=>{$$('#ribbons .rib, .rib').forEach(b=>{const i=+b.dataset.i;const k=ICK[i];const svg=b.querySelector('svg');if(svg&&!svg.classList.contains('tabseal')&&k)svg.outerHTML=tab(k,i)})};fix();new MutationObserver(fix).observe(document.body,{childList:true,subtree:false});setTimeout(fix,500)})();
/* ===== performance: pause offscreen / hidden animations ===== */
(function(){const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('offs',!e.isIntersecting)),{rootMargin:'100px'});
 const watch=root=>$$('.ring2,.sp-art-ring,.ssig.big,.ph svg,.iseal',root).forEach(el=>{if(!el._io){el._io=1;io.observe(el)}});
 let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(()=>watch(document),60)}).observe(document.body,{childList:true,subtree:true});watch(document);
 document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('paused',document.hidden))})();
Object.assign(KM,{inkSeal,inkSealSvg});
Object.keys(DT_C).forEach(k=>DT_C[k]=['огонь','некротический','кислота','яд'].includes(k)?'#a8543f':['холод','звук','силовое поле','психический','электричество'].includes(k)?'#9a9c8c':'#b39a6e');

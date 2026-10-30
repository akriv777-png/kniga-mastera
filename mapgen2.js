'use strict';{
/* ===== Генератор локаций v2: 60+ типов, декор MAPDECOR, связанные карты ===== */
const RNG=s=>{let a=typeof s==='string'?[...s].reduce((h,c)=>(h*31+c.charCodeAt(0))|0,7):(s>>>0||1);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
/* новые грунты */
const GND={sand:['Песок','#8a7448','#d8c48e'],snow:['Снег','#b9bec6','#eef0f2'],mud:['Топь','#2f301c','#a89a6a'],ice:['Лёд','#6f98ad','#c8dde6'],wood:['Доски','#4f3722','#b08a5a'],dirt:['Земля','#3f3122','#bba277'],carpet:['Ковёр (пол)','#4a1418','#a0464a'],pit:['Пропасть','#020101','#3a2a1a'],ash:['Пепел','#2b2726','#9a948e'],moss:['Мох','#25331d','#a0b07a'],slime:['Слизь','#3f6a14','#9cc25a'],cloud:['Облака','#aebdcc','#eef2f6'],air:['Небо','#1f3f63','#9dbad6']};
Object.entries(GND).forEach(([k,v])=>{if(!TC[k]){const t=[k,v[0],v[1]];TILES.push(t);TC[k]=t}});
window.KM_GROUND=GND;
const FREE=new Set(['floor','wood','carpet','dirt','grass','road','sand','snow','mud','ice','moss','ash','rug','slime']);
const BLOCK=new Set(['wall','pit','water','lava','tree','cloud','air','rock','']);
/* ---------- утилиты сетки ---------- */
function G0(W,H,R,fill){const g=Array(W*H).fill(fill||'');const G={W,H,g,R,rooms:[],start:null,ri:(a,b)=>a+Math.floor(R()*(b-a+1)),pick:a=>a[Math.floor(R()*a.length)],
 get:(x,y)=>x<0||y<0||x>=W||y>=H?null:g[y*W+x],set:(x,y,t)=>{if(x>=0&&y>=0&&x<W&&y<H)g[y*W+x]=t},
 rect:(x,y,w,h,t)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)G.set(i,j,t)},
 box:(x,y,w,h,wt,ft)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)G.set(i,j,(i===x||j===y||i===x+w-1||j===y+h-1)?wt:ft)}};return G}
function walls(G){const {W,H,g}=G;const n=g.slice();for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(g[y*W+x])continue;let k=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const t=G.get(x+dx,y+dy);if(t&&t!=='wall')k++}if(k)n[y*W+x]='wall'}G.g.splice(0,G.g.length,...n)}
function noise(R,W,H,sc){const gw=Math.ceil(W/sc)+2,gh=Math.ceil(H/sc)+2,v=Array.from({length:gw*gh},R);const sm=t=>t*t*(3-2*t);
 return (x,y)=>{const fx=x/sc,fy=y/sc,ix=fx|0,iy=fy|0,tx=sm(fx-ix),ty=sm(fy-iy),a=v[iy*gw+ix],b=v[iy*gw+ix+1],c=v[(iy+1)*gw+ix],d=v[(iy+1)*gw+ix+1];return a+(b-a)*tx+(c-a)*ty+(a-b-c+d)*tx*ty}}
function fbm(R,W,H,sc){const a=noise(R,W,H,sc),b=noise(R,W,H,sc/2),c=noise(R,W,H,Math.max(1.5,sc/4));return(x,y)=>(a(x,y)*.6+b(x,y)*.28+c(x,y)*.12)}
function lpath(G,a,b,t,w,keep){let x=a.x,y=a.y;const R=G.R;const put=(x,y)=>{for(let k=0;k<(w||1);k++)for(let l=0;l<(w||1);l++){const c=G.get(x+k,y+l);if(c!=null&&!(keep&&keep.has(c)))G.set(x+k,y+l,t)}};const hf=R()<.5;
 const sx=()=>{while(x!==b.x){put(x,y);x+=Math.sign(b.x-x)}},sy=()=>{while(y!==b.y){put(x,y);y+=Math.sign(b.y-y)}};if(hf){sx();sy()}else{sy();sx()}put(x,y)}
function meander(G,from,to,t,w,wob,onWater){/* извилистая дорога/река от края до края */const R=G.R;let x=from.x,y=from.y;const pts=[];let guard=G.W*G.H*2;
 while((Math.abs(x-to.x)>0||Math.abs(y-to.y)>0)&&guard--){pts.push([x,y]);const dx=Math.sign(to.x-x),dy=Math.sign(to.y-y);if(R()<wob){const o=R()<.5?1:-1;if(dx&&!dy)y=Math.max(1,Math.min(G.H-2,y+o));else if(dy&&!dx)x=Math.max(1,Math.min(G.W-2,x+o));else if(R()<.5)x+=dx;else y+=dy}else if(dx&&(R()<.5||!dy))x+=dx;else y+=dy}pts.push([x,y]);
 pts.forEach(([px,py])=>{for(let k=0;k<w;k++)for(let l=0;l<w;l++){const c=G.get(px+k-(w>>1),py+l-(w>>1));if(c==null)continue;if(onWater&&(c==='water'||c==='lava'))G.set(px+k-(w>>1),py+l-(w>>1),onWater);else if(c!=='wall'||t==='water')G.set(px+k-(w>>1),py+l-(w>>1),t)}});return pts}
function largest(G,ok){const {W,H}=G,seen=new Uint8Array(W*H);let best=[];for(let i=0;i<W*H;i++){if(seen[i]||!ok(G.g[i]))continue;const st=[i],reg=[];seen[i]=1;while(st.length){const c=st.pop();reg.push(c);const x=c%W,y=(c/W)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)return;const j=ny*W+nx;if(!seen[j]&&ok(G.g[j])){seen[j]=1;st.push(j)}})}if(reg.length>best.length)best=reg}return new Set(best)}
/* ---------- алгоритмы ---------- */
function bsp(G,o){const {W,H,R}=G,mn=o.min||4,ft=o.ft||'floor',ct=o.ct||ft;const rooms=G.rooms;const X0=o.x0||1,Y0=o.y0||1,W1=(o.w||W-2),H1=(o.h||H-2);
 const split=(x,y,w,h,d)=>{const can=w>=mn*2+3||h>=mn*2+3;if(d>0&&can&&(d>2||R()<.85)){let hz=w<h?true:w>h?false:R()<.5;if(hz&&h<mn*2+3)hz=false;if(!hz&&w<mn*2+3)hz=true;
   if(hz){const s=G.ri(mn+1,h-mn-2);const a=split(x,y,w,s,d-1),b=split(x,y+s,w,h-s,d-1);if(a&&b)lpath(G,{x:a.cx,y:a.cy},{x:b.cx,y:b.cy},ct,o.cw||1,new Set([ft,'water']));return a||b}
   else{const s=G.ri(mn+1,w-mn-2);const a=split(x,y,s,h,d-1),b=split(x+s,y,w-s,h,d-1);if(a&&b)lpath(G,{x:a.cx,y:a.cy},{x:b.cx,y:b.cy},ct,o.cw||1,new Set([ft,'water']));return R()<.5?a:b}}
  if(w<mn+2||h<mn+2)return null;const rw=G.ri(mn,Math.min(w-2,o.max||12)),rh=G.ri(mn,Math.min(h-2,o.max||12)),rx=x+G.ri(1,Math.max(1,w-rw-1)),ry=y+G.ri(1,Math.max(1,h-rh-1));
  if(o.round&&rw>=5&&rh>=5&&R()<.4){const cx=rx+rw/2-.5,cy=ry+rh/2-.5;for(let j=ry;j<ry+rh;j++)for(let i=rx;i<rx+rw;i++)if(((i-cx)/(rw/2))**2+((j-cy)/(rh/2))**2<=1)G.set(i,j,ft)}else G.rect(rx,ry,rw,rh,ft);
  const rm={x:rx,y:ry,w:rw,h:rh,cx:rx+(rw>>1),cy:ry+(rh>>1)};rooms.push(rm);return rm};
 split(X0,Y0,W1,H1,o.depth||6);
 for(let k=0;k<(o.loops||0)&&rooms.length>2;k++){const a=G.pick(rooms),b=G.pick(rooms);if(a!==b)lpath(G,{x:a.cx,y:a.cy},{x:b.cx,y:b.cy},ct,1,new Set([ft]))}
 if(!o.noWalls)walls(G);if(o.doors!==false)doors(G,o.doorP||.7);G.start={x:rooms[0]?rooms[0].cx:W>>1,y:rooms[0]?rooms[0].cy:H>>1}}
function doors(G,p){G.rooms.forEach(rm=>{const ring=[];for(let x=rm.x-1;x<=rm.x+rm.w;x++){ring.push([x,rm.y-1]);ring.push([x,rm.y+rm.h])}for(let y=rm.y;y<rm.y+rm.h;y++){ring.push([rm.x-1,y]);ring.push([rm.x+rm.w,y])}
 ring.forEach(([x,y])=>{const t=G.get(x,y);if(!t||!FREE.has(t))return;const h=G.get(x-1,y)==='wall'&&G.get(x+1,y)==='wall',v=G.get(x,y-1)==='wall'&&G.get(x,y+1)==='wall';if((h||v)&&G.R()<p)G.set(x,y,'door')})})}
function cave(G,o){const {W,H,R}=G;const ft=o.ft||'floor';let a=new Uint8Array(W*H);for(let i=0;i<W*H;i++){const x=i%W,y=(i/W)|0;a[i]=(x<1||y<1||x>=W-1||y>=H-1||R()<(o.fill||.45))?1:0}
 for(let k=0;k<(o.iter||5);k++){const b=a.slice();for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){let c=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)c+=a[(y+dy)*W+x+dx];b[y*W+x]=c>=5?1:0}a=b}
 for(let i=0;i<W*H;i++)G.g[i]=a[i]?'':ft;const keep=largest(G,t=>t===ft);for(let i=0;i<W*H;i++)if(G.g[i]===ft&&!keep.has(i))G.g[i]='';
 if(o.liq){const n=fbm(R,W,H,5);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(G.get(x,y)===ft&&n(x,y)>.74-o.liq[1])G.set(x,y,o.liq[0])}
 if(o.alt){const n=fbm(R,W,H,4);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(G.get(x,y)===ft&&n(x,y)<o.alt[1])G.set(x,y,o.alt[0])}
 walls(G);const cells=[...keep];const reg=[];for(let k=0;k<Math.max(3,(cells.length/60)|0);k++){const c=G.pick(cells);reg.push({x:(c%W)-2,y:((c/W)|0)-2,w:5,h:5,cx:c%W,cy:(c/W)|0})}G.rooms.push(...reg);
 const s=cells.reduce((b,c)=>((c%W)+((c/W)|0)<(b%W)+((b/W)|0)?c:b),cells[0]);G.start={x:s%W,y:(s/W)|0}}
function nature(G,o){const {W,H,R}=G;const n1=fbm(R,W,H,o.sc||7),n2=fbm(R,W,H,3),n3=fbm(R,W,H,5);const tr=o.trees||0;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let t=o.base||'grass';const a=n1(x,y),b=n2(x,y),c=n3(x,y);
  if(o.grad){const d=o.grad==='s'?y/H:o.grad==='e'?x/W:o.grad==='c'?1-Math.hypot(x/W-.5,y/H-.5)*2:0;if(d+(a-.5)*.35>o.gt)t=o.gw||'water';else if(o.shore&&d+(a-.5)*.35>o.gt-.08)t=o.shore}
  if(t===(o.base||'grass')){if(o.water&&a<o.water)t=o.wt||'water';else if(o.cliff&&a>1-o.cliff)t='wall';else if(b>1-tr)t='tree';else if(o.alt)for(const[at,th]of o.alt){if(c<th){t=at;break}}}
  G.set(x,y,t)}
 if(o.clear){const cx=W>>1,cy=H>>1,r=o.clear;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(Math.hypot(x-cx,y-cy)<r+(R()-.5)*2&&G.get(x,y)!=='water')G.set(x,y,o.clearT||o.base||'grass')}
 if(o.river){const v=R()<.5;const pts=meander(G,v?{x:G.ri(3,W-4),y:0}:{x:0,y:G.ri(3,H-4)},v?{x:G.ri(3,W-4),y:H-1}:{x:W-1,y:G.ri(3,H-4)},o.river,o.rw||2,.35)}
 if(o.path){const v=!!o.river?!(G._v):R()<.5;meander(G,{x:0,y:G.ri(3,H-4)},{x:W-1,y:G.ri(3,H-4)},o.path,o.pw||1,.3,'bridge');}
 G.start={x:1,y:H>>1};for(let x=0;x<W;x++){const t=G.get(x,H>>1);if(t&&!BLOCK.has(t)){G.start={x,y:H>>1};break}}
 G.rooms.push({x:(W>>1)-3,y:(H>>1)-3,w:6,h:6,cx:W>>1,cy:H>>1});for(let k=0;k<4;k++){const x=G.ri(2,W-8),y=G.ri(2,H-8);G.rooms.push({x,y,w:6,h:6,cx:x+3,cy:y+3})}}
function partition(G,x,y,w,h,mn,d,list){/* делит прямоугольник внутренними стенами с дверями */const R=G.R;if(d<=0||(w<mn*2+1&&h<mn*2+1)){list.push({x,y,w,h,cx:x+(w>>1),cy:y+(h>>1)});return}
 const hz=w<mn*2+1?true:h<mn*2+1?false:(h>w?true:w>h?false:R()<.5);
 if(hz){const s=G.ri(mn,h-mn-1);for(let i=x;i<x+w;i++)G.set(i,y+s,'wall');G.set(G.ri(x,x+w-1),y+s,'door');partition(G,x,y,w,s,mn,d-1,list);partition(G,x,y+s+1,w,h-s-1,mn,d-1,list)}
 else{const s=G.ri(mn,w-mn-1);for(let j=y;j<y+h;j++)G.set(x+s,j,'wall');G.set(x+s,G.ri(y,y+h-1),'door');partition(G,x,y,s,h,mn,d-1,list);partition(G,x+s+1,y,w-s-1,h,mn,d-1,list)}}
function house(G,x,y,w,h,ft,mn,dside,depth){G.box(x,y,w,h,'wall',ft);const list=[];if(w>=7||h>=7)partition(G,x+1,y+1,w-2,h-2,mn||3,depth==null?2:depth,list);else list.push({x:x+1,y:y+1,w:w-2,h:h-2,cx:x+(w>>1),cy:y+(h>>1)});
 const s=dside==null?G.ri(0,3):dside;const dx=s===0?x+(w>>1):s===1?x+w-1:s===2?x+(w>>1):x,dy=s===0?y+h-1:s===1?y+(h>>1):s===2?y:y+(h>>1);G.set(dx,dy,'door');G.rooms.push(...list);return {x:dx,y:dy,rooms:list}}
function building(G,o){const {W,H,R}=G;G.rect(0,0,W,H,o.out||'grass');if(o.out!=='')nature(G,{base:o.out||'grass',trees:.12,alt:[['dirt',.2]]});
 const m=o.margin==null?2:o.margin,x=m,y=m,w=W-m*2,h=H-m*2;G.box(x,y,w,h,'wall',o.ft||'wood');const list=[];
 if(o.hall){const hw=Math.max(5,Math.round(w*o.hall));G.rooms.push({x:x+1,y:y+1,w:hw-1,h:h-2,cx:x+(hw>>1),cy:y+(h>>1),hall:1});for(let j=y+1;j<y+h-1;j++)G.set(x+hw,j,'wall');G.set(x+hw,y+G.ri(2,h-3),'door');G.set(x+hw,y+G.ri(2,h-3),'door');partition(G,x+hw+1,y+1,w-hw-2,h-2,o.mn||3,o.depth||3,list)}
 else partition(G,x+1,y+1,w-2,h-2,o.mn||3,o.depth||3,list);G.rooms.push(...list);
 const dx=x+(w>>1);if(o.noDoor!==true){G.set(dx,y+h-1,'door');for(let j=y+h;j<H;j++)G.set(dx,j,'road')}G.start={x:dx,y:Math.min(H-1,y+h)};
 if(o.ft2)list.forEach(r=>{if(R()<.35)for(let j=r.y;j<r.y+r.h;j++)for(let i=r.x;i<r.x+r.w;i++)if(G.get(i,j)===(o.ft||'wood'))G.set(i,j,o.ft2)})}
function tower(G,o){const {W,H}=G;G.rect(0,0,W,H,o.out===''?'':'grass');if(o.out!=='')nature(G,{base:'grass',trees:.1});const cx=(W-1)/2,cy=(H-1)/2,r=Math.min(W,H)/2-2;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const d=Math.hypot(x-cx,y-cy);if(d<=r-1)G.set(x,y,o.ft||'floor');else if(d<=r+.2)G.set(x,y,'wall');else if(o.out==='')G.set(x,y,'')}
 if(r>6){for(let a=0;a<4;a++){if(G.R()<.7){const ang=a*Math.PI/2+.4;for(let k=2;k<r-1;k++)G.set(Math.round(cx+Math.cos(ang)*k),Math.round(cy+Math.sin(ang)*k),'wall');G.set(Math.round(cx+Math.cos(ang)*(r*.6)),Math.round(cy+Math.sin(ang)*(r*.6)),'door')}}}
 G.rect(Math.round(cx)-1,Math.round(cy)-1,2,2,o.core||'pillar');G.set(Math.round(cx+r-2),Math.round(cy),'stairs');if(!o.upper){G.set(Math.round(cx),Math.round(cy+r),'door');G.start={x:Math.round(cx),y:Math.round(cy+r-1)}}else G.start={x:Math.round(cx+r-2),y:Math.round(cy)};
 for(let a=0;a<4;a++){const ang=a*Math.PI/2+Math.PI/4;G.rooms.push({x:Math.round(cx+Math.cos(ang)*r*.55)-2,y:Math.round(cy+Math.sin(ang)*r*.55)-2,w:4,h:4,cx:Math.round(cx+Math.cos(ang)*r*.55),cy:Math.round(cy+Math.sin(ang)*r*.55)})}}
function ship(G,o){const {W,H}=G;G.rect(0,0,W,H,'water');const L=H-4,bw=Math.min(W-6,Math.max(7,Math.round(L*.38)));const cx=W>>1;
 for(let j=0;j<L;j++){const y=j+2,t=j/L;const hw=Math.max(1,Math.round(bw/2*(t<.3?Math.sqrt(t/.3):t>.92?1-(t-.92)*3:1)));for(let x=cx-hw;x<=cx+hw;x++)G.set(x,y,(x===cx-hw||x===cx+hw||j===0||j===L-1)?'wall':(o.hold?'wood':'wood'))}
 const sy=2+Math.round(L*.78);if(!o.hold){G.box(cx-Math.round(bw/2)+1,sy,bw-1,Math.max(4,L-Math.round(L*.78)-1),'wall','wood');G.set(cx,sy,'door');G.rooms.push({x:cx-2,y:sy+1,w:4,h:3,cx,cy:sy+2})}
 else{for(let y=6;y<2+L-3;y+=5)for(let x=cx-Math.round(bw/2)+1;x<cx+Math.round(bw/2);x++)if(G.R()<.8&&x!==cx)G.set(x,y,'wall')}
 G.set(cx,2+Math.round(L*.5),'stairs');G.set(cx,2+Math.round(L*.25),'pillar');G.set(cx,2+Math.round(L*.6),'pillar');G.set(cx-Math.round(bw/2),2+Math.round(L*.45),'bridge');for(let x=0;x<cx-Math.round(bw/2);x++)if(!o.hold&&G.R()<2)G.set(x,2+Math.round(L*.45),x<2?'wood':'bridge');
 for(let k=0;k<5;k++){const y=4+Math.round(k*(L-6)/5);G.rooms.push({x:cx-2,y,w:4,h:3,cx,cy:y+1})}G.start={x:1,y:2+Math.round(L*.45)}}
function castle(G,o){const {W,H,R}=G;nature(G,{base:'grass',trees:.1,alt:[['dirt',.25]]});const m=2,x=m,y=m,w=W-m*2,h=H-m*2;
 for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)G.set(i,j,(i<=x||j<=y||i>=x+w-1||j>=y+h-1)?'wall':(o.yard||'dirt'));
 [[x,y],[x+w-1,y],[x,y+h-1],[x+w-1,y+h-1]].forEach(([cx,cy])=>{for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const d=Math.hypot(i,j);if(d<=2.3)G.set(cx+i,cy+j,d>1.3?'wall':'floor')}});
 const gx=x+(w>>1);G.set(gx,y+h-1,'door');G.set(gx-1,y+h-1,'wall');for(let j=y+h;j<H;j++)G.set(gx,j,'road');lpath(G,{x:gx,y:y+h-2},{x:gx,y:y+Math.round(h*.45)},'road',1);
 const kw=Math.max(7,Math.round(w*.5)),kh=Math.max(6,Math.round(h*.4));house(G,x+((w-kw)>>1),y+2,kw,kh,o.ft||'floor',3,0,3);
 if(w>18){house(G,x+2,y+h-Math.round(h*.35)-1,Math.round(w*.25),Math.round(h*.3),'wood',3,1,1);house(G,x+w-Math.round(w*.25)-2,y+h-Math.round(h*.35)-1,Math.round(w*.25),Math.round(h*.3),'wood',3,3,1)}
 if(o.moat)for(let j=0;j<H;j++)for(let i=0;i<W;i++){if((i<m||j<m||i>=W-m||j>=H-m)&&G.get(i,j)!=='road')G.set(i,j,'water');else if((i<m||j<m||i>=W-m||j>=H-m))G.set(i,j,'bridge')}
 G.start={x:gx,y:H-1}}
function temple(G,o){const {W,H}=G;G.rect(0,0,W,H,o.out===''?'':'grass');if(o.out!=='')nature(G,{base:'grass',trees:.08});const w=Math.max(7,Math.round(W*.36))|1,x=(W-w)>>1,y=2,h=H-4;
 G.box(x,y,w,h,'wall',o.ft||'floor');const cx=W>>1;for(let j=y+3;j<y+h-2;j+=3){G.set(x+2,j,'pillar');G.set(x+w-3,j,'pillar')}for(let j=y+3;j<y+h-1;j++)G.set(cx,j,'rug');G.set(cx,y+1,'altar');
 const sw=Math.max(4,((W-w)>>1)-2);for(let j=y+2;j+5<y+h-2;j+=6){[[x-sw,1],[x+w-1,0]].forEach(([sx,l])=>{if(sx<1)return;G.box(sx,j,sw+1,5,'wall',o.ft||'floor');G.set(l?x:x+w-1,j+2,'door');G.rooms.push({x:sx+1,y:j+1,w:sw-1,h:3,cx:sx+(sw>>1),cy:j+2})})}
 G.set(cx,y+h-1,'door');G.rooms.unshift({x:x+1,y:y+1,w:w-2,h:h-2,cx,cy:y+(h>>1)});G.start={x:cx,y:Math.min(H-1,y+h)};for(let j=y+h;j<H;j++)G.set(cx,j,'road')}
function streets(G,o){const {W,H,R}=G;nature(G,{base:o.base||'dirt',trees:o.trees||0,alt:[['grass',.3]]});const sp=o.sp||9,rw=o.rw||2;const xs=[],ys=[];
 for(let x=G.ri(2,4);x<W-3;x+=sp+G.ri(-1,2))xs.push(x);for(let y=G.ri(2,4);y<H-3;y+=sp+G.ri(-1,2))ys.push(y);
 xs.forEach(x=>{for(let y=0;y<H;y++)for(let k=0;k<rw;k++)G.set(x+k,y,'road')});ys.forEach(y=>{for(let x=0;x<W;x++)for(let k=0;k<rw;k++)G.set(x,y+k,'road')});
 const bx=[-rw,...xs,W],by=[-rw,...ys,H];let plaza=null;const doorsAt=[];
 for(let i=0;i<bx.length-1;i++)for(let j=0;j<by.length-1;j++){const x0=bx[i]+rw+1,x1=bx[i+1]-1,y0=by[j]+rw+1,y1=by[j+1]-1;const w=x1-x0,h=y1-y0;if(w<4||h<4)continue;
  if(!plaza&&o.plaza&&i===((bx.length-1)>>1)&&j===((by.length-1)>>1)){plaza={x:x0,y:y0,w,h};G.rect(x0-1,y0-1,w+2,h+2,'road');for(let a=-1;a<=1;a++)for(let b2=-1;b2<=1;b2++)G.set(x0+(w>>1)+a,y0+(h>>1)+b2,'water');G.rooms.push({x:x0,y:y0,w,h,cx:x0+(w>>1),cy:y0+(h>>1),plaza:1});continue}
  if(o.park&&R()<o.park){continue}
  {const rows=h>=10?[y0,'B']:[R()<.5?y0:'B'];for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++)if(R()<.5)G.set(xx,yy,'grass');
   rows.forEach(rr=>{let px=x0;const hh=rows.length>1?Math.max(4,Math.min((h>>1),G.ri(5,7))):Math.max(4,Math.min(h,G.ri(5,8)));const py=rr==='B'?y1-hh+1:rr;
    while(px<=x1-3){let pw=Math.min(x1-px+1,G.ri(5,9));if(x1-px+1-pw<4)pw=x1-px+1;if(pw<4)break;const ft=R()<.5?(o.ft||'wood'):'floor';const d=house(G,px,py,pw,hh,ft,3,py===y0?2:0,pw>7&&hh>6?1:0);doorsAt.push(d);
     const up=py===y0;for(let s=1;s<4;s++){const t=G.get(d.x,d.y+(up?-s:s));if(t==='road')break;if(t&&t!=='wall')G.set(d.x,d.y+(up?-s:s),'road')}px+=pw+1}});
   for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++){const t=G.get(xx,yy);if((t==='grass'||t==='dirt')&&R()<.06&&G.get(xx,yy-1)!=='wall'&&G.get(xx,yy+1)!=='wall')G.set(xx,yy,'tree')}}}
 if(o.water){for(let y=H-o.water;y<H;y++)for(let x=0;x<W;x++)G.set(x,y,'water');for(let x=3;x<W-3;x+=G.ri(5,8))for(let y=H-o.water-1;y<H-2;y++)G.set(x,y,'bridge')}
 G.doorsAt=doorsAt;G.start={x:xs[0]||1,y:0}}
function village(G,o){const {W,H,R}=G;nature(G,{base:o.base||'grass',trees:o.trees||.16,alt:[['dirt',.18]],water:o.pond?.12:0});const pts=meander(G,{x:0,y:G.ri(4,H-5)},{x:W-1,y:G.ri(4,H-5)},'road',2,.3,'bridge');
 if(R()<.6)meander(G,{x:G.ri(4,W-5),y:0},{x:G.ri(4,W-5),y:H-1},'road',1,.3,'bridge');const doorsAt=[];const n=o.n||Math.round(W*H/90);
 for(let k=0;k<n*6&&doorsAt.length<n;k++){const p=G.pick(pts);const w=G.ri(5,o.big?9:7),h=G.ri(4,o.big?8:6);const up=R()<.5;const x=p[0]-(w>>1)+G.ri(-3,3),y=up?p[1]-h-1-G.ri(0,2):p[1]+3+G.ri(0,2);
  if(x<1||y<1||x+w>=W-1||y+h>=H-1)continue;let ok=true;for(let j=y-1;j<=y+h;j++)for(let i=x-1;i<=x+w;i++){const t=G.get(i,j);if(t==='wall'||t==='wood'||t==='road'||t==='water'||t==='door')ok=false}if(!ok)continue;
  const d=house(G,x,y,w,h,'wood',3,up?0:2,0);doorsAt.push(d);lpath(G,{x:d.x,y:d.y+(up?1:-1)},{x:p[0],y:p[1]},'dirt',1,new Set(['road','wall','wood','door','bridge']))}
 if(o.fence){for(let x=1;x<W-1;x++){if(G.get(x,1)!=='road')G.set(x,1,'fence');if(G.get(x,H-2)!=='road')G.set(x,H-2,'fence')}for(let y=1;y<H-1;y++){if(G.get(1,y)!=='road')G.set(1,y,'fence');if(G.get(W-2,y)!=='road')G.set(W-2,y,'fence')}}
 G.doorsAt=doorsAt;G.start={x:0,y:pts[0][1]};G.rooms.push({x:(W>>1)-3,y:(H>>1)-3,w:6,h:6,cx:W>>1,cy:H>>1})}
function camp(G,o){const {W,H,R}=G;nature(G,{base:o.base||'grass',trees:o.trees==null?.25:o.trees,clear:Math.min(W,H)*.32,clearT:o.base||'grass',alt:[['dirt',.25]]});const cx=W>>1,cy=H>>1;G.set(cx,cy,'campfire');
 const n=o.n||6;for(let k=0;k<n;k++){const a=k/n*Math.PI*2+R()*.3,r=Math.min(W,H)*.2;const x=Math.round(cx+Math.cos(a)*r)-1,y=Math.round(cy+Math.sin(a)*r)-1;if(o.big){G.box(x-1,y-1,4,4,'wall','dirt');G.set(x+1,y+(Math.sin(a)>0?-1:2),'door')}else G.set(x+1,y+1,'tent')}
 if(o.wall){const r=Math.min(W,H)/2-2;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const d=Math.hypot(x-cx,y-cy);if(Math.abs(d-r)<.6)G.set(x,y,'fence')}G.set(cx,Math.round(cy+r),'road');G.set(cx,Math.round(cy+r)-1,'road')}
 meander(G,{x:cx,y:cy+1},{x:cx,y:H-1},'dirt',1,.2,'bridge');G.start={x:cx,y:H-1};G.rooms.push({x:cx-4,y:cy-4,w:8,h:8,cx,cy})}
function ruins(G,o){const {W,H,R}=G;bsp(G,{min:4,ft:o.ft||'floor',doors:false});for(let i=0;i<W*H;i++){const t=G.g[i];if(!t)G.g[i]=R()<.12?'tree':'grass';else if(t==='wall'&&R()<.3)G.g[i]=R()<.5?'rubble':'grass';else if(t==='floor'&&R()<.15)G.g[i]=R()<.5?'grass':'rubble'}
 if(o.sand)for(let i=0;i<W*H;i++)if(G.g[i]==='grass')G.g[i]='sand';else if(G.g[i]==='tree'&&R()<.8)G.g[i]='sand';G.start={x:0,y:H>>1}}
function sewer(G,o){bsp(G,{min:4,ft:'floor',ct:'floor',cw:3,doorP:.5});const {W,H}=G;for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(G.get(x,y)!=='floor')continue;const inRoom=G.rooms.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);if(inRoom)continue;
 const hz=FREE.has(G.get(x-1,y))&&FREE.has(G.get(x+1,y))&&G.get(x,y-1)!=='wall'&&G.get(x,y+1)!=='wall',vt=FREE.has(G.get(x,y-1))&&FREE.has(G.get(x,y+1))&&G.get(x-1,y)!=='wall'&&G.get(x+1,y)!=='wall';if((hz||vt)&&G.R()<.85)G.set(x,y,'water')}
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(G.get(x,y)==='water'&&G.R()<.06)G.set(x,y,'bridge')}
function arena(G,o){const {W,H}=G;G.rect(0,0,W,H,'');const cx=(W-1)/2,cy=(H-1)/2,rx=W/2-1,ry=H/2-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<.45)G.set(x,y,'sand');else if(d<.52)G.set(x,y,'wall');else if(d<.95)G.set(x,y,'wood');else if(d<1.05)G.set(x,y,'wall')}
 [[Math.round(cx),Math.round(cy+ry*.7)],[Math.round(cx),Math.round(cy-ry*.7)]].forEach(([x,y])=>G.set(x,y,'door'));G.set(Math.round(cx),H-1,'door');for(let y=Math.round(cy+ry*.7);y<H-1;y++)G.set(Math.round(cx),y,G.get(Math.round(cx),y)==='wall'?'door':'wood');
 G.rooms.push({x:Math.round(cx)-3,y:Math.round(cy)-3,w:6,h:6,cx:Math.round(cx),cy:Math.round(cy)});G.start={x:Math.round(cx),y:H-2}}
function mine(G,o){cave(G,{ft:'dirt',fill:.5,liq:o.liq});const {W,H}=G;for(let k=0;k<4;k++){const a={x:G.ri(2,W-3),y:G.ri(2,H-3)},b={x:G.ri(2,W-3),y:G.ri(2,H-3)};lpath(G,a,b,'wood',1,new Set(['dirt','water','lava']))}walls(G);
 for(let i=0;i<W*H;i++)if(G.g[i]==='wall'&&G.R()<.03)G.g[i]='crystal';const keep=largest(G,t=>t&&!BLOCK.has(t)||t==='door');for(let i=0;i<W*H;i++){const t=G.g[i];if(t&&!BLOCK.has(t)&&!keep.has(i))G.g[i]='wall'}}
function cellar(G,o){const {W,H}=G;G.rect(0,0,W,H,'');G.box(1,1,W-2,H-2,'wall',o.ft||'floor');const list=[];partition(G,2,2,W-4,H-4,3,o.depth||2,list);G.rooms.push(...list);G.set(2,2,'stairs');G.start={x:2,y:2}}
function floorPlan(G,o){/* этаж здания без улицы */const {W,H}=G;G.rect(0,0,W,H,'');G.box(1,1,W-2,H-2,'wall',o.ft||'wood');const list=[];if(o.hall){const hw=Math.max(5,Math.round((W-4)*o.hall));for(let j=2;j<H-2;j++)G.set(1+hw,j,'wall');G.set(1+hw,G.ri(3,H-4),'door');G.rooms.push({x:2,y:2,w:hw-1,h:H-4,cx:1+(hw>>1),cy:H>>1,hall:1});partition(G,2+hw,2,W-4-hw,H-4,3,3,list)}else partition(G,2,2,W-4,H-4,3,o.depth||3,list);G.rooms.push(...list);G.set(W-3,2,'stairs');G.start={x:W-3,y:2}}
function sky(G,o){/* парящие острова над облаками, верёвочные мосты */const {W,H,R}=G;const n=fbm(R,W,H,4);for(let y=0;y<H;y++)for(let x=0;x<W;x++)G.set(x,y,n(x,y)>.55?'cloud':'air');
 const isl=[];const k=Math.max(4,Math.round(W*H/240));for(let t=0;t<k*12&&isl.length<k;t++){const r=G.ri(4,Math.max(5,Math.min(W,H)/4|0)),cx=G.ri(r+1,W-r-2),cy=G.ri(r+1,H-r-2);if(isl.some(i=>Math.hypot(i.cx-cx,i.cy-cy)<i.r+r+2))continue;isl.push({cx,cy,r})}
 isl.forEach((I,ix)=>{for(let y=I.cy-I.r-1;y<=I.cy+I.r+1;y++)for(let x=I.cx-I.r-1;x<=I.cx+I.r+1;x++){const d=Math.hypot(x-I.cx,(y-I.cy)*1.1)+(n(x,y)-.5)*2.4;if(d<I.r-.6)G.set(x,y,ix===0?'floor':(R()<.15?'moss':'grass'));else if(d<I.r+.4)G.set(x,y,'rock')}
  G.rooms.push({x:I.cx-I.r+1,y:I.cy-I.r+1,w:2*I.r-1,h:2*I.r-1,cx:I.cx,cy:I.cy})});
 const I0=isl[0];if(I0){for(let j=-1;j<=1;j++){G.set(I0.cx-2,I0.cy+j*2,'pillar');G.set(I0.cx+2,I0.cy+j*2,'pillar')}G.set(I0.cx,I0.cy-1,'altar')}
 const near=(a)=>isl.filter(b=>b!==a).sort((p,q)=>Math.hypot(p.cx-a.cx,p.cy-a.cy)-Math.hypot(q.cx-a.cx,q.cy-a.cy));const done=new Set([0]);
 while(done.size<isl.length){let best=null;done.forEach(i=>isl.forEach((b,j)=>{if(done.has(j))return;const d=Math.hypot(b.cx-isl[i].cx,b.cy-isl[i].cy);if(!best||d<best[2])best=[i,j,d]}));lpath(G,{x:isl[best[0]].cx,y:isl[best[0]].cy},{x:isl[best[1]].cx,y:isl[best[1]].cy},'wood',1,new Set(['floor','grass','moss','pillar','altar']));done.add(best[1])}
 isl.slice(1).forEach(I=>{for(let t=0;t<3;t++){const x=I.cx+G.ri(-I.r+1,I.r-1),y=I.cy+G.ri(-I.r+1,I.r-1);if(G.get(x,y)==='grass')G.set(x,y,'tree')}});
 const L=isl[isl.length-1]||{cx:W>>1,cy:H>>1};G.start={x:L.cx,y:L.cy}}
function slime(G,o){/* сырые пещеры: камеры-пузыри, слизистые тоннели, озёра слизи */const {W,H,R}=G;cave(G,{fill:.5,iter:5});const n=fbm(R,W,H,4);
 const ch=[];for(let t=0;t<Math.max(4,W*H/260|0);t++){const r=G.ri(2,3),cx=G.ri(r+2,W-r-3),cy=G.ri(r+2,H-r-3);for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if(Math.hypot(x-cx,y-cy)+(n(x,y)-.5)*2<r)G.set(x,y,'floor');ch.push({x:cx,y:cy})}
 const s=G.start||ch[0];ch.forEach((c,i)=>lpath(G,i?ch[i-1]:s,c,'floor',1));for(let i=0;i<G.W*G.H;i++)if(G.g[i]==='wall')G.g[i]='';walls(G);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=G.get(x,y);if(t==='floor'){const v=n(x,y);if(v>.6)G.set(x,y,'slime');else if(v>.52)G.set(x,y,'mud');else if(R()<.02)G.set(x,y,'bones')}}
 ch.forEach(c=>G.rooms.push({x:c.x-2,y:c.y-2,w:5,h:5,cx:c.x,cy:c.y}))}
const ALG={sky,slime,bsp,cave,nature,building,tower,ship,castle,temple,streets,village,camp,ruins,sewer,arena,mine,cellar,floorPlan};
/* ---------- каталог локаций ---------- */
/* [id,имя,группа,алгоритм,параметры,темы декора,монстры(ty|рег.выр.),связи[[тип,подпись]],вне помещения?] */
const LT=[
['dungeon','Подземелье','Подземелья','bsp',{min:4,loops:2},['подземелье'],'гуманоид|чудовище',[['cellar','Верхний подвал']]],
['crypt','Склеп','Подземелья','bsp',{min:4,max:8,ft:'floor',doorP:.9},['склеп','гробница'],'нежить',[]],
['catacombs','Катакомбы','Подземелья','bsp',{min:3,max:6,depth:8,loops:4},['катакомбы','склеп','кладбище'],'нежить',[]],
['prison','Тюрьма','Подземелья','bsp',{min:3,max:5,depth:8,doorP:1},['тюрьма'],'гуманоид',[]],
['sewer','Канализация','Подземелья','sewer',{},['канализация'],'слизь|зверь|/крыс|отид/',[]],
['treasury','Сокровищница','Подземелья','bsp',{min:4,max:9,doorP:1},['сокровищница','дворец'],'конструкт|/мимик/',[]],
['cult','Логово культа','Подземелья','bsp',{min:4,round:1},['логово культа','ритуальный зал'],'гуманоид|исчадие',[]],
['necro','Логово некроманта','Подземелья','bsp',{min:4,round:1},['логово некроманта','склеп','лаборатория'],'нежить',[]],
['lab','Лаборатория алхимика','Подземелья','bsp',{min:4,max:8},['лаборатория','мастерская'],'конструкт|слизь',[]],
['tomb','Гробница','Подземелья','temple',{out:'',ft:'floor'},['гробница','склеп'],'нежить',[]],
['villain','Логово злодея','Подземелья','bsp',{min:5,round:1,loops:2},['логово злодея','дворец'],'гуманоид|исчадие',[]],
['vampire','Логово вампира','Подземелья','bsp',{min:4,max:9},['логово вампира','склеп','замок'],'нежить',[]],
['cave','Пещера','Пещеры','cave',{fill:.46},['пещера'],'зверь|чудовище|/гоблин|кобольд/',[]],
['underdark','Подземье','Пещеры','cave',{fill:.44,liq:['water',.12]},['подземье','пещера'],'аберрация|/дроу|дуэргар/',[]],
['dragon','Логово дракона','Пещеры','cave',{fill:.42,liq:['lava',.1]},['логово дракона','сокровищница','пещера'],'дракон',[]],
['spider','Логово паука','Пещеры','cave',{fill:.5},['логово паука','пещера'],'/паук|ettercap|эттеркап/',[]],
['slime','Логово слизи','Пещеры','slime',{},['логово слизи','пещера'],'слизь',[]],
['icecave','Ледяная пещера','Пещеры','cave',{ft:'ice',fill:.45,alt:['snow',.35]},['ледник','снег','пещера'],'/ледян|морозн|йети/|элементаль',[]],
['volcano','Жерло вулкана','Пещеры','cave',{ft:'ash',fill:.42,liq:['lava',.22]},['вулкан','пепелище'],'элементаль|/огн|саламандр/',[]],
['mine','Шахта','Пещеры','mine',{},['шахта','дварфы'],'/кобольд|дуэргар|гоблин/|конструкт',[]],
['grotto','Подводный грот','Пещеры','cave',{fill:.4,liq:['water',.35]},['подводье','побережье','пещера'],'/сахуагин|кораблекруш|мерроу|кракен/|зверь',[]],
['forest','Лес','Природа','nature',{trees:.32,path:'dirt',alt:[['dirt',.12]]},['лес'],'зверь|фея',[]],
['deepforest','Чаща','Природа','nature',{trees:.5,alt:[['moss',.3]],path:'dirt'},['лес','фейвайлд'],'зверь|фея|растение',[]],
['swamp','Болото','Природа','nature',{base:'mud',trees:.2,water:.35,alt:[['grass',.25],['moss',.4]]},['болото'],'/ящер|троль|карга|болот/|зверь',[]],
['jungle','Джунгли','Природа','nature',{trees:.55,river:'water',rw:2,alt:[['moss',.3]]},['джунгли'],'зверь|/юань-ти|ящер/',[]],
['meadow','Луг','Природа','nature',{trees:.08,alt:[['dirt',.1]],path:'dirt'},['луг','поле'],'зверь|фея',[]],
['desert','Пустыня','Природа','nature',{base:'sand',trees:0,cliff:.12,alt:[['dirt',.12]]},['пустыня'],'/скорпион|червь|гнолл|мумия/|зверь',[]],
['oasis','Оазис','Природа','nature',{base:'sand',trees:.05,grad:'c',gt:.78,shore:'grass'},['пустыня','пруд'],'зверь|/джинн|гнолл/',[]],
['snow','Снежная равнина','Природа','nature',{base:'snow',trees:.12,alt:[['ice',.18]],path:'dirt'},['снег','север'],'/йети|волк|ледян/|великан',[]],
['mountain','Горный перевал','Природа','nature',{base:'dirt',cliff:.32,trees:.06,path:'road',alt:[['snow',.2]]},['горы'],'великан|/гарпи|орк|грифон/',[]],
['canyon','Каньон','Природа','nature',{base:'sand',cliff:.38,sc:5,river:'water',rw:1},['каньон','пустыня'],'/гарпи|гнолл|бандит/',[]],
['river','Речная переправа','Природа','nature',{trees:.22,river:'water',rw:3,path:'road'},['река','лес'],'зверь|гуманоид',[]],
['lake','Озеро с островом','Природа','nature',{trees:.2,grad:'c',gt:.4,shore:'sand',clear:3,clearT:'grass'},['пруд','лес'],'зверь|/нага|ведьм/',[]],
['coast','Побережье','Природа','nature',{base:'grass',trees:.1,grad:'s',gt:.62,shore:'sand'},['побережье','порт'],'/сахуагин|пират|гарпи/|зверь',[]],
['feywild','Поляна Страны Фей','Природа','nature',{trees:.3,alt:[['moss',.3]],clear:5},['фейвайлд','сад'],'фея',[]],
['wasteland','Пустошь','Природа','nature',{base:'ash',trees:.03,cliff:.1,alt:[['dirt',.3]]},['пустошь','пепелище'],'нежить|/гнолл|орк/',[]],
['village','Деревня','Поселения','village',{},['деревня','ферма'],'гуманоид',[['tavern','Таверна']]],
['city','Городские улицы','Поселения','streets',{plaza:1,sp:14},['город','рынок'],'гуманоид',[['tavern','Таверна'],['sewer','Канализация']]],
['market','Рыночная площадь','Поселения','streets',{plaza:1,sp:12},['рынок','ярмарка','город'],'гуманоид',[]],
['port','Порт и доки','Поселения','streets',{water:6,base:'dirt'},['порт','склад'],'гуманоид|/пират/',[['ship','Корабль у причала']]],
['slums','Трущобы','Поселения','streets',{sp:6,rw:1,base:'mud'},['трущобы','город'],'гуманоид',[]],
['fair','Ярмарка','Поселения','camp',{n:10,trees:.06},['ярмарка','шатёр'],'гуманоид',[]],
['camp','Лагерь','Поселения','camp',{},['лагерь'],'гуманоид|/гоблин|орк|бандит/',[]],
['warcamp','Военный лагерь','Поселения','camp',{n:8,big:1,wall:1,trees:.1},['лагерь','казарма'],'гуманоид|/орк|хобгоблин/',[]],
['caravan','Стоянка каравана','Поселения','camp',{base:'sand',trees:0,n:7},['караван','кочевники','пустыня'],'гуманоид',[]],
['farm','Ферма','Поселения','village',{n:3,big:1,fence:1,trees:.05},['ферма','конюшня','мельница'],'зверь|гуманоид',[]],
['graveyard','Кладбище','Поселения','village',{n:2,fence:1,trees:.1},['кладбище'],'нежить',[['crypt','Склеп']]],
['battlefield','Поле боя','Поселения','nature',{base:'mud',trees:.02,alt:[['grass',.35],['ash',.45]]},['поле боя'],'нежить|гуманоид',[]],
['tavern','Таверна','Здания','building',{hall:.55,ft:'wood'},['таверна','кухня','погреб'],'гуманоид',[['tavern_up','Второй этаж'],['cellar','Погреб']]],
['tavern_up','Этаж с комнатами','Здания','floorPlan',{ft:'wood',depth:3},['таверна','дом'],'гуманоид',[]],
['cellar','Погреб','Здания','cellar',{ft:'floor'},['погреб','склад'],'зверь|слизь|/крыс/',[]],
['house','Жилой дом','Здания','building',{ft:'wood',depth:2},['дом','кухня'],'гуманоид',[['cellar','Погреб']]],
['manor','Особняк','Здания','building',{hall:.35,ft:'carpet',ft2:'wood',depth:4},['дворец','дом','библиотека'],'гуманоид',[['cellar','Подвал']]],
['palace','Дворец','Здания','building',{hall:.4,ft:'carpet',ft2:'floor',depth:4,margin:1},['дворец','сокровищница'],'гуманоид',[]],
['shop','Лавка','Здания','building',{ft:'wood',hall:.6,depth:1},['лавка','склад'],'гуманоид',[]],
['smithy','Кузница','Здания','building',{ft:'floor',hall:.6,depth:1},['кузница','мастерская','оружейная'],'гуманоид',[]],
['mill','Мельница','Здания','tower',{ft:'wood',core:'pillar'},['мельница','ферма'],'гуманоид',[]],
['temple','Храм','Здания','temple',{},['храм','святилище'],'гуманоид|небожитель',[['crypt','Крипта']]],
['library','Библиотека','Здания','building',{ft:'wood',hall:.5,depth:3},['библиотека','кабинет'],'гуманоид|конструкт',[]],
['barracks','Казарма','Здания','building',{ft:'floor',hall:.5,depth:2},['казарма','оружейная'],'гуманоид',[]],
['castle','Замок','Здания','castle',{},['замок','крепость'],'гуманоид',[['keep','Донжон'],['dungeon','Темницы']]],
['fortress','Крепость со рвом','Здания','castle',{moat:1,yard:'grass'},['крепость','казарма'],'гуманоид',[['dungeon','Темницы']]],
['keep','Донжон (этаж)','Здания','floorPlan',{ft:'floor',hall:.45},['замок','дворец'],'гуманоид',[]],
['magetower','Башня мага','Здания','tower',{ft:'floor'},['башня мага','библиотека','лаборатория'],'конструкт|элементаль',[['tower_up','Верхний этаж']]],
['tower_up','Этаж башни','Здания','tower',{ft:'floor',out:'',upper:1},['башня мага','лаборатория'],'конструкт|элементаль',[['tower_top','Вершина']]],
['tower_top','Вершина башни','Здания','tower',{ft:'carpet',out:'',upper:1},['башня мага','небесное'],'элементаль|конструкт',[]],
['watchtower','Сторожевая башня','Здания','tower',{ft:'wood'},['крепость','казарма'],'гуманоид',[]],
['clocktower','Часовая башня','Здания','tower',{ft:'wood',core:'crate'},['часовая башня','мастерская'],'конструкт',[]],
['ship','Корабль (палуба)','Здания','ship',{},['корабль'],'гуманоид|/пират/',[['ship_hold','Трюм']]],
['ship_hold','Трюм корабля','Здания','ship',{hold:1},['корабль','склад'],'гуманоид|зверь',[]],
['warehouse','Склад','Здания','building',{ft:'wood',depth:1,hall:.7},['склад'],'гуманоид',[]],
['ruins','Руины','Особые','ruins',{},['руины'],'нежить|чудовище|гуманоид',[]],
['desertruins','Руины в песках','Особые','ruins',{sand:1},['руины','пустыня'],'нежить|/мумия/',[]],
['arena','Арена','Особые','arena',{},['поле боя','город'],'гуманоид|чудовище',[]],
['infernal','Инфернальный план','Особые','cave',{ft:'ash',fill:.4,liq:['lava',.3]},['инфернальное'],'исчадие',[]],
['sky','Небесная цитадель','Особые','sky',{},['небесное'],'небожитель|элементаль',[]],
['witch','Хижина ведьмы на болоте','Особые','village',{base:'mud',n:1,trees:.3,pond:1},['логово ведьмы','болото'],'/карга|ведьм/|фея',[]],
['druid','Круг друидов','Особые','camp',{n:8,trees:.4},['друиды','лес'],'фея|зверь',[]],
['huntlodge','Охотничий домик','Особые','village',{n:1,trees:.45,big:1},['охотничий домик','лес'],'зверь',[]]];
const LTI=Object.fromEntries(LT.map(x=>[x[0],x]));
const GROUPS=['Подземелья','Пещеры','Природа','Поселения','Здания','Особые'];
const OUTD=new Set(['sky','nature','village','streets','camp','ruins','castle']);
/* ---------- генерация одной карты ---------- */
function generate(o){const lt=LTI[o.type]||LT[0];const W=o.W,H=o.H;const seed=o.seed||'1';const R=RNG(String(seed)+'|'+lt[0]);const G=G0(W,H,R);
 const p=Object.assign({},lt[4]);if(lt[3]==='nature'&&p.trees!=null)p.trees=Math.min(.7,p.trees*(.5+o.dens/100));
 ALG[lt[3]](G,p);
 const free=[];for(let i=0;i<W*H;i++)if(FREE.has(G.g[i]))free.push(i);
 const far=(i)=>!G.start||Math.hypot(i%W-G.start.x,((i/W)|0)-G.start.y)>Math.max(5,Math.min(W,H)*.3);
 const nearOK=i=>{const x=i%W,y=(i/W)|0;return![[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const t=G.get(x+a,y+b);return t==='door'||t==='stairs'})};
 const dang=o.dang/100;
 if(o.traps){const n=Math.round(free.length*.006*(.3+dang*1.7));for(let k=0;k<n;k++){const i=G.pick(free);if(FREE.has(G.g[i])&&far(i)&&nearOK(i))G.g[i]='trap'}}
 if(o.chests){const rs=G.rooms.length?G.rooms:[{cx:W>>1,cy:H>>1}];const n=Math.max(1,Math.round(rs.length*.35*(.5+dang)));for(let k=0;k<n;k++){const r=G.pick(rs);for(let t=0;t<12;t++){const x=r.cx+G.ri(-2,2),y=r.cy+G.ri(-2,2),c=G.get(x,y);if(c&&FREE.has(c)&&far(y*W+x)){G.set(x,y,'chest');break}}}}
 if(!o.doors)for(let i=0;i<W*H;i++)if(G.g[i]==='door')G.g[i]=FREE.has(G.g[i-1])?G.g[i-1]:'floor';
 const m={id:uid(),name:'',W,H,g:G.g,fog:Array(W*H).fill(0),tok:[],dec:[],links:[],style:'dark',theme:{склеп:'stone',пустыня:'sand',лес:'moss',инфернальное:'blood'}[lt[5][0]]||(OUTD.has(lt[3])?'moss':'stone'),light:!OUTD.has(lt[3])&&lt[3]!=='ship',grid:true,seed:Number(String(seed).replace(/\D/g,'').slice(0,9))||1,type:lt[3]==='cave'||lt[3]==='mine'||lt[3]==='slime'?'cave':OUTD.has(lt[3])?'forest':'dungeon',gen:Object.assign({},o),lt:lt[0]};
 if(o.dec)m.dec=furnish(G,R,[...(o.th?[o.th]:lt[5]),...(o.th2?[o.th2]:[])],o.dens/100,!OUTD.has(lt[3]));
 if(o.mons)m.tok.push(...spawn(G,R,lt,dang,o));
 if(o.pcs&&G.start)placePCs(m,G);
 if(o.fog){m.fog.fill(1);const s=G.start||{x:W>>1,y:H>>1};const rad=OUTD.has(lt[3])?6:4;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(Math.hypot(x-s.x,y-s.y)<=rad)m.fog[y*W+x]=0;const r0=G.rooms.find(r=>s.x>=r.x-1&&s.x<=r.x+r.w&&s.y>=r.y-1&&s.y<=r.y+r.h);if(r0)for(let y=r0.y-1;y<=r0.y+r0.h;y++)for(let x=r0.x-1;x<=r0.x+r0.w;x++)if(x>=0&&y>=0&&x<W&&y<H)m.fog[y*W+x]=0}
 m.name=o.name||(lt[1]+' «'+(['Чёрного Епископа','Ржавой Луны','Шепчущих Костей','Кривого Ворона','Седого Волка','Трёх Свечей','Утопленницы','Пепельной Короны','Старого Дуба','Красной Соли','Бледной Девы','Сломанного Колеса'][Math.floor(R()*12)])+'»');
 m._G={doorsAt:G.doorsAt||[],start:G.start,rooms:G.rooms};return m}
function furnish(G,R,themes,dens,indoor){const MD=window.MAPDECOR;if(!MD)return[];const ths=new Set(themes);const {W,H}=G;
 let pool=MD.items.filter(x=>x.th.some(t=>ths.has(t))&&x.w<=6&&x.h<=6);const any=MD.items.filter(x=>x.th.includes('любая')&&x.w<=4&&x.h<=4);if(pool.length<20)pool=pool.concat(any);
 if(!indoor)pool=pool.filter(x=>x.cat!=='Двери и окна'&&x.cat!=='Ковры');if(!pool.length)return[];
 const occ=new Uint8Array(W*H),occF=new Uint8Array(W*H);const free=[];for(let i=0;i<W*H;i++)if(FREE.has(G.g[i]))free.push(i);
 const n=Math.min(indoor?220:180,Math.round(free.length*dens*(indoor?.16:.07)));const out=[];
 const fl=pool.filter(x=>x.layer==='floor'),ob=pool.filter(x=>x.layer!=='floor');
 for(let k=0;k<n*10&&out.length<n;k++){const it=(fl.length&&R()<.2)?G.pick(fl):G.pick(ob.length?ob:fl);const r=Math.floor(R()*4),f=R()<.3;const w=r%2?it.h:it.w,h=r%2?it.w:it.h;
  const c=G.pick(free),x=c%W,y=(c/W)|0;let ok=true,wallN=false;
  for(let j=y;j<y+h&&ok;j++)for(let i=x;i<x+w;i++){const t=G.get(i,j);if(t==null||!FREE.has(t)||(it.layer==='floor'?occF[j*W+i]:occ[j*W+i])){ok=false;break}}
  if(!ok)continue;for(let j=y-1;j<=y+h&&ok;j++)for(let i=x-1;i<=x+w;i++){if(i>=x&&i<x+w&&j>=y&&j<y+h)continue;const t=G.get(i,j);if(t==='door'||t==='stairs')ok=false;if(t==='wall')wallN=true}
  if(!ok)continue;if(indoor&&it.solid&&it.layer!=='floor'&&!wallN&&R()<.75)continue;
  for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){if(it.layer==='floor')occF[j*W+i]=1;else occ[j*W+i]=1}
  out.push({id:it.id,x,y,r,f:f?1:0,s:1})}return out}
function crOf(m){return typeof m.cr==='number'?m.cr:parseFloat(String(m.cr).replace('1/8','.125').replace('1/4','.25').replace('1/2','.5'))||0}
function spawn(G,R,lt,dang,o){const {W,H}=G;const lv=players.length?players.reduce((a,p)=>a+(+p.lvl||+p.level||1),0)/players.length:3;const crMax=Math.max(.25,lv*(.2+dang*1.2));
 const f=lt[6]||'';const parts=f.split('|');const match=x=>parts.some(q=>q.startsWith('/')?new RegExp(q.slice(1,-1),'i').test(x.n+' '+(x.id||'')):String(x.ty||'').startsWith(q));
 let pool=(D.monsters||[]).filter(x=>crOf(x)<=crMax&&crOf(x)>=Math.min(crMax*.15,1)&&match(x));if(pool.length<2)pool=(D.monsters||[]).filter(x=>crOf(x)<=crMax&&match(x));if(!pool.length)pool=(D.monsters||[]).filter(x=>crOf(x)<=crMax);if(!pool.length)return[];
 const rooms=G.rooms.filter(r=>!G.start||Math.hypot(r.cx-G.start.x,r.cy-G.start.y)>6);const grp=Math.max(1,Math.min(10,Math.round((W*H/300)*(.4+dang*1.6))));const toks=[],cnt={},used=new Set();
 for(let k=0;k<grp;k++){const mo=G.pick(pool);const r=rooms.length?G.pick(rooms):{cx:G.ri(2,W-3),cy:G.ri(2,H-3)};const num=crOf(mo)>=crMax*.7?1:G.ri(1,Math.max(1,Math.round(1+dang*4)));
  for(let q=0;q<num&&toks.length<Math.round(3+dang*11);q++){for(let t=0;t<20;t++){const x=r.cx+G.ri(-2,2),y=r.cy+G.ri(-2,2),c=G.get(x,y);if(!c||BLOCK.has(c)||c==='door'||used.has(y*W+x))continue;used.add(y*W+x);cnt[mo.id]=(cnt[mo.id]||0)+1;const i=cnt[mo.id];
   toks.push({id:uid(),x,y,n:(mo.n[0]+i).slice(0,3),c:'#d42a22',k:'mon',mid:mo.id,nm:mo.n+' '+i,hp:mo.hp,mhp:mo.hp,ac:mo.ac,sz:mo.sz});break}}}return toks}
function placePCs(m,G){const {W}=G;const s=G.start;let k=0;const ps=players.slice(0,8);const ring=[[0,0],[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1],[2,0],[0,2],[-2,0],[0,-2]];
 for(const [dx,dy] of ring){if(k>=ps.length)break;const x=s.x+dx,y=s.y+dy,t=G.get(x,y);if(!t||BLOCK.has(t)||m.tok.some(z=>z.x===x&&z.y===y))continue;const p=ps[k++];m.tok.push({id:uid(),x,y,n:(p.name||'?')[0],c:'#d6b26a',k:'pc',pid:p.id,photo:p.photo||null})}}
function freeCell(m,pref){const W=m.W;const ok=i=>FREE.has(m.g[i])&&!(m.tok||[]).some(t=>t.y*W+t.x===i);if(pref&&ok(pref.y*W+pref.x))return pref;for(let r=1;r<Math.max(m.W,m.H);r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const x=(pref?pref.x:W>>1)+dx,y=(pref?pref.y:m.H>>1)+dy;if(x>=0&&y>=0&&x<W&&y<m.H&&ok(y*W+x))return{x,y}}return{x:0,y:0}}
function linkPair(a,ac,b,bc,la,lb){a.links=a.links||[];b.links=b.links||[];a.links.push({x:ac.x,y:ac.y,to:b.id,n:la});b.links.push({x:bc.x,y:bc.y,to:a.id,n:lb})}
/* генерация с цепочкой связанных карт */
function generateSet(o,depth){const m=generate(o);const made=[m];if(o.link&&depth<2){const lt=LTI[o.type];(lt[7]||[]).forEach(([t2,label],k)=>{if(made.length>6)return;const sub=LTI[t2];if(!sub)return;
  const small=['tavern','house','shop','cellar','tavern_up','ship_hold','keep','crypt'].includes(t2);const W2=small?Math.max(16,Math.min(28,Math.round(o.W*.8))):o.W,H2=small?Math.max(14,Math.min(24,Math.round(o.H*.7))):o.H;
  const kids=generateSet(Object.assign({},o,{type:t2,W:W2,H:H2,seed:String(o.seed)+'-'+t2,name:'',pcs:0}),depth+1);const c=kids[0];
  let ap=null;const G=m._G;if(G.doorsAt&&G.doorsAt[k]){ap={x:G.doorsAt[k].x,y:G.doorsAt[k].y}}else{const st=m.g.findIndex((t,i)=>t==='stairs'&&!(m.links||[]).some(l=>l.y*m.W+l.x===i));ap=st>=0?{x:st%m.W,y:(st/m.W)|0}:freeCell(m,G.rooms[(k+1)%Math.max(1,G.rooms.length)]?{x:G.rooms[(k+1)%G.rooms.length].cx,y:G.rooms[(k+1)%G.rooms.length].cy}:null);if(m.g[ap.y*m.W+ap.x]!=='door')m.g[ap.y*m.W+ap.x]='stairs'}
  let bp=c._G.start?freeCell(c,c._G.start):freeCell(c);const si=c.g.findIndex(t=>t==='stairs');if(si>=0&&!['ship_hold'].includes(t2))bp={x:si%c.W,y:(si/c.W)|0};if(c.g[bp.y*c.W+bp.x]!=='door')c.g[bp.y*c.W+bp.x]='stairs';
  c.name=label+' · '+m.name.replace(/^[^«]*/,'').trim();if(!c.name.includes('«'))c.name=label;linkPair(m,ap,c,bp,'⇄ '+label,'⇄ '+(lt[1]));made.push(...kids)})}
 return made}
KM.genSet=generateSet;KM.LOCTYPES=LT;
/* ---------- отрисовка декора и переходов ---------- */
const BC=new Map();const LORD={floor:0,object:1,top:2};
function bmp(id,r,f,S){const k=id+'|'+r+'|'+f+'|'+S;let c=BC.get(k);if(c)return c;const MD=window.MAPDECOR,o=MD&&MD.byId[id];if(!o)return null;const w=o.w*S,h=o.h*S;const a=document.createElement('canvas');a.width=w;a.height=h;MD.render(a.getContext('2d'),id,S,{seed:id});
 const rw=r%2?h:w,rh=r%2?w:h;c=document.createElement('canvas');c.width=rw;c.height=rh;const x=c.getContext('2d');x.translate(rw/2,rh/2);x.rotate(r*Math.PI/2);if(f)x.scale(-1,1);x.drawImage(a,-w/2,-h/2);a.width=a.height=0;BC.px=(BC.px||0)+rw*rh;if(BC.px>12e6||BC.size>400){BC.forEach(v=>{v.width=v.height=0});BC.clear();BC.px=rw*rh}BC.set(k,c);return c}
window.KM_DEC=function(g,m,CS){const MD=window.MAPDECOR;if(m.dec&&m.dec.length&&MD){const S=32;const arr=m._decS&&m._decS.n===m.dec.length?m._decS.a:(()=>{const a=m.dec.slice().sort((p,q)=>(LORD[p.l||(MD.byId[p.id]||{}).layer]??1)-(LORD[q.l||(MD.byId[q.id]||{}).layer]??1));Object.defineProperty(m,'_decS',{value:{n:m.dec.length,a},configurable:true,enumerable:false,writable:true});return a})();
  for(const d of arr){const b=bmp(d.id,d.r||0,d.f?1:0,S);if(!b)continue;const s=d.s||1;g.drawImage(b,d.x*CS,d.y*CS,b.width/S*CS*s,b.height/S*CS*s)}}
 (m.links||[]).forEach(l=>{const X=l.x*CS+CS/2,Y=l.y*CS+CS/2;g.save();g.strokeStyle='#e8c77a';g.lineWidth=2.5;g.setLineDash([4,3]);g.beginPath();g.arc(X,Y,CS*.46,0,7);g.stroke();g.setLineDash([]);g.fillStyle='#e8c77a';g.font=`700 ${CS*.42}px sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('⇄',X,Y);g.restore()})};
window.KM_SOLID=function(m,x,y){const MD=window.MAPDECOR;if(!m.dec||!MD)return false;for(const d of m.dec){const o=MD.byId[d.id];if(!o||!o.solid||o.layer==='floor')continue;const w=(d.r%2?o.h:o.w)*(d.s||1),h=(d.r%2?o.w:o.h)*(d.s||1);if(x>=d.x&&y>=d.y&&x<d.x+w&&y<d.y+h)return true}return false};
/* HP-кольцо и номер для фишек монстров */
const _dm=window.drawMap;window.drawMap=drawMap=function(g,m,CS,fogA){_dm(g,m,CS,fogA);(m.tok||[]).forEach(t=>{if(!t.mhp)return;if(fogA>=1&&m.fog[t.y*m.W+t.x])return;const X=t.x*CS+CS/2,Y=t.y*CS+CS/2,f=Math.max(0,Math.min(1,(t.hp==null?t.mhp:t.hp)/t.mhp));g.save();g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.6)';g.beginPath();g.arc(X,Y,CS*.47,0,7);g.stroke();g.strokeStyle=f>.5?'#5fbf4a':f>.25?'#e0b040':'#e03a2a';g.beginPath();g.arc(X,Y,CS*.47,-Math.PI/2,-Math.PI/2+f*Math.PI*2);g.stroke();g.restore()})};
/* ---------- интерфейс генератора ---------- */
const THS=(()=>{const c={};(window.MAPDECOR?MAPDECOR.items:[]).forEach(x=>x.th.forEach(t=>{if(t!=='любая'&&!t.startsWith('#'))c[t]=(c[t]||0)+1}));return Object.keys(c).sort((a,b)=>c[b]-c[a])})();
const DEF={type:'dungeon',W:24,H:24,dens:50,dang:40,th:'',th2:'',doors:1,traps:1,chests:1,mons:1,fog:1,dec:1,link:1,pcs:1,grp:'Подземелья'};
function genUI(re){const cur=curMap();const S=Object.assign({},DEF,LS.get('gen2',{}),re&&cur.gen?cur.gen:{});S.seed=re&&cur.gen?cur.gen.seed:String(Math.floor(Math.random()*999999));
 const chk=(id,l)=>`<label style="display:flex;align-items:center;gap:6px;min-height:40px;padding:0 4px"><input type="checkbox" data-o="${id}"${S[id]?' checked':''} style="width:22px;height:22px"> ${l}</label>`;
 openSheet(`<div class="sb-title">✦ Генератор локаций</div><div class="sb-sub">${LT.length} типов мест · выберите тип, размер и опции</div><button class="btn sm" id="gblank" style="margin-top:6px">▢ Пустая / простая карта</button>
 <input class="inp" id="gq" placeholder="Поиск типа: таверна, пещера, порт…" style="margin-top:8px">
 ${chips('grp',GROUPS.map(g=>[g,g]),S.grp)}
 <div id="glt"></div>
 <label class="f">Размер</label>${chips('sz',[['16','Малая 16×16'],['24','Средняя 24×24'],['36','Большая 36×36'],['50','Огромная 50×50']],[16,24,36,50].includes(+S.W)&&S.W===S.H?String(S.W):'')}
 <div class="row"><div class="grow"><label class="f">Ширина</label><input class="inp" id="gw" type="number" inputmode="numeric" value="${S.W}"></div><div class="grow"><label class="f">Высота</label><input class="inp" id="gh" type="number" inputmode="numeric" value="${S.H}"></div></div>
 <label class="f">Плотность декора и растительности: <b id="gdv">${S.dens}%</b></label><input type="range" id="gd" min="0" max="100" step="5" value="${S.dens}" style="width:100%;height:36px">
 <label class="f">Опасность (ловушки, враги, их сила): <b id="gav">${S.dang}%</b></label><input type="range" id="ga" min="0" max="100" step="5" value="${S.dang}" style="width:100%;height:36px">
 <div class="row"><div class="grow"><label class="f">Тема декора</label><select class="inp" id="gt"><option value="">Авто (по типу места)</option>${THS.map(t=>`<option${S.th===t?' selected':''}>${t}</option>`).join('')}</select></div><div class="grow"><label class="f">Смешать с темой</label><select class="inp" id="gt2"><option value="">—</option>${THS.map(t=>`<option${S.th2===t?' selected':''}>${t}</option>`).join('')}</select></div></div>
 <div class="row"><div class="grow"><label class="f">Зерно (одинаковое зерно = та же карта)</label><input class="inp" id="gs" value="${esc(S.seed)}"></div><button class="btn" id="gsr" style="align-self:flex-end;min-height:44px" aria-label="Случайное зерно">🎲 Новое</button></div>
 <div style="display:flex;flex-wrap:wrap;gap:2px 10px;margin-top:8px">${chk('doors','Двери')}${chk('traps','Ловушки')}${chk('chests','Сокровища')}${chk('mons','Враги')}${chk('pcs','Герои у входа')}${chk('dec','Расставить декор')}${chk('fog','Скрыть туманом')}${chk('link','Связанные карты (этажи, входы)')}</div>
 <div class="muted" id="glk" style="font-size:12.5px;margin-top:4px"></div>
 <div class="row" style="margin-top:14px;gap:8px">${re&&cur.gen?'<button class="btn red grow" id="gre" style="min-height:48px">↻ Перегенерировать эту карту</button>':''}<button class="btn ${re&&cur.gen?'':'red '}grow" id="ggo" style="min-height:48px">✦ Сгенерировать</button></div>
 <div class="muted" style="font-size:12px;margin-top:8px">1 клетка = 1,5 м. Всё сгенерированное можно править кистью, а декор — инструментом «Декор».</div>`,r=>{
  {const gb=$('#gblank',r);if(gb)gb.onclick=()=>KM.newMapOld();}
  const ltBox=$('#glt',r);
  const drawLT=()=>{const q=($('#gq',r).value||'').trim().toLowerCase();const list=LT.filter(x=>q?(x[1]+' '+x[5].join(' ')+' '+x[2]).toLowerCase().includes(q):x[2]===S.grp);ltBox.innerHTML=list.length?chips('lt',list.map(x=>[x[0],x[1]]),S.type):'<div class="muted">Ничего не нашлось</div>';
   const lk=LTI[S.type];$('#glk',r).textContent=lk&&lk[7].length?'Связанные карты для «'+lk[1]+'»: '+lk[7].map(x=>x[1]).join(', '):'';};
  drawLT();$('#gq',r).oninput=drawLT;
  r.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;const c=b.closest('[data-chips]');if(!c)return;const n=c.dataset.chips,v=b.dataset.v;c.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b));try{navigator.vibrate&&navigator.vibrate(5)}catch(_){}
   if(n==='grp'){S.grp=v;$('#gq',r).value='';drawLT()}if(n==='lt'){S.type=v;drawLT()}if(n==='sz'){$('#gw',r).value=$('#gh',r).value=v}});
  $('#gd',r).oninput=e=>$('#gdv',r).textContent=e.target.value+'%';$('#ga',r).oninput=e=>$('#gav',r).textContent=e.target.value+'%';
  $('#gsr',r).onclick=()=>{$('#gs',r).value=String(Math.floor(Math.random()*999999))};
  const read=()=>{const o=Object.assign({},S,{W:Math.max(10,Math.min(64,+$('#gw',r).value||24)),H:Math.max(10,Math.min(64,+$('#gh',r).value||24)),dens:+$('#gd',r).value,dang:+$('#ga',r).value,th:$('#gt',r).value,th2:$('#gt2',r).value,seed:$('#gs',r).value.trim()||'1'});$$('[data-o]',r).forEach(c=>o[c.dataset.o]=c.checked?1:0);const keep=Object.assign({},o);delete keep.seed;LS.set('gen2',keep);return o};
  $('#ggo',r).onclick=()=>{const o=read();let set;try{set=generateSet(o,0)}catch(e){console.error(e);return toast('Не получилось: '+e.message)}set.forEach(x=>{delete x._G;maps.push(x)});mapCur=set[0].id;saveMaps();view={s:1,x:0,y:0};closeSheet();rMap();toast(set.length>1?`Создано карт: ${set.length} (связаны переходами ⇄)`:'Карта готова · зерно '+o.seed)};
  const gr=$('#gre',r);if(gr)gr.onclick=()=>{const o=read();histPush(cur);const nm=generate(Object.assign({},o,{name:cur.name}));['g','fog','tok','dec','W','H','theme','light','type','gen','lt','seed'].forEach(k=>cur[k]=nm[k]);cur.links=(cur.links||[]).filter(l=>maps.some(x=>x.id===l.to)).map(l=>{const c=freeCell(cur,{x:l.x,y:l.y});cur.g[c.y*cur.W+c.x]=cur.g[c.y*cur.W+c.x]==='door'?'door':'stairs';return Object.assign(l,c)});saveMaps();closeSheet();rMap();toast('Перегенерировано · зерно '+o.seed)}})}
KM.genUI=genUI;
{const _nm=window.newMap||newMap;KM.newMapOld=_nm;window.newMap=newMap=function(){genUI(0)}}
/* ---------- встраивание: кнопки в «Карте», меню, переходы ---------- */
const _rMap=window.rMap||rMap;window.rMap=rMap=function(){_rMap.apply(this,arguments);const m=curMap();const nb=$('#mNew');if(nb&&!$('#mGen2')){nb.insertAdjacentHTML('beforebegin','<button class="btn sm red" id="mGen2" aria-label="Генератор локаций">✦ Генератор</button>');$('#mGen2').onclick=()=>genUI(0)}
 const mw=$('#mw');if(mw&&(m.links||[]).length&&!$('#mLinks')){mw.insertAdjacentHTML('beforebegin',`<div class="row" id="mLinks" style="flex-wrap:wrap;gap:6px;margin:0 0 8px">${m.links.filter(l=>maps.some(x=>x.id===l.to)).map((l,i)=>`<button class="btn sm" data-lk="${i}">${esc(l.n)}</button>`).join('')}</div>`);$$('#mLinks [data-lk]').forEach(b=>b.onclick=()=>{const l=m.links[+b.dataset.lk];if(!l)return;mapCur=l.to;saveMaps();view={s:1,x:0,y:0};rMap();toast('Переход: '+curMap().name)})}};
const _mm=window.mapMenu||mapMenu;window.mapMenu=mapMenu=function(){_mm.apply(this,arguments);const m=curMap();const L=$('#sheetPage .list')||$$('#sheetPage .list').pop();if(!L||$('#mxG2'))return;L.insertAdjacentHTML('afterbegin',`<button class="btn red" id="mxG2">✦ Генератор локаций…</button>${m.gen?'<button class="btn" id="mxR2">🎲 Перегенерировать (новое зерно)</button><button class="btn" id="mxE2">⚙ Изменить параметры генерации</button>':''}`);
 $('#mxG2').onclick=()=>genUI(0);const r2=$('#mxR2');if(r2){r2.onclick=()=>{const o=Object.assign({},m.gen,{seed:String(Math.floor(Math.random()*999999)),name:m.name});histPush(m);const nm=generate(o);['g','fog','tok','dec','W','H','gen','seed'].forEach(k=>m[k]=nm[k]);(m.links||[]).forEach(l=>{const c=freeCell(m,{x:l.x,y:l.y});l.x=c.x;l.y=c.y;m.g[c.y*m.W+c.x]='stairs'});saveMaps();closeSheet();rMap();toast('Новый вариант · зерно '+o.seed)};$('#mxE2').onclick=()=>genUI(1)}};
const _nm=window.newMap||newMap;window.newMap=newMap=function(){_nm.apply(this,arguments);const r=$('#sheetPage');if(r&&!$('#ng2')){const t=r.querySelector('.sb-sub');t&&t.insertAdjacentHTML('afterend',`<button class="btn red" id="ng2" style="width:100%;margin-top:10px;min-height:48px">✦ Расширенный генератор (${LT.length} типов мест)</button>`);$('#ng2').onclick=()=>genUI(0)}};
window.KM&&(KM.gen2=generate);
}

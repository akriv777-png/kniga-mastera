/* mapdecor0.js — ядро библиотеки декора карт (см. schema.md, раздел MAPDECOR).
   MD.items[]: {id,n,cat,th[],w,h,solid,layer,draw(ctx,S,p),v?}. draw рисует в (0,0)-(w*S,h*S), вид сверху. p={seed,mat,dmg} необязательно. */
(function(){
const MD=window.MAPDECOR=window.MAPDECOR||{items:[],byId:{}};
const INK='#22170e';
MD.INK=INK;
MD.rng=function(seed){let a=typeof seed==='string'?[...seed].reduce((h,c)=>(h*31+c.charCodeAt(0))|0,7):seed|0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
MD.P={wood:['#5a3c22','#7a5432','#9a6e44','#b38658'],dwood:['#2e1f14','#45301e','#5c4129','#6e5034'],lwood:['#8f7550','#b0946a','#c9ad80','#dcc49a'],stone:['#4a4844','#6a6761','#8a867e','#a8a399'],dstone:['#26252a','#3a3940','#4e4d55','#64636b'],marble:['#bdb8ae','#d6d1c6','#e8e3d8','#f4f0e6'],iron:['#2b2d30','#45484d','#63676d','#8a8f96'],brass:['#6e4f1c','#9a7328','#c49a3c','#e2c068'],gold:['#7a5a10','#b08a1c','#d8b440','#f2da7a'],red:['#4a1410','#6e1e18','#952b22','#b8463a'],blue:['#14233e','#1f3560','#2f4f86','#4a6fa8'],green:['#1c2e18','#2d4626','#406236','#5a8048'],purple:['#2a1636','#3f2250','#5a3470','#7a4f94'],cloth:['#6a5a40','#8a7656','#a8946e','#c6b28a'],bone:['#8a8068','#aaa084','#c8bea0','#e2d9bc'],leaf:['#1e2e14','#2f4a1e','#46682a','#62873a'],water:['#0f2430','#1a3a4a','#2a5a6a','#4a8090'],lava:['#3a0a04','#8a1e06','#d8520e','#ffb030'],ice:['#4a6e84','#7aa0b8','#a8c8dc','#dcf0fa'],sand:['#7a6440','#a08654','#c2a874','#dcc898'],moss:['#2a3418','#3e4c22','#56662e','#74843e']};
MD.mat=(p,def)=>MD.P[(p&&p.mat)||def]||MD.P[def];
MD.ink=(c,S,k)=>{c.strokeStyle=INK;c.lineWidth=Math.max(1,S*(k||0.035));c.lineJoin='round';c.lineCap='round'};
MD.shadow=(c,S,f,k)=>{c.save();c.shadowColor='rgba(0,0,0,0.5)';c.shadowBlur=S*(k||0.18);c.shadowOffsetX=S*0.06;c.shadowOffsetY=S*0.08;f();c.restore()};
MD.rr=(c,x,y,w,h,r)=>{r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()};
MD.circ=(c,x,y,r)=>{c.beginPath();c.arc(x,y,Math.max(0.1,r),0,Math.PI*2)};
MD.ell=(c,x,y,rx,ry,a)=>{c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),a||0,0,Math.PI*2)};
MD.poly=(c,pts)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath()};
MD.blob=(c,x,y,r,rnd,n,j)=>{n=n||11;j=j==null?0.25:j;const pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,rr=r*(1-j/2+rnd()*j);pts.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr])}c.beginPath();for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n];const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;i?c.quadraticCurveTo(p[0],p[1],mx,my):c.moveTo(mx,my)}const p=pts[0],q=pts[1];c.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2);c.closePath();return pts};
MD.lg=(c,x0,y0,x1,y1,cols)=>{const g=c.createLinearGradient(x0,y0,x1,y1);cols.forEach((k,i)=>g.addColorStop(i/(cols.length-1),k));return g};
MD.rg=(c,x,y,r0,r1,cols)=>{const g=c.createRadialGradient(x,y,Math.max(0,r0),x,y,Math.max(.1,r1));cols.forEach((k,i)=>g.addColorStop(i/(cols.length-1),k));return g};
// деревянная доска/панель с волокнами
MD.wood=(c,S,x,y,w,h,pal,rnd,dir,planks)=>{c.save();MD.rr(c,x,y,w,h,S*0.04);c.fillStyle=MD.lg(c,x,y,x+w,y+h,[pal[2],pal[1]]);c.fill();c.clip();const hor=dir!=='v';const L=hor?h:w;const n=planks||Math.max(1,Math.round(L/(S*0.28)));c.strokeStyle='rgba(20,12,6,0.55)';c.lineWidth=Math.max(1,S*0.018);for(let i=1;i<n;i++){const t=i/n*L;c.beginPath();hor?(c.moveTo(x,y+t),c.lineTo(x+w,y+t)):(c.moveTo(x+t,y),c.lineTo(x+t,y+h));c.stroke()}c.strokeStyle='rgba(30,18,8,0.22)';c.lineWidth=Math.max(.5,S*0.01);const g=Math.round((hor?h:w)/(S*0.07));for(let i=0;i<g;i++){const t=rnd()*L;c.beginPath();if(hor){c.moveTo(x,y+t);c.bezierCurveTo(x+w*.3,y+t+(rnd()-.5)*S*.1,x+w*.7,y+t+(rnd()-.5)*S*.1,x+w,y+t)}else{c.moveTo(x+t,y);c.bezierCurveTo(x+t+(rnd()-.5)*S*.1,y+h*.3,x+t+(rnd()-.5)*S*.1,y+h*.7,x+t,y+h)}c.stroke()}
 for(let i=0;i<n*1.2;i++){c.fillStyle='rgba(20,10,4,0.35)';MD.ell(c,x+rnd()*w,y+rnd()*h,S*0.02,S*0.012,hor?0:Math.PI/2);c.fill()}
 c.restore();MD.ink(c,S);MD.rr(c,x,y,w,h,S*0.04);c.stroke()};
// камень с фаской
MD.stoneBlock=(c,S,x,y,w,h,pal,rnd)=>{MD.rr(c,x,y,w,h,S*0.05);c.fillStyle=MD.lg(c,x,y,x+w,y+h,[pal[3],pal[1]]);c.fill();c.save();MD.rr(c,x,y,w,h,S*0.05);c.clip();for(let i=0;i<w*h/(S*S)*14;i++){c.fillStyle=`rgba(${rnd()<.5?'0,0,0':'255,255,255'},${0.04+rnd()*0.08})`;MD.circ(c,x+rnd()*w,y+rnd()*h,S*(0.01+rnd()*0.03));c.fill()}c.restore();MD.ink(c,S);MD.rr(c,x,y,w,h,S*0.05);c.stroke()};
MD.cracks=(c,S,x,y,w,h,rnd,n)=>{c.save();c.strokeStyle='rgba(10,6,3,0.7)';c.lineWidth=Math.max(.7,S*0.015);for(let i=0;i<(n||3);i++){let px=x+rnd()*w,py=y+rnd()*h;c.beginPath();c.moveTo(px,py);for(let k=0;k<4;k++){px+=(rnd()-.5)*S*.35;py+=(rnd()-.5)*S*.35;c.lineTo(Math.min(x+w,Math.max(x,px)),Math.min(y+h,Math.max(y,py)))}c.stroke()}c.restore()};
MD.glow=(c,x,y,r,col)=>{c.save();c.globalCompositeOperation='lighter';c.fillStyle=MD.rg(c,x,y,0,r,[col,'rgba(0,0,0,0)']);MD.circ(c,x,y,r);c.fill();c.restore()};
MD.flame=(c,S,x,y,k)=>{k=k||1;MD.glow(c,x,y,S*0.35*k,'rgba(255,170,60,0.55)');c.fillStyle='#ffcf5a';c.beginPath();c.moveTo(x,y-S*.09*k);c.quadraticCurveTo(x+S*.06*k,y,x,y+S*.05*k);c.quadraticCurveTo(x-S*.06*k,y,x,y-S*.09*k);c.fill();c.fillStyle='#fff4c0';MD.circ(c,x,y+S*.01*k,S*.02*k);c.fill()};
MD.add=function(o){if(MD.byId[o.id])return;o.layer=o.layer||'object';o.w=o.w||1;o.h=o.h||1;o.solid=o.solid!=null?o.solid:true;o.th=o.th||['любая'];MD.byId[o.id]=o;MD.items.push(o)};
// отрисовка с подготовкой: MD.render(ctx,id,S,p) — рисует в текущих координатах
MD.render=function(c,id,S,p){const o=MD.byId[id];if(!o)return;p=Object.assign({seed:id},p||{});c.save();try{o.draw(c,S,p,MD.rng(p.seed))}catch(e){console.warn('mapdecor',id,e)}if(p.dmg)MD.cracks(c,S,0,0,o.w*S,o.h*S,MD.rng(p.seed+'d'),Math.round(2+p.dmg*3));c.restore()};
MD.CAT=['Мебель','Декор','Ёмкости','Свет','Природа','Обломки','Магия','Культ','Ловушки','Вода и лава','Двери и окна','Ковры','Статуи','Механизмы','Еда','Кости и тела'];
})();

'use strict';
/* Живая карта игрока: фон от Мастера + фишки, туман уже в фоне. Пан/зум жестами. */
(()=>{const st={s:1,x:0,y:0},img=new Image();let src='',lastM=null,lastCv=null,fk='';
function fit(cv,m){const W=m.W*m.CS,H=m.H*m.CS;st.s=Math.min(cv.width/W,cv.height/H);st.x=(cv.width-W*st.s)/2;st.y=(cv.height-H*st.s)/2}
function draw(){const box=document.getElementById('pmap');const m=window.__kpMap;if(!box||!m)return;const cv=box.querySelector('canvas');const dpr=Math.min(2,devicePixelRatio||1);const w=box.clientWidth,h=box.clientHeight;if(cv.width!==w*dpr||cv.height!==h*dpr){cv.width=w*dpr;cv.height=h*dpr;cv.style.width=w+'px';cv.style.height=h+'px'}
 if(m.src!==src){src=m.src;img.onload=draw;img.src=src;}if(cv!==lastCv){lastCv=cv;if(!cv._b){cv._b=1;bind(cv)}}const k=m.n+m.W+'x'+m.H;if(fk!==k){fk=k;fit(cv,m)}
 const g=cv.getContext('2d'),CS=m.CS||24;g.setTransform(1,0,0,1,0,0);g.fillStyle='#070505';g.fillRect(0,0,cv.width,cv.height);g.setTransform(st.s,0,0,st.s,st.x,st.y);if(img.complete&&img.naturalWidth)g.drawImage(img,0,0,m.W*CS,m.H*CS);
 (m.tok||[]).forEach(t=>{const X=t.x*CS+CS/2,Y=t.y*CS+CS/2,r=CS*.42;if(t.cur){g.save();g.strokeStyle='#ffd36a';g.lineWidth=3;g.shadowColor='#ffd36a';g.shadowBlur=10;g.beginPath();g.arc(X,Y,r+5,0,7);g.stroke();g.restore()}g.fillStyle=t.c;g.beginPath();g.arc(X,Y,r,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.7)';g.lineWidth=2;g.stroke();g.fillStyle='#fff';g.font=`700 ${CS*.4}px sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(t.n.slice(0,2),X,Y+1);
  if(t.dead){g.strokeStyle='rgba(20,0,0,.9)';g.lineWidth=3;g.beginPath();g.moveTo(X-r,Y-r);g.lineTo(X+r,Y+r);g.moveTo(X+r,Y-r);g.lineTo(X-r,Y+r);g.stroke()}
  if(t.st&&st.s>.9){g.font=`600 ${CS*.28}px sans-serif`;g.fillStyle='rgba(0,0,0,.7)';const tw=g.measureText(t.st).width+6;g.fillRect(X-tw/2,Y+r+2,tw,CS*.34);g.fillStyle='#f3e6c8';g.fillText(t.st,X,Y+r+2+CS*.17)}});
 const p=m.ping;if(p){const X=p.x*CS+CS/2,Y=p.y*CS+CS/2,k=(Date.now()/600)%1;g.strokeStyle=`rgba(255,90,60,${1-k})`;g.lineWidth=3;g.beginPath();g.arc(X,Y,CS*(.4+k*1.4),0,7);g.stroke();g.fillStyle='rgba(255,90,60,.5)';g.beginPath();g.arc(X,Y,CS*.3,0,7);g.fill()}
 lastM=m}
function bind(cv){const P=new Map();let base=null;
 cv.addEventListener('touchstart',e=>{e.preventDefault();[...e.changedTouches].forEach(t=>P.set(t.identifier,[t.clientX,t.clientY]));base=snap()},{passive:false});
 cv.addEventListener('touchmove',e=>{e.preventDefault();const dpr=cv.width/cv.clientWidth;[...e.changedTouches].forEach(t=>P.has(t.identifier)&&P.set(t.identifier,[t.clientX,t.clientY]));const now=snap();if(!base||now.n!==base.n){base=now;return}
  if(now.n>=2){const k=Math.max(.3,Math.min(8,base.s*now.d/base.d))/st.s;const r=cv.getBoundingClientRect(),cx=(now.cx-r.left)*dpr,cy=(now.cy-r.top)*dpr;st.x=cx-(cx-st.x)*k;st.y=cy-(cy-st.y)*k;st.s*=k}
  st.x+=(now.cx-base.cx)*dpr;st.y+=(now.cy-base.cy)*dpr;base=snap();draw()},{passive:false});
 const end=e=>{[...e.changedTouches].forEach(t=>P.delete(t.identifier));base=snap()};cv.addEventListener('touchend',end);cv.addEventListener('touchcancel',end);
 function snap(){const a=[...P.values()];if(!a.length)return null;const cx=a.reduce((s,p)=>s+p[0],0)/a.length,cy=a.reduce((s,p)=>s+p[1],0)/a.length;const d=a.length>1?Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])||1:1;return{n:a.length,cx,cy,d,s:st.s}}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.pm-fs');if(!b)return;const box=document.getElementById('pmap');box.classList.toggle('fs');b.textContent=box.classList.contains('fs')?'✕':'⤢';lastCv=null;const cv=box.querySelector('canvas');cv.width=0;draw()});
setInterval(()=>{const m=window.__kpMap,box=document.getElementById('pmap');if(!box||!m)return;const cv=box.querySelector('canvas');if(m!==lastM||cv!==lastCv||m.ping||cv.width!==Math.round(box.clientWidth*Math.min(2,devicePixelRatio||1)))draw()},120);
window.KPMap={draw,st}})();

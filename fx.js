'use strict';
/* ===== STAGE 1 FX: ambient, sigils, transitions, settings ===== */
const FXS=Object.assign({calm:false,amb:true},LS.get('fx',{}));
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const calm=()=>FXS.calm||RM.matches;
function applyFx(){document.documentElement.classList.toggle('calm',!!FXS.calm);const a=$('#fxAmb');if(a)a.style.display=FXS.amb&&!calm()?'':'none'}
const svgURI=s=>`url("data:image/svg+xml,${encodeURIComponent(s)}")`;
/* corner filigree (4 rotations) + divider + empty sigil */
(function(){const C=r=>svgURI(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><g transform='rotate(${r} 20 20)' fill='none' stroke='#d9b46a' stroke-width='1.1' stroke-linecap='round'><path d='M3 37V12Q3 3 12 3h25'/><path d='M7 33V15q0-8 8-8h18' opacity='.55'/><path d='M3 12q7 1 9-4M12 3q-1 7 4 9' /><circle cx='13' cy='13' r='2.2' fill='#b3160f' stroke='#e8c879'/><path d='M16 13q5-3 9 0M13 16q-3 5 0 9' opacity='.8'/></g></svg>`);
 const ORN=svgURI(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 18' preserveAspectRatio='none'><defs><linearGradient id='g'><stop offset='0' stop-color='#d9b46a' stop-opacity='0'/><stop offset='.5' stop-color='#e8c879'/><stop offset='1' stop-color='#d9b46a' stop-opacity='0'/></linearGradient></defs><path d='M10 9H170M230 9H390' stroke='url(%23g)' stroke-width='1'/><path d='M150 9q12-8 24 0q-12 8-24 0M250 9q-12-8-24 0q12 8 24 0' fill='none' stroke='#d9b46a' stroke-width='.9'/><path d='M200 1l8 8-8 8-8-8z' fill='#8e0f0b' stroke='#e8c879'/><circle cx='200' cy='9' r='2' fill='#ffd27a'/><circle cx='182' cy='9' r='1.5' fill='#d42a22'/><circle cx='218' cy='9' r='1.5' fill='#d42a22'/></svg>`);
 const ES=svgURI(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='#b3160f' stroke-width='1.2'><circle cx='50' cy='50' r='47' stroke='#d9b46a' stroke-dasharray='1 3'/><circle cx='50' cy='50' r='40'/><circle cx='50' cy='50' r='26' stroke='#d9b46a'/><path d='M50 10 84 70H16zM50 90 16 30h68z' opacity='.8'/><circle cx='50' cy='50' r='6' fill='#8e0f0b'/>${[...Array(12)].map((_,i)=>`<path transform='rotate(${i*30} 50 50)' d='M50 4v5M48 6h4' stroke='#d9b46a'/>`).join('')}</svg>`);
 const st=document.createElement('style');st.textContent=`:root{--orn:${ORN};--esig:${ES}}.card::after,.hero::after,details.rule::after{background:${C(0)} top left/20px no-repeat,${C(90)} top right/20px no-repeat,${C(270)} bottom left/20px no-repeat,${C(180)} bottom right/20px no-repeat!important}`;document.head.append(st)})();
/* rune ring svg */
function runeRing(r=46,col='#d9b46a',n=24){const R='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';let t='';for(let i=0;i<n;i++){const a=i/n*Math.PI*2;t+=`<text x="${(50+(r-6)*Math.cos(a)).toFixed(1)}" y="${(50+(r-6)*Math.sin(a)).toFixed(1)}" transform="rotate(${(a*180/Math.PI+90).toFixed(0)} ${(50+(r-6)*Math.cos(a)).toFixed(1)} ${(50+(r-6)*Math.sin(a)).toFixed(1)})" font-size="7" text-anchor="middle" dominant-baseline="middle" fill="${col}">${R[i%R.length]}</text>`}
 return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" fill="none" stroke="${col}" stroke-width=".6"/><circle cx="50" cy="50" r="${r-12}" fill="none" stroke="${col}" stroke-width=".6"/>${t}</svg>`}
/* ambient layers */
(function(){const app=$('#app');
 app.insertAdjacentHTML('afterbegin',`<div class="fx-par p1" style="width:560px;margin:-280px 0 0 -280px;opacity:.07">${runeRing(48,'#e8c879',32)}</div><div class="fx-par p2" style="width:860px;margin:-430px 0 0 -430px;opacity:.05">${runeRing(48,'#d42a22',40)}</div><div id="fxCandle"></div><canvas id="fxAmb"></canvas><div id="fxVig"></div><div id="fxNoise"></div>`);
 const P=$$('.fx-par');page.addEventListener('scroll',()=>{if(calm())return;const y=page.scrollTop;P[0].style.transform=`translateY(${-y*.08}px)`;P[1].style.transform=`translateY(${-y*.15}px)`},{passive:true});
 const cv=$('#fxAmb'),g=cv.getContext('2d');let W,H;const fit=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight};fit();addEventListener('resize',fit);
 const ps=[...Array(26)].map((_,i)=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,v:.2+Math.random()*.6,s:Math.random()*1.8+.4,k:i%3,ph:Math.random()*6}));let last=0;
 function tick(t){requestAnimationFrame(tick);if(document.hidden||calm()||!FXS.amb||t-last<33)return;last=t;g.clearRect(0,0,W,H);
  for(const p of ps){p.y-=p.v*(p.k?0.6:1);p.x+=Math.sin(t/1400+p.ph)*.35;if(p.y<-10){p.y=H+10;p.x=Math.random()*W}
   const a=.35+.35*Math.sin(t/400+p.ph);if(p.k===0){g.fillStyle=`rgba(255,${90+60*a|0},40,${a})`;g.shadowColor='rgba(255,60,20,.9)';g.shadowBlur=6}else{g.fillStyle=`rgba(200,180,160,${a*.35})`;g.shadowBlur=0}
   g.beginPath();g.arc(p.x,p.y,p.s,0,7);g.fill()}}
 requestAnimationFrame(tick);applyFx();RM.addEventListener?.('change',applyFx)})();
/* ink press ripple */
document.addEventListener('pointerdown',e=>{if(calm()||e.target.closest('input,textarea,select,[contenteditable]'))return;const c=e.target.closest('.card,.btn,.cb');if(!c)return;const r=c.getBoundingClientRect(),s=Math.max(r.width,r.height)*1.2;const i=document.createElement('i');i.className='ink';i.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;if(getComputedStyle(c).position==='static')c.style.position='relative';c.style.overflow='hidden';c.append(i);setTimeout(()=>i.remove(),650)},{passive:true});
/* header: drawn sigil + rune rings + gear */
const _header=header;
header=function(t,s,sig,gi){return _header(t,s,sig,gi).replace('<div class="ph">',`<div class="ph"><div class="ring2">${runeRing(46,'#e8c879',18)}</div><div class="ring2 r3">${runeRing(46,'#d42a22',24)}</div><button class="fx-gear" data-gear aria-label="Настройки">⚙</button>`)};
function drawSigils(root){if(calm())return;$$('.ph .sig, .empty-sig',root).forEach(s=>{s.querySelectorAll('path,circle').forEach(p=>p.setAttribute('pathLength','1'));s.classList.remove('draw');void s.offsetWidth;s.classList.add('draw')})}
new MutationObserver(()=>drawSigils(page)).observe(page,{childList:true});
document.addEventListener('click',e=>{if(e.target.closest('[data-gear]'))openSettings()});
/* skeleton loaders in lazy lists */
const _lazy=lazyList;lazyList=function(c,items,ri){if(calm()||items.length<8)return _lazy(c,items,ri);c.innerHTML='<div class="skel"></div><div class="skel"></div><div class="skel"></div>';setTimeout(()=>_lazy(c,items,ri),140)};
/* ink-bleed transition */
const _go=go;let lastTap={x:innerWidth/2,y:innerHeight-40};document.addEventListener('pointerdown',e=>{lastTap={x:e.clientX,y:e.clientY}},{passive:true});
go=function(i,d){const prev=S.sec;_go(i,d);if(S.sec!==prev&&!calm()){const b=document.createElement('div');b.className='inkbleed';b.style.setProperty('--x',lastTap.x+'px');b.style.setProperty('--y',lastTap.y+'px');$('#app').append(b);setTimeout(()=>b.remove(),600)}};
KM.go=go;
/* dice: nat20 summoning / nat1 crack */
function summon(){if(calm())return;const pts=[...Array(5)].map((_,i)=>{const a=-Math.PI/2+i*4*Math.PI/5;return (50+40*Math.cos(a)).toFixed(1)+' '+(50+40*Math.sin(a)).toFixed(1)}).join(' L');
 const d=document.createElement('div');d.className='fx-burst';d.innerHTML=`<svg viewBox="0 0 100 100" fill="none" stroke-linecap="round"><circle cx="50" cy="50" r="46" stroke="#ffd27a" stroke-width=".8"/><circle cx="50" cy="50" r="42" stroke="#ff5a30" stroke-width=".5" stroke-dasharray="2 2"/><path d="M${pts}z" stroke="#ffd27a" stroke-width="1"/><circle cx="50" cy="50" r="20" stroke="#ff8a3a" stroke-width=".7"/></svg>`;d.querySelector('svg').insertAdjacentHTML('beforeend',runeRing(46,'#ffe2a0',28).replace(/^<svg[^>]*>|<\/svg>$/g,''));document.body.append(d);navigator.vibrate&&navigator.vibrate([30,40,60]);setTimeout(()=>d.remove(),1700)}
function crack(){if(calm())return;const d=document.createElement('div');d.className='fx-crack';let p='';const seg=(x,y,a,n)=>{let s=`M${x} ${y}`;for(let i=0;i<n;i++){a+=(Math.random()-.5)*.9;x+=Math.cos(a)*7;y+=Math.sin(a)*7;s+=` L${x.toFixed(1)} ${y.toFixed(1)}`}return s};
 for(let k=0;k<7;k++)p+=`<path pathLength="1" d="${seg(50,45,k/7*Math.PI*2,6+Math.random()*6|0)}" stroke="#0a0000" stroke-width="${1.6-k*.12}" fill="none"/><path pathLength="1" d="${seg(50,45,k/7*Math.PI*2+.1,4)}" stroke="#7a0000" stroke-width=".4" fill="none"/>`;
 d.innerHTML=`<svg viewBox="0 0 100 100" preserveAspectRatio="none">${p}</svg>`;document.body.append(d);$('#app').classList.add('shake');navigator.vibrate&&navigator.vibrate(120);setTimeout(()=>{d.remove();$('#app').classList.remove('shake')},1600)}
const _calcAtk=calcAtk;let atkKey='';calcAtk=function(B){_calcAtk(B);const need=cs.adv?2:1;const k=JSON.stringify(cs.a)+cs.adv;if(k===atkKey)return;atkKey=k;if(cs.a.length<need)return;const a=cs.a.slice(0,need);const kept=cs.adv>0?Math.max(...a):cs.adv<0?Math.min(...a):a[0];if(kept===20)summon();else if(kept===1)crack()};
const _doRoll=doRoll;doRoll=function(){_doRoll();setTimeout(()=>{const r=$('#res');if(!r)return;if(r.classList.contains('crit'))summon();else if(r.classList.contains('fail'))crack()},620)};
KM.summon=summon;KM.crack=crack;
/* settings */
function openSettings(){const T=(k,l,d)=>`<div class="set-row"><div><b>${l}</b><div class="muted" style="font-size:12.5px">${d}</div></div><button class="tog${FXS[k]?' on':''}" data-k="${k}" aria-label="${l}"></button></div>`;
 openSheet(`<div class="sb-title">Настройки</div><div class="sb-sub">Анимации и эффекты</div>${T('calm','Меньше анимации','Отключает пульсации, частицы, переходы чернил и вспышки кубиков. Система «уменьшить движение» учитывается автоматически.')}${T('amb','Угли и пепел','Летящие искры и пыль на фоне страниц.')}
 <div class="muted" style="font-size:12px;margin-top:14px">${RM.matches?'В системе включено «Уменьшение движения» — анимации уже приглушены.':''} Все данные хранятся только на этом устройстве (в памяти браузера).</div>`,r=>{$$('.tog',r).forEach(b=>b.onclick=()=>{const k=b.dataset.k;FXS[k]=!FXS[k];LS.set('fx',FXS);b.classList.toggle('on',FXS[k]);applyFx()})})}
KM.settings=openSettings;
/* cover: blinking eye following touch */
(function(){const cv=$('#cover');if(!cv)return;const f=$('.face',cv);
 f.insertAdjacentHTML('beforeend',`<svg class="eyefx" viewBox="0 0 720 1280" preserveAspectRatio="xMidYMid slice"><defs><clipPath id="eyeC"><path d="M268 728Q320 664 377 664Q440 664 488 728Q440 792 377 794Q318 792 268 728z"/></clipPath><radialGradient id="scl"><stop offset="0" stop-color="#b98468"/><stop offset=".55" stop-color="#a06a52" stop-opacity=".9"/><stop offset="1" stop-color="#5a1a10" stop-opacity="0"/></radialGradient></defs>
 <g clip-path="url(#eyeC)"><ellipse cx="377" cy="727" rx="46" ry="46" fill="url(#scl)"/><image id="irisI" href="${window.KM_PLAYER?'../':''}img/iris.png" x="337" y="687" width="80" height="80"/>
 <path class="lid" d="M258 660H498V732Q440 700 377 700Q316 700 258 732z" fill="#2a0806"/><path class="lid2" d="M258 800H498V726Q440 760 377 760Q316 760 258 726z" fill="#1d0504"/></g></svg>`);
 const ir=$('#irisI',f);let tx=0,ty=0,cx=0,cy=0;
 const mv=(x,y)=>{const r=f.getBoundingClientRect();const dx=(x-r.left)/r.width-.5,dy=(y-r.top)/r.height-.57;tx=Math.max(-1,Math.min(1,dx*2.4))*26;ty=Math.max(-1,Math.min(1,dy*2.4))*12};
 cv.addEventListener('pointermove',e=>mv(e.clientX,e.clientY),{passive:true});cv.addEventListener('touchmove',e=>mv(e.touches[0].clientX,e.touches[0].clientY),{passive:true});cv.addEventListener('pointerdown',e=>mv(e.clientX,e.clientY),{passive:true});
 let idle=0;(function loop(){if(cv.classList.contains('gone'))return;requestAnimationFrame(loop);if(calm()){ir.setAttribute('transform','');return}idle++;if(idle%240===0){tx=(Math.random()-.5)*40;ty=(Math.random()-.5)*16}cx+=(tx-cx)*.12;cy+=(ty-cy)*.12;ir.setAttribute('transform',`translate(${cx.toFixed(1)} ${cy.toFixed(1)})`)})();
 KM.eye=(x,y)=>mv(x,y)})();
/* loot reveal: sigil unlock */
document.addEventListener('click',e=>{if(!e.target.closest('#gen'))return;setTimeout(()=>{const o=$('#lootOut');if(!o)return;o.classList.remove('reveal');void o.offsetWidth;o.classList.add('reveal');if(calm())return;
 o.insertAdjacentHTML('afterbegin',`<div class="fx-unlock">${runeRing(46,'#ffb347',20).replace('<svg','<svg style="filter:drop-shadow(0 0 8px #ff7a20)"')}</div>`);setTimeout(()=>$('.fx-unlock',o)?.remove(),1200)},0)});
render();

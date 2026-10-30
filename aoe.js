'use strict';
/* ===== Области заклинаний на сетке (1 кл = 1,5 м): сфера, конус, линия, куб, цилиндр ===== */
(()=>{const SH={sph:'Сфера',cone:'Конус',line:'Линия',cube:'Куб',cyl:'Цилиндр'};
function cov(a,x,y){const px=x+.5-a.ox,py=y+.5-a.oy,d=Math.hypot(px,py),c=Math.cos(a.a||0),s=Math.sin(a.a||0),u=px*c+py*s,v=-px*s+py*c;
 if(a.sh==='sph'||a.sh==='cyl')return d<=a.L+.01;if(a.sh==='cone')return d>.5&&d<=a.L+.01&&Math.abs(Math.atan2(v,u))<=Math.atan(.5)+.02;if(a.sh==='line')return u>.3&&u<=a.L+.01&&Math.abs(v)<=(a.W||1)/2+.01;if(a.sh==='cube')return u>.3&&u<=a.L+.01&&Math.abs(v)<=a.L/2+.01;return false}
function cells(a,W,H){const o=[];const R=Math.ceil(a.L+2);for(let y=Math.max(0,Math.floor(a.oy-R));y<Math.min(H,a.oy+R);y++)for(let x=Math.max(0,Math.floor(a.ox-R));x<Math.min(W,a.ox+R);x++)if(cov(a,x,y))o.push([x,y]);return o}
function draw(g,a,CS,W,H){if(!a)return;g.save();if(a.r&&a.cx!=null){g.setLineDash([CS*.3,CS*.2]);g.strokeStyle='rgba(120,180,255,.8)';g.lineWidth=2;g.beginPath();g.arc((a.cx+.5)*CS,(a.cy+.5)*CS,a.r*CS,0,7);g.stroke();g.setLineDash([])}
 g.fillStyle='rgba(255,110,30,.33)';g.strokeStyle='rgba(255,140,40,.9)';g.lineWidth=1;cells(a,W,H).forEach(([x,y])=>{g.fillRect(x*CS,y*CS,CS,CS);g.strokeRect(x*CS+.5,y*CS+.5,CS-1,CS-1)});
 const X=a.ox*CS,Y=a.oy*CS,L=a.L*CS;g.strokeStyle='#ffb347';g.lineWidth=3;g.beginPath();if(a.sh==='sph'||a.sh==='cyl')g.arc(X,Y,L,0,7);else{g.save();g.translate(X,Y);g.rotate(a.a||0);if(a.sh==='cone'){g.moveTo(0,0);g.lineTo(L,L/2);g.lineTo(L,-L/2);g.closePath()}else{const w=a.sh==='line'?(a.W||1)*CS:L;g.rect(0,-w/2,L,w)}g.restore()}g.stroke();g.restore();g.save();g.fillStyle='#ffb347';g.beginPath();g.arc(X,Y,CS*.15,0,7);g.fill();g.restore()}
function parse(sp){const t=(sp.ds||'')+' '+(sp.r||''),n=x=>parseFloat(String(x).replace(',','.'))/1.5;let m;
 if(m=t.match(/конус\D{0,25}?(\d+(?:[.,]\d+)?)\s*м/i))return{sh:'cone',L:n(m[1])};if(m=t.match(/лини\D{0,30}?(\d+(?:[.,]\d+)?)\s*м[^.]{0,50}?ширин\D{0,10}(\d+(?:[.,]\d+)?)\s*м/i))return{sh:'line',L:n(m[1]),W:n(m[2])};if(m=t.match(/лини\D{0,30}?(\d+(?:[.,]\d+)?)\s*м/i))return{sh:'line',L:n(m[1]),W:1};
 if(m=t.match(/куб\D{0,25}?(\d+(?:[.,]\d+)?)\s*м/i))return{sh:'cube',L:n(m[1])};if(m=t.match(/цилиндр\D{0,25}?(\d+(?:[.,]\d+)?)\s*м/i))return{sh:'cyl',L:n(m[1])};if(m=t.match(/(?:сфер|радиус|круг)\D{0,25}?(\d+(?:[.,]\d+)?)\s*м/i))return{sh:'sph',L:n(m[1])};return null}
window.KM_AOE={cov,cells,draw,parse,SH};
if(!window.KM||!window.drawMap||typeof combat==='undefined')return; /* дальше — только книга Мастера */
const _d=window.drawMap;window.drawMap=drawMap=function(g,m,CS2,fogA){_d(g,m,CS2,fogA);if(m.aoe)draw(g,m.aoe,CS2,m.W,m.H)};
const M=()=>KM.mapCur&&KM.mapCur(),re=()=>{KM.mapSave&&KM.mapSave();KM.mapDraw&&KM.mapDraw();try{KM.table.push(true)}catch(e){}};
const tokAt=(m,x,y)=>(m.tok||[]).find(t=>t.x===x&&t.y===y);
function hits(m){const a=m.aoe;if(!a)return[];return (m.tok||[]).filter(t=>t.cid&&cov(a,t.x,t.y)).map(t=>combat.list.find(c=>c.id===t.cid)).filter(c=>c&&!c.dead)}
function avg(d){const m=String(d||'').match(/(\d+)к(\d+)(?:\s*\+\s*(\d+))?/);return m?Math.floor(+m[1]*(+m[2]+1)/2)+(+m[3]||0):0}
function place(sp,man){const m=M();if(!m)return toast('Нет карты');const cur=combat.list[combat.turn],ct=cur&&(m.tok||[]).find(t=>t.cid===cur.id);const p=sp?parse(sp):man;if(!p)return toast('Не нашёл размер области — выберите вручную');
 const cx=ct?ct.x:Math.floor(m.W/2),cy=ct?ct.y:Math.floor(m.H/2),rm=sp&&String(sp.r||'').match(/(\d+(?:[.,]\d+)?)\s*м/);const self=p.sh!=='sph'&&p.sh!=='cyl';
 m.aoe=Object.assign({ox:cx+.5,oy:cy+.5,a:0,cx,cy,r:rm?parseFloat(rm[1].replace(',','.'))/1.5:0,n:sp?sp.n:SH[p.sh],sp:sp?sp.id:'',ed:1},p);if(!self){m.aoe.ox+=Math.min(3,m.aoe.r||3);}closeSheet&&closeSheet();re();bar()}
function pick(){const area=DATA.spells.filter(s=>parse(s));const row=s=>`<button class="it" data-sp="${s.id}" style="width:100%;text-align:left"><div class="grow"><div class="t">${esc(s.n)} <small class="muted">${s.l?s.l+' ур.':'заговор'}</small></div><div class="m">${SH[parse(s).sh]} ${(parse(s).L*1.5).toLocaleString('ru')} м · ${esc(s.dmg||'')}</div></div></button>`;
 openSheet(`<div class="sb-title" data-noshow>✷ Область на карте</div><div class="sb-sub">Заклинание или своя форма · 1 клетка = 1,5 м</div><input class="inp" id="aq" placeholder="Поиск заклинания (огненный шар, конус…)"><div class="list" id="al" style="margin-top:6px">${area.slice(0,25).map(row).join('')}</div>
 <div class="sec-h">Своя форма</div><div class="chips" id="ash">${Object.entries(SH).map(([k,v],i)=>`<button class="chip${i?'':' on'}" data-sh="${k}">${v}</button>`).join('')}</div><div class="row"><label class="grow">Размер, м<input class="inp" id="asz" type="number" inputmode="decimal" value="6"></label><label class="grow">Ширина линии, м<input class="inp" id="aw" type="number" inputmode="decimal" value="1.5"></label></div><button class="btn red" id="ago" style="width:100%;margin-top:8px">Поставить на карту</button>`,r=>{
 let sh='sph';const bindL=()=>r.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>place(DATA.spells.find(s=>s.id===b.dataset.sp)));bindL();
 r.querySelector('#aq').oninput=e=>{const q=e.target.value.toLowerCase().trim();r.querySelector('#al').innerHTML=area.filter(s=>!q||(s.n+' '+(s.dmg||'')+' '+SH[parse(s).sh]).toLowerCase().includes(q)).slice(0,25).map(row).join('');bindL()};
 r.querySelectorAll('[data-sh]').forEach(b=>b.onclick=()=>{sh=b.dataset.sh;r.querySelectorAll('[data-sh]').forEach(x=>x.classList.toggle('on',x===b))});
 r.querySelector('#ago').onclick=()=>place(null,{sh,L:(+r.querySelector('#asz').value||6)/1.5,W:(+r.querySelector('#aw').value||1.5)/1.5})})}
function apply(){const m=M(),a=m&&m.aoe;if(!a)return;const ids=hits(m).map(c=>c.id);const sp=a.sp&&DATA.spells.find(s=>s.id===a.sp);const cur=combat.list[combat.turn];let d='';
 if(sp){const dm=String(sp.dmg||'').match(/(\d+к\d+(?:\s*\+\s*\d+)?)\s*([а-яё]+)?/i);if(dm)d=`${avg(dm[1])} (${dm[1].replace(/\s/g,'')}) ${dm[2]||''}`;const sv=String(sp.ds||'').match(/спасбросок\s+([А-Яа-яё]+)/i);if(sv)d+=` спасбросок ${sv[1]} СЛ 13`}
 KM.combat.multi(cur,{n:a.n,d},ids)}
function bar(){const s=document.getElementById('cmbstrip');if(!s)return;let b=document.getElementById('aoebar');const m=M(),a=m&&m.aoe;
 if(!s.querySelector('#cmbaoe')){const x=document.createElement('button');x.className='btn sm';x.id='cmbaoe';x.textContent='✷ Область';x.onclick=pick;s.querySelector('.row').append(x)}
 if(!a){b&&b.remove();return}if(!b){b=document.createElement('div');b.id='aoebar';b.className='aoe-bar'}if(b.parentNode!==s)s.append(b);const H=hits(m);const k=JSON.stringify([a.n,a.ed,H.map(c=>c.id)]);if(b._k===k)return;b._k=k;
 b.innerHTML=`<div class="m"><b>✷ ${esc(a.n)}</b> · ${SH[a.sh]} ${(a.L*1.5).toLocaleString('ru')} м${a.ed?' · <small>один палец: тащите центр или поворачивайте</small>':''}</div><div class="m">Задеты: ${H.map(c=>esc(c.name)).join(', ')||'никто'}</div><div class="row" style="gap:6px;margin-top:4px"><button class="btn sm red" id="aap"${H.length?'':' disabled'}>⚡ Спасброски и урон (${H.length})</button><button class="btn sm" id="aed">${a.ed?'✓ Зафиксировать':'✎ Двигать'}</button><button class="btn sm dark" id="axx">✕ Убрать</button></div>`;
 b.querySelector('#aap').onclick=apply;b.querySelector('#aed').onclick=()=>{a.ed=a.ed?0:1;re();bar()};b.querySelector('#axx').onclick=()=>{delete m.aoe;re();bar()}}
setInterval(bar,700);KM.aoe={place,pick,hits,apply,bar};
/* жесты: в режиме правки один палец двигает/поворачивает шаблон; тап по фишке в бою — карточка */
let ed=null,tp=null,np=0;const C=(e)=>{const cv=document.getElementById('mc'),v=KM.mapView&&KM.mapView();if(!cv||!v)return null;const r=cv.getBoundingClientRect();return{x:((e.clientX-r.left)-v.x)/v.s/32,y:((e.clientY-r.top)-v.y)/v.s/32}};
document.addEventListener('pointerdown',e=>{if(!e.target.closest||!e.target.closest('#mc'))return;np++;const m=M(),a=m&&m.aoe;tp=np===1?{x:e.clientX,y:e.clientY,t:Date.now()}:null;
 if(a&&a.ed&&np===1){const p=C(e);if(!p)return;e.stopPropagation();const near=Math.hypot(p.x-a.ox,p.y-a.oy)<1.2;ed={mv:near||a.sh==='sph'||a.sh==='cyl',id:e.pointerId}}else if(np>1)ed=null},true);
document.addEventListener('pointermove',e=>{if(!ed||e.pointerId!==ed.id)return;e.stopPropagation();const m=M(),a=m&&m.aoe,p=C(e);if(!a||!p)return;if(ed.mv){a.ox=Math.round(p.x*2)/2;a.oy=Math.round(p.y*2)/2}else a.a=Math.round(Math.atan2(p.y-a.oy,p.x-a.ox)/(Math.PI/12))*(Math.PI/12);KM.mapDraw&&KM.mapDraw();bar()},true);
const up=e=>{np=Math.max(0,np-1);if(ed&&e.pointerId===ed.id){e.stopPropagation();ed=null;re();return}if(tp&&e.type==='pointerup'&&Math.hypot(e.clientX-tp.x,e.clientY-tp.y)<8&&Date.now()-tp.t<400&&combat.list.length){const m=M(),p=C(e);const t=m&&p&&tokAt(m,Math.floor(p.x),Math.floor(p.y));const c=t&&t.cid&&combat.list.find(z=>z.id===t.cid);if(c)setTimeout(()=>KM.combat.cSheet(c),60)}tp=null};
document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);
const st=document.createElement('style');st.textContent='.aoe-bar{margin-top:6px;padding:6px;border-radius:8px;background:rgba(255,120,40,.12);border:1px solid rgba(255,140,40,.4)}';document.head.append(st)})();

'use strict';
/* ===== Фишки: долгое нажатие = меню, связь с боем, пинг игрокам, инерция пана ===== */
(()=>{const CS=32;
const cOf=t=>t&&t.cid&&combat.list.find(c=>c.id===t.cid);
const _d=window.drawMap;window.drawMap=drawMap=function(g,m,CS2,fogA){(m.tok||[]).forEach(t=>{const c=cOf(t);if(c){t.hp=c.hp;t.mhp=c.max;t.dead=!!c.dead}});const all=m.tok;if(fogA>=1&&all)m.tok=all.filter(t=>!t.hid);try{_d(g,m,CS2,fogA)}finally{m.tok=all}
 const cur=combat.list[combat.turn];(m.tok||[]).forEach(t=>{if(fogA>=1&&m.fog[t.y*m.W+t.x])return;const X=t.x*CS2+CS2/2,Y=t.y*CS2+CS2/2;if(cur&&t.cid===cur.id){g.save();g.strokeStyle='#ffd36a';g.lineWidth=4;g.shadowColor='#ffd36a';g.shadowBlur=12;g.beginPath();g.arc(X,Y,CS2*.6,0,7);g.stroke();g.restore()}if(t.dead){g.save();g.strokeStyle='rgba(20,0,0,.85)';g.lineWidth=4;g.beginPath();g.moveTo(X-CS2*.3,Y-CS2*.3);g.lineTo(X+CS2*.3,Y+CS2*.3);g.moveTo(X+CS2*.3,Y-CS2*.3);g.lineTo(X-CS2*.3,Y+CS2*.3);g.stroke();g.restore()}});
 if(m.ping&&Date.now()-m.ping.t<20000){const X=m.ping.x*CS2+CS2/2,Y=m.ping.y*CS2+CS2/2;g.save();g.strokeStyle='#ff5a3c';g.fillStyle='rgba(255,90,60,.25)';g.lineWidth=3;[0.5,1,1.5].forEach(r=>{g.beginPath();g.arc(X,Y,CS2*r,0,7);g.stroke()});g.beginPath();g.arc(X,Y,CS2*.35,0,7);g.fill();g.font=`700 ${CS2*.8}px sans-serif`;g.textAlign='center';g.fillStyle='#ff5a3c';g.fillText('📍',X,Y-CS2*.6);g.restore()}};
function menu(m,c){const t=(m.tok||[]).find(z=>z.x===c.x&&z.y===c.y);const cb=cOf(t);const re=()=>{saveMaps();KM.mapDraw&&KM.mapDraw();try{KM.table&&KM.table.push(true)}catch(e){}};
 openSheet(`<div class="sb-title" data-noshow>${t?'Фишка «'+esc(t.n)+'»':'Клетка '+String.fromCharCode(65+c.x%26)+(c.y+1)}</div><div class="sb-sub">${t?(cb?`В бою: ${esc(cb.name)} · хиты ${cb.hp}/${cb.max} · КД ${cb.ac}`:'Не в бою'):'Пустая клетка'}</div><div class="list" style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
 ${t?`${cb?`<button class="btn red" id="tkC">⚔ Открыть в бою (урон, состояния)</button>`:`<button class="btn red" id="tkA">⚔ Добавить в бой (инициатива)</button>`}<button class="btn" id="tkN">✎ Переименовать</button><button class="btn" id="tkH">${t.hid?'👁 Показать игрокам':'🙈 Скрыть от игроков'}</button><button class="btn dark" id="tkD">🗑 Удалить фишку</button>`:''}
 <button class="btn" id="tkP">📍 Отметить точку для игроков</button></div>`,r=>{const on=(s,f)=>{const e=r.querySelector(s);if(e)e.onclick=f};
  on('#tkP',()=>{m.ping={x:c.x,y:c.y,t:Date.now()};re();closeSheet();toast('Отметка видна игрокам 20 с');setTimeout(()=>{if(m.ping&&Date.now()-m.ping.t>=20000){m.ping=null;re()}},20500)});
  on('#tkN',()=>{const v=prompt('Имя фишки',t.n);if(v){histPush(m);t.n=v.slice(0,12);re();closeSheet()}});
  on('#tkH',()=>{t.hid=!t.hid;re();closeSheet()});
  on('#tkD',()=>{histPush(m);m.tok=m.tok.filter(z=>z!==t);re();closeSheet();toast('Фишка удалена — «↶» вернёт')});
  on('#tkC',()=>{closeSheet();KM.go(SECTIONS.findIndex(x=>x[0]==='combat'));setTimeout(()=>KM.combat&&KM.combat.cSheet&&KM.combat.cSheet(cb),350)});
  on('#tkA',()=>{const mon=t.mon&&(window.DATA&&DATA.monsters||[]).find(x=>x.id===t.mon||x.n===t.mon);const p=t.k==='pc'&&players.find(x=>x.name[0]===t.n[0]||x.name===t.n);
   if(p&&!combat.list.some(x=>x.pid===p.id)){combat.list.push({id:uid(),pid:p.id,base:p.name,name:p.name,init:0,dex:0,hp:p.hp,max:p.maxhp||p.max||p.hp,ac:p.ac||10,pc:true,conds:[],eco:{}});t.cid=combat.list[combat.list.length-1].id}
   else if(p){t.cid=combat.list.find(x=>x.pid===p.id).id}
   else{const hp=t.mhp||(mon&&mon.hp)||10;combat.list.push({id:uid(),base:t.n,name:mon?mon.n+(t.num?' '+t.num:''):t.n,init:Math.ceil(Math.random()*20)+(mon&&mon.st?Math.floor((mon.st[1]-10)/2):0),dex:0,hp:t.hp??hp,max:hp,ac:(mon&&mon.ac)||12,pc:false,mon:mon?mon.id:null,conds:[],eco:{}});t.cid=combat.list[combat.list.length-1].id}
   try{sortC()}catch(e){}save();re();closeSheet();toast('В бою: '+(cOf(t)||{}).name)})})}
function bind(){const cv=document.getElementById('mc');if(!cv||cv._tk)return;cv._tk=1;const pts=new Map();let lp=null,vel=null,inert=0;
 const cell=(cx,cy)=>{const r=cv.getBoundingClientRect();const x=Math.floor(((cx-r.left)-view.x)/view.s/CS),y=Math.floor(((cy-r.top)-view.y)/view.s/CS);const m=curMap();return x>=0&&y>=0&&x<m.W&&y<m.H?{x,y}:null};
 cv.addEventListener('pointerdown',e=>{cancelAnimationFrame(inert);pts.set(e.pointerId,{x:e.clientX,y:e.clientY,t:performance.now()});vel={vx:0,vy:0};clearTimeout(lp&&lp.t);lp=null;if(pts.size>1)return;
  const c=cell(e.clientX,e.clientY);if(!c||(!mt.locked&&['paint','erase','fog'].includes(mt.tool)))return;lp={x:e.clientX,y:e.clientY,t:setTimeout(()=>{if(!lp||pts.size!==1)return;const m=curMap();lp.fired=1;navigator.vibrate&&navigator.vibrate(25);const tk=(m.tok||[]).find(z=>z.x===c.x&&z.y===c.y);if(drag0(m,tk))return;menu(m,c)},550)}},true);
 const drag0=(m,tk)=>false;
 cv.addEventListener('pointermove',e=>{const p=pts.get(e.pointerId);if(!p)return;const now=performance.now(),dt=Math.max(1,now-p.t);if(pts.size===2){vel={vx:.7*vel.vx+.15*(e.clientX-p.x)/dt,vy:.7*vel.vy+.15*(e.clientY-p.y)/dt}}pts.set(e.pointerId,{x:e.clientX,y:e.clientY,t:now});if(lp&&Math.hypot(e.clientX-lp.x,e.clientY-lp.y)>10){clearTimeout(lp.t);lp=null}},true);
 const up=e=>{const was=pts.size;pts.delete(e.pointerId);if(lp){clearTimeout(lp.t);if(lp.fired){e.stopPropagation()}lp=null}
  if(was===2&&vel&&Math.hypot(vel.vx,vel.vy)>.25){let vx=vel.vx*16,vy=vel.vy*16;const step=()=>{vx*=.92;vy*=.92;view.x+=vx;view.y+=vy;KM.mapDraw&&KM.mapDraw();if(Math.hypot(vx,vy)>.4)inert=requestAnimationFrame(step);else LS.set('mapview',view)};inert=requestAnimationFrame(step)}};
 cv.addEventListener('pointerup',up,true);cv.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);if(lp)clearTimeout(lp.t);lp=null},true);
 cv.addEventListener('contextmenu',e=>e.preventDefault())}
const _r=window.rMap||rMap;window.rMap=rMap=function(){_r.apply(this,arguments);bind()};
// бой меняется → перерисовать карту (кольца хитов/текущий ход)
const _rc=window.rCombat;if(_rc){window.rCombat=rCombat=function(){_rc.apply(this,arguments)}}
})();

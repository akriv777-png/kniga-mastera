'use strict';
/* ===== Декор на карте: палитра (MAPDECOR), поиск, поворот/отражение/размер/слой, перетаскивание одним пальцем ===== */
(()=>{const CS=32,LAY=[['floor','Пол'],['object','Предмет'],['top','Сверху']];
const MDo=()=>window.MAPDECOR;const oOf=d=>MDo()&&MDo().byId[d.id];
const dims=d=>{const o=oOf(d)||{w:1,h:1},s=d.s||1;return {w:(d.r%2?o.h:o.w)*s,h:(d.r%2?o.w:o.h)*s}};
const thumbs=new Map();
function thumb(id){if(thumbs.has(id))return thumbs.get(id);const MD=MDo(),o=MD.byId[id];const S=Math.max(6,Math.floor(56/Math.max(o.w,o.h)));const c=document.createElement('canvas');c.width=o.w*S;c.height=o.h*S;try{MD.render(c.getContext('2d'),id,S,{seed:id})}catch(e){}const u=c.toDataURL();thumbs.set(id,u);return u}
let st={q:'',cat:'',lim:48};
function palette(){const MD=MDo();if(!MD||!MD.items.length)return toast('Библиотека декора не загружена');const cats=[...new Set(MD.items.map(x=>x.cat))].sort();
 openSheet(`<div class="sb-title" data-noshow>Декор для карты</div><div class="sb-sub">${MD.items.length} предметов · тап — выбрать, затем тап по клетке карты</div>
 <input class="inp" id="dq" placeholder="Поиск: бочка, стол, костёр…" value="${esc(st.q)}" autocomplete="off">
 <div class="chips" id="dcat" style="margin-top:8px;flex-wrap:wrap;display:flex;gap:6px"><button class="chip${st.cat?'':' on'}" data-c="">Все</button>${cats.map(c=>`<button class="chip${st.cat===c?' on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
 <div id="dgrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px"></div><button class="btn" id="dmore" style="width:100%;margin-top:8px">Показать ещё</button>`,r=>{
  const grid=r.querySelector('#dgrid'),more=r.querySelector('#dmore');
  const list=()=>{const q=st.q.trim().toLowerCase();return MD.items.filter(x=>(!st.cat||x.cat===st.cat)&&(!q||(x.n+' '+x.cat+' '+(x.th||[]).join(' ')).toLowerCase().includes(q)))};
  const draw=()=>{const L=list();grid.innerHTML=L.slice(0,st.lim).map(x=>`<button class="dcell${mt.decSel===x.id?' on':''}" data-id="${x.id}" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;min-height:96px;border-radius:10px;border:1px solid ${mt.decSel===x.id?'#e0574c':'rgba(196,161,90,.3)'};background:rgba(0,0,0,.25);color:inherit"><img src="${thumb(x.id)}" alt="" style="max-width:56px;max-height:56px;image-rendering:auto"><small style="font-size:11.5px;line-height:1.2;text-align:center">${esc(x.n)}</small><small class="muted" style="font-size:10px">${x.w}×${x.h}</small></button>`).join('')||'<div class="muted">Ничего не найдено</div>';more.style.display=L.length>st.lim?'':'none';more.textContent=`Показать ещё (${L.length-st.lim})`};
  r.querySelector('#dq').oninput=e=>{st.q=e.target.value;st.lim=48;draw()};
  r.querySelector('#dcat').onclick=e=>{const b=e.target.closest('[data-c]');if(!b)return;st.cat=b.dataset.c;st.lim=48;r.querySelectorAll('#dcat .chip').forEach(c=>c.classList.toggle('on',c===b));draw()};
  more.onclick=()=>{st.lim+=48;draw()};
  grid.onclick=e=>{const b=e.target.closest('[data-id]');if(!b)return;mt.decSel=b.dataset.id;mt.decPick=null;LS.set('decSel',mt.decSel);closeSheet();opts();toast('Выбрано: '+MD.byId[mt.decSel].n+' — тапните клетку')};draw()})}
const m=()=>curMap();
function sel(){const M=m();return M&&M.dec&&mt.decPick!=null?M.dec[mt.decPick]:null}
function redraw(){const M=m();if(M)delete M._decS;KM.mapDraw&&KM.mapDraw();box()}
function box(){const w=document.getElementById('mw');if(!w)return;let b=document.getElementById('dbox');const d=mt.tool==='decor'?sel():null;if(!d){b&&b.remove();return}if(!b){b=document.createElement('div');b.id='dbox';b.style.cssText='position:absolute;pointer-events:none;border:2px dashed #e0574c;border-radius:4px;box-shadow:0 0 0 2px rgba(0,0,0,.5);z-index:3';w.appendChild(b)}const D=dims(d),k=CS*view.s;b.style.left=(view.x+d.x*k)+'px';b.style.top=(view.y+d.y*k)+'px';b.style.width=D.w*k+'px';b.style.height=D.h*k+'px'}
function opts(){const O=document.getElementById('mopts');if(!O||mt.tool!=='decor')return;const MD=MDo();const it=mt.decSel&&MD&&MD.byId[mt.decSel];const d=sel();const o=d&&oOf(d);
 O.innerHTML=`<div class="row" style="align-items:center;gap:8px">${it?`<img src="${thumb(it.id)}" alt="" style="width:40px;height:40px;object-fit:contain;background:rgba(0,0,0,.3);border-radius:8px">`:''}<div class="grow"><small class="muted">Ставить</small><div><b>${it?esc(it.n):'не выбрано'}</b></div></div><button class="btn sm red" id="dpal">Выбрать декор</button></div>
 ${d?`<div class="card" style="margin-top:8px"><div class="row" style="align-items:center"><b class="grow">Выбран: ${esc(o?o.n:d.id)}</b><button class="btn sm" id="dx" aria-label="Снять выбор">✕</button></div>
 <div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px"><button class="btn sm" id="drot">⟳ Повернуть</button><button class="btn sm" id="dflip">⇋ Отразить</button><button class="btn sm" id="dsm">− Меньше</button><button class="btn sm" id="dbg">＋ Больше</button><span class="muted" style="align-self:center">×${d.s||1}</span></div>
 <div class="row" style="gap:6px;margin-top:6px;align-items:center"><small class="muted">Слой:</small>${LAY.map(([k,l])=>`<button class="chip${(d.l||(o&&o.layer)||'object')===k?' on':''}" data-ly="${k}">${l}</button>`).join('')}</div>
 <div class="row" style="gap:6px;margin-top:6px"><button class="btn sm" id="ddup">⧉ Копия</button><button class="btn sm dark" id="ddel">🗑 Удалить</button></div></div>`:''}
 <div class="muted" style="font-size:12.5px;margin-top:6px">Тап по пустой клетке — поставить. Тап по предмету — выбрать; одним пальцем — перетащить. Двумя пальцами — двигать и масштабировать карту.</div>`;if(!O._sc){O._sc=1;requestAnimationFrame(()=>{const q=O.getBoundingClientRect(),lim=innerHeight-110;if(q.top+64>lim)scrollBy({top:q.top+64-lim,behavior:'smooth'})})}
 const on=(s,f)=>{const e=O.querySelector(s);if(e)e.onclick=f};const ch=f=>{const M=m(),d=sel();if(!d)return;histPush(M);f(d);saveMaps();redraw();opts()};
 on('#dpal',palette);on('#dx',()=>{mt.decPick=null;box();opts()});
 on('#drot',()=>ch(d=>d.r=((d.r||0)+1)%4));on('#dflip',()=>ch(d=>d.f=d.f?0:1));on('#dsm',()=>ch(d=>d.s=Math.max(.5,(d.s||1)-.25)));on('#dbg',()=>ch(d=>d.s=Math.min(3,(d.s||1)+.25)));
 O.querySelectorAll('[data-ly]').forEach(b=>b.onclick=()=>ch(d=>d.l=b.dataset.ly));
 on('#ddup',()=>{const M=m(),d=sel();histPush(M);const c=Object.assign({},d,{x:Math.min(M.W-1,d.x+1)});M.dec.push(c);mt.decPick=M.dec.length-1;saveMaps();redraw();opts()});
 on('#ddel',()=>{const M=m(),d=sel();histPush(M);M.dec.splice(mt.decPick,1);mt.decPick=null;saveMaps();redraw();opts();KM.undoToast?KM.undoToast('Декор удалён',()=>{histMove(M,'hist','redo');redraw()}):toast('Удалено — «↶» вернёт')})}
function hit(M,x,y){if(!M.dec)return -1;const LO={floor:0,object:1,top:2};let best=-1,bl=-1;M.dec.forEach((d,i)=>{const D=dims(d);if(x>=d.x&&y>=d.y&&x<d.x+D.w&&y<d.y+D.h){const l=LO[d.l||(oOf(d)||{}).layer]??1;if(l>=bl){bl=l;best=i}}});return best}
function bind(){const cv=document.getElementById('mc');if(!cv||cv._dec)return;cv._dec=1;const pts=new Map();let g=null;
 const cell=(cx,cy)=>{const r=cv.getBoundingClientRect();return {fx:((cx-r.left)-view.x)/view.s/CS,fy:((cy-r.top)-view.y)/view.s/CS}};
 cv.addEventListener('pointerdown',e=>{if(mt.tool!=='decor'||mt.locked)return;pts.set(e.pointerId,1);if(pts.size>1){if(g&&g.drag&&g.moved){const d=m().dec[g.i];d.x=g.ox;d.y=g.oy;redraw()}g=null;return}
  const M=m(),c=cell(e.clientX,e.clientY);const i=hit(M,Math.floor(c.fx),Math.floor(c.fy));g={x:e.clientX,y:e.clientY,t:Date.now(),c,i,drag:i>=0&&i===mt.decPick,moved:0};if(g.drag){const d=M.dec[i];g.ox=d.x;g.oy=d.y;g.dx=c.fx-d.x;g.dy=c.fy-d.y}},true);
 cv.addEventListener('pointermove',e=>{if(!g||pts.size>1)return;if(Math.hypot(e.clientX-g.x,e.clientY-g.y)>8)g.moved=1;if(g.drag&&g.moved){const M=m(),d=M.dec[g.i],c=cell(e.clientX,e.clientY),D=dims(d);d.x=Math.max(0,Math.min(M.W-Math.ceil(D.w),Math.round(c.fx-g.dx)));d.y=Math.max(0,Math.min(M.H-Math.ceil(D.h),Math.round(c.fy-g.dy)));KM.mapDraw&&KM.mapDraw();box()}},true);
 const up=e=>{pts.delete(e.pointerId);if(!g||pts.size)return;const G=g;g=null;const M=m();
  if(G.drag&&G.moved){if(G.ox!==M.dec[G.i].x||G.oy!==M.dec[G.i].y){const d=M.dec[G.i],nx=d.x,ny=d.y;d.x=G.ox;d.y=G.oy;histPush(M);d.x=nx;d.y=ny;saveMaps()}redraw();return}
  if(G.moved||Date.now()-G.t>600)return;
  if(G.i>=0){mt.decPick=G.i;box();opts();return}
  if(!mt.decSel){toast('Сначала выберите декор');palette();return}
  const o=MDo().byId[mt.decSel];if(!o)return;histPush(M);M.dec=M.dec||[];const x=Math.max(0,Math.min(M.W-o.w,Math.floor(G.c.fx-o.w/2+.5))),y=Math.max(0,Math.min(M.H-o.h,Math.floor(G.c.fy-o.h/2+.5)));M.dec.push({id:o.id,x,y,r:0,f:0,s:1});mt.decPick=M.dec.length-1;saveMaps();redraw();opts();KM.haptic&&KM.haptic()};
 cv.addEventListener('pointerup',up,true);cv.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);g=null},true);
 (function loop(){if(!cv.isConnected)return;if(mt.tool==='decor')box();requestAnimationFrame(loop)})()}
const _r=window.rMap||rMap;window.rMap=rMap=function(){_r.apply(this,arguments);if(mt.decSel===undefined)mt.decSel=LS.get('decSel',null);const T=document.getElementById('mtools');if(T&&!T.querySelector('[data-t=decor]')){const b=document.createElement('button');b.dataset.t='decor';b.textContent='🪑 Декор';if(!mt.locked&&mt.tool==='decor')b.className='on';const pan=T.querySelector('[data-t=pan]');T.insertBefore(b,pan);
  const oc=T.onclick;T.onclick=e=>{oc&&oc.call(T,e);const x=e.target.closest('[data-t]');if(!x)return;if(x.dataset.t==='decor'){T.querySelectorAll('[data-t]').forEach(z=>z.classList.toggle('on',z===x));opts()}else{mt.decPick=null;box()}}}
 bind();if(mt.tool==='decor'&&!mt.locked)opts();box()};
KM.decorPalette=palette})();

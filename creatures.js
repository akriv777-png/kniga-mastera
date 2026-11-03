'use strict';
/* Существа: размеры фишек (занимаемые клетки), проходимость, список активных существ, ходы игроков */
(function(){
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const D=()=>window.DATA||{monsters:[]};
const SZ=[['T','крошечный',1],['S','маленький',1],['M','средний',1],['L','большой',2],['H','огромный',3],['G','гигантский',4]];
const TY=[['pc','игрок'],['mon','монстр'],['npc','другое']];
const FP={T:1,S:1,M:1,L:2,H:3,G:4};
function szOfText(s){s=String(s||'').toLowerCase();if(/крош/.test(s))return'T';if(/мален/.test(s))return'S';if(/больш/.test(s))return'L';if(/огром/.test(s))return'H';if(/гиган|громад|исполин/.test(s))return'G';return s?'M':''}
const cOf=t=>t&&t.cid&&combat.list.find(z=>z.id===t.cid);
const monById=id=>id&&(D().monsters||[]).find(m=>m.id===id||m.n===id);
const monOf=t=>{const c=cOf(t);return monById((c&&c.mon)||t.mid||t.mon)};
const OV=()=>LS.get('creatOv',{});
function tokSz(t){if(!t)return'M';if(t.sz&&FP[t.sz])return t.sz;if(t.cr){const o=OV()[t.cr];if(o&&o.sz)return o.sz}const c=cOf(t);if(c){const o=OV()['c:'+c.id];if(o&&o.sz)return o.sz}const mo=monOf(t);if(mo)return szOfText(mo.sz)||'M';return'M'}
KM.tokSz=tokSz;KM.tokFp=t=>FP[tokSz(t)]||1;
KM.tokName=t=>{const c=cOf(t);return String(t.nm||(c&&c.name)||'').slice(0,24)};
KM.tokHero=t=>{try{if(t.pid)return t.pid;const c=cOf(t);let p=null;if(c&&c.pc)p=players.find(z=>z.name===c.name||z.name===c.base);else if(t.k==='pc')p=players.find(z=>z.name&&(z.name===t.nm||(t.n&&z.name.startsWith(t.n))));return p?p.id:''}catch(e){return''}};
const covers=(t,x,y)=>{const f=KM.tokFp(t);return x>=t.x&&y>=t.y&&x<t.x+f&&y<t.y+f};
KM.tokAt=(m,x,y)=>{const a=m.tok||[];for(let i=a.length-1;i>=0;i--)if(covers(a[i],x,y))return a[i];return null};
/* переходы (двери, лестницы, порталы, связанные клетки) всегда проходимы; блокируют только стены */
const TR=new Set(['door','stairs','portal','gate','secret']);
const isTr=(m,x,y)=>TR.has(m.g[y*m.W+x])||(m.links||[]).some(l=>l.x===x&&l.y===y);
KM.isTransit=isTr;
const _S=window.KM_SOLID;if(_S)window.KM_SOLID=function(m,x,y){if(isTr(m,x,y))return false;return _S(m,x,y)};
function whyBlocked(m,t,x,y,ex){const f=KM.tokFp(t);if(x<0||y<0||x+f>m.W||y+f>m.H)return'⛔ Край карты';
 for(let yy=y;yy<y+f;yy++)for(let xx=x;xx<x+f;xx++){if(isTr(m,xx,yy))continue;const g=m.g[yy*m.W+xx];if(g==='wall'||!g)return'⛔ Стена';if(window.KM_SOLID&&KM_SOLID(m,xx,yy))return'⛔ Препятствие';if(ex&&ex.has(xx+','+yy))return'⛔ Занято'}
 for(const o of m.tok||[]){if(o===t||(t.id&&o.id===t.id))continue;const g=KM.tokFp(o);if(x<o.x+g&&o.x<x+f&&y<o.y+g&&o.y<y+f)return'⛔ Занято: '+(KM.tokName(o)||o.n||'фишка')}return''}
KM.whyBlocked=whyBlocked;KM.canPlace=(m,t,x,y,ex)=>!whyBlocked(m,t||{},x,y,ex);
/* отрисовка: крупные/крошечные фишки и подписи */
const _d=window.drawMap;window.drawMap=drawMap=function(g,m,CS,fogA){const all=m.tok||[];const spec=all.filter(t=>{const s=tokSz(t);return s!=='M'&&s!=='S'});m.tok=all.filter(t=>!spec.includes(t));try{_d(g,m,CS,fogA)}finally{m.tok=all}
 const vis=t=>!(fogA>=1&&(t.hid||(m.fog&&m.fog[t.y*m.W+t.x])));const cur=combat.list&&combat.list[combat.turn];
 spec.forEach(t=>{if(!vis(t))return;const s=tokSz(t),f=FP[s],X=(t.x+f/2)*CS,Y=(t.y+f/2)*CS,r=s==='T'?CS*.26:CS*f*.45;const c=cOf(t);
  if(cur&&t.cid===cur.id){g.save();g.strokeStyle='#ffd36a';g.lineWidth=4;g.shadowColor='#ffd36a';g.shadowBlur=12;g.beginPath();g.arc(X,Y,r+4,0,7);g.stroke();g.restore()}
  g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.arc(X+1,Y+2,r,0,7);g.fill();g.fillStyle=t.c||'#888';g.beginPath();g.arc(X,Y,r,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=2;g.stroke();
  g.fillStyle='#fff';g.font=`800 ${Math.max(8,Math.min(r*.9,(t.n||'').length>1?r*.7:r))}px Manrope,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(t.n||'',X,Y+1);
  const hp=c?c.hp:t.hp,mx=c?c.max:t.mhp;if(mx){const q=Math.max(0,Math.min(1,hp/mx));g.save();g.lineWidth=3;g.strokeStyle=q>.5?'#5fbf4a':q>.25?'#e0b040':'#e03a2a';g.beginPath();g.arc(X,Y,r+1,-Math.PI/2,-Math.PI/2+q*Math.PI*2);g.stroke();g.restore()}
  if(c&&c.dead||t.dead){g.strokeStyle='rgba(20,0,0,.85)';g.lineWidth=4;g.beginPath();g.moveTo(X-r*.7,Y-r*.7);g.lineTo(X+r*.7,Y+r*.7);g.moveTo(X+r*.7,Y-r*.7);g.lineTo(X-r*.7,Y+r*.7);g.stroke()}});
 all.forEach(t=>{if(!vis(t))return;const nm=KM.tokName(t);if(!nm)return;const f=KM.tokFp(t),X=(t.x+f/2)*CS,Y=(t.y+f)*CS;g.save();g.font=`700 ${Math.max(8,CS*.3)}px Manrope,sans-serif`;g.textAlign='center';g.textBaseline='top';const w=g.measureText(nm).width+6;g.fillStyle='rgba(0,0,0,.72)';g.fillRect(X-w/2,Y-1,w,CS*.36);g.fillStyle='#f3e6c8';g.fillText(nm,X,Y);g.restore()})};
/* ход игрока: запрос от «Книги игрока» */
KM.plMove=(k,h,d,push)=>{const m=KM.mapCur&&KM.mapCur();if(!m||!h)return;const t=(m.tok||[]).find(z=>z.id===d.id);if(!t){push();return}
 if(KM.tokHero(t)!==h.id){toast(k.name+': пытался двигать чужую фишку');push();return}
 const x=Math.round(+d.x),y=Math.round(+d.y);if(!isFinite(x)||!isFinite(y)){push();return}const why=whyBlocked(m,t,x,y);if(why){push();return}
 const o={x:t.x,y:t.y};t.x=x;t.y=y;
 KM.mapSave&&KM.mapSave();KM.mapDraw&&KM.mapDraw();push();
 const f=KM.tokFp(t);const l=(m.links||[]).find(z=>z.x>=x&&z.y>=y&&z.x<x+f&&z.y<y+f&&maps.some(q=>q.id===z.to));
 if(l&&KM.mapTrans){toast('🚪 '+(h.name||k.name)+' у перехода «'+(l.n||'Переход')+'»');KM.mapTrans(m,l,t,o)}};
/* ===== список «Существа» ===== */
function entries(){const ov=OV(),out=[];
 (players||[]).forEach(p=>{const k='p:'+p.id,o=ov[k]||{};if(o.del)return;out.push({key:k,kind:'p',ref:p,n:o.n||p.name,ty:'pc',sz:o.sz||szOfText(p.sz||p.size)||'M',auto:1})});
 (combat.list||[]).forEach(c=>{if(c.pc)return;const k='c:'+c.id,o=ov[k]||{};const mo=monById(c.mon);out.push({key:k,kind:'c',ref:c,n:c.name,ty:o.ty||(c.mon?'mon':'npc'),sz:o.sz||(mo&&szOfText(mo.sz))||'M',mon:c.mon})});
 LS.get('creat',[]).forEach(x=>{const mo=monById(x.mon);out.push({key:'x:'+x.id,kind:'x',ref:x,n:x.n,ty:x.ty||'npc',sz:x.sz||(mo&&szOfText(mo.sz))||'M',mon:x.mon})});return out}
function tokensOf(m,e){return (m&&m.tok||[]).filter(t=>t.cr===e.key||(e.kind==='c'&&t.cid===e.ref.id)||(e.kind==='p'&&KM.tokHero(t)===e.ref.id))}
function setOv(k,patch){const o=OV();o[k]=Object.assign(o[k]||{},patch);LS.set('creatOv',o)}
function syncTok(e){const m=KM.mapCur&&KM.mapCur();if(!m)return;tokensOf(m,e).forEach(t=>{t.sz=e.sz;if(e.kind!=='c')t.n=String(e.n).slice(0,2)});renumber(m);KM.mapSave&&KM.mapSave();KM.mapDraw&&KM.mapDraw();try{KM.table.push(true)}catch(x){}}
function renumber(m){const g={};(m.tok||[]).forEach(t=>{if(!t.crb)return;(g[t.crb]=g[t.crb]||[]).push(t)});Object.keys(g).forEach(b=>{const a=g[b];a.forEach((t,i)=>t.nm=a.length>1?b+' '+(i+1):b)})}
function toMap(e){const m=KM.mapCur&&KM.mapCur();if(!m)return toast('Сначала откройте карту');m.tok=m.tok||[];
 const t={id:Math.random().toString(36).slice(2,10),x:0,y:0,n:String(e.n).slice(0,2),c:e.ty==='pc'?'#d6b26a':e.ty==='mon'?'#d42a22':'#5aa2ff',k:e.ty==='pc'?'pc':e.ty==='mon'?'mon':'npc',sz:e.sz,cr:e.key};
 if(e.kind==='c')t.cid=e.ref.id;if(e.kind==='p')t.pid=e.ref.id;if(e.mon)t.mid=e.mon;if(e.kind==='x'){t.crb=e.n}
 const v=KM.mapView&&KM.mapView(),wrap=document.getElementById('mw');let ax=m.W>>1,ay=m.H>>1;
 if(v&&wrap){const CS=m.CS||32;ax=Math.floor((wrap.clientWidth/2-v.x)/v.s/ (window.KM_CS||CS));ay=Math.floor((wrap.clientHeight/2-v.y)/v.s/(window.KM_CS||CS));if(!(ax>=0&&ay>=0&&ax<m.W&&ay<m.H)){ax=m.W>>1;ay=m.H>>1}}
 for(let r=0;r<Math.max(m.W,m.H);r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;if(KM.canPlace(m,t,ax+dx,ay+dy)){t.x=ax+dx;t.y=ay+dy;m.tok.push(t);renumber(m);KM.mapSave&&KM.mapSave();KM.mapDraw&&KM.mapDraw();try{KM.table.push(true)}catch(x){}toast('На карте: '+(t.nm||e.n));return true}}
 toast('Нет свободного места для такого размера');return false}
function sheet(){const L=entries(),m=KM.mapCur&&KM.mapCur();
 openSheet(`<h2>Существа</h2><p class="muted" style="font-size:12.5px">Герои добавляются сами; монстры — из трекера боя. Размер задаёт клетки на карте: до среднего 1×1, большой 2×2, огромный 3×3, гигантский 4×4.</p>
 <div id="crL">${L.map((e,i)=>{const on=tokensOf(m,e).length;return `<div class="card" style="padding:8px;margin-bottom:6px"><div class="row" style="gap:6px;align-items:center"><b class="grow" data-crn="${i}" style="cursor:pointer">${E(e.n)} ✎</b>${on?`<small class="muted">на карте${on>1?' ×'+on:''}</small>`:''}<button class="btn sm" data-crdel="${i}" aria-label="Убрать">✕</button></div>
 <div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><select class="inp" data-crt="${i}" style="flex:1"${e.kind==='p'?' disabled':''}>${TY.map(([k,l])=>`<option value="${k}"${e.ty===k?' selected':''}>${l}</option>`).join('')}</select><select class="inp" data-crs="${i}" style="flex:1">${SZ.map(([k,l])=>`<option value="${k}"${e.sz===k?' selected':''}>${l}</option>`).join('')}</select><button class="btn sm" data-crm="${i}">на карту</button></div></div>`}).join('')||'<p class="muted">Пока пусто</p>'}</div>
 <div class="sec-h">Добавить</div><div class="row" style="gap:6px;flex-wrap:wrap"><input class="inp grow" id="crN" placeholder="Имя или монстр (Гоблин, Огр…)" list="crML"><datalist id="crML">${(D().monsters||[]).slice(0,800).map(x=>`<option value="${E(x.n)}">`).join('')}</datalist>
 <select class="inp" id="crT">${TY.map(([k,l])=>`<option value="${k}"${k==='mon'?' selected':''}>${l}</option>`).join('')}</select><select class="inp" id="crS"><option value="">размер: авто</option>${SZ.map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select><button class="btn" id="crA">＋ Добавить</button></div>`);
 const q=s=>document.querySelectorAll(s);
 q('[data-crn]').forEach(b=>b.onclick=()=>{const e=L[+b.dataset.crn];const n=prompt('Имя',e.n);if(!n||!n.trim())return;const v=n.trim().slice(0,40);if(e.kind==='c'){e.ref.name=v;try{save()}catch(x){}}else if(e.kind==='x'){const a=LS.get('creat',[]);const z=a.find(y=>y.id===e.ref.id);if(z)z.n=v;LS.set('creat',a);const mm=KM.mapCur&&KM.mapCur();if(mm)tokensOf(mm,e).forEach(t=>t.crb=v)}else setOv(e.key,{n:v});e.n=v;syncTok(e);sheet()});
 q('[data-crs]').forEach(b=>b.onchange=()=>{const e=L[+b.dataset.crs];e.sz=b.value;if(e.kind==='x'){const a=LS.get('creat',[]);const z=a.find(y=>y.id===e.ref.id);if(z)z.sz=b.value;LS.set('creat',a)}else setOv(e.key,{sz:b.value});syncTok(e)});
 q('[data-crt]').forEach(b=>b.onchange=()=>{const e=L[+b.dataset.crt];if(e.kind==='x'){const a=LS.get('creat',[]);const z=a.find(y=>y.id===e.ref.id);if(z)z.ty=b.value;LS.set('creat',a)}else setOv(e.key,{ty:b.value})});
 q('[data-crm]').forEach(b=>b.onclick=()=>{if(toMap(L[+b.dataset.crm]))sheet()});
 q('[data-crdel]').forEach(b=>b.onclick=()=>{const e=L[+b.dataset.crdel];if(!confirm('Убрать «'+e.n+'» из списка и с карты?'))return;const mm=KM.mapCur&&KM.mapCur();if(mm){const rm=tokensOf(mm,e);mm.tok=mm.tok.filter(t=>!rm.includes(t));renumber(mm);KM.mapSave&&KM.mapSave()}
  if(e.kind==='x')LS.set('creat',LS.get('creat',[]).filter(y=>y.id!==e.ref.id));else if(e.kind==='c'){combat.list=combat.list.filter(z=>z!==e.ref);combat.turn=Math.min(combat.turn,Math.max(0,combat.list.length-1));try{save()}catch(x){}}else setOv(e.key,{del:1});KM.mapDraw&&KM.mapDraw();try{KM.table.push(true)}catch(x){}sheet()});
 document.getElementById('crA').onclick=()=>{const n=document.getElementById('crN').value.trim();if(!n)return toast('Введите имя');const mo=(D().monsters||[]).find(x=>x.n.toLowerCase()===n.toLowerCase());const ty=document.getElementById('crT').value;const sz=document.getElementById('crS').value||(mo&&szOfText(mo.sz))||'M';const a=LS.get('creat',[]);a.push({id:Math.random().toString(36).slice(2,10),n:mo?mo.n:n.slice(0,40),ty,sz,mon:mo?mo.id:null});LS.set('creat',a);sheet()}}
KM.creatures=sheet;
setInterval(()=>{const mw=document.getElementById('mw');if(!mw||document.getElementById('crBtn'))return;const b=document.createElement('button');b.id='crBtn';b.className='btn sm';b.textContent='🐾 Существа';b.style.cssText='margin:0 0 8px';b.onclick=sheet;const r=document.createElement('div');r.className='row';r.appendChild(b);(document.getElementById('cmbstrip')||mw).before(r)},400);
})();

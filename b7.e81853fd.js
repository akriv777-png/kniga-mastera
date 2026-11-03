'use strict';/*bundle*/
/* creatures.js */
'use strict';
/* единое имя героя: старые сохранения/импорт/синхронизация могли хранить имя в другом поле */
window.heroName=function(p){if(!p)return'Герой';const v=[p.name,p.n,p.nm,p.hero&&p.hero.name,p.cname,p.charName].find(x=>typeof x==='string'&&x.trim()&&x!=='undefined'&&x!=='null');return v?v.trim():'Герой'};
window.KM_fixHeroes=function(){try{let ch=0;(players||[]).forEach((p,i)=>{if(!p)return;const n=heroName(p);if(p.name!==n&&!(typeof p.name==='string'&&p.name.trim()&&p.name!=='undefined')){p.name=n==='Герой'?'Герой '+(i+1):n;ch=1}if(!p.id){p.id='h'+Date.now().toString(36)+i;ch=1}});try{(maps||[]).forEach(m=>(m.tok||[]).forEach(t=>{const bad=x=>x==='undefined'||x==='null'||x==='u'&&t.pid;const p=t.pid&&players.find(z=>z.id===t.pid);if(bad(t.nm)){t.nm=p?heroName(p):'';ch=2}if(t.n==='u'||t.n==='undefined'||t.n==null&&p){t.n=p?heroName(p)[0]:'?';ch=2}}));if(ch===2&&typeof saveMaps==='function')saveMaps()}catch(e){}if(ch&&typeof save==='function')save();return ch}catch(e){return 0}};
KM_fixHeroes();setInterval(KM_fixHeroes,1500);
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
const okS=x=>typeof x==='string'&&x.trim()&&x!=='undefined'&&x!=='null';KM.tokName=t=>{const c=cOf(t);let n=okS(t.nm)?t.nm:(c&&okS(c.name)?c.name:'');if(!n&&(t.pid||t.k==='pc')){const p=(players||[]).find(z=>z.id===t.pid);if(p)n=heroName(p)}return String(n||'').slice(0,24)};
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
function entries(){KM_fixHeroes();const ov=OV(),out=[];
 (players||[]).forEach(p=>{const k='p:'+p.id,o=ov[k]||{};if(o.del)return;out.push({key:k,kind:'p',ref:p,n:o.n||heroName(p),ty:'pc',sz:o.sz||szOfText(p.sz||p.size)||'M',auto:1})});
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
 <div id="crL">${L.map((e,i)=>{const on=tokensOf(m,e).length;return `<div class="card" style="padding:8px;margin-bottom:6px"><div class="row" style="gap:6px;align-items:center"><b class="grow" data-crn="${i}" style="cursor:pointer">${E(e.n)} ✎</b>${e.mon&&monById(e.mon)?`<button class="btn sm" data-crst="${i}" aria-label="Карточка">📖</button>`:''}${on?`<small class="muted">на карте${on>1?' ×'+on:''}</small>`:''}${e.kind!=='p'?`<button class="btn sm" data-crsp="${i}" aria-label="Заклинания">✧</button>`:''}<button class="btn sm" data-crdel="${i}" aria-label="Убрать">✕</button></div>
 ${(()=>{const mo=e.mon&&monById(e.mon);return mo?`<div class="muted" style="font-size:12px;margin-top:2px">${statLine(mo)}</div>`:''})()}<div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><select class="inp" data-crt="${i}" style="flex:1"${e.kind==='p'?' disabled':''}>${TY.map(([k,l])=>`<option value="${k}"${e.ty===k?' selected':''}>${l}</option>`).join('')}</select><select class="inp" data-crs="${i}" style="flex:1">${SZ.map(([k,l])=>`<option value="${k}"${e.sz===k?' selected':''}>${l}</option>`).join('')}</select><button class="btn sm" data-crm="${i}">на карту</button></div></div>`}).join('')||'<p class="muted">Пока пусто</p>'}</div>
 <div class="sec-h">Добавить</div><button class="btn red" id="crB" style="margin-bottom:8px">📖 Из бестиария</button><div class="row" style="gap:6px;flex-wrap:wrap"><input class="inp grow" id="crN" placeholder="Имя или монстр (Гоблин, Огр…)" list="crML"><datalist id="crML">${(D().monsters||[]).slice(0,800).map(x=>`<option value="${E(x.n)}">`).join('')}</datalist>
 <select class="inp" id="crT">${TY.map(([k,l])=>`<option value="${k}"${k==='mon'?' selected':''}>${l}</option>`).join('')}</select><select class="inp" id="crS"><option value="">размер: авто</option>${SZ.map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select><button class="btn" id="crA">＋ Добавить</button></div>`);
 const q=s=>document.querySelectorAll(s);
 q('[data-crn]').forEach(b=>b.onclick=()=>{const e=L[+b.dataset.crn];const n=prompt('Имя',e.n);if(!n||!n.trim())return;const v=n.trim().slice(0,40);if(e.kind==='c'){e.ref.name=v;try{save()}catch(x){}}else if(e.kind==='x'){const a=LS.get('creat',[]);const z=a.find(y=>y.id===e.ref.id);if(z)z.n=v;LS.set('creat',a);const mm=KM.mapCur&&KM.mapCur();if(mm)tokensOf(mm,e).forEach(t=>t.crb=v)}else setOv(e.key,{n:v});e.n=v;syncTok(e);sheet()});
 q('[data-crs]').forEach(b=>b.onchange=()=>{const e=L[+b.dataset.crs];e.sz=b.value;if(e.kind==='x'){const a=LS.get('creat',[]);const z=a.find(y=>y.id===e.ref.id);if(z)z.sz=b.value;LS.set('creat',a)}else setOv(e.key,{sz:b.value});syncTok(e)});
 q('[data-crt]').forEach(b=>b.onchange=()=>{const e=L[+b.dataset.crt];if(e.kind==='x'){const a=LS.get('creat',[]);const z=a.find(y=>y.id===e.ref.id);if(z)z.ty=b.value;LS.set('creat',a)}else setOv(e.key,{ty:b.value})});
 q('[data-crsp]').forEach(b=>b.onclick=()=>{const e=L[+b.dataset.crsp];if(!KM.csp)return;const k=e.kind==='c'?KM.csp.keyOfComb(e.ref):(e.mon&&monById(e.mon)?'m:'+monById(e.mon).id:e.key);KM.csp.edit(k,e.n,sheet)});
 q('[data-crst]').forEach(b=>b.onclick=()=>{const e=L[+b.dataset.crst];if(!window.showMon)return;window.KM_sheetRet=sheet;showMon(e.mon);window.KM_sheetRet=sheet});
 document.getElementById('crB').onclick=pick;
 q('[data-crm]').forEach(b=>b.onclick=()=>{if(toMap(L[+b.dataset.crm]))sheet()});
 q('[data-crdel]').forEach(b=>b.onclick=()=>{const e=L[+b.dataset.crdel];if(!confirm('Убрать «'+e.n+'» из списка и с карты?'))return;const mm=KM.mapCur&&KM.mapCur();if(mm){const rm=tokensOf(mm,e);mm.tok=mm.tok.filter(t=>!rm.includes(t));renumber(mm);KM.mapSave&&KM.mapSave()}
  if(e.kind==='x')LS.set('creat',LS.get('creat',[]).filter(y=>y.id!==e.ref.id));else if(e.kind==='c'){combat.list=combat.list.filter(z=>z!==e.ref);combat.turn=Math.min(combat.turn,Math.max(0,combat.list.length-1));try{save()}catch(x){}}else setOv(e.key,{del:1});KM.mapDraw&&KM.mapDraw();try{KM.table.push(true)}catch(x){}sheet()});
 document.getElementById('crA').onclick=()=>{const n=document.getElementById('crN').value.trim();if(!n)return toast('Введите имя');const mo=(D().monsters||[]).find(x=>x.n.toLowerCase()===n.toLowerCase());const ty=document.getElementById('crT').value;const sz=document.getElementById('crS').value||(mo&&szOfText(mo.sz))||'M';const a=LS.get('creat',[]);a.push({id:Math.random().toString(36).slice(2,10),n:mo?mo.n:n.slice(0,40),ty,sz,mon:mo?mo.id:null});LS.set('creat',a);sheet()}}
const CRS=v=>v==null?'—':v===.125?'1/8':v===.25?'1/4':v===.5?'1/2':String(v);
const AB=['Сил','Лов','Тел','Инт','Мдр','Хар'];
function statLine(mo){return `КД ${E(mo.ac)} · ХП ${E(mo.hp)} · ${E(mo.sp||'')} · ПО ${CRS(mo.cr)}${mo.st?' · '+mo.st.map((v,i)=>AB[i]+' '+v).join(' '):''}`}
function addMon(mo){const a=LS.get('creat',[]);a.push({id:Math.random().toString(36).slice(2,10),n:mo.n,ty:'mon',sz:szOfText(mo.sz)||'M',mon:mo.id});LS.set('creat',a);toast('Добавлено: '+mo.n)}
function pick(){const all=(D().monsters||[]).slice().sort((a,b)=>a.n.localeCompare(b.n,'ru'));
 openSheet(`<h2>📖 Из бестиария</h2><input class="inp" id="crQ" placeholder="Поиск: гоблин, дракон, 5…" autocomplete="off" style="width:100%;margin-bottom:8px"><div id="crPL"></div><button class="btn" id="crPB" style="margin-top:8px">← К существам</button>`);
 const box=document.getElementById('crPL'),inp=document.getElementById('crQ');let cur=[];
 const R=()=>{const q=inp.value.trim().toLowerCase();cur=(q?all.filter(m=>m.n.toLowerCase().includes(q)||String(m.ty||'').toLowerCase().includes(q)||CRS(m.cr)===q):all);if(q)cur.sort((a,b)=>(b.n.toLowerCase().startsWith(q))-(a.n.toLowerCase().startsWith(q)));cur=cur.slice(0,40);
  box.innerHTML=cur.map((m,i)=>`<div class="card" data-crp="${i}" style="padding:8px;margin-bottom:6px;cursor:pointer"><b>${E(m.n)}</b> <small class="muted">${E(m.sz||'')} ${E(m.ty||'')}</small><div class="muted" style="font-size:12px">${statLine(m)}</div></div>`).join('')+(cur.length===40?'<p class="muted" style="font-size:12px">Показаны первые 40 — уточните поиск</p>':'')+(cur.length?'':'<p class="muted">Ничего не найдено</p>')};
 let t;inp.oninput=()=>{clearTimeout(t);t=setTimeout(R,120)};R();
 box.onclick=e=>{const c=e.target.closest('[data-crp]');if(!c)return;addMon(cur[+c.dataset.crp]);sheet()};
 document.getElementById('crPB').onclick=sheet}
KM.creatures=sheet;KM.creaturesPick=pick;
setInterval(()=>{const mw=document.getElementById('mw');if(!mw||document.getElementById('crBtn'))return;const b=document.createElement('button');b.id='crBtn';b.className='btn sm';b.textContent='🐾 Существа';b.style.cssText='margin:0 0 8px';b.onclick=sheet;const r=document.createElement('div');r.className='row';r.appendChild(b);(document.getElementById('cmbstrip')||mw).before(r)},400);
})();

;
/* cspells.js */
'use strict';
/* cspells.js — заклинания НИП / монстров / существ. Ключи: n:<НИП id> (npcLinks), m:<монстр id>, x:<своё существо>, c:<имя бойца> */
(function(){
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SP=()=>DATA.spells||[],sp=id=>SP().find(s=>s.id===id);const mon=id=>id&&(DATA.monsters||[]).find(m=>m.id===id||m.n===id);
const ST=()=>LS.get('crsp',{});
function parse(m){if(!m)return[];const t=JSON.stringify(m).toLowerCase();if(!/заклинан|колдовств|заговор/.test(t))return[];const out=[];
 SP().forEach(s=>{const n=(s.n||'').toLowerCase();if(n.length<4)return;const i=t.indexOf(n);if(i<0)return;const a=t[i-1]||' ',b=t[i+n.length]||' ';if(/[а-яёa-z]/.test(a)||/[а-яёa-z]/.test(b))return;out.push(s.id)});return out}
function get(key){if(key.startsWith('n:')){try{const l=npcLinks[key.slice(2)];return (l&&l.spells)||[]}catch(e){return[]}}
 const s=ST();if(s[key])return s[key];if(key.startsWith('m:'))return parse(mon(key.slice(2)));return[]}
function set(key,a){a=[...new Set(a)];if(key.startsWith('n:')){const id=key.slice(2);npcLinks[id]=npcLinks[id]||{items:[],spells:[]};npcLinks[id].spells=a;LS.set('npclinks',npcLinks);return}const s=ST();s[key]=a;LS.set('crsp',s)}
const keyOfMonOr=(mid,fb)=>mid&&mon(mid)?'m:'+mon(mid).id:fb;
const keyOfComb=c=>c.npc?'n:'+c.npc:keyOfMonOr(c.mon,'c:'+(c.base||c.name));
function keyOfTok(t){if(t.npc)return'n:'+t.npc;if(t.cr&&/^x:/.test(t.cr)){const x=LS.get('creat',[]).find(z=>'x:'+z.id===t.cr);if(x&&!ST()[t.cr]&&x.mon)return keyOfMonOr(x.mon,t.cr);return t.cr}
 const c=t.cid&&(combat.list||[]).find(z=>z.id===t.cid);if(c&&!c.pc)return keyOfComb(c);const m=t.mid||t.mon;if(m)return keyOfMonOr(m,null);return null}
function nameOf(key){const id=key.slice(2);if(key[0]==='n'){const c=typeof findCast==='function'&&findCast(id);return c?c.n:id}if(key[0]==='m'){const m=mon(id);return m?m.n:id}if(key[0]==='x'){const x=LS.get('creat',[]).find(z=>z.id===id);return x?x.n:id}return id}
/* редактор */
function edit(key,title,back){const cur=()=>get(key);const row=(s,on)=>`<div class="row" style="gap:6px;align-items:center;padding:4px 0"><div class="grow">${E(s.n)} <small class="muted">${s.l?s.l+' ур.':'заговор'}</small></div>${on?`<button class="btn sm" data-csd="${s.id}" aria-label="Убрать">✕</button>`:`<button class="btn sm" data-csa="${s.id}">＋</button>`}</div>`;
 const draw=r=>{const a=cur().map(sp).filter(Boolean).sort((x,y)=>x.l-y.l||x.n.localeCompare(y.n,'ru'));r.querySelector('#csL').innerHTML=a.length?a.map(s=>row(s,1)).join(''):'<p class="muted">Пока нет заклинаний</p>';bindL(r)};
 const res=(r,q)=>{q=(q||'').toLowerCase().trim();const h=cur();const a=q?SP().filter(s=>!h.includes(s.id)&&s.n.toLowerCase().includes(q)).sort((x,y)=>(y.n.toLowerCase().startsWith(q))-(x.n.toLowerCase().startsWith(q))||x.l-y.l).slice(0,30):[];r.querySelector('#csR').innerHTML=a.map(s=>row(s,0)).join('');bindL(r)};
 const bindL=r=>{r.querySelectorAll('[data-csd]').forEach(b=>b.onclick=()=>{set(key,cur().filter(x=>x!==b.dataset.csd));draw(r);res(r,r.querySelector('#csQ').value)});r.querySelectorAll('[data-csa]').forEach(b=>b.onclick=()=>{set(key,[...cur(),b.dataset.csa]);draw(r);res(r,r.querySelector('#csQ').value);toast('＋ '+(sp(b.dataset.csa)||{}).n)})};
 const pre=key[0]==='m'&&!ST()[key]&&get(key).length;
 openSheet(`<div class="sb-title" data-noshow>✧ Заклинания</div><div class="sb-sub">${E(title||nameOf(key))}${key[0]==='m'?' · для всех «'+E(nameOf(key))+'»':''}${pre?' · взято из блока статистики':''}</div><div id="csL"></div><input class="inp" id="csQ" placeholder="Найти заклинание в базе…" style="margin-top:8px"><div id="csR"></div>${back?'<button class="btn" id="csB" style="width:100%;margin-top:8px">← Назад</button>':''}`,r=>{draw(r);let tm;r.querySelector('#csQ').oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>res(r,e.target.value),120)};const bb=r.querySelector('#csB');if(bb)bb.onclick=back})}
/* группы для карты: НИП/существа на карте, в бою и с заданным списком */
function groups(){const keys=new Map();const add=(k,n)=>{if(k&&!keys.has(k))keys.set(k,n||nameOf(k))};
 try{const m=maps.find(x=>x.id===mapCur);(m&&m.tok||[]).forEach(t=>{if(t.k==='pc'||(KM.tokHero&&KM.tokHero(t)))return;add(keyOfTok(t))})}catch(e){}
 (combat.list||[]).forEach(c=>{if(!c.pc)add(keyOfComb(c))});Object.keys(ST()).forEach(k=>add(k));try{Object.keys(npcLinks).forEach(id=>add('n:'+id))}catch(e){}
 return [...keys].map(([k,n])=>({key:k,n,a:get(k).map(sp).filter(Boolean)})).filter(g=>g.a.length)}
KM.csp={get,set,edit,groups,parse,keyOfComb,keyOfTok,nameOf};
})();

;
/* sheet.js */
'use strict';{
/* ===== Paperless: full hero sheet, roll entry, level-up, encounter builder, campaign ===== */
const SK=[['Акробатика',1],['Анализ',3],['Атлетика',0],['Внимательность',4],['Выживание',4],['Выступление',5],['Запугивание',5],['История',3],['Ловкость рук',1],['Магия',3],['Медицина',4],['Обман',5],['Природа',3],['Проницательность',4],['Религия',3],['Скрытность',1],['Убеждение',5],['Уход за животными',4]];
const AB=['СИЛ','ЛОВ','ТЕЛ','ИНТ','МДР','ХАР'];
const HD={'Варвар':12,'Воин':10,'Паладин':10,'Следопыт':10,'Бард':8,'Жрец':8,'Друид':8,'Монах':8,'Плут':8,'Колдун':8,'Изобретатель':8,'Волшебник':6,'Чародей':6};
const XPL=[0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
const md=v=>Math.floor((v-10)/2),fm=v=>(v>=0?'+':'')+v,pb=l=>2+Math.floor((Math.max(1,l)-1)/4);
KM.autoHD=function(p){fix(p);const hd=hdOf(p),c=md(p.st[2]);let n=0,g=0;while(p.hp<p.maxhp&&(p.hdu||0)<p.lvl){const v=Math.max(1,Math.floor(Math.random()*hd)+1+c);const b=p.hp;p.hp=Math.min(p.maxhp,p.hp+v);g+=p.hp-b;p.hdu=(p.hdu||0)+1;n++}if(p.hp>0)p.conds=(p.conds||[]).filter(x=>x!=='Без сознания');return p.name+': '+(n?n+' '+(n==1?'кость':n<5?'кости':'костей')+', +'+g+' хитов':(p.hp>=p.maxhp?'хиты полны':'нет костей хитов'))};
const hdOf=p=>{for(const k in HD)if((p.cls||'').toLowerCase().includes(k.toLowerCase()))return HD[k];return 8};
function fix(p){p.prof=p.prof||[];p.exp=p.exp||[];p.svp=p.svp||[];p.thp=p.thp||0;p.hdu=p.hdu||0;p.ds=p.ds||{s:0,f:0};p.exh=p.exh||0;p.insp=!!p.insp;p.coins=p.coins||{мм:0,см:0,эм:0,зм:p.gold||0,пм:0};p.xp=p.xp||0;p.spd=p.spd||9;p.feat=p.feat||'';p.profs=p.profs||'';return p}
const skMod=(p,i)=>md(p.st[SK[i][1]])+(p.exp.includes(i)?2*pb(p.lvl):p.prof.includes(i)?pb(p.lvl):0);
const svMod=(p,j)=>md(p.st[j])+(p.svp.includes(j)?pb(p.lvl):0);
/* ---- roll entry: physical die or virtual, vs AC/DC ---- */
function rollEntry(o){let adv=0;const die=o.die||20;
 openSheet(`<div class="sb-title">${esc(o.label)}</div><div class="sb-sub">${o.mod!=null?'модификатор '+fm(o.mod):''}${o.vs?` · против ${o.vsL||'СЛ'} ${o.vs}`:''}</div>
 ${die===20?chips('adv',[['0','Обычный'],['1','Преимущество'],['-1','Помеха']],0):''}
 <div class="re-out" id="reo">Введи, что выпало на кубике</div>
 <div class="re-pad">${Array.from({length:die},(_,i)=>`<button data-v="${i+1}" class="${i+1===die?'n20':i===0?'n1':''}">${i+1}</button>`).join('')}</div>
 <div class="row" style="margin-top:10px"><button class="btn red grow" id="rev">🎲 Бросить за меня</button></div>`,r=>{
 bindChips(r,(n,v)=>{adv=+v});
 const show=(nat,extra)=>{const t=nat+(o.mod||0);let h=`<b class="re-t">${t}</b> <small>(${extra||nat}${o.mod?' '+fm(o.mod):''})</small>`;let ok=null;
  if(o.vs!=null){ok=die===20&&nat===20&&o.atk?true:die===20&&nat===1&&o.atk?false:t>=o.vs;h+=`<div class="re-v ${ok?'ok':'no'}">${die===20&&nat===20?'Критическое попадание! ':die===20&&nat===1?'Критический провал. ':''}${ok?(o.atk?'Попадание':'Успех'):(o.atk?'Промах':'Провал')}</div>`}
  else if(die===20&&nat===20)h+='<div class="re-v ok">Натуральная 20!</div>';else if(die===20&&nat===1)h+='<div class="re-v no">Натуральная 1</div>';
  $('#reo',r).innerHTML=h;$('#reo',r).classList.remove('pop');void $('#reo',r).offsetWidth;$('#reo',r).classList.add('pop');
  KM.logS&&KM.logS(`${o.label}: ${t}${ok==null?'':ok?' — успех':' — провал'}`);
  if(o.on)o.on(t,nat,ok,r)};
 $('.re-pad',r).onclick=e=>{const b=e.target.closest('[data-v]');if(b)show(+b.dataset.v)};
 $('#rev',r).onclick=()=>{const a=1+Math.floor(Math.random()*die),b=1+Math.floor(Math.random()*die);const n=adv>0?Math.max(a,b):adv<0?Math.min(a,b):a;show(n,adv?`${a} и ${b}`:null)}})}
KM.rollEntry=rollEntry;
/* ---- full hero sheet ---- */
function heroSheet(p,tab){fix(p);tab=tab||'main';const P=pb(p.lvl),nx=XPL[Math.min(19,p.lvl)];
 const T=[['main','Основное'],['skills','Навыки'],['gear','Кошель'],['feat','Черты'],['lvl','Уровень']];if(window.CLX&&(CLX.isSorc(p)||CLX.isWar(p)))T.splice(1,0,['cls',CLX.isSorc(p)?'Чародей':'Колдун']);
 let h=`<div class="sb-title">${esc(p.name)}</div><div class="sb-sub">${esc(p.cls)} · ${p.lvl} ур. · мастерство ${fm(P)}</div><div class="seg" id="hst">${T.map(([k,l])=>`<button data-t="${k}" class="${k===tab?'on':''}">${l}</button>`).join('')}</div>`;
 if(tab==='main'){h+=`<div class="hs-grid"><div class="hs-box"><small>Хиты</small><b>${p.hp}<i>/${p.maxhp}</i></b><div class="row"><button class="btn sm" data-hp="-1">−</button><button class="btn sm" data-hp="1">＋</button><button class="btn sm red" data-dmg>Урон/лечение</button></div></div>
  <div class="hs-box"><small>Врем. хиты</small><b>${p.thp}</b><div class="row"><button class="btn sm" data-thp="-1">−</button><button class="btn sm" data-thp="1">＋</button><button class="btn sm" data-thp="0">0</button></div></div>
  <div class="hs-box"><small>Кости хитов к${hdOf(p)}</small><b>${p.lvl-p.hdu}<i>/${p.lvl}</i></b><button class="btn sm" data-spendhd ${p.lvl-p.hdu>0?'':'disabled'}>Потратить</button></div>
  <div class="hs-box"><small>КД · Скорость · Иниц.</small><b>${p.ac} · ${p.spd} м · ${fm(md(p.st[1]))}</b><button class="btn sm" data-init>Бросок инициативы</button></div></div>
  <div class="hs-row"><button class="chip${p.insp?' on':''}" data-insp>✦ ${p.insp?'Вдохновение есть (забрать)':'Выдать вдохновение'}</button><span class="muted">Истощение</span>${[0,1,2,3,4,5,6].map(i=>`<button class="pip${p.exh>=i&&i?' on':''}" data-exh="${i}">${i||'0'}</button>`).join('')}</div>
  ${p.hp<=0?`<div class="hs-ds"><b>Спасброски от смерти</b><div>Успехи ${[1,2,3].map(i=>`<button class="pip g${p.ds.s>=i?' on':''}" data-ds="s${i}"></button>`).join('')}</div><div>Провалы ${[1,2,3].map(i=>`<button class="pip r${p.ds.f>=i?' on':''}" data-ds="f${i}"></button>`).join('')}</div><button class="btn sm red" data-dsroll>Бросок к20</button></div>`:''}
  <div class="sec-h">Спасброски</div><div class="hs-sv">${AB.map((a,j)=>`<button data-sv="${j}" class="${p.svp.includes(j)?'on':''}"><small>${a}</small><b>${fm(svMod(p,j))}</b></button>`).join('')}</div>
  <div class="muted" style="font-size:12px">Тап — бросок. Долгий тап — владение.</div>
  <div class="row" style="margin-top:10px"><button class="btn" data-rest="s">☾ Короткий отдых</button><button class="btn" data-rest="l">☀ Долгий отдых</button></div>`}
 if(tab==='cls'&&window.CLX)h+=CLX.html(p,'dm');
 if(tab==='skills')h+=`<div class="hs-sk">${SK.map(([n,a],i)=>`<div class="hs-s"><button class="dot${p.exp.includes(i)?' x':p.prof.includes(i)?' on':''}" data-pr="${i}" aria-label="Владение"></button><span data-sk="${i}">${n} <small>${AB[a]}</small></span><b data-sk="${i}">${fm(skMod(p,i))}</b></div>`).join('')}</div><div class="muted" style="font-size:12px;margin-top:6px">Кружок: нет → владение → компетентность. Тап по навыку — проверка (можно ввести число с кубика). Пассивная Внимательность: <b>${10+skMod(p,3)}</b></div>`;
 if(tab==='gear')h+=`<div class="hs-coins">${['мм','см','эм','зм','пм'].map(c=>`<label><small>${c}</small><input type="number" inputmode="numeric" data-coin="${c}" value="${p.coins[c]}"></label>`).join('')}</div><div class="muted" style="font-size:12.5px;margin:6px 0">Всего ≈ <b>${(p.coins.мм/100+p.coins.см/10+p.coins.эм/2+ +p.coins.зм+p.coins.пм*10).toFixed(1)} зм</b></div><div class="row"><button class="btn sm" data-conv>Обменять мелочь на золото</button></div><div class="muted" style="margin-top:10px;font-size:12.5px">Инвентарь — на карточке героя (${p.inv.length} предм.)</div>${(()=>{const w=(p.inv||[]).reduce((t,x)=>t+(+x.w||0)*(x.q||1),0),c=(p.st[0]||10)*7.5;return `<div class="${w>c?'card req':'muted'}" style="font-size:12.5px;margin-top:6px">🏋 Груз ${w.toFixed(1)} / ${c.toFixed(0)} кг${w>c?' — перегруз: скорость 1,5 м':''}</div>`})()}`;
 if(tab==='feat')h+=`<label class="f">Владения (доспехи, оружие, инструменты, языки)</label><textarea class="inp" data-tx="profs" rows="3">${esc(p.profs)}</textarea><label class="f">Умения и черты</label><textarea class="inp" data-tx="feat" rows="6" placeholder="Ярость (2/день), Безрассудная атака…">${esc(p.feat)}</textarea><label class="f">Раса · предыстория</label><input class="inp" data-tx="race" value="${esc(p.race||'')}">`;
 if(tab==='lvl')h+=`<div class="hs-box"><small>Опыт</small><b>${p.xp.toLocaleString('ru')}<i> / ${nx.toLocaleString('ru')}</i></b><div class="hpbar"><i style="width:${Math.min(100,p.xp/nx*100)}%"></i></div><div class="row"><input class="inp" id="xpa" type="number" inputmode="numeric" placeholder="+ опыт" style="flex:1"><button class="btn sm" data-xp>Начислить</button></div></div>
  <button class="btn red" data-lvlup style="margin-top:12px;width:100%">⬆ Повысить до ${p.lvl+1} уровня</button><div class="muted" style="font-size:12.5px;margin-top:6px">Хиты +${Math.floor(hdOf(p)/2)+1+md(p.st[2])} (среднее к${hdOf(p)} + ТЕЛ), кость хитов, бонус мастерства, ячейки заклинаний — автоматически. ${p.xp>=nx?'<b style="color:#c9a45a">Опыта хватает!</b>':''}</div>`;
 openSheet(h,r=>{const re=t=>{save();heroSheet(p,t||tab);KM.rPcsSoft&&KM.rPcsSoft()};if(tab==='cls'&&window.CLX)CLX.bind(p,r,{act:(v,ok)=>{if(v){const er=CLX.apply(p,v);if(er)return toast('⛔ '+er);ok&&toast(ok)}try{KM.table.push(true)}catch(e){}re('cls')}});
  $('#hst',r).onclick=e=>{const b=e.target.closest('[data-t]');if(b)heroSheet(p,b.dataset.t)};
  r.oninput=e=>{const t=e.target;if(t.dataset.coin){p.coins[t.dataset.coin]=+t.value||0;p.gold=p.coins.зм;save()}if(t.dataset.tx){p[t.dataset.tx]=t.value;save()}};
  let lp;r.onpointerdown=e=>{const b=e.target.closest('[data-sv]');if(b)lp=setTimeout(()=>{lp='x';const j=+b.dataset.sv;p.svp=p.svp.includes(j)?p.svp.filter(x=>x!==j):[...p.svp,j];re()},500)};r.onpointerup=()=>{if(lp!=='x')clearTimeout(lp)};
  r.onclick=e=>{const t=e.target,d=t.closest('button,[data-sk]')?.dataset||{};
   if(d.hp){p.hp=Math.max(0,Math.min(p.maxhp,p.hp+ +d.hp));re()}
   if(d.thp!=null&&t.closest('[data-thp]')){p.thp=+d.thp?Math.max(0,p.thp+ +d.thp):0;re()}
   if(t.closest('[data-dmg]'))return dmgHeal(p,()=>heroSheet(p,'main'));
   if(t.closest('[data-spendhd]')){const D=hdOf(p);rollEntry({label:`Кость хитов к${D}`,die:D,mod:md(p.st[2]),on:(v)=>{p.hdu++;p.hp=Math.min(p.maxhp,p.hp+Math.max(1,v));save();setTimeout(()=>heroSheet(p,'main'),900);toast(`+${Math.max(1,v)} хитов`)}})}
   if(t.closest('[data-init]'))rollEntry({label:p.name+': инициатива',mod:md(p.st[1]),on:v=>{p.init=v;save()}});
   if(t.closest('[data-insp]')){p.insp=!p.insp;re()}
   if(d.exh!=null&&t.closest('[data-exh]')){p.exh=+d.exh;re()}
   if(d.ds){const k=d.ds[0],n=+d.ds[1];p.ds[k]=p.ds[k]>=n?n-1:n;re()}
   if(t.closest('[data-dsroll]'))rollEntry({label:'Спасбросок от смерти',mod:0,vs:10,on:(v,nat)=>{if(nat===20){p.hp=1;p.ds={s:0,f:0};toast('Встаёт с 1 хитом!')}else if(nat===1)p.ds.f=Math.min(3,p.ds.f+2);else if(v>=10)p.ds.s=Math.min(3,p.ds.s+1);else p.ds.f=Math.min(3,p.ds.f+1);if(p.ds.s>=3)toast(p.name+' стабилизирован');if(p.ds.f>=3)toast(p.name+' погиб…');save()}});
   if(d.sv!=null&&t.closest('[data-sv]')&&lp!=='x'){const j=+d.sv;rollEntry({label:`${p.name}: спасбросок ${AB[j]}`,mod:svMod(p,j)})}
   if(d.pr!=null){const i=+d.pr;if(p.exp.includes(i))p.exp=p.exp.filter(x=>x!==i);else if(p.prof.includes(i)){p.prof=p.prof.filter(x=>x!==i);p.exp.push(i)}else p.prof.push(i);if(i===3)p.pp=10+skMod(p,3);re()}
   if(d.sk!=null&&!t.closest('[data-pr]')){const i=+d.sk;rollEntry({label:`${p.name}: ${SK[i][0]}`,mod:skMod(p,i)})}
   if(t.closest('[data-rest]'))rest(p,d.rest,()=>heroSheet(p,'main'));
   if(t.closest('[data-conv]')){const c=p.coins;const tot=c.мм+c.см*10+c.эм*50;c.зм+=Math.floor(tot/100);const rem=tot%100;c.эм=0;c.см=Math.floor(rem/10);c.мм=rem%10;p.gold=c.зм;re()}
   if(t.closest('[data-xp]')){p.xp+=+$('#xpa',r).value||0;re();if(p.xp>=XPL[Math.min(19,p.lvl)])setTimeout(()=>KM.lvlPrompt([p]),300)}
   if(t.closest('[data-lvlup]'))levelUp(p)}})}
function dmgHeal(p,back){openSheet(`<div class="sb-title">${esc(p.name)}</div><div class="sb-sub">${p.hp}/${p.maxhp} хитов${p.thp?' · врем. '+p.thp:''}</div><input class="inp" id="dv" type="number" inputmode="numeric" placeholder="Сколько?" style="font-size:22px;text-align:center;margin-top:12px"><div class="row" style="margin-top:10px"><button class="btn red grow" id="dd">Урон</button><button class="btn grow" id="dh">Лечение</button></div>`,r=>{setTimeout(()=>$('#dv',r).focus(),100);
 $('#dd',r).onclick=()=>{let v=+$('#dv',r).value||0;const a=Math.min(p.thp,v);p.thp-=a;v-=a;const was=p.hp;p.hp=Math.max(0,p.hp-v);if(was>0&&p.hp===0){p.ds={s:0,f:0};toast(p.name+' без сознания!')}else if(was===0&&v>0){p.ds.f=Math.min(3,p.ds.f+1);toast('Урон при 0 хитов — провал спасброска')}
  if((p.conds||[]).includes('Концентрация')&&v>0)toast(`Концентрация: спасбросок ТЕЛ СЛ ${Math.max(10,Math.floor(v/2))}`);KM.logS&&KM.logS(`${p.name}: −${v+a} хитов`);save();back()};
 $('#dh',r).onclick=()=>{const v=+$('#dv',r).value||0;if(p.hp===0)p.ds={s:0,f:0};p.hp=Math.min(p.maxhp,p.hp+v);KM.logS&&KM.logS(`${p.name}: +${v} хитов`);save();back()}})}
function rest(p,k,back){KM.uses&&KM.uses.onRest(p,k);if(k==='s'){if(p.slots&&/Колдун/i.test(p.cls))Object.values(p.slots).forEach(s=>{if(s&&typeof s==='object'){if('u' in s)s.u=0;if('used' in s)s.used=0}});const m=KM.autoHD(p);save();KM.logS&&KM.logS('Короткий отдых — '+m);back();toast(m);return}if(k==='l'){const old=JSON.stringify(p);p.hp=p.maxhp;p.thp=0;p.hdu=Math.max(0,p.hdu-Math.max(1,Math.floor(p.lvl/2)));if(p.exh)p.exh--;p.ds={s:0,f:0};if(p.slots)for(const l in p.slots){const s=p.slots[l];if(s&&typeof s==='object'){if('u' in s)s.u=0;if('used' in s)s.used=0}}if(p.slotsUsed)p.slotsUsed={};p.conds=(p.conds||[]).filter(c=>c!=='Концентрация');save();KM.logS&&KM.logS(p.name+': долгий отдых');back();KM.undoToast('Долгий отдых: всё восстановлено',()=>{Object.assign(p,JSON.parse(old));save();back()})}
 else{toast('Короткий отдых: трать кости хитов');if(/колдун/i.test(p.cls)&&p.slots)for(const l in p.slots){const s=p.slots[l];if(s){if('u' in s)s.u=0;if('used' in s)s.used=0}}save();back()}}
KM.partyRest=function(ids,k,autoHD){const L=[];players.filter(p=>ids.includes(p.id)).forEach(p=>{fix(p);if(k==='l'){KM.uses&&KM.uses.onRest(p,'l');p.hp=p.maxhp;p.thp=0;p.hdu=Math.max(0,(p.hdu||0)-Math.max(1,Math.floor(p.lvl/2)));if(p.exh)p.exh--;p.ds={s:0,f:0};if(p.slots)for(const l in p.slots){const s=p.slots[l];if(s&&typeof s==='object'){if('u' in s)s.u=0;if('used' in s)s.used=0}}p.conds=(p.conds||[]).filter(c=>c!=='Концентрация'&&c!=='Без сознания');L.push(p.name+': всё восстановлено')}else{KM.uses&&KM.uses.onRest(p,'s');let got=0,sp=0;if(/колдун/i.test(p.cls||'')&&p.slots)for(const l in p.slots){const s=p.slots[l];if(s){if('u' in s)s.u=0;if('used' in s)s.used=0}}if(autoHD){const hd=hdOf(p);while(p.hp<p.maxhp&&(p.hdu||0)<p.lvl){const r=Math.floor(Math.random()*hd)+1+md(p.st[2]);const v=Math.max(0,r);p.hp=Math.min(p.maxhp,p.hp+v);got+=v;p.hdu=(p.hdu||0)+1;sp++}}if(p.hp>0)p.conds=(p.conds||[]).filter(c=>c!=='Без сознания');L.push(p.name+(sp?`: ${sp} к${hdOf(p)} → +${got} хитов`:': короткий отдых'))}});save();const T=LS.get('restEv',{n:0});LS.set('restEv',{n:(T.n||0)+1,k,ids,t:Date.now(),L});KM.logS&&KM.logS((k==='l'?'Долгий':'Короткий')+' отдых: '+L.join('; '));KM.table&&KM.table.push(true);return L};
KM.partyRestUI=function(){let k='s',auto=true,sel=new Set(players.map(p=>p.id));const pnt=r=>{r.innerHTML=`<div class="sb-title">⛺ Отдых отряда</div><div class="sb-sub">Только Мастер решает, когда герои отдыхают. Результат придёт игрокам.</div><div class="chips" style="margin:10px 0"><button class="chip${k==='s'?' on':''}" data-rk="s">☕ Короткий (1 час)</button><button class="chip${k==='l'?' on':''}" data-rk="l">🌙 Долгий (8 часов)</button></div><p class="muted" style="font-size:13px">${k==='s'?'Короткий: герои тратят кости хитов на лечение, колдун восстанавливает ячейки, восстанавливаются умения «на короткий отдых».':'Долгий: все хиты, половина костей хитов, все ячейки и заряды «на долгий отдых», −1 истощение. Не чаще раза в сутки.'}</p>${k==='s'?`<label class="row" style="gap:8px;margin:6px 0"><input type="checkbox" data-auto ${auto?'checked':''}> Автоматически потратить кости хитов до полного здоровья</label>`:''}<div class="list">${players.map(p=>`<button class="card${sel.has(p.id)?' on':''}" data-rp="${p.id}" style="text-align:left"><div class="grow"><div class="t">${sel.has(p.id)?'☑':'☐'} ${esc(p.name)}</div><div class="m">хиты ${p.hp}/${p.maxhp} · кости хитов ${Math.max(0,p.lvl-(p.hdu||0))}/${p.lvl}</div></div></button>`).join('')}</div><button class="btn red" data-rgo style="width:100%;margin-top:12px">Отдохнуть (${sel.size})</button>`};openSheet('<div id="prw"></div>',r=>{const w=r.querySelector('#prw');pnt(w);w.onclick=e=>{const t=e.target.closest('button,input');if(!t)return;const d=t.dataset;if(d.rk){k=d.rk;pnt(w)}if(d.auto!=null){auto=t.checked}if(d.rp){sel.has(d.rp)?sel.delete(d.rp):sel.add(d.rp);pnt(w)}if(d.rgo!=null){if(!sel.size)return toast('Выберите героев');const bk=JSON.stringify(players);const L=KM.partyRest([...sel],k,auto);closeSheet();try{rRefresh()}catch(_){}KM.undoToast((k==='l'?'🌙 Долгий':'☕ Короткий')+' отдых: '+L.length+' героя',()=>{const o=JSON.parse(bk);o.forEach((x,i)=>Object.assign(players[i],x));save();try{rRefresh()}catch(_){}KM.table&&KM.table.push(true)})}}})};
function levelUp(p){const old=JSON.stringify(p);const add=Math.max(1,Math.floor(hdOf(p)/2)+1+md(p.st[2]));p.lvl++;p.maxhp+=add;p.hp+=add;try{KM.ensureSlots&&KM.ensureSlots(p)}catch(e){}save();KM.logS&&KM.logS(`${p.name} достигает ${p.lvl} уровня (+${add} хитов)`);
 KM.summon&&KM.summon();heroSheet(p,'lvl');KM.undoToast(`${p.name}: ${p.lvl} уровень, +${add} хитов`,()=>{Object.assign(p,JSON.parse(old));save();heroSheet(p,'lvl')})}
KM.heroSheet=heroSheet;
/* inject into hero cards */
const _r=rPcs;window.rPcs=rPcs=function(){_r.apply(this,arguments);$$('.hero').forEach(h=>{const p=fix(players[+h.dataset.i]);if(!p)return;
 const strip=document.createElement('div');strip.className='hs-strip';strip.innerHTML=`<button class="btn sm red" data-sheet>📜 Лист героя</button><button class="btn sm" data-dmg2>± Хиты</button><button class="btn sm" data-chk>🎲 Проверка</button>${p.thp?`<span class="chip on">врем. ${p.thp}</span>`:''}<button class="chip${p.insp?' on':''}" data-ginsp="${p.id}" title="Выдать / забрать вдохновение">✦${p.insp?' есть':' выдать'}</button>${p.exh?`<span class="chip">истощ. ${p.exh}</span>`:''}${p.hp<=0?`<span class="chip red">при смерти ${p.ds.s}✓ ${p.ds.f}✗</span>`:''}`;
 h.querySelector('.pcstats4').before(strip);
 strip.onclick=e=>{e.stopPropagation();if(e.target.closest('[data-sheet]'))heroSheet(p);if(e.target.closest('[data-dmg2]'))dmgHeal(p,()=>{closeSheet();rPcs()});if(e.target.closest('[data-chk]'))heroSheet(p,'skills')}})};
KM.rPcsSoft=()=>{if(KM.SECTIONS[S.sec][0]==='pcs'){const st=page.scrollTop;rPcs();page.scrollTop=st}};
/* ---- encounter builder ---- */
const THR=[[25,50,75,100],[50,100,150,200],[75,150,225,400],[125,250,375,500],[250,500,750,1100],[300,600,900,1400],[350,750,1100,1700],[450,900,1400,2100],[550,1100,1600,2400],[600,1200,1900,2800],[800,1600,2400,3600],[1000,2000,3000,4500],[1100,2200,3400,5100],[1250,2500,3800,5700],[1400,2800,4300,6400],[1600,3200,4800,7200],[2000,3900,5900,8800],[2100,4200,6300,9500],[2400,4900,7300,10900],[2800,5700,8500,12700]];
const DIFN=['Лёгкий','Средний','Трудный','Смертельный'];
const mult=n=>n<=1?1:n===2?1.5:n<=6?2:n<=10?2.5:n<=14?3:4;
let enc=LS.get('enc',[]);
function encounter(q){const party=players.length?players:[{lvl:1}];const th=[0,0,0,0];party.forEach(p=>THR[Math.min(19,Math.max(0,p.lvl-1))].forEach((v,i)=>th[i]+=v));
 const n=enc.reduce((a,e)=>a+e.c,0),raw=enc.reduce((a,e)=>a+(DATA.monsters.find(m=>m.id===e.id)?.xp||0)*e.c,0),adj=raw*mult(n);let d=-1;th.forEach((v,i)=>{if(adj>=v)d=i});
 const res=q?DATA.monsters.filter(m=>m.n.toLowerCase().includes(q.toLowerCase())).slice(0,8):[];
 openSheet(`<div class="sb-title">Конструктор столкновения</div><div class="sb-sub">Отряд: ${party.length} × ур. ${party.map(p=>p.lvl).join(', ')}</div>
 <div class="enc-bar">${DIFN.map((l,i)=>`<div class="${d>=i?'on':''} d${i}"><small>${l}</small><b>${th[i]}</b></div>`).join('')}</div>
 <div class="enc-sum">Опыт: ${raw} × ${mult(n)} = <b>${Math.round(adj)}</b> → <b class="d${Math.max(0,d)}">${d<0?'Пустяк':DIFN[d]}</b><br><small>Награда отряду: ${raw} опыта (по ${Math.floor(raw/party.length)} каждому)</small></div>
 <div class="list">${enc.map((e,i)=>{const m=DATA.monsters.find(x=>x.id===e.id);return m?`<div class="card enc-r"><div class="grow"><div class="t">${esc(m.n)}</div><div class="m">ПО ${crTxt(m.cr)} · ${m.xp} оп. · КД ${m.ac} · ${m.hp} хит.</div></div><button class="btn sm" data-c="${i}" data-d="-1">−</button><b>${e.c}</b><button class="btn sm" data-c="${i}" data-d="1">＋</button></div>`:''}).join('')}</div>
 <input class="inp" id="eq" placeholder="Найти монстра…" value="${esc(q||'')}" style="margin-top:8px"><div class="list" id="eres">${res.map(m=>`<button class="card" data-add="${m.id}"><div class="t">${esc(m.n)}</div><div class="m">ПО ${crTxt(m.cr)} · ${m.xp} оп.</div></button>`).join('')}</div>
 <div class="row" style="margin-top:12px"><button class="btn red grow" id="ego" ${enc.length?'':'disabled'}>⚔ В бой (+ герои)</button><button class="btn" id="ecl">Очистить</button><button class="btn" id="exp">＋ опыт героям</button></div>`,r=>{
 const sv=()=>LS.set('enc',enc);let tm;$('#eq',r).oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{encounter(e.target.value);setTimeout(()=>{const i=$('#eq');if(i){i.focus();i.setSelectionRange(99,99)}},30)},250)};
 r.onclick=e=>{if(!$('#ego',r))return;const a=e.target.closest('[data-add]');if(a){const x=enc.find(z=>z.id===a.dataset.add);x?x.c++:enc.push({id:a.dataset.add,c:1});sv();encounter('')}
  if(!$('#ego',r))return;const c=e.target.closest('.enc-r [data-c][data-d]');if(c){const x=enc[+c.dataset.c];if(!x)return;x.c+= +c.dataset.d;if(x.c<=0)enc.splice(+c.dataset.c,1);sv();encounter(q)}};
 $('#ecl',r).onclick=()=>{const o=enc;enc=[];sv();encounter('');KM.undoToast('Столкновение очищено',()=>{enc=o;sv();encounter('')})};
 $('#exp',r).onclick=()=>{const each=Math.floor(raw/party.length);players.forEach(p=>{fix(p);p.xp+=each});save();toast(`+${each} опыта каждому`);KM.logS&&KM.logS(`Опыт: +${each} каждому`)};
 $('#ego',r).onclick=()=>{players.forEach(p=>{if(!combat.list.some(c=>c.name===p.name))addCombatant({n:p.name,hp:p.hp,maxhp:p.maxhp,ac:p.ac,st:p.st},true)});enc.forEach(e=>{const m=DATA.monsters.find(x=>x.id===e.id);for(let i=0;i<e.c;i++)addCombatant({...m,n:m.n})});closeSheet();KM.go(KM.SECTIONS.findIndex(x=>x[0]==='combat'));setTimeout(()=>{try{rCombat()}catch(e){}},450);toast('Бой начат: бросьте инициативу')}})}
KM.encounter=encounter;
const _rc=rCombat;window.rCombat=rCombat=function(){_rc.apply(this,arguments);if($('#encB'))return;const b=document.createElement('button');b.id='encB';b.className='btn';b.style.cssText='width:100%;margin:6px 0';b.textContent='⚖ Конструктор столкновения · сложность';b.onclick=()=>encounter('');const hd=page.querySelector('.hdr,header,.page-h');(hd&&hd.nextSibling?hd.parentNode.insertBefore(b,hd.nextSibling):page.prepend(b))};
/* ---- campaign: quests, handouts, calendar & weather, shop ---- */
let camp=LS.get('camp',{q:[],h:[],day:1,month:0,year:1492,wx:'',shop:[]});const csave=()=>LS.set('camp',camp);KM.hoAdd=(n,t,sh)=>{camp.h.unshift({n,t,sh:!!sh});csave();KM.table&&KM.table.push(true)};if(camp.cal!==2){camp.month=Math.max(0,Math.min(11,+camp.month||0));camp.cal=2;setTimeout(()=>{camp.day=Math.max(1,Math.min(camp.day||1,dim(camp.month,camp.year)));csave()},0)}
const MON=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];const MONG=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];const WD=['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];const SEAS=m=>m<2||m>10?'Зима':m<5?'Весна':m<8?'Лето':'Осень';const leap=y=>camp.leap!==false&&(y%4===0&&y%100!==0||y%400===0);const dim=(m,y)=>[31,leap(y)?29:28,31,30,31,30,31,31,30,31,30,31][m];const wday=()=>{const d=new Date(0);d.setUTCFullYear(camp.year,camp.month,camp.day);return WD[d.getUTCDay()]};function addDays(n){camp.day+=n;while(camp.day>dim(camp.month,camp.year)){camp.day-=dim(camp.month,camp.year);camp.month++;if(camp.month>11){camp.month=0;camp.year++}}while(camp.day<1){camp.month--;if(camp.month<0){camp.month=11;camp.year--}camp.day+=dim(camp.month,camp.year)}}
const WX=[['☀','Ясно',22,30],['⛅','Облачно',14,22],['🌧','Дождь',8,16],['⛈','Гроза',12,20],['🌫','Туман',4,10],['❄','Снег',-12,0],['🌬','Сильный ветер',2,12]];
function weather(){const seasonCold=[0,1,10,11].includes(camp.month);const pool=seasonCold?[1,4,5,6,5]:[0,0,1,2,3,4,6];const w=WX[pool[Math.floor(Math.random()*pool.length)]];const t=w[2]+Math.floor(Math.random()*(w[3]-w[2]+1));camp.wx=`${w[0]} ${w[1]}, ${t} °C`;csave()}
let cview='notes';
const _rn=rNotes;window.rNotes=rNotes=function(){const seg=`<div class="seg" id="cseg">${[['notes','Заметки'],['q','Квесты'],['h','Раздатки'],['cal','Календарь'],['shop','Лавка']].map(([k,l])=>`<button data-v="${k}" class="${cview===k?'on':''}">${l}</button>`).join('')}</div>`;
 if(cview==='notes'){_rn.apply(this,arguments);const h=page.querySelector('.hdr,.ph,header');const d=document.createElement('div');d.innerHTML=seg;(page.children[1]?page.insertBefore(d.firstChild,page.children[1]):page.append(d.firstChild))}
 else{page.onclick=null;page.oninput=null;page.innerHTML=header('Сюжет','кампания','tri',0)+seg+'<div id="cbody"></div>';campBody()}
 $('#cseg').onclick=e=>{const b=e.target.closest('[data-v]');if(b){cview=b.dataset.v;rNotes()}}};
function campBody(){const B=$('#cbody');
 if(cview==='q'){B.innerHTML=`<div class="row"><input class="inp grow" id="qn" placeholder="Новый квест: найти пропавшую дочь мельника…"><button class="btn red" id="qa">＋</button></div><div class="list" style="margin-top:8px">${camp.q.map((q,i)=>`<div class="card q-${q.s}"><div class="grow"><div class="t">${q.s==='done'?'✓ ':q.s==='fail'?'✗ ':''}${esc(q.n)}</div><textarea class="inp" data-qt="${i}" rows="2" placeholder="Зацепки, награда, кто дал…">${esc(q.t||'')}</textarea></div><div class="col"><button class="btn sm" data-qs="${i}">${q.s==='open'?'Выполнен':q.s==='done'?'Провален':'Открыть'}</button><button class="btn sm dark" data-qd="${i}">✕</button></div></div>`).join('')||'<div class="muted">Квестов пока нет.</div>'}</div>`;
  $('#qa').onclick=()=>{const v=$('#qn').value.trim();if(!v)return;camp.q.unshift({n:v,s:'open',t:''});csave();campBody()};
  B.oninput=e=>{const i=e.target.dataset.qt;if(i!=null){camp.q[+i].t=e.target.value;csave()}};
  B.onclick=e=>{const s=e.target.dataset.qs,d=e.target.dataset.qd;if(s!=null){const q=camp.q[+s];q.s=q.s==='open'?'done':q.s==='done'?'fail':'open';csave();campBody()}if(d!=null){const o=camp.q.slice();camp.q.splice(+d,1);csave();campBody();KM.undoToast('Квест удалён',()=>{camp.q=o;csave();campBody()})}}}
 if(cview==='h'){B.innerHTML=`<div class="muted" style="font-size:12.5px">Раздатки — письма, карты, записки. Открой на весь экран и покажи игрокам.</div><div class="row" style="margin:8px 0"><button class="btn red" id="ha">＋ Текст</button><button class="btn" id="htpl">＋ Из шаблона</button><label class="btn">＋ Картинка<input type="file" accept="image/*" id="hi" hidden></label></div><div class="list">${camp.h.map((h,i)=>`<div class="card"><div class="grow" data-hv="${i}"><div class="t">${esc(h.n)}</div><div class="m">${h.img?'изображение':esc((h.t||'').slice(0,60))}</div></div><button class="btn sm${h.sh?' red':''}" data-hs="${i}">${h.sh?'◎ У игроков':'◌ Игрокам'}</button><button class="btn sm" data-hv="${i}">Показать</button>${h.img?'':`<button class="btn sm" data-he="${i}" aria-label="Изменить">✎</button>`}<button class="btn sm dark" data-hd="${i}">✕</button></div>`).join('')}</div>`;
  B.querySelectorAll('[data-hs]').forEach(b=>b.onclick=e=>{e.stopPropagation();const h=camp.h[+b.dataset.hs];h.sh=!h.sh;csave();campBody();toast(h.sh?'Раздатка отправлена игрокам':'Раздатка скрыта')});
  $('#htpl').onclick=()=>KM.hoTpl(()=>campBody());$('#ha').onclick=()=>{openSheet(`<div class="sb-title">Раздатка</div><input class="inp" id="hn" placeholder="Название"><textarea class="inp" id="ht" rows="8" placeholder="Текст письма…" style="margin-top:8px"></textarea><button class="btn red" id="hs" style="margin-top:10px">Сохранить</button>`,r=>{$('#hs',r).onclick=()=>{camp.h.unshift({n:$('#hn',r).value||'Письмо',t:$('#ht',r).value});csave();closeSheet();campBody()}})};
  $('#hi').onchange=e=>{const f=e.target.files[0];if(!f)return;const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),k=Math.min(1,1200/Math.max(im.width,im.height));c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);camp.h.unshift({n:f.name.replace(/\.\w+$/,''),img:c.toDataURL('image/jpeg',.75)});try{csave()}catch(e){toast('Мало места')}campBody()};im.src=fr.result};fr.readAsDataURL(f)};
  B.onclick=e=>{const v=e.target.closest('[data-hv]'),d=e.target.dataset.hd,ed=e.target.dataset.he;if(ed!=null){const h=camp.h[+ed];openSheet(`<div class="sb-title">Изменить раздатку</div><input class="inp" id="hn" value="${esc(h.n)}"><textarea class="inp" id="ht" rows="8" style="margin-top:8px">${esc(h.t||'')}</textarea><div class="row" style="margin-top:10px"><button class="btn" id="hp">Предпросмотр</button><button class="btn red grow" id="hs">Сохранить</button></div>`,r=>{$('#hp',r).onclick=()=>KMH.open({n:$('#hn',r).value,t:$('#ht',r).value});$('#hs',r).onclick=()=>{h.n=$('#hn',r).value||'Письмо';h.t=$('#ht',r).value;csave();closeSheet();campBody();KM.table&&KM.table.push(true);toast('Раздатка обновлена')}});return}if(d!=null){const o=camp.h.slice();camp.h.splice(+d,1);csave();campBody();KM.undoToast('Раздатка удалена',()=>{camp.h=o;csave();campBody()});return}if(v){const h=camp.h[+v.dataset.hv];KMH.open(h)}}}
 if(cview==='cal'){if(!camp.wx)weather();B.innerHTML=`<div class="hs-box" style="text-align:center"><small>Сегодня</small><b style="font-size:26px">${camp.day} ${MONG[camp.month]}</b><div class="muted">${wday()} · ${camp.year} г. · ${SEAS(camp.month)}${leap(camp.year)?' · високосный':''}</div><div style="font-size:20px;margin:8px 0">${camp.wx}</div><div class="row" style="justify-content:center"><button class="btn sm" data-dd="-1">◀ День</button><button class="btn sm red" data-dd="1">День ▶</button><button class="btn sm" data-dd="7">+ Неделя</button><button class="btn sm" data-wx>⟳ Погода</button></div></div><label class="f">Месяц</label>${chips('mon',MON.map((m,i)=>[i,m]),camp.month)}<label class="f">Високосные годы</label>${chips('leap',[['1','Как в жизни'],['0','Без 29 февраля']],camp.leap===false?'0':'1')}`;
  bindChips(B,(n,v)=>{if(n==='leap'){camp.leap=v==='1';}else{camp.month=+v;}camp.day=Math.min(camp.day,dim(camp.month,camp.year));csave();weather();campBody()});
  B.onclick=e=>{const d=e.target.dataset.dd;if(d){addDays(+d);csave();weather();KM.logS&&KM.logS(`${wday()}, ${camp.day} ${MONG[camp.month]} — ${camp.wx}`);campBody()}if(e.target.closest('[data-wx]')){weather();campBody()}}}
 if(cview==='shop'&&KM.shops){KM.shops.embed(B);return}if(cview==='shop'){if(!camp.shop.length)stock();B.innerHTML=`<div class="row"><button class="btn sm" id="sr">⟳ Новый ассортимент</button>${chips('mk',[['0.8','Дёшево'],['1','Обычно'],['1.3','Дорого']],camp.mk||1)}</div><div class="list" style="margin-top:8px">${camp.shop.map((id,i)=>{const it=DATA.items.find(x=>x.id===id);if(!it)return'';return`<div class="card"><div class="grow" data-io="${id}"><div class="t">${esc(it.n)}</div><div class="m">${esc(it.cat)} · ${it.rar||''}</div></div><b class="price">${price(it)}</b><button class="btn sm" data-buy="${id}">Продать</button></div>`}).join('')}</div>`;
  bindChips(B,(n,v)=>{camp.mk=+v;csave();campBody()});$('#sr').onclick=()=>{stock();campBody()};
  B.onclick=e=>{const o=e.target.closest('[data-io]');if(o)return showItem(o.dataset.io);const b=e.target.closest('[data-buy]');if(b){const it=DATA.items.find(x=>x.id===b.dataset.buy);openSheet(`<div class="sb-title">Кто покупает?</div><div class="sb-sub">${esc(it.n)} · ${price(it)}</div><div class="list" style="margin-top:12px">${players.map((p,i)=>`<button class="card" data-pi="${i}"><div class="t">${esc(p.name)}</div><div class="m">${fix(p).coins.зм} зм</div></button>`).join('')}</div>`,r=>{r.onclick=ev=>{const x=ev.target.closest('[data-pi]');if(!x)return;const p=players[+x.dataset.pi],c=gp(it);if(p.coins.зм<c)return toast('Не хватает золота');p.coins.зм-=Math.ceil(c);p.gold=p.coins.зм;giveItem(p,it);closeSheet()}})}}}}
const gp=it=>{const m=String(it.cost||'').replace(/\s/g,'').match(/([\d,.]+)(мм|см|эм|зм|пм)/);if(!m)return 0;return +m[1].replace(',','.')*({мм:.01,см:.1,эм:.5,зм:1,пм:10}[m[2]])*(camp.mk||1)};
const price=it=>{const v=gp(it);return v?(v>=1?Math.round(v)+' зм':Math.round(v*10)+' см'):'—'};
function stock(){const pool=DATA.items.filter(i=>gp(i)>0&&!i.art&&(i.rar==='Обычный'||!i.rar||Math.random()<.04));camp.shop=Array.from({length:14},()=>pool[Math.floor(Math.random()*pool.length)].id).filter((v,i,a)=>a.indexOf(v)===i);csave()}

;KM.cal={MON,MONG,WD,dim,wday,dateIn:n=>{const o=[camp.day,camp.month,camp.year];addDays(n);const r=`${camp.day} ${MONG[camp.month]}`;[camp.day,camp.month,camp.year]=o;return r},addDays:n=>{addDays(n);csave();KM.uses&&KM.uses.onDays(n)},season:()=>SEAS(camp.month),short:()=>`${wday().slice(0,2)}, ${camp.day} ${MONG[camp.month]}`,full:()=>`${wday()}, ${camp.day} ${MONG[camp.month]} ${camp.year} г.`};
(function(){let lastD=null;setInterval(()=>{try{const D=sess.day;if(lastD===null){lastD=D;return}if(D>lastD){addDays(D-lastD);KM.uses&&KM.uses.onDays(D-lastD);csave();weather();KM.logS&&KM.logS('Новый день: '+KM.cal.full())}lastD=D}catch(e){}},1500)})();
KM.hdOf=hdOf;KM.levelUp=levelUp;KM.skMod=skMod;KM.SK=SK;
}

/* правило стола: подсказка повышения уровня по опыту, хиты — фикс. среднее */
KM.lvlPrompt=function(L){const md=v=>Math.floor((v-10)/2);const XL=[0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];const R=(L||players).filter(p=>p.lvl<20&&(p.xp||0)>=XL[p.lvl]);if(!R.length)return;openSheet(`<div class="sb-title">⬆ Новый уровень!</div><div class="sb-sub">Опыта хватает. Хиты: фиксированное среднее кости + ТЕЛ.</div>${R.map(p=>`<button class="btn nv-big" data-lu="${p.id}">${esc(p.name)}: ${p.lvl} → ${p.lvl+1} ур. <small>+${Math.max(1,Math.floor(KM.hdOf(p)/2)+1+md(p.st[2]))} к макс. хитам</small></button>`).join('')}<button class="btn" data-lx style="width:100%;margin-top:8px">Позже</button>`,r=>{r.onclick=e=>{const b=e.target.closest('[data-lu]');if(b){const p=players.find(x=>x.id===b.dataset.lu);KM.levelUp(p);b.remove();if(!r.querySelector('[data-lu]'))closeSheet()}if(e.target.closest('[data-lx]'))closeSheet()}})};

document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ginsp]');if(!b)return;e.stopPropagation();const p=players.find(x=>x.id===b.dataset.ginsp);if(!p)return;p.insp=!p.insp;save();KM.logS&&KM.logS(p.name+(p.insp?': получает вдохновение':': вдохновение снято'));toast(p.name+(p.insp?': ✦ вдохновение выдано':': вдохновение снято'));b.classList.toggle('on',p.insp);b.textContent='✦'+(p.insp?' есть':' выдать')},true);

;
/* classx.js */
'use strict';
/* classx.js — Чародей (Источник магии, Метамагия, замена заклинания) и Колдун (Мистический арканум). Общий для Мастера и игрока. */
(function(){
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SP=()=>((window.DATA&&DATA.spells&&DATA.spells.length)?DATA.spells:(window.PDATA&&PDATA.spells)||[]);
const spOf=id=>SP().find(s=>s.id===id);
const isSorc=p=>/Чародей/i.test(p&&p.cls||''),isWar=p=>/Колдун/i.test(p&&p.cls||'');
const COST={1:2,2:3,3:5,4:6,5:7};
const MM=[['careful','Осторожное',1,'Союзники (до мод. ХАР) автоматически преуспевают в спасброске'],['distant','Дальнее',1,'Дальность ×2; «касание» → 9 м'],['empowered','Усиленное',1,'Перебросить кости урона (до мод. ХАР)'],['extended','Продлённое',1,'Длительность ×2 (макс. 24 ч)'],['heightened','Повышенное',3,'Одна цель — помеха на первый спасбросок'],['quickened','Ускоренное',2,'Время накладывания: 1 действие → бонусное действие'],['subtle','Незаметное',1,'Без жестов и слов (В, С)'],['twinned','Удвоенное',-1,'Вторая цель (одиночное заклинание); стоит уровень, заговор — 1']];
const mmMax=p=>(p.lvl>=17?4:p.lvl>=10?3:p.lvl>=3?2:0);
const mmCost=(k,lvl)=>{const m=MM.find(x=>x[0]===k);return m?(m[2]<0?Math.max(1,lvl||0):m[2]):0};
const ptsKey=p=>{p.uses=p.uses||{};return Object.keys(p.uses).find(k=>/Очки чародейства/i.test(p.uses[k].n||k))};
const pts=p=>{const k=ptsKey(p);if(!k)return null;const u=p.uses[k];return{k,u,left:Math.max(0,u.max-(u.used||0))}};
const slotUsed=s=>s?('used' in s?s.used:(s.u||0)):0;const setUsed=(s,v)=>{if('u' in s&&!('used' in s))s.u=v;else s.used=v};
const ARC=[[11,6],[13,7],[15,8],[17,9]];
/* применить действие (Мастер — сразу; игрок — через запрос) */
function apply(p,v){if(!p||!v)return'нет данных';const P=pts(p);
 if(v.op==='s2p'){const l=+v.l,s=p.slots&&p.slots[l];if(!P)return'нет очков';if(!s||slotUsed(s)>=s.max)return'нет свободной ячейки '+l+' ур.';if(P.left+l>P.u.max)return'очков будет больше максимума';setUsed(s,slotUsed(s)+1);P.u.used=Math.max(0,P.u.used-l);return''}
 if(v.op==='p2s'){const l=+v.l,c=COST[l];if(!c)return'только 1–5 круг';if(!P||P.left<c)return'нужно '+c+' очк.';p.slots=p.slots||{};const s=p.slots[l]=p.slots[l]||{max:0,used:0};P.u.used+=c;s.max++;p.fom=p.fom||{};p.fom[l]=(p.fom[l]||0)+1;return''}
 if(v.op==='mm'){const c=(v.mm||[]).reduce((a,k)=>a+mmCost(k,+v.lvl),0);if(!c)return'';if(!P||P.left<c)return'нужно '+c+' очк.';P.u.used+=c;return''}
 if(v.op==='mmset'){const a=(v.mm||[]).filter(k=>MM.some(m=>m[0]===k)).slice(0,mmMax(p));p.mm=a;return''}
 if(v.op==='swap'){const a=spOf(v.from),b=spOf(v.to);p.spells=p.spells||[];if(!a||!b||!p.spells.includes(v.from))return'нет такого заклинания';if(a.l!==b.l)return'нужен тот же уровень';if(!(b.cl||[]).some(c=>/Чародей/i.test(c)))return'не из списка чародея';{const r=canSpell(p,b);if(!r.ok)return r.msg}if(!P||P.left<1)return'нужно 1 очко';P.u.used+=1;p.spells=p.spells.map(x=>x===v.from?v.to:x);return''}
 if(v.op==='arc'){const l=+v.l,b=spOf(v.id);if(!ARC.some(([L,c])=>c===l&&p.lvl>=L))return'круг ещё не открыт';if(!b||b.l!==l||!(b.cl||[]).some(c=>/Колдун/i.test(c)))return'нужно заклинание колдуна '+l+' круга';{const r=canSpell(p,b);if(!r.ok)return r.msg}p.arc=p.arc||{};p.arc[l]={id:v.id,used:false};return''}
 if(v.op==='arcuse'){const l=+v.l;p.arc=p.arc||{};if(!p.arc[l])return'не выбран';p.arc[l].used=!!v.used;return''}
 return'неизвестно'}
function desc(v){const n=id=>(spOf(id)||{}).n||id;if(!v)return'';if(v.op==='swap')return`заменить «${n(v.from)}» → «${n(v.to)}» (1 очко)`;if(v.op==='arc')return`арканум ${v.l} круга: «${n(v.id)}»`;if(v.op==='s2p')return`ячейка ${v.l} ур. → ${v.l} очк.`;if(v.op==='p2s')return`${COST[v.l]} очк. → ячейка ${v.l} ур.`;if(v.op==='mm')return'метамагия: '+(v.mm||[]).map(k=>(MM.find(m=>m[0]===k)||[])[1]).join(', ');if(v.op==='mmset')return'выбор метамагии';if(v.op==='arcuse')return'арканум '+v.l+(v.used?': использован':': снова готов');return v.op}
function longRest(p){if(p.fom&&p.slots){for(const l in p.fom){const s=p.slots[l];if(s){s.max=Math.max(0,s.max-p.fom[l]);setUsed(s,Math.min(slotUsed(s),s.max))}}p.fom={}}if(p.arc)for(const l in p.arc)p.arc[l].used=false}
const note=mm=>mm.map(k=>{const m=MM.find(x=>x[0]===k);return m?m[1]+': '+m[3]:''}).filter(Boolean).join(' · ');
/* панель. ctx: {mode:'dm'|'pl', act(v,done), rerender()} */
function html(p,mode){let h='';const pl=mode==='pl';
 if(isSorc(p)){const P=pts(p);const ks=Object.keys(p.slots||{}).filter(l=>(p.slots[l]||{}).max>0).sort();
  h+=`<div class="card cx"><b>✴ Источник магии</b> <span class="muted">очки: <b>${P?P.left+'/'+P.u.max:'—'}</b></span>
  <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px"><span class="muted" style="font-size:12.5px">Ячейка → очки:</span>${ks.map(l=>`<button class="btn sm" data-cxs2p="${l}" ${slotUsed(p.slots[l])>=p.slots[l].max?'disabled':''}>${l} ур. (+${l})</button>`).join('')||'<span class="muted">нет ячеек</span>'}</div>
  <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px"><span class="muted" style="font-size:12.5px">Очки → ячейка:</span>${[1,2,3,4,5].map(l=>`<button class="btn sm" data-cxp2s="${l}" ${!P||P.left<COST[l]?'disabled':''}>${l} ур. (−${COST[l]})</button>`).join('')}</div>
  ${p.fom&&Object.keys(p.fom).some(l=>p.fom[l])?`<div class="muted" style="font-size:12px;margin-top:4px">Созданные ячейки исчезнут после долгого отдыха: ${Object.keys(p.fom).filter(l=>p.fom[l]).map(l=>l+' ур.×'+p.fom[l]).join(', ')}</div>`:''}</div>`;
  const mx=mmMax(p),mm=p.mm||[];
  if(mx)h+=`<div class="card cx"><b>🜂 Метамагия</b> <span class="muted">${mm.length}/${mx}</span><div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">${MM.map(([k,n,c,d])=>`<button class="chip${mm.includes(k)?' on':''}" data-cxmm="${k}" title="${E(d)}">${n} · ${c<0?'ур.':c}</button>`).join('')}</div><div class="muted" style="font-size:12px;margin-top:4px">${mm.length?E(note(mm)):'Выберите варианты (с 3 ур. — 2, с 10 — 3, с 17 — 4).'}</div>
  <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><select class="inp grow" id="cxCast">${(p.spells||[]).map(spOf).filter(Boolean).sort((a,b)=>a.l-b.l).map(s=>`<option value="${s.id}">${s.l?s.l+' ур.':'заг.'} · ${E(s.n)}</option>`).join('')}</select><button class="btn sm red" id="cxCastB">✦ Сотворить с метамагией</button></div></div>`;
  const kn=(p.spells||[]).map(spOf).filter(s=>s&&s.l>0);
  h+=`<div class="card cx"><b>⇄ Замена заклинания на ходу</b> <span class="muted">(1 очко${pl?', с одобрения Мастера':''})</span><div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><select class="inp grow" id="cxFrom">${kn.map(s=>`<option value="${s.id}">${s.l} ур. · ${E(s.n)}</option>`).join('')}</select><select class="inp grow" id="cxTo"></select><button class="btn sm" id="cxSw">${pl?'Запросить':'Заменить'}</button></div></div>`}
 if(isWar(p)){const op=ARC.filter(([L])=>p.lvl>=L);p.arc=p.arc||{};
  h+=`<div class="card cx"><b>🜏 Мистический арканум</b>${op.length?op.map(([L,c])=>{const a=p.arc[c],s=a&&spOf(a.id);return `<div class="row" style="gap:6px;margin-top:6px;align-items:center;flex-wrap:wrap"><span style="width:52px" class="muted">${c} круг</span>${s?`<b class="grow">${E(s.n)}</b><label class="row" style="gap:4px"><input type="checkbox" data-cxau="${c}"${a.used?' checked':''}> использован</label>`:'<span class="grow muted">не выбрано</span>'}<select class="inp" data-cxas="${c}" style="max-width:150px"><option value="">${s?'сменить…':'выбрать…'}</option>${SP().filter(x=>x.l===c&&(x.cl||[]).some(z=>/Колдун/i.test(z))).map(x=>`<option value="${x.id}">${E(x.n)}</option>`).join('')}</select></div>`}).join(''):'<div class="muted" style="font-size:12.5px;margin-top:4px">Открывается с 11 уровня (6 круг), 13 (7), 15 (8), 17 (9).</div>'}${pl&&op.length?'<div class="muted" style="font-size:12px;margin-top:4px">Выбор заклинания — с одобрения Мастера. Сбрасывается долгим отдыхом.</div>':''}</div>`}
 return h}
function bind(p,r,ctx){const q=s=>r.querySelectorAll(s),one=s=>r.querySelector(s);const act=(v,ok,g)=>ctx.act(v,ok,g);
 q('[data-cxs2p]').forEach(b=>b.onclick=()=>act({op:'s2p',l:+b.dataset.cxs2p},'Ячейка → очки'));
 q('[data-cxp2s]').forEach(b=>b.onclick=()=>act({op:'p2s',l:+b.dataset.cxp2s},'Создана ячейка '+b.dataset.cxp2s+' ур.'));
 q('[data-cxmm]').forEach(b=>b.onclick=()=>{const k=b.dataset.cxmm,a=(p.mm||[]).slice();const i=a.indexOf(k);if(i>=0)a.splice(i,1);else{if(a.length>=mmMax(p))return(window.toast||alert)('Можно выбрать: '+mmMax(p));a.push(k)}act({op:'mmset',mm:a})});
 const cb=one('#cxCastB');if(cb)cb.onclick=()=>{const s=spOf(one('#cxCast').value);if(!s)return;cast(p,s,ctx)};
 const fr=one('#cxFrom'),to=one('#cxTo');if(fr&&to){const fill=()=>{const a=spOf(fr.value);to.innerHTML=a?SP().filter(x=>x.l===a.l&&x.id!==a.id&&!(p.spells||[]).includes(x.id)&&(x.cl||[]).some(c=>/Чародей/i.test(c))).sort((x,y)=>x.n.localeCompare(y.n,'ru')).map(x=>`<option value="${x.id}">${E(x.n)}</option>`).join(''):'';};fr.onchange=fill;fill();
  one('#cxSw').onclick=()=>{if(!fr.value||!to.value)return;act({op:'swap',from:fr.value,to:to.value},'Заклинание заменено',true)}}
 q('[data-cxas]').forEach(s=>s.onchange=()=>{if(s.value)act({op:'arc',l:+s.dataset.cxas,id:s.value},'Арканум выбран',true)});
 q('[data-cxau]').forEach(c=>c.onchange=()=>act({op:'arcuse',l:+c.dataset.cxau,used:c.checked}))}
/* окно сотворения с метамагией (используется и в «Чарах» игрока) */
function cast(p,s,ctx,onSlot){const mm=p.mm||[];const P=pts(p);const lv=Object.keys(p.slots||{}).filter(l=>+l>=s.l&&slotUsed(p.slots[l])<p.slots[l].max).sort();
 const o=window.openSheet;o(`<h3>${E(s.n)}</h3>${mm.length?`<p class="muted">Метамагия (очков: ${P?P.left:0})</p><div class="row" style="gap:6px;flex-wrap:wrap">${mm.map(k=>{const m=MM.find(x=>x[0]===k);return `<button class="chip" data-cxt="${k}">${m[1]} · ${mmCost(k,s.l)}</button>`}).join('')}</div><div class="muted" id="cxN" style="font-size:12.5px;margin:6px 0"></div>`:''}
 <p class="muted">${s.l?'Какой ячейкой?':'Заговор'}</p><div>${s.l?lv.map(l=>`<button class="btn ac" data-cxl="${l}" style="margin:4px">${l} ур.</button>`).join('')||'<span class="muted">Нет свободных ячеек</span>':'<button class="btn ac" data-cxl="0">Сотворить</button>'}</div>`,r=>{const on=new Set();const N=r.querySelector('#cxN');
  r.querySelectorAll('[data-cxt]').forEach(b=>b.onclick=()=>{const k=b.dataset.cxt;on.has(k)?on.delete(k):on.add(k);b.classList.toggle('on');const c=[...on].reduce((a,k)=>a+mmCost(k,s.l),0);if(N)N.textContent=on.size?`Стоимость: ${c} очк. · ${note([...on])}`:''});
  r.querySelectorAll('[data-cxl]').forEach(b=>b.onclick=()=>{const l=+b.dataset.cxl,a=[...on];const c=a.reduce((x,k)=>x+mmCost(k,s.l),0);if(c&&(!P||P.left<c))return(window.toast||alert)('Не хватает очков: нужно '+c);
   if(onSlot)onSlot(l);else if(l){setUsed(p.slots[l],slotUsed(p.slots[l])+1)}if(c)ctx.act({op:'mm',mm:a,lvl:s.l});else ctx.act(null);window.closeSheet&&closeSheet();(window.toast||alert)(s.n+' — сотворено'+(a.length?' · '+note(a):''))})})}

/* ===== canSpell: может ли класс героя знать заклинание ===== */
const CAST_AL=[['Волшебник',/волшеб|wizard|^маг$|^маг[\s/,(]|маг-?волш/i],['Чародей',/чародей|sorcer/i],['Жрец',/жрец|клирик|cleric/i],['Друид',/друид|druid/i],['Бард',/бард|bard/i],['Колдун',/колдун|чернокниж|warlock/i],['Паладин',/паладин|paladin/i],['Следопыт',/следопыт|рейнджер|ranger/i],['Изобретатель',/изобретат|артифи|artificer/i]];
const NONCAST=/воин|fighter|плут|rogue|варвар|barbarian|монах|monk/i;
function heroClasses(p){const raw=[p&&p.cls,...(Array.isArray(p&&p.mc)?p.mc.map(x=>x&&(x.cls||x)):[])].filter(Boolean).join(' / ');const parts=String(raw).split(/\s*(?:\/|,|\+|;|\s и\s)\s*/).map(x=>x.trim()).filter(Boolean);const out=new Set();let unknown=false,non=false;
 parts.forEach(c=>{const f=CAST_AL.find(([,r])=>r.test(c));if(f)out.add(f[0]);else if(NONCAST.test(c))non=true;else unknown=true});
 const sub=String((p&&(p.sub||p.subclass||p.arch))||'')+' '+raw;if(/мистическ\S* (рыцар|ловкач|плут)|eldritch knight|arcane trickster/i.test(sub))out.add('Волшебник');
 return{list:[...out],unknown:unknown&&!out.size,non,raw:raw||'—'}}
function canSpell(p,s){if(typeof s==='string')s=spOf(s);if(!p||!s)return{ok:false,msg:'Нет такого заклинания'};
 const extra=[].concat(p.xspells||[],p.bonusSpells||[]);if(extra.includes(s.id))return{ok:true};
 const cl=(s.cl||[]).filter(Boolean);if(!cl.length)return{ok:true,homebrew:true};
 const H=heroClasses(p);if(H.unknown)return{ok:true,unknownCls:true};
 if(cl.some(c=>H.list.includes(c)))return{ok:true};
 return{ok:false,msg:`Класс ${H.raw} не умеет «${s.n}»`}}
function guardSpell(p,s){const r=canSpell(p,s);if(!r.ok)(window.toast||alert)(r.msg);return r.ok}
window.canSpell=canSpell;window.guardSpell=guardSpell;window.heroClasses=heroClasses;
window.CLX={apply,desc,html,bind,cast,longRest,isSorc,isWar,MM,mmMax,COST};
/* Мастер: долгий отдых сбрасывает созданные ячейки и арканум */
const hook=()=>{if(window.KM&&KM.uses&&!KM.uses.__clx){const o=KM.uses.onRest;KM.uses.onRest=function(p,k){if(k==='l')try{longRest(p)}catch(e){}return o.apply(this,arguments)};KM.uses.__clx=1}};hook();setTimeout(hook,0);setTimeout(hook,1500);
})();

;
/* combat.js */
'use strict';{
/* ===== Deep combat tracker ===== */
const DT=[['огн','огонь'],['холод','холод'],['электр','электричество'],['кисл','кислота'],['яд','яд'],['некрот','некротическая энергия'],['излуч','излучение'],['псих','психическая энергия'],['звук','звук'],['силов','силовое поле'],['дробящ','дробящий'],['колющ','колющий'],['рубящ','рубящий']];
const dtOf=s=>{s=String(s||'').toLowerCase();const d=DT.find(([k])=>s.includes(k));return d?d[0]:''};
const md=v=>Math.floor((v-10)/2),fm=v=>(v>=0?'+':'')+v,R=n=>1+Math.floor(Math.random()*n),AB=['СИЛ','ЛОВ','ТЕЛ','ИНТ','МДР','ХАР'];
const monOf=c=>c&&c.mon?DATA.monsters.find(m=>m.id===c.mon):null;
const pOf=c=>c&&c.pc?players.find(p=>p.id===c.pid||p.name===c.base):null;
const C=()=>combat;
function norm(){const k=C();k.log=k.log||[];k.undo=k.undo||[];k.list.forEach(c=>{c.conds=(c.conds||[]).map(x=>typeof x==='string'?{n:x,r:0}:x);c.thp=c.thp||0;c.eco=c.eco||{a:0,b:0,r:0,m:0};c.ds=c.ds||{s:0,f:0};c.note=c.note||'';const m=monOf(c);if(m&&c.legMax==null){c.legMax=(m.lg||[]).length?3:0;c.leg=0;c.rech={};[...(m.a||[]),...(m.f||[])].forEach(a=>{if(/перезаряд/i.test(a.n))c.rech[a.n]=1})}})}
function snap(txt){const k=C();k.undo=k.undo||[];k.log=k.log||[];k.undo.push(JSON.stringify({list:k.list,turn:k.turn,round:k.round}));if(k.undo.length>40)k.undo.shift();if(txt)logC(txt)}
function logC(t){const k=C();k.log=k.log||[];k.log.unshift(`Р${k.round}: ${t}`);k.log.length=Math.min(k.log.length,80);KM.logS&&KM.logS(t)}
function undo(){const k=C();const s=k.undo.pop();if(!s)return toast('Нечего отменять');Object.assign(k,JSON.parse(s));k.log.unshift('↶ отменено');save();rCombat()}
/* ---- damage core ---- */
function rv(c,dt){const m=monOf(c);if(!m||!dt)return 1;const has=f=>String(m[f]||'').toLowerCase().includes(dt);if(has('imm'))return 0;if(has('vul'))return 2;if(has('res'))return .5;return 1}
function concPrompt(c,dc){const P=c.pc&&players.find(p=>p.id===c.pid);const m=P?P:monOf(c);let mod=m&&m.st?md(m.st[2]):0;if(P&&(P.svp||[]).includes(2))mod+=2+Math.floor((P.lvl-1)/4);
 const drop=()=>{c.conds=c.conds.filter(x=>x.n!=='Концентрация');if(P)P.conds=(P.conds||[]).filter(x=>x!=='Концентрация');save();rCombat();logC(c.name+': концентрация прервана');toast(c.name+': концентрация прервана')};
 openSheet(`<div class="sb-title">🔮 Концентрация: ${esc(c.name)}</div><div class="sb-sub">Получен урон — спасбросок Телосложения, Сл ${dc} (10 или половина урона). Мод. ${fm(mod)}</div><div id="ccr" style="text-align:center;font:600 40px CG,serif;min-height:10px"></div><div class="row" style="margin:8px 0"><input class="inp grow" id="ccin" type="number" inputmode="numeric" min="1" max="20" placeholder="Выпало на к20 (настоящий кубик)"><button class="btn red" id="ccgo">OK</button></div><div class="row"><button class="btn sm grow" id="ccroll">🎲 бросить за меня</button><button class="btn grow" id="ccok">✓ Успех</button><button class="btn dark grow" id="ccno">✕ Провал</button></div>`,r=>{
 const res=d=>{const t=d+mod,ok=t>=dc;$('#ccr',r).innerHTML=`${t} <small style="font-size:15px">(к20 ${d} ${fm(mod)}) — ${ok?'удержана':'прервана'}</small>`;logC(`${c.name}: спас концентрации ${t} vs ${dc} — ${ok?'успех':'провал'}`);if(!ok)drop();setTimeout(closeSheet,1400)};$('#ccgo',r).onclick=()=>{const d=+$('#ccin',r).value;if(d>=1&&d<=20)res(d);else toast('Введите 1–20')};setTimeout(()=>{try{$('#ccin',r).focus()}catch(e){}},300);
 $('#ccroll',r).onclick=()=>{const d=1+Math.floor(Math.random()*20),t=d+mod,ok=t>=dc;$('#ccr',r).innerHTML=`${t} <small style="font-size:15px">(к20 ${d} ${fm(mod)}) — ${ok?'удержана':'прервана'}</small>`;logC(`${c.name}: спас концентрации ${t} vs ${dc} — ${ok?'успех':'провал'}`);if(!ok)drop();setTimeout(closeSheet,1400)};
 $('#ccok',r).onclick=()=>{closeSheet()};$('#ccno',r).onclick=()=>{drop();closeSheet()}})}
function damage(c,amt,dt,mult){if(mult==null)mult=rv(c,dt);let v=Math.floor(amt*mult);const out=[];if(mult!==1)out.push(mult===0?'иммунитет':mult===2?'уязвимость ×2':'сопротивление ½');
 const a=Math.min(c.thp,v);c.thp-=a;let rest=v-a;const was=c.hp;c.hp=Math.max(0,c.hp-rest);const over=rest-was;
 if(c.hp===0&&was>0){if(c.pc){{c.ds={s:0,f:0};addCond(c,'Без сознания',0);out.push('без сознания — спасброски от смерти')}}else{c.dead=1;out.push('повержен')}}
 else if(was===0&&rest>0&&c.pc&&!c.dead){c.ds.f=Math.min(3,c.ds.f+1);out.push('провал спасброска от смерти');if(c.ds.f>=3){c.dead=1;out.push('погиб')}}
 if(c.hp===0&&c.conds.some(x=>x.n==='Концентрация')){c.conds=c.conds.filter(x=>x.n!=='Концентрация');out.push('концентрация прервана')}else if(v>0&&c.conds.some(x=>x.n==='Концентрация')&&!c.dead){out.push(`⚠ концентрация: спас ТЕЛ СЛ ${Math.max(10,Math.floor(v/2))}`);const dc=Math.max(10,Math.floor(v/2));clearTimeout(concPrompt.t);concPrompt.t=setTimeout(()=>concPrompt(c,dc),1100)}
 syncP(c);logC(`${c.name}: −${v}${dt?' ('+(DT.find(d=>d[0]===dt)||[0,dt])[1]+')':''}${out.length?' · '+out.join(', '):''}`);return {v,out}}
function heal(c,v){if(c.dead&&!c.pc)c.dead=0;if(c.hp===0){c.ds={s:0,f:0};c.conds=c.conds.filter(x=>x.n!=='Без сознания');c.dead=0}c.hp=Math.min(c.max,c.hp+v);syncP(c);logC(`${c.name}: +${v} хитов`)}
function syncP(c){const p=pOf(c);if(p){p.hp=c.hp;p.maxhp=c.max;p.thp=c.thp;p.ds=c.ds}}
function addCond(c,n,r,end){if(!c.conds.some(x=>x.n===n))c.conds.push({n,r:r||0,end:end||'end'})}
/* ---- turn flow ---- */
function next(dir=1){const k=C();if(!k.list.length)return;snap();const cur=k.list[k.turn];
 if(dir>0&&cur){tick(cur,'end')}
 let i=k.turn,guard=0;do{i+=dir;if(i>=k.list.length){i=0;k.round++;logC('— раунд '+k.round+' —')}if(i<0){i=k.list.length-1;k.round=Math.max(1,k.round-1)}guard++}while(guard<=k.list.length&&(k.list[i].dead&&!k.list[i].pc||k.list[i].delay||(k.round===1&&k.list[i].surp)));if(k.round>1)k.list.forEach(c=>{if(c.surp){c.surp=0;logC(c.name+' приходит в себя после внезапности')}});
 k.turn=i;const n=k.list[i];k.tt=Date.now();if(dir>0&&n){n.eco={a:0,b:0,r:0,m:0};n.leg=0;tick(n,'start');n.conds=n.conds.filter(x=>x.n!=='Подготовлено');
  const msgs=[];Object.keys(n.rech||{}).forEach(a=>{if(!n.rech[a]){const d=R(6),need=+(a.match(/(\d)\s*[–-]\s*6/)||[0,6])[1];if(d>=need){n.rech[a]=1;msgs.push(`«${a.replace(/\s*\(.*\)/,'')}» перезарядилось (к6=${d})`)}}});
  if(n.pc&&n.hp===0&&!n.dead)msgs.push('Спасбросок от смерти!');msgs.forEach(toast)}
 save();rCombat();if(n&&n.pc&&n.hp===0&&!n.dead&&dir>0)setTimeout(()=>deathSave(n),350)}
function tick(c,when){c.conds.forEach(x=>{if(x.r>0&&(x.end||'end')===when){x.r--;if(!x.r){x.gone=1;toast(`${c.name}: «${x.n}» закончилось`);logC(`${c.name}: «${x.n}» закончилось`)}}});c.conds=c.conds.filter(x=>!x.gone)}
function deathSave(c){KM.rollEntry({label:c.name+': спасбросок от смерти',mod:0,vs:10,on:(v,nat)=>{snap();if(nat===20){c.hp=1;c.ds={s:0,f:0};c.conds=c.conds.filter(x=>x.n!=='Без сознания');toast(c.name+' приходит в себя с 1 хитом!')}else if(nat===1)c.ds.f+=2;else if(v>=10)c.ds.s++;else c.ds.f++;
 if(c.ds.f>=3){c.dead=1;toast(c.name+' погибает…')}else if(c.ds.s>=3){addCond(c,'Стабилизирован',0);toast(c.name+' стабилизирован')}syncP(c);logC(`${c.name}: спасбросок от смерти ${v} (${c.ds.s}✓ ${c.ds.f}✗)`);save();setTimeout(()=>{closeSheet();rCombat()},900)}})}
/* ---- parse monster actions ---- */
function parseAtk(a){const d=a.d||'';const h=d.match(/([+−-]\s*\d+)\s*к попаданию/);const dm=[...d.matchAll(/(\d+)\s*\((\d+к\d+(?:\s*[+−-]\s*\d+)?)\)\s*([а-яё]+)/gi)].map(x=>({avg:+x[1],dice:x[2].replace(/\s/g,'').replace('−','-'),dt:dtOf(x[3])}));const sv=d.match(/спасбросок\s+([А-Яа-я]+)\s+(?:со\s+)?СЛ\s*(\d+)/i);return {hit:h?+h[1].replace(/[\s−]/g,m=>m==='−'?'-':''):null,dm,save:sv?{ab:sv[1],dc:+sv[2]}:null}}
const avgD=s=>{const m=String(s).match(/(\d+)к(\d+)([+-]\d+)?/);return m?Math.floor(+m[1]*(+m[2]+1)/2)+(+m[3]||0):0};
const rollD=(s,crit)=>{const m=String(s).match(/(\d+)к(\d+)([+-]\d+)?/);if(!m)return 0;let t=+m[3]||0;for(let i=0;i<(+m[1])*(crit?2:1);i++)t+=R(+m[2]);return t};
/* ---- attack flow ---- */
function attack(src,act){const k=C();const foes=k.list.filter(c=>!c.dead&&c!==src&&(!src||c.pc!==src.pc));const A=act?parseAtk(act):{hit:0,dm:[]};let tgt=foes[0]||k.list.find(c=>c!==src);let adv=0;
 if(A.save&&!A.hit)return multi(src,act);
 openSheet(`<div class="sb-title">${esc(act?act.n:'Атака')}</div><div class="sb-sub">${src?esc(src.name)+' · ':''}${A.hit!=null?'бонус '+fm(A.hit):''}${A.dm.length?' · '+A.dm.map(d=>d.dice+' '+(DT.find(x=>x[0]===d.dt)||['',''])[1]).join(' + '):''}</div>
 <label class="f">Цель</label><div class="chips" id="tg">${k.list.filter(c=>c!==src&&!c.dead).map(c=>`<button class="chip${c===tgt?' on':''}" data-id="${c.id}">${esc(c.name)} · КД ${c.ac??"—"}</button>`).join('')}</div>
 ${A.hit==null?`<label class="f">Бонус атаки</label><input class="inp" id="hb" type="number" inputmode="numeric" value="${src&&src.pc?pb2(src):4}">`:''}
 ${chips('adv',[['0','Обычно'],['1','Преимущество'],['-1','Помеха']],0)}
 <div class="re-out" id="ao">Что выпало на к20?</div><div class="re-pad" id="ap">${Array.from({length:20},(_,i)=>`<button data-v="${i+1}" class="${i===19?'n20':i===0?'n1':''}">${i+1}</button>`).join('')}</div>
 <div class="row" style="margin-top:8px"><button class="btn grow" id="avr">🎲 Бросить за меня</button><button class="btn" id="askip">Сразу урон</button></div><div id="dmgz"></div>`,r=>{
 $('#tg',r).onclick=e=>{const b=e.target.closest('[data-id]');if(!b)return;tgt=k.list.find(c=>c.id===b.dataset.id);$$('#tg .chip',r).forEach(x=>x.classList.toggle('on',x===b))};bindChips(r,(n,v)=>adv=+v);
 const res=(nat,txt)=>{const bonus=A.hit!=null?A.hit:+($('#hb',r)||{}).value||0,tot=nat+bonus,crit=nat===20,hit=crit||nat!==1&&tot>=tgt.ac;
  $('#ao',r).innerHTML=`<b class="re-t">${tot}</b> <small>(${txt||nat} ${fm(bonus)}) против КД ${tgt.ac??"—"}</small><div class="re-v ${hit?'ok':'no'}">${crit?'КРИТ! ':''}${hit?'Попадание':'Промах'}</div>`;$('#ao',r).classList.remove('pop');void $('#ao',r).offsetWidth;$('#ao',r).classList.add('pop');
  logC(`${src?src.name:'Атака'} → ${tgt.name}: ${tot} — ${crit?'крит':hit?'попадание':'промах'}`);if(src)src.eco.a=1;save();
  if(hit)dmgForm(r,src,tgt,A,crit);else $('#dmgz',r).innerHTML=`<button class="btn red" id="dn" style="width:100%;margin-top:10px">Готово</button>`,$('#dn',r).onclick=()=>{closeSheet();rCombat()}};
 $('#ap',r).onclick=e=>{const b=e.target.closest('[data-v]');if(b)res(+b.dataset.v)};
 $('#avr',r).onclick=()=>{const a=R(20),b=R(20),n=adv>0?Math.max(a,b):adv<0?Math.min(a,b):a;res(n,adv?a+' и '+b:null)};
 $('#askip',r).onclick=()=>dmgForm(r,src,tgt,A,false)})}
const pb2=c=>{const p=pOf(c);return p?2+Math.floor((p.lvl-1)/4)+Math.max(md(p.st[0]),md(p.st[1])):4};
function dmgForm(r,src,tgt,A,crit){const d=A.dm[0]||{dice:'',dt:''};let dt=d.dt;const allDice=A.dm.map(x=>x.dice).join(' + ');const mult0=rv(tgt,dt);let mult=mult0;
 $('#dmgz',r).innerHTML=`<div class="sec-h">Урон по ${esc(tgt.name)}</div>${crit?`<div class="re-v ok">Крит: брось кости урона дважды${allDice?' — '+allDice.replace(/(\d+)к/g,(m,n)=>2*n+'к'):''} (модификатор один раз)</div>`:''}
 <input class="inp" id="dv" type="number" inputmode="numeric" placeholder="${allDice?'сумма кубиков '+allDice:'урон'}" style="font-size:24px;text-align:center">
 <div class="row" style="margin-top:6px">${allDice?`<button class="btn sm" id="dav">Среднее ${A.dm.reduce((s,x)=>s+(crit?avgD(x.dice)+avgD(x.dice.replace(/[+-]\d+$/,'')):x.avg),0)}</button><button class="btn sm" id="drl">🎲 Бросить</button>`:''}</div>
 <label class="f">Тип урона</label><div class="chips" id="dts">${DT.map(([k2,l])=>`<button class="chip${k2===dt?' on':''}" data-dt="${k2}">${l}</button>`).join('')}</div>
 ${chips('mul',[['1','обычный'],['0.5','сопр. ½'],['2','уязв. ×2'],['0','иммун.']],mult0)}${mult0!==1?`<div class="muted" style="font-size:12px">Учтено по статблоку цели</div>`:''}
 <button class="btn red" id="dap" style="width:100%;margin-top:10px;padding:16px">Нанести урон</button>`;
 bindChips($('#dmgz',r),(n,v)=>{if(n==='mul')mult=+v});$('#dts',r).onclick=e=>{const b=e.target.closest('[data-dt]');if(!b)return;dt=b.dataset.dt;mult=rv(tgt,dt);$$('#dts .chip',r).forEach(x=>x.classList.toggle('on',x===b));$$('[data-chips=mul] .chip',r).forEach(x=>x.classList.toggle('on',+x.dataset.v===mult))};
 const dav=$('#dav',r);if(dav){dav.onclick=()=>$('#dv',r).value=dav.textContent.replace(/\D/g,'');$('#drl',r).onclick=()=>{$('#dv',r).value=A.dm.reduce((s,x)=>s+rollD(x.dice,crit),0)}}
 setTimeout(()=>$('#dv',r).focus(),50);$('#dmgz',r).scrollIntoView({behavior:'smooth'});
 $('#dap',r).onclick=()=>{const v=+$('#dv',r).value||0;if(!v)return toast('Введи урон с кубиков');snap();const o=damage(tgt,v,dt,mult);save();closeSheet();rCombat();flash(tgt.id);toast(`${tgt.name}: −${o.v}${o.out.length?' · '+o.out.join(', '):''}`)}}
function flash(id){const e=document.querySelector(`[data-cid="${id}"]`);if(e){e.classList.remove('hitfx');void e.offsetWidth;e.classList.add('hitfx')}}
/* ---- multi-target (area / save) ---- */
function multi(src,act,ids){const k=C();const A=act?parseAtk(act):{dm:[],save:null};let sel=new Set(ids||k.list.filter(c=>!c.dead&&src&&c.pc!==src.pc).map(c=>c.id));const sv={};let dt=(A.dm[0]||{}).dt||'';const ABI={СИЛ:0,Силы:0,ЛОВ:1,Ловкости:1,ТЕЛ:2,Телосложения:2,ИНТ:3,Интеллекта:3,МДР:4,Мудрости:4,ХАР:5,Харизмы:5};let ab=A.save?(ABI[A.save.ab]??1):1;
 const draw=()=>openSheet(`<div class="sb-title">${esc(act?act.n:'Урон по области')}</div><div class="sb-sub">Несколько целей · спасбросок — половина урона</div>
 <div class="row"><div class="grow"><label class="f">Урон</label><input class="inp" id="mv" type="number" inputmode="numeric" placeholder="${A.dm.map(d=>d.dice).join('+')||'сумма'}" style="font-size:20px"></div><div><label class="f">СЛ</label><input class="inp" id="mdc" type="number" inputmode="numeric" value="${A.save?A.save.dc:(src&&src.pc?13:13)}" style="width:70px"></div></div>
 ${A.dm.length?`<button class="btn sm" id="mrl">🎲 Бросить ${A.dm.map(d=>d.dice).join('+')}</button>`:''}
 <label class="f">Спасбросок</label>${chips('mab',AB.map((a,i)=>[i,a]),ab)}
 <label class="f">Тип урона</label><div class="chips" id="mdt">${DT.map(([k2,l])=>`<button class="chip${k2===dt?' on':''}" data-dt="${k2}">${l}</button>`).join('')}</div>
 <div class="list" id="mt" style="margin-top:8px">${k.list.filter(c=>!c.dead).map(c=>`<div class="card mt-r${sel.has(c.id)?' on':''}" data-id="${c.id}"><button class="dot${sel.has(c.id)?' on':''}" data-sel></button><div class="grow"><div class="t">${esc(c.name)}</div><div class="m">${c.hp}/${c.max} · КД ${c.ac??"—"}</div></div><button class="btn sm${sv[c.id]===1?' on-g':''}" data-s="1">Успех</button><button class="btn sm${sv[c.id]===0?' on-r':''}" data-s="0">Провал</button></div>`).join('')}</div>
 <div class="row" style="margin-top:6px"><button class="btn sm" id="mauto">🎲 Спасброски монстров</button></div>
 <button class="btn red" id="map" style="width:100%;margin-top:10px;padding:16px">Нанести всем выбранным</button>`,r=>{
 bindChips(r,(n,v)=>{if(n==='mab')ab=+v});$('#mdt',r).onclick=e=>{const b=e.target.closest('[data-dt]');if(b){dt=b.dataset.dt;$$('#mdt .chip',r).forEach(x=>x.classList.toggle('on',x===b))}};
 const mr=$('#mrl',r);if(mr)mr.onclick=()=>$('#mv',r).value=A.dm.reduce((s,x)=>s+rollD(x.dice),0);
 $('#mt',r).onclick=e=>{const row=e.target.closest('[data-id]');if(!row)return;const id=row.dataset.id;const s=e.target.closest('[data-s]');if(s){sv[id]=+s.dataset.s;sel.add(id)}else{sel.has(id)?sel.delete(id):sel.add(id)}const v=$('#mv',r).value,dc=$('#mdc',r).value;draw();setTimeout(()=>{$('#mv').value=v;$('#mdc').value=dc},0)};
 $('#mauto',r).onclick=()=>{const dc=+$('#mdc',r).value||13;k.list.filter(c=>sel.has(c.id)&&!c.pc).forEach(c=>{const m=monOf(c);let b=m?md(m.st[ab]):0;const sm=m&&String(m.sv||'').match(new RegExp(AB[ab].slice(0,3)+'[а-я]*\\s*([+-]\\d+)','i'));if(sm)b=+sm[1];sv[c.id]=R(20)+b>=dc?1:0});const v=$('#mv',r).value;draw();setTimeout(()=>$('#mv').value=v,0)};
 $('#map',r).onclick=()=>{const v=+$('#mv',r).value||0;if(!v)return toast('Введи урон');snap(`${act?act.n:'Область'}: ${v} урона`);const msg=[];k.list.filter(c=>sel.has(c.id)).forEach(c=>{const o=damage(c,sv[c.id]===1?Math.floor(v/2):v,dt);msg.push(`${c.name} −${o.v}`)});if(src){src.eco.a=1;if(act&&src.rech&&act.n in src.rech)src.rech[act.n]=0}save();closeSheet();rCombat();sel.forEach(flash);toast(msg.join(', '))}});draw()}
/* ---- bulk add ---- */
function bulk(q){const k=C();const pool=[...DATA.monsters.map(m=>({m,n:m.n})),...(typeof allCast==='function'?allCast():[]).map(c=>{const m=DATA.monsters.find(x=>c.stat&&x.n.toLowerCase()===String(c.stat).toLowerCase().trim())||DATA.monsters.find(x=>c.stat&&String(c.stat).toLowerCase().includes(x.n.toLowerCase()));return m?{m,n:c.n,npc:1}:null}).filter(Boolean)];
 const st=bulk.st=bulk.st||{n:1,hp:'avg'};const ql=(q||'').toLowerCase();const res=ql?pool.filter(x=>x.n.toLowerCase().includes(ql)).slice(0,12):pool.filter(x=>x.m.top).slice(0,10);
 openSheet(`<div class="sb-title">Добавить в бой</div><div class="sb-sub">Сколько, хиты — и тап по существу</div>
 <div class="row bulk-n">${[1,2,3,4,5,6,8].map(n=>`<button class="btn sm${st.n===n?' red':''}" data-n="${n}">×${n}</button>`).join('')}</div>
 ${chips('hpm',[['avg','Средние хиты'],['roll','Бросить хиты']],st.hp)}
 <input class="inp" id="bq" placeholder="Гоблин, разбойник, имя НИП…" value="${esc(q||'')}" style="margin-top:8px">
 <div class="list" id="br">${res.map((x,i)=>`<button class="card" data-i="${i}"><div class="t">${esc(x.n)}${x.npc?' <small>(НИП)</small>':''}</div><div class="m">${x.npc?esc(x.m.n)+' · ':''}ПО ${crTxt(x.m.cr)} · КД ${x.m.ac} · ${x.m.hp} хит. (${x.m.hd})</div></button>`).join('')}</div>
 <div class="row" style="margin-top:10px"><button class="btn" id="bpc">＋ Все герои</button><button class="btn" id="bcu">＋ Своё существо</button></div>`,r=>{
 $$('[data-n]',r).forEach(b=>b.onclick=()=>{st.n=+b.dataset.n;bulk($('#bq',r).value)});bindChips(r,(n,v)=>{st.hp=v});
 let tm;$('#bq',r).oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{bulk(e.target.value);setTimeout(()=>{const i=$('#bq');i.focus();i.setSelectionRange(99,99)},20)},250)};
 $('#br',r).onclick=e=>{const b=e.target.closest('[data-i]');if(!b)return;const x=res[+b.dataset.i];snap(`+${st.n} ${x.n}`);for(let i=0;i<st.n;i++)addMon(x.m,x.npc?x.n:null,st.hp==='roll');renum();save();toast(`+${st.n} × ${x.n}`);rCombat()};
 $('#bpc',r).onclick=()=>{snap('+ герои');players.forEach(p=>{if(!k.list.some(c=>c.pc&&(c.pid===p.id||c.base===p.name)))k.list.push({id:uid(),pid:p.id,base:p.name,name:p.name,init:0,dex:md(p.st[1]),hp:p.hp,max:p.maxhp,thp:p.thp||0,ac:p.ac,pc:true,conds:[],noinit:1})});norm();save();rCombat();initSheet()};
 $('#bcu',r).onclick=()=>{const n=prompt('Название','Страж');if(!n)return;const hp=+prompt('Хиты','11')||1,ac=+prompt('КД','13')||10;snap('+ '+n);k.list.push({id:uid(),base:n,name:n,init:R(20),dex:0,hp,max:hp,ac,pc:false,conds:[]});norm();sortC2();save();rCombat()}})}
function addMon(m,nm,roll){const k=C();let hp=m.hp;if(roll){const h=String(m.hd).replace(/\s/g,'').replace('−','-');hp=Math.max(1,rollD(h))}const dex=md(m.st[1]);const b=nm||m.n;const gm=k.list.find(x=>!x.pc&&x.mon===m.id&&!x.split);k.list.push({id:uid(),base:b,name:b,init:gm?gm.init:R(20)+dex,grp:m.id,dex,hp,max:hp,thp:0,ac:m.ac,pc:false,mon:m.id,conds:[],hide:1});norm();sortC2()}
function fmList(){const k=C();const m=typeof maps!=='undefined'&&maps.find(x=>x.id===mapCur);if(!m)return{m:null,a:[]};const has=id=>id&&k.list.some(c=>c.id===id);
 return{m,a:(m.tok||[]).filter(t=>!(t.k==='pc'||(KM.tokHero&&KM.tokHero(t)))&&!has(t.cid)).map(t=>{const mid=t.mid||t.mon;const mo=mid&&DATA.monsters.find(x=>x.id===mid||x.n===mid)||null;const nm=(KM.tokName?KM.tokName(t):t.nm)||t.nm||(mo&&mo.n)||t.n||'Существо';return{t,mo,nm}})}}
function fmAdd(x){const k=C();const t=x.t;const ids=new Set(k.list.map(c=>c.id));if(x.mo){addMon(x.mo,x.nm.replace(/\s+\d+$/,'')===x.mo.n?null:x.nm.replace(/\s+\d+$/,''))}else{const hp=+t.hp||+t.mx||10;k.list.push({id:uid(),base:x.nm.replace(/\s+\d+$/,''),name:x.nm,init:R(20),dex:0,hp,max:+t.mx||hp,thp:0,ac:+t.ac||10,pc:false,conds:[]});norm();sortC2()}
 const nc=k.list.find(c=>!ids.has(c.id));if(nc){t.cid=nc.id;if(t.hp!=null&&!x.mo){nc.hp=+t.hp}}}
function fromMap(){const {m,a}=fmList();const SZN={T:'крош.',S:'мал.',M:'сред.',L:'больш.',H:'огр.',G:'гиг.'};
 openSheet(`<h3>＋ С карты</h3><p class="muted">${m?'Фишки на карте «'+esc(m.name||'')+'», которых ещё нет в бою':'Нет активной карты'}</p>${a.length?`<button class="btn red" id="fmAll" style="width:100%;margin-bottom:8px">⚔ Все в бой (${a.length})</button>`+a.map((x,i)=>`<div class="row" style="gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)"><div class="grow"><b>${esc(x.nm)}</b> <span class="muted" style="font-size:12px">${SZN[KM.tokSz?KM.tokSz(x.t):x.t.sz]||'сред.'}${x.mo?' · 📖 '+esc(x.mo.n)+' · КД '+x.mo.ac+' · ХП '+x.mo.hp:' · без бестиария'}</span></div><button class="btn sm red" data-fmi="${i}">в бой</button></div>`).join(''):'<p class="muted">Все существа с карты уже в бою.</p>'}`,r=>{
  const go=xs=>{snap('+ с карты');xs.forEach(fmAdd);renum();save();typeof saveMaps==='function'&&saveMaps();toast('В бой: '+xs.length);closeSheet();rCombat()};
  const all=r.querySelector('#fmAll');if(all)all.onclick=()=>go(a);r.querySelectorAll('[data-fmi]').forEach(b=>b.onclick=()=>{go([a[+b.dataset.fmi]]);setTimeout(()=>{if(fmList().a.length)fromMap()},350)})})}
KM.combatFromMap=fromMap;
function renum(){const k=C();const g={};k.list.forEach(c=>{if(!c.pc)(g[c.base]=g[c.base]||[]).push(c)});Object.values(g).forEach(a=>{if(a.length>1)a.forEach((c,i)=>c.name=c.base+' '+(i+1));else a[0].name=a[0].base})}
function sortC2(){const k=C();const cur=k.list[k.turn];k.gi=k.gi||{};const G={};k.list.forEach(c=>{if(!c.pc&&c.grp&&!c.split)(G[c.grp]=G[c.grp]||[]).push(c)});Object.entries(G).forEach(([g,a])=>{const old=k.gi[g];const ch=a.find(c=>old!=null&&c.init!==old);const v=ch?ch.init:old!=null?old:a[0].init;k.gi[g]=v;a.forEach(c=>c.init=v)});k.list.sort((a,b)=>b.init-a.init||b.dex-a.dex||(b.pc?1:0)-(a.pc?1:0));k.turn=Math.max(0,k.list.indexOf(cur))}
/* ---- initiative entry ---- */
function initSheet(){const k=C();openSheet(`<div class="sb-title">Инициатива</div><div class="sb-sub">Впиши, что выпало на к20 — модификатор ЛОВ добавлю сам</div>
 <div class="list">${k.list.map((c,i)=>`<div class="card ini-r"><div class="grow"><div class="t">${esc(c.name)}</div><div class="m">ЛОВ ${fm(c.dex||0)} · сейчас ${c.init}</div></div><input class="inp" data-i="${i}" type="number" inputmode="numeric" placeholder="к20" style="width:74px;font-size:20px;text-align:center"></div>`).join('')}</div>
 <div class="row" style="margin-top:10px"><button class="btn" id="irm">🎲 Монстрам</button><button class="btn" id="ira">🎲 Всем</button><button class="btn red grow" id="iok">Готово</button></div>`,r=>{
 const ins=$$('[data-i]',r);ins.forEach((x,j)=>x.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();(ins[j+1]||$('#iok',r)).focus()}});setTimeout(()=>{const f=ins.find((x,j)=>k.list[j].pc);f&&f.focus()},150);
 const rl=f=>ins.forEach((x,j)=>{if(f(k.list[j])&&!x.value)x.value=R(20)});$('#irm',r).onclick=()=>rl(c=>!c.pc);$('#ira',r).onclick=()=>rl(()=>1);
 $('#iok',r).onclick=()=>{snap('инициатива');ins.forEach((x,j)=>{if(x.value!==''){const c=k.list[j];c.init=+x.value+(c.dex||0);c.noinit=0}});k.turn=0;sortC2();k.turn=0;k.t0=k.t0||Date.now();k.tt=Date.now();const ties=k.list.filter((c,i)=>i&&c.init===k.list[i-1].init).length;save();closeSheet();rCombat();toast(ties?'Ничьи решены по ЛОВ':'Порядок готов — ход '+(k.list[0]||{}).name)}})}
/* ---- combatant sheet ---- */
const CONDL=['Ослеплён','Очарован','Оглохший','Испуган','Схвачен','Недееспособен','Невидим','Парализован','Окаменел','Отравлен','Сбит с ног','Опутан','Ошеломлён','Без сознания','Концентрация','Ускорен','Благословлён','Подготовлено'];
function cSheet(c,tab){const k=C();const m=monOf(c);openSheet(`<div class="sb-title">${esc(c.name)}</div><div class="sb-sub">КД ${c.ac??"—"} · иниц. ${c.init}${m?` · ${esc(m.n)}, ПО ${crTxt(m.cr)}`:''}</div>
 <div class="cs-hp"><button class="btn red big" data-q="-5">−5</button><button class="btn red big" data-q="-1">−1</button><div class="cs-v"><b>${c.hp}</b><small>/ ${c.max}${c.thp?` +${c.thp} вр.`:''}</small></div><button class="btn big" data-q="1">+1</button><button class="btn big" data-q="5">+5</button></div>
 <div class="row"><input class="inp grow" id="cv" type="number" inputmode="numeric" placeholder="число" style="font-size:20px;text-align:center"><button class="btn red" id="cd">Урон</button><button class="btn" id="ch">Лечить</button><button class="btn" id="ct">Врем.</button></div>
 <div class="row" style="margin-top:6px"><button class="btn sm" id="cmx">Макс. хиты…</button><button class="btn sm" id="cac">КД…</button><button class="btn sm" id="cin">Иниц.…</button>${!c.pc?'<button class="btn sm" id="csp">✧ Заклинания</button>':''}${!c.pc&&c.grp?`<button class="btn sm" data-split="${c.id}">${c.split?'🔗 В общую группу':'✂ Своя инициатива'}</button>`:''}<button class="btn sm" id="chd">${c.hide?'👁 Показать хиты игрокам':'🙈 Скрыть хиты'}</button></div>
 <label class="f">Состояния (тап — добавить, раунды — длительность)</label><div class="row" id="cdur">${[0,1,2,3,10].map(n=>`<button class="chip${(cSheet.dur||0)===n?' on':''}" data-dur="${n}">${n?n+' р.':'∞'}</button>`).join('')}${chips('ce',[['start','в начале хода'],['end','в конце хода']],cSheet.end||'end')}</div>
 <div class="chips" id="ccl">${CONDL.map(n=>{const x=c.conds.find(y=>y.n===n);return `<button class="chip${x?' on':''}" data-cn="${n}">${n}${x&&x.r?' · '+x.r:''}</button>`}).join('')}</div>
 <label class="f">Заметка</label><textarea class="inp" id="cnt" rows="2" placeholder="Знает про ловушку, ранен в ногу…">${esc(c.note)}</textarea>
 <div class="row" style="margin-top:10px"><button class="btn" id="cdl">${c.delay?'▶ Вступить сейчас':'⏸ Отложить ход'}</button><button class="btn" id="crd">Подготовить</button>${m?'<button class="btn" id="csb">Статблок</button>':''}<button class="btn dark" id="crm">✕ Убрать</button></div>`,r=>{
 const re=()=>{save();cSheet(c);rCombat()};
 $$('[data-q]',r).forEach(b=>b.onclick=()=>{snap();const q=+b.dataset.q;q<0?damage(c,-q,'',1):heal(c,q);re()});
 const V=()=>+$('#cv',r).value||0;$('#cd',r).onclick=()=>{snap();const o=damage(c,V(),'',1);o.out.length&&toast(o.out.join(', '));re()};$('#ch',r).onclick=()=>{snap();heal(c,V());re()};$('#ct',r).onclick=()=>{snap();c.thp=Math.max(c.thp,V());syncP(c);re()};
 $('#cmx',r).onclick=()=>{const v=+prompt('Максимум хитов',c.max);if(v){snap(c.name+': макс. хиты '+v);c.max=v;c.hp=Math.min(c.hp,v);syncP(c);re()}};
 $('#cac',r).onclick=()=>{const v=+prompt('КД',c.ac);if(v){snap();c.ac=v;re()}};{const b=$('#csp',r);if(b&&KM.csp)b.onclick=()=>KM.csp.edit(KM.csp.keyOfComb(c),c.name,()=>cSheet(c,tab))}$('#cin',r).onclick=()=>{const v=prompt('Инициатива',c.init);if(v!=null&&v!==''){snap();c.init=+v;sortC2();re()}};
 $('#chd',r).onclick=()=>{c.hide=!c.hide;re()};
 $('#cdur',r).onclick=e=>{const b=e.target.closest('[data-dur]');if(b){cSheet.dur=+b.dataset.dur;cSheet(c)}};bindChips(r,(n,v)=>{if(n==='ce')cSheet.end=v});
 $('#ccl',r).onclick=e=>{const b=e.target.closest('[data-cn]');if(!b)return;const n=b.dataset.cn;snap();const x=c.conds.find(y=>y.n===n);if(x)c.conds=c.conds.filter(y=>y!==x);else{c.conds.push({n,r:cSheet.dur||0,end:cSheet.end||'end'});logC(`${c.name}: ${n}${cSheet.dur?' на '+cSheet.dur+' р.':''}`)}const p=pOf(c);if(p)p.conds=c.conds.map(y=>y.n);re()};
 $('#cnt',r).oninput=e=>{c.note=e.target.value;save()};
 $('#cdl',r).onclick=()=>{snap();if(c.delay){c.delay=0;const i=k.list.indexOf(c);k.list.splice(i,1);const cur=k.list[k.turn]||k.list[0];const j=k.list.indexOf(cur);k.list.splice(j,0,c);c.init=(cur?cur.init:c.init);k.turn=j;logC(c.name+' вступает')}else{c.delay=1;logC(c.name+' откладывает ход');if(k.list[k.turn]===c){closeSheet();return next()}}re()};
 $('#crd',r).onclick=()=>{snap();addCond(c,'Подготовлено',0);logC(c.name+' готовит действие');re()};
 const sb=$('#csb',r);if(sb)sb.onclick=()=>showMon(c.mon);
 $('#crm',r).onclick=()=>{snap('убран '+c.name);const i=k.list.indexOf(c);k.list.splice(i,1);if(k.turn>=k.list.length)k.turn=0;else if(i<k.turn)k.turn--;save();closeSheet();rCombat();KM.undoToast(c.name+' убран',undo)}})}
/* ---- end combat ---- */
function endCombat(){const k=C();const dead=k.list.filter(c=>!c.pc);const XPT={'0':10,'1/8':25,'1/4':50,'1/2':100,1:200,2:450,3:700,4:1100,5:1800,6:2300,7:2900,8:3900,9:5000,10:5900,11:7200,12:8400,13:10000,14:11500,15:13000,16:15000,17:18000,18:20000,19:22000,20:25000,21:33000,22:41000,23:50000,24:62000,25:75000,26:90000,27:105000,28:120000,29:135000,30:155000};const xpOf=c=>{const m=monOf(c)||DATA.monsters.find(x=>x.n===c.name||x.name===c.name);return +(m&&m.xp)||XPT[String(m&&m.cr!=null?m.cr:c.cr).trim()]||+c.xp||0};const xp=dead.reduce((s,c)=>s+xpOf(c),0);const PART=players.filter(p=>k.list.some(c=>c.pc&&(c.pid===p.id||c.hid===p.id||c.name===p.name)));const sel=new Set((PART.length?PART:players).map(p=>p.id));const each0=()=>Math.floor(xp/Math.max(1,sel.size));
 openSheet(`<div class="sb-title">Завершить бой</div><div class="sb-sub">${k.round} раунд(ов) · ${fmtT(Date.now()-(k.t0||Date.now()))}</div>
 <div class="hs-box" style="margin-top:10px"><small>Опыт за монстров</small><b>${xp}</b><div class="muted" id="xpe">По ${each0()} каждому из ${sel.size}</div></div><div class="muted" style="margin-top:8px">Участники боя (снимите галочку, чтобы не давать опыт):</div>${players.map(p=>`<label class="row"><input type="checkbox" data-xh="${p.id}" ${sel.has(p.id)?'checked':''}> ${esc(p.name)}</label>`).join('')}
 <label class="row" style="margin-top:8px"><input type="checkbox" id="exx" checked> Начислить опыт героям</label><label class="row"><input type="checkbox" id="exl" checked> Сгенерировать добычу с тел</label>
 <button class="btn red" id="eok" style="width:100%;margin-top:12px;padding:16px">Завершить</button>`,r=>{r.querySelectorAll('[data-xh]').forEach(b=>b.onchange=()=>{b.checked?sel.add(b.dataset.xh):sel.delete(b.dataset.xh);$('#xpe',r).textContent=`По ${each0()} каждому из ${sel.size}`});$('#eok',r).onclick=()=>{const old=JSON.stringify(k);const each=each0();const got=players.filter(p=>sel.has(p.id));
 if($('#exx',r).checked&&xp)got.forEach(p=>{p.xp=(p.xp||0)+each});k.list.filter(c=>c.pc).forEach(syncP);const loot=$('#exl',r).checked;
 Object.assign(k,{list:[],turn:0,round:1,log:[],undo:[],t0:0});save();closeSheet();logC(`Бой окончен: +${each} опыта каждому`);
 KM.undoToast(`Бой окончен${xp?' · +'+each+' опыта каждому':''}`,()=>{Object.assign(k,JSON.parse(old));if(xp)got.forEach(p=>p.xp-=each);save();rCombat()});setTimeout(()=>KM.lvlPrompt&&KM.lvlPrompt(got),900);
 if(loot){const crs=dead.map(c=>{const v=String(monOf(c)?.cr||0);return v.includes('/')?eval(v):+v});const mx=Math.max(0,...crs);const L2=KM.loot2();L2.t=String(mx>=17?3:mx>=11?2:mx>=5?1:0);L2.src=dead.some(c=>c.legMax)?'lair':mx>=5||dead.length>=4?'chest':'corpse';LS.set('loot2',L2);KM.go(KM.SECTIONS.findIndex(x=>x[0]==='items'));setTimeout(()=>{const s=document.querySelector('#lseg [data-t=gen]');s&&s.click();setTimeout(()=>{const b=document.querySelector('#gen');b&&b.click()},200)},500)}else rCombat()}})}
const fmtT=ms=>{const s=Math.max(0,Math.floor(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
/* ---- render ---- */
let timer;
window.rCombat=rCombat=function(){norm();const k=C(),L=k.list,cur=L[k.turn];page.oninput=null;page.onclick=null;clearInterval(timer);
 const hpTxt=c=>c.hide&&k.pv?(c.dead?'повержен':c.hp<c.max/2?'тяжело ранен':c.hp<c.max?'ранен':'цел'):`${c.hp}/${c.max}${c.thp?' +'+c.thp:''}`;
 const bar=c=>`<div class="hpbar"><i style="width:${Math.max(0,Math.min(100,c.hp/c.max*100))}%"></i></div>`;
 const cn=c=>c.conds.map(x=>`<span class="cond">${esc(x.n)}${x.r?' '+x.r:''}</span>`).join('');
 let h=header('Бой','трекер инициативы','tri',0)+`<div class="cb-top"><div class="cb-rd"><small>РАУНД</small><b>${k.round}</b></div><div class="cb-tm"><b id="tmr" title="Тап — таймер хода (выкл/30/60/90 с)" style="cursor:pointer"><i>бой</i> ${fmtT(Date.now()-(k.t0||Date.now()))}<br><i>ход</i> ${fmtT(Date.now()-(k.tt||Date.now()))}</b></div><button class="btn sm" id="cbshow" aria-label="Показать порядок ходов игрокам" style="margin-left:auto">📣 Игрокам</button>
  <button class="btn sm" id="cbu" aria-label="Отменить">↶</button><button class="btn sm${k.pv?' red':''}" id="cpv">${k.pv?'👁 Игроки':'🙈 Мастер'}</button><button class="btn sm" id="cmn">⋯</button></div>
  <div class="row cb-add"><button class="btn red grow" id="cad">＋ Существа</button><button class="btn grow" id="cfm">＋ С карты</button><button class="btn grow" id="cin2">🎲 Инициатива</button><button class="btn" id="cenc">⚖</button></div>`;
 if(!L.length)h+=`<div class="cb-empty"><div class="esig"></div><p>Бой не начат.</p><button class="btn red" id="cst" style="padding:16px 22px">⚔ Начать: герои + монстры</button></div>`;
 else{const m=monOf(cur);const pp=pOf(cur);const pw=pp?(pp.inv||[]).map(x=>DATA.items.find(i=>i.id===x.item)).filter(i=>i&&i.dmg).map(i=>({n:i.n,d:`Атака оружием: ${fm(pb2(cur))} к попаданию. Попадание: ${avgD(i.dmg.split(' ')[0]+(md(pp.st[/фехт|дальн|лук|арбал/i.test(i.prop+i.sub)?1:0])>=0?'+':'')+md(pp.st[/фехт|дальн|лук|арбал/i.test(i.prop+i.sub)?1:0]))} (${i.dmg.split(' ')[0]}${fm(md(pp.st[/фехт|дальн|лук|арбал/i.test(i.prop+i.sub)?1:0]))}) ${i.dmg.split(' ')[1]||''} урона.`,t:'w'})):[];const acts=pw.length?pw:m?[...(m.a||[]).map(a=>({...a,t:'a'})),...(m.f||[]).filter(a=>/перезаряд|заклинан|колдовств/i.test(a.n)).map(a=>({...a,t:'f'}))]:[];
  h+=`<div class="cb-cur${cur.dead?' dead':''}" data-cid="${cur.id}" id="curc"><div class="cb-ch" data-open="${cur.id}"><div><small>ХОДИТ</small><b>${esc(cur.name)}</b></div><div class="cb-ac">КД<b>${cur.ac}</b></div></div>
  <div class="cb-hp" data-open="${cur.id}"><b>${k.pv&&cur.hide?hpTxt(cur):cur.hp}</b>${k.pv&&cur.hide?'':`<small>/${cur.max}${cur.thp?' +'+cur.thp+' вр.':''}</small>`}${bar(cur)}</div>
  ${cur.conds.length?`<div class="cb-conds">${cn(cur)}</div>`:''}
  ${cur.pc&&cur.hp===0&&!cur.dead?`<button class="btn red" id="cds" style="width:100%;margin:6px 0">☠ Спасбросок от смерти · ${cur.ds.s}✓ ${cur.ds.f}✗</button>`:''}
  <div class="cb-eco">${[['a','Действие'],['b','Бонус'],['m','Движение'],['r','Реакция']].map(([e,l])=>`<button data-eco="${e}" class="${cur.eco[e]?'used':''}">${l}</button>`).join('')}</div>
  ${cur.legMax?`<div class="cb-leg"><small>Легендарные</small>${Array.from({length:cur.legMax},(_,i)=>`<button class="pip${cur.leg>i?' on':''}" data-leg="${i}"></button>`).join('')}</div>`:''}
  ${Object.keys(cur.rech||{}).length?`<div class="cb-leg"><small>Перезарядка</small>${Object.entries(cur.rech).map(([n,v])=>`<button class="chip${v?' on':''}" data-rc="${esc(n)}">${esc(n.replace(/\s*\(.*\)/,''))} ${v?'готово':'⌛'}</button>`).join('')}</div>`:''}
  ${LS.get('novice',{on:1}).on?(()=>{const IN=['Без сознания','Ошеломлён','Ошеломлен','Парализован','Окаменение','Недееспособен'];const ic=cur.conds.find(x=>IN.includes(x.n));const st=(ok,t)=>`<li class="${ok?'ok':''}" style="${ok?'opacity:.5;text-decoration:line-through':''}">${t}</li>`;let b;
   if(cur.dead)b=`<b>${esc(cur.name)} повержен.</b> Нажмите «Следующий ход».`;
   else if(cur.pc&&cur.hp===0)b=`<b>Герой без сознания.</b> Нажмите «☠ Спасбросок от смерти», затем «Следующий ход».`;
   else if(ic)b=`<b>Состояние «${esc(ic.n)}»:</b> существо не может действовать. Нажмите «Следующий ход».`;
   else if(cur.pc)b=`<ol style="margin:4px 0 0 18px;padding:0">${st(cur.eco.m,'Спросите игрока: «Что делаешь?» Двигаться можно в любой момент хода.')}${st(cur.eco.a,'Атака: игрок бросает к20 → нажмите «⚔ Атака» или оружие ниже и введите число. Книга сравнит с КД и вычтет урон.')}${st(cur.eco.b,'Бонусное действие или заклинание — «✧ Заклинание».')}${st(0,'Готово → «Следующий ход ▶».')}</ol>`;
   else b=`<ol style="margin:4px 0 0 18px;padding:0">${st(cur.eco.m,'Подведите монстра к ближайшему герою (кнопка «Движение» — отметить).')}${st(cur.eco.a,'Нажмите атаку ниже → выберите цель → «🎲 Бросить за меня». Попадание, урон, сопротивления и концентрация считаются сами.')}${st(0,'Готово → «Следующий ход ▶». Ошиблись — «↶».')}</ol>`;
   return `<div class="cb-guide" style="margin:8px 0;padding:10px 12px;border-radius:10px;background:rgba(196,161,90,.1);border:1px solid rgba(196,161,90,.3);font-size:13.5px;line-height:1.45"><small style="opacity:.7">ПОДСКАЗКА · что делать сейчас</small><div>${b}</div></div>`})():''}
  <div class="cb-acts">${acts.map((a,i)=>{const P=parseAtk(a);return `<button class="cb-act" data-act="${i}"><b>${esc(a.n)}</b><small>${P.hit!=null?fm(P.hit)+' · ':''}${P.dm.map(d=>d.dice).join('+')}${P.save?` · спас ${P.save.ab} СЛ ${P.save.dc}`:''}</small></button>`}).join('')}
   <button class="cb-act" data-act="atk"><b>⚔ Атака</b><small>ввести бросок</small></button><button class="cb-act" data-act="aoe"><b>✦ По области</b><small>несколько целей</small></button>${cur.pc?`<button class="cb-act" data-act="spell"><b>✧ Заклинание</b><small>гримуар героя</small></button>`:''}</div>
  ${cur.note?`<div class="muted cb-note">✎ ${esc(cur.note)}</div>`:''}
  <div class="row cb-nav"><button class="btn" id="cpr">◀</button><button class="btn red grow big" id="cnx">Следующий ход ▶</button></div></div>
  <div class="cb-list">${L.map((c,i)=>i===k.turn?'':`<div class="cb-row${c.surp&&k.round===1?' surp':''}${c.dead?' dead':''}${c.pc?' pc':''}${c.delay?' delay':''}" data-cid="${c.id}"><span class="ini">${c.delay?'⏸':c.init}</span><div class="grow"><div class="t">${esc(c.name)}${i===(k.turn+1)%L.length?' <small class="nx">следующий</small>':''}${k.round===1?`<button class="rx${c.surp?' used':''}" data-surp="${c.id}" title="Застигнут врасплох: пропускает 1-й раунд, без реакции">😱${c.surp?'застигнут':''}</button>`:''}<button class="rx${c.eco&&c.eco.r?' used':''}" data-rx="${c.id}" title="Реакция (атака по возможности): ${c.eco&&c.eco.r?'потрачена':'доступна'}">↩${c.eco&&c.eco.r?'✕':''}</button></div>${bar(c)}<div class="cb-c">${cn(c)}${c.note?'<span class="cond">✎</span>':''}${c.legMax&&!c.dead?`<button class="cb-lg" data-legc="${c.id}" aria-label="Легендарное действие">Л ${'●'.repeat(c.legMax-(c.leg||0))}${'○'.repeat(c.leg||0)}</button>`:''}</div></div><div class="cb-r"><b>${hpTxt(c)}</b><small>КД ${c.ac??"—"}</small></div></div>`).join('')}</div>
  <div class="muted" style="font-size:12px;margin:6px 2px">Свайп по строке ← урон, → лечение · свайп по карточке хода ← следующий · тап — подробно</div>
  <details class="cb-log"><summary>Журнал боя (${k.log.length})</summary>${k.log.slice(0,40).map(x=>`<div>${esc(x)}</div>`).join('')}</details>
  <button class="btn dark" id="cend" style="width:100%;margin-top:8px">🏁 Завершить бой · опыт и добыча</button>`}
 page.innerHTML=h+'<div style="height:24px"></div>';
 const on=(s,f)=>{const e=$(s);if(e)e.onclick=f};
 on('#cbu',undo);on('#cpv',()=>{k.pv=!k.pv;save();rCombat()});on('#cad',()=>bulk(''));on('#cfm',fromMap);on('#cin2',initSheet);on('#cenc',()=>KM.encounter&&KM.encounter(''));on('#cst',()=>{snap();players.forEach(p=>{if(!k.list.some(c=>c.pc&&(c.pid===p.id||c.base===p.name)))k.list.push({id:uid(),pid:p.id,base:p.name,name:p.name,init:0,dex:md(p.st[1]),hp:p.hp,max:p.maxhp,thp:p.thp||0,ac:p.ac,pc:true,conds:[],noinit:1})});norm();save();rCombat();if(players.length)toast('Герои за столом: '+players.length);$('#cad').click()});
 on('#cmn',()=>openSheet(`<div class="sb-title">Бой</div><div class="list" style="margin-top:12px"><button class="btn" id="m1">🏰 Ход логова (иниц. 20)</button><button class="btn" id="m2">⟲ Сбросить таймер хода</button><button class="btn" id="m3">🏁 Завершить бой</button><button class="btn dark" id="m4">✕ Очистить без опыта</button></div>`,r=>{$('#m1',r).onclick=()=>{snap();k.list.push({id:uid(),base:'Логово',name:'Логово',init:20,dex:-99,hp:1,max:1,ac:0,pc:false,conds:[],lair:1});sortC2();save();closeSheet();rCombat()};$('#m2',r).onclick=()=>{k.tt=Date.now();closeSheet()};$('#m3',r).onclick=endCombat;$('#m4',r).onclick=()=>{const o=JSON.stringify(k);Object.assign(k,{list:[],turn:0,round:1,log:[],undo:[],t0:0});save();closeSheet();rCombat();KM.undoToast('Бой очищен',()=>{Object.assign(k,JSON.parse(o));save();rCombat()})}}));
 if(!L.length)return;
 on('#cnx',()=>next(1));on('#cpr',()=>next(-1));on('#cend',endCombat);on('#cds',()=>deathSave(cur));
 page.querySelector('.cb-eco').onclick=e=>{const b=e.target.closest('[data-eco]');if(b){cur.eco[b.dataset.eco]^=1;save();const y=page.scrollTop;rCombat();page.scrollTop=y}};
 page.querySelectorAll('[data-legc]').forEach(b=>{b.onpointerdown=e=>e.stopPropagation();b.onclick=e=>{e.stopPropagation();const c=L.find(z=>z.id===b.dataset.legc);if((c.leg||0)>=c.legMax)return toast('Легендарные действия исчерпаны до хода '+c.name);snap();c.leg=(c.leg||0)+1;logC(c.name+': легендарное действие ('+(c.legMax-c.leg)+' осталось)');save();rCombat()}});page.querySelectorAll('[data-leg]').forEach(b=>b.onclick=()=>{const i=+b.dataset.leg;cur.leg=cur.leg>i?i:i+1;save();rCombat()});
 page.querySelectorAll('[data-rc]').forEach(b=>b.onclick=()=>{cur.rech[b.dataset.rc]^=1;save();rCombat()});
 page.querySelector('.cb-acts').onclick=e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;if(a==='atk')return attack(cur,null);if(a==='aoe')return multi(cur,null);if(a==='spell'){const p=pOf(cur);KM.go(KM.SECTIONS.findIndex(x=>x[0]==='spells'));return}
  const m=monOf(cur);const pp=pOf(cur);let acts;if(pp){acts=(pp.inv||[]).map(x=>DATA.items.find(i=>i.id===x.item)).filter(i=>i&&i.dmg).map(i=>{const s=md(pp.st[/фехт|дальн|лук|арбал/i.test(i.prop+i.sub)?1:0]);return {n:i.n,d:`Атака оружием: ${fm(pb2(cur))} к попаданию. Попадание: ${avgD(i.dmg.split(' ')[0])+s} (${i.dmg.split(' ')[0]}${fm(s)}) ${i.dmg.split(' ')[1]||''} урона.`}})}else acts=[...(m.a||[]),...(m.f||[]).filter(x=>/перезаряд|заклинан|колдовств/i.test(x.n))];const act=acts[+a];const P=parseAtk(act);if(act.n in (cur.rech||{})&&!cur.rech[act.n])toast('Ещё не перезарядилось');if(P.hit!=null)attack(cur,act);else if(P.save||P.dm.length)multi(cur,act);else openSheet(`<div class="sb-title">${esc(act.n)}</div><div class="sb-body" style="margin-top:10px">${esc(act.d)}</div>`)};
 page.querySelectorAll('#curc [data-open]').forEach(e=>e.onclick=()=>cSheet(cur));
 // swipes & taps on rows
 page.querySelectorAll('.cb-row').forEach(row=>{let x0,y0,dx=0,mv=0;row.addEventListener('pointerdown',e=>{x0=e.clientX;y0=e.clientY;dx=0;mv=0});row.addEventListener('pointermove',e=>{if(x0==null)return;dx=e.clientX-x0;if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(e.clientY-y0)){mv=1;row.style.transform=`translateX(${dx}px)`;row.classList.toggle('sw-l',dx<-60);row.classList.toggle('sw-r',dx>60)}});
  const end=()=>{const c=L.find(z=>z.id===row.dataset.cid);row.style.transform='';row.classList.remove('sw-l','sw-r');if(x0==null)return;x0=null;if(mv&&dx<-60)quick(c,-1);else if(mv&&dx>60)quick(c,1);else if(!mv)cSheet(c)};row.addEventListener('pointerup',end);row.addEventListener('pointercancel',()=>{x0=null;row.style.transform=''})});
 const cc=$('#curc');let sx;cc.addEventListener('pointerdown',e=>{if(e.target.closest('button,[data-open]'))return sx=null;sx=e.clientX});cc.addEventListener('pointerup',e=>{if(sx!=null&&e.clientX-sx<-80)next(1);else if(sx!=null&&e.clientX-sx>80)next(-1);sx=null});
 timer=setInterval(()=>{const t=$('#tmr');if(!t)return clearInterval(timer);t.innerHTML='<i>бой</i> '+fmtT(Date.now()-(k.t0||Date.now()))+'<br><i>ход</i> '+fmtT(Date.now()-(k.tt||Date.now()))+(k.tl?(()=>{const l=Math.ceil(k.tl-(Date.now()-(k.tt||Date.now()))/1000);if(l<=0&&k.ta!==k.tt){k.ta=k.tt;toast('⏰ Время хода вышло (мягкое напоминание)');navigator.vibrate&&navigator.vibrate(150)}return '<br><i>лимит</i> '+(l>0?l+' с':'<b style="color:#ffb36a">0</b>')})():'')},1000)};
function quick(c,s){openSheet(`<div class="sb-title">${esc(c.name)}: ${s<0?'урон':'лечение'}</div><div class="sb-sub">${c.hp}/${c.max} · КД ${c.ac??"—"}</div><input class="inp" id="qv" type="number" inputmode="numeric" style="font-size:30px;text-align:center;margin-top:10px" placeholder="0">${s<0?`<div class="chips" id="qdt" style="margin-top:6px">${DT.map(([k2,l])=>`<button class="chip" data-dt="${k2}">${l}</button>`).join('')}</div>`:''}<button class="btn ${s<0?'red':''}" id="qok" style="width:100%;margin-top:10px;padding:16px">${s<0?'Нанести':'Вылечить'}</button>`,r=>{let dt='';setTimeout(()=>$('#qv',r).focus(),60);const q=$('#qdt',r);if(q)q.onclick=e=>{const b=e.target.closest('[data-dt]');if(b){dt=b.dataset.dt;$$('#qdt .chip',r).forEach(x=>x.classList.toggle('on',x===b))}};
 $('#qok',r).onclick=()=>{const v=+$('#qv',r).value||0;snap();if(s<0){const o=damage(c,v,dt);toast(`${c.name}: −${o.v}${o.out.length?' · '+o.out.join(', '):''}`)}else heal(c,v);save();closeSheet();rCombat();flash(c.id)}})}
KM.combat={sort:()=>sortC2(),damage,attack,multi,bulk,initSheet,next,undo,endCombat,parseAtk,cSheet,addMon:(m,n)=>{addMon(m,n);renum();save();rCombat()}};
}

document.addEventListener('click',e=>{if(!e.target.closest||!e.target.closest('#cbshow'))return;const t=window.KM&&KM.table;if(!t||!t.conns||!Object.keys(t.conns).length){toast('Стол не открыт: откройте ◎ Онлайн, чтобы игроки видели порядок ходов');return}t.push(true);toast('Порядок ходов и текущий ход показаны игрокам (вкладка «Мастер»)')});

document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-rx]');if(!t)return;e.stopPropagation();e.preventDefault();const q=C().list.find(x=>x.id===t.dataset.rx);if(q){q.eco=q.eco||{a:0,b:0,r:0,m:0};q.eco.r^=1;save();rCombat();toast(q.name+(q.eco.r?': реакция потрачена до начала своего хода':': реакция снова доступна'))}},true);

document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-surp]');if(!b)return;e.stopPropagation();e.preventDefault();const k=combat;const c=k.list.find(x=>String(x.id)===b.dataset.surp);if(!c)return;c.surp=c.surp?0:1;c.eco=c.eco||{a:0,b:0,r:0,m:0};c.eco.r=c.surp?1:0;if(c.surp&&k.list[k.turn]===c)KM.combat.next();save();rCombat();toast(c.name+(c.surp?': застигнут — пропускает 1-й раунд, без реакции':': не застигнут'))},true);

document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-split]');if(!b)return;e.stopPropagation();const k=combat;const c=k.list.find(x=>String(x.id)===b.dataset.split);if(!c)return;if(c.split){c.split=0;const o=k.list.find(x=>x!==c&&!x.pc&&x.grp===c.grp&&!x.split);if(o)c.init=o.init}else{c.split=1;c.init=1+Math.floor(Math.random()*20)+(c.dex||0)}KM.combat.sort&&KM.combat.sort();save();rCombat();closeSheet();toast(c.name+(c.split?': своя инициатива '+c.init:': снова в группе'))},true);

document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#tmr');if(!t)return;e.stopPropagation();const k=combat;openSheet(`<div class="sb-title">⏱ Таймер хода</div><div class="sb-sub">По умолчанию выключен. Виден активному игроку в Книге Игрока; на нуле — мягкое напоминание, ход не пропускается.</div><div class="row" style="margin-top:10px">${[0,30,60,90,120].map(v=>`<button class="chip${(k.tl||0)===v?' on':''}" data-tl="${v}">${v?v+' с':'выкл'}</button>`).join('')}</div>`,r=>{r.onclick=ev=>{const b=ev.target.closest('[data-tl]');if(!b)return;k.tl=+b.dataset.tl;k.tt=Date.now();save();closeSheet();toast(k.tl?'Таймер хода: '+k.tl+' с':'Таймер хода выключен')}})},true);

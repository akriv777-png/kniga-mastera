/* короткая карточка фишки + переходы между связанными картами */
(function(){
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const monOf=(t,c)=>{const id=(c&&c.mon)||t.mid;return id&&D.monsters.find(m=>m.id===id)};
const cOf=t=>t.cid&&combat.list.find(z=>z.id===t.cid);
const pOf=t=>t.pid?players.find(p=>p.id===t.pid):(t.k==='pc'?players.find(p=>p.name&&t.n&&p.name.startsWith(t.n)):null);
const sv=()=>{LS.set('combat',combat);LS.set('players',players);KM.mapSave&&KM.mapSave();KM.mapDraw&&KM.mapDraw();try{KM.table.push(true)}catch(e){}};
const atks=m=>(m&&m.a||[]).slice(0,4).map(a=>{const d=String(a.d||'');const h=d.match(/([+−-]\d+) к попаданию/),g=d.match(/Попадание:\s*([^.]*?)(урона|\.)/);return`<div class="tkA"><b>${E(a.n)}</b>${h?` <span class="tkB">${E(h[1])}</span>`:''}${g?` · ${E(g[1].trim())}`:(!h?` · <span class="muted">${E(d.slice(0,70))}${d.length>70?'…':''}</span>`:'')}</div>`}).join('');
function bar(hp,mx){const p=mx?Math.max(0,Math.min(100,hp/mx*100)):0;return`<div class="tkHp"><i style="width:${p}%;background:${p>50?'#5a9a4a':p>25?'#c9a13a':'#b33'}"></i><span>${hp} / ${mx}</span></div>`}
function card(t){
 const m=KM.mapCur&&KM.mapCur();if(!m)return;const c=cOf(t),p=t.k==='pc'||(c&&c.pc)?pOf(t)||(c&&players.find(z=>z.name===c.name)):null,mo=p?null:monOf(t,c);
 let nm,hp,mx,ac,sp,ini,cds,extra='';
 if(p){nm=p.name;hp=p.hp;mx=p.maxhp;ac=p.ac;sp=p.spd||'9 м';ini=c?c.init:(p.init>=0?'+':'')+(p.init||0);cds=(c?c.conds.map(x=>x.n):p.conds||[]);extra=`<div class="muted">${E(p.cls||'')} ${p.lvl?p.lvl+' ур.':''}</div>`}
 else{nm=(c&&c.name)||t.nm||(mo&&mo.n)||t.n||'Фишка';hp=c?c.hp:(t.hp!=null?t.hp:mo?mo.hp:0);mx=c?c.max:(t.mhp||(mo&&mo.hp)||hp);ac=c?c.ac:(t.ac||(mo&&mo.ac)||'—');sp=mo?mo.sp:'—';ini=c?c.init:'—';cds=c?c.conds.map(x=>x.n):(t.cd||[]);
  if(mo){const r=[['Спасброски',mo.sv],['Уязвимость',mo.vul],['Сопротивление',mo.res],['Иммунитет',mo.imm],['Имм. к сост.',mo.ci]].filter(x=>x[1]);extra=`<div class="muted">${E(mo.sz||'')} ${E(mo.ty||'')}${mo.cr!=null?' · ПО '+E(mo.cr):''}</div>${atks(mo)}${r.map(x=>`<div class="tkR"><b>${x[0]}:</b> ${E(x[1])}</div>`).join('')}`}}
 openSheet(`<div class="tkC"><h2 style="margin:0 0 4px">${E(nm)}</h2>${extra}${bar(hp,mx)}
 <div class="row tkS"><span>🛡 КД <b>${E(ac)}</b></span><span>👣 <b>${E(sp)}</b></span><span>⚡ Иниц. <b>${E(ini)}</b></span></div>
 <div class="tkCd">${cds.length?cds.map(x=>`<span class="chip on">${E(x)}</span>`).join(' '):'<span class="muted">Состояний нет</span>'}</div>
 <div class="row" style="gap:6px;margin:8px 0"><input id="tkN" type="number" inputmode="numeric" placeholder="число" style="width:80px"><button class="btn sm" id="tkD">− Урон</button><button class="btn sm" id="tkH">+ Лечение</button></div>
 <div class="row" style="flex-wrap:wrap;gap:6px"><button class="btn sm" id="tkCo">Состояния</button>${p||mo?'<button class="btn sm" id="tkF">Полная карточка</button>':''}${c?'':'<button class="btn sm" id="tkT">В трекер</button>'}</div></div>`);
 const n=()=>Math.abs(parseInt(document.getElementById('tkN').value)||0);
 const hpch=d=>{if(!d)return;if(c){if(d<0)KM.combat.damage?KM.combat.damage(c,-d):(c.hp=Math.max(0,c.hp+d));else c.hp=Math.min(c.max,c.hp+d);if(p)p.hp=c.hp}else if(p){p.hp=Math.max(0,Math.min(p.maxhp,p.hp+d))}else{t.hp=Math.max(0,Math.min(mx,hp+d));t.mhp=mx}sv();card(t)};
 document.getElementById('tkD').onclick=()=>hpch(-n());document.getElementById('tkH').onclick=()=>hpch(n());
 document.getElementById('tkCo').onclick=()=>{const cur=c?c.conds.map(x=>x.n):p?(p.conds=p.conds||[]):(t.cd=t.cd||[]);
  openSheet(`<h2>Состояния: ${E(nm)}</h2><div class="row" style="flex-wrap:wrap;gap:6px">${CONDS.map(x=>`<button class="chip${cur.includes(x)?' on':''}" data-cd="${E(x)}">${E(x)}</button>`).join('')}</div><button class="btn" id="tkBk" style="margin-top:10px">Готово</button>`);
  document.querySelectorAll('[data-cd]').forEach(b=>b.onclick=()=>{const x=b.dataset.cd;if(c){const i=c.conds.findIndex(z=>z.n===x);i>=0?c.conds.splice(i,1):c.conds.push({n:x,r:0,end:'end'})}else{const a=p?p.conds:t.cd,i=a.indexOf(x);i>=0?a.splice(i,1):a.push(x)}b.classList.toggle('on');sv()});
  document.getElementById('tkBk').onclick=()=>card(t)};
 const f=document.getElementById('tkF');if(f)f.onclick=()=>{if(p){closeSheet();KM.heroSheet(p)}else{window.KM_sheetRet=()=>card(t);showMon(mo.id);window.KM_sheetRet=()=>card(t)}};
 const tr=document.getElementById('tkT');if(tr)tr.onclick=()=>{const b=combat.list.length;if(p)addCombatant(p,true);else if(mo){addCombatant(Object.assign({},mo,{n:t.nm||mo.n}));}else addCombatant({n:nm,hp:hp,maxhp:mx,ac:+ac||10,init:0});const nc=combat.list.find(z=>!combat.list.slice(0,0).includes(z)&&!m.tok.some(q=>q.cid===z.id)&&(z.base===(p?p.name:t.nm||(mo&&mo.n)||nm)));if(nc){t.cid=nc.id;if(!p){nc.hp=hp;nc.max=mx}}sv();toast('Добавлено в трекер');card(t)};
}
KM.tokCard=card;
/* переходы */
const BL=new Set(['wall','pit','water','lava','tree','cloud','air','rock','']);
function okC(m,x,y,ex){if(x<0||y<0||x>=m.W||y>=m.H)return false;const g=m.g[y*m.W+x];if(BL.has(g)||g==null)return false;if(window.KM_SOLID&&KM_SOLID(m,x,y))return false;if((m.links||[]).some(l=>l.x===x&&l.y===y))return false;return!(m.tok||[]).some(t=>t.x===x&&t.y===y)&&!ex.has(x+','+y)}
function near(m,x,y,ex){const seen=new Set([x+','+y]),q=[[x,y]];while(q.length){const [a,b]=q.shift();if(okC(m,a,b,ex))return[a,b];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const k=(a+dx)+','+(b+dy);if(!seen.has(k)&&a+dx>=0&&b+dy>=0&&a+dx<m.W&&b+dy<m.H){seen.add(k);q.push([a+dx,b+dy])}}if(seen.size>m.W*m.H)break}return null}
function go(src,l,movers,anchor){const dst=maps.find(x=>x.id===l.to);if(!dst)return;dst.tok=dst.tok||[];
 const snap={a:JSON.stringify(src.tok),b:JSON.stringify(dst.tok),f:dst.fog?dst.fog.slice():null,sh:dst.shared,cur:mapCur,src:src.id,dst:dst.id};
 const back=(dst.links||[]).find(z=>z.to===src.id);const ax=back?back.x:dst.start?dst.start.x:dst.W>>1,ay=back?back.y:dst.start?dst.start.y:dst.H>>1;
 const ex=new Set();movers.sort((p,q)=>Math.hypot(p.x-anchor.x,p.y-anchor.y)-Math.hypot(q.x-anchor.x,q.y-anchor.y));
 movers.forEach(t=>{let x=ax+(t.x-anchor.x),y=ay+(t.y-anchor.y);let c=okC(dst,x,y,ex)&&Math.max(Math.abs(x-ax),Math.abs(y-ay))<=4?[x,y]:near(dst,ax,ay,ex);if(!c)c=[ax,ay];ex.add(c[0]+','+c[1]);t.x=c[0];t.y=c[1]});
 src.tok=src.tok.filter(t=>!movers.includes(t));movers.forEach(t=>dst.tok.push(t));
 if(dst.fog)movers.forEach(t=>{for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const x=t.x+dx,y=t.y+dy;if(x>=0&&y>=0&&x<dst.W&&y<dst.H)dst.fog[y*dst.W+x]=0}});
 if(src.shared)dst.shared=true;mapCur=dst.id;view={s:1,x:0,y:0};saveMaps();rMap();
 const mv=movers[0];if(mv&&KM.mapPan)setTimeout(()=>KM.mapPan(mv.x,mv.y),30);
 try{KM.table.push(true)}catch(e){}
 const msg='Переход: '+dst.name+(movers.length?' · фишек: '+movers.length:'');
 if(KM.undoToast)KM.undoToast(msg,()=>{const s=maps.find(x=>x.id===snap.src),d=maps.find(x=>x.id===snap.dst);if(s)s.tok=JSON.parse(snap.a);if(d){d.tok=JSON.parse(snap.b);if(snap.f)d.fog=snap.f;d.shared=snap.sh}mapCur=snap.cur;view={s:1,x:0,y:0};saveMaps();rMap();try{KM.table.push(true)}catch(e){}});else toast(msg)}
function ask(src,l,tok,org){if(tok&&org){const o=org;const _t=tok;tok.__o=o}const pcs=(src.tok||[]).filter(t=>t.k==='pc');const dst=maps.find(x=>x.id===l.to);if(!dst)return;
 if(!pcs.length&&!tok)return go(src,l,[],{x:l.x,y:l.y});
 openSheet(`<h2>${E(l.n||'Переход')}</h2><p class="muted">→ ${E(dst.name)}</p><div class="row" style="flex-wrap:wrap;gap:8px">${pcs.length?`<button class="btn" id="trG">Вся группа (${pcs.length})</button>`:''}${tok?'<button class="btn" id="trO">Только эта фишка</button>':'<button class="btn" id="trN">Без фишек</button>'}<button class="btn sm" id="trX">Отмена</button></div>`);
 const rs=()=>{if(tok&&tok.__o){tok.x=tok.__o.x;tok.y=tok.__o.y}if(tok)delete tok.__o};const a=tok&&tok.__o?{x:tok.__o.x,y:tok.__o.y}:tok||{x:l.x,y:l.y},$i=id=>document.getElementById(id);
 if($i('trG'))$i('trG').onclick=()=>{closeSheet();rs();go(src,l,pcs.concat(tok&&!pcs.includes(tok)?[tok]:[]),a)};
 if($i('trO'))$i('trO').onclick=()=>{closeSheet();rs();go(src,l,[tok],a)};
 if($i('trN'))$i('trN').onclick=()=>{closeSheet();rs();go(src,l,[],a)};
 $i('trX').onclick=()=>{if(tok)delete tok.__o;closeSheet()}}
KM.mapTrans=ask;
/* фишка брошена на переход */
let pre=null;
document.addEventListener('pointerdown',e=>{if(!e.target.closest||!e.target.closest('#mc'))return;const m=KM.mapCur&&KM.mapCur();pre=m&&(m.links||[]).length?{m,pos:new Map((m.tok||[]).map(t=>[t,t.x+','+t.y]))}:null},true);
document.addEventListener('pointerup',()=>{if(!pre)return;const P=pre;pre=null;setTimeout(()=>{const m=KM.mapCur&&KM.mapCur();if(m!==P.m)return;for(const [t,k] of P.pos){if(t.x+','+t.y===k||!m.tok.includes(t))continue;const l=m.links.find(z=>z.x===t.x&&z.y===t.y&&maps.some(q=>q.id===z.to));if(l&&(t.k==='pc'||t.pid)){const [ox,oy]=k.split(',').map(Number);ask(m,l,t,{x:ox,y:oy});return}}},60)});
})();

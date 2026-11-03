'use strict';/*bundle*/
/* app.js */
'use strict';
window.KM_dedupe=(L,ret)=>{const D=window.DATA;L=L||(D&&D.items);if(!L)return;const key=n=>String(n||'').toLowerCase().replace(/ё/g,'е').replace(/[^а-яa-z0-9]/g,'');const m=new Map();const out=[];for(const i of L){const k=key(i.n);if(!k){out.push(i);continue}const j=m.get(k);if(j==null){m.set(k,out.length);out.push(i)}else if(out[j].art&&!i.art){out[j]=i}}if(ret)return out;L.length=0;out.forEach(x=>L.push(x))};

;(()=>{const KEEP=new Set(['Я','Пана','Бога','Пан']);const sc=n=>{const w=n.split(/(\s+)/);let first=true,inQ=false;return w.map(z=>{if(/^\s+$/.test(z))return z;let o=z;const q=z.startsWith('«');if(first){first=false}else if(q){}else if(!KEEP.has(z.replace(/[^А-ЯЁа-яё]/g,'')))o=z.toLowerCase();if(q)inQ=true;return o}).join('').replace(/-([А-ЯЁ])/g,(m,c)=>'-'+c.toLowerCase())};const run=()=>{try{['spells','items','monsters','artifacts'].forEach(k=>(window.DATA&&DATA[k]||[]).forEach(x=>{const w=(x.n||'').split(/\s+/);const FW=/^(на|и|в|во|из|с|со|о|об|у|к|от|для|без|под|над|за|по|до|из-под)$/;const ws=w.filter(z=>!FW.test(z)&&!/^\(/.test(z)&&!/\)$/.test(z));if(ws.length>=2&&ws.every(z=>/^[«]?[А-ЯЁ]/.test(z)))x.n=sc(x.n)}));const lc=t=>t.replace(/(^|[.!?:]\s+|\s)([А-ЯЁ][а-яё]+)((?:\s(?:на\s|в\s)?[А-ЯЁ][а-яё]+)+)/g,(m,a,f,rest)=>a+f+rest.replace(/[А-ЯЁ][а-яё]+/g,z=>KEEP.has(z)?z:z.toLowerCase()));const T=window.TABLES_EXTRA;const rec=o=>{if(!o||typeof o!=='object')return;for(const k in o){const v=o[k];if(typeof v==='string')o[k]=lc(v);else rec(v)}};if(T&&!T.__tc){rec(T);T.__tc=1}}catch(e){}};run();addEventListener('load',run);setTimeout(run,1500);window.KM_tc=run})();
const D=window.DATA;(()=>{const KEEP=/^(Лихо Одноглазое|Флейта Пана|Баба Яга|Кощей Бессмертный|Змей Горыныч)$/;const fix=a=>(a||[]).forEach(x=>{const n=x&&x.n;if(!n||KEEP.test(n))return;const w=n.split(' ');if(w.length<2||!w.every(t=>/^[А-ЯЁ][а-яё-]+$/.test(t)))return;x.n=w[0]+' '+w.slice(1).map(t=>t.toLowerCase()).join(' ')});window.KM_CASEFIX=()=>{fix(D.spells);fix(D.monsters);fix(D.items)};KM_CASEFIX();document.addEventListener("DOMContentLoaded",()=>setTimeout(KM_CASEFIX,0))})();
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={get(k,d){try{const v=localStorage.getItem((window.KM_PLAYER?'kpm.':'km.')+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){localStorage.setItem((window.KM_PLAYER?'kpm.':'km.')+k,JSON.stringify(v))}};
const mod=s=>Math.floor((s-10)/2), fmod=m=>(m>=0?'+':'')+m;
const crTxt=c=>c===0.125?'1/8':c===0.25?'1/4':c===0.5?'1/2':String(c);
const uid=()=>Math.random().toString(36).slice(2,9);
const rnd=n=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n+1};
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),Math.max(1800,String(t).length*45))}

/* ---------- procedural arcane glyph strip ---------- */
function glyphStrip(seed=7,red=.18){let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;let p='';const W=640;
  for(let x=6;x<W-10;x+=14+r()*6){const c=r()<red?'#d42a22':'#5a504b';let d=`M${x.toFixed(1)} ${(3+r()*4).toFixed(1)}`;const n=2+Math.floor(r()*3);
    for(let i=0;i<n;i++){const t=r();d+=t<.35?` l${(r()*8-3).toFixed(1)} ${(r()*9).toFixed(1)}`:t<.7?` m${(r()*6-2).toFixed(1)} ${(r()*4).toFixed(1)} l${(r()*6-3).toFixed(1)} ${(r()*-7).toFixed(1)}`:` q${(r()*8).toFixed(1)} ${(r()*10-5).toFixed(1)} ${(r()*6).toFixed(1)} ${(r()*8).toFixed(1)}`}
    p+=`<path d="${d}" stroke="${c}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;if(r()<.25)p+=`<circle cx="${(x+4).toFixed(1)}" cy="${(2+r()*12).toFixed(1)}" r="1.2" fill="${c}"/>`}
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='18' viewBox='0 0 ${W} 18'>${p.replace(/"/g,"'")}</svg>`)}")`}
const GL=[glyphStrip(3),glyphStrip(11),glyphStrip(29),glyphStrip(47)];
const glyphs=i=>`<div class="glyphs" style="background-image:${GL[i%4]}"></div>`;
/* sigils */
const SIG={
 pent:`<svg viewBox="0 0 100 100" class="sig"><g fill="none" stroke="#d42a22" stroke-width="2"><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="39"/><path d="M50 12 72 81 13 38h74L28 81z"/></g><g fill="#d42a22"><path d="M50 2l3 6h-6zM95 50l-6 3v-6zM50 98l-3-6h6zM5 50l6-3v6z"/></g></svg>`,
 eye:`<svg viewBox="0 0 100 100" class="sig"><g fill="none" stroke="#7a6f69" stroke-width="2"><circle cx="50" cy="50" r="46"/><path d="M14 50Q50 18 86 50 50 82 14 50z"/><circle cx="50" cy="50" r="12" fill="#d42a22" stroke="none"/><circle cx="50" cy="50" r="4" fill="#7a6f69"/><path d="M50 4v10M50 86v10M4 50h10M86 50h10" stroke="#d42a22"/></g></svg>`,
 tri:`<svg viewBox="0 0 100 100" class="sig"><g fill="none" stroke="#7a6f69" stroke-width="2"><path d="M50 6 94 86H6z"/><path d="M50 30 74 72H26z" stroke="#d42a22"/><circle cx="50" cy="58" r="8"/><circle cx="50" cy="50" r="46" stroke-dasharray="2 5"/></g></svg>`,
 star:`<svg viewBox="0 0 100 100" class="sig"><g fill="none" stroke="#7a6f69" stroke-width="1.8"><circle cx="50" cy="50" r="46"/><path d="${(()=>{let d='';for(let i=0;i<8;i++){const a=i*3*Math.PI*2/8-Math.PI/2;d+=(i?'L':'M')+(50+40*Math.cos(a)).toFixed(1)+' '+(50+40*Math.sin(a)).toFixed(1)}return d+'z'})()}" stroke="#d42a22"/><circle cx="50" cy="50" r="7"/><path d="M43 50h14M50 43v14"/></g></svg>`
};
/* icons for ribbons */
const IC={
 sess:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>',
 npc:'<svg viewBox="0 0 24 24"><path d="M12 3c-4 0-7 3-7 7 0 2.5 1 4 2 5v3h3v-2h4v2h3v-3c1-1 2-2.5 2-5 0-4-3-7-7-7z"/><circle cx="9.3" cy="10.5" r="1.5"/><circle cx="14.7" cy="10.5" r="1.5"/></svg>',
 spell:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 4 16.7 18.5 4.4 9.5h15.2L7.3 18.5z"/></svg>',
 item:'<svg viewBox="0 0 24 24"><path d="M14 3l7 7-9 9-3 1-3-3 1-3z"/><path d="M5 19l-2 2M8 13l3 3"/></svg>',
 combat:'<svg viewBox="0 0 24 24"><path d="M4 4l10 10M20 4L10 14M7 17l-3 3M17 17l3 3M6 15l3 3M18 15l-3 3"/></svg>',
 dice:'<svg viewBox="0 0 24 24"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 2v6l9-1M12 8 3 7M12 8l-5 10h10z"/></svg>',
 pcs:'<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M12 8v8M9 11h6"/></svg>',
 notes:'<svg viewBox="0 0 24 24"><path d="M19 3 9 13l-1 4 4-1L22 6z"/><path d="M15 21H4V5h7"/></svg>',
 map:'<svg viewBox="0 0 24 24"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>',
 rules:'<svg viewBox="0 0 24 24"><path d="M4 4h6c1.5 0 2 1 2 2v14c0-1-1-2-2-2H4zM20 4h-6c-1.5 0-2 1-2 2v14c0-1 1-2 2-2h6z"/></svg>'
};
const SECTIONS=window.KM_PLAYER?[['hero','Герой','Герой'],['bag','Сумка','Сумка'],['spells','Чары','Чары'],['notes','Записи','Записи'],['table','Мастер','Мастер']]:[['sess','Сессия','Сессия'],['npc','НИП и монстры','Бестиарий'],['spells','Заклинания','Чары'],['items','Лут и предметы','Лут'],['combat','Бой','Бой'],['dice','Кубики','Кубики'],['pcs','Герои','Герои'],['map','Карта','Карта'],['notes','Заметки и сюжет','Заметки'],['rules','Ширма Мастера','Ширма']];
const ICK=window.KM_PLAYER?['pcs','item','spell','notes','map']:['sess','npc','spell','item','combat','dice','pcs','map','notes','rules'];

/* ---------- state ---------- */
const S={sec:0,npcQ:'',npcType:'',npcCR:'',npcOnlyTop:true,spQ:'',spCls:'',spLvl:'',itQ:'',itCat:'',itRar:'',noteTag:'',lim:60};
/* фильтры разделов запоминаются */{const K=['npcType','npcCR','npcOnlyTop','spCls','spLvl','itCat','itRar','noteTag'];try{const v=JSON.parse(localStorage.getItem('km.sf')||'{}');K.forEach(k=>{if(k in v)S[k]=v[k]})}catch(e){}let t;document.addEventListener('click',()=>{clearTimeout(t);t=setTimeout(()=>{const o={};K.forEach(k=>o[k]=S[k]);localStorage.setItem('km.sf',JSON.stringify(o))},300)},true)}
let ownNpcs=LS.get('npcs',[]);
let combat=LS.get('combat',{list:[],turn:0,round:1});
let players=LS.get('players',null)||[
 {id:uid(),name:'Элиндра',cls:'Маг',hp:7,maxhp:7,ac:12,pp:11,init:2,notes:'Эльфийка-волшебница. Знает «Огненный снаряд», «Волшебную стрелу», «Щит», «Усыпление».'},
 {id:uid(),name:'Борин',cls:'Воин',hp:12,maxhp:12,ac:16,pp:12,init:1,notes:'Дварф с боевым топором и щитом. Второе дыхание: 1к10+1 хитов (бонусное действие).'},
 {id:uid(),name:'Лис',cls:'Плут',hp:10,maxhp:10,ac:13,pp:14,init:3,notes:'Полурослик. Скрытая атака 1к6. Хитрое действие со 2-го уровня.'}];
let notes=LS.get('notes',null)||[
 {id:uid(),tag:'Сцена',title:'Таверна «Пьяный грифон»',text:'Герои встречаются в таверне. Трактирщик Хольм шепчет о пропавших детях из деревни и о гоблинах на старой дороге.',t:Date.now()},
 {id:uid(),tag:'Тайна',title:'Кто стоит за гоблинами',text:'Гоблинами командует багбир Клаг, а ему платит культист из города. Не раскрывать до 3-й сессии!',t:Date.now()-1000},
 {id:uid(),tag:'Заметка',title:'Совет себе',text:'Говорить «Что вы делаете?» после описания сцены. Не бояться импровизировать. Правило важнее — веселье.',t:Date.now()-2000}];
let rollHist=LS.get('rolls',[]);
const save=()=>{LS.set('npcs',ownNpcs);LS.set('combat',combat);LS.set('players',players);LS.set('notes',notes);LS.set('rolls',rollHist.slice(0,40));LS.set('sec',S.sec)};

const allMonsters=()=>[...ownNpcs.map(n=>({...n,own:true})),...D.monsters];
const findMon=id=>allMonsters().find(m=>m.id===id);

/* ---------- ribbons ---------- */
const rib=$('#ribbons');
const ORD=window.KM_PLAYER||SECTIONS.length!==10?SECTIONS.map((_,i)=>i):[4,5,7,6,1,0,2,3,8,9];rib.innerHTML=ORD.map(i=>[SECTIONS[i],i]).map(([s,i])=>`<button class="rib" data-i="${i}" aria-label="${s[1]}">${IC[ICK[i]]}<span>${s[2]}</span></button>`).join('');
rib.addEventListener('click',e=>{const b=e.target.closest('.rib');if(b)go(+b.dataset.i)});
function markRib(){$$('.rib').forEach(b=>b.classList.toggle('on',+b.dataset.i===S.sec))}

/* ---------- page flip ---------- */
const page=$('#page'),book=$('#book');let flipping=false;if(go.q){const q=go.q;go.q=null;setTimeout(()=>go(q[0],q[1]),0)}
function go(i,dirHint){
  if(flipping&&i!==S.sec&&i>=0&&i<SECTIONS.length){go.q=[i,dirHint];return}
  if(i<0||i>=SECTIONS.length||i===S.sec||flipping){if(i===S.sec)page.scrollTo({top:0,behavior:'smooth'});return}
  const fwd=dirHint!=null?dirHint>0:i>S.sec;flipping=true;
  const snap=page.cloneNode(true);snap.removeAttribute('id');snap.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));snap.style.pointerEvents='none';snap.querySelectorAll('canvas').forEach(c=>{c.width=c.height=0;c.remove()});
  const st=page.scrollTop;book.append(snap);snap.scrollTop=st;
  const prevSec=S.sec;S.sec=i;render();page.scrollTop=0;markRib();save();if(window.KMTab&&!window.__kmFromBack)KMTab(prevSec);window.__kmFromBack=0;
  const dur=380,ease='cubic-bezier(.3,.7,.2,1)',dx=fwd?1:-1;
  snap.animate([{transform:'translateX(0)',opacity:1},{transform:`translateX(${-dx*28}%) scale(.96)`,opacity:0}],{duration:dur,easing:ease,fill:'forwards'});
  const a=page.animate([{transform:`translateX(${dx*40}%)`,opacity:0},{transform:'none',opacity:1}],{duration:dur,easing:ease});
  let fin=0;const done=()=>{if(fin)return;fin=1;clearTimeout(go.ft);snap.remove();document.querySelectorAll('#book > .page:not(#'+page.id+')').forEach(n=>{if(n!==page&&!n.id)n.remove()});flipping=false;if(go.q){const q=go.q;go.q=null;setTimeout(()=>go(q[0],q[1]),0)}};a.onfinish=done;a.oncancel=done;go.ft=setTimeout(done,dur+250);
}
/* swipe: только от края экрана, никогда — из прокручиваемых, карты, жетонов, полей */
(function(){let x0,y0,t0,ok;const el=$('#book');const EDGE=40;
 const BLOCK='input,textarea,select,canvas,[contenteditable],[data-noswipe],.map-wrap,#mw,#mc,.tok,.token,.chips,.lbar,.dbar,.imp-o,.shp-o,.cb-row,.sheet,#sheet,[draggable=true],input[type=range]';
 const hscroll=t=>{for(let n=t;n&&n!==el&&n.nodeType===1;n=n.parentElement){if(n.scrollWidth>n.clientWidth+2){const o=getComputedStyle(n).overflowX;if(o==='auto'||o==='scroll')return true}}return false};
 el.addEventListener('touchstart',e=>{ok=false;if(e.touches.length!==1)return;const t=e.touches[0],w=innerWidth;if(t.clientX>EDGE&&t.clientX<w-EDGE)return;const pts=[e.target,...document.elementsFromPoint(innerWidth/2,t.clientY).slice(0,6),...document.elementsFromPoint(t.clientX<EDGE?EDGE+24:innerWidth-EDGE-24,t.clientY).slice(0,6)];if(pts.some(n=>n&&n.closest&&(n.closest(BLOCK)||hscroll(n))))return;ok=true;x0=t.clientX;y0=t.clientY;t0=Date.now()},{passive:true});
 el.addEventListener('touchmove',e=>{if(ok&&e.touches.length>1)ok=false},{passive:true});
 el.addEventListener('touchcancel',()=>{ok=false},{passive:true});
 el.addEventListener('touchend',e=>{if(!ok)return;ok=false;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;
  const fromLeft=x0<=EDGE,fromRight=x0>=innerWidth-EDGE;
  if(Math.abs(dx)>80&&Math.abs(dx)>Math.abs(dy)*2.2&&Date.now()-t0<700&&((fromLeft&&dx>0)||(fromRight&&dx<0))){{const o=ORD,j=o.indexOf(S.sec)+(dx<0?1:-1);if(j>=0&&j<o.length)go(o[j],dx<0?1:-1)}}},{passive:true});
 window.KM_SWIPE={BLOCK,EDGE};})();

/* ---------- sheet ---------- */
const sheet=$('#sheet'),sp=$('#sheetPage');
function openSheet(html,after){clearTimeout(closeSheet.t);window.KM_sheetRet=null;const ot=(sp.querySelector('.sb-title,h3')||{}).textContent,oy=sp.scrollTop,was=sheet.classList.contains('show');sp.onclick=null;sp.innerHTML=html;const nt=(sp.querySelector('.sb-title,h3')||{}).textContent;sp.scrollTop=was&&ot&&ot===nt?oy:0;{const kv=sp.querySelector('#kmver');kv&&window.KM_ver&&KM_ver().then(v=>kv.textContent='версия '+v)}sheet.classList.add('open');requestAnimationFrame(()=>requestAnimationFrame(()=>{if(sheet.classList.contains('open'))sheet.classList.add('show')}));after&&after(sp)}
function closeSheet(){const RT=window.KM_sheetRet;if(RT){window.KM_sheetRet=null;RT();return}sheet.classList.remove('show');clearTimeout(closeSheet.t);closeSheet.t=setTimeout(()=>sheet.classList.remove('open'),420)}
$('.bg',sheet).onclick=closeSheet;$('.x',sheet).onclick=closeSheet;
(function(){let y0,ok;const sh=$('.sh',sheet);sh.addEventListener('touchstart',e=>{ok=sp.scrollTop<=0;y0=e.touches[0].clientY},{passive:true});
 sh.addEventListener('touchend',e=>{if(ok&&e.changedTouches[0].clientY-y0>110)closeSheet()},{passive:true})})();

/* ---------- helpers ---------- */
function header(title,sub,sig='pent',gi=0){return `<div class="ph">${SIG[sig]}<h1><span class="cap">${esc(title[0])}</span>${esc(title.slice(1))}</h1><div class="sub">${esc(sub)}</div></div>${glyphs(gi)}`}
const searchBox=(id,ph,v)=>`<label class="search"><svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5"/><path d="M15 15l6 6"/></svg><input id="${id}" type="search" placeholder="${ph}" value="${esc(v)}" autocomplete="off"></label>`;
const chips=(name,opts,cur)=>`<div class="chips" data-chips="${name}">${opts.filter((o,i,a)=>a.findIndex(z=>String(z[1]).trim().toLowerCase()===String(o[1]).trim().toLowerCase())===i).map(([v,l])=>`<button class="chip${String(cur)===String(v)?' on':''}" data-v="${esc(v)}">${esc(l)}</button>`).join('')}</div>`;
function bindChips(root,cb){$$('[data-chips]',root).forEach(c=>c.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;c.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b));try{navigator.vibrate&&navigator.vibrate(5)}catch(_){}cb(c.dataset.chips,b.dataset.v)}))}
function bindSearch(id,cb){const i=$('#'+id);if(!i)return;let t;i.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(()=>cb(i.value.trim().toLowerCase()),120)})}
function lazyList(container,items,renderItem){let n=0;const step=40;const sentinel=document.createElement('div');sentinel.className='more';const key=S.sec+':'+(container.id||container.className)+':'+items.length;lazyList.mem=lazyList.mem||{};
  function more(k){const frag=document.createDocumentFragment();const end=Math.min(items.length,n+(k||step));const tmp=document.createElement('div');tmp.innerHTML=items.slice(n,end).map(renderItem).join('');frag.append(...tmp.childNodes);container.insertBefore(frag,sentinel);n=end;lazyList.mem[key]=n;sentinel.textContent=n<items.length?'листай дальше…':'';if(n>=items.length){io.disconnect();return}
   requestAnimationFrame(()=>{if(!sentinel.isConnected||n>=items.length)return;const r=sentinel.getBoundingClientRect(),pr=page.getBoundingClientRect();if(r.top<pr.bottom+400)more()})}
  container.innerHTML='';container.append(sentinel);const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))more()},{root:page,rootMargin:'400px'});more(Math.max(step,Math.min(400,lazyList.mem[key]||0)));io.observe(sentinel);
  if(!items.length)container.innerHTML='<div class="empty">Ничего не найдено в этих страницах…</div>'}

/* ---------- НИП ---------- */
const TYPES=['гуманоид','зверь','нежить','чудовище','исчадие','дракон','великан','конструкт','элементаль','фея','аберрация','слизь','растение','небожитель'];
const CRS=[['','Любая'],['0-0.5','0–½'],['1-2','1–2'],['3-5','3–5'],['6-10','6–10'],['11-30','11+']];
function rNpc(){
  page.innerHTML=header('Бестиарий','НИП и монстры — знай врага в лицо','eye',0)+
   `<div class="row">${'<div class="grow">'+searchBox('npcQ','Найти существо…',S.npcQ)+'</div>'}<button class="btn red" id="newNpc">＋ НИП</button></div>`+
   chips('scope',[['top','★ Частые для новичков'],['all','Все'],['own','Мои']],S.npcOnlyTop===true?'top':S.npcOnlyTop==='own'?'own':'all')+
   `<details class="mfil"${S.npcType||S.npcCR?' open':''}><summary>Тип и опасность${S.npcType||S.npcCR?': '+esc([S.npcType,S.npcCR&&'ПО '+S.npcCR].filter(Boolean).join(', ')):''}</summary>`+chips('type',[['','Все типы'],...TYPES.map(t=>[t,t])],S.npcType)+chips('cr',CRS.map(c=>[c[0],'Опасность '+c[1]]).map((c,i)=>i?c:['','Любая опасность']),S.npcCR)+`</details>`+
   `<div class="list" id="npcList"></div>`;
  bindChips(page,(n,v)=>{if(n==='scope')S.npcOnlyTop=v==='top'?true:v==='own'?'own':false;if(n==='type')S.npcType=v;if(n==='cr')S.npcCR=v;rNpc()});
  bindSearch('npcQ',q=>{S.npcQ=q;fillNpc()});$('#newNpc').onclick=()=>editNpc();fillNpc();
}
function fillNpc(){let L=allMonsters().filter(m=>!m.uniq&&m.pack!=='legends.js');const q=S.npcQ;
  if(S.npcOnlyTop===true&&!q)L=L.filter(m=>m.top||m.own);if(S.npcOnlyTop==='own')L=L.filter(m=>m.own);
  if(q)L=L.filter(m=>(m.n).toLowerCase().includes(q));
  if(S.npcType)L=L.filter(m=>(m.ty||'').startsWith(S.npcType)||(S.npcType==='зверь'&&m.ty&&m.ty.includes('зверей')));
  if(S.npcCR){const[a,b]=S.npcCR.split('-').map(Number);L=L.filter(m=>m.cr>=a&&m.cr<=b)}
  L.sort((a,b)=>(b.own?1:0)-(a.own?1:0)||a.cr-b.cr||a.n.localeCompare(b.n,'ru'));
  lazyList($('#npcList'),L,m=>`<div class="card mon${m.own?' own':''}" data-id="${esc(m.id)}">${avHtml(m,48,'mav')}<div class="t">${esc(m.n)}</div><span class="badge">ПО ${crTxt(m.cr)}</span><div class="m">${esc(m.sz||'')} ${esc(m.ty||'')}</div><div class="stats"><span>КД <b>${m.ac}</b></span><span>Хиты <b>${m.hp}</b></span><span>Скор. <b>${esc((m.sp||'').split(',')[0])}</b></span></div></div>`);
  $('#npcList').onclick=e=>{const c=e.target.closest('.card');if(c)showMon(c.dataset.id)}}
function featHtml(L){return (L||[]).map(f=>`<div class="feat${f.ru===false?' en':''}"><span class="fn">${esc(f.n)}.</span> ${esc(f.d).replace(/\n/g,'<br>')}</div>`).join('')}
const TACT={goblin:'Бьёт и отходит (Отход бонусным действием), прячется за укрытием и стреляет из лука.',hobgoblin:'Дисциплинирован: держит строй, окружает одну цель ради Воинского превосходства.',kobold:'Нападает стаей (Тактика стаи), ставит ловушки, бьёт в спину.',orc:'Агрессивно рвётся вперёд (Агрессия бонусом), бьёт ближайшего. Сражается до конца.',ogre:'Тупой громила: лупит того, кто ударил последним или ближе всех.',troll:'Лезет в ближний бой, рассчитывая на регенерацию; огня и кислоты боится — отходит от факелов.',skeleton:'Бездумно атакует ближайшего, не отступает. Лучники-скелеты держатся позади.',zombie:'Медленно и упорно идёт к ближайшему живому.',wolf:'Стая окружает одну цель, сбивает с ног (Тактика стаи).','dire-wolf':'Охотится стаей, валит слабых с ног и рвёт упавших.',bandit:'Грабитель, а не воин: нападает из засады численностью.','bandit-captain':'Командует, держится рядом с бандитами; при угрозе плена торгуется.',cultist:'Фанатично защищает обряд и вожака; может пожертвовать собой.',bugbear:'Засада из темноты: первым ударом бьёт застигнутого врасплох, затем хватает слабого и утаскивает.',gnoll:'Беспощаден, добивает раненых (Буйство).',owlbear:'Яростный хищник: прыгает на ближайшую цель и не отпускает.',wight:'Высасывает жизнь у сильнейшего бойца, поднимает павших как зомби.',ghoul:'Парализует когтями и переключается на следующую жертву; парализованных пожирает потом.',mimic:'Ждёт, притворяясь предметом; приклеивает и душит одну цель.',spider:'Ждёт в паутине, опутывает и кусает обездвиженных.','giant-spider':'Сеткой обездвиживает лучника или мага, затем подходит и кусает.',dragon:'Открывает бой дыханием по скоплению героев, затем бьёт с воздуха.',lich:'Держится на расстоянии, контролирует поле заклинаниями, использует легендарные действия для отхода.',beholder:'Висит вне досягаемости, антимагическим конусом гасит магов, лучами — сильнейших.'};
function tactics(m){if(!m)return'';const id=m.id||'',ty=(m.ty||'').toLowerCase(),A=JSON.stringify(m.a||[]),it=(m.st||[])[3]||10;for(const k in TACT)if(id===k||(k==='dragon'&&/dragon/.test(id)))return TACT[k];
 const ranged=/Дальнобой|дальнобой|Длинный лук|Короткий лук|Арбалет|Праща/.test(A),caster=/Колдовство|Использование заклинаний|заклинан/i.test(JSON.stringify(m.f||[])+A),legend=/Легендарн/i.test(JSON.stringify(m));let t;
 if(/нежить|конструкт|слизь/.test(ty))t='Без страха и мысли: атакует ближайшего и не отступает.';
 else if(/зверь|чудовищ/.test(ty))t=ranged?'Держит дистанцию, бьёт издалека.':'Хищник: выбирает слабейшую или отбившуюся цель.';
 else if(caster)t='Заклинатель: держится позади союзников, открывает бой контролем или уроном по площади, концентрацию бережёт.';
 else if(ranged)t='Стрелок: держит дистанцию и укрытие, целится в слабо бронированных; в ближнем бою отходит.';
 else if(/дракон|великан|исчад|демон|дьявол/.test(ty))t='Уверен в силе: бьёт самого опасного, поддаётся гордыне и угрозам.';
 else t=it<=7?'Громила: бросается на ближайшего или самого слабого с виду.':'Действует с умом: окружает, фокусирует одну цель.';
 if(legend)t+=' Легендарные действия тратит в конце хода героев.';return t+' Отступление и мораль — на усмотрение Мастера.'}
window.KM_tactics=tactics;
function showMon(id){const m=findMon(id);if(!m)return;const ab=['Сил','Лов','Тел','Инт','Мдр','Хар'];
  openSheet(`<div class="sb-title">${esc(m.n)}</div><div class="sb-sub">${esc(m.sz||'')} ${esc(m.ty||'')}${m.al?', '+esc(m.al):''}</div>${window.KM_PLAYER?'':`<div class="kb-tip" style="margin:6px 0">🗡 <b>Тактика:</b> ${esc(tactics(m))}</div>`}
  <div class="sb-hero"><div class="redstats"><b>Класс доспеха</b>${m.ac}${m.acn?` <small>(${esc(m.acn)})</small>`:''}<br><b>Хиты</b>${m.hp}${m.hd?` <small>(${esc(m.hd)})</small>`:''}<br><b>Скорость</b>${esc(m.sp||'9 м')}<br><b>Опасность</b>${crTxt(m.cr)}${m.xp!=null?` <small>(${m.xp} опыта)</small>`:''}</div>
   <div class="art"><img class="ring" src="${window.KM_PLAYER?'../':''}img/runecircle.webp" alt=""><img src="${window.KM_PLAYER?'../':''}img/monster.webp" alt="" style="position:absolute;inset:18px;width:calc(100% - 36px);height:calc(100% - 36px)"></div></div>
  <div class="redline"></div><div class="abil">${(m.st||[10,10,10,10,10,10]).map((s,i)=>`<div><small>${ab[i]}</small><b>${s}</b><i>${fmod(mod(s))}</i></div>`).join('')}</div><div class="redline"></div>
  ${[['Спасброски',m.sv],['Навыки',m.sk],['Уязвимость к урону',m.vul],['Сопротивление урону',m.res],['Иммунитет к урону',m.imm],['Иммунитет к состояниям',m.ci],['Чувства',m.se],['Языки',m.la]].filter(x=>x[1]).map(x=>`<div class="kv"><b>${x[0]}:</b> ${esc(x[1])}</div>`).join('')}
  ${m.f&&m.f.length?`<div class="sec-h">Особенности</div>${featHtml(m.f)}`:''}
  ${m.a&&m.a.length?`<div class="sec-h">Действия</div>${featHtml(m.a)}`:''}
  ${m.r&&m.r.length?`<div class="sec-h">Реакции</div>${featHtml(m.r)}`:''}
  ${m.lg&&m.lg.length?`<div class="sec-h">Легендарные действия</div>${featHtml(m.lg)}`:''}
  ${m.notes?`<div class="sec-h">Заметки</div><div class="desc">${esc(m.notes)}</div>`:''}
  <div class="row" style="margin-top:18px"><button class="btn red" id="toFight">⚔ В бой</button>${m.own?'<button class="btn" id="edN">Изменить</button><button class="btn dark" id="delN">Удалить</button>':'<button class="btn" id="cpN">Копировать в мои</button>'}</div>
  `,r=>{
   $('#toFight',r).onclick=()=>{addCombatant(m);toast(`«${m.n}» в бою`)};
   if(m.own){$('#edN',r).onclick=()=>editNpc(m);$('#delN',r).onclick=()=>{const old=ownNpcs.slice();ownNpcs=ownNpcs.filter(x=>x.id!==m.id);save();closeSheet();rNpc();KM.undoToast('«'+m.n+'» удалён',()=>{ownNpcs=old;save();rNpc()})}}
   else $('#cpN',r).onclick=()=>{const c=JSON.parse(JSON.stringify(m));c.id='own-'+uid();c.n=m.n+' (мой)';delete c.top;delete c.own;ownNpcs.unshift(c);save();toast('Скопировано в «Мои»');editNpc(c)}})}
function editNpc(m){const isNew=!m;m=m||{id:'own-'+uid(),n:'',sz:'Средний',ty:'гуманоид',al:'',ac:12,hp:10,sp:'9 м',st:[10,10,10,10,10,10],cr:0.25,f:[],a:[],notes:''};
  const fl=L=>(L||[]).map(f=>f.n+': '+f.d).join('\n');const ab=['Сил','Лов','Тел','Инт','Мдр','Хар'];
  openSheet(`<div class="sb-title">${isNew?'Новый НИП':'Правка: '+esc(m.n)}</div><div class="sb-sub">Имя, хиты, КД и заметки о персонаже</div>
  <label class="f">Имя</label><input class="inp" id="e_n" value="${esc(m.n)}" placeholder="Трактирщик Хольм">
  <div class="row"><div class="grow"><label class="f">Размер</label><select class="inp" id="e_sz">${['Крошечный','Маленький','Средний','Большой','Огромный','Громадный'].map(x=>`<option${x===m.sz?' selected':''}>${x}</option>`).join('')}</select></div>
  <div class="grow"><label class="f">Тип</label><select class="inp" id="e_ty">${TYPES.map(x=>`<option${x===m.ty?' selected':''}>${x}</option>`).join('')}</select></div></div>
  <div class="row"><div class="grow"><label class="f">КД</label><input class="inp" id="e_ac" type="number" inputmode="numeric" value="${m.ac}"></div><div class="grow"><label class="f">Хиты</label><input class="inp" id="e_hp" type="number" inputmode="numeric" value="${m.hp}"></div><div class="grow"><label class="f">Опасность</label><input class="inp" id="e_cr" type="number" step="0.125" inputmode="decimal" value="${m.cr}"></div></div>
  <label class="f">Скорость</label><input class="inp" id="e_sp" value="${esc(m.sp)}">
  <label class="f">Характеристики</label><div class="abil">${m.st.map((s,i)=>`<div><small>${ab[i]}</small><input class="inp e_st" type="number" inputmode="numeric" value="${s}" style="text-align:center;padding:2px;border:0;background:none;font-size:17px"></div>`).join('')}</div>
  <label class="f">Атаки (по строке: «Название: описание»)</label><textarea class="inp" id="e_a" placeholder="Скимитар: +4 к попаданию, 5 (1к6+2) рубящего урона">${esc(fl(m.a))}</textarea>
  <label class="f">Особенности</label><textarea class="inp" id="e_f" placeholder="Ловкий уход: бонусным действием Отход или Засада">${esc(fl(m.f))}</textarea>
  <label class="f">Заметки (мотивы, голос, тайны)</label><textarea class="inp" id="e_no">${esc(m.notes||'')}</textarea>
  <div class="row" style="margin-top:16px"><button class="btn red" id="e_save">Сохранить</button><button class="btn" id="e_cancel">Отмена</button></div>`,r=>{
   const pl=t=>t.split('\n').map(s=>s.trim()).filter(Boolean).map(s=>{const k=s.indexOf(':');return k>0?{n:s.slice(0,k).trim(),d:s.slice(k+1).trim()}:{n:s,d:''}});
   $('#e_cancel',r).onclick=closeSheet;
   $('#e_save',r).onclick=()=>{const v=id=>$('#'+id,r).value;const n={...m,n:v('e_n')||'Безымянный',sz:v('e_sz'),ty:v('e_ty'),ac:+v('e_ac')||10,hp:+v('e_hp')||1,cr:+v('e_cr')||0,sp:v('e_sp'),st:$$('.e_st',r).map(i=>+i.value||10),a:pl(v('e_a')),f:pl(v('e_f')),notes:v('e_no')};delete n.own;
    const i=ownNpcs.findIndex(x=>x.id===n.id);if(i>=0)ownNpcs[i]=n;else ownNpcs.unshift(n);save();closeSheet();S.npcOnlyTop='own';rNpc();toast('НИП записан в книгу')}})}

/* ---------- SPELLS ---------- */
window.KM_clsNorm=L=>{const M={artificer:'Изобретатель',wizard:'Волшебник',sorcerer:'Чародей',cleric:'Жрец',druid:'Друид',bard:'Бард',warlock:'Колдун',paladin:'Паладин',ranger:'Следопыт'};(L||[]).forEach(s=>{if(Array.isArray(s.cl))s.cl=[...new Set(s.cl.map(c=>{c=String(c).trim();const k=c.toLowerCase();return M[k]||c.charAt(0).toUpperCase()+c.slice(1).toLowerCase()}))]})};
const CLASSES=['Бард','Жрец','Друид','Паладин','Следопыт','Чародей','Колдун','Волшебник','Изобретатель'];
const lvlName=l=>l===0?'Заговор':l+'-й круг';
function rSpells(){page.innerHTML=header('Заклинания','свод чар и заговоров','star',1)+searchBox('spQ','Найти заклинание…',S.spQ)+
  chips('lvl',[['','Все круги'],['0','Заговоры'],...[1,2,3,4,5,6,7,8,9].map(l=>[l,l+'-й'])],S.spLvl)+chips('cls',[['','Все классы'],...[...new Set(CLASSES)].map(c=>[c,c])],S.spCls)+`<div class="list" id="spList"></div>`;
  bindChips(page,(n,v)=>{if(n==='lvl')S.spLvl=v;if(n==='cls')S.spCls=v;rSpells()});bindSearch('spQ',q=>{S.spQ=q;fillSp()});fillSp()}
function fillSp(){if(!window.KM_core){const e=$('#spList');if(e)e.innerHTML='<div class="muted km-ld" style="padding:28px 0;text-align:center">Загружаю книгу…</div>';return}let L=D.spells;const q=S.spQ;if(q){const W=q.split(/\s+/).filter(Boolean);L=L.filter(s=>{const h=s._h||(s._h=[s.n,s.sc,s.dt,(s.cl||[]).join(' '),s.dmg,s.conc?'концентрация':'',s.rit?'ритуал':'','круг '+s.l,s.l?'':'заговор'].join(' ').toLowerCase());return W.every(w=>h.includes(w))});L.sort((a,b)=>(b.n.toLowerCase().includes(q)?1:0)-(a.n.toLowerCase().includes(q)?1:0))}if(S.spLvl!=='')L=L.filter(s=>s.l===+S.spLvl);if(S.spCls)L=L.filter(s=>s.cl.includes(S.spCls));
  L=[...L].sort((a,b)=>a.l-b.l||a.n.localeCompare(b.n,'ru'));
  lazyList($('#spList'),L,s=>`<div class="card" data-id="${s.id}"><div class="t">${esc(s.n)}</div><span class="badge">${s.l===0?'загов.':s.l+' кр.'}</span><div class="m">${esc(s.sc)} · ${esc(s.t)}${s.conc?' · <span class="hand">концентрация</span>':''}${s.rit?' · ритуал':''}</div><div class="m">${s.dmg?`<span style="color:var(--blood);font-style:normal">${esc(s.dmg)}</span>`:''}</div></div>`);
  $('#spList').onclick=e=>{const c=e.target.closest('.card');if(c)showSpell(c.dataset.id)}}
window.spThumb=s=>window.SPART&&SPART.has(s.id)?`<img class="spthumb" loading="lazy" decoding="async" width="46" height="46" alt="" src="${window.KM_PLAYER?'../':''}img/spt/${s.id}.webp" onerror="this.remove()">`:'';
window.spArt=id=>window.SPART&&SPART.has(id)?`<div class="spx-art"><img loading="lazy" decoding="async" alt="" src="${window.KM_PLAYER?'../':''}img/sp/${id}.webp" onload="this.parentNode.classList.add('on')" onerror="this.parentNode.remove()"></div>`:'';
function showSpell(id){const s=D.spells.find(x=>x.id===id);
  openSheet(`<div class="sp-head"><div><div class="sb-title" style="margin-right:0">${esc(s.n)}</div><div class="sb-sub">${lvlName(s.l)}, ${esc(s.sc.toLowerCase())}${s.rit?' (ритуал)':''}</div></div></div>
  ${spArt(s.id)}<div class="sp-circle"><img class="r1" src="${window.KM_PLAYER?'../':''}img/runecircle.webp" alt=""><div class="lvl">${s.l===0?'✶':s.l}</div></div>
  <div class="sp-grid"><div><b>Время</b>${esc(s.t)}</div><div><b>Дистанция</b>${esc(s.r)}</div><div><b>Компоненты</b><span class="comp">${[...s.c].map(c=>`<span>${c}</span>`).join('')}</span></div><div><b>Длительность</b>${s.conc?'Концентрация, ':''}${esc(s.d)}</div>${s.dmg?`<div><b>Урон</b>${esc(s.dmg)}</div>`:''}<div><b>Классы</b><span style="font-size:14px">${esc(s.cl.join(', '))}</span></div></div>
  ${s.m?`<div class="kv" style="font-size:13.5px"><b>М:</b> <i>${esc(s.m)}</i></div>`:''}<div class="redline"></div>
  <div class="desc dropcap">${esc(s.ds)}</div>`)}

/* ---------- ITEMS ---------- */
const ICATS=['Оружие','Доспехи','Магические','Снаряжение','Инструменты','Транспорт'];
const RARS=['Обычный','Необычный','Редкий','Очень редкий','Легендарный','Артефакт','Разная'];
function rItems(){page.innerHTML=header('Предметы','оружие, доспехи и диковины','tri',2)+searchBox('itQ','Найти предмет…',S.itQ)+chips('cat',[['','Все'],...ICATS.map(c=>[c,c])],S.itCat)+(S.itCat&&new Set(D.items.filter(i=>i.cat===S.itCat||(S.itCat!=='Магические'&&i.cat==='Магические'&&(S.itCat==='Оружие'?(i.dmg||/^оружие/i.test(i.sub||'')):S.itCat==='Доспехи'?(i.acv||/^доспех|^щит/i.test(i.sub||'')):0))).map(i=>i.rar)).size>1?chips('rar',[['','Любая редкость'],...RARS.map(r=>[r,r])],S.itRar):'')+`<div class="list" id="itList"></div>`;
  bindChips(page,(n,v)=>{if(n==='cat'){S.itCat=v;S.itRar=''}if(n==='rar')S.itRar=v;rItems()});bindSearch('itQ',q=>{S.itQ=q;fillIt()});fillIt()}
function fillIt(){if(!window.KM_core){const e=$('#itList');if(e)e.innerHTML='<div class="muted km-ld" style="padding:28px 0;text-align:center">Загружаю книгу…</div>';return}if(!D.items._dd){const seen=new Set();D.items=window.KM_dedupe(D.items,true)||D.items;(()=>{});D.items._dd=1}let L=D.items;const q=S.itQ;const cm=(i,c)=>i.cat===c||(c==='Оружие'&&i.cat==='Магические'&&(i.dmg||/^оружие/i.test(i.sub||'')))||(c==='Доспехи'&&i.cat==='Магические'&&(i.acv||/^доспех|^щит/i.test(i.sub||'')));if(!q&&S.itCat)L=L.filter(i=>cm(i,S.itCat));if(!q&&S.itRar)L=L.filter(i=>i.rar===S.itRar);{let n=$('#itAll');if(!n){n=document.createElement('div');n.id='itAll';n.className='muted';n.style.cssText='font-size:12.5px;margin:6px 2px';$('#itList').before(n)}n.textContent=q&&(S.itCat||S.itRar)?'Поиск идёт по всем категориям — фильтры выше не учитываются':''}if(q){const W=q.split(/\s+/).filter(Boolean);L=L.filter(i=>{const h=i._h||(i._h=[i.n,i.sub,i.cat,i.rar,i.prop,i.dmg,i.att?'настройка':''].join(' ').toLowerCase());return W.every(w=>h.includes(w))});L.sort((a,b)=>(b.n.toLowerCase().includes(q)?1:0)-(a.n.toLowerCase().includes(q)?1:0))}
  lazyList($('#itList'),L,i=>`<div class="card" data-id="${i.id}"><div class="t">${esc(i.n)}</div>${i.cat==='Магические'?`<span class="badge">${esc(i.rar)}</span>`:i.cost!=='—'?`<span class="badge">${esc(i.cost)}</span>`:''}<div class="m">${esc(i.sub||i.cat)}${i.att?' · <span class="hand">настройка</span>':''}</div>${i.dmg||i.acv?`<div class="stats">${i.dmg?`<span>Урон <b>${esc(i.dmg)}</b></span>`:''}${i.acv?`<span>КД <b>${esc(i.acv)}</b></span>`:''}${i.w?`<span>Вес <b>${i.w} кг</b></span>`:''}</div>`:''}${i.prop?`<div class="m" style="font-size:13px">${esc(i.prop)}</div>`:''}</div>`);
  $('#itList').onclick=e=>{const c=e.target.closest('.card');if(c)showItem(c.dataset.id)}}
function showItem(id){const i=D.items.find(x=>x.id===id);if(!i){toast('Карточка предмета не найдена');return}
  openSheet(`<div class="sb-title">${esc(i.n)}</div><div class="sb-sub">${esc(i.sub||i.cat)}${i.cat==='Магические'?', '+esc(i.rar.toLowerCase()):''}${i.att?' (требует настройки)':''}</div>${glyphs(3)}
  <div class="sp-grid">${i.dmg?`<div><b>Урон</b>${esc(i.dmg)}</div>`:''}${i.acv?`<div><b>Класс доспеха</b>${esc(i.acv)}</div>`:''}<div><b>Цена</b>${esc(i.cost)}</div><div><b>Вес</b>${i.w?i.w+' кг':'—'}</div><div><b>Редкость</b>${esc(i.rar)}</div>${i.prop?`<div style="grid-column:1/-1"><b>Свойства</b>${esc(i.prop)}</div>`:''}</div>
  ${i.ds?`<div class="redline"></div><div class="desc dropcap">${esc(i.ds)}</div>`:''}`)}

/* ---------- COMBAT ---------- */
const CONDS=['Ослеплён','Очарован','Оглохший','Испуган','Схвачен','Недееспособен','Невидим','Парализован','Окаменел','Отравлен','Сбит с ног','Опутан','Ошеломлён','Без сознания','Истощение','Концентрация'];
function addCombatant(m,isPC){const dex=m.st?mod(m.st[1]):(m.init||0);if(isPC){const ex=combat.list.find(c=>c.pc&&c.pid===m.id);if(ex)return ex;const nm=window.heroName?heroName(m):(m.name||m.n||'Герой');combat.list.push({id:uid(),pid:m.id,base:nm,name:nm,init:rnd(20)+dex,dex,hp:m.hp,max:m.maxhp||m.hp,thp:m.thp||0,ac:m.ac,pc:true,conds:[]});sortC();save();if(SECTIONS[S.sec][0]==='combat')rCombat();return}const mn=m.n||m.name||'Существо';const n=combat.list.filter(c=>c.base===mn).length;
  combat.list.push({id:uid(),base:mn,name:n?`${mn} ${n+1}`:mn,init:rnd(20)+dex,dex,hp:m.hp,max:m.maxhp||m.hp,ac:m.ac,pc:false,mon:m.id,conds:[]});sortC();save();if(SECTIONS[S.sec][0]==='combat')rCombat()}
function sortC(){const cur=combat.list[combat.turn];combat.list.sort((a,b)=>b.init-a.init||b.dex-a.dex);combat.turn=Math.max(0,combat.list.indexOf(cur))}
function rCombat(){const L=combat.list;
  page.innerHTML=header('Бой','трекер инициативы','pent',3)+`<div class="round"><div class="rn">Раунд <b>${combat.round}</b></div><div class="row"><button class="btn sm" id="cAdd">＋ Боец</button><button class="btn sm" id="cMenu">⋯</button></div></div>
  <div class="list" id="cList">${L.length?L.map((c,i)=>`<div class="cb${i===combat.turn?' cur':''}${c.pc?' pc':''}${c.hp<=0?' dead':''}" data-id="${c.id}">
   <div class="ini" data-a="init">${c.init}</div><div><div class="nm" data-a="open">${esc(c.name)}</div><div class="meta">КД ${c.ac} · хиты ${c.hp}/${c.max}</div><div class="hpbar"><i style="width:${Math.max(0,Math.min(100,c.hp/c.max*100))}%"></i></div></div>
   <div class="hpc"><button class="rb" data-a="dmg">−</button><button class="rb" data-a="heal">+</button><button class="rb" data-a="cond" style="font-size:15px">✦</button></div>
   ${c.conds.length?`<div class="conds">${c.conds.map(x=>`<span class="cond">${esc(x)}</span>`).join('')}</div>`:''}</div>`).join(''):`<div class="empty">Поле битвы пусто.<br>Добавь бойцов — героев и чудищ.</div>`}</div>
  <div style="height:110px"></div><button class="seal fab" id="cNext"><span>Следующий<br>ход</span></button>`;
  $('#cNext').onclick=()=>{if(!L.length)return;let k=0;do{combat.turn++;if(combat.turn>=L.length){combat.turn=0;combat.round++;toast('Раунд '+combat.round)}k++}while(L[combat.turn].hp<=0&&!L[combat.turn].pc&&k<L.length);save();rCombat();
    const cur=$('.cb.cur');cur&&cur.scrollIntoView({block:'center',behavior:'smooth'})};
  $('#cAdd').onclick=addMenu;$('#cMenu').onclick=combatMenu;
  $('#cList').onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const c=L.find(x=>x.id===b.closest('.cb').dataset.id);const a=b.dataset.a;
   if(a==='dmg'||a==='heal')hpPrompt(c,a);else if(a==='cond')condPick(c);else if(a==='init')initPrompt(c);else if(a==='open'){if(c.mon)showMon(c.mon)}}}
function hpPrompt(c,a){openSheet(`<div class="sb-title">${a==='dmg'?'Урон':'Лечение'}</div><div class="sb-sub">${esc(c.name)} · хиты ${c.hp}/${c.max}</div>
  <input class="inp" id="hv" type="number" inputmode="numeric" placeholder="сколько?" style="font-size:34px;text-align:center;font-family:var(--title);margin:16px 0">
  <div class="row" style="justify-content:center">${[1,2,3,5,8,10].map(n=>`<button class="btn sm q" data-n="${n}">${n}</button>`).join('')}</div>
  <div class="row" style="margin-top:16px"><button class="btn red grow" id="hok" style="justify-content:center">${a==='dmg'?'Нанести урон':'Исцелить'}</button></div>
  <div class="row" style="margin-top:10px"><button class="btn sm" id="hrem">Убрать из боя</button></div>`,r=>{const inp=$('#hv',r);setTimeout(()=>inp.focus(),350);
   const apply=n=>{n=Math.abs(+n||0);c.hp=a==='dmg'?c.hp-n:Math.min(c.max,c.hp+n);if(!c.pc)c.hp=Math.max(0,c.hp);save();closeSheet();rCombat();if(c.hp<=0)toast(c.pc?`${c.name} без сознания — спасброски от смерти!`:`${c.name} повержен`)};
   $$('.q',r).forEach(b=>b.onclick=()=>apply(b.dataset.n));$('#hok',r).onclick=()=>apply(inp.value);inp.onkeydown=e=>{if(e.key==='Enter')apply(inp.value)};
   $('#hrem',r).onclick=()=>{const i=combat.list.indexOf(c);const o=combat.list.slice(),ot=combat.turn;combat.list.splice(i,1);if(combat.turn>=combat.list.length)combat.turn=0;else if(i<combat.turn)combat.turn--;save();closeSheet();rCombat();KM.undoToast&&KM.undoToast(c.name+' убран',()=>{combat.list=o;combat.turn=ot;save();rCombat()})}})}
function initPrompt(c){const v=prompt('Инициатива для '+c.name,c.init);if(v!=null&&v!==''){c.init=+v;sortC();save();rCombat()}}
function condPick(c){openSheet(`<div class="sb-title">Состояния</div><div class="sb-sub">${esc(c.name)}</div><div class="row" style="margin-top:12px">${CONDS.map(x=>`<button class="chip${c.conds.includes(x)?' on':''}" data-c="${x}">${x}</button>`).join('')}</div><div class="row" style="margin-top:18px"><button class="btn red" id="cok">Готово</button></div>`,r=>{
  $$('[data-c]',r).forEach(b=>b.onclick=()=>{const x=b.dataset.c;c.conds=c.conds.includes(x)?c.conds.filter(y=>y!==x):[...c.conds,x];b.classList.toggle('on');save()});$('#cok',r).onclick=()=>{closeSheet();rCombat()}})}
function addMenu(){openSheet(`<div class="sb-title">Добавить бойца</div><div class="sb-sub">Выберите героя, монстра или НИП для инициативы</div>
  <div class="row" style="margin:12px 0"><button class="btn red" id="aPC">⚜ Всех игроков</button></div>
  <div class="sec-h">Вручную</div><div class="row"><input class="inp grow" id="mN" placeholder="Имя"></div>
  <div class="row"><div class="grow"><label class="f">Инициатива</label><input class="inp" id="mI" type="number" inputmode="numeric" placeholder="к20"></div><div class="grow"><label class="f">Хиты</label><input class="inp" id="mH" type="number" inputmode="numeric" value="10"></div><div class="grow"><label class="f">КД</label><input class="inp" id="mA" type="number" inputmode="numeric" value="12"></div></div>
  <div class="row" style="margin-top:10px"><button class="btn" id="mOk">Добавить</button></div>
  <div class="sec-h">Из бестиария</div>${searchBox('bq','Гоблин, волк, скелет…','')}<div class="row" style="margin:6px 0"><span class="muted">Количество:</span><div class="stepper"><button class="rb" id="cm">−</button><output id="cnt">1</output><button class="rb" id="cp">+</button></div></div><div class="list" id="bl"></div>`,r=>{
  let cnt=1;$('#cm',r).onclick=()=>{cnt=Math.max(1,cnt-1);$('#cnt',r).textContent=cnt};$('#cp',r).onclick=()=>{cnt=Math.min(12,cnt+1);$('#cnt',r).textContent=cnt};
  $('#aPC',r).onclick=()=>{players.forEach(p=>{if(!combat.list.some(c=>c.base===p.name&&c.pc))addCombatant({...p,n:p.name},true)});closeSheet();rCombat();toast('Герои готовы к бою')};
  $('#mOk',r).onclick=()=>{const n=$('#mN',r).value||'Противник';const iv=$('#mI',r).value;combat.list.push({id:uid(),base:n,name:n,init:iv?+iv:rnd(20),dex:0,hp:+$('#mH',r).value||1,max:+$('#mH',r).value||1,ac:+$('#mA',r).value||10,pc:false,conds:[]});sortC();save();closeSheet();rCombat()};
  const fill=q=>{const L=allMonsters().filter(m=>!q?(m.top||m.own):(m.n).toLowerCase().includes(q)).slice(0,30);
   $('#bl',r).innerHTML=L.map(m=>`<div class="card" data-id="${esc(m.id)}" style="padding:7px 10px"><div class="t" style="font-size:16px">${esc(m.n)}</div><span class="badge">ПО ${crTxt(m.cr)}</span><div class="m">КД ${m.ac} · хиты ${m.hp}</div></div>`).join('')};
  fill('');const bi=$('#bq',r);bi.oninput=()=>fill(bi.value.trim().toLowerCase());
  $('#bl',r).onclick=e=>{const c=e.target.closest('.card');if(!c)return;const m=findMon(c.dataset.id);for(let i=0;i<cnt;i++)addCombatant(m);toast(`${m.n} ×${cnt} — инициатива брошена`);closeSheet();rCombat()}})}
function combatMenu(){openSheet(`<div class="sb-title">Управление боем</div><div class="list" style="margin-top:14px">
  <button class="btn" id="m1">🎲 Перебросить инициативу всем</button><button class="btn" id="m2">↺ Сбросить раунды</button><button class="btn" id="m3">☠ Убрать павших врагов</button><button class="btn dark" id="m4">✕ Завершить бой (очистить)</button></div>`,r=>{
  $('#m1',r).onclick=()=>{combat.list.forEach(c=>c.init=rnd(20)+(c.dex||0));combat.turn=0;sortC();combat.turn=0;save();closeSheet();rCombat()};
  $('#m2',r).onclick=()=>{combat.round=1;combat.turn=0;save();closeSheet();rCombat()};
  $('#m3',r).onclick=()=>{combat.list=combat.list.filter(c=>c.pc||c.hp>0);combat.turn=0;save();closeSheet();rCombat()};
  $('#m4',r).onclick=()=>{const old=combat;combat={list:[],turn:0,round:1};save();closeSheet();rCombat();KM.undoToast('Бой завершён',()=>{combat=old;save();rCombat()})}})}

/* ---------- DICE ---------- */
const DIE_SH={4:'<path class="f" d="M50 8 94 88H6z"/><path class="l" d="M50 8v80"/>',6:'<rect class="f" x="12" y="12" width="76" height="76" rx="6"/><path class="l" d="M12 12l10 10h56l10-10M22 22v56"/>',8:'<path class="f" d="M50 4 92 50 50 96 8 50z"/><path class="l" d="M8 50h84M50 4 30 50 50 96 70 50z"/>',
 10:'<path class="f" d="M50 4 93 42 50 96 7 42z"/><path class="l" d="M7 42l25 8 18-46 18 46 25-8M32 50l18 46 18-46H32"/>',12:'<path class="f" d="M50 4 88 22 96 62 70 94H30L4 62 12 22z"/><path class="l" d="M50 22 72 38 64 66H36L28 38zM50 4v18M88 22 72 38M96 62 64 66M70 94 64 66M30 94 36 66M4 62l32 4M12 22l16 16"/>',
 20:'<path class="f" d="M50 3 92 27v46L50 97 8 73V27z"/><path class="l" d="M50 25 75 66H25zM50 3v22M92 27 75 66M8 27l17 39M50 97 25 66M50 97l25-31M8 73l17-7M92 73l-17-7M8 27l42-2 42 2"/>',100:'<circle class="f" cx="50" cy="50" r="44"/><path class="l" d="M50 6v88M6 50h88M19 19l62 62M81 19 19 81"/>'};
let dState=LS.get('dstate',{d:20,n:1,m:0,adv:0});
let cs=Object.assign({tab:'atk',a:[],adv:0,am:0,tt:'КД',tv:12,dmg:[],dd:6,dm:0,crit:false,rv:0},LS.get('calc',{}));
const saveC=()=>LS.set('calc',cs);
const sum=a=>a.reduce((x,y)=>x+y,0);
const dieBtn=(d,on,extra='')=>`<button class="die${on?' on':''}" data-d="${d}"><svg viewBox="0 0 100 100">${DIE_SH[d]}</svg><b>к${d}</b>${extra}</button>`;
const histHtml=()=>rollHist.slice(0,15).map(h=>`<div><span>${esc(h.lbl)}<small class="muted">${esc(h.exp)}</small></span><b>${h.total}</b></div>`).join('')||'<div class="muted" style="padding:6px 2px">пока пусто</div>';
function pushHist(lbl,exp,total){if(rollHist[0]&&rollHist[0].lbl===lbl&&Date.now()-rollHist[0].t<4000)rollHist.shift();rollHist.unshift({lbl,exp,total,t:Date.now()});save()}
function rDice(){page.oninput=null;page.innerHTML=header('Кубики','калькулятор для настоящих костей','eye',0)+
  `<div class="seg" id="dseg">${[['atk','Атака / проверка'],['dmg','Урон'],['virt','Виртуальный бросок']].map(([k,l])=>`<button data-t="${k}" class="${cs.tab===k?'on':''}">${l}</button>`).join('')}</div><div id="dbody"></div>
  <div class="sec-h">Летопись <button class="btn sm" id="clearH" style="margin-left:auto;order:2">Очистить</button></div><div class="hist" id="hist">${histHtml()}</div>`;
  $('#dseg').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;cs.tab=b.dataset.t;saveC();$$('#dseg button').forEach(x=>x.classList.toggle('on',x===b));drawD()};
  $('#clearH').onclick=()=>{rollHist=[];save();$('#hist').innerHTML=histHtml()};drawD()}
function drawD(){const B=$('#dbody');if(cs.tab==='atk')calcAtk(B);else if(cs.tab==='dmg')calcDmg(B);else virt(B)}
function pad(max){if(max>20)return `<div class="row" style="margin:6px 0 10px"><input class="inp grow" id="bigv" type="number" inputmode="numeric" placeholder="Что выпало (1–${max})"><button class="btn red" id="bigok">Добавить</button></div>`;
  let h='';for(let i=1;i<=max;i++)h+=`<button data-v="${i}" class="${i===max?'mx':i===1?'mn':''}">${i}</button>`;return `<div class="pad">${h}<button class="wide" data-v="undo">⌫ Убрать</button><button class="wide" data-v="clr">Сброс</button></div>`}
function bindPad(B,max,add,undo,clr){$$('.pad button',B).forEach(b=>b.onclick=()=>{const v=b.dataset.v;if(v==='undo')undo();else if(v==='clr')clr();else add(+v);if(navigator.vibrate)navigator.vibrate(8)});
  const bi=$('#bigv',B);if(bi){const go=()=>{const v=+bi.value;if(v>=1&&v<=max){add(v)}else toast('Число от 1 до '+max)};$('#bigok',B).onclick=go;bi.onkeydown=e=>{if(e.key==='Enter')go()}}}
function stepper(id,val,txt){return `<div class="stepper"><button class="rb" data-st="${id}-">−</button><output>${txt??val}</output><button class="rb" data-st="${id}+">+</button></div>`}
function bindSteps(B,fn){$$('[data-st]',B).forEach(b=>b.onclick=()=>{const k=b.dataset.st;fn(k.slice(0,-1),k.slice(-1)==='+'?1:-1)})}
/* attack / check */
function calcAtk(B){const need=cs.adv?2:1;const a=cs.a;
  const kept=a.length?(cs.adv>0?Math.max(...a.slice(0,2)):cs.adv<0?Math.min(...a.slice(0,2)):a[0]):null;
  const keptIdx=kept==null?-1:a.indexOf(kept);
  const tot=kept==null?null:kept+cs.am;const isAtk=cs.tt==='КД';
  let verdict='',cls='';
  if(tot!=null&&a.length>=need){
    if(isAtk&&kept===20)verdict='<span class="verdict ok">Попадание — КРИТ!</span>';
    else if(isAtk&&kept===1)verdict='<span class="verdict no">Промах (натуральная 1)</span>';
    else if(cs.tv)verdict=tot>=cs.tv?`<span class="verdict ok">${isAtk?'Попадание':'Успех'}: ${tot} ≥ ${cs.tv}</span>`:`<span class="verdict no">${isAtk?'Промах':'Провал'}: ${tot} < ${cs.tv}</span>`;
    cls=kept===20?' crit':kept===1?' fumble':''}
  B.innerHTML=`${chips('adv',[['0','Обычный бросок'],['1','Преимущество ⬆'],['-1','Помеха ⬇']],cs.adv)}
  <div class="tray" id="tray">${a.length?a.map((v,i)=>`<span class="tk${v===20?' n20':v===1?' n1':''}${a.length>1&&cs.adv&&i!==keptIdx&&i<2?' drop':''}"><small>к20</small>${v}</span>`).join(''):`<span class="ph2">Нажми, что выпало на к20${need>1?' (два броска)':''}</span>`}</div>
  ${pad(20)}
  <div class="ctl"><div><label>Модификатор</label>${stepper('am',cs.am,fmod(cs.am))}</div><div><label>Цель: <span id="ttT" style="color:var(--red2)">${cs.tt}</span> <small>(нажми)</small></label>${stepper('tv',cs.tv,cs.tv||'—')}</div></div>
  <div class="result${cls}"><div class="lbl">${isAtk?'Бросок атаки':'Проверка / спасбросок'}</div><div class="tot">${tot??'—'}</div>
   <div class="ex">${a.length?`к20: ${a.slice(0,need).join(cs.adv?' / ':'')}${cs.adv?` → ${cs.adv>0?'больший':'меньший'} ${kept}`:''} ${fmod(cs.am)}`:'введи значение кубика'}${a.length&&a.length<need?' · нужен второй к20':''}</div>
   ${verdict}${kept===20?'<div><span class="flag c">НАТУРАЛЬНАЯ 20</span></div>':kept===1&&a.length>=need?'<div><span class="flag f">НАТУРАЛЬНАЯ 1</span></div>':''}</div>
  ${isAtk&&tot!=null&&a.length>=need&&(kept===20||tot>=cs.tv)?`<button class="btn red" id="toDmg" style="width:100%;justify-content:center">→ Считать урон${kept===20?' (крит ×2)':''}</button>`:''}`;
  bindChips(B,(n,v)=>{cs.adv=+v;cs.a=cs.a.slice(0,cs.adv?2:1);saveC();calcAtk(B)});
  bindPad(B,20,v=>{if(cs.a.length>=need)cs.a=[];cs.a.push(v);saveC();calcAtk(B);logAtk()},()=>{cs.a.pop();saveC();calcAtk(B)},()=>{cs.a=[];saveC();calcAtk(B)});
  bindSteps(B,(k,d)=>{if(k==='am')cs.am+=d;if(k==='tv')cs.tv=Math.max(0,(cs.tv||0)+d);saveC();calcAtk(B)});
  $('#ttT',B).parentElement.onclick=()=>{cs.tt=cs.tt==='КД'?'СЛ':'КД';cs.tv=cs.tt==='КД'?12:13;saveC();calcAtk(B)};
  const td=$('#toDmg',B);if(td)td.onclick=()=>{cs.crit=kept===20;cs.dmg=[];cs.tab='dmg';saveC();$$('#dseg button').forEach(x=>x.classList.toggle('on',x.dataset.t==='dmg'));drawD()}}
function logAtk(){const need=cs.adv?2:1;if(cs.a.length<need)return;const a=cs.a.slice(0,need);const k=cs.adv>0?Math.max(...a):cs.adv<0?Math.min(...a):a[0];const t=k+cs.am;
  pushHist(`${cs.tt==='КД'?'Атака':'Проверка'} против ${cs.tt} ${cs.tv}`,`к20 ${a.join('/')}${cs.adv?(cs.adv>0?' преим.':' помеха'):''} ${fmod(cs.am)} → ${t>=cs.tv||(cs.tt==='КД'&&k===20)?(k===20?'КРИТ':'успех'):'провал'}`,t);$('#hist').innerHTML=histHtml()}
/* damage */
function calcDmg(B){const L=cs.dmg;const dsum=sum(L.map(x=>x.v));const mult=cs.crit?2:1;let tot=dsum*mult+cs.dm;tot=Math.max(0,tot);
  const fin=cs.rv===1?Math.floor(tot/2):cs.rv===2?tot*2:tot;
  const cnt={};L.forEach(x=>cnt[x.d]=(cnt[x.d]||0)+1);
  B.innerHTML=`<div class="dice">${[4,6,8,10,12,20,100].map(d=>dieBtn(d,cs.dd===d,cnt[d]?`<span class="cnt">${cnt[d]}</span>`:'')).join('')}
   <button class="die${cs.crit?' on':''}" id="critT" style="${cs.crit?'border-color:#ffcf5a':''}"><svg viewBox="0 0 100 100"><path class="f" d="M50 6l11 30 32 2-25 20 9 31-27-18-27 18 9-31L7 38l32-2z"/></svg><b>Крит ×2</b></button></div>
  <div class="tray">${L.length?L.map((x,i)=>`<span class="tk${x.v===x.d?' n20':''}" data-i="${i}"><small>к${x.d}</small>${x.v}</span>`).join(''):`<span class="ph2">Выбери кубик и введи, что выпало</span>`}</div>
  ${pad(cs.dd)}
  <div class="ctl"><div><label>Модификатор</label>${stepper('dm',cs.dm,fmod(cs.dm))}</div><div><label>Цель</label><div class="chips" data-chips="rv" style="margin:0;padding:2px 0">${[['0','обычн.'],['1','сопр. ½'],['2','уязв. ×2']].map(([v,l])=>`<button class="chip${cs.rv==v?' on':''}" data-v="${v}" style="padding:5px 8px;font-size:11.5px">${l}</button>`).join('')}</div></div></div>
  <div class="result${cs.crit?' crit':''}"><div class="lbl">Итоговый урон</div><div class="tot">${L.length||cs.dm?fin:'—'}</div>
   <div class="ex">${L.length?`кубики ${L.map(x=>x.v).join(' + ')} = ${dsum}${cs.crit?' × 2 (крит) = '+dsum*2:''} ${fmod(cs.dm)}${cs.rv===1?' → сопротивление ½':cs.rv===2?' → уязвимость ×2':''}`:'нажимай значения — они суммируются'}</div>
   ${cs.crit?'<div><span class="flag c">КРИТИЧЕСКОЕ ПОПАДАНИЕ — кости урона удвоены</span></div>':''}</div>
  <div class="row"><button class="btn grow" id="dLog" style="justify-content:center">Записать в журнал</button><button class="btn dark" id="dNew">Новый расчёт</button></div>`;
  $$('.die[data-d]',B).forEach(b=>b.onclick=()=>{cs.dd=+b.dataset.d;saveC();calcDmg(B)});
  $('#critT',B).onclick=()=>{cs.crit=!cs.crit;saveC();calcDmg(B)};
  bindPad(B,cs.dd,v=>{cs.dmg.push({d:cs.dd,v});saveC();calcDmg(B)},()=>{cs.dmg.pop();saveC();calcDmg(B)},()=>{cs.dmg=[];saveC();calcDmg(B)});
  $$('.tray .tk',B).forEach(t=>t.onclick=()=>{cs.dmg.splice(+t.dataset.i,1);saveC();calcDmg(B)});
  bindSteps(B,(k,d)=>{cs.dm+=d;saveC();calcDmg(B)});
  bindChips(B,(n,v)=>{cs.rv=+v;saveC();calcDmg(B)});
  $('#dNew',B).onclick=()=>{cs.dmg=[];cs.crit=false;cs.rv=0;saveC();calcDmg(B)};
  $('#dLog',B).onclick=()=>{if(!L.length)return toast('Сначала введи кубики');const g=Object.entries(cnt).map(([d,n])=>n+'к'+d).join('+');pushHist(`Урон ${g}${cs.dm?fmod(cs.dm):''}${cs.crit?' КРИТ':''}`,`[${L.map(x=>x.v).join(', ')}]${cs.crit?' ×2':''}${cs.rv===1?' ½':cs.rv===2?' ×2 уязв.':''}`,fin);$('#hist').innerHTML=histHtml();toast('Записано: '+fin)}}
/* virtual roll */
function virt(B){B.innerHTML=`<div class="dice">${[4,6,8,10,12,20,100].map(d=>dieBtn(d,dState.d===d)).join('')}</div>
  <div class="ctl"><div><label>Количество</label>${stepper('n',dState.n)}</div><div><label>Модификатор</label>${stepper('m',dState.m,fmod(dState.m))}</div></div>
  ${chips('adv',[['0','Обычный'],['1','Преимущество'],['-1','Помеха']],dState.adv)}
  <div class="roll-stage" id="stage"><img class="ring" src="${window.KM_PLAYER?'../':''}img/runecircle.webp" alt=""><div class="res" id="res">?</div><div class="exp" id="exp">жми «Бросить»</div></div>
  <button class="btn red" id="roll" style="width:100%;justify-content:center;font-size:17px;padding:14px">Бросить ${dState.n}к${dState.d}${dState.m?fmod(dState.m):''}</button>`;
  $$('.die[data-d]',B).forEach(b=>b.onclick=()=>{dState.d=+b.dataset.d;LS.set('dstate',dState);virt(B)});
  bindSteps(B,(k,d)=>{if(k==='n')dState.n=Math.min(20,Math.max(1,dState.n+d));else dState.m+=d;LS.set('dstate',dState);virt(B)});
  bindChips(B,(n,v)=>{dState.adv=+v;LS.set('dstate',dState);virt(B)});$('#roll',B).onclick=doRoll}
function doRoll(){const{d,n,m,adv}=dState;let rolls=[],total,exp,crit='';
  const one=()=>{const a=[];for(let i=0;i<n;i++)a.push(rnd(d));return a};
  if(adv&&d===20){const a=one(),b=one();const sa=sum(a),sb=sum(b);const pick=adv>0?(sa>=sb?a:b):(sa<=sb?a:b);rolls=pick;exp=`[${a.join('+')}] / [${b.join('+')}] ${adv>0?'преим.':'помеха'}`}else{rolls=one();exp=`[${rolls.join(', ')}]`}
  total=sum(rolls)+m;if(m)exp+=' '+fmod(m);
  if(d===20&&n===1){if(rolls[0]===20)crit='crit';if(rolls[0]===1)crit='fail'}
  const st=$('#stage'),res=$('#res');st.classList.remove('rolling');void st.offsetWidth;st.classList.add('rolling');res.className='res';
  let k=0;const iv=setInterval(()=>{res.textContent=rnd(d*n)+m;if(++k>8){clearInterval(iv);res.textContent=total;res.className='res '+crit;$('#exp').textContent=exp+(crit==='crit'?' — КРИТ!':crit==='fail'?' — провал…':'')}},55);
  pushHist(`Бросок ${n}к${d}${m?fmod(m):''}${adv&&d===20?(adv>0?' ⬆':' ⬇'):''}`,exp,total);setTimeout(()=>{$('#hist').innerHTML=histHtml()},560)}

/* ---------- NOTES ---------- */
const TAGS=['Заметка','Сцена','Тайна','НИП','Место','Квест'];
function rNotes(){const L=notes.filter(n=>!S.noteTag||n.tag===S.noteTag).sort((a,b)=>b.t-a.t);
  page.innerHTML=header('Заметки','сюжет, сцены и тайны','star',2)+`<div class="row"><button class="btn red" id="nNew">＋ Запись</button></div>`+chips('tag',[['','Все'],...TAGS.map(t=>[t,t])],S.noteTag)+
  `<div class="list" id="nList">${L.map(n=>`<div class="card note${n.tag==='Тайна'?' secret':''}" data-id="${n.id}"><div class="ntag">${n.tag==='Тайна'?'🜏 ':''}${esc(n.tag)}</div><div class="t">${esc(n.title)}</div><div class="m">${esc(n.text)}</div></div>`).join('')||'<div class="empty">Страницы пусты. Начни летопись.</div>'}</div>`;
  page.oninput=null;bindChips(page,(k,v)=>{S.noteTag=v;rNotes()});$('#nNew').onclick=()=>editNote();$('#nList').onclick=e=>{const c=e.target.closest('.card');if(c)editNote(notes.find(n=>n.id===c.dataset.id))}}
function editNote(n){const isNew=!n;n=n||{id:uid(),tag:S.noteTag||'Заметка',title:'',text:'',t:Date.now()};
  openSheet(`<div class="sb-title">${isNew?'Новая запись':'Запись'}</div><div class="sb-sub">Текст сохраняется автоматически</div>${chips('ntag',TAGS.map(t=>[t,t]),n.tag)}
  <label class="f">Заголовок</label><input class="inp" id="nt" value="${esc(n.title)}" placeholder="Сцена в склепе">
  <label class="f">Текст</label><textarea class="inp" id="nx" style="min-height:42vh">${esc(n.text)}</textarea>
  <div class="row" style="margin-top:14px"><button class="btn red" id="ns">Сохранить запись</button>${isNew?'':'<button class="btn dark" id="nd">Удалить</button>'}</div><button class="btn sm" id="nshow" data-noshow style="margin-top:10px">📣 Показать игрокам</button>`,r=>{let tag=n.tag;
   const nsb=r.querySelector('#nshow');if(nsb)nsb.onclick=()=>{const t=r.querySelector('#nt').value.trim(),x=r.querySelector('#nx').value.trim();if(!t&&!x){toast('Запись пуста');return}KM.showPlayers({i:'📜',n:(t||'Запись').slice(0,80),t:x.slice(0,2500)})};bindChips(r,(k,v)=>{tag=v;$$('[data-chips=ntag] .chip',r).forEach(c=>c.classList.toggle('on',c.dataset.v===v))});
   $('#ns',r).onclick=()=>{n.title=$('#nt',r).value||'Без названия';n.text=$('#nx',r).value;n.tag=tag;n.t=Date.now();if(isNew)notes.unshift(n);save();closeSheet();rNotes()};
   if(!isNew)$('#nd',r).onclick=()=>{const old=notes.slice();notes=notes.filter(x=>x.id!==n.id);save();closeSheet();rNotes();KM.undoToast('Запись удалена',()=>{notes=old;save();rNotes()})}})}

/* ---------- RULES ---------- */
const RULES=window.RULES_KM=[
['Структура хода в бою',`<p><span class="tri"></span><b>Начало боя:</b> определите внезапность → расставьте участников → все бросают <b>инициативу</b> (к20 + мод. Ловкости) → ходы по убыванию.</p>
<p><span class="tri"></span><b>В свой ход</b> существо может: <b>переместиться</b> на свою скорость (можно разбить до и после действия), совершить <b>одно действие</b>, <b>одно бонусное действие</b> (если есть умение), и одно бесплатное взаимодействие с предметом (открыть дверь, достать оружие).</p>
<p><span class="tri"></span><b>Реакция</b> — одна за раунд, восстанавливается в начале хода (напр., атака по возможности, заклинание «Щит»).</p>
<p><b>Действия:</b> Атака, Сотворение заклинания, Рывок (удвоить перемещение), Отход (без атак по возможности), Уклонение (атаки по вам с помехой), Помощь (союзнику преимущество), Засада (спрятаться), Подготовка, Поиск, Использование предмета.</p>
<p><b>Атака:</b> к20 + модификатор + бонус мастерства ≥ КД цели → попадание. 20 на кости — <b>критическое попадание</b> (кости урона бросаются дважды). 1 — всегда промах.</p>
<p><b>Атака по возможности:</b> когда враг покидает вашу досягаемость, можно реакцией совершить одну рукопашную атаку.</p>`],
['Сложность проверок (Сл)',`<table class="dc"><tr><td>5</td><td>Очень лёгкая — залезть на невысокий забор</td></tr><tr><td>10</td><td>Лёгкая — выбить хлипкую дверь</td></tr><tr><td>15</td><td>Средняя — вскрыть обычный замок</td></tr><tr><td>20</td><td>Сложная — переплыть бурную реку</td></tr><tr><td>25</td><td>Очень сложная — уговорить короля</td></tr><tr><td>30</td><td>Почти невозможная — легендарный подвиг</td></tr></table>
<p class="hand" style="font-size:18px">Совет: если провал неинтересен — не проси бросок, просто дай успех.</p>`],
['Преимущество и помеха',`<p><b>Преимущество:</b> бросьте 2к20 и возьмите <b>больший</b>. <b>Помеха:</b> 2к20, возьмите <b>меньший</b>.</p><p>Несколько источников не складываются. Если есть и то, и другое — они отменяют друг друга (бросается один к20).</p>
<p><b>Типичные причины преимущества:</b> атакующий невидим/спрятан; цель ослеплена, опутана, парализована, ошеломлена, без сознания; цель лежит ничком и атакуют в упор; помощь союзника.</p>
<p><b>Помеха:</b> дальнобойная атака, когда враг рядом; атака на дальней дистанции; атакующий отравлен, испуган (видя источник), опутан, ослеплён; цель лежит ничком, а атака дальнобойная.</p>`],
['Состояния',''],
['Отдых',`<p><b>Короткий отдых</b> — не менее 1 часа. Можно потратить Кости хитов: за каждую бросьте кость + мод. Телосложения и восстановите столько хитов. Некоторые умения восстанавливаются (Второе дыхание воина, ячейки колдуна).</p>
<p><b>Продолжительный отдых</b> — 8 часов (не менее 6 сна). Восстанавливаются все хиты и половина потраченных Костей хитов (минимум 1), ячейки заклинаний; снимается 1 степень истощения. Не чаще 1 раза в 24 часа, нужен хотя бы 1 хит в начале.</p>`],
['Укрытие',`<table class="dc"><tr><td>½ / ¾</td><td><b>Укрытие:</b> цель за укрытием — у атакующего <b>помеха</b>. Фланга нет.</td></tr><tr><td>✕</td><td><b>Полное укрытие:</b> нельзя стать прямой целью атаки или заклинания</td></tr></table>`],
['Спасброски от смерти',`<p>Когда хиты персонажа падают до <b>0</b>, он без сознания. В начале каждого своего хода он бросает к20 (без модификаторов):</p>
<p><span class="tri"></span><b>10+</b> — успех, <b>9 и ниже</b> — провал. <b>3 успеха</b> — стабилизирован; <b>3 провала</b> — смерть.</p>
<p><span class="tri"></span><b>Натуральная 20</b> — встаёт с 1 хитом. <b>Натуральная 1</b> — два провала.</p>
<p><span class="tri"></span>Урон по существу с 0 хитов — один провал (крит — два). Мгновенной смерти от массивного урона нет — на 0 хитов всегда спасброски от смерти.</p>
<p><span class="tri"></span>Любое лечение возвращает в сознание. Проверка Мудрости (Медицина) Сл 10 или «Уход за умирающим» стабилизирует.</p>`],
['Советы новому Мастеру',`<p><span class="tri"></span>Описывай сцену тремя чувствами и спрашивай: «Что вы делаете?»</p><p><span class="tri"></span>Говори «Да, и…» или «Да, но…» вместо «Нет».</p><p><span class="tri"></span>Дай каждому игроку момент славы за сессию.</p><p><span class="tri"></span>Для 3 героев 1-го уровня хороший бой — 3–4 гоблина, 2 волка или 4–5 скелетов/зомби. Сильный бой — багбир + 2 гоблина.</p><p><span class="tri"></span>Не знаешь правило — прими решение сейчас, проверь после игры.</p>`]];
const CONDR=[['Ослеплённый','Ничего не видит, проваливает проверки, требующие зрения. Атаки по нему — с преимуществом, его атаки — с помехой.'],['Очарованный','Не может атаковать очаровавшего или делать его целью вредящих эффектов. Очаровавший совершает с преимуществом проверки взаимодействия с ним.'],['Оглохший','Ничего не слышит, проваливает проверки, требующие слуха.'],['Испуганный','Помеха на проверки и атаки, пока видит источник страха. Не может добровольно приблизиться к нему.'],['Схваченный','Скорость 0. Оканчивается, если схвативший недееспособен или цель вытолкнута из досягаемости.'],['Недееспособный','Не может совершать действия и реакции.'],['Невидимый','Его нельзя увидеть без магии. Атаки по нему — с помехой, его атаки — с преимуществом.'],['Парализованный','Недееспособен, не двигается и не говорит. Проваливает спасброски Силы и Ловкости. Атаки по нему с преимуществом; попадание в пределах 1,5 м — критическое.'],['Окаменел','Превращён в камень: недееспособен, сопротивление всему урону, иммунитет к яду и болезням.'],['Отравленный','Помеха на броски атаки и проверки характеристик.'],['Лежащий ничком','Может только ползти или встать (половина скорости). Его атаки с помехой. Атаки по нему в пределах 1,5 м — с преимуществом, издалека — с помехой.'],['Опутанный','Скорость 0. Атаки по нему с преимуществом, его атаки с помехой. Помеха на спасброски Ловкости.'],['Ошеломлённый','Недееспособен, не двигается, говорит запинаясь. Проваливает спасброски Силы и Ловкости. Атаки по нему с преимуществом.'],['Без сознания','Недееспособен, не двигается, роняет всё, падает ничком. Проваливает спасброски Силы и Ловкости. Атаки по нему с преимуществом; попадание в пределах 1,5 м — критическое.'],['Истощение','6 степеней: 1 — помеха на проверки; 2 — скорость вдвое; 3 — помеха на атаки и спасброски; 4 — максимум хитов вдвое; 5 — скорость 0; 6 — смерть. Продолжительный отдых снимает 1 степень.']];
RULES[3][1]=CONDR.map(c=>`<p><span class="tri"></span><b>${c[0]}.</b> ${c[1]}</p>`).join('');
const RCAT=[['','Все'],['ess','⚔ Нужное в игре'],['fight','Бой'],['chk','Проверки'],['world','Мир и отдых'],['book','Своды правил']];
const RC_F=new Set(['turn','actions','opp','cover','grapple','twf','death','conc','cond','zones']),RC_C=new Set(['dc','adv','mods','skills','dice','stealth']);
function rcat(id){return RC_F.has(id)?'fight':RC_C.has(id)?'chk':'world'}
function rulesApply(){const f=LS.get('rulesF','');const E=window.SCREEN_ESS||new Set();$$('#page [data-rc]').forEach(d=>{const id=(d.closest('[data-scr]')||d).dataset.scr;const ok=!f||(f==='ess'?d.classList.contains('scr-c')&&E.has(d.dataset.id):d.dataset.rc===f);d.style.display=ok?'':'none'});$$('#page .dropcap').forEach(p=>p.style.display=f&&f!=='book'?'none':'')}
function rRules(){page.oninput=null;page.innerHTML=header('Ширма Мастера','все справки под рукой · поиск в одно касание','tri',3)+`<button class="btn scr-big" onclick="openScreen('')">🔍 Поиск по правилам, чарам, монстрам</button>`+chips('rcat',RCAT.map(c=>[c[0],c[1]]),LS.get('rulesF',''))+(window.SCREEN||[]).map(c=>`<details class="rule scr-c" data-rc="${rcat(c[0])}" data-id="${c[0]}"><summary>${c[1]}</summary><div class="body">${c[3]}</div></details>`).join('')+`<p class="dropcap" style="font-size:16px;line-height:1.45">Здесь собраны правила, к которым ты будешь возвращаться чаще всего. Помни: Мастер — арбитр, а не противник игроков.</p>`+
  RULES.map((r,i)=>`<details class="rule" data-rc="book"${i===0?' open':''}><summary>${r[0]}</summary><div class="body">${r[1]}</div></details>`).join('')+glyphs(2)+`<p class="muted" style="font-size:12px">Источник правил: Справочный документ системы 5.1 «Подземелий и драконов» © «Визардс оф зе Кост», лицензия «Криэйтив Коммонс — с указанием авторства 4.0». Перевод, сокращение и адаптация — «Ширма Мастера».</p>`;rulesApply();bindChips(page,(n,v)=>{if(n==='rcat'){LS.set('rulesF',v);rRules()}})}

/* ---------- render ---------- */
const R=window.KM_PLAYER?[0,1,2,3,4].map(i=>()=>window.PRN&&PRN(i)):[()=>rSession(),()=>rNpc(),()=>rSpells(),()=>rItems(),()=>rCombat(),()=>rDice(),()=>{rPcs();window.KM&&KM.table&&KM.table.panel&&KM.table.panel()},()=>rMap(),()=>rNotes(),()=>rRules()];
function render(){page.oninput=null;const y=page.scrollTop,sec=S.sec,a=document.activeElement,aid=a&&a.id;R[S.sec]();if(sec===render.sec&&y){page.scrollTop=y;requestAnimationFrame(()=>{if(S.sec===sec&&Math.abs(page.scrollTop-y)>2)page.scrollTop=y})}render.sec=sec;if(aid&&aid!==document.activeElement?.id){const n=document.getElementById(aid);if(n&&n.matches('input,textarea')&&n.focus)n.focus({preventScroll:true})}}
window.__boot=()=>{markRib();render()};

/* ---------- cover ---------- */
(function(){const cv=$('#cover');const em=$('.embers',cv);
 const dr=document.createElement('div');dr.className='drips';const ds=document.createElement('div');ds.className='drops drips';
 const X=[4,9,16,23,31,38,47,55,61,69,76,83,90,96];X.forEach((x,i)=>{const e=document.createElement('i');const w=4+Math.random()*7;e.style.cssText=`left:${x+Math.random()*3}%;--w:${w}px;--h:${30+Math.random()*(i%3?90:200)}px;--d:${6+Math.random()*7}s;--dl:${-Math.random()*6}s`;dr.append(e)});
 for(let i=0;i<7;i++){const b=document.createElement('b');b.style.cssText=`left:${8+Math.random()*84}%;top:${10+Math.random()*20}%;--d:${2.5+Math.random()*3}s;--dl:${Math.random()*5}s`;ds.append(b)}
 $('.face',cv).append(dr,ds);for(let i=0;i<18;i++){const e=document.createElement('i');e.style.left=Math.random()*100+'%';e.style.setProperty('--dx',(Math.random()*80-40)+'px');e.style.animationDuration=(5+Math.random()*6)+'s';e.style.animationDelay=(Math.random()*6)+'s';em.append(e)}
 const open=()=>{if(cv.classList.contains('open'))return;cv.classList.add('open');setTimeout(()=>cv.classList.add('gone'),1700)};
 cv.addEventListener('click',open);if(sessionStorage.getItem('kmOpened')){cv.classList.add('gone')}cv.addEventListener('transitionend',()=>sessionStorage.setItem('kmOpened',1))})();
if(!window.KM_PLAYER&&'serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{});{const had=!!navigator.serviceWorker.controller;let rl=0;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had&&!rl){rl=1;try{toast('Обновлено — перезапуск')}catch(e){}setTimeout(()=>location.reload(),900)}});navigator.serviceWorker.ready.then(r=>{const u=()=>r.update().catch(()=>{});document.addEventListener('visibilitychange',()=>{if(!document.hidden)u()});setInterval(u,30*60e3)})}
window.KM={go,showMon,showSpell,showItem,closeSheet,addCombatant,S,get players(){return players}};
;addEventListener('kmpacks',()=>{const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)){try{a.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){}return}if(['spells','items','npc','map'].includes((SECTIONS[S.sec]||[])[0])&&!document.querySelector('#sheet.show,.sheet.show'))try{render()}catch(e){}});

window.KM_ver=()=>caches.keys().then(k=>(k.filter(x=>/^k[mp]-/.test(x)).pop()||'—').replace(/^k[mp]-/,''));

/* фоновой прогрев кэша иллюстраций заклинаний (офлайн), понемногу и только когда есть SW */
setTimeout(()=>{try{if(!window.SPART||!navigator.serviceWorker||!navigator.serviceWorker.controller||(navigator.connection&&navigator.connection.saveData))return;const B=(window.KM_PLAYER?'../':'')+'img/',L=[...[...SPART].map(x=>'spt/'+x),...[...SPART].map(x=>'sp/'+x)],P=B;let i=0;const nx=()=>{if(i>=L.length)return;if(document.hidden)return setTimeout(nx,5000);fetch(P+L[i++]+'.webp').catch(()=>{}).finally(()=>setTimeout(nx,400))};nx()}catch(e){}},25000);

;
/* session.js */
'use strict';
/* ===== STAGE 3: Session home ===== */
const SW_DEF=['party','scene','npcs','log','quests','timer','rest','backup'];
let sess=Object.assign({order:SW_DEF,scene:'Таверна «Пьяный грифон». Дождь барабанит по ставням, у камина шепчутся двое в капюшонах.',npcs:['Трактирщик Хольм'],log:[],quests:[{id:uid(),t:'Найти пропавших детей',st:0},{id:uid(),t:'Разведать старую дорогу',st:0}],day:1,min:8*60,weather:'Моросящий дождь, +9 °C',tStart:null,tAcc:0,cd:0,cdEnd:0,rnd:null,collapsed:{}},LS.get('sess',{}));
SW_DEF.forEach(k=>{if(!sess.order.includes(k))sess.order.push(k)});sess.order=sess.order.filter(k=>SW_DEF.includes(k)||k==='clock');
const saveS=()=>LS.set('sess',sess);
const SW_T={party:'Отряд',init:'Инициатива',dice:'Проверка с живым кубом',scene:'Текущая сцена',npcs:'Активные НИП',log:'Журнал сессии',quests:'Задания',tables:'Случайные таблицы',clock:'Время и погода',timer:'Таймер',rest:'Отдых',backup:'Резервная копия'};
const hhmm=m=>{m=((m%1440)+1440)%1440;return String(m/60|0).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const pick=a=>a[rnd(a.length)-1];
const RT={
 'Имя':()=>pick(['Арен','Велимир','Горислава','Дарина','Ерофей','Зорян','Ивга','Карина','Любомир','Мирослава','Ольгерд','Ратибор','Светозара','Тихомир','Ульяна','Ярополк','Бренна','Кейлет','Торвальд','Мерисса'])+' '+pick(['Тёмный','Пепельный','из Вороньей Пади','Кривая Рука','Сребролист','Медовар','Безродный','Каменобой','Ночная Песнь','Хромой']),
 'Добыча':()=>pick(['кошель с 2к6 зм','серебряный кулон с прядью волос','флакон зелья лечения','ржавый ключ с руной','карта с пометкой «не ходи»','кинжал с костяной рукоятью','молитвенник с вырванными страницами','3 самоцвета по 10 зм','письмо с печатью культа','свеча из чёрного воска']),
 'Погода':()=>pick(['Ясно, +18 °C, лёгкий ветер','Туман, видимость 20 м, +7 °C','Проливной дождь, помеха на Восприятие (слух), +11 °C','Гроза, молнии, +14 °C','Снегопад, труднопроходимая местность, −4 °C','Пронизывающий ветер, −1 °C','Душно, жара +31 °C — спасброски Тел каждый час в доспехах','Кровавый закат, +12 °C, вороньё кружит']),
 'Встреча':()=>pick(['1к4 гоблина устроили засаду','голодный волк идёт по следу','бродячий торговец со странным товаром','стражи требуют пошлину 5 зм','раненый паломник просит помощи','2 скелета охраняют разрушенную часовню','рой летучих мышей из пещеры','культист тайно оставляет знак на дереве','медведь у реки','странствующий бард, знающий слухи']),
 'Слух':()=>pick(['В старой шахте снова горит свет','Мельник продал душу за урожай','Лорд прячет в подвале чудовище','На кладбище копают по ночам','В лесу видели всадника без головы','Ведьма с болот ищет наследника'])};
function rSession(){page.oninput=null;page.onclick=null;
 page.innerHTML=header('Сессия','стол мастера — всё под рукой','eye',0)+`<div class="sw-list">${sess.order.map(k=>`<section class="sw${sess.collapsed[k]?' col':''}" data-w="${k}"><header><b>${SW_T[k]}</b><span class="sw-ctl"><button data-mv="-1" aria-label="Выше">▲</button><button data-mv="1" aria-label="Ниже">▼</button><button data-col aria-label="Свернуть">${sess.collapsed[k]?'▸':'▾'}</button></span></header><div class="sw-b">${sess.collapsed[k]?'':W[k]()}</div></section>`).join('')}</div>`;
 page.onclick=sessClick;page.oninput=sessInput;page.onchange=sessChange;
 if(!sess.collapsed.scene)miniMap();tickTimer()}
const W={
 party:()=>players.map((p,i)=>`<div class="pty" data-p="${i}"><div class="pty-a">${p.photo?`<img src="${p.photo}" alt="">`:esc((p.name||'?')[0])}</div><div class="pty-m"><div class="pty-n">${esc(p.name)} <small>${esc(p.cls)} ${p.lvl||1} ур.</small></div>
  <div class="hpbar big"><i style="width:${Math.max(0,Math.min(100,p.hp/p.maxhp*100))}%"></i>${p.temp?`<em style="width:${Math.min(100,p.temp/p.maxhp*100)}%"></em>`:''}<span>${p.hp}/${p.maxhp}${p.temp?' +'+p.temp:''}</span></div>
  <div class="pty-s"><span class="ac">КД ${p.ac}</span>${(p.conds||[]).map(c=>`<span class="cond">${esc(c)}</span>`).join('')}${p.slots?slotPips(p):''}</div></div>
  <div class="pty-q"><button class="rb" data-ph="dmg">−</button><button class="rb" data-ph="heal">+</button></div></div>`).join('')||'<div class="empty">Нет героев</div>',
 scene:()=>`<textarea class="inp" id="sScene" rows="3">${esc(sess.scene)}</textarea><canvas id="miniMap" class="minimap" aria-label="Мини-карта"></canvas><div class="muted" style="font-size:12px">Мини-карта: ${esc(curMap().name)} — нажми, чтобы открыть</div>`,
 npcs:()=>`<div class="row">${sess.npcs.map((n,i)=>`<span class="npc-chip" data-n="${i}">${esc(n)}<button data-rmn="${i}" aria-label="Убрать">×</button></span>`).join('')}</div><div class="row" style="margin-top:6px"><input class="inp grow" id="nAdd" placeholder="Имя НИП, напр. Капитан стражи Вера"><button class="btn sm" data-a="addnpc">＋</button></div>`,
 log:()=>`<div class="row"><input class="inp grow" id="lAdd" placeholder="Что произошло, напр. Лис украл ключ у стражника"><button class="btn sm red" data-a="addlog">Записать</button></div><div class="slog">${sess.log.slice(0,30).map((l,i)=>`<div><time>${esc(l.tm)}</time><span>${esc(l.t)}</span><button data-rml="${i}" aria-label="Удалить">×</button></div>`).join('')||'<div class="muted">Пока тихо…</div>'}</div>`,
 quests:()=>`${sess.quests.map((q,i)=>`<div class="qst${q.st?' done':''}"><button data-qs="${i}" class="qbox" aria-label="Отметить">${q.st?'✓':''}</button><span>${esc(q.t)}</span><button data-rmq="${i}" aria-label="Удалить">×</button></div>`).join('')}<div class="row" style="margin-top:6px"><input class="inp grow" id="qAdd" placeholder="Задание, напр. Доставить письмо в Вороний Брод"><button class="btn sm" data-a="addq">＋</button></div>`,
 clock:()=>`<div class="clock"><div><b>${KM.cal?KM.cal.short():"День "+sess.day}</b><span>${hhmm(sess.min)} · ${sess.min%1440<300||sess.min%1440>=1260?'ночь 🌙':sess.min%1440<720?'утро ☀':'день ☀'}</span></div><div class="row">${[[10,'+10 мин'],[60,'+1 ч'],[480,'+8 ч'],[1440,'+1 день']].map(([v,l])=>`<button class="btn sm" data-tm="${v}">${l}</button>`).join('')}</div></div><div class="row" style="margin-top:6px"><span>🌦 ${esc(sess.weather)}</span><button class="btn sm" data-a="wx" style="margin-left:auto">Новая погода</button></div>`,
 timer:()=>`<div class="tmr"><div><small>Сессия идёт</small><b id="tSess">0:00:00</b><button class="btn sm" data-a="tss">${sess.tStart?'⏸ Пауза':(sess.tAcc?'▶ Продолжить':'▶ Старт')}</button>${sess.tStart||sess.tAcc?'<button class="btn sm" data-a="tsr">↺ Сброс</button>':''}<button class="btn sm red" data-a="nsess" style="margin-top:6px">✦ Новая сессия</button></div><div><small>Обратный отсчёт</small><b id="tCd">${sess.cdEnd?'':'—'}</b><div class="row">${[1,5,10].map(m=>`<button class="btn sm" data-cd="${m}">${m} мин</button>`).join('')}</div></div></div>`,
 rest:()=>`<div class="row"><button class="btn" data-a="short">☕ Короткий отдых</button><button class="btn" data-stl>🥷 Скрытность: каждый бросает</button><button class="btn red" data-a="long">🌙 Продолжительный отдых</button></div><div class="muted" style="font-size:12.5px;margin-top:6px">Продолжительный: все хиты, ячейки заклинаний и половина костей хитов, −1 истощение, +8 ч. Короткий: +1 ч, восстановление ячеек колдуна.</div>`,
 backup:()=>`<div class="row"><button class="btn" data-a="exp">⬇ Экспорт всех данных</button><label class="btn">⬆ Импорт<input type="file" id="impF" accept="application/json" hidden></label></div><div class="muted" style="font-size:12.5px;margin-top:6px">Всё хранится только на этом устройстве. Делай копию перед обновлением телефона.</div>`};
function slotPips(p){return Object.entries(p.slots||{}).filter(([l,s])=>s.max).map(([l,s])=>`<span class="pips" title="Ячейки ${l} круга"><small>${l}</small>${'<i class=on></i>'.repeat(s.max-s.used)}${'<i></i>'.repeat(s.used)}</span>`).join('')}
function logS(t){const d=new Date();sess.log.unshift({t,tm:`Д${sess.day} ${hhmm(sess.min)} · ${d.toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'})}`});saveS()}
function reW(k){const s=$(`.sw[data-w="${k}"] .sw-b`);if(s&&!sess.collapsed[k]){s.innerHTML=W[k]();if(k==='scene')miniMap()}}
function partyHp(p,a){openSheet(`<div class="sb-title">${a==='dmg'?'Урон':'Лечение'} — ${esc(p.name)}</div><div class="sb-sub">хиты ${p.hp}/${p.maxhp}${p.temp?', временные '+p.temp:''}</div><input class="inp" id="phv" type="number" inputmode="numeric" placeholder="сколько? напр. 7" style="font-size:34px;text-align:center;margin:14px 0"><div class="row" style="justify-content:center">${[1,2,3,4,5,6,8,10,12].map(n=>`<button class="btn sm" data-n="${n}">${n}</button>`).join('')}</div>
 <div class="row" style="margin-top:12px"><button class="btn red grow" id="phok">${a==='dmg'?'Нанести':'Исцелить'}</button>${a==='heal'?'<button class="btn" id="phtmp">Временные хиты</button>':''}</div>`,r=>{const i=$('#phv',r);setTimeout(()=>i.focus(),300);
 const ap=(n,tmp)=>{n=Math.abs(+n||0);if(!n)return;if(tmp){p.temp=Math.max(p.temp||0,n)}else if(a==='dmg'){const t=Math.min(p.temp||0,n);p.temp=(p.temp||0)-t;p.hp=Math.max(0,p.hp-(n-t));if(p.hp===0)toast(p.name+' без сознания — спасброски от смерти!')}else p.hp=Math.min(p.maxhp,p.hp+n);
  const c=combat.list.find(c=>c.pc&&c.base===p.name);if(c)c.hp=p.hp;save();logS(`${p.name}: ${tmp?'временные хиты '+n:a==='dmg'?'урон '+n:'лечение '+n} → ${p.hp}/${p.maxhp}`);closeSheet();reW('party');reW('log')};
 $$('[data-n]',r).forEach(b=>b.onclick=()=>ap(b.dataset.n));$('#phok',r).onclick=()=>ap(i.value);const t=$('#phtmp',r);if(t)t.onclick=()=>ap(i.value,1)})}
function sessClick(e){const t=e.target,sw=t.closest('.sw');if(!sw)return;const k=sw.dataset.w;
 if(t.closest('[data-mv]')){const i=sess.order.indexOf(k),j=i+ +t.closest('[data-mv]').dataset.mv;if(j<0||j>=sess.order.length)return;[sess.order[i],sess.order[j]]=[sess.order[j],sess.order[i]];saveS();const o=sw,n=j>i?sw.nextElementSibling:sw.previousElementSibling;j>i?n.after(o):n.before(o);o.animate([{transform:`translateY(${j>i?-30:30}px)`},{transform:'none'}],{duration:350,easing:'cubic-bezier(.34,1.56,.64,1)'});return}
 if(t.closest('[data-col]')){sess.collapsed[k]=!sess.collapsed[k];saveS();rSession();return}
 const ph=t.closest('[data-ph]');if(ph)return partyHp(players[+t.closest('.pty').dataset.p],ph.dataset.ph);
 if(t.closest('.pty-a,.pty-n'))return go(SECTIONS.findIndex(x=>x[0]==='pcs'));
 if(t.closest('#miniMap'))return go(SECTIONS.findIndex(x=>x[0]==='map'));
 const tm=t.closest('[data-tm]');if(tm){adv(+tm.dataset.tm);return}
 const cd=t.closest('[data-cd]');if(cd){sess.cdEnd=Date.now()+cd.dataset.cd*60000;saveS();toast('Отсчёт: '+cd.dataset.cd+' мин');return}
 const rm=t.closest('[data-rmn],[data-rml],[data-rmq]');if(rm){const [arr,key,w]=rm.dataset.rmn!=null?['npcs','rmn','npcs']:rm.dataset.rml!=null?['log','rml','log']:['quests','rmq','quests'];const idx=+rm.dataset[key==='rmn'?'rmn':key==='rml'?'rml':'rmq'];const del=sess[arr].splice(idx,1)[0];saveS();reW(w);undoToast('Удалено',()=>{sess[arr].splice(idx,0,del);saveS();reW(w)});return}
 const qs=t.closest('[data-qs]');if(qs){const q=sess.quests[+qs.dataset.qs];q.st=q.st?0:1;saveS();if(q.st)logS('Задание выполнено: '+q.t);reW('quests');return}
 const a=t.closest('[data-a]')?.dataset.a;if(!a)return;const v=id=>$('#'+id).value.trim();
 if(a==='addnpc'&&v('nAdd')){sess.npcs.push(v('nAdd'));saveS();reW('npcs')}
 if(a==='addlog'&&v('lAdd')){logS(v('lAdd'));reW('log')}
 if(a==='addq'&&v('qAdd')){sess.quests.push({id:uid(),t:v('qAdd'),st:0});saveS();reW('quests')}
 if(a==='wx'){sess.weather=RT['Погода']();saveS();reW('clock')}
 if(a==='nsess'){newSession();return}if(a==='tsr'){if(!confirm('Сбросить таймер сессии на 0:00:00?'))return;const b={s:sess.tStart,a:sess.tAcc};sess.tStart=null;sess.tAcc=0;saveS();reW('timer');undoToast('Таймер сброшен',()=>{sess.tStart=b.s;sess.tAcc=b.a;saveS();reW('timer')});return}if(a==='tss'){if(sess.tStart){sess.tAcc+=Date.now()-sess.tStart;sess.tStart=null}else sess.tStart=Date.now();saveS();reW('timer')}
 if(a==='short'){adv(60);const L=[];players.forEach(p=>{KM.uses&&KM.uses.onRest(p,'s');if(p.slots&&/Колдун/i.test(p.cls))Object.values(p.slots).forEach(s=>s.used=0);if(KM.autoHD)L.push(KM.autoHD(p))});save();logS('Короткий отдых (1 ч)'+(L.length?': '+L.join('; '):''));rSession();toast('Короткий отдых'+(L.length?': '+L.join('; '):''))}
 if(a==='long'){adv(480);players.forEach(p=>{p.hp=p.maxhp;p.temp=0;if(p.slots)Object.values(p.slots).forEach(s=>s.used=0);p.exh=Math.max(0,(p.exh||0)-1);p.hdUsed=Math.max(0,(p.hdUsed||0)-Math.max(1,Math.floor((p.lvl||1)/2)))});save();logS('Продолжительный отдых (8 ч)');rSession();toast('Отряд отдохнул: хиты и ячейки восстановлены')}
 if(a==='exp')exportAll()}
function sessInput(e){const t=e.target;if(t.id==='sScene'){sess.scene=t.value;saveS()}
}
function sessChange(e){if(e.target.id==='impF'&&e.target.files[0]){const fr=new FileReader();fr.onload=()=>{try{const o=JSON.parse(fr.result);if(!o.km)throw 0;if(!confirm('Заменить все данные на этом устройстве данными из файла?'))return;Object.keys(localStorage).filter(k=>k.startsWith('km.')).forEach(k=>localStorage.removeItem(k));Object.entries(o.km).forEach(([k,v])=>localStorage.setItem(k,v));toast('Данные восстановлены');setTimeout(()=>location.reload(),700)}catch(_){toast('Файл не похож на копию «Ширмы Мастера»')}};fr.readAsText(e.target.files[0])}}
function exportAll(){const km={};Object.keys(localStorage).filter(k=>k.startsWith('km.')).forEach(k=>km[k]=localStorage.getItem(k));const b=new Blob([JSON.stringify({app:'Книга Мастера',v:1,date:new Date().toISOString(),km})],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='kniga-mastera-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();toast('Копия сохранена в Файлы')}
function adv(m){sess.min+=m;while(sess.min>=1440){sess.min-=1440;sess.day++}saveS();reW('clock')}
function undoToast(msg,undo){const e=$('#toast');e.innerHTML=`${esc(msg)} <button class="undo">Вернуть</button>`;e.classList.add('on');e.style.pointerEvents='auto';$('.undo',e).onclick=()=>{undo();e.classList.remove('on');e.style.pointerEvents=''};clearTimeout(e._t);e._t=setTimeout(()=>{e.classList.remove('on');e.style.pointerEvents=''},5000)}
let mmC=null,mmK='';function miniMap(){const c=$('#miniMap');if(!c||typeof drawMap!=='function')return;const run=()=>{if(!c.isConnected)return;const m=curMap();if(!m)return;const w=c.clientWidth||340,h=150,d=2;const k=[m.id,m.rev||0,w,(m.fog||[]).join(''),JSON.stringify((m.tok||[]).map(t=>[t.x,t.y,t.hp,t.dead,t.hid])),JSON.stringify(m.dec||[]).length,m.style,m.light].join('|');c.width=w*d;c.height=h*d;const g=c.getContext('2d');
 if(k!==mmK||!mmC){mmK=k;mmC=document.createElement('canvas');mmC.width=w*d;mmC.height=h*d;const g2=mmC.getContext('2d');const s=Math.min(w/(m.W*32),h/(m.H*32));g2.setTransform(d*s,0,0,d*s,(w-m.W*32*s)/2*d,(h-m.H*32*s)/2*d);drawMap(g2,m,8*4,.55)}g.drawImage(mmC,0,0)};
 if(!mmC&&window.requestIdleCallback)requestIdleCallback(run,{timeout:1200});else run()}
let tmrI;function tickTimer(){clearInterval(tmrI);tmrI=setInterval(()=>{const a=$('#tSess');if(!a){clearInterval(tmrI);return}const ms=sess.tAcc+(sess.tStart?Date.now()-sess.tStart:0);const s=ms/1000|0;a.textContent=`${s/3600|0}:${String((s/60|0)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
 const c=$('#tCd');if(c&&sess.cdEnd){const r=Math.max(0,sess.cdEnd-Date.now())/1000|0;c.textContent=`${r/60|0}:${String(r%60).padStart(2,'0')}`;if(!r){sess.cdEnd=0;saveS();toast('⏰ Время вышло!');navigator.vibrate&&navigator.vibrate([200,100,200])}}},500)}
KM.undoToast=undoToast;KM.logS=logS;

/* ===== Новая сессия: сброс прогресса с архивом и «Вернуть» ===== */
const NS_OPT=[['timer','Таймер сессии и обратный отсчёт',1],['log','Журнал сессии',1],['combat','Бой и инициатива (герои остаются)',1],['rnd','Результаты случайных таблиц',1],['rolls','История бросков',1],['scene','Текущая сцена',0],['npcs','Активные НИП',0],['shows','«Показано игрокам»',0],['done','Выполненные задания',0]];
function newSession(){const arch=LS.get('sessArch',[]);const dur=(sess.tAcc||0)+(sess.tStart?Date.now()-sess.tStart:0);const fm=ms=>{const m=Math.round(ms/60000);return m>=60?(m/60|0)+' ч '+m%60+' мин':m+' мин'};
 openSheet(`<div class="sb-title" data-noshow>Новая сессия</div><div class="sb-sub">Герои, их хиты, инвентарь, записи и карты сохранятся. Отметьте, что начать заново.</div>
 <div class="card" style="margin:8px 0"><b>Текущая сессия</b><div class="m">Длительность: ${fm(dur)} · записей в журнале: ${(sess.log||[]).length} · в бою: ${(combat.list||[]).length}</div></div>
 <div class="ns-list">${NS_OPT.map(([k,t,on])=>`<label class="ns-r" style="display:flex;gap:10px;align-items:center;padding:10px 4px;min-height:44px;border-bottom:1px solid rgba(196,161,90,.15)"><input type="checkbox" data-ns="${k}" ${on?'checked':''} style="width:22px;height:22px"><span>${t}</span></label>`).join('')}</div>
 <label class="ns-r" style="display:flex;gap:10px;align-items:center;padding:10px 4px;min-height:44px"><input type="checkbox" id="nsArch" checked style="width:22px;height:22px"><span>Сохранить итоги в архив сессий</span></label>
 <div class="row" style="margin-top:12px"><button class="btn red grow" id="nsGo">Начать новую сессию</button></div>
 ${arch.length?`<details style="margin-top:14px"><summary>Архив сессий (${arch.length})</summary>${arch.map((x,i)=>`<button class="card" data-arch="${i}" style="width:100%;text-align:left;margin-top:6px"><b>${esc(x.n)}</b><div class="m">${new Date(x.ts).toLocaleDateString('ru-RU')} · ${fm(x.dur)} · журнал: ${x.log.length}</div></button>`).join('')}</details>`:''}`,r=>{
  r.querySelectorAll('[data-arch]').forEach(b=>b.onclick=()=>{const x=arch[+b.dataset.arch];openSheet(`<div class="sb-title" data-noshow>${esc(x.n)}</div><div class="sb-sub">${new Date(x.ts).toLocaleString('ru-RU')} · ${fm(x.dur)}</div>${x.scene?`<p><b>Сцена:</b> ${esc(x.scene)}</p>`:''}${(x.npcs||[]).length?`<p><b>НИП:</b> ${x.npcs.map(esc).join(', ')}</p>`:''}<div class="desc">${x.log.map(l=>`<div style="padding:4px 0;border-bottom:1px solid rgba(196,161,90,.12)">${esc(typeof l==='string'?l:(l.t||l.txt||JSON.stringify(l)))}</div>`).join('')||'<span class="m">Журнал пуст</span>'}</div><button class="btn" id="arB" style="margin-top:10px">← Новая сессия</button>`,r2=>{r2.querySelector('#arB').onclick=newSession})});
  r.querySelector('#nsGo').onclick=()=>{const sel={};r.querySelectorAll('[data-ns]').forEach(c=>sel[c.dataset.ns]=c.checked);if(!Object.values(sel).some(Boolean)){toast('Ничего не отмечено');return}
   if(!confirm('Начать новую сессию? Отмеченное будет сброшено (можно вернуть).'))return;
   const snap={sess:JSON.parse(JSON.stringify(sess)),combat:JSON.parse(JSON.stringify(combat)),rolls:rollHist.slice(),shows:LS.get('shows',[]),arch:LS.get('sessArch',[])};
   if(r.querySelector('#nsArch').checked){const a=LS.get('sessArch',[]);a.unshift({n:'Сессия '+(a.length+1)+(sess.scene?' — '+sess.scene.split(/[.!]/)[0].slice(0,40):''),ts:Date.now(),dur,log:(sess.log||[]).slice(0,200),scene:sess.scene||'',npcs:(sess.npcs||[]).slice(),quests:(sess.quests||[]).map(q=>({t:q.t,done:q.done}))});LS.set('sessArch',a.slice(0,50))}
   if(sel.timer){sess.tStart=null;sess.tAcc=0;sess.cdEnd=null}if(sel.log)sess.log=[];if(sel.rnd)sess.rnd=null;if(sel.scene)sess.scene='';if(sel.npcs)sess.npcs=[];if(sel.done)sess.quests=(sess.quests||[]).filter(q=>!q.done);
   if(sel.combat){combat.list=(combat.list||[]).filter(x=>x.pc||x.hero||x.pid!=null).map(x=>Object.assign(x,{init:x.init!=null?0:x.init}));combat.turn=0;combat.round=1;combat.list=[]}
   if(sel.rolls)rollHist.length=0;if(sel.shows){LS.set('shows',[]);try{KM.table.push(true)}catch(e){}}
   saveS();save();closeSheet();render();
   undoToast('Новая сессия начата',()=>{Object.keys(sess).forEach(k=>delete sess[k]);Object.assign(sess,snap.sess);Object.keys(combat).forEach(k=>delete combat[k]);Object.assign(combat,snap.combat);rollHist.length=0;rollHist.push(...snap.rolls);LS.set('shows',snap.shows);LS.set('sessArch',snap.arch);saveS();save();render();try{KM.table.push(true)}catch(e){}})}})}
KM.newSession=newSession;

document.addEventListener('click',e=>{if(!(e.target.closest&&e.target.closest('[data-stl]')))return;const md=v=>Math.floor((v-10)/2),fm=v=>(v>=0?'+':'−')+Math.abs(v);e.stopPropagation();if(!players.length)return toast('Нет героев');const i=KM.SK.findIndex(x=>x[0]==='Скрытность');const M=players.map(p=>{try{return KM.skMod(p,i)}catch(_){return md(p.st[1])}});
 openSheet(`<div class="sb-title">🥷 Скрытность — каждый бросает</div><div class="sb-sub">Каждый игрок бросает свой к20 и называет число; модификатор прибавится сам. Сравните с пассивной Внимательностью врагов — кто ниже, тот замечен.</div><div class="list" style="margin-top:10px">${players.map((p,j)=>`<div class="card"><div class="grow"><div class="t">${esc(p.name)}</div><div class="m">мод. ${fm(M[j])}</div></div><input class="inp" data-stv="${j}" type="number" inputmode="numeric" min="1" max="20" placeholder="к20" style="width:72px"><b class="price" data-sto="${j}">—</b></div>`).join('')}</div><button class="btn sm" id="stv" style="width:100%;margin-top:8px">🎲 бросить за всех (если нет кубиков)</button>`,r=>{
 const upd=()=>{const T=[];r.querySelectorAll('[data-stv]').forEach(x=>{const j=+x.dataset.stv,d=+x.value;r.querySelector(`[data-sto="${j}"]`).textContent=d?d+M[j]:'—';if(d)T.push([j,d+M[j]])});if(T.length===players.length){const lo=Math.min(...T.map(t=>t[1]));T.forEach(t=>{if(t[1]===lo&&T.length>1)r.querySelector(`[data-sto="${t[0]}"]`).textContent+=' ⚠'});KM.logS&&KM.logS('Скрытность: '+T.map(t=>players[t[0]].name+' '+t[1]).join(', '))}};
 r.oninput=upd;r.querySelector('#stv').onclick=()=>{r.querySelectorAll('[data-stv]').forEach(x=>{if(!x.value)x.value=1+Math.floor(Math.random()*20)});upd()}})},true);

try{sess.order=(sess.order||[]).filter(x=>x!=='clock')}catch(e){}

;
/* content.js */
'use strict';{
/* Дополнительные оригинальные случайные таблицы (комбинаторные) */
const P=a=>a[Math.floor(Math.random()*a.length)];
const add={
 'Зацепка':()=>`${P(['Вдова кузнеца','Седой храмовник','Купеческая гильдия','Девочка-сирота','Опальный рыцарь','Староста деревни','Ведьма с болот','Хромой картограф','Настоятель монастыря','Капитан стражи'])} ${P(['просит','умоляет','нанимает героев, чтобы','платит 50 зм, чтобы','шантажом заставляет'])} ${P(['вернуть украденную реликвию','найти пропавший обоз','проводить караван через перевал','выгнать нечто из колодца','доставить запечатанное письмо','узнать, кто травит скот','отыскать вход в затопленный склеп','снять проклятие с моста','поймать оборотня до полнолуния','выкупить пленника у разбойников'])}. Но ${P(['заказчик лжёт о награде','цель — родственник заказчика','за героями следит соперник','вещь проклята','всё это ловушка культа','время ограничено тремя днями','местные против вмешательства','настоящий враг — тот, кто их нанял'])}.`,
 'Таверна':()=>`«${P(['Пьяный','Хромой','Золотой','Ржавый','Спящий','Весёлый','Одноглазый','Медный','Седьмой','Чёрный'])} ${P(['грифон','котёл','бочонок','ворон','рыцарь','кабан','якорь','гусь','дракон','фонарь'])}» — ${P(['тесно и шумно','пахнет жжёным хмелем','хозяйка-полуорчиха помнит всех должников','в подвале играют в кости на желания','барда освистывают за всё','здесь не задают вопросов','на стене висит голова неизвестного зверя'])}. Фирменное: ${P(['похлёбка из угря','тёмный эль «Могильщик»','пирог с бараниной','медовуха на чабреце','сыр с плесенью «Проклятие»'])}.`,
 'Ловушка':()=>`${P(['Нажимная плита','Растяжка','Ложный сундук','Поворотная плита','Руна на пороге','Обрушивающийся потолок','Игольчатый замок','Затопляемая комната'])}: ${P(['спас ЛОВ СЛ 13','спас ТЕЛ СЛ 12','спас МДР СЛ 14','спас ЛОВ СЛ 15'])} или ${P(['2к10 колющего','3к6 огнём','2к8 ядом и отравление на 1 час','падение на 3 м (1к6) в яму','4к6 дробящего','сон на 1 минуту'])}. Обнаружение: Внимательность СЛ ${P([12,13,14,15])}; обезвредить: инструменты вора СЛ ${P([12,14,15,16])}.`,
 'Комната':()=>`${P(['Узкий зал','Круглая крипта','Затопленная камера','Обрушенная библиотека','Часовня без алтаря','Кладовая','Пыточная','Колодезная шахта','Зал с колоннами','Склад гробов'])}; ${P(['пахнет серой','слышен далёкий звон','на полу мел — чей-то круг','стены покрыты копотью','ледяной сквозняк','капает вода','свежие следы сапог','темнота гасит факелы на 1 раунд'])}; ${P(['пусто','1к4 крысиных роя','спящий огр','призрак, ищущий имя','ловушка','сундук (бросьте добычу)','пленник в цепях','2к4 скелета','странный механизм'])}.`,
 'Безделушка':()=>P(['стеклянный глаз, который иногда моргает','пуговица с гербом несуществующего дома','засушенная мышь в крошечной короне','игральная кость, где на всех гранях 6','карта звёзд, которых нет на небе','ключ без бородки','кукла с вашим лицом','песочные часы, песок в которых течёт вверх','зуб дракона размером с ноготь','письмо, адресованное вам, датированное через год','перо, пишущее только правду','монета с двумя решками','склянка с туманом, внутри шёпот','медальон с портретом незнакомки','ракушка, в которой слышно чужое море']),
 'Мотив злодея':()=>`${P(['Месть','Страх смерти','Любовь','Жажда признания','Вера','Голод','Долг','Ревность','Безумная идея','Чужая воля'])}: ${P(['хочет вернуть утраченное','желает доказать отцу свою силу','служит голосу из колодца','спасает свой народ любой ценой','копит души для сделки','пытается переписать прошлое','мстит городу за давний пожар','ищет лекарство для дочери'])}. Слабость: ${P(['гордыня','старый друг среди героев','боится огня','не может войти в освящённое место','связан клятвой','верит в пророчество'])}.`,
 'Осложнение в бою':()=>P(['Пол начинает проваливаться: в конце раунда спас ЛОВ СЛ 12 у края','Дым заполняет зал: видимость 3 м','Подкрепление врагов через 2 раунда','Лидер врагов пытается сбежать с важной вещью','Пожар распространяется на 1,5 м за раунд','Пленник кричит о помощи с другой стороны','Магическая буря: заклинатели бросают к20, на 1 — дикая магия','Враг сдаётся и предлагает сделку','Вода прибывает: через 3 раунда пол по колено (труднопроходимая местность)','Свет гаснет — тьма до конца боя']),
 'Название места':()=>`${P(['Волчий','Чёрный','Сонный','Ведьмин','Серебряный','Гнилой','Тихий','Кривой','Мёртвый','Соколиный'])} ${P(['лог','брод','курган','утёс','бор','омут','перевал','хутор','мост','овраг'])}`,
 'Странность':()=>P(['Все собаки в деревне воют в полдень','Птицы летают задом наперёд','У трактирщика нет тени','Колокол звонит сам по себе каждую ночь','Дети рисуют одну и ту же дверь','Река течёт в гору','Мёртвые не гниют уже месяц','Луна не заходит третий день','Хлеб в печах превращается в камень','Кто-то оставляет на порогах свежие цветы и кость']),
 'Имя НИП+черта':()=>`${P(['Борислав','Веста','Гордей','Злата','Ильмар','Ксения','Лука','Мирра','Остап','Рада','Святогор','Таисия','Феликс','Ядвига'])} ${P(['Кривонос','Сребролист','Тяжелорук','из Заречья','Полуночник','Медник','Косой','Белая','Лисица','Горький'])} — ${P(['всё время что-то жуёт','говорит о себе в третьем лице','коллекционирует пуговицы','боится кошек','шепчет молитвы','смеётся невпопад','врёт по мелочам','цитирует несуществующие книги','никогда не смотрит в глаза','очень вежлив, пугающе'])}.`
};
Object.assign(RT,add);
}
{/* Оригинальные существа Книги */
const A=(n,d)=>({n,d,ru:true});
const M=(o)=>Object.assign({sz:'Средний',al:'нейтрально-злой',sv:'',sk:'',vul:'',res:'',imm:'',ci:'',la:'—',f:[],a:[],r:[],lg:[],book:1},o);
const L=[
M({id:'bk-bolotnik',n:'Болотник',ty:'фея',ac:12,acn:'природный доспех',hp:22,hd:'4к8+4',sp:'6 м, плавание 9 м',st:[14,12,12,8,12,10],sk:'Скрытность +5',res:'яд',se:'тёмное зрение 18 м, пассивное Восприятие 11',la:'Сильван',cr:1,xp:200,f:[A('Тинная засада','В болоте совершает проверки Скрытности с преимуществом.')],a:[A('Тянущая хватка','Рукопашная атака оружием: +4 к попаданию, досягаемость 3 м, одна цель. Попадание: 7 (2к4 + 2) дробящего урона, цель схвачена (СЛ высвобождения 12) и утягивается на 3 м к болотнику.')]}),
M({id:'bk-poludnitsa',n:'Полудница',ty:'нежить',al:'хаотично-злой',ac:13,hp:45,hd:'7к8+14',sp:'9 м',st:[12,16,14,10,14,16],imm:'яд',ci:'истощение, отравление',se:'тёмное зрение 18 м, пассивное Восприятие 12',la:'понимает Общий',cr:3,xp:700,f:[A('Полуденный зной','Существа в пределах 3 м в начале своего хода совершают спасбросок Телосложения СЛ 13 или получают 1 уровень истощения (только под открытым солнцем).')],a:[A('Серп','Рукопашная атака оружием: +5 к попаданию, досягаемость 1,5 м, одна цель. Попадание: 10 (2к6 + 3) рубящего урона.'),A('Вопрос (перезарядка 5–6)','Одно существо в пределах 9 м совершает спасбросок Интеллекта СЛ 13. При провале получает 18 (4к8) психического урона и ошеломлено до конца своего следующего хода; при успехе — половину урона.')]}),
M({id:'bk-kostogryz',n:'Костогрыз',sz:'Большой',ty:'чудовище',ac:14,acn:'природный доспех',hp:68,hd:'8к10+24',sp:'12 м, копание 6 м',st:[18,12,16,3,12,6],se:'чувство вибрации 9 м, пассивное Восприятие 13',cr:4,xp:1100,f:[A('Нюх на кровь','Совершает с преимуществом броски атаки по существам, у которых нет всех хитов.')],a:[A('Мультиатака','Совершает две атаки: одну укусом и одну когтями.'),A('Укус','Рукопашная атака оружием: +6 к попаданию, досягаемость 1,5 м, одна цель. Попадание: 13 (2к8 + 4) колющего урона.'),A('Когти','Рукопашная атака оружием: +6 к попаданию, досягаемость 1,5 м, одна цель. Попадание: 11 (2к6 + 4) рубящего урона.')]}),
M({id:'bk-likho',n:'Лихо Одноглазое',sz:'Большой',ty:'великан',ac:15,acn:'природный доспех',hp:114,hd:'12к10+48',sp:'12 м',st:[21,10,18,9,14,12],sv:'ТЕЛ +7, МДР +5',se:'тёмное зрение 36 м, пассивное Восприятие 15',la:'Великаний, Общий',cr:7,xp:2900,f:[A('Дурной глаз','Существо, начинающее ход в пределах 9 м и видящее глаз Лиха, совершает спасбросок Мудрости СЛ 14; при провале совершает броски атаки и проверки с помехой до начала своего следующего хода.')],a:[A('Мультиатака','Совершает две атаки дубиной.'),A('Дубина','Рукопашная атака оружием: +8 к попаданию, досягаемость 3 м, одна цель. Попадание: 18 (3к8 + 5) дробящего урона.'),A('Брошенный валун','Дальнобойная атака оружием: +8 к попаданию, дистанция 18/72 м, одна цель. Попадание: 21 (3к10 + 5) дробящего урона.')]}),
M({id:'bk-zmei',n:'Змей трёхглавый',sz:'Огромный',ty:'дракон',al:'хаотично-злой',ac:18,acn:'природный доспех',hp:189,hd:'18к12+72',sp:'12 м, полёт 24 м',st:[24,10,19,12,13,15],sv:'ЛОВ +5, ТЕЛ +9, МДР +6',imm:'огонь',ci:'ослепление, ошеломление',se:'слепое зрение 18 м, тёмное зрение 36 м, пассивное Восприятие 21',la:'Драконий, Общий',cr:14,xp:11500,f:[A('Три головы','Совершает с преимуществом спасброски от ослепления, оглушения, очарования и потери сознания. Потеряв 50 и 100 хитов, теряет по голове: убирается одна атака укусом.')],a:[A('Мультиатака','Совершает три атаки укусом.'),A('Укус','Рукопашная атака оружием: +11 к попаданию, досягаемость 3 м, одна цель. Попадание: 18 (2к10 + 7) колющего урона.'),A('Огненное дыхание (перезарядка 5–6)','Конус 18 м. Спасбросок Ловкости СЛ 17: 56 (16к6) урона огнём при провале, половина при успехе.')],lg:[A('Взмах хвостом','Рукопашная атака: +11 к попаданию, досягаемость 4,5 м. Попадание: 16 (2к8 + 7) дробящего урона.'),A('Рёв трёх глоток','Каждое существо в пределах 18 м: спасбросок Мудрости СЛ 15 или испугано до конца своего следующего хода.'),A('Взлёт (стоит 2 действия)','Взмах крыльями: существа в пределах 3 м — спасбросок ЛОВ СЛ 19 или 14 (2к6+7) дробящего урона и сбиты с ног; затем летит на половину скорости.')]}),
M({id:'bk-shishiga',n:'Шишига',sz:'Маленький',ty:'фея',al:'хаотично-нейтральный',ac:13,hp:10,hd:'3к6',sp:'9 м, лазание 9 м',st:[6,16,10,10,10,14],sk:'Скрытность +5, Ловкость рук +5',se:'тёмное зрение 18 м, пассивное Восприятие 10',la:'Сильван, Общий',cr:0.5,xp:100,f:[A('Пакостница','Бонусным действием крадёт незакреплённый предмет весом до 0,5 кг у существа в пределах 1,5 м (Ловкость рук против Внимательности).')],a:[A('Острые зубки','Рукопашная атака оружием: +5 к попаданию, досягаемость 1,5 м, одна цель. Попадание: 5 (1к4 + 3) колющего урона.'),A('Морок (1/день)','Становится невидимой до 1 минуты или пока не атакует (концентрация).')]}),
M({id:'bk-upyr',n:'Упырь болотный',ty:'нежить',ac:13,acn:'природный доспех',hp:52,hd:'8к8+16',sp:'9 м',st:[16,14,15,7,10,8],res:'некротическая энергия',imm:'яд',vul:'излучение',ci:'отравление',se:'тёмное зрение 18 м, пассивное Восприятие 10',la:'понимает Общий',cr:2,xp:450,f:[A('Жажда','Получив урон излучением, до конца следующего хода не может совершать реакции.')],a:[A('Мультиатака','Совершает две атаки: когтями и укусом.'),A('Когти','Рукопашная атака оружием: +5 к попаданию, досягаемость 1,5 м, одна цель. Попадание: 8 (2к4 + 3) рубящего урона.'),A('Укус','Рукопашная атака оружием: +5 к попаданию, досягаемость 1,5 м, одна схваченная или недееспособная цель. Попадание: 7 (1к8 + 3) колющего урона и 7 (2к6) некротического; упырь восстанавливает хиты, равные некротическому урону.')]}),
M({id:'bk-gamayun',n:'Птица Гамаюн',ty:'небожитель',al:'нейтральный',ac:15,hp:60,hd:'11к8+11',sp:'3 м, полёт 18 м',st:[10,18,12,16,18,20],sv:'МДР +7, ХАР +8',res:'излучение',se:'истинное зрение 36 м, пассивное Восприятие 17',la:'все языки, телепатия 36 м',cr:5,xp:1800,f:[A('Вещунья','Знает одно правдивое пророчество о каждом, кто её видит; говорит загадками.')],a:[A('Когти','Рукопашная атака оружием: +7 к попаданию, досягаемость 1,5 м, одна цель. Попадание: 11 (2к6 + 4) рубящего урона.'),A('Песнь грядущего (перезарядка 6)','Каждое существо по выбору в пределах 18 м совершает спасбросок Мудрости СЛ 16 или очаровано на 1 минуту (повтор в конце хода).')]})];
L.forEach(m=>{if(!DATA.monsters.some(x=>x.id===m.id))DATA.monsters.push(m)});
}

;
/* ext.js */
'use strict';
/* ================= PLAYERS v2 ================= */
const ABN=['СИЛ','ЛОВ','ТЕЛ','ИНТ','МДР','ХАР'];
const PRESET={'Маг':[8,14,13,16,12,10],'Воин':[16,12,15,9,13,10],'Плут':[10,16,13,12,12,14]};
players.forEach(p=>{p.lvl=p.lvl||1;p.st=p.st||PRESET[p.cls]||[10,10,10,10,10,10];p.conds=p.conds||[];p.gold=p.gold??(p.cls==='Плут'?15:10);p.inv=p.inv||[];
  if(!p.inv.length&&!p._seeded){p._seeded=1;const seed={'Маг':['quarterstaff','dagger','component-pouch'],'Воин':['chain-mail','longsword','shield'],'Плут':['shortsword','shortbow','leather-armor','thieves-tools']}[p.cls]||[];
   seed.forEach(id=>{const it=D.items.find(x=>x.id===id);if(it)p.inv.push({id:uid(),item:it.id,n:it.n,q:1,w:it.w||0})})}});
save();
const attOf=x=>{const it=x.item&&D.items.find(i=>i.id===x.item);return !!(it&&it.att)};const attN=p=>p.inv.filter(x=>x.att).length;
const invW=p=>Math.round(p.inv.reduce((a,x)=>a+(x.w||0)*x.q,0)*10)/10;
const kg=n=>String(Math.round(n*10)/10).replace('.',',')+' кг';
function rPcs(){page.oninput=null;
  page.innerHTML=header('Герои','листы персонажей отряда · онлайн-стол — кнопка ◎','tri',1)+players.map((p,i)=>`<div class="hero" data-i="${i}">
   <div class="hero-top"><label class="portrait">${p.photo?`<img src="${p.photo}" alt="">`:(KM.avUrl&&KM.avUrl(p)?`<img src="${KM.avUrl(p)}" alt="">`:`<span>${esc((p.name||'?')[0])}</span>`)}<input type="file" accept="image/*" data-photo hidden><i>📷</i></label>
    <div class="hero-id"><input class="pcn" data-k="name" value="${esc(p.name)}" placeholder="Имя"><div class="row" style="gap:6px;flex-wrap:nowrap"><input class="pcc" data-k="cls" value="${esc(p.cls)}" placeholder="Класс" style="flex:1;margin:0"><span class="lvl">ур.<input data-k="lvl" type="number" inputmode="numeric" value="${p.lvl}"></span></div>
    <div class="hpline"><div class="hpbar"><i style="width:${Math.max(0,Math.min(100,p.hp/p.maxhp*100))}%"></i></div></div></div></div>
   <div class="pcstats4"><div class="shield"><small>ХИТЫ</small><div class="hpin"><input data-k="hp" type="number" inputmode="numeric" value="${p.hp}"><em>/</em><input data-k="maxhp" type="number" inputmode="numeric" value="${p.maxhp}" class="mx"></div></div>
    <div class="shield"><small>КД</small><input data-k="ac" type="number" inputmode="numeric" value="${p.ac}"></div>
    <div class="shield"><small>ВНИМ.</small><input data-k="pp" type="number" inputmode="numeric" value="${p.pp}"></div>
    <button class="shield gold" data-purse="${p.id}" style="font:inherit"><small>КОШЕЛЁК</small><b style="font-size:20px;color:#f0c64a">${KM.coin.fmtTot(p)}</b><i style="display:block;font-size:10px;opacity:.75;font-style:normal">${KM.coin.mini(p)}</i></button></div>
   <div class="abil hero-ab">${p.st.map((v,j)=>`<div><small>${ABN[j]}</small><input data-st="${j}" type="number" inputmode="numeric" value="${v}"><i>${fmod(mod(v))}</i></div>`).join('')}</div>
   ${KM.uses?KM.uses.row(p):''}<div class="conds-row">${p.conds.map(c=>`<span class="cond">${esc(c)}</span>`).join('')}<button class="chip" data-conds>${p.conds.length?'✎':'＋ Состояние'}</button></div>
   <div class="inv-h"><b>Инвентарь</b><span>${p.inv.length} предм. · ${kg(invW(p))}${p.inv.some(attOf)?` · <b class="att-n${attN(p)>3?' over':''}" title="Настройка: короткий отдых (1 ч) рядом с предметом — и его магия работает на вас. Одновременно можно быть настроенным максимум на 3 предмета." data-atth>✧ Настроено ${attN(p)}/3</b>`:''}</span><button class="btn sm" data-addinv>＋</button></div>
   <div class="inv">${p.inv.map((x,k)=>`<div class="inv-r" data-k="${k}"><span class="nm" data-open>${esc(x.n)}</span>${attOf(x)?`<button class="chip att${x.att?' on':''}" data-att title="${x.att?'Настроен — нажмите, чтобы снять':'Настроиться (макс. 3)'}">✧${x.att?' Настроен':''}</button>`:''}<span class="w">${x.w?kg(x.w*x.q):''}</span><div class="q"><button data-q="-1">−</button><b>${x.q}</b><button data-q="1">+</button></div><button class="rm" data-rm>✕</button></div>`).join('')||'<div class="muted" style="font-size:13px;padding:6px 2px">Пусто. Добавь из «Лута» или кнопкой ＋</div>'}</div>
   <details class="pnotes"><summary>Заметки</summary><textarea class="inp" data-k="notes">${esc(p.notes||'')}</textarea></details>
   ${players.length>1?'<button class="btn sm dark" data-del style="margin-top:8px">Удалить героя</button>':''}</div>`).join('')+`<button class="btn red" id="addPc">＋ Новый герой</button><div class="row" style="gap:8px;margin-top:8px"><button class="btn grow" id="bldPc">🧙 Мастер создания</button><button class="btn grow" id="rndPc">🎲 Случайный</button></div><button class="btn" id="pRest" style="width:100%;margin-top:8px">⛺ Отдых отряда</button><div style="height:20px"></div>`;
  const P=e=>{const h=e.target&&e.target.closest&&e.target.closest('.hero');return h?players[+h.dataset.i]:null};
  page.oninput=e=>{const t=e.target;if(!t.closest('.hero'))return;const p=P(e);if(t.dataset.k){const k=t.dataset.k;p[k]=t.type==='number'?+t.value:t.value;if(k==='hp'||k==='maxhp'){const b=t.closest('.hero').querySelector('.hpbar i');b.style.width=Math.max(0,Math.min(100,p.hp/p.maxhp*100))+'%'}save()}
   if(t.dataset.st!=null){p.st[+t.dataset.st]=+t.value||0;t.nextElementSibling.textContent=fmod(mod(+t.value||0));save()}};
  page.onchange=e=>{const t=e.target;if(t.dataset.photo==null||!t.files[0])return;const p=P(e);const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');const S0=320;c.width=c.height=S0;const g=c.getContext('2d');const s=Math.min(im.width,im.height);g.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,S0,S0);p.photo=c.toDataURL('image/jpeg',.8);save();rPcs();toast('Портрет сохранён')};im.src=fr.result};fr.readAsDataURL(t.files[0])};
  page.onclick=e=>{const t=e.target;const h=t.closest('.hero');if(!h)return;const p=players[+h.dataset.i];
   if(t.closest('[data-conds]'))return heroConds(p);
   if(t.closest('[data-addinv]'))return pickItem(it=>{giveItem(p,it);rPcs()});
   if(t.closest('[data-atth]'))return toast('Настройка: короткий отдых (1 ч) рядом с предметом — и его магия работает на вас. Одновременно можно быть настроенным максимум на 3 предмета.');const r=t.closest('.inv-r');if(r){const x=p.inv[+r.dataset.k];
    if(t.dataset.q){x.q=Math.max(1,x.q+ +t.dataset.q);save();rPcs()}else if(t.closest('[data-att]')){if(!x.att&&attN(p)>=3)return toast('Уже настроено 3 предмета — сначала снимите настройку с другого');x.att=x.att?0:1;save();rPcs();try{KM.table.push(true)}catch(e){}toast(x.att?'✧ Настроен: '+x.n:'Настройка снята: '+x.n)}else if(t.closest('[data-rm]')){const k=+r.dataset.k;p.inv.splice(k,1);save();rPcs();KM.undoToast('«'+x.n+'» убрано',()=>{p.inv.splice(k,0,x);save();rPcs()})}else if(t.closest('[data-open]')&&x.item)showItem(x.item)}
   if(t.closest('[data-del]')){const i=+h.dataset.i;players.splice(i,1);save();rPcs();KM.undoToast('Герой «'+p.name+'» удалён',()=>{players.splice(i,0,p);save();rPcs()})}};
  $('#pRest').onclick=()=>KM.partyRestUI();const addB=h=>{const o=Object.assign({id:uid(),conds:[],inv:[],notes:'',pp:10,init:0,gold:0},h);o.id=uid();players.push(o);save();rPcs();page.scrollTo({top:page.scrollHeight,behavior:'smooth'});toast('Герой «'+o.name+'» добавлен')};$('#bldPc').onclick=()=>window.KMB?KMB.open(addB,{host:'dm'}):toast('Мастер создания не загружен');$('#rndPc').onclick=()=>window.KMB&&addB(KMB.random());
  $('#addPc').onclick=()=>{players.push({id:uid(),name:'Новый герой',cls:'Класс',lvl:1,hp:10,maxhp:10,ac:12,pp:10,init:0,st:[10,10,10,10,10,10],conds:[],gold:0,inv:[],notes:''});save();rPcs();page.scrollTo({top:page.scrollHeight,behavior:'smooth'})}}
function heroConds(p){openSheet(`<div class="sb-title">Состояния</div><div class="sb-sub">${esc(p.name)}</div><div class="row" style="margin-top:12px">${CONDS.map(x=>`<button class="chip${p.conds.includes(x)?' on':''}" data-c="${x}">${x}</button>`).join('')}</div><div class="row" style="margin-top:18px"><button class="btn red" id="cok">Готово</button></div>`,r=>{
  $$('[data-c]',r).forEach(b=>b.onclick=()=>{const x=b.dataset.c;p.conds=p.conds.includes(x)?p.conds.filter(y=>y!==x):[...p.conds,x];b.classList.toggle('on');save()});$('#cok',r).onclick=()=>{closeSheet();rPcs()}})}
function giveItem(p,it,q=1){const ex=p.inv.find(x=>x.item===it.id);if(ex)ex.q+=q;else p.inv.push({id:uid(),item:it.id,n:it.n,q,w:it.w||0});save();toast(`«${it.n}» → ${p.name}`)}
function choosePlayer(it){openSheet(`<div class="sb-title">Кому отдать?</div><div class="sb-sub">${esc(it.n)}</div><div class="list" style="margin-top:14px">${players.map((p,i)=>`<button class="card hero-pick" data-i="${i}">${p.photo?`<img src="${p.photo}">`:`<span>${esc(p.name[0])}</span>`}<div><div class="t">${esc(p.name)}</div><div class="m">${esc(p.cls)} · ${p.inv.length} предм.</div></div></button>`).join('')}</div>`,r=>{
  $$('[data-i]',r).forEach(b=>b.onclick=()=>{giveItem(players[+b.dataset.i],it);closeSheet()})})}
function pickItem(cb){openSheet(`<div class="sb-title">Добавить предмет</div>${searchBox('pq','Меч, зелье, верёвка…','')}<div class="list" id="pl"></div>
  <div class="sec-h">Своё</div><div class="row"><input class="inp grow" id="cn" placeholder="Название"><input class="inp" id="cw" type="number" inputmode="decimal" placeholder="кг" style="width:70px"><button class="btn" id="cok">OK</button></div>`,r=>{
  const fill=q=>{const L=D.items.filter(i=>!q||(i.n).toLowerCase().includes(q)).slice(0,40);$('#pl',r).innerHTML=L.map(i=>`<div class="card" data-id="${i.id}" style="padding:8px 12px"><div class="t" style="font-size:15px">${esc(i.n)}</div><div class="m">${esc(i.sub||i.cat)}${i.w?' · '+kg(i.w):''}</div></div>`).join('')};
  fill('');const qi=$('#pq',r);qi.oninput=()=>fill(qi.value.trim().toLowerCase());
  $('#pl',r).onclick=e=>{const c=e.target.closest('.card');if(!c)return;cb(D.items.find(i=>i.id===c.dataset.id));closeSheet()};
  $('#cok',r).onclick=()=>{const n=$('#cn',r).value.trim();if(!n)return;cb({id:'custom-'+uid(),n,w:+$('#cw',r).value||0});closeSheet()}})}

/* ================= LOOT ================= */
const RCOL={'Обычный':'#a89d95','Необычный':'#5fd07a','Редкий':'#5aa2ff','Очень редкий':'#b67bff','Легендарный':'#ffb547','Артефакт':'#ff5a50','Разная':'#d6b26a'};
const rItemsCatalog=rItems;
let lootTab=LS.get('loottab','cat');let lootRes=LS.get('lootres',null);let lootCfg=LS.get('lootcfg',{tier:0,kind:'hoard'});
rItems=function(){page.oninput=null;page.onclick=null;
  if(lootTab==='cat'){rItemsCatalog();$('.ph',page).insertAdjacentHTML('afterend',lootSeg());bindLootSeg();return}
  const TI=[['0','ПО 0–4'],['1','ПО 5–10'],['2','ПО 11–16'],['3','ПО 17+']];
  page.innerHTML=header('Лут','добыча и сокровища','tri',2)+lootSeg()+`<div class="gen">
   <label class="f">Опасность побеждённых</label>${chips('tier',TI,lootCfg.tier)}
   <label class="f">Что генерировать</label>${chips('kind',[['ind','Карманы (1 враг)'],['hoard','Клад (логово)'],['magic','1 магический предмет']],lootCfg.kind)}
   <button class="btn red" id="gen" style="width:100%;justify-content:center;margin-top:10px;padding:14px;font-size:16px">🜏 Сгенерировать добычу</button></div>
   <div id="lootOut">${lootRes?lootHtml(lootRes):'<div class="empty">Брось кости судьбы — и узнай, что нашли герои.</div>'}</div>
   <p class="muted" style="font-size:11.5px;margin-top:14px">Упрощённый генератор по мотивам таблиц сокровищ (суммы монет ≈ средним из Руководства Мастера; предметы — случайные из справочника нужной редкости).</p>`;
  bindLootSeg();bindChips(page,(n,v)=>{lootCfg[n]=n==='tier'?+v:v;LS.set('lootcfg',lootCfg);rItems()});
  $('#gen').onclick=()=>{lootRes=genLoot(lootCfg.tier,lootCfg.kind);LS.set('lootres',lootRes);$('#lootOut').innerHTML=lootHtml(lootRes);$('#lootOut').animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:350})};
  $('#lootOut').onclick=e=>{const g=e.target.closest('[data-give]');if(g){const it=D.items.find(i=>i.id===g.dataset.give);return choosePlayer(it)}
   const gc=e.target.closest('[data-gold]');if(gc){splitGold(+gc.dataset.gold);return}
   const c=e.target.closest('[data-open]');if(c)showItem(c.dataset.open)}}
function lootSeg(){return `<div class="seg" id="lseg"><button data-t="cat" class="${lootTab==='cat'?'on':''}">Каталог</button><button data-t="gen" class="${lootTab==='gen'?'on':''}">Генератор лута</button></div>`}
function bindLootSeg(){$('#lseg').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;lootTab=b.dataset.t;LS.set('loottab',lootTab);rItems()}}
const dsum=(n,d)=>{let s=0;for(let i=0;i<n;i++)s+=rnd(d);return s};
function genLoot(t,kind){const R0={coins:{},items:[]};
  const C=[[['cp',5,6,1],['sp',4,6,1],['gp',3,6,1]],[['sp',4,6,10],['gp',2,6,10],['ep',2,6,10]],[['gp',4,6,10],['pp',1,6,10],['ep',2,6,10]],[['gp',2,6,100],['pp',2,6,10]]];
  const H=[[['cp',6,6,100],['sp',3,6,100],['gp',2,6,10]],[['cp',2,6,100],['sp',2,6,1000],['gp',6,6,100],['pp',3,6,10]],[['gp',4,6,1000],['pp',5,6,100]],[['gp',12,6,1000],['pp',8,6,1000]]];
  if(kind!=='magic'){const tbl=kind==='ind'?C[t]:H[t];tbl.forEach(([c,n,d,m],i)=>{if(kind==='ind'&&i===tbl.length-1&&rnd(2)===1)return;R0.coins[c]=dsum(n,d)*m})}
  const RW=[['Обычный','Необычный'],['Необычный','Редкий'],['Редкий','Очень редкий'],['Очень редкий','Легендарный']][t];
  const nMag=kind==='magic'?1:kind==='hoard'?[1,2,2,3][t]+(rnd(4)===4?1:0):(rnd(6)===6?1:0);
  const pool=r=>D.items.filter(i=>i.cat==='Магические'&&i.rar===r);
  for(let i=0;i<nMag;i++){const r=RW[rnd(10)<=7?0:1];const P=pool(r).length?pool(r):pool('Необычный');R0.items.push(P[rnd(P.length)-1].id)}
  if(kind!=='magic'){const gear=D.items.filter(i=>['Снаряжение','Оружие','Доспехи','Инструменты'].includes(i.cat));const n=kind==='hoard'?2+rnd(3):rnd(2);for(let i=0;i<n;i++)R0.items.push(gear[rnd(gear.length)-1].id)}
  if(kind==='hoard'){const G=[[10,'безделушки'],[50,'самоцветы'],[100,'жемчуг и янтарь'],[500,'драгоценности'],[1000,'изумруды']];const g=G[Math.min(4,t+rnd(2)-1)];R0.gems={n:dsum(2,4),v:g[0],k:g[1]}}
  return R0}
const CN={cp:'мм',sp:'см',ep:'эм',gp:'зм',pp:'пм'};
function lootHtml(r){const gp=Math.round(((r.coins.cp||0)/100+(r.coins.sp||0)/10+(r.coins.ep||0)/2+(r.coins.gp||0)+(r.coins.pp||0)*10+(r.gems?r.gems.n*r.gems.v:0)));
  return `<div class="loot-coins">${Object.entries(r.coins).map(([c,v])=>`<div><b>${v.toLocaleString('ru')}</b><small>${CN[c]}</small></div>`).join('')}${r.gems?`<div class="gem"><b>${r.gems.n}×${r.gems.v}</b><small>зм · ${r.gems.k}</small></div>`:''}</div>
  ${gp?`<button class="btn sm" data-gold="${gp}" style="margin:2px 0 10px">⚖ Всего ≈ ${gp.toLocaleString('ru')} зм — поделить между героями</button>`:''}
  <div class="list">${r.items.map(id=>{const i=D.items.find(x=>x.id===id);if(!i)return'';const c=RCOL[i.rar]||'#aaa';return `<div class="card loot" style="--rc:${c}" data-open="${i.id}"><div class="t">${esc(i.n)}</div><div class="m"><span style="color:${c};font-weight:700">${esc(i.cat==='Магические'?i.rar:i.cat)}</span> · ${esc(i.sub||'')}${i.w?' · '+kg(i.w):''}</div><button class="btn sm red give" data-give="${i.id}">В инвентарь</button></div>`}).join('')}</div>`}
/* 5e кошелёк: мм/см/эм/зм/пм, p.gold = coins.зм (совместимость) */
const CV={мм:1,см:10,эм:50,зм:100,пм:1000},CK=['мм','см','эм','зм','пм'];
function purse(p){if(!p.coins||typeof p.coins!=='object')p.coins={мм:0,см:0,эм:0,зм:+p.gold||0,пм:0};CK.forEach(k=>p.coins[k]=Math.max(0,Math.floor(+p.coins[k]||0)));if(!p._c2){if((+p.gold||0)!==p.coins.зм&&p.coins.зм===0)p.coins.зм=+p.gold||0;p._c2=1}p.gold=p.coins.зм;return p.coins}
const cpOf=p=>{const c=purse(p);return CK.reduce((a,k)=>a+c[k]*CV[k],0)};
const nf=v=>(Math.round(v*100)/100).toLocaleString('ru-RU');
function addCoins(p,c){const P=purse(p);Object.keys(c||{}).forEach(k=>{const kk={pm:'пм',zm:'зм',em:'эм',sm:'см',mm:'мм'}[k]||k;if(CV[kk])P[kk]+=Math.floor(+c[k]||0)});p.gold=P.зм}
function addCp(p,cp){const P=purse(p);cp=Math.floor(cp);[['пм',1000],['зм',100],['см',10],['мм',1]].forEach(([k,v])=>{const n=Math.floor(cp/v);if(k==='пм')return;P[k]+=n;cp-=n*v});p.gold=P.зм}
KM.coin={CV,CK,purse,cpOf,addCoins,addCp,fmtTot:p=>'≈'+nf(cpOf(p)/100),mini:p=>{const c=purse(p);return CK.slice().reverse().filter(k=>c[k]).map(k=>c[k]+' '+k).join(' · ')||'пусто'}};
players.forEach(purse);
function purseUI(p){const draw=()=>openSheet(`<div class="sb-title">Кошелёк — ${esc(p.name)}</div><div class="sb-sub">1 пм = 10 зм · 1 зм = 2 эм = 10 см = 100 мм</div>
 <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:10px">${CK.slice().reverse().map(k=>`<label style="text-align:center"><small class="muted">${k}</small><input class="inp" data-pc="${k}" type="number" inputmode="numeric" value="${p.coins[k]}" style="text-align:center;padding:8px 2px"></label>`).join('')}</div>
 <p style="margin:10px 0">Всего ≈ <b id="pctot">${nf(cpOf(p)/100)}</b> зм</p><div class="row"><button class="btn grow" id="pcx">Обменять мелочь на золото</button><button class="btn ac" id="pcok">Готово</button></div>`,()=>{
  $$('[data-pc]').forEach(i=>i.oninput=()=>{p.coins[i.dataset.pc]=Math.max(0,+i.value||0);p.gold=p.coins.зм;$('#pctot').textContent=nf(cpOf(p)/100);save()});
  $('#pcx').onclick=()=>{const c=p.coins;const cp=c.мм+c.см*10+c.эм*50;c.мм=cp%10;c.см=Math.floor(cp%100/10);c.эм=0;c.зм+=Math.floor(cp/100);p.gold=c.зм;save();draw()};$('#pcok').onclick=()=>{closeSheet();rPcs()}});draw()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-purse]');if(!b)return;const p=players.find(x=>x.id===b.dataset.purse);if(p)purseUI(p)});
function splitGold(g,coins){const n=players.length;if(!n)return;const cp=coins?CK.reduce((a,k)=>a+(+coins[{мм:'mm',см:'sm',эм:'em',зм:'zm',пм:'pm'}[k]]||+coins[k]||0)*CV[k],0):Math.round(g*100);const each=Math.floor(cp/n),rem=cp-each*n;players.forEach((p,i)=>addCp(p,each+(i===0?rem:0)));save();toast(`Каждому по ${nf(each/100)} зм (монетами)`+(rem?` · остаток ${rem} мм → ${players[0].name}`:''))}
/* item sheet: add give button */
const _showItem=showItem;
showItem=function(id){_showItem(id);const it=D.items.find(x=>x.id===id);if(!it)return;$('#sheetPage').insertAdjacentHTML('beforeend',`<div class="row" style="margin-top:18px"><button class="btn red" id="giveIt">🎒 В инвентарь</button></div>`);$('#giveIt').onclick=()=>choosePlayer(it)};
/* rarity colors in catalog */
const _fillIt=fillIt;fillIt=function(){_fillIt();$$('#itList .badge').forEach(b=>{const c=RCOL[b.textContent];if(c){b.style.color=c;b.style.borderColor=c+'66';b.style.background=c+'1f'}})};

/* ================= MAP BUILDER ================= */
const TILES=[['floor','Пол','#3b3430'],['wall','Стена','#141110'],['door','Дверь','#7a4a22'],['water','Вода','#1d4f73'],['tree','Деревья','#24502a'],['lava','Лава','#c2380e'],['stairs','Лестница','#6b625b'],['chest','Сундук','#3b3430'],['trap','Ловушка','#3b3430'],['grass','Трава','#3d5b2a'],['dt','Трудная местность (×2 к движению)','#b08a3a']];
const TC=Object.fromEntries(TILES.map(t=>[t[0],t]));
let maps=LS.get('maps',null);(maps||[]).forEach(m=>{if(m&&m.hist&&m.hist.length>25)m.hist=m.hist.slice(-25)});
if(!maps){maps=[sampleMap()];LS.set('maps',maps)}
let mapCur=LS.get('mapcur',maps[0].id);
let mt={tool:'pan',tile:'wall',fogView:false,tokKind:'pc',locked:true,autoLock:LS.get('autolock',true)};
const snap=m=>JSON.stringify({g:m.g,fog:m.fog,tok:m.tok});
function histPush(m){m.hist=m.hist||[];m.redo=[];m.hist.push(snap(m));if(m.hist.length>25)m.hist.shift()}
function histMove(m,from,to){if(!(m[from]||[]).length)return false;m[to]=m[to]||[];m[to].push(snap(m));const o=JSON.parse(m[from].pop());m.g=o.g;m.fog=o.fog;m.tok=o.tok;saveMaps();return true}
let relockT;
let view=LS.get('mapview',{s:1,x:0,y:0});
function sampleMap(){const W=20,H=20,g=Array(W*H).fill('');const set=(x,y,t)=>{if(x>=0&&y>=0&&x<W&&y<H)g[y*W+x]=t};
  for(let y=2;y<12;y++)for(let x=2;x<11;x++)set(x,y,(x===2||x===10||y===2||y===11)?'wall':'floor');set(10,6,'door');
  for(let y=5;y<16;y++)for(let x=11;x<18;x++)set(x,y,(x===11||x===17||y===5||y===15)?'wall':'floor');set(11,6,'door');set(14,15,'door');
  set(15,8,'chest');set(13,12,'trap');set(4,4,'stairs');for(let x=3;x<7;x++)set(x,9,'water');for(let y=13;y<20;y++)for(let x=0;x<8;x++)if(rnd(3)===1)set(x,y,'tree');else set(x,y,'grass');set(15,17,'lava');set(16,17,'lava');set(16,18,'lava');
  return {id:uid(),name:'Логово гоблинов',W,H,g,fog:Array(W*H).fill(0),tok:[{id:uid(),x:5,y:6,n:'Э',c:'#d6b26a',k:'pc'},{id:uid(),x:6,y:6,n:'Б',c:'#d6b26a',k:'pc'},{id:uid(),x:5,y:7,n:'Л',c:'#d6b26a',k:'pc'},{id:uid(),x:14,y:9,n:'Г',c:'#d42a22',k:'mon'},{id:uid(),x:15,y:11,n:'Г',c:'#d42a22',k:'mon'}]}}
const curMap=()=>maps.find(m=>m.id===mapCur)||maps[0];
const saveMaps=()=>{const cm=maps.find(x=>x.id===mapCur);if(cm)cm.rev=(cm.rev||0)+1;clearTimeout(saveMaps.t);saveMaps.t=setTimeout(saveMaps.now,400)};saveMaps.now=()=>{clearTimeout(saveMaps.t);try{localStorage.setItem('km.maps',JSON.stringify(maps,(k,v)=>k==='hist'||k==='redo'?undefined:v));LS.set('mapcur',mapCur)}catch(e){toast('Хранилище переполнено')}};addEventListener('pagehide',()=>saveMaps.now());document.addEventListener('visibilitychange',()=>{if(document.hidden)saveMaps.now()});
function rMap(){page.oninput=null;page.onclick=null;const m=curMap();
  page.innerHTML=header('Карта','конструктор подземелий','pent',0)+`
  <div class="row" style="margin-bottom:8px"><select class="inp grow" id="mSel">${maps.map(x=>`<option value="${x.id}"${x.id===m.id?' selected':''}>${esc(x.name)} (${x.W}×${x.H})</option>`).join('')}</select><button class="btn sm" id="mNew">＋</button><button class="btn sm" id="mMenu">⋯</button></div>
  <div class="row m-ctl" style="margin:6px 0;flex-wrap:nowrap"><button class="btn sm${mt.locked?'':' red'}" id="mLock" style="flex:1">${mt.locked?'🔒 Правка':'🔓 Готово'}</button><button class="btn sm" id="mUndo" aria-label="Отменить" style="min-width:48px">↶</button><button class="btn sm" id="mRedo" aria-label="Повторить" style="min-width:48px">↷</button></div>
  <div class="seg tools" id="mtools">${[['paint','🖌 Кисть'],['erase','⌫ Стереть'],['token','◉ Фишка'],['fog','☁ Туман'],['pan','✋ Двигать']].map(([k,l])=>`<button data-t="${k}" class="${!mt.locked&&mt.tool===k?'on':''}">${l}</button>`).join('')}</div>
    <div class="map-wrap" id="mw"><canvas id="mc"></canvas><div class="zoom"><button id="zi">＋</button><button id="zo">−</button><button id="zf">⤢</button></div></div>
<div id="mopts"></div><label class="row muted" style="font-size:12.5px;margin-top:8px"><input type="checkbox" id="mAuto"${mt.autoLock?' checked':''}> Автоблокировка через 30 с бездействия</label>`;
  const setLock=v=>{mt.locked=v;if(v)mt.tool='pan';rMap();if(!v)toast('Режим правки: можно рисовать')};
  $('#mLock').onclick=()=>setLock(!mt.locked);$('#mAuto').onchange=e=>{mt.autoLock=e.target.checked;LS.set('autolock',mt.autoLock)};
  const bump=()=>{clearTimeout(relockT);if(mt.autoLock&&!mt.locked)relockT=setTimeout(()=>{if(S.sec===SECTIONS.findIndex(x=>x[0]==='map')&&!mt.locked){setLock(true);toast('Карта заблокирована')}else mt.locked=true},30000)};bump();
  $('#mUndo').onclick=()=>{histMove(m,'hist','redo')?draw():toast('Нечего отменять')};$('#mRedo').onclick=()=>{histMove(m,'redo','hist')?draw():toast('Нечего повторять')};
  $('#mSel').onchange=e=>{mapCur=e.target.value;saveMaps();view={s:1,x:0,y:0};rMap()};
  $('#mNew').onclick=newMap;$('#mMenu').onclick=mapMenu;
  $('#mtools').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;mt.tool=b.dataset.t;if(mt.locked&&mt.tool!=='pan'){mt.locked=false;$('#mLock').textContent='🔓 Готово';$('#mLock').classList.add('red')}$$('#mtools button').forEach(x=>x.classList.toggle('on',x===b));opts()};
  const cv=$('#mc'),wrap=$('#mw');const dpr=Math.min(2,devicePixelRatio||1);const CS=32;
  function size(){const w=wrap.clientWidth,h=wrap.clientHeight;cv.width=w*dpr;cv.height=h*dpr;cv.style.width=w+'px';cv.style.height=h+'px';draw()}
  function fit(){const w=wrap.clientWidth,h=wrap.clientHeight;view.s=Math.min(w/(m.W*CS),h/(m.H*CS));view.x=(w-m.W*CS*view.s)/2;view.y=(h-m.H*CS*view.s)/2;draw()}
  KM.redrawMap=()=>{if(cv.isConnected)draw()};
  function draw(){const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#070505';g.fillRect(0,0,cv.width,cv.height);g.translate(view.x,view.y);g.scale(view.s,view.s);
    drawMap(g,m,CS,mt.fogView?1:.55);}
  function opts(){const O=$('#mopts');
    if(mt.tool==='paint')O.innerHTML=`<div class="tiles">${TILES.map(([k,l,c])=>`<button data-tile="${k}" class="${mt.tile===k?'on':''}"><i style="background:${c}">${tileIcon(k)}</i>${l}</button>`).join('')}</div>`;
    else if(mt.tool==='token')O.innerHTML=`${chips('tk',[['pc','Герой'],['mon','Монстр'],['npc','НИП'],['del','Удалить фишку']],mt.tokKind)}<div class="muted" style="font-size:12.5px">Тапни клетку — поставить. Перетащи фишку — двигать.</div><div class="row" style="margin-top:6px">${players.map(p=>`<button class="btn sm" data-pp="${p.id}">${esc(p.name)}</button>`).join('')}</div>`;
    else if(mt.tool==='fog')O.innerHTML=`${chips('fv',[['0','Вид Мастера'],['1','Вид игроков']],mt.fogView?1:0)}<div class="row" style="margin-top:6px"><button class="btn sm" id="fAll">Скрыть всё</button><button class="btn sm" id="fNone">Открыть всё</button></div><div class="muted" style="font-size:12.5px;margin-top:6px">Води пальцем: скрытые клетки открываются, открытые — скрываются.</div>`;
    else O.innerHTML=`<div class="muted" style="font-size:12.5px">${mt.locked?'🔒 Карта заблокирована: касания только двигают и масштабируют. Нажми «Редактировать» или выбери инструмент.':'Двумя пальцами — зум и сдвиг в любом режиме.'}</div>`;
    $$('[data-tile]',O).forEach(b=>b.onclick=()=>{mt.tile=b.dataset.tile;opts()});
    bindChips(O,(n,v)=>{if(n==='tk')mt.tokKind=v;if(n==='fv'){mt.fogView=v==='1';draw()}opts()});
    $$('[data-pp]',O).forEach(b=>b.onclick=()=>{histPush(m);const p=players.find(x=>x.id===b.dataset.pp);m.tok.push({id:uid(),x:Math.floor(m.W/2),y:Math.floor(m.H/2),n:p.name[0],c:'#d6b26a',k:'pc',photo:p.photo||null});saveMaps();draw()});
    const fa=$('#fAll',O);if(fa){fa.onclick=()=>{histPush(m);m.fog.fill(1);saveMaps();draw()};$('#fNone',O).onclick=()=>{histPush(m);m.fog.fill(0);saveMaps();draw()}}}
  // input
  const dist=t=>{let d=document.getElementById('mdist');if(!t){d&&d.remove();return}if(!d){d=document.createElement('div');d.id='mdist';d.style.cssText='position:absolute;left:50%;top:10px;transform:translateX(-50%);background:rgba(10,6,5,.85);color:#e8c77a;border:1px solid #a87b3e;border-radius:12px;padding:4px 12px;font-size:15px;pointer-events:none;z-index:5';$('#mw').append(d)}d.textContent=t};
  const pts=new Map();let gest=null,drag=null,fogMode=null,last=null;
  const cell=(cx,cy)=>{const r=cv.getBoundingClientRect();const x=Math.floor(((cx-r.left)-view.x)/view.s/CS),y=Math.floor(((cy-r.top)-view.y)/view.s/CS);return x>=0&&y>=0&&x<m.W&&y<m.H?{x,y}:null};
  function apply(c){if(!c)return;const i=c.y*m.W+c.x;if(last===i)return;last=i;
    if(mt.tool==='paint'){if(mt.tile==='dt'){m.dt=m.dt||[];m.dt[i]=m.dt[i]?0:1}else m.g[i]=mt.tile}else if(mt.tool==='erase'){m.g[i]='';m.tok=m.tok.filter(t=>t.x!==c.x||t.y!==c.y)}
    else if(mt.tool==='fog'){if(fogMode==null)fogMode=m.fog[i]?0:1;m.fog[i]=fogMode}draw()}
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2){if(drag&&drag.snap){const o=JSON.parse(drag.snap);m.g=o.g;m.fog=o.fog;m.tok=o.tok;if(m.hist&&m.hist.length)m.hist.pop();draw()}drag=null;dist(null);const [a,b]=[...pts.values()];gest={d:Math.hypot(a.x-b.x,a.y-b.y),cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,v:{...view}};return}
    last=null;fogMode=null;const c=cell(e.clientX,e.clientY);
    bump();if(mt.locked||mt.tool==='pan'){drag={pan:1,x:e.clientX,y:e.clientY,v:{...view}};return}
    if(mt.tool==='token'&&c){const t=KM.tokAt?KM.tokAt(m,c.x,c.y):m.tok.find(t=>t.x===c.x&&t.y===c.y);if(mt.tokKind==='del'){if(t){histPush(m);m.tok=m.tok.filter(z=>z!==t);saveMaps();draw()}return}
      if(t){const sn=JSON.stringify({g:m.g,fog:m.fog,tok:m.tok});histPush(m);drag={tok:m.tok.find(z=>z.id===t.id)||t,snap:sn,ox:t.x,oy:t.y,dx:c.x-t.x,dy:c.y-t.y};return}histPush(m);const n=mt.tokKind==='pc'?'Г':mt.tokKind==='mon'?'М':'N';const lbl=prompt('Буква/имя фишки',n);if(lbl==null)return;m.tok.push({id:uid(),x:c.x,y:c.y,n:lbl.slice(0,2),c:mt.tokKind==='pc'?'#d6b26a':mt.tokKind==='mon'?'#d42a22':'#5aa2ff',k:mt.tokKind});saveMaps();draw();return}
    const sn=JSON.stringify({g:m.g,fog:m.fog,tok:m.tok});if(c)histPush(m);drag={paint:1,snap:sn};apply(c)});
  cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(gest&&pts.size>=2){const [a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;const r=cv.getBoundingClientRect();
      const s=Math.max(.3,Math.min(4,gest.v.s*d/gest.d));const k=s/gest.v.s;view.s=s;view.x=(gest.cx-r.left)-((gest.cx-r.left)-gest.v.x)*k+(cx-gest.cx);view.y=(gest.cy-r.top)-((gest.cy-r.top)-gest.v.y)*k+(cy-gest.cy);draw();return}
    if(!drag)return;if(drag.pan){view.x=drag.v.x+e.clientX-drag.x;view.y=drag.v.y+e.clientY-drag.y;draw()}
    else if(drag.tok){const c0=cell(e.clientX,e.clientY);const c=c0&&{x:c0.x-(drag.dx||0),y:c0.y-(drag.dy||0)};if(c&&(c.x!==drag.tok.x||c.y!==drag.tok.y)){const why=KM.whyBlocked?KM.whyBlocked(m,drag.tok,c.x,c.y):((m.g[c.y*m.W+c.x]==='wall'||window.KM_SOLID&&KM_SOLID(m,c.x,c.y))?'⛔ Стена':'');if(why){dist(why);return}}if(c){drag.tok.x=c.x;drag.tok.y=c.y;dist(`${Math.max(Math.abs(c.x-drag.ox),Math.abs(c.y-drag.oy))} кл · ${(Math.max(Math.abs(c.x-drag.ox),Math.abs(c.y-drag.oy))*1.5).toLocaleString('ru')} м`);draw()}}else if(drag.paint)apply(cell(e.clientX,e.clientY))});
  const up=e=>{pts.delete(e.pointerId);dist(null);if(pts.size<2)gest=null;if(!pts.size){if(drag&&!drag.pan)saveMaps();drag=null;LS.set('mapview',view)}};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  $('#zi').onclick=()=>zoom(1.25);$('#zo').onclick=()=>zoom(.8);$('#zf').onclick=fit;
  function zoom(k){const w=wrap.clientWidth/2,h=wrap.clientHeight/2;const s=Math.max(.3,Math.min(4,view.s*k));const kk=s/view.s;view.x=w-(w-view.x)*kk;view.y=h-(h-view.y)*kk;view.s=s;LS.set('mapview',view);draw()}
  opts();size();if(!LS.get('mapview',null)||view._fit!==m.id){fit();view._fit=m.id}
  window.KM.mapDraw=draw;KM.mapCur=()=>curMap();KM.mapSave=()=>saveMaps();KM.mapView=()=>view;KM.mapPan=(x,y)=>{view.x=wrap.clientWidth/2-(x+.5)*CS*view.s;view.y=wrap.clientHeight/2-(y+.5)*CS*view.s;LS.set('mapview',view);draw()}}
function tileIcon(k){return {door:'▮',stairs:'≡',chest:'▣',trap:'✕',tree:'♣',water:'≈',lava:'≈'}[k]||''}
function drawMap(g,m,CS,fogA){
  for(let y=0;y<m.H;y++)for(let x=0;x<m.W;x++){const t=m.g[y*m.W+x];const X=x*CS,Y=y*CS;
    if(!t){g.fillStyle=(x+y)%2?'#100c0b':'#0d0a09';g.fillRect(X,Y,CS,CS);continue}
    const base=t==='chest'||t==='trap'?'floor':t;g.fillStyle=(TC[base]||(window.KM_GROUND&&KM_GROUND[base])||TC.floor||[0,0,'#3a3028'])[2]||'#3a3028';g.fillRect(X,Y,CS,CS);
    if(t==='wall'){g.fillStyle='#2a2320';g.fillRect(X+1,Y+1,CS-2,CS/2-2);g.fillRect(X+1,Y+CS/2+1,CS-2,CS/2-2);g.fillStyle='#0a0807';g.fillRect(X+CS/2,Y,1,CS/2);g.fillRect(X+CS/4,Y+CS/2,1,CS/2)}
    if(t==='floor'||t==='chest'||t==='trap'){g.strokeStyle='rgba(255,255,255,.04)';g.strokeRect(X+.5,Y+.5,CS-1,CS-1)}
    if(t==='water'||t==='lava'){g.strokeStyle=t==='water'?'rgba(140,200,255,.35)':'rgba(255,220,120,.55)';g.lineWidth=1.5;for(let k=0;k<2;k++){g.beginPath();g.moveTo(X+4,Y+10+k*12);g.quadraticCurveTo(X+10,Y+5+k*12,X+16,Y+10+k*12);g.quadraticCurveTo(X+22,Y+15+k*12,X+28,Y+10+k*12);g.stroke()}g.lineWidth=1}
    if(t==='tree'){g.fillStyle='#173a1c';g.beginPath();g.arc(X+CS/2,Y+CS/2,CS*.42,0,7);g.fill();g.fillStyle='#2f6b35';g.beginPath();g.arc(X+CS/2-3,Y+CS/2-3,CS*.26,0,7);g.fill()}
    if(t==='grass'){g.strokeStyle='rgba(140,200,90,.35)';for(let k=0;k<3;k++){g.beginPath();g.moveTo(X+6+k*9,Y+24);g.lineTo(X+8+k*9,Y+16);g.stroke()}}
    if(t==='door'){g.fillStyle='#3b3430';g.fillRect(X,Y,CS,CS);g.fillStyle='#8a5526';g.fillRect(X+4,Y+3,CS-8,CS-6);g.fillStyle='#e0b060';g.fillRect(X+CS-11,Y+CS/2-1,3,3)}
    if(t==='stairs'){g.fillStyle='#4a423c';for(let k=0;k<5;k++){g.fillRect(X+3,Y+3+k*6,CS-6,4)}}
    if(t==='chest'){g.fillStyle='#6b3e18';g.fillRect(X+6,Y+10,CS-12,CS-16);g.fillStyle='#d6b26a';g.fillRect(X+6,Y+14,CS-12,2);g.fillRect(X+CS/2-2,Y+15,4,5)}
    if(t==='trap'){g.strokeStyle='#d42a22';g.lineWidth=2.5;g.beginPath();g.moveTo(X+8,Y+8);g.lineTo(X+CS-8,Y+CS-8);g.moveTo(X+CS-8,Y+8);g.lineTo(X+8,Y+CS-8);g.stroke();g.lineWidth=1}}
  g.strokeStyle='rgba(255,255,255,.06)';g.beginPath();for(let x=0;x<=m.W;x++){g.moveTo(x*CS,0);g.lineTo(x*CS,m.H*CS)}for(let y=0;y<=m.H;y++){g.moveTo(0,y*CS);g.lineTo(m.W*CS,y*CS)}g.stroke();
  m.tok.forEach(t=>{const X=t.x*CS+CS/2,Y=t.y*CS+CS/2;if(fogA>=1&&m.fog[t.y*m.W+t.x])return;g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.arc(X+1,Y+2,CS*.4,0,7);g.fill();
    g.fillStyle=t.c;g.beginPath();g.arc(X,Y,CS*.4,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=2;g.stroke();g.lineWidth=1;
    g.fillStyle=t.k==='pc'?'#1a1208':'#fff';g.font=`800 ${t.n.length>1?11:15}px Manrope,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(t.n,X,Y+1)});
  for(let i=0;i<m.fog.length;i++)if(m.fog[i]){const x=i%m.W,y=(i/m.W)|0;g.fillStyle=`rgba(5,3,3,${fogA})`;g.fillRect(x*CS,y*CS,CS,CS);if(fogA<1){g.fillStyle='rgba(120,120,140,.12)';g.fillRect(x*CS,y*CS,CS,CS)}}}
function newMap(){openSheet(`<div class="sb-title">Новая карта</div><label class="f">Название</label><input class="inp" id="nn" value="Подземелье ${maps.length+1}">
  <div class="row"><div class="grow"><label class="f">Ширина</label><input class="inp" id="nw" type="number" value="20"></div><div class="grow"><label class="f">Высота</label><input class="inp" id="nh" type="number" value="20"></div></div>
  <div class="muted" style="font-size:12.5px;margin-top:6px">1 клетка = 1,5 м</div><div class="row" style="margin-top:14px"><button class="btn red" id="nok">Создать</button></div>`,r=>{
  $('#nok',r).onclick=()=>{const W=Math.max(5,Math.min(60,+$('#nw',r).value||20)),H=Math.max(5,Math.min(60,+$('#nh',r).value||20));const mm={id:uid(),name:$('#nn',r).value||'Карта',W,H,g:Array(W*H).fill(''),fog:Array(W*H).fill(0),tok:[]};maps.push(mm);mapCur=mm.id;saveMaps();view={s:1,x:0,y:0};closeSheet();rMap()}})}
function mapMenu(){const m=curMap();openSheet(`<div class="sb-title">${esc(m.name)}</div><div class="list" style="margin-top:14px">
  <button class="btn" id="mx1">🖼 Экспорт PNG</button><button class="btn" id="mx2">✎ Переименовать</button><button class="btn" id="mx3">⧉ Дублировать</button><button class="btn" id="mx5">▦ Залить всё полом</button><button class="btn dark" id="mx4">✕ Удалить карту</button></div>`,r=>{
  $('#mx1',r).onclick=()=>exportPNG(m);
  $('#mx2',r).onclick=()=>{const n=prompt('Название',m.name);if(n){m.name=n;saveMaps();closeSheet();rMap()}};
  $('#mx3',r).onclick=()=>{const c=JSON.parse(JSON.stringify(m));c.id=uid();c.name+=' (копия)';maps.push(c);mapCur=c.id;saveMaps();closeSheet();rMap()};
  $('#mx5',r).onclick=()=>{histPush(m);m.g=m.g.map(t=>t||'floor');saveMaps();closeSheet();rMap()};
  $('#mx4',r).onclick=()=>{if(maps.length<2)return toast('Должна остаться хотя бы одна карта');const old=maps.slice();maps=maps.filter(x=>x!==m);mapCur=maps[0].id;saveMaps();closeSheet();rMap();KM.undoToast('Карта «'+m.name+'» удалена',()=>{maps=old;mapCur=m.id;saveMaps();rMap()})}})}
function exportPNG(m){const CS=48,c=document.createElement('canvas');c.width=m.W*CS;c.height=m.H*CS;const g=c.getContext('2d');g.scale(CS/32,CS/32);drawMap(g,m,32,1);
  c.toBlob(b=>{const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=(m.name||'map')+'.png';document.body.append(a);a.click();a.remove();
   openSheet(`<div class="sb-title">Экспорт</div><div class="sb-sub">Зажми картинку, чтобы сохранить в Фото</div><img src="${u}" style="width:100%;margin-top:12px;border-radius:12px">`)},'image/png')}
setTimeout(()=>window.__boot(),0);

;
/* fx.js */
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
   const a=.35+.35*Math.sin(t/400+p.ph);if(p.k===0){g.fillStyle=`rgba(255,60,20,${a*.25})`;g.beginPath();g.arc(p.x,p.y,p.s*3,0,7);g.fill();g.fillStyle=`rgba(255,${90+60*a|0},40,${a})`}else{g.fillStyle=`rgba(200,180,160,${a*.35})`}
   g.beginPath();g.arc(p.x,p.y,p.s,0,7);g.fill()}}
 requestAnimationFrame(tick);applyFx();RM.addEventListener?.('change',applyFx)})();
/* ink press ripple */
document.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||calm()||e.target.closest('input,textarea,select,[contenteditable]'))return;const c=e.target.closest('.card,.btn,.cb');if(!c)return;const r=c.getBoundingClientRect(),s=Math.max(r.width,r.height)*1.2;const i=document.createElement('i');i.className='ink';i.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;if(getComputedStyle(c).position==='static')c.style.position='relative';c.style.overflow='hidden';c.append(i);setTimeout(()=>i.remove(),650)},{passive:true});
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
 openSheet(`<div class="sb-title" data-noshow>Настройки</div><div class="sb-sub">Анимации и эффекты · <span id="kmver">версия …</span></div>${T('calm','Меньше анимации','Отключает пульсации, частицы, переходы чернил и вспышки кубиков. Система «уменьшить движение» учитывается автоматически.')}${T('amb','Угли и пепел','Летящие искры и пыль на фоне страниц.')}
 <div class="muted" style="font-size:12px;margin-top:14px">${RM.matches?'В системе включено «Уменьшение движения» — анимации уже приглушены.':''} Все данные хранятся только на этом устройстве (в памяти браузера).</div>`,r=>{$$('.tog',r).forEach(b=>b.onclick=()=>{const k=b.dataset.k;FXS[k]=!FXS[k];LS.set('fx',FXS);b.classList.toggle('on',FXS[k]);applyFx()})})}
KM.settings=openSettings;
/* cover: blinking eye following touch */
(function(){const cv=$('#cover');if(!cv)return;const f=$('.face',cv);
 f.insertAdjacentHTML('beforeend',`<svg class="eyefx" viewBox="0 0 720 1280" preserveAspectRatio="xMidYMid slice"><defs><clipPath id="eyeC"><path d="M268 728Q320 664 377 664Q440 664 488 728Q440 792 377 794Q318 792 268 728z"/></clipPath><radialGradient id="scl"><stop offset="0" stop-color="#b98468"/><stop offset=".55" stop-color="#a06a52" stop-opacity=".9"/><stop offset="1" stop-color="#5a1a10" stop-opacity="0"/></radialGradient></defs>
 <g clip-path="url(#eyeC)"><ellipse cx="377" cy="727" rx="46" ry="46" fill="url(#scl)"/><image id="irisI" href="${window.KM_PLAYER?'../':''}img/iris.webp" x="337" y="687" width="80" height="80"/>
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

;
/* magic.js */
'use strict';
/* ===== STAGE 4: magic system ===== */
D.spells.forEach(s=>{s.dmg=(s.dmg||'').replace('+ MOD','+ мод.');s.dt=(s.dmg.match(/(кислота|силовое поле|дробящий|рубящий|некротический|излучение|огонь|электричество|яд|холод|психический|колющий|звук)/)||[])[1]||'';
 const m=s.ds.match(/На больших уровнях:[^]*?(\d+)к(\d+)[^]*?выше (\d+)/);if(m&&s.l>0)s.up={n:+m[1],d:+m[2],from:+m[3],step:/кажды[ех] дв/.test(s.ds)?2:1};const ut=s.ds.split('На больших уровнях:')[1];if(ut)s.upTxt=ut.trim()});
const SCHOOLS=['Ограждение','Вызов','Прорицание','Очарование','Воплощение','Иллюзия','Некромантия','Преобразование'];
const SCH_C={'Ограждение':['#7fb6ff','shield'],'Вызов':['#ffb347','gate'],'Прорицание':['#c9a6ff','eye'],'Очарование':['#ff7ac8','heart'],'Воплощение':['#ff5a30','star'],'Иллюзия':['#8affea','spiral'],'Некромантия':['#8cff6a','skull'],'Преобразование':['#ffd84a','tri']};
const DT_C={'огонь':'#ff5a20','холод':'#8fd8ff','электричество':'#b8a0ff','кислота':'#9be33a','яд':'#5fd07a','некротический':'#7a5cff','излучение':'#ffe9a0','силовое поле':'#d0c0ff','психический':'#ff7ad6','звук':'#7ad0ff','дробящий':'#c9b08a','рубящий':'#e0d0c0','колющий':'#e0d0c0'};
const hsh=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const prng=seed=>()=>((seed=Math.imul(seed^seed>>>15,2246822507)+0x6D2B79F5>>>0)/4294967296);
function spellSigil(s,size=100,cls='ssig'){const [col,mot]=SCH_C[s.sc]||['#d9b46a','star'];const r=prng(hsh(s.id));const n=3+Math.floor(r()*6),sk=1+Math.floor(r()*(n-1)/2);let p='';
 const P=(k,R,o=0)=>{const a=-Math.PI/2+k*2*Math.PI/n+o;return [(50+R*Math.cos(a)).toFixed(1),(50+R*Math.sin(a)).toFixed(1)]};
 p+=`<circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="${40-r()*4|0}" stroke-dasharray="${r()<.5?'2 3':'none'}"/>`;
 let d='';for(let i=0;i<=n;i++){const q=P(i*sk%n,36);d+=(i?'L':'M')+q.join(' ')}p+=`<path d="${d}z"/>`;
 for(let i=0;i<n;i++){const q=P(i,36);p+=`<circle cx="${q[0]}" cy="${q[1]}" r="${2+r()*3|0}"/>`;if(r()<.5){const q2=P(i,46);p+=`<path d="M${q.join(' ')}L${q2.join(' ')}"/>`}}
 const M={shield:'M50 30l14 6v10c0 10-6 16-14 20-8-4-14-10-14-20V36z',gate:'M38 66V42a12 12 0 0124 0v24M38 54h24',eye:'M32 50q18-16 36 0-18 16-36 0zM50 45a5 5 0 110 10 5 5 0 010-10',heart:'M50 64C30 50 36 36 44 38c3 1 5 3 6 6 1-3 3-5 6-6 8-2 14 12-6 26z',star:'M50 32l5 12 13 1-10 8 4 13-12-7-12 7 4-13-10-8 13-1z',spiral:'M50 50m-2 0a2 2 0 014 0 6 6 0 01-12 0 10 10 0 0120 0 14 14 0 01-28 0',skull:'M40 56c-6-4-6-20 10-20s16 16 10 20v6H40zM44 50h4M52 50h4M47 62v-4M53 62v-4',tri:'M50 32 66 62H34zM50 44v10'}[mot];
 p+=`<path d="${M}" stroke-width="1.6"/><circle cx="50" cy="50" r="${18+r()*4|0}" opacity=".6"/>`;
 return `<svg class="${cls}" viewBox="0 0 100 100" width="${size}" height="${size}" fill="none" stroke="${col}" stroke-width="1.1" stroke-linecap="round" style="filter:drop-shadow(0 0 3px ${col})">${p}</svg>`}
function spellArt(s){const c=DT_C[s.dt]||(SCH_C[s.sc]||['#d9b46a'])[0];const r=prng(hsh(s.id+'a'));let fx='';
 const t=s.dt;for(let i=0;i<14;i++){const x=(r()*400).toFixed(0),y=(40+r()*100).toFixed(0),h=(20+r()*60).toFixed(0);
  if(t==='огонь')fx+=`<path d="M${x} 160q-${h/3} -${h} 0 -${h*1.6}q${h/3} ${h} 0 ${h*1.6}" fill="${c}" opacity="${.15+r()*.4}"/>`;
  else if(t==='холод')fx+=`<path d="M${x} ${y}l6 -12 6 12 -6 12z M${x} ${y}h12" stroke="${c}" fill="none" opacity=".7"/>`;
  else if(t==='электричество')fx+=`<path d="M${x} 0l-12 ${h}h14l-16 ${h}" stroke="${c}" fill="none" stroke-width="2" opacity=".8"/>`;
  else if(t==='некротический'||t==='яд'||t==='кислота')fx+=`<circle cx="${x}" cy="${y}" r="${h/3}" fill="${c}" opacity="${.08+r()*.18}"/>`;
  else if(t==='излучение')fx+=`<path d="M200 -10L${x} 170" stroke="${c}" opacity="${.1+r()*.3}" stroke-width="${1+r()*4}"/>`;
  else fx+=`<path d="M${x} ${y}a${h/2} ${h/2} 0 1 1 1 0" stroke="${c}" fill="none" opacity="${.15+r()*.3}"/>`}
 return `<div class="sp-art" style="--sc:${c}"><svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="ga"><stop offset="0" stop-color="${c}" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="400" height="160" fill="#0b0605"/><circle cx="200" cy="80" r="140" fill="url(#ga)"/>${fx}</svg><div class="sp-art-sig">${spellSigil(s,128,'ssig big')}</div><div class="sp-art-ring">${runeRing(46,c,24)}</div></div>`}
/* slots */
const FULL=[[2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]];
const CLS_N={'маг':'Волшебник','волшебник':'Волшебник','жрец':'Жрец','клирик':'Жрец','бард':'Бард','друид':'Друид','чародей':'Чародей','колдун':'Колдун','паладин':'Паладин','следопыт':'Следопыт','рейнджер':'Следопыт','изобретатель':'Изобретатель'};
const heroCls=p=>CLS_N[(p.cls||'').toLowerCase().trim()]||'';
function slotTable(c,l){l=Math.max(1,Math.min(20,l||1));if(['Волшебник','Жрец','Бард','Друид','Чародей'].includes(c))return FULL[l-1];
 if(c==='Паладин'||c==='Следопыт'||c==='Изобретатель')return l<2&&c!=='Изобретатель'?[]:FULL[Math.max(0,Math.ceil(l/2)-1)].slice(0,5);
 if(c==='Колдун'){const n=l<2?1:l<11?2:l<17?3:4,lv=Math.min(5,Math.ceil(l/2));const a=Array(lv).fill(0);a[lv-1]=n;return a}return []}
function ensureSlots(p){const t=slotTable(heroCls(p),p.lvl);const o=p.slots||{};p.slots={};t.forEach((n,i)=>{if(n)p.slots[i+1]={max:n,used:Math.min(n,o[i+1]?.used||0)}});p.spells=p.spells||[];p.prep=p.prep||[];return p}
players.forEach(ensureSlots);save();
/* list */
let MF=Object.assign({sc:'',tm:'',conc:'',rit:'',dt:'',cp:'',view:'all',hero:0},LS.get('mf',{}));if(MF.lvl!=null)S.spLvl=MF.lvl;if(MF.cls!=null)S.spCls=MF.cls;
rSpells=function(){page.oninput=null;page.onclick=null;const seg=`<div class="seg" id="mseg"><button data-v="all" class="${MF.view==='all'?'on':''}">Свод заклинаний</button><button data-v="book" class="${MF.view==='book'?'on':''}">Гримуар героя</button></div>`;
 if(MF.view==='book')return rGrimoire(seg);
 page.innerHTML=header('Заклинания','свод чар и заговоров','star',1)+seg+searchBox('spQ','Найти, напр. огненный шар',S.spQ)+
 chips('cls',[['','Все классы'],...[...new Set(CLASSES.concat(D.spells.some(s=>s.cl.includes('Изобретатель'))?['Изобретатель']:[]))].map(c=>[c,c])],S.spCls)+chips('lvl',[['','Все круги'],['0','Заговоры'],...[1,2,3,4,5,6,7,8,9].map(l=>[l,l+'-й круг'])],S.spLvl)+
 `<details class="mfil"${MF.sc||MF.tm||MF.conc||MF.rit||MF.dt||MF.cp?' open':''}><summary>Фильтры: школа, время, концентрация…</summary>`+chips('sc',[['','Любая школа'],...SCHOOLS.map(s=>[s,s])],MF.sc)+chips('tm',[['','Любое время'],['1 действие','Действие'],['1 бонусное действие','Бонусное'],['1 реакция','Реакция'],['long','Минуты и часы']],MF.tm)+
 chips('conc',[['','Концентрация: любая'],['1','Только концентрация'],['0','Без концентрации']],MF.conc)+chips('rit',[['','Ритуал: любой'],['1','Только ритуалы']],MF.rit)+chips('dt',[['','Любой урон'],...Object.keys(DT_C).map(d=>[d,d])],MF.dt)+chips('cp',[['','Любые компоненты'],['noV','Без вербального'],['noS','Без соматического'],['noM','Без материального']],MF.cp)+`</details><div class="list" id="spList"></div>`;
 bindChips(page,(n,v)=>{if(n==='lvl')S.spLvl=MF.lvl=v;else if(n==='cls')S.spCls=MF.cls=v;else MF[n]=v;LS.set('mf',MF);rSpells()});bindSearch('spQ',q=>{S.spQ=q;fillSp()});
 $('#mseg').onclick=e=>{const b=e.target.closest('[data-v]');if(b){MF.view=b.dataset.v;LS.set('mf',MF);rSpells()}};fillSp()};
fillSp=function(){let L=D.spells;let q=S.spQ;if(q){q=q.toLowerCase();const W=q.split(/\s+/).filter(Boolean);L=L.filter(s=>{const h=s._h||(s._h=[s.n,s.sc,s.dt,(s.cl||[]).join(' '),s.dmg,s.conc?'концентрация':'',s.rit?'ритуал':'','круг '+s.l,s.l?'':'заговор'].join(' ').toLowerCase());return W.every(w=>h.includes(w))});L.sort((a,b)=>(b.n.toLowerCase().includes(q)?1:0)-(a.n.toLowerCase().includes(q)?1:0))}if(!q&&S.spLvl!=='')L=L.filter(s=>s.l===+S.spLvl);if(!q&&S.spCls)L=L.filter(s=>s.cl.includes(S.spCls));
 if(MF.sc)L=L.filter(s=>s.sc===MF.sc);if(MF.tm)L=L.filter(s=>MF.tm==='long'?/мин|ч\./.test(s.t):s.t===MF.tm);if(MF.conc)L=L.filter(s=>s.conc===(MF.conc==='1'));if(MF.rit)L=L.filter(s=>s.rit);if(MF.dt)L=L.filter(s=>s.dt===MF.dt);if(MF.cp)L=L.filter(s=>!s.c.includes({noV:'В',noS:'С',noM:'М'}[MF.cp]));
 L=[...L].sort((a,b)=>a.l-b.l||a.n.localeCompare(b.n,'ru'));
 lazyList($('#spList'),L,s=>`<div class="card spc" data-id="${s.id}">${(window.spThumb&&spThumb(s))||spellSigil(s,46,'ssig mini')}<div class="t">${esc(s.n)}</div><span class="badge">${s.l===0?'заговор':s.l+' круг'}</span><div class="m">${esc(s.sc)} · ${esc(s.t)}${s.conc?' · <span class="hand">концентрация</span>':''}${s.rit?' · ритуал':''}</div>${s.dmg?`<div class="m" style="color:${DT_C[s.dt]||'#ff7d74'}">${esc(s.dmg)}</div>`:''}</div>`);
 $('#spList').onclick=e=>{const c=e.target.closest('.card');if(c)showSpell(c.dataset.id)}};
const _showSpell=showSpell;
showSpell=function(id,slot){const s=D.spells.find(x=>x.id===id);_showSpell(id);const sp=$('#sheetPage');$('.sp-circle',sp)?.remove();
 const ra=$('.spx-art',sp);if(ra)sp.prepend(ra);else{sp.insertAdjacentHTML('afterbegin',spellArt(s));drawSigils(sp);$$('.ssig.big *',sp).forEach(p=>p.setAttribute('pathLength','1'));$('.ssig.big',sp).classList.add('draw')}
 const lv=slot||Math.max(1,s.l);const base=(s.dmg.match(/(\d+)к(\d+)/)||[]);
 let up='';if(s.l>0){up=`<div class="sec-h">Ячейка и усиление</div><div class="chips" id="slv">${[1,2,3,4,5,6,7,8,9].filter(l=>l>=s.l).map(l=>`<button class="chip${l===lv?' on':''}" data-l="${l}">${l} круг</button>`).join('')}</div>`;
  if(s.up&&!base[1]){const ex=Math.floor(Math.max(0,lv-s.up.from)/s.up.step)*s.up.n;up+=`<div class="scal">${/лечен|восстанавл|хит/i.test(s.ds)&&!s.dt?"Лечение":"Доп. кубы"} на ${lv} круге: <b>+${ex}к${s.up.d}</b></div>`}else if(s.upTxt&&!s.up){const g=s.upTxt.match(/\+(\d+)\s+(.+?) за (?:каждый )?уровень ячейки выше (\d+)/);up+=`<div class="scal">${g?`На ${lv} круге: <b>+${Math.max(0,lv-g[3])*g[1]}</b> ${esc(g[2])}`:esc(s.upTxt)}</div>`}
  if(s.up&&base[1]){const extra=Math.floor(Math.max(0,lv-s.up.from)/s.up.step)*s.up.n;up+=`<div class="scal">Урон на ${lv} круге: <b>${esc(s.dmg.replace(/(\d+)к(\d+)/,(a,n,d)=>s.up.d==+d?(+n+extra)+'к'+d:a+(extra?` + ${extra}к${s.up.d}`:'')))}</b></div>`}}
 const casters=players.map((p,i)=>[p,i]).filter(([p])=>Object.keys(p.slots||{}).length||s.l===0);
 sp.insertAdjacentHTML('beforeend',up+`<div class="sec-h">Сотворить</div><div class="row">${casters.map(([p,i])=>`<button class="btn ${s.l?'red':''}" data-cast="${i}">✦ Каст: ${esc(p.name)}${s.l?` <small>(${(p.slots[lv]?p.slots[lv].max-p.slots[lv].used:0)} яч.)</small>`:''}</button>`).join('')||'<span class="muted">У героев нет ячеек — укажи класс (напр. «Волшебник») и уровень в «Героях».</span>'}</div>
  <div class="row" style="margin-top:8px">${players.map((p,i)=>`<button class="btn sm" data-learn="${i}">${p.spells?.includes(s.id)?'✓ ':'＋ '}${esc(p.name)}</button>`).join('')}</div><div class="muted" style="font-size:12px">«＋ Имя» — добавить в гримуар героя.</div>`);
 const sl=$('#slv',sp);if(sl)sl.onclick=e=>{const b=e.target.closest('[data-l]');if(b){const st=sp.scrollTop;showSpell(id,+b.dataset.l);$('#sheetPage').scrollTop=st}};
 $$('[data-cast]',sp).forEach(b=>b.onclick=()=>castSpell(players[+b.dataset.cast],s,lv));
 $$('[data-learn]',sp).forEach(b=>b.onclick=()=>{const p=players[+b.dataset.learn];p.spells=p.spells||[];if(p.spells.includes(s.id))p.spells=p.spells.filter(x=>x!==s.id);else{if(window.guardSpell&&!guardSpell(p,s))return;p.spells.push(s.id)}save();b.textContent=(p.spells.includes(s.id)?'✓ ':'＋ ')+p.name;toast(p.spells.includes(s.id)?`«${s.n}» в гримуаре ${p.name}`:'Убрано из гримуара')})};
function castSpell(p,s,lv){if(s.l===0){toast(`${p.name} творит «${s.n}»`);KM.logS&&KM.logS(`${p.name}: «${s.n}» (заговор)`);return}
 let L=lv;while(L<=9&&!(p.slots[L]&&p.slots[L].used<p.slots[L].max))L++;if(L>9)return toast(`У ${p.name} нет свободных ячеек ${lv}+ круга`);
 p.slots[L].used++;save();if(L!==lv)toast(`Ячеек ${lv} круга нет — потрачена ячейка ${L} круга`);else toast(`${p.name}: «${s.n}» — ячейка ${L} круга потрачена`);KM.logS&&KM.logS(`${p.name}: «${s.n}» ячейкой ${L} круга`);
 if(s.conc&&!p.conds.includes('Концентрация')){p.conds.push('Концентрация');save()}if(!calm()){const b=document.createElement('div');b.className='fx-burst';b.innerHTML=spellSigil(s,300,'ssig');document.body.append(b);setTimeout(()=>b.remove(),1600)}closeSheet()}
function rGrimoire(seg){const p=players[MF.hero]||players[0];if(!p){page.innerHTML=header('Гримуар','книга заклинаний героя','star',1)+seg+'<div class="empty">Нет героев</div>';return}ensureSlots(p);
 const L=(p.spells||[]).map(id=>D.spells.find(s=>s.id===id)).filter(Boolean).sort((a,b)=>a.l-b.l||a.n.localeCompare(b.n,'ru'));const by={};L.forEach(s=>(by[s.l]=by[s.l]||[]).push(s));
 page.innerHTML=header('Гримуар','книга заклинаний героя','star',1)+seg+chips('hero',players.map((h,i)=>[i,h.name]),MF.hero)+
 `<div class="gslots">${Object.entries(p.slots).map(([l,sl])=>`<div class="gsl"><small>${l} круг</small><div>${[...Array(sl.max)].map((_,k)=>`<button class="pip${k<sl.max-sl.used?' on':''}" data-sl="${l}" data-k="${k}" aria-label="Ячейка"></button>`).join('')}</div></div>`).join('')||`<div class="muted">Нет ячеек. Класс «${esc(p.cls)}» ${p.lvl} ур. — укажи заклинательный класс в «Героях».</div>`}</div>
 <div class="muted" style="font-size:12px;margin:-4px 0 10px">Тап по ячейке — потратить/вернуть. Продолжительный отдых в «Сессии» восстанавливает всё.</div>`+
 (L.length?Object.entries(by).map(([l,a])=>`<div class="sec-h">${l==0?'Заговоры':l+' круг'}</div><div class="list">${a.map(s=>`<div class="card spc gr${p.prep.includes(s.id)?' prep':''}" data-id="${s.id}">${(window.spThumb&&spThumb(s))||spellSigil(s,46,'ssig mini')}<div class="t">${esc(s.n)}</div><button class="badge prepb" data-prep="${s.id}">${p.prep.includes(s.id)?'✦ подготовлено':'не подготовлено'}</button><div class="m">${esc(s.t)} · ${esc(s.r)}${s.conc?' · концентрация':''}</div></div>`).join('')}</div>`).join(''):`<div class="empty">Гримуар пуст. Открой заклинание в «Своде» и нажми «＋ ${esc(p.name)}».</div>`);
 bindChips(page,(n,v)=>{MF.hero=+v;LS.set('mf',MF);rSpells()});$('#mseg').onclick=e=>{const b=e.target.closest('[data-v]');if(b){MF.view=b.dataset.v;LS.set('mf',MF);rSpells()}};
 page.onclick=e=>{const pp=e.target.closest('[data-prep]');if(pp){e.stopPropagation();const id=pp.dataset.prep;p.prep=p.prep.includes(id)?p.prep.filter(x=>x!==id):[...p.prep,id];save();rSpells();return}
  const pi=e.target.closest('.pip');if(pi){const sl=p.slots[pi.dataset.sl];const on=pi.classList.contains('on');sl.used=Math.max(0,Math.min(sl.max,sl.used+(on?1:-1)));save();rSpells();return}
  const c=e.target.closest('.card');if(c)showSpell(c.dataset.id)}}
KM.spellSigil=spellSigil;KM.ensureSlots=ensureSlots;
KM.showSpell=(...a)=>showSpell(...a);KM.closeSheet=()=>closeSheet();KM.save=()=>save();if(!("players" in KM))KM.players=players;
KM.SECTIONS=SECTIONS;

;
/* npcs.js */
'use strict';
/* ===== STAGE 5: cast of NPCs ===== */
const CAST=(window.NPC_RAW||'').trim().split('\n').map((l,i)=>{const f=l.split('|');return {id:'c'+i,n:f[0],r:f[1],look:f[2],nat:f[3],quirk:f[4],mot:f[5],sec:f[6],ph:f[7].split(';'),hook:f[8],stat:f[9],base:true}});
let ownCast=LS.get('cast',[]);let npcRel=LS.get('npcrel',{});let npcLinks=LS.get('npclinks',{});
const saveCast=()=>{LS.set('cast',ownCast);LS.set('npcrel',npcRel);LS.set('npclinks',npcLinks)};
const allCast=()=>[...ownCast,...CAST];const findCast=id=>allCast().find(c=>c.id===id);
function npcSigil(c,size=56){const r=prng(hsh(c.id+c.n));const hue=Math.floor(r()*360);const col=`hsl(${hue},55%,62%)`,dk=`hsl(${hue},40%,18%)`;
 const hood=r()<.5,horns=/тифлинг|драконо/.test(c.r),ears=/эльф/.test(c.r),beard=/дварф/.test(c.r)||r()<.2;const ey=46+r()*4,ew=7+r()*4;
 let p=`<circle cx="50" cy="50" r="47" fill="${dk}" stroke="${col}" stroke-width="1.5"/>`;
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;p+=`<path d="M${50+43*Math.cos(a)} ${50+43*Math.sin(a)}l${2*Math.cos(a+1.6)} ${2*Math.sin(a+1.6)}" stroke="${col}"/>`}
 if(hood)p+=`<path d="M22 86C20 50 30 18 50 16s30 34 28 70" fill="#0a0605" stroke="${col}" stroke-width="1.2"/>`;
 if(horns)p+=`<path d="M34 30q-10-16 2-22M66 30q10-16-2-22" stroke="${col}" stroke-width="2.5" fill="none"/>`;
 if(ears)p+=`<path d="M30 46l-12-8 12 16M70 46l12-8-12 16" stroke="${col}" fill="none"/>`;
 p+=`<ellipse cx="50" cy="50" rx="${17+r()*4}" ry="${22+r()*3}" fill="#120a08" stroke="${col}" stroke-width="1.3"/>`;
 const et=Math.floor(r()*4);[50-ew,50+ew].forEach((x,k)=>{p+=et===0?`<circle cx="${x}" cy="${ey}" r="2.6" fill="${col}"/>`:et===1?`<path d="M${x-4} ${ey}q4-4 8 0q-4 4-8 0" fill="${col}"/>`:et===2?`<path d="M${x-4} ${ey}h8" stroke="${col}" stroke-width="2"/>`:`<circle cx="${x}" cy="${ey}" r="3.2" fill="none" stroke="${col}"/><circle cx="${x}" cy="${ey}" r="1" fill="#d42a22"/>`;if(k&&r()<.25)p+=`<path d="M${x-5} ${ey-8}l10 14" stroke="#d42a22" stroke-width="1.2"/>`});
 const my=60+r()*3;p+=r()<.5?`<path d="M44 ${my}q6 ${r()<.5?4:-3} 12 0" stroke="${col}" fill="none"/>`:`<path d="M44 ${my}h12" stroke="${col}"/>`;
 if(beard)p+=`<path d="M36 58q14 34 28 0" stroke="${col}" fill="none" stroke-dasharray="2 2"/>`;
 p+=`<text x="50" y="96" text-anchor="middle" font-size="9" fill="${col}" font-family="serif">${esc(c.n[0])}</text>`;
 return `<svg class="nsig" viewBox="0 0 100 100" width="${size}" height="${size}" style="filter:drop-shadow(0 0 4px ${col})">${p}</svg>`}
const REL=[['-2','Враг'],['-1','Неприязнь'],['0','Нейтрален'],['1','Дружелюбен'],['2','Союзник']];
let npcView=LS.get('npcview','beasts');let castQ='';
const _rNpc=rNpc;
rNpc=function(){page.oninput=null;page.onclick=null;
 if(npcView==='beasts'){_rNpc();$('.ph',page).insertAdjacentHTML('afterend',npcSeg());bindNpcSeg();return}
 if(npcView==='leg')return rLeg();
 page.innerHTML=header('НПС','обычные жители, слуги и встречные','eye',0)+npcSeg()+`<div class="row"><div class="grow">${searchBox('castQ','Найти, напр. кузнец',castQ)}</div><button class="btn red" id="rndNpc">🎲 Случайный</button></div><div class="row" style="margin:-2px 0 8px"><button class="btn sm dark" id="newCast">＋ Свой персонаж</button></div>${chips('castsort',[['','Как есть'],['n','А–Я'],['rel','Отношение'],['own','Мои сначала']],LS.get('castsort',''))}<div class="list" id="castList"></div>`;
 bindNpcSeg();bindSearch('castQ',q=>{castQ=q;fillCast()});bindChips(page,(n,v)=>{if(n==='castsort'){LS.set('castsort',v);fillCast()}});$('#rndNpc').onclick=()=>{const L=allCast().filter(x=>x&&x.id);if(!L.length)return;const c=L[Math.floor(Math.random()*L.length)];showCast(c.id)};$('#newCast').onclick=()=>editCast();fillCast()};
const npcSeg=()=>`<div class="seg" id="nseg"><button data-nv="beasts" class="${npcView==='beasts'?'on':''}">Бестиарий</button><button data-nv="cast" class="${npcView==='cast'?'on':''}">НПС (${allCast().length})</button><button data-nv="leg" class="${npcView==='leg'?'on':''}">Персонажи (${(window.LEGENDS||[]).length})</button></div>`;
function bindNpcSeg(){$('#nseg').onclick=e=>{const b=e.target.closest('[data-nv]');if(b){npcView=b.dataset.nv;LS.set('npcview',npcView);rNpc()}}}
function fillCast(){const q=castQ.toLowerCase();const L=allCast().filter(c=>!q||(c.n+' '+c.r+' '+c.look+' '+c.mot).toLowerCase().includes(q));const cs=LS.get('castsort','');if(cs==='n')L.sort((a,b)=>a.n.localeCompare(b.n,'ru'));else if(cs==='rel')L.sort((a,b)=>Math.abs(npcRel[b.id]?.v||0)-Math.abs(npcRel[a.id]?.v||0)||(npcRel[b.id]?.v||0)-(npcRel[a.id]?.v||0));else if(cs==='own')L.sort((a,b)=>(a.base?1:0)-(b.base?1:0));
 lazyList($('#castList'),L,c=>{const rel=npcRel[c.id]?.v||0;return `<div class="card cast${c.base?'':' own'}" data-cid="${c.id}">${avHtml(c,52)}<div class="t">${esc(c.n)}</div>${rel?`<span class="badge rel${rel}">${REL.find(x=>+x[0]===rel)[1]}</span>`:''}<div class="m">${esc(c.r)}</div><div class="m hand" style="opacity:.8">«${esc(c.ph[0])}»</div></div>`});
 $('#castList').onclick=e=>{const c=e.target.closest('[data-cid]');if(c)showCast(c.dataset.cid)}}
function showCast(id){const c=findCast(id);if(!c)return;const rel=npcRel[id]||{v:0,t:''};const lk=npcLinks[id]||{items:[],spells:[]};const mon=D.monsters.find(m=>m.id===c.stat);
 openSheet(`<div class="cast-head">${avHtml(c,110)}<div><div class="sb-title">${esc(c.n)}</div><div class="sb-sub">${esc(c.r)}</div></div></div>
 <div class="fld bio" style="font-style:italic;opacity:.92">${esc(castBio(c,mon))}</div><div class="fld"><b>Внешность.</b> ${esc(c.look)}</div><div class="fld"><b>Характер.</b> ${esc(c.nat)}</div><div class="fld"><b>Манера речи.</b> ${esc(c.quirk)}</div><div class="fld"><b>Чего хочет.</b> ${esc(c.mot)}</div>
 <details class="fld secret"><summary>🔒 Тайна (только для Мастера)</summary>${esc(c.sec)}</details>
 <div class="sec-h">Фразы</div>${c.ph.map(p=>`<div class="phr hand">«${esc(p)}»</div>`).join('')}
 <div class="sec-h">Завязка</div><div class="fld">${esc(c.hook)}</div>
 <div class="sec-h">Отношение к отряду</div>${chips('rel',REL,rel.v)}<textarea class="inp" id="relT" rows="2" placeholder="Заметка, напр. должен Борину 10 зм">${esc(rel.t)}</textarea>
 <div class="sec-h">Связи</div><div class="row">${lk.items.map(i=>`<button class="chip" data-li="${i}">◆ ${esc((D.items.find(x=>x.id===i)||{n:i}).n)}</button>`).join('')}${lk.spells.map(i=>`<button class="chip" data-ls="${i}">✦ ${esc((D.spells.find(x=>x.id===i)||{n:i}).n)}</button>`).join('')}</div>
 <div class="row"><input class="inp grow" id="lnkQ" placeholder="Привязать предмет или заклинание, напр. посох"></div><div id="lnkR"></div>
 ${mon&&KM.kit?KM.kit.html(mon):''}<div class="sec-h">В игру</div><div class="row"><button class="btn red" id="cScene">＋ В сцену</button><button class="btn" id="cInit">⚔ В инициативу</button><button class="btn" id="cMap">◉ На карту</button><button class="btn" id="cSpl">✧ Заклинания</button>${mon?`<button class="btn dark" id="cStat">Статблок: ${esc(mon.n)}</button>`:''}</div>
 ${c.base?'':`<div class="row" style="margin-top:12px"><button class="btn sm dark" id="cEd">Изменить</button><button class="btn sm dark" id="cDel">🗑 Удалить</button></div>`}`,r=>{
  bindChips(r,(n,v)=>{npcRel[id]={...rel,v:+v};rel.v=+v;saveCast();$$('[data-chips=rel] .chip',r).forEach(b=>b.classList.toggle('on',b.dataset.v===v))});
  mon&&KM.kit&&KM.kit.bind(r,()=>showCast(id));
  $('#relT',r).onchange=e=>{rel.t=e.target.value;npcRel[id]=rel;saveCast()};
  {const b=$('#cSpl',r);if(b&&KM.csp)b.onclick=()=>KM.csp.edit('n:'+id,c.n,()=>showCast(id))}
  $('#cScene',r).onclick=()=>{if(typeof sess!=="undefined"){sess.npcs.includes(c.n)||sess.npcs.push(c.n);LS.set('sess',sess)}toast(`${c.n} — в сцене`)};
  $('#cInit',r).onclick=()=>{const m=mon?{...mon,n:c.n}:{n:c.n,ac:10,hp:4,init:0};addCombatant(m);toast(`${c.n} в инициативе`)};
  $('#cMap',r).onclick=()=>{try{const m=curMap();m.tok.push({id:uid(),x:Math.floor(m.W/2),y:Math.floor(m.H/2),n:c.n.slice(0,2),c:'#5aa2ff',k:'npc'});saveMaps();toast(`${c.n} на карте`)}catch(e){toast('Сначала открой карту')}};
  mon&&($('#cStat',r).onclick=()=>showMon(mon.id));
  $('#lnkQ',r).oninput=e=>{const q=e.target.value.toLowerCase();if(q.length<2){$('#lnkR',r).innerHTML='';return}const L=[...D.items.filter(i=>i.n.toLowerCase().includes(q)).slice(0,5).map(i=>['i',i]),...D.spells.filter(s=>s.n.toLowerCase().includes(q)).slice(0,5).map(s=>['s',s])];
   $('#lnkR',r).innerHTML=L.map(([t,o])=>`<button class="chip" data-add="${t}:${o.id}">${t==='i'?'◆':'✦'} ${esc(o.n)}</button>`).join('')};
  r.onclick=e=>{const a=e.target.closest('[data-add]');if(a){const[t,i]=a.dataset.add.split(':');lk[t==='i'?'items':'spells'].push(i);npcLinks[id]=lk;saveCast();showCast(id);return}
   const li=e.target.closest('[data-li]');if(li)return showItem(li.dataset.li);const ls=e.target.closest('[data-ls]');if(ls)return showSpell(ls.dataset.ls)};
  if(!c.base){$('#cEd',r).onclick=()=>editCast(c);$('#cDel',r).onclick=()=>{const i=ownCast.indexOf(c);ownCast.splice(i,1);saveCast();closeSheet();rNpc();KM.undoToast(`«${c.n}» удалён`,()=>{ownCast.splice(i,0,c);saveCast();rNpc()})}}})}
function castBio(c,mon){if(c.bio)return c.bio;const st=s=>String(s||'').trim().replace(/[.!]+$/,'');const lo=s=>{s=st(s);return s?s[0].toLowerCase()+s.slice(1):''};
 const r=st(c.r).split('·').map(x=>x.trim()).filter(Boolean);const role=r.length>1?`${r.slice(1).join(', ')} (${r[0]})`:(r[0]||'житель');
 return `${c.n} — ${role}${mon?`, в бою как «${mon.n}» (ПО ${crTxt(mon.cr)})`:''}. ${st(c.nat)?st(c.nat)+'. ':''}${c.mot?'Добивается одного: '+lo(c.mot)+'.':''}`}
const SYL=['ра','ве','мир','бо','сла','гор','ди','ан','ти','ла','ке','зор','ми','на','ву','лен','ар','то','се','рин','мо','ха','ель','дан'];
function randomNpc(){const R=a=>a[Math.floor(Math.random()*a.length)];const L=CAST;const nm=(R(SYL)+R(SYL)+(Math.random()<.5?R(SYL):'')).replace(/^./,x=>x.toUpperCase());
 const c={id:'u'+uid(),n:nm+' '+R(L).n.split(' ').slice(1).join(' '),r:R(L).r,look:R(L).look,nat:R(L).nat,quirk:R(L).quirk,mot:R(L).mot,sec:R(L).sec,ph:[R(L).ph[0],R(L).ph[1]||R(L).ph[0],R(L).ph[2]||R(L).ph[0]],hook:R(L).hook,stat:R(L).stat};c.n=c.n.trim();ownCast.unshift(c);saveCast();if(npcView==='cast')fillCast();return c}
function editCast(c){const n=c||{id:'u'+uid(),n:'',r:'',look:'',nat:'',quirk:'',mot:'',sec:'',ph:[''],hook:'',stat:'commoner'};const F=[['n','Имя','напр. Мирон Кривой'],['r','Раса и роль','напр. человек · мельник'],['look','Внешность','напр. мука в бороде'],['nat','Характер','напр. ворчлив, но добр'],['quirk','Манера речи','напр. говорит пословицами'],['mot','Чего хочет','напр. вернуть дочь'],['sec','Тайна','напр. сам продал мельницу'],['ph','Фразы через «;»','напр. Мука — не мука!'],['hook','Завязка','напр. по ночам мельница крутится сама']];
 openSheet(`<div class="sb-title">${c?'Изменить персонажа':'Новый персонаж'}</div>${F.map(([k,l,p])=>`<label class="lbl">${l}</label><textarea class="inp" rows="${k==='n'||k==='r'?1:2}" data-f="${k}" placeholder="${p}">${esc(k==='ph'?n.ph.join(';'):n[k])}</textarea>`).join('')}<label class="lbl">Статблок</label><select class="inp" id="cStatS">${D.monsters.filter(m=>m.ty&&m.ty.startsWith('гуманоид')).map(m=>`<option value="${m.id}"${m.id===n.stat?' selected':''}>${esc(m.n)}</option>`).join('')}</select><button class="btn red" id="cSave" style="margin-top:12px">Сохранить</button>`,r=>{
  $('#cSave',r).onclick=()=>{$$('[data-f]',r).forEach(t=>{n[t.dataset.f]=t.dataset.f==='ph'?t.value.split(';').map(s=>s.trim()).filter(Boolean):t.value.trim()});if(!n.ph.length)n.ph=['…'];n.stat=$('#cStatS',r).value;if(!n.n)return toast('Нужно имя');if(!c)ownCast.unshift(n);saveCast();showCast(n.id);if(npcView==='cast')rNpc()}})}

/* ===== Уникальные персонажи (data/legends.js) ===== */
let legCat=LS.get('legcat',''),legSort=LS.get('legsort','n'),legQ='';
const LEG=()=>window.LEGENDS||[];
function rLeg(){const cats=[...new Set(LEG().map(m=>m.L.cat))];
 page.innerHTML=header('Персонажи','короли, боги, демоны, легенды','eye',0)+npcSeg()+`<div class="row"><div class="grow">${searchBox('legQ','Найти, напр. король',legQ)}</div><button class="btn red" id="rndLeg">🎲</button></div>`+
 chips('legcat',[['','Все'],...cats.map(c=>[c,c])],legCat)+`<div class="row" style="margin:4px 0 8px">${chips('legsort',[['n','А–Я'],['cr','ПО ↑'],['crd','ПО ↓']],legSort)}</div><div class="list" id="legList"></div>`;
 bindNpcSeg();bindSearch('legQ',q=>{legQ=q;fillLeg()});
 bindChips(page,(n,v)=>{if(n==='legcat'){legCat=v;LS.set('legcat',v)}else if(n==='legsort'){legSort=v;LS.set('legsort',v)}fillLeg()});
 $('#rndLeg').onclick=()=>{const L=LEG();if(L.length)showLeg(L[Math.floor(Math.random()*L.length)].id)};fillLeg()}
function fillLeg(){const q=legQ.toLowerCase();let L=LEG().filter(m=>(!legCat||m.L.cat===legCat)&&(!q||(m.n+' '+m.L.title+' '+m.L.cat+' '+m.ty).toLowerCase().includes(q)));
 L=[...L].sort(legSort==='n'?(a,b)=>a.n.localeCompare(b.n,'ru'):legSort==='cr'?(a,b)=>a.cr-b.cr||a.n.localeCompare(b.n,'ru'):(a,b)=>b.cr-a.cr||a.n.localeCompare(b.n,'ru'));
 const el=$('#legList');if(!L.length){el.innerHTML='<div class="muted">Никого не нашлось</div>';el.onclick=null;return}
 lazyList(el,L,m=>`<div class="card cast leg" data-lid="${m.id}">${avHtml(m,52)}<div class="t">${esc(m.n)}</div><span class="badge">ПО ${crTxt(m.cr)}</span><div class="m">${esc(m.L.title)} · ${esc(m.L.cat)}</div><div class="m hand" style="opacity:.8">«${esc(m.L.ph[0])}»</div></div>`);
 el.onclick=e=>{const c=e.target.closest('[data-lid]');if(c)showLeg(c.dataset.lid)}}
function showLeg(id){const m=LEG().find(x=>x.id===id);if(!m)return;const L=m.L;
 openSheet(`<div class="cast-head">${avHtml(m,110)}<div><div class="sb-title">${esc(m.n)}</div><div class="sb-sub">${esc(L.title)}</div><div class="sb-sub">${esc(L.cat)} · ${esc(m.sz)} ${esc(m.ty)} · ПО ${crTxt(m.cr)} · КД ${m.ac} · ${m.hp} хитов</div></div></div>
 ${KM.kit?KM.kit.bio(m):''}<div class="kb-tip" style="margin:6px 0">🗡 <b>Тактика:</b> ${esc(L.tac)}</div>
 <div class="fld"><b>Внешность.</b> ${esc(L.look)}</div><div class="fld"><b>Характер.</b> ${esc(L.nat)}</div><div class="fld"><b>Манера речи.</b> ${esc(L.quirk)}</div><div class="fld"><b>Чего хочет.</b> ${esc(L.mot)}</div><div class="fld"><b>История.</b> ${esc(L.hist)}</div>
 <details class="fld secret"><summary>🔒 Тайна (только для Мастера)</summary>${esc(L.sec)}</details>
 <div class="sec-h">Фразы</div>${L.ph.map(p=>`<div class="phr hand">«${esc(p)}»</div>`).join('')}
 <div class="sec-h">Завязка</div><div class="fld">${esc(L.hook)}</div>
 ${KM.kit?KM.kit.html(m):''}<div class="sec-h">В игру</div><div class="row"><button class="btn red" id="lFight">⚔ В бой</button><button class="btn dark" id="lStat">Статблок</button><button class="btn" id="lScene">＋ В сцену</button></div>`,r=>{
  KM.kit&&KM.kit.bind(r,()=>showLeg(id));$('#lFight',r).onclick=()=>{addCombatant(m);toast(`${m.n} — в инициативе`)};
  $('#lStat',r).onclick=()=>showMon(m.id);
  $('#lScene',r).onclick=()=>{if(typeof sess!=="undefined"){sess.npcs.includes(m.n)||sess.npcs.push(m.n);LS.set('sess',sess)}toast(`${m.n} — в сцене`)}})}
Object.assign(KM,{CAST,allCast,showCast,randomNpc,npcSigil,showLeg,LEGENDS:LEG});

;
/* ink.js */
'use strict';
/* ===== Ink grimoire seals: hand-inked, wobbly, sepia & dried blood; cached to bitmaps ===== */
const INK={bone:'#cbb48a',blood:'#7e2116',faded:'#8d7a5c'};
const SCH_INK={'Ограждение':['#c4bca2',4,2,'sat'],'Вызов':['#cdb389',5,2,'moon'],'Прорицание':['#d0be8e',6,2,'sun'],'Очарование':['#c6a796',7,3,'ven'],'Воплощение':['#c79f78',3,1,'mars'],'Иллюзия':['#b6b4a2',9,4,'merc'],'Некромантия':['#a9a58a',5,2,'sat'],'Преобразование':['#cbae72',8,3,'jup']};
const F=n=>n.toFixed(1);
function inkKit(seed){const r=prng(seed>>>0||1);const j=a=>(r()-.5)*a;
 const line=(x1,y1,x2,y2,w=.9)=>{const mx=(x1+x2)/2+j(1.6),my=(y1+y2)/2+j(1.6);return `M${F(x1+j(.5))} ${F(y1+j(.5))}Q${F(mx)} ${F(my)} ${F(x2+j(.5))} ${F(y2+j(.5))}`};
 const circ=(cx,cy,R,n=40,gap=0)=>{let d='';const ph=r()*6.28,st=gap?Math.floor(n*(1-gap)):n;for(let i=0;i<=st;i++){const a=ph+i/n*Math.PI*2,rr=R+j(R*.025)+Math.sin(a*3+ph)*R*.01;d+=(i?'L':'M')+F(cx+rr*Math.cos(a))+' '+F(cy+rr*Math.sin(a))}return d};
 const glyph=(x,y,s,rot)=>{let d='';const k=Math.floor(r()*6);const P=(a,b)=>{const c=Math.cos(rot),si=Math.sin(rot);return [x+(a*c-b*si)*s,y+(a*si+b*c)*s]};const L=(a,b,c2,d2)=>{const p=P(a,b),q=P(c2,d2);d+=line(p[0],p[1],q[0],q[1])};
  L(0,-1,0,1);if(k===0){L(0,-1,.6,-.4);L(0,-.2,.6,.4)}else if(k===1){L(-.5,-.6,.5,.2)}else if(k===2){L(0,0,.6,-.6);L(0,0,-.6,-.6)}else if(k===3){L(-.5,1,.5,1);L(0,-.3,.5,-.8)}else if(k===4){const p=P(.4,-.6);d+=`M${F(p[0]+.9*s)} ${F(p[1])}a${F(.4*s)} ${F(.4*s)} 0 1 0 .1 0`}else{L(0,-1,-.6,-.2);L(-.6,-.2,.2,.3)}return d};
 const band=(R,n)=>{let d='';for(let i=0;i<n;i++){const a=i/n*Math.PI*2+r()*.04;d+=glyph(50+R*Math.cos(a),50+R*Math.sin(a),2.1,a+Math.PI/2)}return d};
 const star=(n,k,R,rot=-Math.PI/2)=>{let d='';const pts=[...Array(n)].map((_,i)=>[50+R*Math.cos(rot+i*2*Math.PI/n),50+R*Math.sin(rot+i*2*Math.PI/n)]);if(k<2){pts.forEach((p,i)=>{const q=pts[(i+1)%n];d+=line(p[0],p[1],q[0],q[1])})}else{const g=(a,b)=>b?g(b,a%b):a;const cyc=g(n,k);for(let c=0;c<cyc;c++){let i=c;do{const q=(i+k)%n;d+=line(pts[i][0],pts[i][1],pts[q][0],pts[q][1]);i=q}while(i!==c)}}return [d,pts]};
 const ball=(x,y,R=1.3)=>circ(x,y,R,10);
 return {r,j,line,circ,glyph,band,star,ball}}
const PLAN={sat:'M-2-8v13M-5-5h6M-2 0q6-4 6 3q0 4-3 6',jup:'M-6-4q4-5 5 1q0 3-5 6h11M3-8v14',mars:'M2-2l6-6M5-8h3v3',sun:'',ven:'M0 1v8M-3 5h6',merc:'M0 1v8M-3 5h6M-4-11q4 4 8 0',moon:'M2-7a7 7 0 1 0 0 14a5 5 0 1 1 0-14'};
function planet(K,key,x,y,s){const t=`translate(${x} ${y}) scale(${s})`;let d=PLAN[key]||'';let extra='';if(key==='sun')extra=`<path transform="${t}" d="${K.circ(0,0,6,24)}"/><circle transform="${t}" r="1.2" fill="currentColor"/>`;if(key==='ven'||key==='merc')extra=`<path transform="${t}" d="${K.circ(0,-3,4,20)}"/>`;if(key==='mars')extra=`<path transform="${t}" d="${K.circ(-2,2,4.5,20)}"/>`;return `<path transform="${t}" d="${d}"/>`+extra}
function nameSigil(K,text,R){const A='абвгдеёжзийклмнопрстуфхцчшщъыьэюя';const ch=[...text.toLowerCase()].map(c=>A.indexOf(c)).filter(i=>i>=0).slice(0,9);if(ch.length<3)ch.push(3,17,29);
 const pts=ch.map(i=>{const a=-Math.PI/2+i/A.length*Math.PI*2;const rr=R*(.45+((i*7)%5)/8);return [50+rr*Math.cos(a),50+rr*Math.sin(a)]});let d='';
 for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]];const mx=(a[0]+b[0])/2+K.j(10),my=(a[1]+b[1])/2+K.j(10);d+=`M${F(a[0])} ${F(a[1])}Q${F(mx)} ${F(my)} ${F(b[0])} ${F(b[1])}`;if(K.r()<.35){const nx=b[1]-a[1],ny=a[0]-b[0],l=Math.hypot(nx,ny)||1;d+=K.line(mx-nx/l*4,my-ny/l*4,mx+nx/l*4,my+ny/l*4)}}
 const s=pts[0],e=pts[pts.length-1],p=pts[pts.length-2];const nx=e[1]-p[1],ny=p[0]-e[0],l=Math.hypot(nx,ny)||1;d+=K.ball(s[0],s[1],2)+K.line(e[0]-nx/l*5,e[1]-ny/l*5,e[0]+nx/l*5,e[1]+ny/l*5);return d}
/* main seal: kind spell|npc|item ; returns svg markup */
function inkSealSvg(o){const K=inkKit(hsh(o.key));const S=SCH_INK[o.school]||['#c9b48a',5+Math.floor(K.r()*4),2,['sat','jup','mars','ven','merc','moon','sun'][Math.floor(K.r()*7)]];const ink=o.ink||S[0];
 let a=K.circ(50,50,46.5,60)+K.circ(50,50,40.5,56,K.r()<.3?.04:0)+K.band(43.5,o.kind==='npc'?22:26);
 const [st,pts]=K.star(S[1],S[2],o.kind==='npc'?26:36,o.school==='Некромантия'?Math.PI/2:-Math.PI/2);
 let b=st+pts.map(p=>K.ball(p[0],p[1],1.4)).join('')+K.circ(50,50,o.kind==='npc'?30:20,36);
 if(o.kind!=='npc'&&K.r()<.6)b+=K.circ(50,50,24,40);
 const c=nameSigil(K,o.name||o.key,o.kind==='npc'?24:16);
 const bl=o.blood?`<path d="${K.circ(50+K.j(30),50+K.j(30),3+K.r()*5,14)}" fill="${INK.blood}" opacity=".55" stroke="none"/>`:'';
 const fid='f'+(hsh(o.key)%99999);
 const fl=o.inline?'':`filter="url(#${fid})"`,bg=o.inline?'':'style="filter:blur(.8px)"';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="${o.cls||'iseal'}" width="${o.size||100}" height="${o.size||100}" style="color:${ink}"><defs><filter id="${fid}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="${hsh(o.key)%97}"/><feDisplacementMap in="SourceGraphic" scale="1.3"/></filter></defs>
 <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" ${fl}>
 <g opacity=".22" stroke-width="2.4" ${bg}><path d="${a}"/><path d="${b}"/></g>
 <path d="${a}" stroke-width=".55" opacity=".8"/><path d="${b}" stroke-width=".7" opacity=".9"/>
 <path d="${c}" stroke="${o.kind==='npc'||o.blood?INK.blood:'currentColor'}" stroke-width="1.15"/>
 <g stroke-width=".8" opacity=".85">${planet(K,S[3],50,50,o.kind==='npc'?.55:.8)}</g>${bl}</g></svg>`}
const SEAL_CACHE=new Map();
function inkSeal(o){const k=JSON.stringify(o);let u=SEAL_CACHE.get(k);if(!u){u='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(inkSealSvg(o));SEAL_CACHE.set(k,u)}return `<img class="${o.cls||'iseal'}" src="${u}" width="${o.size||100}" height="${o.size||100}" alt="" decoding="async" loading="lazy">`}
/* overrides */
spellSigil=function(s,size=100,cls='ssig'){const o={key:s.id,name:s.n,school:s.sc,kind:'spell',blood:!!s.dt,size,cls:cls+' iseal'};return /big/.test(cls)?inkSealSvg({...o,inline:1}):inkSeal(o)};
npcSigil=function(c,size=56){return inkSeal({key:c.id+c.n,name:c.n,kind:'npc',size,cls:'nsig iseal'})};
runeRing=function(r=46,col='#d9b46a',n=24){const K=inkKit(hsh(col+n+r));const c=/d42a22|blood/.test(col)?INK.blood:INK.bone;return `<svg viewBox="0 0 100 100" fill="none" stroke="${c}" stroke-linecap="round" opacity=".75"><path d="${K.circ(50,50,r,64)+K.circ(50,50,r-9,60)}" stroke-width=".45"/><path d="${K.band(r-4.5,n+10)}" stroke-width=".55"/></svg>`};
function marg(K,x,y,w,rows){let d='';for(let i=0;i<rows;i++){let cx=x;const yy=y+i*7;while(cx<x+w-3){d+=K.glyph(cx,yy,1.6,K.j(.2));cx+=3+K.r()*2.4;if(K.r()<.12)cx+=4}}return d}
spellArt=function(s){const K=inkKit(hsh(s.id+'p'));const ink=(SCH_INK[s.sc]||['#c9b48a'])[0];
 let blots='';if(s.dt)for(let i=0;i<3+K.r()*4;i++){const bx=K.r()*400,by=K.r()*160,br=1.5+K.r()*5;blots+=`<path d="${K.circ(bx,by,br,9)}" fill="#4a120c" opacity="${F(.3+K.r()*.3)}"/><path d="M${F(bx)} ${F(by)}l${F(K.j(30))} ${F(K.j(30))}" stroke="#4a120c" stroke-width="${F(br/3)}" opacity=".35"/>`};
 const diag=K.circ(200,80,74,80)+K.circ(200,80,60,70)+K.line(80,80,320,80)+K.line(200,-5,200,165)+K.line(110,10,290,150)+K.line(290,10,110,150);
 const plate=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="pg"><stop offset="0" stop-color="#3a2a1a"/><stop offset=".7" stop-color="#1c130c"/><stop offset="1" stop-color="#0c0806"/></radialGradient><filter id="pn"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3"/><feColorMatrix values="0 0 0 0 .35 0 0 0 0 .25 0 0 0 0 .15 0 0 0 .35 0"/></filter></defs>
 <rect width="400" height="160" fill="url(#pg)"/><rect width="400" height="160" filter="url(#pn)"/>${blots}
 <g fill="none" stroke="${ink}" stroke-linecap="round" opacity=".28" stroke-width=".7"><path d="${diag}"/></g>
 <g fill="none" stroke="${INK.faded}" stroke-linecap="round" opacity=".55" stroke-width=".55"><path d="${marg(K,14,24,92,15)}"/><path d="${marg(K,300,24,88,15)}"/></g>
 <text x="22" y="150" fill="${INK.blood}" opacity=".7" font-family="Caveat,cursive" font-size="13">${esc(s.sc)} · ${s.l?s.l+'-й круг':'заговор'}</text></svg>`;let u=SEAL_CACHE.get('pl'+s.id);if(!u){u='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(plate);SEAL_CACHE.set('pl'+s.id,u)}
 return `<div class="sp-art inkp" style="--sc:${ink}"><img class="sp-plate" src="${u}" alt=""><div class="sp-art-sig">${spellSigil(s,132,'ssig big')}</div></div>`};
/* empty-state seal + ink tab glyphs */
(function(){const u=SEAL_CACHE.size,es=inkSealSvg({key:'empty',name:'пустота',kind:'item',ink:INK.faded});document.documentElement.style.setProperty('--esig',`url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(es)}")`);
 const G={sess:'sun',npc:'moon',spell:'merc',item:'jup',combat:'mars',dice:'sat',pcs:'ven',map:'sun',notes:'merc',rules:'sat'};
 const tab=(k,i)=>{const K=inkKit(hsh('tab'+k));return `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-linecap="round" class="tabseal"><path d="${K.circ(50,50,44,40)}" stroke-width="3"/>${planet(K,G[k],50,52,3.2).replace(/<path /g,'<path stroke-width="1.6" ')}</svg>`};
 const fix=()=>{$$('#ribbons .rib, .rib').forEach(b=>{const i=+b.dataset.i;const k=ICK[i];const svg=b.querySelector('svg');if(svg&&!svg.classList.contains('tabseal')&&k)svg.outerHTML=tab(k,i)})};fix();new MutationObserver(fix).observe(document.body,{childList:true,subtree:false});setTimeout(fix,500)})();
/* ===== performance: pause offscreen / hidden animations ===== */
(function(){const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('offs',!e.isIntersecting)),{rootMargin:'100px'});
 const watch=root=>$$('.ring2,.sp-art-ring,.ssig.big,.ph svg,.iseal',root).forEach(el=>{if(!el._io){el._io=1;io.observe(el)}});
 let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(()=>watch(document),60)}).observe(document.body,{childList:true,subtree:true});watch(document);
 document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('paused',document.hidden))})();
Object.assign(KM,{inkSeal,inkSealSvg});
Object.keys(DT_C).forEach(k=>DT_C[k]=['огонь','некротический','кислота','яд'].includes(k)?'#a8543f':['холод','звук','силовое поле','психический','электричество'].includes(k)?'#9a9c8c':'#b39a6e');

;
/* loot.js */
'use strict';{
/* ===== B: original artifacts  +  C: loot generator  +  D: delete/undo ===== */
const INSP={"Слиток Мидаса": "миф о царе Мидасе", "Плащ Красной Шапочки": "сказка «Красная Шапочка»", "Хрустальная Туфелька": "«Золушка» Ш. Перро", "Бобовое Зерно": "«Джек и бобовый стебель»", "Зеркало «Свет мой»": "«Сказка о мёртвой царевне» А. С. Пушкина", "Отравленное Яблоко": "«Белоснежка» братьев Гримм", "Веретено Сна": "«Спящая красавица»", "Сапоги-Скороходы": "русские и европейские сказки", "Волшебная Лампа Пленника": "«Аладдин» из «Тысячи и одной ночи»", "Меч в Камне Бессмертных": "легенды о короле Артуре", "Молот Громовержца-Изгнанника": "скандинавский Мьёльнир Тора", "Плащ-Невидимка Смерти": "сказание о трёх братьях и Смерти", "Кольцо Всевластия Пепла": "Кольцо Всевластья Толкина", "Черепаховый Щит Мудреца": "щит-черепаха из восточных легенд", "Борода Мага-Отшельника": "Мерлин и маги-отшельники", "Котёл Дагды": "ирландский миф о котле Дагды", "Сердце Голема": "пражская легенда о Големе", "Чётки Сорока Разбойников": "«Али-Баба и сорок разбойников»", "Тапочки Мальчика-с-Луны": "сказки о лунных путниках", "Ножницы Мойры": "греческие мойры, режущие нить судьбы", "Рубашка из Крапивы": "«Дикие лебеди» Андерсена", "Серьги Принцессы-Лягушки": "«Царевна-лягушка»", "Игла Кощея": "сказки о Кощее Бессмертном", "Ступа Костяной Бабы": "Баба Яга и её ступа", "Гусли-Самогуды": "русская сказка о гуслях-самогудах", "Живая и Мёртвая Вода": "русские былины и сказки", "Скатерть-Самобранка": "русская сказка о скатерти-самобранке", "Клубок Путеводный": "клубок Бабы Яги из русских сказок", "Шапка-Невидимка Бояр": "шапка-невидимка русских сказок", "Кладенец Самосек": "меч-кладенец русских былин", "Глиняный Голем-Кукла": "легенда о Големе"};const ART=(window.ART_RAW||'').trim().split('\n').map((l,i)=>{const f=l.split('|');return {id:'art-'+i,n:String(f[0]||'').replace(/\s*\((i{1,3}|iv|v)\)$/,(m,r)=>' '+r.toUpperCase()),rar:f[1],att:f[2]!=='0',attT:f[2],sub:f[3],look:f[4],lore:f[5],prop:f[6],chg:f[7],curse:f[8],mind:f[9],hook:f[10],cat:'Магические',cost:'—',w:0,art:true,insp:INSP[f[0]]||'',ds:f[6]}});
D.items.push(...ART);
const RCOL2={'Обычный':'#9b917f','Необычный':'#8fa477','Редкий':'#7d93a8','Очень редкий':'#9a84a6','Легендарный':'#c4a15a','Артефакт':'#a8483a','Разная':'#b39a6e'};
const _showItemL=showItem;
showItem=function(id){const a=ART.find(x=>x.id===id);if(!a)return _showItemL(id);
 const row=(k,v,c='')=>v&&v!=='—'?`<div class="fld ${c}"><b>${k}.</b> ${esc(v)}</div>`:'';
 openSheet(`<div class="cast-head">${inkSeal({key:a.id,name:a.n,kind:'item',ink:RCOL2[a.rar],blood:a.curse!=='—',size:110})}<div><div class="sb-title">${esc(a.n)}</div><div class="sb-sub">${esc(a.sub)}, ${esc(a.rar.toLowerCase())}${a.att?` (требует настройки${a.attT.length>1?' '+esc(a.attT.slice(1).trim()):''})`:''}</div></div></div>
 ${row('Облик',a.look)}${row('Предание',a.lore)}<div class="sec-h">Свойства</div><div class="fld">${esc(a.prop)}</div>${row('Заряды',a.chg)}${row('Проклятие',a.curse,'secret')}${row('Разум',a.mind)}${row('Завязка',a.hook)}${a.insp?`<div class="sec-h">Вдохновлено</div><div class="fld">${esc(a.insp)}</div>`:''}
 <div class="row" style="margin-top:12px"><button class="btn red" id="aGive">Отдать герою</button></div>`,r=>{$('#aGive',r).onclick=()=>choosePlayer(a)})};
/* --- loot generator --- */
const SRC=[['corpse','Труп'],['chest','Сундук'],['lair','Логово'],['vault','Сокровищница']];
const GEMS={10:['азурит','кровавик','гематит','лазурит','малахит','бирюза','обсидиан'],50:['гелиотроп','халцедон','сердолик','лунный камень','оникс','циркон','яшма'],100:['янтарь','аметист','хризоберилл','коралл','гранат','нефрит','жемчужина','турмалин'],500:['александрит','аквамарин','чёрный жемчуг','топаз','шпинель'],1000:['чёрный опал','голубой сапфир','изумруд','огненный опал','звёздчатый рубин'],5000:['чёрный сапфир','алмаз','рубин','жакинт']};
const ARTOBJ={25:['серебряный кубок с волчьими мордами','резная костяная статуэтка висельника','шёлковый погребальный платок','медное зеркальце с трещиной','чётки из чёрного дерева'],250:['золотое кольцо с гербом угасшего рода','позолоченный череп-подсвечник','икона в окладе, лицо святого выскоблено','серебряный кинжал для жертвоприношений'],750:['золотая погребальная маска','кадило из серебра с гранатами','шкатулка с мощами в хрустале'],2500:['корона утопленного короля','золотая статуэтка крылатого демона с рубиновыми глазами'],7500:['реликварий с сердцем святого, усыпанный алмазами','скипетр павшей империи']};
const TIERS=[['0','Ур. 1–4'],['1','Ур. 5–10'],['2','Ур. 11–16'],['3','Ур. 17–20']];
const COIN=[{corpse:8,chest:60,lair:250,vault:600}],CM=[1,10,60,300];
const RW=[{'Обычный':40,'Необычный':50,'Редкий':10},{'Необычный':45,'Редкий':40,'Очень редкий':13,'Легендарный':2},{'Редкий':40,'Очень редкий':40,'Легендарный':18,'Артефакт':2},{'Очень редкий':35,'Легендарный':55,'Артефакт':10}];
const GV=[[10,50],[50,100,500],[500,1000],[1000,5000]],AV=[[25],[25,250],[250,750,2500],[750,2500,7500]];
const CNT={corpse:{g:[0,1],a:[0,0],i:[0,1]},chest:{g:[1,3],a:[0,1],i:[1,1]},lair:{g:[2,6],a:[1,2],i:[1,3]},vault:{g:[4,10],a:[2,4],i:[2,5]}};
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
const wpick=w=>{let t=Object.values(w).reduce((a,b)=>a+b,0),x=Math.random()*t;for(const k in w){x-=w[k];if(x<0)return k}return Object.keys(w)[0]};
function rollEntry(type,t,src){if(type==='gem'){const v=pick(GV[t]);return {id:uid(),type,n:pick(GEMS[v]).replace(/^./,c=>c.toUpperCase()),val:v,w:0}}
 if(type==='art'){const v=pick(AV[t]);return {id:uid(),type,n:pick(ARTOBJ[v]).replace(/^./,c=>c.toUpperCase()),val:v,w:.5}}
 if(type==='coins'){const g=Math.round(COIN[0][src]*CM[t]*(.5+Math.random()));const c={pm:t>1?Math.floor(g*.2/10):0,zm:0,sm:Math.floor(Math.random()*g*.3),mm:Math.min(400,Math.floor(Math.random()*g*.5))};c.zm=Math.max(0,g-c.pm*10-Math.floor(c.sm/10));return {id:uid(),type,n:'Монеты',coins:c,val:c.pm*10+c.zm+c.sm/10+c.mm/100}}
 const rar=wpick(RW[t]);const arts=ART.filter(a=>a.rar===rar);let it=(arts.length&&Math.random()<.5)?pick(arts):null;if(!it){const L=D.items.filter(i=>i.cat==='Магические'&&i.rar===rar);it=L.length?pick(L):pick(arts.length?arts:ART)}
 return {id:uid(),type:'item',n:it.n,item:it.id,rar:it.rar,w:it.w||0}}
function genLoot2(t,src,keep=[]){const c=CNT[src];const L=[...keep];if(!L.some(e=>e.type==='coins'))L.push(rollEntry('coins',t,src));
 const add=(ty,[a,b])=>{const n=ri(a,b)-keep.filter(e=>e.type===ty).length;for(let i=0;i<n;i++)L.push(rollEntry(ty==='i'?'item':ty==='g'?'gem':'art',t,src))};
 add('g',c.g);add('a',c.a);add('i',src==='corpse'&&Math.random()<.7?[0,0]:c.i);return L}
let loot2=LS.get('loot2',{t:0,src:'chest',list:[]});const saveLoot=()=>LS.set('loot2',loot2);
const coinTxt=c=>[['пм',c.pm],['зм',c.zm],['см',c.sm],['мм',c.mm]].filter(x=>x[1]).map(x=>x[1]+' '+x[0]).join(' · ')||'пусто';
function entryHtml(e){const glow=e.rar?RCOL2[e.rar]:e.type==='gem'?'#7d93a8':e.type==='art'?'#c4a15a':'#b39a6e';
 const ic=e.type==='item'?inkSeal({key:e.item,name:e.n,kind:'item',ink:RCOL2[e.rar],size:44}):`<span class="lt-ic">${e.type==='coins'?'⛁':e.type==='gem'?'◆':'♜'}</span>`;
 return `<div class="lt${e.lock?' locked':''}" data-e="${e.id}" data-t="${e.type}" style="--gl:${glow}">${ic}<div class="lt-b"><div class="t"${e.item?` data-open="${e.item}"`:''}>${esc(e.n)}</div><div class="m">${e.type==='coins'?coinTxt(e.coins):e.type==='item'?esc(e.rar):`${e.val} зм`}</div></div>
 <div class="lt-a"><button data-act="lock" aria-label="Закрепить">${e.lock?'🔒':'🔓'}</button><button data-act="re" aria-label="Перебросить">⟳</button><button data-act="give" aria-label="Отдать">➜</button><button data-act="del" aria-label="Удалить">✕</button></div></div>`}
const lootTotal=()=>Math.round(loot2.list.reduce((s,e)=>s+(e.val||0),0));
function renderLoot(){const o=$('#lootOut');if(!o)return;o.innerHTML=loot2.list.length?`<div class="lt-sum">Итого ценностей: <b>${lootTotal()} зм</b> · предметов: ${loot2.list.filter(e=>e.type==='item').length}</div>`+loot2.list.map(entryHtml).join('')+`<div class="row" style="margin-top:10px"><button class="btn" id="giveAll">Монеты поровну отряду</button><button class="btn dark" id="clrAll">🗑 Очистить всё</button></div>`:`<div class="empty">Выбери источник и брось кости судьбы.</div>`}
rItems=(function(prev){return function(){if(lootTab==='cat'){prev();if(!$('#artChip',page)){$('#lseg',page)?.insertAdjacentHTML('afterend',`<div class="row" style="margin:-2px 0 8px"><button class="btn sm dark" id="artChip">✦ Артефакты Книги (${ART.length})</button></div>`);$('#artChip',page).onclick=()=>{S.itCat='Магические';S.itQ='';rItems();lazyList($('#itList'),ART,i=>`<div class="card cast" data-id="${i.id}">${inkSeal({key:i.id,name:i.n,kind:'item',ink:RCOL2[i.rar],size:52})}<div class="t">${esc(i.n)}</div><span class="badge">${esc(i.rar)}</span><div class="m">${esc(i.sub)}${i.att?' · настройка':''}</div></div>`)}}return}
 page.oninput=null;page.onclick=null;
 page.innerHTML=header('Лут','добыча и сокровища','tri',2)+lootSeg()+`<div class="gen"><label class="f">Уровень отряда</label>${chips('t',TIERS,loot2.t)}<label class="f">Источник</label>${chips('src',SRC,loot2.src)}
 <button class="btn red" id="gen" style="width:100%;justify-content:center;margin-top:10px;padding:14px;font-size:16px">🜏 Сгенерировать добычу</button><div class="muted" style="font-size:12px;margin-top:6px">🔒 закреплённое сохраняется при новом броске · ⟳ перебросить одно · ➜ отдать герою</div></div><div id="lootOut"></div>`;
 bindLootSeg();bindChips(page,(n,v)=>{loot2[n]=n==='t'?+v:v;saveLoot();$$(`[data-chips=${n}] .chip`,page).forEach(b=>b.classList.toggle('on',b.dataset.v===v))});renderLoot();
 $('#gen').onclick=()=>{loot2.list=genLoot2(loot2.t,loot2.src,loot2.list.filter(e=>e.lock));saveLoot();const sc=document.scrollingElement,y=sc.scrollTop;chestFx(()=>{const O=$('#lootOut');if(O)O.style.minHeight=O.offsetHeight+'px';renderLoot();sc.scrollTop=y;if(O)requestAnimationFrame(()=>O.style.minHeight='');if(calm())return;const vh=innerHeight;let k=0;$$('#lootOut .lt').forEach(el=>{const r=el.getBoundingClientRect();if(r.top>vh||k>=10)return;const d=k++*55;el.style.willChange='opacity,transform';const a=el.animate([{opacity:0,transform:'translate3d(0,12px,0)'},{opacity:1,transform:'none'}],{duration:360,delay:d,fill:'backwards',easing:'cubic-bezier(.2,.8,.2,1)'});a.onfinish=()=>{el.style.willChange=''}})})};
 $('#lootOut').onclick=e=>{const op=e.target.closest('[data-open]');const row=e.target.closest('[data-e]');const b=e.target.closest('[data-act]');
  if(e.target.closest('#clrAll')){if(!confirm('Очистить всю добычу?'))return;const old=loot2.list;loot2.list=[];saveLoot();renderLoot();KM.undoToast('Добыча очищена',()=>{loot2.list=old;saveLoot();renderLoot()});return}
  if(e.target.closest('#giveAll')){const c=loot2.list.find(x=>x.type==='coins');if(c){const bk=JSON.stringify(players.map(p=>[p.coins,p.gold])),i=loot2.list.indexOf(c);splitGold(c.val,c.coins);loot2.list.splice(i,1);saveLoot();renderLoot();setTimeout(()=>KM.undoToast('Монеты розданы',()=>{JSON.parse(bk).forEach(([co,g],j)=>{if(players[j]){players[j].coins=co;players[j].gold=g}});save();loot2.list.splice(i,0,c);saveLoot();renderLoot()}),900)}else toast('Монет в добыче нет');return}
  if(!row)return;const i=loot2.list.findIndex(x=>x.id===row.dataset.e),en=loot2.list[i];
  if(!b){if(op)showItem(op.dataset.open);return}const a=b.dataset.act;
  if(a==='lock'){en.lock=!en.lock;saveLoot();renderLoot()}
  if(a==='re'){const n=rollEntry(en.type,loot2.t,loot2.src);loot2.list[i]=n;saveLoot();renderLoot();$(`[data-e="${n.id}"]`)?.animate([{transform:'rotateX(90deg)'},{transform:'none'}],{duration:380})}
  if(a==='del'){loot2.list.splice(i,1);saveLoot();renderLoot();KM.undoToast(`«${en.n}» удалено`,()=>{loot2.list.splice(i,0,en);saveLoot();renderLoot()})}
  if(a==='give'){if(en.type==='coins'){splitGold(en.val,en.coins)}else{choosePlayer(en.item?D.items.find(x=>x.id===en.item):{id:'loot-'+en.id,n:`${en.n} (${en.val} зм)`,w:en.w});const j=loot2.list.indexOf(en);if(j>=0){loot2.list.splice(j,1);saveLoot();renderLoot()}}}}}})(rItems);
function chestFx(done){if(calm()){done();return}const o=document.createElement('div');o.className='chest-fx';o.innerHTML=`<div class="cf-seal">${inkSealSvg({key:'chest'+Date.now(),name:'добыча',kind:'item',inline:1,size:220,cls:'ssig big'})}</div><div class="cf-flash"></div>`;document.body.append(o);
 o.querySelectorAll('path').forEach(p=>p.setAttribute('pathLength','1'));setTimeout(()=>o.classList.add('open'),900);setTimeout(()=>{done();o.classList.add('out')},1250);setTimeout(()=>o.remove(),1900)}
/* D: deleting heroes / notes etc. with undo (replace confirm) */
KM.ART=ART;KM.genLoot2=genLoot2;KM.loot2=()=>loot2;

KM.showItem=(...a)=>showItem(...a);}

;
/* hints.js */
'use strict';
/* ===== STAGE 2: placeholders + novice hints ===== */
const GLOSS={
 'КД':'Класс доспеха — насколько трудно попасть по существу. Атака попадает, если к20 + модификаторы ≥ КД.',
 'Хиты':'Очки здоровья. При 0 хитов герой падает без сознания и бросает спасброски от смерти, монстр обычно погибает.',
 'Опасность':'Показатель опасности (ПО) — примерно уровень группы из 4 героев, для которой бой с этим существом будет непростым.',
 'ПО':'Показатель опасности — насколько силён монстр. ПО 1 ≈ серьёзный противник для четырёх героев 1-го уровня.',
 'Инициатива':'Порядок ходов в бою: к20 + модификатор Ловкости. Ходят от большего к меньшему.',
 'Модификатор':'Число, прибавляемое к броску: (характеристика − 10) ÷ 2 с округлением вниз, плюс бонус мастерства, если герой владеет навыком/оружием.',
 'Цель':'КД цели для атаки или СЛ (сложность) для проверки и спасброска. Нажми, чтобы переключить.',
 'Скорость':'Сколько метров существо проходит за ход. 9 м = 6 клеток карты (1 клетка = 1,5 м).',
 'Характеристики':'Сила, Ловкость, Телосложение, Интеллект, Мудрость, Харизма. 10 — средний человек, модификатор +0.',
 'ВНИМ.':'Пассивное Восприятие: 10 + модификатор Восприятия. Мастер сравнивает его со Скрытностью врагов без броска.',
 'ЗОЛОТО':'Золотые монеты (зм). 1 зм = 10 см (серебра) = 100 мм (меди); 1 пм (платина) = 10 зм.',
 'Компоненты':'В — вербальный (произнести слова), С — соматический (жест рукой), М — материальный (предмет или фокусировка).',
 'Длительность':'Сколько действует заклинание. «Концентрация» — заклинатель может держать только одно такое заклинание; урон требует спасброска Телосложения (СЛ 10 или ½ урона).',
 'Время':'Сколько тратится на сотворение: действие, бонусное действие, реакция или минуты (вне боя).',
 'Дистанция':'Как далеко может быть цель. «Касание» — нужно дотронуться.',
 'Урон':'Кости урона заклинания или оружия. При крите кости бросаются дважды, модификатор — один раз.',
 'Опасность побеждённых':'Средний ПО побеждённых врагов — от него зависит богатство добычи.',
 'Атаки':'Действия существа. Формат: «Название: +4 к попаданию, 5 (1к6+2) рубящего урона».',
 'Особенности':'Пассивные способности существа: «Тёмное зрение», «Тактика стаи», «Чуткий нюх»…',
 'Инвентарь':'Вещи героя. Вес в кг — следи за грузоподъёмностью: Сила × 7,5 кг.',
 'Состояния':'Эффекты вроде «Отравлен» или «Лежит ничком» — меняют броски. Подробно — в разделе «Правила».'
};
const PH={nn:'Название, напр. Склеп Чёрного епископа',nw:'20',nh:'20',e_n:'Имя, напр. Трактирщик Хольм',e_ac:'напр. 12',e_hp:'напр. 11',e_cr:'напр. 0,25',e_sp:'напр. 9 м, лазая 6 м',e_no:'Мотив: долг перед гильдией воров. Голос: хриплый, вечно кашляет. Тайна: прячет беглого принца.',
 nt:'Заголовок, напр. Сцена в склепе',nx:'Опиши сцену тремя чувствами: что видят, слышат, чуют герои. Напр.: «Сырой холод, капает вода, пахнет воском и гнилью…»',mN:'Имя, напр. Орк-вожак',mI:'напр. 14',mH:'напр. 15',mA:'напр. 13',hv:'напр. 7',cn:'Название, напр. Карта сокровищ',cw:'кг, напр. 0,5',bigv:'Что выпало, напр. 63',npcQ:'Найти, напр. гоблин или волк',spQ:'Найти, напр. огненный шар',itQ:'Найти, напр. зелье лечения',bq:'Напр. гоблин, волк, скелет',pq:'Напр. меч, зелье, верёвка'};
const PHK={name:'Имя героя, напр. Арен Тёмный',cls:'Класс, напр. Паладин',lvl:'1',hp:'12',maxhp:'12',ac:'16',pp:'13',gold:'25',notes:'Предыстория, клятвы, важные вещи. Напр.: «Ищет убийцу отца, боится огня»'};
function decorate(root){
 $$('input:not([type=checkbox]):not([type=file]),textarea',root).forEach(i=>{const m=PH[i.id]||PHK[i.dataset.k];if(i.placeholder&&!m)return;const p=m||(i.dataset.st!=null?'10':i.classList.contains('e_st')?'10':i.type==='number'?'напр. 10':'Введите текст, напр. «Старый маяк»');i.placeholder=p});
 $$('label.f,.shield small,.pcstats4 small,.ctl label,.sp-grid b,.inv-h b,.redstats b,.sec-h',root).forEach(l=>{if(l.querySelector('.hq'))return;const t=l.textContent.trim().replace(/[:(].*$/,'').trim();const k=Object.keys(GLOSS).find(k=>t===k||t.startsWith(k+' ')||(k.length>3&&t.startsWith(k)));if(k)l.insertAdjacentHTML('beforeend',`<button class="hq" data-hq="${k}" aria-label="Подсказка: ${k}">?</button>`)});
 $$('.card .stats span',root).forEach(s=>{if(s.querySelector('.hq'))return;const k=s.firstChild&&s.firstChild.textContent.trim();if(k==='КД'||k==='Хиты')s.insertAdjacentHTML('afterbegin','')})}
const hintObs=new MutationObserver(ms=>{for(const m of ms)if(m.target)decorate(m.target)});
[page,$('#sheetPage')].forEach(r=>{hintObs.observe(r,{childList:true,subtree:true});decorate(r)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-hq]');if(!b)return;e.preventDefault();e.stopPropagation();const k=b.dataset.hq;
 let pop=$('#hpop');if(!pop){pop=document.createElement('div');pop.id='hpop';document.body.append(pop)}
 pop.innerHTML=`<b>${esc(k)}</b><p>${esc(GLOSS[k])}</p>`;const r=b.getBoundingClientRect();pop.style.top=Math.min(innerHeight-180,r.bottom+8)+'px';pop.classList.remove('on');void pop.offsetWidth;pop.classList.add('on');
 clearTimeout(pop._t);pop._t=setTimeout(()=>pop.classList.remove('on'),6000)},true);
document.addEventListener('pointerdown',e=>{const p=$('#hpop');if(p&&!e.target.closest('#hpop,[data-hq]'))p.classList.remove('on')},{passive:true});
KM.GLOSS=GLOSS;

;
/* mapgen.js */
'use strict';{
/* ===== Stage 6: procedural maps, textures, light, styles ===== */
const R=s=>{let a=s>>>0||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const ADD=[['pillar','Колонна','#5a514a'],['altar','Алтарь','#3b3430'],['table','Стол','#3b3430'],['rug','Ковёр','#5a1f1a'],['road','Дорога','#6b5a40'],['roof','Крыша','#4a2a20'],['torch','Факел','#3b3430'],['rubble','Обломки','#3b3430'],['bones','Кости','#3b3430'],['crate','Ящик','#3b3430']];
const IN2=['barrel', 'bed', 'shelf', 'statue', 'sarco', 'cauldron', 'candles', 'web', 'puddle', 'crystal', 'brazier', 'throne', 'chair'],OUT2=['bush', 'rock', 'stump', 'flowers', 'tent', 'fence', 'well', 'cart', 'campfire', 'log', 'mushroom', 'bridge'];
[['barrel','Бочка','#3b3430'],['bed','Кровать','#3b3430'],['shelf','Стеллаж','#3b3430'],['statue','Статуя','#3b3430'],['sarco','Саркофаг','#3b3430'],['cauldron','Котёл','#3b3430'],['candles','Свечи','#3b3430'],['web','Паутина','#3b3430'],['puddle','Лужа','#3b3430'],['crystal','Кристалл','#3b3430'],['brazier','Жаровня','#3b3430'],['throne','Трон','#3b3430'],['chair','Стул','#3b3430'],['bush','Куст','#2c3d22'],['rock','Валун','#2c3d22'],['stump','Пень','#2c3d22'],['flowers','Цветы','#2c3d22'],['tent','Палатка','#2c3d22'],['fence','Забор','#2c3d22'],['well','Колодец','#2c3d22'],['cart','Телега','#2c3d22'],['campfire','Костёр','#2c3d22'],['log','Бревно','#2c3d22'],['mushroom','Грибы','#2c3d22'],['bridge','Мост','#2c3d22']].forEach(t=>ADD.push(t));
ADD.forEach(t=>{if(!TC[t[0]]){TILES.push(t);TC[t[0]]=t}});
const ICON={barrel:'◍',bed:'▬',shelf:'▥',statue:'♟',sarco:'⚰',cauldron:'◒',candles:'ı',web:'✳',puddle:'○',crystal:'◆',brazier:'♨',throne:'♛',chair:'▫',bush:'❀',rock:'⬢',stump:'◉',flowers:'✿',tent:'⛺',fence:'╪',well:'◎',cart:'⊟',campfire:'✶',log:'═',mushroom:'♠',bridge:'≡',pillar:'●',altar:'⊓',table:'▭',rug:'▒',road:'·',roof:'▲',torch:'✦',rubble:'∴',bones:'☠',crate:'▤'};
const _ti=window.tileIcon;window.tileIcon=tileIcon=k=>ICON[k]||_ti(k);
const TYPES=[['dungeon','Подземелье'],['cave','Пещера'],['crypt','Склеп / храм'],['forest','Лес'],['village','Таверна / деревня']];
const NAMES={dungeon:['Чертоги','Казематы','Подвалы','Застенки'],cave:['Пещера','Грот','Логово','Нора'],crypt:['Склеп','Храм','Усыпальница','Святилище'],forest:['Чаща','Опушка','Тропа','Роща'],village:['Деревня','Постоялый двор','Хутор','Застава']};
const ADJ=['Чёрного Епископа','Ржавой Луны','Шепчущих Костей','Кривого Ворона','Семи Свечей','Пепельной Девы','Утопленника','Слепого Короля'];
function gen(type,W,H,seed,o){const r=R(seed),ri=n=>Math.floor(r()*n),g=Array(W*H).fill(''),I=(x,y)=>y*W+x,inb=(x,y)=>x>0&&y>0&&x<W-1&&y<H-1;
 const set=(x,y,t)=>{if(x>=0&&y>=0&&x<W&&y<H)g[I(x,y)]=t},get=(x,y)=>x>=0&&y>=0&&x<W&&y<H?g[I(x,y)]:'';const rooms=[];
 const carve=(x0,y0,x1,y1,t='floor')=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)set(x,y,t)};
 const walls=()=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!g[I(x,y)]){let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const t=get(x+dx,y+dy);if(t&&t!=='wall')n++}if(n)g[I(x,y)]='wall'}};
 const corridor=(a,b)=>{let x=a.cx,y=a.cy;const hf=r()<.5;const stepX=()=>{while(x!==b.cx){if(get(x,y)!=='floor')set(x,y,'floor');x+=Math.sign(b.cx-x)}},stepY=()=>{while(y!==b.cy){if(get(x,y)!=='floor')set(x,y,'floor');y+=Math.sign(b.cy-y)}};if(hf){stepX();stepY()}else{stepY();stepX()}};
 if(type==='dungeon'||type==='crypt'){const leaves=[];(function split(x,y,w,h,d){if(d>4||(w<12&&h<12)){leaves.push({x,y,w,h});return}const v=w>h?1:h>w?0:r()<.5;if(v&&w>=12){const s=5+ri(w-10);split(x,y,s,h,d+1);split(x+s,y,w-s,h,d+1)}else if(!v&&h>=12){const s=5+ri(h-10);split(x,y,w,s,d+1);split(x,y+s,w,h-s,d+1)}else leaves.push({x,y,w,h})})(1,1,W-2,H-2,0);
  leaves.forEach(l=>{const w=Math.max(3,Math.min(l.w-2,3+ri(l.w-3))),h=Math.max(3,Math.min(l.h-2,3+ri(l.h-3)));const x=l.x+1+ri(Math.max(1,l.w-w-1)),y=l.y+1+ri(Math.max(1,l.h-h-1));if(x+w>=W-1||y+h>=H-1)return;carve(x,y,x+w-1,y+h-1);rooms.push({x,y,w,h,cx:x+(w>>1),cy:y+(h>>1)})});
  for(let i=1;i<rooms.length;i++)corridor(rooms[i-1],rooms[i]);if(rooms.length>3)corridor(rooms[0],rooms[rooms.length-1]);walls();
  // doors at room borders where corridor enters
  rooms.forEach(rm=>{for(let x=rm.x-1;x<=rm.x+rm.w;x++)for(const y of[rm.y-1,rm.y+rm.h])door(x,y);for(let y=rm.y;y<rm.y+rm.h;y++)for(const x of[rm.x-1,rm.x+rm.w])door(x,y)});
  function door(x,y){if(get(x,y)!=='floor')return;const h=get(x-1,y)==='wall'&&get(x+1,y)==='wall',v=get(x,y-1)==='wall'&&get(x,y+1)==='wall';if((h||v)&&r()<.75)set(x,y,'door')}
  if(type==='crypt'){rooms.forEach((rm,i)=>{if(rm.w>=5&&rm.h>=5){for(let y=rm.y+1;y<rm.y+rm.h-1;y+=2){set(rm.x+1,y,'pillar');set(rm.x+rm.w-2,y,'pillar')}}if(i===rooms.length-1){set(rm.cx,rm.y+1,'altar');for(let y=rm.y+2;y<rm.y+rm.h-1;y++)if(get(rm.cx,y)==='floor')set(rm.cx,y,'rug')}if(r()<.5)set(rm.x+ri(rm.w),rm.y+ri(rm.h),'bones')})}
  else rooms.forEach(rm=>{if(r()<.35)set(rm.x+ri(rm.w),rm.y+ri(rm.h),'rubble');if(r()<.3)set(rm.x,rm.y,'crate')});
  if(rooms[0])set(rooms[0].cx,rooms[0].cy,'stairs')}
 else if(type==='cave'){for(let i=0;i<W*H;i++){const x=i%W,y=(i/W)|0;g[i]=inb(x,y)&&r()<.55?'floor':''}
  for(let k=0;k<5;k++){const n=g.slice();for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){let c=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(g[I(x+dx,y+dy)]==='floor')c++;n[I(x,y)]=c>=5?'floor':''}g.splice(0,g.length,...n)}
  // keep largest region
  const seen=new Uint8Array(W*H);let best=[];for(let i=0;i<W*H;i++)if(g[i]==='floor'&&!seen[i]){const st=[i],reg=[];seen[i]=1;while(st.length){const j=st.pop();reg.push(j);const x=j%W,y=(j/W)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const k=I(x+dx,y+dy);if(inb(x+dx,y+dy)&&!seen[k]&&g[k]==='floor'){seen[k]=1;st.push(k)}})}if(reg.length>best.length)best=reg}
  const keep=new Set(best);for(let i=0;i<W*H;i++)if(g[i]==='floor'&&!keep.has(i))g[i]='';
  for(let k=0;k<2;k++){const s=best[ri(best.length)];const x=s%W,y=(s/W)|0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(get(x+dx,y+dy)==='floor'&&dx*dx+dy*dy<=4+r()*2)set(x+dx,y+dy,'water')}
  for(let k=0;k<best.length/40;k++){const s=best[ri(best.length)];if(g[s]==='floor')g[s]=r()<.5?'rubble':'bones'}
  walls();for(let k=0;k<6;k++){const s=best[ri(best.length)];rooms.push({cx:s%W,cy:(s/W)|0,x:s%W,y:(s/W)|0,w:1,h:1})}}
 else if(type==='forest'){g.fill('grass');for(let i=0;i<W*H;i++)if(r()<.28)g[i]='tree';
  for(let k=0;k<2;k++){const n=g.slice();for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){let c=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(g[I(x+dx,y+dy)]==='tree')c++;n[I(x,y)]=c>=4?'tree':'grass'}g.splice(0,g.length,...n)}
  let y=ri(H);for(let x=0;x<W;x++){set(x,y,'road');set(x,y+1,'road');if(r()<.3)y=Math.max(1,Math.min(H-3,y+(r()<.5?-1:1)))}
  const cx=3+ri(W-8),cy=3+ri(H-8);for(let dy=-2;dy<=2;dy++)for(let dx=-3;dx<=3;dx++)if(dx*dx/9+dy*dy/4<=1)set(cx+dx,cy+dy,'water');
  for(let k=0;k<4;k++){const x=1+ri(W-2),yy=1+ri(H-2);if(get(x,yy)==='grass'){set(x,yy,'rubble');rooms.push({cx:x,cy:yy,x,y:yy,w:1,h:1})}}}
 else if(type==='village'){g.fill('grass');const my=(H>>1);for(let x=0;x<W;x++){set(x,my,'road');set(x,my+1,'road')}const mx=(W>>1);for(let y=0;y<H;y++){set(mx,y,'road')}
  // tavern
  const tw=Math.min(10,W-4),th=Math.min(7,(H>>1)-2),tx=2,ty=my-th-1;carve(tx,ty,tx+tw-1,ty+th-1,'wall');carve(tx+1,ty+1,tx+tw-2,ty+th-2,'floor');set(tx+(tw>>1),ty+th-1,'door');
  for(let x=tx+2;x<tx+tw-2;x+=3)for(let y2=ty+2;y2<ty+th-2;y2+=2)set(x,y2,'table');set(tx+1,ty+1,'torch');set(tx+tw-2,ty+1,'torch');set(tx+tw-2,ty+th-2,'crate');rooms.push({x:tx+1,y:ty+1,w:tw-2,h:th-2,cx:tx+(tw>>1),cy:ty+(th>>1)});
  for(let k=0;k<8;k++){const w=3+ri(3),h=3+ri(2),x=1+ri(W-w-2),y2=1+ri(H-h-2);let ok=true;for(let yy=y2-1;yy<=y2+h;yy++)for(let xx=x-1;xx<=x+w;xx++)if(get(xx,yy)!=='grass')ok=false;if(!ok)continue;carve(x,y2,x+w-1,y2+h-1,'roof');set(x+(w>>1),y2+h-1,'door');rooms.push({x,y:y2,w,h,cx:x+(w>>1),cy:y2+(h>>1)})}
  for(let i=0;i<W*H;i++)if(g[i]==='grass'&&r()<.06)g[i]='tree';const wx=mx+2,wy=my+3;if(get(wx,wy)==='grass')set(wx,wy,'water')}
 // auto placement: traps, chests, torches
 const floors=[];for(let i=0;i<W*H;i++)if(g[i]==='floor'||g[i]==='grass')floors.push(i);
 if(o.traps){const n=Math.max(1,Math.round(floors.length/90));for(let k=0;k<n;k++){const i=floors[ri(floors.length)];if(g[i]==='floor'||g[i]==='grass')g[i]='trap'}}
 if(o.loot){rooms.slice(1).forEach(rm=>{if(r()<.45){const x=rm.x+ri(rm.w),y=rm.y+ri(rm.h);if(get(x,y)==='floor'||get(x,y)==='grass')set(x,y,'chest')}})}
 if(type!=='forest'&&type!=='village')rooms.forEach(rm=>{if(r()<.6){for(const[x,y]of[[rm.x,rm.y],[rm.x+rm.w-1,rm.y+rm.h-1]])if(get(x,y)==='floor'){set(x,y,'torch');break}}});
 // декор: много предметов по типу локации (не перекрываем двери и проходы)
 {const D={dungeon:[['barrel',4],['crate',3],['bed',1],['shelf',2],['chair',2],['puddle',2],['web',2],['rubble',3],['bones',2],['brazier',1],['statue',1],['cauldron',1]],crypt:[['sarco',4],['candles',4],['statue',2],['web',3],['bones',3],['rubble',2],['brazier',1],['altar',1],['throne',.5]],cave:[['rock',5],['crystal',3],['mushroom',4],['puddle',3],['web',2],['bones',2],['campfire',.5]],forest:[['bush',8],['rock',5],['stump',4],['flowers',5],['log',3],['mushroom',3],['tent',.6],['campfire',.6]],village:[['barrel',4],['crate',3],['fence',4],['cart',1],['well',.6],['flowers',4],['bush',4],['rock',1],['log',1]]}[type]||[];
  const tot=D.reduce((a,x)=>a+x[1],0),ok=i=>{const x=i%W,y=(i/W)|0;let n=0,d=0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const t=get(x+dx,y+dy);if(t==='door'||t==='stairs')d++;if(t==='floor'||t==='grass'||t==='road')n++});return !d&&n>=2};
  const out=type==='forest'||type==='village',cells=[];for(let i=0;i<W*H;i++)if(g[i]===(out?'grass':'floor'))cells.push(i);
  const n=Math.round(cells.length*(out?.1:.11));let put=0;for(let k=0;k<n*5&&put<n&&tot;k++){const i=cells[ri(cells.length)];if(g[i]!==(out?'grass':'floor')||!ok(i))continue;let q=r()*tot,t=D[0][0];for(const [a,w] of D){q-=w;if(q<=0){t=a;break}}
   if(['bed','shelf','sarco','throne','barrel','crate','cauldron'].includes(t)&&!out){const x=i%W,y=(i/W)|0;if(![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>get(x+dx,y+dy)==='wall'))continue}g[i]=t;put++}
  if(type==='forest'||type==='village'){for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(g[I(x,y)]==='road'&&(get(x,y-1)==='water'||get(x,y+1)==='water'||get(x-1,y)==='water'||get(x+1,y)==='water'))g[I(x,y)]='bridge'}
  if(type==='cave'||type==='dungeon'){for(let i=0;i<W*H;i++)if(g[i]==='water'){const x=i%W,y=(i/W)|0;if(get(x-1,y)==='floor'&&get(x+1,y)!=='water'&&r()<.15)g[i]='bridge'}}}
 return {g,rooms}}
KM.genMap=gen;
/* ---- new map sheet with generator ---- */
window.newMap=newMap=function(){const seed=Math.floor(Math.random()*99999);const st=LS.get('mgopt',{type:'dungeon',W:24,H:24,style:'dark',theme:'stone',traps:1,loot:1,light:1});
 openSheet(`<div class="sb-title">Новая карта</div><div class="sb-sub">Сгенерировать или начать с чистого листа</div>
 <label class="f">Тип местности</label>${chips('ty',TYPES,st.type)}
 <div class="row"><div class="grow"><label class="f">Ширина</label><input class="inp" id="nw" type="number" value="${st.W}"></div><div class="grow"><label class="f">Высота</label><input class="inp" id="nh" type="number" value="${st.H}"></div><div class="grow"><label class="f">Зерно</label><input class="inp" id="ns" type="number" value="${seed}"></div></div>
 <div class="row" style="margin-top:4px">${[['S',16,16],['M',24,24],['L',36,36],['XL',48,48]].map(([l,w,h])=>`<button class="btn sm" data-sz="${w}">${{S:'Малая',M:'Средняя',L:'Большая',XL:'Огромная'}[l]}</button>`).join('')}</div>
 <label class="f">Стиль</label>${chips('st',[['dark','Тёмный'],['parch','Пергамент']],st.style)}
 <label class="f">Камень / тема</label>${chips('th',[['stone','Серый камень'],['sand','Песчаник'],['moss','Мшистый'],['blood','Кровавый']],st.theme)}
 <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:12px"><label><input type="checkbox" id="oT"${st.traps?' checked':''}> Ловушки</label><label><input type="checkbox" id="oL"${st.loot?' checked':''}> Сундуки</label><label><input type="checkbox" id="oLi"${st.light?' checked':''}> Освещение</label><label><input type="checkbox" id="oF"> Скрыть туманом</label></div>
 <label class="f">Название</label><input class="inp" id="nn" placeholder="Придумаю сам">
 <div class="muted" style="font-size:12.5px;margin-top:6px">1 клетка = 1,5 м. Всё сгенерированное можно править кистью.</div>
 <div class="row" style="margin-top:14px"><button class="btn red grow" id="ngen">✦ Сгенерировать</button><button class="btn" id="nok">Пустая</button></div>`,r=>{
 const S={...st};bindChips(r,(n,v)=>{if(n==='ty')S.type=v;if(n==='st')S.style=v;if(n==='th')S.theme=v});
 $$('[data-sz]',r).forEach(b=>b.onclick=()=>{$('#nw',r).value=$('#nh',r).value=b.dataset.sz});
 const make=empty=>{const W=Math.max(8,Math.min(64,+$('#nw',r).value||24)),H=Math.max(8,Math.min(64,+$('#nh',r).value||24)),seed=+$('#ns',r).value||1;
  Object.assign(S,{W,H,traps:$('#oT',r).checked,loot:$('#oL',r).checked,light:$('#oLi',r).checked});LS.set('mgopt',S);
  const res=empty?{g:Array(W*H).fill('')}:gen(S.type,W,H,seed,S);const rr=R(seed);const nm=$('#nn',r).value||(empty?'Карта '+(maps.length+1):NAMES[S.type][Math.floor(rr()*4)]+' '+ADJ[Math.floor(rr()*ADJ.length)]);
  const fog=Array(W*H).fill($('#oF',r).checked?1:0);const mm={id:uid(),name:nm,W,H,g:res.g,fog,tok:[],style:S.style,theme:S.theme,light:S.light&&!empty,grid:true,seed,type:S.type};
  if(res.rooms&&res.rooms[0]&&fog[0]){const a=res.rooms[0];for(let y=a.y-1;y<=a.y+a.h;y++)for(let x=a.x-1;x<=a.x+a.w;x++)if(x>=0&&y>=0&&x<W&&y<H)fog[y*W+x]=0}
  maps.push(mm);mapCur=mm.id;saveMaps();closeSheet();rMap();toast(empty?'Пустая карта':'Карта сгенерирована · зерно '+seed)};
 $('#ngen',r).onclick=()=>make(0);$('#nok',r).onclick=()=>make(1)})};
/* ---- menu: style, grid, light, regenerate, import/export ---- */
const _menu=mapMenu;window.mapMenu=mapMenu=function(){_menu();const m=curMap();const L=$('.sheet .list')||$$('.list').pop();if(!L)return;
 L.insertAdjacentHTML('afterbegin',`<div class="row" style="flex-wrap:wrap;gap:6px"><button class="btn sm" id="mxg">▦ Сетка: ${m.grid===false?'выкл':['','тонкая','обычная','яркая'][m.gs||2]}</button><button class="btn sm" id="mxc">${m.coord?'A1 ✓ Координаты':'A1 Координаты'}</button><button class="btn sm" id="mxs">${m.style==='parch'?'☾ Тёмный стиль':'📜 Пергамент'}</button><button class="btn sm" id="mxl">${m.light?'☀ Без освещения':'🕯 Освещение'}</button><button class="btn sm${m.shared?' red':''}" id="mxp">${m.shared?'◎ Видна игрокам':'◌ Показать игрокам'}</button>${m.seed?`<button class="btn sm" id="mxr">⟳ Новое зерно</button>`:''}</div>`);
 L.insertAdjacentHTML('beforeend',`<button class="btn" id="mxe">⇩ Экспорт карты (файл)</button><button class="btn" id="mxi">⇧ Импорт карты</button>`);
 const T=(k,v)=>{histPush(m);m[k]=v;saveMaps();closeSheet();rMap()};
 $('#mxg').onclick=()=>{if(m.grid===false){m.grid=true;m.gs=1}else if((m.gs||2)>=3){m.grid=false}else m.gs=(m.gs||2)+1;T('gs',m.gs)};$('#mxc').onclick=()=>T('coord',!m.coord);$('#mxs').onclick=()=>T('style',m.style==='parch'?'dark':'parch');$('#mxl').onclick=()=>T('light',!m.light);$('#mxp').onclick=()=>{T('shared',!m.shared);toast(m.shared?'Карта (с туманом) у игроков':'Карта скрыта от игроков')};
 const rg=$('#mxr');if(rg)rg.onclick=()=>{histPush(m);m.seed=Math.floor(Math.random()*99999);const o=LS.get('mgopt',{traps:1,loot:1});m.g=gen(m.type||'dungeon',m.W,m.H,m.seed,o).g;m.tok=[];saveMaps();closeSheet();rMap();KM.undoToast('Новая карта · зерно '+m.seed,()=>{histMove(m,'hist','redo');rMap()})};
 $('#mxe').onclick=()=>{const o={...m};delete o.hist;delete o.redo;const b=new Blob([JSON.stringify({kniga:'map',v:1,map:o})],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(m.name||'карта')+'.json';document.body.append(a);a.click();a.remove();toast('Файл карты сохранён')};
 $('#mxi').onclick=()=>{const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=()=>{const f=i.files[0];if(!f)return;f.text().then(t=>{try{const d=JSON.parse(t),mm=d.map||d;if(!mm.W||!mm.g)throw 0;mm.id=uid();mm.fog=mm.fog||Array(mm.W*mm.H).fill(0);mm.tok=mm.tok||[];maps.push(mm);mapCur=mm.id;saveMaps();closeSheet();rMap();toast('Карта импортирована')}catch(e){toast('Это не файл карты')}})};i.click()}};
/* ---- textured renderer with cached base layer ---- */
const PAL={dark:{stone:['#3a3633','#2e2a27','#151211','#4a4440'],sand:['#4a3e2e','#3d3325','#1a140d','#5c4d38'],moss:['#2f3a2c','#263023','#111510','#3e4a39'],blood:['#3a2826','#2e1f1d','#160c0b','#4a3230']},
 parch:{stone:['#e6d6b0','#dccaa0','#3a2a1a','#c9b588'],sand:['#ead8ac','#e0cb98','#4a3216','#cdb37e'],moss:['#dcdcb0','#cfd0a0','#2e3a1e','#b8bd88'],blood:['#e8d2b0','#dfc29e','#5a1810','#c9a888']}};
const cache=new Map();
function base(m,CS){const key=m.id+'|'+CS+'|'+(m.style||'dark')+(m.theme||'stone')+(m.grid!==false)+(m.gs||2)+(m.coord?'c':'')+'|'+m.g.join(',').length+'|'+hashG(m.g);const c0=cache.get(m.id);if(c0&&c0.key===key)return c0.cv;
 const cv=document.createElement('canvas');cv.width=m.W*CS;cv.height=m.H*CS;const g=cv.getContext('2d');paint(g,m,CS);{const o=cache.get(m.id);if(o&&o.cv!==cv)o.cv.width=o.cv.height=0}cache.set(m.id,{key,cv});if(cache.size>6){const k0=cache.keys().next().value;const o=cache.get(k0);o.cv.width=o.cv.height=0;cache.delete(k0)}return cv}
function hashG(a){let h=0;for(let i=0;i<a.length;i++){const s=a[i];h=(h*31+(s?s.charCodeAt(0)*7+s.length:1)+i)|0}return h}
function paint(g,m,CS){const P=(PAL[m.style]||PAL.dark)[m.theme]||PAL.dark.stone,par=m.style==='parch',r=R(m.seed||7),W=m.W,H=m.H,get=(x,y)=>x>=0&&y>=0&&x<W&&y<H?m.g[y*W+x]:'';
 g.fillStyle=par?'#d9c49a':'#0b0807';g.fillRect(0,0,W*CS,H*CS);
 if(par){for(let k=0;k<W*H/3;k++){g.fillStyle=`rgba(120,80,30,${r()*.08})`;g.beginPath();g.arc(r()*W*CS,r()*H*CS,r()*CS*1.5,0,7);g.fill()}}
 const isWall=t=>t==='wall'||!t;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=m.g[y*W+x],X=x*CS,Y=y*CS;if(!t){if(!par){g.fillStyle=`rgba(255,255,255,${r()*.015})`;g.fillRect(X,Y,CS,CS)}else{g.strokeStyle='rgba(60,40,20,.18)';g.beginPath();for(let k=0;k<3;k++){const o=r()*CS;g.moveTo(X+o,Y);g.lineTo(X,Y+o)}g.stroke()}continue}
  const GG=window.KM_GROUND&&KM_GROUND[t];if(GG){g.fillStyle=par?GG[2]:GG[1];g.fillRect(X,Y,CS,CS);if(t==='wood'){g.strokeStyle='rgba(0,0,0,.35)';g.beginPath();for(let k=1;k<4;k++){g.moveTo(X,Y+k*CS/4);g.lineTo(X+CS,Y+k*CS/4)}g.stroke()}else for(let k=0;k<5;k++){g.fillStyle=`rgba(${r()<.5?'0,0,0':'255,255,255'},${.05+r()*.08})`;g.fillRect(X+r()*CS,Y+r()*CS,2,2)}continue}
  const fl=['floor','chest','trap','door','stairs','pillar','altar','table','torch','rubble','bones','crate','rug'].includes(t)||IN2.includes(t);
  if(fl){g.fillStyle=(x*7+y*13)%3?P[0]:P[1];g.fillRect(X,Y,CS,CS);// flagstones
   g.strokeStyle=par?'rgba(60,40,20,.25)':'rgba(0,0,0,.35)';g.lineWidth=1;const o=((y%2)*CS/2);g.beginPath();g.moveTo(X,Y+CS/2);g.lineTo(X+CS,Y+CS/2);g.moveTo(X+((o+CS/4)%CS),Y);g.lineTo(X+((o+CS/4)%CS),Y+CS/2);g.moveTo(X+((o+CS*3/4)%CS),Y+CS/2);g.lineTo(X+((o+CS*3/4)%CS),Y+CS);g.stroke();
   for(let k=0;k<3;k++){g.fillStyle=par?`rgba(90,60,30,${r()*.15})`:`rgba(255,240,220,${r()*.05})`;g.fillRect(X+r()*CS,Y+r()*CS,1.5,1.5)}}
  if(t==='grass'||t==='tree'||(OUT2.includes(t)&&t!=='bridge')){g.fillStyle=par?'#d2cc98':((x+y)%2?'#2c3d22':'#304425');g.fillRect(X,Y,CS,CS);g.strokeStyle=par?'rgba(70,90,30,.45)':'rgba(120,160,80,.3)';g.beginPath();for(let k=0;k<4;k++){const a=X+r()*CS,b=Y+r()*CS;g.moveTo(a,b);g.lineTo(a+(r()-.5)*3,b-3-r()*2)}g.stroke()}
  if(t==='road'){g.fillStyle=par?'#cdb07a':'#4f4232';g.fillRect(X,Y,CS,CS);for(let k=0;k<4;k++){g.fillStyle=par?'rgba(90,60,20,.3)':'rgba(0,0,0,.3)';g.beginPath();g.arc(X+r()*CS,Y+r()*CS,1+r()*2,0,7);g.fill()}}
  if(t==='water'||t==='lava'){const w=t==='water';g.fillStyle=w?(par?'#9fb4b0':'#163848'):'#7a1c08';g.fillRect(X,Y,CS,CS);g.strokeStyle=w?(par?'rgba(40,70,80,.5)':'rgba(140,200,230,.25)'):'rgba(255,170,60,.6)';g.lineWidth=1.2;for(let k=0;k<2;k++){const yy=Y+8+k*14+r()*3;g.beginPath();g.moveTo(X+2,yy);g.bezierCurveTo(X+10,yy-4,X+20,yy+4,X+CS-2,yy);g.stroke()}g.lineWidth=1;
   for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=get(x+dx,y+dy);if(n&&n!==t){g.fillStyle=w?'rgba(220,240,240,.18)':'rgba(255,200,80,.35)';g.fillRect(dx>0?X+CS-2:X,dy>0?Y+CS-2:Y,dx?2:CS,dy?2:CS)}}}
  if(t==='roof'){g.fillStyle=par?'#a8805a':'#4a2a20';g.fillRect(X,Y,CS,CS);g.strokeStyle=par?'rgba(70,40,20,.5)':'rgba(0,0,0,.45)';g.beginPath();for(let k=0;k<4;k++){g.moveTo(X,Y+k*8+4);g.lineTo(X+CS,Y+k*8+4)}g.stroke()}
  if(t==='wall'){g.fillStyle=P[2];g.fillRect(X,Y,CS,CS);// bricks with edge highlight on floor-facing sides
   g.fillStyle=P[3];for(let row=0;row<4;row++){const off=row%2?CS/4:0;for(let c=-1;c<2;c++){const bx=X+off+c*CS/2+1,bw=CS/2-2;const x0=Math.max(X+1,bx),x1=Math.min(X+CS-1,bx+bw);if(x1>x0){g.globalAlpha=.25+r()*.25;g.fillRect(x0,Y+row*CS/4+1,x1-x0,CS/4-2)}}}g.globalAlpha=1;
   g.strokeStyle=par?'#2a1a0c':'#000';g.lineWidth=par?2.4:2;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=get(x+dx,y+dy);if(n&&n!=='wall'){g.beginPath();const ex=dx>0?X+CS:X,ey=dy>0?Y+CS:Y;if(dx){g.moveTo(ex,Y);g.lineTo(ex+(r()-.5),Y+CS)}else{g.moveTo(X,ey);g.lineTo(X+CS,ey+(r()-.5))}g.stroke();g.fillStyle='rgba(0,0,0,.28)';if(dx)g.fillRect(dx>0?X+CS:X-6,Y,6,CS);else g.fillRect(X,dy>0?Y+CS:Y-6,CS,6)}}g.lineWidth=1}
  // props
  const ink=par?'#2a1a0c':'#0a0605';
  if(t==='door'){const hz=isWall(get(x-1,y))&&isWall(get(x+1,y));g.fillStyle=par?'#8a5a2a':'#6b3e18';if(hz)g.fillRect(X,Y+CS*.36,CS,CS*.28);else g.fillRect(X+CS*.36,Y,CS*.28,CS);g.strokeStyle=ink;g.lineWidth=1.5;if(hz)g.strokeRect(X+.5,Y+CS*.36,CS-1,CS*.28);else g.strokeRect(X+CS*.36,Y+.5,CS*.28,CS-1);g.lineWidth=1}
  if(t==='stairs'){for(let k=0;k<6;k++){g.fillStyle=`rgba(0,0,0,${.08+k*.08})`;g.fillRect(X+2,Y+2+k*CS/6.5,CS-4,CS/6.5-1)}g.strokeStyle=ink;g.strokeRect(X+2,Y+2,CS-4,CS-4)}
  if(t==='pillar'){g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(X+CS/2+3,Y+CS/2+3,CS*.36,0,7);g.fill();g.fillStyle=par?'#bfae88':'#5f5852';g.beginPath();g.arc(X+CS/2,Y+CS/2,CS*.36,0,7);g.fill();g.strokeStyle=ink;g.lineWidth=1.5;g.stroke();g.beginPath();g.arc(X+CS/2,Y+CS/2,CS*.22,0,7);g.stroke();g.lineWidth=1}
  if(t==='altar'){g.fillStyle=par?'#8c7a5a':'#4d4038';g.fillRect(X+3,Y+8,CS-6,CS-16);g.strokeStyle=ink;g.strokeRect(X+3,Y+8,CS-6,CS-16);g.fillStyle='#7a1a12';g.beginPath();g.arc(X+CS/2,Y+CS/2,3,0,7);g.fill()}
  if(t==='rug'){g.fillStyle=par?'rgba(120,30,20,.55)':'#4a1612';g.fillRect(X+2,Y,CS-4,CS);g.strokeStyle=par?'rgba(200,160,80,.6)':'rgba(190,150,70,.45)';g.strokeRect(X+5,Y,CS-10,CS)}
  if(t==='table'){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X+5,Y+9,CS-6,CS-14);g.fillStyle=par?'#9a6a3a':'#5a3a1e';g.fillRect(X+3,Y+7,CS-6,CS-14);g.strokeStyle=ink;g.strokeRect(X+3,Y+7,CS-6,CS-14);g.fillStyle=par?'#6a4020':'#3a2410';g.beginPath();g.arc(X+CS/2,Y+3,3,0,7);g.arc(X+CS/2,Y+CS-3,3,0,7);g.fill()}
  if(t==='crate'){g.fillStyle=par?'#a07a48':'#5e4022';g.fillRect(X+5,Y+5,CS-10,CS-10);g.strokeStyle=ink;g.strokeRect(X+5,Y+5,CS-10,CS-10);g.beginPath();g.moveTo(X+5,Y+5);g.lineTo(X+CS-5,Y+CS-5);g.moveTo(X+CS-5,Y+5);g.lineTo(X+5,Y+CS-5);g.stroke()}
  if(t==='rubble'||t==='bones'){for(let k=0;k<6;k++){g.fillStyle=t==='bones'?(par?'#f2e8d0':'#cfc6b0'):(par?'#8a7a60':'#5a524a');g.beginPath();if(t==='bones'){const a=X+4+r()*(CS-8),b=Y+4+r()*(CS-8),an=r()*3;g.save();g.translate(a,b);g.rotate(an);g.fillRect(-5,-1,10,2);g.arc(-5,0,2,0,7);g.arc(5,0,2,0,7);g.fill();g.restore()}else{g.arc(X+r()*CS,Y+r()*CS,1.5+r()*3,0,7);g.fill()}}}
  if(t==='tree'){g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(X+CS/2+4,Y+CS/2+4,CS*.55,0,7);g.fill();const c=par?['#6a7a3a','#8a9a4a']:['#1a3018','#2c4a26'];g.fillStyle=c[0];g.beginPath();for(let k=0;k<7;k++){const a=k/7*6.28,rr=CS*(.42+r()*.14);g.arc(X+CS/2+Math.cos(a)*CS*.18,Y+CS/2+Math.sin(a)*CS*.18,rr*.55,0,7)}g.fill();g.fillStyle=c[1];g.beginPath();g.arc(X+CS/2-3,Y+CS/2-3,CS*.24,0,7);g.fill();g.strokeStyle=ink;g.globalAlpha=.4;g.beginPath();g.arc(X+CS/2,Y+CS/2,CS*.5,0,7);g.stroke();g.globalAlpha=1}
  if(t==='chest'){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(X+8,Y+11,CS-12,CS-17);g.fillStyle=par?'#8a5a24':'#6b3e18';g.fillRect(X+6,Y+9,CS-12,CS-17);g.strokeStyle=ink;g.strokeRect(X+6,Y+9,CS-12,CS-17);g.fillStyle='#b8902a';g.fillRect(X+6,Y+13,CS-12,2);g.fillRect(X+CS/2-2,Y+14,4,5)}
  if(t==='trap'){g.strokeStyle=par?'rgba(120,20,10,.75)':'rgba(170,40,30,.7)';g.setLineDash([3,2]);g.strokeRect(X+4,Y+4,CS-8,CS-8);g.setLineDash([]);g.beginPath();for(let k=0;k<3;k++)for(let j=0;j<3;j++){g.moveTo(X+9+k*7,Y+9+j*7);g.arc(X+9+k*7,Y+9+j*7,1.3,0,7)}g.fillStyle=g.strokeStyle;g.fill()}
  sprite(g,t,X,Y,CS,r,par);
  if(t==='torch'){g.fillStyle='#3a2410';g.fillRect(X+CS/2-2,Y+CS/2-2,4,10);g.fillStyle='#e8a040';g.beginPath();g.arc(X+CS/2,Y+CS/2-4,4,0,7);g.fill()}}
 if(m.grid!==false){const gs=m.gs||2,lw=[0,1,1.5,2.5][gs],al=[0,.12,.26,.45][gs];const line=()=>{g.beginPath();for(let x=0;x<=W;x++){g.moveTo(x*CS+.5,0);g.lineTo(x*CS+.5,H*CS)}for(let y=0;y<=H;y++){g.moveTo(0,y*CS+.5);g.lineTo(W*CS,y*CS+.5)}g.stroke()};
  g.lineWidth=lw+1;g.strokeStyle=par?`rgba(40,25,10,${al*.6})`:`rgba(0,0,0,${al+.15})`;line();g.lineWidth=lw*.6;g.strokeStyle=par?`rgba(50,30,10,${al+.1})`:`rgba(255,240,215,${al})`;line();g.lineWidth=1;
  if(gs>=2){g.fillStyle=par?'rgba(50,30,10,.5)':'rgba(255,240,215,.35)';for(let y=0;y<=H;y+=5)for(let x=0;x<=W;x+=5){g.beginPath();g.arc(x*CS+.5,y*CS+.5,1.8,0,7);g.fill()}}}
 if(m.coord){g.font=`700 ${Math.max(8,CS*.28)}px Manrope,sans-serif`;g.textBaseline='top';g.textAlign='left';const L='ABCDEFGHIJKLMNOPQRSTUVWXYZ';const cl=x=>(x>=26?L[(x/26|0)-1]:'')+L[x%26];for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(x&&y&&!(x%5===0&&y%5===0))continue;const lab=!x&&!y?'A1':!y?cl(x):!x?String(y+1):cl(x)+(y+1);g.fillStyle=par?'rgba(40,25,10,.55)':'rgba(0,0,0,.6)';g.fillText(lab,x*CS+3,y*CS+3);g.fillStyle=par?'rgba(255,245,220,.0)':'rgba(255,240,215,.6)';g.fillText(lab,x*CS+2,y*CS+2)}}
 if(par){const gr=g.createRadialGradient(W*CS/2,H*CS/2,Math.min(W,H)*CS*.3,W*CS/2,H*CS/2,Math.max(W,H)*CS*.75);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(90,50,10,.35)');g.fillStyle=gr;g.fillRect(0,0,W*CS,H*CS)}}

function sprite(g,t,X,Y,CS,r,par){const c=CS/2,cx=X+c,cy=Y+c,ink=par?'#3a2410':'#0a0605';const sh=(w,h,dx=3,dy=3)=>{g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(cx+dx,cy+dy,w,h,0,0,7);g.fill()};const circ=(x,y,rr,f,st)=>{g.fillStyle=f;g.beginPath();g.arc(x,y,rr,0,7);g.fill();if(st){g.strokeStyle=st;g.lineWidth=1;g.stroke()}};const box=(x,y,w,h,f)=>{g.fillStyle=f;g.fillRect(x,y,w,h);g.strokeStyle=ink;g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1)};
 switch(t){
 case 'barrel':sh(CS*.32,CS*.32);circ(cx,cy,CS*.32,'#6b4220',ink);g.strokeStyle='#2a1a0c';g.beginPath();g.arc(cx,cy,CS*.22,0,7);g.stroke();circ(cx,cy,CS*.08,'#8a5a2a');break;
 case 'bed':box(X+CS*.18,Y+CS*.06,CS*.64,CS*.88,'#5a3a20');box(X+CS*.22,Y+CS*.1,CS*.56,CS*.22,'#d8cfc0');box(X+CS*.22,Y+CS*.36,CS*.56,CS*.54,'#7a2a24');break;
 case 'shelf':box(X+2,Y+CS*.2,CS-4,CS*.6,'#4a2e18');for(let k=0;k<6;k++){g.fillStyle=['#8a2a20','#2a4a6a','#6a5a2a','#3a6a3a'][k%4];g.fillRect(X+4+k*(CS-8)/6,Y+CS*.26,(CS-8)/6-1,CS*.48)}break;
 case 'statue':sh(CS*.36,CS*.36);circ(cx,cy,CS*.38,'#6a6460',ink);circ(cx,cy-2,CS*.2,'#9a948e',ink);circ(cx,cy-CS*.22,CS*.1,'#aaa49e');break;
 case 'sarco':sh(CS*.3,CS*.44);g.fillStyle='#57524d';g.beginPath();g.moveTo(cx-CS*.22,Y+3);g.lineTo(cx+CS*.22,Y+3);g.lineTo(cx+CS*.3,Y+CS*.3);g.lineTo(cx+CS*.2,Y+CS-3);g.lineTo(cx-CS*.2,Y+CS-3);g.lineTo(cx-CS*.3,Y+CS*.3);g.closePath();g.fill();g.strokeStyle=ink;g.stroke();g.strokeStyle='#b8a878';g.beginPath();g.moveTo(cx,Y+6);g.lineTo(cx,Y+CS-6);g.moveTo(cx-5,Y+CS*.3);g.lineTo(cx+5,Y+CS*.3);g.stroke();break;
 case 'cauldron':sh(CS*.34,CS*.3);circ(cx,cy,CS*.34,'#1e1c1a',ink);circ(cx,cy,CS*.25,'#3f9a3a');circ(cx-3,cy-2,2,'#9aea8a');circ(cx+4,cy+3,1.5,'#9aea8a');break;
 case 'candles':for(let k=0;k<3;k++){const a=cx-6+k*6,b=cy-2+(k%2)*5;g.fillStyle='#e8e0c8';g.fillRect(a-1.5,b,3,7);circ(a,b-2,2.2,'#ffcc55');circ(a,b-2,5,'rgba(255,200,80,.18)')}break;
 case 'web':g.strokeStyle='rgba(230,230,230,.55)';g.lineWidth=.8;g.beginPath();for(let k=0;k<8;k++){const a=k/8*6.28;g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*c,cy+Math.sin(a)*c)}for(let q=1;q<4;q++){for(let k=0;k<=8;k++){const a=k/8*6.28,rr=q*c/3.4;k?g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr):g.moveTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}}g.stroke();g.lineWidth=1;break;
 case 'puddle':g.fillStyle=par?'rgba(70,110,140,.45)':'rgba(60,110,150,.5)';g.beginPath();g.ellipse(cx,cy,CS*.38,CS*.24,r()*3,0,7);g.fill();g.strokeStyle='rgba(180,220,255,.4)';g.beginPath();g.ellipse(cx-3,cy-2,CS*.12,CS*.05,0,0,7);g.stroke();break;
 case 'crystal':sh(CS*.3,CS*.2);g.fillStyle='#7a4ad8';g.beginPath();g.moveTo(cx,Y+3);g.lineTo(cx+CS*.22,cy);g.lineTo(cx,Y+CS-4);g.lineTo(cx-CS*.22,cy);g.closePath();g.fill();g.fillStyle='#c8a8ff';g.beginPath();g.moveTo(cx,Y+3);g.lineTo(cx+CS*.22,cy);g.lineTo(cx,cy);g.closePath();g.fill();circ(cx,cy,CS*.5,'rgba(160,110,255,.15)');break;
 case 'brazier':sh(CS*.3,CS*.3);circ(cx,cy,CS*.3,'#3a2a1a',ink);circ(cx,cy,CS*.2,'#e85a20');circ(cx,cy,CS*.11,'#ffd060');circ(cx,cy,CS*.55,'rgba(255,140,40,.14)');break;
 case 'throne':box(X+CS*.2,Y+CS*.1,CS*.6,CS*.8,'#6a1a1a');box(X+CS*.2,Y+CS*.1,CS*.6,CS*.2,'#c8a040');break;
 case 'chair':box(X+CS*.3,Y+CS*.3,CS*.4,CS*.4,'#6b4422');box(X+CS*.3,Y+CS*.24,CS*.4,CS*.08,'#4a2e18');break;
 case 'bush':sh(CS*.36,CS*.3);circ(cx-4,cy+1,CS*.24,'#2a5226');circ(cx+4,cy-2,CS*.24,'#346a2e');circ(cx,cy+3,CS*.18,'#3e7a34');if(r()<.5){circ(cx+3,cy+2,1.6,'#c83a3a');circ(cx-4,cy-3,1.6,'#c83a3a')}break;
 case 'rock':sh(CS*.36,CS*.28);g.fillStyle='#6f6a62';g.beginPath();g.moveTo(X+5,cy+4);g.lineTo(X+9,Y+7);g.lineTo(cx+5,Y+5);g.lineTo(X+CS-5,cy);g.lineTo(cx+6,Y+CS-5);g.lineTo(X+9,Y+CS-6);g.closePath();g.fill();g.strokeStyle=ink;g.stroke();g.fillStyle='#8f8a80';g.beginPath();g.moveTo(X+9,Y+7);g.lineTo(cx+5,Y+5);g.lineTo(cx,cy);g.closePath();g.fill();break;
 case 'stump':sh(CS*.26,CS*.26);circ(cx,cy,CS*.26,'#6b4a2a',ink);g.strokeStyle='#4a301a';for(let q=1;q<3;q++){g.beginPath();g.arc(cx,cy,q*CS*.08,0,7);g.stroke()}break;
 case 'flowers':for(let k=0;k<6;k++){circ(X+4+r()*(CS-8),Y+4+r()*(CS-8),2,['#e8d040','#e86aa0','#f0f0f0','#a06ae8'][k%4])}break;
 case 'tent':sh(CS*.4,CS*.4);g.fillStyle='#8a6a3a';g.beginPath();g.moveTo(cx,Y+2);g.lineTo(X+CS-2,Y+CS-3);g.lineTo(X+2,Y+CS-3);g.closePath();g.fill();g.strokeStyle=ink;g.stroke();g.fillStyle='#3a2a14';g.beginPath();g.moveTo(cx,Y+CS*.45);g.lineTo(cx+4,Y+CS-3);g.lineTo(cx-4,Y+CS-3);g.closePath();g.fill();break;
 case 'fence':g.fillStyle='#7a5a32';g.fillRect(X,cy-3,CS,2);g.fillRect(X,cy+3,CS,2);for(let k=0;k<3;k++)g.fillRect(X+3+k*CS/3,cy-6,3,13);break;
 case 'well':sh(CS*.38,CS*.38);circ(cx,cy,CS*.38,'#7a746c',ink);circ(cx,cy,CS*.24,'#1a2a3a');circ(cx-2,cy-2,CS*.08,'rgba(140,190,240,.4)');break;
 case 'cart':box(X+4,Y+CS*.25,CS-8,CS*.45,'#7a5228');circ(X+6,Y+CS*.75,3.5,'#3a2a1a');circ(X+CS-6,Y+CS*.75,3.5,'#3a2a1a');break;
 case 'campfire':for(let k=0;k<6;k++){const a=k/6*6.28;circ(cx+Math.cos(a)*CS*.3,cy+Math.sin(a)*CS*.3,2.6,'#6a645c')}circ(cx,cy,CS*.18,'#e85a20');circ(cx,cy,CS*.09,'#ffe070');circ(cx,cy,CS*.6,'rgba(255,140,40,.15)');break;
 case 'log':sh(CS*.42,CS*.14);g.fillStyle='#6a4626';g.fillRect(X+3,cy-4,CS-6,8);circ(X+CS-4,cy,4,'#9a7044',ink);break;
 case 'mushroom':for(let k=0;k<4;k++){const a=X+5+r()*(CS-10),b=Y+6+r()*(CS-12);g.fillStyle='#e8dcc0';g.fillRect(a-1,b,2,4);circ(a,b,3,k%2?'#c83a2a':'#d8a040')}break;
 case 'bridge':g.fillStyle=par?'#9ab4c4':'#1e3a52';g.fillRect(X,Y,CS,CS);for(let k=0;k<5;k++){g.fillStyle=k%2?'#7a5530':'#8a6338';g.fillRect(X+k*CS/5,Y+2,CS/5-1,CS-4)}g.fillStyle='#4a301a';g.fillRect(X,Y+1,CS,2);g.fillRect(X,Y+CS-3,CS,2);break;
 }}
function lightLayer(m,CS){const key=m.id+'L'+hashG(m.g)+m.tok.map(t=>t.k==='pc'?t.x+','+t.y:'').join('');const c0=cache.get(m.id+'L');if(c0&&c0.key===key)return c0.cv;
 const cv=document.createElement('canvas');cv.width=m.W*CS;cv.height=m.H*CS;const g=cv.getContext('2d');g.fillStyle='rgba(4,2,8,.42)';g.fillRect(0,0,cv.width,cv.height);g.globalCompositeOperation='destination-out';
 const L=[];m.g.forEach((t,i)=>{if(t==='torch'||t==='lava'||t==='altar'||t==='brazier'||t==='candles'||t==='crystal'||t==='campfire')L.push([i%m.W,(i/m.W)|0,t==='torch'||t==='brazier'||t==='campfire'?5:t==='crystal'?2.5:3])});m.tok.forEach(t=>{if(t.k==='pc')L.push([t.x,t.y,4])});
 if(m.type==='forest'||m.type==='village')L.length=0;
 L.forEach(([x,y,r])=>{const X=x*CS+CS/2,Y=y*CS+CS/2,gr=g.createRadialGradient(X,Y,0,X,Y,r*CS);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.6,'rgba(0,0,0,.7)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(X-r*CS,Y-r*CS,r*CS*2,r*CS*2)});
 g.globalCompositeOperation='source-over';L.forEach(([x,y,r],i)=>{const X=x*CS+CS/2,Y=y*CS+CS/2,gr=g.createRadialGradient(X,Y,0,X,Y,r*CS*.8);gr.addColorStop(0,'rgba(255,160,60,.16)');gr.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=gr;g.fillRect(X-r*CS,Y-r*CS,r*CS*2,r*CS*2)});
 if(c0&&c0.cv!==cv)c0.cv.width=c0.cv.height=0;cache.set(m.id+'L',{key,cv});return cv}
window.drawMap=drawMap=function(g,m,CS,fogA){g.drawImage(base(m,CS),0,0);
 if(m.light&&m.type!=='forest'&&m.type!=='village')g.drawImage(lightLayer(m,CS),0,0);
 window.KM_DEC&&KM_DEC(g,m,CS);
 const par=m.style==='parch';
 m.tok.forEach(t=>{const X=t.x*CS+CS/2,Y=t.y*CS+CS/2;if(fogA>=1&&m.fog[t.y*m.W+t.x])return;g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.arc(X+1,Y+2,CS*.4,0,7);g.fill();
  const col=t.k==='pc'?'#c9a45a':t.k==='mon'?'#8a1c14':'#3c5a7a';g.fillStyle=col;g.beginPath();g.arc(X,Y,CS*.4,0,7);g.fill();g.strokeStyle=par?'#2a1a0c':'#e8dcc0';g.lineWidth=2;g.stroke();g.lineWidth=1;
  g.fillStyle=t.k==='pc'?'#1a1208':'#f0e6d0';g.font=`700 ${t.n.length>1?11:15}px Georgia,serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(t.n,X,Y+1)});
 for(let i=0;i<m.fog.length;i++)if(m.fog[i]){const x=i%m.W,y=(i/m.W)|0;g.fillStyle=par?`rgba(60,40,22,${fogA})`:`rgba(5,3,3,${fogA})`;g.fillRect(x*CS,y*CS,CS,CS);if(fogA<1){g.fillStyle='rgba(120,120,140,.12)';g.fillRect(x*CS,y*CS,CS,CS)}}};
}

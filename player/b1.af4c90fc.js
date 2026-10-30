'use strict';/*bundle*/
/* ../app.js */
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
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),1800)}

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
const SECTIONS=window.KM_PLAYER?[['hero','Герой','Герой'],['bag','Сумка','Сумка'],['spells','Чары','Чары'],['notes','Записи','Записи'],['table','Мастер','Мастер']]:[['sess','Сессия','Сессия'],['npc','НИП и монстры','Бестиарий'],['spells','Заклинания','Чары'],['items','Лут и предметы','Лут'],['combat','Бой','Бой'],['dice','Кубики','Кубики'],['pcs','Герои','Герои'],['map','Карта','Карта'],['notes','Заметки и сюжет','Заметки'],['rules','Правила','Правила']];
const ICK=window.KM_PLAYER?['pcs','item','spell','notes','map']:['sess','npc','spell','item','combat','dice','pcs','map','notes','rules'];

/* ---------- state ---------- */
const S={sec:0,npcQ:'',npcType:'',npcCR:'',npcOnlyTop:true,spQ:'',spCls:'',spLvl:'',itQ:'',itCat:'',itRar:'',noteTag:'',lim:60};
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
rib.innerHTML=SECTIONS.map((s,i)=>`<button class="rib" data-i="${i}" aria-label="${s[1]}">${IC[ICK[i]]}<span>${s[2]}</span></button>`).join('');
rib.addEventListener('click',e=>{const b=e.target.closest('.rib');if(b)go(+b.dataset.i)});
function markRib(){$$('.rib').forEach((b,i)=>b.classList.toggle('on',i===S.sec))}

/* ---------- page flip ---------- */
const page=$('#page'),book=$('#book');let flipping=false;if(go.q){const q=go.q;go.q=null;setTimeout(()=>go(q[0],q[1]),0)}
function go(i,dirHint){
  if(flipping&&i!==S.sec&&i>=0&&i<SECTIONS.length){go.q=[i,dirHint];return}
  if(i<0||i>=SECTIONS.length||i===S.sec||flipping){if(i===S.sec)page.scrollTo({top:0,behavior:'smooth'});return}
  const fwd=dirHint!=null?dirHint>0:i>S.sec;flipping=true;
  const snap=page.cloneNode(true);snap.removeAttribute('id');snap.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));snap.style.pointerEvents='none';
  const st=page.scrollTop;book.append(snap);snap.scrollTop=st;
  const prevSec=S.sec;S.sec=i;render();page.scrollTop=0;markRib();save();if(window.KMTab&&!window.__kmFromBack)KMTab(prevSec);window.__kmFromBack=0;
  const dur=380,ease='cubic-bezier(.3,.7,.2,1)',dx=fwd?1:-1;
  snap.animate([{transform:'translateX(0)',opacity:1},{transform:`translateX(${-dx*28}%) scale(.96)`,opacity:0}],{duration:dur,easing:ease,fill:'forwards'});
  const a=page.animate([{transform:`translateX(${dx*40}%)`,opacity:0},{transform:'none',opacity:1}],{duration:dur,easing:ease});
  a.onfinish=()=>{snap.remove();flipping=false;if(go.q){const q=go.q;go.q=null;setTimeout(()=>go(q[0],q[1]),0)}};
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
  if(Math.abs(dx)>80&&Math.abs(dx)>Math.abs(dy)*2.2&&Date.now()-t0<700&&((fromLeft&&dx>0)||(fromRight&&dx<0))){go(S.sec+(dx<0?1:-1),dx<0?1:-1)}},{passive:true});
 window.KM_SWIPE={BLOCK,EDGE};})();

/* ---------- sheet ---------- */
const sheet=$('#sheet'),sp=$('#sheetPage');
function openSheet(html,after){clearTimeout(closeSheet.t);const ot=(sp.querySelector('.sb-title,h3')||{}).textContent,oy=sp.scrollTop,was=sheet.classList.contains('show');sp.innerHTML=html;const nt=(sp.querySelector('.sb-title,h3')||{}).textContent;sp.scrollTop=was&&ot&&ot===nt?oy:0;sheet.classList.add('open');requestAnimationFrame(()=>requestAnimationFrame(()=>sheet.classList.add('show')));after&&after(sp)}
function closeSheet(){sheet.classList.remove('show');clearTimeout(closeSheet.t);closeSheet.t=setTimeout(()=>sheet.classList.remove('open'),420)}
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
   chips('type',[['','Все типы'],...TYPES.map(t=>[t,t])],S.npcType)+chips('cr',CRS.map(c=>[c[0],'Опасность '+c[1]]).map((c,i)=>i?c:['','Любая опасность']),S.npcCR)+
   `<div class="list" id="npcList"></div>`;
  bindChips(page,(n,v)=>{if(n==='scope')S.npcOnlyTop=v==='top'?true:v==='own'?'own':false;if(n==='type')S.npcType=v;if(n==='cr')S.npcCR=v;rNpc()});
  bindSearch('npcQ',q=>{S.npcQ=q;fillNpc()});$('#newNpc').onclick=()=>editNpc();fillNpc();
}
function fillNpc(){let L=allMonsters();const q=S.npcQ;
  if(S.npcOnlyTop===true&&!q)L=L.filter(m=>m.top||m.own);if(S.npcOnlyTop==='own')L=L.filter(m=>m.own);
  if(q)L=L.filter(m=>(m.n).toLowerCase().includes(q));
  if(S.npcType)L=L.filter(m=>(m.ty||'').startsWith(S.npcType)||(S.npcType==='зверь'&&m.ty&&m.ty.includes('зверей')));
  if(S.npcCR){const[a,b]=S.npcCR.split('-').map(Number);L=L.filter(m=>m.cr>=a&&m.cr<=b)}
  L.sort((a,b)=>(b.own?1:0)-(a.own?1:0)||a.cr-b.cr||a.n.localeCompare(b.n,'ru'));
  lazyList($('#npcList'),L,m=>`<div class="card${m.own?' own':''}" data-id="${esc(m.id)}"><div class="t">${esc(m.n)}</div><span class="badge">ПО ${crTxt(m.cr)}</span><div class="m">${esc(m.sz||'')} ${esc(m.ty||'')}</div><div class="stats"><span>КД <b>${m.ac}</b></span><span>Хиты <b>${m.hp}</b></span><span>Скор. <b>${esc((m.sp||'').split(',')[0])}</b></span></div></div>`);
  $('#npcList').onclick=e=>{const c=e.target.closest('.card');if(c)showMon(c.dataset.id)}}
function featHtml(L){return (L||[]).map(f=>`<div class="feat${f.ru===false?' en':''}"><span class="fn">${esc(f.n)}.</span> ${esc(f.d).replace(/\n/g,'<br>')}</div>`).join('')}
function showMon(id){const m=findMon(id);if(!m)return;const ab=['Сил','Лов','Тел','Инт','Мдр','Хар'];
  openSheet(`<div class="sb-title">${esc(m.n)}</div><div class="sb-sub">${esc(m.sz||'')} ${esc(m.ty||'')}${m.al?', '+esc(m.al):''}</div>
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
function showSpell(id){const s=D.spells.find(x=>x.id===id);
  openSheet(`<div class="sp-head"><div><div class="sb-title" style="margin-right:0">${esc(s.n)}</div><div class="sb-sub">${lvlName(s.l)}, ${esc(s.sc.toLowerCase())}${s.rit?' (ритуал)':''}</div></div></div>
  <div class="sp-circle"><img class="r1" src="${window.KM_PLAYER?'../':''}img/runecircle.webp" alt=""><div class="lvl">${s.l===0?'✶':s.l}</div></div>
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
function addCombatant(m,isPC){const dex=m.st?mod(m.st[1]):(m.init||0);const n=combat.list.filter(c=>c.base===m.n).length;
  combat.list.push({id:uid(),base:m.n,name:n?`${m.n} ${n+1}`:m.n,init:rnd(20)+dex,dex,hp:m.hp,max:m.maxhp||m.hp,ac:m.ac,pc:!!isPC,mon:isPC?null:m.id,conds:[]});sortC();save();if(SECTIONS[S.sec][0]==='combat')rCombat()}
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
const RULES=[
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
['Укрытие',`<table class="dc"><tr><td>½</td><td><b>Половинное укрытие:</b> +2 к КД и спасброскам Ловкости (низкая стена, мебель, другое существо)</td></tr><tr><td>¾</td><td><b>Укрытие на три четверти:</b> +5 к КД и спасброскам Ловкости (бойница, толстый ствол)</td></tr><tr><td>✕</td><td><b>Полное укрытие:</b> нельзя стать прямой целью атаки или заклинания</td></tr></table>`],
['Спасброски от смерти',`<p>Когда хиты персонажа падают до <b>0</b>, он без сознания. В начале каждого своего хода он бросает к20 (без модификаторов):</p>
<p><span class="tri"></span><b>10+</b> — успех, <b>9 и ниже</b> — провал. <b>3 успеха</b> — стабилизирован; <b>3 провала</b> — смерть.</p>
<p><span class="tri"></span><b>Натуральная 20</b> — встаёт с 1 хитом. <b>Натуральная 1</b> — два провала.</p>
<p><span class="tri"></span>Урон по существу с 0 хитов — один провал (крит — два). Если урон ≥ максимума хитов — мгновенная смерть.</p>
<p><span class="tri"></span>Любое лечение возвращает в сознание. Проверка Мудрости (Медицина) Сл 10 или «Уход за умирающим» стабилизирует.</p>`],
['Советы новому Мастеру',`<p><span class="tri"></span>Описывай сцену тремя чувствами и спрашивай: «Что вы делаете?»</p><p><span class="tri"></span>Говори «Да, и…» или «Да, но…» вместо «Нет».</p><p><span class="tri"></span>Дай каждому игроку момент славы за сессию.</p><p><span class="tri"></span>Для 3 героев 1-го уровня хороший бой — 3–4 гоблина, 2 волка или 4–5 скелетов/зомби. Сильный бой — багбир + 2 гоблина.</p><p><span class="tri"></span>Не знаешь правило — прими решение сейчас, проверь после игры.</p>`]];
const CONDR=[['Ослеплённый','Ничего не видит, проваливает проверки, требующие зрения. Атаки по нему — с преимуществом, его атаки — с помехой.'],['Очарованный','Не может атаковать очаровавшего или делать его целью вредящих эффектов. Очаровавший совершает с преимуществом проверки взаимодействия с ним.'],['Оглохший','Ничего не слышит, проваливает проверки, требующие слуха.'],['Испуганный','Помеха на проверки и атаки, пока видит источник страха. Не может добровольно приблизиться к нему.'],['Схваченный','Скорость 0. Оканчивается, если схвативший недееспособен или цель вытолкнута из досягаемости.'],['Недееспособный','Не может совершать действия и реакции.'],['Невидимый','Его нельзя увидеть без магии. Атаки по нему — с помехой, его атаки — с преимуществом.'],['Парализованный','Недееспособен, не двигается и не говорит. Проваливает спасброски Силы и Ловкости. Атаки по нему с преимуществом; попадание в пределах 1,5 м — критическое.'],['Окаменел','Превращён в камень: недееспособен, сопротивление всему урону, иммунитет к яду и болезням.'],['Отравленный','Помеха на броски атаки и проверки характеристик.'],['Лежащий ничком','Может только ползти или встать (половина скорости). Его атаки с помехой. Атаки по нему в пределах 1,5 м — с преимуществом, издалека — с помехой.'],['Опутанный','Скорость 0. Атаки по нему с преимуществом, его атаки с помехой. Помеха на спасброски Ловкости.'],['Ошеломлённый','Недееспособен, не двигается, говорит запинаясь. Проваливает спасброски Силы и Ловкости. Атаки по нему с преимуществом.'],['Без сознания','Недееспособен, не двигается, роняет всё, падает ничком. Проваливает спасброски Силы и Ловкости. Атаки по нему с преимуществом; попадание в пределах 1,5 м — критическое.'],['Истощение','6 степеней: 1 — помеха на проверки; 2 — скорость вдвое; 3 — помеха на атаки и спасброски; 4 — максимум хитов вдвое; 5 — скорость 0; 6 — смерть. Продолжительный отдых снимает 1 степень.']];
RULES[3][1]=CONDR.map(c=>`<p><span class="tri"></span><b>${c[0]}.</b> ${c[1]}</p>`).join('');
function rRules(){page.oninput=null;page.innerHTML=header('Правила','шпаргалка мастера','tri',3)+`<p class="dropcap" style="font-size:16px;line-height:1.45">Здесь собраны правила, к которым ты будешь возвращаться чаще всего. Помни: Мастер — арбитр, а не противник игроков.</p>`+
  RULES.map((r,i)=>`<details class="rule"${i===0?' open':''}><summary>${r[0]}</summary><div class="body">${r[1]}</div></details>`).join('')+glyphs(2)+`<p class="muted" style="font-size:12px">Источник правил: Справочный документ системы 5.1 «Подземелий и драконов» © «Визардс оф зе Кост», лицензия «Криэйтив Коммонс — с указанием авторства 4.0». Перевод, сокращение и адаптация — «Книга Мастера».</p>`}

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
if(!window.KM_PLAYER&&'serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});{const had=!!navigator.serviceWorker.controller;let rl=0;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had&&!rl){rl=1;location.reload()}})}
window.KM={go,showMon,showSpell,showItem,closeSheet,addCombatant,S,get players(){return players}};
;addEventListener('kmpacks',()=>{const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)){try{a.dispatchEvent(new Event('input',{bubbles:true}))}catch(e){}return}if(['spells','items','npc','map'].includes((SECTIONS[S.sec]||[])[0])&&!document.querySelector('#sheet.show,.sheet.show'))try{render()}catch(e){}});

;
/* ../fx.js */
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
 openSheet(`<div class="sb-title" data-noshow>Настройки</div><div class="sb-sub">Анимации и эффекты</div>${T('calm','Меньше анимации','Отключает пульсации, частицы, переходы чернил и вспышки кубиков. Система «уменьшить движение» учитывается автоматически.')}${T('amb','Угли и пепел','Летящие искры и пыль на фоне страниц.')}
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
/* ../magic.js */
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
let MF=Object.assign({sc:'',tm:'',conc:'',rit:'',dt:'',cp:'',view:'all',hero:0},LS.get('mf',{}));
rSpells=function(){page.oninput=null;page.onclick=null;const seg=`<div class="seg" id="mseg"><button data-v="all" class="${MF.view==='all'?'on':''}">Свод заклинаний</button><button data-v="book" class="${MF.view==='book'?'on':''}">Гримуар героя</button></div>`;
 if(MF.view==='book')return rGrimoire(seg);
 page.innerHTML=header('Заклинания','свод чар и заговоров','star',1)+seg+searchBox('spQ','Найти, напр. огненный шар',S.spQ)+
 chips('cls',[['','Все классы'],...[...new Set(CLASSES.concat(D.spells.some(s=>s.cl.includes('Изобретатель'))?['Изобретатель']:[]))].map(c=>[c,c])],S.spCls)+chips('lvl',[['','Все круги'],['0','Заговоры'],...[1,2,3,4,5,6,7,8,9].map(l=>[l,l+'-й круг'])],S.spLvl)+
 `<details class="mfil"${MF.sc||MF.tm||MF.conc||MF.rit||MF.dt||MF.cp?' open':''}><summary>Фильтры: школа, время, концентрация…</summary>`+chips('sc',[['','Любая школа'],...SCHOOLS.map(s=>[s,s])],MF.sc)+chips('tm',[['','Любое время'],['1 действие','Действие'],['1 бонусное действие','Бонусное'],['1 реакция','Реакция'],['long','Минуты и часы']],MF.tm)+
 chips('conc',[['','Концентрация: любая'],['1','Только концентрация'],['0','Без концентрации']],MF.conc)+chips('rit',[['','Ритуал: любой'],['1','Только ритуалы']],MF.rit)+chips('dt',[['','Любой урон'],...Object.keys(DT_C).map(d=>[d,d])],MF.dt)+chips('cp',[['','Любые компоненты'],['noV','Без вербального'],['noS','Без соматического'],['noM','Без материального']],MF.cp)+`</details><div class="list" id="spList"></div>`;
 bindChips(page,(n,v)=>{if(n==='lvl')S.spLvl=v;else if(n==='cls')S.spCls=v;else MF[n]=v;LS.set('mf',MF);rSpells()});bindSearch('spQ',q=>{S.spQ=q;fillSp()});
 $('#mseg').onclick=e=>{const b=e.target.closest('[data-v]');if(b){MF.view=b.dataset.v;LS.set('mf',MF);rSpells()}};fillSp()};
fillSp=function(){let L=D.spells;let q=S.spQ;if(q){q=q.toLowerCase();const W=q.split(/\s+/).filter(Boolean);L=L.filter(s=>{const h=s._h||(s._h=[s.n,s.sc,s.dt,(s.cl||[]).join(' '),s.dmg,s.conc?'концентрация':'',s.rit?'ритуал':'','круг '+s.l,s.l?'':'заговор'].join(' ').toLowerCase());return W.every(w=>h.includes(w))});L.sort((a,b)=>(b.n.toLowerCase().includes(q)?1:0)-(a.n.toLowerCase().includes(q)?1:0))}if(!q&&S.spLvl!=='')L=L.filter(s=>s.l===+S.spLvl);if(!q&&S.spCls)L=L.filter(s=>s.cl.includes(S.spCls));
 if(MF.sc)L=L.filter(s=>s.sc===MF.sc);if(MF.tm)L=L.filter(s=>MF.tm==='long'?/мин|ч\./.test(s.t):s.t===MF.tm);if(MF.conc)L=L.filter(s=>s.conc===(MF.conc==='1'));if(MF.rit)L=L.filter(s=>s.rit);if(MF.dt)L=L.filter(s=>s.dt===MF.dt);if(MF.cp)L=L.filter(s=>!s.c.includes({noV:'В',noS:'С',noM:'М'}[MF.cp]));
 L=[...L].sort((a,b)=>a.l-b.l||a.n.localeCompare(b.n,'ru'));
 lazyList($('#spList'),L,s=>`<div class="card spc" data-id="${s.id}">${spellSigil(s,46,'ssig mini')}<div class="t">${esc(s.n)}</div><span class="badge">${s.l===0?'заговор':s.l+' круг'}</span><div class="m">${esc(s.sc)} · ${esc(s.t)}${s.conc?' · <span class="hand">концентрация</span>':''}${s.rit?' · ритуал':''}</div>${s.dmg?`<div class="m" style="color:${DT_C[s.dt]||'#ff7d74'}">${esc(s.dmg)}</div>`:''}</div>`);
 $('#spList').onclick=e=>{const c=e.target.closest('.card');if(c)showSpell(c.dataset.id)}};
const _showSpell=showSpell;
showSpell=function(id,slot){const s=D.spells.find(x=>x.id===id);_showSpell(id);const sp=$('#sheetPage');$('.sp-circle',sp)?.remove();
 sp.insertAdjacentHTML('afterbegin',spellArt(s));drawSigils(sp);$$('.ssig.big *',sp).forEach(p=>p.setAttribute('pathLength','1'));$('.ssig.big',sp).classList.add('draw');
 const lv=slot||Math.max(1,s.l);const base=(s.dmg.match(/(\d+)к(\d+)/)||[]);
 let up='';if(s.l>0){up=`<div class="sec-h">Ячейка и усиление</div><div class="chips" id="slv">${[1,2,3,4,5,6,7,8,9].filter(l=>l>=s.l).map(l=>`<button class="chip${l===lv?' on':''}" data-l="${l}">${l} круг</button>`).join('')}</div>`;
  if(s.up&&!base[1]){const ex=Math.floor(Math.max(0,lv-s.up.from)/s.up.step)*s.up.n;up+=`<div class="scal">${/лечен|восстанавл|хит/i.test(s.ds)&&!s.dt?"Лечение":"Доп. кубы"} на ${lv} круге: <b>+${ex}к${s.up.d}</b></div>`}else if(s.upTxt&&!s.up){const g=s.upTxt.match(/\+(\d+)\s+(.+?) за (?:каждый )?уровень ячейки выше (\d+)/);up+=`<div class="scal">${g?`На ${lv} круге: <b>+${Math.max(0,lv-g[3])*g[1]}</b> ${esc(g[2])}`:esc(s.upTxt)}</div>`}
  if(s.up&&base[1]){const extra=Math.floor(Math.max(0,lv-s.up.from)/s.up.step)*s.up.n;up+=`<div class="scal">Урон на ${lv} круге: <b>${esc(s.dmg.replace(/(\d+)к(\d+)/,(a,n,d)=>s.up.d==+d?(+n+extra)+'к'+d:a+(extra?` + ${extra}к${s.up.d}`:'')))}</b></div>`}}
 const casters=players.map((p,i)=>[p,i]).filter(([p])=>Object.keys(p.slots||{}).length||s.l===0);
 sp.insertAdjacentHTML('beforeend',up+`<div class="sec-h">Сотворить</div><div class="row">${casters.map(([p,i])=>`<button class="btn ${s.l?'red':''}" data-cast="${i}">✦ Каст: ${esc(p.name)}${s.l?` <small>(${(p.slots[lv]?p.slots[lv].max-p.slots[lv].used:0)} яч.)</small>`:''}</button>`).join('')||'<span class="muted">У героев нет ячеек — укажи класс (напр. «Волшебник») и уровень в «Героях».</span>'}</div>
  <div class="row" style="margin-top:8px">${players.map((p,i)=>`<button class="btn sm" data-learn="${i}">${p.spells?.includes(s.id)?'✓ ':'＋ '}${esc(p.name)}</button>`).join('')}</div><div class="muted" style="font-size:12px">«＋ Имя» — добавить в гримуар героя.</div>`);
 const sl=$('#slv',sp);if(sl)sl.onclick=e=>{const b=e.target.closest('[data-l]');if(b){const st=sp.scrollTop;showSpell(id,+b.dataset.l);$('#sheetPage').scrollTop=st}};
 $$('[data-cast]',sp).forEach(b=>b.onclick=()=>castSpell(players[+b.dataset.cast],s,lv));
 $$('[data-learn]',sp).forEach(b=>b.onclick=()=>{const p=players[+b.dataset.learn];p.spells=p.spells||[];if(p.spells.includes(s.id))p.spells=p.spells.filter(x=>x!==s.id);else p.spells.push(s.id);save();b.textContent=(p.spells.includes(s.id)?'✓ ':'＋ ')+p.name;toast(p.spells.includes(s.id)?`«${s.n}» в гримуаре ${p.name}`:'Убрано из гримуара')})};
function castSpell(p,s,lv){if(s.l===0){toast(`${p.name} творит «${s.n}»`);KM.logS&&KM.logS(`${p.name}: «${s.n}» (заговор)`);return}
 let L=lv;while(L<=9&&!(p.slots[L]&&p.slots[L].used<p.slots[L].max))L++;if(L>9)return toast(`У ${p.name} нет свободных ячеек ${lv}+ круга`);
 p.slots[L].used++;save();if(L!==lv)toast(`Ячеек ${lv} круга нет — потрачена ячейка ${L} круга`);else toast(`${p.name}: «${s.n}» — ячейка ${L} круга потрачена`);KM.logS&&KM.logS(`${p.name}: «${s.n}» ячейкой ${L} круга`);
 if(s.conc&&!p.conds.includes('Концентрация')){p.conds.push('Концентрация');save()}if(!calm()){const b=document.createElement('div');b.className='fx-burst';b.innerHTML=spellSigil(s,300,'ssig');document.body.append(b);setTimeout(()=>b.remove(),1600)}closeSheet()}
function rGrimoire(seg){const p=players[MF.hero]||players[0];if(!p){page.innerHTML=header('Гримуар','книга заклинаний героя','star',1)+seg+'<div class="empty">Нет героев</div>';return}ensureSlots(p);
 const L=(p.spells||[]).map(id=>D.spells.find(s=>s.id===id)).filter(Boolean).sort((a,b)=>a.l-b.l||a.n.localeCompare(b.n,'ru'));const by={};L.forEach(s=>(by[s.l]=by[s.l]||[]).push(s));
 page.innerHTML=header('Гримуар','книга заклинаний героя','star',1)+seg+chips('hero',players.map((h,i)=>[i,h.name]),MF.hero)+
 `<div class="gslots">${Object.entries(p.slots).map(([l,sl])=>`<div class="gsl"><small>${l} круг</small><div>${[...Array(sl.max)].map((_,k)=>`<button class="pip${k<sl.max-sl.used?' on':''}" data-sl="${l}" data-k="${k}" aria-label="Ячейка"></button>`).join('')}</div></div>`).join('')||`<div class="muted">Нет ячеек. Класс «${esc(p.cls)}» ${p.lvl} ур. — укажи заклинательный класс в «Героях».</div>`}</div>
 <div class="muted" style="font-size:12px;margin:-4px 0 10px">Тап по ячейке — потратить/вернуть. Продолжительный отдых в «Сессии» восстанавливает всё.</div>`+
 (L.length?Object.entries(by).map(([l,a])=>`<div class="sec-h">${l==0?'Заговоры':l+' круг'}</div><div class="list">${a.map(s=>`<div class="card spc gr${p.prep.includes(s.id)?' prep':''}" data-id="${s.id}">${spellSigil(s,46,'ssig mini')}<div class="t">${esc(s.n)}</div><button class="badge prepb" data-prep="${s.id}">${p.prep.includes(s.id)?'✦ подготовлено':'не подготовлено'}</button><div class="m">${esc(s.t)} · ${esc(s.r)}${s.conc?' · концентрация':''}</div></div>`).join('')}</div>`).join(''):`<div class="empty">Гримуар пуст. Открой заклинание в «Своде» и нажми «＋ ${esc(p.name)}».</div>`);
 bindChips(page,(n,v)=>{MF.hero=+v;LS.set('mf',MF);rSpells()});$('#mseg').onclick=e=>{const b=e.target.closest('[data-v]');if(b){MF.view=b.dataset.v;LS.set('mf',MF);rSpells()}};
 page.onclick=e=>{const pp=e.target.closest('[data-prep]');if(pp){e.stopPropagation();const id=pp.dataset.prep;p.prep=p.prep.includes(id)?p.prep.filter(x=>x!==id):[...p.prep,id];save();rSpells();return}
  const pi=e.target.closest('.pip');if(pi){const sl=p.slots[pi.dataset.sl];const on=pi.classList.contains('on');sl.used=Math.max(0,Math.min(sl.max,sl.used+(on?1:-1)));save();rSpells();return}
  const c=e.target.closest('.card');if(c)showSpell(c.dataset.id)}}
KM.spellSigil=spellSigil;KM.ensureSlots=ensureSlots;
KM.showSpell=(...a)=>showSpell(...a);KM.closeSheet=()=>closeSheet();KM.save=()=>save();if(!("players" in KM))KM.players=players;
KM.SECTIONS=SECTIONS;

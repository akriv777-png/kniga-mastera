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

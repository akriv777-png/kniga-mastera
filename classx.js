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
 if(s.abs||s.masterOnly)return{ok:false,msg:`«${s.n}» — абсолютная магия: её вручает только Мастер`};
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

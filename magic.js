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
 chips('cls',[['','Все классы'],...CLASSES.concat(D.spells.some(s=>s.cl.includes('Изобретатель'))?['Изобретатель']:[]).map(c=>[c,c])],S.spCls)+chips('lvl',[['','Все круги'],['0','Заговоры'],...[1,2,3,4,5,6,7,8,9].map(l=>[l,l+'-й круг'])],S.spLvl)+
 `<details class="mfil"${MF.sc||MF.tm||MF.conc||MF.rit||MF.dt||MF.cp?' open':''}><summary>Фильтры: школа, время, концентрация…</summary>`+chips('sc',[['','Любая школа'],...SCHOOLS.map(s=>[s,s])],MF.sc)+chips('tm',[['','Любое время'],['1 действие','Действие'],['1 бонусное действие','Бонусное'],['1 реакция','Реакция'],['long','Минуты и часы']],MF.tm)+
 chips('conc',[['','Концентрация: любая'],['1','Только концентрация'],['0','Без концентрации']],MF.conc)+chips('rit',[['','Ритуал: любой'],['1','Только ритуалы']],MF.rit)+chips('dt',[['','Любой урон'],...Object.keys(DT_C).map(d=>[d,d])],MF.dt)+chips('cp',[['','Любые компоненты'],['noV','Без вербального'],['noS','Без соматического'],['noM','Без материального']],MF.cp)+`</details><div class="list" id="spList"></div>`;
 bindChips(page,(n,v)=>{if(n==='lvl')S.spLvl=v;else if(n==='cls')S.spCls=v;else MF[n]=v;LS.set('mf',MF);rSpells()});bindSearch('spQ',q=>{S.spQ=q;fillSp()});
 $('#mseg').onclick=e=>{const b=e.target.closest('[data-v]');if(b){MF.view=b.dataset.v;LS.set('mf',MF);rSpells()}};fillSp()};
fillSp=function(){let L=D.spells;const q=S.spQ;if(q){q=q.toLowerCase();const W=q.split(/\s+/).filter(Boolean);L=L.filter(s=>{const h=[s.n,s.sc,s.dt,(s.cl||[]).join(' '),s.dmg,s.conc?'концентрация':'',s.rit?'ритуал':'','круг '+s.l,s.l?'':'заговор'].join(' ').toLowerCase();return W.every(w=>h.includes(w))});L.sort((a,b)=>(b.n.toLowerCase().includes(q)?1:0)-(a.n.toLowerCase().includes(q)?1:0))}if(!q&&S.spLvl!=='')L=L.filter(s=>s.l===+S.spLvl);if(!q&&S.spCls)L=L.filter(s=>s.cl.includes(S.spCls));
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
